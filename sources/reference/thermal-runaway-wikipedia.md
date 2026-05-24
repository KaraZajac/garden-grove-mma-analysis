---
title: "Thermal runaway"
source: "Wikipedia"
url: "https://en.wikipedia.org/wiki/Thermal_runaway"
fetched: "2026-05-24"
---

# Thermal Runaway

**Source:** Wikipedia · **URL:** https://en.wikipedia.org/wiki/Thermal_runaway

## Definition

Thermal runaway is "a process that is accelerated by increased temperature, in turn releasing energy that further increases temperature" — uncontrolled positive feedback.

Domains:
- **Chemistry:** strongly exothermic reactions accelerated by rising T
- **Electrical engineering:** rising current / power dissipation
- **Civil engineering:** unmanaged curing heat in concrete
- **Astrophysics:** runaway nuclear fusion in stars

## Chemical Engineering Applications

### Mechanism
"The reaction rate increases due to an increase in temperature, causing a further increase in temperature and hence a further rapid increase in the reaction rate."

### High-Risk Industrial Processes
- Hydrocracking
- Hydrogenation
- Alkylation (SN2)
- Oxidation
- Metalation
- Nucleophilic aromatic substitution

Notable catastrophic cases involve oxidation of cyclohexane → cyclohexanol/-one and ortho-xylene → phthalic anhydride.

### Historical Incidents

- **Texas City Disaster (1947)** — overheated ammonium nitrate in a ship's hold
- **King's Lynn Explosion (1976)** — zoalene drying facility runaway
- **Seveso Disaster** — runaway heated reaction into unintended side reactions producing 2,3,7,8-TCDD; ruptured disk vented dioxin
- **2007 metalation explosion** — 2 400 US-gal (9 100 L) reactor metalating methylcyclopentadiene with sodium; killed 4; reactor parts thrown 400 ft (120 m)

### Root Causes

**Cooling system failures** — primary cause. Mixer failure causes localized hotspots; insufficient mixing in flow reactors causes hotspot blowouts.

**Scale-up problem (the geometric trap):**

> "The amount of reaction scales with the cube of the size of the vessel (V ∝ r³), but the heat transfer area scales with the square of the size (A ∝ r²), so that the heat production-to-area ratio scales with the size (V/A ∝ r)."

This is why bench-scale reactions cool fine but "dangerously self-heat at ton scale." Plant-scale reactions prone to runaway require reagent addition "at a rate corresponding to the available cooling capacity."

**Laboratory example:** Swern oxidation — sulfonium chloride formation must be done at −30 °C; at room temperature it "undergoes explosive thermal runaway."

### Prevention

- High-volume emergency venting
- Temperature monitoring & control
- Controlled reagent addition rate
- Adequate cooling capacity by design

### Theoretical Framework

Frank-Kamenetskii theory provides "a simplified analytical model for thermal explosion." Chain branching reactions provide an additional positive feedback mechanism.

## Microwave Heating

Thermal runaway in microwave applications: dielectric constant increases with T → warmer regions absorb more energy → local overheating. Particularly dangerous in thermal insulators (ceramics) where heat exchange is slow.

## Electrical Engineering

### General Principle
Components whose resistance / triggering voltage decreases with T can experience runaway current and Joule heating — "vicious circle or positive feedback effect," potentially causing electrical explosions/fires.

Prevention: thermal fuses, circuit breakers, PTC current limiters.

### Current Hogging
Parallel-connected lower-capacity devices: one slightly-lower-R device draws more current, heats more, reduces R further → load concentrates in one device → rapid failure.

### Silicon's Peculiar Profile
> "Its electrical resistance increases with temperature up to about 160 °C, then starts decreasing, and drops further when the melting point is reached."

This causes current crowding and filament formation in semiconductor junctions.

### BJTs
Leakage current rises with T (especially Ge); push-pull class AB amplifiers vulnerable without temperature compensation. **Second breakdown** = internal current hogging between regions of a power BJT.

Mitigations: Vce ≤ ½ Vcc, thermal feedback transistors on heatsinks, balancing in parallel BJTs.

### Power MOSFETs
On-resistance rises with T — helps balance current across parallel devices but can still run away if heat exceeds heatsink capacity. Mitigation via TDP / lower thermal resistance die-to-sink.

### MOVs
MOV trigger voltage drops with T → can slide into catastrophic thermal runaway. Limited by upstream fuses/breakers.

### Tantalum Capacitors
Dielectric breakdown → MnO₂ contacts Ta → leakage current → typically endothermic Mn₂O₃ self-heal. **Catastrophic mode:** self-sustaining exothermic reaction (thermite-like, Ta fuel + MnO₂ oxidizer) destroys the capacitor with smoke and flame.

### Digital Logic
Rare. Athlon 64 example: "power dissipation increases by about 10 % for every 30 degrees Celsius." Runaway requires heatsink R_th > 3 K/W on a 100 W device (vs typical 0.34 K/W).

### Batteries
Defective / damaged rechargeable cells can run away. Lithium-ion particularly vulnerable. 2006 recalls (Apple, HP, Toshiba, Lenovo, Dell). PHMSA regulations partly motivated by FedEx cargo-bay fire. Safer chemistries: lithium titanate anodes, LFP cathodes, ionic-liquid electrolytes.

## Astrophysics (summary)

- **Helium flash** in 0.8–2.0 solar mass red giants — degenerate He core ignites; ~10¹¹× normal energy production briefly; ~6 % core → C
- **Novae** — runaway H fusion (CNO) on white dwarf surface; luminosity ~50 000×; recurrent
- **X-ray bursts** — analogous on neutron stars; superbursts may involve heavy-nuclei breakup
- **Type Ia supernovae** — runaway carbon fusion in C-O white dwarf at Chandrasekhar limit; luminosity > 5×10⁹ ×; star disrupted
- **Pair-instability supernovae** — runaway oxygen fusion in 130–250 solar mass cores; ~1 per 100 000 supernovae

Core-collapse SNe (Ib, Ic, II) are **not** runaway-fusion driven — powered by gravitational potential energy release.

## Universal Prevention Principles

- Adequate cooling and redundancy
- Careful surface-to-volume scaling
- Temperature monitoring and feedback
- Current limiting / heat dissipation in electrical systems
- Material selection for service conditions

Controlling the positive feedback loop between T and energy release is the universal requirement.
