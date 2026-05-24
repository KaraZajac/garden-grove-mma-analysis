---
title: "Air Quality - Garden Grove / Orange County, CA"
source: "AirNow.gov / EPA AQS / IQAir / South Coast AQMD"
url: "https://www.airnow.gov/?city=Garden%20Grove&state=CA&country=USA"
fetched_at: "2026-05-24 05:55 UTC"
---

# Air Quality - Garden Grove / Orange County, CA

**Source:** Multiple - AirNow.gov, EPA AQS, IQAir · **Fetched:** 2026-05-24 05:55 UTC

## Data-Availability Caveats (Important)

Multiple government endpoints returned no data on first attempt for Garden Grove (zips 92840, 92841, 92843):

| Source | URL | Result |
|---|---|---|
| AirNow city page (Garden Grove) | https://www.airnow.gov/?city=Garden%20Grove&state=CA&country=USA | "There are no current and forecast air quality data found near your location." |
| AirNow city page (Anaheim) | https://www.airnow.gov/?city=Anaheim&state=CA&country=USA | "No data available" - intermittent loading state |
| AirNow API (zip 92840) | https://www.airnowapi.org/aq/observation/zipCode/current/?zipCode=92840 | HTTP 401 - requires registered API key |
| EPA AQS dailyData (Orange Co 06059, May 20-24) | https://aqs.epa.gov/data/api/dailyData/byCounty?... | "No data matched" - 0 records (data has reporting lag of weeks-months) |
| South Coast AQMD station 4144 | https://aqs.aqmd.gov/aqdetail.aspx?id=4144 | ECONNREFUSED |
| AirNow Fire & Smoke Map | https://fire.airnow.gov/ | Map renders client-side; no data captured server-side |
| EPA AirNow interactive | https://gispub.epa.gov/airnow/ | Interactive map; data only via click |

The AirNow regulatory feed for the immediate Garden Grove area was effectively unavailable at fetch time. The two most likely reasons: (1) AirNow regulatory monitors in north Orange County are spaced miles apart and the closest reporting one (Anaheim or La Habra SCAQMD site) may be temporarily flagged or offline during the MMA incident; (2) the AirNow public feed routinely fails when the nearest official monitor is >25 km or offline.

## What Was Captured

### IQAir Satellite-Derived Reading (Garden Grove)
Source: https://www.iqair.com/us/usa/california/garden-grove

| Field | Value |
|---|---|
| AQI (US) | 62 |
| Category | Moderate |
| Primary pollutant | PM2.5 |
| PM2.5 concentration | 14.8 µg/m³ |
| Observation timestamp | 2026-05-23 21:00 PDT (Local) |
| Station | Satellite-derived model (no ground-station name given) |
| Health note | "PM2.5 concentration currently 3x WHO annual PM2.5 guideline value" |
| Companion alert | Active "Bain Fire" wildfire alert in California |

### IQAir Incident-Specific Bulletin
Source: https://www.iqair.com/newsroom/air-quality-alert-chemical-spill-in-garden-grove-california

- Chemical: methyl methacrylate (MMA)
- Tank volume: 34,000 gal capacity (~7,000 gal at incident start per Wikipedia)
- Location: GKN Aerospace, 12122 Western Avenue, Garden Grove
- Authorities continue to monitor chemical readings near the site (no specific µg/m³ or ppm data published in the bulletin)
- IQAir incident-defined evacuation polygon: bounded by Garden Grove Blvd (N), Springdale Ave (E), Dale Street (W), Orangewood Avenue (S) - note this differs from / overlaps the Ball/Trask/Valley View/Dale boundary in the user's brief

## Closest Regulatory Monitors (for reference)

Based on the South Coast AQMD Source Receptor Area 17 (Central Orange County) network, the typical regulatory monitors covering Garden Grove are:
- **Anaheim** (SCAQMD site 4144 / AQS 06-059-0007) - PM2.5, O3, NO2, CO. Nearest to Garden Grove (~4 mi NE).
- **La Habra** (AQS 06-059-0008) - O3, NO2 (~9 mi N).
- **Costa Mesa** (AQS 06-059-2022) - O3 (~10 mi SE).
- **Mission Viejo** (AQS 06-059-0005) - O3, PM2.5 (~22 mi SE).

These monitors measure criteria pollutants only and **do not measure MMA** specifically. MMA detection in the incident zone requires either deployed FTIR / GC-PID mobile units (typically operated by OCFA HazMat or US EPA Region 9 START contractor) or community-deployed PurpleAir-like sensors (which detect PM, not VOCs).

## Recommended Follow-up

For real-time MMA measurements during this incident, request:
1. OCFA Health Hazardous Materials Division (HHMD) air-monitoring logs
2. US EPA Region 9 START contractor (Weston Solutions) daily situation reports
3. CARB AB617 mobile monitoring deployment data if activated
4. SCAQMD Rule 1180 incident-related VOC monitoring

These are typically released via the Orange County Health Care Agency or OCFA press conferences and are not in the public AirNow stream.
