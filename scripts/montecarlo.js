#!/usr/bin/env node
// Monte Carlo failure-window estimator for the Garden Grove MMA tank.
//
// Approach (approximate Bayesian computation):
//   - Anchor start at the strongest measured reading: T = 90 °F at hour 30
//     (Fri 5/22 ~9:40 pm PDT interior gauge).
//   - Sample uncertain parameters from broad priors.
//   - Integrate forward.  REJECT trajectories that cross the (sampled)
//     runaway threshold before hour 54 (now == Sat 5/23 9:40 pm PDT), since
//     the tank demonstrably survived that window.
//   - For accepted trajectories, record the first crossing time (or `holds`).
//
// Usage:  node scripts/montecarlo.js [N_TARGET_ACCEPTED]
// Output: writes assets/montecarlo-results.json

const fs = require('fs');
const path = require('path');

// ---------- model -----------------------------------------------------------
const R = 8.314;
const F2K = f => (f - 32) * 5/9 + 273.15;
const K2F = k => (k - 273.15) * 9/5 + 32;

function gel(X){ return X < 0.05 ? 1.0 : 1 + 18 * Math.pow(X, 2.2); }
// Hour 0 = Thu 5/21 3:40 pm PDT — convert integration time → clock-of-day.
const T0_CLOCK_HOUR = 15.667;
function solar(tHours, amp){
  const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
  const phase = Math.cos(((hod - 15) / 24) * 2 * Math.PI);
  return Math.max(0, phase) * amp;
}

// Polymer-skin fouling — see simulator.js for derivation.
function effectiveUA(UA_clean, X, p){
  if (!(p.fPlate > 0) || X < 1e-4) return UA_clean;
  const A_c = p.A_cool;
  const U_clean = UA_clean / A_c;
  const delta = p.fPlate * X * p.mMonomer / (p.rhoPmma * A_c);
  const R_foul = delta / p.kPmma;
  const U_eff = 1 / (1/U_clean + R_foul);
  return U_eff * A_c;
}

// MMA vapor pressure via Clausius-Clapeyron, anchored at (20°C, 29 mmHg)
// and (101°C, 760 mmHg).  Returns Pa.
function pMmaPa(T_K){
  const Pref = 3866, Tref = 293.15, dHvap = 36800;
  return Pref * Math.exp(-dHvap/R * (1/T_K - 1/Tref));
}
// Total vapor-space pressure for a closed atmospheric tank initially at
// equilibrium at T0 (= 297 K, ~75 °F).  Moles of non-condensable gas are
// fixed thereafter; MMA partial pressure follows Antoine in the headspace.
const T0_VAP = 297;
const P_ATM  = 101325;
const P_AIR_INIT = P_ATM - pMmaPa(T0_VAP);
function pTotalPa(T_K){
  return P_AIR_INIT * T_K / T0_VAP + pMmaPa(T_K);
}

// Timing constants for the observed-evidence constraints.
//   PSV_GRACE_END:    Thursday vent considered settled by this hour
//   CRACK_OBSERVED:   late-Sat-night recon discovered cracks (announced hr 68)
//   T_OBS_HOUR:       gauge-pegged ≥100 °F reading time (Sun 5:40 pm PDT)
//   T_OBS_MIN_F:      gauge minimum reading w/ 5 °F slop for calibration
const PSV_GRACE_END  = 12;
const CRACK_OBSERVED = 64;
const T_OBS_HOUR     = 74;
const T_OBS_MIN_F    = 95;

// Crack-vent cooling — post hour 64, vapor can escape through the observed
// cracks. As T approaches MMA's boiling point (T_bp = 374.15 K = 213 °F),
// vapor pressure approaches atmospheric and venting flow ramps sharply,
// dumping latent heat at ~360 kJ/kg. Implemented as a stiff negative-
// feedback term that activates within ~5 K of BP and caps trajectories near
// the boiling plateau. K_crack chosen so Q_crack ≈ 50 kW at T = BP, which
// is the right order of magnitude to absorb the model's typical Q_gen near
// runaway and impose a soft ceiling.
const T_BP_K = 374.15;
function crackVentCooling(T_K, p, t){
  if (t < CRACK_OBSERVED) return 0;
  if (T_K <= T_BP_K - 5) return 0;
  const K_crack = p.kCrack ?? 5000;     // W/K
  return Math.max(0, K_crack * (T_K - (T_BP_K - 5)));
}

// Evaporative cooling from the deluge film (latent heat).
function evapCooling(T_bulk_K, p){
  if (!p.evapOn) return 0;
  const h_m = p.h_m ?? 0.02;
  const A_c = p.A_cool;
  const h_fg = 2.26e6;
  const MW = 0.018;
  const RH = p.RH ?? 0.60;
  const T_air_K = p.Twater;
  const T_film  = p.Twater + 0.5 * Math.max(0, T_bulk_K - p.Twater);
  const pSat = TK => 611 * Math.exp(17.27 * (TK - 273.15) / (TK - 273.15 + 237.3));
  const driving = Math.max(0, pSat(T_film) - RH * pSat(T_air_K));
  const dC = driving / (R * T_film);
  return h_m * A_c * dC * MW * h_fg;
}

function step(s, p){
  const k = p.A * Math.exp(-p.Ea / (R * s.T));
  const dX = k * Math.max(0, 1 - s.X) * Math.max(0, 1 - s.I) * gel(s.X);
  const o2_collapse_rate = (s.X > 0.005) ? 5e-4 * s.I : 0;
  const dI = -p.cInh * k - o2_collapse_rate;
  // Qgen = m_kg × (ΔH_J/mol / MW_kg/mol) × dX/dt   →   W
  const Qgen    = p.mMonomer * (p.deltaH / 0.10012) * dX;
  const UA_eff  = effectiveUA(p.UA, s.X, p);
  const Q_evap  = evapCooling(s.T, p);
  const Q_crack = crackVentCooling(s.T, p, s.t);
  const Qcool   = UA_eff * (s.T - p.Twater) + Q_evap + Q_crack - solar(s.t, p.solarAmp);
  const dT = (Qgen - Qcool) / (p.mMonomer * p.Cp);
  return { dT, dX, dI };
}
const clamp01 = x => Math.min(1, Math.max(0, x));
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

// Integrate from anchor.  Returns { crossed, peakF, survivedToNow, ventedBeforeNow }.
//   - "crossed" = first time T ≥ sampled runaway threshold
//   - "ventedBeforeNow" = first time after PSV-grace window that total vapor
//     pressure would exceed the sampled PSV setpoint.  News record shows no
//     visible PSV vent since the Thursday auto-activation (~h=4 → closed ~h=10),
//     so a forward simulation that vents between PSV_GRACE_END and surviveByHour
//     contradicts observed history.
// surviveByHour: accept only trajectories that DIDN'T cross OR vent before that time.
function trajectory(p, startHour, endHour, surviveByHour, runawayF){
  const psv_set_Pa = P_ATM + (p.psvPsig ?? 1.5) * 6894.76;

  let s = { t: startHour, T: p.T0, X: 0.02, I: p.I0 ?? 0.3 };
  let crossed = null, vented = null;
  let peakF = K2F(s.T);
  let peakF_by_obs = K2F(s.T);    // hottest T reached by hr T_OBS_HOUR
  let t = startHour;
  while (t < endHour){
    const TF = K2F(s.T);
    if (TF > peakF) peakF = TF;
    if (t <= T_OBS_HOUR && TF > peakF_by_obs) peakF_by_obs = TF;
    if (crossed === null && TF >= runawayF) crossed = t;
    if (vented === null && t > PSV_GRACE_END && t < CRACK_OBSERVED
        && pTotalPa(s.T) > psv_set_Pa) vented = t;
    // Early-out: once a trajectory has been determined to fail before now,
    // no need to keep integrating it.
    if (crossed !== null && crossed < surviveByHour) break;
    if (vented  !== null && vented  < surviveByHour) break;
    if (TF > 280) break;
    const dt = TF > 200 ? 5 : (TF > 130 ? 20 : 60);
    const next = rk4(s, dt, p);
    t += dt/3600;
    s.t = t; s.T = next.T; s.X = next.X; s.I = next.I;
  }
  // Survival conditions (must satisfy all):
  //   (a) no runaway-threshold crossing before now
  //   (b) no PSV vent in [12, 64)
  //   (c) reached at least 100 °F by hour 74 (the gauge-pegged observation)
  const survivedToNow = !((crossed !== null && crossed < surviveByHour) ||
                          (vented  !== null && vented  < surviveByHour)) &&
                        (peakF_by_obs >= T_OBS_MIN_F);
  return { crossed, peakF, survivedToNow, vented, peakF_by_obs };
}

// ---------- priors ----------------------------------------------------------
function randn(){
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clamp(x, lo, hi){ return Math.min(hi, Math.max(lo, x)); }

// Most parameters are kept at the calibrated baseline; the dominant
// uncertainty lives in (UA, Ea, I0, threshold).
function sampleParams(){
  return {
    A:        3.0e10,
    Ea:       clamp(94000 + 5000 * randn(),  78000, 110000),
    deltaH:   57700,
    cInh:     2.0e-2,
    mMonomer: 24900,    // 7,000 gal × 0.94 kg/L × 3.785 L/gal
    Cp:       1900,
    I0:       clamp(0.10 + 0.25 * Math.abs(randn()), 0.0, 0.95),
    UA:       Math.exp(Math.log(2000) + 0.45 * randn()),
    Twater:   F2K(75 + 4 * randn()),
    T0:       F2K(90 + 1.5 * randn()),
    solarAmp: clamp(250 + 120 * randn(), 0, 800),
    // PMMA wall fouling — this is the new dominant amplifier.
    // f_plate: fraction of newly-formed polymer that adheres to the cool
    // shell vs. stays suspended. Range 0.05–0.7 is wide because nobody has
    // a measurement for THIS tank.
    fPlate:   clamp(0.35 + 0.18 * randn(), 0.02, 0.75),
    A_cool:   clamp(40 + 8 * randn(), 25, 70),
    kPmma:    0.19,
    rhoPmma:  1180,
    evapOn:   true,
    h_m:      Math.exp(Math.log(0.012) + 0.85 * randn()),
    RH:       clamp(0.60 + 0.10 * randn(), 0.30, 0.85),
    // PSV setpoint — back-calibrated from the Thursday auto-activation at
    // bulk T ≈ 95 °F, which puts total vapor-space pressure at ~1 psig
    // for a closed atmospheric tank. Prior is tight around 1.5 psig.
    psvPsig:  clamp(1.5 + 0.6 * randn(), 0.5, 4.0),
  };
}
function sampleThresholdF(){
  // PARADIGM SHIFT (Sun 5/24): interior gauge passed 100 °F without
  // catastrophic failure → the "approximately 100 °F out of control"
  // field quote was a CAUTION threshold, not a CATASTROPHIC one.
  // Picazo (USC, LAT) places the real BLEVE threshold at MMA's boiling
  // point ≈ 213 °F (100 °C) — above this, liquid→gas transition drives
  // super-linear pressure rise. Centered there with moderate spread.
  return clamp(210 + 25 * randn(), 160, 260);
}

// ---------- binning ---------------------------------------------------------
// Hour 0 = Thu 5/21 3:40 pm PDT.  Hour 30 = Fri 9:40 pm.  Hour 54 = Sat 9:40 pm.
// Bins start at NOW_HOUR=75 (Sun 6:40 pm PDT).
const bins = [
  { id:'sun-eve',       label:'Sun 7pm – midnight',     lo:75,  hi:80,  primary:true },
  { id:'mon-overnight', label:'Mon 12am – 12pm',        lo:80,  hi:92  },
  { id:'mon-aft',       label:'Mon 12pm – 7pm',         lo:92,  hi:99,  secondary:true },
  { id:'mon-eve',       label:'Mon evening → Tue 6am',  lo:99,  hi:110 },
  { id:'tue',           label:'Tue (full day)',         lo:110, hi:134, tertiary:true },
  { id:'wed',           label:'Wed (full day)',         lo:134, hi:158 },
  { id:'thu-plus',      label:'Thu or later',           lo:158, hi:9999 },
];

// ---------- main ------------------------------------------------------------
const N_TARGET   = parseInt(process.argv[2] || '10000', 10);
const START_HOUR = 30;        // Fri 9:40 pm PDT — interior gauge 90 °F (last solid numeric anchor)
const NOW_HOUR   = 75;        // Sun 6:40 pm PDT — survival anchor; gauge had passed 100 °F at hr 74
const END_HOUR   = 192;       // ~Fri morning
const t0wall     = Date.now();

console.log(`Monte Carlo: anchor at hr ${START_HOUR} (90 °F), survival cutoff hr ${NOW_HOUR}, end hr ${END_HOUR}.`);
console.log(`Target ${N_TARGET.toLocaleString()} accepted trajectories…\n`);

let attempted = 0, accepted = 0, holds = 0, crossed = 0;
let rejectedCross = 0, rejectedVent = 0, rejectedColdAtObs = 0;
const counts = new Map(bins.map(b => [b.id, 0]));
const crossingTimes = [];
const peakFs = [];

while (accepted < N_TARGET){
  attempted++;
  const p = sampleParams();
  const thr = sampleThresholdF();
  const out = trajectory(p, START_HOUR, END_HOUR, NOW_HOUR, thr);
  if (!out.survivedToNow){
    if (out.crossed !== null && out.crossed < NOW_HOUR) rejectedCross++;
    else if (out.vented !== null && out.vented < NOW_HOUR) rejectedVent++;
    else if (out.peakF_by_obs < 100) rejectedColdAtObs++;
    continue;
  }
  accepted++;
  peakFs.push(out.peakF);
  if (out.crossed === null){
    holds++;
  } else {
    crossed++;
    crossingTimes.push(out.crossed);
    for (const b of bins){
      if (out.crossed >= b.lo && out.crossed < b.hi){
        counts.set(b.id, counts.get(b.id) + 1);
        break;
      }
    }
  }
  if (accepted % 1000 === 0){
    process.stdout.write(`  ${accepted.toLocaleString().padStart(7)} / ${N_TARGET.toLocaleString()}   (rejected ${(attempted-accepted).toLocaleString()})\n`);
  }
}

const dur = (Date.now() - t0wall)/1000;
const holdsPct = +(holds/accepted * 100).toFixed(2);
const crossesPct = +(crossed/accepted * 100).toFixed(2);

crossingTimes.sort((a,b)=>a-b);
peakFs.sort((a,b)=>a-b);
const pct = (arr, q) => arr.length ? arr[Math.floor(q*(arr.length-1))] : null;
const median = pct(crossingTimes, 0.50);
const p25 = pct(crossingTimes, 0.25);
const p75 = pct(crossingTimes, 0.75);

function hourToLocal(h){
  if (h == null) return null;
  // Thu May 21 3:40 pm PDT == 22:40 UTC on May 21.
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

const binsForChart = bins.map(b => ({
  label: b.label,
  pct: +(counts.get(b.id) / accepted * 100).toFixed(2),
  primary: !!b.primary,
  secondary: !!b.secondary,
}));
binsForChart.push({ label: 'Does not cross (holds)', pct: holdsPct, hold: true });

const result = {
  generated_at: new Date().toISOString(),
  n_target: N_TARGET,
  n_accepted: accepted,
  n_attempted: attempted,
  acceptance_rate: +(accepted / attempted * 100).toFixed(2),
  anchor: 'T = 90 °F at hour 30 (Fri 5/22 ~9:40 pm PDT interior gauge)',
  survival_cutoff_hour: NOW_HOUR,
  end_hour: END_HOUR,
  duration_sec: +dur.toFixed(1),
  holds_pct: holdsPct,
  crosses_pct: crossesPct,
  median_crossing_hour: median,
  median_crossing_label: hourToLocal(median),
  iqr_p25_hour: p25, iqr_p25_label: hourToLocal(p25),
  iqr_p75_hour: p75, iqr_p75_label: hourToLocal(p75),
  peak_p50_F: pct(peakFs, 0.50),
  peak_p90_F: pct(peakFs, 0.90),
  bins: binsForChart,
};

const outPath = path.join(__dirname, '..', 'assets', 'montecarlo-results.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nDone in ${dur.toFixed(1)}s.`);
console.log(`Accepted ${accepted.toLocaleString()} / Attempted ${attempted.toLocaleString()}  (acceptance ${(accepted/attempted*100).toFixed(1)}%)`);
console.log(`  rejected by threshold crossing: ${rejectedCross.toLocaleString()}  (${(rejectedCross/attempted*100).toFixed(1)}%)`);
console.log(`  rejected by PSV-vent:           ${rejectedVent.toLocaleString()}  (${(rejectedVent/attempted*100).toFixed(1)}%)`);
console.log(`  rejected (T < 100°F at hr 74):  ${rejectedColdAtObs.toLocaleString()}  (${(rejectedColdAtObs/attempted*100).toFixed(1)}%)`);
console.log(`Holds: ${holdsPct}%   Crosses: ${crossesPct}%`);
if (median != null){
  console.log(`Median crossing time: hr ${median.toFixed(1)} = ${result.median_crossing_label}`);
  console.log(`IQR: ${result.iqr_p25_label}  →  ${result.iqr_p75_label}`);
}
console.log(`\nWrote ${outPath}`);
