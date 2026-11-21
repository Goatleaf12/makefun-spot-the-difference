// Pointer and keyboard input. Clicks are judged in panel space through
// state.checkClick; the footer and overlay buttons are hit-tested against the
// rectangles render.js offered on the last frame; the keyboard drives a cursor
// that can play the whole game without a mouse (arrows move, Enter checks,
// H hints, L toggles the loupe, P pauses). Sounds fire here, where the action
// is known, not in the state or the renderer.

import { PANEL, PANEL_X, VIEW } from './config.js';
import { uiButtons } from './render.js';
import { SCREEN, checkClick, nextScene, retryScene, startRun, useHint } from './state.js';
import { isMuted, playClear, playFind, playHint, playMiss, playOver, toggleMuted, wakeAudio } from './sound.js';

/** Which panel a frame point falls in, and its panel-space position; null outside both. */
export function panelAt(x, y) {
  for (let i = 0; i < 2; i += 1) {
    if (x >= PANEL_X[i] && x < PANEL_X[i] + PANEL.size && y >= PANEL.top && y < PANEL.top + PANEL.size) {
      return { panel: i, x: x - PANEL_X[i], y: y - PANEL.top };
    }
  }
  return null;
}

/** The primary action of the current overlay screen, shared by its button and Enter. */
export function primaryAction(game) {
  if (game.screen === SCREEN.TITLE || game.screen === SCREEN.DONE) startRun(game);
  else if (game.screen === SCREEN.CLEAR) nextScene(game);
  else if (game.screen === SCREEN.OVER) retryScene(game);
}

function pressButton(game, id) {
  if (id === 'primary') primaryAction(game);
  else if (id === 'hint') {
    if (useHint(game)) playHint();
  } else if (id === 'loupe') game.loupeOn = !game.loupeOn;
  else if (id === 'sound') game.soundOn = !toggleMuted();
}

/** Judge a panel click and make the sound its result deserves. */
function judge(game, panel, x, y) {
  const before = game.screen;
  const result = checkClick(game, panel, x, y);
  if (result === 'found') {
    playFind();
    if (game.screen === SCREEN.CLEAR) playClear();
    if (game.screen === SCREEN.DONE) playOver();
  } else if (result === 'miss') {
    playMiss();
    if (before === SCREEN.PLAY && game.screen === SCREEN.OVER) playOver();
  }
}

/** Wire every listener the game needs onto the canvas and the window. */
export function attachInput(canvas, game) {
  const toFrame = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (VIEW.width / rect.width),
      y: (event.clientY - rect.top) * (VIEW.height / rect.height),
    };
  };

  canvas.addEventListener('pointermove', (event) => {
    const p = toFrame(event);
    game.pointer.x = p.x;
    game.pointer.y = p.y;
    game.pointer.inside = panelAt(p.x, p.y) !== null;
  });
  canvas.addEventListener('pointerleave', () => {
    game.pointer.inside = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    wakeAudio();
    const p = toFrame(event);
    for (const b of uiButtons) {
      if (p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h) {
        pressButton(game, b.id);
        return;
      }
    }
    if (game.screen !== SCREEN.PLAY) {
      primaryAction(game);
      return;
    }
    if (game.paused) return;
    const hit = panelAt(p.x, p.y);
    if (hit) judge(game, hit.panel, hit.x, hit.y);
  });

  window.addEventListener('keydown', (event) => {
    wakeAudio();
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (game.screen !== SCREEN.PLAY) primaryAction(game);
      else if (!game.paused) judge(game, game.cursor.panel, game.cursor.x, game.cursor.y);
      return;
    }
    if (game.screen !== SCREEN.PLAY) return;
    const lower = key.toLowerCase();
    if (lower === 'p' || key === 'Escape') {
      game.paused = !game.paused;
      return;
    }
    if (game.paused) return;
    if (lower === 'h') {
      if (useHint(game)) playHint();
    } else if (lower === 'l') {
      game.loupeOn = !game.loupeOn;
    } else if (lower === 's') {
      game.soundOn = !toggleMuted();
    } else if (key.startsWith('Arrow')) {
      event.preventDefault();
      game.cursor.visible = true;
      const step = event.shiftKey ? 3 : 14;
      const c = game.cursor;
      if (key === 'ArrowLeft') c.x -= step;
      if (key === 'ArrowRight') c.x += step;
      if (key === 'ArrowUp') c.y -= step;
      if (key === 'ArrowDown') c.y += step;
      if (c.x < 0 && c.panel === 1) {
        c.panel = 0;
        c.x = PANEL.size + c.x;
      } else if (c.x >= PANEL.size && c.panel === 0) {
        c.panel = 1;
        c.x = c.x - PANEL.size;
      }
      c.x = Math.max(4, Math.min(PANEL.size - 4, c.x));
      c.y = Math.max(4, Math.min(PANEL.size - 4, c.y));
    }
  });

  game.soundOn = !isMuted();
}
