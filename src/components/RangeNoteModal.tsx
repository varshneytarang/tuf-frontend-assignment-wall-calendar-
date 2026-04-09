import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar } from "../context/CalendarContext";
import { formatDay, fromIso } from "../utils/calendar";

export function RangeNoteModal() {
  const {
    theme,
    range,
    noteDraft,
    monthNotes,
    rangeNoteEditorOpen,
    setRangeNoteEditorOpen,
    attachDraftToRange,
    rangeEditorNoteId,
    deleteRangeNote,
  } = useCalendar();

  const [memoInput, setMemoInput] = useState("");
  const [timelineInput, setTimelineInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rangeNoteEditorOpen) {
      if (rangeEditorNoteId) {
        const existing = monthNotes.find((item) => item.id === rangeEditorNoteId);
        setMemoInput(existing?.text ?? "");
      } else {
        setMemoInput(noteDraft || "");
      }
      setTimelineInput("");
      setError(null);
    }
  }, [rangeNoteEditorOpen, noteDraft, rangeEditorNoteId, monthNotes]);

  const isDark = theme === "dark";

  const handleClose = () => {
    setRangeNoteEditorOpen(false);
  };

  const handleSave = () => {
    const base = memoInput.trim();
    const timeline = timelineInput.trim();

    if (!range.start || !range.end) {
      setError("Please select a full date range first.");
      return;
    }

    if (!base && !timeline) {
      setError("Please add a memo or a timeline before saving.");
      return;
    }

    const combined = [base, timeline ? `Timeline:\n${timeline}` : ""].filter(Boolean).join("\n\n");

    attachDraftToRange(combined, () => {
      setError("Could not attach note to this range. Try a future range.");
    });
    setRangeNoteEditorOpen(false);
  };

  const startLabel = range.start ? formatDay(fromIso(range.start)) : null;
  const endLabel = range.end ? formatDay(fromIso(range.end)) : null;

  return (
    <AnimatePresence>
      {rangeNoteEditorOpen ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={[
              "w-full max-w-md rounded-2xl border p-4 shadow-2xl md:p-5 max-h-[80vh] overflow-y-auto",
              isDark
                ? "border-slate-800/80 bg-slate-950/95 text-slate-50"
                : "border-slate-200/90 bg-white/95 text-slate-900",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-500">
                  {rangeEditorNoteId ? "Edit range memo" : "Range memo"}
                </p>
                <h2 className="mt-1 font-serif text-xl">
                  {rangeEditorNoteId ? "Update memo & timeline" : "Add memo & timeline"}
                </h2>
                {startLabel ? (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {endLabel
                      ? `${startLabel} – ${endLabel}`
                      : startLabel}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-slate-300/70 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Memo
                <textarea
                  value={memoInput}
                  onChange={(event) => setMemoInput(event.target.value)}
                  className="mt-1 h-20 w-full rounded-xl border border-slate-300/80 bg-white/95 px-3 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="What is this range about?"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Timeline (optional)
                <textarea
                  value={timelineInput}
                  onChange={(event) => setTimelineInput(event.target.value)}
                  className="mt-1 h-20 w-full rounded-xl border border-slate-300/80 bg-white/95 px-3 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Break this range into steps or key milestones..."
                />
              </label>

              {error ? (
                <p className="text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
              ) : null}
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs font-semibold">
              {rangeEditorNoteId ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteRangeNote(rangeEditorNoteId);
                  }}
                  className="mr-auto rounded-xl border border-rose-300/80 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:border-rose-700/80 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  Delete memo
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-300/80 px-3 py-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-2 text-white shadow-sm hover:from-teal-400 hover:to-sky-400"
              >
                Save memo
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
