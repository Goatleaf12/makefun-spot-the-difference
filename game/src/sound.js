// Sound effects, synthesised with WebAudio — no audio files, nothing to load.
// A lazy AudioContext wakes on the first user gesture; every effect is a short
// envelope of oscillators: a two-note chime for a find, a low buzz for a miss,
// a rising arpeggio when a scene is cleared. The mute flag lives here too.

let context = null;
let muted = false;

/** Wake (or create) the shared AudioContext; called from any pointer or key event. */
export function wakeAudio() {
  if (context === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) context = new AC();
  }
  if (context && context.state === 'suspended') context.resume();
}

/** Flip the mute flag and return the new state. */
export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One tone with a soft attack and decay; start offset and length in seconds. */
function tone(freq, at, dur, type = 'sine', vol = 0.16) {
  if (!context || muted) return;
  const t0 = context.currentTime + at;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(context.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A found difference: a bright two-note chime. */
export function playFind() {
  tone(1318, 0, 0.16);
  tone(1760, 0.07, 0.24);
}

/** A wrong click: a short low buzz. */
export function playMiss() {
  tone(140, 0, 0.18, 'sawtooth', 0.10);
}

/** A hint spent: a soft descending glint. */
export function playHint() {
  tone(1568, 0, 0.14);
  tone(1046, 0.09, 0.2);
}

/** The last-seconds clock warning tick. */
export function playTick() {
  tone(880, 0, 0.06, 'square', 0.05);
}

/** A scene cleared: a rising arpeggio. */
export function playClear() {
  tone(523, 0, 0.16);
  tone(659, 0.09, 0.16);
  tone(784, 0.18, 0.16);
  tone(1046, 0.27, 0.3);
}

/** The run ends, one way or the other: a small closing phrase. */
export function playOver() {
  tone(784, 0, 0.18);
  tone(659, 0.12, 0.18);
  tone(523, 0.24, 0.34);
}
