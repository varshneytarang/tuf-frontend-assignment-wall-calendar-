import React from "react";
import ReactDOM from "react-dom/client";
import { ReactLenis } from "@studio-freight/react-lenis";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 0.8,
        smooth: true,
        smoothTouch: true,
        infinite: false,
      }}
    >
      <App />
    </ReactLenis>
  </React.StrictMode>,
);