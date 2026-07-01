
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MODEL_PATH = "assets/models/model.glb";
const DEBUG_ORBIT_CONTROLS = false;

const SECTION_IDS = ["home", "about", "project", "service", "contact"];

const SECTION_POSES = {
  home:    { position: [3, 1, 0],        rotationY: -0.9,            scale: 1.0 },
  about:   { position: [3, 1, 0],        rotationY: -0.7,            scale: 1.0 },
  project: { position: [3, -0.1, 0.4], rotationY: -0.7,      scale: 2.15 },
  service: { position: [-0.4, 0.6, 0],      rotationY: 0.1, scale: 1.0 },
  contact: { position: [-0.7, 0, 0],        rotationY: 0.1,  scale: 1.5 },
};

let scene, camera, renderer, controls, clock;
let model = null;
let canvas;

let currentScroll = 0;
let targetScroll = 0;

let mouseX = 0, mouseY = 0;
let smoothMouseX = 0, smoothMouseY = 0;

const _tmpPosition = new THREE.Vector3();
const _tmpCameraTarget = new THREE.Vector3();
const _basePosition = new THREE.Vector3();

let isMobile = window.innerWidth < 768;

function initScene() {
  canvas = document.getElementById("three-canvas");
  if (!canvas) {
    console.warn("[three-scene] #three-canvas not found — skipping 3D overlay.");
    return false;
  }

  scene = new THREE.Scene();
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearAlpha(0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.physicallyCorrectLights = true;

  setupCamera();
  setupLights();
  loadModel();

  if (DEBUG_ORBIT_CONTROLS) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
  }

  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  onScroll();
  return true;
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 6);
}

function setupLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1.2);
  directional.position.set(3, 5, 4);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 20;
  scene.add(directional);

  const hemi = new THREE.HemisphereLight(0xddeeff, 0x222233, 0.6);
  scene.add(hemi);

  const rim = new THREE.DirectionalLight(0x88aaff, 0.8);
  rim.position.set(-4, 2, -4);
  scene.add(rim);
}

function loadModel() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load(
    MODEL_PATH,
    (gltf) => {
      model = gltf.scene;
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      const startPose = SECTION_POSES.home;
      model.position.set(...startPose.position);
      model.scale.setScalar(isMobile ? startPose.scale * 0.75 : startPose.scale);
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error("[three-scene] Failed to load GLB model:", error);
    }
  );
}

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

function getActiveSectionBlend() {

  const sectionEls = SECTION_IDS
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sectionEls.length === 0) {
    return { from: SECTION_POSES.home, to: SECTION_POSES.home, t: 0 };
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPx = currentScroll * maxScroll;

  let fromIndex = 0;
  for (let i = 0; i < sectionEls.length; i++) {
    if (sectionEls[i].offsetTop <= scrollPx) fromIndex = i;
  }
  const toIndex = Math.min(fromIndex + 1, sectionEls.length - 1);

  const fromTop = sectionEls[fromIndex].offsetTop;
  const toTop = sectionEls[toIndex].offsetTop;
  const span = toTop - fromTop;
  const t = span > 0 ? Math.min(Math.max((scrollPx - fromTop) / span, 0), 1) : 0;

  return {
    from: SECTION_POSES[SECTION_IDS[fromIndex]],
    to: SECTION_POSES[SECTION_IDS[toIndex]],
    t,
  };
}

function updateScroll(delta) {

  currentScroll += (targetScroll - currentScroll) * 0.08;

  if (!model) return;

  const { from, to, t } = getActiveSectionBlend();
  const mobileScale = isMobile ? 0.75 : 1;

  _basePosition.set(
    THREE.MathUtils.lerp(from.position[0], to.position[0], t),
    THREE.MathUtils.lerp(from.position[1], to.position[1], t),
    THREE.MathUtils.lerp(from.position[2], to.position[2], t)
  );

  const targetRotationY = THREE.MathUtils.lerp(from.rotationY, to.rotationY, t);
  const targetScale =
    THREE.MathUtils.lerp(from.scale, to.scale, t) * mobileScale;

  const time = clock.getElapsedTime();
  const floatY = Math.sin(time * 0.6) * 0.08;
  const idleRotation = Math.sin(time * 0.3) * 0.05;

  _tmpPosition.copy(_basePosition);
  _tmpPosition.y += floatY;

  model.position.lerp(_tmpPosition, 0.1);
  model.rotation.y += (targetRotationY + idleRotation - model.rotation.y) * 0.08;
  model.scale.setScalar(
    THREE.MathUtils.lerp(model.scale.x, targetScale, 0.08)
  );
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  updateScroll(delta);

  smoothMouseX += (mouseX - smoothMouseX) * 0.05;
  smoothMouseY += (mouseY - smoothMouseY) * 0.05;

  _tmpCameraTarget.set(smoothMouseX * 0.15, -smoothMouseY * 0.1, 6);
  camera.position.lerp(_tmpCameraTarget, 0.05);
  camera.lookAt(0, 0, 0);

  if (DEBUG_ORBIT_CONTROLS && controls) controls.update();

  renderer.render(scene, camera);
}

function onResize() {
  isMobile = window.innerWidth < 768;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

if (initScene()) {
  animate();
}
