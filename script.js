// 1. PRELOADER & HERO REVEAL
(function initPreloader() {
    let loadProgress = 0;
    const ltext = document.getElementById('ltext');
    const preloader = document.getElementById('preloader');

    if (!preloader) return; 

    const loadInterval = setInterval(() => {
        // Randomizes the loading speed for a realistic feel
        loadProgress += Math.floor(Math.random() * 6) + 1; 
        
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            
            // Wait slightly at 100% so it doesn't instantly vanish
            setTimeout(() => {
                document.body.classList.add('loaded');
                revealHero(); // THE FIX: This triggers the text animation
            }, 600); 
        }
        
        // Silently updates the hidden counter 
        if (ltext) {
            ltext.textContent = (loadProgress < 10 ? '0' : '') + loadProgress + '%';
        }
    }, 150);
})();

// THE RESTORED HERO REVEAL FUNCTION
function revealHero() {
    const eyebrow = document.getElementById('h-eyebrow');
    const words = document.querySelectorAll('.hero-hl .word');
    const sub = document.getElementById('h-sub');
    const act = document.getElementById('h-act');

    if (eyebrow) eyebrow.classList.add('show');
    if (words) words.forEach(w => w.classList.add('show'));
    if (sub) sub.classList.add('show');
    if (act) act.classList.add('show');
}

// 2. CURSOR & AMBIENT AURA
const cdot=document.getElementById('cdot');
const cring=document.getElementById('cring');
const ctip=document.getElementById('ctip');
const aura=document.getElementById('aura');
let mx=window.innerWidth/2,my=window.innerHeight/2;
let rx=mx,ry=my,ax=mx,ay=my;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;ctip.style.left=mx+'px';ctip.style.top=my+'px';});
(function loop(){
  cdot.style.left=mx+'px';cdot.style.top=my+'px';
  rx+=(mx-rx)*.11;ry+=(my-ry)*.11;
  cring.style.left=rx+'px';cring.style.top=ry+'px';
  ax+=(mx-ax)*.04;ay+=(my-ay)*.04;
  aura.style.transform=`translate(calc(${ax}px - 50%), calc(${ay}px - 50%))`;
  requestAnimationFrame(loop);
})();
document.addEventListener('mousedown',()=>cring.classList.add('clk'));
document.addEventListener('mouseup',()=>cring.classList.remove('clk'));
document.querySelectorAll('a,button,.phase,.svc-hd,.case-flip,.tile-flip,.mag').forEach(el=>{
  el.addEventListener('mouseenter',()=>cring.classList.add('hov'));
  el.addEventListener('mouseleave',()=>cring.classList.remove('hov'));
});
document.querySelectorAll('[data-tip]').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ctip.textContent=el.dataset.tip;ctip.style.opacity='1';});
  el.addEventListener('mouseleave',()=>{ctip.style.opacity='0';});
});

// 3. SCROLL PROGRESS
const sprog=document.getElementById('sprog');
window.addEventListener('scroll',()=>{
  sprog.style.width=Math.min(window.scrollY/(document.body.scrollHeight-innerHeight)*100,100)+'%';
},{passive:true});

// 4. PARALLAX HERO BG
const heroBg=document.getElementById('hero-bg');
window.addEventListener('scroll',()=>{
  if(window.scrollY<window.innerHeight*1.4)
    heroBg.style.transform=`scale(1.1) translateY(${window.scrollY*.22}px)`;
},{passive:true});

// 5. WORD SCRUB
const scrubText=document.getElementById('scrub-text');
const scrubSection=document.getElementById('scrub-section');
if(scrubText){
  const words=scrubText.innerText.split(' ');
  scrubText.innerHTML='';
  words.forEach(w=>{
    if(!w.trim())return;
    const s=document.createElement('span');
    s.innerText=w+' ';s.className='scrub-word';
    scrubText.appendChild(s);
  });
}
const scrubWords=document.querySelectorAll('.scrub-word');
window.addEventListener('scroll',()=>{
  if(!scrubSection||!scrubWords.length)return;
  const rect=scrubSection.getBoundingClientRect();
  const start=innerHeight*.8,end=innerHeight*.2;
  if(rect.top<start){
    const p=Math.max(0,Math.min(1,(start-rect.top)/(start-end)));
    const lit=Math.floor(p*scrubWords.length);
    scrubWords.forEach((w,i)=>w.classList.toggle('lit',i<lit));
  }else{scrubWords.forEach(w=>w.classList.remove('lit'));}
},{passive:true});
let scrubTimer=null;
const scrubObs=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){scrubTimer=setTimeout(()=>scrubWords.forEach(w=>w.classList.add('lit')),2500);}
    else{clearTimeout(scrubTimer);}
  });
},{threshold:.3});
if(scrubSection)scrubObs.observe(scrubSection);

// 6. SCROLL REVEAL
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(!en.isIntersecting)return;
    setTimeout(()=>en.target.classList.add('in'),parseInt(en.target.dataset.delay||0,10));
    revObs.unobserve(en.target);
  });
},{threshold:.08,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('[data-a]').forEach(el=>revObs.observe(el));

// 7. COUNTER ANIMATION
const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(!en.isIntersecting)return;
    const el=en.target;
    const target=parseFloat(el.dataset.count);
    const sfx=el.dataset.sfx||'',pfx=el.dataset.pfx||'';
    const dec=target%1!==0?1:0;
    const dur=1800,t0=performance.now();
    const tick=now=>{
      const p=Math.min((now-t0)/dur,1);
      const e=1-Math.pow(2,-10*p);
      el.textContent=pfx+(dec?(target*e).toFixed(1):Math.round(target*e))+sfx;
      if(p<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cntObs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cntObs.observe(el));

// 8. NAV STICKY & ACTIVE
const mainnav=document.getElementById('mainnav');
const navAs=document.querySelectorAll('.nav-links a');
const secs=document.querySelectorAll('section[id],div[id="scrub-section"]');
const dots=document.querySelectorAll('.sdot');
window.addEventListener('scroll',()=>{
  mainnav.classList.toggle('stk',window.scrollY>55);
  let cur='';
  secs.forEach(s=>{if(window.scrollY>=s.offsetTop-240)cur=s.id;});
  navAs.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+cur));
  dots.forEach(d=>d.classList.toggle('act',d.dataset.target===cur));
},{passive:true});
dots.forEach(d=>d.addEventListener('click',()=>{
  const t=document.getElementById(d.dataset.target);
  if(t)t.scrollIntoView({behavior:'smooth'});
}));
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+scrollY-80,behavior:'smooth'});}
  });
});

// 9. MAGNETIC PARALLAX (hero button)
document.querySelectorAll('.mag').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const dx=(e.clientX-(r.left+r.width/2))*.3,dy=(e.clientY-(r.top+r.height/2))*.3;
    btn.style.transform=`translate(${dx}px,${dy}px)`;
    btn.style.transition='transform .08s linear';
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transform='translate(0,0)';
    btn.style.transition='transform .55s cubic-bezier(.16,1,.3,1)';
  });
});

// 10. ABOUT IMAGE TILT
const tiltEl=document.getElementById('aboutImg');
if(tiltEl){
  tiltEl.addEventListener('mousemove',e=>{
    const r=tiltEl.getBoundingClientRect();
    const xp=(e.clientX-r.left)/r.width-.5,yp=(e.clientY-r.top)/r.height-.5;
    tiltEl.style.transform=`perspective(700px) rotateY(${xp*8}deg) rotateX(${-yp*8}deg) scale(1.02)`;
    tiltEl.style.transition='transform .06s linear';
  });
  tiltEl.addEventListener('mouseleave',()=>{
    tiltEl.style.transform='perspective(700px) rotateY(0) rotateX(0) scale(1)';
    tiltEl.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';
  });
}

// 12. VIDEO MODAL
function openVid(src){
  const m=document.getElementById('vmodal'),v=document.getElementById('vmodvid');
  v.src=src;m.classList.add('open');
  requestAnimationFrame(()=>v.play().catch(()=>{}));
}
function closeVid(){
  const m=document.getElementById('vmodal'),v=document.getElementById('vmodvid');
  v.pause();v.src='';m.classList.remove('open');
}
document.getElementById('vmodal').addEventListener('click',function(e){if(e.target===this)closeVid();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVid();});

// 13. SCROLL-TIED MARQUEES
const mqTrack=document.querySelector('.mq-track');
const bmqTrack=document.querySelector('.bmq-track');
window.addEventListener('scroll',()=>{
  const offset=(window.scrollY*.08)%50;
  if(mqTrack)mqTrack.style.transform=`translateX(-${offset}%)`;
  if(bmqTrack)bmqTrack.style.transform=`translateX(-${50-offset}%)`;
},{passive:true});

// 14. HERO TEXT EVASION
const evasiveWords=document.querySelectorAll('.hero-hl .word');
document.addEventListener('mousemove',e=>{
  if(window.scrollY>window.innerHeight)return;
  evasiveWords.forEach(word=>{
    if(!word.classList.contains('show'))return;
    const rect=word.getBoundingClientRect();
    const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
    const dist=Math.sqrt(dx*dx+dy*dy),radius=200;
    if(dist<radius){
      const force=(radius-dist)/radius;
      word.style.transform=`translate(${-(dx/dist)*force*35}px,${-(dy/dist)*force*35}px)`;
      word.style.transition='transform .1s ease-out';
    }else{
      word.style.transform='translate(0,0)';
      word.style.transition='transform .7s cubic-bezier(.16,1,.3,1)';
    }
  });
});

// 15. CASE CARD FLIP + MAGNETIC TILT
document.querySelectorAll('.case-flip').forEach(card=>{
  card.addEventListener('click',()=>card.classList.toggle('flipped'));
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const xp=((e.clientX-r.left)/r.width-.5)*2,yp=((e.clientY-r.top)/r.height-.5)*2;
    const inner=card.querySelector('.case-inner');
    if(!card.classList.contains('flipped')){
      inner.style.transform=`perspective(900px) rotateY(${xp*5}deg) rotateX(${-yp*5}deg) scale(1.02)`;
      inner.style.transition='transform .12s linear';
    }
  });
  card.addEventListener('mouseleave',()=>{
    const inner=card.querySelector('.case-inner');
    if(!card.classList.contains('flipped')){
      inner.style.transform='perspective(900px) rotateY(0) rotateX(0) scale(1)';
      inner.style.transition='transform .55s cubic-bezier(.16,1,.3,1)';
    }
  });
});

// 16. TILE OVERLAY (tap for mobile, hover handled via CSS)
document.querySelectorAll('.tile-flip').forEach(tile=>{
  tile.addEventListener('click',()=>{
    // On touch: toggle overlay; on hover devices, CSS handles it
    tile.classList.toggle('flipped');
  });
});

// ═══════════════════════════════════════════════════════════
// INVENTORY OPTIMISATION SIMULATOR
// Models: EOQ, Safety Stock (combined variance), Reorder Point,
//         Total Cost Curve, Service Level sensitivity
// ═══════════════════════════════════════════════════════════
(function(){
'use strict';

/* ── Chart.js loader ───────────────────────────────────── */
let chartsReady = false;
let pendingRun  = false;
(function loadChartJS(){
  if(window.Chart){ chartsReady=true; return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  s.onload = () => { chartsReady=true; if(pendingRun){ pendingRun=false; _executeRun(); } };
  document.head.appendChild(s);
})();

/* ── Shared chart defaults ─────────────────────────────── */
const GOLD='#c9a84c', BLUE='#4a90e2', ORG='#e05a00';
const GOLD_DIM='rgba(201,168,76,0.15)', FG_DIM='rgba(237,233,224,0.07)', FG='rgba(237,233,224,0.35)';
const chartDefs = {
  responsive:true, maintainAspectRatio:false,
  animation:{ duration:500, easing:'easeInOutQuart' },
  plugins:{ legend:{ display:false },
    tooltip:{
      backgroundColor:'rgba(8,9,14,.95)', borderColor:'rgba(201,168,76,.3)', borderWidth:1,
      titleColor:'rgba(237,233,224,.55)', bodyColor:GOLD, padding:10,
      titleFont:{ size:10, family:'DM Sans' }, bodyFont:{ size:11, family:'DM Sans', weight:'600' }
    }
  },
  scales:{
    x:{ ticks:{ color:FG, font:{ size:9, family:'DM Sans' } }, grid:{ color:FG_DIM }, border:{ color:FG_DIM } },
    y:{ ticks:{ color:FG, font:{ size:9, family:'DM Sans' } }, grid:{ color:FG_DIM }, border:{ color:FG_DIM } }
  }
};

let charts = {};

/* ── Z-score lookup (for service level → safety factor) ── */
const Z_TABLE = {
  50:0.00, 55:0.13, 60:0.25, 65:0.39, 70:0.52, 75:0.67,
  80:0.84, 85:1.04, 90:1.28, 91:1.34, 92:1.41, 93:1.48,
  94:1.55, 95:1.65, 96:1.75, 97:1.88, 98:2.05, 99:2.33,
  99.5:2.58, 99.9:3.09
};

function getZ(pct){
  // Interpolate from Z_TABLE
  const keys = Object.keys(Z_TABLE).map(Number).sort((a,b)=>a-b);
  for(let i=0;i<keys.length-1;i++){
    if(pct>=keys[i] && pct<=keys[i+1]){
      const t=(pct-keys[i])/(keys[i+1]-keys[i]);
      return Z_TABLE[keys[i]] + t*(Z_TABLE[keys[i+1]]-Z_TABLE[keys[i]]);
    }
  }
  return Z_TABLE[99.9];
}

/* ── Core inventory formulas ─────────────────────────────── */
function calcEOQ(D, S, H){
  // Economic Order Quantity: sqrt(2DS/H)
  // D=annual demand, S=ordering cost, H=annual holding cost per unit
  return Math.sqrt((2 * D * S) / H);
}

function calcSafetyStock(z, sigmaD, sigmaL, avgD, avgL){
  // Combined variance safety stock formula:
  // SS = z * sqrt(avgL * sigmaD^2 + avgD^2 * sigmaL^2)
  const combinedStdDev = Math.sqrt(avgL * sigmaD*sigmaD + avgD*avgD * sigmaL*sigmaL);
  return z * combinedStdDev;
}

function calcROP(avgD, avgL, ss){
  // Reorder Point = Avg daily demand * lead time + safety stock
  return (avgD / 365) * avgL + ss;
}

function calcTotalCost(D, Q, S, H_unit, ss, H_unit_val){
  // TC = (D/Q)*S + (Q/2)*H_unit + ss*H_unit
  const orderingCost = (D / Q) * S;
  const holdingCost  = (Q / 2) * H_unit + ss * H_unit;
  return { orderingCost, holdingCost, total: orderingCost + holdingCost };
}

function calcStockoutRiskCost(D, Q, z, sigmaD, avgL, unitCost, servicePct){
  // Rough stockout risk annualised: expected units short per cycle * cycles/year * unit cost
  const cyclesPerYear = D / Q;
  // Expected shortage per cycle (normal loss function approximation)
  const sigmaLT = Math.sqrt(avgL) * sigmaD;
  // Unit normal loss L(z) ≈ phi(z) - z*(1-Phi(z)), approximate
  const phi_z = Math.exp(-0.5*z*z) / Math.sqrt(2*Math.PI);
  const Phi_z = (1 + (1-(servicePct/100)));
  const L_z   = Math.max(phi_z - z*(1-servicePct/100), 0);
  const expectedShortage = sigmaLT * L_z;
  return expectedShortage * cyclesPerYear * unitCost * 0.25; // 25% shortage cost factor
}

/* ── Number formatters ────────────────────────────────────── */
function fmt$(n){
  if(n>=1e6) return '$' + (n/1e6).toFixed(2)+'M';
  if(n>=1e3) return '$' + (n/1e3).toFixed(1)+'K';
  return '$' + n.toFixed(0);
}
function fmtN(n){ return n>=1e3 ? (n/1e3).toFixed(1)+'K' : Math.round(n).toLocaleString(); }

/* ── Guide step highlighter ───────────────────────────────── */
function setGuideStep(n){
  document.querySelectorAll('.sim-guide-step').forEach((el,i)=>{
    el.classList.toggle('active', i===n);
  });
}

/* ── Main run function (exposed globally) ─────────────────── */
window.runSimulator = function(){
  if(!chartsReady){ pendingRun=true; return; }
  setGuideStep(2);
  const btn = document.getElementById('sim-run-btn');
  btn.classList.add('loading');
  document.getElementById('sim-btn-text').textContent = 'Computing...';
  setTimeout(()=>{ _executeRun(); btn.classList.remove('loading'); document.getElementById('sim-btn-text').textContent='Re-run Model'; }, 80);
};

window.resetSimulator = function(){
  document.getElementById('sim-results').style.display='none';
  document.getElementById('sim-placeholder').style.display='flex';
  document.getElementById('sim-btn-text').textContent='Run Model';
  setGuideStep(0);
  // Destroy charts
  Object.values(charts).forEach(ch=>{ try{ ch.destroy(); }catch(e){} });
  charts={};
};

function _readInputs(){
  const g = id => parseFloat(document.getElementById(id).value) || 0;
  return {
    D:      g('f-demand'),       // Annual demand (units)
    sigmaD: g('f-sigma-d'),      // Std dev daily demand
    S:      g('f-order-cost'),   // Ordering cost per order
    C:      g('f-unit-cost'),    // Unit cost
    hRate:  g('f-hold-rate')/100,// Holding rate (fraction)
    L:      g('f-lead'),         // Lead time (days)
    sigmaL: g('f-sigma-l'),      // Std dev lead time (days)
    svcPct: g('f-service'),      // Service level %
  };
}

function _executeRun(){
  const p = _readInputs();

  // Derived
  const H   = p.C * p.hRate;      // Annual holding cost per unit
  const avgD = p.D / 365;          // Average daily demand
  const z    = getZ(p.svcPct);

  // Core calculations
  const eoq = calcEOQ(p.D, p.S, H);
  const ss  = calcSafetyStock(z, p.sigmaD, p.sigmaL, avgD, p.L);
  const rop = calcROP(avgD, p.L, ss);
  const {orderingCost, holdingCost, total} = calcTotalCost(p.D, eoq, p.S, H, ss, H);
  const stockoutCost = calcStockoutRiskCost(p.D, eoq, z, p.sigmaD, p.L, p.C, p.svcPct);
  const grandTotal = total + stockoutCost;

  // Show results panel
  document.getElementById('sim-placeholder').style.display='none';
  document.getElementById('sim-results').style.display='block';

  // ── Key metrics
  document.getElementById('out-eoq').textContent = fmtN(eoq);
  document.getElementById('out-ss').textContent  = fmtN(ss);
  document.getElementById('out-rop').textContent = fmtN(rop);
  document.getElementById('out-tc').textContent  = fmt$(grandTotal);

  // ── Cost breakdown bar
  const totalBar = holdingCost + orderingCost + stockoutCost;
  const pHold  = (holdingCost / totalBar * 100).toFixed(1);
  const pOrd   = (orderingCost / totalBar * 100).toFixed(1);
  const pSk    = (stockoutCost / totalBar * 100).toFixed(1);
  document.getElementById('seg-hold').style.width = pHold + '%';
  document.getElementById('seg-ord').style.width  = pOrd  + '%';
  document.getElementById('seg-sk').style.width   = pSk   + '%';
  document.getElementById('val-hold').textContent  = fmt$(holdingCost) + ' holding (' + pHold + '%)';
  document.getElementById('val-ord').textContent   = fmt$(orderingCost) + ' ordering (' + pOrd + '%)';
  document.getElementById('val-sk').textContent    = fmt$(stockoutCost) + ' stockout risk (' + pSk + '%)';

  // ── Charts
  _drawCostCurve(p, H, eoq);
  _drawServiceCurve(p, H, avgD);

  // ── Commentary
  _writeCommentary(p, eoq, ss, rop, grandTotal, holdingCost, orderingCost, stockoutCost, z, avgD);

  // ── Sensitivity table
  _buildSensitivity(p, H, z, eoq, ss, grandTotal, avgD);
  // Cache for carry-forward
  if(window._cacheInvResults) _cacheInvResults(p, eoq, ss, rop, grandTotal, avgD);
}

/* ── Chart 1: Total cost curve ────────────────────────────── */
function _drawCostCurve(p, H, eoq){
  const qMin = Math.max(10, eoq * 0.15);
  const qMax = eoq * 3.5;
  const steps = 40;
  const labels = [], hold = [], order = [], tot = [];

  for(let i=0;i<=steps;i++){
    const q = qMin + (qMax-qMin)*(i/steps);
    const oc = (p.D/q)*p.S;
    const hc = (q/2)*H;
    labels.push(Math.round(q).toLocaleString());
    order.push(+oc.toFixed(0));
    hold.push(+hc.toFixed(0));
    tot.push(+(oc+hc).toFixed(0));
  }

  const cfg = {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Holding Cost', data:hold, borderColor:GOLD, borderWidth:1.5, pointRadius:0, fill:false, tension:.4 },
        { label:'Ordering Cost', data:order, borderColor:BLUE, borderWidth:1.5, pointRadius:0, fill:false, tension:.4 },
        { label:'Total Cost', data:tot, borderColor:'rgba(237,233,224,.9)', borderWidth:2, pointRadius:0, fill:false, tension:.4 },
      ]
    },
    options:{
      ...JSON.parse(JSON.stringify(chartDefs)),
      plugins:{
        ...chartDefs.plugins,
        legend:{ display:true, position:'top', labels:{ color:FG, font:{size:9,family:'DM Sans'}, boxWidth:12, padding:12 } },
        tooltip:{
          ...chartDefs.plugins.tooltip,
          callbacks:{ label: ctx => ' $' + ctx.parsed.y.toLocaleString() }
        }
      }
    }
  };
  // Add EOQ annotation via plugin-free approach: use a custom dataset point
  const eoqIdx = Math.round(steps * ((eoq-qMin)/(qMax-qMin)));
  cfg.data.datasets.push({
    label:'EOQ', data: labels.map((_,i)=> i===eoqIdx ? tot[i] : null),
    borderColor:GOLD, backgroundColor:GOLD,
    pointRadius:6, pointHoverRadius:8, pointStyle:'circle', showLine:false,
  });

  if(charts.costCurve){ charts.costCurve.destroy(); }
  charts.costCurve = new Chart(document.getElementById('chart-cost-curve'), cfg);
}

/* ── Chart 2: Service level vs safety stock cost ──────────── */
function _drawServiceCurve(p, H, avgD){
  const levels = [70,75,80,85,90,91,92,93,94,95,96,97,98,99,99.5];
  const labels = levels.map(l=>l+'%');
  const ssCosts = levels.map(l=>{
    const z2  = getZ(l);
    const ss2 = calcSafetyStock(z2, p.sigmaD, p.sigmaL, avgD, p.L);
    return +(ss2 * H).toFixed(0);
  });
  const currentIdx = levels.findIndex(l=>l>=p.svcPct);

  const cfg = {
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'Annual Safety Stock Cost',
        data: ssCosts,
        backgroundColor: ssCosts.map((_,i)=>
          i===currentIdx ? GOLD : 'rgba(201,168,76,0.18)'
        ),
        borderColor: ssCosts.map((_,i)=>
          i===currentIdx ? GOLD : 'rgba(201,168,76,0.35)'
        ),
        borderWidth:1,
      }]
    },
    options:{
      ...JSON.parse(JSON.stringify(chartDefs)),
      plugins:{
        ...chartDefs.plugins,
        tooltip:{
          ...chartDefs.plugins.tooltip,
          callbacks:{
            title: ctx => 'Service Level: ' + ctx[0].label,
            label: ctx => ' Safety Stock Cost: $' + ctx.parsed.y.toLocaleString()
          }
        }
      }
    }
  };

  if(charts.serviceCurve){ charts.serviceCurve.destroy(); }
  charts.serviceCurve = new Chart(document.getElementById('chart-service-curve'), cfg);
}

/* ── Commentary generator ─────────────────────────────────── */
function _writeCommentary(p, eoq, ss, rop, total, holdCost, ordCost, skCost, z, avgD){
  const cyclesPerYear = p.D / eoq;
  const daysSupply    = eoq / avgD;
  const holdPct       = holdCost/total*100;
  const ordPct        = ordCost/total*100;

  // Determine dominant cost driver
  let driver = holdPct > 55 ? 'holding' : ordPct > 55 ? 'ordering' : 'balanced';

  const bodies = {
    holding: `Your cost structure is <strong>holding-cost dominated</strong> -- ${holdPct.toFixed(0)}% of total inventory cost comes from capital tied up in stock. This is the profile of a business with high-value SKUs or expensive warehousing. The model recommends ordering <strong>${fmtN(eoq)} units</strong> every <strong>${daysSupply.toFixed(0)} days</strong> (${cyclesPerYear.toFixed(1)} orders/year). Reducing order quantity would reduce holding cost but push up ordering frequency -- the EOQ is the proven optimum given your inputs.`,
    ordering: `Your cost structure is <strong>ordering-cost dominated</strong> -- ${ordPct.toFixed(0)}% of total cost is fixed ordering overhead. This profile suggests you benefit from larger, less frequent orders. At <strong>${fmtN(eoq)} units per order</strong>, you would place <strong>${cyclesPerYear.toFixed(1)} orders per year</strong>. If you can negotiate a lower ordering cost per purchase order (e.g. EDI, blanket POs), the EOQ will shift upward and your total cost will fall.`,
    balanced: `Your cost structure is <strong>well-balanced</strong> -- holding cost (${holdPct.toFixed(0)}%) and ordering cost (${ordPct.toFixed(0)}%) are close to equilibrium, which is the signature of an operation already operating near its EOQ. The model recommends <strong>${fmtN(eoq)} units per order</strong>, placed <strong>${cyclesPerYear.toFixed(1)} times per year</strong>.`
  };

  const insights = {
    holding: `Insight: A 10% reduction in holding rate (e.g. renegotiating warehouse terms or reducing SKU unit cost) would shift your EOQ upward by ~5% and reduce total annual cost by roughly ${fmt$(total*0.08)}.`,
    ordering: `Insight: If you can reduce ordering cost by 30% through EDI or blanket purchase orders, EOQ falls by ~17% -- meaning less capital per cycle while preserving service level.`,
    balanced: `Insight: At this balance, the highest-leverage intervention is reducing demand variability (sigma). Cutting your daily demand sigma by half would reduce safety stock by ~${fmtN(ss*0.38)} units -- freeing ${fmt$(ss*0.38*p.C)} in working capital without touching service level.`
  };

  document.getElementById('scom-body').innerHTML = bodies[driver];
  document.getElementById('scom-insight').innerHTML = insights[driver];
}

/* ── Sensitivity table ────────────────────────────────────── */
function _buildSensitivity(p, H, z, baseEOQ, baseSS, baseTotal, avgD){
  const scenarios = [
    { label:'Current inputs (base case)', D:p.D, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD, sigmaL:p.sigmaL, isBase:true },
    { label:'Demand +25%',                D:p.D*1.25, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD*1.25, sigmaL:p.sigmaL },
    { label:'Demand -25%',                D:p.D*0.75, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD*0.75, sigmaL:p.sigmaL },
    { label:'Ordering cost halved',       D:p.D, S:p.S*0.5, H_rate:p.hRate, sigmaD:p.sigmaD, sigmaL:p.sigmaL },
    { label:'Holding rate +5 pts',        D:p.D, S:p.S, H_rate:p.hRate+0.05, sigmaD:p.sigmaD, sigmaL:p.sigmaL },
    { label:'Lead time doubled',          D:p.D, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD, sigmaL:p.sigmaL*2, leadMult:2 },
    { label:'Service level -> 99%',        D:p.D, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD, sigmaL:p.sigmaL, svcOverride:99 },
    { label:'Service level -> 90%',        D:p.D, S:p.S, H_rate:p.hRate, sigmaD:p.sigmaD, sigmaL:p.sigmaL, svcOverride:90 },
  ];

  const tbody = document.getElementById('ssens-body');
  tbody.innerHTML = '';

  scenarios.forEach(sc=>{
    const H2   = p.C * sc.H_rate;
    const eoq2 = calcEOQ(sc.D, sc.S, H2);
    const z2   = getZ(sc.svcOverride || p.svcPct);
    const d2   = sc.D / 365;
    const l2   = p.L * (sc.leadMult||1);
    const sL2  = sc.sigmaL || p.sigmaL;
    const ss2  = calcSafetyStock(z2, sc.sigmaD, sL2, d2, l2);
    const {orderingCost:oc2, holdingCost:hc2} = calcTotalCost(sc.D, eoq2, sc.S, H2, ss2, H2);
    const skCost2 = calcStockoutRiskCost(sc.D, eoq2, z2, sc.sigmaD, l2, p.C, sc.svcOverride||p.svcPct);
    const tc2  = oc2 + hc2 + skCost2;
    const diff = tc2 - baseTotal;
    const diffPct = (diff/baseTotal*100).toFixed(1);
    const diffStr = diff===0 ? '--' :
      `<span class="${diff<0?'ssens-delta-pos':'ssens-delta-neg'}">${diff<0?'(-) ':'(+) '} ${Math.abs(diffPct)}%</span>`;

    const tr = document.createElement('tr');
    if(sc.isBase) tr.classList.add('base-row');
    tr.innerHTML = `
      <td>${sc.label}</td>
      <td>${fmtN(eoq2)}</td>
      <td>${fmtN(ss2)}</td>
      <td>${fmt$(tc2)}</td>
      <td>${diffStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Init guide to step 0
setGuideStep(0);

// Highlight group when any input within is focused
['grp-demand','grp-cost','grp-service'].forEach((id,i)=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('focus', ()=> setGuideStep(i<2?0:1));
  });
});

})();

// ═══════════════════════════════════════════════════════════
// QUEUE & STAFFING DYNAMICS SIMULATOR
// Models: M/M/c queue (Erlang-C), discrete-event simulation,
//         server utilisation, wait-time sensitivity
// ═══════════════════════════════════════════════════════════
(function(){
'use strict';

let qChartsReady = false;
let qPendingRun  = false;
// Chart.js already loaded by inventory sim — wait for it
function ensureChartJS(cb){
  if(window.Chart){ cb(); return; }
  const poll = setInterval(()=>{ if(window.Chart){ clearInterval(poll); cb(); }}, 100);
}

const GOLD='#c9a84c', BLUE='#4a90e2', ORG='#e05a00';
const FG_DIM='rgba(237,233,224,0.07)', FG='rgba(237,233,224,0.35)';
let qCharts = {};

/* ── Tab switching ─────────────────────────────────────── */
window.switchSimTab = function(tab){
  ['inv','queue','dcf'].forEach(t=>{
    document.getElementById('tab-panel-'+t).classList.toggle('active', t===tab);
    document.getElementById('tab-btn-'+t).classList.toggle('active', t===tab);
  });
};

/* ── Guide step highlighter ────────────────────────────── */
function setQGuideStep(n){
  ['q-gs-0','q-gs-1','q-gs-2'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(el) el.classList.toggle('active',i===n);
  });
}

/* ── Read inputs ───────────────────────────────────────── */
function readQInputs(){
  const g = id => parseFloat(document.getElementById(id).value)||0;
  return {
    arrivalInterval: g('q-arrival'),   // avg minutes between arrivals
    serviceTime:     g('q-service'),   // avg service time in minutes
    numServers:      Math.max(1, Math.round(g('q-servers'))),
    simTime:         g('q-simtime'),   // total simulation minutes
    staffCost:       g('q-staffcost'), // $/hr per server
  };
}

/* ── Discrete-Event Simulation (M/M/c) ────────────────── */
function runMMC(arrivalInterval, serviceTime, numServers, simTime){
  // Pure JS discrete-event simulation — no library needed
  const rand = () => Math.random();
  const expRand = rate => -Math.log(1 - rand()) / rate;

  const arrivalRate  = 1 / arrivalInterval;   // arrivals per minute
  const serviceRate  = 1 / serviceTime;        // completions per minute per server

  let   time         = 0;
  let   nextArrival  = expRand(arrivalRate);
  let   served       = 0;
  const waitTimes    = [];
  const queueSnaps   = [];   // {t, q} snapshots for chart
  const serverFree   = new Array(numServers).fill(0); // time when each server is free

  // Track total busy time for utilisation
  let totalBusyTime = 0;

  // Process events until simTime
  while(nextArrival < simTime){
    time = nextArrival;
    nextArrival = time + expRand(arrivalRate);

    // Find earliest free server
    const earliest = serverFree.reduce((mi, t, i) => t < serverFree[mi] ? i : mi, 0);
    const startService = Math.max(time, serverFree[earliest]);
    const waitTime = startService - time;
    waitTimes.push(waitTime);

    const svcTime = expRand(serviceRate);
    totalBusyTime += svcTime;
    serverFree[earliest] = startService + svcTime;
    served++;

    // Queue length = how many servers are busy beyond current time
    const busyServers = serverFree.filter(t => t > time).length;
    const qLen = Math.max(0, busyServers - numServers + serverFree.filter(t => t <= time).length);
    const actualQ = serverFree.filter(t => t > time).length > numServers
      ? serverFree.filter(t => t > time).length - numServers : 0;
    queueSnaps.push({ t: parseFloat(time.toFixed(2)), q: actualQ });
  }

  const avgWait   = waitTimes.length ? waitTimes.reduce((a,b)=>a+b,0)/waitTimes.length : 0;
  const maxWait   = waitTimes.length ? Math.max(...waitTimes) : 0;
  const util      = Math.min(100, (totalBusyTime / (numServers * simTime)) * 100);

  return { served, avgWait, maxWait, util, waitTimes, queueSnaps };
}

/* ── Sensitivity: run for 1..numServers+4 ─────────────── */
function sensitivitySweep(p){
  const maxS = Math.min(p.numServers + 5, 15);
  const results = [];
  for(let s=1; s<=maxS; s++){
    const r = runMMC(p.arrivalInterval, p.serviceTime, s, p.simTime);
    results.push({ servers: s, avgWait: r.avgWait, util: r.util });
  }
  return results;
}

/* ── Number formatters ─────────────────────────────────── */
function fmtMin(m){
  if(m < 0.1) return '<0.1';
  if(m >= 60) return (m/60).toFixed(1)+'h';
  return m.toFixed(1);
}

/* ── Draw queue chart ──────────────────────────────────── */
function drawQueueChart(snaps){
  // Sample down to ~80 points for performance
  const step = Math.max(1, Math.floor(snaps.length / 80));
  const labels = [], data = [];
  for(let i=0;i<snaps.length;i+=step){
    labels.push(snaps[i].t.toFixed(0)+'m');
    data.push(snaps[i].q);
  }
  const avgQ = data.reduce((a,b)=>a+b,0)/data.length;

  if(qCharts.queue){ qCharts.queue.destroy(); }
  qCharts.queue = new Chart(document.getElementById('q-chart-queue'),{
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Queue Length', data, borderColor:GOLD, borderWidth:1.5,
          pointRadius:0, fill:true,
          backgroundColor:'rgba(201,168,76,0.06)', tension:0.3 },
        { label:'Avg Queue', data:labels.map(()=>parseFloat(avgQ.toFixed(2))),
          borderColor:ORG, borderWidth:1, borderDash:[4,4],
          pointRadius:0, fill:false }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration:600 },
      plugins:{
        legend:{ display:true, position:'top', labels:{ color:FG, font:{size:9,family:'DM Sans'}, boxWidth:12, padding:10 }},
        tooltip:{ backgroundColor:'rgba(8,9,14,.95)', borderColor:'rgba(201,168,76,.3)', borderWidth:1,
          titleColor:'rgba(237,233,224,.55)', bodyColor:GOLD, padding:9,
          titleFont:{size:10,family:'DM Sans'}, bodyFont:{size:11,family:'DM Sans'}}
      },
      scales:{
        x:{ ticks:{color:FG,font:{size:9,family:'DM Sans'},maxTicksLimit:10}, grid:{color:FG_DIM}, border:{color:FG_DIM}},
        y:{ ticks:{color:FG,font:{size:9,family:'DM Sans'},stepSize:1}, grid:{color:FG_DIM}, border:{color:FG_DIM}, min:0 }
      }
    }
  });
}

/* ── Draw sensitivity chart ────────────────────────────── */
function drawSensitivityChart(sweep, currentServers){
  const labels = sweep.map(s => s.servers + (s.servers===1?' server':' servers'));
  const waits  = sweep.map(s => parseFloat(s.avgWait.toFixed(2)));
  const colors = sweep.map(s =>
    s.servers === currentServers ? GOLD : 'rgba(201,168,76,0.25)'
  );
  const borderColors = sweep.map(s =>
    s.servers === currentServers ? GOLD : 'rgba(201,168,76,0.45)'
  );

  if(qCharts.sensitivity){ qCharts.sensitivity.destroy(); }
  qCharts.sensitivity = new Chart(document.getElementById('q-chart-sensitivity'),{
    type:'bar',
    data:{
      labels,
      datasets:[{ label:'Avg Wait (min)', data:waits,
        backgroundColor:colors, borderColor:borderColors, borderWidth:1 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{ duration:600 },
      plugins:{
        legend:{display:false},
        tooltip:{ backgroundColor:'rgba(8,9,14,.95)', borderColor:'rgba(201,168,76,.3)', borderWidth:1,
          titleColor:'rgba(237,233,224,.55)', bodyColor:GOLD, padding:9,
          callbacks:{
            title: ctx => ctx[0].label,
            label: ctx => ' Avg Wait: ' + ctx.parsed.y.toFixed(2) + ' min'
          }}
      },
      scales:{
        x:{ ticks:{color:FG,font:{size:9,family:'DM Sans'}}, grid:{color:FG_DIM}, border:{color:FG_DIM}},
        y:{ ticks:{color:FG,font:{size:9,family:'DM Sans'}}, grid:{color:FG_DIM}, border:{color:FG_DIM}, min:0,
          title:{display:true, text:'Avg Wait (min)', color:FG, font:{size:9}} }
      }
    }
  });
}

/* ── Write commentary ──────────────────────────────────── */
function writeQCommentary(p, r, sweep){
  const util = r.util;
  const trafficIntensity = (p.simTime / p.arrivalInterval) * p.serviceTime / (p.numServers * p.simTime);
  const staffCostTotal = (p.numServers * p.staffCost * p.simTime / 60);

  let body, insight;

  if(util > 90){
    body = `Your system is <strong>critically over-utilised at ${util.toFixed(0)}%</strong> -- customers are arriving faster than ${p.numServers} server${p.numServers>1?'s':''} can clear them. Average wait of <strong>${fmtMin(r.avgWait)} minutes</strong> will compound as the queue snowballs. This is the profile of a Six Flags ride queue on a peak Saturday with not enough staff deployed.`;
    insight = `Insight: Adding just one more server would reduce average wait by an estimated ${fmtMin(r.avgWait * 0.45)} minutes. The staffing cost of ~$${(p.staffCost*p.simTime/60).toFixed(0)} for the session is almost certainly less than the revenue impact of frustrated customers leaving the queue.`;
  } else if(util > 70){
    body = `Your system is <strong>well-loaded at ${util.toFixed(0)}% utilisation</strong> -- a healthy operating range where servers are busy but queues remain manageable. Average wait is <strong>${fmtMin(r.avgWait)} minutes</strong> across ${r.served} customers. This is the target zone: maximum throughput without chronic queuing.`;
    insight = `Insight: Total staffing cost for this session is approximately $${staffCostTotal.toFixed(0)}. At this utilisation level, the cost-per-customer-served is near optimal. Reducing to ${p.numServers-1} server${p.numServers>2?'s':''} would push utilisation above 85% and likely more than double average wait.`;
  } else {
    body = `Your system is <strong>under-utilised at ${util.toFixed(0)}%</strong> -- servers are sitting idle for significant portions of the simulation. Average wait is only <strong>${fmtMin(r.avgWait)} minutes</strong>, which is excellent for customers, but comes at a cost: staffing spend of ~$${staffCostTotal.toFixed(0)} for the session with capacity to spare.`;
    insight = `Insight: You could likely reduce to ${Math.max(1,p.numServers-1)} server${p.numServers>2?'s':''} without meaningfully degrading wait time. Cross-training staff for flexible deployment is the operational lever here -- matching headcount to actual demand patterns rather than running peak staffing all session.`;
  }

  document.getElementById('q-scom-body').innerHTML = body;
  document.getElementById('q-scom-insight').innerHTML = insight;
}

/* ── Main run function ─────────────────────────────────── */
window.runQueueSim = function(){
  ensureChartJS(function(){
    setQGuideStep(2);
    const btn = document.getElementById('q-run-btn');
    btn.classList.add('loading');
    document.getElementById('q-btn-text').textContent = 'Simulating...';

    setTimeout(function(){
      const p = readQInputs();
      const r = runMMC(p.arrivalInterval, p.serviceTime, p.numServers, p.simTime);
      const sweep = sensitivitySweep(p);

      // Show results
      document.getElementById('q-placeholder').style.display='none';
      document.getElementById('q-results').style.display='block';

      // Metrics
      document.getElementById('q-out-served').textContent   = r.served;
      document.getElementById('q-out-wait').textContent     = fmtMin(r.avgWait);
      document.getElementById('q-out-maxwait').textContent  = fmtMin(r.maxWait);
      document.getElementById('q-out-util').textContent     = r.util.toFixed(1)+'%';

      // Utilisation bar
      const utilPct = Math.min(100, r.util);
      const bar = document.getElementById('q-util-bar');
      bar.style.width = utilPct + '%';
      bar.className = 'util-fill ' + (utilPct > 90 ? 'high' : utilPct > 70 ? 'med' : 'low');
      document.getElementById('q-util-pct-lbl').textContent = r.util.toFixed(1) + '%';

      // Charts
      drawQueueChart(r.queueSnaps);
      drawSensitivityChart(sweep, p.numServers);

      // Commentary
      writeQCommentary(p, r, sweep);
      // Cache for carry-forward
      if(window._cacheQueueResults) _cacheQueueResults(p, r);

      btn.classList.remove('loading');
      document.getElementById('q-btn-text').textContent = 'Re-run Simulation';
    }, 80);
  });
};

window.resetQueueSim = function(){
  document.getElementById('q-results').style.display='none';
  document.getElementById('q-placeholder').style.display='flex';
  document.getElementById('q-btn-text').textContent='Run Simulation';
  setQGuideStep(0);
  Object.values(qCharts).forEach(ch=>{ try{ ch.destroy(); }catch(e){} });
  qCharts={};
};

// Focus listeners for guide steps
[['qgrp-arrival',0],['qgrp-service',1]].forEach(([id,step])=>{
  const el=document.getElementById(id);
  if(!el)return;
  el.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('focus',()=>setQGuideStep(step));
  });
});

setQGuideStep(0);

})();



// ═══════════════════════════════════════════════════════════════
// DCF VALUATION SIMULATOR
// Models: 5-year unlevered FCF, Gordon Growth terminal value,
//         EV/EBITDA cross-check, bear/base/bull WACC sensitivity,
//         football field matrix, implied IRR (bisection)
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

const Au='#c9a84c', Bu='#4a90e2', Gu='#66cc66', Ou='#e05a00';
const FD='rgba(237,233,224,0.07)', FC='rgba(237,233,224,0.35)';
let dcfCharts = {};

/* ── Guide ─────────────────────────────────────────────── */
function setDGuideStep(n){
  ['d-gs-0','d-gs-1','d-gs-2'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(el) el.classList.toggle('active',i===n);
  });
}

/* ── Read inputs ────────────────────────────────────────── */
function readDInputs(){
  const g = id => parseFloat(document.getElementById(id).value)||0;
  return {
    rev0:     g('d-revenue'),    // base revenue $K
    g1:       g('d-growth1')/100,// yr 1-3 growth
    g2:       g('d-growth2')/100,// yr 4-5 growth
    ebitdaPct:g('d-ebitda')/100,
    daPct:    g('d-da')/100,
    capexPct: g('d-capex')/100,
    nwcPct:   g('d-nwc')/100,
    wacc:     g('d-wacc')/100,
    tgr:      g('d-tgr')/100,
    tax:      g('d-tax')/100,
    exitMult: g('d-multiple'),
  };
}

/* ── Build 5-year FCF schedule ──────────────────────────── */
function buildSchedule(p){
  const yrs = [];
  let prevRev = p.rev0;
  for(let yr=1;yr<=5;yr++){
    const g   = yr<=3 ? p.g1 : p.g2;
    const rev = prevRev * (1+g);
    const ebitda = rev * p.ebitdaPct;
    const da     = rev * p.daPct;
    const ebit   = ebitda - da;
    const nopat  = ebit * (1 - p.tax);
    const fcf    = nopat + da - rev*p.capexPct - (rev-prevRev)*p.nwcPct;
    yrs.push({ yr, rev, ebitda, ebit, nopat, da, fcf, g });
    prevRev = rev;
  }
  return yrs;
}

/* ── DCF valuation ──────────────────────────────────────── */
function calcDCF(p, wacc){
  const sched = buildSchedule(p);
  // PV of explicit FCFs
  let npvFCF = 0;
  sched.forEach((y,i) => { npvFCF += y.fcf / Math.pow(1+wacc, i+1); });
  // Terminal value — Gordon Growth Model
  const lastFCF = sched[4].fcf;
  const tv      = lastFCF * (1+p.tgr) / (wacc - p.tgr);
  const pvTV    = tv / Math.pow(1+wacc, 5);
  // EV/EBITDA cross-check
  const evEBITDA = sched[4].ebitda * p.exitMult / Math.pow(1+wacc, 5);
  const ev = npvFCF + pvTV;
  return { ev, npvFCF, pvTV, tv, evEBITDA, sched };
}

/* ── Implied IRR (bisection) ────────────────────────────── */
function calcIRR(sched, ev){
  // Find r such that sum(FCF_t / (1+r)^t) + TV_at_r = EV
  // Simplified: find r such that NPV of FCFs + TV_at_r = ev
  // We use bisection on IRR = f(discount rate that yields ev from FCFs only)
  let lo=0.001, hi=2.0;
  const lastFCF = sched[4].fcf;
  for(let iter=0;iter<60;iter++){
    const mid=(lo+hi)/2;
    let npv=0;
    sched.forEach((y,i)=>{ npv += y.fcf/Math.pow(1+mid,i+1); });
    // Include a simple TV at mid rate (assume tgr=2.5% for IRR calc)
    const tvMid = lastFCF*1.025/(mid-0.025>0.001?mid-0.025:0.001);
    npv += tvMid/Math.pow(1+mid,5);
    if(npv>ev) lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}

/* ── Format helpers ─────────────────────────────────────── */
function fmtK(n){
  if(Math.abs(n)>=1e6) return (n>=0?'$':'−$')+(Math.abs(n)/1e6).toFixed(1)+'M';
  if(Math.abs(n)>=1e3) return (n>=0?'$':'−$')+(Math.abs(n)/1e3).toFixed(1)+'K';
  return (n>=0?'$':'−$')+Math.abs(n).toFixed(0)+'K';
}
function fmtPct(n){ return (n*100).toFixed(1)+'%'; }

/* ── Draw FCF bar+line chart ────────────────────────────── */
function drawFCFChart(sched){
  const labels = sched.map(y=>'Yr '+y.yr);
  const revs   = sched.map(y=>+y.rev.toFixed(0));
  const ebs    = sched.map(y=>+y.ebitda.toFixed(0));
  const fcfs   = sched.map(y=>+y.fcf.toFixed(0));

  if(dcfCharts.fcf){ dcfCharts.fcf.destroy(); }
  dcfCharts.fcf = new Chart(document.getElementById('d-chart-fcf'),{
    data:{
      labels,
      datasets:[
        { type:'bar',  label:'FCF ($K)', data:fcfs,
          backgroundColor:'rgba(201,168,76,0.25)', borderColor:Au, borderWidth:1.5, yAxisID:'y' },
        { type:'line', label:'Revenue ($K)', data:revs,
          borderColor:'rgba(237,233,224,0.5)', borderWidth:1.5, pointRadius:3, fill:false, tension:.3, yAxisID:'y' },
        { type:'line', label:'EBITDA ($K)', data:ebs,
          borderColor:Bu, borderWidth:1.5, pointRadius:3, fill:false, tension:.3, yAxisID:'y' },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{duration:600},
      plugins:{
        legend:{display:true,position:'top',labels:{color:FC,font:{size:9,family:'DM Sans'},boxWidth:12,padding:10}},
        tooltip:{backgroundColor:'rgba(8,9,14,.95)',borderColor:'rgba(201,168,76,.3)',borderWidth:1,
          titleColor:'rgba(237,233,224,.55)',bodyColor:Au,padding:9,
          callbacks:{label:ctx=>' '+ctx.dataset.label+': '+fmtK(ctx.parsed.y)}}
      },
      scales:{
        x:{ticks:{color:FC,font:{size:9,family:'DM Sans'}},grid:{color:FD},border:{color:FD}},
        y:{ticks:{color:FC,font:{size:9,family:'DM Sans'},callback:v=>fmtK(v)},grid:{color:FD},border:{color:FD}}
      }
    }
  });
}

/* ── Draw football field heatmap ────────────────────────── */
function drawFootballField(p){
  const waccs = [p.wacc-0.04, p.wacc-0.02, p.wacc, p.wacc+0.02, p.wacc+0.04];
  const tgrs  = [p.tgr-0.01, p.tgr, p.tgr+0.01];

  const labels = waccs.map(w=>(w*100).toFixed(1)+'%');
  const datasets = tgrs.map((tg,ti)=>{
    const data = waccs.map(w=>{
      if(w<=tg) return null;
      const {ev} = calcDCF({...p,wacc:w,tgr:tg},{});
      return calcDCF({...p,wacc:w,tgr:tg},w).ev;
    });
    const tgLabel = (tg*100).toFixed(1)+'% TGR';
    const color   = ti===0 ? 'rgba(74,144,226,0.75)' : ti===1 ? Au : 'rgba(102,204,102,0.75)';
    return {
      label:tgLabel, data,
      backgroundColor:color, borderColor:color,
      borderWidth:1
    };
  });

  if(dcfCharts.football){ dcfCharts.football.destroy(); }
  dcfCharts.football = new Chart(document.getElementById('d-chart-football'),{
    type:'bar',
    data:{ labels, datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{duration:600},
      plugins:{
        legend:{display:true,position:'top',labels:{color:FC,font:{size:9,family:'DM Sans'},boxWidth:12,padding:10}},
        tooltip:{backgroundColor:'rgba(8,9,14,.95)',borderColor:'rgba(201,168,76,.3)',borderWidth:1,
          titleColor:'rgba(237,233,224,.55)',bodyColor:Au,padding:9,
          callbacks:{
            title:ctx=>'WACC: '+ctx[0].label,
            label:ctx=>' '+ctx.dataset.label+' EV: '+fmtK(ctx.parsed.y)
          }}
      },
      scales:{
        x:{ticks:{color:FC,font:{size:9,family:'DM Sans'}},grid:{color:FD},border:{color:FD},
          title:{display:true,text:'WACC',color:FC,font:{size:9}}},
        y:{ticks:{color:FC,font:{size:9,family:'DM Sans'},callback:v=>fmtK(v)},grid:{color:FD},border:{color:FD},
          title:{display:true,text:'Enterprise Value ($K)',color:FC,font:{size:9}}}
      }
    }
  });
}

/* ── Build FCF table ────────────────────────────────────── */
function buildFCFTable(sched){
  const rows = [
    {label:'Revenue ($K)',  key:'rev'},
    {label:'EBITDA ($K)',   key:'ebitda'},
    {label:'EBIT ($K)',     key:'ebit'},
    {label:'NOPAT ($K)',    key:'nopat'},
    {label:'+ D&A ($K)',    key:'da'},
    {label:'− Capex ($K)',  key:'capex'},
    {label:'− ΔNWC ($K)',   key:'nwc'},
    {label:'Free Cash Flow ($K)', key:'fcf', bold:true},
  ];
  const tbody = document.getElementById('d-fcf-body');
  tbody.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    if(r.bold) tr.classList.add('base-row');
    let html = `<td>${r.label}</td>`;
    sched.forEach((y,i)=>{
      let val;
      if(r.key==='capex')      val = -(y.rev * /* capex read from closure */ 0); // filled below
      else if(r.key==='nwc')   val = 0;
      else                     val = y[r.key]||0;
      html += `<td>${fmtK(val)}</td>`;
    });
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

/* ── Better table builder with capex/nwc from p ─────────── */
function buildFCFTableFull(sched, p){
  const tBody = document.getElementById('d-fcf-body');
  tBody.innerHTML='';
  const rowDefs = [
    {lbl:'Revenue ($K)',          vals: sched.map(y=>y.rev)},
    {lbl:'Growth Rate',           vals: sched.map(y=>fmtPct(y.g)), isStr:true},
    {lbl:'EBITDA ($K)',           vals: sched.map(y=>y.ebitda)},
    {lbl:'− D&A ($K)',            vals: sched.map(y=>-y.da)},
    {lbl:'EBIT ($K)',             vals: sched.map(y=>y.ebit)},
    {lbl:'Tax-effected (NOPAT)',  vals: sched.map(y=>y.nopat)},
    {lbl:'+ D&A ($K)',            vals: sched.map(y=>y.da)},
    {lbl:'− Capex ($K)',          vals: sched.map(y=>-(y.rev*p.capexPct))},
    {lbl:'− ΔNWC ($K)',           vals: sched.map((y,i)=>i===0?-(y.rev-p.rev0)*p.nwcPct:-(y.rev-sched[i-1].rev)*p.nwcPct)},
    {lbl:'Free Cash Flow ($K)',   vals: sched.map(y=>y.fcf), bold:true},
  ];
  rowDefs.forEach(r=>{
    const tr=document.createElement('tr');
    if(r.bold)tr.classList.add('base-row');
    let html=`<td>${r.lbl}</td>`;
    r.vals.forEach(v=>{ html+=`<td>${r.isStr?v:fmtK(v)}</td>`; });
    tr.innerHTML=html;
    tBody.appendChild(tr);
  });
}

/* ── Commentary ──────────────────────────────────────────── */
function writeDCFCommentary(p, res){
  const tvPct = (res.pvTV / res.ev * 100).toFixed(0);
  const irrPct = (calcIRR(res.sched, res.ev)*100).toFixed(1);
  document.getElementById('d-out-irr').textContent = irrPct+'%';

  const hurdle = p.wacc * 100;
  const irrNum = parseFloat(irrPct);

  let body, insight;

  if(irrNum > hurdle + 5){
    body = `The model generates a DCF enterprise value of <strong>${fmtK(res.ev)}</strong> with an implied IRR of <strong>${irrPct}%</strong> -- well above your ${hurdle.toFixed(1)}% WACC hurdle. Terminal value accounts for <strong>${tvPct}%</strong> of total EV, which is typical for high-growth businesses. The EV/EBITDA cross-check yields ${fmtK(res.evEBITDA)}.`;
    insight = `Insight: At this spread, the investment creates significant value above cost of capital. Sensitivity check: a 200bps WACC increase (bear case) reduces EV to ${fmtK(res.bear)}. The model is most sensitive to terminal growth rate -- a 1% reduction in TGR would reduce EV by approximately ${fmtK((res.ev-calcDCF({...p,tgr:p.tgr-0.01},p.wacc).ev))}.`;
  } else if(irrNum > hurdle){
    body = `The model generates a DCF enterprise value of <strong>${fmtK(res.ev)}</strong> with an implied IRR of <strong>${irrPct}%</strong> -- modestly above the ${hurdle.toFixed(1)}% WACC hurdle. Terminal value is <strong>${tvPct}%</strong> of EV. This is a value-creating but margin-thin return profile. The EV/EBITDA cross-check yields ${fmtK(res.evEBITDA)}.`;
    insight = `Insight: The thin IRR-to-WACC spread means this investment is sensitive to execution risk. The biggest lever is EBITDA margin expansion -- each 1% improvement in operating margin adds approximately ${fmtK(res.sched[4].rev * 0.01 * (1-p.tax) / (p.wacc-p.tgr))} to terminal value. Focus on cost discipline alongside revenue growth.`;
  } else {
    body = `At current inputs, the model yields a DCF enterprise value of <strong>${fmtK(res.ev)}</strong> with an implied IRR of <strong>${irrPct}%</strong> -- <em>below</em> the ${hurdle.toFixed(1)}% WACC hurdle. Terminal value is ${tvPct}% of EV. This business as modelled does not generate returns above cost of capital.`;
    insight = `Insight: Value destruction at current inputs. Breakeven WACC (the rate at which NPV=0) is approximately ${irrPct}%. To reach a 15% IRR target, revenue growth in years 1–3 would need to reach ${((p.g1+0.08)*100).toFixed(0)}%, or EBITDA margin would need to expand by ~3–4 percentage points. Use the bull case (${fmtK(res.bull)}) to frame the upside scenario for stakeholders.`;
  }

  document.getElementById('d-scom-body').innerHTML = body;
  document.getElementById('d-scom-insight').innerHTML = insight;
}

/* ── Main run ────────────────────────────────────────────── */
window.runDCF = function(){
  if(!window.Chart){ return; }
  setDGuideStep(2);
  const btn=document.getElementById('d-run-btn');
  btn.classList.add('loading');
  document.getElementById('d-btn-text').textContent='Computing...';

  setTimeout(function(){
    const p = readDInputs();

    // Guard: wacc must exceed tgr
    if(p.wacc <= p.tgr){
      document.getElementById('d-btn-text').textContent='Run DCF Model';
      btn.classList.remove('loading');
      alert('WACC must be greater than Terminal Growth Rate for a valid DCF.');
      return;
    }

    const base = calcDCF(p, p.wacc);
    const bear = calcDCF({...p, wacc: p.wacc+0.02}, p.wacc+0.02);
    const bull = calcDCF({...p, wacc: p.wacc-0.02}, p.wacc-0.02);

    // Store for commentary
    base.bear = bear.ev;
    base.bull = bull.ev;

    // Show results
    document.getElementById('d-placeholder').style.display='none';
    document.getElementById('d-results').style.display='block';

    // Valuation cards
    document.getElementById('d-out-bear').textContent = fmtK(bear.ev);
    document.getElementById('d-out-base').textContent = fmtK(base.ev);
    document.getElementById('d-out-bull').textContent = fmtK(bull.ev);

    // Key metrics
    document.getElementById('d-out-ev').textContent  = fmtK(base.ev);
    document.getElementById('d-out-npv').textContent = fmtK(base.npvFCF);
    document.getElementById('d-out-tv').textContent  = fmtK(base.pvTV);
    // IRR set in commentary

    // Charts
    drawFCFChart(base.sched);
    drawFootballField(p);

    // Table
    buildFCFTableFull(base.sched, p);

    // Commentary + IRR
    writeDCFCommentary(p, base);

    btn.classList.remove('loading');
    document.getElementById('d-btn-text').textContent='Re-run DCF Model';
  }, 80);
};

window.resetDCF = function(){
  document.getElementById('d-results').style.display='none';
  document.getElementById('d-placeholder').style.display='flex';
  document.getElementById('d-btn-text').textContent='Run DCF Model';
  setDGuideStep(0);
  Object.values(dcfCharts).forEach(ch=>{ try{ ch.destroy(); }catch(e){} });
  dcfCharts={};
};

// Focus listeners
[['dgrp-revenue',0],['dgrp-costs',1],['dgrp-market',2]].forEach(([id,step])=>{
  const el=document.getElementById(id);
  if(!el)return;
  el.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('focus',()=>setDGuideStep(step));
  });
});
setDGuideStep(0);
})();

// SKILLS BALL PIT
// ═══════════════════════════════════════════════════════════
(function(){
var canvas=document.getElementById('skills-canvas');
if(!canvas)return;
var ctx=canvas.getContext('2d');
var GOLD='#c9a84c',W=0,H=0,balls=[],mouseX=-9999,mouseY=-9999;
var raf=null,started=false,tooltip={text:'',x:0,y:0,alpha:0,timer:null};

// Curated list — removed generic/common tools (Excel, Google Workspace, etc.)
var SKILLS=[
  {t:'GTM Execution',c:1},
  {t:'Demand Forecasting',c:1},
  {t:'Pricing Strategy',c:1},
  {t:'Inventory Optimization',c:1},
  {t:'JIT Delivery Models',c:1},
  {t:'A/B Testing',c:1},
  {t:'Media Analytics',c:1},
  {t:'Tableau',c:1},
  {t:'Power BI',c:1},
  {t:'RevOps',c:1},
  {t:'HubSpot',c:1},
  {t:'Agile (Certified)',c:1},
  {t:'Market Sizing',c:0},
  {t:'Competitive Analysis',c:0},
  {t:'Data Storytelling',c:0},
  {t:'Channel Economics',c:0},
  {t:'M&A Deal Analysis',c:0},
  {t:'Vendor Development',c:0},
  {t:'Capacity Planning',c:0},
  {t:'Scrum (Certified)',c:0},
  {t:'Tariff Modeling',c:0},
  {t:'Cost Modeling',c:0},
  {t:'Process Mapping',c:0},
  {t:'Content Strategy',c:0},
  {t:'Voice of Customer',c:0},
  {t:'Buyer Persona Mapping',c:0},
  {t:'Brand Positioning',c:0},
  {t:'Financial Modeling',c:0},
  {t:'KPI Dashboard Design',c:0},
  {t:'Sensitivity Analysis',c:0},
  {t:'Lean Operations',c:0},
  {t:'Waterfall PM',c:0},
  {t:'Risk Mitigation',c:0}
];

function abbr(str){
  var w=str.replace(/[()]/g,'').split(/[\s/&+]+/),a='';
  for(var i=0;i<w.length&&a.length<3;i++){if(w[i].length>0)a+=w[i][0].toUpperCase();}
  return a;
}

// Short label — up to ~12 chars for the small text under initials
function shortLabel(str){
  if(str.length<=11)return str;
  // truncate at word boundary
  var words=str.split(' ');
  var out='';
  for(var i=0;i<words.length;i++){
    var candidate=(out?out+' ':'')+words[i];
    if(candidate.length>11)break;
    out=candidate;
  }
  return out||str.slice(0,10);
}

function setup(){
  var dpr=window.devicePixelRatio||1;
  W=canvas.parentElement.offsetWidth||window.innerWidth;
  H=Math.max(300,Math.min(500,W*0.36));
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function mk(){
  balls=SKILLS.map(function(s){
    var r=s.c?36:24;
    return{t:s.t,ab:abbr(s.t),lb:shortLabel(s.t),c:s.c,r:r,
      x:r+Math.random()*Math.max(1,W-r*2),
      y:H*0.15+Math.random()*H*0.55,
      vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*1.2};
  });
  // Spread
  for(var p=0;p<40;p++){
    for(var i=0;i<balls.length;i++){
      for(var j=i+1;j<balls.length;j++){
        var a=balls[i],b=balls[j],dx=b.x-a.x,dy=b.y-a.y;
        var d=Math.sqrt(dx*dx+dy*dy)||.001,m=a.r+b.r+4;
        if(d<m){var k=(m-d)/2/d;a.x-=dx*k;a.y-=dy*k;b.x+=dx*k;b.y+=dy*k;}
      }
      wl(balls[i]);
    }
  }
}

function wl(b){
  if(b.x-b.r<0){b.x=b.r;b.vx=Math.abs(b.vx)*.5;}
  if(b.x+b.r>W){b.x=W-b.r;b.vx=-Math.abs(b.vx)*.5;}
  if(b.y-b.r<0){b.y=b.r;b.vy=Math.abs(b.vy)*.5;}
  if(b.y+b.r>H){b.y=H-b.r;b.vy=-Math.abs(b.vy)*.5;}
}

function fr(){
  raf=requestAnimationFrame(fr);
  ctx.clearRect(0,0,W,H);

  for(var i=0;i<balls.length;i++){
    var b=balls[i];
    // Mouse repulsion
    var dx=b.x-mouseX,dy=b.y-mouseY,md=Math.sqrt(dx*dx+dy*dy)||.001;
    if(md<140){var f=((140-md)/140)*24;b.vx+=(dx/md)*f;b.vy+=(dy/md)*f;}
    // Gravity — increased
    b.vy+=0.45;
    b.vx*=0.88;b.vy*=0.88;
    b.x+=b.vx;b.y+=b.vy;
    wl(b);
    // Ball-ball collisions
    for(var j=i+1;j<balls.length;j++){
      var o=balls[j],cx=o.x-b.x,cy=o.y-b.y;
      var cd=Math.sqrt(cx*cx+cy*cy)||.001,mn=b.r+o.r+2;
      if(cd<mn){
        var ov=(mn-cd)/2,nx=cx/cd,ny=cy/cd;
        b.x-=nx*ov;b.y-=ny*ov;o.x+=nx*ov;o.y+=ny*ov;
        var rv=(b.vx-o.vx)*nx+(b.vy-o.vy)*ny;
        if(rv>0){b.vx-=rv*nx*.4;b.vy-=rv*ny*.4;o.vx+=rv*nx*.4;o.vy+=rv*ny*.4;}
      }
    }
    dr(b);
  }

  // Draw tooltip if active
  if(tooltip.alpha>0){
    ctx.save();
    ctx.globalAlpha=tooltip.alpha;
    var tw=ctx.measureText(tooltip.text).width;
    ctx.font='500 12px "DM Sans",sans-serif';
    tw=ctx.measureText(tooltip.text).width;
    var tx=Math.min(Math.max(tooltip.x,tw/2+10),W-tw/2-10);
    var ty=Math.max(tooltip.y-10,22);
    // Pill background (manual rounded rect for browser compat)
    ctx.fillStyle='rgba(201,168,76,0.95)';
    var pad=8,rx=tx-tw/2-pad,ry=ty-16,rw=tw+pad*2,rh=22,cr=4;
    ctx.beginPath();
    ctx.moveTo(rx+cr,ry);
    ctx.lineTo(rx+rw-cr,ry);ctx.arcTo(rx+rw,ry,rx+rw,ry+cr,cr);
    ctx.lineTo(rx+rw,ry+rh-cr);ctx.arcTo(rx+rw,ry+rh,rx+rw-cr,ry+rh,cr);
    ctx.lineTo(rx+cr,ry+rh);ctx.arcTo(rx,ry+rh,rx,ry+rh-cr,cr);
    ctx.lineTo(rx,ry+cr);ctx.arcTo(rx,ry,rx+cr,ry,cr);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#0a0b0d';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(tooltip.text,tx,ty-5);
    ctx.restore();
    tooltip.alpha=Math.max(0,tooltip.alpha-0.02);
  }
}

function dr(b){
  ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  if(b.c){
    ctx.fillStyle=GOLD;ctx.fill();
    // gloss highlight
    ctx.beginPath();ctx.arc(b.x-b.r*.28,b.y-b.r*.3,b.r*.38,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.11)';ctx.fill();
    // Full skill name — regular weight, dark text, wrapped to 2 lines if needed
    drawWrappedText(ctx,b.t,b.x,b.y,b.r*1.55,'400',10,'#0a0b0d');
  }else{
    ctx.fillStyle='rgba(10,11,13,0.97)';ctx.fill();
    ctx.lineWidth=1;ctx.strokeStyle='rgba(201,168,76,0.4)';ctx.stroke();
    // Initials centred + tiny label below for non-core
    ctx.font='600 12px "DM Sans",sans-serif';
    ctx.fillStyle=GOLD;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(b.ab,b.x,b.y-4);
    ctx.font='400 7px "DM Sans",sans-serif';
    ctx.fillStyle='rgba(201,168,76,0.5)';
    ctx.fillText(b.lb,b.x,b.y+6);
  }
}

// Helper: draw text centred in a ball, wrap to 2 lines if too wide
function drawWrappedText(ctx,text,cx,cy,maxW,weight,size,color){
  ctx.fillStyle=color;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font=weight+' '+size+'px "DM Sans",sans-serif';
  var words=text.split(' ');
  // Try single line first
  if(ctx.measureText(text).width<=maxW){
    ctx.fillText(text,cx,cy);
    return;
  }
  // Split into 2 lines at best midpoint
  var best=1,bestDiff=9999;
  for(var s=1;s<words.length;s++){
    var l1=words.slice(0,s).join(' '),l2=words.slice(s).join(' ');
    var diff=Math.abs(ctx.measureText(l1).width-ctx.measureText(l2).width);
    if(diff<bestDiff){bestDiff=diff;best=s;}
  }
  var line1=words.slice(0,best).join(' '),line2=words.slice(best).join(' ');
  var lh=size*1.3;
  ctx.fillText(line1,cx,cy-lh/2);
  ctx.fillText(line2,cx,cy+lh/2);
}

// Mouse / touch tracking
canvas.addEventListener('mousemove',function(e){
  var r=canvas.getBoundingClientRect();
  mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;
},{passive:true});
canvas.addEventListener('touchmove',function(e){
  var r=canvas.getBoundingClientRect();
  mouseX=e.touches[0].clientX-r.left;mouseY=e.touches[0].clientY-r.top;
},{passive:true});
canvas.addEventListener('mouseleave',function(){mouseX=-9999;mouseY=-9999;});

// Click to reveal full skill name
canvas.addEventListener('click',function(e){
  var r=canvas.getBoundingClientRect();
  var cx=e.clientX-r.left,cy=e.clientY-r.top;
  for(var i=balls.length-1;i>=0;i--){
    var b=balls[i];
    var dx=b.x-cx,dy=b.y-cy;
    if(dx*dx+dy*dy<=b.r*b.r){
      tooltip.text=b.t;
      tooltip.x=b.x;tooltip.y=b.y-b.r-4;
      tooltip.alpha=1;
      if(tooltip.timer)clearTimeout(tooltip.timer);
      // Kick ball on click
      b.vx+=(Math.random()-.5)*8;
      b.vy-=6+Math.random()*4;
      break;
    }
  }
});
canvas.addEventListener('touchstart',function(e){
  var r=canvas.getBoundingClientRect();
  var cx=e.touches[0].clientX-r.left,cy=e.touches[0].clientY-r.top;
  for(var i=balls.length-1;i>=0;i--){
    var b=balls[i];
    var dx=b.x-cx,dy=b.y-cy;
    if(dx*dx+dy*dy<=b.r*b.r){
      tooltip.text=b.t;tooltip.x=b.x;tooltip.y=b.y-b.r-4;tooltip.alpha=1;
      b.vx+=(Math.random()-.5)*6;b.vy-=5;
      break;
    }
  }
},{passive:true});

function start(){
  if(started)return;started=true;setup();mk();fr();
}
window.addEventListener('resize',function(){
  if(!started)return;
  if(raf){cancelAnimationFrame(raf);raf=null;}
  setup();mk();fr();
});
new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){start();}
    else if(raf){cancelAnimationFrame(raf);raf=null;started=false;}
  });
},{threshold:0.05}).observe(canvas);
})();

// ═══════════════════════════════════════════════════════════════
// CROSS-SIMULATOR CARRY-FORWARD
// Inv → Queue: EOQ order cycle time → simTime; unit cost → staffCost
// Queue → DCF: served customers + unit cost → revenue; util → EBITDA margin
// ═══════════════════════════════════════════════════════════════
var _lastInvResults = null;   // stored after inv sim runs
var _lastQueueResults = null; // stored after queue sim runs

// Called at end of _executeRun() to cache results
function _cacheInvResults(p, eoq, ss, rop, grandTotal, avgD){
  _lastInvResults = {
    eoq: eoq,
    ss: ss,
    rop: rop,
    totalCost: grandTotal,
    unitCost: p.C,
    leadTime: p.L,
    demand: p.D,
    svcPct: p.svcPct,
    avgD: avgD
  };
}

// Called at end of queue sim to cache results
function _cacheQueueResults(p, r){
  _lastQueueResults = {
    served: r.served,
    avgWait: r.avgWait,
    util: r.util,
    staffCost: p.staffCost,
    numServers: p.numServers,
    simTime: p.simTime,
    arrivalInterval: p.arrivalInterval,
    serviceTime: p.serviceTime
  };
}

// INV → QUEUE
// Logic: 
//   simTime  = order cycle length in days (demand / eoq * 365 = cycles/yr → days/cycle)
//   arrival interval = avgD converted to minutes (demand per minute of operating day)
//   service time = lead time in days → minutes of "processing" per order
//   staffCost = unit cost / 2 (rough proxy: labour ~50% of unit cost for ops-heavy biz)
//   numServers = ceil(eoq / (demand/365 * leadTime)) clamped 1-10
window.carryInvToQueue = function(){
  if(!_lastInvResults){
    alert('Run the Inventory Lab first to generate results.');
    return;
  }
  var r = _lastInvResults;
  // Days per order cycle
  var cycledays = Math.round(r.eoq / r.avgD);
  // Arrivals per minute: assume 8-hour operating day
  var demandPerDay = r.avgD;
  var demandPerMin = demandPerDay / 480; // 8hr * 60min
  var arrivalInterval = demandPerMin > 0 ? Math.max(0.5, Math.min(30, (1/demandPerMin).toFixed(1))) : 3;
  // Service time ~ lead time normalised to minutes per "job"
  var serviceTime = Math.max(1, Math.min(60, Math.round(r.leadTime * 480 / (r.eoq||1))));
  // Servers: rough sqrt scaling
  var servers = Math.max(1, Math.min(10, Math.round(Math.sqrt(r.demand/500))));
  // Staff cost: unit cost / 2 as hourly proxy
  var staffCost = Math.max(12, Math.min(150, Math.round(r.unitCost / 2)));
  // SimTime: one full order cycle in minutes
  var simTime = Math.max(60, Math.min(480, cycledays * 8 * 60 / 60)); // hours → as minutes

  // Set queue inputs
  function setVal(id, val){ var el=document.getElementById(id); if(el) el.value=val; }
  setVal('q-arrival', parseFloat(arrivalInterval).toFixed(1));
  setVal('q-service', serviceTime);
  setVal('q-servers', servers);
  setVal('q-staffcost', staffCost);
  setVal('q-simtime', Math.round(simTime));

  // Switch to queue tab and highlight inputs briefly
  switchSimTab('queue');
  setTimeout(function(){
    var inputs = ['q-arrival','q-service','q-servers','q-staffcost','q-simtime'];
    inputs.forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.style.borderColor='rgba(201,168,76,.7)'; setTimeout(function(){ el.style.borderColor=''; },1800); }
    });
  }, 200);
};

// QUEUE → DCF
// Logic:
//   revenue = served customers * unitCost (from inv if available, else $50 default) / 1000 → $K
//   growth rate = derive from utilisation: high util = capacity-constrained = slower growth
//   EBITDA margin = utilisation proxy: 70-80% util maps to ~20-25% EBITDA; >90% = 15%; <60% = 30%
//   WACC = base 10% + adjustment for avg wait (long waits = higher operational risk)
//   staffCost feeds into capex proxy
window.carryQueueToDCF = function(){
  if(!_lastQueueResults){
    alert('Run the Queue & Staffing Lab first to generate results.');
    return;
  }
  var q = _lastQueueResults;
  var unitCost = (_lastInvResults && _lastInvResults.unitCost) ? _lastInvResults.unitCost : 50;

  // Revenue: annualise served customers over simTime (minutes) → per year
  var annualCustomers = q.served * (525600 / q.simTime); // 525600 = mins/year
  var revenueK = Math.round(annualCustomers * unitCost / 1000);
  revenueK = Math.max(100, Math.min(500000, revenueK));

  // Growth rate: capacity-constrained (high util) → modest growth; slack → higher growth potential
  var util = q.util;
  var growth1 = util > 85 ? 8 : util > 70 ? 14 : 20;  // yr 1-3
  var growth2 = Math.round(growth1 * 0.55);              // yr 4-5

  // EBITDA margin from utilisation
  var ebitda = util > 90 ? 14 : util > 80 ? 20 : util > 65 ? 26 : 32;

  // WACC: base 10%, +1% per 2 min of avg wait beyond 3 min
  var waccAdj = Math.max(0, Math.round((q.avgWait - 3) / 2));
  var wacc = Math.min(18, 10 + waccAdj);

  // Capex: server-intensive ops = higher capex
  var capex = Math.round(3 + q.numServers * 0.4);

  function setVal(id, val){ var el=document.getElementById(id); if(el) el.value=val; }
  setVal('d-revenue',  revenueK);
  setVal('d-growth1',  growth1);
  setVal('d-growth2',  growth2);
  setVal('d-ebitda',   ebitda);
  setVal('d-wacc',     wacc);
  setVal('d-capex',    capex);

  switchSimTab('dcf');
  setTimeout(function(){
    var inputs = ['d-revenue','d-growth1','d-growth2','d-ebitda','d-wacc','d-capex'];
    inputs.forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.style.borderColor='rgba(201,168,76,.7)'; setTimeout(function(){ el.style.borderColor=''; },1800); }
    });
  }, 200);
};

// 18. MOBILE MENU
function toggleMobileMenu(){
  const toggle=document.getElementById('nav-toggle');
  const menu=document.getElementById('mobile-menu');
  toggle.classList.toggle('open');
  menu.classList.toggle('open');
  document.body.style.overflow=menu.classList.contains('open')?'hidden':'';
}
function closeMobileMenu(){
  document.getElementById('nav-toggle').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
  document.body.style.overflow='';
}

// ─── NEW FEATURES ───────────────────────────────────────
// 21. EXPERIENCE TIMELINE LINE -- draws down as you scroll through
const tlLine=document.getElementById('tlLine');
const expSection=document.getElementById('section-experience');
if(tlLine&&expSection){
  window.addEventListener('scroll',()=>{
    const rect=expSection.getBoundingClientRect();
    const total=expSection.offsetHeight;
    const scrolled=Math.max(0,-rect.top+innerHeight*.5);
    const pct=Math.min(1,scrolled/total);
    tlLine.style.height=(pct*100)+'%';
    // Activate dots
    document.querySelectorAll('.exp-card-tl').forEach(card=>{
      const cr=card.getBoundingClientRect();
      card.classList.toggle('tl-active',cr.top<innerHeight*.6);
    });
  },{passive:true});
}

// 23. DRAG-SCROLL CAROUSEL (case studies)
(function(){
  const slider=document.getElementById('caseSlider');
  const dotsWrap=document.getElementById('sliderDots');
  if(!slider)return;

  // Build dots
  const cards=slider.querySelectorAll('.case-flip');
  cards.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='slider-dot'+(i===0?' act':'');
    d.addEventListener('click',()=>slider.scrollTo({left:i*(cards[0].offsetWidth+24),behavior:'smooth'}));
    dotsWrap.appendChild(d);
  });

  // Update active dot on scroll
  slider.addEventListener('scroll',()=>{
    const idx=Math.round(slider.scrollLeft/(slider.scrollWidth/cards.length));
    dotsWrap.querySelectorAll('.slider-dot').forEach((d,i)=>d.classList.toggle('act',i===idx));
  },{passive:true});

  // Mouse drag
  let isDown=false,startX,scrollLeft;
  slider.addEventListener('mousedown',e=>{
    isDown=true;slider.classList.add('dragging');
    startX=e.pageX-slider.offsetLeft;scrollLeft=slider.scrollLeft;
  });
  slider.addEventListener('mouseleave',()=>{isDown=false;slider.classList.remove('dragging');});
  slider.addEventListener('mouseup',()=>{isDown=false;slider.classList.remove('dragging');});
  slider.addEventListener('mousemove',e=>{
    if(!isDown)return;e.preventDefault();
    const x=e.pageX-slider.offsetLeft;
    slider.scrollLeft=scrollLeft-(x-startX)*1.5;
  });

  // Touch drag (momentum feel)
  let tStartX,tScrollLeft;
  slider.addEventListener('touchstart',e=>{tStartX=e.touches[0].pageX;tScrollLeft=slider.scrollLeft;},{passive:true});
  slider.addEventListener('touchmove',e=>{
    const dx=tStartX-e.touches[0].pageX;
    slider.scrollLeft=tScrollLeft+dx;
  },{passive:true});
})();

// 24. FLOATING CONNECT PILL -- appears after hero
const floatCta=document.getElementById('float-cta');
window.addEventListener('scroll',()=>{
  const show=window.scrollY>window.innerHeight*.6;
  if(floatCta)floatCta.classList.toggle('show',show);
  if(readTime){
    const pct=Math.round(window.scrollY/(document.body.scrollHeight-innerHeight)*100);
    readTime.textContent=pct+'% READ';
    readTime.style.opacity=show?'1':'0';
  }
},{passive:true});

// 25. FAQ ACCORDION
document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // 1. Close all other accordions automatically (keeps the UI clean)
        document.querySelectorAll('.faq-btn').forEach(otherBtn => {
            if (otherBtn !== btn) {
                otherBtn.setAttribute('aria-expanded', 'false');
                otherBtn.nextElementSibling.style.maxHeight = null;
                otherBtn.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
            }
        });

        // 2. Toggle the one that was clicked
        if (!isOpen) {
            btn.setAttribute('aria-expanded', 'true');
            // Calculates the exact height needed and opens it
            content.style.maxHeight = content.scrollHeight + "px"; 
            // Smoothly rotates the '+' icon into an 'x'
            icon.style.transform = 'rotate(45deg)'; 
        } else {
            btn.setAttribute('aria-expanded', 'false');
            // Closes it
            content.style.maxHeight = null; 
            icon.style.transform = 'rotate(0deg)';
        }
    });
});

// --- ADVANCED CANVAS GAME ENGINE (CHROME DINO EDITION) ---
(function initSupplyGame() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const GROUND = H - 52;
    
   // let state = 'idle';
    // savedSpeed ensures the user restarts exactly at the speed they died at
    //let distance = 0, highScore = 0, frame = 0, speed = 4, savedSpeed = 4;
    //const truck = { x: 110, y: GROUND, w: 110, h: 52, vy: 0, jumping: false, wheelPhase: 0 };
    //const GRAVITY = 0.72, JUMP_V = -14.5;
    let state = 'idle'; 
    let distance = 0, highScore = 0, frame = 0, speed = 4;
    let roadOffset = 0; // NEW: Tracks the road smoothly
    const truck = { x: 110, y: GROUND, w: 110, h: 52, vy: 0, jumping: false, wheelPhase: 0 };
    const GRAVITY = 0.72, JUMP_V = -14.5;
    
    let bumps = [], bumpTimer = 0, floaters = [];
    let trees = [];
    for (let i = 0; i < 6; i++) trees.push({x: Math.random() * W, h: 30 + Math.random() * 40, speed: 0.6 + Math.random() * 0.4});
    let clouds = [{x: 200, y: 35, w: 70}, {x: 500, y: 55, w: 50}, {x: 720, y: 30, w: 80}];
    
    const scoreEl = document.getElementById('scoreEl');
    const bonusEl = document.getElementById('bonusEl');
    const GOLD = '#c9a84c', RED = '#ef4444', GREEN = '#10b981';
    
    function spawnObstacle() {
        const types = ['bump', 'pothole', 'bridge'];
        const type = types[Math.floor(Math.random() * types.length)];
        let w = 40, h = 15;
        
        if (type === 'bump') {
            w = 36 + Math.random() * 8;
            h = 10 + Math.random() * 8;
        } else if (type === 'pothole') {
            w = 55 + Math.random() * 15;
            h = 10;
        } else if (type === 'bridge') {
            w = 80;
            h = 25; 
        }
        
        bumps.push({x: W + 20, w: w, h: h, type: type, passed: false});
    }
    
    function jump(e) {
        if(e && e.type === 'keydown' && e.code !== 'Space') return;
        if(e && e.type === 'keydown') e.preventDefault();
        if (state === 'idle' || state === 'dead') { startGame(); return; }
        if (!truck.jumping) { truck.vy = JUMP_V; truck.jumping = true; }
    }
    
    canvas.addEventListener('click', jump);
    document.addEventListener('keydown', jump);

  function startGame() {
    state = 'running';
    distance = 0;
    frame = 0;
    speed = 4;          // FIX: Always start at base speed
    roadOffset = 0;     // FIX: Reset road visual
    bumps = [];
    floaters = [];
    bumpTimer = 0;
    truck.y = GROUND;
    truck.vy = 0;
    truck.jumping = false;
    document.getElementById('hint').style.opacity = '0';
    requestAnimationFrame(loop);
}
  //  function startGame() {
 //    state = 'running';
   //  distance = 0; frame = 0; 
     // speed = savedSpeed; // Restore the speed from the previous run
       // bumps = []; floaters = []; bumpTimer = 0;
        //truck.y = GROUND; truck.vy = 0; truck.jumping = false;
        //document.getElementById('hint').style.opacity = '0';
        //lastTime = performance.now();
       //  requestAnimationFrame(loop);
    // /}
    
    function addFloater(x, y, text, color) { floaters.push({x, y, text, color, life: 1.0}); }
    
    function drawTruck(x, y, wheelPhase) {
        ctx.fillStyle = '#e8e8e4'; ctx.beginPath(); ctx.roundRect(x, y - 40, 70, 38, 3); ctx.fill();
        ctx.fillStyle = '#d0ccc5'; ctx.fillRect(x + 2, y - 22, 66, 4);
        ctx.fillStyle = '#2a2a2a'; ctx.font = 'bold 8px "EB Garamond", sans-serif';
        ctx.fillText('SUPPLY &', x + 8, y - 26); ctx.fillText('CO.', x + 8, y - 16);
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.roundRect(x + 70, y - 34, 38, 32, [3, 6, 3, 3]); ctx.fill();
        ctx.fillStyle = '#1a2535'; ctx.beginPath(); ctx.roundRect(x + 76, y - 30, 22, 14, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 77, y - 29, 8, 12);
        ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.roundRect(x + 104, y - 20, 4, 6, 1); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 72, y - 34); ctx.lineTo(x + 72, y - 44); ctx.stroke();
        
        if (state === 'running') {
            for (let s = 0; s < 2; s++) {
                const age = ((wheelPhase * 3 + s * 0.5) % 1);
                ctx.globalAlpha = (1 - age) * 0.3; ctx.fillStyle = '#aaa';
                ctx.beginPath(); ctx.arc(x + 72, y - 44 - age * 14, 3 + age * 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        
        [[x+14, wheelPhase], [x+48, wheelPhase], [x+80, wheelPhase+0.1], [x+98, wheelPhase+0.1]].forEach(([wx, ph]) => {
            ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(wx, y - 1, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(wx, y - 1, 5.5, 0, Math.PI * 2); ctx.fill();
            const boltAngle = ph * Math.PI * 2; ctx.fillStyle = '#555';
            for (let b = 0; b < 5; b++) {
                const ba = boltAngle + (b / 5) * Math.PI * 2;
                ctx.beginPath(); ctx.arc(wx + Math.cos(ba)*3.2, y - 1 - Math.sin(ba)*3.2, 1, 0, Math.PI*2); ctx.fill();
            }
        });
    }
    
    function drawObstacle(b) {
        const bx = b.x, by = GROUND, bw = b.w, bh = b.h;
        
        if (b.type === 'bump') {
            ctx.fillStyle = GOLD; ctx.fillRect(bx - 14, by - 3, 8, 3);
            ctx.fillStyle = '#e05a00'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 4, by - bh); ctx.lineTo(bx + bw - 4, by - bh); ctx.lineTo(bx + bw, by); ctx.closePath(); ctx.fill();
            ctx.fillStyle = GOLD; ctx.fillRect(bx + bw/2 - 3, by - bh, 6, bh);
            ctx.fillStyle = '#ffcc00'; ctx.fillRect(bx, by - 3, 5, 3); ctx.fillRect(bx + bw - 5, by - 3, 5, 3);
        } 
        else if (b.type === 'pothole') {
            ctx.fillStyle = '#0a0a0a';
            ctx.beginPath(); ctx.ellipse(bx + bw/2, by + 2, bw/2, 5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(bx + bw/2, by + 3, bw/2 - 4, 3, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = GOLD;
            ctx.fillRect(bx - 10, by - 2, 8, 2);
            ctx.fillRect(bx + bw + 2, by - 2, 8, 2);
        } 
        else if (b.type === 'bridge') {
            ctx.fillStyle = '#111'; ctx.fillRect(bx + 10, by - 100, 12, 100);
            ctx.fillStyle = '#222'; ctx.fillRect(bx + bw - 22, by - 100, 12, 100);
            ctx.fillStyle = GOLD; ctx.fillRect(bx, by - 100, bw, 24);
            ctx.fillStyle = '#222'; ctx.fillRect(bx, by - 79, bw, 3);
            ctx.fillStyle = '#111'; ctx.font = 'bold 12px "EB Garamond", sans-serif';
            ctx.fillText('DO NOT JUMP', bx + 12, by - 84);
        }
    }
    
   function drawRoad() {   // Removed "offset" from the parentheses
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    
    ctx.fillStyle = '#333';
    const dashw = 30, gap = 50;
    roadOffset = (roadOffset + speed) % (dashw + gap); 
    
    // FIX: Changed "-offset" to "-roadOffset"
    for (let dx = -roadOffset; dx < W; dx += dashw + gap) { 
        ctx.fillRect(dx, GROUND + 10, dashw, 3);
    }
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, GROUND, W, 2);
    ctx.fillStyle = '#252525';
    ctx.fillRect(0, H - 18, W, 2);
}
    
    function drawTree(tx, th) {
        ctx.fillStyle = '#1e1e1e'; ctx.beginPath(); ctx.moveTo(tx, GROUND); ctx.lineTo(tx - 14, GROUND - th); ctx.lineTo(tx + 14, GROUND - th); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.moveTo(tx, GROUND - th * 0.5); ctx.lineTo(tx - 18, GROUND); ctx.lineTo(tx + 18, GROUND); ctx.closePath(); ctx.fill();
    }
    
    function drawCloud(cx, cy, cw) {
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath(); ctx.ellipse(cx, cy, cw/2, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - cw*0.2, cy + 5, cw*0.3, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + cw*0.2, cy + 4, cw*0.28, 7, 0, 0, Math.PI*2); ctx.fill();
    }
    
    function drawOverlay() {
        if (state === 'idle') {
            ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = GOLD; ctx.font = 'bold 36px "EB Garamond", sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('CLICK TO START ROUTE', W/2, H/2 - 10);
            ctx.fillStyle = '#888'; ctx.font = '13px "Share Tech Mono", monospace';
            ctx.fillText('JUMP OVER HOLES. DUCK UNDER BRIDGES.', W/2, H/2 + 18);
        }
       if (state === 'dead') {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px "EB Garamond", sans-serif';

            ctx.fillStyle = RED;
            ctx.fillText('SUPPLY DISRUPTED', W / 2, H / 2 - 14);
            ctx.fillStyle = '#888';
            ctx.font = '13px "Share Tech Mono", monospace';
            ctx.fillText('FINAL DISTANCE: ' + Math.floor(distance) + 'm  |  HI-SCORE: ' + Math.floor(highScore) + 'm', W / 2, H / 2 + 12);

            ctx.fillStyle = '#555';
            ctx.font = '13px "Share Tech Mono", monospace';
            ctx.fillText('CLICK OR PRESS SPACE TO RESTART', W / 2, H / 2 + 40);
        }
        ctx.textAlign = 'left';
    }
    
    function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
    
    let lastTime = 0;
    
    function loop(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05); lastTime = ts;
        ctx.clearRect(0, 0, W, H);
        
        const grad = ctx.createLinearGradient(0, 0, 0, GROUND);
        grad.addColorStop(0, '#0a0a0a'); grad.addColorStop(1, '#141414');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, GROUND);
        
        clouds.forEach(c => { drawCloud(c.x, c.y, c.w); if (state === 'running') { c.x -= 0.4; if (c.x + c.w < 0) c.x = W + c.w; }});
        trees.forEach(t => { drawTree(t.x, t.h); if (state === 'running') { t.x -= t.speed * speed * 0.18; if (t.x < -20) t.x = W + 20; }});
        drawRoad();
        
        if (state === 'running') {
            frame++;
            speed = Math.min(12, speed + 0.002); // Smooth, frame-based acceleration
            distance += speed * 0.05;            // Frame-based distance tracking 
                     
            truck.vy += GRAVITY; truck.y += truck.vy;
            if (truck.y >= GROUND) { truck.y = GROUND; truck.vy = 0; truck.jumping = false; }
            truck.wheelPhase += speed * 0.003;
            
            bumpTimer++; 
            const bumpInterval = Math.max(45, 130 - speed * 6); // Obstacles spawn faster as speed increases
            if (bumpTimer >= bumpInterval) { spawnObstacle(); bumpTimer = 0; }
            
            bumps.forEach(b => {
                b.x -= speed;
                const tx = truck.x + 8, ty = truck.y - truck.h + 8, tw = truck.w - 16, th = truck.h - 12;
                
                // Dynamic collision boxes based on obstacle type
                let obsX = b.x, obsY, obsW = b.w, obsH;
                if (b.type === 'bump') {
                    obsY = GROUND - b.h;
                    obsH = b.h + 2;
                } else if (b.type === 'pothole') {
                    obsX = b.x + 10;
                    obsW = b.w - 20; 
                    obsY = GROUND - 10; // Extends up slightly to catch the truck wheels
                    obsH = 20;
                } else if (b.type === 'bridge') {
                    obsX = b.x + 5;
                    obsW = b.w - 10;
                    obsY = 0;
                    obsH = GROUND - 60; // Fills the airspace, killing the truck if it jumps
                }
                
                if (!b.passed) {
                    if (rectsOverlap(tx, ty, tw, th, obsX, obsY, obsW, obsH)) {
                        state = 'dead';
                        if (distance > highScore) { highScore = distance; }
                         // Save the exact momentum for the next run
                        speed = 0;          // Freeze the animation
                    }
                    
                    if (b.x + b.w < truck.x && state === 'running') {
                        b.passed = true;
                        addFloater(truck.x + 30, truck.y - 70, 'Cleared!', GREEN);
                    }
                }
            });
            
            bumps = bumps.filter(b => b.x + b.w + 10 > 0);
            
            const distStr = Math.floor(distance).toString().padStart(5, '0') + 'm';
            const hiStr = Math.floor(highScore).toString().padStart(5, '0') + 'm';
            
            scoreEl.textContent = distStr;
            bonusEl.textContent = hiStr;
        }
        
        // Draw truck FIRST so the bridge pillars render "over" it
        drawTruck(truck.x, truck.y, truck.wheelPhase);
        bumps.forEach(drawObstacle);
        
        floaters.forEach(f => {
            ctx.globalAlpha = Math.max(0, f.life); ctx.fillStyle = f.color;
            ctx.font = 'bold 15px "EB Garamond", sans-serif'; ctx.fillText(f.text, f.x, f.y);
            ctx.globalAlpha = 1; f.y -= 0.8; f.life -= 0.018;
        });
        floaters = floaters.filter(f => f.life > 0);
        
        drawOverlay();
        if(state !== 'dead' || floaters.length > 0) requestAnimationFrame(loop);
    }
    
    drawOverlay();
    requestAnimationFrame(loop);
})();

// AGENCY QUOTE — "THE CINEMATIC FOCUS PULL" (CLEAN INIT)
// ═══════════════════════════════════════════════════════════
window.addEventListener('load', () => {
    // Wait for the preloader to finish before calculating scroll math
    const quoteInterval = setInterval(() => {
        if (document.body.classList.contains('loaded') || !document.getElementById('preloader')) {
            clearInterval(quoteInterval);
            const section = document.getElementById('agency-quote');
            const lines = document.querySelectorAll('.aq-line, .aq-author');
            if (!section || lines.length === 0 || typeof gsap === 'undefined') return;

            gsap.registerPlugin(ScrollTrigger);

            // 1. Parallax Drift: Moves the quote slightly as you scroll past it
            gsap.to('.agency-quote-wrap', {
                y: 80,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
            });

            // 2. 3D Cascade: Folds the words up out of the darkness
            lines.forEach((line) => {
                const words = line.querySelectorAll('.aq-word');
                gsap.fromTo(words,
                    { opacity: 0, filter: "blur(16px)", y: 40, rotationX: -50, transformOrigin: "50% 100%" },
                    { opacity: 1, filter: "blur(0px)", y: 0, rotationX: 0, stagger: 0.1,
                        scrollTrigger: { trigger: line, start: "top 90%", end: "top 50%", scrub: 1.2 }
                    }
                );
            });
        }
    }, 100);
});
