import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Lenis from "lenis";
import App from "./App";
import "./index.css";

function Root() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 0.8,
      smooth: true,
      smoothTouch: true,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Lenis has no explicit destroy in older versions, but we can
      // stop the loop by using a flag if needed; for now just rely on
      // page unload since this is a single-page app root.
    };
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Root />);