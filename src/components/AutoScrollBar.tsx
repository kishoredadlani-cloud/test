"use client";
import { Check, ChevronsDown, Minus, Pause, Play, Plus } from "lucide-react";
import { useApp } from "./AppProvider";
import { useAutoScroll } from "@/hooks/useAutoScroll";

export function AutoScrollBar() {
  const { settings, setSettings, addRounds } = useApp();
  const { playing, finished, toggle, clearFinished } = useAutoScroll(settings.scrollSpeed);
  const speed = settings.scrollSpeed;
  const set = (v: number) => setSettings({ scrollSpeed: Math.min(200, Math.max(5, Math.round(v))) });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <div className="card pointer-events-auto flex max-w-full items-center gap-2 bg-surface/95 px-2.5 py-2 shadow-xl backdrop-blur" role="group" aria-label="Chanting pace auto-scroll">
        <button
          onClick={toggle}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson text-[#fff4d6] shadow transition-transform hover:scale-105"
          aria-label={playing ? "Pause auto-scroll" : "Start auto-scroll"} title={playing ? "Pause" : "Start hands-free scroll"}
        >
          {playing ? <Pause size={20} /> : <Play size={20} className="translate-x-px" />}
        </button>

        {finished ? (
          <div className="flex items-center gap-2 pr-1 text-sm">
            <span className="text-muted">End reached.</span>
            <button className="btn border-saffron" onClick={() => { addRounds(1); clearFinished(); }}><Check size={15} />Log today’s parayanam</button>
            <button className="btn-icon" onClick={clearFinished} aria-label="Dismiss">✕</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <ChevronsDown size={16} className={`hidden text-muted sm:block ${playing ? "animate-pulse" : ""}`} />
            <button className="btn-icon h-8 w-8" onClick={() => set(speed - 5)} aria-label="Slower"><Minus size={14} /></button>
            <input
              type="range" min={5} max={200} step={5} value={speed} onChange={(e) => set(Number(e.target.value))}
              className="w-24 sm:w-40" aria-label="Scroll speed" aria-valuetext={`${speed} pixels per second`}
            />
            <button className="btn-icon h-8 w-8" onClick={() => set(speed + 5)} aria-label="Faster"><Plus size={14} /></button>
            <span className="w-14 text-right text-xs tabular-nums text-muted">{speed} px/s</span>
          </div>
        )}
      </div>
    </div>
  );
}
