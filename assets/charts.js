// Chart rendering for the Garden Grove MMA page.
// Requires Chart.js (loaded via CDN in index.html) and GG (data.js), GG_SIM (simulator.js).

(function(){
  // Catppuccin Latte
  const ctp = {
    text:'#4c4f69', subtext1:'#5c5f77', subtext0:'#6c6f85',
    surface2:'#acb0be', surface1:'#bcc0cc', surface0:'#ccd0da',
    red:'#d20f39', maroon:'#e64553', peach:'#fe640b',
    yellow:'#df8e1d', green:'#40a02b', teal:'#179299',
    sky:'#04a5e5', blue:'#1e66f5', mauve:'#8839ef', lavender:'#7287fd',
    overlay1:'#8c8fa1',
  };
  const ink = ctp.text, muted = ctp.subtext0, line = ctp.surface1;
  Chart.defaults.color = muted;
  Chart.defaults.borderColor = line;
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

  const measured       = GG.timeline.filter(r => r.type === 'measured'          && r.tempF !== null).map(r => ({x:r.h, y:r.tempF}));
  const measuredExt    = GG.timeline.filter(r => r.type === 'measured-exterior' && r.tempF !== null).map(r => ({x:r.h, y:r.tempF}));
  const modeled        = GG.timeline.filter(r => r.type === 'modeled'           && r.tempF !== null).map(r => ({x:r.h, y:r.tempF}));
  const hypo           = GG.timeline.filter(r => r.type === 'hypothesized'      && r.tempF !== null).map(r => ({x:r.h, y:r.tempF}));

  // ---------- Chart 1: Timeline (measured + modeled + hypothesized) ----------
  new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: {
      datasets: [
        {label:'Measured (interior)', data: measured,    borderColor:ctp.green,  backgroundColor:ctp.green,  pointRadius:6, showLine:true, borderWidth:2, tension:0.2},
        {label:'Measured (exterior)', data: measuredExt, borderColor:ctp.teal,   backgroundColor:ctp.teal,   pointRadius:6, pointStyle:'triangle', showLine:false},
        {label:'Modeled',             data: modeled,     borderColor:ctp.yellow, backgroundColor:ctp.yellow, pointRadius:5, showLine:true, borderDash:[4,4], borderWidth:2, tension:0.2},
        {label:'Hypothesized',        data: hypo,        borderColor:ctp.mauve,  backgroundColor:ctp.mauve,  pointRadius:5, showLine:true, borderDash:[2,4], borderWidth:2, tension:0.2},
        {label:'Runaway threshold (100 °F)', data:[{x:0,y:100},{x:100,y:100}], borderColor:ctp.red,   borderWidth:1.5, borderDash:[6,4], pointRadius:0, showLine:true},
        {label:'Safe target (50 °F)',        data:[{x:0,y:50},{x:100,y:50}],   borderColor:ctp.green, borderWidth:1,   borderDash:[2,4], pointRadius:0, showLine:true},
      ]
    },
    options: {
      maintainAspectRatio:false,
      scales: {
        x:{type:'linear', title:{display:true, text:'Hours since incident start (Hr 0 = Thu 5/21 3:40 pm PDT)', color:muted}, grid:{color:line}},
        y:{title:{display:true, text:'Tank interior temperature (°F)', color:muted}, grid:{color:line}, suggestedMin:40, suggestedMax:120},
      },
      plugins: {
        legend: {position:'bottom', labels:{color:ink}},
        tooltip: {callbacks: {label: (ctx)=>` ${ctx.dataset.label}: ${ctx.parsed.y} °F @ t=${ctx.parsed.x}h`}}
      }
    }
  });

  // ---------- Chart 2: Monte Carlo distribution ----------
  function colorFor(b){
    return b.hold ? ctp.green
         : b.primary ? ctp.red
         : b.secondary ? ctp.peach
         : b.tertiary ? ctp.maroon
         : ctp.overlay1;
  }
  const mcChart = new Chart(document.getElementById('chart-mc'), {
    type: 'bar',
    data: {
      labels: GG.monteCarlo.bins.map(b => b.label),
      datasets: [{
        label: 'Probability (%)',
        data: GG.monteCarlo.bins.map(b => b.pct),
        backgroundColor: GG.monteCarlo.bins.map(colorFor),
        borderColor: line, borderWidth: 1,
      }]
    },
    options: {
      indexAxis:'y', maintainAspectRatio:false,
      scales: {
        x:{title:{display:true, text:'Probability (%)', color:muted}, grid:{color:line}, suggestedMax:80},
        y:{grid:{color:line}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:(ctx)=>{
          const n = (window.__mcRuns || 10000);
          return ` ${ctx.parsed.x}% of ${n.toLocaleString()} accepted runs`;
        }}}
      }
    }
  });
  // Hydrate from the live Node-generated JSON if available.
  fetch('assets/montecarlo-results.json', { cache:'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (!j) return;
      window.__mcRuns = j.n_accepted;
      mcChart.data.labels = j.bins.map(b => b.label);
      mcChart.data.datasets[0].data = j.bins.map(b => b.pct);
      mcChart.data.datasets[0].backgroundColor = j.bins.map(colorFor);
      mcChart.update();
      // Patch summary boxes if present
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('mc-runs',    j.n_accepted.toLocaleString());
      set('mc-holds',   j.holds_pct.toFixed(1) + ' %');
      set('mc-cross',   j.crosses_pct.toFixed(1) + ' %');
      set('mc-median',  j.median_crossing_label || '— (held)');
      set('mc-iqr',     j.iqr_p25_label && j.iqr_p75_label
                        ? `${j.iqr_p25_label} → ${j.iqr_p75_label}` : '—');
      set('mc-accept',  j.acceptance_rate.toFixed(1) + ' %');
      set('mc-peak50',  j.peak_p50_F?.toFixed(0) + ' °F');
      set('mc-peak90',  j.peak_p90_F?.toFixed(0) + ' °F');
      set('mc-asof',    new Date(j.generated_at).toLocaleString());
    })
    .catch(()=>{});

  // ---------- Chart 3: Forecast ambient ----------
  new Chart(document.getElementById('chart-forecast'), {
    type:'bar',
    data:{
      labels: GG.forecast.map(d => d.date),
      datasets:[
        {label:'High °F', data:GG.forecast.map(d=>d.hi), backgroundColor:ctp.peach, borderColor:line, borderWidth:1},
        {label:'Low °F',  data:GG.forecast.map(d=>d.lo), backgroundColor:ctp.blue,  borderColor:line, borderWidth:1},
      ]
    },
    options:{
      maintainAspectRatio:false,
      scales:{
        x:{grid:{color:line}},
        y:{title:{display:true, text:'°F', color:muted}, grid:{color:line}, suggestedMin:40, suggestedMax:90}
      },
      plugins:{legend:{position:'bottom', labels:{color:ink}}}
    }
  });

  // ---------- Simulator: live ODE plot ----------
  const sliders = {
    UA:        document.getElementById('s-UA'),
    Ea:        document.getElementById('s-Ea'),
    T0:        document.getElementById('s-T0'),
    Twater:    document.getElementById('s-Twater'),
    solarAmp:  document.getElementById('s-solar'),
    fPlate:    document.getElementById('s-fplate'),
  };
  const labels = {
    UA:        document.getElementById('v-UA'),
    Ea:        document.getElementById('v-Ea'),
    T0:        document.getElementById('v-T0'),
    Twater:    document.getElementById('v-Twater'),
    solarAmp:  document.getElementById('v-solar'),
    fPlate:    document.getElementById('v-fplate'),
  };
  const stats = {
    peak:   document.getElementById('stat-peak'),
    cross:  document.getElementById('stat-cross'),
    end:    document.getElementById('stat-end'),
    status: document.getElementById('stat-status'),
  };

  const tempChart = new Chart(document.getElementById('chart-sim-temp'), {
    type:'line',
    data:{datasets:[
      {label:'Tank T (°F)', borderColor:ctp.peach, backgroundColor:'rgba(254,100,11,.10)', borderWidth:2, pointRadius:0, fill:true, tension:0.2, data:[]},
      {label:'Runaway 100 °F', borderColor:ctp.red, borderDash:[4,4], borderWidth:1, pointRadius:0, data:[]},
    ]},
    options:{
      maintainAspectRatio:false, animation:false,
      scales:{
        x:{type:'linear', title:{display:true, text:'Hours since start', color:muted}, grid:{color:line}},
        y:{title:{display:true, text:'°F', color:muted}, grid:{color:line}, suggestedMin:50, suggestedMax:160},
      },
      plugins:{legend:{labels:{color:ink}}}
    }
  });

  const heatChart = new Chart(document.getElementById('chart-sim-heat'), {
    type:'line',
    data:{datasets:[
      {label:'Q_gen (W)',  borderColor:ctp.red,  borderWidth:2, pointRadius:0, tension:0.2, data:[]},
      {label:'Q_cool (W)', borderColor:ctp.blue, borderWidth:2, pointRadius:0, tension:0.2, data:[]},
    ]},
    options:{
      maintainAspectRatio:false, animation:false,
      scales:{
        x:{type:'linear', title:{display:true, text:'Hours since start', color:muted}, grid:{color:line}},
        y:{type:'logarithmic', title:{display:true, text:'Heat rate (W, log)', color:muted}, grid:{color:line}}
      },
      plugins:{legend:{labels:{color:ink}}}
    }
  });

  function readParams(){
    const UA       = +sliders.UA.value;
    const Ea       = +sliders.Ea.value * 1000;
    const T0       = GG_SIM.F2K(+sliders.T0.value);
    const Twater   = GG_SIM.F2K(+sliders.Twater.value);
    const solarAmp = +sliders.solarAmp.value;
    const fPlate   = +sliders.fPlate.value;
    labels.UA.textContent       = UA + ' W/K';
    labels.Ea.textContent       = (Ea/1000) + ' kJ/mol';
    labels.T0.textContent       = sliders.T0.value + ' °F';
    labels.Twater.textContent   = sliders.Twater.value + ' °F';
    labels.solarAmp.textContent = solarAmp + ' W';
    labels.fPlate.textContent   = fPlate.toFixed(2);
    return {UA, Ea, T0, Twater, solarAmp, fPlate};
  }

  function run(){
    const p = readParams();
    const hoursForward = 72;
    const startHour = 54;
    const out = GG_SIM.simulate(p, hoursForward, startHour);

    tempChart.data.datasets[0].data = out.t.map((x,i)=>({x, y:out.TF[i]}));
    tempChart.data.datasets[1].data = [{x:startHour, y:100},{x:startHour+hoursForward, y:100}];
    tempChart.update('none');

    heatChart.data.datasets[0].data = out.t.map((x,i)=>({x, y:Math.max(1,out.Qgen[i])}));
    heatChart.data.datasets[1].data = out.t.map((x,i)=>({x, y:Math.max(1,out.Qcool[i])}));
    heatChart.update('none');

    const peak  = Math.max(...out.TF);
    const end   = out.TF[out.TF.length-1];
    stats.peak.textContent  = peak.toFixed(0) + ' °F';
    stats.end.textContent   = end.toFixed(0) + ' °F';
    stats.cross.textContent = out.crossed === null
        ? '— (holds)'
        : 't=' + out.crossed.toFixed(1) + 'h';
    if (out.runaway){
      stats.status.textContent = 'RUNAWAY';
      stats.status.style.color = ctp.red;
    } else if (out.crossed !== null){
      stats.status.textContent = 'CROSSED';
      stats.status.style.color = ctp.peach;
    } else if (peak < 95){
      stats.status.textContent = 'STABLE';
      stats.status.style.color = ctp.green;
    } else {
      stats.status.textContent = 'NEAR-BAL';
      stats.status.style.color = ctp.yellow;
    }
  }

  Object.values(sliders).forEach(s => s.addEventListener('input', run));
  document.querySelectorAll('[data-preset]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const preset = btn.dataset.preset;
      if (preset === 'baseline'){
        sliders.UA.value=2200; sliders.Ea.value=95; sliders.T0.value=90; sliders.Twater.value=75; sliders.solarAmp.value=250; sliders.fPlate.value=0.30;
      } else if (preset === 'cooling-wins'){
        sliders.UA.value=3500; sliders.Ea.value=95; sliders.T0.value=90; sliders.Twater.value=70; sliders.solarAmp.value=200; sliders.fPlate.value=0.15;
      } else if (preset === 'cooling-lost'){
        sliders.UA.value=900;  sliders.Ea.value=95; sliders.T0.value=92; sliders.Twater.value=78; sliders.solarAmp.value=400; sliders.fPlate.value=0.45;
      } else if (preset === 'inhibitor-gone'){
        sliders.UA.value=1500; sliders.Ea.value=85; sliders.T0.value=92; sliders.Twater.value=75; sliders.solarAmp.value=300; sliders.fPlate.value=0.30;
      }
      run();
    });
  });
  run();
})();
