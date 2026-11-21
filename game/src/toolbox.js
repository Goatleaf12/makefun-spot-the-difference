// The painter's toolbox: every drawable thing the three Twin Skies scenes are
// built from — skies, suns, clouds, hills, balloons, tents, boats, lights and
// the rest. Each helper draws one thing at a position in panel space (600 by 600,
// origin at the panel's top-left) and knows nothing about the game around it.
// The scenes in scenes.js compose these; the differences between the two panels
// of a pair are made by calling the same helper with different arguments.

/** Fill the whole panel with a vertical gradient through the given colour stops. */
export function sky(g, stops) {
  const grad = g.createLinearGradient(0, 0, 0, 600);
  for (const [at, colour] of stops) grad.addColorStop(at, colour);
  g.fillStyle = grad;
  g.fillRect(0, 0, 600, 600);
}

/** A filled path through the given ridge points, closed along the panel's bottom. */
export function ridge(g, points, colour) {
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(0, 600);
  g.lineTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    g.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  const [lx, ly] = points[points.length - 1];
  g.lineTo(lx, ly);
  g.lineTo(600, 600);
  g.closePath();
  g.fill();
}

/** A sun disc; with rays, eight short spokes around it. */
export function sun(g, x, y, r, colour, rays) {
  if (rays) {
    g.strokeStyle = colour;
    g.lineWidth = 5;
    g.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + 0.39;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8));
      g.lineTo(x + Math.cos(a) * (r + 24), y + Math.sin(a) * (r + 24));
      g.stroke();
    }
  }
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

/** A crescent moon; flip turns its lit side from left to right. */
export function moon(g, x, y, r, colour, flip) {
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(x + (flip ? -r * 0.45 : r * 0.45), y - r * 0.18, r * 0.82, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** A soft cloud: three overlapping puffs on a flat base, drawn around (x, y). */
export function cloud(g, x, y, s, colour) {
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x - 34 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
  g.arc(x, y - 8 * s, 28 * s, 0, Math.PI * 2);
  g.arc(x + 34 * s, y + 6 * s, 22 * s, 0, Math.PI * 2);
  g.fill();
  g.fillRect(x - 52 * s, y + 2 * s, 104 * s, 14 * s);
}

/** A pine tree: layered triangles on a short trunk, base at (x, baseY). */
export function pine(g, x, baseY, h, leaf) {
  g.fillStyle = '#6b4a2f';
  g.fillRect(x - 4, baseY - h * 0.16, 8, h * 0.16);
  g.fillStyle = leaf;
  for (let i = 0; i < 3; i += 1) {
    const w = (h * 0.52) * (1 - i * 0.24);
    const yTop = baseY - h * 0.12 - i * h * 0.27;
    g.beginPath();
    g.moveTo(x - w / 2, yTop - h * 0.3);
    g.lineTo(x + w / 2, yTop - h * 0.3);
    g.lineTo(x, yTop - h * 0.62);
    g.closePath();
    g.fill();
  }
}

/** A round leafy tree: a trunk and two or three canopy blobs, base at (x, baseY). */
export function leafyTree(g, x, baseY, s, trunk, leaf, leafDark) {
  g.fillStyle = trunk;
  g.fillRect(x - 5 * s, baseY - 34 * s, 10 * s, 34 * s);
  g.fillStyle = leafDark;
  g.beginPath();
  g.arc(x - 20 * s, baseY - 48 * s, 24 * s, 0, Math.PI * 2);
  g.arc(x + 20 * s, baseY - 48 * s, 24 * s, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = leaf;
  g.beginPath();
  g.arc(x, baseY - 68 * s, 30 * s, 0, Math.PI * 2);
  g.fill();
}

/**
 * A hot-air balloon centred at (x, y): a striped envelope, a soft highlight, two
 * ropes and a basket. opts.flame (0..1) draws the burner's glow between envelope
 * and basket; opts.basket false leaves the basket off entirely.
 */
export function balloon(g, x, y, s, stripes, opts = {}) {
  const w = 96 * s;
  const h = 116 * s;
  g.save();
  g.beginPath();
  g.moveTo(x, y - h / 2);
  g.bezierCurveTo(x + w / 2, y - h / 2, x + w / 2, y + h * 0.18, x + w * 0.22, y + h * 0.38);
  g.lineTo(x - w * 0.22, y + h * 0.38);
  g.bezierCurveTo(x - w / 2, y + h * 0.18, x - w / 2, y - h / 2, x, y - h / 2);
  g.closePath();
  g.clip();
  const band = (w * 2) / stripes.length;
  for (let i = 0; i < stripes.length; i += 1) {
    g.fillStyle = stripes[i];
    g.fillRect(x - w + i * band, y - h / 2, band + 1, h);
  }
  g.fillStyle = 'rgba(255,255,255,0.20)';
  g.beginPath();
  g.ellipse(x - w * 0.2, y - h * 0.18, w * 0.14, h * 0.24, -0.3, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.strokeStyle = 'rgba(60,40,20,0.55)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y - h / 2);
  g.bezierCurveTo(x + w / 2, y - h / 2, x + w / 2, y + h * 0.18, x + w * 0.22, y + h * 0.38);
  g.lineTo(x - w * 0.22, y + h * 0.38);
  g.bezierCurveTo(x - w / 2, y + h * 0.18, x - w / 2, y - h / 2, x, y - h / 2);
  g.stroke();
  const basketY = y + h * 0.52;
  g.strokeStyle = '#5d4630';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - w * 0.2, y + h * 0.36);
  g.lineTo(x - 11 * s, basketY);
  g.moveTo(x + w * 0.2, y + h * 0.36);
  g.lineTo(x + 11 * s, basketY);
  g.stroke();
  if (opts.flame) {
    const glow = g.createRadialGradient(x, basketY - 8 * s, 1, x, basketY - 8 * s, 20 * s);
    glow.addColorStop(0, 'rgba(255,190,60,0.95)');
    glow.addColorStop(0.5, 'rgba(255,120,30,0.55)');
    glow.addColorStop(1, 'rgba(255,120,30,0)');
    g.fillStyle = glow;
    g.beginPath();
    g.arc(x, basketY - 8 * s, 20 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffd94d';
    g.beginPath();
    g.ellipse(x, basketY - 8 * s, 4.5 * s, 8 * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (opts.basket !== false) {
    g.fillStyle = '#8a6238';
    g.fillRect(x - 13 * s, basketY, 26 * s, 17 * s);
    g.strokeStyle = 'rgba(60,40,20,0.5)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(x - 13 * s, basketY + 6 * s);
    g.lineTo(x + 13 * s, basketY + 6 * s);
    g.moveTo(x - 13 * s, basketY + 12 * s);
    g.lineTo(x + 13 * s, basketY + 12 * s);
    g.stroke();
  }
}

/** A balloon's reflection in water: a squashed, faded envelope below the waterline. */
export function balloonReflection(g, x, waterY, y, s, colour) {
  const dy = waterY + (waterY - y);
  g.save();
  g.globalAlpha = 0.30;
  g.fillStyle = colour;
  g.beginPath();
  g.ellipse(x, dy, 44 * s, 30 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** A striped festival tent with a pole flag; flagDir -1 points left, 1 right. */
export function tent(g, x, y, w, h, body, stripe, flagDir, flagColour) {
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w / 2, y - h);
  g.lineTo(x + w, y);
  g.closePath();
  g.fill();
  g.save();
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w / 2, y - h);
  g.lineTo(x + w, y);
  g.closePath();
  g.clip();
  g.fillStyle = stripe;
  for (let i = 0; i < 3; i += 1) {
    const bx = x + w * (0.22 + i * 0.26);
    g.beginPath();
    g.moveTo(bx - w * 0.07, y);
    g.lineTo(x + w / 2, y - h);
    g.lineTo(bx + w * 0.07, y);
    g.closePath();
    g.fill();
  }
  g.restore();
  g.fillStyle = 'rgba(0,0,0,0.16)';
  g.fillRect(x + w * 0.44, y - h * 0.3, w * 0.12, h * 0.3);
  const apexX = x + w / 2;
  const apexY = y - h;
  g.strokeStyle = '#5d4630';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(apexX, apexY);
  g.lineTo(apexX, apexY - 24);
  g.stroke();
  g.fillStyle = flagColour;
  g.beginPath();
  g.moveTo(apexX, apexY - 24);
  g.lineTo(apexX + flagDir * 20, apexY - 18);
  g.lineTo(apexX, apexY - 12);
  g.closePath();
  g.fill();
}

/** A point on the sagging quadratic curve between two poles, t from 0 to 1. */
export function sagPoint(x1, y1, x2, y2, sag, t) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
  const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
  return [x, y];
}

/** A string of triangular bunting flags along a sagging line; flags is a colour list. */
export function bunting(g, x1, y1, x2, y2, sag, flags) {
  g.strokeStyle = 'rgba(50,35,25,0.7)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x1, y1);
  g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2, x2, y2);
  g.stroke();
  const n = flags.length;
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n;
    const [fx, fy] = sagPoint(x1, y1, x2, y2, sag, t);
    g.fillStyle = flags[i];
    g.beginPath();
    g.moveTo(fx - 10, fy);
    g.lineTo(fx + 10, fy);
    g.lineTo(fx, fy + 18);
    g.closePath();
    g.fill();
  }
}

/** A string of glowing bulbs along a sagging wire; bulbs is a colour list. */
export function stringLights(g, x1, y1, x2, y2, sag, bulbs) {
  g.strokeStyle = 'rgba(20,16,40,0.85)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x1, y1);
  g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2, x2, y2);
  g.stroke();
  const n = bulbs.length;
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n;
    const [bx, by] = sagPoint(x1, y1, x2, y2, sag, t);
    const glow = g.createRadialGradient(bx, by + 7, 1, bx, by + 7, 15);
    glow.addColorStop(0, bulbs[i]);
    glow.addColorStop(1, 'rgba(255,200,80,0)');
    g.globalAlpha = 0.5;
    g.fillStyle = glow;
    g.beginPath();
    g.arc(bx, by + 7, 15, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = bulbs[i];
    g.beginPath();
    g.arc(bx, by + 7, 4.5, 0, Math.PI * 2);
    g.fill();
  }
}

/** A small bird in flight: two arcs meeting at the body. flip mirrors it. */
export function bird(g, x, y, s, flip, colour) {
  g.strokeStyle = colour;
  g.lineWidth = 2.5 * s;
  g.lineCap = 'round';
  const d = flip ? -1 : 1;
  g.beginPath();
  g.arc(x - 9 * s * d, y, 9 * s, -0.4, 1.6);
  g.stroke();
  g.beginPath();
  g.arc(x + 9 * s * d, y, 9 * s, Math.PI - 1.6, Math.PI + 0.4);
  g.stroke();
}

/** A lighthouse standing on baseY: striped tower, gallery and a lamp room. */
export function lighthouse(g, x, baseY, s, stripe, lampColour, beam) {
  const topY = baseY - 148 * s;
  g.fillStyle = '#f2ede2';
  g.beginPath();
  g.moveTo(x - 17 * s, baseY);
  g.lineTo(x - 12 * s, topY + 26 * s);
  g.lineTo(x + 12 * s, topY + 26 * s);
  g.lineTo(x + 17 * s, baseY);
  g.closePath();
  g.fill();
  g.save();
  g.beginPath();
  g.moveTo(x - 17 * s, baseY);
  g.lineTo(x - 12 * s, topY + 26 * s);
  g.lineTo(x + 12 * s, topY + 26 * s);
  g.lineTo(x + 17 * s, baseY);
  g.closePath();
  g.clip();
  g.fillStyle = stripe;
  g.fillRect(x - 18 * s, topY + 52 * s, 36 * s, 20 * s);
  g.fillRect(x - 18 * s, topY + 98 * s, 36 * s, 20 * s);
  g.restore();
  g.fillStyle = '#3c4656';
  g.fillRect(x - 15 * s, topY + 18 * s, 30 * s, 7 * s);
  if (beam) {
    g.save();
    g.globalAlpha = 0.20;
    g.fillStyle = '#ffe98a';
    g.beginPath();
    g.moveTo(x, topY + 10 * s);
    g.lineTo(x + 120 * s, topY - 8 * s);
    g.lineTo(x + 120 * s, topY + 30 * s);
    g.closePath();
    g.fill();
    g.restore();
  }
  g.fillStyle = lampColour;
  g.fillRect(x - 8 * s, topY + 2 * s, 16 * s, 16 * s);
  g.fillStyle = '#3c4656';
  g.beginPath();
  g.moveTo(x - 11 * s, topY + 2 * s);
  g.lineTo(x + 11 * s, topY + 2 * s);
  g.lineTo(x, topY - 10 * s);
  g.closePath();
  g.fill();
}

/** A sailboat at (x, y) on the water: hull, mast and a big triangular sail. */
export function sailboat(g, x, y, s, hull, sail) {
  g.fillStyle = sail;
  g.beginPath();
  g.moveTo(x, y - 78 * s);
  g.lineTo(x, y - 8 * s);
  g.lineTo(x + 44 * s, y - 8 * s);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(x - 4 * s, y - 70 * s);
  g.lineTo(x - 4 * s, y - 8 * s);
  g.lineTo(x - 32 * s, y - 8 * s);
  g.closePath();
  g.fill();
  g.strokeStyle = '#5d4630';
  g.lineWidth = 3 * s;
  g.beginPath();
  g.moveTo(x, y - 82 * s);
  g.lineTo(x, y);
  g.stroke();
  g.fillStyle = hull;
  g.beginPath();
  g.moveTo(x - 40 * s, y);
  g.lineTo(x + 40 * s, y);
  g.lineTo(x + 28 * s, y + 14 * s);
  g.lineTo(x - 28 * s, y + 14 * s);
  g.closePath();
  g.fill();
}

/** A rowboat at (x, y) with oars: 0, 1 or 2 of them, sticking out both sides. */
export function rowboat(g, x, y, s, hull, oars) {
  g.fillStyle = hull;
  g.beginPath();
  g.moveTo(x - 34 * s, y);
  g.lineTo(x + 34 * s, y);
  g.lineTo(x + 22 * s, y + 13 * s);
  g.lineTo(x - 22 * s, y + 13 * s);
  g.closePath();
  g.fill();
  g.strokeStyle = '#7a5a34';
  g.lineWidth = 3 * s;
  g.lineCap = 'round';
  if (oars >= 1) {
    g.beginPath();
    g.moveTo(x - 6 * s, y + 2 * s);
    g.lineTo(x - 30 * s, y + 16 * s);
    g.stroke();
  }
  if (oars >= 2) {
    g.beginPath();
    g.moveTo(x + 6 * s, y + 2 * s);
    g.lineTo(x + 30 * s, y + 16 * s);
    g.stroke();
  }
}

/** A duck on the water at (x, y): body, head and beak; flip faces it the other way. */
export function duck(g, x, y, s, colour, flip) {
  const d = flip ? -1 : 1;
  g.fillStyle = colour;
  g.beginPath();
  g.ellipse(x, y, 16 * s, 9 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(x + 12 * s * d, y - 9 * s, 7 * s, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f39c2c';
  g.beginPath();
  g.moveTo(x + 18 * s * d, y - 10 * s);
  g.lineTo(x + 26 * s * d, y - 7 * s);
  g.lineTo(x + 18 * s * d, y - 5 * s);
  g.closePath();
  g.fill();
}

/** A four-point sparkle star, the kind that hangs in a dusk sky. */
export function sparkle(g, x, y, r, colour) {
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

/** A burst of firework spokes around (x, y). */
export function firework(g, x, y, r, colour, spokes) {
  g.strokeStyle = colour;
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3);
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.stroke();
  }
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y, 3.5, 0, Math.PI * 2);
  g.fill();
}

/**
 * A ferris wheel centred at (cx, cy): rim, spokes, support legs and a ring of
 * cabins. cabins is a list of colours, one per spoke end; a null entry leaves
 * that cabin off. Returns the cabin positions so callers can point at one.
 */
export function ferrisWheel(g, cx, cy, r, frame, cabins) {
  g.strokeStyle = frame;
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(cx - r * 0.55, cy + r + 44);
  g.lineTo(cx, cy);
  g.lineTo(cx + r * 0.55, cy + r + 44);
  g.stroke();
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();
  const positions = [];
  for (let i = 0; i < cabins.length; i += 1) {
    const a = (i / cabins.length) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(px, py);
    g.stroke();
    positions.push([px, py]);
    if (cabins[i]) {
      g.fillStyle = cabins[i];
      g.beginPath();
      g.roundRect(px - 13, py + 2, 26, 20, 6);
      g.fill();
      g.fillStyle = 'rgba(255,240,190,0.9)';
      g.fillRect(px - 7, py + 7, 14, 6);
    }
  }
  g.fillStyle = frame;
  g.beginPath();
  g.arc(cx, cy, 10, 0, Math.PI * 2);
  g.fill();
  return positions;
}

/** A festival stall: posts, a counter and a striped (or solid) awning. */
export function stall(g, x, y, w, h, post, awning, awningStripe, solid) {
  g.fillStyle = post;
  g.fillRect(x + 6, y - h * 0.55, 7, h * 0.55);
  g.fillRect(x + w - 13, y - h * 0.55, 7, h * 0.55);
  g.fillRect(x, y - h * 0.18, w, h * 0.18);
  g.fillStyle = awning;
  g.beginPath();
  g.moveTo(x - 8, y - h * 0.52);
  g.lineTo(x + w + 8, y - h * 0.52);
  g.lineTo(x + w - 6, y - h * 0.88);
  g.lineTo(x + 6, y - h * 0.88);
  g.closePath();
  g.fill();
  if (!solid) {
    g.save();
    g.beginPath();
    g.moveTo(x - 8, y - h * 0.52);
    g.lineTo(x + w + 8, y - h * 0.52);
    g.lineTo(x + w - 6, y - h * 0.88);
    g.lineTo(x + 6, y - h * 0.88);
    g.closePath();
    g.clip();
    g.fillStyle = awningStripe;
    for (let i = 0; i < 4; i += 1) g.fillRect(x + 8 + i * (w / 4), y - h, w / 9, h * 0.6);
    g.restore();
  }
}

/** Broken horizontal light streaks on water, from the waterline down. */
export function lakeShimmer(g, waterY) {
  g.strokeStyle = 'rgba(255,255,255,0.28)';
  g.lineWidth = 3;
  g.lineCap = 'round';
  const rows = [[368, 40, 150], [392, 210, 330], [420, 70, 190], [452, 300, 430], [488, 130, 260], [526, 360, 500], [562, 90, 210]];
  for (const [y, x1, x2] of rows) {
    if (y < waterY) continue;
    g.beginPath();
    g.moveTo(x1, y);
    g.lineTo(x2, y);
    g.stroke();
  }
}

/** A cluster of reed blades rising from baseY at x. */
export function reeds(g, x, baseY, h, colour) {
  g.strokeStyle = colour;
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = -2; i <= 2; i += 1) {
    g.beginPath();
    g.moveTo(x + i * 6, baseY);
    g.quadraticCurveTo(x + i * 8, baseY - h * 0.6, x + i * 11, baseY - h);
    g.stroke();
  }
}
