/* ===================================================
   Celestial Starfield & Interactive 3D Depth Engine
   Features:
     - 2D Canvas Starfield with Twinkling Stars & Constellations
     - Occasional Shooting Stars
     - Restrained 3D Card Tilt Effects
     - Parallax Depth & Reduced-Motion Accessibility
   =================================================== */

const StarfieldEngine = (() => {
    'use strict';

    let canvas = null;
    let ctx = null;
    let stars = [];
    let shootingStars = [];
    let width = 0;
    let height = 0;
    let animFrame = null;
    let mouseX = 0;
    let mouseY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init(canvasId = 'celestialCanvas') {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            // Create background canvas dynamically if missing
            canvas = document.createElement('canvas');
            canvas.id = canvasId;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '0';
            document.body.prepend(canvas);
        }

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        if (!prefersReducedMotion) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        createStars();
        animate();
        init3DCardTilt();
    }

    function resize() {
        if (!canvas) return;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        targetParallaxX = (mouseX / width - 0.5) * 25;
        targetParallaxY = (mouseY / height - 0.5) * 18;
    }

    function createStars() {
        stars = [];
        const count = Math.floor((width * height) / 7500); // Responsive density

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.6 + 0.4,
                alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.025 + 0.008,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                color: Math.random() > 0.8 ? '#ffd700' : (Math.random() > 0.6 ? '#c9d6df' : '#ffffff'),
                depth: Math.random() * 0.8 + 0.2 // Parallax layer
            });
        }
    }

    function spawnShootingStar() {
        if (shootingStars.length >= 2 || Math.random() > 0.015 || prefersReducedMotion) return;

        shootingStars.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.3,
            length: Math.random() * 70 + 40,
            speed: Math.random() * 9 + 12,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            opacity: 1,
            decay: 0.02
        });
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Smooth parallax damping
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

        // Draw Twinkling Stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            // Twinkle oscillation
            if (!prefersReducedMotion) {
                s.alpha += s.twinkleSpeed * s.twinkleDir;
                if (s.alpha >= 1) {
                    s.alpha = 1;
                    s.twinkleDir = -1;
                } else if (s.alpha <= 0.2) {
                    s.alpha = 0.2;
                    s.twinkleDir = 1;
                }
            }

            const drawX = (s.x + currentParallaxX * s.depth + width) % width;
            const drawY = (s.y + currentParallaxY * s.depth + height) % height;

            ctx.beginPath();
            ctx.arc(drawX, drawY, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.fill();
        }

        // Draw Shooting Stars
        spawnShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const tailX = ss.x - Math.cos(ss.angle) * ss.length;
            const tailY = ss.y - Math.sin(ss.angle) * ss.length;

            const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 215, 0, ${ss.opacity})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= ss.decay;

            if (ss.opacity <= 0 || ss.x > width || ss.y > height) {
                shootingStars.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1;
        animFrame = requestAnimationFrame(animate);
    }

    /**
     * Subtle, restrained 3D Card Tilt Effect.
     * Note: Map container (#sec-map) is explicitly excluded to keep the map
     * firmly fixed, flat, and stable for panning, zooming, and marker interaction.
     */
    function init3DCardTilt() {
        if (prefersReducedMotion) return;

        // Strictly exclude map section and map elements
        const tiltCards = document.querySelectorAll(
            '.katana-card:not(#sec-map):not(.map-fixed-card), .sanctuary-preview-card, .metric-card'
        );

        tiltCards.forEach(card => {
            // Safety guard: never tilt map or anything inside map
            if (card.id === 'sec-map' || card.classList.contains('map-fixed-card') || card.closest('#sec-map')) {
                return;
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
                const rotateY = ((x - centerX) / centerX) * 6;  // Max 6 deg

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                card.style.transition = 'transform 0.4s ease';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'none';
            });
        });
    }

    return {
        init,
        init3DCardTilt
    };
})();

