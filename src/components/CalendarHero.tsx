import { motion } from "framer-motion";
import { useCalendar } from "../context/CalendarContext";
import { formatShort } from "../utils/calendar";

export function CalendarHero() {
  const { viewMonth, heroUrl } = useCalendar();

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-white/40">
      <motion.img
        key={heroUrl}
        src={heroUrl}
        loading="lazy"
        alt={`${formatShort(viewMonth)} seasonal landscape`}
        className="h-[40vh] min-h-[260px] w-full object-cover md:h-[46vh]"
        initial={{ scale: 1.02, opacity: 0.9 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />

      <div className="absolute left-4 top-4 rounded-xl bg-black/35 px-4 py-2 text-white backdrop-blur md:left-6 md:top-6">
        <p className="font-serif text-2xl md:text-4xl">{formatShort(viewMonth).toUpperCase()}</p>
        <p className="text-xs tracking-[0.24em] md:text-sm">{viewMonth.getFullYear()}</p>
      </div>
    </div>
  );
}
