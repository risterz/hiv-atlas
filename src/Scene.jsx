import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createLifecycleCell, createVirion } from './three/createVirion.js';
import { disposeObject, ENV_TRIMER_COUNT } from './three/virionGeometry.js';

const annotations = [
  { id: 'envelope', label: 'Lipid envelope', offset: [-106, -28], point: new THREE.Vector3(-1.43, 0.96, 0.67) },
  { id: 'spikes', label: 'Env trimer', offset: [24, -30], point: new THREE.Vector3(1.88, 0.73, 0.51) },
  { id: 'capsid', label: 'p24 capsid', offset: [-106, 24], point: new THREE.Vector3(-0.38, -0.55, 0.35), capsid: true },
  { id: 'rna', label: 'Two RNA copies + NC', offset: [24, 24], point: new THREE.Vector3(0.05, -0.4, 0.23), capsid: true },
  { id: 'matrix', label: 'p17 matrix', offset: [12, 12], point: new THREE.Vector3(1.25, -0.75, 0.65), selectedOnly: true },
  { id: 'reverseTranscriptase', label: 'Reverse transcriptase', offset: [20, 25], point: new THREE.Vector3(0.12, -0.47, 0.18), capsid: true, selectedOnly: true },
  { id: 'integrase', label: 'Integrase', offset: [-90, -35], point: new THREE.Vector3(-0.13, -0.05, 0.16), capsid: true, selectedOnly: true },
  { id: 'protease', label: 'Protease dimer', offset: [20, -30], point: new THREE.Vector3(1.05, 0.65, 0.38), selectedOnly: true },
];

function VirusFallback({ className = '', cutaway = true, activeLayer = 'envelope' }) {
  const id = useId();
  const showGenome = !['capsid', 'matrix', 'protease'].includes(activeLayer);
  const spikeAngles = [-82, -55, -29, 2, 28, 52, 81, 111, 143, 173, 204, 229, 261, 300];
  return <div className={`virus-fallback ${className}`} role="img" aria-label={cutaway ? 'Static scientific cutaway of mature HIV-1 with Env trimers, p17 matrix, a conical p24 capsid, and two RNA copies' : 'Static exterior illustration of mature HIV-1 with sparse Env trimers and an enclosed lipid envelope'}>
    <svg viewBox="0 0 500 500" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-membrane`} cx="32%" cy="24%" r="80%"><stop offset="0" stopColor="#d9bca5"/><stop offset=".55" stopColor="#aa8371"/><stop offset="1" stopColor="#72594e"/></radialGradient>
        <linearGradient id={`${id}-capsid`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e3c18a"/><stop offset=".55" stopColor="#bd8c52"/><stop offset="1" stopColor="#86603e"/></linearGradient>
        <pattern id={`${id}-lattice`} width="19" height="17" patternUnits="userSpaceOnUse"><path d="M9.5 1L17 5.3V12L9.5 16L2 12V5.3Z" fill="none" stroke="#765237" strokeWidth="1.2" opacity=".5"/></pattern>
        <clipPath id={`${id}-core-clip`}><path d="M183 314Q170 281 195 251L272 171Q293 150 313 172Q328 189 310 211L229 302Q209 329 183 314Z"/></clipPath>
      </defs>
      <ellipse cx="250" cy="442" rx="113" ry="13" fill="#182d25" opacity=".12" />
      {spikeAngles.map((angle, index) => <g key={angle} transform={`translate(250 250) rotate(${angle}) translate(0 -169)`}>
        <path d="M-7 5L-5-18M0 5V-20M7 5L5-18" stroke="#9c6b57" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="-10" cy="-25" rx="12" ry="14" fill="#e2d2b2" transform={`rotate(-24 -10 -25)`} />
        <ellipse cx="10" cy="-25" rx="12" ry="14" fill="#d6c6a7" transform={`rotate(24 10 -25)`} />
        <ellipse cy="-36" rx="12" ry="14" fill={index % 2 ? '#e8dabe' : '#ddd0b3'} />
      </g>)}
      <path d="M250 84A166 166 0 1 1 104 181L124 193A144 144 0 1 0 250 106Z" fill={`url(#${id}-membrane)`} stroke="#c8aa94" strokeWidth="4" />
      <path d="M250 111A139 139 0 1 1 128 191" fill="none" stroke="#7e9177" strokeWidth="13" strokeDasharray="3 3" />
      <g transform="rotate(35 250 250)">
        <path d="M183 314Q170 281 195 251L272 171Q293 150 313 172Q328 189 310 211L229 302Q209 329 183 314Z" fill={`url(#${id}-capsid)`} stroke="#e0bd83" strokeWidth="3" />
        <path d="M183 314Q170 281 195 251L272 171Q293 150 313 172Q328 189 310 211L229 302Q209 329 183 314Z" fill={`url(#${id}-lattice)`} />
        <g clipPath={`url(#${id}-core-clip)`} visibility={showGenome ? 'visible' : 'hidden'}>
          <path d="M176 300Q242 279 210 244T288 187" fill="none" stroke="#334d41" strokeWidth="19" opacity=".7" />
          <path d="M183 301Q244 273 214 244T289 187" fill="none" stroke="#edca77" strokeWidth="4" />
          <path d="M194 307Q254 277 224 247T298 192" fill="none" stroke="#90bdad" strokeWidth="4" />
        </g>
      </g>
      <g transform="translate(328 285)"><path d="M-10 9Q-23-8-7-18Q5-19 4-4Q8-20 20-12Q30 4 10 12Z" fill="#b98996" stroke="#d5adb1" strokeWidth="2"/></g>
      <path d="M109 180L91 162M329 287L355 303" stroke="#aa9a87" strokeWidth="1" />
      {!cutaway && <circle cx="250" cy="250" r="166" fill={`url(#${id}-membrane)`} stroke="#c8aa94" strokeWidth="4" />}
    </svg>
  </div>;
}

const Scene = forwardRef(function Scene({
  mode = 'hero',
  activeLayer = 'envelope',
  activeStep = 0,
  playing = true,
  cutaway = true,
  onSelect,
  onAvailability,
}, ref) {
  const mountRef = useRef(null);
  const labelRefs = useRef({});
  const apiRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stateRef = useRef({ mode, activeLayer, activeStep, playing, cutaway, onSelect, onAvailability });
  const [failed, setFailed] = useState(false);
  stateRef.current = { mode, activeLayer, activeStep, playing, cutaway, onSelect, onAvailability };
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useImperativeHandle(ref, () => ({
    resetCamera: () => apiRef.current?.resetCamera(),
    zoomIn: () => apiRef.current?.zoom(0.84),
    zoomOut: () => apiRef.current?.zoom(1.18),
  }), []);

  useEffect(() => {
    const mount = mountRef.current;
    stateRef.current.onAvailability?.(false);
    if (!mount || reducedMotion) return undefined;
    let renderer;
    let animationId;
    let disposed = false;
    let dirty = true;
    let frameCount = 0;
    const cleanupTasks = [];
    const teardown = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animationId);
      cleanupTasks.reverse().forEach((cleanup) => cleanup());
      apiRef.current = null;
      delete mount.dataset.ready;
      stateRef.current.onAvailability?.(false);
    };
    try {
    setFailed(false);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    cleanupTasks.push(() => { renderer.dispose(); renderer.domElement.remove(); });
    const onContextLost = (event) => { event.preventDefault(); teardown(); setFailed(true); };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    cleanupTasks.push(() => renderer.domElement.removeEventListener('webglcontextlost', onContextLost));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', mode === 'explorer'
      ? 'Interactive mature HIV-1 model. Drag to rotate, scroll to zoom, or use the nearby view controls. Arrow keys rotate; plus and minus zoom; Home resets.'
      : 'Three-dimensional cutaway of a mature HIV-1 virion. Drag to rotate.');
    if (mode === 'explorer') renderer.domElement.tabIndex = 0;
    renderer.domElement.dataset.envTrimers = String(ENV_TRIMER_COUNT);
    renderer.domElement.dataset.rnaMolecules = '2';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.18, 8.35);
    const controls = new OrbitControls(camera, renderer.domElement);
    cleanupTasks.push(() => controls.dispose());
    controls.addEventListener('change', () => { dirty = true; });
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = mode === 'explorer';
    controls.minDistance = 5.8;
    controls.maxDistance = 12.5;
    controls.zoomSpeed = 0.65;
    controls.autoRotate = mode !== 'lifecycle';
    controls.autoRotateSpeed = 0.48;
    controls.rotateSpeed = 0.55;
    controls.target.set(0, 0, 0);
    controls.update();
    controls.saveState();

    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x243a31, 2.6));
    const key = new THREE.DirectionalLight(0xffe4ca, 2.3);
    key.position.set(-3.8, 5.2, 6.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 3;
    cleanupTasks.push(() => key.shadow.dispose());
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc6dcd2, 1.65);
    fill.position.set(4, 0.8, 4.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xecc49d, 1.85);
    rim.position.set(1.5, 2.2, -4.5);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x10271e, opacity: 0.12 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.55;
    floor.receiveShadow = true;
    cleanupTasks.push(() => disposeObject(floor));
    scene.add(floor);

    const virion = createVirion();
    cleanupTasks.push(() => virion.dispose());
    scene.add(virion.group);
    const lifecycleCell = mode === 'lifecycle' ? createLifecycleCell() : null;
    if (lifecycleCell) {
      scene.add(lifecycleCell.group);
      cleanupTasks.push(() => lifecycleCell.dispose());
    }

    const composer = new EffectComposer(renderer);
    cleanupTasks.push(() => composer.dispose());
    composer.addPass(new RenderPass(scene, camera));
    const ao = new SSAOPass(scene, camera, 1, 1, 16);
    cleanupTasks.push(() => { ao.dispose(); ao.noiseTexture?.dispose(); ao.ssaoMaterial.dispose(); });
    ao.kernelRadius = 0.22;
    ao.minDistance = 0.001;
    ao.maxDistance = 0.075;
    composer.addPass(ao);
    const output = new OutputPass();
    composer.addPass(output);
    cleanupTasks.push(() => output.dispose());

    let baseScale = 1;
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const verticalSpan = 2 * 8.35 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      baseScale = Math.min(1, verticalSpan * Math.min(1, camera.aspect) * 0.84 / 4.8);
      virion.group.scale.setScalar(baseScale);
      dirty = true;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    cleanupTasks.push(() => resizeObserver.disconnect());
    resize();

    let inViewport = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; dirty = true; }, { rootMargin: '150px' });
    visibilityObserver.observe(mount);
    cleanupTasks.push(() => visibilityObserver.disconnect());

    const zoom = (factor) => {
      const offset = camera.position.clone().sub(controls.target);
      const nextDistance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
      offset.setLength(nextDistance);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    };
    const resetCamera = () => {
      controls.reset();
      camera.position.set(0, 0.18, 8.35);
      controls.target.set(0, 0, 0);
      virion.group.rotation.set(0.04, -0.12, -0.04);
      controls.update();
    };
    apiRef.current = { resetCamera, zoom };

    const onKeyDown = (event) => {
      if (mode !== 'explorer') return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(0.86); }
      if (event.key === '-') { event.preventDefault(); zoom(1.16); }
      if (event.key === 'Home') { event.preventDefault(); resetCamera(); }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'ArrowLeft') spherical.theta -= 0.12;
      if (event.key === 'ArrowRight') spherical.theta += 0.12;
      if (event.key === 'ArrowUp') spherical.phi -= 0.1;
      if (event.key === 'ArrowDown') spherical.phi += 0.1;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.12, Math.PI - 0.12);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
    };
    renderer.domElement.addEventListener('keydown', onKeyDown);
    cleanupTasks.push(() => renderer.domElement.removeEventListener('keydown', onKeyDown));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const onPointerDown = (event) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    const onPointerUp = (event) => {
      if (mode !== 'explorer' || !pointerStart) return;
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const selectable = [];
      virion.group.traverseVisible((object) => { if (object.isMesh && object.userData.layer) selectable.push(object); });
      const hits = raycaster.intersectObjects(selectable, false);
      const hit = hits.find(({ object }) => {
        let current = object;
        while (current) {
          if (!current.visible) return false;
          current = current.parent;
        }
        return object.userData.layer;
      });
      if (hit) stateRef.current.onSelect?.(hit.object.userData.layer);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    cleanupTasks.push(() => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
    });

    const clock = new THREE.Clock();
    const projected = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const lifecyclePositions = [
      [0.65, 0.05, 0.35], [0.12, 0.02, 0.1], [-0.8, 0.02, 0.3],
      [-1.15, 0, 0.4], [-1.65, 0, 0.3], [-0.65, 0.08, 0.25], [1.1, 0.3, 0.2],
    ];
    const lifecycleScales = [0.6, 0.62, 0.57, 0.34, 0.25, 0.36, 0.52];
    let previousStateKey = '';
    let previousStructureKey = '';
    let previousHighlight = '';
    let previousLifecycleStep = -1;

    const updateAnnotations = (current) => {
      if (current.mode !== 'explorer' || !current.cutaway) return;
      virion.group.updateMatrixWorld(true);
      annotations.forEach((annotation) => {
        const element = labelRefs.current[annotation.id];
        if (!element) return;
        projected.copy(annotation.point);
        if (annotation.capsid) virion.capsid.localToWorld(projected);
        else virion.group.localToWorld(projected);
        projected.project(camera);
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        const offsetScale = width < 480 ? 0.55 : 1;
        const x = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * width + annotation.offset[0] * offsetScale, 8, Math.max(8, width - element.offsetWidth - 8));
        const y = THREE.MathUtils.clamp((-projected.y * 0.5 + 0.5) * height + annotation.offset[1] * offsetScale, 12, height - 38);
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        element.style.opacity = projected.z > 1 || projected.z < -1 ? '0' : '1';
      });
    };

    const render = () => {
      if (disposed) return;
      animationId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!inViewport || document.hidden) return;
      const time = clock.elapsedTime;
      const current = stateRef.current;
      const isLifecycle = current.mode === 'lifecycle';
      controls.autoRotate = current.playing && !isLifecycle;
      const stateKey = `${current.activeLayer}:${current.activeStep}:${current.cutaway}:${current.playing}`;
      if (stateKey !== previousStateKey) { dirty = true; previousStateKey = stateKey; }
      controls.update(delta);
      if (!dirty && !current.playing) return;
      dirty = false;
      const blend = 1 - Math.exp(-7 * delta);
      if (lifecycleCell) lifecycleCell.group.visible = isLifecycle;

      if (isLifecycle) {
        if (previousLifecycleStep !== current.activeStep) {
          virion.setLifecycleStep(current.activeStep);
          lifecycleCell.update(current.activeStep);
          previousLifecycleStep = current.activeStep;
          previousStructureKey = '';
        }
        targetPosition.set(...lifecyclePositions[current.activeStep]);
        virion.group.position.lerp(targetPosition, blend);
        const scale = lifecycleScales[current.activeStep] * baseScale;
        virion.group.scale.lerp(new THREE.Vector3(scale, scale, scale), blend);
        dirty = virion.group.position.distanceToSquared(targetPosition) > 0.000001 || Math.abs(virion.group.scale.x - scale) > 0.001;
        virion.group.rotation.z = -0.04;
        if (current.playing) virion.group.rotation.y += delta * 0.1;
      } else {
        previousLifecycleStep = -1;
        const isCutaway = current.mode === 'hero' ? true : current.cutaway;
        const structureKey = `${isCutaway}:${current.activeLayer}`;
        if (structureKey !== previousStructureKey) {
          virion.group.visible = true;
          virion.setCutaway(isCutaway, current.activeLayer);
          previousStructureKey = structureKey;
        }
        if (previousHighlight !== current.activeLayer) {
          virion.highlight(current.activeLayer);
          previousHighlight = current.activeLayer;
        }
        targetPosition.set(0, current.mode === 'hero' && current.playing ? Math.sin(time * 0.55) * 0.055 : 0, 0);
        virion.group.position.lerp(targetPosition, blend);
        virion.group.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), blend);
        dirty = virion.group.position.distanceToSquared(targetPosition) > 0.000001 || Math.abs(virion.group.scale.x - baseScale) > 0.001;
        virion.group.rotation.z = -0.04 + (current.mode === 'hero' && current.playing ? Math.sin(time * 0.23) * 0.025 : 0);
      }
      virion.group.updateMatrixWorld(true);
      updateAnnotations(current);
      try {
        composer.render();
        renderer.domElement.dataset.view = current.cutaway ? 'cutaway' : 'exterior';
        renderer.domElement.dataset.cameraDistance = camera.position.distanceTo(controls.target).toFixed(3);
        mount.dataset.frames = String(++frameCount);
      } catch {
        teardown();
        setFailed(true);
      }
    };
    render();
    if (!disposed) {
      mount.dataset.ready = 'true';
      stateRef.current.onAvailability?.(true);
    }
    return teardown;
    } catch {
      teardown();
      setFailed(true);
      return teardown;
    }
  }, [mode, reducedMotion]);

  return <div className={`scene scene-${mode}`} ref={mountRef}>
    {(failed || reducedMotion) && <><VirusFallback cutaway={cutaway} activeLayer={activeLayer} /><span className="fallback-caption">{reducedMotion ? 'Static illustration · reduced motion' : 'Static illustration · 3D unavailable'}</span></>}
    {mode === 'explorer' && cutaway && !failed && !reducedMotion && <div className="scene-annotations" aria-label="Selectable model labels">
      {annotations.filter((annotation) => (!annotation.selectedOnly || annotation.id === activeLayer)
        && (annotation.id !== 'rna' || !['capsid', 'matrix', 'protease', 'reverseTranscriptase', 'integrase'].includes(activeLayer))).map((annotation) => <button
        key={annotation.id}
        ref={(element) => { labelRefs.current[annotation.id] = element; }}
        className={`scene-annotation ${activeLayer === annotation.id ? 'active' : ''}`}
        onClick={() => onSelect?.(annotation.id)}
      >{annotation.label}</button>)}
    </div>}
  </div>;
});

export default Scene;
export { VirusFallback };
