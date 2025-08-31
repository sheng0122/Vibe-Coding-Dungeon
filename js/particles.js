// 火焰粒子效果
function createFireParticles() {
    const startScreen = document.getElementById('startScreen');
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'fire-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        startScreen.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }, 200);
}

// Three.js 3D transformation effect
function create3DTransformationEffect(x, y) {
    // Create a temporary div for the 3D effect
    const effectDiv = document.createElement('div');
    effectDiv.style.position = 'absolute';
    effectDiv.style.left = '0';
    effectDiv.style.top = '0';
    effectDiv.style.width = '100%';
    effectDiv.style.height = '100%';
    effectDiv.style.pointerEvents = 'none';
    effectDiv.style.zIndex = '1000';
    document.body.appendChild(effectDiv);

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectDiv.appendChild(renderer.domElement);

    // Create particle system and cubes for transformation effect
    const particles = [];
    const cubes = [];
    
    // Create rotating cubes
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x8B0000,
        wireframe: true,
        opacity: 0.8,
        transparent: true
    });
    
    for (let i = 0; i < 8; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());
        const angle = (i / 8) * Math.PI * 2;
        cube.position.x = Math.cos(angle) * 3;
        cube.position.z = Math.sin(angle) * 3;
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        scene.add(cube);
        cubes.push(cube);
    }

    // Create particle effect
    const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF4500,
        transparent: true,
        opacity: 1
    });
    
    for (let i = 0; i < 50; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        particle.position.x = (Math.random() - 0.5) * 2;
        particle.position.y = (Math.random() - 0.5) * 2;
        particle.position.z = (Math.random() - 0.5) * 2;
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        scene.add(particle);
        particles.push(particle);
    }

    camera.position.z = 10;

    // Animation variables
    let animationTime = 0;
    const maxAnimationTime = 1500; // 1.5 seconds

    // Animate the effect
    function animate() {
        animationTime += 16; // Approximate 60fps
        
        if (animationTime >= maxAnimationTime) {
            // Clean up
            effectDiv.remove();
            return;
        }

        requestAnimationFrame(animate);

        const progress = animationTime / maxAnimationTime;
        
        // Rotate and expand cubes
        cubes.forEach((cube, i) => {
            cube.rotation.x += 0.05;
            cube.rotation.y += 0.05;
            const angle = (i / 8) * Math.PI * 2 + animationTime * 0.001;
            const radius = 3 + progress * 5;
            cube.position.x = Math.cos(angle) * radius;
            cube.position.z = Math.sin(angle) * radius;
            cube.material.opacity = Math.max(0, 1 - progress);
        });

        // Move and fade particles
        particles.forEach(particle => {
            particle.position.add(particle.velocity);
            particle.material.opacity = Math.max(0, 1 - progress);
            particle.scale.setScalar(1 + progress * 2);
        });

        // Rotate camera slightly for dynamic effect
        camera.position.x = Math.sin(animationTime * 0.001) * 2;
        camera.position.y = Math.cos(animationTime * 0.001) * 1;

        renderer.render(scene, camera);
    }

    animate();
}