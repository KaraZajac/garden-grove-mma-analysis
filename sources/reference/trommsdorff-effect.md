---
title: "Trommsdorff–Norrish effect (Autoacceleration / Gel effect)"
source: "Wikipedia"
url: "https://en.wikipedia.org/wiki/Autoacceleration"
fetched: "2026-05-24"
---

# Trommsdorff–Norrish (Gel) Effect — Autoacceleration

**Source:** Wikipedia · **URL:** https://en.wikipedia.org/wiki/Autoacceleration

## Overview

Autoacceleration — the **Trommsdorff–Norrish effect** — is a dangerous reaction behavior in free-radical polymerization caused by localized viscosity increases that slow termination, producing rapid acceleration of overall rate.

Named for German chemist **Johann Trommsdorff** and British chemist **Ronald G. W. Norrish**.

## Where It Shows Up (and at What Conversion)

Manifests prominently in **bulk polymerization**. For **methyl methacrylate (MMA) specifically:**

> "The polymerization... deviates strongly from classical mechanism behavior around **20 % conversion**."

At this point both conversion and polymer molecular mass increase rapidly, accompanied by significant temperature rise.

Without controls, the effect causes vessel failure or explosion. **Suspension polymerization** mitigates this — water droplets act as small reactors and the surrounding water absorbs heat.

## Mechanism: The Viscosity Trap

Established by Norrish, Smith, Trommsdorff, Schultz, and Harborth.

Before acceleration: chain termination by combination of two radicals is very rapid — about 1 termination per 10 000 collisions.

As polymer accumulates:

> "When the growing polymer molecules... are surrounded in the highly viscous mixture... the rate of termination becomes limited by diffusion."

Brownian motion of large macroradicals is restricted; termination-collision frequency drops sharply.

Propagation is **not** equally affected, because monomer molecules are small and still diffuse freely. The asymmetry — termination crashes, propagation continues — is the heart of the gel effect.

## Quantitative Behavior

> "A four-fold decrease in termination roughly doubles the overall reaction rate."

(Rp ∝ [M]·(kp/kt^½)·[I]^½ — so a 4× drop in kt approximately doubles Rp, which is the textbook square-root relationship.)

Active chains live longer:
- **Mass-average molecular weight rises dramatically**
- **Number-average rises only slightly**
- Result: highly polydisperse product

## Implications for MMA Tank Runaway

The gel effect explains why MMA polymerization is **self-accelerating**:

1. Inhibitor depletion + small initial radical flux → slow polymerization begins
2. Polymer accumulates → viscosity rises → kt drops
3. Rp rises (with little extra heat removal) → temperature climbs
4. Arrhenius acceleration of kp + decomposition of any peroxide impurities → more radicals
5. Heat generation outruns any available cooling → thermal runaway

In a storage tank with no agitation or cooling jacket, once the gel-effect window is entered the reaction is essentially un-stoppable from inside.

## Mitigation in Industrial Practice

- **Suspension** or **emulsion** polymerization disperses the reacting mass into water droplets
- Heat sink (water heat capacity) absorbs the exotherm
- Diffusion path for monomer/radicals stays short
- For storage of monomer, the goal is to prevent reaching the gel-effect regime *at all* — by maintaining inhibitor, oxygen, and low temperature.
