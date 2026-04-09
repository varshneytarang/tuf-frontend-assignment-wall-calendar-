import React, { createContext, useContext } from "react";
import type { CalendarContextValue } from "./calendarState";
import { useCalendarState } from "./calendarState";

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useCalendarState();
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return ctx;
}

// Calendar utilities are available from src/utils/calendar; this file only
// exposes React hooks/components so that React Fast Refresh stays compatible.
