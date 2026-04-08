import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CalendarView,
  DayCell,
  Mood,
  NoteItem,
  PersistedState,
  RangeState,
  TagColor,
  ThemeMode,
  ReminderItem,
} from "../types/calendar";
import {
  HERO_BY_MONTH,
  WEEK_DAYS,
  buildMonthGrid,
  formatDay,
  formatMonth,
  formatShort,
  fromIso,
  getRangeLabel,
  getRangeLength,
  getWeekNumber,
  isInRange,
  monthBackgroundClass,
  monthFromKey,
  monthKey,
  rangeGradientClass,
  tagColorClasses,
  toIcsDate,
  toIso,
  getParticleType,
} from "../utils/calendar";

const STORAGE_KEY = "wall-calendar-tailwind-v2";

export interface CalendarContextValue {
  // core state
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  viewMode: CalendarView;
  setViewMode: React.Dispatch<React.SetStateAction<CalendarView>>;
  viewMonth: Date;
  setViewMonth: React.Dispatch<React.SetStateAction<Date>>;
  direction: number;
  updateMonth: (offset: number) => void;
  updateWeek: (offsetWeeks: number) => void;
  updateDay: (offsetDays: number) => void;
  range: RangeState;
  setRange: React.Dispatch<React.SetStateAction<RangeState>>;
  clearRange: () => void;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  noteDraft: string;
  setNoteDraft: React.Dispatch<React.SetStateAction<string>>;
  noteColor: TagColor;
  setNoteColor: React.Dispatch<React.SetStateAction<TagColor>>;
  memoByMonth: Record<string, string>;
  setMemoByMonth: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  weekNumbers: boolean;
  setWeekNumbers: React.Dispatch<React.SetStateAction<boolean>>;
  highContrast: boolean;
  setHighContrast: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDayIso: string | null;
  setSelectedDayIso: React.Dispatch<React.SetStateAction<string | null>>;
  dayMoods: Record<string, Mood>;
  setDayMoods: React.Dispatch<React.SetStateAction<Record<string, Mood>>>;
  dayEventHours: Record<string, number>;
  setDayEventHours: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;

  // derived
  grid: DayCell[][];
  monthIndex: number;
  monthMemoKey: string;
  heroUrl: string;
  particleType: string;
  memoText: string;
  backgroundClass: string;
  effectiveRange: RangeState;
  rangeLength: number;
  monthNotes: NoteItem[];
  particleNodes: { id: string; left: string; delay: number; duration: number; size: number }[];

  // helpers
  todayIso: string;
  updateRangeForDayClick: (iso: string) => void;
  notesForDay: (iso: string) => NoteItem[];
  attachDraftToRange: (onInvalid?: () => void) => void;
  downloadIcs: () => void;
  createReminder: (dayIso: string, hour: number, message: string) => void;
  beginInlineEdit: (note: NoteItem) => void;
  saveInlineEdit: (noteId: string) => void;
  editingNoteId: string | null;
  editingText: string;
  setEditingText: React.Dispatch<React.SetStateAction<string>>;
  isInRange: (iso: string) => boolean;
  getRangeLabel: () => string;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [viewMode, setViewMode] = useState<CalendarView>("month");
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [range, setRange] = useState<RangeState>({ start: null, end: null });
  const [direction, setDirection] = useState(1);
  const [memoByMonth, setMemoByMonth] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteColor, setNoteColor] = useState<TagColor>("yellow");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [weekNumbers, setWeekNumbers] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
  const [dayMoods, setDayMoods] = useState<Record<string, Mood>>({});
  const [dayEventHours, setDayEventHours] = useState<Record<string, number>>({});
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

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
        setWeekNumbers(parsed.weekNumbers ?? false);
        setHighContrast(parsed.highContrast ?? false);
        if (parsed.dayMoods) setDayMoods(parsed.dayMoods);
        if (parsed.dayEventHours) setDayEventHours(parsed.dayEventHours);
        if (parsed.reminders) {
          setReminders(parsed.reminders);

          parsed.reminders.forEach((reminder) => {
            const now = Date.now();
            const delay = reminder.dueAt - now;
            if (delay <= 0) return;

            const showNotification = () => {
              if (typeof window === "undefined") return;
              const trimmed = reminder.message;
              if ("Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification("Calendar reminder", { body: trimmed, tag: reminder.id });
                  return;
                }
                if (Notification.permission === "default") {
                  Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                      new Notification("Calendar reminder", { body: trimmed, tag: reminder.id });
                    } else {
                      window.alert(`Reminder: ${trimmed}`);
                    }
                  });
                  return;
                }
              }
              window.alert(`Reminder: ${trimmed}`);
            };

            const safeDelay = Math.min(delay, 2147483647);
            window.setTimeout(showNotification, safeDelay);
          });
        }
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
      dayEventHours,
      reminders,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    dayEventHours,
    dayMoods,
    highContrast,
    memoByMonth,
    mounted,
    notes,
    range,
    reminders,
    theme,
    viewMonth,
    weekNumbers,
  ]);

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

  function updateWeek(offset: number) {
    setDirection(offset > 0 ? 1 : -1);
    const anchorIso = selectedDayIso ?? todayIso;
    const anchorDate = fromIso(anchorIso);
    anchorDate.setDate(anchorDate.getDate() + offset * 7);
    const nextIso = toIso(anchorDate);
    setSelectedDayIso(nextIso);
    setViewMonth(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
  }

  function updateDay(offset: number) {
    setDirection(offset > 0 ? 1 : -1);
    const anchorIso = selectedDayIso ?? todayIso;
    const anchorDate = fromIso(anchorIso);
    anchorDate.setDate(anchorDate.getDate() + offset);
    const nextIso = toIso(anchorDate);
    setSelectedDayIso(nextIso);
    setViewMonth(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
  }

  function clearRange() {
    setRange({ start: null, end: null });
  }

  function notesForDay(iso: string) {
    return notes.filter((note) => iso >= note.start && iso <= note.end);
  }

  function updateRangeForDayClick(iso: string) {
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

  function attachDraftToRange(onInvalid?: () => void) {
    const trimmed = noteDraft.trim();
    if (!trimmed || !range.start) {
      if (onInvalid) onInvalid();
      return;
    }
    const end = range.end ?? range.start;
    if (end < todayIso) {
      if (typeof window !== "undefined") {
        window.alert("You can only attach notes for today or future dates.");
      }
      if (onInvalid) onInvalid();
      return;
    }
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

  function isInRangeHelper(iso: string) {
    return isInRange(iso, effectiveRange);
  }

  function getRangeLabelHelper() {
    return getRangeLabel(effectiveRange);
  }

  function createReminder(dayIso: string, hour: number, message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;
    const base = fromIso(dayIso);
    base.setHours(hour, 0, 0, 0);
    const dueAt = base.getTime();
    const id = `${dayIso}-${hour}-${Date.now()}`;
    const reminder: ReminderItem = {
      id,
      dayIso,
      hour,
      message: trimmed,
      createdAt: Date.now(),
      dueAt,
    };
    setReminders((current) => [...current, reminder]);

    const reminderNote: NoteItem = {
      id: `reminder-note-${id}`,
      text: trimmed,
      color: "teal",
      start: dayIso,
      end: dayIso,
    };
    setNotes((current) => [reminderNote, ...current]);

    setMemoByMonth((current) => {
      const monthKeyFromDay = dayIso.slice(0, 7); // YYYY-MM
      const previous = current[monthKeyFromDay] ?? "";
      const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
      const line = `🔔 ${dayIso} ${timeLabel} – ${trimmed}`;
      const nextText = previous ? `${previous}\n${line}` : line;
      return {
        ...current,
        [monthKeyFromDay]: nextText,
      };
    });

    const now = Date.now();
    const delay = dueAt - now;
    if (delay <= 0) {
      // Past time: fire immediately but still log in state/memo
      if (typeof window !== "undefined") {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Calendar reminder", { body: trimmed, tag: id });
        } else {
          window.alert(`Reminder: ${trimmed}`);
        }
      }
      return;
    }

    const showNotification = () => {
      if (typeof window === "undefined") return;
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Calendar reminder", { body: trimmed, tag: id });
          return;
        }
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Calendar reminder", { body: trimmed, tag: id });
            } else {
              window.alert(`Reminder: ${trimmed}`);
            }
          });
          return;
        }
      }
      window.alert(`Reminder: ${trimmed}`);
    };

    const safeDelay = Math.min(delay, 2147483647);
    window.setTimeout(showNotification, safeDelay);
  }

  const value: CalendarContextValue = {
    theme,
    setTheme,
    viewMode,
    setViewMode,
    viewMonth,
    setViewMonth,
    direction,
    updateMonth,
    updateWeek,
    updateDay,
    range,
    setRange,
    clearRange,
    notes,
    setNotes,
    noteDraft,
    setNoteDraft,
    noteColor,
    setNoteColor,
    memoByMonth,
    setMemoByMonth,
    weekNumbers,
    setWeekNumbers,
    highContrast,
    setHighContrast,
    selectedDayIso,
    setSelectedDayIso,
    dayMoods,
    setDayMoods,
    dayEventHours,
    setDayEventHours,
    reminders,
    setReminders,
    grid,
    monthIndex,
    monthMemoKey,
    heroUrl,
    particleType,
    memoText,
    backgroundClass,
    effectiveRange,
    rangeLength,
    monthNotes,
    particleNodes,
    todayIso,
    updateRangeForDayClick,
    notesForDay,
    attachDraftToRange,
    downloadIcs,
    beginInlineEdit,
    saveInlineEdit,
    editingNoteId,
    editingText,
    setEditingText,
    isInRange: isInRangeHelper,
    getRangeLabel: getRangeLabelHelper,
    createReminder,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return ctx;
}

// Calendar utilities are available from src/utils/calendar; this file only
// exposes React hooks/components so that React Fast Refresh stays compatible.
