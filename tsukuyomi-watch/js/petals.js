/* ===================================================
   Cherry Blossom Petals Animation
   =================================================== */

(function () {
    const container = document.getElementById('petals-container');
    if (!container) return;

    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        const size = 8 + Math.random() * 10;
        const startX = Math.random() * window.innerWidth;
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * 15;
        const drift = (Math.random() - 0.5) * 200;

        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.left = startX + 'px';
        petal.style.top = '-20px';
        petal.style.animationDuration = duration + 's';
        petal.style.animationDelay = delay + 's';

        // Custom keyframes with horizontal drift
        petal.animate([
            { transform: `translateX(0) translateY(-20px) rotate(0deg) scale(0.8)`, opacity: 0 },
            { transform: `translateX(${drift * 0.3}px) translateY(20vh) rotate(180deg) scale(1)`, opacity: 0.6, offset: 0.2 },
            { transform: `translateX(${drift * 0.7}px) translateY(60vh) rotate(400deg) scale(0.7)`, opacity: 0.4, offset: 0.7 },
            { transform: `translateX(${drift}px) translateY(100vh) rotate(720deg) scale(0.3)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            easing: 'linear',
            fill: 'forwards'
        });

        container.appendChild(petal);

        // Cleanup
        setTimeout(() => {
            petal.remove();
        }, (duration + delay) * 1000 + 100);
    }

    // Create petals periodically
    function spawnPetals() {
        for (let i = 0; i < 3; i++) {
            createPetal();
        }
    }

    // Initial burst
    for (let i = 0; i < 8; i++) {
        createPetal();
    }

    // Ongoing
    setInterval(spawnPetals, 4000);
})();
