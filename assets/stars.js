// assets/stars.js
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], numStars = 120;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    constructor(){ this.reset(); }
    reset(){
      this.x = rand(0, w);
      this.y = rand(-h, 0);
      this.size = rand(0.6, 2.2);
      this.speed = rand(0.4, 2.2);
      this.alpha = rand(0.4, 1);
      this.angle = rand(0.02, 0.12);
    }
    update(){
      this.y += this.speed;
      this.x += Math.sin(this.y * this.angle) * 0.5;
      if (this.y > h + 10) this.reset();
    }
    draw(){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function init(){
    stars = [];
    for (let i = 0; i < numStars; i++) stars.push(new Star());
  }

  if (window.innerWidth < 600) numStars = 60;
  init();

  function loop(){
    // semi-transparent fill creates trailing effect
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, w, h);
    for (const s of stars) { s.update(); s.draw(); }
    requestAnimationFrame(loop);
  }
  loop();
})();
