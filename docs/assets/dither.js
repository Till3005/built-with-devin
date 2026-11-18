/* 1-bit dither field — morphs between Devin marks & bot glyphs behind the hero.
   Ordered Bayer dithering over blended luminance fields; drifts on a sine field. */
(function () {
  const host = document.querySelector(".hero");
  if (!host) return;
  const cv = document.createElement("canvas");
  cv.id = "dither";
  host.prepend(cv);
  const ctx = cv.getContext("2d");

  const CELL = 6;                 // CSS px per 1-bit pixel
  let W = 0, H = 0, img, sprites = [], frame = 0, running = true;

  // 8x8 Bayer matrix, normalized
  const B = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,
             60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
             15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v => v / 64);

  /* ---- sprite fields -------------------------------------------------- */
  function blank() { return new Float32Array(W * H); }

  // sample an HTMLCanvas/SVG-drawn shape: draw `fn` into a W×H offscreen
  function fieldFrom(fn) {
    const oc = document.createElement("canvas");
    oc.width = W; oc.height = H;
    const o = oc.getContext("2d");
    o.fillStyle = "#fff";
    fn(o);
    const d = o.getImageData(0, 0, W, H).data;
    const f = blank();
    for (let i = 0; i < W * H; i++) f[i] = d[i * 4 + 3] / 255;
    return f;
  }

  const CX = () => W * 0.66, CY = () => H * 0.46;   // composition anchor, right of center

  function drawSymbol(o) {          // Devin symbol: rounded square + letterform
    const s = Math.min(W, H) * 0.62, x = CX() - s / 2, y = CY() - s / 2;
    o.beginPath();
    o.roundRect(x, y, s, s, s * 0.14);
    o.lineWidth = s * 0.075;
    o.strokeStyle = "#fff"; o.stroke();
    o.fillRect(x + s * 0.30, y + s * 0.30, s * 0.14, s * 0.40);
    o.beginPath();
    o.arc(x + s * 0.62, y + s * 0.5, s * 0.20, -Math.PI / 2, Math.PI / 2);
    o.fill();
  }

  function drawWordmark(o) {        // "DEVIN" wordmark strip
    o.font = `700 ${Math.floor(H * 0.34)}px Skandia, sans-serif`;
    o.textBaseline = "middle"; o.textAlign = "center";
    o.fillText("DEVIN", CX(), CY());
  }

  function drawBot(o) {             // bot head: rounded square, eyes, antenna
    const s = Math.min(W, H) * 0.52, x = CX() - s / 2, y = CY() - s / 2 + s * 0.06;
    o.beginPath(); o.roundRect(x, y, s, s * 0.78, s * 0.20); o.fill();
    const ey = y + s * 0.32, er = s * 0.085;
    o.save(); o.globalCompositeOperation = "destination-out";
    o.beginPath(); o.arc(x + s * 0.32, ey, er, 0, 7); o.arc(x + s * 0.68, ey, er, 0, 7); o.fill();
    o.restore();
    o.fillRect(x + s * 0.48, y - s * 0.22, s * 0.045, s * 0.22);          // antenna
    o.beginPath(); o.arc(x + s * 0.5, y - s * 0.26, s * 0.055, 0, 7); o.fill();
  }

  function drawSwarm(o) {           // bot fleet: 3×3 mini bots + link arcs
    const s = Math.min(W, H) * 0.20, g = s * 1.35;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const x = CX() + i * g - s / 2, y = CY() + j * g - s / 2;
      o.beginPath(); o.roundRect(x, y, s, s * 0.78, s * 0.18); o.fill();
      o.save(); o.globalCompositeOperation = "destination-out";
      o.beginPath(); o.arc(x + s * 0.32, y + s * 0.32, s * 0.08, 0, 7);
      o.arc(x + s * 0.68, y + s * 0.32, s * 0.08, 0, 7); o.fill(); o.restore();
    }
    o.save(); o.globalCompositeOperation = "destination-out";
    o.lineWidth = s * 0.05;
    for (let j = -1; j <= 1; j++) { o.beginPath(); o.moveTo(CX() - g * 0.72, CY() + j * g); o.lineTo(CX() + g * 0.72, CY() + j * g); o.stroke(); }
    o.restore();
  }

  function drawTerminal(o) {        // prompt glyph `>_`
    o.font = `700 ${Math.floor(H * 0.44)}px GeistMono, monospace`;
    o.textBaseline = "middle"; o.textAlign = "center";
    o.fillText(">_", CX(), CY());
  }

  function drawPrNode(o) {          // PR graph: merge node tree
    const s = Math.min(W, H) * 0.10;
    const pts = [[0.5, -0.42], [-0.3, -0.05], [0.3, -0.05], [0, 0.42]];
    o.lineWidth = s * 0.32;
    o.beginPath();
    o.moveTo(CX() + pts[0][0] * H, CY() + pts[0][1] * H);
    o.bezierCurveTo(CX() + pts[0][0] * H, CY(), CX() + pts[3][0] * H, CY(), CX() + pts[3][0] * H, CY() + pts[3][1] * H);
    o.moveTo(CX() + pts[1][0] * H, CY() + pts[1][1] * H);
    o.bezierCurveTo(CX() + pts[1][0] * H, CY() + 0.18 * H, CX() + pts[3][0] * H, CY() + 0.18 * H, CX() + pts[3][0] * H, CY() + pts[3][1] * H);
    o.stroke();
    for (const [px, py] of pts) { o.beginPath(); o.arc(CX() + px * H, CY() + py * H, s * 0.5, 0, 7); o.fill(); }
  }

  /* ---- lifecycle ------------------------------------------------------ */
  function resize() {
    const r = host.getBoundingClientRect();
    cv.width = Math.floor(r.width); cv.height = Math.floor(r.height);
    W = Math.max(40, Math.floor(cv.width / CELL));
    H = Math.max(20, Math.floor(cv.height / CELL));
    img = ctx.createImageData(W, H);
    buildMask();
    sprites = [fieldFrom(drawSymbol), fieldFrom(drawWordmark), fieldFrom(drawBot),
               fieldFrom(drawSwarm), fieldFrom(drawTerminal), fieldFrom(drawPrNode)];
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const HOLD = 260, MORPH = 130;    // frames hold / morph
  const PERIOD = HOLD + MORPH;

  // horizontal mask: fade in from ~30% → 55% across, so text side stays clean
  let maskX = [];
  function buildMask() {
    maskX = new Float32Array(W);
    for (let x = 0; x < W; x++) {
      const u = x / W;
      maskX[x] = Math.min(1, Math.max(0, (u - 0.30) / 0.25)) *
                 Math.min(1, Math.max(0, (0.99 - u) / 0.12));
    }
  }

  function tick() {
    if (!running) return;
    frame++;
    const ph = (frame % PERIOD) / PERIOD;
    const idx = Math.floor(frame / PERIOD) % sprites.length;
    const nxt = (idx + 1) % sprites.length;
    const t = ph < HOLD / PERIOD ? 0 : ease((ph - HOLD / PERIOD) / (MORPH / PERIOD));
    const A = sprites[idx], C = sprites[nxt];
    const d = img.data;
    const tt = frame * 0.012;

    for (let y = 0; y < H; y++) {
      const edgeY = Math.min(1, Math.min(y / (H * 0.10), (H - y) / (H * 0.10)));
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const blend = A[i] + (C[i] - A[i]) * t;
        // warp concentrates at shape boundaries — mid-field edges crawl, empty stays empty
        const edge = blend * (1 - blend) * 4;
        const warp = Math.sin(x * 0.16 - tt * 1.6) * Math.cos(y * 0.14 + tt * 0.7) * 0.30;
        // slow shimmer even at rest — the field breathes
        const breathe = 1 + 0.05 * Math.sin(y * 0.35 - tt * 2.2) + 0.03 * Math.sin(x * 0.11 + tt * 1.3);
        let v = (blend * breathe + warp * edge + Math.sin(x * 0.05 + tt) * 0.03 * edge) * maskX[x] * edgeY;
        const on = v > B[(y % 8) * 8 + (x % 8)];
        const p = i * 4;
        d[p] = 120; d[p + 1] = 170; d[p + 2] = 255;   // accent-blue pixel
        d[p + 3] = on ? 52 : 0;
      }
    }
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    const oc = document.createElement("canvas");
    oc.width = W; oc.height = H;
    oc.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(oc, 0, 0, W, H, 0, 0, cv.width, cv.height);
    requestAnimationFrame(tick);
  }

  // only animate while hero is visible
  new IntersectionObserver(e => {
    const vis = e[0].isIntersecting;
    if (vis && !running) { running = true; requestAnimationFrame(tick); }
    running = vis;
  }).observe(host);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
})();
