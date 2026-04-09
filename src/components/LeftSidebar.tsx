import { useCalendar } from "../context/CalendarContext";

interface LeftSidebarProps {
  isDark: boolean;
}

export function LeftSidebar({ isDark }: LeftSidebarProps) {
  // Calendar context is available if we later want to show user-specific stats
  useCalendar();

  return (
    <aside
      className={[
        "hidden h-full w-56 flex-col justify-between border-r px-4 py-5 sm:flex",
        isDark
          ? "border-slate-800/80 bg-slate-950/95 text-slate-50"
          : "border-slate-200/80 bg-slate-50/95 text-slate-900",
      ].join(" ")}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 text-lg font-bold text-slate-950">
            W
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Calendar</p>
            <p className="text-sm font-semibold">Studio Board</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <button
            type="button"
            className={[
              "flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold shadow-sm",
              isDark
                ? "bg-slate-900/80 text-slate-50 ring-1 ring-sky-500/40"
                : "bg-slate-100 text-slate-900 ring-1 ring-sky-500/30",
            ].join(" ")}
          >
            <span>Calendar</span>
            <span className="text-[11px] text-sky-400">Live</span>
          </button>
        </nav>
      </div>

      <div
        className={[
          "mt-6 rounded-2xl border p-3 text-xs",
          isDark
            ? "border-slate-800/90 bg-slate-900/80 text-slate-50"
            : "border-slate-200/90 bg-white/90 text-slate-900",
        ].join(" ")}
      >
        <p className="text-[11px] font-semibold text-slate-400">Today&apos;s focus</p>
        <p className="mt-1 text-sm font-medium">Plan your month and key ranges.</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400" />
            <div>
              <p className="text-xs font-semibold">You</p>
              <p className="text-[10px] text-slate-400">Product designer</p>
            </div>
          </div>
          <span
            className={[
              "rounded-full px-2 py-1 text-[10px] font-semibold",
              isDark ? "bg-slate-800 text-emerald-300" : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
