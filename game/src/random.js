// A tiny seeded random source (mulberry32 family). One seed always makes the
// same stream, so star fields and fireflies land in the same places on every
// visit and in every screenshot.

export function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fixed scatter of points inside a box, from a seed: [[x, y, size], ...]. */
export function scatter(seed, count, width, height, minSize, maxSize) {
  const rng = makeRng(seed);
  const points = [];
  for (let i = 0; i < count; i += 1) {
    points.push([rng() * width, rng() * height, minSize + rng() * (maxSize - minSize)]);
  }
  return points;
}
