class ThreeJSViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.isWireframe = false;
        this.originalMaterials = new Map();

        this.init();
        this.setupEventListeners();
    }

    init() {
        const container = document.getElementById('viewerContainer');
        if (!container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        container.appendChild(this.renderer.domElement);

        // Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;

        // Lighting setup
        this.setupLighting();

        // Environment
        this.setupEnvironment();

        // Start render loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0x4a90e2, 0.3);
        fillLight1.position.set(-5, 5, -5);
        this.scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xff6b6b, 0.2);
        fillLight2.position.set(0, -5, 5);
        this.scene.add(fillLight2);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x4a90e2, 0.5, 20);
        pointLight1.position.set(10, 5, 0);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.5, 20);
        pointLight2.position.set(-10, 5, 0);
        this.scene.add(pointLight2);
    }

    setupEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.3
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid helper
        const gridHelper = new THREE.GridHelper(50, 50, 0x4a90e2, 0x333333);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);

        // Fog for atmosphere
        this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 100);
    }

    setupEventListeners() {
        const loadBtn = document.getElementById('loadModelBtn');
        const resetBtn = document.getElementById('resetCameraBtn');
        const wireframeBtn = document.getElementById('wireframeBtn');

        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadSelectedModel());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCamera());
        }

        if (wireframeBtn) {
            wireframeBtn.addEventListener('click', () => this.toggleWireframe());
        }
    }

    async loadSelectedModel() {
        const select = document.getElementById('modelSelect');
        if (!select || !select.value) return;

        const modelPath = select.value;
        const file = window.fileManager.getFileByPath(modelPath);

        if (!file) return;

        this.showLoading(true);

        try {
            await this.loadModel(modelPath);
            this.updateModelInfo(file);
        } catch (error) {
            console.error('Error loading model:', error);
            this.updateModelInfo(null, 'Error loading model');
        } finally {
            this.showLoading(false);
        }
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();

            loader.load(
                path,
                (gltf) => {
                    this.clearCurrentModel();

                    const model = gltf.scene;
                    this.currentModel = model;

                    // Store original materials for wireframe toggle
                    this.storeOriginalMaterials(model);

                    // Scale and position the model appropriately
                    this.prepareModel(model);

                    // Add to scene
                    this.scene.add(model);

                    // Setup animations if any
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(model);
                        gltf.animations.forEach((clip) => {
                            this.mixer.clipAction(clip).play();
                        });
                    }

                    // Center camera on model
                    this.centerCameraOnModel(model);

                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`Loading progress: ${percent.toFixed(2)}%`);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    storeOriginalMaterials(object) {
        this.originalMaterials.clear();

        object.traverse((child) => {
            if (child.isMesh && child.material) {
                this.originalMaterials.set(child, child.material.clone());
            }
        });
    }

    prepareModel(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Scale model to fit in a reasonable size
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 5) {
            const scale = 5 / maxSize;
            model.scale.setScalar(scale);
        }

        // Center the model
        model.position.sub(center.multiplyScalar(model.scale.x));

        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Enhance materials
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.enhanceMaterial(mat));
                    } else {
                        this.enhanceMaterial(child.material);
                    }
                }
            }
        });
    }

    enhanceMaterial(material) {
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            material.envMapIntensity = 0.5;
            material.metalness = Math.min(material.metalness + 0.1, 1);
            material.roughness = Math.max(material.roughness - 0.1, 0);
        }
    }

    centerCameraOnModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 2;

        this.camera.position.set(
            center.x + distance,
            center.y + distance * 0.5,
            center.z + distance
        );

        this.controls.target.copy(center);
        this.controls.update();
    }

    clearCurrentModel() {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel = null;
        }

        if (this.mixer) {
            this.mixer = null;
        }

        this.originalMaterials.clear();
    }

    resetCamera() {
        if (this.currentModel) {
            this.centerCameraOnModel(this.currentModel);
        } else {
            this.camera.position.set(0, 2, 5);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }

    toggleWireframe() {
        if (!this.currentModel) return;

        this.isWireframe = !this.isWireframe;

        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (this.isWireframe) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.wireframe = true);
                    } else {
                        child.material.wireframe = true;
                    }
                } else {
                    const originalMaterial = this.originalMaterials.get(child);
                    if (originalMaterial) {
                        child.material = originalMaterial.clone();
                    }
                }
            }
        });

        const btn = document.getElementById('wireframeBtn');
        if (btn) {
            btn.textContent = this.isWireframe ? 'Disable Wireframe' : 'Toggle Wireframe';
        }
    }

    updateModelInfo(file, errorMessage = null) {
        const nameElement = document.getElementById('modelName');
        const detailsElement = document.getElementById('modelDetails');

        if (errorMessage) {
            nameElement.textContent = 'Error';
            detailsElement.textContent = errorMessage;
            return;
        }

        if (file) {
            nameElement.textContent = file.displayName;
            detailsElement.innerHTML = `
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${window.fileManager.formatFileSize(file.size)}<br>
                <strong>Modified:</strong> ${window.fileManager.formatDate(file.lastModified)}<br>
                <strong>Type:</strong> GLB (Binary glTF)
            `;
        } else {
            nameElement.textContent = 'No model loaded';
            detailsElement.textContent = 'Select a model to view details';
        }
    }

    showLoading(show) {
        const container = document.getElementById('viewerContainer');
        if (!container) return;

        let loadingElement = container.querySelector('.loading-overlay');

        if (show && !loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading-overlay';
            loadingElement.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 1.2em;
                z-index: 1000;
            `;
            loadingElement.innerHTML = 'Loading model<div class="loading-spinner"></div>';
            container.appendChild(loadingElement);
        } else if (!show && loadingElement) {
            loadingElement.remove();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        if (this.mixer) {
            this.mixer.update(delta);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.getElementById('viewerContainer');
        if (!container) return;

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// Initialize viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new ThreeJSViewer();
});