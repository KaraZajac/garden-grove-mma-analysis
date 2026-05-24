---
title: "Frank-Kamenetskii and Semenov Thermal Explosion Theory"
source: "Wikipedia"
url: "https://en.wikipedia.org/wiki/Frank-Kamenetskii_theory"
fetched: "2026-05-24"
---

# Frank-Kamenetskii / Semenov Thermal Explosion Theory

**Source:** Wikipedia · **URL:** https://en.wikipedia.org/wiki/Frank-Kamenetskii_theory

## Overview

Frank-Kamenetskii theory explains thermal explosions in a homogeneous reactive mixture inside a closed vessel with constant-temperature walls. Developed by **David A. Frank-Kamenetskii** and **Nikolay Semenov** in the 1930s.

Physical picture: thermal explosion occurs when an exothermic reaction releases heat faster than the system can conduct it away. The balance between heat generation and heat loss is captured by the **Frank-Kamenetskii parameter δ**.

## Core Energy Equation

ρ c_v ∂T/∂t = λ ∇²T + q ρ B Y_Fo e^(−E/RT)

Parameters:
- T — mixture temperature
- c_v — specific heat at constant volume
- λ — thermal conductivity
- B — Arrhenius pre-exponential factor
- Y_Fo — initial fuel mass fraction
- E — activation energy
- R — universal gas constant
- q — heat released per unit mass

## Non-Dimensionalization

- **Frank-Kamenetskii temperature increment** RT_o²/E — the rise that multiplies reaction rate by e
- **Damköhler number** δ = t_c / t_e (conduction time / ignition time)
- **Heat-release parameter** γ = (q Y_Fo)/(c_v T_o)
- **Non-dimensional activation energy** β = E/(RT_o)

Typical combustion values: γ ≈ 6–8, β ≈ 30–100, βγ ≫ 1.

Non-dimensional equation:

∂θ/∂τ = (1/δ)(1/η^j)·∂/∂η(η^j ∂θ/∂η) + e^θ

## Semenov Theory (0-D model)

Replaces spatial conduction with a linear lumped heat loss:

dθ/dτ = e^θ − θ/δ,   θ(0) = 0

Two regimes:

**Steady-state (0 < δ < 1/e):** linear cooling dominates; equilibrium θ = −W(−δ) where W is the Lambert W function.

**Explosive (δ > 1/e):** exponential heating dominates; temperature diverges in finite time.

Critical Semenov parameter: **δ_c = 1/e** ≈ 0.368.

For δ ≫ δ_c with cooling neglected:

dθ/dτ = e^θ   →   θ = ln(1/(1−τ))

Explosion at τ = 1 — the **adiabatic induction period.**

Near-critical: when δ = δ_c(1 + ε), ε → 0⁺,

τ_ind ≈ √(2π² δ_c³ / (δ − δ_c)) → ∞

## Frank-Kamenetskii Steady-State Theory

For δ < δ_c (Frank-Kamenetskii definition), steady solutions exist satisfying

(1/η^j)·d/dη(η^j dθ/dη) = −δ e^θ

with θ(1) = 0 and dθ/dη|_(η=0) = 0. (j = 0 slab, 1 cylinder, 2 sphere.)

This is a special case of the **Liouville–Bratu–Gelfand equation**.

### Planar slab (j = 0) — exact

e^((θ_m − θ)/2) = cosh(η √(δ e^(θ_m) / 2))

At the wall:

δ = 2 e^(−θ_m) [arcosh(e^(θ_m/2))]²

Critical: θ_(m,c) = 1.1868,   **δ_c = 0.8785**

### Cylindrical vessel (j = 1) — exact

θ = ln(8B/δ) − 2 ln(B η² + 1)

Wall BC gives δ(B + 1)² − 8B = 0. Maximum δ at B = 1:

**δ_c = 2**,   θ_(m,c) = ln 4 ≈ 1.386

### Spherical vessel (j = 2) — numerical

(1/ξ²)·d/dξ(ξ² dΘ/dξ) = e^(−Θ)

Same form as the **Emden–Chandrasekhar equation** (isothermal gas sphere). Admits infinitely many solutions for δ < δ_c, oscillating about δ = 2 (Gelfand). Critical values:

**δ_c = 3.3220**,   θ_(m,c) = 1.6079

## Critical δ Summary

| Geometry | δ_c | Solution |
|----------|------|----------|
| Slab     | 0.8785 | Exact |
| Cylinder | 2 | Exact |
| Sphere   | 3.3220 | Numerical |

Larger δ_c means more thermal protection from geometry — requires higher reaction rate to trigger explosion.

## Non-Symmetric Geometries

Requires numerical solution of ∇²θ + δ e^θ = 0 with θ = 0 on bounding surfaces.

## Applications

- Spontaneous ignition of biofuels / organic materials
- Explosives design and analysis
- Pyrotechnics formulation
- Storage / transport of homogeneous reactive mixtures
- Low-conductivity solids/fluids in thin-walled containers — **directly applicable to MMA storage tanks**

## Practical Reading for the MMA Tank Case

- Treat the tank as approximately cylindrical: critical δ_c ≈ 2
- Heat-generation term dominated by the MMA polymerization exotherm (~57 kJ/mol monomer)
- Heat loss governed by tank wall conduction + external convection (low for a quiescent insulated outdoor tank)
- As temperature rises, kp(T) ∝ e^(−E_p/RT) increases roughly an order of magnitude per Frank-Kamenetskii increment (RT²/E ≈ 10–20 K for typical polymerization Ea)
- Once δ exceeds the critical value, no internal mechanism stops the runaway — only vent capacity (or vessel rupture) limits the consequence
