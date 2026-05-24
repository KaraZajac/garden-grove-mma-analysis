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

  // Defaults — calibrated so the baseline (with polymer-skin fouling enabled)
  // reproduces ~1 °F/hr early-phase rise and tips into runaway under the
  // "cooling lost" preset within the observable horizon.
  const defaults = {
    A:        3.0e10,    // 1/s         pre-exponential
    Ea:       95000,     // J/mol       activation energy
    deltaH:   57700,     // J/mol       heat of polymerization
    cInh:     2.0e-2,    // inhibitor consumption coupling
    mMonomer: 23000,     // kg
    Cp:       1900,      // J/(kg K)
    UA:       2200,      // W/K         CLEAN cooling capacity (no fouling)
    Twater:   297,       // K           ~75 °F
    T0:       305.4,     // K           ~90 °F
    solarAmp: 250,
    burstF:   140,
    runawayF: 100,
    // Polymer-skin fouling on the cooling-water side:
    //   PMMA k = 0.19 W/(m·K) — a bad thermal conductor.
    //   Layer thickness δ(X) grows linearly with conversion; a fouling
    //   resistance R = δ/k is added in series with the clean film coefficient.
    fPlate:   0.40,      // fraction of polymer that plates onto walls
    A_cool:   40,        // m²    wetted shell area
    kPmma:    0.19,      // W/(m·K) PMMA thermal conductivity
    rhoPmma:  1180,      // kg/m³
    // Evaporative cooling from the deluge film (latent heat). Big effect.
    evapOn:   true,
    h_m:      0.02,      // m/s   mass-transfer coefficient (moderate wind)
    RH:       0.60,      // ambient relative humidity
  };

  // U_eff(X) = 1 / (1/U_clean + δ(X) / k_pmma)
  // where δ(X) = f_plate · X · m_monomer / (ρ_pmma · A_cool)
  function effectiveUA(UA_clean, X, p){
    if (!(p.fPlate > 0) || X < 1e-4) return UA_clean;
    const A_c = p.A_cool;
    const U_clean = UA_clean / A_c;
    const delta = p.fPlate * X * p.mMonomer / (p.rhoPmma * A_c);
    const R_foul = delta / p.kPmma;
    const U_eff = 1 / (1/U_clean + R_foul);
    return U_eff * A_c;
  }

  // Evaporative cooling from the deluge film on the outside of the shell.
  // Water film temperature ≈ T_water + ½·max(0, T_bulk − T_water).
  // Magnus formula for water saturation pressure. Driving force = P_sat(film) − RH·P_sat(air).
  function evapCooling(T_bulk_K, p){
    if (!p.evapOn) return 0;
    const h_m  = p.h_m ?? 0.02;            // mass-transfer coefficient (m/s, wind 1–4 m/s)
    const A_c  = p.A_cool;
    const h_fg = 2.26e6;                    // J/kg, water
    const MW   = 0.018;                     // kg/mol, water
    const RH   = p.RH ?? 0.60;
    const T_air_K = p.Twater;               // assume air T ≈ deluge water T
    const T_film  = p.Twater + 0.5 * Math.max(0, T_bulk_K - p.Twater);
    const pSat = TK => 611 * Math.exp(17.27 * (TK - 273.15) / (TK - 273.15 + 237.3));
    const driving = Math.max(0, pSat(T_film) - RH * pSat(T_air_K));      // Pa
    const dC = driving / (R * T_film);                                    // mol/m³
    return h_m * A_c * dC * MW * h_fg;                                    // W
  }

  // Trommsdorff gel-effect autoacceleration amplifier.
  // Slow until conversion ~0.3, then grows sharply.
  function gel(X){
    if (X < 0.05) return 1.0;
    return 1 + 18 * Math.pow(X, 2.2);
  }

  // Diurnal solar modulation. tHours since incident start (Hr 0 = Thu 3:40 pm PDT).
  // Solar peak ~ 3 pm local, so cos peak at hour-of-day = 15.
  // Hour 0 of the integration = Thu 5/21 3:40 pm PDT (clock-hour 15.667).
  // Convert integration time → local clock-hour-of-day before phase calc.
  const T0_CLOCK_HOUR = 15.667;
  function solar(tHours, amp){
    const hod = ((tHours + T0_CLOCK_HOUR) % 24 + 24) % 24;
    const phase = Math.cos(((hod - 15) / 24) * 2 * Math.PI);
    return Math.max(0, phase) * amp;
  }

  function step(state, dt, p){
    const {T, X, I} = state;
    const k = p.A * Math.exp(-p.Ea / (R * T));
    const g = gel(X);
    const dX = k * Math.max(0, 1 - X) * Math.max(0, 1 - I) * g;
    // MEHQ requires dissolved O2 to function (see sources/reference/mehq-inhibitor.md).
    // Once polymerization consumes the available O2 (X > ~0.005), the inhibitor
    // collapses on a much shorter timescale — minutes-to-hours, not the
    // 2,500-hour timescale of cInh·k alone. Model that cliff explicitly.
    const o2_collapse_rate = (X > 0.005) ? 5e-4 * I : 0;
    const dI = -p.cInh * k - o2_collapse_rate;
    // Qgen = m_kg × (ΔH_J/mol / MW_kg/mol) × dX/dt   →   W
    const Qgen   = p.mMonomer * (p.deltaH / 0.10012) * dX;
    const UA_eff = effectiveUA(p.UA, X, p);
    const Q_evap = evapCooling(T, p);
    const Qcool  = UA_eff * (T - p.Twater) + Q_evap - solar(state.t, p.solarAmp);
    const dT = (Qgen - Qcool) / (p.mMonomer * p.Cp);
    return {dT, dX, dI};
  }

  const clamp01 = x => Math.min(1, Math.max(0, x));
  function rk4(state, dt, p){
    const k1 = step(state, dt, p);
    const s2 = {t:state.t+dt/2, T:state.T+k1.dT*dt/2, X:clamp01(state.X+k1.dX*dt/2), I:Math.max(0,state.I+k1.dI*dt/2)};
    const k2 = step(s2, dt, p);
    const s3 = {t:state.t+dt/2, T:state.T+k2.dT*dt/2, X:clamp01(state.X+k2.dX*dt/2), I:Math.max(0,state.I+k2.dI*dt/2)};
    const k3 = step(s3, dt, p);
    const s4 = {t:state.t+dt,   T:state.T+k3.dT*dt,   X:clamp01(state.X+k3.dX*dt),   I:Math.max(0,state.I+k3.dI*dt)};
    const k4 = step(s4, dt, p);
    return {
      T: state.T + (k1.dT + 2*k2.dT + 2*k3.dT + k4.dT) * dt / 6,
      X: clamp01(state.X + (k1.dX + 2*k2.dX + 2*k3.dX + k4.dX) * dt / 6),
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
    // I0 reflects this tank's reality: MEHQ is partially depleted (that's
    // why polymerization is happening at all).
    const I0 = (p.I0 !== undefined) ? p.I0 : 0.30;
    let state = {t: startHour, T: p.T0, X: 0.02, I: I0};

    for (let i = 0; i <= totalSteps; i++){
      if (i % sample === 0){
        const k = p.A * Math.exp(-p.Ea / (R * state.T));
        const dX = k * Math.max(0,1-state.X) * Math.max(0,1-state.I) * gel(state.X);
        const Qgen = p.mMonomer * (p.deltaH / 0.10012) * dX;
        const Qcool = effectiveUA(p.UA, state.X, p) * (state.T - p.Twater) + evapCooling(state.T, p);
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
