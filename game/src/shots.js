// The staged scenes behind ?shot=cover|lake|finale|end, used to take the entry's
// screenshots. Each one puts the real game into a real mid-play state — a scene
// set up by the ordinary rules, with some differences marked found, the counter
// and clock where a player would have them — so a screenshot is the game as it
// is actually played, never a mock-up. The names match shots.json.

import { PANEL, PANEL_X } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN, startScene } from './state.js';

/** Mark the named differences of the current scene as found, as a player would have. */
function markFound(game, ids, score, clicks) {
  for (const id of ids) game.found.add(id);
  game.findsTotal = ids.length;
  game.clicksTotal = clicks;
  game.score = score;
  game.lastFind = null;
}

/**
 * Stage the named shot on `game`. Returns true when a shot was staged (the
 * caller then freezes the clock: a screenshot must not tick away mid-capture).
 */
export function stageShot(game, name) {
  if (name === 'lake') {
    startScene(game, 1);
    markFound(game, ['lamp-dark', 'sail-colour', 'snowcap-gone', 'duck-extra'], 760, 5);
    game.timeLeft = 72;
    game.message = 'An extra duck paddled in!';
    game.loupeOn = true;
    game.pointer.x = PANEL_X[1] + 150;
    game.pointer.y = PANEL.top + 560;
    game.pointer.inside = true;
    return true;
  }
  if (name === 'finale') {
    startScene(game, 2);
    markFound(game, ['firework-colour', 'star-gone', 'moon-flip', 'cabin-gone', 'flame-out'], 1390, 7);
    game.timeLeft = 24;
    game.hintTarget = 'bulb-colour';
    game.hintUntil = Number.POSITIVE_INFINITY;
    game.hintsLeft = 1;
    game.message = 'Somewhere inside the glow…';
    return true;
  }
  if (name === 'end') {
    startScene(game, 2);
    markFound(game, SCENES[2].differences.map((d) => d.id), 2460, 24);
    game.findsTotal = 21;
    game.hintsUsed = 2;
    game.bestStreak = 9;
    game.timeLeft = 63;
    game.message = 'Festival complete — 21 of 21!';
    game.screen = SCREEN.DONE;
    return true;
  }
  // 'cover' and anything else: the dawn scene, three found, four to go.
  startScene(game, 0);
  markFound(game, ['balloon-colours', 'flag-flip', 'bird-missing'], 320, 4);
  game.timeLeft = 97;
  game.message = 'One dawn bird flew away!';
  return true;
}
