// Lumped-parameter thermal-runaway simulator for the Garden Grove MMA tank.
// Three coupled ODEs:
//   k(T)   = A * exp(-Ea/RT)               (Arrhenius)
//   dX/dt  = k * (1-X) * (1-I) * g(X)      (with Trommsdorff gel-effect amplifier)
//   dI/dt  = -c * k                        (MEHQ burns down)
//   dT/dt  = (Q_gen - Q_cool) / (m*Cp)     (energy balance)
//
// Solved with RK4 at 30 s steps.

(function(){
  const R = 8.314;                 // J / (mol K)
  const F2K = f => (f - 32) * 5/9 + 273.15;
  const K2F = k => (k - 273.15) * 9/5 + 32;

  // Defaults — chosen so the baseline reproduces ~1 °F/hr early-phase rise
  // and tips through the ~100 °F (310.93 K) field-reported threshold under
  // the "cooling lost" preset.
  const defaults = {
    A:        1.2e10,    // 1/s         pre-exponential
    Ea:       95000,     // J/mol       activation energy (representative MMA bulk)
    deltaH:   57700,     // J/mol       heat of polymerization
    inhibitorMol: 0.4,   // mol         total MEHQ-equivalent (small relative to monomer)
    cInh:     2.0e-2,    // mol-MEHQ / (1/s reaction rate) consumption coupling
    mMonomer: 23000,     // kg          ~6,500 gal × 0.94 kg/L × 3.785
    Cp:       1900,      // J/(kg K)    MMA liquid
    UA:       2200,      // W/K         effective cooling capacity (deluge)
    Twater:   297,       // K           ~75 °F
    T0:       305.4,     // K           ~90 °F starting interior temp
    solarAmp: 250,       // W/K-equivalent extra heat-in at daily peak (very small modulation)
    burstF:   140,       // °F          notional shell-burst proxy
    runawayF: 100,       // °F          field "out of control" line
  };

  // Trommsdorff gel-effect autoacceleration amplifier.
  // Slow until conversion ~0.3, then grows sharply.
  function gel(X){
    if (X < 0.05) return 1.0;
    return 1 + 18 * Math.pow(X, 2.2);
  }

  // Diurnal solar modulation. tHours since incident start (Hr 0 = Thu 3:40 pm PDT).
  // Solar peak ~ 3 pm local, so cos peak at hour-of-day = 15.
  function solar(tHours, amp){
    const hod = ((tHours % 24) + 24) % 24;
    const phase = Math.cos(((hod - 15) / 24) * 2 * Math.PI);
    return Math.max(0, phase) * amp;
  }

  function step(state, dt, p){
    const {T, X, I} = state;
    const k = p.A * Math.exp(-p.Ea / (R * T));
    const g = gel(X);
    const dX = k * Math.max(0, 1 - X) * Math.max(0, 1 - I) * g;
    const dI = -p.cInh * k;
    const Qgen = p.mMonomer * (p.deltaH / 100.12) * dX;            // W (per kg-monomer × dX/dt × ΔH per kg)
    const Qcool = p.UA * (T - p.Twater) - solar(state.t, p.solarAmp);
    const dT = (Qgen - Qcool) / (p.mMonomer * p.Cp);
    return {dT, dX, dI};
  }

  function rk4(state, dt, p){
    const k1 = step(state, dt, p);
    const s2 = {t:state.t+dt/2, T:state.T+k1.dT*dt/2, X:state.X+k1.dX*dt/2, I:Math.max(0,state.I+k1.dI*dt/2)};
    const k2 = step(s2, dt, p);
    const s3 = {t:state.t+dt/2, T:state.T+k2.dT*dt/2, X:state.X+k2.dX*dt/2, I:Math.max(0,state.I+k2.dI*dt/2)};
    const k3 = step(s3, dt, p);
    const s4 = {t:state.t+dt,   T:state.T+k3.dT*dt,   X:state.X+k3.dX*dt,   I:Math.max(0,state.I+k3.dI*dt)};
    const k4 = step(s4, dt, p);
    return {
      T: state.T + (k1.dT + 2*k2.dT + 2*k3.dT + k4.dT) * dt / 6,
      X: state.X + (k1.dX + 2*k2.dX + 2*k3.dX + k4.dX) * dt / 6,
      I: Math.max(0, state.I + (k1.dI + 2*k2.dI + 2*k3.dI + k4.dI) * dt / 6),
    };
  }

  // Run from "now" (hour offset) for `hours` hours.
  function simulate(params, hoursForward, startHour){
    const p = Object.assign({}, defaults, params);
    const dt = 30; // seconds
    const totalSteps = Math.round(hoursForward * 3600 / dt);
    const sample = Math.max(1, Math.round(totalSteps / 400));
    const out = {t:[], TF:[], Qgen:[], Qcool:[], X:[], crossed:null, runaway:false};
    let state = {t: startHour, T: p.T0, X: 0.0, I: 1.0};

    for (let i = 0; i <= totalSteps; i++){
      if (i % sample === 0){
        const k = p.A * Math.exp(-p.Ea / (R * state.T));
        const dX = k * Math.max(0,1-state.X) * Math.max(0,1-state.I) * gel(state.X);
        const Qgen = p.mMonomer * (p.deltaH / 100.12) * dX;
        const Qcool = p.UA * (state.T - p.Twater);
        out.t.push(state.t);
        out.TF.push(K2F(state.T));
        out.Qgen.push(Qgen);
        out.Qcool.push(Qcool);
        out.X.push(state.X);
        if (out.crossed === null && K2F(state.T) >= p.runawayF){
          out.crossed = state.t;
        }
        if (K2F(state.T) >= p.burstF){ out.runaway = true; break; }
      }
      const next = rk4(state, dt, p);
      state.t += dt/3600;
      state.T = next.T; state.X = next.X; state.I = next.I;
    }
    return out;
  }

  window.GG_SIM = { simulate, defaults, K2F, F2K };
})();
