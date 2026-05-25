#!/usr/bin/env node
// =============================================================================
// Garden Grove MMA Tank — Thermal-Runaway Monte Carlo (model v3)
// =============================================================================
//
// Major changes vs v2 (per three-agent audit, 2026-05-25):
//
//   1. PSV-vent rejection DROPPED. News record shows the valve mechanically
//      bulged Thursday and is now stuck/non-functional. Treating "no visible
//      vent since Thursday" as Bayesian evidence was mis-specified — the
//      device is broken, not silently holding.
//
//   2. Crack-vent cooling is now TIME-GATED ONLY (not T-gated). The crack
//      was discovered Sat night and is venting NOW at T ~100 °F per OCFA.
//      Previous T > BP−5K gate kept Q_crack at zero across the entire
//      near-term forecast window where it's actually doing work.
//
//   3. HOT-SPOT STRATIFICATION added. The interior gauge reads bulk T;
//      reaction happens in the (hotter) top liquid layer. Effective runaway
//      threshold AS SEEN BY THE GAUGE is the BLEVE threshold MINUS the
//      stratification offset. Sample ΔT_strat ~ N(20, 12) °F, [0, 50].
//
//   4. X_init = 0 (was 0.02 arbitrarily). Chemistry decides where it goes.
//
//   5. Trommsdorff form replaced with sigmoidal onset at X = 0.20 (lit value)
//      with vitrification cutoff near X = 0.85. Old `1 + 18·X^2.2` for X≥0.05
//      was wrong onset, wrong shape, no glass-state cutoff.
//
//   6. Solar magnitude ×40 — old `solarAmp ≤ 800 W` is total; peak for a
//      ~140 m² external shell at 800 W/m² × albedo × geometric factor is
//      ~10 kW. Now sampled around 8,000 W.
//
//   7. Fouling self-limiting at δ_max ≈ 3 mm via spalling. Old monotonic
//      formula gave 4 inches at X=0.5 — physically absurd.
//
//   8. Ea prior re-centered N(94,5) → N(85,7) kJ/mol per Polymer Handbook
//      lumped values. PSV prior re-centered N(1.5,0.6) → N(1.2,0.4) psig
//      (consistent with empirical Thursday-vent back-calibration).
//
//   9. Inventory uncertainty made explicit: productGal ~ Uniform(5500, 7500).
//      News range was always 6,000–7,000; OCFA never gave a definitive number.
//
//  10. Binary inhibition replaces fictitious `(1 − I)` damping. Inhibitor
//      either works (full damping of propagation) or doesn't, with a smooth
//      transition over a short window.
//
// Usage:  node scripts/montecarlo.js [N_TARGET_ACCEPTED]
// Output: writes assets/montecarlo-results.json

const fs = require('fs');
const path = require('path');

// =============================================================================
// Physical & timing constants
// =============================================================================
const R = 8.314;                               // J/(mol·K)
const F2K = f => (f - 32) * 5/9 + 273.15;
const K2F = k => (k - 273.15) * 9/5 + 32;
const clamp01 = x => Math.min(1, Math.max(0, x));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

const T_BP_K = 374.15;                         // MMA boiling point (101 °C)
const ATM = 101325;                            // Pa
const DH_VAP_MMA = 360e3;                      // J/kg (36 kJ/mol / 0.10012 kg/mol)

// Observation anchors (all hours since incident start = Thu 5/21 3:40 pm PDT)
const PSV_GRACE_END  = 12;     // Thursday vent considered settled
const CRACK_OBSERVED = 64;     // Sat night recon discovery
const T_OBS_HOUR     = 74;     // Sun 5:40 pm gauge-pegged ≥100 °F
const T_OBS_MIN_F    = 95;     // 5 °F slop for gauge calibration

// =============================================================================
// Trommsdorff–Norrish gel-effect amplifier
// Sigmoidal turn-on at X* = 0.20 (literature for bulk MMA), plateau at A_gel,
// with vitrification cutoff near X = 0.85.
// =============================================================================
function gel(X){
  const Xstar = 0.20, w = 0.04, A_gel = 50;
  const Xf = 0.85, wf = 0.04;
  const turnOn = 1 / (1 + Math.exp(-(X - Xstar)/w));
  const vitrify = 1 / (1 + Math.exp((X - Xf)/wf));
  return 1 + A_gel * turnOn * vitrify;
}

// =============================================================================
// Diurnal solar — clock-aligned (Hour 0 = Thu 3:40 pm PDT, clock 15.667)
// =============================================================================
const T0_CLOCK_HOUR = 15.667;
function solar(tHours, amp){
  const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
  const phase = Math.cos(((hod - 15) / 24) * 2 * Math.PI);
  return Math.max(0, phase) * amp;
}

// =============================================================================
// MMA vapor pressure (Antoine-style Clausius-Clapeyron) and total vapor-space P
// =============================================================================
function pMmaPa(T_K){
  const Pref = 3866, Tref = 293.15, dHvap = 36800;
  return Pref * Math.exp(-dHvap/R * (1/T_K - 1/Tref));
}
const T0_VAP = 297;
const P_AIR_INIT = ATM - pMmaPa(T0_VAP);
function pTotalPa(T_K){
  return P_AIR_INIT * T_K / T0_VAP + pMmaPa(T_K);
}

// =============================================================================
// PMMA wall fouling — now SELF-LIMITING at δ_max ≈ 3 mm.
// Audit found: monotonic δ ∝ X gives 4 inches of PMMA at X=0.5 (absurd).
// Real fouling is rate-limited by mass transport and self-limits via thermal-
// cycling spalling. We cap effective δ to keep the model physically honest.
// =============================================================================
const DELTA_MAX_M = 0.003;                     // 3 mm cap
function effectiveUA(UA_clean, X, p){
  if (!(p.fPlate > 0) || X < 1e-4) return UA_clean;
  const A_c = p.A_cool;
  const U_clean = UA_clean / A_c;
  const delta_raw = p.fPlate * X * p.mMonomer / (p.rhoPmma * A_c);
  const delta = Math.min(delta_raw, DELTA_MAX_M);
  return (1 / (1/U_clean + delta / p.kPmma)) * A_c;
}

// =============================================================================
// Crack-vent cooling — TIME-gated, magnitude based on choked-flow estimate
// for a ~1 cm² crack venting MMA vapor at the headspace pressure.
//   ṁ ≈ Cd · A_crack · P_total · √(γ/(R·T) · (2/(γ+1))^((γ+1)/(γ−1)))
//   Q_crack = ṁ · ΔH_vap_MMA
// Per audit: at ~1 cm² and 1 atm overpressure, Q ≈ 25 kW.
// Sampled crack area captures uncertainty about actual crack size.
// =============================================================================
function crackVentCooling(T_K, p, t){
  if (t < CRACK_OBSERVED) return 0;
  const A_crack = p.A_crack ?? 1e-4;           // m² (default 1 cm²)
  const Cd = 0.7;
  const P0 = pTotalPa(T_K);
  if (P0 <= ATM) return 0;
  // Subsonic Bernoulli vapor flow (more realistic at small ΔP than choked).
  // ṁ = Cd · A · sqrt(2 · ρ · ΔP), ρ_vapor ≈ MW·P/RT
  const rho = 0.10012 * P0 / (R * T_K);
  const dP = P0 - ATM;
  const mdot = Cd * A_crack * Math.sqrt(2 * rho * dP);
  return mdot * DH_VAP_MMA;
}

// =============================================================================
// Evaporative cooling from the deluge film (latent heat)
// =============================================================================
function evapCooling(T_bulk_K, p){
  if (!p.evapOn) return 0;
  const h_m = p.h_m ?? 0.015;
  const A_c = p.A_cool;
  const h_fg = 2.26e6;
  const MW = 0.018;
  const RH = p.RH ?? 0.60;
  const T_air_K = p.Twater;
  const T_film = p.Twater + 0.5 * Math.max(0, T_bulk_K - p.Twater);
  const pSat = TK => 611 * Math.exp(17.27 * (TK - 273.15) / (TK - 273.15 + 237.3));
  const driving = Math.max(0, pSat(T_film) - RH * pSat(T_air_K));
  return h_m * A_c * (driving / (R * T_film)) * MW * h_fg;
}

// =============================================================================
// ODE step.  Binary inhibition: rate damped to a small floor while inhibitor
// is "active" (I > I_crit = 0.02), then full propagation once consumed.
// =============================================================================
const I_CRIT = 0.02;
// Net longwave IR loss from the external shell (operational audit finding).
// Shell at T_shell radiates to ~50 °F sky → ~60–110 W/m² loss at typical
// temperatures. Over ~140 m² external shell ≈ 8–15 kW continuous cooling.
// Diurnal asymmetry: negligible during the day (sky T close to ambient),
// strong at night.
function irCooling(T_K, p, tHours){
  const A_ext = 3.5 * p.A_cool;       // external is ~3-4× internal A_cool
  const eps = 0.85;
  const sigma = 5.67e-8;
  const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
  // Sky temperature: 50 °F at night, ambient by day
  const nightFrac = Math.max(0, -Math.cos(((hod - 15)/24)*2*Math.PI));
  const Tsky = p.Twater - 25 * nightFrac;   // K offset
  const T_shell = p.Twater + 0.5*(T_K - p.Twater);  // shell T ~ midpoint
  return eps * sigma * A_ext * (Math.pow(T_shell, 4) - Math.pow(Tsky, 4));
}

function step(s, p){
  const k = p.A * Math.exp(-p.Ea / (R * s.T));
  // Binary inhibition with smooth transition
  const inhibFactor = 1 / (1 + Math.exp(-(I_CRIT - s.I)/0.005));
  const dX = k * Math.max(0, 1 - s.X) * inhibFactor * gel(s.X);
  const o2_collapse = (s.X > 1e-5) ? 1e-3 * s.I : 0;
  const dI = -p.cInh * k - o2_collapse;
  const Qgen    = p.mMonomer * (p.deltaH / 0.10012) * dX;

  // OPERATIONAL: effective cooling area is only a fraction of the geometric
  // A_cool — wetted-shell coverage from portable monitors is typically 30–60%,
  // with crew-fatigue duty cycle around 85–95%.
  const opsCool = (p.coverageFrac ?? 0.5) * (p.dutyCycle ?? 0.9);
  const UA_eff  = effectiveUA(p.UA, s.X, p) * opsCool;
  const Q_evap  = evapCooling(s.T, p) * opsCool;
  const Q_crack = crackVentCooling(s.T, p, s.t);
  const Q_ir    = irCooling(s.T, p, s.t);

  // WITHDRAWAL: if bulk T exceeds 150 °F, OCFA pulls personnel; cooling collapses
  // to ~10% of remaining (just standoff streams). Captures real IC decision logic.
  const withdrawn = K2F(s.T) > 150;
  const withdrawal_factor = withdrawn ? 0.1 : 1.0;

  const Qcool = (UA_eff * (s.T - p.Twater) + Q_evap + Q_crack) * withdrawal_factor
              + Q_ir
              - solar(s.t, p.solarAmp);
  const dT = (Qgen - Qcool) / (p.mMonomer * p.Cp);
  return { dT, dX, dI };
}

function rk4(s, dt, p){
  const k1 = step(s, p);
  const s2 = { t:s.t+dt/2, T:s.T+k1.dT*dt/2, X:clamp01(s.X+k1.dX*dt/2), I:Math.max(0,s.I+k1.dI*dt/2) };
  const k2 = step(s2, p);
  const s3 = { t:s.t+dt/2, T:s.T+k2.dT*dt/2, X:clamp01(s.X+k2.dX*dt/2), I:Math.max(0,s.I+k2.dI*dt/2) };
  const k3 = step(s3, p);
  const s4 = { t:s.t+dt,   T:s.T+k3.dT*dt,   X:clamp01(s.X+k3.dX*dt),   I:Math.max(0,s.I+k3.dI*dt) };
  const k4 = step(s4, p);
  return {
    T: s.T + (k1.dT + 2*k2.dT + 2*k3.dT + k4.dT) * dt/6,
    X: clamp01(s.X + (k1.dX + 2*k2.dX + 2*k3.dX + k4.dX) * dt/6),
    I: Math.max(0, s.I + (k1.dI + 2*k2.dI + 2*k3.dI + k4.dI) * dt/6),
  };
}

// =============================================================================
// Trajectory integration with TWO observation likelihoods:
//   (a) HARD constraint: effective bulk-T threshold not crossed before NOW
//       (catastrophic failure either happened or didn't; no soft version)
//   (b) SOFT censored likelihood for gauge-pegged ≥100 °F observation at hr 74.
//       L = Φ((peakF_by_obs − 100 + σ_g) / σ_g)  for σ_g = 5 °F
//       This smoothly rewards trajectories that reach 100+ °F by hr 74 without
//       hard-rejecting trajectories that miss by a few degrees.
// PSV-vent rejection DROPPED — the valve is mechanically broken.
// =============================================================================
const SIGMA_GAUGE_F = 5;
function normalCdf(z){
  // Abramowitz-Stegun 7.1.26 approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z*z/2);
  const p = d * t * (0.3193815 + t*(-0.3565638 + t*(1.781478 + t*(-1.821256 + t*1.330274))));
  return z > 0 ? 1 - p : p;
}
function gaugeLikelihood(peakF_by_obs){
  // Censored-normal: probability of observing "gauge pegged at ≥100" given true peak
  // Smooth ramp through 100 °F with σ = 5 °F. Saturates near 1 above ~110.
  return normalCdf((peakF_by_obs - 100 + SIGMA_GAUGE_F) / SIGMA_GAUGE_F);
}

function trajectory(p, startHour, endHour, surviveByHour, bleveThresholdF, dTstratF){
  const effectiveThresholdF = bleveThresholdF - dTstratF;
  let s = { t: startHour, T: p.T0, X: 0, I: p.I0 };
  let crossed = null, peakF = K2F(s.T), peakF_by_obs = K2F(s.T);
  let t = startHour;
  while (t < endHour){
    const TF = K2F(s.T);
    if (TF > peakF) peakF = TF;
    if (t <= T_OBS_HOUR && TF > peakF_by_obs) peakF_by_obs = TF;
    if (crossed === null && TF >= effectiveThresholdF) crossed = t;
    if (crossed !== null && crossed < surviveByHour) break;
    if (TF > 280) break;
    const dt = TF > 200 ? 5 : (TF > 130 ? 20 : 60);
    const next = rk4(s, dt, p);
    t += dt/3600;
    s.t = t; s.T = next.T; s.X = next.X; s.I = next.I;
  }
  // Hard rejection: failure observed-not-happened
  const hardOK = !(crossed !== null && crossed < surviveByHour);
  // Soft weight: gauge censored likelihood
  const weight = hardOK ? gaugeLikelihood(peakF_by_obs) : 0;
  return { crossed, peakF, peakF_by_obs, weight, hardOK };
}

// =============================================================================
// Priors (all updated per audit findings)
// =============================================================================
function randn(){
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleParams(){
  // Inventory uncertainty — Uniform(5500, 7500) gal per news range
  const productGal = 5500 + 2000 * Math.random();
  const mMonomer = productGal * 0.94 * 3.785;    // kg

  // I0 prior collapsed to aged-only — the rate-of-rise observation (77→90 °F
  // over 14 h) directly evidences substantial inhibitor depletion at hr 16.
  // Fresh-batch (I~1) trajectories cannot reproduce this rise under binary
  // inhibition; sampling them is deterministic waste (per Bayesian audit).
  // Beta-shaped distribution heavily weighted on low values.
  const I0 = clamp(0.10 + 0.12 * Math.abs(randn()), 0.0, 0.45);

  return {
    A:        3.0e10,
    Ea:       clamp(85000 + 7000 * randn(), 65000, 105000),   // re-centered 94→85 kJ/mol
    deltaH:   57700,
    cInh:     2.0e-2,
    mMonomer,
    productGal,
    Cp:       1900,
    I0,
    UA:       Math.exp(Math.log(2000) + 0.45 * randn()),
    Twater:   F2K(72 + 4 * randn()),               // SoCal hydrant ~70°F not 75
    T0:       F2K(90 + 1.5 * randn()),
    solarAmp: clamp(8000 + 3000 * randn(), 0, 18000),  // ×40 from old prior
    fPlate:   clamp(0.15 + 0.12 * randn(), 0.02, 0.50),  // re-centered 0.35→0.15
    A_cool:   clamp(38 + 6 * randn(), 25, 55),
    kPmma:    0.19,
    rhoPmma:  1180,
    evapOn:   true,
    h_m:      Math.exp(Math.log(0.015) + 0.5 * randn()),    // tightened per audit
    RH:       clamp(0.60 + 0.10 * randn(), 0.30, 0.85),
    // Crack-vent area — log-normal around 1 cm², ~3× spread
    A_crack:  Math.exp(Math.log(1e-4) + 0.7 * randn()),
    // Operational realism: wetted-shell coverage from portable monitors
    coverageFrac: clamp(0.5 + 0.12 * randn(), 0.25, 0.80),
    // Crew duty cycle accounting for handovers, water-truck reloads, etc.
    dutyCycle:    clamp(0.88 + 0.06 * randn(), 0.70, 0.98),
  };
}

function sampleBleveThresholdF(){
  // Picazo BLEVE physics threshold = MMA boiling point ≈ 213 °F
  return clamp(213 + 15 * randn(), 180, 250);
}

function sampleStratificationF(){
  // Top-vs-bulk T difference in a 19%-filled vertical tank with limited mixing.
  // 30-50 °F per audit; sampled N(20, 12) clipped [0, 50] for honest spread.
  return clamp(20 + 12 * randn(), 0, 50);
}

// =============================================================================
// Failure-window bins (hours since incident start; NOW = hour 75)
// =============================================================================
const bins = [
  { id:'sun-eve',       label:'Sun 7pm – midnight',     lo:75,  hi:80,  primary:true },
  { id:'mon-overnight', label:'Mon 12am – 12pm',        lo:80,  hi:92  },
  { id:'mon-aft',       label:'Mon 12pm – 7pm',         lo:92,  hi:99,  secondary:true },
  { id:'mon-eve',       label:'Mon evening → Tue 6am',  lo:99,  hi:110 },
  { id:'tue',           label:'Tue (full day)',         lo:110, hi:134, tertiary:true },
  { id:'wed',           label:'Wed (full day)',         lo:134, hi:158 },
  { id:'thu-plus',      label:'Thu or later',           lo:158, hi:9999 },
];

// =============================================================================
// Main
// =============================================================================
const N_TARGET   = parseInt(process.argv[2] || '10000', 10);
const START_HOUR = 30;
const NOW_HOUR   = 75;
const END_HOUR   = 192;
const t0wall     = Date.now();

console.log(`MC v3 — anchor hr ${START_HOUR} (T=90 °F gauge), survival hr ${NOW_HOUR}, end hr ${END_HOUR}.`);
console.log(`Target ${N_TARGET.toLocaleString()} accepted trajectories…\n`);

// Importance-sampling MC: every trajectory that passes the hard reject is
// "accepted" with a soft weight = gauge censored likelihood. Summary stats
// are weighted means. Effective sample size reported.
let attempted = 0, hardRejected = 0;
const samples = [];           // { weight, crossed, peakF, dTstrat, peakF_by_obs }

while (samples.length < N_TARGET){
  attempted++;
  const p = sampleParams();
  const bleve = sampleBleveThresholdF();
  const dTstrat = sampleStratificationF();
  const out = trajectory(p, START_HOUR, END_HOUR, NOW_HOUR, bleve, dTstrat);
  if (!out.hardOK){
    hardRejected++;
    continue;
  }
  samples.push({
    weight: out.weight,
    crossed: out.crossed,
    peakF: out.peakF,
    peakF_by_obs: out.peakF_by_obs,
    dTstrat,
  });
  if (samples.length % 1000 === 0){
    process.stdout.write(`  ${samples.length.toLocaleString().padStart(7)} / ${N_TARGET.toLocaleString()}   (hard-rejected ${hardRejected.toLocaleString()})\n`);
  }
}

// Weighted summaries
const W = samples.reduce((s, x) => s + x.weight, 0);
const ESS = W * W / samples.reduce((s, x) => s + x.weight * x.weight, 0);

// Weighted holds / crosses
let wHolds = 0, wCrosses = 0;
samples.forEach(x => {
  if (x.crossed === null) wHolds += x.weight;
  else wCrosses += x.weight;
});
const holdsPct = +(wHolds / W * 100).toFixed(2);
const crossesPct = +(wCrosses / W * 100).toFixed(2);

// Weighted bin counts
const counts = new Map(bins.map(b => [b.id, 0]));
samples.forEach(x => {
  if (x.crossed === null) return;
  for (const b of bins){
    if (x.crossed >= b.lo && x.crossed < b.hi){
      counts.set(b.id, (counts.get(b.id) || 0) + x.weight);
      break;
    }
  }
});

// Weighted quantiles helper
function weightedQuantile(arr, weightFn, valueFn, q){
  const pairs = arr.map(x => ({ v: valueFn(x), w: weightFn(x) }))
                   .filter(x => x.v != null && x.w > 0)
                   .sort((a, b) => a.v - b.v);
  const Wt = pairs.reduce((s, x) => s + x.w, 0);
  if (Wt === 0) return null;
  let cum = 0;
  for (const x of pairs){ cum += x.w; if (cum / Wt >= q) return x.v; }
  return pairs[pairs.length - 1].v;
}

const crossingSamples = samples.filter(x => x.crossed !== null);
const accepted = samples.length;
const rejectedCross = hardRejected;
const rejectedColdAtObs = 0; // no longer a hard reject — soft weight handles it
const crossingTimes = crossingSamples.map(x => x.crossed).sort((a, b) => a - b);
const peakFs = samples.map(x => x.peakF).sort((a, b) => a - b);

const dur = (Date.now() - t0wall)/1000;

const pct = (arr, q) => arr.length ? arr[Math.floor(q*(arr.length-1))] : null;

function hourToLocal(h){
  if (h == null) return null;
  const t0Ms = Date.UTC(2026, 4, 21, 22, 40);
  const d = new Date(t0Ms + h*3600*1000);
  const utcMs = d.getTime() - 7*3600*1000;
  const dd = new Date(utcMs);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let hh = dd.getUTCHours();
  const mm = dd.getUTCMinutes();
  const ampm = hh < 12 ? 'am' : 'pm';
  hh = ((hh + 11) % 12) + 1;
  return `${days[dd.getUTCDay()]} ${dd.getUTCMonth()+1}/${dd.getUTCDate()} ${hh}:${String(mm).padStart(2,'0')} ${ampm} PDT`;
}

// Weighted crossing-time quantiles (where weight = gauge likelihood)
const median = weightedQuantile(crossingSamples, x => x.weight, x => x.crossed, 0.50);
const p25 = weightedQuantile(crossingSamples, x => x.weight, x => x.crossed, 0.25);
const p75 = weightedQuantile(crossingSamples, x => x.weight, x => x.crossed, 0.75);

const binsForChart = bins.map(b => ({
  label: b.label,
  pct: +(counts.get(b.id) / W * 100).toFixed(2),
  primary: !!b.primary,
  secondary: !!b.secondary,
  tertiary: !!b.tertiary,
}));
binsForChart.push({ label: 'Does not cross (holds)', pct: holdsPct, hold: true });

const result = {
  generated_at: new Date().toISOString(),
  model_version: 'v4 — importance-sampled, post-six-agent audit, 2026-05-25',
  n_target: N_TARGET,
  n_accepted: accepted,
  n_attempted: attempted,
  acceptance_rate: +(accepted / attempted * 100).toFixed(2),
  effective_sample_size: +ESS.toFixed(1),
  weight_efficiency_pct: +(ESS / accepted * 100).toFixed(2),
  rejected_cross_pct: +(rejectedCross/attempted * 100).toFixed(2),
  rejected_cold_pct:  0,
  anchor: 'T = 90 °F gauge at hour 30 (Fri 5/22 ~9:40 pm PDT)',
  survival_cutoff_hour: NOW_HOUR,
  end_hour: END_HOUR,
  duration_sec: +dur.toFixed(1),
  holds_pct: holdsPct,
  crosses_pct: crossesPct,
  median_crossing_hour: median,
  median_crossing_label: hourToLocal(median),
  iqr_p25_hour: p25, iqr_p25_label: hourToLocal(p25),
  iqr_p75_hour: p75, iqr_p75_label: hourToLocal(p75),
  peak_p50_F: weightedQuantile(samples, x => x.weight, x => x.peakF, 0.50),
  peak_p90_F: weightedQuantile(samples, x => x.weight, x => x.peakF, 0.90),
  stratification_p50_F: weightedQuantile(samples, x => x.weight, x => x.dTstrat, 0.50),
  bins: binsForChart,
};

const outPath = path.join(__dirname, '..', 'assets', 'montecarlo-results.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nDone in ${dur.toFixed(1)}s.`);
console.log(`Accepted ${accepted.toLocaleString()} / Attempted ${attempted.toLocaleString()}  (acceptance ${(accepted/attempted*100).toFixed(1)}%)`);
console.log(`  hard-rejected (threshold crossed before now): ${rejectedCross.toLocaleString()}  (${(rejectedCross/attempted*100).toFixed(1)}%)`);
console.log(`  ESS = ${ESS.toFixed(0)} (efficiency ${(ESS/accepted*100).toFixed(1)}%)`);
console.log(`Holds: ${holdsPct}%   Crosses: ${crossesPct}%`);
if (median != null){
  console.log(`Median crossing time: hr ${median.toFixed(1)} = ${result.median_crossing_label}`);
  console.log(`IQR: ${result.iqr_p25_label}  →  ${result.iqr_p75_label}`);
}
console.log(`\nWrote ${outPath}`);
