import * as THREE FROM 'https://cdn.skypack.dev/three@0.149.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.149.0/examples/jsm/loaders/GLTFLoader.js';

const camera = new THREE.PerspectiveCamera(
10,
window.innerWidth / window.innerHeight,
0.1,
1000
);
camera.position.z = 13;

const scene = new THREE.Scene();
let gibal;
const loader = new GLTFLoader();
loader.load('gibaltumpal.gltf',
function(gltf){
gibal = gltf.scene;
scene.add(gibal);
}
function(xhr){},
function(error){}
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementByID('container3D').appendChild(renderer.domElement);