export type ThemeMode = "light" | "dark";
export type TagColor = "yellow" | "pink" | "teal";
export type Mood = "low" | "ok" | "high";

export type CalendarView = "month" | "week" | "day";

export type RangeState = {
  start: string | null;
  end: string | null;
};

export type NoteItem = {
  id: string;
  text: string;
  color: TagColor;
  start: string; // ISO date inclusive
  end: string; // ISO date inclusive
};

export type ReminderItem = {
  id: string;
  dayIso: string;
  hour: number;
  message: string;
  createdAt: number;
  dueAt: number;
};

export type PersistedState = {
  monthIso: string; // YYYY-MM
  range: RangeState;
  notes: NoteItem[];
  memoByMonth: Record<string, string>;
  theme: ThemeMode;
  weekNumbers: boolean;
  highContrast: boolean;
  dayMoods?: Record<string, Mood>;
  dayEventHours?: Record<string, number>;
  reminders?: ReminderItem[];
};

export type DayCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
};
