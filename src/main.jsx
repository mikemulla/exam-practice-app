import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./lib/install";
import App from "./App.jsx";
import { DarkModeProvider } from "./context/DarkModeContext";
import ErrorBoundary from "./pages/ErrorBoundary";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Make Bambo installable and faster on repeat visits (production only).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
