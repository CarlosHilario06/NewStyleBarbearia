import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';

/**
 * Procedural 3D centerpiece for the hero: a stylised low-poly reconstruction
 * of the real New Style Barbearia room (back-left corner cutaway, like an
 * isometric dollhouse render), built to the shop's real proportions —
 * 4.80m x 3.60m, pé-direito 2.60m. No external model — every mesh,
 * texture and material below is generated in code.
 */
export function initHeroScene(container) {
  if (!container) return null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no webgl context');
  } catch (e) {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ---- real-world room dimensions (metres) --------------------------
  const ROOM_W = 4.8;  // comprimento
  const ROOM_D = 3.6;  // largura
  const ROOM_H = 2.6;  // pé-direito
  const halfW = ROOM_W / 2;
  const halfD = ROOM_D / 2;

  // ---- lighting -----------------------------------------------------
  scene.add(new THREE.AmbientLight(0x554a3e, 1.6));

  const keyLight = new THREE.PointLight(0xfff0d2, 12, 14, 2);
  keyLight.position.set(1.5, 2.5, 2.5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xc9d3e0, 3.5, 14, 2);
  fillLight.position.set(-3, 1.6, 2.5);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xc9a24b, 5, 14, 2);
  rimLight.position.set(-2.4, 2.2, -1.8);
  scene.add(rimLight);

  // ---- helpers --------------------------------------------------------
  const furniture = []; // meshes/groups that get a staggered entrance

  function box(w, h, d, mat, x, y, z, ry = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    return m;
  }
  function cyl(rt, rb, h, mat, x, y, z, segs = 20) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
    m.position.set(x, y, z);
    return m;
  }

  // ---- materials --------------------------------------------------------
  function makeFloorTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#8a6a48';
    ctx.fillRect(0, 0, size, size);
    const tile = size / 8;
    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        const shade = (gx + gy) % 2 === 0 ? '#93714d' : '#82623f';
        ctx.fillStyle = shade;
        ctx.fillRect(gx * tile + 1, gy * tile + 1, tile - 2, tile - 2);
      }
    }
    ctx.strokeStyle = 'rgba(30,20,10,0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(230,222,204,0.85)';
    for (let gy = 0; gy <= 8; gy++) {
      for (let gx = 0; gx <= 8; gx++) {
        if ((gx + gy) % 3 !== 0) continue;
        const cx = gx * tile, cy = gy * tile, s = tile * 0.16;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
        ctx.closePath(); ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2.25);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const floorMat = new THREE.MeshStandardMaterial({ map: makeFloorTexture(), roughness: 0.9 });
  const wallBackMat = new THREE.MeshStandardMaterial({ color: 0x413c35, roughness: 0.95 });
  const wallSideMat = new THREE.MeshStandardMaterial({ color: 0x36322c, roughness: 0.95 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xd8d0bd, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.35, metalness: 0.7 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x272330, roughness: 0.3, metalness: 0.2 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.25, metalness: 0.9 });
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x5c4832, roughness: 1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xaeb9c4, roughness: 0.08, metalness: 1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 0.6 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x201f22, roughness: 0.9, side: THREE.DoubleSide });
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0xfff6df, emissive: 0xfff0c8, emissiveIntensity: 1.4, roughness: 0.6 });
  const frameColors = [0xc9a24b, 0x8a6a48, 0x2a2722, 0xb8b0a0];

  const room = new THREE.Group();

  // ---- shell ------------------------------------------------------------
  room.add(box(ROOM_W, 0.08, ROOM_D, floorMat, 0, -0.04, 0));
  room.add(box(ROOM_W, 0.08, ROOM_D, ceilingMat, 0, ROOM_H + 0.04, 0));
  room.add(box(0.08, ROOM_H, ROOM_D, wallSideMat, -halfW, ROOM_H / 2, 0));
  room.add(box(ROOM_W, ROOM_H, 0.08, wallBackMat, 0, ROOM_H / 2, -halfD));

  // ceiling light tubes (visual + real point light glow already added above)
  [-1.5, -0.1, 1.3].forEach((x) => {
    room.add(box(1.05, 0.05, 0.09, fixtureMat, x, ROOM_H - 0.04, -0.9));
  });

  // ---- barber chair (the room's centrepiece) -----------------------------
  const chair = new THREE.Group();
  chair.add(cyl(0.22, 0.26, 0.06, chromeMat, 0, 0.04, 0));
  chair.add(cyl(0.045, 0.045, 0.55, chromeMat, 0, 0.35, 0));
  chair.add(cyl(0.24, 0.05, 0.05, chromeMat, 0, 0.62, 0));
  chair.add(box(0.5, 0.14, 0.5, leatherMat, 0, 0.72, 0));
  chair.add(box(0.48, 0.72, 0.12, leatherMat, 0, 1.15, -0.24));
  chair.add(box(0.34, 0.2, 0.14, leatherMat, 0, 1.58, -0.24));
  chair.add(box(0.14, 0.34, 0.44, leatherMat, -0.29, 0.95, 0.03));
  chair.add(box(0.14, 0.34, 0.44, leatherMat, 0.29, 0.95, 0.03));
  chair.add(box(0.5, 0.05, 0.14, chromeMat, 0, 0.28, 0.34));
  chair.position.set(1.15, 0, 0.85);
  chair.rotation.y = -1.15;
  room.add(chair);
  furniture.push(chair);

  // ---- sofa (front-left, open corner) ------------------------------------
  const sofa = new THREE.Group();
  sofa.add(box(1.5, 0.34, 0.7, sofaMat, 0, 0.17, 0));
  sofa.add(box(1.5, 0.4, 0.16, sofaMat, 0, 0.52, -0.27));
  sofa.add(box(0.16, 0.46, 0.7, sofaMat, -0.67, 0.44, 0));
  sofa.add(box(0.16, 0.46, 0.7, sofaMat, 0.67, 0.44, 0));
  sofa.position.set(-1.85, 0, 1.15);
  sofa.rotation.y = -0.55;
  room.add(sofa);
  furniture.push(sofa);

  // ---- left-wall mirror station ------------------------------------------
  const station = new THREE.Group();
  station.add(box(0.03, 0.9, 0.85, glassMat, -halfW + 0.05, 1.55, -0.55));
  station.add(box(0.05, 1.0, 0.95, trimMat, -halfW + 0.03, 1.55, -0.55));
  station.add(box(0.18, 0.05, 0.85, darkMat, -halfW + 0.12, 1.02, -0.55));
  station.add(box(0.2, 0.55, 0.9, darkMat, -halfW + 0.11, 0.63, -0.55));
  for (let i = 0; i < 4; i++) {
    station.add(cyl(0.03, 0.03, 0.12, glassMat, -halfW + 0.12, 1.1, -0.85 + i * 0.18));
  }
  furniture.push(station);
  room.add(station);

  // coat hook + hanging cloth
  const hooks = new THREE.Group();
  hooks.add(box(0.28, 0.03, 0.03, darkMat, -halfW + 0.05, 1.85, 0.15));
  hooks.add(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.55), clothMat));
  hooks.children[1].position.set(-halfW + 0.08, 1.55, 0.15);
  hooks.children[1].rotation.y = Math.PI / 2;
  room.add(hooks);
  furniture.push(hooks);

  // ---- back wall: TV, round mirror, frames -------------------------------
  const tv = new THREE.Group();
  tv.add(box(0.62, 0.38, 0.04, darkMat, -1.0, 1.95, -halfD + 0.06));
  tv.add(box(0.56, 0.32, 0.01, new THREE.MeshStandardMaterial({ color: 0x0c0c10, emissive: 0x2a2115, emissiveIntensity: 0.6 }), -1.0, 1.95, -halfD + 0.085));
  room.add(tv);
  furniture.push(tv);

  const roundMirror = new THREE.Group();
  roundMirror.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 12, 32), trimMat));
  roundMirror.add(new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), glassMat));
  roundMirror.children.forEach((m) => { m.position.set(0.55, 1.75, -halfD + 0.05); });
  room.add(roundMirror);
  furniture.push(roundMirror);

  const frames = new THREE.Group();
  const framePositions = [[0.95, 1.85], [1.35, 1.6], [1.75, 1.95], [1.15, 1.35], [-1.75, 1.9], [-1.4, 1.55]];
  framePositions.forEach(([x, y], i) => {
    const m = box(0.22, 0.28, 0.02, new THREE.MeshStandardMaterial({ color: frameColors[i % frameColors.length], roughness: 0.6 }), x, y, -halfD + 0.05);
    frames.add(m);
  });
  room.add(frames);
  furniture.push(frames);

  // ---- pedestal fan -------------------------------------------------------
  const fan = new THREE.Group();
  fan.add(cyl(0.18, 0.18, 0.03, darkMat, 0, 0.02, 0));
  fan.add(cyl(0.025, 0.025, 1.1, darkMat, 0, 0.57, 0));
  fan.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 24), chromeMat));
  fan.children[2].position.set(0, 1.14, 0);
  fan.position.set(1.4, 0, -1.15);
  room.add(fan);
  furniture.push(fan);

  // ---- ring light on tripod ------------------------------------------------
  const ring = new THREE.Group();
  ring.add(cyl(0.02, 0.22, 1.3, darkMat, 0, 0.65, 0, 8));
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 28), new THREE.MeshStandardMaterial({ color: 0xf5efe0, emissive: 0xd9cba2, emissiveIntensity: 0.5 })));
  ring.children[1].position.set(0, 1.5, 0.05);
  ring.position.set(1.75, 0, -0.25);
  room.add(ring);
  furniture.push(ring);

  // ---- stool + trash bin ----------------------------------------------------
  const stool = new THREE.Group();
  stool.add(cyl(0.19, 0.19, 0.05, darkMat, 0, 0.47, 0));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, 0.13, 0.23, 0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, -0.13, 0.23, 0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, 0.13, 0.23, -0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, -0.13, 0.23, -0.13));
  stool.position.set(1.9, 0, 0.55);
  room.add(stool);
  furniture.push(stool);

  const bin = cyl(0.14, 0.11, 0.32, darkMat, 1.05, 0.16, -1.0);
  room.add(bin);
  furniture.push(bin);

  // ---- drifting dust motes (catching the ceiling lights) -------------------
  function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,244,214,0.85)');
    g.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }
  const PARTICLE_COUNT = 60;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);
  const driftPhase = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = -halfW + Math.random() * ROOM_W;
    positions[i * 3 + 1] = Math.random() * ROOM_H;
    positions[i * 3 + 2] = -halfD + Math.random() * ROOM_D;
    speeds[i] = 0.04 + Math.random() * 0.08;
    driftPhase[i] = Math.random() * Math.PI * 2;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.035,
    map: makeDotTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  room.add(particles);

  scene.add(room);

  // ---- camera framing (isometric-style 3/4 view into the open corner) ----
  // Room geometry is symmetric around x=0 / z=0 with y in [0, ROOM_H], so no
  // extra centering offset is needed — the camera just orbits that origin,
  // looking slightly toward the furnished back-left corner.
  const camDistance = 6.6;
  const camHeight = 2.0;
  const baseAzimuth = 0.5; // radians
  const lookTarget = new THREE.Vector3(0.05, 0.95, -0.15);
  function cameraFromAzimuth(az, dist, height) {
    return new THREE.Vector3(Math.sin(az) * dist, height, Math.cos(az) * dist);
  }

  // ---- resize ---------------------------------------------------------
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ---- pointer parallax -------------------------------------------
  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---- scroll fade / dolly -------------------------------------------
  let scrollProgress = 0;
  function onScroll() {
    const heroH = container.parentElement ? container.parentElement.offsetHeight : window.innerHeight;
    scrollProgress = Math.min(Math.max(window.scrollY / heroH, 0), 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- render loop ------------------------------------------------
  const clock = new THREE.Clock();
  let frameId = null;
  let paused = false;

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && frameId === null) animate();
  });

  function animate() {
    frameId = requestAnimationFrame(animate);
    if (paused) return;
    const t = clock.getElapsedTime();
    const delta = clock.getDelta();

    const swaySpeed = reduceMotion ? 0.04 : 0.14;
    const sway = Math.sin(t * swaySpeed) * (reduceMotion ? 0.02 : 0.09);

    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;

    const az = baseAzimuth + sway + eased.x * 0.08;
    const height = camHeight + eased.y * 0.35 - scrollProgress * 0.9;
    const pos = cameraFromAzimuth(az, camDistance - scrollProgress * 1.4, height);
    camera.position.copy(pos);
    camera.lookAt(lookTarget);

    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      let y = posAttr.array[idx + 1] + speeds[i] * delta;
      if (y > ROOM_H) y = 0;
      posAttr.array[idx + 1] = y;
      posAttr.array[idx] += Math.sin(t * 0.5 + driftPhase[i]) * 0.001;
    }
    posAttr.needsUpdate = true;

    renderer.domElement.style.opacity = String(1 - scrollProgress * 0.9);
    renderer.render(scene, camera);
  }
  animate();

  return {
    roomGroup: room,
    furniture,
    camera,
    dispose() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      particleGeo.dispose();
      particleMat.dispose();
      particleMat.map?.dispose();
      floorMat.map?.dispose();
      [floorMat, wallBackMat, wallSideMat, ceilingMat, trimMat, leatherMat, chromeMat, sofaMat, glassMat, darkMat, clothMat, fixtureMat].forEach((m) => m.dispose());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
