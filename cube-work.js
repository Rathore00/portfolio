/* Glass cubes: bubbles inside, then one cube at a time driven by scroll */
(function(){
  function rng(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  document.querySelectorAll('.core').forEach(function(core){
    const r = rng(+core.dataset.seed * 131 + 17);
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 14; i++){
      const big = r() > .72;
      const sz = big ? .14 + r() * .1 : .035 + r() * .075;
      const el = document.createElement('i');
      el.style.cssText = '--s:calc(var(--w) * ' + sz.toFixed(3) + ');' +
        '--bx:calc(var(--w) * ' + ((r() - .5) * .78).toFixed(3) + ');' +
        '--by:calc(var(--h) * ' + ((r() - .5) * .78).toFixed(3) + ');' +
        '--bz:calc(var(--d) * ' + ((r() - .5) * .6).toFixed(3) + ');' +
        '--dl:' + (-r() * 9).toFixed(2) + 's;--dur:' + (5 + r() * 6).toFixed(1) + 's;--mx:calc(var(--w) * ' + ((.05 + r() * .09) * (r() > .5 ? 1 : -1)).toFixed(3) + ');--my:calc(var(--h) * ' + (.05 + r() * .1).toFixed(3) + ')';
      el.appendChild(document.createElement('b'));
      frag.appendChild(el);
    }
    core.appendChild(frag);
  });

  (function(){
    const st = document.getElementById('cube-stage'), tg = document.getElementById('cube-tg');
    if(!st || !tg) return;
    function set(t){ st.dataset.theme = t; tg.setAttribute('aria-pressed', t === 'light'); try{ localStorage.setItem('cube-theme', t); }catch(e){} }
    let saved = null; try{ saved = localStorage.getItem('cube-theme'); }catch(e){}
    if(saved === 'light') set('light');
    tg.addEventListener('click', function(e){ e.preventDefault(); set(st.dataset.theme === 'light' ? 'glass' : 'light'); });
  })();

  const track = document.getElementById('cube-track');
  const stage = document.getElementById('cube-stage');
  if(!track || !stage) return;
  const slots = Array.prototype.slice.call(stage.querySelectorAll('.cube-slot'));
  const n = slots.length;
  function show(el, pe, qx){
    el.style.setProperty('--pe', pe.toFixed(4));
    el.style.setProperty('--qx', qx.toFixed(4));
    const op = Math.min(1, pe * 4) * (1 - Math.max(0, (qx - .8) / .2));
    el.style.opacity = op.toFixed(3);
    el.style.pointerEvents = (pe > .7 && qx < .25) ? 'auto' : 'none';
  }
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    slots.forEach(function(el, i){ show(el, 1, 0); el.style.setProperty('--dm', '.3'); el.style.position = 'relative'; });
    return;
  }
  function clamp(v){ return Math.max(0, Math.min(1, v)); }
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function easeIn(t){ return t * t * t; }
  const L = .30, STEP = .235, START = .02;
  let target = 0, cur = 0, running = false;
  function read(){
    const r = track.getBoundingClientRect();
    target = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
  }
  function render(){
    slots.forEach(function(el, i){
      const s = clamp((cur - (START + i * STEP)) / L);
      const pe = easeOut(clamp(s / .28));
      const qx = i === n - 1 ? 0 : easeIn(clamp((s - .72) / .28));
      const vis = pe > 0.002 && !(i < n - 1 && qx > .999);
      el.classList.toggle('off', !vis);
      if(!vis){ el.style.opacity = '0'; el.style.pointerEvents = 'none'; return; }
      show(el, pe, qx);
      el.style.setProperty('--dm', clamp((s - .15) / .6).toFixed(4));
    });
  }
  function loop(){
    cur += (target - cur) * .09;
    if(Math.abs(target - cur) < .00015) cur = target;
    render();
    if(cur !== target) requestAnimationFrame(loop); else running = false;
  }
  function req(){ read(); if(!running){ running = true; requestAnimationFrame(loop); } }
  function update(){ read(); cur = target; render(); }
  window.addEventListener('scroll', req, {passive:true});
  window.addEventListener('resize', req);
  update();
})();
