// particles.js - Particle System with Multiple Templates

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleCount = 5000;
        this.positions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.originalPositions = new Float32Array(this.particleCount * 3);
        
        this.expansionFactor = 1.0;
        this.targetExpansion = 1.0;
        this.rotationSpeed = 0.001;
        this.targetRotation = 0.001;
        
        this.colorMode = 'rainbow';
        this.currentTemplate = 'heart';
        
        this.attractionPoint = new THREE.Vector3(0, 0, 0);
        this.attractionStrength = 0;
        
        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        
        // Initialize with current template
        this.generateTemplate(this.currentTemplate);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    generateTemplate(template) {
        this.currentTemplate = template;
        
        switch(template) {
            case 'heart':
                this.generateHeart();
                break;
            case 'flower':
                this.generateFlower();
                break;
            case 'saturn':
                this.generateSaturn();
                break;
            case 'fireworks':
                this.generateFireworks();
                break;
            case 'stars':
                this.generateStars();
                break;
            case 'spiral':
                this.generateSpiral();
                break;
            default:
                this.generateHeart();
        }
        
        this.updateColors();
        
        if (this.particles) {
            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.geometry.attributes.color.needsUpdate = true;
        }
    }

    generateHeart() {
        for (let i = 0; i < this.particleCount; i++) {
            const t = (i / this.particleCount) * Math.PI * 2;
            const u = Math.random() * Math.PI * 2;
            
            // Parametric heart equation
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const z = (Math.random() - 0.5) * 10 * Math.sin(u);
            
            const scale = 3;
            this.positions[i * 3] = x * scale;
            this.positions[i * 3 + 1] = y * scale;
            this.positions[i * 3 + 2] = z * scale;
            
            this.originalPositions[i * 3] = this.positions[i * 3];
            this.originalPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.originalPositions[i * 3 + 2] = this.positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
    }

    generateFlower() {
        for (let i = 0; i < this.particleCount; i++) {
            const petals = 8;
            const t = (i / this.particleCount) * Math.PI * 2;
            const r = 30 * Math.abs(Math.cos(petals * t / 2));
            
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            const z = (Math.random() - 0.5) * 20 * Math.sin(t * petals);
            
            this.positions[i * 3] = x + (Math.random() - 0.5) * 5;
            this.positions[i * 3 + 1] = y + (Math.random() - 0.5) * 5;
            this.positions[i * 3 + 2] = z;
            
            this.originalPositions[i * 3] = this.positions[i * 3];
            this.originalPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.originalPositions[i * 3 + 2] = this.positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
    }

    generateSaturn() {
        for (let i = 0; i < this.particleCount; i++) {
            if (i < this.particleCount * 0.6) {
                // Ring
                const t = (i / (this.particleCount * 0.6)) * Math.PI * 2;
                const innerRadius = 40;
                const outerRadius = 70;
                const r = innerRadius + Math.random() * (outerRadius - innerRadius);
                
                this.positions[i * 3] = r * Math.cos(t);
                this.positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
                this.positions[i * 3 + 2] = r * Math.sin(t);
            } else {
                // Planet sphere
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const radius = 25;
                
                this.positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                this.positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                this.positions[i * 3 + 2] = radius * Math.cos(phi);
            }
            
            this.originalPositions[i * 3] = this.positions[i * 3];
            this.originalPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.originalPositions[i * 3 + 2] = this.positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.05;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }
    }

    generateFireworks() {
        const explosionCount = 5;
        const particlesPerExplosion = this.particleCount / explosionCount;
        
        for (let e = 0; e < explosionCount; e++) {
            const centerX = (Math.random() - 0.5) * 100;
            const centerY = (Math.random() - 0.5) * 100;
            const centerZ = (Math.random() - 0.5) * 100;
            
            for (let i = 0; i < particlesPerExplosion; i++) {
                const idx = e * particlesPerExplosion + i;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = Math.random() * 40;
                
                this.positions[idx * 3] = centerX + r * Math.sin(phi) * Math.cos(theta);
                this.positions[idx * 3 + 1] = centerY + r * Math.sin(phi) * Math.sin(theta);
                this.positions[idx * 3 + 2] = centerZ + r * Math.cos(phi);
                
                this.originalPositions[idx * 3] = this.positions[idx * 3];
                this.originalPositions[idx * 3 + 1] = this.positions[idx * 3 + 1];
                this.originalPositions[idx * 3 + 2] = this.positions[idx * 3 + 2];
                
                const vel = 0.2;
                this.velocities[idx * 3] = (this.positions[idx * 3] - centerX) * vel;
                this.velocities[idx * 3 + 1] = (this.positions[idx * 3 + 1] - centerY) * vel;
                this.velocities[idx * 3 + 2] = (this.positions[idx * 3 + 2] - centerZ) * vel;
            }
        }
    }

    generateStars() {
        for (let i = 0; i < this.particleCount; i++) {
            const arm = i % 5;
            const t = (i / this.particleCount) * Math.PI * 2;
            const armAngle = (arm * Math.PI * 2) / 5;
            const r = 20 + Math.random() * 40;
            
            const x = r * Math.cos(t + armAngle);
            const y = r * Math.sin(t + armAngle);
            const z = (Math.random() - 0.5) * 30;
            
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;
            
            this.originalPositions[i * 3] = this.positions[i * 3];
            this.originalPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.originalPositions[i * 3 + 2] = this.positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
    }

    generateSpiral() {
        for (let i = 0; i < this.particleCount; i++) {
            const t = (i / this.particleCount) * Math.PI * 10;
            const r = t * 3;
            
            const x = r * Math.cos(t);
            const y = (i / this.particleCount) * 100 - 50;
            const z = r * Math.sin(t);
            
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;
            
            this.originalPositions[i * 3] = this.positions[i * 3];
            this.originalPositions[i * 3 + 1] = this.positions[i * 3 + 1];
            this.originalPositions[i * 3 + 2] = this.positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }
    }

    updateColors() {
        for (let i = 0; i < this.particleCount; i++) {
            const color = this.getColorForParticle(i);
            this.colors[i * 3] = color.r;
            this.colors[i * 3 + 1] = color.g;
            this.colors[i * 3 + 2] = color.b;
        }
    }

    getColorForParticle(index) {
        const t = index / this.particleCount;
        
        switch(this.colorMode) {
            case 'rainbow':
                return {
                    r: Math.sin(t * Math.PI * 2) * 0.5 + 0.5,
                    g: Math.sin(t * Math.PI * 2 + Math.PI * 2/3) * 0.5 + 0.5,
                    b: Math.sin(t * Math.PI * 2 + Math.PI * 4/3) * 0.5 + 0.5
                };
            case 'fire':
                return {
                    r: 1.0,
                    g: 0.3 + t * 0.7,
                    b: 0.0 + t * 0.3
                };
            case 'ocean':
                return {
                    r: 0.0 + t * 0.3,
                    g: 0.4 + t * 0.4,
                    b: 0.8 + t * 0.2
                };
            case 'forest':
                return {
                    r: 0.1 + t * 0.3,
                    g: 0.5 + t * 0.5,
                    b: 0.2 + t * 0.3
                };
            case 'sunset':
                return {
                    r: 1.0 - t * 0.3,
                    g: 0.3 + t * 0.4,
                    b: 0.5 + t * 0.5
                };
            default:
                return { r: 1, g: 1, b: 1 };
        }
    }

    setColorMode(mode) {
        this.colorMode = mode;
        this.updateColors();
        if (this.particles) {
            this.particles.geometry.attributes.color.needsUpdate = true;
        }
    }

    setExpansion(factor) {
        this.targetExpansion = Math.max(0.1, Math.min(5.0, factor));
    }

    setRotationSpeed(speed) {
        this.targetRotation = speed;
    }

    setAttractionPoint(x, y, z, strength) {
        this.attractionPoint.set(x, y, z);
        this.attractionStrength = strength;
    }

    update() {
        // Smooth transitions
        this.expansionFactor += (this.targetExpansion - this.expansionFactor) * 0.1;
        this.rotationSpeed += (this.targetRotation - this.rotationSpeed) * 0.05;
        
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            
            // Apply expansion
            positions[idx] = this.originalPositions[idx] * this.expansionFactor;
            positions[idx + 1] = this.originalPositions[idx + 1] * this.expansionFactor;
            positions[idx + 2] = this.originalPositions[idx + 2] * this.expansionFactor;
            
            // Apply attraction to point
            if (this.attractionStrength > 0) {
                const dx = this.attractionPoint.x - positions[idx];
                const dy = this.attractionPoint.y - positions[idx + 1];
                const dz = this.attractionPoint.z - positions[idx + 2];
                
                positions[idx] += dx * this.attractionStrength * 0.01;
                positions[idx + 1] += dy * this.attractionStrength * 0.01;
                positions[idx + 2] += dz * this.attractionStrength * 0.01;
            }
            
            // Add small random movement
            positions[idx] += this.velocities[idx];
            positions[idx + 1] += this.velocities[idx + 1];
            positions[idx + 2] += this.velocities[idx + 2];
        }
        
        // Rotate particles
        this.particles.rotation.y += this.rotationSpeed;
        this.particles.rotation.x += this.rotationSpeed * 0.5;
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    reset() {
        this.generateTemplate(this.currentTemplate);
        this.expansionFactor = 1.0;
        this.targetExpansion = 1.0;
        this.rotationSpeed = 0.001;
        this.targetRotation = 0.001;
        this.attractionStrength = 0;
        this.particles.rotation.set(0, 0, 0);
    }
}
