// A tiny seeded random-number generator (mulberry32).
// Same seed → same sequence, so the generated list is identical on every run and device,
// which makes measurements comparable between sections.
export function createRandom(seed: number) {
  let state = seed >>> 0;

  // Returns a number in [0, 1), like Math.random()
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    // Whole number between min and max (inclusive)
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    // One random element of a list
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}
