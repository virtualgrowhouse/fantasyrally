class OpenWorldViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.models = [];
        this.mixers = [];
        this.physics = false;
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            canJump: false,
        };
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

        this.init();
        this.setupControls();
        this.setupEventListeners();
    }

    init() {
        const container = document.getElementById('worldContainer');
        if (!container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

        // Camera setup (First person view)
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 30);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        container.appendChild(this.renderer.domElement);

        // Lighting setup
        this.setupWorldLighting();

        // Environment setup
        this.setupWorldEnvironment();

        // Start render loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupWorldLighting() {
        // Sun (directional light)
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 4096;
        sun.shadow.mapSize.height = 4096;
        sun.shadow.camera.near = 0.1;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        this.scene.add(sun);

        // Ambient light (sky)
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.4);
        this.scene.add(ambientLight);

        // Hemisphere light for realistic outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.6);
        this.scene.add(hemisphereLight);

        // Point lights for car showcasing
        const spotLight1 = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.25, 1);
        spotLight1.position.set(25, 25, 25);
        spotLight1.castShadow = true;
        this.scene.add(spotLight1);

        const spotLight2 = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.25, 1);
        spotLight2.position.set(-25, 25, 25);
        spotLight2.castShadow = true;
        this.scene.add(spotLight2);
    }

    setupWorldEnvironment() {
        // Large ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x90EE90,
            transparent: true,
            opacity: 0.8
        });

        // Add some noise to the ground for realism
        const groundVertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < groundVertices.length; i += 3) {
            groundVertices[i + 2] += Math.random() * 2 - 1; // Random height variation
        }
        groundGeometry.computeVertexNormals();

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid for reference
        const gridHelper = new THREE.GridHelper(200, 40, 0x4a90e2, 0x4a90e2);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        this.scene.add(gridHelper);

        // Sky sphere
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Add some decorative elements
        this.addEnvironmentDecorations();
    }

    addEnvironmentDecorations() {
        // Simple trees
        for (let i = 0; i < 20; i++) {
            const tree = this.createSimpleTree();
            tree.position.set(
                (Math.random() - 0.5) * 400,
                0,
                (Math.random() - 0.5) * 400
            );
            this.scene.add(tree);
        }

        // Simple buildings/structures
        for (let i = 0; i < 5; i++) {
            const building = this.createSimpleBuilding();
            building.position.set(
                (Math.random() - 0.5) * 300,
                0,
                (Math.random() - 0.5) * 300
            );
            this.scene.add(building);
        }
    }

    createSimpleTree() {
        const tree = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 2, 10, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(8, 12, 8);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 15;
        foliage.castShadow = true;
        tree.add(foliage);

        return tree;
    }

    createSimpleBuilding() {
        const building = new THREE.Group();

        // Main structure
        const buildingGeometry = new THREE.BoxGeometry(20, 30, 20);
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.y = 15;
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        building.add(buildingMesh);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(15, 10, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 35;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        building.add(roof);

        return building;
    }

    setupControls() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));

        const container = document.getElementById('worldContainer');
        if (container) {
            container.addEventListener('click', () => {
                container.requestPointerLock();
            });

            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement === container) {
                    this.enableMouseLook();
                } else {
                    this.disableMouseLook();
                }
            });
        }
    }

    enableMouseLook() {
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    disableMouseLook() {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    onMouseMove(event) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        this.camera.rotation.y -= movementX * 0.002;
        this.camera.rotation.x -= movementY * 0.002;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.controls.moveForward = true;
                break;
            case 'KeyS':
                this.controls.moveBackward = true;
                break;
            case 'KeyA':
                this.controls.moveLeft = true;
                break;
            case 'KeyD':
                this.controls.moveRight = true;
                break;
            case 'Space':
                if (this.controls.canJump) {
                    this.velocity.y += 15;
                    this.controls.canJump = false;
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.controls.moveForward = false;
                break;
            case 'KeyS':
                this.controls.moveBackward = false;
                break;
            case 'KeyA':
                this.controls.moveLeft = false;
                break;
            case 'KeyD':
                this.controls.moveRight = false;
                break;
        }
    }

    setupEventListeners() {
        const addCarsBtn = document.getElementById('addRandomCarsBtn');
        const clearBtn = document.getElementById('clearWorldBtn');
        const physicsBtn = document.getElementById('togglePhysicsBtn');

        if (addCarsBtn) {
            addCarsBtn.addEventListener('click', () => this.addRandomCars());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearWorld());
        }

        if (physicsBtn) {
            physicsBtn.addEventListener('click', () => this.togglePhysics());
        }
    }

    async addRandomCars() {
        const carCountInput = document.getElementById('carCount');
        const count = carCountInput ? parseInt(carCountInput.value) : 5;

        const randomFiles = window.fileManager.getRandomFiles(count);

        for (const file of randomFiles) {
            try {
                await this.loadCarInWorld(file);
            } catch (error) {
                console.error(`Error loading car ${file.name}:`, error);
            }
        }

        this.updateWorldStats();
    }

    loadCarInWorld(file) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();

            loader.load(
                file.path,
                (gltf) => {
                    const model = gltf.scene;

                    // Prepare model for world
                    this.prepareWorldModel(model);

                    // Random position around the world
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 80 + 20;
                    model.position.set(
                        Math.cos(angle) * distance,
                        0,
                        Math.sin(angle) * distance
                    );

                    // Random rotation
                    model.rotation.y = Math.random() * Math.PI * 2;

                    this.scene.add(model);
                    this.models.push({
                        object: model,
                        file: file,
                        originalPosition: model.position.clone()
                    });

                    // Setup animations if any
                    if (gltf.animations && gltf.animations.length > 0) {
                        const mixer = new THREE.AnimationMixer(model);
                        gltf.animations.forEach((clip) => {
                            mixer.clipAction(clip).play();
                        });
                        this.mixers.push(mixer);
                    }

                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    prepareWorldModel(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Scale model appropriately for world
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 8) {
            const scale = 8 / maxSize;
            model.scale.setScalar(scale);
        }

        // Position on ground
        model.position.y = 0;

        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Enhance materials
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.enhanceWorldMaterial(mat));
                    } else {
                        this.enhanceWorldMaterial(child.material);
                    }
                }
            }
        });
    }

    enhanceWorldMaterial(material) {
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            material.envMapIntensity = 0.8;

            // Add some variation to make cars look different
            const variation = Math.random() * 0.3 - 0.15;
            material.metalness = Math.max(0, Math.min(1, material.metalness + variation));
            material.roughness = Math.max(0.1, Math.min(1, material.roughness + variation));
        }
    }

    clearWorld() {
        // Remove all car models
        this.models.forEach(modelData => {
            this.scene.remove(modelData.object);

            // Cleanup geometry and materials
            modelData.object.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.models = [];
        this.mixers = [];
        this.updateWorldStats();
    }

    togglePhysics() {
        this.physics = !this.physics;
        const btn = document.getElementById('togglePhysicsBtn');
        if (btn) {
            btn.textContent = this.physics ? 'Disable Physics' : 'Enable Physics';
        }

        // If enabling physics, give cars some initial movement
        if (this.physics) {
            this.models.forEach(modelData => {
                if (!modelData.velocity) {
                    modelData.velocity = new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        0,
                        (Math.random() - 0.5) * 2
                    );
                    modelData.angularVelocity = (Math.random() - 0.5) * 0.02;
                }
            });
        }
    }

    updateMovement(delta) {
        const speed = 50;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        if (this.physics) {
            this.velocity.y -= 9.8 * 3 * delta; // Gravity
        }

        this.direction.z = Number(this.controls.moveForward) - Number(this.controls.moveBackward);
        this.direction.x = Number(this.controls.moveRight) - Number(this.controls.moveLeft);
        this.direction.normalize();

        if (this.controls.moveForward || this.controls.moveBackward) {
            this.velocity.z -= this.direction.z * speed * delta;
        }
        if (this.controls.moveLeft || this.controls.moveRight) {
            this.velocity.x -= this.direction.x * speed * delta;
        }

        // Apply camera rotation to movement
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        const movement = new THREE.Vector3();
        movement.setFromMatrixColumn(this.camera.matrix, 0);
        movement.crossVectors(this.camera.up, cameraDirection);
        movement.multiplyScalar(-this.velocity.x * delta);

        const forwardMovement = new THREE.Vector3();
        forwardMovement.copy(cameraDirection);
        forwardMovement.multiplyScalar(-this.velocity.z * delta);

        this.camera.position.add(movement);
        this.camera.position.add(forwardMovement);

        if (this.physics) {
            this.camera.position.y += this.velocity.y * delta;

            // Ground collision
            if (this.camera.position.y < 10) {
                this.velocity.y = 0;
                this.camera.position.y = 10;
                this.controls.canJump = true;
            }
        }
    }

    updateCarPhysics(delta) {
        if (!this.physics) return;

        this.models.forEach(modelData => {
            if (modelData.velocity) {
                // Apply velocity
                modelData.object.position.add(
                    modelData.velocity.clone().multiplyScalar(delta)
                );

                // Apply angular velocity
                if (modelData.angularVelocity) {
                    modelData.object.rotation.y += modelData.angularVelocity * delta;
                }

                // Boundary collision (bounce off invisible walls)
                const maxDistance = 150;
                if (Math.abs(modelData.object.position.x) > maxDistance) {
                    modelData.velocity.x *= -0.8;
                    modelData.angularVelocity *= -1;
                }
                if (Math.abs(modelData.object.position.z) > maxDistance) {
                    modelData.velocity.z *= -0.8;
                    modelData.angularVelocity *= -1;
                }

                // Damping
                modelData.velocity.multiplyScalar(0.995);
                modelData.angularVelocity *= 0.995;

                // Ground constraint
                modelData.object.position.y = 0;
            }
        });
    }

    updateWorldStats() {
        const statsElement = document.getElementById('worldStats');
        if (statsElement) {
            statsElement.textContent = `Cars in world: ${this.models.length}`;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update movement
        this.updateMovement(delta);

        // Update car physics
        this.updateCarPhysics(delta);

        // Update animations
        this.mixers.forEach(mixer => mixer.update(delta));

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.getElementById('worldContainer');
        if (!container) return;

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.clearWorld();
    }
}

// Initialize open world viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.openWorld = new OpenWorldViewer();
});