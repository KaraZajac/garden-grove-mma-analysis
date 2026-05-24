# Garden Grove MMA Tank — Thermal Runaway Analysis

A single-page analytical site documenting the Garden Grove (CA) methyl methacrylate (MMA) storage-tank incident: the chemistry, a calibrated thermal-runaway simulation, a Monte Carlo failure-window estimate, and a peak-danger hypothesis brief.

## What's in here

- `index.html` — the site. Open it directly in a browser.
- `assets/styles.css` — layout and print styles.
- `assets/simulator.js` — lumped energy-balance ODE model (Arrhenius + inhibitor depletion + gel-effect autoacceleration + diurnal solar/cooling). Interactive sliders.
- `assets/charts.js` — Chart.js renderings (timeline, scenario fan, Monte Carlo distribution, heat-balance, Semenov phase plot).
- `assets/data.js` — measured anchors, recon findings, forecast, Monte Carlo results.

## Local run

No build step. Either:

```bash
open index.html
```

or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Method, briefly

Three coupled ODEs on temperature `T`, conversion `X`, and inhibitor `I`:

- `k(T) = A·exp(-Ea/RT)` (Arrhenius)
- `dX/dt = k(T)·(1-X)·(1-I)·g(X)` with `g(X)` the Trommsdorff gel-effect amplifier
- `dI/dt = -c·k(T)` (MEHQ burns down; requires O₂, which depletes in a hot vapor-locked tank)
- `dT/dt = (Q_gen - Q_cool)/(m·Cp)` with `Q_gen = m·ΔH_p·dX/dt` and `Q_cool = UA(t)·(T - T_water(t))`

Failure criterion: temperature crosses the field-reported ~100 °F "out-of-control" line. Monte Carlo over the uncertain parameters (Ea, UA, inhibitor mass, threshold T), conditioned on survival to the present.

## Important limitations

- The kinetic constants are representative, not measured for this exact aged batch.
- The 100 °F threshold is a verbal field estimate from responders, not a lab value.
- Every temperature past the Friday-night 90 °F anchor is **modeled**, not measured.
- This is an analytical hypothesis brief. Not operational guidance. Defer to OCFA.

## Sources

See the "Sources & caveats" section in `index.html`.
