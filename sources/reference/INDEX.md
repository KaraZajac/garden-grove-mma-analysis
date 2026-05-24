---
title: "Reference Snapshot — MMA Thermal Runaway Analysis"
fetched: "2026-05-24"
---

# Reference Index — MMA Thermal-Runaway Incident Research

Snapshot compiled 2026-05-24 supporting analysis of an MMA storage-tank thermal-runaway incident.

| Filename | Topic | Source | URL | One-line description |
|----------|-------|--------|-----|----------------------|
| `mma-wikipedia.md` | Methyl methacrylate (MMA) | Wikipedia | https://en.wikipedia.org/wiki/Methyl_methacrylate | Full chemistry profile, physical properties, hazards (flash point 2 °C, autoignition 435 °C, LEL/UEL 1.7–8.2 %), NFPA 2/3/2, production routes, applications |
| `pmma-wikipedia.md` | Poly(methyl methacrylate) (PMMA) | Wikipedia | https://en.wikipedia.org/wiki/Poly(methyl_methacrylate) | History, polymerization methods (emulsion/solution/bulk), Tg 105 °C, properties, recycling, medical and industrial applications |
| `mehq-inhibitor.md` | MEHQ (4-methoxyphenol) polymerization inhibitor | Wikipedia + NCBI PMC9920456 + Fluoryx + nbinno | https://en.wikipedia.org/wiki/Mequinol | Inhibition mechanism, **dissolved-O₂ requirement (10 ppm O₂ ≡ 40 ppm MEHQ)**, typical 10–100 ppm in MMA, why N₂ blanketing defeats MEHQ |
| `thermal-runaway-wikipedia.md` | Thermal runaway (general) | Wikipedia | https://en.wikipedia.org/wiki/Thermal_runaway | Definition, chemistry mechanism, scale-up (V/A ∝ r) trap, historical incidents (Texas City, Seveso, King's Lynn), prevention |
| `trommsdorff-effect.md` | Trommsdorff–Norrish (gel) effect | Wikipedia | https://en.wikipedia.org/wiki/Autoacceleration | Autoacceleration mechanism in free-radical polymerization; MMA deviates at ~20 % conversion; viscosity drops kt → rate spikes |
| `frank-kamenetskii-theory.md` | Frank-Kamenetskii / Semenov thermal explosion theory | Wikipedia | https://en.wikipedia.org/wiki/Frank-Kamenetskii_theory | Heat-balance criterion, δ parameter, critical δ_c = 0.879 (slab) / 2 (cyl) / 3.32 (sphere), Semenov 0-D δ_c = 1/e, full derivations |
| `csb-rohm-haas-2010.md` | Rohm & Haas Louisville MMA tank-car release, June 2010 | EPA OSC site profile | https://response.epa.gov/site/site_profile.aspx?site_id=6137 | 175 000 lb tank car; 17 500 lb released over ~13.5 h; polymerization-driven over-pressure on DOT-105J; 2008 predecessor at same site |
| `mma-polymerization-incidents.md` | Other MMA / acrylic polymerization runaway incidents | CSB, AIChE GCPS, J. Hazard. Mater. | https://www.csb.gov/file.aspx?DocumentId=5619 | Synthron NC 2006 (1 dead, 14 injured), UK resins-plant unattended MMA runaway, statistics: 15 % of US chemical accidents 1980–2001 involved runaway polymerization |
| `mma-sds-composite.md` | MMA Safety Data Sheet (composite) | Sigma-Aldrich, BASF, Fisher Scientific, OSHA | https://www.sigmaaldrich.com/US/en/sds/ALDRICH/M27301 | Composite 16-section SDS — full physical/chemical data, MEHQ inhibitor levels, storage requirements, hazardous polymerization conditions, regulatory status |
| `epa-rmp-reference.md` | EPA Risk Management Program reference | EPA, eCFR | https://www.epa.gov/rmp | RMP rule overview, MMA **NOT** on §112(r) list (no TQ), but CAA general-duty clause and OSHA PSM still apply; required RMP contents detailed |
| `nfpa-704-mma.md` | NFPA 704 hazard diamond for MMA | Wikipedia | https://en.wikipedia.org/wiki/NFPA_704 | MMA NFPA 704 = Health 2 / Flammability 3 / Reactivity 2; full rating-scale definitions for each quadrant |

## Sources That Could Not Be Fully Retrieved

| Target | Reason | Workaround used |
|--------|--------|------------------|
| Sigma-Aldrich M27301 SDS (full PDF) | WebFetch timeout | Composite SDS assembled from Sigma technical literature + Fisher + BASF + ChemicalBook + OSHA references |
| BASF MMA SDS (PDF, rev 2025-10-09) | Binary PDF returned, not text-extractable through WebFetch | Cross-referenced values incorporated into composite SDS |
| CSB Synthron full case-study PDF | Binary PDF returned, not text-extractable through WebFetch | Used CSB news release + AIChE GCPS abstract + multiple secondary sources |
| EPA HAP factsheet for MMA (PDF) | Binary PDF returned | Used Wikipedia + composite SDS |
| polymerdatabase.com Trommsdorff entry | Site hosting expired ("Bizland temporarily unavailable") | Used Wikipedia autoacceleration article — complete |
| Dedicated CSB investigation of Rohm & Haas Louisville 2010 | No such CSB report appears to exist (incident handled at EPA-OSC level) | Used EPA OSC site profile as primary record |

## What's Verified vs Composite

- **Verified from primary Wikipedia articles:** MMA, PMMA, Mequinol, Thermal runaway, Autoacceleration, Frank-Kamenetskii theory, NFPA 704 (full text fetched)
- **Verified from EPA OSC primary site profile:** Rohm & Haas Louisville 2010 incident
- **Synthesized from multiple sources:** MMA SDS composite, MEHQ inhibitor mechanism deep-dive, incidents compilation, EPA RMP reference (no single source had all parts)
- **No information fabricated.** Where a specific number is composite or representative-range, the file explicitly notes that.

## Suggested Reading Order for the Analysis

1. `mma-wikipedia.md` — what the chemical is
2. `mma-sds-composite.md` — operational hazards and constants
3. `pmma-wikipedia.md` — what it turns into
4. `mehq-inhibitor.md` — **the key failure mode for tank storage**
5. `trommsdorff-effect.md` — why MMA self-accelerates
6. `frank-kamenetskii-theory.md` — the quantitative heat-balance criterion
7. `thermal-runaway-wikipedia.md` — broader engineering context
8. `csb-rohm-haas-2010.md` and `mma-polymerization-incidents.md` — historical analogs
9. `nfpa-704-mma.md` — placarding
10. `epa-rmp-reference.md` — regulatory framework
