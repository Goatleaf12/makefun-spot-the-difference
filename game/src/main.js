// Twin Skies — the boot and the frame loop. Creates the game, wires input,
// runs the clock while a scene is in play, draws every frame, and keeps the
// screen-reader status line in step with the message line. When the URL asks
// for a screenshot scene (?shot=...), it stages that scene, freezes the clock
// and raises window.__shotReady once the frame is on screen.

import { VIEW } from './config.js';
import { attachInput } from './input.js';
import { drawFrame, preparePanels } from './render.js';
import { stageShot } from './shots.js';
import { SCREEN, createGame, tick } from './state.js';
import { playOver, playTick } from './sound.js';

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
const status = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const game = createGame();
attachInput(canvas, game);
preparePanels(0);

const params = new URLSearchParams(window.location.search);
const shotMode = params.has('shot');
if (shotMode) stageShot(game, params.get('shot'));

// Exposed for the headless play-test driver: the live game object, nothing more.
window.__twinSkies = game;

let last = performance.now();
let lastMessage = '';
let shotAnnounced = false;

function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  game.now = nowMs / 1000;
  if (!shotMode) {
    const before = game.screen;
    if (tick(game, dt)) playTick();
    if (before === SCREEN.PLAY && game.screen === SCREEN.OVER) playOver();
  }
  drawFrame(g, game);
  if (game.message !== lastMessage) {
    lastMessage = game.message;
    status.textContent = game.message;
  }
  if (shotMode && !shotAnnounced) {
    shotAnnounced = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
