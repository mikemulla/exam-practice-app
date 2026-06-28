import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DarkModeProvider } from "./context/DarkModeContext";
import ErrorBoundary from "./pages/ErrorBoundary";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DarkModeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </DarkModeProvider>
  </React.StrictMode>,
);
