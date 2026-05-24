---
title: "Facility Location Reference - GKN Aerospace Garden Grove"
source: "Wikipedia / Google Maps / Apple Maps / IQAir incident bulletin / California-Demographics"
url: "https://en.wikipedia.org/wiki/Garden_Grove_chemical_leak"
fetched_at: "2026-05-24 05:55 UTC"
---

# Facility Location Reference - GKN Aerospace Garden Grove

**Source:** Wikipedia + commercial mapping services · **Fetched:** 2026-05-24 05:55 UTC

## Facility

| Field | Value | Source |
|---|---|---|
| Operating entity | GKN Aerospace Transparency Systems Inc. | Wikipedia, Airframer |
| Street address | 12122 Western Avenue, Garden Grove, CA 92841 | Google Maps, Panjiva, IQAir bulletin |
| Coordinates (Wikipedia DMS) | 33°47'01.0"N 117°59'59.3"W | Wikipedia |
| Coordinates (decimal, Wikipedia) | 33.78361°N, -117.99981°W | converted |
| Coordinates (Google/commercial) | 33.7867368°N, -118.0014792°W | aerospace-research-facilities.cmac.ws |
| Parcel size | 15.5 acres | Wikipedia |
| In operation since | 1993 | Wikipedia |
| Phone | (714) 653-7531 | CMac listing |
| Primary product | Aircraft transparencies (canopies, windows) using MMA-based acrylic resin systems | Airframer |
| Other employers nearby | Air Industries Corp., Saint Gobain Performance Plastics | Wikipedia (Garden Grove article) |

### Coordinate Reconciliation

There is a ~0.3 mile discrepancy between the Wikipedia (DMS) and Google/commercial coordinates - likely because Wikipedia is centered on the actual tank/process area in the back of the parcel while commercial geocoders return the street address point. For dispersion modeling, **use 33.787°N, -118.001°W** (the commercial/Google coordinate) as the release point unless OCFA/EPA publishes a more precise tank location.

For reference, the user-supplied incident centroid (33.7739°N, -117.9415°W) is the Garden Grove **city centroid**, located approximately 3.7 miles east-southeast of the actual GKN facility. The NWS forecast (Grid SGX 36,65) is anchored on that city centroid - applicable to the broader evacuation polygon but slightly inland of the source.

## Incident Summary

| Field | Value | Source |
|---|---|---|
| Date of initial alarm | 2026-05-21, ~15:40 PDT | Wikipedia, ABC7 |
| Chemical | Methyl methacrylate (MMA, CAS 80-62-6) | Wikipedia, IQAir |
| Tank capacity | 34,000 gallons | Wikipedia, IQAir |
| Volume at incident | ~7,000 gallons of MMA | Wikipedia |
| Tank temperature trend | 77°F (May 22) → 90°F (May 22) → rising ~1°F/hour (May 23) | Wikipedia |
| Failure mode of concern | Pressure relief valve damaged; tank may spill or explode | NBC LA, ABC News |
| Evacuation population | "Over 44,000" (Wikipedia) / 40,000 (Garden Grove city article) / 50,000 (CNN, ABC News later updates) | various |
| Evacuation footprint | 9 square miles (~23 km²) | Wikipedia, CNN |
| Cities under orders | Garden Grove, Anaheim, Buena Park, Cypress, Stanton, Westminster | Wikipedia |
| Governor declaration | State of emergency for Orange County, May 23 | Wikipedia |

## Evacuation Polygon (Reported Boundaries)

Two different boundary descriptions appear in published sources - the brief specifies the **Ball / Trask / Valley View / Dale** quadrilateral; IQAir reports the **Garden Grove Blvd / Springdale Ave / Dale St / Orangewood Ave** quadrilateral. These likely correspond to different evacuation stages (initial vs expanded) or different agency notifications.

### User-Brief Polygon (presumably current/expanded)

| Edge | Street | Approx. Lat or Lon |
|---|---|---|
| North | Ball Road | ~33.825°N |
| South | Trask Avenue | ~33.770°N |
| East | Dale Avenue/Street | ~117.985°W |
| West | Valley View Street | ~118.024°W |

Approximate dimensions: ~3.4 mi N-S × ~2.3 mi E-W ≈ ~7.8 mi² (consistent with Wikipedia's "9 sq mi" figure when corners are extended).

### IQAir Bulletin Polygon (earlier, smaller)

| Edge | Street |
|---|---|
| North | Garden Grove Boulevard |
| South | Orangewood Avenue |
| East | Springdale Avenue |
| West | Dale Street |

## Population & Density in Affected Area

Source: en.wikipedia.org/wiki/Garden_Grove,_California; California-Demographics; city-data.com

- **City of Garden Grove population** (2020 census): 171,949
- **City land area:** 17.96 sq mi
- **City population density:** 9,558 persons / sq mi (one of the densest cities in Orange County)
- **Demographics:** 42.4% Asian, 37.3% Hispanic/Latino, 21.9% White, 1.0% Black, 1.2% Native American, 0.5% Pacific Islander
- **Median household income:** $90,166
- **Below poverty line:** 12.2%
- **Special note:** Evacuation zone overlaps **"Little Saigon"** - one of the highest-density Vietnamese-American communities in the US - requiring multilingual emergency communications (Vietnamese, Spanish, Korean, English).

### Estimated Evacuated Population

Applying Garden Grove's 9,558 persons/sq mi density to a 9 sq mi evacuation footprint yields ~86,000 residents in the zone. The 40,000-50,000 published "evacuation order" count is lower because:
- Density in the immediately industrial corridor (around Western Ave / Lincoln Ave) is lower than the city average,
- Daytime non-residential populations are excluded,
- Portions of Anaheim, Stanton, Cypress, Buena Park have slightly lower density.

### Demographics of Affected Zips (per city-data / California-Demographics)

| ZIP | Notes |
|---|---|
| 92840 | "Primarily Asian"; large 20s-40s cohort; very high pop density; median HH income $96,555; median home value $746,900 |
| 92841 | Western and northwestern Garden Grove - contains the GKN facility |
| 92843 | South-central Garden Grove |

## Adjacent Sensitive Receptors (within evacuation polygon, indicative)

The 9-square-mile polygon contains a dense mix of single-family residential, multi-family apartments, strip-commercial corridors along Ball/Lincoln/Garden Grove Blvd, several elementary schools (Garden Grove Unified School District), at least one hospital (West Anaheim Medical Center is just outside the NE edge), multiple senior housing complexes, and the Knott's Berry Farm theme park complex on the far NW edge. A precise count of schools/medical facilities within the polygon was not captured in this snapshot - request OCFA evacuation-planning maps for the authoritative list.
