import type { Dispatch, SetStateAction } from "react";

interface CalendarModeToggleBarProps {
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<any>>;
  isDark: boolean;
}

export function CalendarModeToggleBar({ viewMode, setViewMode, isDark }: CalendarModeToggleBarProps) {
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={[
        "mt-3 flex flex-wrap items-center justify-between gap-2 text-xs",
        isDark ? "text-slate-400" : "text-slate-500",
      ].join(" ")}
    >
      <p
        className={[
          "rounded-full px-3 py-1 font-medium",
          isDark ? "bg-slate-900/80 text-slate-100" : "bg-slate-100 text-slate-800",
        ].join(" ")}
      >
        Today · {todayLabel}
      </p>
      <div
        className={[
          "flex items-center gap-1 rounded-full p-1",
          isDark ? "bg-slate-900/80" : "bg-slate-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setViewMode("month")}
          className={[
            "rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm",
            viewMode === "month"
              ? isDark
                ? "bg-slate-800 text-slate-50"
                : "bg-slate-900 text-slate-50"
              : isDark
                ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-50"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
          ].join(" ")}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => setViewMode("week")}
          className={[
            "rounded-full px-3 py-1 text-[11px] font-medium",
            viewMode === "week"
              ? isDark
                ? "bg-slate-800 text-slate-50"
                : "bg-slate-900 text-slate-50"
              : isDark
                ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-50"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
          ].join(" ")}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => setViewMode("day")}
          className={[
            "rounded-full px-3 py-1 text-[11px] font-medium",
            viewMode === "day"
              ? isDark
                ? "bg-slate-800 text-slate-50"
                : "bg-slate-900 text-slate-50"
              : isDark
                ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-50"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
          ].join(" ")}
        >
          Day
        </button>
        <button
          type="button"
          className={[
            "rounded-full px-3 py-1 text-[11px] font-medium",
            isDark
              ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-50"
              : "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
          ].join(" ")}
        >
          List
        </button>
      </div>
    </div>
  );
}
