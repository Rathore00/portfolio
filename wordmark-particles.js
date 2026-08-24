(function(){
  const DEFAULTS = {
    hue: 210,
    resolution: 6,
    particleSize: 2.5,
    weightDot: 64,
    weightRing: 30,
    weightCross: 20,
    burstForce: 1.85,
    driftSpeed: 0.16,
    floatSpeed: 0.07,
    reassembly: 0.035,
    friction: 0.91,
    repelR: 64,
    repelForce: 0.55,
    fade: 0.05,
    maxParticles: 3600,
    padXFrac: 0.08,
    padYFrac: 0.4
  };

  function bindWordmarkParticles(root, opts){
    if(!root) return;
    opts = Object.assign({}, DEFAULTS, opts || {});
    const stage = root.querySelector('.namskar-stage, .wm-stage') || root;
    const img = root.querySelector('.namskar-img, .wm-img, img');
    let canvas = root.querySelector('.namskar-canvas, .wm-canvas, canvas');
    if(!img) return;
    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.className = 'wm-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if(!ctx) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const WEIGHT_TOTAL = opts.weightDot + opts.weightRing + opts.weightCross;
    const sampleUrl = opts.sampleUrl || img.getAttribute('src') || '';
    const excludeSel = opts.exclude || '';

    function pickShape(){
      const r = Math.random() * WEIGHT_TOTAL;
      if(r < opts.weightDot) return 'dot';
      if(r < opts.weightDot + opts.weightRing) return 'ring';
      return 'cross';
    }

    function pickInk(){
      const l = 42 + Math.random() * 28;
      const s = 72 + Math.random() * 18;
      return 'hsl(' + opts.hue + ',' + s.toFixed(1) + '%,' + l.toFixed(1) + '%)';
    }

    let particles = [];
    let raf = 0;
    let hovering = false;
    let ready = false;
    let reforming = false;
    let dpr = 1;
    let cw = 0, ch = 0;
    let padX = 0, padY = 0;
    let textW = 0, textH = 0;
    let sampleImg = null;
    let lastW = 0, lastH = 0;
    let svgFade = 1;
    let canvasFade = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    function blobImage(blob){
      return new Promise((resolve) => {
        const im = new Image();
        const obj = URL.createObjectURL(blob);
        im.onload = () => resolve(im.naturalWidth > 0 ? im : null);
        im.onerror = () => resolve(null);
        im.src = obj;
      });
    }

    function inkifySvg(svgText){
      return svgText
        .replace(/fill="url\([^"]+\)"/g, 'fill="#111111"')
        .replace(/stop-color="[^"]*"/g, 'stop-color="#111111"');
    }

    function loadImageBlob(url){
      if(!url) return Promise.resolve(null);
      return fetch(url)
        .then(r => { if(!r.ok) throw new Error('bad'); return r.text(); })
        .then(text => {
          const isSvg = /<svg/i.test(text);
          const payload = isSvg ? inkifySvg(text) : text;
          const type = isSvg ? 'image/svg+xml' : 'image/png';
          return blobImage(new Blob([payload], { type: type }));
        })
        .catch(() => null);
    }

    function makeFullWidthText(drawW, drawH, label){
      const c = document.createElement('canvas');
      c.width = drawW; c.height = drawH;
      const x = c.getContext('2d');
      x.clearRect(0,0,drawW,drawH);
      x.fillStyle = '#e6e6e6';
      x.textAlign = 'left';
      x.textBaseline = 'middle';
      let size = Math.floor(drawH * 0.92);
      x.font = '900 ' + size + 'px Montserrat, Inter, Arial Black, sans-serif';
      let tw = x.measureText(label).width;
      if(tw > 0 && tw < drawW * 0.98){
        size = Math.floor(size * (drawW * 0.98) / tw);
        x.font = '900 ' + size + 'px Montserrat, Inter, Arial Black, sans-serif';
        tw = x.measureText(label).width;
      }
      x.fillText(label, (drawW - tw) / 2, drawH * 0.52);
      return c;
    }

    function buildParticles(source, drawW, drawH){
      const step = opts.resolution;
      const off = document.createElement('canvas');
      off.width = drawW; off.height = drawH;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.clearRect(0,0,drawW,drawH);
      try { octx.drawImage(source, 0, 0, drawW, drawH); }
      catch(e){ return []; }
      let data;
      try { data = octx.getImageData(0, 0, drawW, drawH).data; }
      catch(e){ return []; }

      const list = [];
      for(let y = 0; y < drawH; y += step){
        for(let x = 0; x < drawW; x += step){
          const i = (y * drawW + x) * 4;
          if(data[i+3] < 28) continue;
          if(data[i] > 248 && data[i+1] > 248 && data[i+2] > 248) continue;
          const bx = x + step * 0.5 + padX;
          const by = y + step * 0.5 + padY;
          list.push({
            x: bx, y: by,
            ox: bx, oy: by,
            vx: 0, vy: 0,
            shape: pickShape(),
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.018,
            size: opts.particleSize * (0.88 + Math.random() * 0.24),
            color: pickInk(),
            alpha: 0.72 + Math.random() * 0.28,
            fx: 0.35 + Math.random() * 0.55,
            fy: 0.35 + Math.random() * 0.55,
            ph: Math.random() * Math.PI * 2,
            ph2: Math.random() * Math.PI * 2,
            outAng: Math.random() * Math.PI * 2,
            float: opts.floatSpeed * (0.45 + Math.random() * 0.9)
          });
        }
      }
      if(list.length > opts.maxParticles){
        const keep = [];
        const chance = opts.maxParticles / list.length;
        for(let i=0;i<list.length;i++){
          if(Math.random() < chance) keep.push(list[i]);
        }
        return keep.length > 200 ? keep : list.slice(0, opts.maxParticles);
      }
      return list;
    }

    function sizeCanvas(){
      const ir = img.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      if(ir.width < 40 || ir.height < 20) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      textW = ir.width;
      textH = ir.height;
      padX = Math.round(textW * opts.padXFrac);
      padY = Math.round(Math.max(48, textH * opts.padYFrac));
      cw = textW + padX * 2;
      ch = textH + padY * 2;
      lastW = textW;
      lastH = textH;
      const relX = ir.left - sr.left;
      const relY = ir.top - sr.top;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      canvas.style.left = (relX - padX) + 'px';
      canvas.style.top = (relY - padY) + 'px';
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function glyphSpan(list){
      if(!list.length) return 0;
      let minX=1e9, maxX=-1e9;
      for(let i=0;i<list.length;i++){
        if(list[i].ox<minX)minX=list[i].ox;
        if(list[i].ox>maxX)maxX=list[i].ox;
      }
      return maxX - minX;
    }

    function rebuild(){
      if(!sizeCanvas()) return;
      const drawW = Math.max(1, Math.round(textW));
      const drawH = Math.max(1, Math.round(textH));
      let list = [];
      let span = 0;
      if(sampleImg){
        list = buildParticles(sampleImg, drawW, drawH);
        span = glyphSpan(list);
      }
      if(!list.length || span < drawW * 0.7){
        const fromImg = buildParticles(img, drawW, drawH);
        if(glyphSpan(fromImg) > span){
          list = fromImg;
          span = glyphSpan(list);
        }
      }
      if(!list.length || span < drawW * 0.7){
        const label = (img.getAttribute('alt') || 'Namskar').replace(/\s+/g, ' ');
        const fromText = buildParticles(makeFullWidthText(drawW, drawH, label), drawW, drawH);
        if(glyphSpan(fromText) > span){
          list = fromText;
          span = glyphSpan(list);
        }
      }
      particles = list;
      ready = particles.length > 80;
      root.dataset.wmCount = String(particles.length);
      root.dataset.wmReady = ready ? '1' : '0';
      if(ready && !raf) loop(performance.now());
    }

    function burstFromOrigins(){
      let cx = 0, cy = 0;
      const n = particles.length || 1;
      for(let i=0;i<particles.length;i++){
        cx += particles[i].ox;
        cy += particles[i].oy;
      }
      cx /= n;
      cy /= n;
      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        p.x = p.ox;
        p.y = p.oy;
        const dx = p.ox - cx;
        const dy = p.oy - cy;
        const ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9;
        const mag = opts.burstForce * (0.35 + Math.random() * 0.4);
        p.outAng = ang;
        p.vx = Math.cos(ang) * mag;
        p.vy = Math.sin(ang) * mag;
      }
    }

    function activate(){
      if(!ready) rebuild();
      if(!ready) return;
      if(!raf) loop(performance.now());
      burstFromOrigins();
      hovering = true;
      reforming = false;
      mouse.active = true;
      root.classList.add('is-active');
    }

    function deactivate(){
      if(!root.classList.contains('is-active') || reforming) return;
      hovering = false;
      reforming = true;
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function finishReform(){
      reforming = false;
      hovering = false;
      mouse.active = false;
      svgFade = 1;
      canvasFade = 0;
      img.style.opacity = '1';
      canvas.style.opacity = '0';
      root.classList.remove('is-active');
      ctx.clearRect(0, 0, cw, ch);
      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        p.x = p.ox; p.y = p.oy; p.vx = 0; p.vy = 0;
      }
    }

    function drawParticle(p){
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineCap = 'square';
      ctx.lineWidth = Math.max(0.55, s * 0.22);
      if(p.shape === 'dot'){
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if(p.shape === 'ring'){
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const d = s * 0.55;
        ctx.beginPath();
        ctx.moveTo(-d, -d); ctx.lineTo(d, d);
        ctx.moveTo(d, -d); ctx.lineTo(-d, d);
        ctx.stroke();
      }
      ctx.restore();
    }

    function nearlyHome(){
      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        if(Math.abs(p.x-p.ox)+Math.abs(p.y-p.oy) > 0.9) return false;
      }
      return true;
    }

    function loop(now){
      raf = requestAnimationFrame(loop);
      if(!root.classList.contains('is-active')) return;
      ctx.clearRect(0, 0, cw, ch);
      const t = now * 0.001;
      if(hovering && !reforming){
        svgFade = Math.max(0, svgFade - opts.fade);
        canvasFade = Math.min(1, canvasFade + opts.fade);
      } else if(reforming){
        svgFade = Math.min(1, svgFade + opts.fade);
        canvasFade = Math.max(0, canvasFade - opts.fade * 0.85);
      }
      img.style.opacity = String(svgFade);
      canvas.style.opacity = String(canvasFade);

      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        if(reforming){
          p.vx += (p.ox - p.x) * opts.reassembly;
          p.vy += (p.oy - p.y) * opts.reassembly;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.x += (p.ox - p.x) * opts.reassembly + p.vx;
          p.y += (p.oy - p.y) * opts.reassembly + p.vy;
        } else {
          p.vx *= opts.friction;
          p.vy *= opts.friction;
          if(mouse.active){
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
            if(dist < opts.repelR){
              const falloff = (opts.repelR - dist) / opts.repelR;
              p.vx += (mdx / dist) * falloff * opts.repelForce;
              p.vy += (mdy / dist) * falloff * opts.repelForce;
            }
          }
          p.x += p.vx + Math.cos(p.outAng) * p.float + Math.sin(t * p.fx + p.ph) * opts.driftSpeed * 0.35;
          p.y += p.vy + Math.sin(p.outAng) * p.float + Math.cos(t * p.fy + p.ph2) * opts.driftSpeed * 0.35;
          p.rot += p.spin * 0.45;
        }
        drawParticle(p);
      }

      if(reforming && nearlyHome() && svgFade >= 0.96) finishReform();
    }

    function localMouse(clientX, clientY){
      const r = canvas.getBoundingClientRect();
      mouse.x = (clientX - r.left) * (cw / (r.width || 1));
      mouse.y = (clientY - r.top) * (ch / (r.height || 1));
    }

    function overPoint(x, y){
      const r = img.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function overExclude(x, y){
      if(!excludeSel) return false;
      const el = document.elementFromPoint(x, y);
      return !!(el && el.closest && el.closest(excludeSel));
    }

    function overMark(x, y){
      return overPoint(x, y) && !overExclude(x, y);
    }

    window.addEventListener('pointermove', (e) => {
      const over = overMark(e.clientX, e.clientY);
      if(over){
        if(!hovering) activate();
        localMouse(e.clientX, e.clientY);
        mouse.active = true;
      } else if(hovering){
        deactivate();
      }
    }, {passive:true});

    root.addEventListener('pointerenter', (e) => {
      if(overExclude(e.clientX, e.clientY)) return;
      activate();
      localMouse(e.clientX, e.clientY);
      mouse.active = true;
    });
    root.addEventListener('pointerleave', () => deactivate());
    root.addEventListener('touchstart', (e) => {
      const tch = e.touches[0];
      if(!tch) return;
      if(overExclude(tch.clientX, tch.clientY)) return;
      if(hovering) deactivate();
      else {
        activate();
        localMouse(tch.clientX, tch.clientY);
        mouse.active = true;
      }
    }, {passive:true});

    let resizeT = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const r = img.getBoundingClientRect();
        if(Math.abs(r.width - lastW) <= 2 && Math.abs(r.height - lastH) <= 2) return;
        const was = hovering || reforming;
        finishReform();
        rebuild();
        if(was) activate();
      }, 120);
    });

    async function boot(){
      const waitImg = img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise(res => img.addEventListener('load', res, {once:true}));
      await waitImg;
      sampleImg = await loadImageBlob(sampleUrl);
      rebuild();
    }
    boot();
  }

  function autoInit(){
    const marks = document.querySelectorAll('[data-wm-burst]');
    for(let i=0;i<marks.length;i++){
      const el = marks[i];
      bindWordmarkParticles(el, {
        sampleUrl: el.getAttribute('data-wm-src') || '',
        exclude: el.getAttribute('data-wm-exclude') || '',
        hue: 210
      });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  window.bindWordmarkParticles = bindWordmarkParticles;
})();
