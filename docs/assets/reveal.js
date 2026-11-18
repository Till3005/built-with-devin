/* Motion system — sticky nav, scroll reveal, counters, mode switching,
   magnetic CTA. Built ↔ Build swap choreographed end-to-end. */
(function () {
  const nav = document.querySelector("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- scroll reveal ----------------
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
  function watchSections(root) {
    (root || document).querySelectorAll("section").forEach(s => io.observe(s));
  }
  watchSections(document);

  // ---------------- counters ----------------
  function countUp(b, n) {
    const t0 = performance.now(), dur = REDUCED ? 0 : 1400;
    const step = t => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      b.textContent = String(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const cio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      e.target.querySelectorAll(".stat b").forEach(b => {
        const txt = b.textContent.trim();
        if (/^\d+$/.test(txt)) countUp(b, parseInt(txt, 10));
      });
    });
  }, { threshold: 0.4 });
  const statsEl = document.getElementById("hero-stats");
  if (statsEl) cio.observe(statsEl);

  // ---------------- word-mask title entrance ----------------
  const titleEl0 = document.getElementById("hero-title");
  if (titleEl0 && !REDUCED) {
    const words = titleEl0.textContent.trim().split(/\s+/);
    titleEl0.innerHTML = words.map((w, i) =>
      `<span class="wm"><i style="--wi:${i}">${w}</i></span>`).join(" ");
  }

  // ---------------- hero parallax + scroll-velocity skew ----------------
  const heroWrap = document.querySelector(".hero .wrap");
  const ditherCv = document.getElementById("dither");
  let lastY = window.scrollY, vel = 0, velSkew = 0;
  function onFrame() {
    const y = window.scrollY;
    vel += (Math.abs(y - lastY) - vel) * 0.08;
    lastY = y;
    if (heroWrap && y < innerHeight * 1.6) {
      heroWrap.style.transform = `translateY(${y * 0.18}px)`;
      if (ditherCv) ditherCv.style.transform = `translateY(${y * 0.42}px)`;
    }
    const target = Math.min(Math.abs(vel) * 0.05, 1.4) * Math.sign(vel || 0);
    velSkew += (target - velSkew) * 0.12;
    document.querySelectorAll(".rows").forEach(r => {
      r.style.transform = Math.abs(velSkew) > 0.02 ? `skewY(${velSkew * 0.6}deg)` : "";
    });
    requestAnimationFrame(onFrame);
  }
  if (!REDUCED) requestAnimationFrame(onFrame);

  // ---------------- Built ↔ Build mode switching ----------------
  const MODES = {
    built: {
      eyebrow: "Community registry · unofficial",
      title: "Everything built with Devin, verified.",
      lede: "A living registry of real work: named bot deployments, shipped products, enterprise case studies and the tools around them. Every entry links to a source — no vaporware, no marketing paraphrase.",
      stats: [["11", "Bot deployments"], ["33", "Enterprise cases"], ["4", "Shipped products"], ["28", "Tools & integrations"], ["19", "Field reports"]],
      repo: "https://github.com/Till3005/built-with-devin",
    },
    build: {
      eyebrow: "The sister repo · 15 field-tested guides",
      title: "Learn to build with Devin.",
      lede: "Every pattern reverse-engineered from a named deployment — the four bot recipes, the platform tracks, and the workflows the numbers came from. In six languages.",
      stats: [["15", "Guides"], ["3", "Tracks"], ["6", "Languages"], ["16", "Official bot templates"], ["40+", "Cookbook recipes"]],
      repo: "https://github.com/Till3005/build-with-devin",
    },
  };

  const hero = document.querySelector(".hero");
  const eyebrowEl = document.getElementById("hero-eyebrow");
  const titleEl = document.getElementById("hero-title");
  const ledeEl = document.getElementById("hero-lede");
  const cta = document.querySelector(".cta");
  const toggle = document.querySelector(".mode-toggle");
  const viewBuilt = document.getElementById("view-built");
  const viewBuild = document.getElementById("view-build");
  if (viewBuilt) viewBuilt.classList.add("view");
  if (viewBuild) viewBuild.classList.add("view");

  // char-scramble the title — award-site staple, original implementation
  const GLYPHS = "abcdefghijklmnopqrstuvwxyz#<>*+~";
  function scramble(el, to) {
    if (REDUCED) { el.textContent = to; return; }
    const from = el.textContent;
    const max = Math.max(from.length, to.length);
    const t0 = performance.now(), dur = 620;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const settled = Math.floor(p * max * 0.85);
      let out = "";
      for (let i = 0; i < to.length; i++) {
        if (i < settled || to[i] === " ") out += to[i];
        else if (i < max * (0.35 + p * 0.65)) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else out += " ";
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to;
    };
    requestAnimationFrame(step);
  }

  let mode = "built", switching = false;
  function setMode(next, push) {
    if (next === mode || switching || !MODES[next]) return;
    switching = true;
    mode = next;
    const M = MODES[next];

    toggle.dataset.active = next;
    document.body.dataset.mode = next;
    toggle.querySelectorAll(".mode-btn").forEach(b => {
      const on = b.dataset.mode === next;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on);
    });

    const outV = next === "build" ? viewBuilt : viewBuild;
    const inV = next === "build" ? viewBuild : viewBuilt;

    // phase 1: accent wipe sweeps in; hero sinks, view leaves
    const wipe = document.getElementById("wipe");
    if (wipe && !REDUCED) { wipe.classList.remove("go"); void wipe.offsetWidth; wipe.classList.add("go"); }
    hero.classList.add("swap");
    if (outV) outV.classList.add("out");
    if (statsEl) statsEl.classList.add("swap");

    setTimeout(() => {
      // phase 2: swap hero copy with scramble, swap stats
      eyebrowEl.textContent = M.eyebrow;
      scramble(titleEl, M.title);
      ledeEl.textContent = M.lede;
      statsEl.innerHTML = M.stats.map(([v, l]) =>
        `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");
      cta.href = M.repo;
      cta.textContent = next === "build" ? "Tutorials repo" : "GitHub";

      if (outV) outV.hidden = true;
      if (inV) {
        inV.hidden = false;
        inV.classList.add("in-pre");
        watchSections(inV);
      }
      hero.classList.remove("swap");
      hero.classList.add("swap-in");
      statsEl.classList.remove("swap");

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (inV) { inV.classList.remove("in-pre"); inV.classList.remove("out"); }
        if (outV) outV.classList.remove("out");
      }));

      setTimeout(() => {
        hero.classList.remove("swap-in");
        switching = false;
      }, 750);
    }, REDUCED ? 0 : 300);

    if (push !== false) {
      const url = new URL(location.href);
      if (next === "build") url.hash = "build"; else url.hash = "";
      history.replaceState(null, "", url);
    }
  }

  if (toggle) {
    toggle.querySelectorAll(".mode-btn").forEach(b =>
      b.addEventListener("click", () => setMode(b.dataset.mode)));
    if (location.hash === "#build") setMode("build", false);
    window.addEventListener("hashchange", () => {
      setMode(location.hash === "#build" ? "build" : "built", false);
    });
  }

  // ---------------- magnetic CTA ----------------
  document.querySelectorAll(".magnet, .mode-btn, #theme-toggle").forEach(el => {
    if (REDUCED) return;
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px,${dy * 0.28}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
})();
