// ===== CONFIG =====
const gap = 6;
const speed = 0.001;

const baseColor = "#F69A9A";
const highlightColor = "#EF5555";
const backgroundColor = "#FFFFFF";

const attractorCount = 6;
const attractors = [];

// ===== UTILS =====
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

const baseRgb = hexToRgb(baseColor);
const highlightRgb = hexToRgb(highlightColor);

// ===== P5 =====
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initAttractors();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initAttractors();
}

function initAttractors() {
  attractors.length = 0;

  const zones = [
    { xMin: 0.02, xMax: 0.30, yMin: 0.02, yMax: 0.35 },
    { xMin: 0.70, xMax: 0.98, yMin: 0.02, yMax: 0.35 },
    { xMin: 0.02, xMax: 0.30, yMin: 0.65, yMax: 0.98 },
    { xMin: 0.70, xMax: 0.98, yMin: 0.65, yMax: 0.98 },
    { xMin: 0.25, xMax: 0.55, yMin: 0.02, yMax: 0.15 },
    { xMin: 0.45, xMax: 0.75, yMin: 0.85, yMax: 0.98 }
  ];

  for (let i = 0; i < attractorCount; i++) {
    const z = zones[i % zones.length];
    attractors.push({
      x: width * (z.xMin + random() * (z.xMax - z.xMin)),
      y: height * (z.yMin + random() * (z.yMax - z.yMin)),
      vx: random(-1, 1),
      vy: random(-1, 1)
    });
  }
}

function draw() {
  background(backgroundColor);

  const moveSpeed = speed * 273;

  // ===== UPDATE ATTRACTORS =====
  for (let i = 0; i < attractors.length; i++) {
    const a = attractors[i];

    // Peer repulsion
    const repRadius = min(width, height) * 0.468;
    const repRadiusSq = repRadius * repRadius;

    for (let j = 0; j < attractors.length; j++) {
      if (i === j) continue;
      const b = attractors[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;

      if (d2 < repRadiusSq && d2 > 0.1) {
        const d = sqrt(d2);
        const f = (repRadius - d) / repRadius;
        const s = 0.04704;
        a.vx += (dx / d) * f * s;
        a.vy += (dy / d) * f * s;
      }
    }

    // Mouse repulsion
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      const dx = a.x - mouseX;
      const dy = a.y - mouseY;
      const d2 = dx * dx + dy * dy;
      const r = 400;

      if (d2 < r * r) {
        const d = sqrt(d2);
        const f = (r - d) / r;
        a.vx += (dx / d) * f * 5.0;
        a.vy += (dy / d) * f * 5.0;
      }
    }

    // Speed control
    const sp = sqrt(a.vx * a.vx + a.vy * a.vy);
    if (sp > 10) {
      a.vx = (a.vx / sp) * 10;
      a.vy = (a.vy / sp) * 10;
    } else if (sp > 1) {
      a.vx *= 0.96;
      a.vy *= 0.96;
    } else if (sp < 0.5 && sp > 0) {
      a.vx *= 1.05;
      a.vy *= 1.05;
    }

    a.x += a.vx * moveSpeed;
    a.y += a.vy * moveSpeed;

    // Bounds
    if (a.x <= 0 || a.x >= width) a.vx *= -1;
    if (a.y <= 0 || a.y >= height) a.vy *= -1;
  }

  // ===== RENDER GRID =====
  const rows = ceil(height / gap);
  const cols = ceil(width / gap);

  const infRadius = min(width, height) * 0.6;
  const infRadiusSq = infRadius * infRadius;

  const cx0 = width / 2;
  const cy0 = height / 2;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = x * gap + gap / 2;
      const cy = y * gap + gap / 2;

      let influence = 0;

      for (const a of attractors) {
        const dx = cx - a.x;
        const dy = cy - a.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < infRadiusSq) {
          const d = sqrt(d2);
          const t = d / infRadius;
          influence += 0.5 * (1 + cos(PI * t));
        }
      }

      let intensity = influence / 2;

      // Center reflector
      const dxr = cx - cx0;
      const dyr = cy - cy0;
      const d2r = dxr * dxr + dyr * dyr;

      if (d2r < infRadiusSq) {
        const dr = sqrt(d2r);
        const tr = dr / infRadius;
        intensity *= (1 - 0.5 * (1 + cos(PI * tr)));
      }

      intensity = constrain(intensity, 0, 1);

      if (intensity > 0.01) {
        const r = baseRgb.r + (highlightRgb.r - baseRgb.r) * intensity;
        const g = baseRgb.g + (highlightRgb.g - baseRgb.g) * intensity;
        const b = baseRgb.b + (highlightRgb.b - baseRgb.b) * intensity;

        fill(r, g, b);
        const radius = intensity * gap * 0.48;
        ellipse(cx, cy, radius * 2);
      }
    }
  }
}
