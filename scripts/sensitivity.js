#!/usr/bin/env node
// Sensitivity analysis for the Monte Carlo.  For each uncertain parameter,
// fix it at its low and high tail (mean ± 1.5σ for normals; 5th/95th for
// log-normals) and run a smaller MC.  The difference in crosses% tells you
// which input the answer is most sensitive to.
//
// Usage:  node scripts/sensitivity.js [N_PER_VARIANT]
// Output: writes assets/sensitivity.json

const fs = require('fs');
const path = require('path');

// ---------- shared model (kept in sync with montecarlo.js) ------------------
const R = 8.314;
const F2K = f => (f - 32) * 5/9 + 273.15;
const K2F = k => (k - 273.15) * 9/5 + 32;
const clamp01 = x => Math.min(1, Math.max(0, x));
function gel(X){ return X < 0.05 ? 1.0 : 1 + 18 * Math.pow(X, 2.2); }
const T0_CLOCK_HOUR = 15.667;
function solar(tH, amp){
  const hod = ((tH + T0_CLOCK_HOUR) % 24 + 24) % 24;
  return Math.max(0, Math.cos(((hod-15)/24)*2*Math.PI)) * amp;
}
function effectiveUA(UA_clean, X, p){
  if (!(p.fPlate > 0) || X < 1e-4) return UA_clean;
  const A_c = p.A_cool;
  const U_clean = UA_clean / A_c;
  const delta = p.fPlate * X * p.mMonomer / (p.rhoPmma * A_c);
  return (1 / (1/U_clean + delta / p.kPmma)) * A_c;
}
function step(s, p){
  const k = p.A * Math.exp(-p.Ea / (R * s.T));
  const dX = k * Math.max(0,1-s.X) * Math.max(0,1-s.I) * gel(s.X);
  const o2_collapse_rate = (s.X > 0.005) ? 5e-4 * s.I : 0;
  const dI = -p.cInh * k - o2_collapse_rate;
  const Qgen = p.mMonomer * (p.deltaH / 0.10012) * dX;
  const UA_e = effectiveUA(p.UA, s.X, p);
  const Qcool = UA_e * (s.T - p.Twater) - solar(s.t, p.solarAmp);
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
function trajectory(p, startH, endH, surviveH, runawayF){
  let s={t:startH,T:p.T0,X:0.02,I:p.I0??0.3};
  let crossed=null, peakF=K2F(s.T), t=startH;
  while (t < endH){
    const TF = K2F(s.T);
    if (TF > peakF) peakF = TF;
    if (crossed === null && TF >= runawayF) crossed = t;
    if (TF > 250) break;
    const dt = TF > 95 ? 5 : 60;
    const nxt = rk4(s, dt, p);
    t += dt/3600;
    s.t = t; s.T = nxt.T; s.X = nxt.X; s.I = nxt.I;
  }
  return { crossed, peakF, survivedToNow: !(crossed !== null && crossed < surviveH) };
}
function randn(){ let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function clamp(x,lo,hi){ return Math.min(hi,Math.max(lo,x)); }

// ---------- sample params (mirrors montecarlo.js, with overrides) -----------
function sampleParams(overrides){
  const p = {
    A:        3.0e10,
    Ea:       clamp(94000 + 5000 * randn(),  78000, 110000),
    deltaH:   57700,
    cInh:     2.0e-2,
    mMonomer: 23000,
    Cp:       1900,
    I0:       clamp(0.10 + 0.25 * Math.abs(randn()), 0.0, 0.95),
    UA:       Math.exp(Math.log(2000) + 0.45 * randn()),
    Twater:   F2K(75 + 4 * randn()),
    T0:       F2K(90 + 1.5 * randn()),
    solarAmp: clamp(250 + 120 * randn(), 0, 800),
    fPlate:   clamp(0.35 + 0.18 * randn(), 0.02, 0.75),
    A_cool:   clamp(40 + 8 * randn(), 25, 70),
    kPmma:    0.19,
    rhoPmma:  1180,
  };
  return Object.assign(p, overrides);
}
function sampleThresholdF(){ return clamp(100 + 4*randn(), 88, 114); }

// One MC pass: returns { holdsPct, crossesPct, medianCrossingHr }
function runMC(n, overrides){
  let accepted=0, attempted=0, holds=0;
  const xs = [];
  while (accepted < n){
    attempted++;
    if (attempted > n * 50) break; // safety
    const p = sampleParams(overrides);
    const thr = overrides.runawayF != null ? overrides.runawayF : sampleThresholdF();
    const out = trajectory(p, 30, 168, 54, thr);
    if (!out.survivedToNow) continue;
    accepted++;
    if (out.crossed === null) holds++;
    else xs.push(out.crossed);
  }
  xs.sort((a,b)=>a-b);
  return {
    accepted,
    attempted,
    holdsPct:   accepted ? +(holds/accepted*100).toFixed(2) : null,
    crossesPct: accepted ? +((accepted-holds)/accepted*100).toFixed(2) : null,
    medianHr:   xs.length ? +xs[Math.floor(xs.length/2)].toFixed(1) : null,
  };
}

// ---------- parameter perturbations ----------------------------------------
// For each, give a "low" and "high" override forcing the parameter to its tail.
const sweeps = [
  { name: 'fPlate (polymer fouling)',
    low:  { fPlate: 0.10 }, high: { fPlate: 0.60 } },
  { name: 'UA (cooling effectiveness)',
    low:  { UA: 1000 },     high: { UA: 3500 } },
  { name: 'Ea (activation energy)',
    low:  { Ea: 86000 },    high: { Ea: 104000 } },
  { name: 'I0 (initial inhibitor)',
    low:  { I0: 0.05 },     high: { I0: 0.60 } },
  { name: 'threshold T (runawayF)',
    low:  { runawayF: 95 }, high: { runawayF: 108 } },
  { name: 'T0 (anchor temp)',
    low:  { T0: F2K(88) },  high: { T0: F2K(92) } },
  { name: 'Twater (spray water)',
    low:  { Twater: F2K(68) }, high: { Twater: F2K(80) } },
  { name: 'A_cool (wetted area)',
    low:  { A_cool: 30 },   high: { A_cool: 55 } },
];

const N = parseInt(process.argv[2] || '1500', 10);
console.log(`Sensitivity sweep: ${N} accepted/variant, ${sweeps.length} parameters, baseline + 2 tails each.\n`);

const t0 = Date.now();
const baseline = runMC(N, {});
console.log(`baseline:               holds ${baseline.holdsPct}%   crosses ${baseline.crossesPct}%   median hr ${baseline.medianHr}`);

const results = [];
for (const s of sweeps){
  const lo = runMC(N, s.low);
  const hi = runMC(N, s.high);
  const sensitivity = Math.abs((hi.crossesPct ?? 0) - (lo.crossesPct ?? 0));
  results.push({
    parameter: s.name,
    low_value: JSON.stringify(s.low),
    high_value: JSON.stringify(s.high),
    low_crosses_pct: lo.crossesPct,
    high_crosses_pct: hi.crossesPct,
    low_median_hr: lo.medianHr,
    high_median_hr: hi.medianHr,
    delta_crosses_pct: +sensitivity.toFixed(2),
  });
  console.log(`${s.name.padEnd(28)} low ${String(lo.crossesPct).padStart(5)}%  high ${String(hi.crossesPct).padStart(5)}%   Δ=${sensitivity.toFixed(2)}%`);
}

// Sort by Δ descending — most-sensitive parameter on top
results.sort((a,b) => b.delta_crosses_pct - a.delta_crosses_pct);

const dur = (Date.now() - t0)/1000;
const out = {
  generated_at: new Date().toISOString(),
  n_per_variant: N,
  duration_sec: +dur.toFixed(1),
  baseline,
  results,
};
const outPath = path.join(__dirname, '..', 'assets', 'sensitivity.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nDone in ${dur.toFixed(1)}s.  Wrote ${outPath}.`);
console.log('Sorted by sensitivity:');
results.forEach((r,i)=>console.log(`  ${i+1}. ${r.parameter}  (Δ ${r.delta_crosses_pct}%)`));
