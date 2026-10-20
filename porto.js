/*!
 * Porto — the portfolio mascot.
 *
 * Drop-in: add ONE line before </body> on every page
 *     <script src="porto.js" defer></script>
 * (porto.css and the sprites in Asset/images/porto/ are loaded automatically.)
 *
 * Everything you are likely to edit lives in section 1 (CONFIG) and section 2 (COPY).
 * Porto stays silent until someone clicks him. A click opens a glass chat panel;
 * the replies are quick-reply buttons (no text input).
 * Console helpers while testing:  Porto.reset()  Porto.chaos()  Porto.say("hi")
 */
(function () {
  'use strict';
  if (window.Porto) return;

  /* ═══════════════════════════════════════════════════════════
     1. CONFIG — facts, behaviour, where things live
     ═══════════════════════════════════════════════════════════ */
  const CONFIG = {
    dock: 'right',                 // 'right' | 'left' — which bottom corner Porto sits in
    ball: { desktop: 118, mobile: 88 },   // body size in px
    idleSwapMs: [15000, 20000],    // change expression every 15–20 s while he is idle (silently)
    idleQuipChance: 0.75,          // chance he mutters a small bubble each time his expression changes
    typeMs: 17,                    // typewriter speed per character
    panel: { width: 360, height: 600 },   // glass chat panel size in px (shrinks to fit small screens)

    // The section where Porto runs wild. Matches your green "Beyond the brief" grid.
    zone: {
      selector: '#beyond',
      stickers: '.mat-move',       // the draggable items he is allowed to chase and shove
      cooldownMs: 45000,           // minimum gap between two chaos sessions
      shoves: [5, 7],              // how many things he knocks around per visit
    },

    // ── Facts for the "hiring" Q&A ── leave '' to use the playful "see resume" fallback
    facts: {
      years: '5+ years',           // e.g. '5+ years'
      degree: 'Master\'s In Design', // e.g. 'B.Des in Communication Design, NID'
      workplace: 'American Express Global Business Travel',
      previous: 'GrowthJockey',
      location: 'Himachal Pradesh, India',
      email: 'parulrathore365@gmail.com',
      skills: 'UX & UI design, product strategy, design strategy, prototyping, information architecture, UX writing, system design and analytics dashboards',
    },
    whatsapp: '',                  // e.g. 'https://wa.me/91XXXXXXXXXX' — adds an "Open WhatsApp" button for friends

    links: {                       // pages Porto points people to
      work: 'work.html',
      resume: 'resume.html',
      about: 'know-the-designer.html',
      contactAnchor: '#footer-contact',
    },
  };

  /* ═══════════════════════════════════════════════════════════
     2. COPY — every line Porto says. Edit freely.
     ═══════════════════════════════════════════════════════════ */
  const COPY = {
    intro: [
      'Hi, I\u2019m Porto \u{1F44B} Parul\u2019s unofficial tour guide.',
      'I live down here, so I know where everything is.',
      'So, who\u2019s visiting today?',
    ],
    newChat: 'Fresh start. Who\u2019s visiting?',
    menuHello: 'Welcome back! What would you like to do?',
    who: [
      { v: 'hire',   label: '\u{1F4BC} Here to hire' },
      { v: 'friend', label: '\u{1FAF6} Friend of Parul' },
      { v: 'family', label: '\u{1F3E0} Family' },
      { v: 'wander', label: '\u{1F30D} Just wandering' },
    ],
    skipLine: 'No pressure. I\u2019ll be right here if you need me. \u{1F60C}',
    heroTitle: ['Hi, I\u2019m Porto.', 'Let me show you around.'],
    heroText: 'Ask about Parul\u2019s work and experience, or just hang out. Pick an option and I\u2019ll take it from there.',

    // small hello when a new browsing session starts (new tab / browser reopened)
    hi: {
      first: ['Hi! I\u2019m Porto \u{1F44B} Click me, I don\u2019t bite.', 'Hello, stranger! Welcome in. \u{1F44B}'],
      back: ['Hey, you\u2019re back! \u{1F44B}', 'Welcome back! I kept your spot warm.', 'Oh hi again! Missed me? \u{1F60E}', 'Hi hi! Glad you\u2019re here again.'],
    },

    // small speech bubbles (they never open the chat panel)
    idleQuips: {
      music: ['Currently vibing. Don\u2019t mind me. \u{1F3A7}'],
      phone: ['Just scrolling. Totally research.'],
      tablet: ['Reviewing the Figma files. Looks good.'],
      paint: ['Pixel-perfect or nothing. \u{1F3A8}'],
      noodles: ['Research. Very important research. \u{1F35C}'],
      tea: ['Chai o\u2019clock. Always.'],
      think: ['Is black a color though\u2026'],
      sleepy: ['\u2026just resting my eyes.'],
      pahadi: ['Straight from the mountains \u{1F3D4}\uFE0F'],
      ladder: ['Climbing the design system. One rung at a time.'],
      rain: ['Rain check on productivity \u2614'],
      snow: ['Brrr. Wearing every layer I own.'],
      travel: ['Bags packed. Ideas travel light. \u2708\uFE0F'],
      blanket: ['Five more minutes\u2026'],
    },
    randomQuips: [
      'Is black a color though?',
      'Do you think fish know they\u2019re wet?',
      'Is cereal a soup? Asking for a friend.',
      'I\u2019m 90% dough and 10% opinions.',
      'Psst. The stickers in the green grid are movable. \u{1F440}',
      'Still here. Still round.',
      'Click me if you\u2019re bored. I\u2019m bored.',
      'Do you ever just stare at a loading bar?',
      'Hydrate. Or chai. Chai counts. \u2615',
      'Would a hot dog be a sandwich if you squinted?',
      'I wonder what\u2019s in the footer\u2026',
      'Nobody tell the pixels I\u2019m not aligned to the grid.',
    ],
    chaos: {
      start: ['Ooh, a grid. Nobody look. \u{1F608}', 'Don\u2019t mind me\u2026', 'Time for a tiny rampage.'],
      shoves: ['Oops.', 'Not my fault!', 'Whee!', 'Chaos!', 'It was like that already.', 'Sorry (not sorry)', 'Gravity did it.'],
      done: ['Done. I regret nothing. \u{1F60C}', 'That was therapeutic.', 'Okay, I\u2019m tired. Anyone have chai? \u2615', 'Parul will never know. Shh. \u{1F92B}', 'Everything was like that before. Probably.'],
    },

    hire: {
      hello: 'Lovely to meet you. I’ve put on my tie — this is now a serious conversation. 🤓',
      menu: 'What would you like to know about Parul?',
      more: 'Anything else I can help with?',
      bye: 'Pleasure doing business. The portfolio does the rest. 📎',
      yearsFallback: 'Her resume does the maths better than I do. I only count to “dumpling”. 📄',
      degreeFallback: 'The education details live on her resume. I only hold a degree in being round. 🥟',
    },
    friend: {
      lines: ['Oh. It’s you. 🙄', 'You can give me your feedback on WhatsApp. I’m busy.'],
      rude: 'Love you too. Now shoo.',
      nice: 'Obviously. I’m literally in it.',
      bye: 'Finally. Peace and quiet.',
    },
    wander: {
      hello: 'A stranger! Excellent. I have questions. Weird ones.',
      more: ['Another one?', 'Okay, last one. Promise. (I lie.)', 'You’re good at this.'],
      nudge: 'Three weird answers and counting. Want to see what Parul actually makes?',
      bye: 'Thanks for the company. Come back when you have more opinions about black. 🖤',
    },
  };

  /* Questions for "Just wandering" — [question, pose?, [answer label, Porto's reply]…] */
  const WANDER_QS = [
    { q: 'Do you think black is a color?', pose: 'think', a: [['Yes, obviously', 'Bold. Unshaken confidence. I like it.'], ['Nope', 'So the night sky is just… the absence of opinions?'], ['Depends on the day', 'That’s the correct answer, actually.']] },
    { q: 'Is a hot dog a sandwich?', pose: 'curious', a: [['Yes', 'Controversial. I’ll allow it.'], ['No', 'Finally, a sane person.'], ['Only if toasted', 'Policy-maker energy.']] },
    { q: 'Noodles or rice, forever?', pose: 'noodles', a: [['Noodles', 'A person of culture. 🍜'], ['Rice', 'Dependable. Respect.'], ['Chai only', 'Wow. Okay. Valid.']] },
    { q: 'Do you think fish know they’re wet?', pose: 'think', a: [['No way', 'Imagine being that relaxed.'], ['Probably', 'They’re just too polite to mention it.']] },
    { q: 'One horse-sized duck, or a hundred duck-sized horses?', pose: 'curious', a: [['The big duck', 'Brave. Foolish. Brave.'], ['100 tiny horses', 'Cute last words.'], ['I’d negotiate', 'Diplomat. Someone hire this person.']] },
    { q: 'Is cereal a soup?', pose: 'think', a: [['Obviously', 'Chaos. I love it.'], ['Never', 'Traditionalist. Noted.']] },
    { q: 'Be honest — am I a dumpling, a bun, or a cloud?', pose: 'view-three', a: [['Dumpling', 'Soft, round, full of potential. 🥟'], ['Bun', 'I’ll take it.'], ['A cloud', 'Finally, someone who gets me. ☁️']] },
    { q: 'How many tabs do you have open right now?', pose: 'tablet', a: [['Under 5', 'Liar.'], ['About 20', 'Healthy. Normal. Fine.'], ['I stopped counting', 'Respect. Same.']] },
    { q: 'If your Wi-Fi had a personality, what would it be?', pose: 'phone', a: [['Dramatic', 'Buffering is its love language.'], ['Ghosts me', 'Toxic. Block it.'], ['Reliable', 'Lucky. Seriously.']] },
    { q: 'Is water wet, or does it just make things wet?', pose: 'think', a: [['It’s wet', 'Fine. I’m moving on.'], ['Not wet', 'Whoa. Don’t tell the fish.']] },
    { q: 'Does a Monday know it’s hated?', pose: 'curious', a: [['Yes', 'That explains the attitude.'], ['No', 'Poor thing. Someone should tell it.']] },
    { q: 'Give up chai or Wi-Fi for a week?', pose: 'tea', a: [['Chai', 'Monster.'], ['Wi-Fi', 'Fine. You’re clearly okay.'], ['Neither, I’d cry', 'Honest. I’d cry too.']] },
    { q: 'Do you believe in love at first scroll?', pose: 'curious', a: [['Yes', 'Same. That’s how I met this website.'], ['No', 'Fair. You need at least two scrolls.']] },
  ];

  /* Which expressions he cycles through when idle, by visitor type (weights). */
  const POOLS = {
    default: { idle: 3, music: 2, phone: 2, tablet: 2, paint: 2, noodles: 1.4, tea: 1.4, think: 1.4, curious: 1, sleepy: 1, pahadi: 1, 'view-front': .8, ladder: .7, rain: .7, snow: .7, travel: .7, blanket: .7, wave: .6 },
    hire:    { pro: 3, 'pro-proud': 2, tablet: 1.5, paint: 1.5, phone: 1 },
    friend:  { 'sassy-ipad': 3, 'sassy-cross': 2, phone: 2, music: 1.5, 'view-back': .6 },
    family:  { tea: 2, noodles: 2, sleepy: 1.5, blanket: 1.5, idle: 1, music: 1 },
    wander:  { think: 2, curious: 2, music: 1.5, paint: 1.5, idle: 1, ladder: .7, travel: .7, tablet: 1 },
  };

  /* Sprite sizes, measured in "body widths" so every pose renders at the same scale. */
  const SPRITES = {"blanket":{"w":1.852,"h":1.186},"chaos":{"w":1.406,"h":1.39},"cheer":{"w":1.096,"h":1.345},"curious":{"w":1.106,"h":1.293},"idle":{"w":1.165,"h":1.284},"ladder":{"w":1.444,"h":1.748},"music":{"w":1.247,"h":1.197},"noodles":{"w":1.08,"h":1.347},"pahadi":{"w":1.223,"h":1.455},"paint":{"w":1.4,"h":1.307},"phone":{"w":1.073,"h":1.303},"pro-proud":{"w":1.131,"h":1.467},"pro":{"w":1.069,"h":1.348},"rain":{"w":1.578,"h":1.705},"run1":{"w":1.258,"h":1.403},"run2":{"w":1.411,"h":1.344},"run3":{"w":1.19,"h":1.423},"sassy-cross":{"w":1.11,"h":1.412},"sassy-ipad":{"w":1.369,"h":1.22},"sleepy":{"w":1.056,"h":1.299},"snow":{"w":1.197,"h":1.503},"tablet":{"w":1.08,"h":1.27},"tea":{"w":1.097,"h":1.366},"think":{"w":1.095,"h":1.328},"travel":{"w":1.524,"h":1.486},"view-back":{"w":1.32,"h":1.313},"view-front":{"w":1.343,"h":1.32},"view-three":{"w":1.143,"h":1.343},"wave":{"w":1.288,"h":1.335}};
  const RUN = ['run1', 'run2', 'run3', 'run2'];

  /* ═══════════════════════════════════════════════════════════
     3. HELPERS
     ═══════════════════════════════════════════════════════════ */
  const reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const reduced = () => reduceMQ.matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const weighted = (pool, exclude) => {
    const entries = Object.entries(pool).filter(([k]) => k !== exclude && SPRITES[k]);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) { if ((r -= w) <= 0) return k; }
    return entries[0][0];
  };
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const store = {
    get(k) { try { return sessionStorage.getItem('porto.' + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('porto.' + k, v); } catch (e) { /* private mode */ } },
    del(k) { try { sessionStorage.removeItem('porto.' + k); } catch (e) { /* ignore */ } },
  };

  const scriptEl = document.currentScript || document.querySelector('script[src*="porto.js"]');
  const BASE = new URL('.', scriptEl && scriptEl.src ? scriptEl.src : location.href);
  const ASSET = new URL('Asset/images/porto/', BASE).href;
  const CANCEL = { cancelled: true };

  /* ═══════════════════════════════════════════════════════════
     4. BUILD THE DOM
     ═══════════════════════════════════════════════════════════ */
  const root = el('div', 'porto');
  root.id = 'porto';
  root.setAttribute('role', 'complementary');
  root.setAttribute('aria-label', 'Porto, the portfolio mascot');
  root.style.visibility = 'hidden';

  // small reaction bubble (only used after a direct click, e.g. "I'm back!")
  const bubble = el('div', 'porto-bubble is-tiny');
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  const textEl = el('p', 'porto-text');
  const ghost = el('span', 'porto-ghost'); ghost.setAttribute('aria-hidden', 'true');
  const typed = el('span', 'porto-typed'); typed.setAttribute('aria-hidden', 'true');
  const sr = el('span', 'porto-sr');
  textEl.append(ghost, typed, sr);
  const tail = el('span', 'porto-tail');
  bubble.append(textEl, tail);

  const shadow = el('span', 'porto-shadow');
  const hit = el('button', 'porto-hit'); hit.type = 'button';
  hit.setAttribute('aria-label', 'Talk to Porto');
  hit.setAttribute('aria-haspopup', 'dialog'); hit.setAttribute('aria-expanded', 'false');
  const flip = el('span', 'porto-flip');
  const hop = el('span', 'porto-hop');
  const breathe = el('span', 'porto-breathe');
  hop.appendChild(breathe); flip.appendChild(hop); hit.appendChild(flip);

  // glass chat panel: header, scrolling thread, and a footer where Porto stands (no input field)
  const panel = el('section', 'porto-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat with Porto');
  panel.inert = true;
  const head = el('header', 'porto-head');
  const ava = el('span', 'porto-ava'); ava.style.backgroundImage = 'url(' + ASSET + 'idle.webp?v=1)';
  const idBox = el('div', 'porto-id');
  const idName = el('span', 'porto-id-name'); idName.textContent = 'Porto';
  const idSub = el('span', 'porto-id-sub'); idSub.textContent = 'Portfolio guide';
  idBox.append(idName, idSub);
  const newBtn = el('button', 'porto-pill'); newBtn.type = 'button';
  newBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2.5H4.2A1.7 1.7 0 0 0 2.5 4.2v7.6a1.7 1.7 0 0 0 1.7 1.7h7.6a1.7 1.7 0 0 0 1.7-1.7V9"/><path d="m10.2 2.6 3.2 3.2M13.6 2.4a1.1 1.1 0 0 1 0 1.6L8 9.6 5.6 10.4l.8-2.4 5.6-5.6a1.1 1.1 0 0 1 1.6 0Z"/></svg><span>New chat</span>';
  const closeBtn = el('button', 'porto-round'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m3.5 3.5 9 9m0-9-9 9"/></svg>';
  head.append(ava, idBox, newBtn, closeBtn);
  const thread = el('div', 'porto-thread');
  thread.setAttribute('role', 'log'); thread.setAttribute('aria-live', 'polite'); thread.setAttribute('aria-label', 'Conversation with Porto');
  const hero = el('div', 'porto-hero');
  const heroIco = el('span', 'porto-ava sm'); heroIco.style.backgroundImage = ava.style.backgroundImage;
  const heroH = el('h2', 'porto-hero-h');
  COPY.heroTitle.forEach((line) => { const l = el('span'); l.textContent = line; heroH.appendChild(l); });
  const heroP = el('p', 'porto-hero-p'); heroP.textContent = COPY.heroText;
  hero.append(heroIco, heroH, heroP);
  const foot = el('div', 'porto-foot');
  const footHint = el('span', 'porto-foot-hint'); footHint.textContent = 'Tap Porto to close';
  foot.appendChild(footHint);
  panel.append(head, thread, foot);

  root.append(bubble, shadow, hit, panel);

  const probe = el('div'); // reads the iPhone safe-area inset
  probe.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)';

  /* ═══════════════════════════════════════════════════════════
     5. STATE + LAYOUT
     ═══════════════════════════════════════════════════════════ */
  const S = {
    visitor: store.get('visitor'),   // 'hire' | 'friend' | 'family' | 'wander' | null
    pose: null,
    busy: false,                     // a conversation / quip is on screen
    running: false,                  // he is leaving the dock
    chaos: false,
    minimized: store.get('min') === '1',
    panel: false,                    // chat panel is open
  };
  let vw = 0, vh = 0, ball = 118, W = 236, H = 224;
  const pos = { x: 0, y: 0 };
  const dock = { x: 0, y: 0 };
  let peekY = 0;
  let runToken = 0, flowToken = 0, poseZ = 1;

  function metrics() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    ball = vw <= 700 ? CONFIG.ball.mobile : CONFIG.ball.desktop;
    W = ball * 2; H = ball * 1.9;
    root.style.setProperty('--ball', ball + 'px');
    const safe = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    const edge = vw <= 700 ? 6 : 14;
    dock.x = Math.round(CONFIG.dock === 'left' ? edge - ball * .3 : vw - W - edge + ball * .3);
    dock.y = Math.round(vh - H - 4 - safe);
    peekY = Math.round(dock.y + ball * .55);
  }
  function setPos(x, y) {
    pos.x = x; pos.y = y;
    root.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
  }
  const homePos = () => ({ x: dock.x, y: S.minimized ? peekY : dock.y - (S.panel ? 16 : 0) });

  function glide(tx, ty, ms, ease) {
    const token = ++runToken;
    const fx = pos.x, fy = pos.y;
    return new Promise((res) => {
      if (reduced() || ms <= 0) { setPos(tx, ty); return res(true); }
      const t0 = performance.now();
      const e = ease || ((p) => 1 - Math.pow(1 - p, 3));
      (function step(now) {
        if (token !== runToken) return res(false);
        const p = clamp((now - t0) / ms, 0, 1);
        setPos(fx + (tx - fx) * e(p), fy + (ty - fy) * e(p));
        if (bubble.classList.contains('is-open')) placeBubble();
        if (p < 1) requestAnimationFrame(step); else res(true);
      })(t0);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     6. SPRITES — crossfading poses, hops, breathing
     ═══════════════════════════════════════════════════════════ */
  const layers = {};
  function ensureSprite(name) {
    if (layers[name]) return layers[name];
    const m = SPRITES[name];
    const img = new Image();
    img.className = 'porto-sprite';
    img.alt = ''; img.decoding = 'async'; img.draggable = false;
    img.style.width = 'calc(var(--ball) * ' + m.w + ')';
    img.style.height = 'calc(var(--ball) * ' + m.h + ')';
    img.src = ASSET + name + '.webp?v=1';
    breathe.appendChild(img);
    layers[name] = img;
    return img;
  }
  const warm = (name) => { const i = ensureSprite(name); return i.decode ? i.decode().catch(() => {}) : Promise.resolve(); };
  let curEl = null, poseSeq = 0;

  function showPose(name, instant) {
    const img = layers[name];
    const prev = curEl;
    S.pose = name; curEl = img;
    const m = SPRITES[name];
    root.style.setProperty('--sw', 'calc(var(--ball) * ' + m.w + ')');
    root.style.setProperty('--sh', 'calc(var(--ball) * ' + m.h + ')');
    clearTimeout(img._t);
    img.classList.toggle('instant', !!instant);
    img.style.zIndex = String(++poseZ);
    img.classList.add('is-on');
    if (prev && prev !== img) {
      clearTimeout(prev._t);
      if (instant) { prev.classList.add('instant'); prev.classList.remove('is-on'); }
      else prev._t = setTimeout(() => { prev.classList.add('instant'); prev.classList.remove('is-on'); }, 280);
    }
  }
  /** Smooth pose change: waits until the new image is decoded so it never flashes. */
  async function setPose(name, o) {
    o = o || {};
    if (!SPRITES[name]) name = 'idle';
    if (name === S.pose && curEl) { if (o.hop) doHop(); return; }
    const seq = ++poseSeq;
    const img = ensureSprite(name);
    if (!img.complete || !img.naturalWidth) await warm(name);
    if (seq !== poseSeq) return;          // a newer request replaced this one
    showPose(name, false);
    if (o.hop !== false) doHop();
  }
  /** Instant swap for the run cycle (sprites are pre-decoded before a run starts). */
  function setPoseNow(name) {
    const img = ensureSprite(name);
    if (!img.complete) return;
    poseSeq++;
    showPose(name, true);
  }
  function doHop(strength) {
    if (reduced() || !hop.animate) return;
    const s = strength || 1;
    hop.animate([
      { transform: 'translateY(0) scale(1,1)' },
      { transform: 'translateY(' + (-9 * s).toFixed(1) + 'px) scale(.96,1.05)', offset: .38 },
      { transform: 'translateY(0) scale(1.05,.94)', offset: .7 },
      { transform: 'translateY(0) scale(1,1)' },
    ], { duration: 520, easing: 'cubic-bezier(.25,.8,.35,1)' });
  }
  function wiggle() {
    if (reduced() || !hop.animate) return;
    hop.animate([
      { transform: 'rotate(0)' }, { transform: 'rotate(-3.5deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' },
    ], { duration: 420, easing: 'ease-in-out' });
  }
  function face(dir) { root.style.setProperty('--face', String(dir)); }

  /* ═══════════════════════════════════════════════════════════
     7. REACTION BUBBLE + CHAT PANEL
     ═══════════════════════════════════════════════════════════ */
  function placeBubble() {
    const rr = root.getBoundingClientRect();
    const bw = bubble.offsetWidth;
    const cx = rr.left + rr.width / 2;
    const m = 10;
    let shift = 0;
    if (cx - bw / 2 < m) shift = m - (cx - bw / 2);
    else if (cx + bw / 2 > vw - m) shift = vw - m - (cx + bw / 2);
    bubble.style.setProperty('--shift', shift.toFixed(1) + 'px');
  }
  function showBubble() { placeBubble(); bubble.classList.add('is-open'); }
  function hideBubble() { bubble.classList.remove('is-open'); clearTimeout(tinyTimer); }
  let tinyTimer = 0;
  let skipTyping = false;

  const guard = (t) => { if (t !== flowToken) throw CANCEL; };
  const sleep = (ms, t) => new Promise((res, rej) => setTimeout(() => (t === undefined || t === flowToken) ? res() : rej(CANCEL), ms));

  /** One-off line in the small bubble. Only ever used right after a click. */
  function tiny(text, ms) {
    if (S.panel) return;
    clearTimeout(tinyTimer);
    ghost.textContent = text; sr.textContent = text; typed.textContent = text;
    showBubble();
    tinyTimer = setTimeout(hideBubble, ms || 2400);
  }
  function quip(text, pose, ms) {
    if (S.panel) return;
    if (pose) setPose(pose, { hop: true });
    tiny(text, ms || 2600);
  }

  /* — thread helpers — */
  function scrollThread(instant) {
    requestAnimationFrame(() => thread.scrollTo({ top: thread.scrollHeight, behavior: (instant || reduced()) ? 'auto' : 'smooth' }));
  }
  function resetThread() { thread.replaceChildren(hero); thread.scrollTop = 0; }
  function addMsg(who) {
    const row = el('div', 'porto-msg from-' + who);
    const b = el('div', 'porto-msg-b');
    row.appendChild(b); thread.appendChild(row);
    return { row, b };
  }
  function dotsInto(b) {
    b.classList.add('is-dots'); b.textContent = '';
    for (let i = 0; i < 3; i++) b.appendChild(el('i'));
  }
  /** Reserve the final size of a message (invisible ghost) so it never jumps while it types. */
  function fillMsg(m, text) {
    m.b.classList.remove('is-dots'); m.b.textContent = '';
    const wrap = el('span', 'porto-msg-t');
    const gh = el('span', 'porto-ghost'); gh.setAttribute('aria-hidden', 'true'); gh.textContent = text;
    const ty = el('span', 'porto-typed'); ty.setAttribute('aria-hidden', 'true');
    const s2 = el('span', 'porto-sr'); s2.textContent = text;
    wrap.append(gh, ty, s2); m.b.appendChild(wrap);
    return ty;
  }
  async function typeText(t, target, text) {
    if (reduced()) { target.textContent = text; return; }
    skipTyping = false;
    const chars = Array.from(text);
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      guard(t);
      if (skipTyping) { target.textContent = text; return; }
      out += chars[i];
      target.textContent = out;
      const c = chars[i];
      await sleep(c === ' ' ? CONFIG.typeMs * .5 : /[.!?…]/.test(c) ? CONFIG.typeMs * 4 : /[,—]/.test(c) ? CONFIG.typeMs * 2 : CONFIG.typeMs, t);
    }
  }

  /** Porto says something: typing dots, then the text types out. */
  async function say(t, text, o) {
    o = o || {};
    guard(t);
    if (o.pose) setPose(o.pose, { hop: o.hop });
    const m = addMsg('porto');
    dotsInto(m.b);
    scrollThread();
    await sleep(reduced() ? 0 : clamp(260 + text.length * 4, 320, 680), t);
    const ty = fillMsg(m, text);
    await typeText(t, ty, text);
    const hold = o.hold != null ? o.hold : 380;
    if (hold > 0) await sleep(hold, t);
  }

  let kbd = false;
  root.addEventListener('keydown', () => { kbd = true; }, true);
  root.addEventListener('pointerdown', () => { kbd = false; }, true);

  function makeChip(opt, i) {
    let c;
    if (opt.href) {
      c = el('a', 'porto-chip'); c.href = opt.href;
      if (opt.external) { c.target = '_blank'; c.rel = 'noopener'; }
    } else { c = el('button', 'porto-chip'); c.type = 'button'; }
    if (opt.cls) c.classList.add(...opt.cls.split(' '));
    c.textContent = opt.label;
    c.style.setProperty('--i', String(i));
    return c;
  }

  let pendingAsk = null;
  /** Quick replies under Porto's last message. Resolves with the option the visitor picked. */
  function ask(t, options) {
    guard(t);
    return new Promise((resolve, reject) => {
      const row = el('div', 'porto-choices');
      pendingAsk = { reject: (e) => { row.remove(); reject(e); } };
      options.forEach((opt, i) => {
        const c = makeChip(opt, i);
        c.addEventListener('click', () => {
          pendingAsk = null;
          if (opt.href) {                       // a link: the page / anchor takes over
            if (!opt.external) setTimeout(() => closePanel(), 60);
            return resolve(opt);
          }
          row.remove();
          addMsg('you').b.textContent = opt.label;
          scrollThread();
          resolve(opt);
        });
        row.appendChild(c);
      });
      thread.appendChild(row);
      scrollThread();
      if (kbd) { const f = row.querySelector('.porto-chip'); if (f) f.focus({ preventScroll: true }); }
    });
  }
  const gone = (c) => !c;

  function cancelFlow() {
    flowToken++;
    if (pendingAsk) { const p = pendingAsk; pendingAsk = null; p.reject(CANCEL); }
    S.busy = false;
  }
  function newFlow(fn) {
    cancelFlow();
    const t = flowToken;
    S.busy = true;
    clearTimeout(idleTimer);
    fn(t).catch((e) => { if (e !== CANCEL) console.error('[Porto]', e); })
      .then(() => { if (t === flowToken) { S.busy = false; afterFlow(); } });
  }
  function afterFlow() {
    if (S.panel) return endRow();
    scheduleIdle(); tryChaos();
  }
  /** When a conversation ends, offer to keep going or close. */
  function endRow() {
    const row = el('div', 'porto-choices end');
    const again = makeChip({ label: '↺ Chat again', cls: 'primary' }, 0);
    again.addEventListener('click', () => { row.remove(); addMsg('you').b.textContent = 'Chat again'; newFlow(flowMenu); });
    const close = makeChip({ label: 'Close', cls: 'ghost' }, 1);
    close.addEventListener('click', () => closePanel());
    row.append(again, close);
    thread.appendChild(row);
    scrollThread();
  }

  /* — open / close — */
  function placePanel() {
    const m = vw <= 560 ? 12 : 16;
    const safe = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    const pw = Math.min(CONFIG.panel.width, vw - 2 * m);
    const ph = Math.min(CONFIG.panel.height, vh - 2 * m - safe);
    const left = CONFIG.dock === 'left' ? m - dock.x : vw - m - pw - dock.x;
    panel.style.width = pw + 'px';
    panel.style.left = left.toFixed(1) + 'px';
    panel.style.setProperty('--ph', ph + 'px');
    panel.style.setProperty('--foot', (ball * 1.42).toFixed(0) + 'px');
  }
  function openPanel() {
    S.panel = true; store.set('opened', '1');
    root.classList.remove('is-new'); root.classList.add('is-chat');
    hit.setAttribute('aria-expanded', 'true');
    clearTimeout(idleTimer); hideBubble();
    resetThread(); placePanel();
    panel.inert = false;
    panel.classList.add('is-open');
    const h = homePos(); glide(h.x, h.y, 320);
    newFlow(S.visitor ? flowMenu : flowIntro);
  }
  function closePanel(keepPos) {
    if (!S.panel) return;
    cancelFlow();
    S.panel = false;
    panel.classList.remove('is-open'); panel.inert = true;
    root.classList.remove('is-chat');
    hit.setAttribute('aria-expanded', 'false');
    if (!keepPos) { const h = homePos(); glide(h.x, h.y, 320); }
    if (kbd) hit.focus({ preventScroll: true });
    scheduleIdle(); tryChaos();
  }
  function newChat() {
    if (!S.panel) return;
    cancelFlow(); resetThread();
    newFlow(async (t) => { await flowChoose(t, COPY.newChat); });
  }
  newBtn.addEventListener('click', newChat);
  closeBtn.addEventListener('click', () => closePanel());
  thread.addEventListener('click', (e) => { if (!e.target.closest('.porto-chip')) skipTyping = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.panel) closePanel(); });

  /* ═══════════════════════════════════════════════════════════
     8. CONVERSATIONS
     ═══════════════════════════════════════════════════════════ */
  const mailto = () => 'mailto:' + CONFIG.facts.email;
  const contactHref = () => (document.querySelector(CONFIG.links.contactAnchor) ? CONFIG.links.contactAnchor : mailto());

  async function flowChoose(t, lead) {
    await say(t, lead, { pose: 'curious', hold: 0 });
    const c = await ask(t, COPY.who.concat([{ v: 'skip', label: 'Skip', cls: 'ghost' }]));
    if (gone(c)) return;
    if (c.v === 'skip') { await say(t, COPY.skipLine, { pose: 'idle' }); return; }
    await runVisitor(t, c.v, true);
  }
  async function flowIntro(t) {
    store.set('greeted', '1');
    await say(t, COPY.intro[0], { pose: 'wave' });
    await say(t, COPY.intro[1], { pose: 'idle' });
    await flowChoose(t, COPY.intro[2]);
  }

  async function runVisitor(t, v, first) {
    S.visitor = v; store.set('visitor', v);
    if (v === 'hire') return flowHire(t, first);
    if (v === 'friend') return flowFriend(t, first);
    if (v === 'family') return flowFamily(t, first);
    return flowWander(t, first);
  }

  /* ── Hiring: tie + glasses, quick Q&A ────────────────────── */
  async function flowHire(t, first) {
    const f = CONFIG.facts, L = CONFIG.links, C = COPY.hire;
    if (first) await say(t, C.hello, { pose: 'pro' });
    let prompt = C.menu;
    for (;;) {
      await say(t, prompt, { pose: 'pro', hold: 0, hop: false });
      const c = await ask(t, [
        { v: 'exp', label: 'Experience' },
        { v: 'work', label: 'Where she works' },
        { v: 'edu', label: 'Education' },
        { v: 'skills', label: 'Skills' },
        { v: 'free', label: 'Freelance?' },
        { v: 'where', label: 'Based where?' },
        { v: 'l1', label: 'See her work →', href: L.work, cls: 'primary' },
        { v: 'l2', label: 'Resume', href: L.resume, cls: 'primary' },
        { v: 'l3', label: 'Get in touch', href: contactHref(), cls: 'primary' },
        { v: 'done', label: 'Done', cls: 'ghost' },
      ]);
      if (gone(c)) return;
      if (c.v === 'done' || c.v.charAt(0) === 'l') break;
      let line, pose = 'pro', extra = null;
      if (c.v === 'exp') { line = f.years ? f.years + ' of designing products people actually use. And counting.' : C.yearsFallback; pose = f.years ? 'pro-proud' : 'pro'; if (!f.years) extra = { label: 'Open resume →', href: L.resume, cls: 'primary' }; }
      if (c.v === 'work') { line = 'Currently at ' + f.workplace + ' — redesigning an internal analytics platform without breaking what people already knew. Before that: ' + f.previous + '.'; pose = 'pro-proud'; }
      if (c.v === 'edu') { line = f.degree ? f.degree + '.' : C.degreeFallback; if (!f.degree) extra = { label: 'Open resume →', href: L.resume, cls: 'primary' }; }
      if (c.v === 'skills') { line = f.skills.charAt(0).toUpperCase() + f.skills.slice(1) + '.'; pose = 'tablet'; }
      if (c.v === 'free') { line = 'Yes — she takes on freelance website projects (ask Kargen AI). Email is the fastest way in.'; pose = 'pro-proud'; extra = { label: 'Email her →', href: mailto(), cls: 'primary' }; }
      if (c.v === 'where') { line = f.location + ' 🏔️ — and available worldwide.'; pose = 'pahadi'; }
      await say(t, line, { pose: pose, hold: 0 });
      const n = await ask(t, [extra, { v: 'again', label: 'Another question', cls: extra ? '' : 'primary' }, { v: 'done', label: 'That’s all', cls: 'ghost' }].filter(Boolean));
      if (gone(n) || n.v === 'done') break;
      if (n.v !== 'again') return;       // they followed a link
      prompt = C.more;
    }
    await say(t, C.bye, { pose: 'pro-proud' });
  }

  /* ── Friends: sassy, lying down with the iPad ────────────── */
  async function flowFriend(t, first) {
    const C = COPY.friend;
    await say(t, C.lines[0], { pose: 'sassy-ipad' });
    await say(t, C.lines[1], { pose: 'sassy-ipad', hold: 0, hop: false });
    const opts = [
      { v: 'rude', label: '😤 Rude.' },
      { v: 'nice', label: '✨ Nice site though?' },
    ];
    if (CONFIG.whatsapp) opts.push({ v: 'wa', label: '📱 Open WhatsApp', href: CONFIG.whatsapp, external: true, cls: 'primary' });
    opts.push({ v: 'bye', label: 'Bye', cls: 'ghost' });
    const c = await ask(t, opts);
    if (gone(c) || c.v === 'wa') return;
    if (c.v === 'rude') await say(t, C.rude, { pose: 'sassy-cross' });
    if (c.v === 'nice') { await say(t, C.nice, { pose: 'cheer' }); await sleep(300, t); setPose('sassy-ipad'); }
    if (c.v === 'bye') await say(t, C.bye, { pose: 'view-back' });
  }

  /* ── Family: depends on the visitor's local time ─────────── */
  function dayPart() {
    const h = new Date().getHours();
    if (h >= 22 || h < 5) return 'night';
    if (h < 11) return 'morning';
    if (h < 15) return 'lunch';
    if (h < 19) return 'afternoon';
    return 'evening';
  }
  async function flowFamily(t, first) {
    const part = dayPart();
    const tea = async (open) => {
      await say(t, open, { pose: 'tea', hold: 0 });
      const c = await ask(t, [{ v: 'y', label: '☕ Yes please', cls: 'primary' }, { v: 'n', label: 'No, thanks' }]);
      if (gone(c)) return;
      if (c.v === 'y') { await say(t, 'I’ll have a cup too, thanks.', { pose: 'tea' }); }
      else { await say(t, 'Okay. More for me then. *turns away*', { pose: 'view-back' }); }
    };
    if (part === 'morning') return tea('Good morning! Do you want tea? ☕');
    if (part === 'afternoon') return tea('Do you want tea? ☕ I’m making one anyway.');
    if (part === 'lunch') {
      await say(t, 'Is lunch ready yet? 🍜 I’ve been smelling nothing for an hour.', { pose: 'noodles', hold: 0 });
      const c = await ask(t, [{ v: 'a', label: 'Almost!' }, { v: 'n', label: 'Not yet' }]);
      if (gone(c)) return;
      if (c.v === 'a') await say(t, 'You said that yesterday. Fine. I’ll wait. Dramatically.', { pose: 'sassy-cross' });
      else await say(t, 'Betrayal.', { pose: 'view-back' });
      return;
    }
    if (part === 'evening') {
      await say(t, 'I’ll see you soon upstairs. 👀', { pose: 'curious', hold: 0 });
      const c = await ask(t, [{ v: 'o', label: 'Okay!' }, { v: 'w', label: 'Why?' }]);
      if (gone(c)) return;
      if (c.v === 'o') await say(t, 'Don’t forget dinner. Or me.', { pose: 'cheer' });
      else await say(t, 'Because I said so. Also dinner.', { pose: 'sassy-cross' });
      return;
    }
    await say(t, 'Why are you awake?! Go to sleep. I’m napping. 😴', { pose: 'sleepy', hold: 0 });
    const c = await ask(t, [{ v: 'o', label: 'Okay, okay' }, { v: 'f', label: 'Five more minutes' }]);
    if (gone(c)) return;
    if (c.v === 'o') await say(t, 'Goodnight. Lights off.', { pose: 'blanket' });
    else await say(t, 'That’s what I said. Three hours ago.', { pose: 'blanket' });
  }

  /* ── Random visitors: weird, friendly questions ──────────── */
  async function flowWander(t, first) {
    const C = COPY.wander;
    const order = WANDER_QS.slice().sort(() => Math.random() - .5);
    if (first) await say(t, C.hello, { pose: 'curious' });
    let asked = 0, nudged = false;
    for (let i = 0; i < order.length; i++) {
      const q = order[i];
      await say(t, q.q, { pose: q.pose || 'think', hold: 0 });
      const c = await ask(t, q.a.map((a, k) => ({ v: 'a' + k, label: a[0], reply: a[1] })).concat([{ v: 'skip', label: 'Skip', cls: 'ghost' }]));
      if (gone(c)) return;
      if (c.v !== 'skip') {
        asked++;
        await say(t, c.reply, { pose: pick(['cheer', 'chaos', 'sassy-cross', 'wave', 'curious']) });
      }
      const nudge = asked === 3 && !nudged;
      if (nudge) nudged = true;
      const prompt = nudge ? C.nudge : C.more[Math.max(0, asked - 1) % C.more.length];
      await say(t, prompt, { pose: 'curious', hold: 0, hop: false });
      const opts = [{ v: 'next', label: 'Another one', cls: nudged && asked === 3 ? '' : 'primary' }];
      if (asked >= 3) opts.unshift({ v: 'work', label: 'Show me her work →', href: CONFIG.links.work, cls: 'primary' });
      opts.push({ v: 'done', label: 'I’m done', cls: 'ghost' });
      const n = await ask(t, opts);
      if (gone(n) || n.v === 'work') return;
      if (n.v === 'done') break;
    }
    await say(t, C.bye, { pose: 'wave' });
  }

  /* ── Menu when you click him ─────────────────────────────── */
  async function flowMenu(t) {
    await say(t, COPY.menuHello, { pose: 'wave', hold: 0 });
    const c = await ask(t, [
      { v: 'ask', label: '💬 Ask me stuff', cls: 'primary' },
      { v: 'who', label: '🔄 I’m someone else' },
      { v: 'hide', label: '🤫 Hide Porto', cls: 'ghost' },
    ]);
    if (gone(c)) return;
    if (c.v === 'ask') return runVisitor(t, S.visitor, false);
    if (c.v === 'who') {
      await say(t, 'Ooh, a plot twist. Who are you now?', { pose: 'curious', hold: 0 });
      const w = await ask(t, COPY.who);
      if (gone(w)) return;
      return runVisitor(t, w.v, true);
    }
    if (c.v === 'hide') { await say(t, 'Fine. I’ll be right here. Quietly. 🤐', { pose: 'view-back', hold: 700 }); minimize(); }
  }

  /* ═══════════════════════════════════════════════════════════
     9. IDLE — change expression every ~20 s
     ═══════════════════════════════════════════════════════════ */
  let idleTimer = 0;
  function scheduleIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(idleTick, rand(CONFIG.idleSwapMs[0], CONFIG.idleSwapMs[1]));
  }
  function poolFor() {
    const base = Object.assign({}, POOLS[S.visitor] || POOLS.default);
    const h = new Date().getHours();
    if (h >= 22 || h < 5) { if (base.sleepy) base.sleepy *= 4; if (base.blanket) base.blanket *= 4; }
    return base;
  }
  function idleTick() {
    if (document.hidden || S.busy || S.panel || S.running || S.minimized) return scheduleIdle();
    const next = weighted(poolFor(), S.pose);
    const speak = Math.random() < CONFIG.idleQuipChance;
    const own = COPY.idleQuips[next];
    const lines = (own && Math.random() < .6) ? own : COPY.randomQuips;
    setPose(next, { hop: true }).then(() => {          // speak once the new expression is showing
      if (!speak) return;
      setTimeout(() => {
        if (!S.busy && !S.panel && !S.running && !S.minimized && S.pose === next) tiny(pick(lines), 3400);
      }, 550);
    });
    scheduleIdle();
  }

  /* ═══════════════════════════════════════════════════════════
     10. RUNNING + CHAOS in the grid section
     ═══════════════════════════════════════════════════════════ */
  const bodyCenter = () => ({ x: pos.x + W / 2, y: pos.y + H - ball * .55 });
  const wait = (ms, rt) => new Promise((res) => setTimeout(() => res(rt === runToken), ms));

  async function warmRun() { await Promise.all(RUN.concat(['chaos', 'cheer']).map(warm)); }

  function runTo(tx, ty, rt, speed) {
    speed = speed || ball * 4.4;
    return new Promise((res) => {
      let last = performance.now(), travelled = 0, frame = -1;
      (function step(now) {
        if (rt !== runToken) { hop.style.transform = ''; return res(false); }
        try {
        const dt = clamp((now - last) / 1000, 0, .05); last = now;
        const dx = tx - pos.x, dy = ty - pos.y, dist = Math.hypot(dx, dy);
        if (dist < 1.5) { setPos(tx, ty); hop.style.transform = ''; return res(true); }
        const slow = Math.min(1, .38 + dist / (ball * 1.2));
        const len = Math.min(dist, speed * slow * dt);
        setPos(pos.x + dx / dist * len, pos.y + dy / dist * len);
        travelled += len;
        if (Math.abs(dx) > 2) face(dx < 0 ? -1 : 1);
        const f = ((Math.floor(travelled / (ball * .3)) % 4) + 4) % 4;
        if (f !== frame) { frame = f; setPoseNow(RUN[f]); }
        hop.style.transform = 'translateY(' + (-Math.abs(Math.sin(travelled / (ball * .6) * Math.PI)) * ball * .05).toFixed(1) + 'px)';
        if (bubble.classList.contains('is-open')) placeBubble();
        requestAnimationFrame(step);
        } catch (err) { recover(err); res(false); }
      })(last);
    });
  }

  /* — sticker physics (positions are in the stage's own, unscaled coordinates) — */
  const bodies = new Map();
  const dragging = new Set();
  let physRAF = 0, physLast = 0, stickZ = 300;

  function toBody(node) {
    node.style.left = node.offsetLeft + 'px';
    node.style.top = node.offsetTop + 'px';
    node.style.right = 'auto'; node.style.bottom = 'auto';
    const t0 = node.style.transform || '';
    const m = /rotate\((-?[\d.]+)deg\)/.exec(t0);
    return {
      node, x: node.offsetLeft, y: node.offsetTop, vx: 0, vy: 0, rot: 0, w: 0,
      baseRot: m ? parseFloat(m[1]) : 0,
      other: t0.replace(/rotate\([^)]*\)/, '').trim(),
      noSpin: node.style.transformOrigin === 'top left',   // scaled mobile stickers
      par: node.offsetParent || node.parentElement,
    };
  }
  function launch(node, vx, vy, spin) {
    let b = bodies.get(node);
    if (!b) { b = toBody(node); bodies.set(node, b); }
    b.vx += vx; b.vy += vy; b.w += b.noSpin ? 0 : spin;
    node.style.zIndex = String(++stickZ);
    if (!physRAF) { physLast = performance.now(); physRAF = requestAnimationFrame(physics); }
  }
  function physics(now) {
    const dt = clamp((now - physLast) / 1000, 0, .04); physLast = now;
    const k = Math.exp(-1.9 * dt), kw = Math.exp(-2.4 * dt);
    bodies.forEach((b, node) => {
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.w * dt;
      const maxX = Math.max(0, b.par.offsetWidth - node.offsetWidth);
      const maxY = Math.max(0, b.par.offsetHeight - node.offsetHeight);
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * .55; b.w *= -.6; }
      else if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx) * .55; b.w *= -.6; }
      if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy) * .55; b.w *= -.6; }
      else if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy) * .55; b.w *= -.6; }
      b.vx *= k; b.vy *= k; b.w *= kw;
      node.style.left = b.x.toFixed(1) + 'px';
      node.style.top = b.y.toFixed(1) + 'px';
      if (!b.noSpin) node.style.transform = (b.other + ' rotate(' + (b.baseRot + b.rot).toFixed(1) + 'deg)').trim();
      if (Math.hypot(b.vx, b.vy) < 14 && Math.abs(b.w) < 6) {
        if (!b.noSpin && !b.other) node.dataset.rot = 'rotate(' + (b.baseRot + b.rot).toFixed(1) + 'deg)';
        bodies.delete(node);
      }
    });
    physRAF = bodies.size ? requestAnimationFrame(physics) : 0;
  }
  function stickerSel() { return CONFIG.zone.stickers; }
  const grab = (e) => { const s = e.target.closest && e.target.closest(stickerSel()); if (s) { dragging.add(s); bodies.delete(s); } };
  const release = () => dragging.clear();
  document.addEventListener('mousedown', grab, true);
  document.addEventListener('touchstart', grab, { capture: true, passive: true });
  document.addEventListener('mouseup', release, true);
  document.addEventListener('touchend', release, true);

  const recent = [];
  function chooseSticker() {
    const all = Array.from(document.querySelectorAll(stickerSel()));
    const ok = all.filter((n) => {
      if (dragging.has(n) || recent.indexOf(n) !== -1) return false;
      const r = n.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      return vis > r.width * r.height * .6;
    });
    const n = ok.length ? pick(ok) : null;
    if (n) { recent.push(n); if (recent.length > 3) recent.shift(); }
    return n;
  }
  function rotate(v, a) { return { x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) }; }
  function unit(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }

  function approach(node, rt) {
    const r = node.getBoundingClientRect();
    const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const b = bodyCenter();
    const dir = rotate(unit(c.x - b.x, c.y - b.y), rand(-.6, .6));
    const R = clamp(Math.max(r.width, r.height) * .42, ball * .3, ball * 1.1);
    const tx = clamp(c.x - dir.x * (R + ball * .55) - W / 2, 4, vw - W - 4);
    const ty = clamp(c.y - dir.y * (R + ball * .55) - (H - ball * .55), 6, vh - H - 6);
    return runTo(tx, ty, rt);
  }
  async function shove(node, rt) {
    const r0 = node.getBoundingClientRect();
    face(r0.left + r0.width / 2 < pos.x + W / 2 ? -1 : 1);
    setPoseNow('chaos'); doHop(1.3);
    if (!(await wait(190, rt))) return;
    const r = node.getBoundingClientRect();
    const b = bodyCenter();
    const dir = rotate(unit(r.left + r.width / 2 - b.x, r.top + r.height / 2 - b.y), rand(-.5, .5));
    const stage = node.offsetParent || node.parentElement;
    const sc = stage && stage.offsetWidth ? stage.getBoundingClientRect().width / stage.offsetWidth : 1;
    const speed = rand(760, 1250);
    launch(node, dir.x * speed / sc, dir.y * speed / sc, rand(-460, 460));
    if (Math.random() < .7) tiny(pick(COPY.chaos.shoves), 1100);
  }

  let chaosAbort = false, lastChaosEnd = 0, chaosPending = false;
  /** Whatever goes wrong mid-run, put him back on the dock so he is never stuck. */
  function recover(err) {
    console.error('[Porto]', err);
    runToken++;
    S.chaos = false; S.running = false; chaosAbort = true;
    root.classList.remove('is-running');
    hop.style.transform = '';
    const h = homePos(); setPos(h.x, h.y); face(1);
    lastChaosEnd = Date.now();
    scheduleIdle();
  }
  async function chaos() {
    if (S.chaos || reduced()) return;
    const rt = ++runToken;
    S.chaos = true; S.running = true; chaosAbort = false;
    root.classList.add('is-running');
    clearTimeout(idleTimer); hideBubble();
    await warmRun();
    if (rt !== runToken) return;
    setPoseNow('chaos'); doHop(1.2);
    tiny(pick(COPY.chaos.start), 2000);
    if (!(await wait(1100, rt))) return;
    const count = randInt(CONFIG.zone.shoves[0], CONFIG.zone.shoves[1]);
    for (let i = 0; i < count && !chaosAbort && rt === runToken; i++) {
      const node = chooseSticker();
      if (!node) break;
      if (!(await approach(node, rt))) return;
      if (chaosAbort) break;
      await shove(node, rt);
      if (!(await wait(rand(350, 650), rt))) return;
    }
    await goHome(rt, pick(COPY.chaos.done));
  }
  async function goHome(rt, line) {
    if (rt !== runToken) return;
    const h = homePos();
    if (!(await runTo(h.x, h.y, rt))) return;
    face(1); hop.style.transform = '';
    S.chaos = false; S.running = false; lastChaosEnd = Date.now();
    root.classList.remove('is-running');
    setPoseNow('cheer'); doHop();
    if (line) tiny(line, 3200);
    scheduleIdle();
  }
  function stopChaos(line) {
    chaosAbort = true;
    const rt = ++runToken;
    hideBubble();
    return goHome(rt, line);
  }
  /** Easter egg: poke him six times fast and he does a lap of the screen. */
  async function lap() {
    if (S.panel) closePanel(true);
    cancelFlow(); hideBubble();
    const rt = ++runToken;
    S.running = true; root.classList.add('is-running');
    await warmRun();
    const left = CONFIG.dock === 'left';
    await runTo(left ? vw - W - 6 : 6, dock.y, rt, ball * 6);
    await runTo(dock.x, dock.y, rt, ball * 6);
    if (rt !== runToken) return;
    face(1); hop.style.transform = '';
    S.running = false; root.classList.remove('is-running');
    setPoseNow('cheer'); doHop();
    scheduleIdle();
  }

  /* zone watcher — start the chaos when the grid section scrolls into view */
  let zoneInView = false;
  function tryChaos() {
    if (!zoneInView || S.chaos || S.busy || S.panel || S.minimized || reduced() || chaosPending) return;
    if (Date.now() - lastChaosEnd < CONFIG.zone.cooldownMs) return;
    chaosPending = true;
    setTimeout(() => {
      chaosPending = false;
      if (zoneInView && !S.chaos && !S.busy && !S.panel && !S.minimized && document.hidden !== true) chaos().catch(recover);
    }, 900);
  }
  function watchZone() {
    const zone = document.querySelector(CONFIG.zone.selector);
    if (!zone || !('IntersectionObserver' in window)) return;
    new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      if (e.intersectionRatio >= .35) { zoneInView = true; tryChaos(); }
      else if (e.intersectionRatio < .12) { zoneInView = false; if (S.chaos) chaosAbort = true; }
    }, { threshold: [0, .12, .35, .5] }).observe(zone);
  }

  /* ═══════════════════════════════════════════════════════════
     11. MINIMIZE / POKE / BOOT
     ═══════════════════════════════════════════════════════════ */
  function minimize() {
    cancelFlow(); hideBubble();
    S.minimized = true; store.set('min', '1');
    closePanel(true);
    root.classList.add('is-min');
    hit.setAttribute('aria-label', 'Bring Porto back');
    setPose('idle', { hop: false });
    glide(dock.x, peekY, 450);
  }
  function unminimize() {
    S.minimized = false; store.del('min');
    root.classList.remove('is-min');
    hit.setAttribute('aria-label', 'Talk to Porto');
    glide(dock.x, dock.y, 520, (p) => { const c1 = 1.7; return 1 + (c1 + 1) * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); })
      .then(() => { doHop(1.2); });
  }

  let clicks = [];
  hit.addEventListener('click', () => {
    if (S.minimized) return unminimize();
    if (S.chaos) return stopChaos(null).then(() => { if (!S.panel && !S.running && !S.chaos && !S.minimized) openPanel(); });   // stop the romp, then chat
    if (S.running) return;
    const now = Date.now();
    clicks = clicks.filter((x) => now - x < 3500); clicks.push(now);
    if (clicks.length >= 6) { clicks = []; return lap().catch(recover); }   // easter egg: six fast clicks
    if (S.panel) return closePanel();
    openPanel();
  });
  hit.addEventListener('pointerenter', () => { if (!S.busy && !S.panel && !S.running && !S.minimized) wiggle(); });

  function onResize() {
    metrics();
    if (!S.running) { const h = homePos(); setPos(h.x, h.y); }
    if (bubble.classList.contains('is-open')) placeBubble();
    if (S.panel) placePanel();
  }
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleIdle(); });

  async function boot() {
    document.body.append(root, probe);
    metrics();
    setPos(dock.x, vh + 40);
    await warm('idle');
    showPose('idle', true);
    root.style.visibility = '';
    if (S.minimized) { root.classList.add('is-min'); hit.setAttribute('aria-label', 'Bring Porto back'); }
    else if (!store.get('opened')) root.classList.add('is-new');   // quiet pulse so people know he is clickable
    // slide up from below the fold with a little overshoot
    const h = homePos();
    await glide(h.x, h.y, 800, (p) => { const c1 = 1.5; return 1 + (c1 + 1) * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); });
    doHop(.8);
    if (!S.minimized && !store.get('hi')) {          // new session: wave and say hi once
      store.set('hi', '1');
      let back = false;
      try { back = !!localStorage.getItem('porto.seen'); localStorage.setItem('porto.seen', '1'); } catch (e) { /* storage blocked */ }
      setPose('wave', { hop: false });
      setTimeout(() => { if (!S.busy && !S.panel && !S.running && !S.minimized) tiny(pick(back ? COPY.hi.back : COPY.hi.first), 4200); }, 500);
      setTimeout(() => { if (!S.busy && !S.panel && !S.running && S.pose === 'wave') setPose('idle', { hop: false }); }, 4800);
    }
    watchZone();
    scheduleIdle();
    // preload everything else quietly so crossfades are instant later
    const names = Object.keys(SPRITES);
    const queue = ['wave', 'curious'].concat(names.filter((n) => n !== 'idle' && n !== 'wave' && n !== 'curious'));
    const pump = () => { const n = queue.shift(); if (!n) return; warm(n).then(() => setTimeout(pump, 90)); };
    (window.requestIdleCallback || setTimeout)(() => setTimeout(pump, 400), { timeout: 3000 });

  }

  /* public handles for testing in the console */
  window.Porto = {
    say: (text, pose) => quip(text, pose || null, 3200),   // small reaction bubble
    chaos: () => { zoneInView = true; lastChaosEnd = 0; if (!S.chaos) chaos().catch(recover); },
    lap: () => lap().catch(recover),
    pose: (n) => setPose(n, { hop: true }),
    reset: () => { try { Object.keys(sessionStorage).filter((k) => k.indexOf('porto.') === 0).forEach((k) => sessionStorage.removeItem(k)); } catch (e) { /* ignore */ } S.visitor = null; S.minimized = false; root.classList.remove('is-min'); onResize(); if (S.panel) { cancelFlow(); resetThread(); newFlow(flowIntro); } else openPanel(); },
    open: () => { if (!S.panel && !S.running && !S.minimized) openPanel(); },
    close: () => closePanel(),
    minimize: minimize,
  };

  /* load the stylesheet next to this script, then start */
  function start() {
    const go = () => { boot().catch((e) => console.error('[Porto]', e)); };
    if (document.querySelector('link[href*="porto.css"]')) return go();
    const link = el('link');
    link.rel = 'stylesheet';
    link.href = new URL('porto.css', BASE).href + '?v=1';
    link.onload = go;
    link.onerror = go;
    document.head.appendChild(link);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
