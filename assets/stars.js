// assets/stars.js - subtle forward-travel starfield with layered depth and rare shooting stars
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0, dpr = 1;
  let layers = []; // each layer: {stars:[], speed, sizeRange, alphaRange, parallax}
  let shootingStars = [];
  let lastTime = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(min, max){ return Math.random()*(max-min)+min; }

  class Star {
    constructor(layer) {
      this.layer = layer;
      this.reset(true);
    }
    reset(initial=false){
      // spawn across a slightly larger area so stars drift in smoothly
      this.x = rand(-0.1*w, 1.1*w);
      this.y = initial ? rand(0, h) : rand(-0.2*h, -0.05*h);
      this.size = rand(this.layer.sizeMin, this.layer.sizeMax);
      this.speed = rand(this.layer.speedMin, this.layer.speedMax);
      this.alpha = rand(this.layer.alphaMin, this.layer.alphaMax);
      this.twinkle = rand(0.002, 0.01);
      this.phase = Math.random()*Math.PI*2;
    }
    update(dt){
      // forward travel: stars slowly move downward and slightly scale to simulate approach
      this.y += this.speed * dt * this.layer.speedFactor;
      // subtle horizontal drift for parallax
      this.x += Math.sin((this.y + this.phase) * this.layer.driftFreq) * this.layer.driftAmp * dt;
      // gentle twinkle
      this.alpha += Math.sin((Date.now()*0.001 + this.phase) * this.twinkle) * 0.01;
      if (this.y > h + 20) this.reset(false);
    }
    draw(){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, this.alpha))})`;
      // draw as soft circle
      const r = this.size;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r*2);
      g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      g.addColorStop(0.6, `rgba(200,220,255,${this.alpha*0.6})`);
      g.addColorStop(1, `rgba(200,220,255,0)`);
      ctx.fillStyle = g;
      ctx.arc(this.x, this.y, r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function createLayers() {
    layers = [];
    // far layer: many tiny slow stars
    layers.push({
      count: Math.floor(w/8),
      speedMin: 6, speedMax: 12,
      sizeMin: 0.3, sizeMax: 0.9,
      alphaMin: 0.15, alphaMax: 0.45,
      speedFactor: 0.6,
      driftFreq: 0.002, driftAmp: 6,
      stars: []
    });
    // mid layer: medium stars
    layers.push({
      count: Math.floor(w/18),
      speedMin: 12, speedMax: 28,
      sizeMin: 0.8, sizeMax: 1.8,
      alphaMin: 0.25, alphaMax: 0.7,
      speedFactor: 1.0,
      driftFreq: 0.003, driftAmp: 10,
      stars: []
    });
    // near layer: fewer, brighter, slightly faster
    layers.push({
      count: Math.floor(w/60),
      speedMin: 20, speedMax: 48,
      sizeMin: 1.6, sizeMax: 3.2,
      alphaMin: 0.35, alphaMax: 0.95,
      speedFactor: 1.6,
      driftFreq: 0.004, driftAmp: 14,
      stars: []
    });

    // scale counts down on small screens
    if (window.innerWidth < 600) {
      layers.forEach(l => l.count = Math.max(6, Math.floor(l.count * 0.5)));
    }

    // create star objects
    layers.forEach(layer => {
      layer.stars = [];
      layer.sizeMin = layer.sizeMin;
      layer.sizeMax = layer.sizeMax;
      layer.speedMin = layer.speedMin;
      layer.speedMax = layer.speedMax;
      layer.alphaMin = layer.alphaMin;
      layer.alphaMax = layer.alphaMax;
      for (let i=0;i<layer.count;i++) layer.stars.push(new Star(layer));
    });
  }

  // shooting star class
  class ShootingStar {
    constructor(){
      this.reset();
    }
    reset(){
      // spawn from random edge toward center-right to simulate passing by
      const fromLeft = Math.random() < 0.5;
      this.x = fromLeft ? rand(-0.2*w, 0) : rand(w, w*1.2);
      this.y = rand(0, h*0.6);
      this.len = rand(80, 220);
      this.speed = rand(800, 1600); // px per second
      this.angle = fromLeft ? rand(-0.2, 0.2) : rand(Math.PI-0.2, Math.PI+0.2);
      this.life = 0;
      this.maxLife = rand(0.6, 1.2);
      this.alpha = 0;
    }
    update(dt){
      this.life += dt;
      this.x += Math.cos(this.angle) * this.speed * dt;
      this.y += Math.sin(this.angle) * this.speed * dt;
      // fade in/out
      const t = this.life / this.maxLife;
      this.alpha = Math.max(0, Math.min(1, (1 - Math.abs(0.5 - t)*2)));
      if (this.life > this.maxLife) {
        this.reset();
        this.life = 0;
        // make it rare: sometimes keep it inactive for a bit
        if (Math.random() < 0.6) this.life = -rand(0.5, 3.0);
      }
    }
    draw(){
      if (this.life < 0) return; // inactive delay
      ctx.save();
      ctx.globalAlpha = 0.9 * this.alpha;
      ctx.strokeStyle = `rgba(255,255,255,${0.9*this.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle)*this.len, this.y - Math.sin(this.angle)*this.len);
      ctx.stroke();
      // soft head
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 12);
      g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    createLayers();
    shootingStars = [];
    // create a couple of shooting stars but they'll be mostly inactive
    for (let i=0;i<3;i++){
      const s = new ShootingStar();
      // stagger activation
      s.life = -rand(0, 6);
      shootingStars.push(s);
    }
  }

  // handle device pixel ratio changes and recreate layers when size changes significantly
  let lastW = w, lastH = h;
  function maybeRecreate() {
    if (Math.abs(lastW - window.innerWidth) > 50 || Math.abs(lastH - window.innerHeight) > 50) {
      lastW = window.innerWidth; lastH = window.innerHeight;
      createLayers();
    }
  }

  function clearFrame() {
    // draw a very subtle translucent black to create gentle trails
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, w, h);
  }

  function loop(ts) {
    const now = ts || performance.now();
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;

    maybeRecreate();
    // subtle motion: clear with slight alpha to leave faint trails
    clearFrame();

    // draw layers back-to-front
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      for (const s of layer.stars) {
        s.update(dt);
        s.draw();
      }
    }

    // occasionally spawn a shooting star (very rare)
    if (Math.random() < 0.002) {
      const s = shootingStars[Math.floor(Math.random()*shootingStars.length)];
      s.life = 0;
      s.reset();
    }

    for (const ss of shootingStars) {
      ss.update(dt);
      ss.draw();
    }

    requestAnimationFrame(loop);
  }

  // initialize and start
  init();
  lastTime = performance.now();
  requestAnimationFrame(loop);

  // expose a simple API to reduce density if needed
  window.__stars = {
    reduceDensity() {
      layers.forEach(l => { l.stars = l.stars.slice(0, Math.max(6, Math.floor(l.stars.length*0.6))); });
    },
    increaseDensity() {
      createLayers();
    }
  };
})();
