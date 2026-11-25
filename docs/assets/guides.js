/* Curriculum interaction layer: filtering, verification progress, active TOC, next lesson. */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function progressKey(path) {
    return `bwd-verify:${path.replace(/\/index\.html$/, "/")}`;
  }

  ready(function () {
    const filter = document.querySelector("#gfilter");
    const rows = [...document.querySelectorAll(".row[data-search]")];
    const chips = [...document.querySelectorAll(".stage-chip")];
    const empty = document.querySelector("#filter-empty");
    let stage = "all";

    function applyFilter() {
      const q = (filter?.value || "").trim().toLowerCase();
      let visible = 0;
      rows.forEach(row => {
        const stageMatch = stage === "all" || row.dataset.stage === stage;
        const textMatch = !q || row.dataset.search.includes(q);
        const show = stageMatch && textMatch;
        row.hidden = !show;
        if (show) visible += 1;
      });

      document.querySelectorAll(".catalog-block .rows").forEach(group => {
        const hasVisible = [...group.querySelectorAll(".row")].some(row => !row.hidden);
        group.hidden = !hasVisible;
        let node = group.previousElementSibling;
        if (node?.classList.contains("stage-blurb")) {
          node.hidden = !hasVisible;
          node = node.previousElementSibling;
        }
        if (node?.classList.contains("stage-h")) node.hidden = !hasVisible;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    chips.forEach(chip => chip.addEventListener("click", () => {
      stage = chip.dataset.stageFilter;
      chips.forEach(item => item.classList.toggle("on", item === chip));
      applyFilter();
    }));
    filter?.addEventListener("input", applyFilter);
    document.addEventListener("keydown", event => {
      if (event.key === "/" && filter && !/input|textarea/i.test(document.activeElement.tagName)) {
        event.preventDefault();
        filter.focus();
      }
    });

    rows.forEach(row => {
      try {
        const path = new URL(row.getAttribute("href"), location.href).pathname;
        const saved = JSON.parse(localStorage.getItem(progressKey(path)) || "null");
        if ((saved && saved.complete === true) || (Array.isArray(saved) && saved.length && saved.every(Boolean))) row.classList.add("done");
      } catch (_) {}
    });

    const guide = document.querySelector("article.guide");
    if (guide && !document.querySelector(".curriculum-index")) {
      const firstStrong = guide.querySelector("p strong");
      if (firstStrong && /^(goal|目标|目標|objetivo)[:：]/i.test(firstStrong.textContent.trim())) {
        firstStrong.closest("p").classList.add("lesson-goal");
      }

      const checks = [...guide.querySelectorAll('input[type="checkbox"]')];
      if (checks.length) {
        const key = progressKey(location.pathname);
        let saved = [];
        try {
          const raw = JSON.parse(localStorage.getItem(key) || "[]");
          saved = Array.isArray(raw) ? raw : (Array.isArray(raw?.state) ? raw.state : []);
        } catch (_) {}
        checks.forEach((input, index) => { input.checked = saved[index] === true; });

        const counter = document.createElement("span");
        counter.className = "check-progress";
        const firstList = checks[0].closest("ul,ol");
        firstList?.before(counter);
        const update = () => {
          const state = checks.map(input => input.checked);
          const required = checks.filter(input => input.dataset.optional !== "true");
          const requiredState = required.map(input => input.checked);
          counter.textContent = `${requiredState.filter(Boolean).length}/${requiredState.length}`;
          const complete = requiredState.length > 0 && requiredState.every(Boolean);
          try { localStorage.setItem(key, JSON.stringify({ state, complete })); } catch (_) {}
          if (complete) document.body.classList.add("lesson-complete");
          else document.body.classList.remove("lesson-complete");
        };
        checks.forEach(input => input.addEventListener("change", update));
        update();
      }

      const next = guide.querySelector(".guide-pager .pg-next");
      if (next) {
        const bar = document.createElement("aside");
        bar.className = "lessonbar";
        const title = next.querySelector(".pg-t")?.textContent || next.textContent;
        const label = next.querySelector(".pg-dir")?.textContent || "Next";
        bar.innerHTML = `<div class="lessonbar-inner"><span>${label.replace(/→/g, "").trim()} · ${title}</span><a href="${next.getAttribute("href")}">Continue</a></div>`;
        document.body.appendChild(bar);
        document.body.classList.add("has-lessonbar");
      }

      const tocLinks = [...guide.querySelectorAll(".toc a")];
      if (tocLinks.length && "IntersectionObserver" in window) {
        const targets = tocLinks
          .map(link => [link, document.getElementById(decodeURIComponent(link.hash.slice(1)))])
          .filter(([, target]) => target);
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            tocLinks.forEach(link => link.classList.remove("active"));
            const active = targets.find(([, target]) => target === entry.target)?.[0];
            active?.classList.add("active");
          });
        }, { rootMargin: "-18% 0px -72% 0px" });
        targets.forEach(([, target]) => observer.observe(target));
      }
    }
  });
})();
