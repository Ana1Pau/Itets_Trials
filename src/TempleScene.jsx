import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const zonePose = {
  approach: { x: 0, y: 1.9, z: 20 },
  lower: { x: 0, y: 2.1, z: 12 },
  middle: { x: 0, y: 4.7, z: 0 },
  upper: { x: 0, y: 7.4, z: -10 },
  sanctuary: { x: 0, y: 8.1, z: -13 },
  hathor: { x: -6, y: 7.4, z: -10 },
  anubis: { x: 6, y: 7.4, z: -10 },
};

function makeTemple(scene) {
  const model = new THREE.Group();
  scene.add(model);
  const materials = new Set();
  const meshes = [];
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

  const material = (color, roughness = 0.9, metalness = 0) => {
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: 0x000000 });
    mat.userData.canCut = true;
    materials.add(mat);
    return mat;
  };
  const stone = material(0xc3a77c);
  const stoneLight = material(0xd7c39b);
  const stoneShadow = material(0x9b805e);
  const relief = material(0x927651);
  const darkStone = material(0x645441);
  const sanctuaryStone = material(0x887251);
  const gold = material(0xd4ae68, 0.55, 0.08);

  function addMesh(geometry, mat, x, y, z, zone, name = '') {
    const instanceMaterial = mat.clone();
    instanceMaterial.userData.canCut = true;
    materials.add(instanceMaterial);
    const mesh = new THREE.Mesh(geometry, instanceMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.zone = zone;
    mesh.userData.name = name;
    mesh.userData.building = true;
    model.add(mesh);
    if (zone) meshes.push(mesh);
    return mesh;
  }

  function box(width, height, depth, x, y, z, mat, zone, name = '') {
    return addMesh(new THREE.BoxGeometry(width, height, depth), mat, x, y, z, zone, name);
  }

  function column(x, y, z, height, zone, radius = 0.24) {
    const shaft = addMesh(new THREE.CylinderGeometry(radius * 0.82, radius, height, 10), stoneLight, x, y + height / 2, z, zone, 'column');
    box(radius * 2.35, 0.18, radius * 2.35, x, y + 0.09, z, stoneShadow, zone, 'column base');
    box(radius * 2.45, 0.16, radius * 2.45, x, y + height - 0.08, z, stoneLight, zone, 'column capital');
    return shaft;
  }

  function terrace({ width, depth, x = 0, z, top, zone, columns: columnCount, front = true, back = true }) {
    box(width, 0.75, depth, x, top - 0.375, z, stone, zone, 'terrace platform');
    box(width + 0.55, 0.23, depth + 0.55, x, top - 0.76, z, stoneShadow, zone, 'foundation course');
    const topZ = z + depth / 2 - 1.15;
    const rearZ = z - depth / 2 + 1.15;
    for (let i = 0; i < columnCount; i += 1) {
      const px = x - width / 2 + 1.1 + i * ((width - 2.2) / Math.max(1, columnCount - 1));
      if (front) column(px, top, topZ, 2.35, zone);
      if (back) column(px, top, rearZ, 2.1, zone, 0.2);
    }
    // Long lintels bind the colonnades into a legible architectural edge.
    if (front) box(width - 0.6, 0.34, 0.66, x, top + 2.42, topZ, stoneLight, zone, 'portico lintel');
    if (back) box(width - 0.6, 0.3, 0.58, x, top + 2.18, rearZ, stoneLight, zone, 'rear lintel');
    for (let i = 0; i < 12; i += 1) {
      const px = x - width / 2 + 1.1 + i * ((width - 2.2) / 11);
      box(0.78, 1.05, 0.1, px, top + 0.58, z - depth / 2 + 0.45, relief, zone, 'relief panel');
    }
  }

  // Low plinth and the three rising terraces.
  box(27, 0.55, 39, 0, -0.45, 1, stoneShadow, 'approach', 'temple plinth');
  terrace({ width: 23, depth: 10, z: 12, top: 1.2, zone: 'lower', columns: 9, front: true, back: false });
  terrace({ width: 22, depth: 9, z: 0, top: 3.9, zone: 'middle', columns: 11, front: true, back: true });
  terrace({ width: 19, depth: 8, z: -11, top: 6.6, zone: 'upper', columns: 9, front: true, back: true });

  // A clear central stair/ramp reinforces the east-to-west processional axis.
  function stairFlight(zStart, zEnd, yStart, yEnd, zone) {
    const count = 9;
    const run = (zEnd - zStart) / count;
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const y = THREE.MathUtils.lerp(yStart, yEnd, t);
      const z = zStart + i * run + run / 2;
      box(3.25, Math.max(0.22, y - Math.min(yStart, yEnd) + 0.12), Math.abs(run) + 0.08, 0, Math.min(y, Math.min(yStart, yEnd)) - 0.12 + Math.max(0.22, y - Math.min(yStart, yEnd) + 0.12) / 2, z, i % 2 ? stone : stoneLight, zone, 'processional stair');
      box(3.5, 0.12, 0.15, 0, y - 0.03, z + Math.sign(run) * (Math.abs(run) / 2 - 0.03), gold, zone, 'stair nosing');
    }
  }
  stairFlight(4.55, 7.05, 3.9, 1.2, 'lower');
  stairFlight(-6.95, -4.55, 6.6, 3.9, 'middle');
  box(3.4, 0.1, 11, 0, 0.08, 23, stone, 'approach', 'causeway');
  for (let i = 0; i < 9; i += 1) box(0.12, 0.16, 0.3, 0, 0.15, 18 + i * 1.25, gold, 'approach', 'axis marker');

  // The sanctuary is represented as a cut-in volume at the cliff face.
  box(31, 19, 3.5, 0, 9.15, -16.4, stoneShadow, 'sanctuary', 'cliff mass');
  // Open chamber walls and roof leave a clear doorway into the sanctuary.
  box(11.5, 0.55, 5.2, 0, 6.34, -14.25, sanctuaryStone, 'sanctuary', 'sanctuary floor');
  box(0.62, 4.2, 5.2, -5.44, 8.95, -14.25, sanctuaryStone, 'sanctuary', 'sanctuary side wall');
  box(0.62, 4.2, 5.2, 5.44, 8.95, -14.25, sanctuaryStone, 'sanctuary', 'sanctuary side wall');
  box(11.5, 4.2, 0.62, 0, 8.95, -16.54, sanctuaryStone, 'sanctuary', 'sanctuary back wall');
  box(11.5, 0.42, 5.2, 0, 11.05, -14.25, stoneLight, 'sanctuary', 'sanctuary roof');
  box(1.15, 4.2, 0.62, -3.05, 8.95, -11.68, stoneShadow, 'sanctuary', 'sanctuary doorway pier');
  box(1.15, 4.2, 0.62, 3.05, 8.95, -11.68, stoneShadow, 'sanctuary', 'sanctuary doorway pier');
  box(7.3, 0.38, 0.48, 0, 10.83, -11.68, stoneShadow, 'sanctuary', 'sanctuary lintel');
  // The inner shrine sits at the back of the chamber.
  box(4.6, 2.6, 1.25, 0, 7.95, -15.7, stoneLight, 'sanctuary', 'inner shrine');
  box(1.7, 0.12, 0.4, 0, 9.34, -15.0, gold, 'sanctuary', 'shrine detail');

  // Small side chapels on either side of the upper terrace.
  for (const side of [-1, 1]) {
    const id = side < 0 ? 'hathor' : 'anubis';
    const x = side * 11.25;
    box(4.6, 2.6, 5.4, x, 7.9, -10.8, stone, id, 'side chapel');
    box(2.35, 2.1, 0.2, x, 7.65, -8.0, darkStone, id, 'chapel doorway');
    for (const dx of [-1.25, 1.25]) column(x + dx, 6.6, -7.2, 1.85, id, 0.16);
    box(4.8, 0.24, 5.6, x, 9.25, -10.8, stoneLight, id, 'chapel roof');
  }

  // Axial markers, relief bands, and a few stepped cliff strata.
  for (let i = 0; i < 5; i += 1) {
    const width = 31 - i * 1.15;
    box(width, 0.3, 0.28, 0, 3.0 + i * 2.05, -18.2, i % 2 ? stone : stoneLight, 'sanctuary', 'cliff stratum');
  }
  box(0.18, 0.18, 31, 0, 0.18, 0, gold, 'approach', 'processional axis');

  return { model, meshes, materials, cutPlane };
}

export default function TempleScene({ view, selectedZone, cutaway, onSelectZone, onWalkReady }) {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const latestRef = useRef({ view, selectedZone, cutaway, onSelectZone, onWalkReady });
  const [error, setError] = useState('');
  latestRef.current = { view, selectedZone, cutaway, onSelectZone, onWalkReady };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x172326);
      scene.fog = new THREE.Fog(0x172326, 54, 112);
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 180);
      camera.position.set(29, 24, 35);
      camera.lookAt(0, 4, -1);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.14;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.localClippingEnabled = true;
      renderer.domElement.className = 'temple-canvas';
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D schematic model of Djeser-Djeseru');
      renderer.domElement.setAttribute('role', 'img');
      mount.appendChild(renderer.domElement);

      const hemisphere = new THREE.HemisphereLight(0xf5e7cc, 0x4b4a3e, 2.05);
      scene.add(hemisphere);
      const sun = new THREE.DirectionalLight(0xffd79c, 3.35);
      sun.position.set(24, 34, 21);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1536, 1536);
      sun.shadow.camera.left = -35;
      sun.shadow.camera.right = 35;
      sun.shadow.camera.top = 35;
      sun.shadow.camera.bottom = -35;
      sun.shadow.bias = -0.0003;
      scene.add(sun);
      const coolFill = new THREE.DirectionalLight(0x9dc4d2, 0.82);
      coolFill.position.set(-20, 18, -22);
      scene.add(coolFill);

      const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x334044, roughness: 1 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.75;
      ground.receiveShadow = true;
      scene.add(ground);

      const { meshes, materials, cutPlane } = makeTemple(scene);
      const orbit = new OrbitControls(camera, renderer.domElement);
      orbit.enableDamping = true;
      orbit.dampingFactor = 0.065;
      orbit.minDistance = 17;
      orbit.maxDistance = 72;
      orbit.maxPolarAngle = Math.PI * 0.49;
      orbit.target.set(0, 4, -1);
      const walk = new PointerLockControls(camera, renderer.domElement);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const keys = new Set();
      const clock = new THREE.Clock();
      const usePointerLock = typeof renderer.domElement.requestPointerLock === 'function' && (navigator.maxTouchPoints ?? 0) === 0;
      let alive = true;
      let previousView = '';
      let previousZone = '';
      let appliedSelection = '';
      let appliedCutaway = null;
      let lookPointerId = null;
      let previousPointer = { x: 0, y: 0 };

      const setMode = (nextView, zone) => {
        const changedView = nextView !== previousView;
        const changedZone = zone !== previousZone;
        if (!changedView && !(changedZone && ['interior', 'walk'].includes(nextView))) return;
        if (walk.isLocked && nextView !== 'walk') walk.unlock();
        orbit.enabled = nextView !== 'walk';
        if (nextView === 'walk') {
          if (changedView || changedZone) {
            const pose = zonePose[zone] ?? zonePose.middle;
            camera.position.set(pose.x, pose.y, pose.z);
            camera.rotation.set(0, Math.PI, 0);
            camera.lookAt(pose.x, pose.y, pose.z - 8);
            orbit.target.set(pose.x, pose.y, pose.z - 4);
          }
        } else if (nextView === 'interior') {
          const pose = zonePose[zone] ?? zonePose.middle;
          if (changedView || changedZone) {
            camera.position.set(pose.x, pose.y + 0.6, pose.z + 5.2);
            camera.lookAt(pose.x, pose.y + 0.3, pose.z - 8);
            orbit.target.set(pose.x, pose.y, pose.z - 3.2);
          }
        } else if (nextView === 'model') {
          if (changedView) {
            camera.position.set(27, 22, 32);
            orbit.target.set(0, 4, -1);
          }
        } else {
          if (changedView) {
            camera.position.set(29, 24, 35);
            orbit.target.set(0, 4, -1);
          }
        }
        previousView = nextView;
        previousZone = zone;
      };

      const onPointerDown = (event) => {
        if (latestRef.current.view === 'walk') {
          if (!usePointerLock) {
            lookPointerId = event.pointerId;
            previousPointer = { x: event.clientX, y: event.clientY };
            renderer.domElement.setPointerCapture?.(event.pointerId);
          }
          return;
        }
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes, false).find((item) => item.object.userData.zone);
        if (hit) latestRef.current.onSelectZone?.(hit.object.userData.zone);
      };
      const onPointerMove = (event) => {
        if (latestRef.current.view !== 'walk' || usePointerLock || lookPointerId !== event.pointerId) return;
        const deltaX = event.clientX - previousPointer.x;
        const deltaY = event.clientY - previousPointer.y;
        camera.rotation.y -= deltaX * 0.004;
        camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - deltaY * 0.004, -0.7, 0.7);
        previousPointer = { x: event.clientX, y: event.clientY };
      };
      const onPointerUp = (event) => {
        if (lookPointerId === event.pointerId) lookPointerId = null;
      };
      const onKeyDown = (event) => {
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code) && latestRef.current.view === 'walk') {
          event.preventDefault();
          keys.add(event.code);
        }
      };
      const onKeyUp = (event) => keys.delete(event.code);
      const onMoveDown = (event) => keys.add(event.detail?.key);
      const onMoveUp = (event) => keys.delete(event.detail?.key);
      const onBeginWalk = () => {
        if (latestRef.current.view !== 'walk') return;
        if (usePointerLock) walk.lock();
        else latestRef.current.onWalkReady?.();
      };
      const onReset = () => {
        previousView = '';
        setMode(latestRef.current.view, latestRef.current.selectedZone);
      };
      const onResize = () => {
        if (!alive) return;
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        camera.aspect = Math.max(width, 1) / Math.max(height, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
      renderer.domElement.addEventListener('click', () => {
        if (usePointerLock && latestRef.current.view === 'walk' && !walk.isLocked) walk.lock();
      });
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('temple:move-down', onMoveDown);
      window.addEventListener('temple:move-up', onMoveUp);
      window.addEventListener('resize', onResize);
      window.addEventListener('temple:start-walk', onBeginWalk);
      window.addEventListener('temple:reset-view', onReset);
      walk.addEventListener('lock', () => latestRef.current.onWalkReady?.());
      onResize();

      engineRef.current = { scene, camera, renderer, orbit, walk, meshes, materials, cutPlane, setMode };

      const animate = () => {
        if (!alive) return;
        requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        const state = latestRef.current;
        setMode(state.view, state.selectedZone);

        if (appliedSelection !== state.selectedZone) {
          for (const mesh of meshes) {
            const active = mesh.userData.zone === state.selectedZone;
            mesh.material.emissive.setHex(active ? 0x7a4d1a : 0x000000);
            mesh.material.emissiveIntensity = active ? 0.34 : 0;
          }
          appliedSelection = state.selectedZone;
        }
        if (appliedCutaway !== state.cutaway) {
          for (const mat of materials) {
            mat.clippingPlanes = state.cutaway && mat.userData.canCut ? [cutPlane] : [];
            mat.needsUpdate = true;
          }
          appliedCutaway = state.cutaway;
        }

        if (state.view === 'walk') {
          const speed = 5.3 * delta;
          if (walk.isLocked || !usePointerLock) {
            if (keys.has('KeyW') || keys.has('ArrowUp')) walk.moveForward(speed);
            if (keys.has('KeyS') || keys.has('ArrowDown')) walk.moveForward(-speed);
            if (keys.has('KeyA') || keys.has('ArrowLeft')) walk.moveRight(-speed);
            if (keys.has('KeyD') || keys.has('ArrowRight')) walk.moveRight(speed);
            const position = camera.position;
            position.x = THREE.MathUtils.clamp(position.x, -13, 13);
            position.z = THREE.MathUtils.clamp(position.z, -20, 25);
          }
        } else {
          orbit.update();
        }
        renderer.render(scene, camera);
      };
      animate();

      const cleanup = () => {
        alive = false;
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('temple:move-down', onMoveDown);
        window.removeEventListener('temple:move-up', onMoveUp);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('temple:start-walk', onBeginWalk);
        window.removeEventListener('temple:reset-view', onReset);
        orbit.dispose();
        walk.dispose();
        scene.traverse((object) => {
          object.geometry?.dispose?.();
        });
        materials.forEach((mat) => mat.dispose());
        groundMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        engineRef.current = null;
      };
      engineRef.current.cleanup = cleanup;
      return cleanup;
    } catch (err) {
      setError('This browser could not start the 3D view. Try a recent browser with WebGL enabled.');
      return undefined;
    }
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.setMode(view, selectedZone);
      if (view !== 'walk' && engine.walk.isLocked) engine.walk.unlock();
    }
  }, [view, selectedZone]);

  if (error) return <div className="scene-error"><span>3D VIEW UNAVAILABLE</span><p>{error}</p></div>;
  return <div className={`temple-scene ${view === 'walk' ? 'walking' : ''}`} ref={mountRef} />;
}
