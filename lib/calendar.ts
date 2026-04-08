export type CalendarRange = {
  start: string | null;
  end: string | null;
};

export type CalendarCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeekMonday(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + offset);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function isDateInRange(iso: string, range: CalendarRange) {
  if (!range.start || !range.end) {
    return false;
  }

  return iso > range.start && iso < range.end;
}

export function isRangeStart(iso: string, range: CalendarRange) {
  return range.start === iso;
}

export function isRangeEnd(iso: string, range: CalendarRange) {
  return range.end === iso;
}

export function getRangeLabel(range: CalendarRange) {
  if (!range.start && !range.end) {
    return "No dates selected";
  }

  if (range.start && !range.end) {
    return `Start: ${formatReadableDate(fromIsoDate(range.start))}`;
  }

  if (range.start && range.end) {
    return `${formatReadableDate(fromIsoDate(range.start))} - ${formatReadableDate(fromIsoDate(range.end))}`;
  }

  return "No dates selected";
}

export function getRangeLength(range: CalendarRange) {
  if (!range.start || !range.end) {
    return 0;
  }

  const start = fromIsoDate(range.start).getTime();
  const end = fromIsoDate(range.end).getTime();
  return Math.round((end - start) / DAY_MS) + 1;
}

export function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function formatMonthShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

export function formatReadableDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function buildMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = startOfWeekMonday(firstDay);
  const end = new Date(lastDay);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));

  const cells: CalendarCell[] = [];
  const cursor = new Date(start);
  const today = new Date();

  while (cursor <= end) {
    cells.push({
      date: new Date(cursor),
      iso: toIsoDate(cursor),
      inMonth: cursor.getMonth() === month,
      isToday: isSameDate(cursor, today),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}