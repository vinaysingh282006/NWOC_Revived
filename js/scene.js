/* ====================================================
   NWOC – Nexus Spring of Code  |  scene.js
   Three.js background: jaw-dropping, always-visible
   ==================================================== */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('NWOC scene: Three.js not loaded.');
        return;
    }

    // ── Setup ─────────────────────────────────────────────
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 8);

    // ── Object 1: Icosahedron wireframe (purple, bigger detail) ──
    const geo1 = new THREE.IcosahedronGeometry(2.8, 2);
    const mat1 = new THREE.MeshBasicMaterial({
        color: 0xA855F7, wireframe: true, transparent: true, opacity: 0.2,
    });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    mesh1.position.set(3.0, 0, 0);
    scene.add(mesh1);

    // ── Object 2: TorusKnot (cyan wireframe, more complex) ───
    const geo2 = new THREE.TorusKnotGeometry(1.2, 0.3, 200, 24, 3, 5);
    const mat2 = new THREE.MeshBasicMaterial({
        color: 0x06B6D4, wireframe: true, transparent: true, opacity: 0.25,
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    mesh2.position.set(-3.8, 1.2, -2);
    scene.add(mesh2);

    // ── Object 3: Octahedron (orange) ────────────────────
    const geo3 = new THREE.OctahedronGeometry(1.3, 1);
    const mat3 = new THREE.MeshBasicMaterial({
        color: 0xF97316, wireframe: true, transparent: true, opacity: 0.16,
    });
    const mesh3 = new THREE.Mesh(geo3, mat3);
    mesh3.position.set(-4.5, -2.2, 1);
    scene.add(mesh3);

    // ── Object 4: NEW – Dodecahedron (blue, far back) ────
    const geo4b = new THREE.DodecahedronGeometry(1.8, 0);
    const mat4b = new THREE.MeshBasicMaterial({
        color: 0x3B82F6, wireframe: true, transparent: true, opacity: 0.13,
    });
    const mesh4b = new THREE.Mesh(geo4b, mat4b);
    mesh4b.position.set(5.5, 2.5, -4);
    scene.add(mesh4b);

    // ── Object 5: NEW – Torus ring (big, faint) ──────────
    const geo5 = new THREE.TorusGeometry(4.0, 0.012, 8, 120);
    const mat5 = new THREE.MeshBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.10 });
    const ring = new THREE.Mesh(geo5, mat5);
    ring.rotation.x = Math.PI / 2.5;
    ring.position.set(1.5, -1, -1);
    scene.add(ring);

    // ── PRIMARY Particle field (1200 stars, tri-color) ────
    const PC = 1200;
    const pPos = new Float32Array(PC * 3);
    const pCol = new Float32Array(PC * 3);
    const purple = new THREE.Color(0xA855F7);
    const cyan = new THREE.Color(0x06B6D4);
    const orange = new THREE.Color(0xF97316);
    const blue = new THREE.Color(0x3B82F6);
    const white = new THREE.Color(0xffffff);

    for (let i = 0; i < PC; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 40;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
        const pick = i % 12;
        const c = pick < 4 ? purple : pick < 7 ? cyan : pick < 9 ? orange : pick < 11 ? blue : white;
        pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    ptGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const ptMat = new THREE.PointsMaterial({
        size: 0.018, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true,
    });
    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    // ── SECONDARY slow-drift layer (large sparse glitters) ─
    const SC = 180;
    const sPos = new Float32Array(SC * 3);
    for (let i = 0; i < SC; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * 50;
        sPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
        sPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({
        size: 0.055, color: 0xffffff, transparent: true, opacity: 0.35, sizeAttenuation: true,
    });
    const slowStars = new THREE.Points(sGeo, sMat);
    scene.add(slowStars);

    // ── SHOOTING STARS / METEORS ─────────────────────────
    const METEORS = 7;
    const meteors = [];
    for (let i = 0; i < METEORS; i++) {
        const trailLen = 8 + Math.random() * 10;
        const positions = new Float32Array(2 * 3);
        const mGeo = new THREE.BufferGeometry();
        mGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mMat = new THREE.LineBasicMaterial({
            color: i % 2 === 0 ? 0x22D3EE : 0xC026D3,
            transparent: true, opacity: 0.0,
        });
        const line = new THREE.Line(mGeo, mMat);
        scene.add(line);
        meteors.push({
            line, positions,
            x: 0, y: 0, z: 0,
            trail: trailLen,
            vx: 0, vy: 0,
            active: false,
            cooldown: Math.random() * 180,
        });
    }

    function resetMeteor(m) {
        m.x = (Math.random() - 0.5) * 30 + 10;
        m.y = (Math.random() * 0.5 + 0.5) * 20;
        m.z = (Math.random() - 0.5) * 5;
        const angle = Math.PI * (0.8 + Math.random() * 0.4);
        const spd = 0.18 + Math.random() * 0.22;
        m.vx = Math.cos(angle) * spd;
        m.vy = Math.sin(angle) * spd * 0.6;
        m.line.material.opacity = 0.85;
        m.active = true;
        m.life = 0;
        m.maxLife = m.trail / spd;
    }

    // ── CONSTELLATION nodes + edges ───────────────────────
    const NODE_COUNT = 28;
    const nodePos = [];
    const nodeMesh = [];
    const dotGeo = new THREE.SphereGeometry(0.04, 6, 6);

    for (let i = 0; i < NODE_COUNT; i++) {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 4 - 3,
        );
        nodePos.push(pos);
        const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({
            color: i % 3 === 0 ? 0x06B6D4 : i % 3 === 1 ? 0xA855F7 : 0x3B82F6,
            transparent: true, opacity: 0.5,
        }));
        m.position.copy(pos);
        scene.add(m);
        nodeMesh.push(m);
    }

    // Build edges (only between nodes that are close enough)
    const edges = [];
    const MAX_EDGE_DIST = 6;
    for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
            if (nodePos[i].distanceTo(nodePos[j]) < MAX_EDGE_DIST) {
                const pts = [nodePos[i].clone(), nodePos[j].clone()];
                const eGeo = new THREE.BufferGeometry().setFromPoints(pts);
                const eMat = new THREE.LineBasicMaterial({
                    color: 0x06B6D4, transparent: true, opacity: 0.08,
                });
                const edge = new THREE.Line(eGeo, eMat);
                scene.add(edge);
                edges.push({ line: edge, i, j });
            }
        }
    }

    // ── Mouse parallax ────────────────────────────────────
    const camTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        camTarget.x = (e.clientX / window.innerWidth - 0.5) * 1.4;
        camTarget.y = -(e.clientY / window.innerHeight - 0.5) * 0.9;
    });

    // ── Resize ────────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Animation ─────────────────────────────────────────
    function lerp(a, b, t) { return a + (b - a) * t; }
    let clock = 0;
    let frame = 0;

    function animate() {
        requestAnimationFrame(animate);
        if (document.hidden) return;

        clock += 0.005;
        frame++;

        // ── Shapes ──────────────────────────────────────
        mesh1.rotation.x += 0.0007;
        mesh1.rotation.y += 0.001;
        mesh1.position.y = Math.sin(clock * 0.7) * 0.7;

        mesh2.rotation.y += 0.004;
        mesh2.rotation.z += 0.002;
        mesh2.position.y = 1.2 + Math.sin(clock * 0.5 + 1) * 0.9;

        mesh3.rotation.x += 0.003;
        mesh3.rotation.y -= 0.002;
        mesh3.position.y = -2.2 + Math.sin(clock * 0.9 + 2) * 0.5;

        mesh4b.rotation.x += 0.0015;
        mesh4b.rotation.y += 0.001;
        mesh4b.position.y = 2.5 + Math.sin(clock * 0.4 + 3) * 0.6;

        ring.rotation.z += 0.001;
        ring.rotation.y = Math.sin(clock * 0.3) * 0.22;
        ring.material.opacity = 0.07 + Math.sin(clock * 0.8) * 0.05;

        // ── Primary stars: rise + slow rotation ─────────
        const pos = ptGeo.attributes.position;
        for (let i = 0; i < PC; i++) {
            pos.array[i * 3 + 1] += 0.003;
            if (pos.array[i * 3 + 1] > 20) pos.array[i * 3 + 1] = -20;
        }
        pos.needsUpdate = true;
        points.rotation.y = clock * 0.018;

        // ── Secondary glitters: drift differently ────────
        slowStars.rotation.y = -clock * 0.006;
        slowStars.rotation.x = clock * 0.003;
        sMat.opacity = 0.28 + Math.sin(clock * 0.4) * 0.1;

        // ── Constellation: bob nodes + pulse edges ───────
        for (let i = 0; i < NODE_COUNT; i++) {
            nodeMesh[i].position.y = nodePos[i].y + Math.sin(clock * 0.6 + i * 0.7) * 0.15;
            nodeMesh[i].material.opacity = 0.35 + Math.sin(clock * 1.2 + i * 0.5) * 0.2;
        }
        for (const e of edges) {
            e.line.material.opacity = 0.05 + Math.sin(clock * 0.9 + e.i) * 0.06;
        }

        // ── Meteors ──────────────────────────────────────
        for (const m of meteors) {
            if (!m.active) {
                m.cooldown--;
                if (m.cooldown <= 0) {
                    resetMeteor(m);
                    m.cooldown = 220 + Math.random() * 280;
                }
            } else {
                m.x += m.vx;
                m.y += m.vy;
                m.life++;
                // Tail head
                m.positions[0] = m.x;
                m.positions[1] = m.y;
                m.positions[2] = m.z;
                // Tail end
                m.positions[3] = m.x - m.vx * m.trail;
                m.positions[4] = m.y - m.vy * m.trail;
                m.positions[5] = m.z;
                m.line.geometry.attributes.position.needsUpdate = true;
                m.line.material.opacity = Math.max(0, 0.85 - m.life / m.maxLife * 0.9);
                if (m.life > m.maxLife) {
                    m.active = false;
                    m.line.material.opacity = 0;
                }
            }
        }

        // ── Camera parallax ──────────────────────────────
        camera.position.x = lerp(camera.position.x, camTarget.x, 0.04);
        camera.position.y = lerp(camera.position.y, camTarget.y, 0.04);
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();
}());



/* ====================================================
   Hero Tube –  glowing 3D torus inside the circle
   ==================================================== */
(function () {
    'use strict';

    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('hero-tube-canvas');
    if (!canvas) return;

    // ── Renderer ─────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    function setSize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // ── Scene & Camera ────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    // ── Main glowing torus (tube) ─────────────────────────
    const torusGeo = new THREE.TorusGeometry(1.4, 0.30, 40, 200);
    const torusMat = new THREE.MeshPhongMaterial({
        color: 0x06B6D4,
        emissive: 0x0891B2,
        emissiveIntensity: 0.85,
        shininess: 140,
        transparent: true,
        opacity: 0.92,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Halo (back-side glow)
    const haloGeo = new THREE.TorusGeometry(1.4, 0.52, 8, 200);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0x22D3EE,
        transparent: true,
        opacity: 0.055,
        side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(haloGeo, haloMat));

    // Inner wireframe torus for depth
    const wireGeo = new THREE.TorusGeometry(1.4, 0.32, 12, 100);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Accent torus knot at center
    const knotGeo = new THREE.TorusKnotGeometry(0.5, 0.11, 130, 18);
    const knotMat = new THREE.MeshPhongMaterial({
        color: 0x7C3AED,
        emissive: 0x5B21B6,
        emissiveIntensity: 0.75,
        shininess: 90,
        transparent: true,
        opacity: 0.88,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    // ── Particle orbit ring ───────────────────────────────
    const PARTS = 240;
    const ptPos = new Float32Array(PARTS * 3);
    for (let i = 0; i < PARTS; i++) {
        const angle = (i / PARTS) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.5;
        ptPos[i * 3] = Math.cos(angle) * (2.0 + jitter);
        ptPos[i * 3 + 1] = Math.sin(angle) * (2.0 + jitter);
        ptPos[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
    const ptMat = new THREE.PointsMaterial({
        size: 0.032, color: 0x22D3EE, transparent: true, opacity: 0.65, sizeAttenuation: true,
    });
    const particles = new THREE.Points(ptGeo, ptMat);
    scene.add(particles);

    // ── Lighting ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const pt1 = new THREE.PointLight(0x22D3EE, 3.5, 18);
    pt1.position.set(3, 3, 3);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0x7C3AED, 2, 14);
    pt2.position.set(-2.5, -2, 2);
    scene.add(pt2);
    const pt3 = new THREE.PointLight(0x38BDF8, 1.5, 14);
    pt3.position.set(0, 0, 5);
    scene.add(pt3);

    setSize();
    window.addEventListener('resize', setSize);

    // ── Animation loop ────────────────────────────────────
    let clock = 0;

    function animateTube() {
        requestAnimationFrame(animateTube);
        if (document.hidden) return;

        clock += 0.008;

        // Tilt + spin the torus
        torus.rotation.x = Math.sin(clock * 0.4) * 0.55 + 0.3;
        torus.rotation.y += 0.006;
        torus.rotation.z = Math.cos(clock * 0.3) * 0.18;

        // Sync wireframe overlay
        wire.rotation.x = torus.rotation.x + 0.08;
        wire.rotation.y = torus.rotation.y * 1.18;
        wire.rotation.z = torus.rotation.z;

        // Spin the knot independently
        knot.rotation.x += 0.010;
        knot.rotation.y += 0.014;
        knot.rotation.z += 0.005;

        // Slowly rotate the particle ring
        particles.rotation.z = clock * 0.045;

        // Pulse the emission
        torusMat.emissiveIntensity = 0.7 + Math.sin(clock * 1.3) * 0.25;

        renderer.render(scene, camera);
    }

    animateTube();
}());

