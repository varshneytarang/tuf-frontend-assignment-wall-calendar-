import { DayCell, RangeState } from "../src/types/calendar";
import {
  buildMonthGrid as buildMonthGridCore,
  formatDay as formatReadableDateCore,
  formatMonth as formatMonthTitleCore,
  formatShort as formatMonthShortCore,
  fromIso as fromIsoCore,
  getRangeLabel as getRangeLabelCore,
  getRangeLength as getRangeLengthCore,
  isInRange as isInRangeCore,
  monthKey as monthKeyCore,
  startOfWeekMonday as startOfWeekMondayCore,
  toIso as toIsoCore,
} from "../src/utils/calendar";

export type CalendarRange = RangeState;
export type CalendarCell = DayCell;

export function startOfWeekMonday(date: Date): Date {
  return startOfWeekMondayCore(date);
}

export function toIsoDate(date: Date): string {
  return toIsoCore(date);
}

export function fromIsoDate(value: string): Date {
  return fromIsoCore(value);
}

export function isSameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isDateInRange(iso: string, range: CalendarRange): boolean {
  return isInRangeCore(iso, range);
}

export function isRangeStart(iso: string, range: CalendarRange): boolean {
  return range.start === iso;
}

export function isRangeEnd(iso: string, range: CalendarRange): boolean {
  return !!range.end && range.end === iso;
}

export function getRangeLabel(range: CalendarRange): string {
  return getRangeLabelCore(range);
}

export function getRangeLength(range: CalendarRange): number {
  return getRangeLengthCore(range);
}

export function formatMonthTitle(date: Date): string {
  return formatMonthTitleCore(date);
}

export function formatMonthShort(date: Date): string {
  return formatMonthShortCore(date);
}

export function formatReadableDate(date: Date): string {
  return formatReadableDateCore(date);
}

export function formatMonthKey(date: Date): string {
  return monthKeyCore(date);
}

export function buildMonthGrid(viewDate: Date): CalendarCell[][] {
  return buildMonthGridCore(viewDate);
}