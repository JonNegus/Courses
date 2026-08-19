/**
 * 🎨 DRIVER DE THÈME : Clair Obscur - Expédition 33
 */
class Expedition33Theme {
  constructor() {
    this.particles = [];
    this.animating = false;
  }

  init({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  onItemToggled({ checked }) {
    if (checked) {
      window.ThemeEngine.playSynthSound(1200, 'sawtooth', 0.05, 0.04);
      setTimeout(() => window.ThemeEngine.playSynthSound(400, 'sine', 0.1, 0.02), 40);
    } else {
      window.ThemeEngine.playSynthSound(293.66, 'triangle', 0.2, 0.05);
    }
  }

  onItemDeleting({ element, done }) {
    window.ThemeEngine.playSynthSound(140, 'sawtooth', 0.25, 0.06);
    if (!element) return done();

    const rect = element.getBoundingClientRect();
    this._spawnParticles(rect, 30, '#c5a059'); // Or
    this._spawnParticles(rect, 30, '#2a2f3a'); // Cendres

    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';

    this._startLoop(done);
  }

  onItemsClearing({ items, done }) {
    window.ThemeEngine.playSynthSound(110, 'sawtooth', 0.5, 0.08);

    items.forEach(({ el }) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        this._spawnParticles(rect, 25, '#66fcf1'); // Cyan
        this._spawnParticles(rect, 35, '#c5a059'); // Or
        el.style.transition = 'all 0.4s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-15px)';
      }
    });

    this._startLoop(done);
  }

  onTotalChanged({ delta }) {
    if (delta > 0) {
      window.ThemeEngine.playSynthSound(1567.98, 'sine', 0.08, 0.03);
      setTimeout(() => window.ThemeEngine.playSynthSound(2093.00, 'sine', 0.12, 0.04), 60);

      const targetTop = window.innerHeight - 60;
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: Math.random() * window.innerWidth,
          y: targetTop - 100 - Math.random() * 50,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 4 + 2,
          life: 1.0,
          decay: 0.02,
          size: Math.random() * 4 + 2,
          color: '#d4af37'
        });
      }
      this._startLoop();
    }
  }

  onPriceUpdated({ element, delta }) {
    window.ThemeEngine.playSynthSound(1567.98, 'sine', 0.06, 0.02);

    if (element) {
      const rect = element.getBoundingClientRect();
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: rect.left + Math.random() * rect.width,
          y: rect.top + Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 0.5,
          life: 1.0,
          decay: 0.03,
          size: Math.random() * 1.5 + 0.8, // Particules très fines
          color: '#66fcf1'
        });
      }
      this._startLoop();
    }

    if (delta !== 0) {
      this.onTotalChanged({ delta });
    }
  }

  onActionUndone() {
    window.ThemeEngine.playSynthSound(523.25, 'sine', 0.15, 0.05);
  }

  _spawnParticles(rect, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        size: Math.random() * 3.5 + 1,
        color: color
      });
    }
  }

  _startLoop(onComplete) {
    if (this.animating) return;
    this.animating = true;

    const loop = () => {
      const ctx = window.ThemeEngine.ctx;
      ctx.clearRect(0, 0, window.ThemeEngine.canvas.width, window.ThemeEngine.canvas.height);
      let alive = 0;

      for (let p of this.particles) {
        if (p.life > 0) {
          alive++;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (alive > 0) {
        requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, window.ThemeEngine.canvas.width, window.ThemeEngine.canvas.height);
        this.particles = [];
        this.animating = false;
        if (onComplete) onComplete();
      }
    };
    loop();
  }
}

// Auto-enregistrement
window.ThemeEngine.registerTheme('expedition33', new Expedition33Theme());
