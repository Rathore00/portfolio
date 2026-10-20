/*!
 * flora-growth.js
 * Cross-stitched moss, vines and wildflowers that grow in timelapse around a frame, then butterflies take off.
 * Vanilla JS, no dependencies. Three canvases are added next to your frame and move with it:
 *   behind the frame element  <  the frame  <  in front of the frame  <  butterflies
 * Because one canvas sits behind your real frame image, parts of the growth tuck behind the carving by themselves.
 *
 *   const flora = FloraGrowth({
 *     frame: '.frame-img',         // the frame image
 *     picture: '.frame-picture',   // the illustration inside it (never covered)
 *     container: '.frame-stage'    // positioned wrapper around frame + picture (defaults to the frame's parent)
 *   });
 *   flora.replay(); flora.destroy();
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); module.exports.default = module.exports; }
  else root.FloraGrowth = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

/* Generator: returns timed stitched cells. Grid units. Each cell: {x, y, c, t, l, b}
   (t = seconds, l = layer, b = 1 when it belongs on the canvas behind the frame) */
function generate(opts) {
  const gw = opts.gw, gh = opts.gh, F = opts.frame, seed = opts.seed || 7;
  const EX = opts.exclude || [];
  let s = seed >>> 0;
  const rnd = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hash = (x, y) => {
    let h = Math.imul(x * 374761393 + y * 668265263 + seed * 1442695, 1274126177);
    h = h ^ (h >>> 13); h = Math.imul(h, 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.15;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const cells = [];
  let forceBack = null;
  function excluded(x, y) {
    for (const e of EX) {
      if (e.type === 'ell') {
        const dx = (x - e.cx) / e.rx, dy = (y - e.cy) / e.ry;
        if (dx * dx + dy * dy <= 1) return true;
      } else if (e.type === 'rr') {
        if (x < e.x0 || x > e.x1 || y < e.y0 || y > e.y1) continue;
        const dx = Math.max(e.x0 + e.r - x, 0, x - (e.x1 - e.r)), dy = Math.max(e.y0 + e.r - y, 0, y - (e.y1 - e.r));
        if (dx * dx + dy * dy <= e.r * e.r) return true;
      } else if (x >= e.x0 && x <= e.x1 && y >= e.y0 && y <= e.y1) return true;
    }
    return false;
  }
  // Near the frame, some growth is drawn on the canvas BEHIND the frame element so the carving covers it.
  function put(x, y, c, t, l) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= gw || y >= gh || excluded(x, y)) return;
    let b;
    if (forceBack !== null) b = forceBack;
    else { const dd = sd(x, y); b = (dd > -30 && dd < 8 && fbm(x * 0.09 + 30, y * 0.09 + 11) > 0.5) ? 1 : 0; }
    cells.push({ x, y, c, t, l, b });
  }

  // ---- frame geometry
  const cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2;
  const hx = (F.x1 - F.x0) / 2, hy = (F.y1 - F.y0) / 2;
  const sd = (x, y) => {
    const dx = Math.abs(x - cx) - hx, dy = Math.abs(y - cy) - hy;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
  };
  const grad = (x, y) => {
    let gx = (sd(x + 1, y) - sd(x - 1, y)) / 2, gy = (sd(x, y + 1) - sd(x, y - 1)) / 2;
    const l = Math.hypot(gx, gy);
    if (l < 0.05) return { x: 0, y: -1 };
    return { x: gx / l, y: gy / l };
  };
  const W = F.x1 - F.x0, H = F.y1 - F.y0, P = 2 * (W + H);
  function perim(u, inset) {
    let d = ((u % 1) + 1) % 1 * P, x, y;
    if (d < W) { x = F.x0 + d; y = F.y0; }
    else if (d < W + H) { x = F.x1; y = F.y0 + (d - W); }
    else if (d < 2 * W + H) { x = F.x1 - (d - W - H); y = F.y1; }
    else { x = F.x0; y = F.y1 - (d - 2 * W - H); }
    const g = grad(x, y);
    return { x: x - g.x * inset, y: y - g.y * inset };
  }
  const uCorner = [0, W / P, (W + H) / P, (2 * W + H) / P];

  // ---- palettes
  const MOSS = ['#0c2214', '#12301b', '#1a4024', '#235230', '#2f6638', '#3d7d42'];
  const MOSS_TIP = ['#6aa84c', '#86bd55'];
  const TWIG = ['#5a3e24', '#3f2a18', '#7a5632', '#2e2418'];
  const LEAF = ['#123a1f', '#1b4a29', '#256336', '#36804a'];

  const nodes = [], tips = [], specials = [];
  const colonies = [];
  uCorner.forEach((u) => colonies.push({ ...perim(u, 6), R: 34 + rnd() * 12, ts: rnd() * 2 }));
  for (let i = 0; i < 7; i++) colonies.push({ ...perim(rnd(), 6), R: 22 + rnd() * 12, ts: 0.6 + rnd() * 4 });

  function twigAt(x, y, ang, t) {
    put(x, y, pick(TWIG), t, 1);
    if (rnd() < 0.3) put(x - Math.sin(ang), y + Math.cos(ang), pick(TWIG), t + 0.02, 1);
    if (rnd() < 0.05) {
      const bx = x + Math.cos(ang + 1.6) * 2, by = y + Math.sin(ang + 1.6) * 2;
      const col = pick(['#e8749a', '#f6a5bf', '#7a54c8', '#f3efe4', '#e9c46a']);
      put(bx, by, col, t + 0.6, 4); put(bx + 1, by, col, t + 0.65, 4);
    }
  }

  // ---- marked regions: growth appears only inside the shapes the designer drew
  const regions = (opts.regions || []).map((r, i) => ({ ...r, id: i, ts: r.ts !== undefined ? r.ts : 1 + rnd() * 3 }));
  function inPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function inRegion(r, x, y) {
    if (r.type !== 'poly') return true;
    const j = (vnoise(x * 0.22 + r.id * 5, y * 0.22) - 0.5) * 5;
    return inPoly(x + j, y - j * 0.6, r.pts);
  }
  function randIn(r) {
    const xs = r.pts.map((p) => p[0]), ys = r.pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let k = 0; k < 200; k++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (inPoly(x, y, r.pts)) return { x, y };
    }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  }
  function pathVine(r, sx, sy, tx, ty, t0, speed, colR, every) {
    let x = sx, y = sy, ang = Math.atan2(ty - y, tx - x), steps = 0;
    while (steps < 220) {
      if (Math.hypot(tx - x, ty - y) < 2.5) break;
      const want = Math.atan2(ty - y, tx - x);
      const hxv = Math.cos(ang) * 0.8 + Math.cos(want) * 0.2, hyv = Math.sin(ang) * 0.8 + Math.sin(want) * 0.2;
      ang = Math.atan2(hyv, hxv) + (vnoise(x * 0.2 + steps * 0.05 + sx, y * 0.2) - 0.5) * 0.9 + (rnd() - 0.5) * 0.25;
      x += Math.cos(ang); y += Math.sin(ang); steps++;
      if (r.type === 'poly' && !inRegion(r, x, y)) {
        ang = Math.atan2(cyOf(r) - y, cxOf(r) - x); continue;
      }
      const t = t0 + steps * speed;
      twigAt(x, y, ang, t);
      if (steps % (5 + Math.floor(rnd() * 4)) === 0) nodes.push({ x, y, ang, t, depth: 1 });
      if (steps % every === 0 && steps > 3) colonies.push({ x, y, R: colR[0] + rnd() * (colR[1] - colR[0]), ts: t, free: true, reg: r.type === 'poly' ? r.id : -1 });
    }
    tips.push({ x, y, ang, t: t0 + steps * speed, depth: 1 });
  }
  const cxOf = (r) => r.pts.reduce((a, p) => a + p[0], 0) / r.pts.length;
  const cyOf = (r) => r.pts.reduce((a, p) => a + p[1], 0) / r.pts.length;
  const regionFlowers = [];
  regions.forEach((r) => {
    if (r.type === 'poly') {
      for (let i = 0; i < r.seeds; i++) {
        const p = randIn(r);
        colonies.push({ x: p.x, y: p.y, R: 11 + rnd() * 8, ts: r.ts + rnd() * 3.5, free: true, reg: r.id });
      }
      for (let i = 0; i < (r.vines || 0); i++) {
        const a = randIn(r), b = randIn(r);
        pathVine(r, a.x, a.y, b.x, b.y, r.ts + rnd() * 3, 0.05, [4, 7], 8);
      }
      for (let i = 0; i < (r.flowers || 0); i++) {
        const p = randIn(r);
        regionFlowers.push({ x: p.x, y: p.y, t: r.ts + 1.2 + rnd() * 6, reg: r });
      }
    } else {
      r.paths.forEach((p) => pathVine(r, p[0][0], p[0][1], p[1][0], p[1][1], r.ts + rnd() * 1.5, 0.05, r.colR || [3.5, 6], 6));
    }
    (r.special || []).forEach((sp) => specials.push({ ...sp, t: sp.t !== undefined ? sp.t : r.ts + 2 }));
  });

  // ---- layer 0: moss
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const d = sd(x, y);
    const bw = d < -30 || d > 14 ? 0 : (d < -8 ? clamp((d + 30) / 22, 0, 1) : clamp(1 - (d + 8) / 22, 0, 1));
    let best = 0, bt = 99;
    for (const c of colonies) {
      const dist = Math.hypot(x - c.x, y - c.y);
      if (dist >= c.R) continue;
      if (c.reg !== undefined && c.reg >= 0 && !inRegion(regions[c.reg], x, y)) continue;
      const cs = (1 - dist / c.R) * (c.free ? 1 : bw);
      if (cs > best) { best = cs; bt = c.ts + dist * 0.17; }
    }
    if (best <= 0) continue;
    const n = fbm(x * 0.17, y * 0.17);
    const p = Math.min(1, best * 2.3);
    if (p * (0.65 + n) < 0.3 + 0.22 * hash(x, y)) continue;
    const n2 = fbm(x * 0.35 + 9, y * 0.35 + 4);
    let col = MOSS[clamp(Math.floor(n2 * 7.2 - 0.8), 0, MOSS.length - 1)];
    if (hash(x + 5, y + 9) > 0.965) col = pick(MOSS_TIP);
    put(x, y, col, bt + n * 0.9, 0);
  }

  // ---- layer 1/2: frame-hugging vines, leaves
  const STEP = 0.075;
  function vine(x, y, ang, t0, life, target, depth, dirSign, blend0) {
    let steps = 0;
    while (steps < life) {
      const d = sd(x, y), g = grad(x, y);
      const err = d - target;
      let tx = -g.y * dirSign, ty = g.x * dirSign;
      let dx = tx - g.x * err * 0.09, dy = ty - g.y * err * 0.09;
      const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const b = Math.min(0.38, blend0 + steps * 0.02);
      let hxv = Math.cos(ang) * (1 - b) + dx * b, hyv = Math.sin(ang) * (1 - b) + dy * b;
      ang = Math.atan2(hyv, hxv);
      ang += (vnoise(x * 0.12 + depth * 7, steps * 0.06 + depth) - 0.5) * 0.9 + (rnd() - 0.5) * 0.3;
      x += Math.cos(ang); y += Math.sin(ang);
      steps++;
      const t = t0 + steps * STEP;
      twigAt(x, y, ang, t);
      if (steps % (5 + Math.floor(rnd() * 4)) === 0) nodes.push({ x, y, ang, t, depth });
      if (depth < 2 && steps > 12 && rnd() < 0.035) {
        vine(x, y, ang + (rnd() < 0.5 ? 1 : -1) * (0.7 + rnd() * 0.5), t, 18 + Math.floor(rnd() * 32),
          target + (rnd() - 0.5) * 14, depth + 1, rnd() < 0.5 ? 1 : -1, 0.04);
      }
    }
    tips.push({ x, y, ang, t: t0 + steps * STEP, depth });
  }
  const starts = [];
  uCorner.forEach((u) => { starts.push(u + 0.012); starts.push(u - 0.012); });
  for (let i = 0; i < 11; i++) starts.push(rnd());
  starts.forEach((u) => {
    const target = -2 - rnd() * 9;
    const p = perim(u, -target);
    const dirSign = rnd() < 0.5 ? 1 : -1;
    const g = grad(p.x, p.y);
    const ang = Math.atan2(g.x * dirSign, -g.y * dirSign);
    vine(p.x, p.y, ang, 0.3 + rnd() * 3.4, 55 + Math.floor(rnd() * 50), target, 0, dirSign, 0.35);
  });

  function leaf(n) {
    const side = rnd() < 0.5 ? 1 : -1;
    const a = n.ang + side * (1.1 + rnd() * 0.5);
    const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
    const len = 4 + Math.floor(rnd() * 3), col = pick(LEAF);
    for (let k = 1; k <= len; k++) {
      const w = k === 1 || k === len ? 0 : k <= len / 2 ? 1 : (k < len - 1 ? 1 : 0);
      const tt = n.t + 0.15 + k * 0.05;
      for (let o = -w; o <= w; o++) put(n.x + ux * k + px * o, n.y + uy * k + py * o, o === 0 ? LEAF[Math.min(3, LEAF.indexOf(col) + 1)] : col, tt, 2);
    }
  }
  nodes.forEach((n) => { if (rnd() < 0.42) leaf(n); if (rnd() < 0.1) leaf(n); });

  // ---- layer 4: flowers
  const placed = [];
  const free = (x, y, r) => placed.every((p) => Math.hypot(p.x - x, p.y - y) > r);
  const disc = (x, y, rad, fn, tb, dur) => {
    const R = Math.ceil(rad) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const r = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      const col = fn(r, ang, dx, dy);
      if (col) put(x + dx, y + dy, col, tb + (r / rad) * dur + hash(dx + 99, dy + 7) * 0.12, 4);
    }
  };
  function poppy(x, y, tb) {
    const rad = 4.4 + rnd() * 1.6, ph = rnd() * 6;
    disc(x, y, rad, (r, a, dx, dy) => {
      const lim = rad * (0.84 + 0.16 * Math.cos(5 * a + ph));
      if (r > lim) return null;
      if (r < 1.7) return '#170a08';
      if (r < 2.7) return hash(dx + 3, dy) > 0.55 ? '#e9b82e' : '#3a1410';
      if (r > lim - 1.2) return '#a31510';
      return hash(dx, dy + 5) > 0.7 ? '#f2493a' : '#df2a1d';
    }, tb, 1.2);
  }
  function anemone(x, y, tb, rad0) {
    const rad = rad0 || (4.4 + rnd() * 1.6), ph = rnd() * 6;
    disc(x, y, rad, (r, a, dx, dy) => {
      const lim = rad * (0.86 + 0.14 * Math.cos(6 * a + ph));
      if (r > lim) return null;
      if (r < 1.6) return '#24153f';
      if (r < 3) return hash(dx, dy) > 0.6 ? '#e8c35a' : '#2b1a4a';
      if (r > lim - 1.2) return '#1a1f8f';
      return hash(dx + 2, dy) > 0.7 ? '#5766f5' : '#2a38d8';
    }, tb, 1.2);
  }
  function daisy(x, y, tb) {
    const rad = 4.6 + rnd() * 1.2, np = 8 + Math.floor(rnd() * 2), ph = rnd() * 6;
    disc(x, y, rad, (r, a, dx, dy) => {
      if (r < 1.9) return hash(dx, dy) > 0.5 ? '#f2900f' : '#ffc233';
      if (r > rad) return null;
      const pa = ((a + ph) / (Math.PI * 2) * np) % 1, f = Math.abs((pa + 1) % 1 - 0.5);
      const da = (0.5 - f) * (Math.PI * 2 / np);
      if (r * Math.sin(da) > 0.95 + (r - 2) * 0.1) return null;
      return r > rad - 1.4 ? '#cfc7b8' : '#f6f1e6';
    }, tb, 1.0);
  }
  function cream(x, y, tb) {
    const rad = 3.8 + rnd(), ph = rnd() * 6;
    disc(x, y, rad, (r, a, dx, dy) => {
      const lim = rad * (0.85 + 0.15 * Math.cos(6 * a + ph));
      if (r > lim) return null;
      if (r < 1.3) return '#b8762a';
      return r > lim - 1 ? '#d7b255' : (hash(dx, dy) > 0.6 ? '#f9edc0' : '#efd27a');
    }, tb, 0.9);
  }
  function pink(x, y, tb) {
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const ox = x + (rnd() - 0.5) * 9, oy = y + (rnd() - 0.5) * 9, t2 = tb + i * 0.18;
      const c1 = pick(['#ea6f9c', '#f7a8c4']);
      [[0, 0, '#9a2d57'], [1, 0, c1], [-1, 0, c1], [0, 1, c1], [0, -1, c1]].forEach((q, j) => put(ox + q[0], oy + q[1], q[2], t2 + (j ? 0.25 : 0), 4));
      if (rnd() < 0.5) put(ox + 1, oy + 1, '#ea6f9c', t2 + 0.35, 4);
    }
  }
  function lavender(x, y, tb, ang) {
    const ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, len = 9 + Math.floor(rnd() * 4);
    for (let k = 0; k <= len; k++) {
      const tt = tb + k * 0.1;
      if (k < 4) { put(x + ux * k, y + uy * k, '#2f6b34', tt, 3); continue; }
      const col = pick(['#8a5cc4', '#5b3a99', '#b997e6']);
      put(x + ux * k, y + uy * k, col, tt, 4);
      if (k < len - 1) {
        const o = k % 2 ? 1 : -1;
        put(x + ux * k + px * o, y + uy * k + py * o, pick(['#8a5cc4', '#b997e6']), tt + 0.05, 4);
        if (k > 4 && k < len - 2) put(x + ux * k - px * o, y + uy * k - py * o, '#5b3a99', tt + 0.07, 4);
      }
    }
  }
  const kinds = [['poppy', 16], ['anemone', 14], ['daisy', 22], ['lavender', 14], ['pink', 14], ['cream', 10]];
  const kindTotal = kinds.reduce((a, k) => a + k[1], 0);
  const pickKind = () => { let r = rnd() * kindTotal; for (const k of kinds) { if ((r -= k[1]) <= 0) return k[0]; } return 'daisy'; };
  const MAXF = opts.maxFlowers || 120;
  function bloom(n) {
    if (placed.length >= MAXF) return;
    if (!free(n.x, n.y, 8.5)) return;
    const gx = Math.round(n.x), gy = Math.round(n.y);
    if (excluded(gx, gy)) return;
    const g = grad(n.x, n.y);
    const k = pickKind(), tb = n.t + 0.35;
    placed.push({ x: n.x, y: n.y });
    // a flower sits behind the frame only when its centre is clear of the wood, so it peeks out from behind the carving
    forceBack = (Math.abs(sd(gx, gy)) < 10 && rnd() < 0.35) ? 1 : 0;
    put(n.x, n.y, '#3f8a3f', n.t + 0.1, 3);
    if (k === 'poppy') poppy(n.x, n.y, tb);
    else if (k === 'anemone') anemone(n.x, n.y, tb);
    else if (k === 'daisy') daisy(n.x, n.y, tb);
    else if (k === 'cream') cream(n.x, n.y, tb);
    else if (k === 'pink') pink(n.x, n.y, tb);
    else lavender(n.x, n.y, tb, Math.atan2(g.y, g.x) + (rnd() - 0.5) * 0.8);
    forceBack = null;
  }
  specials.forEach((sp) => {
    placed.push({ x: sp.x, y: sp.y });
    forceBack = 0;
    put(sp.x, sp.y, '#3f8a3f', sp.t, 3);
    anemone(sp.x, sp.y, sp.t + 0.3, sp.rad);
    forceBack = null;
  });
  tips.forEach((n) => bloom(n));
  nodes.forEach((n) => { if (rnd() < 0.3) bloom(n); });
  regionFlowers.forEach((n) => { if (!n.reg || n.reg.type !== 'poly' || inRegion(n.reg, n.x, n.y)) bloom(n); });

  let dur = 0;
  cells.forEach((c) => { if (c.t > dur) dur = c.t; });
  cells.sort((a, b) => a.t - b.t || a.l - b.l);
  return { cells, duration: dur + 0.2, flowers: placed.length };
}




  /* ------------------------------------------------------------------ */
  /* Runtime: measures your layout, draws the stitches, plays the timelapse */
  /* ------------------------------------------------------------------ */

  // Patches you marked in the screenshot. Coordinates are relative to the FRAME:
  // [0,0] is its top-left corner and [1,1] its bottom-right, so negative or >1 values sit outside it.
  // Edit or replace these with the `regions` option. Use `debug: true` to see their outlines.
  var REF_FX0 = 77, REF_FY0 = 55, REF_FW = 165, REF_FH = 112;   // frame position in the original 320 x 186 layout
  function ref(pts) { return pts.map(function (p) { return [(p[0] - REF_FX0) / REF_FW, (p[1] - REF_FY0) / REF_FH]; }); }
  function refPt(x, y) { return { x: (x - REF_FX0) / REF_FW, y: (y - REF_FY0) / REF_FH }; }
  var DEFAULT_REGIONS = [
    // up and to the left of the frame, with one big cobalt flower
    { type: 'poly', pts: ref([[0, 22], [20, 28], [73, 34], [73, 83], [35, 81], [18, 72], [6, 52], [0, 34]]), seeds: 16, vines: 4, flowers: 18, ts: 1.5,
      special: [{ x: refPt(53, 66).x, y: refPt(53, 66).y, rad: 7.5 }] },
    // strip up and to the right
    { type: 'poly', pts: ref([[276, 30], [303, 29], [304, 34], [277, 35]]), seeds: 2, flowers: 1, ts: 3 },
    // vine hanging down on the right
    { type: 'vine', paths: [ref([[285, 42], [284, 69]])], ts: 3.5, colR: [3.5, 5.5] },
    // three vines hanging down on the left
    { type: 'vine', paths: [ref([[27, 88], [26, 128]]), ref([[34, 88], [34, 140]]), ref([[40, 88], [40, 131]])], ts: 2.5, colR: [3.5, 5.5] },
    // down and to the right of the frame
    { type: 'poly', pts: ref([[243, 112], [296, 110], [320, 125], [320, 186], [243, 186]]), seeds: 20, vines: 4, flowers: 22, ts: 2 }
  ];

  var BUTTERFLIES = [ // orbit centres and radii are fractions of the container
    { ax: .500, ay: .205, rx: .400, ry: .075, w: .22, ph: 0, sz: 4 },
    { ax: .188, ay: .506, rx: .150, ry: .356, w: .31, ph: 2, sz: 4 },
    { ax: .819, ay: .539, rx: .144, ry: .345, w: .27, ph: 4, sz: 4 },
    { ax: .500, ay: .948, rx: .350, ry: .043, w: .25, ph: 1, sz: 4 },
    { ax: .350, ay: .356, rx: .081, ry: .097, w: .60, ph: 3, sz: 3 },
    { ax: .663, ay: .356, rx: .075, ry: .108, w: .55, ph: 5, sz: 3 },
    { ax: .906, ay: .323, rx: 0, ry: 0, w: 0, ph: 1, sz: 4, perched: true },
    { ax: .750, ay: .744, rx: 0, ry: 0, w: 0, ph: 2, sz: 3, perched: true }
  ];
  var SPRITE = ['dd.....dd', 'dood.dood', 'dooydyood', '.doodood.', '..dd.dd..'];
  var SPRITE_COL = { d: '#2a1608', o: '#f08a1c', y: '#ffc247' };

  function scaleRegions(regs, F) {
    var fw = F.x1 - F.x0, fh = F.y1 - F.y0;
    var X = function (u) { return F.x0 + u * fw; }, Y = function (v) { return F.y0 + v * fh; };
    return regs.map(function (r) {
      var o = {}; for (var k in r) o[k] = r[k];
      if (r.pts) o.pts = r.pts.map(function (p) { return [X(p[0]), Y(p[1])]; });
      if (r.paths) o.paths = r.paths.map(function (path) { return path.map(function (p) { return [X(p[0]), Y(p[1])]; }); });
      if (r.special) o.special = r.special.map(function (s) { return { x: X(s.x), y: Y(s.y), rad: s.rad, t: s.t }; });
      return o;
    });
  }

  function resolve(el, container) {
    if (!el) return [];
    if (typeof el === 'string') return Array.prototype.slice.call(container.querySelectorAll(el));
    if (el.length !== undefined && !el.nodeType) return Array.prototype.concat.apply([], Array.prototype.map.call(el, function (e) { return resolve(e, container); }));
    return [el];
  }
  function one(el, container) { return resolve(el, container)[0] || null; }

  function FloraGrowth(options) {
    var o = Object.assign({
      frame: null,            // the frame image/element (element or selector). Growth is attached to it and moves with it
      container: null,        // positioned element that moves with the frame (default: the frame's parent)
      picture: null,          // the illustration inside the frame. Growth never covers it
      pictureInset: { left: .146, right: .131, top: .185, bottom: .186 }, // used when `picture` is not given: the frame's empty window, as fractions
      avoid: [],              // elements growth must not cover (only needed for things that scroll WITH the frame)
      avoidPad: 1,            // cells of breathing room around avoided elements
      bleed: { left: .5, right: .5, top: .4, bottom: .2 }, // how far growth may spread beyond the frame, in frame widths
      regions: DEFAULT_REGIONS, // patches outside the frame, relative to the frame. [] = only a ring around the frame
      maxFlowers: 95,
      seed: 7,
      speed: 1,
      autoplay: true,
      startOnVisible: true,   // start when the frame scrolls into view
      replayOnEnter: false,   // true = reset when the frame leaves the screen and grow again each time it comes back
      visibleRatio: 0.5,      // how much of the frame must be on screen to start
      butterflies: true,
      cellsAcrossFrame: 165,  // stitch size. Lower number = bigger stitches
      pixelRatio: 1,          // canvas resolution. Keep 1; 2 looks sharper on retina but uses 4x memory
      debug: false,
      onComplete: null
    }, options || {});
    o.bleed = Object.assign({ left: .5, right: .5, top: .4, bottom: .2 }, o.bleed || {});

    var frameEl = typeof o.frame === 'string' ? document.querySelector(o.frame) : o.frame;
    if (!frameEl) throw new Error('FloraGrowth: frame element not found');
    var container = (typeof o.container === 'string' ? document.querySelector(o.container) : o.container) || frameEl.parentElement;
    var pictureEl = typeof o.picture === 'string' ? document.querySelector(o.picture) : o.picture;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

    // stacking: page text < back canvas < frame < front canvas < butterflies
    var fcs = getComputedStyle(frameEl);
    if (fcs.position === 'static') frameEl.style.position = 'relative';
    var frameZ = parseInt(fcs.zIndex, 10);
    if (isNaN(frameZ)) { frameZ = 2; frameEl.style.zIndex = '2'; }
    var zBack = frameZ - 1, zFront = frameZ + 1, zFly = frameZ + 2;

    function mkCanvas(z, label) {
      var c = document.createElement('canvas');
      c.setAttribute('aria-hidden', 'true'); c.dataset.flora = label;
      c.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;image-rendering:pixelated;z-index:' + z;
      container.appendChild(c);
      return c;
    }
    var back = mkCanvas(zBack, 'back'), front = mkCanvas(zFront, 'front'), fly = mkCanvas(zFly, 'fly');
    var bctx = back.getContext('2d'), fctx = front.getContext('2d'), xctx = fly.getContext('2d');

    var cells = [], DUR = 0, idx = 0, now = 0, layerAt = null, GW = 0, GH = 0, cell = 5, cssCell = 5, regionsPx = [];
    var playing = false, started = false, finished = false, raf = 0, last = 0, speed = o.speed, destroyed = false;
    var shade = {};

    function shades(hex) {
      if (shade[hex]) return shade[hex];
      var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16);
      function mix(f, add) { return 'rgb(' + Math.min(255, Math.round(r * f + add)) + ',' + Math.min(255, Math.round(g * f + add)) + ',' + Math.min(255, Math.round(b * f + add)) + ')'; }
      return (shade[hex] = [mix(0.62, 0), hex, mix(1, 38)]);
    }

    var area = { left: 0, top: 0 };
    function build() {
      var cr = container.getBoundingClientRect(), fr = frameEl.getBoundingClientRect();
      var dpr = o.pixelRatio || 1;
      cell = Math.max(2, Math.round(fr.width / o.cellsAcrossFrame * dpr));   // device pixels per stitch
      cssCell = cell / dpr;
      // growth area = the frame plus a margin on every side; the canvases cover exactly this area
      var bl = o.bleed.left * fr.width, br = o.bleed.right * fr.width, bt = o.bleed.top * fr.width, bb = o.bleed.bottom * fr.width;
      area.left = fr.left - bl; area.top = fr.top - bt;
      var aw = fr.width + bl + br, ah = fr.height + bt + bb;
      var offL = area.left - cr.left + container.scrollLeft - container.clientLeft;
      var offT = area.top - cr.top + container.scrollTop - container.clientTop;
      [back, front, fly].forEach(function (c) {
        c.width = Math.round(aw * dpr); c.height = Math.round(ah * dpr);
        c.style.left = offL + 'px'; c.style.top = offT + 'px'; c.style.width = aw + 'px'; c.style.height = ah + 'px';
      });
      GW = Math.ceil(aw / cssCell); GH = Math.ceil(ah / cssCell);
      layerAt = new Int8Array(GW * GH); layerAt.fill(-1);

      var toCells = function (r, pad) {
        pad = pad || 0;
        return { x0: (r.left - area.left) / cssCell - pad, y0: (r.top - area.top) / cssCell - pad, x1: (r.right - area.left) / cssCell + pad, y1: (r.bottom - area.top) / cssCell + pad };
      };
      var frame = toCells(fr);
      var exclude = [];
      if (pictureEl && pictureEl !== frameEl) {
        var p = toCells(pictureEl.getBoundingClientRect());
        exclude.push({ type: 'box', x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1 });
      } else {
        var w = frame.x1 - frame.x0, h = frame.y1 - frame.y0, pi = o.pictureInset;
        exclude.push({ type: 'box', x0: frame.x0 + w * pi.left, y0: frame.y0 + h * pi.top, x1: frame.x1 - w * pi.right, y1: frame.y1 - h * pi.bottom });
      }
      resolve(o.avoid, container).forEach(function (el) {
        var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        var a = toCells(r, o.avoidPad);
        exclude.push({ type: 'rr', x0: a.x0, y0: a.y0, x1: a.x1, y1: a.y1, r: Math.min(a.x1 - a.x0, a.y1 - a.y0) / 2 });
      });
      regionsPx = scaleRegions(o.regions || [], frame);

      var res = generate({ gw: GW, gh: GH, seed: o.seed, frame: frame, exclude: exclude, regions: regionsPx, maxFlowers: o.maxFlowers });
      cells = res.cells; DUR = res.duration;
    }

    function clearAll() {
      bctx.clearRect(0, 0, back.width, back.height); fctx.clearRect(0, 0, front.width, front.height);
      layerAt.fill(-1); idx = 0;
    }
    function drawCell(c) {
      var k = c.y * GW + c.x;
      if (layerAt[k] > c.l) return;
      layerAt[k] = c.l;
      var ctx = c.b ? bctx : fctx, s = shades(c.c), X = c.x * cell, Y = c.y * cell, e = Math.max(1, Math.round(cell * 0.2));
      ctx.fillStyle = s[0]; ctx.fillRect(X, Y, cell, cell);
      ctx.fillStyle = s[1]; ctx.fillRect(X, Y, cell - e, cell - e);
      ctx.fillStyle = s[2]; ctx.fillRect(X + e, Y + e, e * 2, e * 2);
    }
    function renderTo(t) {
      if (t < now) clearAll();
      while (idx < cells.length && cells[idx].t <= t) drawCell(cells[idx++]);
      now = t;
    }

    function drawFly(clock) {
      xctx.clearRect(0, 0, fly.width, fly.height);
      if (o.debug) drawDebug();
      if (!o.butterflies || reduce || now < DUR - 1.5) return;
      var a = Math.min(1, (now - (DUR - 1.5)) / 1.2), Wd = fly.width, Hd = fly.height;
      xctx.globalAlpha = a;
      BUTTERFLIES.forEach(function (b) {
        var x = b.ax * Wd, y = b.ay * Hd, sz = cell * b.sz / 5, flap;
        if (b.perched) flap = 0.55 + 0.45 * Math.abs(Math.sin(clock * 1.6 + b.ph));
        else {
          var q = clock * b.w + b.ph;
          x += b.rx * Wd * Math.sin(q) + cell * 5.2 * Math.sin(q * 5.1);
          y += b.ry * Hd * Math.sin(q * 1.7 + 1) + cell * 2.8 * Math.sin(q * 6.3);
          flap = 0.25 + 0.75 * Math.abs(Math.sin(clock * 13 + b.ph));
        }
        for (var r = 0; r < SPRITE.length; r++) for (var c = 0; c < 9; c++) {
          var ch = SPRITE[r][c]; if (ch === '.') continue;
          xctx.fillStyle = SPRITE_COL[ch];
          xctx.fillRect(Math.round(x + (c - 4) * flap * sz - sz * flap / 2), Math.round(y + r * sz), Math.ceil(sz * Math.max(flap, 0.5)), Math.ceil(sz));
        }
      });
      xctx.globalAlpha = 1;
    }
    function drawDebug() {
      xctx.save(); xctx.strokeStyle = 'rgba(255,0,60,.9)'; xctx.lineWidth = 2; xctx.setLineDash([6, 4]);
      regionsPx.forEach(function (r) {
        var pts = r.pts || (r.paths && [].concat.apply([], r.paths));
        if (!pts) return;
        xctx.beginPath();
        pts.forEach(function (p, i) { var X = p[0] * cell, Y = p[1] * cell; i ? xctx.lineTo(X, Y) : xctx.moveTo(X, Y); });
        if (r.pts) xctx.closePath();
        xctx.stroke();
      });
      xctx.restore();
    }

    function tick(ts) {
      if (destroyed) return;
      raf = requestAnimationFrame(tick);
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts;
      if (playing) {
        var t = now + dt * speed;
        if (t >= DUR) { renderTo(DUR); playing = false; finished = true; if (o.onComplete) o.onComplete(); }
        else renderTo(t);
      }
      if (finished || o.debug) drawFly(ts / 1000);
    }

    function play() { if (finished) { clearAll(); now = 0; finished = false; xctx.clearRect(0, 0, fly.width, fly.height); } playing = true; started = true; }
    function pause() { playing = false; }
    function replay() { clearAll(); now = 0; finished = false; xctx.clearRect(0, 0, fly.width, fly.height); playing = true; started = true; }
    function seek(t) { finished = false; renderTo(Math.max(0, Math.min(DUR, t))); }
    function finish() { renderTo(DUR); playing = false; finished = true; started = true; }

    // rebuild on resize, keeping the current moment
    var rebuildTimer = 0, observers = [];
    function rebuild() {
      var keep = finished ? DUR : now, wasPlaying = playing;
      build(); idx = 0; now = 0; clearAll();
      renderTo(keep >= DUR ? DUR : keep);
      playing = wasPlaying;
    }
    function onResize() { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 200); }
    window.addEventListener('resize', onResize);
    var ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(container); ro.observe(frameEl); }

    function resetState() { clearAll(); now = 0; finished = false; playing = false; started = false; xctx.clearRect(0, 0, fly.width, fly.height); }
    function init() {
      if (destroyed) return;
      build();
      raf = requestAnimationFrame(tick);
      if (reduce) { finish(); return; }
      if (!o.autoplay) return;
      if (o.startOnVisible && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          var e = es[es.length - 1];
          if (e.intersectionRatio >= o.visibleRatio) { if (!started) play(); if (!o.replayOnEnter) io.disconnect(); }
          else if (o.replayOnEnter && e.intersectionRatio === 0 && started) resetState();
        }, { threshold: [0, o.visibleRatio] });
        io.observe(frameEl);
        observers.push(io);
      } else play();
    }
    if (frameEl.tagName === 'IMG' && !frameEl.complete) frameEl.addEventListener('load', init, { once: true });
    else if (document.readyState === 'complete') init();
    else window.addEventListener('load', init, { once: true });

    return {
      play: play, pause: pause, replay: replay, seek: seek, finish: finish,
      get duration() { return DUR; },
      setSpeed: function (s) { speed = s; },
      rebuild: rebuild,
      destroy: function () {
        destroyed = true; cancelAnimationFrame(raf); clearTimeout(rebuildTimer);
        window.removeEventListener('resize', onResize); if (ro) ro.disconnect(); observers.forEach(function (x) { x.disconnect(); });
        [back, front, fly].forEach(function (c) { if (c.parentNode) c.parentNode.removeChild(c); });
      }
    };
  }

  FloraGrowth.DEFAULT_REGIONS = DEFAULT_REGIONS;
  FloraGrowth.generate = generate;
  return FloraGrowth;
});
