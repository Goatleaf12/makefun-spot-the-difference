// Everything that is drawn. The two pictures of a scene are painted once into
// offscreen canvases (original on the left, changed copy on the right) and
// blitted each frame; markers, the hint glow, the keyboard cursor, the
// magnifier and every overlay are drawn live on top. The header carries the
// counter and the clock, the footer the hint button and the message line —
// the same frame in play and in the screenshots.

import { FOOTER_TOP, HEADER_HEIGHT, LOUPE, PANEL, PANEL_X, RULES, VIEW } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN, accuracy, scene, unfound } from './state.js';

const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";
const INK = '#f4f1e6';
const GOLD = '#ffd94d';
const DIM = '#9fb2d8';

/** Buttons the last frame offered, for input.js to hit-test: {id, x, y, w, h}. */
export const uiButtons = [];

let panelCache = { index: -1, left: null, right: null };

/** Paint a scene's two panels into offscreen canvases at 2x for crisp blitting. */
export function preparePanels(index) {
  if (panelCache.index === index) return panelCache;
  const make = (changed) => {
    const c = document.createElement('canvas');
    c.width = PANEL.size * 2;
    c.height = PANEL.size * 2;
    const g = c.getContext('2d');
    g.scale(2, 2);
    SCENES[index].paint(g, changed);
    return c;
  };
  const all = new Set(SCENES[index].differences.map((d) => d.id));
  panelCache = { index, left: make(new Set()), right: make(all) };
  return panelCache;
}

function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

function text(g, str, x, y, size, colour, align = 'left', weight = 700) {
  g.fillStyle = colour;
  g.font = `${weight} ${size}px ${FONT}`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  g.fillText(str, x, y);
}

/** The header: wordmark, scene name, the found counter, the clock and the score. */
function drawHeader(g, game) {
  const sc = scene(game);
  g.fillStyle = '#182238';
  g.fillRect(0, 0, VIEW.width, HEADER_HEIGHT);
  g.fillStyle = GOLD;
  g.beginPath();
  g.ellipse(34, 26, 11, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#8a6238';
  g.fillRect(30, 44, 8, 6);
  text(g, 'TWIN SKIES', 56, 26, 25, INK, 'left', 800);
  text(g, `${sc.name} · scene ${game.sceneIndex + 1} of ${SCENES.length}`, 56, 52, 13.5, DIM, 'left', 600);

  const foundCount = game.found.size;
  const total = sc.differences.length;
  const remain = total - foundCount;
  const label = `FOUND ${foundCount} OF ${total}  ·  ${remain} TO GO`;
  g.font = `800 21px ${FONT}`;
  const w = g.measureText(label).width + 44;
  const x = (VIEW.width - w) / 2;
  roundRectPath(g, x, 13, w, 42, 21);
  g.fillStyle = '#0d1526';
  g.fill();
  g.strokeStyle = GOLD;
  g.lineWidth = 2;
  g.stroke();
  text(g, label, VIEW.width / 2, 35, 21, GOLD, 'center', 800);

  const low = game.timeLeft <= RULES.lowTimeSeconds && game.screen === SCREEN.PLAY;
  const secs = Math.max(0, Math.ceil(game.timeLeft));
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  text(g, 'TIME', 1052, 20, 12, DIM, 'right', 700);
  text(g, clock, 1052, 44, 26, low ? '#ff6b5e' : INK, 'right', 800);
  const frac = Math.max(0, game.timeLeft / sc.timeSec);
  g.fillStyle = '#0d1526';
  g.fillRect(962, 58, 90, 5);
  g.fillStyle = low ? '#ff6b5e' : '#57c785';
  g.fillRect(962, 58, 90 * frac, 5);
  text(g, 'SCORE', 1248, 20, 12, DIM, 'right', 700);
  text(g, String(game.score), 1248, 44, 26, INK, 'right', 800);
}

/** One picture panel: the painted scene, its chip, and every marker that belongs on it. */
function drawPanel(g, game, which) {
  const panels = preparePanels(game.sceneIndex);
  const img = which === 0 ? panels.left : panels.right;
  const x = PANEL_X[which];
  const y = PANEL.top;
  g.save();
  roundRectPath(g, x, y, PANEL.size, PANEL.size, 18);
  g.clip();
  g.drawImage(img, x, y, PANEL.size, PANEL.size);
  g.restore();
  roundRectPath(g, x, y, PANEL.size, PANEL.size, 18);
  g.strokeStyle = 'rgba(244,241,230,0.35)';
  g.lineWidth = 2;
  g.stroke();

  const chip = which === 0 ? 'ORIGINAL' : 'THE CHANGED COPY';
  g.font = `700 12.5px ${FONT}`;
  const cw = g.measureText(chip).width + 22;
  roundRectPath(g, x + 12, y + 12, cw, 24, 12);
  g.fillStyle = 'rgba(10,15,28,0.72)';
  g.fill();
  text(g, chip, x + 12 + cw / 2, y + 25, 12.5, INK, 'center', 700);

  // The hint glow breathes over its difference on both panels.
  if (game.hintTarget && game.now < game.hintUntil) {
    const d = scene(game).differences.find((dd) => dd.id === game.hintTarget);
    if (d) {
      const pulse = 0.75 + 0.25 * Math.sin(game.now * 9);
      const gx = x + d.x;
      const gy = y + d.y;
      const grad = g.createRadialGradient(gx, gy, 4, gx, gy, 58 * pulse);
      grad.addColorStop(0, 'rgba(255,217,77,0.42)');
      grad.addColorStop(1, 'rgba(255,217,77,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(gx, gy, 58 * pulse, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,217,77,0.85)';
      g.lineWidth = 2;
      g.setLineDash([6, 6]);
      g.beginPath();
      g.arc(gx, gy, 40 * pulse, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
    }
  }

  // Found markers: a gold ring on both pictures at the difference's place.
  for (const d of scene(game).differences) {
    if (!game.found.has(d.id)) continue;
    const cx = x + d.x;
    const cy = y + d.y;
    g.strokeStyle = 'rgba(10,15,28,0.65)';
    g.lineWidth = 7;
    g.beginPath();
    g.arc(cx, cy, 16, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = GOLD;
    g.lineWidth = 3.5;
    g.beginPath();
    g.arc(cx, cy, 16, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = GOLD;
    g.beginPath();
    g.arc(cx, cy, 3.5, 0, Math.PI * 2);
    g.fill();
    if (game.lastFind && game.lastFind.id === d.id) {
      const age = game.now - game.lastFind.at;
      if (age < 0.7) {
        g.strokeStyle = `rgba(255,217,77,${0.75 * (1 - age / 0.7)})`;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(cx, cy, 16 + age * 30, 0, Math.PI * 2);
        g.stroke();
      }
    }
  }

  // Misses: a red cross that fades where the player clicked wrong.
  for (const m of game.misses) {
    if (m.panel !== which) continue;
    const age = game.now - m.at;
    if (age > 0.9) continue;
    const cx = x + m.x;
    const cy = y + m.y;
    g.strokeStyle = `rgba(255,80,60,${1 - age / 0.9})`;
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(cx - 10, cy - 10);
    g.lineTo(cx + 10, cy + 10);
    g.moveTo(cx + 10, cy - 10);
    g.lineTo(cx - 10, cy + 10);
    g.stroke();
  }
}

/** The keyboard cursor: a dashed ring with crosshair ticks on its panel. */
function drawCursor(g, game) {
  if (!game.cursor.visible || game.screen !== SCREEN.PLAY) return;
  const cx = PANEL_X[game.cursor.panel] + game.cursor.x;
  const cy = PANEL.top + game.cursor.y;
  g.strokeStyle = INK;
  g.lineWidth = 2;
  g.setLineDash([5, 5]);
  g.beginPath();
  g.arc(cx, cy, 19, 0, Math.PI * 2);
  g.stroke();
  g.setLineDash([]);
  g.beginPath();
  for (const [dx, dy] of [[0, -27], [0, 27], [-27, 0], [27, 0]]) {
    g.moveTo(cx + dx * 0.55, cy + dy * 0.55);
    g.lineTo(cx + dx, cy + dy);
  }
  g.stroke();
}

/** The magnifier: a circular 2x window onto the panel under the pointer. */
function drawLoupe(g, game) {
  if (!game.loupeOn || !game.pointer.inside || game.screen !== SCREEN.PLAY) return;
  const px = game.pointer.x;
  const py = game.pointer.y;
  let which = -1;
  for (let i = 0; i < 2; i += 1) {
    if (px >= PANEL_X[i] && px < PANEL_X[i] + PANEL.size && py >= PANEL.top && py < PANEL.top + PANEL.size) which = i;
  }
  if (which === -1) return;
  const panels = preparePanels(game.sceneIndex);
  const img = which === 0 ? panels.left : panels.right;
  const lx = px - PANEL_X[which];
  const ly = py - PANEL.top;
  const R = LOUPE.radius;
  const src = (2 * R) / LOUPE.zoom; // panel pixels across the loupe's view
  g.save();
  g.beginPath();
  g.arc(px, py, R, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#0d1526';
  g.fillRect(px - R, py - R, 2 * R, 2 * R);
  g.drawImage(img, (lx - src / 2) * 2, (ly - src / 2) * 2, src * 2, src * 2, px - R, py - R, 2 * R, 2 * R);
  g.restore();
  g.strokeStyle = GOLD;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(px, py, R, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = 'rgba(244,241,230,0.8)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(px - 10, py);
  g.lineTo(px + 10, py);
  g.moveTo(px, py - 10);
  g.lineTo(px, py + 10);
  g.stroke();
}

/** A footer pill button; registers itself for input while it is on screen. */
function drawButton(g, id, x, y, w, h, label, active) {
  roundRectPath(g, x, y, w, h, 12);
  g.fillStyle = active ? '#2c4a7c' : '#1d2a47';
  g.fill();
  g.strokeStyle = active ? GOLD : 'rgba(244,241,230,0.3)';
  g.lineWidth = 1.5;
  g.stroke();
  text(g, label, x + w / 2, y + h / 2 + 1, 14.5, INK, 'center', 700);
  uiButtons.push({ id, x, y, w, h });
}

/** The footer: hint / loupe / sound buttons, the message line, the key help. */
function drawFooter(g, game) {
  const y = FOOTER_TOP + 16;
  if (game.screen === SCREEN.PLAY) {
    drawButton(g, 'hint', 28, y, 148, 40, `HINT  ·  ${game.hintsLeft} LEFT`, game.hintTarget !== null && game.now < game.hintUntil);
    drawButton(g, 'loupe', 188, y, 148, 40, game.loupeOn ? 'LOUPE  ·  ON' : 'LOUPE  ·  OFF', game.loupeOn);
    drawButton(g, 'sound', 348, y, 148, 40, game.soundOn ? 'SOUND  ·  ON' : 'SOUND  ·  OFF', false);
  }
  text(g, game.message, VIEW.width / 2, y + 21, 17, INK, 'center', 700);
  text(g, 'Arrows move · Enter check · H hint · L loupe · P pause', VIEW.width - 28, y + 21, 13, DIM, 'right', 600);
}

/** A centred card over a veiled frame, for title / clear / over / done / pause. */
function drawCard(g, game, title, titleColour, lines, buttonLabel) {
  g.fillStyle = 'rgba(9,13,24,0.74)';
  g.fillRect(0, 0, VIEW.width, VIEW.height);
  const w = 620;
  const h = 118 + lines.length * 30 + 74;
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2 - 10;
  roundRectPath(g, x, y, w, h, 20);
  g.fillStyle = '#182238';
  g.fill();
  g.strokeStyle = GOLD;
  g.lineWidth = 2;
  g.stroke();
  text(g, title, VIEW.width / 2, y + 52, 37, titleColour, 'center', 800);
  lines.forEach((line, i) => {
    text(g, line, VIEW.width / 2, y + 102 + i * 30, 16.5, INK, 'center', 600);
  });
  if (buttonLabel) {
    const bw = 250;
    drawButton(g, 'primary', (VIEW.width - bw) / 2, y + h - 62, bw, 42, buttonLabel, true);
  }
}

/** The overlay for whichever screen the game is on; play itself has none. */
function drawOverlay(g, game) {
  const sc = scene(game);
  if (game.screen === SCREEN.TITLE) {
    drawCard(g, game, 'TWIN SKIES', GOLD, [
      'A spot-the-difference balloon festival.',
      'Two pictures of the same moment — seven things changed in the copy.',
      'Click a difference in either picture. A wrong click costs 6 seconds.',
      'Dawn Meadow · Lakeside Noon · Dusk Finale — 21 differences in all.',
      'Hints glow, the loupe magnifies, and the clock is always running.',
    ], 'START HUNTING');
  } else if (game.screen === SCREEN.CLEAR) {
    drawCard(g, game, `${sc.name} — clear!`, '#57c785', [
      `All ${sc.differences.length} differences found.`,
      `Time bonus +${game.clearBonus} · Score ${game.score}`,
      `${unfound(game).length === 0 ? 'Next: ' + SCENES[game.sceneIndex + 1].name : ''}`,
    ], 'NEXT SCENE');
  } else if (game.screen === SCREEN.OVER) {
    drawCard(g, game, "Time's up!", '#ff6b5e', [
      `You found ${game.found.size} of ${sc.differences.length} in ${sc.name}.`,
      `Score so far: ${game.score}`,
      'The festival will wait — try the scene again.',
    ], 'RETRY SCENE');
  } else if (game.screen === SCREEN.DONE) {
    drawCard(g, game, 'Festival complete!', GOLD, [
      `Final score: ${game.score}`,
      `Differences found: ${game.findsTotal} of 21`,
      `Accuracy: ${accuracy(game)}% · Best streak: ${game.bestStreak}`,
      `Hints used: ${game.hintsUsed}`,
    ], 'PLAY AGAIN');
  } else if (game.paused) {
    drawCard(g, game, 'Paused', INK, ['The clock is stopped. Press P to keep hunting.'], null);
  }
}

/** Draw one whole frame of the game. */
export function drawFrame(g, game) {
  uiButtons.length = 0;
  const bg = g.createLinearGradient(0, 0, 0, VIEW.height);
  bg.addColorStop(0, '#131e36');
  bg.addColorStop(1, '#0b1120');
  g.fillStyle = bg;
  g.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHeader(g, game);
  drawPanel(g, game, 0);
  drawPanel(g, game, 1);
  drawCursor(g, game);
  drawLoupe(g, game);
  drawFooter(g, game);
  drawOverlay(g, game);
}
