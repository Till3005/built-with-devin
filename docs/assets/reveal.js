/* Motion — quiet reveals, counters, Built↔Build crossfade, sliding mode pill. */
(function () {
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- scroll reveal ----------------
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const items = el.matches("section")
        ? el.querySelectorAll(".sec-head,.row,.feat article,table")
        : [el];
      items.forEach((it, i) => {
        it.classList.add("reveal");
        it.style.transitionDelay = Math.min(i * 50, 400) + "ms";
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
    const t0 = performance.now(), dur = REDUCED ? 0 : 1200;
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

  // ---------------- mode pill position ----------------
  const toggle = document.querySelector(".mode-toggle");
  const pill = toggle && toggle.querySelector(".mode-pill");
  function placePill() {
    const on = toggle && toggle.querySelector(".mode-btn.on");
    if (!on || !pill) return;
    pill.style.left = on.offsetLeft + "px";
    pill.style.width = on.offsetWidth + "px";
  }
  placePill();
  window.addEventListener("resize", placePill);

  // ---------------- Built ↔ Build mode switching ----------------
  const MODES = {
    built: {
      eyebrow: "Community registry · unofficial",
      title: "Everything built with Devin, verified.",
      lede: "A living registry of real work: named bot deployments, shipped products, enterprise case studies and the tools around them. Every entry links to a source.",
      stats: [["11", "Bot deployments"], ["33", "Enterprise cases"], ["4", "Shipped products"], ["28", "Tools & integrations"], ["19", "Field reports"]],
      repo: "https://github.com/Till3005/built-with-devin",
      cta: "GitHub",
    },
    build: {
      eyebrow: "The sister repo · 15 field-tested guides",
      title: "Learn to build with Devin.",
      lede: "Every pattern reverse-engineered from a named deployment — the four bot recipes, the platform tracks, and the workflows the numbers came from. In four languages.",
      stats: [["15", "Guides"], ["3", "Tracks"], ["6", "Languages"], ["16", "Official bot templates"], ["40+", "Cookbook recipes"]],
      repo: "https://github.com/Till3005/build-with-devin",
      cta: "Tutorials repo",
    },
  };

  const eyebrowEl = document.getElementById("hero-eyebrow");
  const titleEl = document.getElementById("hero-title");
  const ledeEl = document.getElementById("hero-lede");
  const cta = document.querySelector(".cta");
  const viewBuilt = document.getElementById("view-built");
  const viewBuild = document.getElementById("view-build");

  let mode = "built", switching = false;
  function setMode(next, push) {
    if (next === mode || switching || !MODES[next]) return;
    switching = true;
    mode = next;
    const M = MODES[next];

    toggle.querySelectorAll(".mode-btn").forEach(b => {
      const on = b.dataset.mode === next;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on);
    });
    placePill();

    const outV = next === "build" ? viewBuilt : viewBuild;
    const inV = next === "build" ? viewBuild : viewBuilt;

    const swap = () => {
      eyebrowEl.textContent = M.eyebrow;
      titleEl.textContent = M.title;
      ledeEl.textContent = M.lede;
      statsEl.innerHTML = M.stats.map(([v, l]) =>
        `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");
      cta.href = M.repo;
      cta.textContent = M.cta;

      if (outV) outV.hidden = true;
      if (inV) {
        inV.hidden = false;
        watchSections(inV);
        if (!REDUCED) {
          inV.classList.add("view-in");
          setTimeout(() => inV.classList.remove("view-in"), 550);
        }
      }
      switching = false;
    };

    if (REDUCED) { swap(); }
    else {
      if (outV) outV.classList.add("view-out");
      setTimeout(() => { swap(); if (outV) outV.classList.remove("view-out"); }, 300);
    }

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
})();
