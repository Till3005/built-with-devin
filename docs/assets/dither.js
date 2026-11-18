/* 1-bit dither field — official Devin/Cognition marks morphing into the
   Devin Bots "cogs" figurines, behind the hero. Ordered Bayer dithering over
   blended alpha fields; edge-localized warp during morphs, breathing at rest. */
(function () {
  const host = document.querySelector(".hero");
  if (!host) return;
  const cv = document.createElement("canvas");
  cv.id = "dither";
  host.prepend(cv);
  const ctx = cv.getContext("2d");

  const CELL = 3;
  let W = 0, H = 0, img, sprites = [], frame = 0, running = true;

  const B = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,
             60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
             15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v => v / 64);

  const ASSETS = [
    "assets/brand/Devin_Primary_Logo.svg",       // Devin wordmark
    "assets/brand/Cognition_Symbol.svg",          // Cognition cog-mark
    "assets/brand/g01-octagon.webp",              // cogs…
    "assets/brand/p05-gear.webp",
    "assets/brand/p09-squircle.webp",
    "assets/brand/n07-four-lobe-plate.webp",
    "assets/brand/r3-16-trapezoid.webp",
    "assets/brand/Devin_Symbol.svg",              // back to Devin mark
  ];

  function fieldFrom(imgEl, fitW, fitH) {
    const oc = document.createElement("canvas");
    oc.width = W; oc.height = H;
    const o = oc.getContext("2d");
    const iw = imgEl.naturalWidth || imgEl.width, ih = imgEl.naturalHeight || imgEl.height;
    const s = Math.min(fitW / iw, fitH / ih);
    const dw = iw * s, dh = ih * s;
    const x = W * 0.68 - dw / 2, y = H * 0.46 - dh / 2;
    o.drawImage(imgEl, x, y, dw, dh);
    const d = o.getImageData(0, 0, W, H).data;
    const f = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) f[i] = d[i * 4 + 3] / 255;
    return f;
  }

  let maskX = new Float32Array(0);
  function buildMask() {
    maskX = new Float32Array(W);
    for (let x = 0; x < W; x++) {
      const u = x / W;
      maskX[x] = Math.min(1, Math.max(0, (u - 0.30) / 0.25)) *
                 Math.min(1, Math.max(0, (0.99 - u) / 0.12));
    }
  }

  let pending = ASSETS.length, allLoaded = false, imgs = new Array(ASSETS.length);
  function buildSprites() {
    sprites = imgs.map(im => fieldFrom(im, W * 0.56, H * 0.58));
  }
  function resize() {
    const r = host.getBoundingClientRect();
    cv.width = Math.floor(r.width); cv.height = Math.floor(r.height);
    W = Math.max(40, Math.floor(cv.width / CELL));
    H = Math.max(20, Math.floor(cv.height / CELL));
    img = ctx.createImageData(W, H);
    buildMask();
    if (allLoaded) buildSprites();
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const HOLD = 300, MORPH = 140, PERIOD = HOLD + MORPH;

  function tick() {
    if (!running || !allLoaded) { requestAnimationFrame(tick); return; }
    frame++;
    const ph = (frame % PERIOD) / PERIOD;
    const idx = Math.floor(frame / PERIOD) % sprites.length;
    const nxt = (idx + 1) % sprites.length;
    const t = ph < HOLD / PERIOD ? 0 : ease((ph - HOLD / PERIOD) / (MORPH / PERIOD));
    const A = sprites[idx], C = sprites[nxt];
    const d = img.data;
    const tt = frame * 0.012;
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme &&
       matchMedia("(prefers-color-scheme: dark)").matches);
    const pr = dark ? 150 : 110, pg = dark ? 200 : 160, pa = dark ? 78 : 58;

    for (let y = 0; y < H; y++) {
      const edgeY = Math.min(1, Math.min(y / (H * 0.10), (H - y) / (H * 0.10)));
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const blend = A[i] + (C[i] - A[i]) * t;
        const edge = blend * (1 - blend) * 4;
        const warp = Math.sin(x * 0.16 - tt * 1.6) * Math.cos(y * 0.14 + tt * 0.7) * 0.30;
        const breathe = 1 + 0.05 * Math.sin(y * 0.35 - tt * 2.2) + 0.03 * Math.sin(x * 0.11 + tt * 1.3);
        let v = (blend * breathe + warp * edge + Math.sin(x * 0.05 + tt) * 0.03 * edge) * maskX[x] * edgeY;
        const on = v > B[(y % 8) * 8 + (x % 8)];
        const p = i * 4;
        d[p] = pr; d[p + 1] = pg; d[p + 2] = 255;
        d[p + 3] = on ? pa : 0;
      }
    }
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    const oc = tick._oc || (tick._oc = document.createElement("canvas"));
    oc.width = W; oc.height = H;
    oc.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(oc, 0, 0, W, H, 0, 0, cv.width, cv.height);
    requestAnimationFrame(tick);
  }

  ASSETS.forEach((src, i) => {
    const im = new Image();
    im.onload = () => { imgs[i] = im; if (--pending === 0) { allLoaded = true; buildSprites(); } };
    im.src = src;
  });

  new IntersectionObserver(e => { running = e[0].isIntersecting; }).observe(host);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
})();
