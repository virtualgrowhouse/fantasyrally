class ThumbnailGenerator {
    constructor() {
        this.thumbnails = new Map();
        this.loadingThumbnails = new Set();
    }

    async generateThumbnail(file) {
        if (this.thumbnails.has(file.path)) {
            return this.thumbnails.get(file.path);
        }

        if (this.loadingThumbnails.has(file.path)) {
            return null; // Still loading
        }

        this.loadingThumbnails.add(file.path);

        try {
            const thumbnailData = await this.createThumbnailFromModel(file.path);
            this.thumbnails.set(file.path, thumbnailData);
            this.loadingThumbnails.delete(file.path);
            return thumbnailData;
        } catch (error) {
            console.error(`Error generating thumbnail for ${file.path}:`, error);
            this.loadingThumbnails.delete(file.path);
            return null;
        }
    }

    createThumbnailFromModel(modelPath) {
        return new Promise((resolve, reject) => {
            // Create a temporary scene for thumbnail generation
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x2a2a3e);

            // Camera setup
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

            // Renderer setup
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;

            const renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            renderer.setSize(256, 256);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Lighting for thumbnail
            this.setupThumbnailLighting(scene);

            // Load the model
            const loader = new THREE.GLTFLoader();

            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;

                    // Prepare model for thumbnail
                    this.prepareThumbnailModel(model);
                    scene.add(model);

                    // Position camera optimally
                    this.positionThumbnailCamera(camera, model);

                    // Render thumbnail
                    renderer.render(scene, camera);

                    // Convert to base64 image data
                    const imageData = canvas.toDataURL('image/png');

                    // Cleanup
                    this.cleanupThumbnailScene(scene, renderer);

                    resolve({
                        dataUrl: imageData,
                        width: 256,
                        height: 256
                    });
                },
                (progress) => {
                    // Progress callback - could be used to show loading progress
                },
                (error) => {
                    this.cleanupThumbnailScene(scene, renderer);
                    reject(error);
                }
            );
        });
    }

    setupThumbnailLighting(scene) {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(3, 3, 3);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
        fillLight.position.set(-2, 1, -2);
        scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xff6b6b, 0.3);
        rimLight.position.set(0, -2, 2);
        scene.add(rimLight);
    }

    prepareThumbnailModel(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Scale model to fit thumbnail
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 3) {
            const scale = 3 / maxSize;
            model.scale.setScalar(scale);
        }

        // Center the model
        model.position.sub(center.multiplyScalar(model.scale.x));

        // Enable shadows and enhance materials
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.enhanceThumbnailMaterial(mat));
                    } else {
                        this.enhanceThumbnailMaterial(child.material);
                    }
                }
            }
        });
    }

    enhanceThumbnailMaterial(material) {
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            // Boost material properties for better thumbnail appearance
            material.metalness = Math.min(material.metalness + 0.2, 1);
            material.roughness = Math.max(material.roughness - 0.2, 0.1);

            // Increase emissive slightly for better visibility
            if (material.emissive) {
                material.emissive.multiplyScalar(1.2);
            }
        }
    }

    positionThumbnailCamera(camera, model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 2.5;

        // Position camera at an appealing angle
        camera.position.set(
            center.x + distance * 0.8,
            center.y + distance * 0.6,
            center.z + distance * 0.8
        );

        camera.lookAt(center);
    }

    cleanupThumbnailScene(scene, renderer) {
        // Dispose of geometries and materials
        scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        if (material.roughnessMap) material.roughnessMap.dispose();
                        if (material.metalnessMap) material.metalnessMap.dispose();
                        material.dispose();
                    });
                } else {
                    if (object.material.map) object.material.map.dispose();
                    if (object.material.normalMap) object.material.normalMap.dispose();
                    if (object.material.roughnessMap) object.material.roughnessMap.dispose();
                    if (object.material.metalnessMap) object.material.metalnessMap.dispose();
                    object.material.dispose();
                }
            }
        });

        renderer.dispose();
    }

    async generateThumbnailElement(file) {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = 'thumbnail-item';
        thumbnailItem.dataset.path = file.path;

        // Create canvas element for thumbnail
        const canvas = document.createElement('canvas');
        canvas.className = 'thumbnail-canvas';
        canvas.width = 256;
        canvas.height = 256;

        // Show loading state
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#4a90e2';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', 128, 128);

        const info = document.createElement('div');
        info.className = 'thumbnail-info';
        info.innerHTML = `
            <h3>${file.displayName}</h3>
            <p>Size: ${window.fileManager.formatFileSize(file.size)}</p>
            <p>Modified: ${window.fileManager.formatDate(file.lastModified)}</p>
        `;

        thumbnailItem.appendChild(canvas);
        thumbnailItem.appendChild(info);

        // Add click handler to load in viewer
        thumbnailItem.addEventListener('click', () => {
            this.loadInViewer(file);
        });

        // Generate actual thumbnail
        try {
            const thumbnailData = await this.generateThumbnail(file);
            if (thumbnailData) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, 256, 256);
                    ctx.drawImage(img, 0, 0, 256, 256);
                };
                img.src = thumbnailData.dataUrl;
            }
        } catch (error) {
            // Show error state
            ctx.clearRect(0, 0, 256, 256);
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Error loading', 128, 120);
            ctx.fillText('thumbnail', 128, 140);
        }

        return thumbnailItem;
    }

    loadInViewer(file) {
        // Switch to viewer tab
        const viewerBtn = document.getElementById('viewerBtn');
        const galleryBtn = document.getElementById('galleryBtn');
        const worldBtn = document.getElementById('worldBtn');

        if (viewerBtn && galleryBtn && worldBtn) {
            // Update navigation
            galleryBtn.classList.remove('active');
            worldBtn.classList.remove('active');
            viewerBtn.classList.add('active');

            // Switch views
            document.getElementById('gallery').classList.remove('active');
            document.getElementById('world').classList.remove('active');
            document.getElementById('viewer').classList.add('active');

            // Set the model in the select dropdown
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect) {
                modelSelect.value = file.path;

                // Trigger model loading
                if (window.viewer) {
                    window.viewer.loadSelectedModel();
                }
            }
        }
    }

    clearThumbnails() {
        this.thumbnails.clear();
        this.loadingThumbnails.clear();
    }
}

// Global instance
window.thumbnailGenerator = new ThumbnailGenerator();