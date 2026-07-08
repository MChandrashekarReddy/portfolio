"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, STYLE_OPTIONS, type Style } from "@/components/providers/ThemeProvider";

/* Small gradient swatch previewing each style's personality */
const SWATCHES: Record<Style, string> = {
  modern: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  skeuomorphism: "linear-gradient(180deg, #e8dcc0, #b09363)",
  neumorphism: "linear-gradient(145deg, #f2f7ff, #c8d4e6)",
  glassmorphism:
    "linear-gradient(135deg, rgba(99,102,241,0.75), rgba(236,72,153,0.65), rgba(16,185,129,0.65))",
  claymorphism: "linear-gradient(145deg, #c4b5fd, #8b5cf6)",
  minimalism: "linear-gradient(135deg, #ffffff 50%, #111827 50%)",
  maximalism: "conic-gradient(#6366f1, #ec4899, #f59e0b, #10b981, #6366f1)",
  brutalism: "repeating-linear-gradient(45deg, #000 0 5px, #fff 5px 10px)",
  "liquid-glass": "linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)",
  "bento-grid":
    "conic-gradient(from 0deg at 50% 50%, #6366f1 0 25%, #10b981 0 50%, #f59e0b 0 75%, #ec4899 0)",
  "spatial-ui": "radial-gradient(circle at 30% 30%, #818cf8, #1e1b4b)",
  aurora: "linear-gradient(170deg, #7ef0b8 0%, #2c8f7a 30%, #1b2c55 65%, #05070f 100%)",
  wildwood: "linear-gradient(170deg, #f2e2b0 0%, #6f9c4f 30%, #24451f 65%, #0c1a0d 100%)",
  space: "radial-gradient(circle at 30% 30%, #c4b5fd 0%, #4c1d95 35%, #05010f 100%)",
  cyberpunk: "linear-gradient(135deg, #ff2ec4 0%, #7c3aed 45%, #00e5ff 100%)",
  ocean: "linear-gradient(180deg, #38bdf8 0%, #0e7490 45%, #082f49 100%)",
  library: "linear-gradient(145deg, #e8cfa0 0%, #a5713d 55%, #4a2f18 100%)",
  sakura: "linear-gradient(135deg, #fde3ec 0%, #f5b5c8 45%, #9ac7ee 100%)",
  terminal: "repeating-linear-gradient(0deg, #021202 0 3px, #0a3d16 3px 5px)",
};

export function StyleSwitcher() {
  const { style, setStyle, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!mounted) return null;

  const activeLabel = STYLE_OPTIONS.find((s) => s.id === style)?.label ?? "Modern";

  return (
    <div ref={ref} className="fixed bottom-6 left-6 z-50" id="style-switcher">
      {open && (
        <div
          className="mb-3 w-76 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-custom bg-surface shadow-xl p-2 grid grid-cols-2 gap-1.5 animate-fade-in-up"
          style={{ animationDuration: "0.25s" }}
          role="listbox"
          aria-label="Design style"
        >
          {STYLE_OPTIONS.map((option) => {
            const active = style === option.id;
            return (
              <button
                key={option.id}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setStyle(option.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                  active
                    ? "border-primary bg-primary-light"
                    : "border-transparent hover:border-border-hover hover:bg-primary-light/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full shrink-0 border border-black/10 shadow-sm"
                  style={{ background: SWATCHES[option.id] }}
                />
                <span className="min-w-0">
                  <span
                    className={`block text-xs font-semibold truncate ${
                      active ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {option.label.replace(" (Current)", "")}
                    {option.world && (
                      <span className="ml-1.5 align-[1px] text-[9px] font-bold px-1 py-px rounded bg-primary-light text-primary">
                        3D
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="block text-[10px] text-text-secondary">Active</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full bg-surface border border-border-custom shadow-lg text-sm font-medium text-text-primary hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Change design style"
      >
        <span
          aria-hidden="true"
          className="w-6 h-6 rounded-full shrink-0 border border-black/10"
          style={{ background: SWATCHES[style] }}
        />
        <span className="max-w-36 truncate">{activeLabel.replace(" (Current)", "")}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
