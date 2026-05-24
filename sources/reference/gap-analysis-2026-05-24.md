---
title: "Technical gap analysis — May 24, 2026"
source: "Internal expert review"
url: "self"
fetched: "2026-05-24"
---

# Technical gap analysis

Deep expert-review of the modeling stack. Identifies what an expert would flag as MISSING — physics, data, analytical angles, validation, visualizations.

## Top-5 prioritized additions (next session)

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | Evaporative cooling (latent heat) term in Q_cool | HIGH | 3–4 h |
| 2 | Bayesian particle re-weighting on new readings | HIGH | 3 h |
| 3 | Vapor pressure + PSV venting state machine | HIGH | 6–10 h |
| 4 | Heat-balance stacked-area + (T,X) phase plot + sensitivity tornado | HIGH | 5–6 h |
| 5 | Historical-analog calibration against Rohm-Haas 2010 + 77→90 °F backcast | HIGH | 6–8 h |

## Missing model physics

### Evaporative cooling from the deluge — HIGH
Currently `Q_cool = UA·(T - T_water)` is purely sensible. Latent heat of water = 2.26 MJ/kg; at 0.1 kg/s evaporation that's 226 kW vs the current ~17 kW sensible term. The model is likely undercounting cooling capacity by an order of magnitude and biased toward runaway.

Add: `Q_evap = h_m · A_cool · (P_sat_shell - RH·P_sat_air) / RT · h_fg`. Mass-transfer `h_m ≈ 0.02 m/s` for wind 1–4 m/s, RH ~60–70%. **Implemented this session.**

### Vapor-space pressure and PSV venting — HIGH
Simulator tracks only `T`, no vapor-space `P_v`, no MMA volatility, no venting. The news record names a "bulging pressure-relief valve" as the most newsworthy failure mode; Rohm-Haas 2010 was specifically a PSV vent. Without it the model cannot distinguish PSV-vent spill from catastrophic burst. Sketch: Antoine vapor pressure, ullage P from N₂ blanket + thermal expansion + MMA partial, PSV state machine with `P_set ≈ 15 psig`, `P_burst ≈ 50 psig`. **Deferred.**

### Hot-spot / stratification — HIGH
Lumped 0-D ODE assumes perfect mixing. Real 19%-filled vertical tank has warm liquid rising; top can run 40–60 °F hotter than bulk gauge. Replace single `T` with vertical-node grid `T(z)` or add a hot-spot multiplier. **Deferred.**

### Trommsdorff onset is wrong — MED
Audit already flagged: gel fires at X=0.05 in code, literature is X≈0.20 for bulk MMA. Replace `1 + 18·X^2.2` with sigmoidal `1 + A·sigmoid((X−X*)/w)` with X*=0.20.

### Glass-transition / vitrification — MED
At X > 0.85–0.90 below PMMA Tg=105 °C, propagation becomes diffusion-limited. Lets model exhibit "hardens up like plexiglass" outcome observed in Synthron 2006.

### Polymer-skin spalling under thermal cycling — MED
Day/night cycles → shell flex → PMMA cracks → UA partially recovers. Could explain pause/resume in Fri rise.

### Oxygen ingress through PSV — LOW
Intermittent PSV cracking admits air → partial MEHQ restoration. Currently the O₂ cliff is one-way.

### Neighboring 15,000-gal tank coupling — MED
News reports OCFA neutralizing an adjacent tank. Failure of tank #1 (37.5 kW/m² thermal out to structural-damage distance) could ignite tank #2 (domino).

## Missing analytical angles

- **Time-to-evacuation-decision analysis** — "given current posterior, what's the latest hour I can wait before P(fail in next 6h) > X%?"
- **Optimal control sweep** — 2D grid over `(UA, T_water)` mapped to P(fail), tells you whether chilled water trucks help.
- **Bayesian particle re-weighting** — drop a new T-reading, refresh the posterior. Live decision tool vs one-shot snapshot.
- **Backward inference from survival** — show posterior marginals over (UA, Ea, fPlate, I0) given 54-h survival.
- **Expected-impact-weighted branch comparison** — multiply consequence footprints by Garden Grove pop density.
- **Frank-Kamenetskii δ as a diagnostic** — independent runaway check.

## Missing data sources

- **SCAQMD real-time station data** — Anaheim, North Long Beach. Public WFS feed. Only ground-truth VOC plume data.
- **Sentinel-3 SLSTR thermal-IR** — 1 km thermal at 2×/day. Independent shell-temperature cross-check.
- **OCFA / Newsom press-conference machine-readable timeline** — deluge tonnage, valve attempts, neutralizer injections.
- **OSHA PSM / CalARP / OC Hazardous Materials Disclosure** filings — tank rated P, PSV set point, cooling design.
- **NPMS + EPA TRI** — 1-mile-radius secondary hazards (other tanks, gas lines).
- **LandScan / WorldPop** — 100-m population rasters for impact-weighted analysis.
- **KSNA hourly ASOS** — actual hourly weather since incident start, replacing sinusoidal proxy.

## Missing visualizations

- (T, X) phase plot with nullcline and trajectory traces
- MC fan chart / trajectory ribbon (p10/p50/p90 T over next 7 days)
- Sensitivity tornado plot — **added this session**
- Stacked heat-balance breakdown over time
- Diurnal failure-probability heatmap
- Distance vs cumulative-population CDF per branch
- Posterior parameter cornerplot
- Footprint overlay on Leaflet map for all branches

## Missing validation

- **Historical analog calibration** against Rohm & Haas 2010 (175k lb, 10% via PSV, 13.5 h) and Synthron 2006 (full polymer block).
- **Forward sanity check** from 77 °F. Can priors reproduce the 13 °F-in-30-h Fri rise?
- **DIERS / Aspen vent-sizing cross-check** against Fauske MMA tube-test data.
- **Mass-balance closure** — integrate `m·dX/dt` matches `m·X_final`.

## Process-level findings

- **Stiff solver still recommended** — audit flagged, not yet addressed.
- **No formal prior sourcing** — each prior should cite a literature reference (e.g., Polymer Handbook Ea range).
- **MEHQ ppm should be a state variable** with units, comparing to SDS 10–100 ppm range.
- **Inhibitor injection counterfactual missing** — what if crews could inject fresh MEHQ?
- **Tank geometry not derived** — A_cool, mass, fill-line, vapor volume parameterized independently rather than from `(D, H, fill_frac)`.
- **No uncertainty propagation into consequence model** — yield 1–10%, spill frac unbounded.
- **No public-health overlay** — `AEGL-2 ≈ 50 ppm`, `IDLH = 1000 ppm` would convert flammable footprint to toxic-exposed footprint.
- **No multilingual BLUF** — Little Saigon in evacuation zone, no Vietnamese/Spanish.
- **No source-license footer** — mixed CC-BY-SA Wikipedia and AP wire (no-redistribution).
