// The game state and its rules: which screen we are on, the current scene, what
// has been found, the clock, the score, the hints, the streak. Rendering reads
// this; input changes it through the functions here; nothing here touches the
// canvas or the DOM, so the rules can be reasoned about (and staged for
// screenshots) without a browser frame in the way.

import { RULES } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN = {
  TITLE: 'title',
  PLAY: 'play',
  CLEAR: 'clear', // a scene is finished, the next one waits
  OVER: 'over', // the clock ran out on a scene
  DONE: 'done', // all three scenes cleared
};

/** A fresh game, sitting on the title screen. */
export function createGame() {
  return {
    screen: SCREEN.TITLE,
    sceneIndex: 0,
    found: new Set(), // difference ids found in the current scene
    score: 0,
    scoreAtSceneStart: 0,
    timeLeft: 0,
    hintsLeft: RULES.hintsPerScene,
    hintsUsed: 0,
    streak: 0,
    bestStreak: 0,
    findsTotal: 0,
    clicksTotal: 0,
    misses: [], // {x, y, panel, at} fading red crosses, in panel space
    lastFind: null, // {id, at} for the marker pulse and the message line
    message: '',
    messageAt: 0,
    hintTarget: null, // difference id the live hint is glowing on
    hintUntil: 0,
    paused: false,
    loupeOn: false,
    soundOn: true,
    cursor: { panel: 0, x: 300, y: 300, visible: false },
    pointer: { x: 0, y: 0, inside: false },
    clearBonus: 0,
    now: 0, // seconds since boot, kept by the main loop; render animations read it
  };
}

/** The scene the player is looking at. */
export function scene(game) {
  return SCENES[game.sceneIndex];
}

/** Differences of the current scene not yet found. */
export function unfound(game) {
  return scene(game).differences.filter((d) => !game.found.has(d.id));
}

/** Start (or restart) the whole run from scene one. */
export function startRun(game) {
  game.score = 0;
  game.findsTotal = 0;
  game.clicksTotal = 0;
  game.hintsUsed = 0;
  game.bestStreak = 0;
  startScene(game, 0);
}

/** Set up a scene: fresh found set, full clock, fresh hints. */
export function startScene(game, index) {
  game.sceneIndex = index;
  game.found = new Set();
  game.timeLeft = SCENES[index].timeSec;
  game.hintsLeft = RULES.hintsPerScene;
  game.streak = 0;
  game.misses = [];
  game.lastFind = null;
  game.hintTarget = null;
  game.scoreAtSceneStart = game.score;
  game.message = `Find all ${SCENES[index].differences.length} differences!`;
  game.messageAt = game.now;
  game.paused = false;
  game.screen = SCREEN.PLAY;
}

/**
 * Judge a click in panel space. Returns 'found', 'miss' or 'already'.
 * A hit is a click within a difference's radius of its centre, on either panel —
 * the two pictures are mirrors for judging, as they are for the player's eyes.
 */
export function checkClick(game, panel, x, y) {
  if (game.screen !== SCREEN.PLAY || game.paused) return 'already';
  game.clicksTotal += 1;
  for (const d of scene(game).differences) {
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      if (game.found.has(d.id)) return 'already';
      game.found.add(d.id);
      game.findsTotal += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.score += RULES.findPoints + (game.streak - 1) * RULES.streakStep;
      game.lastFind = { id: d.id, at: game.now };
      game.message = d.label;
      game.messageAt = game.now;
      if (game.hintTarget === d.id) game.hintTarget = null;
      if (game.found.size === scene(game).differences.length) {
        game.clearBonus = Math.round(game.timeLeft) * RULES.clearBonusPerSecond;
        game.score += game.clearBonus;
        game.screen = game.sceneIndex === SCENES.length - 1 ? SCREEN.DONE : SCREEN.CLEAR;
      }
      return 'found';
    }
  }
  game.streak = 0;
  game.timeLeft = Math.max(0, game.timeLeft - RULES.missPenaltySeconds);
  game.misses.push({ x, y, panel, at: game.now });
  game.message = `Not there — ${RULES.missPenaltySeconds} seconds lost!`;
  game.messageAt = game.now;
  if (game.timeLeft <= 0) game.screen = SCREEN.OVER;
  return 'miss';
}

/** Spend a hint: glow the neighbourhood of one unfound difference. Returns it, or null. */
export function useHint(game) {
  if (game.screen !== SCREEN.PLAY || game.paused || game.hintsLeft <= 0) return null;
  const open = unfound(game);
  if (open.length === 0) return null;
  const target = open[Math.floor(Math.random() * open.length)];
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score - RULES.hintCost);
  game.hintTarget = target.id;
  game.hintUntil = game.now + 3.2;
  game.message = 'Somewhere inside the glow…';
  game.messageAt = game.now;
  return target;
}

/** Advance from the scene-clear screen into the next scene. */
export function nextScene(game) {
  startScene(game, game.sceneIndex + 1);
}

/** Retry the scene the clock beat us on, keeping the score we entered it with. */
export function retryScene(game) {
  game.score = game.scoreAtSceneStart;
  startScene(game, game.sceneIndex);
}

/**
 * Run the clock by dt seconds. Returns true when a whole second ticked away
 * inside the last ten, so the caller can sound the warning tick.
 */
export function tick(game, dt) {
  if (game.screen !== SCREEN.PLAY || game.paused) return false;
  const before = Math.ceil(game.timeLeft);
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.timeLeft <= 0) game.screen = SCREEN.OVER;
  return Math.ceil(game.timeLeft) !== before && game.timeLeft <= 10 && game.timeLeft > 0;
}

/** Whole-run accuracy as a percentage, for the end screen. */
export function accuracy(game) {
  if (game.clicksTotal === 0) return 100;
  return Math.round((game.findsTotal / game.clicksTotal) * 100);
}
