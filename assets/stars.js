const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

// More stars + faster speed
const STAR_COUNT = 700;
const SPEED = 0.05;

// Colors for stars (soft sci‑fi palette)
const COLORS = [
    "rgba(255,255,255,1)",   // white
    "rgba(180,200,255,1)",   // pale blue
    "rgba(255,220,180,1)",   // warm gold
    "rgba(200,180,255,1)"    // lavender
];

let stars = [];

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * canvas.width,
            y: (Math.random() - 0.5) * canvas.height,
            z: Math.random() * canvas.width,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
    }
}

function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
        star.z -= SPEED;

        // Reset star when it reaches the viewer
        if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * canvas.width;
            star.y = (Math.random() - 0.5) * canvas.height;
            star.z = canvas.width;
            star.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }

        const k = 128 / star.z;
        const sx = star.x * k + canvas.width / 2;
        const sy = star.y * k + canvas.height / 2;

        if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) continue;

        const size = (1 - star.z / canvas.width) * 2.2;

        ctx.fillStyle = star.color;
        ctx.fillRect(sx, sy, size, size);
    }

    requestAnimationFrame(update);
}

initStars();
update();
