---
title: "Numbers, priors, calibration audit — May 25, 2026"
source: "Internal data-quality review"
url: "self"
fetched: "2026-05-25"
---

# Numbers audit

Constant-by-constant verification of model inputs against the source corpus and literature.

## High-impact corrections

| File:line | Quantity | Current | Should be | Reason |
|---|---|---|---|---|
| `consequence.js:15` | ΔH_combustion (MMA) | 26.6 MJ/kg | **25.4 MJ/kg** | NIST ΔcH ≈ −2547 kJ/mol ÷ 0.100 kg/mol; current value 5–10% high |
| `consequence.js:18` | Pool-fire burn rate | 0.040 kg/(m²·s) | **0.025 kg/(m²·s)** | Babrauskas: light esters 0.020–0.035; current overstates thermal footprint by ~25% |
| `montecarlo.js:189` | Ea prior center | N(94000, 5000) | **N(85000, 7000)** | Lit. lumped Ea is 70–90 kJ/mol; current biased high → biases holds high |
| `montecarlo.js:213` | PSV setpoint prior | N(1.5, 0.6) psig | **N(1.2, 0.4) psig** | Back-calibration from Thursday vent at T=95°F bulk gives 1.0 psig; current mean sits 50% above empirical anchor |
| `montecarlo.js:203` | fPlate prior | N(0.35, 0.18) | **N(0.15, 0.12)** | No published basis for 0.35 mean; most polymer ends up suspended, not adhered. Current biases fouling-amplifier dominance |

## Module consistency

- `simulator.js:22` Ea = 95,000 vs `montecarlo.js` samples around 94,000 — minor drift
- `simulator.js:42` h_m = 0.02 vs `montecarlo.js:208` median 0.012 — **mismatch**: the simulator user sees is not the model the MC reports
- `simulator.js:35` fPlate = 0.40 vs `montecarlo.js:203` mean 0.35 — mismatch
- `simulator.js` has no `crackVentCooling` and no PSV logic; can't reproduce MC results near BP

**Fix:** factor shared physics into a single module imported by all three.

## Verified OK

- MMA MW, density, ΔH_p, ΔH_vap, BP, flash, autoignition, LEL/UEL, vapor pressure at 20°C — all match Wiki/SDS
- PMMA k = 0.19 W/(m·K), ρ = 1180 kg/m³ — both lit. range
- Water h_fg, MW, Magnus formula constants — all correct
- Antoine / Clausius-Clapeyron: ΔH_vap = 36,800 J/mol back-derives within 0.1%
- TNT specific energy 4.184e6 J/kg — defined, correct
- Brode overpressure formula coefficients — match Brode 1955 exactly
- Pasquill-Gifford σ_y / σ_z coefficients — match Briggs (1973) rural exactly
- Volumetric→mass concentration 40.9 mol/m³ at 25°C/1atm — correct
- Bar↔psi 14.5038 — correct
- PSV back-calibration arithmetic — verified pTotal(95°F) = 1.01 psig

## Timeline checks

All 15 timeline entries verified against Hour 0 = Thu 5/21 3:40 pm PDT.

**EXCEPT:** `data.js:42` — h=62 listed "Sun 5/24, 6:00 am" computes to **5:40 am**. 20-min off. Either bump hour to 62.33 or update label.

## Bin label cosmetic

- sun-eve `[75, 80)` → Sun 6:40 pm → 11:40 pm. Label says "Sun 7pm – midnight" — 20 min off
- mon-overnight `[80, 92)` → Sun 11:40 pm → Mon 11:40 am. Label says "Mon 12am – 12pm" — 20 min off
- All other bin labels approximately correct

## Stale `data.js` fallback

`data.js:168-178` `monteCarlo` fallback block has bin labels that don't match the current `montecarlo.js:229-237` definitions. Should be updated when bins change.

## K_crack value vs comment

`montecarlo.js:75-77` comment claims "~50 kW at T = BP" but code returns `5000 · (374.15 − 369.15) = 25 kW` at T = BP. Comment off by 2×. Either change comment to "~25 kW" or double K_crack to 10000. Choked-flow first-principles for a 1 cm² crack at 1 atm overpressure gives ~26 kW — so K_crack = 5000 is right magnitude; just fix the comment.

## h_m prior

Code: log-normal, median 0.012 m/s, σ_log = 0.85 → P5–P95 spans 0.003–0.049 m/s. Lower tail (3 mm/s) corresponds to still-air natural convection — too low for a continuously-sprayed shell. **Recommend** narrowing to log-normal median 0.015, σ_log = 0.5 → P5–P95 ≈ 0.0066–0.034 m/s.

## I0 prior

`|N(0.10, 0.25)|` clipped [0, 0.95]. Centered too low for fresh MMA (ships at I≈1.0 with 25 ppm MEHQ stored < 25°C with O₂). Should be bimodal: either fresh (I~1) or substantially aged (I~0.1).

## Priority order for fixes (impact × ease)

1. ΔH_combustion 26.6 → 25.4 MJ/kg (1-char edit, propagates to TNT-equivalent + thermal)
2. Pool burn rate 0.040 → 0.025 (1-char edit)
3. fPlate prior 0.35 → 0.15 (single-line edit, removes spurious sensitivity dominance)
4. Ea prior re-center 94 → 85 kJ/mol (single-line, fixes high-bias on holds)
5. PSV prior re-center 1.5 → 1.2 psig (consistency with own back-calibration)
6. Fix K_crack comment (one-line)
7. Sync simulator.js defaults to MC priors
8. Update fallback `data.js` MC bins to match current script
9. h=62 timestamp 20-min fix
10. Refresh `forecast` dates
