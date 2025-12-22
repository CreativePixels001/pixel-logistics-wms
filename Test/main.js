// main.js - Main Application Logic

class ParticleApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
        this.gestureRecognizer = null;
        
        this.colorCycleTimer = 0;
        this.autoColorCycle = false;
        
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.setupParticleSystem();
        this.setupGestureRecognition();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 100, 500);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 150;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 500);
        pointLight.position.set(50, 50, 50);
        this.scene.add(pointLight);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupParticleSystem() {
        this.particleSystem = new ParticleSystem(this.scene);
        this.updateStatus('Particle system initialized');
    }

    async setupGestureRecognition() {
        this.gestureRecognizer = new GestureRecognizer();
        
        const videoElement = document.getElementById('video');
        
        try {
            await this.gestureRecognizer.initialize(videoElement, (results) => {
                // Optional: Draw hand landmarks on video if needed
            });

            // Setup gesture callbacks
            this.gestureRecognizer.onGestureChange((gesture) => {
                this.handleGesture(gesture);
            });

            this.gestureRecognizer.onHandMove((position, gesture) => {
                this.handleHandMove(position, gesture);
            });

            this.updateStatus('Hand tracking active');
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Failed to initialize hand tracking:', error);
            this.updateStatus('Error: Camera access denied or not available');
            document.getElementById('loading').textContent = 'Camera not available. Use manual controls.';
        }
    }

    handleGesture(gesture) {
        this.updateStatus(`Gesture: ${this.gestureRecognizer.getGestureName(gesture)}`);
        
        switch(gesture) {
            case 'open_palm':
                // Expand particles
                this.particleSystem.setExpansion(2.5);
                break;
                
            case 'fist':
                // Contract particles
                this.particleSystem.setExpansion(0.3);
                break;
                
            case 'peace':
                // Cycle through color modes
                this.cycleColorMode();
                break;
                
            case 'thumbs_up':
                // Increase rotation speed
                this.particleSystem.setRotationSpeed(0.02);
                break;
                
            case 'point':
                // Move particles to hand position
                this.particleSystem.setAttractionPoint(
                    this.gestureRecognizer.handPosition.x,
                    this.gestureRecognizer.handPosition.y,
                    this.gestureRecognizer.handPosition.z,
                    1.0
                );
                break;
                
            case 'three_fingers':
                // Cycle through templates
                this.cycleTemplate();
                break;
                
            case 'none':
            case 'unknown':
                // Reset to normal state
                this.particleSystem.setExpansion(1.0);
                this.particleSystem.setRotationSpeed(0.001);
                this.particleSystem.setAttractionPoint(0, 0, 0, 0);
                break;
        }
    }

    handleHandMove(position, gesture) {
        // Update camera position slightly based on hand movement for parallax effect
        if (gesture !== 'none') {
            this.camera.position.x += (position.x * 0.1 - this.camera.position.x) * 0.05;
            this.camera.position.y += (position.y * 0.1 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
    }

    cycleColorMode() {
        const modes = ['rainbow', 'fire', 'ocean', 'forest', 'sunset'];
        const currentMode = this.particleSystem.colorMode;
        const currentIndex = modes.indexOf(currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.particleSystem.setColorMode(modes[nextIndex]);
        document.getElementById('color-mode').value = modes[nextIndex];
    }

    cycleTemplate() {
        const templates = ['heart', 'flower', 'saturn', 'fireworks', 'stars', 'spiral'];
        const currentTemplate = this.particleSystem.currentTemplate;
        const currentIndex = templates.indexOf(currentTemplate);
        const nextIndex = (currentIndex + 1) % templates.length;
        
        this.particleSystem.generateTemplate(templates[nextIndex]);
        document.getElementById('template-select').value = templates[nextIndex];
    }

    setupControls() {
        // Template selector
        document.getElementById('template-select').addEventListener('change', (e) => {
            this.particleSystem.generateTemplate(e.target.value);
        });

        // Color mode selector
        document.getElementById('color-mode').addEventListener('change', (e) => {
            this.particleSystem.setColorMode(e.target.value);
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.particleSystem.reset();
            this.camera.position.set(0, 0, 150);
            this.camera.lookAt(this.scene.position);
            this.updateStatus('Particles reset');
        });
    }

    setupEventListeners() {
        // Mouse controls for manual interaction
        let mouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousedown', () => {
            mouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            mouseDown = false;
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

            if (mouseDown) {
                this.particleSystem.setAttractionPoint(
                    mouseX * 100,
                    mouseY * 100,
                    0,
                    0.5
                );
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    const templates = ['heart', 'flower', 'saturn', 'fireworks', 'stars', 'spiral'];
                    const templateIndex = parseInt(e.key) - 1;
                    if (templateIndex < templates.length) {
                        this.particleSystem.generateTemplate(templates[templateIndex]);
                        document.getElementById('template-select').value = templates[templateIndex];
                    }
                    break;
                case 'c':
                    this.cycleColorMode();
                    break;
                case 'r':
                    this.particleSystem.reset();
                    break;
                case ' ':
                    e.preventDefault();
                    this.cycleTemplate();
                    break;
                case '+':
                case '=':
                    this.particleSystem.setExpansion(this.particleSystem.targetExpansion + 0.2);
                    break;
                case '-':
                case '_':
                    this.particleSystem.setExpansion(this.particleSystem.targetExpansion - 0.2);
                    break;
            }
        });

        // Mouse wheel for expansion
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.particleSystem.setExpansion(this.particleSystem.targetExpansion + delta);
        }, { passive: false });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touchX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                const touchY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
                
                this.particleSystem.setAttractionPoint(
                    touchX * 100,
                    touchY * 100,
                    0,
                    0.3
                );
            } else if (e.touches.length === 2) {
                // Pinch to zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                this.particleSystem.setExpansion(distance / 200);
            }
        });

        document.addEventListener('touchend', () => {
            this.particleSystem.setAttractionPoint(0, 0, 0, 0);
        });
    }

    updateStatus(message) {
        document.getElementById('status').textContent = `Status: ${message}`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update();
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Auto-rotate camera slightly for dynamic view
        this.camera.position.x += Math.sin(Date.now() * 0.0001) * 0.05;
        this.camera.position.y += Math.cos(Date.now() * 0.00015) * 0.03;
        this.camera.lookAt(this.scene.position);
    }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    new ParticleApp();
});
