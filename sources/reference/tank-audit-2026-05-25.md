---
title: "Tank engineering & operational audit — May 25, 2026"
source: "Internal process-safety review"
url: "self"
fetched: "2026-05-25"
---

# Tank engineering audit

Senior process-safety review of model assumptions against tank/operational reality.

## Key findings — must-fix

### 1. PSV is broken; "no vent" rejection is mis-specified
NBC LA reports the PSV has a visible **bulge** — it cracked at higher than nameplate pressure, then **seized shut by polymer + warped housing**. Once that happened (Thursday late), no further PSV venting is physically possible regardless of pressure. The model's rejection of trajectories that would have vented in [12, 64) is wrong — the device is *broken open then stuck*. **Fix:** drop PSV-vent rejection after hr ~10.

### 2. PSV setpoint is conflated — two devices, not one
API 650/2000 atmospheric tanks have TWO relief devices:
- Conservation breather: 0.03–0.06 psig
- Emergency vent: 1.0–2.5 psig

Thursday "auto-activation" at ~95 °F bulk corresponds to the *emergency* vent. Model lumps them as one with prior N(1.5, 0.6) psig — close to right for the emergency vent but the breather doesn't appear at all.

### 3. Deluge is portable monitors, not fixed deluge — runoff dominates
ABC7 reports "unmanned firehoses" = portable monitors / deck guns at standoff. Master streams ~500–1,250 gpm; portable monitors 300–500 gpm. Of 1,900 kg/min water at full evaporation that's 72 MW — model's evapCooling at ~10–50 kW means **99%+ of water runs off**. Plus Saturday ~11 PM water-line disruption (hours-scale gap) the model doesn't represent.

### 4. Crack-vent gating is wrong
Model gates `Q_crack` on `T > BP − 5K`. Per OCFA the crack is venting NOW at T ~100 °F (Sun gauge-pegged). Should be time-gated only (`t > CRACK_OBSERVED`). With ~1 cm² crack at modest overpressure, choked-flow MMA vapor escape ≈ 0.05–0.2 kg/s × 360 kJ/kg latent → **18–72 kW continuous cooling**. The temperature-gated form keeps Q_crack at zero across the entire near-term forecast window where the crack is actually doing work.

### 5. "Tank has expanded"
Captain Yau (`abc7-temperature-over-100-gauge-cap.md`): "The tank has **expanded**, and it has **cracked**." Implies bulk shell plastic deformation, ~1–2% strain. More severe than a crack alone — not in the model. Suggests structural failure mode may be approaching.

### 6. Stratification in a 19%-filled tank
Tall vertical tank at 19% fill — liquid ~2.3 m tall over a ~3.7 m diameter base. Gauge reads ONE elevation. Top vs bottom liquid can differ 30–50 °F. Bulk-T anchor at 90 °F could mask a top hot-spot at 130 °F. Reaction zone is the hot top.

## Should-fix

### Tank material
SDS lists incompatible with carbon steel; almost certainly 304/316 SS or aluminum. Implications:
- Chlorinated deluge water on hot SS is a textbook **chloride SCC** initiator → more cracks likely.
- "Tank expanded" at ~100 °F internal is consistent with aluminum yielding, less with SS.

### Inventory uncertainty
OCFA never gave a definitive number. ABC News, CBS LA still say "6,000–7,000 gal" Saturday. Only Wikipedia and derivatives pinned 7,000. LA Times: "exact remaining MMA inventory is not publicly known." **Recommend** `productGal ~ Uniform(5500, 7500)` rather than fixing 7,000. Smaller m → faster cooling → lower runaway probability.

### Adjacent 15,000-gal tank
ABC News + New Santa Ana + DNYUZ: a **neutralizer was successfully injected into a 15,000-gal adjacent tank** by OCFA. Mitigates cascade severity. Model has zero representation. Not part of the thermal model but affects consequence-side analysis.

### Site context
GKN is 15.5 acres, MMA stored in back-of-parcel tank farm outdoors. Spill catchment is the outdoor tank pad. Open setting means VCE has lower confinement, less overpressure for the same vapor mass. Use Multi-Energy class 4–6 not 9–10.

### Operational events the model doesn't represent
- Thursday auto-activation of *both* sprinklers AND PSV
- PSV "visible bulge"
- Saturday water-line gap (~hours)
- Neutralizer injection into adjacent tank (cascade mitigation)
- Sandbag storm-drain barrier (spill containment)
- Foam application NOT used (deliberately, to avoid ignition)
- Inhibitor injection has NOT been attempted (valve blocks it)
- "Tank has expanded" (Captain Yau)

## Smaller findings

- Twater = 297 K (75 °F); Garden Grove May hydrant water is closer to 65–70 °F. Cosmetic.
- I0 prior `|N(0.10, 0.25)|` centered too low for fresh MMA (ships at I≈1.0 with 25 ppm MEHQ). Should be bimodal or strongly bi-tailed.
- `solarAmp` of 250 W is total but should be ~13 kW peak for a 140 m² external shell at 800 W/m² × albedo × geometry.
- Synthron 2006 ran away from < 80 °C internal due to gel-effect autoacceleration. Lower-tail of runaway threshold should be ~140 °F not 160 °F.
- Vapor-space heat capacity confirmed negligible.
- No headspace O₂ depletion model — cracked tank may now be gaining atmospheric O₂, potentially restoring inhibitor.

## Priority fixes ranked

1. Drop PSV-vent rejection after hr ~10 (device is broken)
2. Remove `T > BP − 5K` gate on crack-vent (vent is on now, T~100°F)
3. Separate internal vs external A_cool
4. Add stratification offset to runaway threshold
5. Sample inventory from `Uniform(5500, 7500)`
6. Bimodal I0 prior
7. Solar magnitude × 40
8. Add cascade-mitigation credit to adjacent tank
