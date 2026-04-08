import { motion, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef, useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarHero } from "./CalendarHero";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarSidebar } from "./CalendarSidebar";
import { DayDetailPanel } from "./DayDetailPanel";
import { DayViewCard } from "./DayViewCard";

export function WallCalendarTailwind() {
  const {
    theme,
    updateMonth,
    updateWeek,
    updateDay,
    viewMode,
    setViewMode,
    backgroundClass,
    particleNodes,
    particleType,
    getRangeLabel,
    rangeLength,
    clearRange,
  } = useCalendar();

  const [invalidPulse, setInvalidPulse] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 18, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 18, mass: 0.6 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  function triggerInvalidPulse() {
    setInvalidPulse(true);
    window.setTimeout(() => setInvalidPulse(false), 350);
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    mouseX.set(x * 0.06);
    mouseY.set(y * 0.06);
  }

  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={[
        "relative min-h-screen w-full px-3 py-4 md:px-6 md:py-6 lg:px-10 overflow-hidden",
        "transition-colors duration-700",
        backgroundClass,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="pointer-events-none absolute -left-40 top-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-400/40 via-emerald-300/40 to-fuchsia-400/40 blur-3xl"
          style={{ translateX: smoothX, translateY: smoothY }}
        />
        <div className="aurora-orb aurora-orb-top" />
        <div className="aurora-orb aurora-orb-bottom" />
        {particleNodes.map((particle) => (
          <span
            key={particle.id}
            className={`particle particle-${particleType}`}
            style={{
              left: particle.left,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration + 4}s`,
              width: particle.size,
              height: particle.size,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        className={[
          "flex h-full w-full overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl",
          isDark
            ? "border-slate-800/80 bg-slate-950/85 text-slate-50"
            : "border-slate-200/80 bg-white/95 text-slate-900",
        ].join(" ")}
      >
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
              <button
                type="button"
                className={[
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium",
                  isDark
                    ? "text-slate-400 hover:bg-slate-900/60 hover:text-slate-50"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <span>Tasks</span>
                <span
                  className={[
                    "text-[10px] rounded-full px-2 py-0.5",
                    isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  Soon
                </span>
              </button>
              <button
                type="button"
                className={[
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium",
                  isDark
                    ? "text-slate-400 hover:bg-slate-900/60 hover:text-slate-50"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <span>Analytics</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>
              <button
                type="button"
                className={[
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium",
                  isDark
                    ? "text-slate-400 hover:bg-slate-900/60 hover:text-slate-50"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <span>Settings</span>
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

        <div
          className={[
            "flex min-h-[520px] flex-1 flex-col",
            isDark
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
              : "bg-gradient-to-br from-slate-50 via-white to-slate-100",
          ].join(" ")}
        >
          <div
            className={[
              "px-4 pt-4 pb-3 md:px-6 border-b",
              isDark ? "border-slate-800/80" : "border-slate-200/80",
            ].join(" ")}
          >
            <CalendarHeader />
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
                Today · {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
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
          </div>

          <div className="flex-1 gap-4 px-4 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <CalendarHero />

              <div
                className={[
                  "rounded-2xl border p-3 shadow-lg md:p-4",
                  isDark
                    ? "border-slate-800/80 bg-slate-950/70"
                    : "border-slate-200/80 bg-white/90",
                ].join(" ")}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 md:mb-4">
                  <div
                    className={[
                      "flex items-center gap-2 text-sm font-semibold",
                      isDark ? "text-slate-100" : "text-slate-900",
                    ].join(" ")}
                  >
                    <motion.button
                      className={[
                        "rounded-full border px-3 py-2 text-sm font-semibold shadow-sm",
                        isDark
                          ? "border-sky-500/50 bg-slate-950/80 text-sky-200 hover:bg-slate-900"
                          : "border-sky-300 bg-white text-sky-700 hover:bg-sky-50",
                      ].join(" ")}
                      type="button"
                      onClick={() => {
                        if (viewMode === "week") updateWeek(-1);
                        else if (viewMode === "day") updateDay(-1);
                        else updateMonth(-1);
                      }}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      ◀ Prev
                    </motion.button>
                    <motion.button
                      className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400"
                      type="button"
                      onClick={() => {
                        if (viewMode === "week") updateWeek(1);
                        else if (viewMode === "day") updateDay(1);
                        else updateMonth(1);
                      }}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      Next ▶
                    </motion.button>
                  </div>

                  {viewMode !== "day" ? (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
                      <span
                        className={[
                          "rounded-full px-2 py-1",
                          isDark
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        Start
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-1",
                          isDark ? "bg-rose-500/15 text-rose-300" : "bg-rose-50 text-rose-700",
                        ].join(" ")}
                      >
                        End
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-1",
                          isDark ? "bg-sky-500/15 text-sky-300" : "bg-sky-50 text-sky-700",
                        ].join(" ")}
                      >
                        In range
                      </span>
                      <button
                        className={[
                          "rounded-full border px-3 py-1 text-[11px] font-semibold",
                          isDark
                            ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                        onClick={clearRange}
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                </div>
                {viewMode === "day" ? (
                  <DayViewCard />
                ) : (
                  <>
                    <CalendarGrid invalidPulse={invalidPulse} />
                    <div
                      className={[
                        "mt-3 rounded-xl border px-3 py-2 text-xs md:text-sm",
                        isDark
                          ? "border-slate-800/80 bg-slate-900/80 text-slate-100"
                          : "border-slate-200/80 bg-slate-50 text-slate-800",
                      ].join(" ")}
                    >
                      {getRangeLabel()} {rangeLength > 0 ? `(${rangeLength} days)` : ""}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 xl:hidden">
                {viewMode === "day" ? (
                  <DayDetailPanel />
                ) : (
                  <CalendarSidebar triggerInvalidPulse={triggerInvalidPulse} />
                )}
              </div>
            </div>

            <div className="mt-4 xl:mt-0">
              {viewMode === "day" ? (
                <DayDetailPanel />
              ) : (
                <div className="hidden xl:block">
                  <CalendarSidebar triggerInvalidPulse={triggerInvalidPulse} />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
