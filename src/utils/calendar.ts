import { DayCell, Mood, RangeState, TagColor, ThemeMode } from "../types/calendar";

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const HERO_BY_MONTH = [
  "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1800&q=80",
];

export function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromIso(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthFromKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function formatShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

export function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function startOfWeekMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function buildMonthGrid(viewDate: Date): DayCell[][] {
  const month = viewDate.getMonth();
  const first = new Date(viewDate.getFullYear(), month, 1);
  const last = new Date(viewDate.getFullYear(), month + 1, 0);
  const start = startOfWeekMonday(first);
  const end = new Date(last);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));

  const today = new Date();
  const days: DayCell[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = toIso(cursor);
    days.push({
      date: new Date(cursor),
      iso,
      inMonth: cursor.getMonth() === month,
      isToday: iso === toIso(today),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function getRangeLabel(range: RangeState) {
  if (!range.start && !range.end) return "No active selection";
  if (range.start && !range.end) return `Start: ${formatDay(fromIso(range.start))}`;
  if (range.start && range.end) return `${formatDay(fromIso(range.start))} - ${formatDay(fromIso(range.end))}`;
  return "No active selection";
}

export function getRangeLength(range: RangeState) {
  if (!range.start || !range.end) return 0;
  const diff = fromIso(range.end).getTime() - fromIso(range.start).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export function isInRange(iso: string, range: RangeState) {
  if (!range.start || !range.end) return false;
  return iso > range.start && iso < range.end;
}

export function getWeekNumber(date: Date) {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  copy.setUTCDate(copy.getUTCDate() + 4 - (copy.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function rangeGradientClass() {
  return "bg-[linear-gradient(110deg,rgba(56,189,248,0.35),rgba(139,92,246,0.35),rgba(56,189,248,0.35))] bg-[length:200%_100%] animate-shimmer";
}

export function toIcsDate(iso: string) {
  return iso.replace(/-/g, "");
}

export function getParticleType(month: number) {
  if ([11, 0, 1].includes(month)) return "snow";
  if ([2, 3, 4].includes(month)) return "petal";
  if ([5, 6, 7].includes(month)) return "rain";
  if ([8, 9, 10].includes(month)) return "leaf";
  return "spark";
}

export function tagColorClasses(color: TagColor) {
  if (color === "yellow") return "bg-amber-200/90 text-amber-900 dark:bg-amber-300/80";
  if (color === "pink") return "bg-pink-200/90 text-pink-900 dark:bg-pink-300/80";
  return "bg-teal-200/90 text-teal-900 dark:bg-teal-300/80";
}

export function monthBackgroundClass(monthIndex: number, theme: ThemeMode) {
  const lightPalettes = [
    "bg-gradient-to-b from-rose-50 via-amber-50 to-sky-50",
    "bg-gradient-to-b from-rose-50 via-pink-50 to-slate-50",
    "bg-gradient-to-b from-emerald-50 via-lime-50 to-sky-50",
    "bg-gradient-to-b from-emerald-50 via-sky-50 to-blue-50",
    "bg-gradient-to-b from-emerald-50 via-sky-50 to-cyan-50",
    "bg-gradient-to-b from-sky-50 via-cyan-50 to-emerald-50",
    "bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50",
    "bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50",
    "bg-gradient-to-b from-amber-50 via-lime-50 to-emerald-50",
    "bg-gradient-to-b from-orange-50 via-amber-50 to-rose-50",
    "bg-gradient-to-b from-slate-50 via-sky-50 to-indigo-50",
    "bg-gradient-to-b from-slate-50 via-sky-50 to-emerald-50",
  ];

  const darkPalettes = [
    "bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950",
    "bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950",
    "bg-gradient-to-b from-slate-950 via-emerald-950 to-sky-950",
    "bg-gradient-to-b from-slate-950 via-sky-950 to-indigo-950",
    "bg-gradient-to-b from-slate-950 via-cyan-950 to-emerald-950",
    "bg-gradient-to-b from-slate-950 via-sky-950 to-emerald-950",
    "bg-gradient-to-b from-slate-950 via-amber-950 to-rose-950",
    "bg-gradient-to-b from-slate-950 via-indigo-950 to-sky-950",
    "bg-gradient-to-b from-slate-950 via-emerald-950 to-amber-950",
    "bg-gradient-to-b from-slate-950 via-rose-950 to-amber-950",
    "bg-gradient-to-b from-slate-950 via-sky-950 to-indigo-950",
    "bg-gradient-to-b from-slate-950 via-sky-950 to-emerald-950",
  ];

  const index = Math.max(0, Math.min(11, monthIndex));
  return theme === "dark" ? darkPalettes[index] : lightPalettes[index];
}
