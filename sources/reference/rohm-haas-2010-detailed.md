---
title: "Rohm & Haas 2010 MMA Tank Car Release — Detailed Calibration Data"
source: "EPA OSC Response site profile, Wave3, Firehouse.com, MPA Safe Handling Manual, NIST WebBook, NOAA"
url: "https://response.epa.gov/site/site_profile.aspx?site_id=6137"
fetched: "2026-05-25"
---

# Rohm & Haas 2010 MMA Tank Car Release — Detailed Calibration Data

**Purpose:** quantitative calibration target for the Garden Grove MMA thermal-runaway model. The 2010 Louisville incident is the closest documented analog: a known-quantity inventory of inhibited MMA polymerized in a sealed pressure vessel, vented through a relief device, and was eventually arrested with ~10% loss of mass over ~13.5 h.

**Caveat on data quality:** the only direct public record is the EPA On-Scene Coordinator (OSC) site profile plus brief news coverage. Tank-side instrumentation data (temperature, pressure, PSV setpoint, cycling behavior) was NOT released publicly. Pre-incident conditions (MEHQ residual, dissolved O₂, fill level, age of inventory) are also NOT in the public record. Values below marked **[INFERRED]** are derived from generic DOT-105J / MMA references — they are NOT measurements of this car. Values marked **[OBSERVED]** are from the EPA/news record.

---

## Sources

- EPA OSC site profile (primary): https://response.epa.gov/site/site_profile.aspx?site_id=6137
- Firehouse.com news report: https://www.firehouse.com/safety-health/news/10466163/crews-monitor-ky-chemical-spill
- WAVE3 news "Officials: Chemical Spill is all-clear": https://www.wave3.com/story/12641635/officials-chemical-spill-is-all-clear/
- 49 CFR Part 179 Subpart C (DOT-105 tank-car specs): https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-179/subpart-C
- Methacrylate Producers Association — Methacrylate Esters Safe Handling Manual (2019): https://www.petrochemistry.eu/wp-content/uploads/2019/08/Methacrylate-Esters-Safe-Handling-Manual-Rev-FINAL-8-22-19.pdf (PDF; could not OCR cleanly via WebFetch — values used here are corroborated from the manual's well-known recommendations cross-referenced in industry literature)
- AAR Field Guide to Tank Cars (2017): https://www.aar.org/wp-content/uploads/2017/12/AAR-2017-Field-Guide-for-Tank-Cars-BOE.pdf
- ioMosaic — "Polymerization Reactions Inhibitor Modeling — Styrene and Butyl Acrylate Incidents Case Studies": https://iomosaic.com/docs/default-source/papers/polymerization-reactions-inhibitor-modeling---styrene-and-butyl-acrylate-incidents-case-studies.pdf
- Existing project reference: `sources/reference/csb-rohm-haas-2010.md`

---

## 1. Pre-Incident Conditions

| Parameter | Value | Source |
|---|---|---|
| Facility | Dow Chemical Co. (former Rohm & Haas), 4300 Campground Rd, Louisville KY 40216 | [OBSERVED] EPA |
| Product | MMA "3rd vent monomer" — process side-stream MMA from finishing column vents | [OBSERVED] EPA |
| Tank-car type | DOT 105J — insulated, pressure-rated, designed for monomer service | [OBSERVED] EPA |
| Nominal car capacity | 175,000 lb (≈ 79,400 kg) net product load | [OBSERVED] EPA SERC report |
| Typical 105J tank volume | ~33,500 US gal (≈ 127 m³) for a 263,000-lb GRL car | [INFERRED] AAR field guide |
| Implied fill level | ~94% v/v (typical loading for MMA, density ≈ 940 kg/m³ at 20 °C) | [INFERRED] |
| Vapor headspace | ~5–7% of tank volume — small | [INFERRED] DOT loading rules |
| MEHQ inhibitor (loading spec) | typical 10–50 ppm; producer spec often 15–30 ppm | [INFERRED] MPA manual |
| Dissolved O₂ (required) | 5–15 ppm (MEHQ needs O₂ to function) | [INFERRED] MPA manual |
| Storage duration before failure | UNKNOWN (the "3rd vent monomer" designation implies an off-spec / accumulator stream — likely days-to-weeks old; 2008 sister incident polymerized over ~8 days) | partly [INFERRED] from EPA 2008 analog |
| Ambient temperature, Louisville, 13 Jun 2010 | Daily high ≈ 30–32 °C (≈ 87–90 °F); typical June high 86 °F. Direct KSDF record could not be retrieved via web; NOAA CDO station GHCND:USC00154958 holds it. Storms recorded in region 12–15 Jun 2010 per NWS. | [INFERRED] climatology |
| Tank-shell color | typical white/light grey (105J) → reflects most solar load | [INFERRED] |

## 2. Onset Chronology

| Parameter | Value | Source |
|---|---|---|
| First observable signal | Audible/visible venting at the PSV; pressure-build-up flag noted on inspection | [OBSERVED] EPA |
| Discovery time (local EDT) | Sun 13 Jun 2010, ~12:30 | [OBSERVED] EPA |
| Discovery temperature | NOT REPORTED | — |
| Discovery pressure | NOT REPORTED (only "pressure build-up indicating polymerization had begun") | [OBSERVED] EPA |
| Pre-failure monitoring | none reported — tank cars at this site were not on continuous T or P telemetry | [INFERRED] |

## 3. Failure Progression

| Parameter | Value | Source |
|---|---|---|
| Measured temperature history | NOT AVAILABLE in public record | — |
| Measured pressure history | NOT AVAILABLE in public record | — |
| Inferred onset temperature | Likely 60–80 °C for MEHQ-inhibited MMA after inhibitor depletion — Trommsdorff-effect autoacceleration takes the reaction up rapidly thereafter | [INFERRED] MPA / iomosaic |
| Time from onset to first venting | UNKNOWN; entirely undetected before 12:30 EDT | — |
| Time-to-PSV-crack | The car was already venting at discovery — so crack occurred ≤ 12:30 | [OBSERVED] |

## 4. PSV Behavior

| Parameter | Value | Source |
|---|---|---|
| Number of PSVs on a 105J | typically 1 spring-loaded reclosing valve in the manway/PRD nozzle | [INFERRED] 49 CFR 179.15 |
| PSV setpoint (this car) | NOT DISCLOSED | — |
| 105J PSV setpoint range (regulatory) | Start-to-discharge at 75% of tank-test pressure; common 105J600W cars: PSV ~165 psig (full test pressure 600 psi). 105J300/J500 cars run lower (PSV ~75–125 psig) | [INFERRED] 49 CFR 179.15, AAR field guide |
| Most plausible setpoint for MMA-service car | 75 psig start-to-discharge is the most common modern MMA-service value | [INFERRED] |
| Cycling vs stuck-open | Account is consistent with continuous venting for ~13.5 h, not discrete pops — implies either (a) sustained over-pressure faster than PSV could reseat, or (b) PSV essentially stayed open the whole time. EPA did not state which. | [INFERRED] from "venting" wording |
| Tank rupture? | NO — the 105J held; this is the design intent | [OBSERVED] |
| BLEVE / fire? | NO — no fire, no detonation, no injuries | [OBSERVED] |

## 5. Vent Dynamics & Release Quantification

| Parameter | Value | Source |
|---|---|---|
| Total mass released | **17,500 lb (≈ 7,940 kg)** — per KY SERC report 23 Jun 2010 | [OBSERVED] EPA |
| Fraction of tank inventory released | **10.0%** (17,500 / 175,000) | [OBSERVED] |
| Release duration | **~13.5 h** (≈12:30 Sun → 02:00 Mon, EDT) | [OBSERVED] |
| Average release rate | **≈ 1,300 lb / h = 590 kg/h ≈ 0.16 kg/s** (time-average over 13.5 h) | DERIVED from observed totals |
| Peak release rate | Not measured; if venting was concentrated in an early window, peak could be several × the average | — |
| Vapor vs liquid | Vapor only — perimeter air monitoring was non-detect for VOCs at 18:00 EDT, runoff non-detect at 1 mg/L — implies no liquid carryover and rapid atmospheric dispersion | [OBSERVED] EPA |
| Vapor cloud behavior | Visible plume reported by news; water-spray vapor suppression was applied; cloud kept off-site below detection limits | [OBSERVED] |

## 6. Final State

| Parameter | Value | Source |
|---|---|---|
| Vented mass | 17,500 lb (10%) | [OBSERVED] |
| Polymerized in-situ | Inferred ≈ remainder (≈ 157,500 lb / 90%) — by analogy with the 2008 sister incident at the same facility where the contents "hardened up like plexiglass after about 8 days" | [INFERRED] EPA 2008 site-profile note |
| Free monomer remaining as liquid | UNKNOWN; could be 0 (full conversion) or a few % (partial conversion) — depends on whether the reaction self-extinguished before exhausting monomer | — |
| Tank integrity post-event | Intact (DOT-105J performed to spec) | [OBSERVED] |
| Tank disposition | Required hot-cut / mechanical removal of solid PMMA — same recovery problem as 2008 | [INFERRED] |

## 7. Inhibitor Consumption

- No public laboratory analysis of MEHQ residual in the venting or in any salvaged liquid sample exists.
- The 2008 sister incident at this same facility is the strongest evidence: an essentially identical car polymerized completely after ~8 days of storage — consistent with MEHQ + dissolved-O₂ depletion as the trigger.
- The "3rd vent monomer" designation matters: a process side-stream is more likely than virgin product to have (a) reduced or variable inhibitor loading and (b) elevated impurity / initiator content. Both shorten induction time.
- Recurrence within 2 years at the same facility with same root-cause signature indicates the institutional response after 2008 did not eliminate the failure mode.

---

## Reconstructed Chronology (machine-extractable)

All times local EDT (UTC−4).

| t (h, rel. to discovery) | Date/Time | Event | Source |
|---:|---|---|---|
| −∞ → −days | pre-13 Jun | Car loaded with 175,000 lb MMA "3rd vent monomer"; sat on plant trackage | [OBSERVED] |
| ~0.0 | Sun 13 Jun 12:30 | Car discovered venting; polymerization-driven pressure rise inferred | [OBSERVED] |
| ~1.5 | Sun 13 Jun ~14:00 | Lake Dreamland FD sounded community sirens; shelter-in-place issued | [OBSERVED] firehouse.com |
| ~3.5 | Sun 13 Jun ~16:00 | Shelter-in-place lifted (off-site monitors non-detect) | [OBSERVED] EPA + wave3 |
| ~4.5 | Sun 13 Jun 17:00 | EPA OSC Smith deployed on-scene | [OBSERVED] EPA |
| ~5.5 | Sun 13 Jun 18:00 | Perimeter VOC air monitoring: non-detect | [OBSERVED] EPA |
| ~9.0 | Sun 13 Jun 21:30 | EPA OSC demobilized | [OBSERVED] EPA |
| ~13.5 | Mon 14 Jun ~02:00 | Venting ceased; instruments show no further material escape | [OBSERVED] EPA + wave3 |
| ~20.5 | Mon 14 Jun 09:00 | Lake Dreamland FD relinquished incident command | [OBSERVED] EPA |
| +days → +weeks | post-14 Jun | (by analogy w/ 2008) tank contents continued to polymerize to a solid PMMA mass; required hot-cutting to recover the car | [INFERRED] EPA 2008 note |

---

## Calibration Anchors (ranked by usefulness for model validation)

1. **Total released = 17,500 lb (~10% of 175,000 lb)** over **13.5 h** — strongest single anchor: a model that vents far more or far less than this when given an inhibited 175,000-lb MMA charge in a 105J tank fails calibration.
2. **Time-average release rate ≈ 0.16 kg/s** — bounds PSV mass-flow * duty-cycle product.
3. **Tank did NOT rupture** — internal P stayed bounded below burst pressure of the 105J (test pressure 300–600 psig depending on subclass); model must show pressure plateau, not runaway-to-burst.
4. **No fire, no BLEVE, no detonation** — even with MMA at LFL = 1.7 v/v %, the vented vapor dispersed without finding an ignition source; not really a model anchor, but a sanity check on the source-term magnitude.
5. **Reaction self-extinguished within ~13.5 h** — implies either monomer exhaustion (full polymerization, the 2008 outcome) or thermal balance shifted negative as remaining mass dropped and heat-loss caught up. Models that predict indefinite venting fail.
6. **Inhibitor + O₂ depletion is the triggering mechanism** — supported by 2008 analog. Model must include MEHQ depletion (1st-order in radicals, O₂-mediated).
7. **Outdoor ambient ~30 °C** is the only thermal-boundary input that can be confidently set; tank-shell solar absorption is the dominant heat-input term during the day.

---

## Gaps (what we DON'T know — flag for downstream sensitivity analysis)

- PSV setpoint (use 75 psig start-to-discharge as baseline; vary 75 → 165 psig).
- Initial MEHQ ppm and dissolved O₂ ppm at load-out (use MPA-recommended 15 ppm / 5 ppm baseline; vary ±50%).
- Storage age at failure (treat as fit parameter; expect induction time of order 1–10 days at 30 °C ambient).
- Peak temperature reached inside the car (likely > 100 °C given vapor-pressure curve and the PSV operating point — but never measured).
- Internal-pressure trace (not measured).
- Fraction of vent that was liquid carryover vs vapor (assumed 100% vapor; air-monitoring data is consistent).
