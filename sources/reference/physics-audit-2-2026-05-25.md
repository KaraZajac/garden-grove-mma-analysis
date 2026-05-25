---
title: "Brutal physics audit #2 — May 25, 2026"
source: "Internal model review (second pass)"
url: "self"
fetched: "2026-05-25"
---

# Physics audit #2

Senior reaction-engineering review (DIERS / Frank-Kamenetskii perspective) of the model in `scripts/montecarlo.js`, `assets/simulator.js`, `scripts/sensitivity.js`. Findings ranked by impact on the answer.

## Priority ranking of fixes

1. **Hot-spot / stratification missing** — 19% fill in a vertical tank, gauge reads bulk (bottom) T, but top liquid runs 30–50 °F hotter. The reaction zone is the hot top layer, not the bulk. Likely explains low acceptance entirely.
2. **PSV EoS / setpoint reconciliation** — with `psvPsig ~ N(1.5, 0.6)` and the current closed-tank EoS, the PSV trips at modest T, and "no vent since Thursday" rejects most trajectories. Either setpoint, EoS, or the no-vent observation needs revisiting.
3. **Trommsdorff sigmoid + X_init=0** — current `1 + 18·X^2.2` for X ≥ 0.05 is wrong shape, wrong onset (lit: X=0.20), no vitrification cutoff at X≈0.85. `X_init = 0.02` is one step from gel ignition with the wrong onset — arbitrary and unsourced.
4. **Choked-flow crack vent + mass loss** — current `K_crack · max(0, T − (T_bp − 5))` is linear in ΔT. Real crack venting is choked compressible flow driven by ΔP. Should be `ṁ = Cd · A_crack · ρ · c_sonic · (P_total − P_atm)/P_total` with `dm/dt = −ṁ` and `Q_crack = ṁ · ΔH_vap`.
5. **Solar magnitude wrong by ~40×** — `solarAmp` capped at 800 W is *total*. For a 40 m² shell at 800 W/m² × 0.7 absorptivity × 0.5 geometric factor, peak ≈ 11 kW.
6. **Fouling cap** — `δ = fPlate · X · m / (ρ_pmma · A_cool)` gives 4 inches of PMMA at X=0.5. Real fouling is self-limiting at a few mm via mass-transport and spalling.
7. **Real radical balance** — current `(1−I)` damping is fictional. Inhibition is binary (Heaviside) until inhibitor consumed, then full propagation. The pre-exponential A is a calibration knob, not physics.
8. **Antoine pressure for MMA too steep below anchor** — single-point Clausius-Clapeyron with ΔH=36.8 kJ overpredicts P at low T by ~60% at 297 K. Use NIST Antoine.

## Detailed findings

### Wrong physics

- **Rate law missing radical-flux term.** Free-radical kinetics: `Rp = kp·[M]·[R•]` with `[R•] = (Ri/2kt)^½`. Effective `Ea_overall ≈ 80 kJ/mol` for thermally-initiated MMA. The `(1 − I)` factor is a phenomenological damping with no kinetic basis; pre-induction rate underpredicted, post-induction overpredicted ~2×.
- **No initiator/radical state.** The 2010 Rohm-Haas event was peroxide-mediated; the model has no way to represent induction-period physics.
- **Missing mass balance / volume change.** PMMA is 17% denser; liquid volume shrinks with X. `A_cool` should derive from tank geometry × fill, not be sampled independently.

### Wrong constants

- **A = 3e10** is a calibration knob. Published `kp` ≈ 580 L/(mol·s) at 60°C with `Ea_p = 22.4 kJ/mol`. Decomposing into propagation + initiation with proper Ea would be more honest.
- **`cInh = 2e-2`** has no physical anchor. Should be `d[Inh]/dt = −k_inh · [ROO•] · [Inh]` with `k_inh ≈ 3e3 L/(mol·s)` from MEHQ literature.
- **`Cp = 1900 J/(kg·K)`** is monomer value; should track conversion toward PMMA's 1466 J/(kg·K). At X=0.5 effective Cp ~ 1680 — makes dT/dt ~13% too small late in run.
- **`I0` dimensionless [0,1]** — what does I=0.3 mean? 30% of 25 ppm? No physical anchor. Should be ppm with `k_inh` in real units.

### Trommsdorff form wrong three ways

1. Onset at X=0.05 (lit X=0.20)
2. Shape: real curve is sigmoidal with sharp turn-on and possible plateau; power-law `1 + 18·X^2.2` is too gentle (5× at X=0.5 vs literature 50–100×)
3. No vitrification cutoff at X≈0.85

Proposed: `g(X) = 1 + A · sigmoid((X − X*)/w) · (1 − exp(−(Xf − X)/wf))` with X*=0.20, w=0.04, A=80, Xf=0.88, wf=0.05.

### MEHQ O₂-cliff trigger off by 500×

Per `mehq-inhibitor.md`: dissolved O₂ ~10 ppm is equimolar with ~40 ppm phenolic; O₂ is consumed when ~10 ppm monomer peroxidated → X ≈ 1e-5 in monomer-mole terms. Current trigger is X > 0.005 (500× too late). Rate constant 5e-4 /s gives τ ≈ 2000 s (~30 min) which is at the slow end of "minutes-to-hours" — probably OK if trigger is fixed.

### Crack-vent is unphysical

- Linear `K_crack · (T − T_bp + 5)` isn't choked compressible flow.
- Driver should be ΔP, not ΔT.
- No mass loss → tank should drain in days, model has it cool indefinitely.

Proposed: `ṁ_vent = Cd · A_crack · ρ · c_sonic · (P_total − P_atm)/P_total`; `A_crack` sampled mm² scale; `Q_crack = ṁ_vent · ΔH_vap`; `dm/dt = −ṁ_vent`.

### Fouling is non-physical at high X

`δ = 0.4 · 0.5 · 24900 / (1180 · 40) = 0.105 m` at X=0.5 — four inches of PMMA on the wall. Real fouling: rate-limited by mass transport, self-limiting at a few mm via spalling under thermal cycling.

Proposed: `dδ/dt = k_dep · Rp − k_spall · δ²` asymptoting to δ_max ≈ 3 mm.

This is critical because the sensitivity analysis names fPlate as dominant *because it grows without bound*. With a realistic cap, the sensitivity collapses and the model becomes much more well-behaved.

### PSV EoS issue

`P_total(T) = P_AIR_INIT · T/T₀ + P_MMA(T)` assumes constant headspace volume (no liquid expansion). At T = bp (374 K): `P_total ≈ 224 kPa = 18 psig`. But `psvPsig` prior is 0.5–4 psig. So every trajectory reaching bp would have vented decades earlier — explains why the "no PSV since Thursday" constraint rejects so much.

Three resolutions:
1. PSV setpoint is actually much higher (e.g., 10–20 psig — emergency relief, not breathing valve)
2. "No visible vent" observation is unreliable (small vents may not have been noticed)
3. Headspace EoS is wrong (vapor space connected to atmosphere via PSV — true closed-tank EoS only applies between vent events)

### Solar 40× too small

`solarAmp` up to 800 W is total. For 40 m² shell at 800 W/m² peak × absorptivity 0.7 × geometric factor 0.5: peak ~11 kW. Currently underpredicting diurnal heating by ~40×.

### Antoine too steep below anchor

Single-point Clausius-Clapeyron with `ΔH_vap = 36,800 J/mol` and anchor at 293 K predicts P(297) = 3187 Pa vs NIST P(297) = 1980 Pa — 60% high. Use proper Antoine:
```
log10(P_bar) = 4.36 − 1342/(T − 75.7)
```

### `X_init = 0.02` is arbitrary

Nothing in the news data justifies it. With X=0.02 and Trommsdorff turn-on at X=0.05 (wrong onset), the model is already one step from gel-effect ignition before integration starts. Set X=0 and let the chemistry decide. Or sample X_init from a prior to capture uncertainty.

## Diagnosis of 0.2% acceptance

The baseline state is at the steady-state knife-edge — `Qgen ≈ Qcool` exactly. Small perturbations either runaway or hold. Survival history constraints reject most → bimodal posterior, low acceptance. Combined with:

- PSV setpoint binding too tight (62.6% of rejections)
- Trommsdorff turn-on too early + X_init too high → fast runaway
- Hot-spot stratification missing → bulk T model can't satisfy a constraint that's really about hot-spot T
- Solar 40× too small → trajectories can't reach the T_OBS_MIN_F=95 °F constraint

Fixing these in priority order would likely push acceptance back to 5–20% with the model still answering meaningfully.

## Other findings

- **`Twater = 297 K` constant** — SoCal afternoon water-tanker temperatures are 85–95 °F not 75 °F. Underpredicts cooling-failure mode.
- **Vapor-space heat capacity** ignored (~30 kJ/K vs 47 MJ/K liquid) — confirmed negligible.
- **No coupling between vapor loss and liquid mass** — Rohm-Haas 2010 lost 10% of inventory through PSV.
- **Cooling-water film coefficient** combined with conduction through wall — model only has PMMA layer in series with `U_clean`, ignoring that the polymer also coats other surfaces.
