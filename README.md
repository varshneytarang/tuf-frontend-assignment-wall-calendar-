# Wall Calendar Component

An interactive React/Vite wall calendar inspired by the reference image. It focuses on a polished desktop layout, a responsive mobile stack, date-range selection, and local notes persistence.

## Features

- Wall-calendar aesthetic with a hero image panel and a structured date grid
- Tap or click to select a start date and end date
- Clear visual states for start, end, and in-range days
- Notes area that automatically switches between month memo and selected range note
- Local storage persistence for the month, selected range, and notes
- Responsive layout that collapses cleanly on mobile

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Implementation Notes

- The hero artwork is a local SVG so the project stays self-contained.
- Notes are stored client-side only; no backend or database is used.
- The component keeps the interaction model simple: pick a start date, then pick an end date, and select a new date to restart the range.

## Frontend Architecture & State Management

There are two layers to the calendar implementation:

1. **Headless calendar logic (lib/calendar.ts)**  
	Pure utility functions and types (`CalendarRange`, `CalendarCell`) that handle date math, grid generation, and range labelling. This module is framework-agnostic and used by the original wall calendar component under `components/WallCalendar.tsx`.

2. **Tailwind/Framer UI with shared state (src/)**  
	The more expressive version of the wall calendar lives under `src/` and is structured to keep view and state concerns separate:

	- **Types** – `src/types/calendar.ts` defines the domain model (theme, moods, notes, persisted state, day cells) so components share a single source of truth.
	- **Pure utilities** – `src/utils/calendar.ts` contains date/grid helpers, formatting, and visual helpers (range gradients, month backgrounds, hero image mapping). These are all side-effect free and easy to test.
	- **State layer (Context)** – `src/context/CalendarContext.tsx` owns global calendar state: current month, selected range, notes, per-month memos, day moods, view options, and derived values (grid, month notes, range label). It also encapsulates actions such as `updateMonth`, `updateRangeForDayClick`, `attachDraftToRange`, and `downloadIcs`. State is persisted to `localStorage` and the theme toggles the `dark` class on `<html>`.
	- **Presentation components** – `src/components/WallCalendarTailwind.tsx` composes smaller, focused components that consume the context via `useCalendar`:
	  - `CalendarHeader` – title, help tooltip, theme toggle.
	  - `CalendarHero` – seasonal hero image and month badge.
	  - `CalendarGrid` – the month grid, range selection, and inline note editing.
	  - `DayDetailPanel` – per-day mood and note summary for the selected date.
	  - `CalendarSidebar` – monthly memo, range note editor, options, and note list.

This separation keeps the core date logic reusable, the UI components thin and declarative, and the state management centralized and testable. The result is a design-focused calendar that is still easy to reason about and extend.