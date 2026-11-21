// The three Twin Skies scenes. Each scene paints one balloon-festival picture in
// panel space (600 by 600) and lists its seven differences. A scene's paint takes
// the set of difference ids to apply: the left panel is painted with an empty
// set (the original) and the right panel with the full set (the changed copy),
// so the two pictures can never disagree about anything except the seven
// differences themselves. Difference positions are panel-space centres with a
// fair click radius, placed from the same numbers the painting uses.

import { SCENE_SECONDS } from './config.js';
import { mulberry32 } from './random.js';
import {
  balloon, balloonReflection, bird, bunting, cloud, duck, ferrisWheel, firework,
  lakeShimmer, lighthouse, leafyTree, moon, pine, reeds, ridge, rowboat,
  sailboat, sky, sparkle, stall, stringLights, sun, tent,
} from './toolbox.js';

/** Scatter small decoration dots from a fixed seed so both panels match exactly. */
function scatter(g, seed, count, yMin, yMax, colours, r) {
  const next = mulberry32(seed);
  for (let i = 0; i < count; i += 1) {
    const x = 14 + next() * 572;
    const y = yMin + next() * (yMax - yMin);
    g.fillStyle = colours[Math.floor(next() * colours.length)];
    g.beginPath();
    g.arc(x, y, r * (0.7 + next() * 0.6), 0, Math.PI * 2);
    g.fill();
  }
}

const DAWN = {
  id: 'dawn-meadow',
  name: 'Dawn Meadow',
  tagline: 'The balloons rise with the sun',
  timeSec: SCENE_SECONDS[0],
  paint(g, changed) {
    sky(g, [[0, '#6f9fd8'], [0.52, '#f2a56b'], [0.78, '#ffd9a0'], [1, '#ffe9bd']]);
    sun(g, 150, 148, 44, '#ffdf6b', !changed.has('sun-rays'));
    cloud(g, 95, 78, 0.95, 'rgba(255,255,255,0.92)');
    if (!changed.has('cloud-gone')) cloud(g, 300, 118, 0.62, 'rgba(255,233,236,0.92)');
    cloud(g, 452, 64, 0.8, 'rgba(255,255,255,0.9)');
    ridge(g, [[0, 352], [120, 318], [260, 340], [420, 312], [600, 344]], '#8fb573');
    ridge(g, [[0, 398], [160, 378], [330, 396], [480, 380], [600, 398]], '#69a84f');
    pine(g, 36, 432, 122, '#3e7048');
    pine(g, 74, 448, 88, '#35603d');
    leafyTree(g, 528, 432, 1.0, '#6b4a2f', '#4d8a3f', '#3e7048');
    balloon(g, 215, 208, 1.15,
      changed.has('balloon-colours')
        ? ['#1b9aaa', '#f6f0e6', '#1b9aaa', '#7bd3ea', '#1b9aaa']
        : ['#e8452c', '#f6f0e6', '#e8452c', '#f39c2c', '#e8452c'], {});
    balloon(g, 455, 148, 0.62, ['#7b4b94', '#f6f0e6', '#7b4b94', '#c39bd8'],
      { basket: !changed.has('basket-missing') });
    balloon(g, 524, 252, 0.34, ['#f39c2c', '#f6f0e6', '#f39c2c'], {});
    bird(g, 330, 92, 0.8, false, '#33506b');
    bird(g, 364, 78, 0.7, false, '#33506b');
    if (!changed.has('bird-missing')) bird(g, 398, 98, 0.8, false, '#33506b');
    ridge(g, [[0, 486], [200, 470], [420, 484], [600, 472]], '#5c9845');
    g.fillStyle = '#5d4630';
    g.fillRect(148, 402, 5, 36);
    g.fillRect(446, 402, 5, 36);
    const flags = ['#e8452c', '#f6c453', '#3fa7d6', '#7bc950', '#e86ac0', '#f39c2c', '#e8452c'];
    if (changed.has('bunting-flag')) flags[3] = '#9b5de5';
    bunting(g, 150, 404, 448, 404, 38, flags);
    tent(g, 60, 486, 150, 100, '#f6f0e6', '#e8452c', changed.has('flag-flip') ? 1 : -1, '#e8452c');
    tent(g, 398, 498, 132, 86, '#f6f0e6', '#1b9aaa', -1, '#f39c2c');
    scatter(g, 11, 42, 505, 582, ['#ffffff', '#ffd94d', '#ff8fab'], 2.6);
  },
  differences: [
    { id: 'balloon-colours', x: 215, y: 200, r: 56, label: 'The big balloon changed its stripes!' },
    { id: 'basket-missing', x: 455, y: 190, r: 26, label: 'The small balloon lost its basket!' },
    { id: 'sun-rays', x: 150, y: 148, r: 64, label: 'The sun lost its rays!' },
    { id: 'cloud-gone', x: 300, y: 118, r: 42, label: 'A cloud vanished from the dawn sky!' },
    { id: 'bird-missing', x: 398, y: 98, r: 24, label: 'One dawn bird flew away!' },
    { id: 'flag-flip', x: 135, y: 366, r: 24, label: 'The tent flag flipped around!' },
    { id: 'bunting-flag', x: 299, y: 448, r: 22, label: 'One bunting flag changed colour!' },
  ],
};

const LAKESIDE = {
  id: 'lakeside-noon',
  name: 'Lakeside Noon',
  tagline: 'Still water, bright sails',
  timeSec: SCENE_SECONDS[1],
  paint(g, changed) {
    sky(g, [[0, '#3f96e0'], [0.5, '#8fd0f5'], [1, '#cfeeff']]);
    sun(g, 508, 76, 38, '#fff3a6', true);
    cloud(g, 120, 70, 0.9, 'rgba(255,255,255,0.95)');
    cloud(g, 330, 110, 0.6, 'rgba(255,255,255,0.9)');
    ridge(g, [[0, 330], [110, 262], [190, 300], [300, 178], [390, 268], [600, 330]], '#7d9cc4');
    if (!changed.has('snowcap-gone')) {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(280, 208);
      g.lineTo(300, 178);
      g.lineTo(320, 208);
      g.lineTo(309, 197);
      g.lineTo(300, 205);
      g.lineTo(291, 197);
      g.closePath();
      g.fill();
    }
    g.fillStyle = '#5e9e52';
    g.fillRect(0, 322, 600, 30);
    const water = g.createLinearGradient(0, 352, 0, 600);
    water.addColorStop(0, '#3a90d4');
    water.addColorStop(1, '#1f5f9e');
    g.fillStyle = water;
    g.fillRect(0, 352, 600, 248);
    lakeShimmer(g, 352);
    lighthouse(g, 84, 330, 1.0, '#e8452c',
      changed.has('lamp-dark') ? '#33506b' : '#ffd94d', !changed.has('lamp-dark'));
    balloon(g, 150, 108, 0.8, ['#f39c2c', '#f6f0e6', '#e86ac0', '#f6f0e6'], {});
    if (!changed.has('reflection-gone')) balloonReflection(g, 150, 352, 108, 0.8, '#e8862c');
    sailboat(g, 330, 438, 1.1, '#8a4b2a', changed.has('sail-colour') ? '#ffcf4d' : '#ffffff');
    sailboat(g, 478, 478, 0.66, '#1b7f8e', '#ffffff');
    g.fillStyle = '#8a6238';
    g.fillRect(452, 512, 148, 10);
    g.fillRect(470, 522, 8, 18);
    g.fillRect(560, 522, 8, 18);
    g.strokeStyle = '#5d4630';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(584, 512);
    g.lineTo(584, 470);
    g.stroke();
    if (!changed.has('pier-flag-gone')) {
      g.fillStyle = '#e8452c';
      g.beginPath();
      g.moveTo(584, 470);
      g.lineTo(604, 476);
      g.lineTo(584, 482);
      g.closePath();
      g.fill();
    }
    rowboat(g, 505, 528, 0.85, '#b3543f', changed.has('oar-missing') ? 1 : 2);
    duck(g, 248, 522, 0.8, '#f6f0e6', false);
    duck(g, 290, 542, 0.7, '#f6f0e6', true);
    duck(g, 236, 556, 0.66, '#e8e2d2', false);
    if (changed.has('duck-extra')) duck(g, 332, 530, 0.74, '#f6f0e6', false);
    reeds(g, 24, 566, 44, '#3e7d46');
    reeds(g, 54, 580, 34, '#356e3c');
    g.fillStyle = '#4d8a3f';
    g.beginPath();
    g.ellipse(180, 470, 20, 6, 0, 0, Math.PI * 2);
    g.ellipse(420, 560, 24, 7, 0, 0, Math.PI * 2);
    g.fill();
  },
  differences: [
    { id: 'lamp-dark', x: 84, y: 192, r: 24, label: 'The lighthouse lamp went dark!' },
    { id: 'sail-colour', x: 330, y: 392, r: 40, label: 'The big sail turned yellow!' },
    { id: 'snowcap-gone', x: 300, y: 190, r: 28, label: 'The snowcap melted off the peak!' },
    { id: 'reflection-gone', x: 150, y: 584, r: 34, label: "The balloon's reflection disappeared!" },
    { id: 'pier-flag-gone', x: 592, y: 476, r: 22, label: 'The pier flag is gone!' },
    { id: 'oar-missing', x: 524, y: 536, r: 24, label: 'The rowboat lost an oar!' },
    { id: 'duck-extra', x: 332, y: 530, r: 24, label: 'An extra duck paddled in!' },
  ],
};

const FINALE = {
  id: 'dusk-finale',
  name: 'Dusk Finale',
  tagline: 'Burners lit, fairground glowing',
  timeSec: SCENE_SECONDS[2],
  paint(g, changed) {
    sky(g, [[0, '#252254'], [0.45, '#5b3a7e'], [0.75, '#c65b3f'], [1, '#e8875a']]);
    const stars = [[60, 60], [150, 40], [238, 86], [330, 52], [415, 96], [486, 44], [556, 120], [96, 150], [205, 132], [372, 150]];
    for (const [sx, sy] of stars) sparkle(g, sx, sy, 5.5, 'rgba(255,233,168,0.85)');
    if (!changed.has('star-gone')) sparkle(g, 176, 62, 9, '#ffe9a8');
    moon(g, 522, 76, 28, '#f6ead2', changed.has('moon-flip'));
    firework(g, 108, 118, 40, changed.has('firework-colour') ? '#ff7ad9' : '#ffd94d', 10);
    firework(g, 566, 196, 24, '#5eead4', 8);
    const cabins = ['#ff8fab', '#ffd94d', '#5eead4', '#a78bfa', '#ff8fab', '#ffd94d', '#5eead4', '#a78bfa'];
    if (changed.has('cabin-gone')) cabins[2] = null;
    ferrisWheel(g, 448, 296, 124, '#241f3d', cabins);
    balloon(g, 88, 176, 0.55, ['#7b4b94', '#c39bd8', '#7b4b94'], {});
    balloon(g, 322, 148, 0.6, ['#14532d', '#7bd3ea', '#14532d'], {});
    balloon(g, 212, 238, 1.05, ['#7b4b94', '#ffd9a0', '#c65b3f', '#ffd9a0'],
      { flame: changed.has('flame-out') ? 0 : 1 });
    const bulbs = Array.from({ length: 11 }, () => '#ffd98a');
    if (changed.has('bulb-colour')) bulbs[5] = '#6ab0ff';
    stringLights(g, 16, 150, 584, 118, 54, bulbs);
    stringLights(g, 16, 208, 584, 182, 44, Array.from({ length: 11 }, () => '#ffd98a'));
    ridge(g, [[0, 478], [200, 462], [420, 476], [600, 464]], '#2c2140');
    stall(g, 56, 540, 140, 110, '#3a2c50', '#c63d54', '#f6e3c5', changed.has('awning-solid'));
    stall(g, 238, 548, 120, 96, '#3a2c50', '#1b7f8e', '#f6e3c5', false);
    g.fillStyle = '#211a33';
    g.fillRect(0, 520, 600, 80);
    scatter(g, 7, 14, 486, 556, ['#d9f99d'], 2);
    g.fillStyle = '#17122a';
    for (let x = 24; x < 600; x += 46) {
      g.beginPath();
      g.arc(x, 584, 11, 0, Math.PI * 2);
      g.fill();
      g.fillRect(x - 13, 592, 26, 10);
    }
  },
  differences: [
    { id: 'firework-colour', x: 108, y: 118, r: 42, label: 'The firework burst pink instead of gold!' },
    { id: 'star-gone', x: 176, y: 62, r: 22, label: 'The brightest star winked out!' },
    { id: 'moon-flip', x: 522, y: 76, r: 36, label: 'The moon turned the other way!' },
    { id: 'bulb-colour', x: 300, y: 195, r: 20, label: 'One string-light bulb turned blue!' },
    { id: 'flame-out', x: 212, y: 296, r: 26, label: "The balloon's burner flame went out!" },
    { id: 'cabin-gone', x: 572, y: 306, r: 24, label: 'A ferris-wheel cabin is missing!' },
    { id: 'awning-solid', x: 126, y: 466, r: 32, label: 'The stall awning lost its stripes!' },
  ],
};

/** The scenes in play order: dawn, noon, dusk — the festival's whole day. */
export const SCENES = [DAWN, LAKESIDE, FINALE];
