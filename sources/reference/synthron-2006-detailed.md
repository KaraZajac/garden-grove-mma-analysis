---
title: "Synthron LLC Acrylic Polymer Runaway — Morganton NC, Jan 31 2006 (Detailed)"
source: "CSB Case Study No. 2006-04-I-NC (Jul 31 2007); ioMosaic SuperChems Expert reconstruction (2020)"
url: "https://www.csb.gov/file.aspx?DocumentId=5619 ; https://iomosaic.com/docs/default-source/papers/polymerization-reactions-inhibitor-modeling---styrene-and-butyl-acrylate-incidents-case-studies.pdf"
fetched: "2026-05-25"
---

# Synthron LLC Runaway and Vapor Cloud Explosion — Detailed Calibration Reference

**Purpose:** Calibration target for the Garden Grove MMA thermal-runaway model. This is the canonical
case of an acrylic-monomer free-radical polymerization that escalated past condenser capacity, breached
a low-bolted manway, formed a confined vapor cloud, and detonated. Opposite endpoint from Rohm-Haas
2010, which vented cleanly through a PSV.

## CRITICAL CORRECTION TO PRIOR NOTES

Garden Grove's prior summary (`mma-polymerization-incidents.md`) and the audit narrative both
described Synthron as an **MMA** event. **This is wrong.** Per CSB §1.0 and ioMosaic Table 3, the
monomer was **n-butyl acrylate (n-BA)** in a mixed cyclohexane/toluene solvent system,
initiated with **benzoyl peroxide (BPO)**. Heats of polymerization and gel-effect kinetics for
n-BA differ from MMA — use as a *qualitative* failure-mode analog and a *quantitative* anchor for
condenser-bypass dynamics, not as a direct MMA kinetic point.

## 1. Facility, Reactor and Chemistry

| Item | Value | Source |
|---|---|---|
| Operator | Synthron LLC (subsidiary of Protex International, Paris) | CSB §2.1 |
| Location | Morganton, NC (≈ 70 mi NW of Charlotte) | CSB §2.1 |
| Product | Modarez MFP-BH — liquid acrylic polymer paint/coating additive | CSB §2.2 |
| Reactor designation | "M1" | CSB §2.2 |
| Reactor volume | **1,500 US gal** (≈ 5.68 m³) | CSB §2.2 |
| Reactor geometry | Vertical cylindrical, 15 ft dia × 4 ft length, 2:1 elliptical heads | ioMosaic Table 3 |
| Wall thickness | 0.375 in | ioMosaic Table 3 |
| MAWP / design pressure | **75 psig** | CSB §2.2 |
| Relief valve | Could not be recovered; presumed set at 75 psig | CSB §3.5 fn 18 |
| Heat removal | Steam jacket (heating) + overhead shell-and-tube reflux condenser (cooling) | CSB §2.2 |
| Condenser design cooling duty | **560 kW** | ioMosaic §7.3 (citing CSB) |
| Condenser fouled cooling duty | **310 kW** (≈ 25 % degradation per CSB §3.6; ≈ 45 % per ioMosaic) | CSB §3.6 / ioMosaic |
| Condenser type | TEMA BEM fixed-tubesheet; process on tube side, water on shell side | CSB §3.6 fn 19 |
| Condenser age | ~30 years; water side never inspected/cleaned; no water treatment | CSB §3.6 |

## 2. Batch Chemistry

| Component | Standard recipe (2407 kg) | Modified recipe (2758.7 kg) | Δ |
|---|---|---|---|
| n-Butyl acrylate | 33.01 w% | 41.74 w% | +27 % concentration; +45 % absolute |
| Cyclohexane (NBPT 81 °C; CSB calls "aliphatic") | 34.94 w% | 28.55 w% | −12 % |
| Toluene (NBPT 111 °C; "aromatic") | 31.78 w% | 29.42 w% | +6 % |
| Benzoyl peroxide (initiator) | 0.21 w% | 0.24 w% | scaled with monomer |
| Nitrogen (blanket) | 0.06 w% | 0.05 w% | — |

ioMosaic data table labels the aliphatic solvent as "cyclohexene"; CSB report text says cyclohexane (NBPT 81 °C matches cyclohexane, 80.7 °C; cyclohexene NBPT is 83 °C — also plausible). Use cyclohexane unless contradicted.

**Reaction kinetics (ioMosaic SuperChems calibration):**
- Propagation: Ac = 4.74 × 10⁹ s⁻¹; Ec = 9,710 K (Ea ≈ 80.7 kJ/mol)
- Initiator decomposition (BPO): Ad = 6.47 × 10¹³ s⁻¹; Ed = 14,946 K (Ea ≈ 124 kJ/mol)
- BPO efficiency f = 0.5
- Inhibitor (per the broader paper): MEHQ assumed present; depletion model parameters in ioMosaic Table 1

## 3. Process Setpoints

| Parameter | Value | Source |
|---|---|---|
| Starting temperature (initiator addition) | **85 °C** | ioMosaic §7.4, Table 3 |
| Starting pressure | 0 psig (near atmospheric, vented through condenser) | CSB §2.2; ioMosaic Table 3 |
| Reactor target | Mixture boiling point (~85 °C; modified recipe ↑ ~5 °C) | CSB §3.3 |
| Manway bolting at incident | **4 of 18 specified clamps** (long-standing site practice) | CSB §3.5 |
| Manway leak pressure (4 clamps) | **≈ 23 psig** (CSB calculation) | CSB §3.5 / ioMosaic §7.2 |

## 4. Initiating Event and Recipe Error

Plant managers received an order ~12 % larger than a standard batch (6,080 lb vs ~5,430 lb of polymer). Instead of running two batches, they:
1. Increased total monomer charge by **+12 %** (per CSB §3.3; ioMosaic notes the *initial* charge ended up +45 % monomer because the recipe split was disrupted)
2. **Front-loaded the extra monomer into the initial reactor charge** instead of into the second co-feed stage (this is the dominant kinetic error)
3. Reduced aliphatic solvent by 12 % (low boiler shortage), substituted with higher-NBPT aromatic
4. Boiling point of mixture rose ~5 °C — slight increase, but enough to push Arrhenius rate

**Net thermal effect (CSB reaction calorimetry):** maximum heat release rate increased by **factor ≥ 2.3** vs standard recipe. The standard recipe heat curve sat *below* the fouled condenser cooling line; the modified curve rose *above* it almost immediately after initiation.

## 5. Chronology of the Incident

| Time | Event | Source |
|---|---|---|
| Jan 30 (prev day) | 2nd-shift adds solvents + portion of monomer to M1 per (modified) batch sheet | CSB §1.1 |
| Jan 31 AM | Day shift heats jacket with steam to setpoint (~85 °C), shuts off steam | CSB §1.1 |
| T₀ | Senior operator pumps BPO initiator solution → reaction starts | CSB §1.1 |
| T₀ + (initial minutes) | Reflux flow initially "less vigorous than expected", then "increased and appeared normal" | CSB §1.1 |
| T₀ + "several minutes" | Loud hissing; vapor venting from reactor manway (P ≈ 23 psig reached) | CSB §1.1 |
| — | Senior op + 3 others driven from building by irritating vapor; superintendent & manager join outside upper-level doorway | CSB §1.1 |
| — | Senior op re-enters w/ respirator, activates emergency cooling water to jacket | CSB §1.1 |
| t_emergency_cooling + < 30 s | **Vapor cloud explosion** destroys the building | CSB §1.1 |

**Note on the "80 → 145 °C in ~10 min" claim from prior Garden Grove audit notes:** This specific numeric trajectory is **not stated in the CSB Case Study**. The CSB shows calorimetric heat-release curves (Figure 4) generated isothermally — the absolute time-to-failure quoted by the audit appears to have been inferred or imported from another source (possibly the AIChE GCPS 2008 paper, which I could not retrieve). The CSB only says "several minutes" between initiator pump-in and visible venting at the manway. **Treat the 10-minute figure as approximate and not directly cited until the GCPS paper is obtained.**

## 6. Failure Mode

This was **NOT** a classical BLEVE and **NOT** an orderly PSV release. The sequence was:
1. **Pressure rose** from 0 psig toward MAWP as runaway exceeded condenser duty
2. At **~23 psig** (about 31 % of MAWP) the under-bolted manway gasket failed in a slow leak, not a catastrophic rupture
3. **Flammable vapor (cyclohexane + toluene + entrained monomer) released into the building** rather than to atmosphere/safe location
4. **Confined vapor cloud explosion (CVCE)** when the cloud found an ignition source inside the structure
5. The actual *reactor* did not fragment from internal pressure — the *building* exploded around it from the deflagration
6. ioMosaic reconstruction: peak reactor pressure in the runaway scenario *would have* exceeded 23 psig substantially without the manway leak; the CSB further noted that internal pressure at the moment of building explosion "must have reached several thousand psi" — but this number is the *explosion overpressure*, not a reactor stagnation pressure

**Distinguishing feature vs Rohm-Haas 2010:** R&H had a functional, correctly-sized PSV that vented the polymerizing tank car to atmosphere. Synthron's relief path was effectively the manway — venting *into a confined building*. The failure was thus secondary (vapor cloud) rather than primary (vessel burst).

## 7. Consequences

| Item | Value |
|---|---|
| Fatalities | **1** (maintenance supervisor, severely burned, died 5 days later in burn center) |
| Injuries | **14** (2 serious, including 1 helicopter transport; plus 2 passers-by) |
| Facility | **Destroyed** |
| Off-site damage | Glass broken up to **1/3 mile**; 2 churches + 1 house condemned |
| Community action | Shelter-in-place for several hours; fires extinguished next day |
| Environmental | EPA federalized site under CERCLA/Superfund; remediation; building razed |
| Business | Synthron filed Chapter 7 bankruptcy |

**Mass in reactor at explosion:** Only ~**4,500 lb** of a planned 6,080-lb batch was in M1 at the time — this was *below* the 10,000-lb OSHA PSM flammable-liquid threshold, which is why the site had no PSM program. CSB explicitly flags this as a regulatory gap: catastrophic outcomes possible below threshold.

## 8. CSB Findings & Root Cause

**Report:** CSB Case Study No. **2006-04-I-NC** (issued July 31, 2007)
**Title:** *Runaway Chemical Reaction and Vapor Cloud Explosion* (Worker Killed, 14 Injured)
**Recommendation:** 2006-04-I-NC-R1 to Protex International — establish reactive-hazard program at US facilities

**Root cause:** Plant managers scaled up the batch and front-loaded extra monomer into the initial charge without a process hazard analysis. Combined heat release exceeded the fouled condenser's degraded duty, runaway proceeded, manway leaked at low pressure due to under-bolting, vapor accumulated in a closed building, ignition source → CVCE.

**Contributing factors (CSB §3):**
- No formal PHA ever conducted on the reactor
- Management team installed in late 2005 had **none** with polymer experience (mgr 9 mo / supt 8 mo / VP 5 mo / chemist 3 wk on-the-job)
- No reactive-hazards training program (only informal OJT)
- Condenser water side **never** inspected in 30 yr; degraded duty 560 → 310 kW (≥ 25 % loss)
- Manway secured with 4/18 clamps per long-standing site practice
- No high-P alarm, no auto-cooling, no auto initiator shutoff, no shortstop injection, no remote dump
- Emergency Action Plan did not list evacuation triggers; no drills; no alarm system
- Protex provided no reactive-safety oversight despite having calorimetry capability in Europe

## 9. Calibration Anchors for Garden Grove Model

1. **Condenser duty as runaway boundary.** Fouled duty ≈ 310 kW vs design 560 kW — a 1.8× degradation factor. The modified-recipe heat curve at NBPT crosses 310 kW essentially immediately on initiator addition. Use this as the canonical "cooling capacity halved → runaway certain" anchor.
2. **Heat-rate amplification from recipe perturbation.** +27 % monomer concentration + 12 % batch size → **2.3× peak heat rate**. This non-linearity (Q ∝ batch concentration², for a 2nd-order chain process) is the calibration handle for "small change → large consequence."
3. **Onset-to-leak time.** "Several minutes" from BPO injection to visible vent at 23 psig. Not precisely timed in CSB — interpret as O(5–15 min), not seconds and not hours.
4. **Failure pressure vs design pressure ratio.** Leak path opened at 23/75 ≈ **0.31 × MAWP** because of degraded mechanical containment. A reminder that vessel rating ≠ leak pressure when bolting/gaskets are non-conforming.
5. **Inhibitor as time-buffer (ioMosaic).** With reactant at 85 °C, *no cooling*, *no initiator*: 0 ppm MEHQ → runaway in ~**10 hours**. With initiator added, runaway proceeds in minutes. Inhibitor matters most under loss-of-cooling without intentional initiation (e.g., Garden Grove tank-storage scenarios).
6. **Failure mode is the secondary cloud, not vessel burst.** The teaching point is *vent path destination*: PSV-to-atmosphere (R&H 2010, safe) vs leak-into-building (Synthron, catastrophic). Garden Grove tank PSV discharge location is a first-order safety variable.

## References

- CSB Case Study 2006-04-I-NC, *Runaway Chemical Reaction and Vapor Cloud Explosion: Synthron, LLC, Morganton, NC, January 31, 2006*, U.S. Chemical Safety and Hazard Investigation Board, Jul 31, 2007. https://www.csb.gov/file.aspx?DocumentId=5619
- CSB News Release, *Final CSB Report on Synthron Explosion Finds Inadequate Safety Controls for Chemical Reaction Hazards*, Jul 31, 2007. https://www.csb.gov/final-csb-report-on-synthron-explosion-finds-inadequate-safety-controls-for-chemical-reaction-hazards/
- CSB Incident Page. https://www.csb.gov/synthron-chemical-explosion/
- ioMosaic Corporation, *Polymerization Reactions Inhibitor Modeling — Styrene and Butyl Acrylate Incidents Case Studies*, Jul 28 2020. Sections 7 and Appendix C contain the SuperChems Expert reaction parameters and Table 3 (reactor geometry and recipe). https://iomosaic.com/docs/default-source/papers/polymerization-reactions-inhibitor-modeling---styrene-and-butyl-acrylate-incidents-case-studies.pdf
- AIChE GCPS 2008 paper 193f, *Synthron Runaway Reaction and Vapor Cloud Explosion* (referenced; not retrieved). https://proceedings.aiche.org/conferences/aiche-spring-meeting-and-global-congress-on-process-safety/2008/proceeding/paper/193f-synthron-runaway-reaction-and-vapor-cloud-explosion
- EHS Today, *CSB: Lack of Emergency Preparedness and Corporate Oversight Contributed to Blast*, Aug 2007. https://www.ehstoday.com/safety/article/21904951/csb-lack-of-emergency-preparedness-and-corporate-oversight-contributed-to-blast
