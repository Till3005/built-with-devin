/* Hero media panel — real 3D brand theatre.
   Cognition mark extruded + thruster exhaust → Devin symbol + thinking pips
   → the cogs figurines. Scroll morphs between the three tableaux.
   Three.js r160 via CDN; PBR lighting, soft-shadow look, mouse parallax. */
(async function () {
  const panel = document.querySelector(".hero-media .media-panel");
  const hero = document.querySelector(".hero");
  if (!panel || !hero) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const THREE = await import("three");
  const { SVGLoader } = await import("three/addons/loaders/SVGLoader.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  panel.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 4 / 3, 0.1, 200);
  camera.position.set(0, 0, 52);

  // --- lights: studio key + rim + soft fill ----------------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(14, 22, 30); scene.add(key);
  const rim = new THREE.DirectionalLight(0x78b0ff, 1.1);
  rim.position.set(-18, -6, -14); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(0, -20, 18); scene.add(fill);

  const loader = new SVGLoader();
  const loadSvg = url => new Promise((res, rej) => loader.load(url, res, undefined, rej));

  function extrudeGroup(svgData, scale, depth, mat) {
    const group = new THREE.Group();
    for (const path of svgData.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth, bevelEnabled: true, bevelThickness: depth * 0.35,
          bevelSize: depth * 0.28, bevelSegments: 4, curveSegments: 24,
        });
        geo.center();
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
      }
    }
    // flip SVG's Y-down coords, center bounds, normalize to ~26 units tall
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3(); box.getSize(size);
    const c = new THREE.Vector3(); box.getCenter(c);
    group.position.sub(c);
    const wrap = new THREE.Group();
    wrap.add(group);
    wrap.scale.setScalar(26 / Math.max(size.x, size.y));
    group.scale.y *= -1;
    group.position.y *= -1;
    return wrap;
  }

  const logoMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d0d09, metalness: 0.05, roughness: 0.32,
    clearcoat: 0.6, clearcoatRoughness: 0.25,
  });
  const blueMat = new THREE.MeshPhysicalMaterial({
    color: 0x317cff, metalness: 0.15, roughness: 0.3,
    clearcoat: 0.7, clearcoatRoughness: 0.2,
    emissive: 0x0a2a66, emissiveIntensity: 0.25,
  });

  // --- tableau 1: Cognition mark + thruster exhaust ---------------------------
  const cogData = await loadSvg("assets/brand/Cognition_Symbol.svg");
  const cogWrap = extrudeGroup(cogData, 1, 7, logoMat.clone());
  const gCog = new THREE.Group(); gCog.add(cogWrap); scene.add(gCog);

  const P = 700;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P * 3), pVel = new Float32Array(P * 3), pLife = new Float32Array(P);
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x317cff, size: 0.8, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  gCog.add(points);
  let pi = 0;
  function emitJet() {
    const n = 14;
    for (let k = 0; k < n; k++) {
      const i = pi = (pi + 1) % P;
      pPos[i * 3] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 1] = -13.0;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      pVel[i * 3] = (Math.random() - 0.5) * 0.12;
      pVel[i * 3 + 1] = -(0.34 + Math.random() * 0.55);
      pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
      pLife[i] = 40 + Math.random() * 55;
    }
  }

  // --- tableau 2: Devin symbol + three thinking pips --------------------------
  const devinData = await loadSvg("assets/brand/Devin_Symbol.svg");
  const devinWrap = extrudeGroup(devinData, 1, 7, logoMat.clone());
  const gDevin = new THREE.Group(); gDevin.add(devinWrap);
  const pipGeo = new THREE.SphereGeometry(1.15, 24, 24);
  const pips = [0, 1, 2].map(() => new THREE.Mesh(pipGeo, blueMat));
  pips.forEach(p => gDevin.add(p));
  scene.add(gDevin);
  const VX = [-0.204, -0.204, 0.204], VY = [0.236, -0.236, 0.0];

  // --- tableau 3: cogs lineup (textured cards with real renders) --------------
  const gCogs = new THREE.Group(); scene.add(gCogs);
  const texLoader = new THREE.TextureLoader();
  const cogFiles = ["g01-octagon.webp", "p05-gear.webp", "p09-squircle.webp",
                    "n07-four-lobe-plate.webp", "r3-16-trapezoid.webp"];
  const cogMeshes = [];
  cogFiles.forEach((f, i) => {
    const tex = texLoader.load("assets/brand/" + f);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 11.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.08 })
    );
    const u = i - 2;
    m.position.set(u * 10.5, Math.sin(i * 2.1) * 2.2, -Math.abs(u) * 3.5);
    m.rotation.y = -u * 0.18;
    m.userData = { u, baseY: m.position.y };
    cogMeshes.push(m); gCogs.add(m);
  });

  // --- soft ground shadow -----------------------------------------------------
  const shadowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const rg = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    rg.addColorStop(0, "rgba(0,0,0,.34)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 20),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2.6;
  shadow.position.set(0, -15.5, 2);
  scene.add(shadow);

  // --- tableaux bookkeeping ----------------------------------------------------
  const stages = [gCog, gDevin, gCogs];
  function setStageVis() {
    stages.forEach(g => g.visible = true); // alpha handled per-material below
  }

  // scroll progress across the hero
  function scrollP() {
    const r = hero.getBoundingClientRect();
    const total = r.height * 0.95;
    return Math.min(1, Math.max(0, -r.top / total));
  }
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // stage param: 0 cog, 1 devin, 2 cogs — remap scroll through 7 sprites as 3 stops
  function stageT() {
    const p = scrollP();
    return Math.min(2, p * 2.9999);
  }

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function setGroupOpacity(g, a) {
    g.visible = a > 0.01;
    g.traverse(o => {
      if (o.material) { o.material.transparent = true; o.material.opacity = a * (o.userData.o ?? 1); }
    });
    g.scale.setScalar(0.85 + 0.15 * a);
  }

  function resize() {
    const r = panel.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  // dark-mode material retint
  function themeMats() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    [cogWrap, devinWrap].forEach(w => w.traverse(o => {
      if (o.material && o.material.clearcoat !== undefined) o.material.color.set(dark ? 0xf0f0f0 : 0x0d0d09);
    }));
    pMat.color.set(dark ? 0x49b0ff : 0x317cff);
  }
  themeMats();
  new MutationObserver(themeMats).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let t = 0, running = true;
  new IntersectionObserver(e => { running = e[0].isIntersecting; }).observe(panel);

  function frame() {
    requestAnimationFrame(frame);
    if (!running) return;
    t += REDUCED ? 0.004 : 0.016;
    tx += (mx - tx) * 0.06; ty += (my - ty) * 0.06;

    const st = stageT();
    const wCog = Math.max(0, 1 - Math.abs(st - 0));
    const wDev = Math.max(0, 1 - Math.abs(st - 1));
    const wCogs = Math.max(0, 1 - Math.abs(st - 2));
    const ec = ease(wCog), ed = ease(wDev), eg = ease(wCogs);

    // Cognition: gentle float + slow turn; thruster jet
    gCog.rotation.y = t * 0.28 + tx * 0.3;
    gCog.rotation.x = Math.sin(t * 0.4) * 0.06 + ty * 0.15;
    gCog.position.y = Math.sin(t * 0.9) * 0.8;
    setGroupOpacity(gCog, ec);
    if (ec > 0.1 && !REDUCED) emitJet();
    for (let i = 0; i < P; i++) {
      if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; }
      pLife[i]--;
      pVel[i * 3] += Math.sin(t * 3 + pPos[i * 3 + 1]) * 0.004;
      pPos[i * 3] += pVel[i * 3]; pPos[i * 3 + 1] += pVel[i * 3 + 1]; pPos[i * 3 + 2] += pVel[i * 3 + 2];
    }
    pGeo.attributes.position.needsUpdate = true;
    pMat.opacity = ec * 0.85;

    // Devin: mark + 3 pips on the real thinking trajectory (triangular orbit)
    gDevin.rotation.y = t * 0.28 + tx * 0.3;
    gDevin.rotation.x = Math.sin(t * 0.35) * 0.07 + ty * 0.15;
    setGroupOpacity(gDevin, ed);
    const S = 26; // symbol bbox scale — pips orbit relative to it
    pips.forEach((p, k) => {
      const ph = (t * 0.62 + k / 3) % 1;
      const e = ph * 3, edge = Math.min(2, e | 0), u = e - edge;
      p.position.set(
        (VX[edge] + (VX[(edge + 1) % 3] - VX[edge]) * u) * S * 1.35,
        (VY[edge] + (VY[(edge + 1) % 3] - VY[edge]) * u) * S * 1.35,
        6 + Math.sin(t * 2 + k) * 1.5
      );
      p.material.opacity = ed;
      p.visible = ed > 0.02;
    });

    // Cogs: float each figurine, drift lineup slightly with mouse
    gCogs.rotation.y = tx * 0.25;
    gCogs.rotation.x = ty * 0.1;
    setGroupOpacity(gCogs, eg);
    cogMeshes.forEach((m, i) => {
      m.position.y = m.userData.baseY + Math.sin(t * 1.1 + i * 1.7) * 1.1;
      m.rotation.z = Math.sin(t * 0.6 + i) * 0.05;
      m.material.opacity = eg;
    });

    shadow.material.opacity = 0.5 * Math.max(ec, ed, eg);

    renderer.render(scene, camera);
  }
  frame();
})().catch(err => {
  console.warn("3D hero unavailable:", err);
});
