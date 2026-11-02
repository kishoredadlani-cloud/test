export const dateKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shift = (key: string, days: number): string => {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
};

export interface StreakInfo { current: number; longest: number; totalDays: number; totalRounds: number }

/** Current streak counts back from today (or yesterday, if today isn't logged yet). */
export function computeStreak(log: Record<string, number>, today: string = dateKey()): StreakInfo {
  const days = Object.keys(log).filter((k) => log[k] > 0).sort();
  let longest = 0, run = 0, prev: string | null = null;
  for (const k of days) {
    run = prev && shift(prev, 1) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }
  let cursor = log[today] > 0 ? today : shift(today, -1);
  let current = 0;
  while (log[cursor] > 0) { current++; cursor = shift(cursor, -1); }
  const totalRounds = days.reduce((a, k) => a + log[k], 0);
  return { current, longest, totalDays: days.length, totalRounds };
}

export const lastNDays = (n: number, today: string = dateKey()): string[] =>
  Array.from({ length: n }, (_, i) => shift(today, i - (n - 1)));
