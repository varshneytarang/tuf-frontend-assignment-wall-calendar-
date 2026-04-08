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