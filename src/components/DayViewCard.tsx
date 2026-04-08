import { useCalendar } from "../context/CalendarContext";
import { formatDay, fromIso, tagColorClasses } from "../utils/calendar";

export function DayViewCard() {
  const { selectedDayIso, todayIso, notesForDay, reminders, dayMoods, theme } = useCalendar();

  const dayIso = selectedDayIso ?? todayIso;
  const date = fromIso(dayIso);
  const notes = notesForDay(dayIso);
  const mood = dayMoods[dayIso];
  const dayReminders = reminders.filter((item) => item.dayIso === dayIso);
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "rounded-2xl border p-4 md:p-5 shadow-lg",
        isDark
          ? "border-slate-800/80 bg-slate-950/80 text-slate-50"
          : "border-slate-200/80 bg-white/95 text-slate-900",
      ].join(" ")}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Focused day
          </p>
          <p className="font-serif text-2xl md:text-3xl">{formatDay(date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {mood ? (
            <span
              className={[
                "rounded-full px-2 py-1 font-semibold",
                mood === "low"
                  ? isDark
                    ? "bg-rose-500/15 text-rose-300"
                    : "bg-rose-50 text-rose-700"
                  : mood === "ok"
                    ? isDark
                      ? "bg-amber-400/15 text-amber-200"
                      : "bg-amber-50 text-amber-800"
                    : isDark
                      ? "bg-emerald-400/15 text-emerald-200"
                      : "bg-emerald-50 text-emerald-800",
              ].join(" ")}
            >
              Mood: {mood === "low" ? "Low" : mood === "ok" ? "Okay" : "High"}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              No mood set
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {dayReminders.length} reminder{dayReminders.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            All-day notes
          </h2>
          {notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300/80 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No notes attached to this day yet.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={[
                    "flex items-start gap-2 rounded-xl border px-2.5 py-1.5",
                    isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <span
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full text-[10px] font-semibold text-center leading-4 ${tagColorClasses(note.color)}`}
                  >
                    {note.text.slice(0, 1).toUpperCase()}
                  </span>
                  <p className="flex-1 text-[11px] leading-snug">{note.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Timed reminders
          </h2>
          {dayReminders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300/80 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No reminders scheduled for this day.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs">
              {dayReminders
                .slice()
                .sort((a, b) => a.hour - b.hour)
                .map((item) => (
                  <li
                    key={item.id}
                    className={[
                      "flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5",
                      isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {item.hour.toString().padStart(2, "0")}:00
                    </span>
                    <span className="flex-1 truncate text-[11px] text-slate-800 dark:text-slate-100">
                      {item.message}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
