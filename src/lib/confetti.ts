import confetti from "canvas-confetti";

/** Celebração ao concluir metas e sonhos. */
export function fireCelebration() {
  const defaults = { spread: 70, ticks: 120, zIndex: 9999, disableForReducedMotion: true };
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.6 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 50, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, particleCount: 50, angle: 120, origin: { x: 1, y: 0.7 } });
  }, 200);
}
