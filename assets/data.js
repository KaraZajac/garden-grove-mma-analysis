// All data for the Garden Grove MMA analysis page.
// Hour 0 = Thu May 21, 3:40 pm PDT.

window.GG = {
  incident: {
    location: "GKN Aerospace, Garden Grove, CA",
    chemical: "Methyl methacrylate (MMA), C5H8O2",
    inhibitor: "MEHQ (monomethyl ether hydroquinone, ~10–100 ppm) — requires dissolved O2",
    tankVolumeGal: 34000,
    productGal: 6500, // reported range 6,000–7,000
    evacuated: 50000,
    t0: "Thu May 21, 3:40 pm PDT",
    runawayThresholdF: 100, // crews' own field estimate
    safeTargetF: 50,
  },

  // Physical constants for MMA (from SDS / Wikipedia)
  mma: {
    bpC: 101,
    flashPointC: 2,
    autoignitionC: 435,
    LEL: 1.7,
    UEL: 8.2,
    vaporPressureMmHg20: 29,
    molWeight: 100.12,
    deltaHpKJmol: 57.7, // heat of polymerization
    densityKgL: 0.94,
  },

  // Timeline anchors. type: measured | modeled | hypothesized
  timeline: [
    {h:0,    when:"Thu 5/21, 3:40 pm",  tempF:null,  type:"measured",  event:"OCFA alerted; tank overheating",                                             risk:"Moderate"},
    {h:4,    when:"Thu 5/21, ~7:40 pm", tempF:null,  type:"measured",  event:"Relief valve + sprinklers auto-activated",                                    risk:"Elevated"},
    {h:10,   when:"Thu 5/21, late",     tempF:null,  type:"measured",  event:"Exterior spray cools tank; valve closes; evacuation lifted",                  risk:"Reduced"},
    {h:16,   when:"Fri 5/22, 7:40 am",  tempF:77,    type:"measured",  event:"Interior gauge reading",                                                      risk:"Elevated"},
    {h:24,   when:"Fri 5/22, daytime",  tempF:null,  type:"measured",  event:"Inoperable valve blocks product off-load; evacuation reissued",               risk:"High"},
    {h:30,   when:"Fri 5/22, 9:40 pm",  tempF:90,    type:"measured",  event:"Interior gauge reading; rising ~1 °F/hr",                                     risk:"High"},
    {h:42,   when:"Sat 5/23, 9:40 am",  tempF:61,    type:"measured-exterior", event:"Exterior shell reading via unmanned firehoses (CBS/NBC LA)",          risk:"Severe"},
    {h:48,   when:"Sat 5/23, 3:40 pm",  tempF:null,  type:"measured",  event:"Covey: 'spilling is the preferred outcome'; storm-drain containment in place (ABC7)", risk:"Severe"},
    {h:55,   when:"Sat 5/23, 10:40 pm", tempF:null,  type:"measured",  event:"Water-line disruption; water dept re-enters exclusion zone to restore deluge (ABC7)", risk:"Critical"},
    {h:60,   when:"Sun 5/24, 3:40 am",  tempF:null,  type:"measured",  event:"Covey: 'allowing it to cure at a slower rate and reducing overpressure' (LAist)",    risk:"Severe"},
    {h:62,   when:"Sun 5/24, 6:00 am",  tempF:null,  type:"measured",  event:"Anaheim official: 'no major changes overnight'; deluge held through water-line event", risk:"Severe"},
    {h:65,   when:"Sun 5/24, 9:00 am",  tempF:null,  type:"modeled",   event:"Current — survival cutoff for the MC posterior",                              risk:"Severe"},
    {h:72,   when:"Sun 5/24, 3:40 pm",  tempF:null,  type:"hypothesized", event:"Hypothesized solar peak window — MC posterior puts ~3% mass here",          risk:"High"},
    {h:96,   when:"Mon 5/25, 3:40 pm",  tempF:null,  type:"hypothesized", event:"Secondary solar peak window; afternoon clustering still holds within days", risk:"High"},
  ],

  // Garden Grove ambient air forecast (°F)
  forecast: [
    {date:"Sun 5/24", hi:76, lo:57, note:"mostly sunny → cloudy"},
    {date:"Mon 5/25", hi:72, lo:57, note:"partly cloudy"},
    {date:"Tue 5/26", hi:69, lo:57, note:"cloudy"},
    {date:"Wed 5/27", hi:69, lo:56, note:"partly cloudy"},
    {date:"Thu 5/28", hi:70, lo:56, note:"partly cloudy"},
  ],

  // Open-source snapshot — every file in /sources/ as of 2026-05-24.
  // Links resolve to the GitHub blob view.
  repoBase: "https://github.com/KaraZajac/garden-grove-mma-analysis/blob/main/",
  sources: {
    news: [
      ["abc-news-50000-evacuation-orders.md",          "ABC News",       "50,000 under evacuation; tank could 'spill or explode'"],
      ["abc7-live-updates-tank-spill-or-explode.md",   "ABC7 LA",        "Live updates; OCFA 1°F/hr rise confirmation"],
      ["abc7-what-is-methyl-methacrylate.md",          "ABC7 LA",        "Explainer on MMA chemistry and hazards"],
      ["cbs-la-44000-evacuated-as-bad-as-ive-seen.md", "CBS LA",         "Covey: 'as bad as I've ever seen' — 61°F Saturday shell reading"],
      ["cbs-la-newsom-state-of-emergency.md",          "CBS LA",         "Newsom declares state of emergency (Sat)"],
      ["cbs-news-what-to-know.md",                     "CBS News",       "National summary"],
      ["fox-news-tank-likely-spill-or-blow.md",        "Fox News",       "Coverage of the two-failure-mode framing"],
      ["foxla-40000-evacuated-overheated-tank.md",     "FOX 11 LA",      "77°F → 90°F Friday reading; deluge ineffective"],
      ["foxla-second-round-evacuations.md",            "FOX 11 LA",      "Re-issued evacuation orders"],
      ["loscerritos-blast-zone-map.md",                "Los Cerritos News", "Blast-zone map graphic"],
      ["mynewsla-ocfa-stabilize-leak.md",              "MyNewsLA",       "OCFA stabilization efforts"],
      ["nbc-la-faulty-valve-leak-or-explode.md",       "NBC LA",         "Faulty valve detail; 60°F Friday afternoon shell reading"],
      ["nbc-la-live-updates-unprecedented.md",         "NBC LA",         "Live updates — 'unprecedented'"],
      ["nbc-la-state-of-emergency-declared.md",        "NBC LA",         "State of emergency declared"],
      ["newsweek-evacuation-map-very-bad.md",          "Newsweek",       "Covey 'very bad chemicals' quote"],
      ["pbs-ap-40000-evacuation-orders.md",            "PBS / AP",       "AP wire via PBS NewsHour"],
      ["wikipedia-garden-grove-chemical-leak.md",      "Wikipedia",      "Garden Grove chemical leak entry"],
      ["cbs-la-da-probe-whistleblowers.md",             "CBS LA",         "DA Spitzer criminal probe; whistleblower appeal; no redundancy"],
      ["mynewsla-residents-remain-rising-threat.md",   "MyNewsLA",       "Saturday updated situation; Covey 'blow up is unacceptable'"],
      ["abc7-evacuation-reissued.md",                  "ABC7 LA",        "Friday reissuance; Covey two-options; faulty valve blocks off-load"],
      ["abc7-temperature-1deg-per-hour.md",            "ABC7 LA",        "Confirms 1°F/hr interior rise rate"],
      ["abc7-spilling-preferred-outcome.md",           "ABC7 LA",        "Covey: 'spilling is the preferred outcome'; storm-drain containment"],
      ["abc7-drone-monitoring-curing-process.md",      "ABC7 LA",        "10-min drone scans; Covey on 'curing process' (gel effect)"],
      ["abc7-firefighters-water-line-issue.md",        "ABC7 LA",        "Sat ~11pm — water-line disruption; water dept re-entered exclusion zone"],
      ["abc7-shelters-fill-covey-environment.md",      "ABC7 LA",        "Shelter capacity; Covey on environmental risk"],
      ["abc7-ocfa-no-public-calls.md",                 "ABC7 LA",        "OCFA asks public to stop calling with suggestions"],
      ["abc7-temperature-stabilized-covey.md",         "ABC7 LA",        "Covey: 'temperature maintained' (later contradicted — exterior only)"],
      ["abc7-temperature-increased-not-cooled.md",     "ABC7 LA",        "OCFA reverses: interior actually rose to 90°F (the key gauge anchor)"],
      ["abc7-progress-cooling-outside-box.md",         "ABC7 LA",        "Sat 9pm — 61°F exterior; 'outside the box' mitigation strategies"],
      ["abc7-class-action-lawsuit.md",                 "ABC7 LA",        "Class-action lawsuit filed by affected residents"],
      ["abc7-da-tip-hotline.md",                       "ABC7 LA",        "DA Spitzer tip line 714-347-8714 for criminal probe"],
      ["anaheim-official-ongoing-may24.md",            "City of Anaheim", "Sun 6am — 'no major changes overnight' (key survival anchor)"],
      ["laist-evacuations-expand-cure-slower.md",      "LAist",          "Covey: 'allowing it to cure at a slower rate'"],
      ["patch-initial-evacuation-lift.md",             "Patch OC",       "Thursday initial coverage and short-lived evacuation lift"],
      ["nbc-la-temperature-increasing.md",             "NBC LA",         "Interior temperature rising despite cooling"],
      ["nbc-la-blast-map.md",                          "NBC LA",         "OCFA blast-zone map released by Division Chief Freeman"],
      ["mynewsla-40000-hazmat-saturday.md",            "MyNewsLA",       "Saturday hazmat update; 40,000 evacuation count"],
      ["newsantaana-tank-update.md",                   "New Santa Ana",  "Local press update Sat"],
      ["loscerritos-gkn-background.md",                "Los Cerritos",   "Background on GKN Aerospace; prior environmental violations"],
      ["oag-price-gouging-alert.md",                   "CA AG",          "California Attorney General price-gouging warning"],
      ["ocde-school-closures.md",                      "OC Dept of Ed",  "Orange County school closures in evacuation zone"],
      ["INDEX.md",                                     "INDEX",          "All news files with summaries"],
    ],
    reference: [
      ["mma-wikipedia.md",                "Wikipedia",   "Methyl methacrylate — chemistry, properties, hazards"],
      ["pmma-wikipedia.md",               "Wikipedia",   "Poly(methyl methacrylate) — polymerization overview"],
      ["mehq-inhibitor.md",               "Wikipedia",   "MEHQ inhibitor — oxygen dependence"],
      ["thermal-runaway-wikipedia.md",    "Wikipedia",   "Thermal runaway primer"],
      ["trommsdorff-effect.md",           "Wikipedia",   "Trommsdorff–Norrish (gel) effect"],
      ["frank-kamenetskii-theory.md",     "Wikipedia",   "Frank-Kamenetskii / Semenov critical δ"],
      ["csb-rohm-haas-2010.md",           "CSB / news",  "Historical analog — 2010 Rohm & Haas MMA tank-car release"],
      ["mma-polymerization-incidents.md", "Composite",   "Other MMA / acrylic runaway incidents"],
      ["model-audit-2026-05-24.md",       "Internal audit","Math/physics audit — found solar phase and O₂ cliff bugs"],
      ["content-review-2026-05-24.md",    "Internal review","Page content review — stale numbers, missing sections"],
      ["gap-analysis-2026-05-24.md",      "Internal review","Technical gap analysis — what an expert would flag as missing"],
      ["mma-sds-composite.md",            "Composite SDS","MMA safety data — composite from multiple suppliers"],
      ["epa-rmp-reference.md",            "EPA",         "Risk Management Program reference (MMA not on §112(r))"],
      ["nfpa-704-mma.md",                 "NFPA",        "NFPA 704 hazard diamond for MMA — 2/3/2"],
      ["INDEX.md",                        "INDEX",       "All reference files with provenance"],
    ],
    weather: [
      ["nws-forecast-garden-grove.md",   "NWS SGX",     "7-day forecast Garden Grove"],
      ["nws-current-conditions.md",      "NWS KSNA",    "John Wayne airport current obs"],
      ["wind-forecast.md",               "NWS",         "Hourly 10-m wind, 72-h outlook"],
      ["airnow-garden-grove.md",         "AirNow/IQAir","Air quality readings"],
      ["solar-times.md",                 "USNO",        "Sunrise/sunset/solar noon, May 24–28"],
      ["facility-location.md",           "OSM/Wiki",    "GKN Aerospace site at 33.787°N, 118.001°W"],
      ["climatology-may.md",             "NCEI",        "KSNA late-May climatology"],
      ["environmental-context.md",       "USGS/CalEJ",  "Population/EJ context for the affected zone"],
      ["INDEX.md",                       "INDEX",       "All weather/environment files"],
    ],
  },

  // Recon findings (Agent 1)
  recon: [
    {k:"Runaway threshold (field)",  v:"≈ 100 °F",     note:"Crews' own description of 'out-of-control' line"},
    {k:"Safe-neutralization target", v:"≈ 50 °F",      note:"'Happy place' for inhibitor injection / off-load"},
    {k:"Last measured interior T",   v:"90 °F",        note:"Fri 5/22 ~9:40 pm PDT (t≈30 h)"},
    {k:"Rate of rise (measured)",    v:"~1 °F / hr",   note:"Between 77 °F and 90 °F readings"},
    {k:"Linear projection failed",   v:"Yes (good)",   note:"Would have crossed 100 °F ~t=40 h; survived to ~t=54 h+"},
    {k:"Inhibitor",                  v:"MEHQ + O₂",    note:"Stops working when dissolved O₂ depletes — hot vapor-locked tank"},
    {k:"Off-load / re-inhibit",      v:"Blocked",      note:"Inoperable valve; deluge is the only control lever"},
    {k:"Historical analog",          v:"Rohm & Haas 2010", note:"Louisville MMA tank-car polymerization release"},
  ],

  // Monte Carlo summary loaded at runtime from assets/montecarlo-results.json.
  // Fallback summary kept in rough sync with the latest model — full physics:
  // PMMA fouling + O₂ cliff + clock-aligned solar + evaporative cooling.
  monteCarlo: {
    runs: 10000,
    holdsPct: 94,
    crossesPct: 6,
    medianCrossingTime: "Sun 5/24 ~8 pm PDT",
    iqr: "Sun 5/24 5:28 am → Tue 5/26 1:42 am PDT",
    bins: [
      {label:"Sat night → Sun 6am",       pct: 0.6, primary:true},
      {label:"Sun 6am – 12pm",            pct: 0.3},
      {label:"Sun 12pm – 7pm",            pct: 0.3},
      {label:"Sun 7pm – midnight",        pct: 0.1},
      {label:"Mon 12am – 12pm",           pct: 0.3},
      {label:"Mon 12pm – 7pm",            pct: 0.2},
      {label:"Mon evening → Tue 6am",     pct: 0.1},
      {label:"Tue (full day)",            pct: 0.2, secondary:true},
      {label:"Wed or later",              pct: 0.2},
      {label:"Does not cross (holds)",    pct: 94.0, hold:true},
    ],
  },
};
