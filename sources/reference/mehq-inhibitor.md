---
title: "MEHQ (4-Methoxyphenol / Mequinol) — Polymerization Inhibitor"
source: "Wikipedia, NCBI PMC, industry sources"
url: "https://en.wikipedia.org/wiki/Mequinol"
fetched: "2026-05-24"
---

# MEHQ — Hydroquinone Monomethyl Ether (4-Methoxyphenol)

**Sources:**
- Wikipedia: https://en.wikipedia.org/wiki/Mequinol
- "Inhibition of Free Radical Polymerization: A Review", NCBI PMC9920456 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9920456/
- Fluoryx Labs — https://fluoryx.com/blogs/news/the-role-of-inhibitors-in-monomer-storage-transport-production-and-processing
- nbinno.com — https://www.nbinno.com/article/other-organic-chemicals/the-essential-role-of-mehq-as-a-polymerization-inhibitor-for-monomers-ex

## Chemical Identity

- **Names:** mequinol, MEHQ, hydroquinone monomethyl ether, 4-methoxyphenol, *p*-methoxyphenol
- **Formula:** CH₃OC₆H₄OH (C₇H₈O₂)
- **CAS:** 150-76-5
- **Molar mass:** 124.139 g·mol⁻¹

## Physical Properties

| Property | Value |
|----------|-------|
| Appearance | Colorless / light-colored crystalline solid |
| Density | 1.55 g/cm³ |
| Melting Point | 52.5 °C (126.5 °F) |
| Boiling Point | 243 °C (469 °F) |

## Primary Applications

### Polymerization inhibitor (this is the industrially dominant use)
Used to stabilize acrylates, methacrylates, styrene, and acrylic acid during storage and transport. Described as "the most commonly used industrial phenolic inhibitor."

### Dermatological
Topical skin-depigmentation agent. Typical Rx formulation: **2 % mequinol + 0.01 % tretinoin**. Used for liver spots and (lower doses + Q-switched lasers) vitiligo.

## Mechanism of Inhibition (key for thermal-runaway analysis)

MEHQ does **not** react directly with carbon-centered monomer radicals (R•). Instead it scavenges **peroxy radicals (ROO•)** formed when dissolved O₂ reacts with R•:

1. Initiator → R•  (radical generated thermally, photolytically, or from peroxide impurities)
2. R• + O₂ → ROO•  (fast — dissolved-oxygen-dependent step)
3. ROO• + MEHQ–OH → ROOH + MEHQ–O•  (hydrogen atom transfer)
4. MEHQ–O• is a stabilized phenoxyl radical that does not propagate

Hence **MEHQ is only effective in the presence of dissolved molecular oxygen.** "MeHQ is only effective as a stabilizer in the presence of dissolved molecular oxygen" — investigations in air vs nitrogen atmospheres confirm this.

By contrast, **hydroquinone (HQ)** can quench radicals without O₂ — it is oxygen-independent. In MMA, HQ creates a clean induction period by consuming initiator-derived radicals until exhausted.

## Oxygen Stoichiometry

The dissolved-O₂ requirement is roughly equimolar to the inhibitor:

> "10 ppm dissolved O₂ is equimolar with 40 ppm phenolic inhibitor."

Industrial practice therefore deliberately keeps a headspace of air or a 50/50 N₂/air mixture in contact with inhibited monomer. Inerting an MMA tank with pure N₂ can **defeat the MEHQ inhibitor** and is a known runaway-polymerization risk.

## Typical Storage Concentrations

| Monomer | MEHQ level |
|---------|-----------|
| Industrial MMA (commercial) | typically **10 – 100 ppm** (most often quoted as ~25 ppm for shipping, up to 100 ppm) |
| Acrylic acid (process studies) | 200 ppm |
| General range | **10 – 300 ppm** |
| Fluoryx Labs reported practice | 100 ppm MEHQ (no incidents over a decade) |

## Behavior at Elevated Temperature / On Inhibitor Depletion

- Phenolic inhibitor is consumed during the induction period. Once depleted, polymerization initiates without restraint.
- Higher temperatures increase initiator-derived radical flux and accelerate O₂ depletion (oxygen solubility drops with temperature), shortening induction time.
- Reported induction time for styrene with 2,5-DTBHQ: 36 min — reflecting time required for system deoxygenation. The phrase "the inhibition period is essentially the deoxygenation time" recurs in the literature.

## Production

4-Methoxyphenol is produced from *p*-benzoquinone and methanol via a free-radical reaction.

## Occupational Safety

- NIOSH REL: **5 mg/m³** TWA over an 8-hour workday
- Prescription-only in the US for dermatological use; unscheduled in Canada

## Implications for MMA Tank Safety

1. MEHQ in an MMA storage tank requires **dissolved oxygen** to function. Nitrogen blanketing without controlled O₂ defeats inhibition.
2. Inhibitor concentration is consumed over time; long-stored monomer must be tested.
3. Elevated tank temperature accelerates depletion **and** reduces dissolved O₂ solubility — a double hit.
4. Loss of MEHQ + ingress of initiating impurities (rust, peroxides, sunlight, heat) is the classic precursor to runaway MMA polymerization.
