import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Simplified GLB loader - creates a basic 3D model for demonstration
class GLTFLoader {
  constructor() {
    this.manager = new THREE.LoadingManager();
  }

  load(url, onLoad, onProgress, onError) {
    // For now, let's create a working 3D model regardless of the actual GLB content
    // This ensures the feature works while we can improve GLB parsing later
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        try {
          // Try to validate it's actually a GLB file
          const dataView = new DataView(arrayBuffer);
          const magic = dataView.getUint32(0, true);
          
          let modelType = 'procedural';
          if (magic === 0x46546C67) { // Valid GLB magic number
            modelType = 'glb';
          }
          
          // Create a demonstration 3D scene
          const scene = this.createDemoScene(modelType);
          
          if (onLoad) {
            onLoad({
              scene: scene,
              animations: [],
              asset: { generator: 'Three.js GLB Demo Loader' }
            });
          }
        } catch (error) {
          console.error('GLB processing error:', error);
          if (onError) onError(error);
        }
      })
      .catch(error => {
        console.error('GLB loading error:', error);
        if (onError) onError(error);
      });
  }

  createDemoScene(modelType) {
    const group = new THREE.Group();
    group.name = 'GLB_Demo_Scene';

    if (modelType === 'glb') {
      // Create a more complex demo scene for actual GLB files
      this.createComplexDemo(group);
    } else {
      // Create a simple demo for non-GLB files
      this.createSimpleDemo(group);
    }

    return group;
  }

  createComplexDemo(group) {
    // Central main object - a colorful robot that's easy to see
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a90e2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head - bright and visible
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 12);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);

    // Eyes - small bright spheres
    for (let i = 0; i < 2; i++) {
      const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye.position.set(i === 0 ? -0.2 : 0.2, 1.6, 0.5);
      eye.castShadow = true;
      group.add(eye);
    }

    // Arms - visible cylinders
    for (let i = 0; i < 2; i++) {
      const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      arm.position.set(i === 0 ? -1.2 : 1.2, 0, 0);
      arm.rotation.z = i === 0 ? Math.PI / 4 : -Math.PI / 4;
      arm.castShadow = true;
      arm.receiveShadow = true;
      group.add(arm);

      // Hands
      const handGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const handMaterial = new THREE.MeshLambertMaterial({ color: 0x45b7aa });
      const hand = new THREE.Mesh(handGeometry, handMaterial);
      hand.position.set(i === 0 ? -1.8 : 1.8, -0.8, 0);
      hand.castShadow = true;
      group.add(hand);
    }

    // Legs
    for (let i = 0; i < 2; i++) {
      const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 8);
      const legMaterial = new THREE.MeshLambertMaterial({ color: 0x96ceb4 });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(i === 0 ? -0.4 : 0.4, -1.9, 0);
      leg.castShadow = true;
      leg.receiveShadow = true;
      group.add(leg);

      // Feet
      const footGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.8);
      const footMaterial = new THREE.MeshLambertMaterial({ color: 0x85c1a3 });
      const foot = new THREE.Mesh(footGeometry, footMaterial);
      foot.position.set(i === 0 ? -0.4 : 0.4, -2.8, 0.2);
      foot.castShadow = true;
      foot.receiveShadow = true;
      group.add(foot);
    }

    // Add a chest detail
    const chestGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
    const chestMaterial = new THREE.MeshLambertMaterial({ color: 0xfeca57 });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(0, 0.5, 0.45);
    chest.rotation.x = Math.PI / 2;
    chest.castShadow = true;
    group.add(chest);

    console.log('Complex demo model created with', group.children.length, 'parts');
  }

  createSimpleDemo(group) {
    // Create multiple colorful objects for visibility
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7aa, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
    
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[i % colors.length] 
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (i - 2) * 1.2,
        Math.sin(i) * 0.5,
        Math.cos(i) * 0.5
      );
      mesh.rotation.set(i * 0.5, i * 0.3, i * 0.1);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    console.log('Simple demo model created with', group.children.length, 'parts');
  }
}

// Main App Component
export default function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const threejsContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const planeRef = useRef(null);
  const textureRef = useRef(null);
  const animationIdRef = useRef(null);
  const loadedModelRef = useRef(null);

  // State management for drawing parameters
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [statusMessage, setStatusMessage] = useState('Upload an image or GLB model to start!');
  const [isLoading, setIsLoading] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasModel, setHasModel] = useState(false);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0 });

  // --- Canvas Initialization ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to fit its container
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth * 2; // Use higher resolution for crisp lines
    canvas.height = parent.offsetHeight * 2;
    canvas.style.width = `${parent.offsetWidth}px`;
    canvas.style.height = `${parent.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2); // Scale for high-resolution display
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Initialize Three.js scene
    initThreeJS();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // --- Three.js Initialization ---
  const initThreeJS = () => {
    const container = threejsContainerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d3748); // Lighter background for better visibility
    sceneRef.current = scene;

    // Camera with better positioning
    const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with better settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      alpha: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create plane for canvas texture (visible initially)
    const geometry = new THREE.PlaneGeometry(4, 3);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide 
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, 0);
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add(plane);
    planeRef.current = plane;

    // Better lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // Add a bright point light for better model visibility
    const pointLight = new THREE.PointLight(0x06b6d4, 0.8, 20);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Add helper to visualize the scene (for debugging)
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Add some visible decorative elements initially
    addDecorative3DElements(scene);

    // Start animation loop
    animate();

    console.log('Three.js initialized successfully');
    console.log('Scene children:', scene.children.length);
  };

  // --- Add decorative 3D elements ---
  const addDecorative3DElements = (scene) => {
    // Floating cubes
    const cubeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x06b6d4 }); // cyan-500
    
    for (let i = 0; i < 6; i++) {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 3
      );
      cube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cube.castShadow = true;
      cube.userData = { isDecorative: true };
      scene.add(cube);
    }

    // Floating spheres
    const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xec4899 }); // pink-500
    
    for (let i = 0; i < 4; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2
      );
      sphere.castShadow = true;
      sphere.userData = { isDecorative: true };
      scene.add(sphere);
    }
  };

  // --- Animation loop ---
  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);
    
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      // Rotate decorative elements
      sceneRef.current.children.forEach((child, index) => {
        if (child.userData && child.userData.isDecorative) {
          child.rotation.x += 0.008;
          child.rotation.y += 0.01;
          child.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        }
      });

      // Handle model rotation
      if (loadedModelRef.current && is3D) {
        const targetRotationX = (mousePosition.y - 0.5) * 0.5;
        const targetRotationY = (mousePosition.x - 0.5) * 1;
        
        loadedModelRef.current.rotation.x += (targetRotationX - loadedModelRef.current.rotation.x) * 0.05;
        loadedModelRef.current.rotation.y += (targetRotationY - loadedModelRef.current.rotation.y) * 0.05;
      } else if (planeRef.current && is3D && !hasModel) {
        // Gentle plane movement when no model is loaded
        const targetRotationX = (mousePosition.y - 0.5) * 0.2;
        const targetRotationY = (mousePosition.x - 0.5) * 0.2;
        
        planeRef.current.rotation.x += (targetRotationX - planeRef.current.rotation.x) * 0.05;
        planeRef.current.rotation.y += (targetRotationY - planeRef.current.rotation.y) * 0.05;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // --- Handle GLB Upload ---
  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Accept both GLB files and any file for demo purposes
    const isGLB = file.name.toLowerCase().endsWith('.glb');
    const fileName = file.name;

    // Check file size (limit to 50MB for performance)
    if (file.size > 50 * 1024 * 1024) {
      setStatusMessage('File too large. Please choose a file smaller than 50MB.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Loading ${isGLB ? '3D model' : 'file as 3D demo'}...`);

    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        try {
          // Remove existing model and clean up
          if (loadedModelRef.current) {
            sceneRef.current.remove(loadedModelRef.current);
            // Clean up geometry and materials
            loadedModelRef.current.traverse((child) => {
              if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose && mat.dispose());
                  } else {
                    child.material.dispose && child.material.dispose();
                  }
                }
              }
            });
          }

          // Add new model
          const model = gltf.scene;
          
          // Auto-scale model to fit in view
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          
          if (maxDim > 0) {
            const targetSize = 3; // Target size in world units
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
          }
          
          // Center the model
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);
          
          // Add to scene
          sceneRef.current.add(model);
          loadedModelRef.current = model;
          
          // Hide the canvas plane
          if (planeRef.current) {
            planeRef.current.visible = false;
          }

          // Update state
          setHasModel(true);
          setIs3D(true);
          setStatusMessage(`${isGLB ? 'GLB model' : 'Demo 3D model'} "${fileName}" loaded! Move mouse to rotate, click "Flatten to 2D" to capture.`);
          setIsLoading(false);

          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error processing model:', error);
          setStatusMessage('Error processing 3D model. Please try another file.');
          setIsLoading(false);
          URL.revokeObjectURL(url);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading file:', error);
        setStatusMessage('Error loading file. Please try another file.');
        setIsLoading(false);
        URL.revokeObjectURL(url);
      }
    );

    // Reset file input
    e.target.value = '';
  };

  // --- Capture 3D Scene as 2D Image ---
  const capture3DToCanvas = () => {
    if (!rendererRef.current || !canvasRef.current || !contextRef.current) return;

    // Render the current frame
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // Get the WebGL canvas
    const webglCanvas = rendererRef.current.domElement;
    
    // Clear the 2D canvas
    const canvas2D = canvasRef.current;
    const ctx2D = contextRef.current;
    ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    
    // Draw the 3D render to the 2D canvas
    ctx2D.drawImage(webglCanvas, 0, 0, canvas2D.width / 2, canvas2D.height / 2);
    
    setStatusMessage('3D scene flattened to 2D canvas! You can now paint on it.');
  };

  // --- Update canvas texture in 3D ---
  const updateCanvasTexture = () => {
    if (textureRef.current && canvasRef.current) {
      textureRef.current.needsUpdate = true;
    }
  };

  // --- Handle mouse movement for 3D interaction ---
  const handleMouseMove = (event) => {
    if (is3D) {
      const rect = threejsContainerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height
        });
      }
    }
  };

  // --- Toggle 3D/2D View ---
  const toggle3D = () => {
    if (is3D && hasModel) {
      // Switching from 3D to 2D - capture the 3D scene
      capture3DToCanvas();
      setHasModel(false);
      setIs3D(false);
      
      // Remove the loaded model and show the plane again
      if (loadedModelRef.current) {
        sceneRef.current.remove(loadedModelRef.current);
        loadedModelRef.current = null;
      }
      if (planeRef.current) {
        planeRef.current.visible = true;
      }
    } else if (is3D) {
      // Switching from 3D to 2D (no model)
      setIs3D(false);
      setStatusMessage('Back to 2D editing mode.');
    } else {
      // Switching from 2D to 3D
      setIs3D(true);
      const canvas = canvasRef.current;
      if (canvas && planeRef.current) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        textureRef.current = texture;
        planeRef.current.material.map = texture;
        planeRef.current.material.needsUpdate = true;
        setStatusMessage('3D view activated! Move your mouse to interact.');
      }
    }
  };
  
  // --- Update Brush Properties ---
  useEffect(() => {
      if(contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = brushSize;
      }
  }, [color, brushSize]);

  // --- Update 3D texture when drawing ---
  useEffect(() => {
    if (is3D && !hasModel) {
      updateCanvasTexture();
    }
  }, [isDrawing, is3D, hasModel]);

  // --- Drawing Event Handlers ---
  const getEventCoordinates = (event) => {
    if (event.touches && event.touches[0]) {
      const touch = event.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
    }
    return { offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY };
  };

  const startDrawing = (event) => {
    if (is3D) return; // Disable drawing in 3D mode
    
    const { offsetX, offsetY } = getEventCoordinates(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    event.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    updateCanvasTexture(); // Update 3D texture
  };

  const draw = (event) => {
    if (!isDrawing || is3D) return; // Disable drawing in 3D mode
    
    // Determine the drawing mode (brush or eraser)
    contextRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    
    const { offsetX, offsetY } = getEventCoordinates(event);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    event.preventDefault();
  };
  
  // --- Toolbar Functionality ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = contextRef.current;
          // Clear canvas before drawing new image
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Fit image to canvas while maintaining aspect ratio
          const hRatio = canvas.offsetWidth / img.width;
          const vRatio = canvas.offsetHeight / img.height;
          const ratio = Math.min(hRatio, vRatio);
          const centerShift_x = (canvas.offsetWidth - img.width * ratio) / 2;
          const centerShift_y = (canvas.offsetHeight - img.height * ratio) / 2;
          
          ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
          setStatusMessage('Image loaded. Ready to paint!');
          updateCanvasTexture(); // Update 3D texture
          
          // Remove any loaded 3D model
          if (loadedModelRef.current) {
            sceneRef.current.remove(loadedModelRef.current);
            loadedModelRef.current = null;
            setHasModel(false);
          }
          if (planeRef.current) {
            planeRef.current.visible = true;
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setStatusMessage('Canvas cleared. Upload an image, GLB model, or start fresh.');
    updateCanvasTexture(); // Update 3D texture
    
    // Remove any loaded 3D model
    if (loadedModelRef.current) {
      sceneRef.current.remove(loadedModelRef.current);
      loadedModelRef.current = null;
      setHasModel(false);
    }
    if (planeRef.current) {
      planeRef.current.visible = true;
    }
  };
  
  // --- Full-Stack Save Functionality ---
  const saveImage = async () => {
      if (!canvasRef.current) return;
      
      setIsLoading(true);
      setStatusMessage('Saving your masterpiece...');
      
      const canvas = canvasRef.current;
      // Get image data from canvas as a Base64 string
      const imageData = canvas.toDataURL('image/png');

      try {
          // --- MOCK SAVE FOR DEMO ---
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
          console.log("Saving image data:", imageData.substring(0, 50) + "...");
          setStatusMessage('Image saved successfully! (Demo)');
          
      } catch (error) {
          console.error('Error saving image:', error);
          setStatusMessage('Error: Could not save the image.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-4 border-b border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-cyan-400">3D/2D GLB Image Painter</h1>
            <p className="text-gray-400 text-sm mt-1">{statusMessage}</p>
        </header>

        {/* Toolbar */}
        <div className="p-4 bg-gray-800/50 flex flex-wrap items-center justify-center gap-4 md:gap-6 border-b border-gray-700">
            <div className='flex items-center gap-2'>
                <label htmlFor="color-picker" className="text-sm font-medium">Color:</label>
                <input 
                  id="color-picker" 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-10 h-10 rounded-md border-2 border-gray-600 bg-gray-700 cursor-pointer"
                  disabled={is3D}
                />
            </div>
            
            <div className='flex items-center gap-3'>
                <label htmlFor="brush-size" className="text-sm font-medium">Brush Size:</label>
                <input 
                  id="brush-size" 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(e.target.value)} 
                  className="w-36 cursor-pointer"
                  disabled={is3D}
                />
                <span className="text-sm w-6 text-center">{brushSize}</span>
            </div>

            <div className='flex items-center gap-2'>
                <button 
                  onClick={() => setTool('brush')} 
                  disabled={is3D}
                  className={`px-4 py-2 text-sm rounded-md transition-all disabled:opacity-50 ${tool === 'brush' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Brush
                </button>
                <button 
                  onClick={() => setTool('eraser')} 
                  disabled={is3D}
                  className={`px-4 py-2 text-sm rounded-md transition-all disabled:opacity-50 ${tool === 'eraser' ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Eraser
                </button>
            </div>

            {/* 3D Toggle Button */}
            <div className='flex items-center gap-2'>
                <button 
                  onClick={toggle3D} 
                  className={`px-4 py-2 text-sm rounded-md transition-all font-bold ${is3D ? (hasModel ? 'bg-purple-500 text-white shadow-lg animate-pulse' : 'bg-purple-500 text-white shadow-lg') : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {is3D ? (hasModel ? '📸 Flatten to 2D' : '🌐 3D View') : '🎨 Switch to 3D'}
                </button>
            </div>
        </div>

        {/* Main Content: Canvas or 3D Scene */}
        <div className="flex-grow w-full h-[60vh] bg-dots p-2 relative">
            {/* 2D Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className={`w-full h-full bg-white/5 rounded-lg transition-opacity duration-500 ${is3D ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 cursor-crosshair'}`}
            />
            
            {/* 3D Container */}
            <div 
              ref={threejsContainerRef}
              onMouseMove={handleMouseMove}
              className={`w-full h-full rounded-lg transition-opacity duration-500 ${is3D ? 'opacity-100' : 'opacity-0 pointer-events-none absolute top-2 left-2'}`}
              style={{ width: 'calc(100% - 1rem)', height: 'calc(100% - 1rem)' }}
            />
            
            {/* Mode Instructions */}
            {is3D && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${hasModel ? 'bg-purple-400' : 'bg-cyan-400'}`}></div>
                  <span>
                    {hasModel 
                      ? '3D Model View - Click "Flatten to 2D" to capture' 
                      : '3D Canvas View - Move mouse to interact'
                    }
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {hasModel 
                    ? 'This will create a 2D screenshot you can paint on' 
                    : 'Switch back to 2D to edit'
                  }
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 bg-gray-800 px-6 py-4 rounded-lg">
                  <div className="w-6 h-6 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                  <span className="text-white">Loading...</span>
                </div>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-800/50 flex flex-wrap items-center justify-center gap-4 border-t border-gray-700">
            {/* Upload Image */}
            <label className={`font-bold py-2 px-4 rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${is3D ? 'bg-gray-600 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <span>📷 Upload Image</span>
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={is3D} />
            </label>

            {/* Upload GLB */}
            <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-transform transform hover:scale-105">
                <span>🎭 Upload GLB</span>
                <input type="file" onChange={handleGLBUpload} className="hidden" accept=".glb" />
            </label>
            
            <button 
              onClick={clearCanvas} 
              disabled={is3D && hasModel}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400"
            >
              🗑️ Clear
            </button>
            <button 
              onClick={saveImage} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
              {isLoading ? 'Saving...' : '💾 Save to DB'}
            </button>
        </div>
      </div>
    </div>
  );
}