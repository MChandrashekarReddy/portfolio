"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

/* Styles that stay deliberately flat — no tilt, no parallax. */
const FLAT_STYLES = new Set(["minimalism", "brutalism"]);

/**
 * Global pointer-driven 3D engine (rAF-batched, one listener for the page).
 *
 * - Card tilt: sets --rx/--ry (tilt angles) and --mx/--my (glare position)
 *   on whichever .ui-card or [data-tilt] element the pointer is over.
 *   CSS scales the angles per style via --tilt and renders the glare.
 * - Hero depth rig: sets --px/--py (-0.5..0.5, viewport-relative) on
 *   [data-parallax-scene]; layered children translate at their own
 *   --depth-x/--depth-y rate, creating parallax between depth planes.
 */
export function Tilt3D() {
  const { style, mounted } = useTheme();

  useEffect(() => {
    if (!mounted || FLAT_STYLES.has(style)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const scene = document.querySelector<HTMLElement>("[data-parallax-scene]");
    let card: HTMLElement | null = null;
    let last: PointerEvent | null = null;
    let raf = 0;

    const clearCard = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const clearScene = () => {
      scene?.style.removeProperty("--px");
      scene?.style.removeProperty("--py");
    };

    const apply = () => {
      raf = 0;
      const e = last;
      if (!e) return;

      const target = e.target as HTMLElement | null;
      const next =
        (target?.closest?.(".ui-card, [data-tilt]") as HTMLElement | null) ?? null;
      if (card && card !== next) clearCard(card);
      card = next;

      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--rx", `${(-(py - 0.5) * 10).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      }

      if (scene) {
        scene.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        scene.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
      }
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const reset = () => {
      last = null;
      if (card) {
        clearCard(card);
        card = null;
      }
      clearScene();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [style, mounted]);

  return null;
}
