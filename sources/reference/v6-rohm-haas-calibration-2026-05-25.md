---
title: "v6 — Rohm-Haas 2010 calibration test results"
source: "Internal v6 falsification study"
url: "self"
fetched: "2026-05-25"
---

# Rohm-Haas 2010 calibration falsification test (v6)

Goal: run the v5 chemistry stack forward with Rohm-Haas 2010 parameters
(175,000 lb MMA in DOT-105J car, summer ambient ~75°F, no active cooling,
PSV at ~75 psig). Target outcome: ~10% release over ~13.5 h via PSV, no
tank rupture.

## Result: PARTIAL FAILURE / informative

200 trajectories drawn from a Monte Carlo over uncertain priors (chemistry
constants common with Garden Grove, plus Rohm-Haas-specific tank/operational
parameters).

| Outcome | Count | Pct |
|---|---|---|
| Ruptured (P > 165 psig) | 17 | 8.5% |
| Vented > 0.5% mass | 94 | 47% |
| **In Rohm-Haas target window (5–20% vent / 6–24 h / no rupture)** | **0** | **0%** |
| Final X = 1 (polymerized completely) | ~150 | ~75% |

Distribution:
- Vented fraction: P10 0.000, P50 0.003, P90 0.116
- Peak T: P50 131°F, P90 367°F (bimodal — quiet vs runaway)
- Peak P: P50 4 psig (most never reach PSV setpoint), P90 139 psig
- Final X: P50 1.00, P90 1.00 (almost all trajectories polymerize fully)

## What this tells us

The v5 chemistry produces a **bimodal outcome** under no-cooling conditions:

1. **~50% of trajectories: quiet polymerization to X = 1.** Chemistry runs to completion at modest T. No significant vapor pressure rise. The PSV never trips. This is the "Synthron 2008 / hardened up like plexiglass after 8 days" mode that the Rohm-Haas record itself mentions for ~90% of the mass.

2. **~50% of trajectories: rapid runaway.** Once chemistry "ignites," it produces high T and high P quickly. Either ruptures the vessel or vents catastrophically.

3. **0% of trajectories: the steady-state Rohm-Haas mode** — PSV cycling for hours while chemistry produces moderate heat. This regime is apparently narrow and our model's priors don't capture it cleanly.

## Possible explanations

1. **The Rohm-Haas outcome was itself a narrow regime in real chemistry** — a "lucky" combination of slow-enough kinetics that PSV-cycling could keep up with heat generation. Most MMA tank failures end as Synthron-mode polymer blocks; the Rohm-Haas PSV-cycle outcome is unusual.

2. **Our model's chemistry threshold is too sharp.** The Mayo + peroxide + polymer-scission feedback creates a sharp "ignite" transition with no stable intermediate regime. Real chemistry probably has more gradual behavior with self-stabilizing mechanisms (e.g., MMA vapor escape lowers concentration → slows reaction → caps at the vapor-pressure of the bulk).

3. **PSV behavior is more nuanced than a simple choked-flow model.** Real PSVs cycle on/off (chatter); the effective flow rate over time depends on disc dynamics, downstream backpressure, fouling of the seat by polymer. Our continuous-flow model can't represent this.

4. **The "steady vent" outcome requires PSV-cycling matched to slow chemistry.** Hard to reproduce stochastically; requires specific parameter combinations.

## What was learned

- The model **can produce both endpoints** documented in MMA-tank literature (quiet polymerization AND BLEVE-class runaway)
- The model **cannot smoothly produce the intermediate "steady PSV vent" outcome** without specific parameter tuning
- **No time-resolved Rohm-Haas T/P data exists** in the public record — we can only validate against integrated quantities, which the model partially matches (~10% vented in the 90th-percentile case)

## Implications for Garden Grove

The v5 posterior of 99.5% holds is **conditional on continued active cooling**. Without cooling (or if cooling fails), the chemistry would push trajectories toward one of the two extreme outcomes:
- Slow polymerization to PMMA block (the "preferred outcome" per OCFA)
- Catastrophic runaway

The narrow steady-state PSV cycle (Rohm-Haas mode) is unlikely to be available at Garden Grove because the PSV is already mechanically broken (bulged, stuck).

## Next steps

- v6.1: try lower PSV setpoint (15 psig fire-relief vs 75 psig nominal)
- v6.2: add PSV chatter / cycling dynamics
- v6.3: model vapor escape as a self-stabilizing mechanism (concentration loss → slower chemistry)
- v6.4: add Cp/density tracking with vapor loss (currently mass is removed but Cp doesn't adjust)
- Consider: the Rohm-Haas outcome may be genuinely rare and not require model fitting.

Calibration script: `scripts/calibrate-rohm-haas.js` (run with `node scripts/calibrate-rohm-haas.js [N]`)
Results: `assets/rohm-haas-calibration.json`
