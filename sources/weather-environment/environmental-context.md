---
title: "Environmental & Vulnerable-Population Context - Garden Grove Evacuation Zone"
source: "CalEnviroScreen 4.0 (OEHHA); US Census; Wikipedia"
url: "https://oehha.ca.gov/calenviroscreen/report/calenviroscreen-40"
fetched_at: "2026-05-24 06:05 UTC"
---

# Environmental & Vulnerable-Population Context - Garden Grove Evacuation Zone

**Sources:** OEHHA CalEnviroScreen 4.0; OEHHA SB 535 Disadvantaged Community designations; US Census Bureau QuickFacts; Wikipedia · **Fetched:** 2026-05-24 06:05 UTC

## Data-Availability Caveats

The OEHHA CalEnviroScreen 4.0 interactive dashboard does not return tract-level data via simple HTTP fetch - it requires either:
- The interactive ArcGIS dashboard (https://experience.arcgis.com/experience/11d2f52282a54ceebcac7428e6184203),
- The downloadable Excel spreadsheet (May 2024 update), or
- The ArcGIS REST FeatureServer at https://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CalEnviroScreen_4_0_Results_/FeatureServer

Neither tract-specific percentile scores nor SB 535 disadvantaged-community status for Garden Grove tracts (Orange County tracts 087502, 087601, 087701, 087901, etc.) were retrievable in this snapshot. **The data below is general context from secondary sources; specific tract scores must be pulled directly from the CalEnviroScreen 4.0 GIS layer.**

## What CalEnviroScreen 4.0 Measures

CalEnviroScreen 4.0 is California's official cumulative environmental burden tool. It scores every census tract (~8,000 in CA) using:

**Pollution Burden indicators (13):**
- Exposures: ozone, PM2.5, diesel PM, drinking water contaminants, lead risk from housing, pesticide use, toxic releases from facilities, traffic density
- Environmental effects: cleanup sites, groundwater threats, hazardous waste, impaired waters, solid waste sites

**Population Characteristic indicators (8):**
- Sensitive populations: asthma ER visits, cardiovascular disease ER visits, low birth weight
- Socioeconomic factors: educational attainment, housing burden, linguistic isolation, poverty, unemployment

A composite percentile is calculated; tracts in the **top 25%** (75th percentile and above) are designated **SB 535 Disadvantaged Communities** and prioritized for state environmental-justice investment.

## General Profile of Garden Grove Evacuation Zone

Based on aggregated US Census and city-data sources for ZIPs 92840 / 92841 / 92843:

| Factor | Value | Vulnerability implication |
|---|---|---|
| Population density (city avg) | 9,558 / sq mi | High - large exposed population per unit area |
| % Asian | 42.4% | Linguistic-isolation risk (Vietnamese, Korean) |
| % Hispanic/Latino | 37.3% | Linguistic-isolation risk (Spanish) |
| Linguistic isolation | "Little Saigon" overlay | High - requires multilingual notifications |
| Below poverty line | 12.2% | Moderate - limits ability to relocate/shelter |
| Median household income (city) | $90,166 | Above CA median, but masks intra-tract variability |
| Median home value (92840) | $746,900 | High |
| Age cohort | Large late-20s to early-40s, slightly fewer children | Mixed sensitivity |

## Pre-Existing Environmental Burden (Qualitative)

Northern Orange County, including Garden Grove, sits within the **South Coast Air Basin** - one of the most ozone- and PM2.5-burdened air basins in the United States. Background context (CalEnviroScreen indicator categories where this area historically scores poorly):

- **Ozone:** Among the highest 8-hour ozone exposure tracts in California (SCAQMD non-attainment zone)
- **PM2.5:** Elevated due to vehicle emissions, port/rail freight, and regional secondary aerosol formation
- **Diesel PM:** Elevated from I-5, SR-22, SR-39, SR-91, I-405, and the BNSF/UPRR rail corridor running through the area
- **Traffic density:** High - dense surface street network plus freeway corridor
- **Toxic releases from facilities:** GKN Aerospace itself is a TRI (Toxics Release Inventory) reporter; other manufacturers in the area include Saint-Gobain Performance Plastics, Air Industries Corp.

The pre-existing burden means the population in the evacuation zone is likely already at or near the threshold for SB 535 disadvantaged-community designation in many tracts - making the MMA release a **compounding** exposure rather than an isolated event.

## USGS / Hydrology

Garden Grove sits on the **Coastal Plain of Orange County**, underlain by the Orange County Groundwater Basin (managed by OCWD). Surface drainage in the evacuation zone goes primarily to:
- **Coyote Creek** (NW edge, to San Gabriel River → Pacific Ocean at Long Beach)
- **East Garden Grove-Wintersburg Channel** (S, to Bolsa Chica wetlands)
- **Santa Ana River** (E edge of broader area, to ocean at Huntington Beach)

These channels are storm-drain receivers; any uncontained MMA liquid spill could reach surface water via the storm sewer system. Groundwater is protected by ~50-100 ft of vadose zone, but persistent MMA infiltration from soil contamination could threaten the Orange County Groundwater Basin (the drinking-water source for ~2.5 million residents).

## Recommended Follow-up Sources for Definitive Data

1. **OEHHA CalEnviroScreen 4.0 Excel download** - tract-by-tract scores for the affected polygon
2. **EPA EJScreen** (https://ejscreen.epa.gov/) - federal environmental-justice screening tool with similar tract-level data and EPA-specific demographic indices
3. **OCFA HazMat after-action / damage-assessment reports** - facility-specific historical releases
4. **OC Healthcare Agency Environmental Health** - permitted hazardous-materials facilities within the polygon
5. **California TRI** (https://www.epa.gov/toxics-release-inventory-tri-program) - historical reportable releases from GKN and neighbors
6. **CalEPA EnviroStor** - cleanup/contaminated sites database for the parcel and area
