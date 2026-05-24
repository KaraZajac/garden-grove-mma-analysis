---
title: "Weather & Environment Sources Index"
fetched_at: "2026-05-24 06:10 UTC"
---

# Weather & Environment Sources - Index

Snapshot captured 2026-05-24 (early morning UTC, late evening PDT 2026-05-23) for the GKN Aerospace Garden Grove MMA tank incident.

| # | File | Subject | Primary Source | Status |
|---|------|---------|----------------|--------|
| 1 | [nws-forecast-garden-grove.md](./nws-forecast-garden-grove.md) | NWS 7-day forecast (14 periods) for Garden Grove | api.weather.gov (SGX 36,65) | Complete |
| 2 | [nws-current-conditions.md](./nws-current-conditions.md) | KSNA latest observation + 12 h history | api.weather.gov / forecast.weather.gov | Complete |
| 3 | [wind-forecast.md](./wind-forecast.md) | Hourly wind speed/direction, next 72 h | api.weather.gov hourly | Complete |
| 4 | [airnow-garden-grove.md](./airnow-garden-grove.md) | Air quality readings + endpoint availability | AirNow.gov, EPA AQS, IQAir, SCAQMD | Partial - AirNow public feed empty for area; IQAir captured |
| 5 | [solar-times.md](./solar-times.md) | Sunrise/sunset/solar noon May 24-28 | sunrise-sunset.org (NOAA algorithm) | Complete |
| 6 | [facility-location.md](./facility-location.md) | GKN facility address/coords + evacuation polygon + population | Wikipedia / Google Maps / IQAir / Census | Complete |
| 7 | [climatology-may.md](./climatology-may.md) | KSNA 1991-2020 May normals | NOAA NCEI | Complete |
| 8 | [environmental-context.md](./environmental-context.md) | CalEnviroScreen / EJ / hydrology context | OEHHA / Wikipedia / Census | Partial - tract-level CES scores require ArcGIS download |

## Key Operational Take-aways

- **Persistent SW (onshore) surface wind 0-10 mph for next 72 h**, with calm overnight periods. Downwind sector from GKN (33.787°N, -118.001°W) is consistently ENE through Anaheim / Stanton / Cypress / Buena Park.
- **No Santa Ana (offshore NE) wind** in the 7-day outlook.
- **No precipitation** expected.
- **Marine layer overcast** mornings, partly clearing afternoons; mixing layer capped at ~1,700-2,500 ft.
- Conditions essentially **typical for late May** at this latitude (Csa climate, 1991-2020 normals).
- Solar noon ~12:48 PDT; peak insolation 13:00-15:00 PDT; tank surface heating largely process-driven (autocatalytic MMA polymerization exotherm) not ambient.
- Evacuation polygon (Ball / Trask / Valley View / Dale) ~7.8-9 sq mi; ~40,000-50,000 people officially under orders; includes Little Saigon (Vietnamese-American community) - multilingual notification required.
