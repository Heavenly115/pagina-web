import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const container = document.getElementById('canvas-container');
const loaderUI = document.querySelector('.loader-3d');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Point lights for atmosphere
const pointLight1 = new THREE.PointLight(0x00f2fe, 1, 10);
pointLight1.position.set(2, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x4facfe, 1, 10);
pointLight2.position.set(-2, 1, -2);
scene.add(pointLight2);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 20;

// --- Load 3D Model ---
const loader = new GLTFLoader();

// Replace 'assets/setup.glb' with your actual path
const modelPath = 'assets/setup.glb'; 

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(model);
        loaderUI.style.display = 'none'; // Hide loader when done
        
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
    },
    (xhr) => {
        // Optional: Update progress UI
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading: ${percent}%`);
    },
    (error) => {
        console.error('An error happened loading the model:', error);
        createPlaceholderModel();
        loaderUI.style.display = 'none';
    }
);

// Fallback placeholder if model fails to load
function createPlaceholderModel() {
    console.log("Creating placeholder model...");
    const group = new THREE.Group();
    
    // Desk surface
    const deskGeo = new THREE.BoxGeometry(4, 0.2, 2.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    group.add(desk);

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(1.5, 0.9, 0.1);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 0.8, -0.8);
    group.add(monitor);

    // Base
    const baseGeo = new THREE.BoxGeometry(0.3, 0.6, 0.3);
    const base = new THREE.Mesh(baseGeo, deskMat);
    base.position.set(0, 0.3, -0.8);
    group.add(base);
    
    scene.add(group);
    
    // Add a text message for the user
    const info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.bottom = '20px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = 'var(--text-muted)';
    info.style.fontSize = '0.8rem';
    info.innerHTML = '⚠️ Coloca tu archivo <strong>setup.glb</strong> en la carpeta <strong>assets/</strong> para verlo aquí.';
    container.appendChild(info);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
