/* ====================================================
   js/universe.js  –  3D Interactive Open Source Universe
   Three.js solar-system-like viz for NWOC beginners
   ==================================================== */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('universe-canvas');
    const tooltip = document.getElementById('universe-tooltip');
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const W = () => canvas.parentElement.clientWidth;
    const H = () => Math.min(canvas.parentElement.clientWidth * 0.65, 460);

    function resize() {
        renderer.setSize(W(), H());
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Scene & Camera ────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100);
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──────────────────────────────────────────
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const pt1 = new THREE.PointLight(0xA855F7, 2, 30);
    pt1.position.set(0, 2, 0);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0x06B6D4, 1, 20);
    pt2.position.set(8, 4, -4);
    scene.add(pt2);

    // ── Central Repo (purple glowing sphere) ──────────────
    const repoGeo = new THREE.IcosahedronGeometry(1.4, 4);
    const repoMat = new THREE.MeshPhongMaterial({
        color: 0xA855F7,
        emissive: 0x5B21B6,
        emissiveIntensity: 0.6,
        shininess: 80,
        transparent: true,
        opacity: 0.95,
    });
    const repoMesh = new THREE.Mesh(repoGeo, repoMat);
    repoMesh.userData = {
        label: '🟣 Central Repository (nexus-core)',
        desc: 'This is the main codebase. Everyone contributes here. Think of it as the production server\'s source of truth.',
    };
    scene.add(repoMesh);

    // Repo glow halo
    const haloGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.06, side: THREE.BackSide });
    scene.add(new THREE.Mesh(haloGeo, haloMat));

    // ── Fork Planets (cyan orbiting spheres) ──────────────
    const FORKS = [
        { radius: 3.8, speed: 0.4, size: 0.55, startAngle: 0, inclination: 0.2 },
        { radius: 5.2, speed: 0.25, size: 0.45, startAngle: 2.1, inclination: -0.15 },
        { radius: 4.5, speed: 0.35, size: 0.5, startAngle: 4.2, inclination: 0.1 },
        { radius: 6.0, speed: 0.18, size: 0.4, startAngle: 1.0, inclination: 0.3 },
        { radius: 3.2, speed: 0.5, size: 0.42, startAngle: 3.5, inclination: -0.25 },
    ];

    const forkMeshes = FORKS.map((f, i) => {
        const geo = new THREE.SphereGeometry(f.size, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0x06B6D4, emissive: 0x0891B2, emissiveIntensity: 0.5, shininess: 60 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = {
            forkData: f,
            angle: f.startAngle,
            label: `🔵 Fork #${i + 1} (@contributor${i + 1})`,
            desc: 'Your personal copy of the repo. You work here safely without affecting the main codebase. Fork = your sandbox.',
        };
        scene.add(mesh);
        return mesh;
    });

    // Orbit rings for forks
    FORKS.forEach(f => {
        const pts = [];
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.04) {
            pts.push(new THREE.Vector3(Math.cos(a) * f.radius, Math.sin(a) * f.inclination * f.radius * 0.3, Math.sin(a) * f.radius));
        }
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const ringGeo = new THREE.TubeGeometry(curve, 200, 0.012, 4, true);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.15 });
        scene.add(new THREE.Mesh(ringGeo, ringMat));
    });

    // ── Issue Orbs (orange small spheres drifting) ────────
    const issueMeshes = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 2.5 + Math.random() * 2;
        const geo = new THREE.SphereGeometry(0.22, 12, 12);
        const mat = new THREE.MeshPhongMaterial({ color: 0xF97316, emissive: 0xEA580C, emissiveIntensity: 0.7 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 2, Math.sin(angle) * dist);
        mesh.userData = {
            baseAngle: angle,
            dist,
            yBase: mesh.position.y,
            label: `🟠 Open Issue #${100 + i * 11}`,
            desc: 'Bug, feature request, or improvement task. Claim one, fix it in your fork, and open a PR. That\'s how you contribute!',
        };
        scene.add(mesh);
        issueMeshes.push(mesh);
    }

    // ── PR Streaks (green particles flying toward repo) ───
    const PR_COUNT = 6;
    const prGroups = [];
    for (let i = 0; i < PR_COUNT; i++) {
        const startFork = forkMeshes[i % forkMeshes.length];
        const group = {
            mesh: (() => {
                const geo = new THREE.SphereGeometry(0.1, 8, 8);
                const mat = new THREE.MeshBasicMaterial({ color: 0x22C55E });
                const m = new THREE.Mesh(geo, mat);
                m.userData = {
                    label: `🟢 Pull Request #${342 + i}`,
                    desc: 'Your code changes flying from your fork toward the main repo. The maintainer reviews and merges → your code is now in production!',
                };
                scene.add(m);
                return m;
            })(),
            progress: (i / PR_COUNT),
            sourceFork: startFork,
        };
        prGroups.push(group);
    }

    // Trail for each PR
    prGroups.forEach(pr => {
        const trailGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const trailMat = new THREE.MeshBasicMaterial({ color: 0x22C55E, transparent: true, opacity: 0.3 });
        for (let t = 0; t < 4; t++) {
            const trail = new THREE.Mesh(trailGeo, trailMat);
            scene.add(trail);
            pr['trail' + t] = trail;
        }
    });

    // ── Star Field Background ─────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(500 * 3);
    for (let i = 0; i < 500 * 3; i++) starPositions[i] = (Math.random() - 0.5) * 60;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Raycaster for hover tooltip ───────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-10, -10);
    let hovered = null;

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => { mouse.set(-10, -10); });

    // Touch support
    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
    }, { passive: true });

    // ── Auto-rotate drag ─────────────────────────────────
    let autoY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let manualOffset = 0;

    canvas.addEventListener('mousedown', e => { isDragging = true; prevMouseX = e.clientX; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        manualOffset += (e.clientX - prevMouseX) * 0.005;
        prevMouseX = e.clientX;
    });

    // ── Animation loop ────────────────────────────────────
    let t = 0;

    // Clickable objects for hover
    const hoverable = [repoMesh, ...forkMeshes, ...issueMeshes, ...prGroups.map(p => p.mesh)];

    function animate() {
        requestAnimationFrame(animate);
        t += 0.006;
        autoY = t + manualOffset;

        // Repo rotation
        repoMesh.rotation.y += 0.005;
        repoMesh.rotation.x += 0.002;

        // Forks orbit
        forkMeshes.forEach(f => {
            const fd = f.userData.forkData;
            f.userData.angle += fd.speed * 0.006;
            const a = f.userData.angle;
            f.position.x = Math.cos(a) * fd.radius;
            f.position.z = Math.sin(a) * fd.radius;
            f.position.y = Math.sin(a) * fd.inclination * fd.radius * 0.3;
            f.rotation.y += 0.02;
        });

        // Issues drift
        issueMeshes.forEach((m, i) => {
            const o = (t + i * 0.8);
            m.position.y = m.userData.yBase + Math.sin(o) * 0.3;
            m.position.x = Math.cos(m.userData.baseAngle + t * 0.1) * m.userData.dist;
            m.position.z = Math.sin(m.userData.baseAngle + t * 0.1) * m.userData.dist;
        });

        // PRs fly toward repo center
        prGroups.forEach((pr, i) => {
            pr.progress = (pr.progress + 0.004) % 1;
            const p = pr.progress;
            const src = pr.sourceFork.position;
            const dst = repoMesh.position;

            pr.mesh.position.lerpVectors(src, dst, p);
            pr.mesh.position.y += Math.sin(p * Math.PI) * 1.2;

            // Trail
            for (let tIdx = 0; tIdx < 4; tIdx++) {
                const tp = Math.max(0, p - (tIdx + 1) * 0.04);
                pr['trail' + tIdx].position.lerpVectors(src, dst, tp);
                pr['trail' + tIdx].position.y += Math.sin(tp * Math.PI) * 1.2;
                pr['trail' + tIdx].material.opacity = 0.25 - tIdx * 0.06;
            }

            // When PR reaches center, flash and reset
            if (p > 0.95 && p < 0.98) {
                repoMesh.material.emissiveIntensity = 1.2;
            } else {
                repoMesh.material.emissiveIntensity = 0.6;
            }
        });

        // Camera auto-orbit
        camera.position.x = Math.sin(autoY * 0.15) * 13;
        camera.position.z = Math.cos(autoY * 0.15) * 13;
        camera.position.y = 3 + Math.sin(autoY * 0.08) * 1.5;
        camera.lookAt(0, 0, 0);

        // Raycasting hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hoverable);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj !== hovered && obj.userData.label) {
                hovered = obj;
                if (tooltip) {
                    tooltip.querySelector('.tooltip-icon').textContent = obj.userData.label.split(' ')[0];
                    tooltip.querySelector('.tooltip-text').textContent = `${obj.userData.label}\n\n${obj.userData.desc}`;
                    tooltip.style.opacity = '1';
                }
                canvas.style.cursor = 'pointer';
            }
        } else {
            if (hovered) {
                hovered = null;
                if (tooltip) tooltip.style.opacity = '0.6';
                canvas.style.cursor = 'default';
            }
        }

        renderer.render(scene, camera);
    }

    // Start when section in view
    const universeSection = document.getElementById('universe');
    let started = false;
    if (universeSection) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting && !started) {
                    started = true;
                    animate();
                    obs.unobserve(universeSection);
                }
            });
        }, { threshold: 0.1 });
        obs.observe(universeSection);
    } else {
        animate();
    }

}());
