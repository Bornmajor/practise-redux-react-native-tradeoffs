// A tiny stopwatch for measuring how long a list takes to appear.
// Kept outside components: reading the clock is a side effect, so it must not run during render.
// Call startTimer() in an event handler, elapsedMs() after the frame is drawn.
let startedAt: number | null = null;

export function startTimer() {
  startedAt = performance.now();
}

// Milliseconds since startTimer(), or null if it hasn't been started
export function elapsedMs(): number | null {
  return startedAt === null ? null : Math.round(performance.now() - startedAt);
}
