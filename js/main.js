/* ====================================================
   NWOC – Nexus Spring of Code  |  main.js
   UI interactions, scroll effects, animations
   ==================================================== */

(function () {
    'use strict';

    // ── 1. Intersection Observer – Reveal ───────────────
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // ── 2. Navbar scroll class ───────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ── 3. Count-up animation ────────────────────────────
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCountUp(el) {
        if (el.dataset.animated) return;
        el.dataset.animated = 'true';

        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(easeOutExpo(progress) * target);
            el.textContent = value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
                el.classList.add('count-pop');
            }
        }
        requestAnimationFrame(step);
    }

    const countObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCountUp(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll('.stat-number').forEach((el) => countObserver.observe(el));

    // ── 4. Heatmap generation ────────────────────────────
    function buildHeatmap(containerId, cols, rows) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.style.gridTemplateRows = `repeat(${rows}, 10px)`;
        container.style.gridAutoFlow = 'column';

        const total = cols * rows;
        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.classList.add('hm-cell');

            const r = Math.random();
            if (r < 0.40) cell.classList.add('hm-0');
            else if (r < 0.65) cell.classList.add('hm-1');
            else if (r < 0.85) cell.classList.add('hm-2');
            else cell.classList.add('hm-3');

            container.appendChild(cell);
        }
    }

    buildHeatmap('heatmap-main', 14 * 4, 7); // ~56 cols × 7 rows
    buildHeatmap('heatmap-dash', 20, 7);

    // ── 5. Task filter pills ─────────────────────────────
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskCards = document.querySelectorAll('.task-card');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            taskCards.forEach((card) => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.style.display = show ? '' : 'none';
            });
        });
    });

    // ── 6. Leaderboard period toggle ─────────────────────
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            periodBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            // Data already set; extend here per period if needed
        });
    });

    // ── 7. Mobile hamburger ──────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', open);
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── 8. Command Palette ───────────────────────────────
    const palette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');
    const cmdTrigger = document.getElementById('cmd-trigger');
    const cmdBackdrop = palette ? palette.querySelector('.cmd-backdrop') : null;
    const cmdModal = palette ? palette.querySelector('.cmd-modal') : null;

    function openPalette() {
        if (!palette) return;
        palette.hidden = false;
        palette.removeAttribute('hidden');
        if (cmdModal) cmdModal.classList.add('scale-in');
        setTimeout(() => { if (cmdInput) cmdInput.focus(); }, 50);
    }

    function closePalette() {
        if (!palette) return;
        palette.hidden = true;
        palette.setAttribute('hidden', '');
        if (cmdInput) cmdInput.value = '';
        resetFilter();
    }

    if (cmdTrigger) cmdTrigger.addEventListener('click', openPalette);
    if (cmdBackdrop) cmdBackdrop.addEventListener('click', closePalette);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            palette && palette.hidden ? openPalette() : closePalette();
        }
        if (e.key === 'Escape') closePalette();

        // Arrow key navigation
        if (palette && !palette.hidden) {
            const items = Array.from(cmdResults.querySelectorAll('.cmd-item:not([style*="display: none"])'));
            const focused = cmdResults.querySelector('.cmd-item.focused');
            let idx = items.indexOf(focused);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                idx = (idx + 1) % items.length;
                setFocus(items, idx);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                idx = (idx - 1 + items.length) % items.length;
                setFocus(items, idx);
            } else if (e.key === 'Enter' && focused) {
                activateItem(focused);
            }
        }
    });

    function setFocus(items, idx) {
        items.forEach((item, i) => item.classList.toggle('focused', i === idx));
    }

    function activateItem(item) {
        const href = item.dataset.href;
        if (href) {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            closePalette();
        }
    }

    if (cmdResults) {
        cmdResults.querySelectorAll('.cmd-item').forEach((item) => {
            item.addEventListener('click', () => activateItem(item));
        });
    }

    // Search / filter palette items
    function resetFilter() {
        if (!cmdResults) return;
        cmdResults.querySelectorAll('.cmd-item').forEach((item) => {
            item.style.display = '';
            item.classList.remove('focused');
        });
        cmdResults.querySelectorAll('.cmd-group').forEach((g) => {
            g.style.display = '';
        });
    }

    if (cmdInput) {
        cmdInput.addEventListener('input', () => {
            const q = cmdInput.value.toLowerCase().trim();
            if (!q) { resetFilter(); return; }

            cmdResults.querySelectorAll('.cmd-item').forEach((item) => {
                const label = item.querySelector('.cmd-item-label').textContent.toLowerCase();
                item.style.display = label.includes(q) ? '' : 'none';
            });

            cmdResults.querySelectorAll('.cmd-group').forEach((g) => {
                const visible = Array.from(g.querySelectorAll('.cmd-item')).some(
                    (item) => item.style.display !== 'none'
                );
                g.style.display = visible ? '' : 'none';
            });
        });
    }

    // ── 9. Smooth scroll for internal links ─────────────
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 70; // navbar height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── 10. Active mobile nav ────────────────────────────
    const sections = document.querySelectorAll('section[id], footer');
    const mobNavItems = document.querySelectorAll('.mob-nav-item');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const map = { hero: 'mob-home', projects: 'mob-projects', tasks: 'mob-tasks', leaderboard: 'mob-lb', apply: 'mob-profile' };
                    const activeId = map[id];
                    if (activeId) {
                        mobNavItems.forEach((n) => n.classList.remove('active'));
                        const activeEl = document.getElementById(activeId);
                        if (activeEl) activeEl.classList.add('active');
                    }
                }
            });
        },
        { threshold: 0.4 }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    // ── 11. Live Contribution Simulation ────────────────
    const simOutput = document.getElementById('sim-output');
    const simFill = document.getElementById('sim-prog-fill');
    const simPct = document.getElementById('sim-prog-pct');
    const simRestart = document.getElementById('sim-restart');

    const SIM_LINES = [
        { text: '$ nwoc auth login', color: 'tc-purple', delay: 0 },
        { text: '✓ Authenticated as @aryan_dev', color: 'tc-green', delay: 600 },
        { text: '$ nwoc issue claim #089 --repo nexus-core', color: 'tc-purple', delay: 1300 },
        { text: '✓ Issue #089 locked to you for 72h', color: 'tc-green', delay: 2000 },
        { text: '  Title: Add OAuth2 Provider Support', color: '', delay: 2100 },
        { text: '  Points: 500 · Difficulty: Hard', color: 'tc-muted', delay: 2200 },
        { text: '$ git clone git@github.com:nexus/nexus-core.git', color: 'tc-purple', delay: 3000 },
        { text: 'Cloning into \'nexus-core\'...', color: 'tc-muted', delay: 3600 },
        { text: 'remote: Enumerating objects: 4,290...', color: 'tc-muted', delay: 3900 },
        { text: '✓ Repository cloned successfully.', color: 'tc-green', delay: 4400 },
        { text: '$ git checkout -b feat/oauth2-support', color: 'tc-purple', delay: 5000 },
        { text: 'Switched to a new branch \'feat/oauth2-support\'', color: 'tc-muted', delay: 5500 },
        { text: '$ vim src/auth/providers.ts', color: 'tc-purple', delay: 6200 },
        { text: '  [+] Added GitHubProvider class        [OAuth2 PKCE flow]', color: 'tc-cyan', delay: 7000 },
        { text: '  [+] Added GoogleProvider class        [OpenID Connect]', color: 'tc-cyan', delay: 7200 },
        { text: '  [+] Added GitLabProvider class        [OAuth2 + JWKS]', color: 'tc-cyan', delay: 7400 },
        { text: '  [+] Session token refresh middleware  [auto-rotate]', color: 'tc-cyan', delay: 7600 },
        { text: '$ npm run test -- --filter=auth', color: 'tc-purple', delay: 8400 },
        { text: '  ✓ AuthProvider.github   PASS  (23ms)', color: 'tc-green', delay: 9000 },
        { text: '  ✓ AuthProvider.google   PASS  (18ms)', color: 'tc-green', delay: 9200 },
        { text: '  ✓ AuthProvider.gitlab   PASS  (21ms)', color: 'tc-green', delay: 9400 },
        { text: '  ✓ Session.refresh       PASS  (14ms)', color: 'tc-green', delay: 9600 },
        { text: '  Tests: 4 passed, 0 failed', color: 'tc-green', delay: 9800 },
        { text: '$ git add -A && git commit -m "feat: add OAuth2 PKCE support"', color: 'tc-purple', delay: 10600 },
        { text: '[feat/oauth2-support a3f8c22] feat: add OAuth2 PKCE support', color: 'tc-muted', delay: 11000 },
        { text: '$ git push origin feat/oauth2-support', color: 'tc-purple', delay: 11700 },
        { text: '✓ Branch pushed to origin.', color: 'tc-green', delay: 12200 },
        { text: '$ nwoc pr create --title "Add OAuth2 PKCE support" --issue 089', color: 'tc-purple', delay: 13000 },
        { text: '✓ PR #342 opened → nexus-core/pulls/342', color: 'tc-green', delay: 13700 },
        { text: '! Awaiting review from @mana_singh (maintainer)...', color: 'tc-orange', delay: 14400 },
        { text: '✓ Review approved by @mana_singh: "Clean impl, LGTM!"', color: 'tc-green', delay: 15200 },
        { text: '✓ PR #342 merged into main', color: 'tc-green', delay: 16000 },
        { text: '', color: '', delay: 16100 },
        { text: '🏆 +500 pts added to your profile', color: 'tc-purple', delay: 16200 },
        { text: '🔥 Streak extended: 8-day streak active', color: 'tc-orange', delay: 16400 },
        { text: '⚡ New rank: #4 on the leaderboard', color: 'tc-cyan', delay: 16600 },
        { text: '▌', color: 'tc-purple term-cursor', delay: 16900 },
    ];

    let simTimers = [];
    let simRunning = false;

    function setProgress(pct) {
        if (!simFill || !simPct) return;
        simFill.style.width = pct + '%';
        simPct.textContent = Math.round(pct) + '%';
    }

    function runSimulation() {
        if (!simOutput) return;
        simOutput.innerHTML = '';
        setProgress(0);
        simRunning = true;

        const total = SIM_LINES.length;
        const maxDelay = SIM_LINES[total - 1].delay + 200;

        SIM_LINES.forEach((line, i) => {
            const t = setTimeout(() => {
                const p = document.createElement('p');
                p.className = 'sim-line ' + (line.color || '');
                p.textContent = line.text || '\u00A0';
                p.style.animationDelay = '0s';
                simOutput.appendChild(p);
                simOutput.scrollTop = simOutput.scrollHeight;

                // progress bar
                setProgress(((i + 1) / total) * 100);

                if (i === total - 1) simRunning = false;
            }, line.delay);
            simTimers.push(t);
        });
    }

    function clearSim() {
        simTimers.forEach(clearTimeout);
        simTimers = [];
        simRunning = false;
    }

    // Auto-start simulation on page load
    setTimeout(runSimulation, 900);

    // Restart button
    if (simRestart) {
        simRestart.addEventListener('click', () => {
            clearSim();
            runSimulation();
        });
    }

    // ── 12. FAQ Accordion ─────────────────────────────
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.hasAttribute('data-open');
            document.querySelectorAll('.faq-item').forEach(i => {
                i.removeAttribute('data-open');
                i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.setAttribute('data-open', '');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ── 13. Partner card logo glow on hover ──────────
    document.querySelectorAll('.partner-card').forEach(card => {
        const logo = card.querySelector('.partner-logo');
        if (!logo) return;
        card.addEventListener('mouseenter', () => {
            logo.style.textShadow = `0 0 24px ${logo.style.color}, 0 0 48px ${logo.style.color}40`;
        });
        card.addEventListener('mouseleave', () => {
            logo.style.textShadow = '';
        });
    });

}());

/* ====================================================
   Custom Cursor – glowing dot + trailing ring
   ==================================================== */
(function () {
    'use strict';

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    // Only on pointer-fine (desktop) devices
    if (!window.matchMedia('(pointer: fine)').matches) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot follows instantly
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Ring lags behind with lerp
    function animateRing() {
        ringX += (mouseX - ringX) * 0.14;
        ringY += (mouseY - ringY) * 0.14;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        rafId = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll('a, button, [tabindex], .glass-card, .task-card, .project-card, .core-team-card');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('cursor-hover');
            ring.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('cursor-hover');
            ring.classList.remove('cursor-hover');
        });
    });

    // Hide cursor when it leaves the window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    });
}());


