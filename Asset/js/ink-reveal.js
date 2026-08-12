/**
 * InkReveal — canvas mask that erodes on pointer movement to reveal content beneath.
 * Vanilla JS port of the React ink-reveal component.
 */
(function (global) {
  function InkReveal(canvas, options) {
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const opts = Object.assign(
      {
        maskColor: [252, 250, 248],
        brushSize: 128,
        lifetime: 600,
        rStart: 10,
        rVary: 0.45,
        stampStep: 10,
        maxStamps: 200,
        segments: 36,
        wobble: [0.14, 0.08, 0.05],
        gradientInnerRadius: 0.2,
        gradientStops: [0.95, 0.88, 0],
      },
      options || {}
    );

    const mc = opts.maskColor;
    const stamps = [];
    let running = false;
    let lastPos = null;
    const dims = { w: 0, h: 0 };

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      dims.w = w;
      dims.h = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(" + mc[0] + "," + mc[1] + "," + mc[2] + ")";
      ctx.fillRect(0, 0, w, h);
    }

    function carveInk(ctx, x, y, r, seed, alpha) {
      const g = ctx.createRadialGradient(
        x,
        y,
        r * opts.gradientInnerRadius,
        x,
        y,
        r
      );
      g.addColorStop(0, "rgba(0,0,0," + opts.gradientStops[0] * alpha + ")");
      g.addColorStop(0.5, "rgba(0,0,0," + opts.gradientStops[1] * alpha + ")");
      g.addColorStop(1, "rgba(0,0,0," + opts.gradientStops[2] * alpha + ")");
      ctx.fillStyle = g;

      ctx.beginPath();
      for (let i = 0; i <= opts.segments; i++) {
        const a = (i / opts.segments) * Math.PI * 2;
        const wob =
          0.78 +
          opts.wobble[0] * Math.sin(a * 3 + seed) +
          opts.wobble[1] * Math.sin(a * 5 + seed * 2.1) +
          opts.wobble[2] * Math.sin(a * 7 + seed * 0.7);
        const px = x + Math.cos(a) * r * wob;
        const py = y + Math.sin(a) * r * wob;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    function addStamp(x, y) {
      if (stamps.length >= opts.maxStamps) stamps.shift();
      stamps.push({
        x: x,
        y: y,
        born: performance.now(),
        seed: Math.random() * Math.PI * 2,
        rmax: opts.brushSize * (1 - opts.rVary + Math.random() * opts.rVary),
      });
    }

    function stampAlong(x, y) {
      if (!lastPos) {
        addStamp(x, y);
      } else {
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / opts.stampStep));
        for (let i = 1; i <= steps; i++) {
          addStamp(lastPos.x + (dx * i) / steps, lastPos.y + (dy * i) / steps);
        }
      }
      lastPos = { x: x, y: y };
    }

    function loop() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = dims.w;
      const h = dims.h;
      const now = performance.now();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(" + mc[0] + "," + mc[1] + "," + mc[2] + ")";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-out";

      for (let i = stamps.length - 1; i >= 0; i--) {
        const t = (now - stamps[i].born) / opts.lifetime;
        if (t >= 1) {
          stamps.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - t, 3);
        const r = opts.rStart + (stamps[i].rmax - opts.rStart) * ease;
        const alpha = 1 - t * t;
        carveInk(ctx, stamps[i].x, stamps[i].y, r, stamps[i].seed, alpha);
      }

      if (stamps.length) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function startLoop() {
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    }

    function getRelativePos(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onPointerEnter(clientX, clientY) {
      const pos = getRelativePos(clientX, clientY);
      lastPos = pos;
      stampAlong(pos.x, pos.y);
      startLoop();
    }

    function onPointerMove(clientX, clientY) {
      const pos = getRelativePos(clientX, clientY);
      stampAlong(pos.x, pos.y);
      startLoop();
    }

    function onPointerLeave() {
      lastPos = null;
    }

    canvas.addEventListener("mouseenter", function (e) {
      onPointerEnter(e.clientX, e.clientY);
    });
    canvas.addEventListener("mousemove", function (e) {
      onPointerMove(e.clientX, e.clientY);
    });
    canvas.addEventListener("mouseleave", onPointerLeave);

    canvas.addEventListener(
      "touchstart",
      function (e) {
        const t = e.touches[0];
        if (!t) return;
        onPointerEnter(t.clientX, t.clientY);
      },
      { passive: true }
    );
    canvas.addEventListener(
      "touchmove",
      function (e) {
        const t = e.touches[0];
        if (!t) return;
        onPointerMove(t.clientX, t.clientY);
      },
      { passive: true }
    );
    canvas.addEventListener("touchend", onPointerLeave);
    canvas.addEventListener("touchcancel", onPointerLeave);

    window.addEventListener("resize", resize);
    resize();

    this.destroy = function () {
      window.removeEventListener("resize", resize);
    };
  }

  global.InkReveal = InkReveal;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-ink-reveal]").forEach(function (canvas) {
      const mask = canvas.dataset.maskColor;
      const options = {};
      if (mask) {
        options.maskColor = mask.split(",").map(Number);
      }
      new InkReveal(canvas, options);
    });
  });
})(window);
