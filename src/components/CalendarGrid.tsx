import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCalendar } from "../context/CalendarContext";
import { formatDay, getWeekNumber, rangeGradientClass, tagColorClasses, WEEK_DAYS } from "../utils/calendar";

interface CalendarGridProps {
  invalidPulse: boolean;
}

export function CalendarGrid({ invalidPulse }: CalendarGridProps) {
  const {
    theme,
    grid,
    weekNumbers,
    viewMode,
    monthMemoKey,
    direction,
    effectiveRange,
    notesForDay,
    dayMoods,
    beginInlineEdit,
    editingNoteId,
    editingText,
    setEditingText,
    saveInlineEdit,
    updateRangeForDayClick,
    reminders,
    todayIso,
    selectedDayIso,
  } = useCalendar();

  const [tooltipIso, setTooltipIso] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const showWeekNumbers = viewMode === "month" && weekNumbers;

  let displayGrid = grid;
  const targetIso = selectedDayIso || todayIso;

  if (viewMode === "week") {
    const weekForTarget = grid.find((weekRow) => weekRow.some((cell) => cell.iso === targetIso));
    if (weekForTarget) {
      displayGrid = [weekForTarget];
    }
  } else if (viewMode === "day") {
    const flat = grid.flat();
    const cellForTarget = flat.find((cell) => cell.iso === targetIso) ?? flat[0];
    displayGrid = [[cellForTarget]];
  }

  const firstRow = displayGrid[0] ?? [];
  const firstCell = firstRow[0] ?? null;
  let headerTitle = "Month overview";
  let headerSubtitle = "Scan the whole month and pick longer ranges.";
  let headerWeekNumber: number | null = null;

  if (viewMode === "week" && firstCell) {
    const weekStart = firstRow[0]?.date ?? firstCell.date;
    const weekEnd = firstRow[firstRow.length - 1]?.date ?? firstCell.date;
    headerTitle = "Weekly focus";
    headerSubtitle = `${formatDay(weekStart)} – ${formatDay(weekEnd)}`;
    headerWeekNumber = getWeekNumber(weekStart);
  } else if (viewMode === "day" && firstCell) {
    headerTitle = "Day snapshot";
    headerSubtitle = formatDay(firstCell.date);
  }

  return (
    <motion.section className="rounded-3xl border border-slate-300/40 bg-white/85 p-3 shadow-lg dark:border-slate-707/60 dark:bg-slate-900/90 md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 md:mb-4">
        <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-300">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {headerTitle}
          </span>
          <span>{headerSubtitle}</span>
        </div>
        {viewMode === "week" && headerWeekNumber !== null ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Week {headerWeekNumber}
          </span>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthMemoKey}
          initial={{ opacity: 0, x: direction > 0 ? 38 : -38 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -38 : 38 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={invalidPulse ? "animate-shake-soft" : ""}
        >
          <div
            className={[
              "mb-2 grid gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300",
              showWeekNumbers ? "grid-cols-[40px_repeat(7,minmax(0,1fr))]" : "grid-cols-7",
            ].join(" ")}
          >
            {showWeekNumbers ? <span>Wk</span> : null}
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid gap-1.5">
            {displayGrid.map((week, weekIndex) => (
              <div
                key={`${monthMemoKey}-w${weekIndex}`}
                className={[
                  "grid gap-1.5",
                  showWeekNumbers ? "grid-cols-[40px_repeat(7,minmax(0,1fr))]" : "grid-cols-7",
                ].join(" ")}
              >
                {showWeekNumbers ? (
                  <div className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500">
                    {getWeekNumber(week[0].date)}
                  </div>
                ) : null}

                {week.map((cell, dayIndex) => {
                  const isWeekend = dayIndex >= 5;
                  const isStart = effectiveRange.start === cell.iso;
                  const isEnd = effectiveRange.end === cell.iso && !!effectiveRange.end;
                  const between = effectiveRange.start && effectiveRange.end
                    ? cell.iso > effectiveRange.start && cell.iso < effectiveRange.end
                    : false;
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

                  const dayReminders = reminders.filter((item) => item.dayIso === cell.iso);
                  const dayNotes = taggedNotes.filter((note) => !note.id.startsWith("reminder-note-"));

                  const handleMouseEnter = () => {
                    if (hoverTimeoutRef.current !== null) {
                      window.clearTimeout(hoverTimeoutRef.current);
                    }
                    hoverTimeoutRef.current = window.setTimeout(() => {
                      setTooltipIso(cell.iso);
                    }, 750);
                  };

                  const handleMouseLeave = () => {
                    if (hoverTimeoutRef.current !== null) {
                      window.clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    setTooltipIso((current) => (current === cell.iso ? null : current));
                  };

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => updateRangeForDayClick(cell.iso)}
                      aria-label={`Select ${formatDay(cell.date)}`}
                      className={[
                        "calendar-day group min-h-14 rounded-2xl border p-1.5 text-left shadow-sm transition md:min-h-[96px] md:p-2.5",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
                        cell.inMonth ? "opacity-100" : "opacity-45",
                        theme === "dark" ? "border-slate-700/65 bg-slate-900/80" : "border-slate-200/85 bg-white/90",
                        isWeekend ? "ring-1 ring-sky-400/20" : "",
                        viewMode === "week" ? "md:min-h-[120px]" : "",
                        viewMode === "day" ? "min-h-24 md:min-h-[150px]" : "",
                        between ? rangeGradientClass() : "",
                        isStart
                          ? "ring-2 ring-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                          : "",
                        isEnd
                          ? "ring-2 ring-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.25)]"
                          : "",
                        energyClass,
                      ].join(" ")}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
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
                          {mood === "low" ? <span className="h-2 w-2 rounded-full bg-rose-400" /> : null}
                          {mood === "ok" ? <span className="h-2 w-2 rounded-full bg-amber-400" /> : null}
                          {mood === "high" ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                          {cell.isToday ? (
                            <span className="h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-400/45 pulse-dot" />
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {(viewMode === "day" ? taggedNotes : taggedNotes.slice(0, 2)).map((note) => (
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

                      {viewMode === "week" ? (
                        <div className="mt-1 text-[9px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>
                            {noteCount ? `${noteCount} note${noteCount > 1 ? "s" : ""}` : "No notes"}
                          </span>
                          <span>
                            {dayReminders.length
                              ? `${dayReminders.length} reminder${dayReminders.length > 1 ? "s" : ""}`
                              : "No reminders"}
                          </span>
                        </div>
                      ) : null}

                      {tooltipIso === cell.iso ? (
                        <div className="pointer-events-none absolute inset-x-1 bottom-1 z-20 rounded-lg border border-slate-800/80 bg-slate-900/95 px-2 py-1.5 text-[10px] text-slate-50 shadow-xl dark:border-slate-700/80">
                          <p className="mb-1 font-semibold">{formatDay(cell.date)}</p>
                          {dayReminders.length > 0 ? (
                            <ul className="space-y-0.5">
                              {dayReminders.map((item) => (
                                <li key={item.id}>
                                  <span className="font-mono text-[9px]">
                                    {item.hour.toString().padStart(2, "0")}:00
                                  </span>{" "}
                                  – <span>{item.message}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[9px] text-slate-300">No timed reminders for this day.</p>
                          )}
                          {dayNotes.length > 0 ? (
                            <div className="mt-1 border-t border-slate-800/70 pt-1">
                              <p className="mb-0.5 text-[9px] uppercase tracking-[0.14em] text-slate-400">
                                All-day notes
                              </p>
                              <ul className="space-y-0.5">
                                {dayNotes.map((note) => (
                                  <li key={note.id} className="truncate">
                                    • {note.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

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
                                if (editingNoteId) {
                                  saveInlineEdit(editingNoteId);
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="rounded bg-slate-500 px-2 py-1 text-[10px] font-semibold text-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                // cancel just stops editing; selected day remains
                                setEditingText(editingText);
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
    </motion.section>
  );
}
