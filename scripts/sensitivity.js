#!/usr/bin/env node
// =============================================================================
// Sensitivity sweep — v4 (synced to montecarlo.js v4 physics, 2026-05-25)
// =============================================================================
//
// For each uncertain parameter, hold the others at the prior and pin this one
// to its low/high tail. Δ in weighted crosses-pct tells you how much each
// input drives the answer.
//
// Usage:  node scripts/sensitivity.js [N_PER_VARIANT]

const fs = require('fs');
const path = require('path');

// ---------- shared with montecarlo.js v4 ------------------------------------
const R = 8.314;
const F2K = f => (f - 32) * 5/9 + 273.15;
const K2F = k => (k - 273.15) * 9/5 + 32;
const clamp01 = x => Math.min(1, Math.max(0, x));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const T_BP_K = 374.15, ATM = 101325, DH_VAP_MMA = 360e3;
const PSV_GRACE_END = 12, CRACK_OBSERVED = 64, T_OBS_HOUR = 74, T_OBS_MIN_F = 95;
const T0_CLOCK_HOUR = 15.667;
const I_CRIT = 0.02;
const DELTA_MAX_M = 0.003;
const SIGMA_GAUGE_F = 5;

function gel(X){
  const Xstar = 0.20, w = 0.04, A_gel = 50;
  const Xf = 0.85, wf = 0.04;
  const turnOn = 1 / (1 + Math.exp(-(X - Xstar)/w));
  const vitrify = 1 / (1 + Math.exp((X - Xf)/wf));
  return 1 + A_gel * turnOn * vitrify;
}
function solar(tHours, amp){
  const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
  return Math.max(0, Math.cos(((hod - 15) / 24) * 2 * Math.PI)) * amp;
}
function pMmaPa(T_K){
  return 3866 * Math.exp(-36800/R * (1/T_K - 1/293.15));
}
const T0_VAP = 297;
const P_AIR_INIT = ATM - pMmaPa(T0_VAP);
function pTotalPa(T_K){ return P_AIR_INIT * T_K / T0_VAP + pMmaPa(T_K); }

function effectiveUA(UA_clean, X, p){
  if (!(p.fPlate > 0) || X < 1e-4) return UA_clean;
  const A_c = p.A_cool;
  const U_clean = UA_clean / A_c;
  const delta_raw = p.fPlate * X * p.mMonomer / (p.rhoPmma * A_c);
  const delta = Math.min(delta_raw, DELTA_MAX_M);
  return (1 / (1/U_clean + delta / p.kPmma)) * A_c;
}
function crackVentCooling(T_K, p, t){
  if (t < CRACK_OBSERVED) return 0;
  const A_crack = p.A_crack ?? 1e-4;
  const Cd = 0.7;
  const P0 = pTotalPa(T_K);
  if (P0 <= ATM) return 0;
  const rho = 0.10012 * P0 / (R * T_K);
  const dP = P0 - ATM;
  return Cd * A_crack * Math.sqrt(2 * rho * dP) * DH_VAP_MMA;
}
function evapCooling(T_bulk_K, p){
  if (!p.evapOn) return 0;
  const h_m = p.h_m ?? 0.015, A_c = p.A_cool, h_fg = 2.26e6, MW = 0.018;
  const RH = p.RH ?? 0.60;
  const T_air_K = p.Twater;
  const T_film = p.Twater + 0.5 * Math.max(0, T_bulk_K - p.Twater);
  const pSat = TK => 611 * Math.exp(17.27 * (TK - 273.15) / (TK - 273.15 + 237.3));
  const driving = Math.max(0, pSat(T_film) - RH * pSat(T_air_K));
  return h_m * A_c * (driving / (R * T_film)) * MW * h_fg;
}
function irCooling(T_K, p, tHours){
  const A_ext = 3.5 * p.A_cool;
  const eps = 0.85, sigma = 5.67e-8;
  const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
  const nightFrac = Math.max(0, -Math.cos(((hod - 15)/24)*2*Math.PI));
  const Tsky = p.Twater - 25 * nightFrac;
  const T_shell = p.Twater + 0.5*(T_K - p.Twater);
  return eps * sigma * A_ext * (Math.pow(T_shell, 4) - Math.pow(Tsky, 4));
}

function step(s, p){
  const k = p.A * Math.exp(-p.Ea / (R * s.T));
  const inhibFactor = 1 / (1 + Math.exp(-(I_CRIT - s.I)/0.005));
  const dX = k * Math.max(0, 1 - s.X) * inhibFactor * gel(s.X);
  const o2_collapse = (s.X > 1e-5) ? 1e-3 * s.I : 0;
  const dI = -p.cInh * k - o2_collapse;
  const Qgen    = p.mMonomer * (p.deltaH / 0.10012) * dX;
  const opsCool = (p.coverageFrac ?? 0.5) * (p.dutyCycle ?? 0.9);
  const UA_eff  = effectiveUA(p.UA, s.X, p) * opsCool;
  const Q_evap  = evapCooling(s.T, p) * opsCool;
  const Q_crack = crackVentCooling(s.T, p, s.t);
  const Q_ir    = irCooling(s.T, p, s.t);
  const withdrawn = K2F(s.T) > 150;
  const withdrawal_factor = withdrawn ? 0.1 : 1.0;
  const Qcool = (UA_eff * (s.T - p.Twater) + Q_evap + Q_crack) * withdrawal_factor
              + Q_ir - solar(s.t, p.solarAmp);
  return { dT:(Qgen-Qcool)/(p.mMonomer*p.Cp), dX, dI };
}
function rk4(s, dt, p){
  const k1=step(s,p);
  const s2={t:s.t+dt/2,T:s.T+k1.dT*dt/2,X:clamp01(s.X+k1.dX*dt/2),I:Math.max(0,s.I+k1.dI*dt/2)};
  const k2=step(s2,p);
  const s3={t:s.t+dt/2,T:s.T+k2.dT*dt/2,X:clamp01(s.X+k2.dX*dt/2),I:Math.max(0,s.I+k2.dI*dt/2)};
  const k3=step(s3,p);
  const s4={t:s.t+dt,T:s.T+k3.dT*dt,X:clamp01(s.X+k3.dX*dt),I:Math.max(0,s.I+k3.dI*dt)};
  const k4=step(s4,p);
  return {T:s.T+(k1.dT+2*k2.dT+2*k3.dT+k4.dT)*dt/6,
          X:clamp01(s.X+(k1.dX+2*k2.dX+2*k3.dX+k4.dX)*dt/6),
          I:Math.max(0,s.I+(k1.dI+2*k2.dI+2*k3.dI+k4.dI)*dt/6)};
}

function normalCdf(z){
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z*z/2);
  const p = d * t * (0.3193815 + t*(-0.3565638 + t*(1.781478 + t*(-1.821256 + t*1.330274))));
  return z > 0 ? 1 - p : p;
}
function gaugeLikelihood(peakF_by_obs){
  return normalCdf((peakF_by_obs - 100 + SIGMA_GAUGE_F) / SIGMA_GAUGE_F);
}

function trajectory(p, startH, endH, surviveH, bleveThresholdF, dTstratF){
  const effectiveThresholdF = bleveThresholdF - dTstratF;
  let s = { t: startH, T: p.T0, X: 0, I: p.I0 };
  let crossed=null, peakF=K2F(s.T), peakF_by_obs=K2F(s.T);
  let t=startH;
  while (t < endH){
    const TF = K2F(s.T);
    if (TF > peakF) peakF = TF;
    if (t <= T_OBS_HOUR && TF > peakF_by_obs) peakF_by_obs = TF;
    if (crossed === null && TF >= effectiveThresholdF) crossed = t;
    if (crossed !== null && crossed < surviveH) break;
    if (TF > 280) break;
    const dt = TF > 200 ? 5 : (TF > 130 ? 20 : 60);
    const nxt = rk4(s, dt, p);
    t += dt/3600;
    s.t = t; s.T = nxt.T; s.X = nxt.X; s.I = nxt.I;
  }
  const hardOK = !(crossed !== null && crossed < surviveH);
  const weight = hardOK ? gaugeLikelihood(peakF_by_obs) : 0;
  return { crossed, peakF, weight, hardOK };
}

function randn(){ let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

function sampleParams(overrides){
  const productGal = 5500 + 2000 * Math.random();
  const mMonomer = productGal * 0.94 * 3.785;
  const p = {
    A: 3.0e10,
    Ea: clamp(85000 + 7000 * randn(), 65000, 105000),
    deltaH: 57700,
    cInh: 2.0e-2,
    mMonomer, productGal,
    Cp: 1900,
    I0: clamp(0.10 + 0.12 * Math.abs(randn()), 0.0, 0.45),
    UA: Math.exp(Math.log(2000) + 0.45 * randn()),
    Twater: F2K(72 + 4 * randn()),
    T0: F2K(90 + 1.5 * randn()),
    solarAmp: clamp(8000 + 3000 * randn(), 0, 18000),
    fPlate: clamp(0.15 + 0.12 * randn(), 0.02, 0.50),
    A_cool: clamp(38 + 6 * randn(), 25, 55),
    kPmma: 0.19, rhoPmma: 1180,
    evapOn: true,
    h_m: Math.exp(Math.log(0.015) + 0.5 * randn()),
    RH: clamp(0.60 + 0.10 * randn(), 0.30, 0.85),
    A_crack: Math.exp(Math.log(1e-4) + 0.7 * randn()),
    coverageFrac: clamp(0.5 + 0.12 * randn(), 0.25, 0.80),
    dutyCycle: clamp(0.88 + 0.06 * randn(), 0.70, 0.98),
  };
  return Object.assign(p, overrides);
}
function sampleBleveThresholdF(){ return clamp(210 + 15 * randn(), 180, 250); }
function sampleStratificationF(){ return clamp(20 + 12 * randn(), 0, 50); }

// Weighted MC pass with parameter overrides
function runMC(nTarget, overrides){
  let attempted = 0, accepted = 0;
  let wHolds = 0, wCrosses = 0, sumW = 0, sumW2 = 0;
  const crossingTimes = [];
  while (accepted < nTarget){
    attempted++;
    if (attempted > nTarget * 20) break;     // safety
    const p = sampleParams(overrides);
    const bleve = overrides.runawayF != null ? overrides.runawayF : sampleBleveThresholdF();
    const dTstrat = overrides.dTstrat != null ? overrides.dTstrat : sampleStratificationF();
    const out = trajectory(p, 30, 192, 75, bleve, dTstrat);
    if (!out.hardOK) continue;
    accepted++;
    sumW += out.weight;
    sumW2 += out.weight * out.weight;
    if (out.crossed === null) wHolds += out.weight;
    else { wCrosses += out.weight; crossingTimes.push({t:out.crossed, w:out.weight}); }
  }
  const W = sumW;
  const ESS = W > 0 ? (W*W) / sumW2 : 0;
  crossingTimes.sort((a,b) => a.t - b.t);
  // Weighted median
  let cum = 0;
  let median = null;
  const wTot = crossingTimes.reduce((s,x) => s + x.w, 0);
  for (const x of crossingTimes){ cum += x.w; if (cum/wTot >= 0.5){ median = x.t; break; } }
  return {
    accepted, attempted,
    acceptance: +(accepted/attempted*100).toFixed(1),
    holdsPct:   W > 0 ? +(wHolds/W*100).toFixed(2) : null,
    crossesPct: W > 0 ? +(wCrosses/W*100).toFixed(2) : null,
    ESS: +ESS.toFixed(0),
    medianHr: median != null ? +median.toFixed(1) : null,
  };
}

// ---------- sweeps ----------------------------------------------------------
const sweeps = [
  { name: 'fPlate (polymer fouling)',
    low: { fPlate: 0.05 },  high: { fPlate: 0.40 } },
  { name: 'UA (cooling effectiveness)',
    low: { UA: 1000 },      high: { UA: 3500 } },
  { name: 'Ea (activation energy)',
    low: { Ea: 75000 },     high: { Ea: 100000 } },
  { name: 'I0 (initial inhibitor)',
    low: { I0: 0.02 },      high: { I0: 0.35 } },
  { name: 'BLEVE threshold T',
    low: { runawayF: 185 }, high: { runawayF: 235 } },
  { name: 'Stratification ΔT',
    low: { dTstrat: 5 },    high: { dTstrat: 45 } },
  { name: 'T0 (anchor temp)',
    low: { T0: F2K(88) },   high: { T0: F2K(92) } },
  { name: 'Twater (spray water)',
    low: { Twater: F2K(65) }, high: { Twater: F2K(80) } },
  { name: 'A_cool (wetted area)',
    low: { A_cool: 28 },    high: { A_cool: 52 } },
  { name: 'h_m (evap mass-transfer)',
    low: { h_m: 0.005 },    high: { h_m: 0.035 } },
  { name: 'RH (ambient humidity)',
    low: { RH: 0.35 },      high: { RH: 0.80 } },
  { name: 'A_crack (crack vent area)',
    low: { A_crack: 3e-5 }, high: { A_crack: 3e-4 } },
  { name: 'coverageFrac (deluge wetted fraction)',
    low: { coverageFrac: 0.30 }, high: { coverageFrac: 0.75 } },
  { name: 'dutyCycle (deluge uptime)',
    low: { dutyCycle: 0.70 }, high: { dutyCycle: 0.98 } },
];

const N = parseInt(process.argv[2] || '1000', 10);
console.log(`Sensitivity sweep v4 — ${N} accepted per variant, ${sweeps.length} parameters.\n`);

const t0 = Date.now();
const baseline = runMC(N, {});
console.log(`baseline:  acc ${baseline.acceptance}%  holds ${baseline.holdsPct}%  crosses ${baseline.crossesPct}%  ESS ${baseline.ESS}`);
console.log('');

const results = [];
for (const s of sweeps){
  const lo = runMC(N, s.low);
  const hi = runMC(N, s.high);
  const delta = Math.abs((hi.crossesPct ?? 0) - (lo.crossesPct ?? 0));
  results.push({
    parameter: s.name,
    low_value: JSON.stringify(s.low),
    high_value: JSON.stringify(s.high),
    low_crosses_pct: lo.crossesPct,
    high_crosses_pct: hi.crossesPct,
    delta_crosses_pct: +delta.toFixed(2),
  });
  console.log(`${s.name.padEnd(40)} low ${String(lo.crossesPct).padStart(6)}%  high ${String(hi.crossesPct).padStart(6)}%   Δ=${delta.toFixed(2)}%`);
}

results.sort((a,b) => b.delta_crosses_pct - a.delta_crosses_pct);
const dur = (Date.now() - t0)/1000;
const out = {
  generated_at: new Date().toISOString(),
  model_version: 'v4 — synced to montecarlo.js, 2026-05-25',
  n_per_variant: N,
  duration_sec: +dur.toFixed(1),
  baseline,
  results,
};
fs.writeFileSync(path.join(__dirname,'..','assets','sensitivity.json'), JSON.stringify(out,null,2));
console.log(`\nDone in ${dur.toFixed(1)}s.\nSorted by sensitivity:`);
results.forEach((r,i)=>console.log(`  ${i+1}. ${r.parameter}  (Δ ${r.delta_crosses_pct}%)`));
