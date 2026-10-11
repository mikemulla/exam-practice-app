import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("darkMode") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("darkMode", JSON.stringify(isDarkMode)); } catch { /* Storage may be unavailable. */ }
    // Apply / remove the class that CSS variables in index.css are scoped to
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// The context keeps its public provider/hook API together.
// eslint-disable-next-line react-refresh/only-export-components
export function useDarkMode() {
  const context = useContext(DarkModeContext);

  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }

  return context;
}
