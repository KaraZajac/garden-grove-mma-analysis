// Consequence model for the Garden Grove MMA tank.
// Three failure branches with associated impact footprints:
//   1. Liquid spill   -> pool radius
//   2. Vapor cloud    -> LEL/UEL plume (downwind, heavy-gas corrected Gaussian)
//   3. VCE / explosion-> TNT-equivalent peak overpressure rings + thermal radiation
//
// All formulas are textbook simplifications (TNO/NFPA-style screening models).
// Outputs are order-of-magnitude estimates for analysis, not engineered guidance.

(function(){
  const MMA = {
    rho_liq:   940,        // kg/m^3
    MW:        100.12,     // g/mol
    dHc:       26.6e6,     // J/kg  heat of combustion (MMA)
    dHp:       576e3,      // J/kg  heat of polymerization
    LEL_vol:   0.017,      // 1.7%
    UEL_vol:   0.082,      // 8.2%
    burnRate:  0.040,      // kg/(m^2 s)  pool-fire mass burn rate (typical liquid)
    Xr:        0.30,       // radiative heat fraction
  };

  // ---- Conversions ------------------------------------------------------
  const galToM3 = g => g * 0.00378541;
  const kgToTNT = kJ => kJ / 4184;  // 1 kg TNT ~ 4184 kJ
  const psiToBar= p => p / 14.5038;
  const barToPsi= b => b * 14.5038;
  const mToFt   = m => m * 3.28084;
  const mToMi   = m => m / 1609.344;

  // ---- TNT-equivalent overpressure -------------------------------------
  // Brode equation, free-air spherical burst, valid roughly 0.5 < Z < 60.
  // Z = R / W^(1/3) in m/kg^(1/3).  P in bar.
  function overpressureBar(R_m, W_tnt_kg){
    if (W_tnt_kg <= 0 || R_m <= 0) return 0;
    const Z = R_m / Math.pow(W_tnt_kg, 1/3);
    if (Z < 0.3) return 50;     // saturate near the charge
    let P = 0.975/Z + 1.455/(Z*Z) + 5.85/(Z*Z*Z) - 0.019;
    return Math.max(0, P);
  }
  function overpressurePsi(R_m, W_tnt_kg){ return barToPsi(overpressureBar(R_m, W_tnt_kg)); }

  // Invert: distance for a given peak overpressure (psi).
  function distanceForPsi(W_tnt_kg, targetPsi){
    if (W_tnt_kg <= 0) return 0;
    let lo = 0.5, hi = 8000;
    for (let i = 0; i < 60; i++){
      const mid = (lo + hi) / 2;
      const p = overpressurePsi(mid, W_tnt_kg);
      if (p > targetPsi) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // Compute TNT-equivalent mass for a vapor cloud explosion (VCE).
  //   massVapor_kg : how much MMA vaporized & mixed within flammability range
  //   yieldFrac    : explosion yield (1–10% typical for VCE; 3% common screening default)
  function tntEquivalent(massVapor_kg, yieldFrac){
    const E = massVapor_kg * MMA.dHc * yieldFrac;     // J
    return E / 4.184e6;                               // kg TNT
  }

  // ---- Pool fire thermal radiation -------------------------------------
  // Pool spread (unbunded, ~1 cm depth on flat ground).
  function poolRadiusM(spillGal){
    const Vm3 = galToM3(spillGal);
    const area = Vm3 / 0.01;
    return Math.sqrt(area / Math.PI);
  }

  // Point-source thermal radiation: q(R) = X_r * m_dot * dHc / (4 pi R^2)
  // Returns distance (m) at which the flux drops to `q_kWm2`.
  function thermalDistanceM(spillGal, q_kWm2){
    if (q_kWm2 <= 0) return 0;
    const r_pool = poolRadiusM(spillGal);
    const A_pool = Math.PI * r_pool * r_pool;
    const m_dot  = MMA.burnRate * A_pool;             // kg/s
    const Q_rad  = MMA.Xr * m_dot * MMA.dHc;          // W
    return Math.sqrt(Q_rad / (4 * Math.PI * q_kWm2 * 1000));
  }

  // ---- Vapor cloud dispersion (Gaussian, simplified) -------------------
  // Pasquill-Gifford stability via simple coefficient table.
  const PG = {
    A: {a:0.22,  b:0.0001, c:0.20, d:0   },   // very unstable
    B: {a:0.16,  b:0.0001, c:0.12, d:0   },
    C: {a:0.11,  b:0.0001, c:0.08, d:0.0002},
    D: {a:0.08,  b:0.0001, c:0.06, d:0.0015},  // neutral
    E: {a:0.06,  b:0.0001, c:0.03, d:0.0003},
    F: {a:0.04,  b:0.0001, c:0.016,d:0.0003},  // very stable
  };
  function sigmaY(x, s){ const k=PG[s]; return k.a*x / Math.sqrt(1 + k.b*x); }
  function sigmaZ(x, s){ const k=PG[s]; return k.c*x / Math.sqrt(1 + k.d*x); }

  // Continuous ground-level release, centerline concentration (kg/m^3):
  //   C(x) = Q / (pi * u * sigmaY * sigmaZ)
  // Heavy-gas correction: MMA vapor is ~3.5x heavier than air; use a damping
  // factor that approximates slumped-plume behavior near the source.
  function centerlineC(Q_kgs, u_ms, x_m, stab){
    const sY = sigmaY(x_m, stab);
    const sZ = sigmaZ(x_m, stab);
    const heavyFactor = 1 / (1 + 0.6 * Math.exp(-x_m / 250)); // mild near-field slump
    return (Q_kgs / (Math.PI * u_ms * sY * sZ)) * heavyFactor;
  }

  // Convert volumetric fraction (e.g., LEL 0.017) to mass concentration kg/m^3 @25°C, 1atm
  function volFracToKgM3(volFrac){
    // mol/m^3 at 25C = P / RT = 101325 / (8.314 * 298) = 40.9
    return volFrac * 40.9 * (MMA.MW / 1000);
  }

  function downwindFlammableDistance(Q_kgs, u_ms, stab, threshold_volFrac){
    const Ctarget = volFracToKgM3(threshold_volFrac);
    let lo = 5, hi = 8000;
    for (let i = 0; i < 60; i++){
      const mid = (lo + hi)/2;
      const c = centerlineC(Q_kgs, u_ms, mid, stab);
      if (c > Ctarget) lo = mid; else hi = mid;
    }
    return (lo + hi)/2;
  }

  // ---- Composite "what-if" calculation ---------------------------------
  // Input scenario, output an impact summary.
  //   branch       : "spill" | "vapor" | "explosion"
  //   tankFillGal  : product currently in tank
  //   spillFracIfFail : 0–1, fraction released on failure
  //   yieldFrac    : VCE yield (0.01–0.10), only for explosion branch
  //   windMs       : wind speed (m/s), for vapor branch
  //   stability    : 'A'–'F'
  function evaluate(scenario){
    const fill = scenario.tankFillGal;
    const released_gal = fill * scenario.spillFracIfFail;
    const released_kg  = galToM3(released_gal) * MMA.rho_liq;

    const result = {
      branch: scenario.branch,
      releasedGal: released_gal,
      releasedKg:  released_kg,
      pool: null,
      thermal: null,
      vapor: null,
      blast: null,
    };

    // Pool radius (always relevant for spill/explosion residual)
    const r_pool = poolRadiusM(released_gal);
    result.pool = { radiusM: r_pool };

    if (scenario.branch === "spill"){
      // Thermal-radiation footprint if the pool ignites
      result.thermal = {
        burns1stDegM:    thermalDistanceM(released_gal, 4.0),  // 4 kW/m^2  pain in 20s
        burns2ndDegM:    thermalDistanceM(released_gal, 12.5), // 1st-degree burns
        structuralM:     thermalDistanceM(released_gal, 37.5), // structural damage
      };
    }

    if (scenario.branch === "vapor"){
      // Vaporization rate ≈ mass burn rate × pool area, but for evaporation only
      // we assume a fraction (~0.10) of released mass becomes airborne over 30 min.
      const Q = (released_kg * 0.10) / (30*60);
      result.vapor = {
        emissionRateKgs: Q,
        lelDistanceM:    downwindFlammableDistance(Q, scenario.windMs, scenario.stability, MMA.LEL_vol),
        halfLelDistanceM:downwindFlammableDistance(Q, scenario.windMs, scenario.stability, MMA.LEL_vol/2),
      };
    }

    if (scenario.branch === "explosion"){
      // Assume the same 10% airborne fraction is in the flammable cloud
      const massCloud = released_kg * 0.10;
      const Wtnt = tntEquivalent(massCloud, scenario.yieldFrac);
      result.blast = {
        Wtnt_kg: Wtnt,
        d_1psi:  distanceForPsi(Wtnt, 1.0),   // window breakage
        d_3psi:  distanceForPsi(Wtnt, 3.0),   // serious injury, light building damage
        d_5psi:  distanceForPsi(Wtnt, 5.0),   // wood-frame collapse, eardrum rupture
        d_10psi: distanceForPsi(Wtnt, 10.0),  // reinforced building collapse, fatal
      };
      // Pool-fire thermal contribution from any residual liquid
      result.thermal = {
        burns1stDegM:    thermalDistanceM(released_gal, 4.0),
        burns2ndDegM:    thermalDistanceM(released_gal, 12.5),
        structuralM:     thermalDistanceM(released_gal, 37.5),
      };
    }

    return result;
  }

  window.GG_CONSEQ = {
    evaluate,
    overpressurePsi,
    distanceForPsi,
    tntEquivalent,
    poolRadiusM,
    thermalDistanceM,
    downwindFlammableDistance,
    MMA,
    galToM3, mToFt, mToMi,
  };
})();
