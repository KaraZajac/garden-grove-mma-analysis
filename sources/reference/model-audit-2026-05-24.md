---
title: "Thermal-runaway model audit — May 24, 2026"
source: "Internal model review"
url: "self"
fetched: "2026-05-24"
---

# Model audit findings

Independent agent audit of `assets/simulator.js`, `assets/consequence.js`, `scripts/montecarlo.js`, and `assets/data.js` against the literature snapshots in this folder.

## Summary

No SI-unit bugs, no sign errors in the energy balance. Brode overpressure, TNT-equivalence, Pasquill-Gifford, and LEL conversions all confirmed correct.

Two real bugs found and fixed in the same session:

### 1. Solar phase offset (FIXED) — high impact

`solar(state.t)` was treating `state.t` (hours since incident start) as if it were the hour-of-day. Since Hour 0 = Thu 5/21 3:40 pm PDT (clock-hour 15.667), the model's solar peak was firing at clock-time ~6:40 am the next day instead of 3 pm. This was a ~9-hour phase error in solar heating — meaningful for the diurnal modulation of the failure window.

Fix: convert `state.t` to local clock-hour via `(t + 15.667) mod 24` before computing the cosine phase.

### 2. Missing O₂–MEHQ coupling (FIXED) — high impact

The MEHQ inhibitor was being burned down at `dI/dt = -cInh·k` with cInh=2e-2, giving a depletion timescale of ~2,500 hours. But MEHQ only works in the presence of dissolved O₂ (see `mehq-inhibitor.md`), and once polymerization consumes the available O₂, the inhibitor goes inert on a timescale of minutes-to-hours, not weeks. The model was holding inhibitor too long, biasing toward "holds."

Fix: add an O₂-cliff term that depletes I quickly once X > 0.005 (signaling that polymerization has started consuming O₂).

## Findings noted but not yet acted on

- **Trommsdorff onset:** model fires the gel-effect amplifier at X=0.05; literature places strong deviation closer to X≈0.20 for bulk MMA. Onset is earlier and milder in the model than in literature. Order of magnitude OK, shape questionable.
- **Pool-fire burn rate** in `consequence.js` is 0.040 kg/m²/s; literature for MMA / similar esters is ~0.020–0.025. So thermal-radiation distances are ~40% too long (conservatively biased).
- **Pool-fire radiative fraction X_r = 0.30** is high for large pools (>10 m) — large pools self-shield, dropping X_r to 0.10–0.20.
- **Heavy-gas correction** in dispersion (`heavyFactor`) reduces near-field concentration; physically, heavy gas (MMA vapor ≈ 3.45× air) often *increases* near-field concentration due to plume slumping. LEL distances may be ~10–25% too short — possibly non-conservative.
- **Non-stiff RK4** near tip-over: dt=30s in the browser is marginal in the steep regime, saved only by the burst-threshold break. Recommended switch to a stiff solver (BDF/Rosenbrock) if pursued further.
- **A_cool = 40 m²** is on the high side for an actual 19% fill — the wetted liquid-shell area is closer to 27 m². The model's prior allows 25–70 m² so this is captured in MC uncertainty.

## What the audit confirmed correct

- Qgen units: `kg × (J/mol ÷ kg/mol) × (1/s) = W` ✓
- MMA molar mass (100.12), density (0.94), ΔH_p (57.7 kJ/mol), LEL/UEL (1.7/8.2%) all match SDS
- Brode overpressure formula `0.975/Z + 1.455/Z² + 5.85/Z³ − 0.019` matches Brode 1955 ✓
- TNT specific energy 4.184e6 J/kg (1000 cal/g) is the defined value ✓
- Pasquill-Gifford σy/σz coefficients match Briggs rural ✓
- Volumetric→mass concentration: 40.9 mol/m³ at 25°C, 1 atm ✓
- bar↔psi conversion factor 14.5038 ✓
