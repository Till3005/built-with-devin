/* Scroll choreography + counters + sticky-nav state — devin.ai parity. */
(function () {
  const nav = document.querySelector("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // staggered reveal for sections and their items
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const items = el.matches("section")
        ? el.querySelectorAll(".sec-head,.row,.card,table,.cta-line")
        : [el];
      items.forEach((it, i) => {
        it.classList.add("reveal");
        it.style.transitionDelay = Math.min(i * 60, 420) + "ms";
        requestAnimationFrame(() => requestAnimationFrame(() => it.classList.add("in")));
      });
      io.unobserve(el);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll("section").forEach(s => io.observe(s));

  // animated counters in the hero stat strip
  const cio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      e.target.querySelectorAll(".stat b").forEach(b => {
        const txt = b.textContent.trim();
        const n = parseInt(txt, 10);
        if (!/^\d+$/.test(txt) || isNaN(n)) return;
        const t0 = performance.now(), dur = 1400;
        const step = t => {
          const p = Math.min(1, (t - t0) / dur);
          b.textContent = String(Math.round(n * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.4 });
  const stats = document.querySelector(".stats");
  if (stats) cio.observe(stats);
})();
