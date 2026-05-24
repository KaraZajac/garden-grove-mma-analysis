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
    {h:42,   when:"Sat 5/23, 9:40 am",  tempF:61,    type:"measured-exterior", event:"Exterior shell reading via unmanned firehoses (CBS/NBC LA)",            risk:"Severe"},
    {h:48,   when:"Sat 5/23, 3:40 pm",  tempF:95,    type:"modeled",   event:"Interior likely still elevated; Covey calls worst of 32-yr career",            risk:"Severe"},
    {h:54,   when:"Sat 5/23, 9:40 pm",  tempF:97,    type:"modeled",   event:"Drone scans every 10 min; air monitors detect no MMA",                         risk:"Severe"},
    {h:60,   when:"Sun 5/24, 3:40 am",  tempF:97,    type:"modeled",   event:"Overnight cooling window — best balance of the cycle",                        risk:"Severe"},
    {h:66,   when:"Sun 5/24, 9:40 am",  tempF:98,    type:"modeled",   event:"Solar warming begins",                                                        risk:"Severe"},
    {h:72,   when:"Sun 5/24, 3:40 pm",  tempF:102,   type:"hypothesized", event:"Primary peak-danger window: solar peak + warmest spray water",             risk:"Critical"},
    {h:78,   when:"Sun 5/24, 9:40 pm",  tempF:104,   type:"hypothesized", event:"Window narrows as solar load fades",                                       risk:"Critical"},
    {h:84,   when:"Mon 5/25, 3:40 am",  tempF:104,   type:"hypothesized", event:"Second overnight cooling window",                                          risk:"Severe"},
    {h:96,   when:"Mon 5/25, 3:40 pm",  tempF:108,   type:"hypothesized", event:"Secondary peak-danger window",                                             risk:"Critical"},
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
      ["model-audit-2026-05-24.md",       "Internal audit","Independent agent review of the simulator math/physics"],
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
  // Fallback summary preserved here for the no-network case.
  monteCarlo: {
    runs: 10000,
    holdsPct: 78,
    crossesPct: 22,
    medianCrossingTime: "Mon 5/25 ~9 pm PDT",
    iqr: "Sun 5/24 evening → Wed 5/27 early am",
    bins: [
      {label:"Sat night → Sun 6am",       pct: 2.3},
      {label:"Sun 6am – 12pm",            pct: 1.4},
      {label:"Sun 12pm – 7pm",            pct: 1.7, primary:true},
      {label:"Sun 7pm – midnight",        pct: 1.1},
      {label:"Mon 12am – 12pm",           pct: 2.5},
      {label:"Mon 12pm – 7pm",            pct: 1.4, secondary:true},
      {label:"Mon evening → Tue 6am",     pct: 1.7},
      {label:"Tue (full day)",            pct: 4.5},
      {label:"Wed or later",              pct: 4.9},
      {label:"Does not cross (holds)",    pct:78.5, hold:true},
    ],
  },
};
