import { useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { Mood } from "../types/calendar";
import { formatDay, fromIso, tagColorClasses } from "../utils/calendar";

export function DayDetailPanel() {
  const {
    selectedDayIso,
    setSelectedDayIso,
    dayMoods,
    setDayMoods,
    notesForDay,
    theme,
    dayEventHours,
    setDayEventHours,
    createReminder,
  } = useCalendar();

  const selectedDayNotes = selectedDayIso ? notesForDay(selectedDayIso) : [];

  function setMoodForSelectedDay(mood: Mood) {
    if (!selectedDayIso) return;
    setDayMoods((current) => ({ ...current, [selectedDayIso]: mood }));
  }

  const hours = Array.from({ length: 14 }, (_, index) => 8 + index); // 8:00–21:00
  const isDark = theme === "dark";
  const selectedHour = selectedDayIso ? dayEventHours[selectedDayIso] ?? null : null;
  const [reminderText, setReminderText] = useState("");
  const canCreateReminder = Boolean(
    selectedDayIso && selectedHour !== null && reminderText.trim().length > 0,
  );

  return (
    <div
      className={[
        "rounded-2xl border p-4 text-xs shadow-lg",
        isDark
          ? "border-slate-800/80 bg-slate-950/80 text-slate-200"
          : "border-slate-200/80 bg-white/95 text-slate-800",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Day timeline</p>
          {selectedDayIso ? (
            <p className="text-sm font-semibold">
              {formatDay(fromIso(selectedDayIso))}
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-500">Select a day in the grid</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSelectedDayIso(null)}
          className={[
            "rounded-full border px-2 py-1 text-[11px] font-semibold",
            isDark
              ? "border-slate-700 text-slate-200 hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-100",
          ].join(" ")}
        >
          Close
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2 text-[11px]">
        <span className="text-slate-400">Mood:</span>
        <button
          type="button"
          disabled={!selectedDayIso}
          className={`rounded-full px-2 py-1 ${
            selectedDayIso && dayMoods[selectedDayIso] === "low"
              ? "bg-rose-500 text-white"
              : isDark
                ? "bg-rose-500/15 text-rose-300"
                : "bg-rose-50 text-rose-700"
          } ${selectedDayIso ? "" : "opacity-60 cursor-not-allowed"}`}
          onClick={() => setMoodForSelectedDay("low")}
        >
          Low
        </button>
        <button
          type="button"
          disabled={!selectedDayIso}
          className={`rounded-full px-2 py-1 ${
            selectedDayIso && dayMoods[selectedDayIso] === "ok"
              ? "bg-amber-500 text-white"
              : isDark
                ? "bg-amber-400/15 text-amber-200"
                : "bg-amber-50 text-amber-800"
          } ${selectedDayIso ? "" : "opacity-60 cursor-not-allowed"}`}
          onClick={() => setMoodForSelectedDay("ok")}
        >
          Okay
        </button>
        <button
          type="button"
          disabled={!selectedDayIso}
          className={`rounded-full px-2 py-1 ${
            selectedDayIso && dayMoods[selectedDayIso] === "high"
              ? "bg-emerald-500 text-white"
              : isDark
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-emerald-50 text-emerald-800"
          } ${selectedDayIso ? "" : "opacity-60 cursor-not-allowed"}`}
          onClick={() => setMoodForSelectedDay("high")}
        >
          High
        </button>
      </div>

      <div
        className={[
          "mt-1 flex-1 overflow-auto rounded-xl border p-3",
          isDark
            ? "border-slate-800/80 bg-slate-950/70"
            : "border-slate-200/80 bg-slate-50",
        ].join(" ")}
      >
        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Schedule</span>
          <span>
            {!selectedDayIso
              ? "Pick a day to schedule"
              : selectedDayNotes.length
                ? selectedHour !== null
                  ? `1 event at ${selectedHour.toString().padStart(2, "0")}:00`
                  : `${selectedDayNotes.length} note${selectedDayNotes.length > 1 ? "s" : ""}`
                : "No notes for this day"}
          </span>
        </div>

        <div className="mb-3 flex flex-col gap-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Reminder</span>
            <span className="text-slate-500">
              {selectedDayIso && selectedHour !== null
                ? `${selectedHour.toString().padStart(2, "0")}:00`
                : "Pick a day and hour"}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={reminderText}
              onChange={(event) => setReminderText(event.target.value)}
              placeholder="Reminder text"
              className="flex-1 rounded-lg border border-slate-300/80 bg-white/90 px-2 py-1 text-[11px] outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950/80"
            />
            <button
              type="button"
              disabled={!canCreateReminder}
              onClick={() => {
                if (!selectedDayIso || selectedHour === null || !reminderText.trim()) return;
                createReminder(selectedDayIso, selectedHour, reminderText.trim());
                setReminderText("");
              }}
              className={[
                "rounded-lg px-3 py-1 text-[11px] font-semibold",
                canCreateReminder
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "bg-slate-400/40 text-slate-200 cursor-not-allowed",
              ].join(" ")}
            >
              Set
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {hours.map((hour) => {
            const label = `${hour.toString().padStart(2, "0")}:00`;
            const isActiveSlot = selectedHour === hour;
            const primaryNote = selectedDayNotes[0];
            const note = isActiveSlot && primaryNote ? primaryNote : undefined;

            return (
              <button
                key={hour}
                type="button"
                disabled={!selectedDayIso || !primaryNote}
                onClick={() => {
                  if (!selectedDayIso || !primaryNote) return;
                  setDayEventHours((current) => ({ ...current, [selectedDayIso]: hour }));
                }}
                className="flex w-full items-center gap-2 text-left"
              >
                <span className="w-12 text-[10px] text-slate-500">{label}</span>
                <div className="relative flex-1">
                  <div
                    className={[
                      "h-8 rounded-lg border border-dashed transition-colors",
                      isActiveSlot
                        ? isDark
                          ? "border-sky-400/70 bg-slate-900/80"
                          : "border-sky-400/70 bg-sky-50"
                        : isDark
                        ? "border-slate-800/80 bg-slate-950/60"
                        : "border-slate-200/80 bg-white/80",
                    ].join(" ")}
                  />
                  {note ? (
                    <div
                      className={`absolute inset-y-[2px] left-[2px] right-[2px] flex items-center gap-2 rounded-md px-2 text-[11px] shadow-sm ${tagColorClasses(note.color)}`}
                    >
                      <div
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                          isDark ? "bg-slate-950/30" : "bg-slate-900/5",
                        ].join(" ")}
                      >
                        {note.text.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="truncate font-semibold">{note.text}</p>
                        <p className="text-[10px] opacity-80">Scheduled · Attached range</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
