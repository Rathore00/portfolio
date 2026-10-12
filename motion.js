/* Portfolio motion kit: scroll reveal.
   Include once, at the end of <body>:  <script src="motion.js" defer></script>
   - adds .mo-js to <html> (so hidden start states only apply when JS runs)
   - adds .is-in to .mo-reveal, .mo-grow and .mo-line when they scroll into view
   - data-mo-delay="120" staggers; elements inside a [data-mo-stagger] parent
     are staggered automatically (80 ms apart)
   Respects prefers-reduced-motion (everything simply shows). */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = Array.prototype.slice.call(document.querySelectorAll('.mo-reveal, .mo-grow, .mo-line'));
  if (reduce || !('IntersectionObserver' in window)) { return; }   // content stays visible
  root.classList.add('mo-js');

  document.querySelectorAll('[data-mo-stagger]').forEach(function (parent) {
    parent.querySelectorAll('.mo-reveal').forEach(function (el, i) {
      if (!el.hasAttribute('data-mo-delay')) el.setAttribute('data-mo-delay', i * 80);
    });
  });
  targets.forEach(function (el, n) {
    var d = el.getAttribute('data-mo-delay');
    if (d) el.style.setProperty('--mo-d', d + 'ms');
    el.querySelectorAll && el.querySelectorAll('.mo-bar').forEach(function (b, i) { b.style.setProperty('--i', i); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();
