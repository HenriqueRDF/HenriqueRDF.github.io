// --- 0. LENIS SCROLL ---
const lenis = new Lenis({
    duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical', smooth: true, mouseMultiplier: 1, touchMultiplier: 2
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
    });
});

// --- 1. THEME TOGGLE ---
const themeBtn = document.getElementById('theme-toggle');
const icon = themeBtn.querySelector('i');
const body = document.body;
let isDark = localStorage.getItem('theme') === 'dark';

if (isDark) { body.classList.add('dark-mode'); icon.classList.replace('fa-moon', 'fa-sun'); }

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    isDark = body.classList.contains('dark-mode');
    icon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    animateParticles();
});

// --- 2. PARTICLES ---
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');
let width, height, particles = [];

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 1.5;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)';
        ctx.fill();
    }
}
for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, index) => {
        p.update(); p.draw();
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
            if (dist < 180) {
                ctx.beginPath();
                const baseColor = isDark ? '255,255,255' : '0,0,0';
                ctx.strokeStyle = `rgba(${baseColor},${isDark ? 0.1 - dist/1500 : 0.15 - dist/1500})`;
                ctx.lineWidth = 1; ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- 3. SPOTLIGHT ---
const grid = document.getElementById('spotlight-grid');
const cards = document.querySelectorAll('.project-card');
if (grid) {
    grid.addEventListener('mousemove', (e) => {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

// --- 4. SCROLL REVEAL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// --- 5. CERTIFICATES SCROLL ---
const scrollBtn = document.getElementById('scroll-btn');
const certList = document.getElementById('cert-list');
if (scrollBtn && certList) {
    scrollBtn.addEventListener('click', () => certList.scrollBy({ top: 200, behavior: 'smooth' }));
    certList.addEventListener('scroll', () => {
        if (certList.scrollTop + certList.clientHeight >= certList.scrollHeight - 10) {
            scrollBtn.style.opacity = '0'; scrollBtn.style.pointerEvents = 'none';
        } else {
            scrollBtn.style.opacity = '1'; scrollBtn.style.pointerEvents = 'auto';
        }
    });
}

// --- 6. TESTIMONIALS SLIDER (DOTS FIXED) ---
const track = document.querySelector('.testimonials-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');
const dotsContainer = document.querySelector('.slider-indicators');
const slideWidth = 350 + 30; // Largura card + gap

// Limpa para não duplicar
dotsContainer.innerHTML = ''; 

// Cria bolinhas
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('indicator');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => moveToSlide(index));
    dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);
let currentSlideIndex = 0;

const moveToSlide = (targetIndex) => {
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > slides.length - 1) targetIndex = slides.length - 1;
    track.style.transform = `translateX(-${targetIndex * slideWidth}px)`;
    currentSlideIndex = targetIndex;
    dots.forEach(d => d.classList.remove('active'));
    if(dots[targetIndex]) dots[targetIndex].classList.add('active');
};

if(nextButton) nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1 < slides.length ? currentSlideIndex + 1 : 0));
if(prevButton) prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex > 0 ? currentSlideIndex - 1 : 0));

// Drag
let isDown = false, startX, scrollLeft;
const container = document.querySelector('.testimonials-track-container');
container.addEventListener('mousedown', e => { isDown = true; container.style.cursor = 'grabbing'; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; });
container.addEventListener('mouseleave', () => { isDown = false; container.style.cursor = 'grab'; });
container.addEventListener('mouseup', () => { isDown = false; container.style.cursor = 'grab'; });
container.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - container.offsetLeft; const walk = (x - startX) * 2; container.scrollLeft = scrollLeft - walk; });

// --- 7. COPY EMAIL (TOOLTIP FIXED) ---
const emailWrapper = document.getElementById('copy-email');
if (emailWrapper) {
    const emailText = document.getElementById('email-text').innerText;
    const tooltip = emailWrapper.querySelector('.tooltip');
    emailWrapper.addEventListener('click', () => {
        navigator.clipboard.writeText(emailText).then(() => {
            tooltip.innerText = "Copiado!";
            emailWrapper.classList.add('copied');
            setTimeout(() => { emailWrapper.classList.remove('copied'); setTimeout(() => { tooltip.innerText = "Copiar Email"; }, 300); }, 2000);
        });
    });
}