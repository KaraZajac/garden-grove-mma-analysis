// Render the consequence model on a Leaflet map.
// Requires Leaflet (loaded via CDN) and GG_CONSEQ (consequence.js).

(function(){
  // Approximate GKN Aerospace Garden Grove site (Knott St / Trask area).
  // User can drag the marker to refine.
  const facility = { lat: 33.7779, lng: -117.9989 };

  // Approximate evacuation polygon: bounded by Ball / Trask / Valley View / Dale.
  // (Used as visual reference only — actual polygon should come from OCFA.)
  const evacPolygon = [
    [33.7849, -118.0210],  // NW: Ball & Valley View
    [33.7849, -117.9810],  // NE: Ball & Dale
    [33.7649, -117.9810],  // SE: Trask & Dale
    [33.7649, -118.0210],  // SW: Trask & Valley View
  ];

  const map = L.map('consequence-map', {
    center: [facility.lat, facility.lng],
    zoom: 14,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  const evacLayer = L.polygon(evacPolygon, {
    color: '#8839ef', weight: 2, fillOpacity: 0.06, dashArray: '6,4',
  }).addTo(map).bindTooltip('OCFA evacuation zone (approx.)');

  const facilityMarker = L.marker([facility.lat, facility.lng], { draggable: true })
    .addTo(map)
    .bindTooltip('GKN Aerospace tank (drag to refine)', { permanent: false });

  // Overlay layers (ring/cone), repopulated on every recompute
  let overlays = [];
  function clearOverlays(){
    overlays.forEach(l => map.removeLayer(l));
    overlays = [];
  }

  function addRing(center, radiusM, color, label){
    const c = L.circle(center, {
      radius: radiusM, color, weight: 2,
      fillColor: color, fillOpacity: 0.10,
    }).addTo(map).bindTooltip(`${label}: ${(radiusM).toFixed(0)} m / ${(radiusM/1609.344).toFixed(2)} mi`);
    overlays.push(c);
  }

  // Wind cone: an angular wedge from the facility extending downwind.
  function addCone(center, distM, bearingDeg, halfAngleDeg, color, label){
    const pts = [center];
    const steps = 18;
    const R = 6371000; // m
    const φ1 = center[0] * Math.PI/180;
    const λ1 = center[1] * Math.PI/180;
    for (let i = 0; i <= steps; i++){
      const θ = (bearingDeg - halfAngleDeg + (2*halfAngleDeg) * i/steps) * Math.PI/180;
      const δ = distM / R;
      const φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
      const λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                                  Math.cos(δ) - Math.sin(φ1)*Math.sin(φ2));
      pts.push([φ2 * 180/Math.PI, λ2 * 180/Math.PI]);
    }
    pts.push(center);
    const p = L.polygon(pts, {
      color, weight: 2, fillColor: color, fillOpacity: 0.12, dashArray: '4,3',
    }).addTo(map).bindTooltip(`${label}: ${(distM).toFixed(0)} m / ${(distM/1609.344).toFixed(2)} mi`);
    overlays.push(p);
  }

  // ---- Control wiring ---------------------------------------------------
  const $ = id => document.getElementById(id);
  const fillEl = $('c-fill'), fillL = $('c-fill-v');
  const fracEl = $('c-frac'), fracL = $('c-frac-v');
  const branchEl = $('c-branch');
  const windEl = $('c-wind'), windL = $('c-wind-v');
  const dirEl = $('c-dir'), dirL = $('c-dir-v');
  const stabEl = $('c-stab');
  const yieldEl = $('c-yield'), yieldL = $('c-yield-v');

  const sumA = $('c-sum-a'), sumB = $('c-sum-b'), sumC = $('c-sum-c'), sumD = $('c-sum-d');

  function fmtM(m){
    if (m < 1) return '<1 m';
    if (m < 1000) return `${m.toFixed(0)} m`;
    return `${(m/1000).toFixed(2)} km (${(m/1609.344).toFixed(2)} mi)`;
  }

  function update(){
    facilityMarker.getLatLng();
    const center = [facilityMarker.getLatLng().lat, facilityMarker.getLatLng().lng];

    const scenario = {
      branch: branchEl.value,
      tankFillGal: +fillEl.value,
      spillFracIfFail: +fracEl.value / 100,
      yieldFrac: +yieldEl.value / 100,
      windMs: +windEl.value,
      stability: stabEl.value,
    };
    fillL.textContent  = (+fillEl.value).toLocaleString() + ' gal';
    fracL.textContent  = fracEl.value + ' %';
    windL.textContent  = (+windEl.value).toFixed(1) + ' m/s';
    dirL.textContent   = dirEl.value + '°';
    yieldL.textContent = yieldEl.value + ' %';

    const r = GG_CONSEQ.evaluate(scenario);
    clearOverlays();

    // Always draw the pool footprint (small)
    if (r.pool && r.pool.radiusM > 0.5){
      addRing(center, r.pool.radiusM, '#179299', 'Liquid pool radius');
    }

    if (r.branch === 'spill' || r.branch === 'explosion'){
      if (r.thermal){
        addRing(center, r.thermal.burns1stDegM, '#fe640b', 'Thermal 4 kW/m² (pain in 20s)');
        addRing(center, r.thermal.burns2ndDegM, '#e64553', 'Thermal 12.5 kW/m² (burns)');
        addRing(center, r.thermal.structuralM,  '#d20f39', 'Thermal 37.5 kW/m² (structural)');
      }
    }

    if (r.branch === 'vapor'){
      const bearing = +dirEl.value;
      if (r.vapor){
        addCone(center, r.vapor.halfLelDistanceM, bearing, 18, '#df8e1d', '½ LEL footprint (precaution)');
        addCone(center, r.vapor.lelDistanceM,     bearing, 12, '#d20f39', 'LEL footprint (flammable)');
      }
    }

    if (r.branch === 'explosion'){
      if (r.blast){
        addRing(center, r.blast.d_1psi,  '#df8e1d', 'Blast 1 psi (windows break)');
        addRing(center, r.blast.d_3psi,  '#fe640b', 'Blast 3 psi (serious injury)');
        addRing(center, r.blast.d_5psi,  '#e64553', 'Blast 5 psi (frame collapse)');
        addRing(center, r.blast.d_10psi, '#d20f39', 'Blast 10 psi (fatal)');
      }
    }

    // Summary cards
    sumA.textContent = `${r.releasedGal.toLocaleString(undefined,{maximumFractionDigits:0})} gal`;
    sumB.textContent = `${(r.releasedKg/1000).toFixed(1)} t`;

    if (r.branch === 'spill'){
      sumC.textContent = fmtM(r.thermal.burns2ndDegM);
      sumD.textContent = `pool r=${fmtM(r.pool.radiusM)}`;
    } else if (r.branch === 'vapor'){
      sumC.textContent = fmtM(r.vapor.lelDistanceM);
      sumD.textContent = `½LEL ${fmtM(r.vapor.halfLelDistanceM)}`;
    } else {
      sumC.textContent = fmtM(r.blast.d_3psi);
      sumD.textContent = `TNT-eq ${r.blast.Wtnt_kg.toFixed(0)} kg`;
    }
  }

  [fillEl, fracEl, branchEl, windEl, dirEl, stabEl, yieldEl].forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });
  facilityMarker.on('drag', update);

  // Branch presets reveal/hide relevant controls
  function syncBranchUI(){
    const b = branchEl.value;
    document.querySelectorAll('[data-branch]').forEach(el => {
      const list = el.dataset.branch.split(',');
      el.style.display = list.includes(b) ? '' : 'none';
    });
  }
  branchEl.addEventListener('change', syncBranchUI);
  syncBranchUI();
  update();
})();
