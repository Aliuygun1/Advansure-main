"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ── Theme ──
type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ── App State (Persona, Claim in progress) ──
interface AppState {
  personaId: string;
  setPersonaId: (id: string) => void;
}

const AppStateContext = createContext<AppState>({
  personaId: "leon",
  setPersonaId: () => {},
});

export function useAppState() {
  return useContext(AppStateContext);
}

// ── Providers ──
export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [personaId, setPersonaId] = useState("leon");

  // Persist theme in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adv-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("adv-theme", next);
  }

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — app still works online
      });
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <AppStateContext.Provider value={{ personaId, setPersonaId }}>
        {children}
      </AppStateContext.Provider>
    </ThemeContext.Provider>
  );
}
