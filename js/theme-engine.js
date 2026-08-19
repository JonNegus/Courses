/**
 * 🛠️ THEME ENGINE CORE
 * Bus d'événements, orchestrateur et synthétiseur audio universel.
 */
class ThemeEngineCore {
  constructor() {
    this.currentTheme = null;
    this.canvas = null;
    this.ctx = null;
    this.audioCtx = null;
    this.themes = new Map();
    this._initListeners();
  }

  init(canvasId = 'fx-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  registerTheme(id, themeInstance) {
    this.themes.set(id, themeInstance);
  }

  setTheme(id) {
    if (this.currentTheme && this.currentTheme.destroy) {
      this.currentTheme.destroy();
    }
    const theme = this.themes.get(id) || this.themes.values().next().value;
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', id);

    if (this.currentTheme && this.currentTheme.init) {
      this.currentTheme.init({ canvas: this.canvas, ctx: this.ctx });
    }
  }

  _initListeners() {
    const events = [
      'item-toggled', 'item-deleting', 'items-clearing',
      'total-changed', 'action-undone'
    ];

    events.forEach(eventName => {
      window.addEventListener(`app:${eventName}`, (e) => {
        this.initAudio();
        this._dispatchToTheme(eventName, e.detail);
      });
    });
  }

  _dispatchToTheme(eventName, detail) {
    if (!this.currentTheme) return;
    const methodName = 'on' + eventName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

    if (typeof this.currentTheme[methodName] === 'function') {
      if (detail && typeof detail.done === 'function') {
        let doneCalled = false;
        const safetyTimeout = setTimeout(() => {
          if (!doneCalled) {
            doneCalled = true;
            detail.done();
          }
        }, 1200);

        const safeDone = () => {
          if (!doneCalled) {
            doneCalled = true;
            clearTimeout(safetyTimeout);
            detail.done();
          }
        };

        this.currentTheme[methodName]({ ...detail, done: safeDone });
      } else {
        this.currentTheme[methodName](detail);
      }
    } else if (detail && typeof detail.done === 'function') {
      detail.done();
    }
  }

  playSynthSound(freq, type = 'sine', duration = 0.1, volume = 0.05) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }
}

window.ThemeEngine = new ThemeEngineCore();
