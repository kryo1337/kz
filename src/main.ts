import './style.css';
import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import RAPIER from '@dimforge/rapier3d-compat';
import { PlayerController } from './player';
import { LevelGenerator } from './level_generator';
import { UIManager } from './ui_manager';

// --- CONFIG ---
const CONFIG = {
  fov: 90,
  defaultSensitivity: 1.0,
  gravity: { x: 0.0, y: -16.0, z: 0.0 },
  skyboxPath: '/textures/skybox/DayInTheClouds4k.hdr'
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  stencil: false,
  depth: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
document.body.appendChild(renderer.domElement);

// --- SKYBOX ---
new HDRLoader().load(
  CONFIG.skyboxPath,
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  },
  undefined,
  (error) => {
    console.error('An error occurred loading the skybox:', error);
    scene.background = new THREE.Color(0x87CEEB);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  }
);

// --- LIGHTS ---
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 50, 10);
scene.add(dirLight);

// --- PHYSICS INIT ---
await RAPIER.init();
const world = new RAPIER.World(CONFIG.gravity);

// --- WORLD GEN ---
const levelGen = new LevelGenerator(scene, world);
levelGen.createGround();
levelGen.createBhopCourse();
levelGen.createSurfRamps();

// --- PLAYER ---
const player = new PlayerController(camera, document.body, world, {
  mouseSensitivity: CONFIG.defaultSensitivity,
});

// --- UI ---
const ui = new UIManager(CONFIG.defaultSensitivity);
ui.onSensitivityChange((val) => player.setSensitivity(val));

let isPaused = false;
let lastStateChangeTime = 0;

function setupEventListeners() {
  ui.onResume = () => {
    document.body.requestPointerLock();
  };

  document.addEventListener('pointerlockchange', () => {
    lastStateChangeTime = performance.now();
    if (document.pointerLockElement === document.body) {
      isPaused = false;
      ui.toggleMenu(false);
    } else {
      isPaused = true;
      ui.toggleMenu(true);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Escape' && isPaused) {
      if (performance.now() - lastStateChangeTime > 100) {
        document.body.requestPointerLock();
      }
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

setupEventListeners();

// --- LOOP ---
const clock = new THREE.Clock();
let frameCount = 0;
let lastTime = 0;
let fps = 0;

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const dt = Math.min(clock.getDelta(), 0.1);

  if (!isPaused) {
    world.timestep = dt;
    world.step();
    player.update(dt);
  }

  player.syncCamera();

  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = now;
  }

  const speed = player.getSpeed();
  ui.update(fps, speed);

  renderer.render(scene, camera);
}

gameLoop();
