import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import AnchorManager from './AnchorManager.js';
import InteractionManager from './InteractionManager.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

const raycaster = new THREE.Raycaster();
const anchorManager = new AnchorManager(scene);

// Define interactionManager before initializing it
const interactionManager = new InteractionManager(scene, camera, raycaster, anchorManager);

// Fetch data and create the plane
anchorManager.fetchData('anchors.json').then(() => {
    interactionManager.initialize(controls, anchorManager.dots.children, anchorManager.lines, anchorManager.plane);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
