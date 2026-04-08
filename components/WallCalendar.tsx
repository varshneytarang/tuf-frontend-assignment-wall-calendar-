"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  buildMonthGrid,
  formatMonthKey,
  formatMonthShort,
  formatMonthTitle,
  formatReadableDate,
  getRangeLabel,
  getRangeLength,
  isDateInRange,
  isRangeEnd,
  isRangeStart,
  type CalendarRange,
  type CalendarCell,
} from "../lib/calendar";

type PersistedState = {
  monthKey: string;
  range: CalendarRange;
  notes: Record<string, string>;
};

const STORAGE_KEY = "wall-calendar-state-v1";
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthFromKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getScopeKey(monthKey: string, range: CalendarRange) {
  if (range.start && range.end) {
    return `range:${range.start}_${range.end}`;
  }

  return `month:${monthKey}`;
}

function safeStorageRead() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function WallCalendar() {
  const initialMonth = new Date();
  const [mounted, setMounted] = useState(false);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [range, setRange] = useState<CalendarRange>({ start: null, end: null });
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = safeStorageRead();

    if (stored) {
      setViewMonth(getMonthFromKey(stored.monthKey));
      setRange(stored.range);
      setNotes(stored.notes);
    }

    setMounted(true);
  }, []);

  const monthKey = formatMonthKey(viewMonth);
  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const activeScopeKey = getScopeKey(monthKey, range);
  const activeNote = notes[activeScopeKey] ?? "";
  const noteCount = Object.values(notes).filter((value) => value.trim().length > 0).length;
  const selectedDays = getRangeLength(range);
  const today = new Date();
  const monthLabel = formatMonthShort(viewMonth).toUpperCase();
  const isCurrentMonth = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();
  const rangeActive = Boolean(range.start && range.end);
  const monthStatus = isCurrentMonth ? "Live month" : "Archived view";

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const payload: PersistedState = {
      monthKey,
      range,
      notes,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [mounted, monthKey, notes, range]);

  function updateMonth(offset: number) {
    setViewMonth((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + offset, 1);
      return next;
    });

    setRange({ start: null, end: null });
  }

  function handleDaySelect(iso: string) {
    setRange((current: CalendarRange) => {
      if (!current.start || (current.start && current.end)) {
        return { start: iso, end: null };
      }

      if (iso < current.start) {
        return { start: iso, end: current.start };
      }

      if (iso === current.start) {
        return { start: iso, end: null };
      }

      return { start: current.start, end: iso };
    });
  }

  function clearRange() {
    setRange({ start: null, end: null });
  }

  function jumpToToday() {
    const now = new Date();
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setRange({ start: null, end: null });
  }

  function handleNoteChange(value: string) {
    setNotes((current) => {
      const nextNotes = { ...current };

      if (value.trim().length === 0) {
        delete nextNotes[activeScopeKey];
      } else {
        nextNotes[activeScopeKey] = value;
      }

      return nextNotes;
    });
  }

  const heroLabel = formatReadableDate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1));

  return (
    <section className="calendar-app" aria-label="Interactive wall calendar">
      <div className="calendar-stage">
        <div className="calendar-shadow" aria-hidden="true" />

        <div className={`calendar-frame${mounted ? " calendar-frame--loaded" : ""}`}>
          <div className="calendar-hanger" aria-hidden="true">
            <span className="hanger-ring" />
            <span className="hanger-wire" />
            <span className="calendar-punches">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} />
              ))}
            </span>
          </div>

          <div className="calendar-topbar">
            <div className="calendar-topbar__left">
              <span className="topbar-chip">{monthLabel}</span>
              <span className="topbar-chip topbar-chip--muted">{monthStatus}</span>
            </div>

            <div className="calendar-topbar__right">
              <button type="button" className="text-button" onClick={jumpToToday}>
                Jump to today
              </button>
              <button type="button" className="ghost-button" onClick={clearRange} disabled={!range.start && !range.end}>
                Clear range
              </button>
            </div>
          </div>

          <header className="calendar-hero">
            <div className="calendar-hero__photo" aria-hidden="true">
              <img src="/hero-calendar.svg" alt="" />
              <div className="calendar-hero__rings" />
              <div className="hero-accents" />
              <div className="hero-overlay">
                <span>Studio edition</span>
                <strong>Wall planner</strong>
              </div>
            </div>

            <div className="calendar-hero__copy">
              <p className="eyebrow">Monthly planner</p>
              <h1>{formatMonthTitle(viewMonth)}</h1>
              <div className="hero-stamp" aria-label="Current month badge">
                <span>{viewMonth.getFullYear()}</span>
                <strong>{monthLabel}</strong>
              </div>
              <p className="hero-text">
                A refined wall-calendar layout with range selection, quiet notes, and responsive controls.
              </p>

              <div className="hero-meta">
                <span>{heroLabel}</span>
                <span>{selectedDays ? `${selectedDays} day range` : "No active range"}</span>
                <span>{noteCount} note{noteCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </header>

          <div className="calendar-body">
            <aside className="notes-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">Notes</p>
                  <h2>{range.start && range.end ? "Selected range note" : "Month memo"}</h2>
                </div>

                <span className="status-pill status-pill--accent">{rangeActive ? "Range active" : "Memo mode"}</span>
              </div>

              <div className="note-summary">
                <span>{getRangeLabel(range)}</span>
                <span>{noteCount} saved note{noteCount === 1 ? "" : "s"}</span>
              </div>

              <label className="note-editor">
                <span>
                  {range.start && range.end ? "Add a note for this selected range" : `Add a note for ${formatMonthShort(viewMonth)} ${viewMonth.getFullYear()}`}
                </span>
                <textarea
                  value={activeNote}
                  onChange={(event) => handleNoteChange(event.target.value)}
                  placeholder="Write a reminder, task, or monthly memo..."
                  rows={10}
                />
              </label>

              <div className="note-metrics">
                <div>
                  <strong>{selectedDays || 0}</strong>
                  <span>days selected</span>
                </div>
                <div>
                  <strong>{range.start ? 1 : 0}</strong>
                  <span>start set</span>
                </div>
                <div>
                  <strong>{range.end ? 1 : 0}</strong>
                  <span>end set</span>
                </div>
              </div>

              <div className="note-footnote">
                Notes persist in local storage and automatically switch between the month memo and the active date range.
              </div>
            </aside>

            <section className="calendar-panel">
              <div className="calendar-toolbar">
                <div>
                  <p className="panel-kicker">Calendar</p>
                  <h2>{formatMonthTitle(viewMonth)}</h2>
                </div>

                <div className="month-controls" role="group" aria-label="Month navigation">
                  <button type="button" className="icon-button" onClick={() => updateMonth(-1)} aria-label="Previous month">
                    ←
                  </button>
                  <button type="button" className="icon-button" onClick={() => updateMonth(1)} aria-label="Next month">
                    →
                  </button>
                </div>
              </div>

              <div className="calendar-legendbar">
                <span className="status-pill">{selectedDays ? `${selectedDays} day span` : "Select a start date"}</span>
                <span className="status-pill status-pill--soft">{formatReadableDate(today)}</span>
                <span className="status-pill status-pill--soft">{range.start && range.end ? getRangeLabel(range) : "Tap-to-select flow"}</span>
              </div>

              <div className="weekday-row" aria-hidden="true">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid" role="grid" aria-label={`${formatMonthTitle(viewMonth)} calendar`}>
                {grid.map((week: CalendarCell[], weekIndex: number) => (
                  <div className="calendar-week" key={`${monthKey}-${weekIndex}`} role="row">
                    {week.map((cell: CalendarCell, dayIndex: number) => {
                      const inRange = isDateInRange(cell.iso, range);
                      const start = isRangeStart(cell.iso, range);
                      const end = isRangeEnd(cell.iso, range);
                      const selected = start || end || inRange;
                      const isWeekend = dayIndex >= 5;

                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          className={[
                            "day-cell",
                            cell.inMonth ? "" : "day-cell--muted",
                            selected ? "day-cell--selected" : "",
                            inRange ? "day-cell--range" : "",
                            start ? "day-cell--start" : "",
                            end ? "day-cell--end" : "",
                            isWeekend ? "day-cell--weekend" : "",
                            cell.isToday ? "day-cell--today" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                            style={{ ["--cell-index" as string]: weekIndex * 7 + dayIndex } as CSSProperties}
                          onClick={() => handleDaySelect(cell.iso)}
                          aria-pressed={selected}
                          aria-label={formatReadableDate(cell.date)}
                        >
                          <span className="day-cell__number">{cell.date.getDate()}</span>
                          <span className="day-cell__caption">{cell.inMonth ? "" : "Out"}</span>
                          {cell.isToday ? <span className="day-cell__badge">Today</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="calendar-footer">
                <div className="legend">
                  <span><i className="legend-swatch legend-swatch--start" /> Start</span>
                  <span><i className="legend-swatch legend-swatch--range" /> Range</span>
                  <span><i className="legend-swatch legend-swatch--today" /> Today</span>
                </div>
                <p>
                  Tap a start date, then tap an end date. Selecting a new date after a full range resets the selection.
                </p>
              </div>
            </section>
          </div>

          <div className="paper-curl" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}