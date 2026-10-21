(function () {
  var CONFIG = {
    size: 70,
    wobble: 5,
    blur: 6,
    hideNativeCursor: true,
    growSelector: 'a, button, [role="button"], input, textarea, select, [data-cursor-grow]',
    zIndex: 99999
  };

  if (window.__bubbleCursor) return;
  window.__bubbleCursor = true;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.createElement('div');
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:' + CONFIG.zIndex + ';';
  document.body.appendChild(root);

  if (CONFIG.hideNativeCursor) {
    var css = document.createElement('style');
    css.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(css);
  }

  function makeEl() {
    var el = document.createElement('div');
    el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;opacity:0;will-change:transform,border-radius;transition:opacity .25s ease;';
    root.appendChild(el);
    return el;
  }

  function glass(el, blur, small) {
    el.style.background = 'rgba(255,255,255,0.14)';
    el.style.backdropFilter = 'blur(' + blur + 'px) saturate(1.5)';
    el.style.webkitBackdropFilter = 'blur(' + blur + 'px) saturate(1.5)';
    el.style.border = '1px solid rgba(255,255,255,0.55)';
    el.style.boxShadow = small
      ? 'inset 3px 3px 7px rgba(255,255,255,0.5), inset -3px -4px 7px rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.12)'
      : 'inset 6px 6px 14px rgba(255,255,255,0.45), inset -6px -8px 14px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.12)';
  }

  var els = [makeEl(), makeEl(), makeEl()];
  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var inside = false, started = false, grow = false;
  var scale = 1, squash = 0, heading = 0, calm = 0;
  var m = { x: mx, y: my, vx: 0, vy: 0 };
  var sats = [
    { x: mx, y: my, vx: 0, vy: 0, s: 0.32, a: 0.6, dir: 1, ph: 0 },
    { x: mx, y: my, vx: 0, vy: 0, s: 0.22, a: 0.6 + Math.PI, dir: -1, ph: 2 }
  ];
  var parts = [];

  function show(v) {
    els.forEach(function (el) { el.style.opacity = v ? '1' : '0'; });
  }

  document.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!started) {
      started = true;
      m.x = mx; m.y = my;
      sats.forEach(function (p) { p.x = mx + 40; p.y = my; });
    }
    if (!inside) { inside = true; show(true); }
    var t = e.target;
    grow = !!(t && t.closest && t.closest(CONFIG.growSelector));
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', function () {
    inside = false; grow = false; show(false);
  });

  document.addEventListener('pointerdown', function () {
    squash = 1;
    var s = CONFIG.size;
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2 + Math.random() * 0.5;
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;border-radius:50%;';
      glass(el, CONFIG.blur, true);
      var r = s * (0.1 + Math.random() * 0.14);
      el.style.width = r * 2 + 'px';
      el.style.height = r * 2 + 'px';
      root.appendChild(el);
      parts.push({
        el: el, x: mx, y: my,
        vx: Math.cos(a) * (2.5 + Math.random() * 2),
        vy: Math.sin(a) * (2.5 + Math.random() * 2) - 1,
        r: r, life: 1
      });
    }
  }, { passive: true });

  function blob(t, amp, sp, ph) {
    var v = [];
    for (var i = 0; i < 4; i++) v.push(50 + Math.sin(t * 0.0005 * sp + i * 1.9 + ph) * amp);
    return v[0] + '% ' + (100 - v[0]) + '% ' + v[1] + '% ' + (100 - v[1]) + '% / ' +
           v[2] + '% ' + v[3] + '% ' + (100 - v[3]) + '% ' + (100 - v[2]) + '%';
  }

  var last = performance.now();

  function frame(now) {
    var dtms = Math.min(now - last, 50);
    var dt = Math.min(dtms / 16.67, 3);
    last = now;

    var s = CONFIG.size, amp = CONFIG.wobble * 1.5, bl = CONFIG.blur;
    scale += ((grow ? 1.7 : 1) - scale) * 0.12;
    squash *= 0.92;

    m.vx += (mx - m.x) * 0.12 * dt;
    m.vy += (my - m.y) * 0.12 * dt;
    m.vx *= Math.pow(0.74, dt);
    m.vy *= Math.pow(0.74, dt);
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    var sp = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
    if (sp > 0.8) {
      var target = Math.atan2(m.vy, m.vx);
      var diff = Math.atan2(Math.sin(target - heading), Math.cos(target - heading));
      heading += diff * 0.08 * dt;
    }
    calm += (Math.min(sp / 6, 1) - calm) * 0.06;

    var stretch = Math.min(sp * 0.03, 0.4);
    var sq = 1 + squash * 0.2 * Math.sin(now * 0.02);
    var sx = (1 + stretch) * sq, sy = (1 - stretch * 0.5) / sq;
    var size = s * scale;

    glass(els[0], bl, false);
    els[0].style.width = size + 'px';
    els[0].style.height = size + 'px';
    els[0].style.borderRadius = blob(now, amp, 1, 0);
    els[0].style.transform = 'translate(' + (m.x - size / 2) + 'px,' + (m.y - size / 2) + 'px) rotate(' + heading + 'rad) scale(' + sx + ',' + sy + ')';

    var sizes = [];
    for (var i = 0; i < 2; i++) {
      var p = sats[i];
      var d = s * p.s * (1 + 0.06 * Math.sin(now * 0.001 + p.ph));
      sizes.push(d);
      p.a += p.dir * (0.00004 + calm * 0.0009 * (i ? 1.5 : 1)) * dtms;
      var dist = size / 2 * 1.05 + d / 2 + 14 + Math.sin(now * 0.0007 + p.ph) * 3;
      var tx = m.x + Math.cos(p.a) * dist;
      var ty = m.y + Math.sin(p.a) * dist * 0.9;
      p.vx += (tx - p.x) * 0.07 * dt;
      p.vy += (ty - p.y) * 0.07 * dt;
      p.vx *= Math.pow(0.78, dt);
      p.vy *= Math.pow(0.78, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (var k = 0; k < 2; k++) {
      var q = sats[k], qd = sizes[k];
      var dx = q.x - m.x, dy = q.y - m.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
      var minD = size / 2 * 1.05 + qd / 2 + 8;
      if (dd < minD) { q.x = m.x + dx / dd * minD; q.y = m.y + dy / dd * minD; }
    }
    var ex = sats[1].x - sats[0].x, ey = sats[1].y - sats[0].y;
    var ed = Math.sqrt(ex * ex + ey * ey) || 1;
    var minS = sizes[0] / 2 + sizes[1] / 2 + 14;
    if (ed < minS) {
      var push = (minS - ed) / 2;
      sats[0].x -= ex / ed * push; sats[0].y -= ey / ed * push;
      sats[1].x += ex / ed * push; sats[1].y += ey / ed * push;
    }

    for (var j = 0; j < 2; j++) {
      var e = els[j + 1], pp = sats[j], dm = sizes[j];
      glass(e, bl, true);
      e.style.width = dm + 'px';
      e.style.height = dm + 'px';
      e.style.borderRadius = blob(now, amp * 0.7, 0.8 + j * 0.3, j * 2 + 1);
      e.style.transform = 'translate(' + (pp.x - dm / 2) + 'px,' + (pp.y - dm / 2) + 'px)';
    }

    for (var n = parts.length - 1; n >= 0; n--) {
      var r = parts[n];
      r.vy += 0.12 * dt;
      r.vx *= 0.96;
      r.vy *= 0.97;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.life -= 0.018 * dt;
      if (r.life <= 0) { r.el.remove(); parts.splice(n, 1); continue; }
      var w = r.r * 2 * (0.6 + r.life * 0.4);
      r.el.style.opacity = r.life;
      r.el.style.width = w + 'px';
      r.el.style.height = w + 'px';
      r.el.style.transform = 'translate(' + (r.x - w / 2) + 'px,' + (r.y - w / 2) + 'px)';
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
