// assets/stars.js - subtle forward travel using tiny dots (perspective warp)
(function(){
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0, DPR = 1;
  let stars = [];
  const BASE_COUNT = 220; // overall density; lowered on small screens
  const MAX_DPR = 2;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initStars();
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(a,b){ return Math.random()*(b-a)+a; }

  // star properties: x,y in normalized coords (-1..1), z depth (0..1)
  class Star {
    constructor(){
      this.reset(true);
    }
    reset(initial=false){
      // spawn near center with random angle and depth
      const angle = rand(0, Math.PI*2);
      const r = initial ? Math.sqrt(Math.random()) * rand(0, 0.9) : rand(0, 0.12);
      this.nx = Math.cos(angle) * r; // normalized x
      this.ny = Math.sin(angle) * r; // normalized y
      this.z = initial ? rand(0.02, 1) : rand(0.98, 1); // start far (near 1) when newly spawned to create forward motion
      this.baseSize = rand(0.6, 1.6); // tiny dots
      this.speed = rand(0.18, 0.6); // how fast z decreases (forward motion)
      this.alpha = rand(0.35, 0.95);
    }
    update(dt){
      // move forward by decreasing z
      this.z -= this.speed * dt;
      // slight random jitter to avoid perfectly straight lines
      this.nx += Math.sin(this.z*50 + this.nx*10) * 0.0008 * dt * 60;
      this.ny += Math.cos(this.z*50 + this.ny*10) * 0.0008 * dt * 60;
      if (this.z <= 0.02 || Math.abs(this.screenX()) > W*1.2 || Math.abs(this.screenY()) > H*1.2) {
        this.reset(false);
      }
    }
    // convert normalized coords and depth to screen coords
    screenX(){
      // perspective: nearer (small z) => larger scale
      const f = (1 - this.z) * 1.8 + 0.2;
      return (this.nx * f) * (W/2) + (W/2);
    }
    screenY(){
      const f = (1 - this.z) * 1.8 + 0.2;
      return (this.ny * f) * (H/2) + (H/2);
    }
    draw(){
      const x = this.screenX();
      const y = this.screenY();
      const size = Math.max(0.4, this.baseSize * ((1 - this.z) * 1.6 + 0.4));
      // tiny soft dot
      const g = ctx.createRadialGradient(x, y, 0, x, y, size*2);
      const a = Math.max(0, Math.min(1, this.alpha));
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.6, `rgba(200,220,255,${a*0.45})`);
      g.addColorStop(1, `rgba(200,220,255,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function initStars(){
    const count = window.innerWidth < 600 ? Math.floor(BASE_COUNT*0.45) : BASE_COUNT;
    stars = [];
    for (let i=0;i<count;i++) stars.push(new Star());
  }

  // gentle clear to leave faint motion blur/trails
  function clear(dt){
    // alpha tuned for subtle trailing; larger alpha = shorter trails
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0,0,W,H);
  }

  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now - last)/1000);
    last = now;

    clear(dt);

    // draw all stars
    for (let s of stars){
      s.update(dt);
      s.draw();
    }

    requestAnimationFrame(loop);
  }

  // start
  initStars();
  last = performance.now();
  requestAnimationFrame(loop);

  // small API to reduce density if needed
  window.__tinyStarfield = {
    reduce() { stars = stars.slice(0, Math.max(8, Math.floor(stars.length*0.5))); },
    restore() { initStars(); }
  };
})();
