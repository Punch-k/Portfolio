/* CRM and RevOps Dashboard. Portfolio case study by Prapanch Kokkalemada.
   Illustrative demo portfolio: every account in data.json is synthetic.
   Every chart and table is calculated here from data.json. No CRM connection. */
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
const usd = n => (n < 0 ? '-$' : '$') + fmt(Math.abs(n));
const usdK = n => Math.abs(n) >= 1e6 ? (n < 0 ? '-$' : '$') + (Math.abs(n) / 1e6).toFixed(2) + 'M' : Math.abs(n) >= 1e3 ? (n < 0 ? '-$' : '$') + (Math.abs(n) / 1e3).toFixed(1) + 'K' : usd(n);
const pct = (n, d = 1) => (n * 100).toFixed(d) + '%';
const sum = a => a.reduce((s, x) => s + x, 0);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const val = id => +$(id).value;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dlabel = iso => { const d = new Date(iso + 'T00:00:00'); return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
const days = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const COL = { gold: '#c9a84c', fg: '#ede9e0', blue: '#4a90e2', orange: '#e05a00', muted: '#787570', green: '#4ade80', red: '#ef4444' };
const BANDCOL = { Healthy: COL.green, Watch: COL.gold, 'At risk': COL.red };
const charts = {};
function draw(id, cfg) { if (charts[id]) charts[id].destroy(); charts[id] = new Chart($(id), cfg); }
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
let _t; const debounce = (fn, ms = 80) => { clearTimeout(_t); _t = setTimeout(fn, ms); };

/* ---------- 2. State ---------- */
let D, ASOF;
const S = { qbr: null, terrMode: 'current' };
const STAGE_DEF = { Prospect: 10, Discovery: 20, Solution: 40, Proposal: 60, Negotiation: 80 };
const SIGNALS = [
  { k: 'usage', name: 'Seat usage', w: 30 },
  { k: 'trend', name: 'Usage trend', w: 15 },
  { k: 'nps', name: 'NPS', w: 20 },
  { k: 'support', name: 'Support load', w: 15 },
  { k: 'sponsor', name: 'Exec sponsor', w: 10 },
  { k: 'touch', name: 'Engagement', w: 10 },
];
const TYPES = ['Expansion', 'Cross-sell', 'New logo'];
const TYPECOL = { Expansion: COL.gold, 'Cross-sell': COL.blue, 'New logo': COL.fg };

function filtered(ignoreTerr = false) {
  const seg = $('f-seg').value, terr = $('f-terr').value, ind = $('f-ind').value;
  return D.accounts.filter(a => (seg === 'ALL' || a.segment === seg) && (ignoreTerr || terr === 'ALL' || a.territory === terr) && (ind === 'ALL' || a.industry === ind));
}
const stageP = st => val('sw-' + st) / 100;

/* ---------- 3. Health model ---------- */
function slope(arr) { const n = arr.length, xm = (n - 1) / 2, ym = sum(arr) / n; let num = 0, den = 0; arr.forEach((y, i) => { num += (i - xm) * (y - ym); den += (i - xm) ** 2; }); return num / den; }
function signals(a) {
  return {
    usage: clamp(a.usage_pct, 0, 100),
    trend: clamp(50 + slope(a.usage_trend) * 10, 0, 100),
    nps: (a.nps + 100) / 2,
    support: clamp(100 - a.tickets_90d * 6 - a.sev1_90d * 25, 0, 100),
    sponsor: a.exec_sponsor ? 100 : 30,
    touch: clamp(100 - (a.days_since_touch - 14) / 106 * 100, 0, 100),
  };
}
function healthOf(a) {
  const ws = SIGNALS.map(s => val('hw-' + s.k)), wsum = sum(ws) || 1, sg = signals(a);
  const score = sum(SIGNALS.map((s, i) => sg[s.k] * ws[i] / wsum));
  const risk = val('h-risk'), watch = Math.max(val('h-watch'), risk + 1);
  return { score, sg, band: score < risk ? 'At risk' : score < watch ? 'Watch' : 'Healthy' };
}

/* ---------- 4. Pipeline ---------- */
function opps(accts) {
  const out = [];
  accts.forEach(a => a.opportunities.forEach(o => out.push({ ...o, acct: a, p: stageP(o.stage), slipped: o.close < ASOF })));
  return out;
}
function quarterOf(iso) { const d = new Date(iso + 'T00:00:00'); return d.getFullYear() + ' Q' + (Math.floor(d.getMonth() / 3) + 1); }
function renderPipeline() {
  $('p-stale-v').textContent = $('p-stale').value;
  D.stages.forEach(st => $('sw-' + st + '-v').textContent = $('sw-' + st).value + '%');
  const os = opps(filtered()), stale = val('p-stale');
  const open = sum(os.map(o => o.amount)), wt = sum(os.map(o => o.amount * o.p));
  const slipped = os.filter(o => o.slipped), staleO = os.filter(o => o.age_days > stale);
  $('pipe-metrics').innerHTML = [
    ['Open pipeline', usdK(open), os.length + ' opportunities'],
    ['Weighted', usdK(wt), pct(open ? wt / open : 0, 0) + ' of open', true],
    ['Average deal', usdK(os.length ? open / os.length : 0), 'open deals'],
    ['Slipped', usdK(sum(slipped.map(o => o.amount))), slipped.length + ' past close date'],
    ['Stale', staleO.length, 'older than ' + stale + ' days'],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  draw('ch-pipe', {
    type: 'bar',
    data: { labels: D.stages, datasets: [
      ...TYPES.map(t => ({ label: t, data: D.stages.map(st => sum(os.filter(o => o.stage === st && o.type === t).map(o => o.amount))), backgroundColor: TYPECOL[t] + (t === 'New logo' ? '88' : 'cc'), stack: 's' })),
      { type: 'line', label: 'Weighted', data: D.stages.map(st => sum(os.filter(o => o.stage === st).map(o => o.amount * o.p))), borderColor: COL.gold, backgroundColor: COL.gold, borderWidth: 2, pointRadius: 3 },
    ] },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usdK(c.parsed.y) } } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => usdK(v) } } } },
  });
  const curQ = quarterOf(ASOF);
  const qs = [...new Set(os.map(o => o.slipped ? curQ : quarterOf(o.close)))].sort();
  draw('ch-close', {
    type: 'bar',
    data: { labels: qs, datasets: TYPES.map(t => ({ label: t, data: qs.map(q => sum(os.filter(o => o.type === t && (o.slipped ? curQ : quarterOf(o.close)) === q).map(o => o.amount * o.p))), backgroundColor: TYPECOL[t] + 'cc' })) },
    options: { plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usdK(c.parsed.y) } } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => usdK(v) } } } },
  });
  const hyg = os.filter(o => o.slipped || o.age_days > stale).sort((a, b) => b.amount - a.amount).slice(0, 30);
  $('tbl-hyg').innerHTML = `<thead><tr><th>Account</th><th>Stage</th><th class="num">Amount</th><th>Close</th><th class="num">Age</th><th>Issue</th></tr></thead><tbody>` +
    (hyg.length ? hyg.map(o => `<tr class="click" data-id="${o.acct.id}"><td>${o.acct.name}</td><td>${o.stage}</td><td class="num">${usdK(o.amount)}</td><td>${dlabel(o.close)}</td><td class="num">${o.age_days}d</td><td>${o.slipped ? '<span class="pill bad">Slipped</span> ' : ''}${o.age_days > stale ? '<span class="pill warn">Stale</span>' : ''}</td></tr>`).join('') : '<tr><td colspan="6">No hygiene issues in this view.</td></tr>') + '</tbody>';
  bindRowClicks('tbl-hyg');
}

/* ---------- 5. Health ---------- */
function renderHealth() {
  const ws = SIGNALS.map(s => val('hw-' + s.k)), wsum = sum(ws) || 1;
  SIGNALS.forEach((s, i) => $('hw-' + s.k + '-v').textContent = pct(ws[i] / wsum, 0));
  $('h-risk-v').textContent = $('h-risk').value; $('h-watch-v').textContent = Math.max(val('h-watch'), val('h-risk') + 1);
  const ac = filtered().map(a => ({ a, h: healthOf(a) }));
  const arr = sum(ac.map(x => x.a.arr));
  const band = b => ac.filter(x => x.h.band === b);
  const wavg = arr ? sum(ac.map(x => x.h.score * x.a.arr)) / arr : 0;
  $('health-metrics').innerHTML = [
    ['ARR-weighted health', wavg.toFixed(0), 'out of 100', true],
    ...['Healthy', 'Watch', 'At risk'].map(b => [b, band(b).length, usdK(sum(band(b).map(x => x.a.arr))) + ' ARR']),
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  const bins = Array.from({ length: 10 }, (_, i) => i * 10);
  const risk = val('h-risk'), watch = Math.max(val('h-watch'), risk + 1);
  draw('ch-hist', {
    type: 'bar',
    data: { labels: bins.map(b => b + '-' + (b + 10)), datasets: [{ label: 'Accounts', data: bins.map(b => ac.filter(x => x.h.score >= b && (x.h.score < b + 10 || (b === 90 && x.h.score <= 100))).length), backgroundColor: bins.map(b => b + 10 <= risk ? COL.red : b + 10 <= watch ? COL.gold : COL.green) }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 } } } },
  });
  draw('ch-scatter', {
    type: 'scatter',
    data: { datasets: ['Healthy', 'Watch', 'At risk'].map(b => ({ label: b, data: band(b).map(x => ({ x: x.h.score, y: x.a.arr, n: x.a.name })), backgroundColor: BANDCOL[b] + 'bb', pointRadius: 3 })) },
    options: { plugins: { tooltip: { callbacks: { label: c => `${c.raw.n}: ${usdK(c.raw.y)}, health ${c.raw.x.toFixed(0)}` } } }, scales: { x: { min: 0, max: 100, title: { display: true, text: 'Health' } }, y: { type: 'logarithmic', ticks: { callback: v => [1e4, 3e4, 1e5, 3e5, 1e6].includes(v) ? usdK(v) : '' } } } },
  });
  const rk = band('At risk').sort((x, y) => y.a.arr - x.a.arr);
  $('tbl-risk').innerHTML = `<thead><tr><th>Account</th><th>Segment</th><th>Territory</th><th class="num">ARR</th><th class="num">Health</th><th>Weakest signal</th><th>Renewal</th><th class="num">Days</th></tr></thead><tbody>` +
    (rk.length ? rk.map(x => { const weak = SIGNALS.reduce((m, s) => x.h.sg[s.k] < x.h.sg[m.k] ? s : m); return `<tr class="click" data-id="${x.a.id}"><td>${x.a.name}</td><td>${x.a.segment}</td><td>${x.a.territory}</td><td class="num">${usdK(x.a.arr)}</td><td class="num">${x.h.score.toFixed(0)}</td><td>${weak.name} (${x.h.sg[weak.k].toFixed(0)})</td><td>${dlabel(x.a.renewal)}</td><td class="num">${days(ASOF, x.a.renewal)}</td></tr>`; }).join('') : '<tr><td colspan="8">No at-risk accounts in this view.</td></tr>') + '</tbody>';
  bindRowClicks('tbl-risk');
  $('k-risk').textContent = usdK(sum(band('At risk').map(x => x.a.arr)));
}

/* ---------- 6. Renewals ---------- */
function renewalModel(accts) {
  const chH = val('r-ch-h') / 100, chW = val('r-ch-w') / 100, chR = val('r-ch-r') / 100, down = val('r-down') / 100, save = val('r-save') / 100;
  const horizon = new Date(ASOF + 'T00:00:00'); horizon.setFullYear(horizon.getFullYear() + 1);
  const hz = horizon.toISOString().slice(0, 10);
  const rows = accts.filter(a => a.renewal > ASOF && a.renewal <= hz).map(a => {
    const h = healthOf(a);
    const churnP = h.band === 'Healthy' ? chH : h.band === 'Watch' ? chW : chR * (1 - save);
    const churn = a.arr * churnP;
    const dn = h.band === 'Healthy' ? 0 : a.arr * (1 - churnP) * down;
    return { a, h, churn, dn, retained: a.arr - churn - dn, month: a.renewal.slice(0, 7) };
  });
  const exp = sum(opps(accts).filter(o => o.type !== 'New logo' && o.close <= hz).map(o => o.amount * o.p));
  const start = sum(accts.map(a => a.arr)), churn = sum(rows.map(r => r.churn)), dn = sum(rows.map(r => r.dn));
  return { rows, start, churn, dn, exp, grr: (start - churn - dn) / start, nrr: (start - churn - dn + exp) / start, up: sum(rows.map(r => r.a.arr)) };
}
function renderRenewals() {
  ['r-ch-h', 'r-ch-w', 'r-ch-r', 'r-down', 'r-save'].forEach(id => $(id + '-v').textContent = $(id).value + '%');
  const ac = filtered(), m = renewalModel(ac);
  if (!ac.length) { $('renew-metrics').innerHTML = '<div class="sim-metric"><span class="sm-label">No accounts in this view</span></div>'; return; }
  $('renew-metrics').innerHTML = [
    ['ARR up for renewal', usdK(m.up), m.rows.length + ' renewals'],
    ['Expected churn', usdK(m.churn), pct(m.churn / m.start) + ' of book'],
    ['Expected downsell', usdK(m.dn), 'watch and at-risk renewals'],
    ['Weighted expansion', usdK(m.exp), 'expansion and cross-sell pipeline'],
    ['Gross retention', pct(m.grr), 'GRR'],
    ['Net retention', pct(m.nrr), 'NRR', true],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  const months = [...new Set(m.rows.map(r => r.month))].sort();
  draw('ch-renew', {
    type: 'bar',
    data: { labels: months.map(x => MONTHS[+x.slice(5) - 1] + ' ' + x.slice(2, 4)), datasets: [
      { label: 'Expected retained', data: months.map(x => sum(m.rows.filter(r => r.month === x).map(r => r.retained))), backgroundColor: COL.gold, stack: 'a' },
      { label: 'Expected downsell', data: months.map(x => sum(m.rows.filter(r => r.month === x).map(r => r.dn))), backgroundColor: COL.blue, stack: 'a' },
      { label: 'Expected churn', data: months.map(x => sum(m.rows.filter(r => r.month === x).map(r => r.churn))), backgroundColor: COL.red, stack: 'a' },
    ] },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usdK(c.parsed.y) } } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => usdK(v) } } } },
  });
  const end = m.start - m.churn - m.dn + m.exp;
  const steps = [['Start ARR', 0, m.start, COL.fg], ['Churn', m.start - m.churn, m.start, COL.red], ['Downsell', m.start - m.churn - m.dn, m.start - m.churn, COL.blue], ['Expansion', m.start - m.churn - m.dn, end, COL.green], ['End ARR', 0, end, COL.gold]];
  draw('ch-bridge', {
    type: 'bar',
    data: { labels: steps.map(s => s[0]), datasets: [{ data: steps.map(s => [s[1], s[2]]), backgroundColor: steps.map(s => s[3]) }] },
    options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => usdK(c.raw[1] - c.raw[0]) } } }, scales: { y: { min: Math.min(m.start, end) * 0.85, ticks: { callback: v => usdK(v) } } } },
  });
  $('k-nrr').textContent = pct(m.nrr, 0);
}

/* ---------- 7. QBR ---------- */
function fillQbrList() {
  const ac = filtered(), sort = $('q-sort').value;
  const ord = ac.map(a => ({ a, h: healthOf(a) })).sort((x, y) => sort === 'arr' ? y.a.arr - x.a.arr : sort === 'risk' ? x.h.score - y.h.score : sort === 'renew' ? (x.a.renewal < y.a.renewal ? -1 : 1) : x.a.name.localeCompare(y.a.name));
  $('q-acct').innerHTML = ord.map(x => `<option value="${x.a.id}">${x.a.name} · ${x.a.segment} · ${usdK(x.a.arr)} · health ${x.h.score.toFixed(0)}</option>`).join('');
  if (!S.qbr || !ord.find(x => x.a.id === S.qbr)) S.qbr = ord[0]?.a.id;
  if (S.qbr) $('q-acct').value = S.qbr;
}
function renderQBR() {
  const a = D.accounts.find(x => x.id === S.qbr);
  if (!a) { $('qbr-agenda').innerHTML = '<p>No accounts in this view.</p>'; return; }
  const h = healthOf(a), dr = days(ASOF, a.renewal), rep = D.reps.find(r => r.territory === a.territory);
  $('qbr-metrics').innerHTML = [
    ['ARR', usdK(a.arr), a.segment + ' · ' + a.industry, true],
    ['Health', h.score.toFixed(0), h.band],
    ['Renewal', dlabel(a.renewal), dr + ' days out'],
    ['Seats', fmt(a.seats), pct(a.usage_pct / 100, 0) + ' active'],
    ['NPS', (a.nps > 0 ? '+' : '') + a.nps, a.exec_sponsor ? 'exec sponsor in place' : 'no exec sponsor'],
    ['Support, 90 days', a.tickets_90d + ' tickets', a.sev1_90d + ' severity 1'],
  ].map(([l, v, s, hl]) => `<div class="sim-metric ${hl ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  draw('ch-qdrv', {
    type: 'bar',
    data: { labels: SIGNALS.map(s => s.name), datasets: [{ data: SIGNALS.map(s => h.sg[s.k]), backgroundColor: SIGNALS.map(s => h.sg[s.k] < val('h-risk') ? COL.red : h.sg[s.k] < Math.max(val('h-watch'), val('h-risk') + 1) ? COL.gold : COL.green) }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 100 } } },
  });
  const asof = new Date(ASOF + 'T00:00:00');
  const mlab = Array.from({ length: 6 }, (_, i) => { const d = new Date(asof); d.setMonth(d.getMonth() - (5 - i)); return MONTHS[d.getMonth()]; });
  draw('ch-quse', {
    type: 'line',
    data: { labels: mlab, datasets: [{ label: 'Active seats %', data: a.usage_trend, borderColor: COL.gold, backgroundColor: 'rgba(201,168,76,.12)', fill: true, tension: .3, pointRadius: 3 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } },
  });
  $('tbl-qopp').innerHTML = `<thead><tr><th>Type</th><th>Stage</th><th class="num">Amount</th><th class="num">Weighted</th><th>Close</th></tr></thead><tbody>` +
    (a.opportunities.length ? a.opportunities.map(o => `<tr class="${o.close < ASOF ? 'flag' : ''}"><td>${o.type}</td><td>${o.stage}</td><td class="num">${usdK(o.amount)}</td><td class="num">${usdK(o.amount * stageP(o.stage))}</td><td>${dlabel(o.close)}${o.close < ASOF ? ' (slipped)' : ''}</td></tr>`).join('') : '<tr><td colspan="5">No open opportunities.</td></tr>') + '</tbody>';
  const weak = SIGNALS.filter(s => h.sg[s.k] < 50).map(s => s.name.toLowerCase());
  const strong = SIGNALS.filter(s => h.sg[s.k] >= 75).map(s => s.name.toLowerCase());
  const tr = slope(a.usage_trend);
  const wins = [], risks = [], asks = [];
  if (a.usage_pct >= 75) wins.push(`${pct(a.usage_pct / 100, 0)} of ${fmt(a.seats)} seats are active.`);
  if (tr > 0.5) wins.push(`Usage is up about ${tr.toFixed(1)} points a month over six months.`);
  if (a.nps >= 30) wins.push(`NPS is +${a.nps}.`);
  if (!wins.length) wins.push(strong.length ? `Strongest signals: ${strong.join(', ')}.` : 'No standout wins yet. Lead with the value plan for next quarter.');
  if (a.usage_pct < 50) risks.push(`Only ${pct(a.usage_pct / 100, 0)} of seats are active. Find the teams that are not using it.`);
  if (tr < -0.5) risks.push(`Usage is falling about ${Math.abs(tr).toFixed(1)} points a month.`);
  if (a.sev1_90d) risks.push(`${a.sev1_90d} severity 1 ticket${a.sev1_90d > 1 ? 's' : ''} in 90 days. Bring the root cause and fix.`);
  if (a.nps < 0) risks.push(`NPS is ${a.nps}. Ask what would move one detractor.`);
  if (a.days_since_touch > 60) risks.push(`No touch in ${a.days_since_touch} days.`);
  if (!risks.length) risks.push(weak.length ? `Weak signals: ${weak.join(', ')}.` : 'No major risks in the data.');
  if (dr <= 120) asks.push(`Start the renewal now. It is ${dr} days out.`);
  if (!a.exec_sponsor) asks.push('Ask for an executive sponsor before the renewal.');
  const exp = a.opportunities.filter(o => o.type !== 'New logo');
  if (exp.length && h.band !== 'At risk') asks.push(`Advance ${exp.length} expansion deal${exp.length > 1 ? 's' : ''} worth ${usdK(sum(exp.map(o => o.amount)))}.`);
  if (h.band === 'At risk') asks.push('Hold expansion asks. Agree on a recovery plan with dates and owners first.');
  $('qbr-agenda').innerHTML = `
    <h4>QBR: ${a.name}</h4>
    <div class="memo-meta">${a.segment} · ${D.territories.find(t => t.id === a.territory).name} · owner ${rep ? rep.name : 'unassigned'} · demo account</div>
    <h5>Wins to show</h5><ul>${wins.map(x => `<li>${x}</li>`).join('')}</ul>
    <h5>Risks to raise</h5><ul>${risks.map(x => `<li>${x}</li>`).join('')}</ul>
    <h5>Asks and next steps</h5><ul>${asks.map(x => `<li>${x}</li>`).join('')}<li>Send a one page recap within 48 hours.</li></ul>`;
}
function bindRowClicks(tid) {
  $(tid).querySelectorAll('tr.click').forEach(tr => tr.addEventListener('click', () => {
    S.qbr = tr.dataset.id; fillQbrList(); renderQBR();
    const t = $('sec-qbr'); scrollTo({ top: t.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' });
  }));
}

/* ---------- 8. Territory and quota ---------- */
function balance(accts) {
  // Move the smallest accounts out of the largest book into the smallest book until books sit within 5% of the average.
  const ids = D.territories.map(t => t.id);
  const assign = new Map(accts.map(a => [a.id, a.territory]));
  const book = () => Object.fromEntries(ids.map(t => [t, sum(accts.filter(a => assign.get(a.id) === t).map(a => a.arr))]));
  const target = sum(accts.map(a => a.arr)) / ids.length;
  let moves = 0;
  for (let it = 0; it < 400; it++) {
    const b = book(), hi = ids.reduce((x, y) => b[x] >= b[y] ? x : y), lo = ids.reduce((x, y) => b[x] <= b[y] ? x : y);
    if (b[hi] - target <= target * 0.05 && target - b[lo] <= target * 0.05) break;
    const gap = Math.min(b[hi] - target, target - b[lo]);
    const cand = accts.filter(a => assign.get(a.id) === hi && a.arr <= gap * 1.2).sort((x, y) => y.arr - x.arr)[0];
    if (!cand) break;
    assign.set(cand.id, lo); moves++;
  }
  return { assign, moves };
}
function renderTerritory() {
  $('t-growth-v').textContent = $('t-growth').value + '%'; $('t-cov-v').textContent = (+$('t-cov').value).toFixed(1) + 'x';
  const accts = filtered(true), growth = val('t-growth') / 100, cov = val('t-cov');
  const bal = S.terrMode === 'balanced' ? balance(accts) : { assign: new Map(accts.map(a => [a.id, a.territory])), moves: 0 };
  const hz = new Date(ASOF + 'T00:00:00'); hz.setFullYear(hz.getFullYear() + 1); const hzs = hz.toISOString().slice(0, 10);
  const rows = D.reps.map(r => {
    const mine = accts.filter(a => bal.assign.get(a.id) === r.territory);
    const os = opps(mine);
    const book = sum(mine.map(a => a.arr)), quota = book * growth;
    const wt = sum(os.map(o => o.amount * o.p)), wt12 = sum(os.filter(o => o.close <= hzs).map(o => o.amount * o.p));
    const atRisk = sum(mine.filter(a => healthOf(a).band === 'At risk').map(a => a.arr));
    return { r, n: mine.length, book, quota, open: sum(os.map(o => o.amount)), wt, wt12, cover: quota ? wt / quota : 0, attain: quota ? wt12 / quota : 0, atRisk, terr: D.territories.find(t => t.id === r.territory).name };
  });
  const books = rows.map(x => x.book).filter(x => x > 0);
  const under = rows.filter(x => x.quota && x.cover < cov).length;
  $('terr-metrics').innerHTML = [
    ['Total quota', usdK(sum(rows.map(x => x.quota))), pct(growth, 0) + ' of ' + usdK(sum(rows.map(x => x.book)))],
    ['Weighted pipeline', usdK(sum(rows.map(x => x.wt))), pct(sum(rows.map(x => x.wt)) / (sum(rows.map(x => x.quota)) || 1), 0) + ' of quota'],
    ['Largest / smallest book', books.length ? (Math.max(...books) / Math.min(...books)).toFixed(2) + 'x' : '--', S.terrMode === 'balanced' ? bal.moves + ' accounts moved' : 'current territories', true],
    ['Reps under coverage', under + ' of ' + rows.length, 'need ' + cov.toFixed(1) + 'x'],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  draw('ch-terr', {
    type: 'bar',
    data: { labels: rows.map(x => x.r.name + ' · ' + x.r.territory), datasets: [
      { label: 'Quota', data: rows.map(x => x.quota), backgroundColor: 'rgba(237,233,224,.25)' },
      { label: 'Weighted pipeline', data: rows.map(x => x.wt), backgroundColor: rows.map(x => x.cover >= cov ? COL.gold : COL.orange) },
      { type: 'line', label: 'Quota × coverage', data: rows.map(x => x.quota * cov), borderColor: COL.fg, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.4 },
    ] },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usdK(c.parsed.y) } } }, scales: { y: { ticks: { callback: v => usdK(v) } } } },
  });
  $('tbl-terr').innerHTML = `<thead><tr><th>Rep</th><th>Territory</th><th class="num">Accounts</th><th class="num">Book ARR</th><th class="num">Quota</th><th class="num">Open pipeline</th><th class="num">Weighted</th><th class="num">Coverage</th><th class="num">12 mo forecast attainment</th><th class="num">ARR at risk</th></tr></thead><tbody>` +
    rows.map(x => `<tr><td>${x.r.name}</td><td>${x.terr}</td><td class="num">${x.n}</td><td class="num">${usdK(x.book)}</td><td class="num">${usdK(x.quota)}</td><td class="num">${usdK(x.open)}</td><td class="num">${usdK(x.wt)}</td><td class="num ${x.cover >= cov ? 'ssens-delta-pos' : 'ssens-delta-neg'}">${x.cover.toFixed(2)}x</td><td class="num">${pct(x.attain, 0)}</td><td class="num">${usdK(x.atRisk)}</td></tr>`).join('') + '</tbody>';
  $('terr-note').textContent = 'The territory model uses the segment and industry filters but always shows all eight territories. Rebalancing moves whole accounts by ARR only. A real plan would also weigh travel, relationships and time zones.';
}

/* ---------- 9. Headline + wiring ---------- */
function renderHeadline() {
  const ac = filtered(), os = opps(ac);
  $('f-count').textContent = ac.length + ' of ' + D.accounts.length;
  $('k-arr').textContent = usdK(sum(ac.map(a => a.arr)));
  $('k-arr-sub').textContent = ac.length + ' demo accounts';
  $('k-pipe').textContent = usdK(sum(os.map(o => o.amount * o.p)));
  $('k-pipe-sub').textContent = os.length + ' open opportunities';
}
function renderAll() { renderHeadline(); renderPipeline(); renderHealth(); renderRenewals(); fillQbrList(); renderQBR(); renderTerritory(); }

async function init() {
  chartDefaults();
  try {
    const res = await fetch('data.json'); if (!res.ok) throw new Error('HTTP ' + res.status);
    D = await res.json();
  } catch (e) {
    document.querySelector('.proj-wrap').insertAdjacentHTML('afterbegin', `<div class="load-error">Could not load data.json (${e.message}). If you opened this file directly, run a local server instead. See README.md.</div>`);
    return;
  }
  ASOF = D.meta.as_of;
  const opt = (arr, all) => `<option value="ALL">${all}</option>` + arr.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  $('f-seg').innerHTML = opt(['Enterprise', 'Mid-Market', 'SMB'].map(x => [x, x]), 'All segments');
  $('f-terr').innerHTML = opt(D.territories.map(t => [t.id, t.name]), 'All territories');
  $('f-ind').innerHTML = opt([...new Set(D.accounts.map(a => a.industry))].sort().map(x => [x, x]), 'All industries');
  $('stage-w').innerHTML = D.stages.map(st => `<div class="sim-field"><label for="sw-${st}">${st} <b id="sw-${st}-v"></b></label><input type="range" id="sw-${st}" min="0" max="100" step="5" value="${STAGE_DEF[st]}"></div>`).join('');
  $('health-w').innerHTML = SIGNALS.map(s => `<div class="sim-field"><label for="hw-${s.k}">${s.name} <b id="hw-${s.k}-v"></b></label><input type="range" id="hw-${s.k}" min="0" max="50" step="5" value="${s.w}"></div>`).join('');

  ['f-seg', 'f-terr', 'f-ind'].forEach(id => $(id).addEventListener('change', renderAll));
  D.stages.forEach(st => $('sw-' + st).addEventListener('input', () => debounce(() => { renderHeadline(); renderPipeline(); renderRenewals(); renderQBR(); renderTerritory(); })));
  $('p-stale').addEventListener('input', () => debounce(renderPipeline));
  [...SIGNALS.map(s => 'hw-' + s.k), 'h-risk', 'h-watch'].forEach(id => $(id).addEventListener('input', () => debounce(() => { renderHealth(); renderRenewals(); fillQbrList(); renderQBR(); renderTerritory(); })));
  ['r-ch-h', 'r-ch-w', 'r-ch-r', 'r-down', 'r-save'].forEach(id => $(id).addEventListener('input', () => debounce(renderRenewals)));
  $('q-acct').addEventListener('change', e => { S.qbr = e.target.value; renderQBR(); });
  $('q-sort').addEventListener('change', () => { fillQbrList(); renderQBR(); });
  ['t-growth', 't-cov'].forEach(id => $(id).addEventListener('input', () => debounce(renderTerritory)));
  $('t-mode').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    S.terrMode = b.dataset.m; $('t-mode').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); renderTerritory();
  }));
  renderAll();
}
init();
