// A tiny seeded random generator (mulberry32). The scenes scatter their small
// decoration — meadow flowers, grass tufts, fireflies — from fixed seeds, so a
// scene paints the same way on every load, on every machine, and the two panels
// of a pair never drift apart by accident.

/** Return a function that yields the same 0..1 sequence for the same seed, every time. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
