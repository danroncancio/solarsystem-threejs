import "./style.css";
import "./style.css";
import * as THREE from "three";
//import * as dat from "dat.gui";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CelestialBody from "./planets/celestialBody";
import StarDome from "./ambient/starDome";
// trail
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
//shaders
import sunVerShader from "./shaders/planets/sunVer.glsl";
import sunFragShader from "./shaders/planets/sunFrag.glsl";
import sunShineVerShader from "./shaders/planets/sunShineVer.glsl";
import sunShineFragShader from "./shaders/planets/sunShineFrag.glsl";

let composer: EffectComposer, afterimagePass: AfterimagePass;

let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
//const gui = new dat.GUI({ name: "DebugMenu" }); // Debug util
const stats = new Stats();
let time = Date.now();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  180000
);

const pCamera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  6000
);
pCamera.position.set(1200, 0, 2600);

// Textures
const gradientTexture = new THREE.TextureLoader().load(
  "src/img/textures/gradients/planet.jpg"
);
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;

//Lights
const sunLight = new THREE.PointLight(0xffffff, 1, 100000);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024 * 250, 1024 * 250);
sunLight.shadow.camera.far = 1000;
sunLight.shadow.bias = -0.0001;

//const sphereSize = 10000;
//const pointLightHelper = new THREE.PointLightHelper(
//  sunLight,
//  sphereSize,
//  new THREE.Color(100, 0, 100)
//);
scene.add(sunLight);
//scene.add(pointLightHelper);

// Planets
let bodies: CelestialBody[] = [];

const sun = new CelestialBody("sun", 50, 1500, new THREE.Vector3(0, 0, 0));
sun.position.set(0, 0, 0);
sun.geometry = new THREE.SphereGeometry(sun.radius, 30, 30);
sun.material = new THREE.ShaderMaterial({
  vertexShader: sunVerShader,
  fragmentShader: sunFragShader,
});
sun.visible = true;

const sunShine = new THREE.Mesh();
sunShine.position.set(0, 0, 0);
sunShine.geometry = new THREE.SphereGeometry(1500, 60, 60);
sunShine.material = new THREE.ShaderMaterial({
  vertexShader: sunShineVerShader,
  fragmentShader: sunShineFragShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
sunShine.scale.set(1.1, 1.1, 1.1);

const blue = new CelestialBody("blue", 10, 300, new THREE.Vector3(0, 11.7, 0)); //10.7
blue.position.set(-10000, 0, 0);
blue.geometry = new THREE.SphereGeometry(blue.radius, 30, 30);
blue.material = new THREE.MeshLambertMaterial({ color: 0x0044ee });

const red = new CelestialBody("red", 10, 300, new THREE.Vector3(0, 8.09, 0)); //6.9, 8.05
red.position.set(-13000, 0, 0);
red.geometry = new THREE.SphereGeometry(red.radius, 30, 30);
red.material = new THREE.MeshLambertMaterial({ color: 0xee4422 });

const purple = new CelestialBody(
  "purple",
  8,
  200,
  new THREE.Vector3(0, 6.5, 0)
);
purple.position.set(-26000, 0, 0);
purple.geometry = new THREE.SphereGeometry(purple.radius, 30, 30);
purple.material = new THREE.MeshLambertMaterial({ color: 0xee22ee });
purple.add(pCamera);

const purpleMoon = new CelestialBody(
  "purpleMoon",
  4,
  70,
  new THREE.Vector3(0, 8.3, 0)
);
purpleMoon.position.set(-27000, 0, 0);
purpleMoon.geometry = new THREE.SphereGeometry(purpleMoon.radius, 30, 30);
purpleMoon.material = new THREE.MeshLambertMaterial({ color: 0xcccccc });

const giant = new CelestialBody("giant", 14, 500, new THREE.Vector3(0, 5, 0));
giant.position.set(-48000, 0, 0);
giant.geometry = new THREE.SphereGeometry(giant.radius, 30, 30);
giant.material = new THREE.MeshLambertMaterial({ color: 0xffffaa });
//pCamera.lookAt(giant.position);
giant.add(pCamera);

const neptune = new CelestialBody(
  "neptune",
  9,
  100,
  new THREE.Vector3(0, 11, 0)
);
neptune.position.set(-49000, 0, 0);
neptune.geometry = new THREE.SphereGeometry(neptune.radius, 30, 30);
neptune.material = new THREE.MeshLambertMaterial({ color: 0x00ccaa });
neptune.receiveShadow = true;

bodies.push(sun, blue, red, purple, purpleMoon, giant, neptune);
// get planets mass
bodies.forEach((planet) => {
  console.log(planet.name, planet.mass);
  if (planet.name !== "sun") {
    planet.castShadow = true;
    planet.receiveShadow = true;
  }
});

scene.add(sunShine);
scene.add(...bodies);

// Planets end

// Star dome
const testG = new THREE.Group();
const starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 2, 2));
testG.add(starMesh);
const starDome = new StarDome(
  starMesh,
  new THREE.Vector2(3, 13),
  new THREE.Vector2(0.1, 0.9),
  camera
);
scene.add(starDome.starGroup);
console.log(scene);

function animate() {
  // Delta
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;

  stats.begin();
  //console.log(earth.position);
  for (let i = 0; i < bodies.length; i++) {
    bodies[i].updateVelocity(bodies, 0.09 * deltaTime);
  }

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].updatePosition(0.09 * deltaTime);
  }

  //temp.setFromMatrixPosition(cameraPole.matrixWorld);
  //camera.position.lerp(temp, 0.2);
  //camera.lookAt(pEarth.position);

  renderer.render(scene, camera);
  //composer.render();
  controls.update();
  stats.end();
  requestAnimationFrame(animate);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

function createScene() {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  camera.position.z = 50000;

  //Trail
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, pCamera));

  afterimagePass = new AfterimagePass();
  composer.addPass(afterimagePass);

  //gui.add(afterimagePass.uniforms["damp"], "value", 0, 1).step(0.001);

  resize();
  animate();
}

createScene();

addEventListener("resize", resize);
