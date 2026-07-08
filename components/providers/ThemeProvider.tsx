"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

export type Style =
  | "modern"
  | "skeuomorphism"
  | "neumorphism"
  | "glassmorphism"
  | "claymorphism"
  | "minimalism"
  | "maximalism"
  | "brutalism"
  | "liquid-glass"
  | "bento-grid"
  | "spatial-ui"
  | "aurora"
  | "wildwood"
  | "space"
  | "cyberpunk"
  | "ocean"
  | "library"
  | "sakura"
  | "terminal";

/** Styles whose id appears in components/worlds/registry.ts mount a live
 *  3D/canvas environment behind the page in addition to their CSS theme. */
export const STYLE_OPTIONS: { id: Style; label: string; world?: boolean }[] = [
  { id: "modern", label: "Modern (Current)" },
  { id: "skeuomorphism", label: "Skeuomorphism" },
  { id: "neumorphism", label: "Neumorphism" },
  { id: "glassmorphism", label: "Glassmorphism" },
  { id: "claymorphism", label: "Claymorphism" },
  { id: "minimalism", label: "Minimalism" },
  { id: "maximalism", label: "Maximalism" },
  { id: "brutalism", label: "Brutalism" },
  { id: "liquid-glass", label: "Liquid Glass" },
  { id: "bento-grid", label: "Bento Grid" },
  // { id: "spatial-ui", label: "Spatial UI" },
  { id: "aurora", label: "Aurora Borealis", world: true },
  { id: "wildwood", label: "Wildwood", world: true },
  { id: "space", label: "Space", world: true },
  { id: "cyberpunk", label: "Cyberpunk", world: true },
  { id: "ocean", label: "Ocean", world: true },
  { id: "library", label: "Library", world: true },
  { id: "sakura", label: "Sakura", world: true },
  { id: "terminal", label: "Terminal", world: true },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  style: Style;
  setStyle: (style: Style) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  style: "modern",
  setStyle: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [style, setStyle] = useState<Style>("modern");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = sessionStorage.getItem("portfolio-theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    const storedStyle = localStorage.getItem("portfolio-style") as Style | null;
    if (storedStyle && STYLE_OPTIONS.some((s) => s.id === storedStyle)) {
      setStyle(storedStyle);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    sessionStorage.setItem("portfolio-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-style", style);
    localStorage.setItem("portfolio-style", style);
    // retrigger the crossfade animation on every style change
    root.classList.remove("style-anim");
    void root.offsetWidth;
    root.classList.add("style-anim");
  }, [style, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, style, setStyle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
