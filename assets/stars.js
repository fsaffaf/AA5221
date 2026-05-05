const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

const STAR_COUNT = 600;
const SPEED = 0.02;

let stars = [];

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * canvas.width,
            y: (Math.random() - 0.5) * canvas.height,
            z: Math.random() * canvas.width
        });
    }
}

function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
        star.z -= SPEED;
        if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * canvas.width;
            star.y = (Math.random() - 0.5) * canvas.height;
            star.z = canvas.width;
        }

        const k = 128 / star.z;
        const sx = star.x * k + canvas.width / 2;
        const sy = star.y * k + canvas.height / 2;

        if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) continue;

        const size = (1 - star.z / canvas.width) * 2;
        ctx.fillStyle = "white";
        ctx.fillRect(sx, sy, size, size);
    }

    requestAnimationFrame(update);
}

initStars();
update();
