/* 1-bit dither field — scroll-driven morph behind the hero.
   Cognition mark (with live thruster exhaust) → Devin wordmark
   (thinking-animation shimmer) → the Devin Bots "cogs" figurines.
   Ordered Bayer dithering over blended fields; per-stage animations. */
(function () {
  const host = document.querySelector(".hero");
  if (!host) return;
  const cv = document.createElement("canvas");
  cv.id = "dither";
  host.prepend(cv);
  const ctx = cv.getContext("2d");

  const CELL = 2;
  let W = 0, H = 0, img, sprites = [], frame = 0, running = true;

  const B = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,
             60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
             15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v => v / 64);

  // Stage order: Cognition(thruster) → Devin(thinking) → cogs lineup
  const ASSETS = [
    "assets/brand/Cognition_Symbol.svg",
    "assets/brand/Devin_Primary_Logo.svg",
    "assets/brand/g01-octagon.webp",
    "assets/brand/p05-gear.webp",
    "assets/brand/p09-squircle.webp",
    "assets/brand/n07-four-lobe-plate.webp",
    "assets/brand/r3-16-trapezoid.webp",
  ];
  const COG_STAGE = 0, DEVIN_STAGE = 1;

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
    const isRender = /\.webp$/i.test(imgEl.src);
    for (let i = 0; i < W * H; i++) {
      const a = d[i * 4 + 3] / 255;
      if (!isRender) { f[i] = a; continue; }
      const lum = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      f[i] = a * (0.25 + 0.75 * lum);
    }
    return { f, x0: x, y0: y, w: dw, h: dh };
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

  // --- thruster particles (Cognition stage) ---------------------------------
  // Flat-array particle sim: exhaust jets out from the bottom contour of the
  // cog mark — fast dense core, turbulent widening plume, flickering tail.
  const MAXP = 900;
  const px = new Float32Array(MAXP), py = new Float32Array(MAXP),
        pvx = new Float32Array(MAXP), pvy = new Float32Array(MAXP),
        plife = new Float32Array(MAXP), pseed = new Float32Array(MAXP);
  let pcount = 0, emitters = new Int32Array(0), ecount = 0;

  function findEmitters(f) {
    const list = [];
    for (let y = Math.floor(H * 0.3); y < H - 2; y++)
      for (let x = 0; x < W; x++)
        if (f[y * W + x] > 0.5 && f[(y + 1) * W + x] < 0.4 && f[(y + 2) * W + x] < 0.4)
          list.push(y * W + x);
    // bottom contour only: keep the lowest 25% of edge points
    if (list.length) {
      const ys = list.map(i => i / W | 0);
      const ymin = Math.min(...ys), ymax = Math.max(...ys);
      const cut = ymax - (ymax - ymin) * 0.45;
      return new Int32Array(list.filter(i => (i / W | 0) >= cut));
    }
    return new Int32Array(0);
  }

  function stepThruster(field, gain) {
    emitters = emitters.length ? emitters : findEmitters(field);
    // emit
    const want = Math.floor(26 * gain);
    for (let n = 0; n < want && pcount < MAXP; n++) {
      const e = emitters[(Math.random() * ecount) | 0] | 0;
      const i = pcount++;
      px[i] = e % W + Math.random() * 1.5 - 0.75;
      py[i] = (e / W | 0) + Math.random() * 2;
      pvx[i] = (Math.random() - 0.5) * 0.35;
      pvy[i] = 0.9 + Math.random() * 1.6;
      plife[i] = 24 + Math.random() * 40;
      pseed[i] = Math.random() * 6.28;
    }
    // advect + write into field
    for (let i = 0; i < pcount; i++) {
      plife[i]--;
      if (plife[i] <= 0) { // swap-remove
        const j = --pcount;
        px[i] = px[j]; py[i] = py[j]; pvx[i] = pvx[j]; pvy[i] = pvy[j];
        plife[i] = plife[j]; pseed[i] = pseed[j];
        i--; continue;
      }
      const t = frame * 0.09 + pseed[i];
      pvx[i] += Math.sin(t * 1.7 + py[i] * 0.35) * 0.028;        // turbulence
      pvx[i] *= 0.985; pvy[i] *= 0.997;
      px[i] += pvx[i]; py[i] += pvy[i];
      const xi = px[i] | 0, yi = py[i] | 0;
      if (xi < 0 || xi >= W || yi < 0 || yi >= H) continue;
      const age = 1 - plife[i] / 64;
      const flick = 0.55 + 0.45 * Math.sin(t * 3.1 + pseed[i] * 7);
      const v = (1 - age * age) * flick * gain;
      const idx = yi * W + xi;
      if (v > field[idx]) field[idx] = Math.min(1, field[idx] * 0.3 + v);
    }
  }

  let pending = ASSETS.length, allLoaded = false, imgs = new Array(ASSETS.length);
  function buildSprites() {
    sprites = imgs.map(im => fieldFrom(im, W * 0.56, H * 0.58));
    emitters = findEmitters(sprites[COG_STAGE].f);
    ecount = emitters.length;
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

  // scratch field for blend + particles
  let blend = new Float32Array(0);

  // scroll progress: 0 at top → 1 when hero has scrolled ~1.5 heights
  function scrollP() {
    const r = host.getBoundingClientRect();
    const total = r.height * 1.5;
    return Math.min(1, Math.max(0, -r.top / total));
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function tick() {
    if (!running || !allLoaded) { requestAnimationFrame(tick); return; }
    frame++;
    if (blend.length !== W * H) blend = new Float32Array(W * H);

    const N = sprites.length;
    const seg = scrollP() * (N - 1) * 0.9999;
    const idx = Math.floor(seg);
    const t = ease(seg - idx);
    const A = sprites[idx], C = sprites[Math.min(idx + 1, N - 1)];

    const d = img.data;
    const tt = frame * 0.012;
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme &&
       matchMedia("(prefers-color-scheme: dark)").matches);
    const pr = dark ? 150 : 110, pg = dark ? 200 : 160, pa = dark ? 78 : 58;

    // stage weights for per-stage animation
    const cogW = Math.max(0, 1 - seg);                    // Cognition dominance
    const devinW = Math.max(0, 1 - Math.abs(seg - DEVIN_STAGE)); // Devin dominance
    const cx = W * 0.68, cy = H * 0.46;

    // blend fields
    for (let i = 0; i < W * H; i++) blend[i] = A.f[i] + (C.f[i] - A.f[i]) * t;

    // thruster exhaust while the Cognition mark is on screen
    if (cogW > 0.15) stepThruster(blend, Math.min(1, cogW * 1.4));
    else pcount = 0;

    for (let y = 0; y < H; y++) {
      const edgeY = Math.min(1, Math.min(y / (H * 0.10), (H - y) / (H * 0.10)));
      const dy = y - cy;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let v = blend[i];

        // Devin "thinking": rotating angular sweep across the wordmark
        if (devinW > 0.05 && v > 0.05) {
          const ang = Math.atan2(dy, x - cx);
          const sweep = 0.5 + 0.5 * Math.sin(ang * 2 - tt * 5.2);
          const pulse = 0.5 + 0.5 * Math.sin(tt * 2.6);
          v *= (0.55 + 0.75 * sweep * (0.6 + 0.4 * pulse)) * (0.35 + 0.65 * devinW);
        }

        const edge = v * (1 - v) * 4;
        const warp = Math.sin(x * 0.16 - tt * 1.6) * Math.cos(y * 0.14 + tt * 0.7) * 0.22 * Math.min(1, t * 3);
        const breathe = 1 + 0.05 * Math.sin(y * 0.35 - tt * 2.2) + 0.03 * Math.sin(x * 0.11 + tt * 1.3);
        v = (v * breathe + warp * edge) * maskX[x] * edgeY;
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
