import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';

/**
 * Procedural 3D centerpiece for the hero: a stylised low-poly reconstruction
 * of the real New Style Barbearia room — a 3-wall U-shaped shell (mirror
 * wall, back feature wall, door wall) open at the front, matching the
 * shop's 360° reference photo and its real proportions (4.80m x 3.60m,
 * pé-direito 2.60m). No external model — every mesh, texture and material
 * below is generated in code. Desktop pointer users can click-drag to look
 * around inside the clamped arc (touch keeps normal page scrolling).
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
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cursor = 'grab';
  container.appendChild(renderer.domElement);

  // ---- real-world room dimensions (metres) --------------------------
  const ROOM_W = 4.8;  // comprimento (left/mirror wall <-> right/door wall)
  const ROOM_D = 3.6;  // largura (back wall <-> open front)
  const ROOM_H = 2.6;  // pé-direito
  const halfW = ROOM_W / 2;
  const halfD = ROOM_D / 2;

  // ---- lighting -----------------------------------------------------
  scene.add(new THREE.AmbientLight(0x59503f, 1.7));

  const keyLight = new THREE.PointLight(0xfff0d2, 11, 15, 2);
  keyLight.position.set(0.2, 2.5, 1.8);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xc9d3e0, 3.2, 15, 2);
  fillLight.position.set(-2.6, 1.6, 1.6);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xc9a24b, 5, 15, 2);
  rimLight.position.set(2.0, 2.2, -1.4);
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
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a463e, roughness: 0.95 });
  const wallSideMat = new THREE.MeshStandardMaterial({ color: 0x413d36, roughness: 0.95 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xd8d0bd, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.35, metalness: 0.7 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x272330, roughness: 0.3, metalness: 0.2 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.25, metalness: 0.9 });
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x5c4832, roughness: 1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xaeb9c4, roughness: 0.08, metalness: 1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 0.6 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x201f22, roughness: 0.9, side: THREE.DoubleSide });
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0xfff6df, emissive: 0xfff0c8, emissiveIntensity: 1.4, roughness: 0.6 });
  const doorPaneMat = new THREE.MeshStandardMaterial({ color: 0xcfd6dc, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.55 });
  const frameColors = [0xc9a24b, 0x8a6a48, 0x2a2722, 0xb8b0a0, 0x9c5b3f];

  const room = new THREE.Group();

  // ---- shell: mirror wall (left) + feature wall (back) + door wall (right),
  //      open at the front where the camera sits -----------------------------
  room.add(box(ROOM_W, 0.08, ROOM_D, floorMat, 0, -0.04, 0));
  room.add(box(ROOM_W, 0.08, ROOM_D, ceilingMat, 0, ROOM_H + 0.04, 0));
  room.add(box(0.08, ROOM_H, ROOM_D, wallSideMat, -halfW, ROOM_H / 2, 0));
  room.add(box(ROOM_W, ROOM_H, 0.08, wallMat, 0, ROOM_H / 2, -halfD));
  room.add(box(0.08, ROOM_H, ROOM_D, wallSideMat, halfW, ROOM_H / 2, 0));

  // ceiling light tubes (visual + real point light glow already added above)
  [-1.4, 0, 1.4].forEach((x) => {
    room.add(box(1.0, 0.05, 0.09, fixtureMat, x, ROOM_H - 0.04, -0.9));
  });

  // ---- barber chair (the room's centrepiece, facing the mirror wall) -------
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
  chair.position.set(-0.25, 0, 0.3);
  chair.rotation.y = -1.45;
  room.add(chair);
  furniture.push(chair);

  // ---- sofa (front-left, by the open side) --------------------------------
  const sofa = new THREE.Group();
  sofa.add(box(1.5, 0.34, 0.7, sofaMat, 0, 0.17, 0));
  sofa.add(box(1.5, 0.4, 0.16, sofaMat, 0, 0.52, -0.27));
  sofa.add(box(0.16, 0.46, 0.7, sofaMat, -0.67, 0.44, 0));
  sofa.add(box(0.16, 0.46, 0.7, sofaMat, 0.67, 0.44, 0));
  sofa.position.set(-1.85, 0, 1.05);
  sofa.rotation.y = -0.45;
  room.add(sofa);
  furniture.push(sofa);

  // ---- left-wall mirror station -------------------------------------------
  const station = new THREE.Group();
  station.add(box(0.03, 0.9, 0.85, glassMat, -halfW + 0.05, 1.55, -0.65));
  station.add(box(0.05, 1.0, 0.95, trimMat, -halfW + 0.03, 1.55, -0.65));
  station.add(box(0.18, 0.05, 0.85, darkMat, -halfW + 0.12, 1.02, -0.65));
  station.add(box(0.2, 0.55, 0.9, darkMat, -halfW + 0.11, 0.63, -0.65));
  for (let i = 0; i < 4; i++) {
    station.add(cyl(0.03, 0.03, 0.12, glassMat, -halfW + 0.12, 1.1, -0.95 + i * 0.18));
  }
  room.add(station);
  furniture.push(station);

  // certificates, closer to the open front than the mirror
  const certs = new THREE.Group();
  [0.55, 0.9].forEach((z, i) => {
    certs.add(box(0.02, 0.32, 0.24, new THREE.MeshStandardMaterial({ color: 0xcfc7b4, roughness: 0.7 }), -halfW + 0.05, 1.55 - i * 0.06, z));
  });
  room.add(certs);
  furniture.push(certs);

  // coat hooks + hanging cloth
  const hooks = new THREE.Group();
  hooks.add(box(0.28, 0.03, 0.03, darkMat, -halfW + 0.05, 1.85, 0.05));
  hooks.add(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.55), clothMat));
  hooks.children[1].position.set(-halfW + 0.08, 1.55, 0.05);
  hooks.children[1].rotation.y = Math.PI / 2;
  room.add(hooks);
  furniture.push(hooks);

  // ---- back wall: TV, clock, round mirror, badge, frames -------------------
  const tv = new THREE.Group();
  tv.add(box(0.6, 0.36, 0.04, darkMat, -1.35, 1.95, -halfD + 0.06));
  tv.add(box(0.54, 0.3, 0.01, new THREE.MeshStandardMaterial({ color: 0x0c0c10, emissive: 0x2a2115, emissiveIntensity: 0.6 }), -1.35, 1.95, -halfD + 0.085));
  room.add(tv);
  furniture.push(tv);

  const wallDeco = new THREE.Group();
  wallDeco.add(box(0.22, 0.28, 0.02, new THREE.MeshStandardMaterial({ color: frameColors[0], roughness: 0.6 }), -0.7, 1.85, -halfD + 0.05));
  const clockFace = new THREE.Group();
  clockFace.add(new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.015, 10, 24), trimMat));
  clockFace.add(new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.5 })));
  clockFace.children.forEach((m) => m.position.set(-0.2, 1.9, -halfD + 0.05));
  wallDeco.add(clockFace);

  const roundMirror = new THREE.Group();
  roundMirror.add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 12, 32), trimMat));
  roundMirror.add(new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), glassMat));
  roundMirror.children.forEach((m) => m.position.set(0.35, 1.72, -halfD + 0.05));
  wallDeco.add(roundMirror);

  const badge = new THREE.Group();
  badge.add(new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 0.6 })));
  badge.add(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 24), trimMat));
  badge.children.forEach((m) => m.position.set(0.85, 1.9, -halfD + 0.05));
  wallDeco.add(badge);

  [[1.3, 1.6], [1.75, 1.9], [-1.9, 1.55]].forEach(([x, y], i) => {
    wallDeco.add(box(0.22, 0.28, 0.02, new THREE.MeshStandardMaterial({ color: frameColors[(i + 1) % frameColors.length], roughness: 0.6 }), x, y, -halfD + 0.05));
  });
  room.add(wallDeco);
  furniture.push(wallDeco);

  // ---- right wall: glazed door + a couple of frames -------------------------
  const door = new THREE.Group();
  door.add(box(0.06, 2.05, 0.9, darkMat, halfW - 0.05, 1.05, -0.15));
  for (let i = 0; i < 3; i++) {
    door.add(box(0.03, 0.55, 0.76, doorPaneMat, halfW - 0.06, 0.5 + i * 0.62, -0.15));
  }
  room.add(door);
  furniture.push(door);

  const rightFrames = new THREE.Group();
  [[-1.3, 1.85], [-0.85, 1.55]].forEach(([z, y], i) => {
    rightFrames.add(box(0.02, 0.26, 0.2, new THREE.MeshStandardMaterial({ color: frameColors[(i + 2) % frameColors.length], roughness: 0.6 }), halfW - 0.05, y, z));
  });
  room.add(rightFrames);
  furniture.push(rightFrames);

  // ---- pedestal fan -------------------------------------------------------
  const fan = new THREE.Group();
  fan.add(cyl(0.18, 0.18, 0.03, darkMat, 0, 0.02, 0));
  fan.add(cyl(0.025, 0.025, 1.1, darkMat, 0, 0.57, 0));
  fan.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 24), chromeMat));
  fan.children[2].position.set(0, 1.14, 0);
  fan.position.set(1.55, 0, -1.0);
  room.add(fan);
  furniture.push(fan);

  // ---- small guest/waiting chair -------------------------------------------
  const smallChair = new THREE.Group();
  smallChair.add(cyl(0.17, 0.17, 0.04, darkMat, 0, 0.42, 0));
  smallChair.add(cyl(0.03, 0.03, 0.4, chromeMat, 0, 0.22, 0));
  smallChair.add(box(0.36, 0.42, 0.04, darkMat, 0, 0.65, -0.16));
  smallChair.position.set(1.9, 0, 0.15);
  room.add(smallChair);
  furniture.push(smallChair);

  // ---- ring light on tripod ------------------------------------------------
  const ring = new THREE.Group();
  ring.add(cyl(0.02, 0.22, 1.3, darkMat, 0, 0.65, 0, 8));
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 28), new THREE.MeshStandardMaterial({ color: 0xf5efe0, emissive: 0xd9cba2, emissiveIntensity: 0.5 })));
  ring.children[1].position.set(0, 1.5, 0.05);
  ring.position.set(2.0, 0, 0.85);
  room.add(ring);
  furniture.push(ring);

  // ---- stool + trash bin ----------------------------------------------------
  const stool = new THREE.Group();
  stool.add(cyl(0.19, 0.19, 0.05, darkMat, 0, 0.47, 0));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, 0.13, 0.23, 0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, -0.13, 0.23, 0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, 0.13, 0.23, -0.13));
  stool.add(cyl(0.03, 0.03, 0.45, chromeMat, -0.13, 0.23, -0.13));
  stool.position.set(1.55, 0, 1.3);
  room.add(stool);
  furniture.push(stool);

  const bin = cyl(0.14, 0.11, 0.32, darkMat, 1.45, 0.16, -0.35);
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

  // ---- camera framing: front-and-centre, looking into the open U --------
  const camDistance = 5.6;
  const camHeight = 1.95;
  const lookTarget = new THREE.Vector3(-0.1, 1.1, -0.4);

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

  // ---- click-drag look-around (mouse only — touch keeps page scroll) -----
  const orbit = { az: 0, el: 0 };      // user-driven offsets, clamped
  const drag = { active: false, lastX: 0, lastY: 0 };
  const AZ_LIMIT = 0.55, EL_LIMIT = 0.22;

  function onPointerDown(e) {
    if (e.pointerType !== 'mouse') return;
    e.preventDefault();
    drag.active = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    renderer.domElement.style.cursor = 'grabbing';
  }
  function onPointerMove(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    orbit.az = Math.min(AZ_LIMIT, Math.max(-AZ_LIMIT, orbit.az - dx * 0.0035));
    orbit.el = Math.min(EL_LIMIT, Math.max(-EL_LIMIT, orbit.el + dy * 0.0025));
  }
  function endDrag() {
    if (!drag.active) return;
    drag.active = false;
    renderer.domElement.style.cursor = 'grab';
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

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

    const idleSway = reduceMotion || drag.active ? 0 : Math.sin(t * 0.14) * 0.045;

    const az = orbit.az + idleSway;
    const el = orbit.el;
    const dist = camDistance - scrollProgress * 1.3;
    camera.position.set(
      Math.sin(az) * dist,
      camHeight + el * 2.2 - scrollProgress * 0.85,
      Math.cos(az) * dist
    );
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
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      ro.disconnect();
      particleGeo.dispose();
      particleMat.dispose();
      particleMat.map?.dispose();
      floorMat.map?.dispose();
      [floorMat, wallMat, wallSideMat, ceilingMat, trimMat, leatherMat, chromeMat, sofaMat, glassMat, darkMat, clothMat, fixtureMat, doorPaneMat].forEach((m) => m.dispose());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
