(function () {
  var CONFIG = {
    density: 6,
    spread: 5,
    lifetime: 6,
    maxParticles: 1200,
    colors: 'auto',
    lightColors: ['#2f4a44', '#1a1f1e'],
    darkColors: ['#f2fbf8', '#ffffff'],
    zIndex: 9998
  };

  if (window.__dustCursor) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__dustCursor = true;

  function start() {
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:' + CONFIG.zIndex + ';margin:0;padding:0;border:0;';
    (document.body || document.documentElement).appendChild(cv);
    var ctx = cv.getContext('2d');
    var dpr = window.devicePixelRatio || 1, W = 0, H = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function parse(c) {
      var m = c && c.match(/[\d.]+/g);
      if (!m || m.length < 3) return null;
      var a = m.length >= 4 ? +m[3] : 1;
      return a > 0.5 ? [+m[0], +m[1], +m[2]] : null;
    }

    function isDarkAt(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el && el.nodeType === 1) {
        if (el.hasAttribute('data-cursor-dark')) return true;
        if (el.hasAttribute('data-cursor-light')) return false;
        var rgb = parse(getComputedStyle(el).backgroundColor);
        if (rgb) return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) < 128;
        el = el.parentElement;
      }
      return false;
    }

    function palette(dark) {
      if (CONFIG.colors !== 'auto') return CONFIG.colors;
      return dark ? CONFIG.darkColors : CONFIG.lightColors;
    }

    var parts = [], px = null, py = null, last = performance.now(), running = true;

    function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      var mx = e.clientX, my = e.clientY;
      if (px === null) { px = mx; py = my; }
      var dx = mx - px, dy = my - py, dist = Math.sqrt(dx * dx + dy * dy);
      var n = Math.min(Math.ceil(dist * 0.35 * CONFIG.density / 5) + CONFIG.density, 40);
      var r = CONFIG.spread * 3 + 8;
      var pal = palette(CONFIG.colors === 'auto' && isDarkAt(mx, my));
      for (var i = 0; i < n && parts.length < CONFIG.maxParticles; i++) {
        var t = Math.random();
        parts.push({
          x: px + dx * t + gauss() * r,
          y: py + dy * t + gauss() * r,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          s: 0.7 + Math.random() * 1.1,
          age: 0,
          max: (1.8 + CONFIG.lifetime * 0.45 + Math.random() * 1.4) * 1000,
          a: 0.45 + Math.random() * 0.5,
          col: pal[Math.random() < 0.7 ? 0 : 1 % pal.length]
        });
      }
      px = mx; py = my;
    }, { passive: true, capture: true });

    document.documentElement.addEventListener('mouseleave', function () { px = null; });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });

    function frame(now) {
      if (!running) return;
      var dt = Math.min(now - last, 50);
      last = now;
      var k = dt / 16.67;
      ctx.clearRect(0, 0, W, H);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.age += dt;
        if (p.age >= p.max) { parts.splice(i, 1); continue; }
        p.vx += (Math.random() - 0.5) * 0.05 * k * (CONFIG.spread / 5);
        p.vy += (Math.random() - 0.5) * 0.05 * k * (CONFIG.spread / 5);
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * k; p.y += p.vy * k;
        var t = p.age / p.max;
        var fade = t < 0.12 ? t / 0.12 : Math.pow(1 - t, 1.4);
        ctx.globalAlpha = p.a * fade;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
