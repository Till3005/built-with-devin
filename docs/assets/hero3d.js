/* Hero media — still-life 3D brand mark.
   Cognition symbol (extruded, PBR, studio-lit) dissolves into the Devin
   symbol on scroll, then rests. No rotation, no idle motion — the only
   movement is the scroll-driven morph. Soft natural shadow, transparent
   background so it sits in the page. */
(async function () {
  const panel = document.querySelector(".hero-media .media-panel");
  const hero = document.querySelector(".hero");
  if (!panel || !hero) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const THREE = await import("three");
  const { SVGLoader } = await import("three/addons/loaders/SVGLoader.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  panel.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

  const scene = new THREE.Scene();

  // image-based lighting for realistic sheen
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 200);
  camera.position.set(0, 1.5, 54);
  camera.lookAt(0, 0.5, 0);

  // --- lighting: one soft key that casts the shadow, gentle fills -----------
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(12, 26, 24);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
  fill.position.set(-16, -4, 10); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.7);
  rim.position.set(-10, 14, -20); scene.add(rim);

  const loader = new SVGLoader();
  const loadSvg = url => new Promise((res, rej) => loader.load(url, res, undefined, rej));

  // --- extruded mark ---------------------------------------------------------
  function makeMark(svgData, mat) {
    const inner = new THREE.Group();
    for (const path of svgData.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 7, bevelEnabled: true, bevelThickness: 2.2,
          bevelSize: 1.9, bevelSegments: 5, curveSegments: 32,
        });
        geo.center();
        const mesh = new THREE.Mesh(geo, mat);
        inner.add(mesh);
      }
    }
    const box = new THREE.Box3().setFromObject(inner);
    const size = new THREE.Vector3(); box.getSize(size);
    const c = new THREE.Vector3(); box.getCenter(c);
    inner.position.sub(c);
    const wrap = new THREE.Group();
    wrap.add(inner);
    wrap.scale.setScalar(24 / Math.max(size.x, size.y));
    inner.scale.y *= -1;
    inner.position.y *= -1;
    return wrap;
  }

  const inkMat = () => new THREE.MeshPhysicalMaterial({
    color: 0x14140f, metalness: 0.0, roughness: 0.34,
    clearcoat: 0.55, clearcoatRoughness: 0.28,
    envMapIntensity: 0.85,
  });

  const [cogData, devinData] = await Promise.all([
    loadSvg("assets/brand/Cognition_Symbol.svg"),
    loadSvg("assets/brand/Devin_Symbol.svg"),
  ]);
  // outer groups carry the morph animation so the normalization scale is kept
  const gCog = new THREE.Group(); gCog.add(makeMark(cogData, inkMat()));
  const gDevin = new THREE.Group(); gDevin.add(makeMark(devinData, inkMat()));
  // static slight tilt — reads as a solid object without any motion
  const TILT_Y = 0.38, TILT_X = -0.10;
  scene.add(gCog, gDevin);

  // --- natural soft shadow: blurred silhouette sprite, no shadow-map needed ---
  const aoTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    const rg = g.createRadialGradient(128, 128, 6, 128, 128, 118);
    rg.addColorStop(0, "rgba(0,0,0,.38)"); rg.addColorStop(0.55, "rgba(0,0,0,.16)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const ao = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 34),
    new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
  );
  ao.rotation.x = -Math.PI / 2;
  ao.position.set(2, -16.5, 0);
  scene.add(ao);

  // --- scroll morph: 0 = cognition, 1 = devin ---------------------------------
  function progress() {
    if (REDUCED) return 1;
    const r = hero.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (r.height * 0.8)));
  }
  // smoothstep — slow at both ends, seamless hand-off
  const smooth = t => t * t * (3 - 2 * t);

  function setVis(g, a) {
    g.visible = a > 0.001;
    g.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.opacity = a;
        o.material.transparent = a < 0.999;
        o.material.depthWrite = a >= 0.999;
      }
    });
  }

  function resize() {
    const r = panel.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  // theme retint: near-black on light page, soft porcelain on dark
  function themeMats() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    [gCog, gDevin].forEach(w => w.traverse(o => {
      if (o.isMesh && o.material.clearcoat !== undefined) {
        o.material.color.set(dark ? 0xe8e8e2 : 0x14140f);
        o.material.roughness = dark ? 0.38 : 0.34;
      }
    }));
    ao.material.opacity = dark ? 0.6 : 1.0;
  }
  let running = true, lastP = -1;
  themeMats();
  new MutationObserver(() => { themeMats(); lastP = -1; }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  new IntersectionObserver(e => { running = e[0].isIntersecting; }).observe(panel);

  function frame() {
    requestAnimationFrame(frame);
    if (!running) return;
    const p = smooth(progress());
    if (Math.abs(p - lastP) < 0.0005 && lastP !== -1) return; // static — don't repaint
    lastP = p;

    const aC = 1 - p, aD = p;
    setVis(gCog, aC);
    setVis(gDevin, aD);

    // cognition settles back and down as it dissolves; devin rises into place
    gCog.position.set(0, -4 * p, -10 * p);
    gCog.scale.setScalar(1 - 0.12 * p);
    gCog.rotation.set(TILT_X, TILT_Y, 0);
    gDevin.position.set(0, 4 * (1 - p), 6 * (1 - p));
    gDevin.scale.setScalar(1 - 0.10 * (1 - p));
    gDevin.rotation.set(TILT_X, TILT_Y, 0);

    const top = Math.max(aC, aD);
    ao.material.opacity = (document.documentElement.dataset.theme === "dark" ? 0.6 : 1.0) * top;

    renderer.render(scene, camera);
  }
  frame();
})().catch(err => {
  console.warn("3D hero unavailable:", err);
});
