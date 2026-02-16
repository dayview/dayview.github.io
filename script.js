const canvas = document.getElementById('metroCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    lastX: canvas.width / 2,
    lastY: canvas.height / 2
};

class FlowParticle {
    constructor(x, y, velocityX, velocityY, hue = 30) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = Math.random() * 3 + 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.015 + 0.01;
        this.hue = hue;
        this.wobble = Math.random() * 0.5;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.velocityX + Math.sin(this.wobble) * 0.5;
        this.y += this.velocityY + Math.cos(this.wobble) * 0.5;
        this.wobble += this.wobbleSpeed;

        this.velocityX *= 0.98;
        this.velocityY *= 0.98;

        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw() {
        if (this.life <= 0) return;

        const alpha = this.life * 0.6;

        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );

        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() {
        return this.life > 0;
    }
}

let particles = [];
let isMouseMoving = false;
let mouseStopTimer = null;

document.addEventListener('mousemove', (e) => {
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMouseMoving = true;

    createFlowingStripe(mouse.x, mouse.y, mouse.lastX, mouse.lastY);

    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => {
        isMouseMoving = false;
    }, 100);
});


function createFlowingStripe(x, y, lastX, lastY) {
    const velocityX = (x - lastX) * 0.3;
    const velocityY = (y - lastY) * 0.3;
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (speed < 0.5) return;

    const particleCount = Math.min(Math.floor(speed / 2), 8);

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.atan2(velocityY, velocityX);
        const perpAngle = angle + Math.PI / 2;

        const spread = (Math.random() - 0.5) * 30;
        const offsetX = Math.cos(perpAngle) * spread;
        const offsetY = Math.sin(perpAngle) * spread;

        const vx = velocityX + (Math.random() - 0.5) * 2;
        const vy = velocityY + (Math.random() - 0.5) * 2;

        const hue = 30 + (Math.random() - 0.5) * 10;

        particles.push(new FlowParticle(
            x + offsetX,
            y + offsetY,
            vx,
            vy,
            hue
        ));
    }

    if (particles.length > 1500) {
        particles = particles.slice(-1500);
    }
}

function createAmbientFlow() {
    if (!isMouseMoving && particles.length < 50) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;

            particles.push(new FlowParticle(x, y, vx, vy, 30));
        }
    }
}

function animate() {
    ctx.fillStyle = 'rgba(250, 249, 246, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.isAlive();
    });

    if (Math.random() < 0.3) {
        createAmbientFlow();
    }

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;

    createFlowingStripe(mouse.x, mouse.y, mouse.lastX, mouse.lastY);
}, { passive: false });