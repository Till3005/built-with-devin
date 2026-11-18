/* Hero media — one static black Devin mark.
   Extruded from the official symbol, IBL + clearcoat, soft shadow.
   No motion at all — a still life that sits in the page. */
(async function () {
  const panel = document.querySelector(".hero-media .media-panel");
  if (!panel) return;

  const THREE = await import("three");
  const { SVGLoader } = await import("three/addons/loaders/SVGLoader.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  panel.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 200);
  camera.position.set(0, 1.5, 54);
  camera.lookAt(0, 0.5, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(12, 26, 24); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
  fill.position.set(-16, -4, 10); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.7);
  rim.position.set(-10, 14, -20); scene.add(rim);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x14140f, metalness: 0.0, roughness: 0.34,
    clearcoat: 0.55, clearcoatRoughness: 0.28, envMapIntensity: 0.85,
  });

  const loader = new SVGLoader();
  const data = await new Promise((res, rej) => loader.load("assets/brand/Devin_Symbol.svg", res, undefined, rej));
  const inner = new THREE.Group();
  for (const path of data.paths) {
    for (const shape of SVGLoader.createShapes(path)) {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 5, bevelEnabled: true, bevelThickness: 1.4,
        bevelSize: 1.2, bevelSegments: 5, curveSegments: 32,
      });
      geo.center();
      inner.add(new THREE.Mesh(geo, mat));
    }
  }
  const box = new THREE.Box3().setFromObject(inner);
  const size = new THREE.Vector3(); box.getSize(size);
  const c = new THREE.Vector3(); box.getCenter(c);
  inner.position.sub(c);
  const mark = new THREE.Group();
  mark.add(inner);
  mark.scale.setScalar(26 / Math.max(size.x, size.y));
  inner.scale.y *= -1; inner.position.y *= -1;
  mark.rotation.set(-0.07, 0.30, 0);   // fixed slight tilt
  mark.position.y = 2;
  scene.add(mark);

  // soft ground shadow
  const aoTex = (() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const g = cv.getContext("2d");
    const rg = g.createRadialGradient(128, 128, 6, 128, 128, 118);
    rg.addColorStop(0, "rgba(0,0,0,.38)"); rg.addColorStop(0.55, "rgba(0,0,0,.16)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  })();
  const ao = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 34),
    new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
  );
  ao.rotation.x = -Math.PI / 2;
  ao.position.set(2, -15.5, 0);
  scene.add(ao);

  function themeMats() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    mat.color.set(dark ? 0xefefe9 : 0x14140f);
    ao.material.opacity = dark ? 0.6 : 1.0;
  }
  themeMats();
  new MutationObserver(themeMats).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function resize() {
    const r = panel.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  resize();
  addEventListener("resize", resize);
  new MutationObserver(() => renderer.render(scene, camera))
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})().catch(err => console.warn("3D hero unavailable:", err));
