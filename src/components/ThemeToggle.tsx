"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useApp, type ThemeChoice } from "./AppProvider";

const order: ThemeChoice[] = ["light", "dark", "system"];
const label: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };

export function ThemeToggle() {
  const { settings, setSettings } = useApp();
  const t = settings.theme;
  const next = order[(order.indexOf(t) + 1) % order.length];
  const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
  return (
    <button className="btn-icon" onClick={() => setSettings({ theme: next })} title={`Theme: ${label[t]} (click for ${label[next]})`} aria-label={`Theme: ${label[t]}. Switch to ${label[next]}`}>
      <Icon size={18} />
    </button>
  );
}
