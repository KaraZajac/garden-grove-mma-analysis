// Chart rendering for the Garden Grove MMA page.
// Requires Chart.js (loaded via CDN in index.html) and GG (data.js), GG_SIM (simulator.js).

(function(){
  const ink = '#e6edf3', muted = '#8b949e', line = '#30363d';
  Chart.defaults.color = muted;
  Chart.defaults.borderColor = line;
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

  const measured = GG.timeline.filter(r => r.type === 'measured' && r.tempF !== null)
                              .map(r => ({x:r.h, y:r.tempF}));
  const modeled  = GG.timeline.filter(r => r.type === 'modeled'  && r.tempF !== null)
                              .map(r => ({x:r.h, y:r.tempF}));
  const hypo     = GG.timeline.filter(r => r.type === 'hypothesized' && r.tempF !== null)
                              .map(r => ({x:r.h, y:r.tempF}));

  // ---------- Chart 1: Timeline (measured + modeled + hypothesized) ----------
  new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: {
      datasets: [
        {label:'Measured',     data: measured, borderColor:'#3fb950', backgroundColor:'#3fb950', pointRadius:6, showLine:true, borderWidth:2, tension:0.2},
        {label:'Modeled',      data: modeled,  borderColor:'#d29922', backgroundColor:'#d29922', pointRadius:5, showLine:true, borderDash:[4,4], borderWidth:2, tension:0.2},
        {label:'Hypothesized', data: hypo,     borderColor:'#a371f7', backgroundColor:'#a371f7', pointRadius:5, showLine:true, borderDash:[2,4], borderWidth:2, tension:0.2},
        {label:'Runaway threshold (100 °F)', data:[{x:0,y:100},{x:100,y:100}], borderColor:'#f85149', borderWidth:1.5, borderDash:[6,4], pointRadius:0, showLine:true},
        {label:'Safe target (50 °F)',        data:[{x:0,y:50},{x:100,y:50}],   borderColor:'#3fb950', borderWidth:1,  borderDash:[2,4], pointRadius:0, showLine:true},
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
  const mc = GG.monteCarlo;
  new Chart(document.getElementById('chart-mc'), {
    type: 'bar',
    data: {
      labels: mc.bins.map(b => b.label),
      datasets: [{
        label: 'Probability (%)',
        data: mc.bins.map(b => b.pct),
        backgroundColor: mc.bins.map(b =>
          b.hold ? '#3fb950'
          : b.primary ? '#f85149'
          : b.secondary ? '#f0883e'
          : '#8b949e'),
        borderColor: line,
        borderWidth: 1,
      }]
    },
    options: {
      indexAxis:'y',
      maintainAspectRatio:false,
      scales: {
        x:{title:{display:true, text:'Probability (%)', color:muted}, grid:{color:line}, suggestedMax:75},
        y:{grid:{color:line}}
      },
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:(ctx)=>` ${ctx.parsed.x}% of 300k runs`}}
      }
    }
  });

  // ---------- Chart 3: Forecast ambient ----------
  new Chart(document.getElementById('chart-forecast'), {
    type:'bar',
    data:{
      labels: GG.forecast.map(d => d.date),
      datasets:[
        {label:'High °F', data:GG.forecast.map(d=>d.hi), backgroundColor:'#f0883e', borderColor:line, borderWidth:1},
        {label:'Low °F',  data:GG.forecast.map(d=>d.lo), backgroundColor:'#58a6ff', borderColor:line, borderWidth:1},
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
  };
  const labels = {
    UA:        document.getElementById('v-UA'),
    Ea:        document.getElementById('v-Ea'),
    T0:        document.getElementById('v-T0'),
    Twater:    document.getElementById('v-Twater'),
    solarAmp:  document.getElementById('v-solar'),
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
      {label:'Tank T (°F)', borderColor:'#ff7a45', backgroundColor:'rgba(255,122,69,.1)', borderWidth:2, pointRadius:0, fill:true, tension:0.2, data:[]},
      {label:'Runaway 100 °F', borderColor:'#f85149', borderDash:[4,4], borderWidth:1, pointRadius:0, data:[]},
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
      {label:'Q_gen (W)', borderColor:'#f85149', borderWidth:2, pointRadius:0, tension:0.2, data:[]},
      {label:'Q_cool (W)', borderColor:'#58a6ff', borderWidth:2, pointRadius:0, tension:0.2, data:[]},
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
    labels.UA.textContent       = UA + ' W/K';
    labels.Ea.textContent       = (Ea/1000) + ' kJ/mol';
    labels.T0.textContent       = sliders.T0.value + ' °F';
    labels.Twater.textContent   = sliders.Twater.value + ' °F';
    labels.solarAmp.textContent = solarAmp + ' W';
    return {UA, Ea, T0, Twater, solarAmp};
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
      stats.status.style.color = '#f85149';
    } else if (out.crossed !== null){
      stats.status.textContent = 'CROSSED';
      stats.status.style.color = '#f0883e';
    } else if (peak < 95){
      stats.status.textContent = 'STABLE';
      stats.status.style.color = '#3fb950';
    } else {
      stats.status.textContent = 'NEAR-BAL';
      stats.status.style.color = '#d29922';
    }
  }

  Object.values(sliders).forEach(s => s.addEventListener('input', run));
  document.querySelectorAll('[data-preset]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const preset = btn.dataset.preset;
      if (preset === 'baseline'){
        sliders.UA.value=2200; sliders.Ea.value=95; sliders.T0.value=90; sliders.Twater.value=75; sliders.solarAmp.value=250;
      } else if (preset === 'cooling-wins'){
        sliders.UA.value=3500; sliders.Ea.value=95; sliders.T0.value=90; sliders.Twater.value=70; sliders.solarAmp.value=200;
      } else if (preset === 'cooling-lost'){
        sliders.UA.value=600;  sliders.Ea.value=95; sliders.T0.value=98; sliders.Twater.value=78; sliders.solarAmp.value=400;
      } else if (preset === 'inhibitor-gone'){
        sliders.UA.value=1500; sliders.Ea.value=85; sliders.T0.value=95; sliders.Twater.value=75; sliders.solarAmp.value=300;
      }
      run();
    });
  });
  run();
})();
