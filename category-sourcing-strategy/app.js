/* Category Sourcing Strategy. Portfolio case study by Prapanch Kokkalemada.
   All charts and tables are calculated here from data.json.
   data.market = real public series (BLS PPI, BLS CES, EIA via FRED).
   data.model  = labeled assumptions for the corrugated packaging case. */
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
    b.scrollIntoView({ block: 'nearest', inline: 'center' });
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
const usd = (n, d = 0) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n), d);
const usdK = n => Math.abs(n) >= 1e6 ? usd(n / 1e6, 2) + 'M' : Math.abs(n) >= 1e3 ? usd(n / 1e3, 1) + 'K' : usd(n);
const pct = (n, d = 1) => (n * 100).toFixed(d) + '%';
const sum = a => a.reduce((s, x) => s + x, 0);
const mean = a => sum(a) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - 1)); };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mlabel = ym => { const [y, m] = ym.split('-'); return MONTHS[+m - 1] + ' ' + y; };
function invPhi(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 0.97575) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const COL = { gold: '#c9a84c', fg: '#ede9e0', blue: '#4a90e2', orange: '#e05a00', muted: '#787570', green: '#4ade80', red: '#ef4444' };
const SUPCOL = { A: COL.gold, B: COL.blue, C: COL.fg, D: COL.orange };
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
const val = id => +$(id).value;

/* ---------- 2. Data access ---------- */
let D, MK, MD, months;
const at = (key, m) => MK.series[key].values[months.indexOf(m)];
const lastM = () => months[months.length - 1];
const boxById = id => MD.boxes.find(b => b.id === id);
const supById = id => MD.suppliers.find(s => s.id === id);
const totalVol = boxId => sum(MD.sites.map(s => s.vol[boxId]));
const area = b => (2 * b.L + 2 * b.W + 1.5) * (b.H + b.W) / 144; // RSC blank in sq ft

/* ---------- 3. Should-cost model ---------- */
function shouldCost(b, m, o = {}) {
  const A = MD.anchor, C = MD.cost, base = A.month;
  const ton = (o.ton ?? A.board_usd_per_ton) * at('containerboard_ppi', m) / at('containerboard_ppi', base);
  const waste = (o.waste ?? C.waste_pct) / 100, oh = (o.oh ?? C.overhead_pct) / 100, mg = (o.margin ?? C.margin_pct) / 100, miles = o.miles ?? C.freight_miles;
  const msf = area(b) / 1000;
  const board = msf * MD.grades[b.grade].lbs_per_msf / 2000 * ton * (1 + waste);
  const ink = msf * C.ink_adhesive_usd_per_msf;
  const labor = b.labor_min_per_1000 / 60 * at('mfg_wage', m) * C.labor_burden / 1000;
  const energy = b.kwh_per_1000 * A.power_usd_per_kwh * at('power_ppi', m) / at('power_ppi', base) / 1000;
  const perMile = A.freight_usd_per_mile * (0.6 + 0.4 * at('diesel', m) / at('diesel', base));
  const freight = miles * perMile / b.per_truck;
  const sub = board + ink + labor + energy;
  const overhead = sub * oh, margin = (sub + overhead) * mg;
  return { board, ink, labor, energy, overhead, margin, freight, total: sub + overhead + margin + freight, ton, msf };
}
const scOpts = () => ({ ton: val('sc-ton'), waste: val('sc-waste'), oh: val('sc-oh'), margin: val('sc-margin'), miles: val('sc-miles') });

/* ---------- 4. Spend lines ---------- */
function lines() {
  const out = [];
  MD.sites.forEach(s => MD.boxes.forEach(b => {
    const sup = MD.allocation[s.id][b.id], price = MD.prices[s.id][b.id], units = s.vol[b.id];
    out.push({ site: s.id, box: b.id, sup, price, units, spend: price * units });
  }));
  const best = {};
  out.forEach(l => { best[l.box] = Math.min(best[l.box] ?? Infinity, l.price); });
  out.forEach(l => { l.opp = (l.price - best[l.box]) * l.units; });
  return out;
}
function supplierPrice(supId, boxId) {
  const ls = lines().filter(l => l.sup === supId && l.box === boxId);
  if (!ls.length) return null;
  return sum(ls.map(l => l.spend)) / sum(ls.map(l => l.units));
}

/* ---------- 5. Market view ---------- */
let baseIdx = '2020-01';
function renderMarket() {
  const base = baseIdx;
  $('base-lbl').textContent = mlabel(base);
  const keys = [
    ['box_ppi', 'Box prices (PPI)', COL.gold, [], 2.5],
    ['containerboard_ppi', 'Paperboard mills (PPI)', COL.fg, [], 1.6],
    ['mfg_wage', 'Manufacturing wages', COL.blue, [], 1.4],
    ['diesel', 'Diesel', COL.orange, [], 1.2],
    ['power_ppi', 'Industrial power (PPI)', COL.muted, [4, 3], 1.2],
    ['natgas_ppi', 'Natural gas (PPI)', 'rgba(237,233,224,.3)', [2, 3], 1],
  ];
  const ref = boxById('RSC-M'), o = scOpts();
  const scBase = shouldCost(ref, base, o).total;
  const ds = keys.map(([k, label, color, dash, w]) => ({
    label, data: months.map(m => at(k, m) / at(k, base) * 100), borderColor: color, backgroundColor: color, borderDash: dash, borderWidth: w, pointRadius: 0, tension: .15,
    hidden: k === 'natgas_ppi' || k === 'power_ppi', // energy spikes flatten the other lines; click the legend to show them
  }));
  ds.splice(1, 0, { label: 'Modeled should-cost, RSC medium', data: months.map(m => shouldCost(ref, m, o).total / scBase * 100), borderColor: COL.gold, borderDash: [6, 4], borderWidth: 1.6, pointRadius: 0, tension: .15 });
  draw('ch-market', {
    type: 'line', data: { labels: months.map(mlabel), datasets: ds },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.parsed.y.toFixed(1) } } }, scales: { x: { ticks: { maxTicksLimit: 12 } } } },
  });
  const L = lastM(), y1 = months[months.length - 13];
  const boxCh = at('box_ppi', L) / at('box_ppi', base) - 1, boardCh = at('containerboard_ppi', L) / at('containerboard_ppi', base) - 1;
  const scCh = shouldCost(ref, L, o).total / scBase - 1;
  const box12 = at('box_ppi', L) / at('box_ppi', y1) - 1, board12 = at('containerboard_ppi', L) / at('containerboard_ppi', y1) - 1;
  const gap = boxCh - scCh;
  $('market-read').textContent = `Since ${mlabel(base)}, box prices are ${boxCh >= 0 ? 'up' : 'down'} ${pct(Math.abs(boxCh))} and paperboard is ${boardCh >= 0 ? 'up' : 'down'} ${pct(Math.abs(boardCh))}. The modeled should-cost for a medium box moved ${pct(scCh)}. ` +
    (gap > 0.02 ? `Box prices ran ${pct(gap)} ahead of the modeled cost. That gap is room to negotiate.` : gap < -0.02 ? `Box prices lag the modeled cost by ${pct(-gap)}. Expect suppliers to push for increases.` : 'Box prices and modeled cost moved together.') +
    ` Over the last 12 months, box prices moved ${pct(box12)} and paperboard moved ${pct(board12)}.`;
  $('k-box').textContent = (boxCh >= 0 ? '+' : '') + pct(boxCh, 0);
  $('k-box-sub').textContent = 'BLS PPI, ' + mlabel(base) + ' to ' + mlabel(L);
}

function renderShouldCost() {
  ['sc-ton', 'sc-waste', 'sc-oh', 'sc-margin', 'sc-miles'].forEach(id => $(id + '-v').textContent = id === 'sc-ton' ? '$' + $(id).value : id === 'sc-miles' ? $(id).value : $(id).value + '%');
  const b = boxById($('sc-box').value), m = $('sc-month').value, o = scOpts();
  const s = shouldCost(b, m, o);
  const m12 = months[Math.max(0, months.indexOf(m) - 12)];
  const prev = shouldCost(b, m12, o).total;
  const prices = MD.suppliers.map(sp => ({ sp, p: supplierPrice(sp.id, b.id) })).filter(x => x.p);
  const bestP = Math.min(...prices.map(x => x.p));
  $('sc-metrics').innerHTML = [
    ['Should-cost per box', usd(s.total, 3), mlabel(m), true],
    ['Board share', pct((s.board + s.ink) / s.total, 0), usd(s.ton, 0) + ' / ton board'],
    ['Board area', area(b).toFixed(1) + ' sq ft', MD.grades[b.grade].label],
    ['vs 12 months earlier', (s.total >= prev ? '+' : '') + pct(s.total / prev - 1), mlabel(m12)],
    ['Best price paid today', usd(bestP, 3), pct(bestP / shouldCost(b, lastM(), o).total - 1) + ' over should-cost'],
  ].map(([l, v, sub, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${sub}</span></div>`).join('');
  $('sc-sub').textContent = `${b.name}. Board cost uses the paperboard mills PPI. Labor uses BLS manufacturing wages with a ${MD.cost.labor_burden}x burden. Freight moves with EIA diesel.`;
  const parts = [['Board', s.board, COL.gold], ['Ink and adhesive', s.ink, 'rgba(201,168,76,.45)'], ['Labor', s.labor, COL.blue], ['Energy', s.energy, COL.muted], ['Overhead', s.overhead, 'rgba(237,233,224,.35)'], ['Margin', s.margin, COL.fg], ['Freight', s.freight, COL.orange]];
  draw('ch-sc', {
    type: 'bar', data: { labels: ['Per box'], datasets: parts.map(([l, v, c]) => ({ label: l, data: [v], backgroundColor: c })) },
    options: { indexAxis: 'y', plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${usd(c.parsed.x, 3)} (${pct(c.parsed.x / s.total, 0)})` } } }, scales: { x: { stacked: true, ticks: { callback: v => '$' + v.toFixed(2) } }, y: { stacked: true, display: false } } },
  });
  const L = lastM();
  $('tbl-sc').innerHTML = `<thead><tr><th>Box</th><th class="num">Should-cost (${mlabel(L)})</th>${MD.suppliers.map(sp => `<th class="num">${sp.name}</th>`).join('')}<th class="num">Gap, best price</th></tr></thead><tbody>` +
    MD.boxes.map(bx => {
      const sc = shouldCost(bx, L, o).total;
      const ps = MD.suppliers.map(sp => supplierPrice(sp.id, bx.id));
      const best = Math.min(...ps.filter(Boolean));
      return `<tr class="${bx.id === b.id ? 'base-row' : ''}"><td>${bx.name}</td><td class="num">${usd(sc, 3)}</td>${ps.map(p => `<td class="num">${p ? usd(p, 3) + ` <span class="${p / sc - 1 > 0.15 ? 'ssens-delta-neg' : 'ssens-delta-pos'}">+${pct(p / sc - 1, 0)}</span>` : '--'}</td>`).join('')}<td class="num">${pct(best / sc - 1)}</td></tr>`;
    }).join('') + '</tbody>';
}

/* ---------- 6. Spend cube ---------- */
const DIM = { site: { label: 'Site', name: id => MD.sites.find(s => s.id === id).name }, box: { label: 'Box', name: id => boxById(id).name }, sup: { label: 'Supplier', name: id => supById(id).name + ' · ' + supById(id).archetype } };
function renderCube() {
  let r = $('cube-rows').value, c = $('cube-cols').value;
  if (r === c) { c = r === 'sup' ? 'site' : 'sup'; $('cube-cols').value = c; }
  const meas = $('cube-metric').value, ls = lines();
  const keys = d => [...new Set(ls.map(l => l[d]))];
  const rk = keys(r), ck = keys(c);
  const cell = (fr, fc) => {
    const sub = ls.filter(l => (fr == null || l[r] === fr) && (fc == null || l[c] === fc));
    if (!sub.length) return null;
    const sp = sum(sub.map(l => l.spend)), un = sum(sub.map(l => l.units));
    return { spend: sp, units: un, price: sp / un, opp: sum(sub.map(l => l.opp)) };
  };
  const show = x => x == null ? '<span style="opacity:.25">--</span>' : meas === 'spend' ? usdK(x.spend) : meas === 'units' ? fmt(x.units) : usd(x.price, 3);
  const maxSpend = Math.max(...rk.flatMap(a => ck.map(b => (cell(a, b) || { spend: 0 }).spend)));
  const shade = x => x && meas === 'spend' ? `style="background: rgba(201,168,76,${(0.04 + 0.22 * x.spend / maxSpend).toFixed(3)})"` : '';
  $('cube').innerHTML = `<thead><tr><th>${DIM[r].label} \\ ${DIM[c].label}</th>${ck.map(k => `<th>${DIM[c].name(k).split(' · ')[0]}</th>`).join('')}<th>Total</th><th>Opportunity</th></tr></thead><tbody>` +
    rk.map(a => `<tr><td>${DIM[r].name(a)}</td>${ck.map(b => { const x = cell(a, b); return `<td ${shade(x)}>${show(x)}</td>`; }).join('')}<td>${show(cell(a, null))}</td><td>${usdK(cell(a, null).opp)}</td></tr>`).join('') +
    `<tr class="tot"><td>Total</td>${ck.map(b => `<td>${show(cell(null, b))}</td>`).join('')}<td>${show(cell(null, null))}</td><td>${usdK(cell(null, null).opp)}</td></tr></tbody>`;
  const bySup = MD.suppliers.map(s => ({ s, v: sum(ls.filter(l => l.sup === s.id).map(l => l.spend)) }));
  draw('ch-cube', {
    type: 'doughnut', data: { labels: bySup.map(x => x.s.name), datasets: [{ data: bySup.map(x => x.v), backgroundColor: bySup.map(x => SUPCOL[x.s.id]), borderColor: '#0a0b0d', borderWidth: 2 }] },
    options: { cutout: '62%', plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: c => `${c.label}: ${usdK(c.parsed)} (${pct(c.parsed / sum(bySup.map(x => x.v)), 0)})` } } } },
  });
  $('tbl-spread').innerHTML = `<thead><tr><th>Box</th><th class="num">Lowest</th><th class="num">Highest</th><th class="num">Spread</th><th class="num">Harmonize to lowest</th></tr></thead><tbody>` +
    MD.boxes.map(b => { const bl = ls.filter(l => l.box === b.id), lo = Math.min(...bl.map(l => l.price)), hi = Math.max(...bl.map(l => l.price)); return `<tr><td>${b.name}</td><td class="num">${usd(lo, 3)}</td><td class="num">${usd(hi, 3)}</td><td class="num">${pct(hi / lo - 1, 0)}</td><td class="num">${usdK(sum(bl.map(l => l.opp)))}</td></tr>`; }).join('') + '</tbody>';
}

/* ---------- 7. TCO ---------- */
function tco(sp, b, price) {
  const carry = val('tco-carry') / 100, defect = val('tco-defect'), po = val('tco-po'), wacc = val('tco-wacc') / 100, z = invPhi(val('tco-sl') / 100);
  const demand = totalVol(b.id), per1k = demand / 1000, daily = demand / 365;
  const lot = Math.max(sp.moq_units, demand / 52);
  const moqInv = lot / 2 * price * carry / per1k;
  const ss = z * daily * sp.lead_sd_days * (1 + (100 - sp.otd_pct) / 20) * price * carry / per1k; // late deliveries widen the lead time spread
  const quality = sp.defect_ppm / 1e6 * 1000 * defect;
  const admin = demand / lot * po / per1k;
  const terms = -price * 1000 * wacc * sp.terms_days / 365;
  const unit = price * 1000;
  return { unit, moqInv, ss, quality, admin, terms, total: unit + moqInv + ss + quality + admin + terms };
}
function renderTCO() {
  $('tco-carry-v').textContent = $('tco-carry').value + '%'; $('tco-defect-v').textContent = '$' + (+$('tco-defect').value).toFixed(2);
  $('tco-po-v').textContent = '$' + $('tco-po').value; $('tco-wacc-v').textContent = $('tco-wacc').value + '%'; $('tco-sl-v').textContent = $('tco-sl').value + '%';
  const b = boxById($('tco-box').value), o = scOpts(), sc = shouldCost(b, lastM(), o).total;
  const rows = MD.suppliers.map(sp => {
    const p = supplierPrice(sp.id, b.id), price = p ?? sc * sp.markup;
    return { sp, price, quoted: !p, t: tco(sp, b, price) };
  });
  const parts = [['Unit price', 'unit', COL.gold], ['MOQ inventory', 'moqInv', COL.blue], ['Safety stock', 'ss', COL.muted], ['Defects', 'quality', COL.orange], ['Order admin', 'admin', 'rgba(237,233,224,.35)'], ['Payment terms', 'terms', COL.green]];
  draw('ch-tco', {
    type: 'bar', data: { labels: rows.map(r => r.sp.name), datasets: parts.map(([l, k, c]) => ({ label: l, data: rows.map(r => r.t[k]), backgroundColor: c })) },
    options: { plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usd(c.parsed.y, 2) } } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => '$' + fmt(v) } } } },
  });
  const minT = Math.min(...rows.map(r => r.t.total)), minP = Math.min(...rows.map(r => r.price));
  $('tbl-tco').innerHTML = `<thead><tr><th>Supplier</th><th class="num">Price / box</th><th class="num">Price / 1k</th><th class="num">MOQ inv.</th><th class="num">Safety stock</th><th class="num">Defects</th><th class="num">Admin</th><th class="num">Terms</th><th class="num">TCO / 1k</th><th class="num">vs best</th></tr></thead><tbody>` +
    rows.map(r => `<tr class="${r.t.total === minT ? 'base-row' : ''}"><td>${r.sp.name}${r.quoted ? ' *' : ''}</td><td class="num">${usd(r.price, 3)}</td>${['unit', 'moqInv', 'ss', 'quality', 'admin', 'terms', 'total'].map(k => `<td class="num">${usd(r.t[k], 2)}</td>`).join('')}<td class="num">${r.t.total === minT ? 'best' : '+' + pct(r.t.total / minT - 1)}</td></tr>`).join('') + '</tbody>';
  const cheapP = rows.find(r => r.price === minP), cheapT = rows.find(r => r.t.total === minT);
  $('tco-read').textContent = (cheapP === cheapT
    ? `${cheapT.sp.name} wins on both price and TCO for the ${b.name}.`
    : `${cheapP.sp.name} has the lowest price, but ${cheapT.sp.name} has the lowest total cost. The difference is ${usd(cheapP.t.total - minT, 2)} per 1,000 boxes, or ${usdK((cheapP.t.total - minT) * totalVol(b.id) / 1000)} a year on this box.`) +
    (rows.some(r => r.quoted) ? ' * This supplier does not ship this box today. Its price is modeled from should-cost and its usual markup.' : '');
  S.tcoRows = rows;
}

/* ---------- 8. Scorecard ---------- */
const CRIT = [
  { k: 'cost', name: 'Cost (TCO)', w: 30, computed: true },
  { k: 'quality', name: 'Quality (defects)', w: 20, computed: true },
  { k: 'delivery', name: 'Delivery (on time)', w: 20, computed: true },
  { k: 'resp', name: 'Responsiveness', w: 10, def: { A: 3, B: 4, C: 5 } },
  { k: 'risk', name: 'Supply security', w: 15, def: { A: 5, B: 3, C: 3 } },
  { k: 'sust', name: 'Sustainability', w: 5, def: { A: 4, B: 3, C: 3 } },
];
const S = { judge: {} };
function scores() {
  const o = scOpts();
  const tot = MD.suppliers.map(sp => {
    const t = sum(MD.boxes.map(b => { const p = supplierPrice(sp.id, b.id) ?? shouldCost(b, lastM(), o).total * sp.markup; return tco(sp, b, p).total * totalVol(b.id) / 1000; }));
    return { sp, t };
  });
  const minT = Math.min(...tot.map(x => x.t));
  return MD.suppliers.map(sp => {
    const t = tot.find(x => x.sp === sp).t;
    const s = {
      cost: 5 * minT / t,
      quality: Math.max(1, Math.min(5, 5 - sp.defect_ppm / 1000)),
      delivery: Math.max(1, Math.min(5, 1 + (sp.otd_pct - 85) / 15 * 4)),
      resp: S.judge[sp.id + 'resp'] ?? CRIT[3].def[sp.id],
      risk: S.judge[sp.id + 'risk'] ?? CRIT[4].def[sp.id],
      sust: S.judge[sp.id + 'sust'] ?? CRIT[5].def[sp.id],
    };
    return { sp, s, annualTCO: t };
  });
}
function renderScore() {
  const ws = CRIT.map(c => +($('w-' + c.k)?.value ?? c.w)), wsum = sum(ws) || 1;
  CRIT.forEach((c, i) => { const el = $('w-' + c.k + '-v'); if (el) el.textContent = pct(ws[i] / wsum, 0); });
  const sc = scores().map(x => ({ ...x, total: sum(CRIT.map((c, i) => x.s[c.k] * ws[i] / wsum)) }));
  const ranked = [...sc].sort((a, b) => b.total - a.total);
  $('tbl-score').innerHTML = `<thead><tr><th>Criterion</th><th class="num">Weight</th>${sc.map(x => `<th class="num">${x.sp.name}</th>`).join('')}</tr></thead><tbody>` +
    CRIT.map((c, i) => `<tr><td>${c.name}${c.computed ? '' : ' <span class="assump">Judgment</span>'}</td><td class="num">${pct(ws[i] / wsum, 0)}</td>${sc.map(x => c.computed ? `<td class="num">${x.s[c.k].toFixed(2)}</td>` : `<td class="num"><select class="judge" data-id="${x.sp.id + c.k}" aria-label="${c.name} score for ${x.sp.name}">${[1, 2, 3, 4, 5].map(v => `<option ${v === x.s[c.k] ? 'selected' : ''}>${v}</option>`).join('')}</select></td>`).join('')}</tr>`).join('') +
    `<tr class="base-row"><td>Weighted score (out of 5)</td><td></td>${sc.map(x => `<td class="num">${x.total.toFixed(2)}</td>`).join('')}</tr>` +
    `<tr><td>Rank</td><td></td>${sc.map(x => `<td class="num">${ranked.indexOf(x) + 1}</td>`).join('')}</tr></tbody>`;
  $('tbl-score').querySelectorAll('select.judge').forEach(el => el.addEventListener('change', () => { S.judge[el.dataset.id] = +el.value; renderScore(); }));
  draw('ch-score', {
    type: 'radar', data: { labels: CRIT.map(c => c.name.split(' (')[0]), datasets: sc.map(x => ({ label: x.sp.name, data: CRIT.map(c => x.s[c.k]), borderColor: SUPCOL[x.sp.id], backgroundColor: SUPCOL[x.sp.id] + '22', pointRadius: 2 })) },
    options: { scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,.08)' }, angleLines: { color: 'rgba(255,255,255,.08)' }, pointLabels: { color: 'rgba(237,233,224,.6)' } } } },
  });
}

/* ---------- 9. RFQ ---------- */
function rfqEval() {
  const wp = val('rfq-wp'), wt = val('rfq-wt'), wc = val('rfq-wc'), ws = wp + wt + wc || 1;
  const vol = Object.fromEntries(MD.boxes.map(b => [b.id, totalVol(b.id)]));
  const bids = MD.rfq.map(r => ({ r, annual: sum(MD.boxes.map(b => r.bids[b.id] * vol[b.id])) }));
  const minA = Math.min(...bids.map(x => x.annual));
  // scale a factor across the bid range: best bid = 100, worst = 0
  const scale = (key, higherIsBetter) => {
    const v = MD.rfq.map(r => r[key]), lo = Math.min(...v), hi = Math.max(...v);
    return r => hi === lo ? 100 : (higherIsBetter ? (r[key] - lo) / (hi - lo) : (hi - r[key]) / (hi - lo)) * 100;
  };
  const sTerms = scale('terms_days', true), sLead = scale('lead_days', false), sMoq = scale('moq_units', false);
  bids.forEach(x => {
    x.price = Math.max(0, 100 - (x.annual / minA - 1) * 100 * 4); // lose 4 points per 1% above the lowest bid
    x.tech = x.r.tech / 5 * 100;
    x.comm = (sTerms(x.r) + sLead(x.r) + sMoq(x.r)) / 3;
    x.total = (x.price * wp + x.tech * wt + x.comm * wc) / ws;
  });
  const ranked = [...bids].sort((a, b) => b.total - a.total);
  return { bids, ranked, vol, w: [wp / ws, wt / ws, wc / ws] };
}
function renderRFQ() {
  $('rfq-wp-v').textContent = $('rfq-wp').value; $('rfq-wt-v').textContent = $('rfq-wt').value; $('rfq-wc-v').textContent = $('rfq-wc').value; $('rfq-split-v').textContent = $('rfq-split').value + '%';
  const E = rfqEval(), ls = lines(), baseline = sum(ls.map(l => l.spend));
  const minBid = Object.fromEntries(MD.boxes.map(b => [b.id, Math.min(...MD.rfq.map(r => r.bids[b.id]))]));
  $('tbl-rfq').innerHTML = `<thead><tr><th>Bidder</th>${MD.boxes.map(b => `<th class="num">${b.id}</th>`).join('')}<th class="num">Annual cost</th><th class="num">Lead / terms / MOQ</th><th>Index clause</th><th class="num">Price ${pct(E.w[0], 0)}</th><th class="num">Tech ${pct(E.w[1], 0)}</th><th class="num">Comm. ${pct(E.w[2], 0)}</th><th class="num">Score</th><th class="num">Rank</th></tr></thead><tbody>` +
    E.bids.map(x => `<tr class="${E.ranked[0] === x ? 'base-row' : ''}"><td>${x.r.name}</td>${MD.boxes.map(b => `<td class="num ${x.r.bids[b.id] === minBid[b.id] ? 'win' : ''}">${usd(x.r.bids[b.id], 3)}</td>`).join('')}<td class="num">${usdK(x.annual)}</td><td class="num">${x.r.lead_days}d / ${x.r.terms_days}d / ${fmt(x.r.moq_units)}</td><td>${x.r.index_clause}</td><td class="num">${x.price.toFixed(0)}</td><td class="num">${x.tech.toFixed(0)}</td><td class="num">${x.comm.toFixed(0)}</td><td class="num">${x.total.toFixed(1)}</td><td class="num">${E.ranked.indexOf(x) + 1}</td></tr>`).join('') + '</tbody>';
  const top = E.ranked[0], second = E.ranked[1], split = val('rfq-split') / 100;
  const single = top.annual;
  const cherry = sum(MD.boxes.map(b => minBid[b.id] * E.vol[b.id]));
  const cherrySup = new Set(MD.boxes.map(b => MD.rfq.find(r => r.bids[b.id] === minBid[b.id]).id)).size;
  const dual = sum(MD.boxes.map(b => E.vol[b.id] * ((1 - split) * top.r.bids[b.id] + split * second.r.bids[b.id])));
  const awards = [
    ['Current spend', baseline, `${new Set(ls.map(l => l.sup)).size} suppliers, no common contract`, false],
    [`Single award: ${top.r.name}`, single, '1 supplier. Most leverage, most risk.', false],
    [`Line by line lowest bid`, cherry, `${cherrySup} suppliers. Lowest price, more to manage.`, false],
    [`Dual source ${pct(1 - split, 0)} / ${pct(split, 0)}`, dual, `${top.r.name} + ${second.r.name}. Keeps a backup qualified.`, true],
  ];
  $('rfq-awards').innerHTML = awards.map(([l, v, sub, h], i) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${usdK(v)}</span><span class="sm-sub">${i ? `<span class="${v < baseline ? 'ssens-delta-pos' : 'ssens-delta-neg'}">${v < baseline ? 'saves' : 'adds'} ${usdK(Math.abs(baseline - v))} (${pct(Math.abs(1 - v / baseline))})</span><br>` : ''}${sub}</span></div>`).join('');
  $('rfq-read').textContent = `${top.r.name} ranks first at these weights with a score of ${top.total.toFixed(1)}. ` +
    (dual >= single
      ? `A ${pct(1 - split, 0)} / ${pct(split, 0)} split with ${second.r.name} costs ${usdK(dual - single)} more a year than a single award. That is the price of keeping a second qualified source in a category where board prices swing. `
      : `A ${pct(1 - split, 0)} / ${pct(split, 0)} split with ${second.r.name} is ${usdK(single - dual)} a year cheaper than a single award, and it keeps a second qualified source. `) +
    `Line by line award is cheapest at ${usdK(cherry)}, but it spreads volume across ${cherrySup} suppliers and weakens leverage at the next renewal.`;
  $('k-opp').textContent = pct(1 - dual / baseline, 0);
  S.rfq = E; S.baseline = baseline;
}

/* ---------- 10. Negotiation ---------- */
function renderNego() {
  const supId = $('ng-sup').value, b = boxById($('ng-box').value), o = scOpts();
  const r = MD.rfq.find(x => x.id === supId), bid = r.bids[b.id];
  const floor = shouldCost(b, lastM(), o).total;
  const others = MD.rfq.filter(x => x.id !== supId).map(x => ({ x, p: x.bids[b.id] })).sort((a, c) => a.p - c.p);
  const batna = others[0];
  const walk = Math.max(floor, batna.p);
  const ask = floor + 0.35 * (Math.min(bid, walk) - floor);
  const settle = (ask + Math.min(bid, walk)) / 2;
  draw('ch-nego', {
    type: 'bar',
    data: { labels: ['Should-cost floor', 'Opening ask', 'Target settle', 'Walk-away (best alternative)', 'Their bid'], datasets: [{ data: [floor, ask, settle, walk, bid], backgroundColor: [COL.muted, COL.gold, 'rgba(201,168,76,.55)', COL.blue, COL.orange] }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => usd(c.parsed.x, 4) } } }, scales: { x: { min: floor * 0.9, ticks: { callback: v => '$' + v.toFixed(2) } } } },
  });
  // index volatility from real paperboard PPI
  const v = MK.series.containerboard_ppi.values, yoy = v.slice(12).map((x, i) => x / v[i] - 1);
  const vol = sd(yoy), maxUp = Math.max(...yoy), maxDn = Math.min(...yoy);
  const s = shouldCost(b, lastM(), o), boardShare = (s.board + s.ink) / s.total;
  const share = (() => { const ls = lines(), tot = sum(ls.map(l => l.spend)), mine = sum(ls.filter(l => l.sup === supId).map(l => l.spend)); return tot ? mine / tot : 0; })();
  const annualAtBid = sum(MD.boxes.map(bx => r.bids[bx.id] * totalVol(bx.id)));
  const wacc = val('tco-wacc') / 100;
  const termsGain = r.terms_days < 60 ? annualAtBid * wacc * (Math.min(60, r.terms_days + 15) - r.terms_days) / 365 : 0;
  const credible = MD.rfq.filter(x => x.bids[b.id] <= Math.min(...MD.rfq.map(y => y.bids[b.id])) * 1.05).length;
  const priceGap = (bid - settle) * totalVol(b.id);
  $('nego-cards').innerHTML = `
    <div class="pcard"><h6>Position</h6><ul>
      <li>Their bid is ${pct(bid / floor - 1)} over should-cost. Margin room is ${usd(bid - floor, 3)} per box.</li>
      <li>Best alternative: ${batna.x.name} at ${usd(batna.p, 3)}.</li>
      <li>${credible} bidder${credible === 1 ? '' : 's'} within 5% of the lowest price. ${credible >= 3 ? 'Strong competitive tension.' : 'Thin competition. Protect the alternative.'}</li>
      <li>${r.name} holds ${pct(share, 0)} of current spend. ${share > 0.4 ? 'They have the most to lose.' : 'Award growth is your main carrot.'}</li></ul></div>
    <div class="pcard"><h6>Targets for ${b.name}</h6><ul>
      <li>Open at ${usd(ask, 3)}. Anchor on the should-cost build, line by line.</li>
      <li>Target ${usd(settle, 3)}. Worth ${usdK(priceGap)} a year on this box vs their bid.</li>
      <li>Walk away above ${usd(walk, 3)}. Move the volume to ${batna.x.name}.</li></ul></div>
    <div class="pcard"><h6>Index clause</h6><ul>
      <li>Paperboard PPI swung from ${pct(maxDn, 0)} to +${pct(maxUp, 0)} year over year since ${mlabel(months[12])}. Standard deviation ${pct(vol, 0)}.</li>
      <li>Board is ${pct(boardShare, 0)} of this box's should-cost. Index only that share, not the whole price.</li>
      <li>Ask for quarterly resets, a 3% dead band and symmetric pass-through, so prices also fall when board falls.</li></ul></div>
    <div class="pcard"><h6>Give and get</h6><ul>
      <li>${termsGain > 0 ? `Ask for ${Math.min(60, r.terms_days + 15)} day terms. Worth ${usdK(termsGain)} a year at ${pct(wacc, 1)} cost of capital.` : 'Terms are already at 60 days. Do not trade price for terms.'}</li>
      <li>${r.moq_units > 2500 ? `Offer forecast sharing and a blanket PO in exchange for MOQ relief below ${fmt(r.moq_units)} units.` : 'MOQ is already low. Offer a 12 month volume commitment for price.'}</li>
      <li>Trade a 2 year term for a price hold on conversion cost. Let board float on the index.</li></ul></div>`;
}

/* ---------- 11. Compliance ---------- */
function renderComp() {
  $('cp-tol-v').textContent = (+$('cp-tol').value).toFixed(1) + '%'; $('cp-pt-v').textContent = $('cp-pt').value + '%';
  const C = MD.contract, pt = val('cp-pt') / 100, tol = val('cp-tol') / 100, site = $('cp-site').value;
  const base = at(C.index, C.base_month);
  const rows = MD.invoices.filter(l => site === 'ALL' || l.site === site).map(l => {
    const allowed = C.base_price[l.box] * (1 + pt * (at(C.index, l.month) / base - 1));
    const varP = l.unit_price / allowed - 1, spend = l.unit_price * l.qty;
    let type = '', impact = 0;
    if (!l.po_on_contract) { type = 'Off contract'; impact = Math.max(0, (l.unit_price - allowed) * l.qty); }
    else if (varP > tol) { type = 'Overbilled'; impact = (l.unit_price - allowed) * l.qty; }
    return { ...l, allowed, varP, spend, type, impact };
  });
  const spend = sum(rows.map(r => r.spend)), onC = sum(rows.filter(r => r.po_on_contract).map(r => r.spend));
  const over = sum(rows.filter(r => r.type === 'Overbilled').map(r => r.impact)), off = sum(rows.filter(r => r.type === 'Off contract').map(r => r.impact));
  $('cp-metrics').innerHTML = [
    ['Invoiced spend, 12 months', usdK(spend), fmt(rows.length) + ' invoice lines'],
    ['On-contract spend', pct(onC / spend), 'target 95% or more', onC / spend < 0.95],
    ['Overbilling', usdK(over), rows.filter(r => r.type === 'Overbilled').length + ' lines over tolerance', true],
    ['Off-contract premium', usdK(off), rows.filter(r => r.type === 'Off contract').length + ' lines bought off contract', true],
    ['Total leakage', pct((over + off) / spend), usdK(over + off) + ' recoverable or avoidable'],
  ].map(([l, v, s, h]) => `<div class="sim-metric ${h ? 'highlight' : ''}"><span class="sm-label">${l}</span><span class="sm-value">${v}</span><span class="sm-sub">${s}</span></div>`).join('');
  const ms = [...new Set(rows.map(r => r.month))].sort();
  draw('ch-comp', {
    type: 'bar',
    data: { labels: ms.map(mlabel), datasets: [
      { label: 'Overbilling', data: ms.map(m => sum(rows.filter(r => r.month === m && r.type === 'Overbilled').map(r => r.impact))), backgroundColor: COL.orange },
      { label: 'Off-contract premium', data: ms.map(m => sum(rows.filter(r => r.month === m && r.type === 'Off contract').map(r => r.impact))), backgroundColor: COL.gold },
    ] },
    options: { plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': ' + usd(c.parsed.y) } } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => usdK(v) } } } },
  });
  const ex = rows.filter(r => r.type).sort((a, b) => b.impact - a.impact).slice(0, 40);
  $('tbl-comp').innerHTML = `<thead><tr><th>Month</th><th>Site</th><th>Box</th><th class="num">Qty</th><th class="num">Invoiced</th><th class="num">Allowed</th><th class="num">Variance</th><th>Type</th><th class="num">Impact</th></tr></thead><tbody>` +
    ex.map(r => `<tr><td>${mlabel(r.month)}</td><td>${r.site}</td><td>${r.box}</td><td class="num">${fmt(r.qty)}</td><td class="num">${usd(r.unit_price, 4)}</td><td class="num">${usd(r.allowed, 4)}</td><td class="num ssens-delta-neg">+${pct(r.varP)}</td><td>${r.type === 'Overbilled' ? '<span class="pill bad">Overbilled</span>' : '<span class="pill warn">Off contract</span>'}</td><td class="num">${usd(r.impact)}</td></tr>`).join('') + '</tbody>';
}

/* ---------- 12. Sources ---------- */
function renderSources() {
  const items = Object.values(MK.series).map(s => `${s.title}. FRED series <a href="https://fred.stlouisfed.org/series/${s.fred}" target="_blank" rel="noopener noreferrer">${s.fred}</a>. ${mlabel(months[0])} to ${mlabel(lastM())}.`);
  items.push(`Should-cost anchors in ${mlabel(MD.anchor.month)} <span class="assump">Assumption</span>: containerboard $${MD.anchor.board_usd_per_ton} per ton, power $${MD.anchor.power_usd_per_kwh} per kWh, truck freight $${MD.anchor.freight_usd_per_mile.toFixed(2)} per mile. Each moves with its real index after that month.`);
  items.push(`Board weights <span class="assump">Assumption</span>: ${Object.values(MD.grades).map(g => `${g.label} ${g.lbs_per_msf} lb per MSF`).join(', ')}. Box blank area uses the standard RSC layout: (2L + 2W + glue flap) × (H + W).`);
  items.push(`Volumes, prices, bids, supplier profiles and invoices are illustrative model inputs. Supplier labels A to D are archetypes, not real companies.`);
  $('src-list').innerHTML = items.map(x => `<li>${x}</li>`).join('');
}

/* ---------- 13. Init ---------- */
function renderAll() { renderMarket(); renderShouldCost(); renderCube(); renderTCO(); renderScore(); renderRFQ(); renderNego(); renderComp(); }
async function init() {
  chartDefaults();
  try {
    const res = await fetch('data.json'); if (!res.ok) throw new Error('HTTP ' + res.status);
    D = await res.json();
  } catch (e) {
    document.querySelector('.proj-wrap').insertAdjacentHTML('afterbegin', `<div class="load-error">Could not load data.json (${e.message}). If you opened this file directly, run a local server instead. See README.md.</div>`);
    return;
  }
  MK = D.market; MD = D.model; months = MK.months;
  const boxOpts = MD.boxes.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  ['sc-box', 'tco-box', 'ng-box'].forEach(id => $(id).innerHTML = boxOpts);
  $('sc-box').value = 'RSC-M'; $('tco-box').value = 'RSC-M'; $('ng-box').value = 'RSC-M';
  $('sc-month').innerHTML = months.slice().reverse().map(m => `<option value="${m}">${mlabel(m)}</option>`).join('');
  $('ng-sup').innerHTML = MD.rfq.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  $('cp-site').innerHTML = '<option value="ALL">All sites</option>' + MD.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  $('sc-ton').value = MD.anchor.board_usd_per_ton; $('sc-waste').value = MD.cost.waste_pct; $('sc-oh').value = MD.cost.overhead_pct; $('sc-margin').value = MD.cost.margin_pct; $('sc-miles').value = MD.cost.freight_miles;
  $('cp-pt').value = MD.contract.pass_through_pct;
  $('weights').innerHTML = CRIT.map(c => `<div class="sim-field"><label for="w-${c.k}">${c.name} <b id="w-${c.k}-v"></b></label><input type="range" id="w-${c.k}" min="0" max="50" step="5" value="${c.w}"></div>`).join('');
  $('seg-base').innerHTML = [['2015-01', 'Base 2015'], ['2020-01', 'Base 2020'], [months[months.length - 25], 'Base 2 yrs ago']].map(([m, l]) => `<button data-m="${m}" class="${m === baseIdx ? 'on' : ''}">${l}</button>`).join('');
  $('seg-base').querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { baseIdx = btn.dataset.m; $('seg-base').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === btn)); renderMarket(); }));

  ['sc-ton', 'sc-waste', 'sc-oh', 'sc-margin', 'sc-miles'].forEach(id => $(id).addEventListener('input', () => debounce(renderAll)));
  ['sc-box', 'sc-month'].forEach(id => $(id).addEventListener('change', renderShouldCost));
  ['cube-rows', 'cube-cols', 'cube-metric'].forEach(id => $(id).addEventListener('change', renderCube));
  ['tco-carry', 'tco-defect', 'tco-po', 'tco-wacc', 'tco-sl'].forEach(id => $(id).addEventListener('input', () => debounce(() => { renderTCO(); renderScore(); renderNego(); })));
  $('tco-box').addEventListener('change', renderTCO);
  CRIT.forEach(c => $('w-' + c.k).addEventListener('input', () => debounce(renderScore)));
  ['rfq-wp', 'rfq-wt', 'rfq-wc', 'rfq-split'].forEach(id => $(id).addEventListener('input', () => debounce(renderRFQ)));
  ['ng-sup', 'ng-box'].forEach(id => $(id).addEventListener('change', renderNego));
  ['cp-tol', 'cp-pt'].forEach(id => $(id).addEventListener('input', () => debounce(renderComp)));
  $('cp-site').addEventListener('change', renderComp);
  renderSources();
  renderAll();
}
init();
