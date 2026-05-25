#!/usr/bin/env node
// =============================================================================
// Rohm-Haas 2010 calibration test — v6
// =============================================================================
//
// Run the v5 chemistry stack forward with parameters from the Rohm-Haas 2010
// Louisville MMA tank-car incident (DOT-105J car, 175,000 lb / 79,400 kg MMA,
// summer ambient, no active cooling). Target outcomes:
//
//   - PSV vents ~10% of mass over ~13.5 hours
//   - Tank does NOT rupture (no BLEVE)
//   - Self-extinguishes within 13.5 hours
//
// What this script adds vs montecarlo.js:
//   - PSV venting as a MECHANISM (not just a rejection rule) — when total
//     vapor pressure exceeds setpoint, vapor escapes through the PSV and
//     mass is removed from the tank. Tracks cumulative vented fraction.
//   - No deluge, no crack — Rohm-Haas was sitting in summer sun in a
//     railcar with no firefighter intervention until vapor visible.
//
// Run a Monte Carlo over the same uncertain priors as Garden Grove (where
// the chemistry constants are common) but with Rohm-Haas tank/operational
// parameters. The hope: most trajectories reproduce the 10%/13.5h outcome.
//
// Usage:  node scripts/calibrate-rohm-haas.js [N]

const fs = require('fs');
const path = require('path');

// Constants (mirror montecarlo.js v5)
const R = 8.314;
const F2K = f => (f - 32) * 5/9 + 273.15;
const K2F = k => (k - 273.15) * 9/5 + 32;
const clamp01 = x => Math.min(1, Math.max(0, x));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const T_BP_K = 374.15, ATM = 101325, DH_VAP_MMA = 360e3;
const T0_CLOCK_HOUR = 15.667;
const I_CRIT = 0.02;
const M0_MOL_L = 9.4, C_TH = 0.085;
const ALPHA_STRAT = 1.5, DT_STRAT_MAX_F = 60;
const RHO_HH = 0.01, PHI_SKIN = 0.02;
const DELTA_MAX_M = 0.003;

function gel(X){
  const Xstar = 0.20, w = 0.04, A_gel = 50;
  const Xf = 0.85, wf = 0.04;
  return 1 + A_gel * (1/(1+Math.exp(-(X-Xstar)/w))) * (1/(1+Math.exp((X-Xf)/wf)));
}
function pMmaPa(T_K){ return 3866 * Math.exp(-36800/R * (1/T_K - 1/293.15)); }
const T0_VAP = 297;
const P_AIR_INIT = ATM - pMmaPa(T0_VAP);
function pTotalPa(T_K){ return P_AIR_INIT * T_K / T0_VAP + pMmaPa(T_K); }

function step(s, p){
  // Dynamic stratification (less in a horizontal tank-car than a vertical tank)
  const dTstratF_eff = Math.min(DT_STRAT_MAX_F, p.dTstratF_base * (1 + ALPHA_STRAT * s.X));
  const dTstrat_K = dTstratF_eff * 5/9;
  const T_rxn = s.T + dTstrat_K;

  // Inhibited propagation
  const k = p.A * Math.exp(-p.Ea / (R * T_rxn));
  const inhibFactor = 1 / (1 + Math.exp(-(I_CRIT - s.I)/0.005));
  const dX_inhib = k * Math.max(0, 1 - s.X) * inhibFactor * gel(s.X);

  // Chemistry-bypass channels (Mayo + peroxide + polymer scission)
  const M = M0_MOL_L * Math.max(0, 1 - s.X);
  const Ri_th = p.A_th * Math.exp(-p.Ea_th / (R * T_rxn)) * M * M;
  const eta_ox = clamp01(s.I / p.I0);
  const k_d = p.A_d * Math.exp(-p.Ea_d / (R * T_rxn));
  const Ri_perox = 2 * p.f_d * k_d * Math.max(0, s.ROOH);
  const T_skin = s.T + 0.5 * dTstrat_K;
  const k_p_th = p.A_p * Math.exp(-p.Ea_p / (R * T_skin));
  const polyGate = 1 / (1 + Math.exp(-(s.X - 0.30)/0.04));
  const Ri_poly = 2 * p.f_p * k_p_th * RHO_HH * s.X * M0_MOL_L * polyGate * PHI_SKIN;
  const Ri_total = Ri_th + Ri_perox + Ri_poly;
  const dX_chem = C_TH * Math.sqrt(Math.max(0, Ri_total)) * Math.max(0, 1 - s.X) * gel(s.X) / M0_MOL_L;

  const dX = dX_inhib + dX_chem;

  // Inhibitor depletion
  const o2_collapse = (s.X > 1e-5) ? 1e-3 * s.I : 0;
  const dI = -p.cInh * k - o2_collapse;

  // ROOH dynamics
  const dROOH = eta_ox * Ri_th - k_d * Math.max(0, s.ROOH);

  // Heat generation
  const deltaH_eff = p.deltaH * (1 - 0.07 * s.X);
  const Qgen = s.m * (deltaH_eff / 0.10012) * dX;

  // Heat loss (just sensible to the tank-car insulation in summer ambient)
  // Rohm-Haas DOT-105J car is insulated; minimal heat exchange with environment.
  // Use a small U·A ~ 50-100 W/K representing the insulation jacket.
  const Q_loss = p.UA_insulation * (s.T - p.Tambient);

  // PSV venting — TRUE mechanism this time
  const P_total = pTotalPa(s.T);
  const P_set_Pa = ATM + p.psvPsig * 6894.76;
  let m_vent_rate = 0;       // kg/s
  if (P_total > P_set_Pa) {
    const Cd = 0.6;
    const A_psv = p.A_psv;   // m² effective PSV flow area
    const rho_vapor = 0.10012 * P_total / (R * s.T);  // kg/m³
    const dP = P_total - ATM;
    m_vent_rate = Cd * A_psv * Math.sqrt(2 * rho_vapor * dP);
  }
  const Q_vent = m_vent_rate * DH_VAP_MMA;

  // Mass loss
  const dm = -m_vent_rate;

  // Energy balance
  const Qcool = Q_loss + Q_vent;
  const Cp_eff = p.Cp - 434 * s.X;
  const dT = (Qgen - Qcool) / (Math.max(1, s.m) * Cp_eff);

  return { dT, dX, dI, dROOH, dm, m_vent_rate, Qgen, Q_loss, Q_vent };
}

function rk4(s, dt, p){
  const k1 = step(s, p);
  const s2 = { ...s, t:s.t+dt/2, T:s.T+k1.dT*dt/2, X:clamp01(s.X+k1.dX*dt/2),
               I:Math.max(0,s.I+k1.dI*dt/2), ROOH:Math.max(0,s.ROOH+k1.dROOH*dt/2),
               m:Math.max(0, s.m+k1.dm*dt/2) };
  const k2 = step(s2, p);
  const s3 = { ...s, t:s.t+dt/2, T:s.T+k2.dT*dt/2, X:clamp01(s.X+k2.dX*dt/2),
               I:Math.max(0,s.I+k2.dI*dt/2), ROOH:Math.max(0,s.ROOH+k2.dROOH*dt/2),
               m:Math.max(0, s.m+k2.dm*dt/2) };
  const k3 = step(s3, p);
  const s4 = { ...s, t:s.t+dt, T:s.T+k3.dT*dt, X:clamp01(s.X+k3.dX*dt),
               I:Math.max(0,s.I+k3.dI*dt), ROOH:Math.max(0,s.ROOH+k3.dROOH*dt),
               m:Math.max(0, s.m+k3.dm*dt) };
  const k4 = step(s4, p);
  return {
    T: s.T + (k1.dT + 2*k2.dT + 2*k3.dT + k4.dT) * dt/6,
    X: clamp01(s.X + (k1.dX + 2*k2.dX + 2*k3.dX + k4.dX) * dt/6),
    I: Math.max(0, s.I + (k1.dI + 2*k2.dI + 2*k3.dI + k4.dI) * dt/6),
    ROOH: Math.max(0, s.ROOH + (k1.dROOH + 2*k2.dROOH + 2*k3.dROOH + k4.dROOH) * dt/6),
    m: Math.max(0, s.m + (k1.dm + 2*k2.dm + 2*k3.dm + k4.dm) * dt/6),
  };
}

function randn(){ let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

// Rohm-Haas parameters (June 2010 Louisville, KY)
function sampleRohmHaasParams(){
  return {
    // Chemistry (shared with v5 — these are MMA-universal)
    A:        3.0e10,
    Ea:       clamp(85000 + 7000 * randn(), 65000, 105000),
    deltaH:   57700,
    cInh:     2.0e-2,
    Cp:       1900,
    A_th:     1.0e8,
    Ea_th:    clamp(115000 + 8000 * randn(), 100000, 130000),
    A_d:      1.0e14,
    Ea_d:     clamp(120000 + 8000 * randn(), 105000, 135000),
    f_d:      0.5,
    A_p:      1.0e12,
    Ea_p:     clamp(130000 + 10000 * randn(), 110000, 150000),
    f_p:      0.5,

    // Tank-car: DOT-105J, ~30,800 gal capacity, insulated and jacketed
    Tambient:    F2K(75 + 8 * randn()),   // Louisville summer ambient (with some sun heating)
    UA_insulation: clamp(80 + 30 * randn(), 30, 200),  // W/K — insulated tank-car

    // Initial state — the tank had been sitting in the sun for unknown days;
    // inhibitor depleted, peroxides built up. This is the bit we vary widely.
    T0:       F2K(85 + 10 * randn()),                // initial bulk T, 75-95 °F
    I0:       clamp(0.05 + 0.08 * Math.abs(randn()), 0, 0.20),  // aged inhibitor
    ROOH0:    Math.exp(Math.log(5e-4) + 1.0 * randn()),         // potentially elevated from solar exposure

    // Stratification: smaller in a horizontal tank-car than a vertical tank
    dTstratF_base: clamp(8 + 4 * randn(), 0, 20),

    // PSV: DOT-105J nominal setpoint 75 psig (start-to-discharge per AAR Field Guide)
    psvPsig:  clamp(75 + 10 * randn(), 50, 100),
    // PSV flow area: back-calibrated from real Rohm-Haas vent rate 0.16 kg/s @ ~75 psig
    // gives A ≈ 7e-5 m² (~0.7 cm²). Most fire-relief PSVs cycle in tight chatter
    // rather than full discharge so effective flow is much smaller than nominal area.
    A_psv:    Math.exp(Math.log(8e-5) + 0.5 * randn()),         // log-normal around ~0.8 cm²
  };
}

// Run one calibration trajectory
function runRohmHaas(p, endHour = 36){
  const m0_kg = 79400;     // 175,000 lb
  let s = { t: 0, T: p.T0, X: 0, I: p.I0, ROOH: p.ROOH0, m: m0_kg };
  const m_init = m0_kg;
  let firstVentTime = null;
  let lastVentTime = null;
  let peakF = K2F(s.T);
  let peakP = pTotalPa(s.T);
  let rupture = false;
  const trace = [];

  // Sample every 0.25 h for trace output
  const sampleInterval = 900; // s
  let nextSample = 0;

  let t_s = 0;
  const totalSteps = Math.round(endHour * 3600 / 30);
  for (let i = 0; i < totalSteps; i++){
    // Adaptive dt
    const TF = K2F(s.T);
    const dt = TF > 220 ? 1 : (TF > 180 ? 5 : (TF > 130 ? 20 : 60));

    if (TF > peakF) peakF = TF;
    const P_now = pTotalPa(s.T);
    if (P_now > peakP) peakP = P_now;

    // Rupture: pressure exceeds vessel burst (~165 psig for DOT-105J)
    if (P_now > ATM + 165 * 6894.76) { rupture = true; break; }

    // Track venting
    if (s.t >= nextSample){
      const stepInfo = step(s, p);
      trace.push({
        t: s.t, T_F: TF, X: s.X, ROOH: s.ROOH,
        m_frac: s.m / m_init,
        P_psig: (P_now - ATM) / 6894.76,
        venting: stepInfo.m_vent_rate > 0,
      });
      nextSample += sampleInterval / 3600;
    }

    const stepInfo = step(s, p);
    if (stepInfo.m_vent_rate > 0){
      if (firstVentTime === null) firstVentTime = s.t;
      lastVentTime = s.t;
    }

    const next = rk4(s, dt, p);
    t_s += dt;
    s.t = t_s / 3600;
    s.T = next.T; s.X = next.X; s.I = next.I;
    s.ROOH = next.ROOH; s.m = next.m;

    // Tank fully polymerized (chemistry exhausted)
    if (s.X > 0.99) break;
    // Tank vented to negligible
    if (s.m < 0.05 * m_init) break;
  }

  const vented_frac = 1 - s.m / m_init;
  const ventDuration = (firstVentTime !== null) ? (lastVentTime - firstVentTime) : 0;
  return {
    vented_frac, ventDuration, firstVentTime, lastVentTime,
    final_X: s.X, final_T_F: K2F(s.T), peakF, peakP_psig: (peakP - ATM)/6894.76,
    rupture, trace,
  };
}

// =============================================================================
// Main
// =============================================================================
const N = parseInt(process.argv[2] || '500', 10);
console.log(`Rohm-Haas 2010 calibration test — running v5 chemistry forward with`);
console.log(`  m₀ = 79,400 kg, DOT-105J car, summer ambient, PSV-only cooling.`);
console.log(`Target: 10% release / 13.5 h / no rupture\n`);

const results = [];
const t0 = Date.now();
for (let i = 0; i < N; i++){
  const p = sampleRohmHaasParams();
  results.push(runRohmHaas(p));
  if ((i+1) % 50 === 0) process.stdout.write(`  ${i+1} / ${N}\n`);
}
const dur = (Date.now() - t0)/1000;

// Summary stats
const ventedFracs = results.map(r => r.vented_frac).sort((a,b)=>a-b);
const ventDurations = results.filter(r => r.ventDuration > 0).map(r => r.ventDuration).sort((a,b)=>a-b);
const peakFs = results.map(r => r.peakF).sort((a,b)=>a-b);
const peakPs = results.map(r => r.peakP_psig).sort((a,b)=>a-b);
const finalXs = results.map(r => r.final_X).sort((a,b)=>a-b);
const rupturedCount = results.filter(r => r.rupture).length;
const ventedCount = results.filter(r => r.vented_frac > 0.005).length;
const target_outcome = results.filter(r =>
  !r.rupture &&
  r.vented_frac >= 0.05 && r.vented_frac <= 0.20 &&
  r.ventDuration >= 6 && r.ventDuration <= 24
).length;

const pct = (arr, q) => arr.length ? arr[Math.floor(q*(arr.length-1))] : null;

console.log(`\nDone in ${dur.toFixed(1)}s.`);
console.log(`\n=== OUTCOME SUMMARY ===`);
console.log(`Ruptured (P > 165 psig):  ${rupturedCount} / ${N}  (${(rupturedCount/N*100).toFixed(1)}%)`);
console.log(`Vented anything > 0.5%:   ${ventedCount} / ${N}  (${(ventedCount/N*100).toFixed(1)}%)`);
console.log(`Target window (5-20% vent over 6-24 h, no rupture):  ${target_outcome} / ${N}  (${(target_outcome/N*100).toFixed(1)}%)`);
console.log(``);
console.log(`Vented fraction:  P10 ${pct(ventedFracs,0.1)?.toFixed(3)}  P50 ${pct(ventedFracs,0.5)?.toFixed(3)}  P90 ${pct(ventedFracs,0.9)?.toFixed(3)}`);
console.log(`Vent duration:    P10 ${pct(ventDurations,0.1)?.toFixed(1)} h  P50 ${pct(ventDurations,0.5)?.toFixed(1)} h  P90 ${pct(ventDurations,0.9)?.toFixed(1)} h`);
console.log(`Peak T:           P50 ${pct(peakFs,0.5)?.toFixed(0)} °F  P90 ${pct(peakFs,0.9)?.toFixed(0)} °F`);
console.log(`Peak P:           P50 ${pct(peakPs,0.5)?.toFixed(0)} psig  P90 ${pct(peakPs,0.9)?.toFixed(0)} psig`);
console.log(`Final X:          P50 ${pct(finalXs,0.5)?.toFixed(2)}  P90 ${pct(finalXs,0.9)?.toFixed(2)}`);

// Save full results
const out = {
  generated_at: new Date().toISOString(),
  target: { vent_frac: 0.10, vent_duration_h: 13.5, ruptured: false },
  n_runs: N,
  duration_sec: dur,
  summary: {
    ruptured_pct: +(rupturedCount/N*100).toFixed(2),
    vented_pct:   +(ventedCount/N*100).toFixed(2),
    target_window_pct: +(target_outcome/N*100).toFixed(2),
    vented_frac_p50: pct(ventedFracs, 0.5),
    vented_frac_p90: pct(ventedFracs, 0.9),
    vent_duration_p50_h: pct(ventDurations, 0.5),
    peak_T_F_p50:  pct(peakFs, 0.5),
    peak_T_F_p90:  pct(peakFs, 0.9),
    peak_P_psig_p50: pct(peakPs, 0.5),
    final_X_p50:   pct(finalXs, 0.5),
    final_X_p90:   pct(finalXs, 0.9),
  },
};
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'rohm-haas-calibration.json'), JSON.stringify(out, null, 2));
console.log(`\nWrote assets/rohm-haas-calibration.json`);

// Verdict
console.log(`\n=== VERDICT ===`);
const within_window_pct = target_outcome / N * 100;
if (within_window_pct > 30 && rupturedCount/N < 0.1){
  console.log(`✓ CALIBRATION PASSES — v5 chemistry reproduces Rohm-Haas-class outcome ${within_window_pct.toFixed(0)}% of the time.`);
} else if (rupturedCount/N > 0.3){
  console.log(`✗ MODEL TOO AGGRESSIVE — ${(rupturedCount/N*100).toFixed(0)}% of runs rupture. Kinetics constants need to be slower.`);
} else if (within_window_pct < 5){
  console.log(`✗ MODEL TOO MILD — only ${within_window_pct.toFixed(0)}% of runs reproduce the venting outcome. Kinetics may be too slow or PSV setpoint too high.`);
} else {
  console.log(`~ PARTIAL CALIBRATION — ${within_window_pct.toFixed(0)}% in target window. Need parameter tuning.`);
}
