import { CalendarProvider } from "./context/CalendarContext";
import { WallCalendarTailwind } from "./components/WallCalendarTailwind";

export default function App() {
  return (
    <CalendarProvider>
      <WallCalendarTailwind />
    </CalendarProvider>
  );
}