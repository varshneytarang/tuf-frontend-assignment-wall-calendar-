import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type ThemeMode = "light" | "dark";
type TagColor = "yellow" | "pink" | "teal";
type Mood = "low" | "ok" | "high";

type RangeState = {
  start: string | null;
  end: string | null;
};

type NoteItem = {
  id: string;
  text: string;
  color: TagColor;
  start: string; // ISO date inclusive
  end: string; // ISO date inclusive
};

type PersistedState = {
  monthIso: string; // YYYY-MM
  range: RangeState;
  notes: NoteItem[];
  memoByMonth: Record<string, string>;
  theme: ThemeMode;
  weekNumbers: boolean;
  highContrast: boolean;
  dayMoods?: Record<string, Mood>;
};

type DayCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
};

const STORAGE_KEY = "wall-calendar-tailwind-v2";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HERO_BY_MONTH = [
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

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromIso(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthFromKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function formatShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function startOfWeekMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildMonthGrid(viewDate: Date): DayCell[][] {
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

function getRangeLabel(range: RangeState) {
  if (!range.start && !range.end) return "No active selection";
  if (range.start && !range.end) return `Start: ${formatDay(fromIso(range.start))}`;
  if (range.start && range.end) return `${formatDay(fromIso(range.start))} - ${formatDay(fromIso(range.end))}`;
  return "No active selection";
}

function getRangeLength(range: RangeState) {
  if (!range.start || !range.end) return 0;
  const diff = fromIso(range.end).getTime() - fromIso(range.start).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

function isInRange(iso: string, range: RangeState) {
  if (!range.start || !range.end) return false;
  return iso > range.start && iso < range.end;
}

function getWeekNumber(date: Date) {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  copy.setUTCDate(copy.getUTCDate() + 4 - (copy.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function rangeGradientClass() {
  return "bg-[linear-gradient(110deg,rgba(56,189,248,0.35),rgba(139,92,246,0.35),rgba(56,189,248,0.35))] bg-[length:200%_100%] animate-shimmer";
}

function toIcsDate(iso: string) {
  return iso.replace(/-/g, "");
}

function getParticleType(month: number) {
  if ([11, 0, 1].includes(month)) return "snow";
  if ([2, 3, 4].includes(month)) return "petal";
  if ([5, 6, 7].includes(month)) return "rain";
  if ([8, 9, 10].includes(month)) return "leaf";
  return "spark";
}

function tagColorClasses(color: TagColor) {
  if (color === "yellow") return "bg-amber-200/90 text-amber-900 dark:bg-amber-300/80";
  if (color === "pink") return "bg-pink-200/90 text-pink-900 dark:bg-pink-300/80";
  return "bg-teal-200/90 text-teal-900 dark:bg-teal-300/80";
}

function monthBackgroundClass(monthIndex: number, theme: ThemeMode) {
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

export function WallCalendarTailwind() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [range, setRange] = useState<RangeState>({ start: null, end: null });
  const [invalidPulse, setInvalidPulse] = useState(false);
  const [direction, setDirection] = useState(1);
  const [memoByMonth, setMemoByMonth] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteColor, setNoteColor] = useState<TagColor>("yellow");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [weekNumbers, setWeekNumbers] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
  const [dayMoods, setDayMoods] = useState<Record<string, Mood>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PersistedState;
        setViewMonth(monthFromKey(parsed.monthIso));
        setRange(parsed.range);
        setNotes(parsed.notes);
        setMemoByMonth(parsed.memoByMonth);
        setTheme(parsed.theme);
        if (parsed.dayMoods) setDayMoods(parsed.dayMoods);
      } catch {
        // ignore
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const payload: PersistedState = {
      monthIso: monthKey(viewMonth),
      range,
      notes,
      memoByMonth,
      theme,
      weekNumbers,
      highContrast,
      dayMoods,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [dayMoods, highContrast, memoByMonth, mounted, notes, range, theme, viewMonth, weekNumbers]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const monthIndex = viewMonth.getMonth();
  const monthMemoKey = monthKey(viewMonth);
  const heroUrl = HERO_BY_MONTH[monthIndex];
  const particleType = getParticleType(monthIndex);
  const memoText = memoByMonth[monthMemoKey] ?? "";
  const backgroundClass = monthBackgroundClass(monthIndex, theme);

  const today = new Date();
  const todayIso = toIso(today);

  const effectiveRange: RangeState = { start: range.start, end: range.end };
  const rangeLength = getRangeLength(effectiveRange);

  const monthNotes = notes.filter((note) => {
    const monthStart = `${monthMemoKey}-01`;
    const monthEnd = toIso(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0));
    return !(note.end < monthStart || note.start > monthEnd);
  });

  const particleNodes = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, index) => ({
        id: `${monthMemoKey}-${index}`,
        left: `${(index * 13 + 7) % 97}%`,
        delay: (index % 7) * 0.35,
        duration: 5 + (index % 5),
        size: 4 + (index % 4),
      })),
    [monthMemoKey],
  );

  function updateMonth(offset: number) {
    setDirection(offset > 0 ? 1 : -1);
    setViewMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset, 1);
      return next;
    });
  }

  function triggerInvalidPulse() {
    setInvalidPulse(true);
    window.setTimeout(() => setInvalidPulse(false), 350);
  }

  function handleDayClick(iso: string) {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: iso, end: null });
      setSelectedDayIso(iso);
      return;
    }
    if (iso < range.start) {
      setRange({ start: iso, end: null });
      setSelectedDayIso(iso);
      return;
    }
    setRange({ start: range.start, end: iso });
    setSelectedDayIso(iso);
  }

  function clearRange() {
    setRange({ start: null, end: null });
  }

  function notesForDay(iso: string) {
    return notes.filter((note) => iso >= note.start && iso <= note.end);
  }

  function attachDraftToRange() {
    const trimmed = noteDraft.trim();
    if (!trimmed || !range.start) {
      triggerInvalidPulse();
      return;
    }
    const end = range.end ?? range.start;
    const note: NoteItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      color: noteColor,
      start: range.start,
      end,
    };
    setNotes((current) => [note, ...current]);
    setNoteDraft("");
  }

  function downloadIcs() {
    if (notes.length === 0) return;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WallCalendar//EN",
      ...notes.flatMap((note) => {
        const nextDay = toIso(new Date(fromIso(note.end).getTime() + 24 * 60 * 60 * 1000));
        return [
          "BEGIN:VEVENT",
          `UID:${note.id}@wall-calendar`,
          `DTSTAMP:${toIcsDate(note.start)}T000000Z`,
          `DTSTART;VALUE=DATE:${toIcsDate(note.start)}`,
          `DTEND;VALUE=DATE:${toIcsDate(nextDay)}`,
          `SUMMARY:${note.text.replace(/\n/g, " ")}`,
          "END:VEVENT",
        ];
      }),
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `calendar-notes-${monthMemoKey}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function beginInlineEdit(note: NoteItem) {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setSelectedDayIso(note.start);
  }

  function saveInlineEdit(noteId: string) {
    const next = editingText.trim();
    if (!next) {
      setNotes((current) => current.filter((item) => item.id !== noteId));
    } else {
      setNotes((current) => current.map((item) => (item.id === noteId ? { ...item, text: next } : item)));
    }
    setEditingNoteId(null);
    setEditingText("");
  }

  const selectedDayNotes = selectedDayIso ? notesForDay(selectedDayIso) : [];

  function setMoodForSelectedDay(mood: Mood) {
    if (!selectedDayIso) return;
    setDayMoods((current) => ({ ...current, [selectedDayIso]: mood }));
  }

  return (
    <div
      ref={containerRef}
      className={[
        "relative min-h-screen w-full px-3 py-4 md:px-6 md:py-6 lg:px-10 overflow-hidden",
        "transition-colors duration-700",
        backgroundClass,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {particleNodes.map((particle) => (
          <span
            key={particle.id}
            className={`particle particle-${particleType}`}
            style={{
              left: particle.left,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration + 4}s`,
              width: particle.size,
              height: particle.size,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        className={[
          "mx-auto max-w-7xl rounded-[2rem] border border-white/60 p-3 md:p-4 lg:p-6",
          "paper-texture shadow-paper backdrop-blur",
          theme === "dark" ? "border-sky-500/25 bg-slate-900/85" : "bg-white/85",
        ].join(" ")}
      >
        <header className="mb-3 flex items-start justify-between gap-3 md:mb-4">
          <div>
            <p className={theme === "dark" ? "text-sky-200/90" : "text-teal-700/90"}>Wall Calendar Studio</p>
            <h1
              className={[
                "font-serif text-3xl leading-none md:text-5xl",
                theme === "dark" ? "text-slate-100" : "text-slate-900",
              ].join(" ")}
            >
              {formatMonth(viewMonth)}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
            <div className="relative">
              <button
                className="rounded-full border border-slate-400/30 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:scale-[1.02] dark:border-sky-400/40 dark:text-sky-100"
                onMouseEnter={() => setHelpOpen(true)}
                onMouseLeave={() => setHelpOpen(false)}
                onFocus={() => setHelpOpen(true)}
                onBlur={() => setHelpOpen(false)}
                aria-label="Show help"
                type="button"
              >
                Help
              </button>
              {helpOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-300/80 bg-white/95 p-3 text-xs text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100">
                  <h2 className="mb-1 text-sm font-semibold">How to use this calendar</h2>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Select a start and end day to create a range.</li>
                    <li>Write a note, choose a color, then attach.</li>
                    <li>Click any day to open detailed view and set mood.</li>
                    <li>Use Export options to save as PDF (browser print) or .ics.</li>
                  </ul>
                </div>
              ) : null}
            </div>

            <button
              className="rounded-full border border-slate-400/30 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:scale-[1.02] dark:border-sky-400/40 dark:text-sky-100"
              onClick={() => setTheme((curr) => (curr === "light" ? "dark" : "light"))}
              aria-label="Toggle theme"
              type="button"
            >
              {theme === "light" ? "Moon Dark" : "Sun Light"}
            </button>

            <button
              className="rounded-full border border-slate-400/30 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:scale-[1.02] dark:border-sky-400/40 dark:text-sky-100 lg:hidden"
              onClick={() => setSettingsOpen((curr) => !curr)}
              type="button"
              aria-label="Toggle mobile settings"
            >
              Settings
            </button>
          </div>
        </header>

        <div className="mt-4 lg:flex lg:items-start lg:gap-4">
          <div className="lg:flex-1 space-y-4">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/40">
              <motion.img
                key={heroUrl}
                src={heroUrl}
                loading="lazy"
                alt={`${formatShort(viewMonth)} seasonal landscape`}
                className="h-[40vh] min-h-[260px] w-full object-cover md:h-[46vh]"
                initial={{ scale: 1.02, opacity: 0.9 }}
                animate={{ scale: 1.05, opacity: 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />

              <div className="absolute left-4 top-4 rounded-xl bg-black/35 px-4 py-2 text-white backdrop-blur md:left-6 md:top-6">
                <p className="font-serif text-2xl md:text-4xl">{formatShort(viewMonth).toUpperCase()}</p>
                <p className="text-xs tracking-[0.24em] md:text-sm">{viewMonth.getFullYear()}</p>
              </div>
            </div>

            <motion.section
              className="rounded-3xl border border-slate-300/40 bg-white/85 p-3 shadow-lg dark:border-slate-707/60 dark:bg-slate-900/90 md:p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 md:mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
                  <button
                    className="rounded-full border border-sky-300 bg-white/90 px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm hover:bg-sky-50 dark:border-sky-500/60 dark:bg-slate-900 dark:text-sky-200"
                    type="button"
                    onClick={() => updateMonth(-1)}
                  >
                    
                    ◀ Prev
                  </button>
                  <button
                    className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400"
                    type="button"
                    onClick={() => updateMonth(1)}
                  >
                    Next ▶
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                    Start
                  </span>
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                    End
                  </span>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                    In range
                  </span>
                  <button
                    className="rounded-full border border-slate-300/60 px-3 py-1 text-xs font-semibold hover:bg-slate-200/60 dark:border-slate-700 dark:hover:bg-slate-800"
                    onClick={clearRange}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={monthKey(viewMonth)}
                  initial={{ opacity: 0, x: direction > 0 ? 38 : -38 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -38 : 38 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={invalidPulse ? "animate-shake-soft" : ""}
                >
                  <div
                    className={[
                      "mb-2 grid gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300",
                      weekNumbers ? "grid-cols-[40px_repeat(7,minmax(0,1fr))]" : "grid-cols-7",
                    ].join(" ")}
                  >
                    {weekNumbers ? <span>Wk</span> : null}
                    {WEEK_DAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="grid gap-1.5">
                    {grid.map((week, weekIndex) => (
                      <div
                        key={`${monthKey(viewMonth)}-w${weekIndex}`}
                        className={[
                          "grid gap-1.5",
                          weekNumbers ? "grid-cols-[40px_repeat(7,minmax(0,1fr))]" : "grid-cols-7",
                        ].join(" ")}
                      >
                        {weekNumbers ? (
                          <div className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500">
                            {getWeekNumber(week[0].date)}
                          </div>
                        ) : null}

                        {week.map((cell, dayIndex) => {
                          const isWeekend = dayIndex >= 5;
                          const isStart = range.start === cell.iso;
                          const isEnd = effectiveRange.end === cell.iso && !!effectiveRange.end;
                          const between = isInRange(cell.iso, effectiveRange);
                          const taggedNotes = notesForDay(cell.iso);
                          const isEditingHere = taggedNotes.some(
                            (note) => note.id === editingNoteId && note.start === cell.iso,
                          );
                          const noteCount = taggedNotes.length;
                          const mood = dayMoods[cell.iso];

                          let energyClass = "";
                          if (noteCount === 1) {
                            energyClass = theme === "dark" ? "bg-sky-900/40" : "bg-sky-50";
                          } else if (noteCount === 2) {
                            energyClass = theme === "dark" ? "bg-emerald-900/40" : "bg-emerald-50";
                          } else if (noteCount >= 3) {
                            energyClass = theme === "dark" ? "bg-amber-900/50" : "bg-amber-50";
                          }

                          return (
                            <button
                              key={cell.iso}
                              type="button"
                              onClick={() => handleDayClick(cell.iso)}
                              aria-label={`Select ${formatDay(cell.date)}`}
                              className={[
                                "calendar-day group min-h-14 rounded-2xl border p-1.5 text-left shadow-sm transition md:min-h-[96px] md:p-2.5",
                                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
                                cell.inMonth ? "opacity-100" : "opacity-45",
                                theme === "dark" ? "border-slate-700/65 bg-slate-900/80" : "border-slate-200/85 bg-white/90",
                                isWeekend ? "ring-1 ring-sky-400/20" : "",
                                between ? rangeGradientClass() : "",
                                isStart
                                  ? "ring-2 ring-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                                  : "",
                                isEnd
                                  ? "ring-2 ring-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.25)]"
                                  : "",
                                energyClass,
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={[
                                    "text-sm font-bold md:text-base",
                                    theme === "dark" ? "text-slate-100" : "text-slate-800",
                                  ].join(" ")}
                                >
                                  {cell.date.getDate()}
                                </span>
                                <div className="flex items-center gap-1">
                                  {mood === "low" ? (
                                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                                  ) : null}
                                  {mood === "ok" ? (
                                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                                  ) : null}
                                  {mood === "high" ? (
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                  ) : null}
                                  {cell.isToday ? (
                                    <span className="h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-400/45 pulse-dot" />
                                  ) : null}
                                </div>
                              </div>

                              <div className="mt-1 flex flex-wrap gap-1">
                                {taggedNotes.slice(0, 2).map((note) => (
                                  <span
                                    key={note.id}
                                    role="button"
                                    tabIndex={0}
                                    className={`max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${tagColorClasses(note.color)}`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      beginInlineEdit(note);
                                    }}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        beginInlineEdit(note);
                                      }
                                    }}
                                  >
                                    {note.text}
                                  </span>
                                ))}
                              </div>

                              {isEditingHere ? (
                                <div className="mt-1 rounded-lg border border-slate-300/80 bg-white/95 p-1 dark:border-slate-700 dark:bg-slate-900/90">
                                  <input
                                    value={editingText}
                                    onChange={(event) => setEditingText(event.target.value)}
                                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-sky-400 dark:border-slate-707 dark:bg-slate-950 dark:text-slate-100"
                                    aria-label="Edit note text"
                                  />
                                  <div className="mt-1 flex gap-1">
                                    <button
                                      type="button"
                                      className="rounded bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        saveInlineEdit(editingNoteId as string);
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded bg-slate-500 px-2 py-1 text-[10px] font-semibold text-white"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setEditingNoteId(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-100/70 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 md:text-sm">
                {getRangeLabel(effectiveRange)} {rangeLength > 0 ? `(${rangeLength} days)` : ""}
              </div>

              {selectedDayIso ? (
                <div className="mt-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 text-xs text-slate-700 shadow-sm dark:border-slate-707 dark:bg-slate-900/90 md:text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        Day details
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatDay(fromIso(selectedDayIso))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDayIso(null)}
                      className="rounded-full border border-slate-300/70 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Mood:</span>
                    <button
                      type="button"
                      onClick={() => setMoodForSelectedDay("low")}
                      className={`rounded-full px-2 py-1 ${
                        dayMoods[selectedDayIso] === "low"
                          ? "bg-rose-500 text-white"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                      }`}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoodForSelectedDay("ok")}
                      className={`rounded-full px-2 py-1 ${
                        dayMoods[selectedDayIso] === "ok"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      }`}
                    >
                      Okay
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoodForSelectedDay("high")}
                      className={`rounded-full px-2 py-1 ${
                        dayMoods[selectedDayIso] === "high"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      }`}
                    >
                      High
                    </button>
                  </div>

                  <div className="space-y-1">
                    {selectedDayNotes.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">No notes for this day yet.</p>
                    ) : (
                      selectedDayNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs font-semibold ${tagColorClasses(note.color)}`}
                        >
                          <span className="truncate">{note.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </motion.section>
          </div>

          <aside className="mt-4 rounded-3xl border border-slate-300/40 bg-white/85 p-3 shadow-lg dark:border-slate-707/60 dark:bg-slate-900/90 md:p-4 lg:mt-0 lg:w-[320px]">
            <button
              className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-300/70 px-3 py-2 text-sm font-semibold dark:border-slate-707 md:hidden"
              onClick={() => setNotesOpen((curr) => !curr)}
              type="button"
            >
              <span>Notes and Settings</span>
              <span>{notesOpen ? "Hide" : "Show"}</span>
            </button>

            <div className={notesOpen ? "block" : "hidden md:block"}>
              <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100">Notes</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                General monthly memo plus range-attached notes.
              </p>

              <label className="mt-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Monthly memo
                <textarea
                  value={memoText}
                  onChange={(event) =>
                    setMemoByMonth((current) => ({
                      ...current,
                      [monthMemoKey]: event.target.value,
                    }))
                  }
                  className="mt-1 h-24 w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-707 dark:bg-slate-950/80"
                  placeholder="Plan goals, reminders, and monthly reflections..."
                />
              </label>

              <label className="mt-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Note for selected range
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  className="mt-1 h-20 w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-707 dark:bg-slate-950/80"
                  placeholder="Type a note, select a date range, then attach"
                />
              </label>

              <div className="mt-2 flex flex-wrap gap-2">
                {(["yellow", "pink", "teal"] as TagColor[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNoteColor(color)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      tagColorClasses(color),
                      noteColor === color ? "ring-2 ring-slate-900/60 dark:ring-white/70" : "",
                    ].join(" ")}
                  >
                    {color}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={attachDraftToRange}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-2 text-sm font-semibold text-white"
                >
                  Attach to Range
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-300/80 px-3 py-2 text-sm font-semibold dark:border-slate-707"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={downloadIcs}
                  className="rounded-xl border border-slate-300/80 px-3 py-2 text-sm font-semibold dark:border-slate-707"
                >
                  Export ICS
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-300/70 bg-slate-100/65 p-3 text-sm dark:border-slate-707 dark:bg-slate-800/60">
                <h3 className="mb-2 font-semibold">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between gap-2">
                    <span>Show week numbers</span>
                    <input
                      type="checkbox"
                      checked={weekNumbers}
                      onChange={(event) => setWeekNumbers(event.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span>High contrast</span>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(event) => setHighContrast(event.target.checked)}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {monthNotes.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300/80 p-3 text-sm text-slate-600 dark:border-slate-707 dark:text-slate-300">
                    No attached range notes yet.
                  </p>
                ) : (
                  monthNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-slate-300/70 bg-white/90 p-2 dark:border-slate-707 dark:bg-slate-950/70"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${tagColorClasses(note.color)}`}
                          >
                            {note.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatDay(fromIso(note.start))}
                          {note.end !== note.start ? ` + ${getRangeLength({ start: note.start, end: note.end })} days` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))}
                        className="rounded-full border border-slate-300/80 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-707 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {settingsOpen ? (
              <div className="mt-3 rounded-xl border border-slate-300/70 bg-slate-100/80 p-3 text-sm dark:border-slate-707 dark:bg-slate-800/70 lg:hidden">
                <p className="font-semibold">Mobile quick settings</p>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center justify-between gap-2">
                    <span>Show week numbers</span>
                    <input
                      type="checkbox"
                      checked={weekNumbers}
                      onChange={(event) => setWeekNumbers(event.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2">
                    <span>High contrast</span>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(event) => setHighContrast(event.target.checked)}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </motion.section>
    </div>
  );
}
