"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** requestAnimationFrame teleprompter. `speed` is px/second and can change while playing. */
export function useAutoScroll(speed: number) {
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const step = (now: number) => {
      acc += ((now - last) / 1000) * speedRef.current;
      last = now;
      const whole = Math.floor(acc);
      if (whole >= 1) {
        acc -= whole;
        window.scrollBy(0, whole);
        const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atEnd) { setPlaying(false); setFinished(true); return; }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Manual scrolling by the reader pauses the teleprompter.
    const stop = () => setPlaying(false);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, [playing]);

  const toggle = useCallback(() => { setFinished(false); setPlaying((p) => !p); }, []);
  const stop = useCallback(() => setPlaying(false), []);
  return { playing, finished, toggle, stop, clearFinished: () => setFinished(false) };
}
