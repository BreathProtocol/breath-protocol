"use client";

/**
 * Breath Protocol 2 is dark-only. ThemeProvider is kept as a no-op
 * pass-through + stub `useTheme` so any existing import continues to compile.
 * The single source of truth is the obsidian palette in globals.css.
 */
import { createContext, useContext } from "react";

type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{ theme: "dark", setTheme: () => {}, resolvedTheme: "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
