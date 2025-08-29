//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// --- Smooth nav button scrolling ---
document.querySelectorAll('.nav-buttons .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Parallax ---
const layers = document.querySelectorAll('section .parallax-layer .shape');
function onScrollParallax() {
  layers.forEach(el => {
    const section = el.closest('section');
    const speed = parseFloat(section?.dataset?.speed) || 0.08;
    const rect = section.getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * speed;
    el.style.transform = `translate3d(0, ${offset}px, 0) rotate(${offset / 40}deg)`;
  });
}
window.addEventListener('scroll', onScrollParallax, { passive: true });
onScrollParallax();

// --- Highlight active nav ---
const sections = document.querySelectorAll('main section');
const navButtons = document.querySelectorAll('.nav-buttons .btn');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
    }
  });
}, { threshold: 0.6 });
sections.forEach(s => observer.observe(s));


  function initScene(containerId, modelPath, position, scale = 0.15) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById(containerId).appendChild(renderer.domElement);

  const topLight = new THREE.DirectionalLight(0xffffff, 1);
  topLight.position.set(400, 400, 400);
  scene.add(topLight);

  const ambientLight = new THREE.AmbientLight(0x333333, 5);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  let mouseX = window.innerWidth / 4;
  let mouseY = window.innerHeight / 4;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const loader = new GLTFLoader();
  let object;
  loader.load(
    modelPath,
    (gltf) => {
      object = gltf.scene;
      object.rotation.y = Math.PI / 2;
      object.scale.set(scale, scale, scale); // Use custom scale
      object.position.set(position.x, position.y, position.z);
      scene.add(object);
    }
  );

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (object) {
      object.rotation.y = -3 + (mouseX / window.innerWidth) * 3;
      object.rotation.x = -1.2 + (mouseY * 2.5 / window.innerHeight);
    }
    renderer.render(scene, camera);
  }
  animate();
}

// Positions and scales
initScene('container3D', './models/gibal/scene.gltf', { x: -2, y: 10, z: 0 }); // Left
initScene('container3D2', './models/gibal2/scene.gltf', { x: -2, y: 15, z: 0 }, 1); // Top, bigger
initScene('container3D3', './models/gibal3/scene.gltf', { x: 10, y: 0, z: 0 }); // Right
initScene('container3D4', './models/gibal4/scene.gltf', { x: 0, y: -10, z: 0 }, 0.8); // Bottom


//arrow-down home button
document.querySelector('.scroll-down').addEventListener('click', () => {
  document.querySelector('#profile').scrollIntoView({ 
    behavior: 'smooth' 
  });
});

// portfolio pop-up
const projects = document.querySelectorAll('.project');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalMedia = document.getElementById('modalMedia'); // container for image OR video
const modalDesc = document.getElementById('modalDesc');
const closeModal = document.getElementById('closeModal');

projects.forEach(project => {
    project.addEventListener('click', () => {
        modalTitle.textContent = project.dataset.title;
        modalDesc.textContent = project.dataset.desc;

        // Clear old content
        modalMedia.innerHTML = "";

        if (project.dataset.video) {
            // If project has a video
            const video = document.createElement('video');
            video.src = project.dataset.video;
            video.controls = true;
            video.autoplay = true;
            video.muted = false;
            video.loop = false;
            video.style.width = "100%";
            video.style.borderRadius = "10px";
            modalMedia.appendChild(video);
        } else if (project.dataset.img) {
            // If project has an image
            const img = document.createElement('img');
            img.src = project.dataset.img;
            img.alt = project.dataset.title;
            modalMedia.appendChild(img);
        }

        modal.style.display = 'flex';
    });
});

// close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalMedia.innerHTML = ""; // clear media so video stops
});

// close modal when clicking outside content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modalMedia.innerHTML = ""; // clear media so video stops
    }
});

//backtotop
  const backToTop = document.getElementById("backToTop");

  function toggleArrow() {
    backToTop.style.display = window.scrollY > 400 ? "block" : "none";
  }

  // Run on load
  window.addEventListener("load", toggleArrow);
  // Run on scroll
  window.addEventListener("scroll", toggleArrow);

  // scroll to #home smoothly
  backToTop.addEventListener("click", () => {
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  });
