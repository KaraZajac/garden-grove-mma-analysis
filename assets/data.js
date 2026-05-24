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
    {h:48,   when:"Sat 5/23, 3:40 pm",  tempF:95,    type:"modeled",   event:"Tank 'remains extremely hot'; Covey calls worst of 32-yr career",             risk:"Severe"},
    {h:54,   when:"Sat 5/23, 9:40 pm",  tempF:97,    type:"modeled",   event:"Drone scans every 10 min; no MMA detected by air monitors",                   risk:"Severe"},
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

  // Monte Carlo summary (300k runs, conditioned on survival to ~t=54 h)
  monteCarlo: {
    runs: 300000,
    holdsPct: 67,
    crossesPct: 33,
    medianCrossingTime: "Sun 5/24, ~3:40 pm PDT",
    iqr: "Sun midday → Mon afternoon",
    bins: [
      {label:"Sat night (now → Sun 6a)",      pct: 1},
      {label:"Sun afternoon (12–7 pm PDT)",   pct:13, primary:true},
      {label:"Sun evening/night",             pct: 1},
      {label:"Mon afternoon",                 pct: 8, secondary:true},
      {label:"Tue or later",                  pct: 5},
      {label:"Does not cross (holds)",        pct:67, hold:true},
    ],
  },
};
