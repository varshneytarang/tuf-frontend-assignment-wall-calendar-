import { motion, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef, useState } from "react";
import { useCalendar } from "../context/CalendarContext";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarHero } from "./CalendarHero";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarSidebar } from "./CalendarSidebar";
import { DayDetailPanel } from "./DayDetailPanel";
import { DayViewCard } from "./DayViewCard";
import { RangeNoteModal } from "./RangeNoteModal";
import { LeftSidebar } from "./LeftSidebar";
import { CalendarModeToggleBar } from "./CalendarModeToggleBar";

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
        <LeftSidebar isDark={isDark} />

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
            <CalendarModeToggleBar
              viewMode={viewMode}
              setViewMode={setViewMode}
              isDark={isDark}
            />
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
      <RangeNoteModal />
    </div>
  );
}
