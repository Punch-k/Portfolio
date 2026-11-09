/* S&OP and Inventory Optimization. Portfolio case study by Prapanch Kokkalemada.
   Everything on the page is calculated here from data.csv (US Census Monthly Retail Trade). */
'use strict';

/* ---------- 0. Shared site chrome (same behaviour as the portfolio homepage and SCOPSim) ---------- */
(function chrome() {
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cdot = document.getElementById('cdot'), cring = document.getElementById('cring'), aura = document.getElementById('aura');
  if (isDesktop && cdot && cring) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, ax = mx, ay = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cdot.style.left = mx + 'px'; cdot.style.top = my + 'px';
      rx += (mx - rx) * .11; ry += (my - ry) * .11;
      cring.style.left = rx + 'px'; cring.style.top = ry + 'px';
      ax += (mx - ax) * .04; ay += (my - ay) * .04;
      if (aura) aura.style.transform = `translate(calc(${ax}px - 50%), calc(${ay}px - 50%))`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mousedown', () => cring.classList.add('clk'));
    document.addEventListener('mouseup', () => cring.classList.remove('clk'));
    document.addEventListener('mouseover', e => { if (e.target.closest('a,button,select,input,label,tr.click')) cring.classList.add('hov'); });
    document.addEventListener('mouseout', e => { if (e.target.closest('a,button,select,input,label,tr.click')) cring.classList.remove('hov'); });
  } else {
    document.body.style.cursor = 'auto';
    [cdot, cring].forEach(el => el && (el.style.display = 'none'));
  }
  const sprog = document.getElementById('sprog'), nav = document.getElementById('mainnav');
  window.addEventListener('scroll', () => {
    const h = document.body.scrollHeight - innerHeight;
    if (sprog) sprog.style.width = Math.min(h > 0 ? scrollY / h * 100 : 0, 100) + '%';
    if (nav) nav.classList.toggle('stk', scrollY > 55);
  }, { passive: true });
  const toggle = document.getElementById('nav-toggle'), menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      toggle.classList.toggle('open', open); menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open'); menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    }));
  }
  const top = document.getElementById('footer-top-btn');
  if (top) top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  // step tabs: scroll to section, highlight the one in view
  const steps = document.querySelectorAll('#steps [data-go]');
  steps.forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.go);
    if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' });
  }));
  window.addEventListener('scroll', () => {
    let cur = null;
    steps.forEach(b => { const s = document.getElementById(b.dataset.go); if (s && s.getBoundingClientRect().top < 200) cur = b; });
    steps.forEach(b => b.classList.toggle('active', b === (cur || steps[0])));
  }, { passive: true });
})();

/* ---------- 1. Helpers ---------- */
const $ = id => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n, d = 1) => (n * 100).toFixed(d) + '%';
const usdM = (n, d = 0) => '$' + fmt(n, d) + 'M';
const usdB = n => n >= 1000 ? '$' + (n / 1000).toFixed(2) + 'B' : usdM(n);
const sum = a => a.reduce((s, x) => s + x, 0);
const mean = a => sum(a) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - 1)); };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mlabel = ym => { const [y, m] = ym.split('-'); return MONTHS[+m - 1] + ' ' + y; };
const addMonths = (ym, k) => { let [y, m] = ym.split('-').map(Number); m += k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + String(m).padStart(2, '0'); };

// standard normal
const phi = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
function Phi(z) { // Abramowitz-Stegun 26.2.17
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
function invPhi(p) { // Acklam rational approximation
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const lossG = z => phi(z) - z * (1 - Phi(z)); // standard normal loss function

function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.length > 1) rows.push(row); row = []; }
    else f += ch;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows.shift();
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

/* ---------- 2. Forecast methods ---------- */
const M = 12;
const METHODS = [
  { key: 'naive', name: 'Naive', color: '#787570' },
  { key: 'snaive', name: 'Seasonal naive', color: '#4a90e2' },
  { key: 'ets', name: 'ETS (Holt-Winters)', color: '#c9a84c' },
];

function etsInit(y, mul) {
  const y1 = y.slice(0, M), y2 = y.slice(M, 2 * M);
  const l = mean(y1), b = (mean(y2) - mean(y1)) / M;
  const s = y1.map(v => mul ? v / l : v - l);
  return { l, b, s };
}
// Run Holt-Winters damped filter over y[0..n). Returns state after n points and one-step errors from t>=M.
function etsRun(y, n, p, mul) {
  let { l, b, s } = etsInit(y, mul); s = s.slice();
  let sse = 0, cnt = 0;
  for (let t = M; t < n; t++) {
    const si = s[t % M];
    const fc = mul ? (l + p.phi * b) * si : (l + p.phi * b) + si;
    const e = y[t] - fc; sse += e * e; cnt++;
    const lNew = mul ? p.a * (y[t] / si) + (1 - p.a) * (l + p.phi * b) : p.a * (y[t] - si) + (1 - p.a) * (l + p.phi * b);
    const bNew = p.b * (lNew - l) + (1 - p.b) * p.phi * b;
    s[t % M] = mul ? p.g * (y[t] / lNew) + (1 - p.g) * si : p.g * (y[t] - lNew) + (1 - p.g) * si;
    l = lNew; b = bNew;
  }
  return { l, b, s, sse, cnt, n };
}
function etsForecast(st, h, p, mul) {
  const out = []; let damp = 0;
  for (let k = 1; k <= h; k++) {
    damp += Math.pow(p.phi, k);
    const si = st.s[(st.n + k - 1) % M];
    out.push(mul ? (st.l + damp * st.b) * si : (st.l + damp * st.b) + si);
  }
  return out;
}
function etsFit(y, n, mul) {
  let best = null;
  for (const a of [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95])
    for (const b of [0.01, 0.03, 0.05, 0.1, 0.2])
      for (const g of [0.05, 0.15, 0.3, 0.5, 0.7])
        for (const ph of [0.9, 0.95, 0.98, 1]) {
          const p = { a, b, g, phi: ph };
          const r = etsRun(y, n, p, mul);
          if (!best || r.sse < best.sse) best = { p, sse: r.sse };
        }
  return best.p;
}

// Backtest one series. origin = index of first holdout month.
function backtest(y, H, mode, mul, manualP) {
  const n = y.length, origin = n - H;
  const p = manualP || etsFit(y, origin, mul);
  const fc = { naive: [], snaive: [], ets: [] };
  if (mode === 'fixed') {
    for (let h = 1; h <= H; h++) {
      fc.naive.push(y[origin - 1]);
      fc.snaive.push(y[origin + h - 1 - M * Math.ceil(h / M)]);
    }
    fc.ets = etsForecast(etsRun(y, origin, p, mul), H, p, mul);
  } else {
    for (let t = origin; t < n; t++) {
      fc.naive.push(y[t - 1]);
      fc.snaive.push(y[t - M]);
      fc.ets.push(etsForecast(etsRun(y, t, p, mul), 1, p, mul)[0]);
    }
  }
  const act = y.slice(origin);
  const metrics = {};
  for (const k of Object.keys(fc)) {
    const e = fc[k].map((f, i) => f - act[i]);
    metrics[k] = {
      mape: mean(e.map((x, i) => Math.abs(x) / act[i])),
      wape: sum(e.map(Math.abs)) / sum(act),
      bias: sum(e) / sum(act),
      rmse: Math.sqrt(mean(e.map(x => x * x))),
    };
  }
  const best = Object.keys(metrics).reduce((a, b) => metrics[a].wape <= metrics[b].wape ? a : b);
  // forward 12 months from the end of data, same params
  const fwd = {
    naive: Array(12).fill(y[n - 1]),
    snaive: Array.from({ length: 12 }, (_, i) => y[n - M + i]),
    ets: etsForecast(etsRun(y, n, p, mul), 12, p, mul),
  };
  return { fc, act, metrics, best, p, origin, fwd };
}

/* ---------- 3. State ---------- */
const S = { data: null, cats: [], cat: null, H: 12, mode: 'fixed', mul: true, res: null, planKey: null, charts: {} };

function seriesFor(code) {
  const rows = S.data.filter(r => r.naics === code);
  const sales = rows.filter(r => r.metric === 'sales_nsa').sort((a, b) => a.month < b.month ? -1 : 1);
  const ratio = rows.filter(r => r.metric === 'inv_sales_ratio_sa').sort((a, b) => a.month < b.month ? -1 : 1);
  return {
    months: sales.map(r => r.month), y: sales.map(r => +r.value),
    ratio: ratio.length ? { value: +ratio[ratio.length - 1].value, month: ratio[ratio.length - 1].month, level: ratio[0].ratio_level, series: ratio[0].fred_series } : null,
  };
}

/* ---------- 4. Chart defaults (site palette) ---------- */
function chartDefaults() {
  Chart.defaults.color = 'rgba(237,233,224,.55)';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = 'rgba(255,255,255,.05)';
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.tooltip.backgroundColor = '#0f1012';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(201,168,76,.4)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.maintainAspectRatio = false;
}
function draw(id, cfg) {
  if (S.charts[id]) S.charts[id].destroy();
  S.charts[id] = new Chart($(id), cfg);
}

/* ---------- 5. Rendering ---------- */
function manualParams() {
  if ($('ets-auto').checked) return null;
  return { a: +$('ets-a').value, b: +$('ets-b').value, g: +$('ets-g').value, phi: +$('ets-p').value };
}
function syncEtsSliders(p) {
  [['ets-a', p.a], ['ets-b', p.b], ['ets-g', p.g], ['ets-p', p.phi]].forEach(([id, v]) => { $(id).value = v; $(id + '-v').textContent = (+v).toFixed(2); });
  ['ets-a', 'ets-b', 'ets-g', 'ets-p'].forEach(id => $(id).disabled = $('ets-auto').checked);
}

function runAll() {
  const ser = seriesFor(S.cat);
  S.ser = ser;
  S.res = backtest(ser.y, S.H, S.mode, S.mul, manualParams());
  syncEtsSliders(S.res.p);
  if (!S.planKey || $('ss-method').dataset.touched !== '1') S.planKey = S.res.best;
  $('ss-method').value = S.planKey;
  renderForecast();
  renderAllCats();
  renderSS();
  renderOTIF();
  renderSupply();
  renderMemo();
  renderStats();
}

function renderForecast() {
  const { months, y } = S.ser, r = S.res;
  const showFrom = Math.max(0, r.origin - 36);
  const futureMonths = Array.from({ length: 12 }, (_, i) => addMonths(months[months.length - 1], i + 1));
  const labels = months.slice(showFrom).concat(futureMonths).map(mlabel);
  const nHist = months.length - showFrom;
  const pad = (arr, before) => Array(before).fill(null).concat(arr);
  const ds = [{ label: 'Actual (Census)', data: y.slice(showFrom).concat(Array(12).fill(null)), borderColor: '#ede9e0', backgroundColor: '#ede9e0', borderWidth: 2, pointRadius: 0, tension: .2 }];
  METHODS.forEach(m => ds.push({
    label: m.name + ' backtest', data: pad(r.fc[m.key], r.origin - showFrom).concat(Array(12).fill(null)),
    borderColor: m.color, backgroundColor: m.color, borderWidth: m.key === 'ets' ? 2.2 : 1.4, borderDash: m.key === 'naive' ? [4, 4] : [], pointRadius: 0, tension: .2,
  }));
  const pk = S.planKey, fwd = r.fwd[pk], band = 1.2816 * r.metrics[pk].rmse;
  const planColor = METHODS.find(m => m.key === pk).color;
  ds.push({ label: 'Forward plan (' + METHODS.find(m => m.key === pk).name + ')', data: pad(fwd, nHist), borderColor: planColor, borderWidth: 2, borderDash: [6, 3], pointRadius: 0, tension: .2 });
  ds.push({ label: '80% upper', data: pad(fwd.map(v => v + band), nHist), borderColor: 'transparent', pointRadius: 0, fill: '+1', backgroundColor: 'rgba(201,168,76,.1)' });
  ds.push({ label: '80% lower', data: pad(fwd.map(v => v - band), nHist), borderColor: 'transparent', pointRadius: 0, fill: false });
  draw('ch-forecast', {
    type: 'line', data: { labels, datasets: ds },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { filter: i => !i.text.startsWith('80%') } },
        tooltip: { filter: i => !i.dataset.label.startsWith('80%'), callbacks: { label: c => c.dataset.label + ': ' + usdM(c.parsed.y) } },
      },
      scales: { x: { ticks: { maxTicksLimit: 10 } }, y: { ticks: { callback: v => '$' + fmt(v / 1000, 0) + 'B' } } },
    },
  });
  $('fc-sub').textContent = `Training: ${mlabel(months[0])} to ${mlabel(months[r.origin - 1])}. Holdout: ${mlabel(months[r.origin])} to ${mlabel(months[months.length - 1])}. The forward plan uses the method chosen in step 02, and the shaded band is its 80 percent range from holdout error.`;
  $('method-cards').innerHTML = METHODS.map(m => {
    const x = r.metrics[m.key], best = m.key === r.best;
    return `<div class="sim-metric ${best ? 'best' : ''}">
      <span class="sm-label">${m.name}${best ? ' · best' : ''}</span>
      <span class="sm-value">${pct(x.wape)}</span>
      <span class="sm-sub">WAPE<br>MAPE ${pct(x.mape)} · Bias ${x.bias >= 0 ? '+' : ''}${pct(x.bias)}<br>RMSE ${usdM(x.rmse)}</span>
    </div>`;
  }).join('');
}

function renderAllCats() {
  const rows = S.cats.map(c => {
    const ser = seriesFor(c.code);
    const r = backtest(ser.y, S.H, S.mode, S.mul, null);
    return { c, r };
  });
  S.allCats = rows;
  $('tbl-all').innerHTML = `<thead><tr><th>Category</th>${METHODS.map(m => `<th class="num">${m.name}</th>`).join('')}<th class="num">Bias of best</th></tr></thead><tbody>` +
    rows.map(({ c, r }) => `<tr class="click ${c.code === S.cat ? 'sel' : ''}" data-code="${c.code}"><td>${c.code} ${c.name}</td>${METHODS.map(m => `<td class="num ${m.key === r.best ? 'win' : ''}">${pct(r.metrics[m.key].wape)}</td>`).join('')}<td class="num">${r.metrics[r.best].bias >= 0 ? '+' : ''}${pct(r.metrics[r.best].bias)}</td></tr>`).join('') +
    '</tbody>';
  const wins = { naive: 0, snaive: 0, ets: 0 }; rows.forEach(x => wins[x.r.best]++);
  $('tbl-all').insertAdjacentHTML('beforeend', `<tfoot><tr class="base-row"><td>Categories won</td>${METHODS.map(m => `<td class="num">${wins[m.key]} of ${rows.length}</td>`).join('')}<td></td></tr></tfoot>`);
  $('tbl-all').querySelectorAll('tr.click').forEach(tr => tr.addEventListener('click', () => { $('sel-cat').value = tr.dataset.code; S.cat = tr.dataset.code; resetOpening(); runAll(); }));
}

function ssPolicy(key) {
  const r = S.res, { y } = S.ser;
  const sl = +$('ss-sl').value / 100, lt = +$('ss-lt').value, ltsd = +$('ss-ltsd').value, rp = +$('ss-rp').value;
  const src = document.querySelector('input[name="ss-src"]:checked').value;
  const D = mean(r.fwd[key]);
  const sigma = src === 'err' ? r.metrics[key].rmse : sd(y.slice(-24));
  const L = (lt + rp) / 4.345, sL = ltsd / 4.345;
  const sigL = Math.sqrt(L * sigma * sigma + D * D * sL * sL);
  const z = invPhi(sl);
  const ss = Math.max(0, z * sigL);
  const Q = D * rp / 4.345;
  return { sl, lt, ltsd, rp, D, sigma, L, sL, sigL, z, ss, Q, cycle: Q / 2, src };
}

function renderSS() {
  const pk = S.planKey, P = ssPolicy(pk), carry = +$('ot-carry').value / 100;
  ['ss-sl', 'ss-lt', 'ss-ltsd', 'ss-rp'].forEach(id => $(id + '-v').textContent = id === 'ss-sl' ? (+$(id).value).toFixed(1) + '%' : $(id).value);
  const avgInv = P.cycle + P.ss;
  $('ss-metrics').innerHTML = [
    ['z score', P.z.toFixed(2), 'from service level'],
    ['Demand uncertainty σ', usdM(P.sigma), P.src === 'err' ? 'RMSE per month' : 'std dev, last 24 months'],
    ['Exposure window', P.L.toFixed(2) + ' mo', 'lead time + review'],
    ['Safety stock', usdM(P.ss), (P.ss / P.D * 30.4).toFixed(1) + ' days of demand', true],
    ['Cycle stock', usdM(P.cycle), 'half the review quantity'],
    ['Carrying cost / yr', usdM(avgInv * carry), 'on average inventory'],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  const rows = METHODS.map(m => ({ m, P: ssPolicy(m.key) }));
  const naiveSS = rows[0].P.ss;
  $('tbl-ss-methods').innerHTML = `<thead><tr><th>Method</th><th class="num">σ used</th><th class="num">Safety stock</th><th class="num">Days of demand</th><th class="num">vs naive</th><th class="num">Carrying cost / yr</th></tr></thead><tbody>` +
    rows.map(({ m, P: p }) => `<tr class="${m.key === pk ? 'base-row' : ''}"><td>${m.name}</td><td class="num">${usdM(p.sigma)}</td><td class="num">${usdM(p.ss)}</td><td class="num">${(p.ss / p.D * 30.4).toFixed(1)}</td><td class="num ${p.ss < naiveSS ? 'ssens-delta-pos' : p.ss > naiveSS ? 'ssens-delta-neg' : ''}">${m.key === 'naive' ? '--' : ((p.ss / naiveSS - 1) * 100).toFixed(0) + '%'}</td><td class="num">${usdM((p.cycle + p.ss) * carry)}</td></tr>`).join('') + '</tbody>';
  const best = rows.reduce((a, b) => a.P.ss <= b.P.ss ? a : b);
  $('ss-insight').textContent = P.src === 'raw'
    ? `Using raw demand swings treats seasonality as noise. That buffer is ${usdM(P.ss)}. Switch to forecast error to see what a forecast saves.`
    : `${best.m.name} needs the smallest buffer at this policy: ${usdM(best.P.ss)}, ${((1 - best.P.ss / naiveSS) * 100).toFixed(0)}% less than the naive method. The gap is the inventory value of a better forecast.`;
  const demandPart = P.L * P.sigma * P.sigma, ltPart = P.D * P.D * P.sL * P.sL;
  if (ltPart > demandPart) $('ss-insight').textContent += ` Lead time variability drives ${(ltPart / (ltPart + demandPart) * 100).toFixed(0)}% of the buffer here. A steadier supplier saves more than a better forecast. Set variability to 0 to see the forecast effect alone.`;
}

function otifCurve(key) {
  const base = ssPolicy(key), ontime = +$('ot-ontime').value / 100, carry = +$('ot-carry').value / 100;
  const levels = [80, 82.5, 85, 87.5, 90, 92, 94, 95, 96, 97, 97.5, 98, 98.5, 99, 99.5, 99.9];
  return levels.map(lv => {
    const z = invPhi(lv / 100), ss = Math.max(0, z * base.sigL);
    const esc = base.sigL * lossG(z);
    const fill = Math.max(0, 1 - esc / base.Q);
    const inv = base.cycle + ss;
    return { lv, z, ss, fill, otif: fill * ontime, mos: inv / base.D, inv, carryCost: inv * carry };
  });
}

function renderOTIF() {
  $('ot-ontime-v').textContent = (+$('ot-ontime').value).toFixed(1) + '%';
  $('ot-carry-v').textContent = $('ot-carry').value + '%';
  const pk = S.planKey, cur = otifCurve(pk), P = ssPolicy(pk);
  const target = { mos: (P.cycle + P.ss) / P.D, sl: P.sl };
  const ds = [{
    label: 'Model curve', data: cur.map(c => ({ x: c.mos, y: c.otif * 100, lv: c.lv })), borderColor: '#c9a84c', backgroundColor: '#c9a84c', pointRadius: 3, showLine: true, tension: .25,
  }, {
    label: 'Your target', data: [{ x: target.mos, y: otifAt(pk, P.sl) * 100 }], borderColor: '#ede9e0', backgroundColor: '#ede9e0', pointRadius: 6, pointStyle: 'rectRot',
  }];
  const ratio = S.ser.ratio;
  const yMin = Math.min(...cur.map(c => c.otif * 100)) - 2;
  if (ratio) ds.push({ label: 'Census inventory / sales (' + ratio.value.toFixed(2) + ' mo)', data: [{ x: ratio.value, y: yMin }, { x: ratio.value, y: 100 }], borderColor: '#e05a00', borderDash: [5, 4], pointRadius: 0, showLine: true });
  const xMax = Math.max(ratio ? ratio.value * 1.1 : 0, cur[cur.length - 1].mos * 1.15);
  draw('ch-otif', {
    type: 'scatter', data: { datasets: ds },
    options: {
      plugins: { tooltip: { callbacks: { label: c => c.raw.lv ? `Service ${c.raw.lv}%: OTIF ${c.parsed.y.toFixed(1)}%, ${c.parsed.x.toFixed(2)} months of supply` : c.dataset.label + ': ' + c.parsed.x.toFixed(2) + ' months' } } },
      scales: {
        x: { min: 0, max: xMax, title: { display: true, text: 'Months of supply (cycle + safety stock)' } },
        y: { min: yMin, max: 100, title: { display: true, text: 'Modeled OTIF %' } },
      },
    },
  });
  $('tbl-otif').innerHTML = `<thead><tr><th>Service level</th><th class="num">z</th><th class="num">Safety stock</th><th class="num">Months of supply</th><th class="num">Fill rate</th><th class="num">OTIF</th><th class="num">Carrying cost / yr</th><th class="num">Extra cost per OTIF point</th></tr></thead><tbody>` +
    cur.map((c, i) => {
      const prev = cur[i - 1];
      const marg = prev && c.otif > prev.otif ? (c.carryCost - prev.carryCost) / ((c.otif - prev.otif) * 100) : null;
      const isT = Math.abs(c.lv - P.sl * 100) < 0.05;
      return `<tr class="${isT ? 'base-row' : ''}"><td>${c.lv}%</td><td class="num">${c.z.toFixed(2)}</td><td class="num">${usdM(c.ss)}</td><td class="num">${c.mos.toFixed(2)}</td><td class="num">${pct(c.fill, 2)}</td><td class="num">${pct(c.otif, 1)}</td><td class="num">${usdM(c.carryCost)}</td><td class="num">${marg === null ? '--' : usdM(marg)}</td></tr>`;
    }).join('') + '</tbody>';
  const cat = S.cats.find(c => c.code === S.cat);
  $('mos-compare').innerHTML = ratio
    ? `Census reports <strong>${ratio.value.toFixed(2)} months</strong> of inventory for ${ratio.level} (${mlabel(ratio.month)}, seasonally adjusted). The model needs <strong>${target.mos.toFixed(2)} months</strong> to hold ${(P.sl * 100).toFixed(1)}% service. Census stock also covers slow movers, display stock and seasonal builds, so the real gap is smaller than it looks. It still shows where to look.`
    : `Census does not publish an inventory to sales ratio for ${cat.name}. The model needs <strong>${target.mos.toFixed(2)} months</strong> of supply to hold ${(P.sl * 100).toFixed(1)}% service.`;
}
function otifAt(key, sl) {
  const b = ssPolicy(key), z = invPhi(sl), ontime = +$('ot-ontime').value / 100;
  return Math.max(0, 1 - b.sigL * lossG(z) / b.Q) * ontime;
}

function resetOpening() {
  const r = seriesFor(S.cat).ratio;
  $('sp-open').value = r ? Math.min(4, Math.max(0.5, r.value)).toFixed(2) : 1.5;
}

function supplyPlan() {
  const pk = S.planKey, P = ssPolicy(pk), r = S.res;
  const ov = [+$('sp-q1').value, +$('sp-q2').value, +$('sp-q34').value];
  const cap = +$('sp-cap').value / 100 * P.D;
  const months = Array.from({ length: 12 }, (_, i) => addMonths(S.ser.months[S.ser.months.length - 1], i + 1));
  const stat = r.fwd[pk];
  const plan = stat.map((v, i) => v * (1 + (i < 3 ? ov[0] : i < 6 ? ov[1] : ov[2]) / 100));
  let inv = +$('sp-open').value * P.D;
  const targetEnd = P.ss + P.cycle;
  const rows = [];
  plan.forEach((d, i) => {
    const begin = inv;
    const need = Math.max(0, d + targetEnd - begin);
    const rec = Math.min(need, cap);
    let end = begin + rec - d, short = 0;
    if (end < 0) { short = -end; end = 0; }
    rows.push({ m: months[i], stat: stat[i], d, begin, rec, end, short, below: end < P.ss, capped: need > cap });
    inv = end;
  });
  return { rows, P, cap, open: +$('sp-open').value * P.D, ov };
}

function renderSupply() {
  ['sp-q1', 'sp-q2', 'sp-q34'].forEach(id => $(id + '-v').textContent = (+$(id).value > 0 ? '+' : '') + $(id).value + '%');
  $('sp-cap-v').textContent = $('sp-cap').value + '%';
  $('sp-open-v').textContent = (+$('sp-open').value).toFixed(2);
  const ratio = S.ser.ratio;
  $('sp-open-note').textContent = ratio
    ? `Default is the latest Census ratio for ${ratio.level}: ${ratio.value.toFixed(2)} months (${mlabel(ratio.month)}).`
    : 'Census does not publish a ratio for this category. Set opening months of supply by hand.';
  const sp = supplyPlan(); S.sp = sp;
  const below = sp.rows.filter(r => r.below), capped = sp.rows.filter(r => r.capped), short = sum(sp.rows.map(r => r.short));
  const minEnd = sp.rows.reduce((a, b) => a.end <= b.end ? a : b);
  $('sp-metrics').innerHTML = [
    ['Opening inventory', usdB(sp.open), (+$('sp-open').value).toFixed(2) + ' months'],
    ['Months below safety stock', below.length + ' of 12', below.length ? below.map(r => mlabel(r.m).slice(0, 3)).join(', ') : 'none', below.length > 0],
    ['Months at receiving cap', capped.length + ' of 12', 'cap ' + usdB(sp.cap) + ' / mo'],
    ['Lowest ending inventory', usdB(minEnd.end), mlabel(minEnd.m)],
    ['Unserved demand', usdM(short), short > 0 ? 'stockout risk' : 'none projected', short > 0],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  draw('ch-supply', {
    type: 'bar',
    data: {
      labels: sp.rows.map(r => mlabel(r.m)),
      datasets: [
        { type: 'line', label: 'Ending inventory', data: sp.rows.map(r => r.end), borderColor: '#c9a84c', backgroundColor: '#c9a84c', borderWidth: 2, pointRadius: sp.rows.map(r => r.below ? 5 : 2), pointBackgroundColor: sp.rows.map(r => r.below ? '#e05a00' : '#c9a84c'), yAxisID: 'y' },
        { type: 'line', label: 'Safety stock', data: sp.rows.map(() => sp.P.ss), borderColor: '#e05a00', borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 },
        { label: 'Demand plan', data: sp.rows.map(r => r.d), backgroundColor: 'rgba(237,233,224,.22)' },
        { label: 'Receipts', data: sp.rows.map(r => r.rec), backgroundColor: 'rgba(74,144,226,.55)' },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usdM(c.parsed.y) } } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + fmt(v / 1000, 0) + 'B' } } },
    },
  });
  $('tbl-supply').innerHTML = `<thead><tr><th>Month</th><th class="num">Statistical</th><th class="num">Consensus plan</th><th class="num">Begin inv.</th><th class="num">Receipts</th><th class="num">End inv.</th><th>Flag</th></tr></thead><tbody>` +
    sp.rows.map(r => `<tr class="${r.below ? 'flag' : ''}"><td>${mlabel(r.m)}</td><td class="num">${usdM(r.stat)}</td><td class="num">${usdM(r.d)}</td><td class="num">${usdM(r.begin)}</td><td class="num">${usdM(r.rec)}</td><td class="num">${usdM(r.end)}</td><td>${r.short > 0 ? 'Stockout' : r.below ? 'Below buffer' : r.capped ? 'At cap' : ''}</td></tr>`).join('') + '</tbody>';
}

function renderMemo() {
  const r = S.res, pk = S.planKey, cat = S.cats.find(c => c.code === S.cat), P = ssPolicy(pk), sp = S.sp;
  const mName = k => METHODS.find(m => m.key === k).name;
  const lastM = S.ser.months[S.ser.months.length - 1], nextM = addMonths(lastM, 1);
  const bias = r.metrics[pk].bias, below = sp.rows.filter(x => x.below), capped = sp.rows.filter(x => x.capped);
  const mos = (P.cycle + P.ss) / P.D, ratio = S.ser.ratio;
  const peak = sp.rows.reduce((a, b) => a.d >= b.d ? a : b);
  const otif = otifAt(pk, P.sl);
  const naiveSS = ssPolicy('naive').ss;
  const decision = [
    `Plan ${cat.name.toLowerCase()} with ${mName(pk)}.${pk === r.best ? ` It had the lowest WAPE on the last ${S.H} months: ${pct(r.metrics[pk].wape)}.` : ` Note: ${mName(r.best)} tested better, at ${pct(r.metrics[r.best].wape)} WAPE vs ${pct(r.metrics[pk].wape)}.`}`,
    `Hold safety stock of ${usdM(P.ss)} for a ${(P.sl * 100).toFixed(1)}% cycle service level. That is ${(P.ss / P.D * 30.4).toFixed(1)} days of demand.`,
    pk !== 'naive' && naiveSS > P.ss ? `This method needs ${((1 - P.ss / naiveSS) * 100).toFixed(0)}% less buffer than a naive plan at the same service level.` : '',
    `Modeled OTIF at this policy is ${pct(otif)} with ${(+$('ot-ontime').value).toFixed(1)}% supplier on-time delivery.`,
  ].filter(Boolean);
  const risks = [];
  if (Math.abs(bias) >= 0.01) risks.push(`The plan ran ${bias > 0 ? 'high' : 'low'} by ${pct(Math.abs(bias))} on the holdout. ${bias > 0 ? 'That builds excess stock if nobody corrects it.' : 'That drains the buffer and puts service at risk.'}`);
  else risks.push(`Bias is small at ${bias >= 0 ? '+' : ''}${pct(bias)}. The plan is not leaning one way.`);
  if (below.length) risks.push(`${below.length} of the next 12 months end below safety stock: ${below.map(x => mlabel(x.m)).join(', ')}.`);
  else risks.push('No month in the next 12 ends below safety stock under current settings.');
  if (capped.length) risks.push(`Receiving hits the cap in ${capped.length} months. Peak demand is ${mlabel(peak.m)} at ${usdB(peak.d)}.`);
  if (ratio) risks.push(`Census shows ${ratio.value.toFixed(2)} months of inventory for ${ratio.level}. The model target is ${mos.toFixed(2)} months.`);
  const next = [];
  if (Math.abs(bias) >= 0.02) next.push(`Correct the ${bias > 0 ? 'over' : 'under'}-forecast. Review the last ${S.H} months by month to find where the bias comes from.`);
  if (below.length) next.push(`Pull receipts forward ahead of ${mlabel(below[0].m)} or raise the receiving cap above ${$('sp-cap').value}%.`);
  if (ratio && ratio.value > mos + 0.25) next.push(`Test a drawdown. Inventory runs about ${(ratio.value - mos).toFixed(2)} months above the model target. Start with the slowest movers.`);
  if (r.best === 'naive') next.push('Seasonality is weak in this window. Check for a level shift before trusting any seasonal method.');
  if (r.best !== 'ets') next.push(`ETS did not win this cycle. Re-run with ${S.mul ? 'additive' : 'multiplicative'} seasonality and a ${S.H === 12 ? '24' : '12'} month holdout before switching methods.`);
  next.push('Re-run the backtest when Census revises its advance months.');
  $('memo').innerHTML = `
    <h4>S&amp;OP Memo: ${cat.name}</h4>
    <div class="memo-meta">Cycle ${mlabel(nextM)} · Data through ${mlabel(lastM)} · Portfolio case study · Census NAICS ${cat.code}</div>
    <h5>Decision</h5><ul>${decision.map(x => `<li>${x}</li>`).join('')}</ul>
    <h5>Risk</h5><ul>${risks.map(x => `<li>${x}</li>`).join('')}</ul>
    <h5>What to change next cycle</h5><ul>${next.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

function renderStats() {
  const r = S.res, P = ssPolicy(S.planKey), ratio = S.ser.ratio;
  $('k-best').textContent = METHODS.find(m => m.key === r.best).name.replace(' (Holt-Winters)', '');
  $('k-wape').textContent = pct(r.metrics[r.best].wape);
  $('k-ss').textContent = usdB(P.ss);
  $('k-mos').textContent = ((P.cycle + P.ss) / P.D).toFixed(2) + (ratio ? ' vs ' + ratio.value.toFixed(2) : '');
}

/* ---------- 6. Wire up ---------- */
async function init() {
  chartDefaults();
  let text;
  try {
    const res = await fetch('data.csv');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    text = await res.text();
  } catch (e) {
    document.querySelector('.proj-wrap').insertAdjacentHTML('afterbegin', `<div class="load-error">Could not load data.csv (${e.message}). If you opened this file directly, run a local server instead. See README.md.</div>`);
    return;
  }
  S.data = parseCSV(text);
  const seen = new Map();
  S.data.forEach(r => { if (!seen.has(r.naics)) seen.set(r.naics, r.category); });
  S.cats = [...seen].map(([code, name]) => ({ code, name }));
  $('sel-cat').innerHTML = S.cats.map(c => `<option value="${c.code}">${c.code} ${c.name}</option>`).join('');
  $('ss-method').innerHTML = METHODS.map(m => `<option value="${m.key}">${m.name}</option>`).join('');
  S.cat = S.cats[0].code;
  const last = S.data.filter(r => r.metric === 'sales_nsa').reduce((a, r) => r.month > a ? r.month : a, '');
  document.querySelectorAll('[data-bind="lastMonth"]').forEach(el => el.textContent = mlabel(last));
  resetOpening();

  $('sel-cat').addEventListener('change', e => { S.cat = e.target.value; resetOpening(); runAll(); });
  $('sel-hold').addEventListener('change', e => { S.H = +e.target.value; runAll(); });
  $('sel-mode').addEventListener('change', e => { S.mode = e.target.value; runAll(); });
  $('sel-season').addEventListener('change', e => { S.mul = e.target.value === 'mul'; runAll(); });
  $('ets-auto').addEventListener('change', runAll);
  ['ets-a', 'ets-b', 'ets-g', 'ets-p'].forEach(id => $(id).addEventListener('input', () => { $(id + '-v').textContent = (+$(id).value).toFixed(2); debounce(runAll); }));
  $('ss-method').addEventListener('change', e => { e.target.dataset.touched = '1'; S.planKey = e.target.value; runLight(); });
  ['ss-sl', 'ss-lt', 'ss-ltsd', 'ss-rp', 'ot-ontime', 'ot-carry', 'sp-q1', 'sp-q2', 'sp-q34', 'sp-cap', 'sp-open'].forEach(id => $(id).addEventListener('input', () => debounce(runLight, 60)));
  document.querySelectorAll('input[name="ss-src"]').forEach(el => el.addEventListener('change', runLight));
  $('btn-copy').addEventListener('click', async () => {
    const txt = $('memo').innerText;
    try { await navigator.clipboard.writeText(txt); $('btn-copy').textContent = 'Copied'; }
    catch { $('btn-copy').textContent = 'Select the memo text to copy'; }
    setTimeout(() => $('btn-copy').textContent = 'Copy memo text', 1800);
  });
  runAll();
}
// Policy changes do not need a refit, only the downstream views.
function runLight() { renderForecast(); renderSS(); renderOTIF(); renderSupply(); renderMemo(); renderStats(); }
let _t; function debounce(fn, ms = 120) { clearTimeout(_t); _t = setTimeout(fn, ms); }

init();
