import { useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { formatDay, fromIso } from "../utils/calendar";

interface CalendarSidebarProps {
  triggerInvalidPulse: () => void;
}

export function CalendarSidebar({ triggerInvalidPulse }: CalendarSidebarProps) {
  const {
    selectedDayIso,
    monthMemoKey,
    monthNotes,
    reminders,
    setRange,
    setSelectedDayIso,
    setRangeNoteEditorOpen,
    setRangeEditorNoteId,
  } = useCalendar();

  const [notesOpen, setNotesOpen] = useState(true);

  const relevantReminders = reminders.filter((item) => {
    if (selectedDayIso) return item.dayIso === selectedDayIso;
    return item.dayIso.startsWith(monthMemoKey);
  });

  const upcomingReminders = relevantReminders
    .slice()
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 5);

  return (
    <aside className="mt-4 w-full rounded-3xl border border-slate-300/40 bg-white/85 p-3 shadow-lg dark:border-slate-707/60 dark:bg-slate-900/90 md:p-4 lg:mt-0">
      <button
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-300/70 px-3 py-2 text-sm font-semibold dark:border-slate-707 md:hidden"
        onClick={() => setNotesOpen((curr) => !curr)}
        type="button"
      >
        <span>Memos</span>
        <span>{notesOpen ? "Hide" : "Show"}</span>
      </button>

      <div className={notesOpen ? "block" : "hidden md:block"}>
        <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100">Memos</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Past range memos and upcoming reminders.
        </p>

        <div className="mt-4 rounded-xl border border-slate-300/70 bg-white/90 p-3 text-sm dark:border-slate-707 dark:bg-slate-950/70">
          <h3 className="mb-2 font-semibold">Upcoming reminders</h3>
          {upcomingReminders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No reminders scheduled yet for this {selectedDayIso ? "day" : "month"}.
            </p>
          ) : (
            <ul className="space-y-1 text-xs">
              {upcomingReminders.map((item) => {
                const date = fromIso(item.dayIso);
                const timeLabel = `${item.hour.toString().padStart(2, "0")}:00`;
                return (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate text-slate-800 dark:text-slate-100">{item.message}</span>
                    <span className="whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                      {formatDay(date)} 
                      
                      {timeLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {monthNotes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300/80 p-3 text-sm text-slate-600 dark:border-slate-707 dark:text-slate-300">
              No range memos yet.
            </p>
          ) : (
            monthNotes.map((note) => {
              const start = formatDay(fromIso(note.start));
              const end = note.end && note.end !== note.start ? formatDay(fromIso(note.end)) : null;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => {
                    setRange({ start: note.start, end: note.end });
                    setSelectedDayIso(note.start);
                    setRangeEditorNoteId(note.id);
                    setRangeNoteEditorOpen(true);
                  }}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/90 p-2 text-left text-xs transition hover:bg-slate-100 dark:border-slate-707 dark:bg-slate-950/70 dark:hover:bg-slate-900"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{note.text}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {start}
                    {end ? ` – ${end}` : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
