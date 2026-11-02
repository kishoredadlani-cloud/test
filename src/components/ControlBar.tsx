"use client";
import { AlignLeft, BookOpen, Minus, Plus, ScrollText } from "lucide-react";
import { FONT_SCALES, useApp, type Settings } from "./AppProvider";

type ToggleKey = "showDevanagari" | "showIast" | "showMeaning" | "showCommentary";
const toggles: { key: ToggleKey; label: string }[] = [
  { key: "showDevanagari", label: "Devanagari" },
  { key: "showIast", label: "IAST" },
  { key: "showMeaning", label: "English" },
  { key: "showCommentary", label: "Commentary" },
];

export function ControlBar() {
  const { settings, setSettings } = useApp();
  const { mode, fontSize } = settings;
  return (
    <div className="sticky top-0 z-30 border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <div role="tablist" aria-label="View mode" className="flex rounded-xl border border-line bg-surface p-0.5">
          {([
            ["stotra", "Stotra", ScrollText, "Chanting view — flowing verses"],
            ["archana", "Archana", BookOpen, "Study view — name by name"],
          ] as const).map(([m, label, Icon, hint]) => (
            <button
              key={m} role="tab" aria-selected={mode === m} title={hint}
              onClick={() => setSettings({ mode: m })}
              className={`flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm transition-colors ${mode === m ? "bg-crimson text-[#fff4d6] shadow" : "text-muted hover:text-crimson"}`}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Visibility">
          {toggles.map((t) => (
            <button key={t.key} className="chip" aria-pressed={settings[t.key]} onClick={() => setSettings({ [t.key]: !settings[t.key] } as Partial<Settings>)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Font size">
          <button className="btn-icon" onClick={() => setSettings({ fontSize: Math.max(0, fontSize - 1) })} disabled={fontSize === 0} aria-label="Smaller text"><Minus size={16} /></button>
          <span className="flex w-12 items-center justify-center gap-1 text-xs text-muted" aria-live="polite"><AlignLeft size={13} />{Math.round(FONT_SCALES[fontSize] * 100)}%</span>
          <button className="btn-icon" onClick={() => setSettings({ fontSize: Math.min(FONT_SCALES.length - 1, fontSize + 1) })} disabled={fontSize === FONT_SCALES.length - 1} aria-label="Larger text"><Plus size={16} /></button>
        </div>
      </div>
    </div>
  );
}
