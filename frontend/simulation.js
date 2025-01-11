const canvas = document.getElementById('harmonic-canvas');
const ctx = canvas.getContext('2d');
const graphSVG = document.getElementById('graph-svg');

let frame;
let t = 0;

function simulate() {
    const m = parseFloat(document.getElementById('mass').value);
    const k = parseFloat(document.getElementById('spring-constant').value);
    const b = parseFloat(document.getElementById('damping').value);
    const A = parseFloat(document.getElementById('amplitude').value);

    let p = A;
    let v = 0;

    const dt = 0.02;

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const a = -(k / m) * p - b * v;
        v += a * dt;
        p += v * dt;

        t += dt;

        draw(p);
        plotGraph(t, p);

        frame = requestAnimationFrame(update);
    }

    update();
}

function draw(position) {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - position * 100, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function plotGraph(time, position) {
    const x = time * 100 % graphSVG.clientWidth;
    const y = graphSVG.clientHeight / 2 - position * 100;

    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('cx', x);
    point.setAttribute('cy', y);
    point.setAttribute('r', 2);
    point.setAttribute('fill', 'red');
    graphSVG.appendChild(point);
}

document.getElementById('start-simulation').addEventListener('click', () => {
    if (frame) cancelAnimationFrame(frame);
    time = 0;
    graphSVG.innerHTML = '';
    simulate();
});