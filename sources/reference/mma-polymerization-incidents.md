---
title: "MMA / Acrylic Polymerization Runaway Incidents"
source: "Multiple — CSB, AIChE, peer-reviewed literature"
url: "various"
fetched: "2026-05-24"
---

# MMA / Acrylic Polymerization Runaway Incidents — Compilation

**Sources:**
- CSB final report on Synthron: https://www.csb.gov/final-csb-report-on-synthron-explosion-finds-inadequate-safety-controls-for-chemical-reaction-hazards/
- CSB case study PDF: https://www.csb.gov/file.aspx?DocumentId=5619
- AIChE GCPS 2008 paper: https://proceedings.aiche.org/conferences/aiche-spring-meeting-and-global-congress-on-process-safety/2008/proceeding/paper/193f-synthron-runaway-reaction-and-vapor-cloud-explosion
- "Investigation of an accident in a resins manufacturing site: The role of accelerator on polymerisation of methyl methacrylate" — J. Hazard. Mater., ScienceDirect
- "Inhibition of Free Radical Polymerization: A Review", NCBI PMC9920456

## Background Statistics

> "Almost 15 % of chemical accidents in the U.S. between 1980 and 2001 were associated with thermal runaway polymerization."

> "Over 33 % of the 30 runaway accidents in specific unit processes between 1988 and 2013 were caused by polymerization reactions."

The acrylic monomers (MMA, methyl acrylate, acrylic acid) are repeatedly identified in the literature as being among the most prone monomers to autoaccelerating runaway because of the strong Trommsdorff-Norrish (gel) effect and high heat of polymerization (~57 kJ/mol monomer for MMA).

## Case 1: Synthron LLC, Morganton NC — Jan 31, 2006

**Final CSB Report:** "Inadequate Safety Controls for Chemical Reaction Hazards" (CSB Case Study, Document ID 5619)

- **Facility:** Synthron LLC, Morganton, North Carolina — manufactured acrylic polymers as paint/coating additives
- **Casualties:** 1 worker killed, 14 injured (2 seriously)
- **Event:** runaway acrylic-monomer polymerization in a batch reactor → vapor cloud explosion + fire

**Root cause:** Plant managers increased the batch size of an additive by **12 %**, and front-loaded all the additional monomer into the initial batch-mode step. CSB lab testing showed this:
- **More than doubled the maximum heat output** of the reaction
- CSB estimated heat generation escalated by a factor of **at least 2.3**
- Heat output exceeded the cooling capacity of the heavily fouled condenser
- Result: runaway

**Contributing factors:**
- Most management and operations personnel had < 1 year on the job — in some cases only weeks/months
- Plant manager, superintendent, vice president, shift operators, and chemist all lacked experience producing polymers
- No systematic safety review of the reactor had been performed
- No safeguards in place to automatically detect, prevent, or mitigate a runaway

**Reactor environment:** acrylic monomers in a mixture of flammable solvents — when the reactor vented, the released cloud found ignition sources.

**Lessons:**
- Even a "modest" batch-size increase can drive heat generation past the cooling envelope (Q ∝ batch², cooling area unchanged)
- Reactive hazard reviews are required when ANY process parameter changes
- Operator and engineer experience with the specific chemistry matters

## Case 2: UK Resins Manufacturing Site — Undated (published ~2014)

**Reference:** Marabelle, Casson Moreno, Cozzani et al., *J. Hazard. Mater.* — "Investigation of an accident in a resins manufacturing site: The role of accelerator on polymerisation of methyl methacrylate"

- **Material:** methyl methacrylate
- **Setting:** unattended batch process
- **Event:** undesired MMA polymerization → rapid monomer vaporization → vapor cloud → ignition → explosion + fire

Notably, **no initiator** had been added to the blend. The investigators concluded that an **accelerator** in the formulation contributed to the onset of undesired polymerization — likely by reducing the energy barrier for decomposition of trace peroxide / inhibitor exhaustion.

**Key takeaway:** even without intentional initiator, MMA can undergo runaway polymerization when:
- An accelerator is present
- Inhibitor is depleted
- Temperature drifts upward
- Process is left unattended

## Case 3: Rohm & Haas, Louisville KY — 2008 and June 2010

See `csb-rohm-haas-2010.md` for detail. Two separate tank-car polymerization events at the same facility (former Rohm & Haas / Dow Chemical) within two years.
- 2008 — MMA in tank car polymerized solid ("hardened up like plexiglass after about 8 days")
- 2010 Jun 13–14 — 175 000 lb tank car began venting; 17 500 lb released through pressure-relief device; pressure rise diagnostic of internal polymerization

## Case 4: 2026 Garden Grove, CA Tank Incident (Context)

Per news reporting (CBS Los Angeles, May 2026):
- California Governor declared state of emergency for Orange County chemical leak
- Over 40 000 people evacuated
- Officials warned tank "is going to fail" and may explode
- Material involved: MMA / acrylic/epoxy stream
- District Attorney launched probe into cause

(This is the present case being analyzed — included for completeness.)

## Common Patterns Across MMA Runaway Incidents

1. **Inhibitor failure** — depletion, oxygen exclusion, or supply error
2. **Heat-removal failure** — fouled condenser, lost agitation, oversize batch
3. **Hidden initiating species** — accelerators, peroxide impurities, rust, sunlight, ionizing radiation
4. **Process change without hazard review** — batch size, addition rate, sequence
5. **Long unattended periods** allowing slow polymerization to enter the autoaccelerating regime
6. **Confined-vessel dynamics** — once Frank-Kamenetskii δ exceeds critical, the only outcome is venting or rupture

## Frequency / Severity Note

The CSB and academic literature consistently flag polymerization as one of the most over-represented unit-process categories in reactive-chemistry incidents — disproportionate to its share of total chemical processes. The combined contributions of the **gel effect** (kt collapses) and the **Arrhenius dependence** of propagation/initiation make these reactions uniquely prone to runaway once perturbed.
