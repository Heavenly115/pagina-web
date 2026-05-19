import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// --- Scene Setup ---
const container = document.getElementById('canvas-container');
const loaderUI = document.querySelector('.loader-3d');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(6, 5, -6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15; // Beautiful, cinematic color exposure
container.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x22183d, 0.6); // Deep atmospheric purple ambient
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xbd24ff, 0.4); // Soft purple top light
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 20;

// --- Load 3D Model ---
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

// Replace 'assets/setup.glb' with your actual path
const modelPath = 'assets/setupv4-v1.glb'; 

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;
        
        // Realistic deep neon purple/violet ceiling glow with physical decay
        const purpleNeon = new THREE.PointLight(0xbd24ff, 8.5, 15); 
        purpleNeon.decay = 2.0; // Physically correct quadratic decay
        purpleNeon.position.set(0, 3.5, 0);
        purpleNeon.castShadow = true;
        scene.add(purpleNeon);

        // Warm bedside/desk spot lights with physical decay for realistic rolloff
        const deskLight = new THREE.PointLight(0xff9d3b, 5.0, 7.5);
        deskLight.decay = 2.0;
        deskLight.castShadow = true;
        
        const bedLight = new THREE.PointLight(0xff5500, 6.0, 7.5);
        bedLight.decay = 2.0;
        bedLight.castShadow = true;

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                if (node.material) {
                    node.material = node.material.clone(); // Clone material to apply unique shadings safely
                    node.material.roughness = Math.max(node.material.roughness, 0.4); // Less plastic reflectivity
                    
                    const nameLower = node.name.toLowerCase();
                    
                    // Sombreados en morado neon para aspectos claves
                    // Si el objeto es oscuro o es clave (chasis, teclado, raton, cama, mesa), le damos un tinte o brillo morado
                    if (nameLower.includes('key') || nameLower.includes('teclado') || nameLower.includes('mouse') || 
                        nameLower.includes('chasis') || nameLower.includes('mesa') || nameLower.includes('desk') || 
                        nameLower.includes('pc') || nameLower.includes('bed') || nameLower.includes('cama')) {
                        // Mezclar el color base con morado neón
                        node.material.color.lerp(new THREE.Color(0xbd24ff), 0.15);
                        // Añadir un suave sombreado/brillo emisivo morado
                        node.material.emissive = new THREE.Color(0xbd24ff);
                        node.material.emissiveIntensity = 0.25;
                    }

                    // Realistic, deep violet neon emissive glow for LED strip mallas
                    if (nameLower.includes('led') || nameLower.includes('light') || nameLower.includes('neon')) {
                        node.material.emissive = new THREE.Color(0xbd24ff);
                        node.material.emissiveIntensity = 3.5; // Realistic emissive strength
                    }
                    
                    // Screen / monitor texture emission handling
                    if (nameLower.includes('screen') || 
                        nameLower.includes('monitor') || 
                        nameLower.includes('tv') || 
                        nameLower.includes('samsung') || 
                        node.name.includes('Object 64')) {
                        
                        // Lower emissive intensity so the texture details are extremely sharp and visible
                        node.material.emissiveIntensity = 0.1; 
                        
                        // If it has a texture map, use it as the emissiveMap so the screen glows with the actual image!
                        if (node.material.map && !node.material.emissiveMap) {
                            node.material.emissiveMap = node.material.map;
                            node.material.emissive = new THREE.Color(0xffffff);
                        }
                    } else if (node.material.color && node.material.color.getHex() < 0x222222) {
                        // Aplicar sombreado morado ambiental a objetos muy oscuros/negros para que no se pierdan en la sombra
                        node.material.emissive = new THREE.Color(0x9a2df5);
                        node.material.emissiveIntensity = 0.12;
                    }
                }
            }
        });

        // Place custom warm lights dynamically at coordinates of monitor and bed
        model.traverse((node) => {
            if (node.isMesh) {
                const nameLower = node.name.toLowerCase();
                
                if (nameLower.includes('samsung') || nameLower.includes('mesa')) {
                    const pos = new THREE.Vector3();
                    node.getWorldPosition(pos);
                    deskLight.position.copy(pos).add(new THREE.Vector3(0.5, 1.2, 0.5));
                }
                
                if (nameLower.includes('basecama') || nameLower.includes('bedside')) {
                    const pos = new THREE.Vector3();
                    node.getWorldPosition(pos);
                    bedLight.position.copy(pos).add(new THREE.Vector3(-0.5, 1.0, -0.5));
                }
            }
        });

        scene.add(deskLight);
        scene.add(bedLight);

        scene.add(model);
        loaderUI.style.display = 'none'; // Hide loader when done
        
        // Center model and dynamically set optimal camera distance based on bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);

        // Adjust camera dynamically to fit the model perfectly in the viewport
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraDistance *= 1.35; // Add elegant padding

        // Position camera at a perfect isometric angle relative to the centered model
        const isometricRatio = new THREE.Vector3(1.1, 0.95, -1.1).normalize();
        camera.position.copy(isometricRatio).multiplyScalar(cameraDistance);
        camera.lookAt(0, 0, 0);
        
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.minDistance = maxDim * 0.4;
            controls.maxDistance = maxDim * 4.0;
            controls.update();
        }

        // Dynamically list actual objects from the 3D model (Disabled to keep hardcoded list)
        /*
        const elementList = document.getElementById('gltf-elements-list');
        if (elementList) {
            elementList.innerHTML = '';
            const meshNames = [];
            model.traverse((node) => {
                if (node.isMesh && node.name) {
                    // Clean names (remove Blender suffix like .001 or _mesh)
                    let cleanName = node.name
                        .replace(/[-_]?(mesh|Mesh|geo|Geo)/g, '')
                        .replace(/\.\d+/g, '')
                        .replace(/_1|_2|_3|_4/g, '')
                        .replace(/_/g, ' ')
                        .trim();
                    
                    // Capitalize words
                    cleanName = cleanName.split(' ')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    
                    // Exclude generic/empty names and helpers
                    if (cleanName && 
                        cleanName.length > 2 && 
                        !meshNames.includes(cleanName) &&
                        !['Plane', 'Cube', 'Cylinder', 'Sphere', 'Circle', 'Grid'].includes(cleanName)) {
                        meshNames.push(cleanName);
                    }
                }
            });

            // Sort names alphabetically
            meshNames.sort();

            if (meshNames.length > 0) {
                meshNames.forEach((name, idx) => {
                    const li = document.createElement('li');
                    li.textContent = `${idx + 1}. ${name}`;
                    elementList.appendChild(li);
                });
            } else {
                elementList.innerHTML = '<li>No se detectaron objetos nombrados en el modelo.</li>';
            }
        }
        */
    },
    (xhr) => {
        // Update progress UI on screen
        if (xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            const loaderText = loaderUI.querySelector('p');
            if (loaderText) {
                loaderText.textContent = `Cargando Escena 3D... ${percent}%`;
            }
            console.log(`Loading: ${percent}%`);
        } else {
            // If total size is not available (e.g. gzip)
            const loaderText = loaderUI.querySelector('p');
            if (loaderText) {
                const mbLoaded = (xhr.loaded / (1024 * 1024)).toFixed(1);
                loaderText.textContent = `Cargando Escena 3D... ${mbLoaded} MB`;
            }
        }
    },
    (error) => {
        console.error('An error happened loading the model:', error);
        createPlaceholderModel();
        loaderUI.style.display = 'none';
    }
);

// --- Mobile Menu Toggle ---
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenu.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenu.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        });
    });
}

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
    const monitorGeo = new THREE.BoxGeometry(1.8, 1.1, 0.1);
    const monitorMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.1
    });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 1.0, -0.8);
    group.add(monitor);

    // Screen content (glowing rectangle)
    const screenGeo = new THREE.PlaneGeometry(1.7, 1.0);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.2 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.0, -0.74);
    group.add(screen);

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
    info.innerHTML = '⚠️ Error al cargar <strong>setupv4-v1.glb</strong>. Asegúrate de abrir la página con un <strong>servidor local</strong> (ej. Live Server en VS Code), no abriendo el archivo directamente.';
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
