import { useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { formatMonth } from "../utils/calendar";

export function CalendarHeader() {
  const { theme, setTheme, viewMonth } = useCalendar();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
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
      </div>
    </header>
  );
}
