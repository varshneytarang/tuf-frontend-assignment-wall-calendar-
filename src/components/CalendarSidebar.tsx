import { useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { TagColor } from "../types/calendar";
import { formatDay, fromIso, tagColorClasses } from "../utils/calendar";

interface CalendarSidebarProps {
  triggerInvalidPulse: () => void;
}

export function CalendarSidebar({ triggerInvalidPulse }: CalendarSidebarProps) {
  const {
    selectedDayIso,
    range,
    memoText,
    setMemoByMonth,
    monthMemoKey,
    noteDraft,
    setNoteDraft,
    noteColor,
    setNoteColor,
    weekNumbers,
    setWeekNumbers,
    highContrast,
    setHighContrast,
    monthNotes,
    setNotes,
    attachDraftToRange,
    downloadIcs,
    createReminder,
    reminders,
  } = useCalendar();

  const [notesOpen, setNotesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderText, setReminderText] = useState("");
  const [reminderStatus, setReminderStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | { type: "warning"; message: string }
    | null
  >(null);

  const canSetReminder = Boolean(selectedDayIso && reminderText.trim().length > 0);

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

        <label className="mt-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Reminder for selected day
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              className="h-9 rounded-xl border border-slate-300/80 bg-white/90 px-2 text-xs outline-none focus:border-sky-500 dark:border-slate-707 dark:bg-slate-950/80"
            />
            <input
              type="text"
              value={reminderText}
              onChange={(event) => setReminderText(event.target.value)}
              placeholder="Reminder message"
              className="h-9 flex-1 rounded-xl border border-slate-300/80 bg-white/90 px-3 text-xs outline-none focus:border-sky-500 dark:border-slate-707 dark:bg-slate-950/80"
            />
            <button
              type="button"
              disabled={!canSetReminder}
              onClick={() => {
                const trimmed = reminderText.trim();
                if (!selectedDayIso) {
                  setReminderStatus({
                    type: "warning",
                    message: "Select a day in the calendar before setting a reminder.",
                  });
                  return;
                }
                if (!trimmed) {
                  setReminderStatus({ type: "warning", message: "Type a reminder message first." });
                  return;
                }

                if (range.start && range.end && range.start !== range.end) {
                  setReminderStatus({
                    type: "warning",
                    message: "Reminders can only be set for a single day, not an entire range.",
                  });
                  return;
                }

                const [hours] = reminderTime.split(":");
                const hour = Number.parseInt(hours, 10);
                if (Number.isNaN(hour) || hour < 0 || hour > 23) {
                  setReminderStatus({ type: "error", message: "Invalid time. Choose an hour between 00 and 23." });
                  return;
                }

                const dayDate = fromIso(selectedDayIso);
                dayDate.setHours(hour, 0, 0, 0);
                const diff = dayDate.getTime() - Date.now();
                if (diff <= 0) {
                  setReminderStatus({
                    type: "error",
                    message: "You can only set reminders for the current or future time.",
                  });
                  return;
                } else {
                  setReminderStatus({
                    type: "success",
                    message: `Reminder set for ${formatDay(dayDate)} at ${hour.toString().padStart(2, "0")}:00`,
                  });
                }

                try {
                  createReminder(selectedDayIso, hour, trimmed);
                  setReminderText("");
                } catch (error) {
                  setReminderStatus({
                    type: "error",
                    message: "Something went wrong while creating the reminder.",
                  });
                  // eslint-disable-next-line no-console
                  console.error(error);
                }
              }}
              className={[
                "rounded-xl px-3 py-2 text-xs font-semibold",
                canSetReminder
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400",
              ].join(" ")}
            >
              Set
            </button>
          </div>
          <p className="mt-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Click a day in the calendar, choose a time and message, then hit Set.
          </p>
          {reminderStatus ? (
            <p
              className={[
                "mt-1 text-[11px]",
                reminderStatus.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : reminderStatus.type === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400",
              ].join(" ")}
            >
              {reminderStatus.message}
            </p>
          ) : null}
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
            onClick={() => {
              if (!noteDraft.trim()) {
                triggerInvalidPulse();
                return;
              }
              attachDraftToRange(triggerInvalidPulse);
            }}
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
                      {formatDay(date)} · {timeLabel}
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

      <button
        className="mt-3 hidden w-full items-center justify-between rounded-xl border border-slate-300/70 px-3 py-2 text-sm font-semibold dark:border-slate-707 lg:hidden"
        onClick={() => setSettingsOpen((curr) => !curr)}
        type="button"
      >
        <span>Mobile quick settings</span>
        <span>{settingsOpen ? "Hide" : "Show"}</span>
      </button>
    </aside>
  );
}
