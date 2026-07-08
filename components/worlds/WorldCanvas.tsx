"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WORLDS } from "./registry";
import type { World, WorldIO, QualityTier } from "./types";

/**
 * World lifecycle manager. Mounts a full-viewport canvas behind the page
 * (z-index below the body::before veil), lazy-loads the active style's
 * world module, drives its frame loop with damped pointer/scroll input,
 * pauses when the tab is hidden, and disposes on switch.
 *
 * Deliberately three-free: all 3D code lives in the lazy scene chunks.
 */

const dampTo = (a: number, b: number, lambda: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-lambda * dt));

function qualityTier(): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ? "low" : "high";
}

export function WorldCanvas() {
  const { style, theme, mounted } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<World | null>(null);
  const [ready, setReady] = useState(false);

  const hasWorld = mounted && !!WORLDS[style];

  useEffect(() => {
    if (!mounted) return;
    const loader = WORLDS[style];
    const canvas = canvasRef.current;
    if (!loader || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alive = true;
    let raf = 0;
    let last = performance.now();
    const io: WorldIO = {
      px: 0,
      py: 0,
      scroll: 0,
      dark: document.documentElement.classList.contains("dark"),
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const target = { px: 0, py: 0, scroll: 0 };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const onPointer = (e: PointerEvent) => {
      target.px = e.clientX / window.innerWidth - 0.5;
      target.py = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.scroll = max > 0 ? window.scrollY / max : 0;
    };
    const onResize = () => {
      io.width = window.innerWidth;
      io.height = window.innerHeight;
      worldRef.current?.resize(io.width, io.height);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (alive) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      io.px = dampTo(io.px, target.px, 3, dt);
      io.py = dampTo(io.py, target.py, 3, dt);
      io.scroll = dampTo(io.scroll, target.scroll, 2.5, dt);
      worldRef.current?.update(now / 1000, dt, io);
      raf = requestAnimationFrame(frame);
    };

    onScroll();
    loader().then((mod) => {
      if (!alive) return;
      const world = mod.createWorld({
        canvas,
        tier: qualityTier(),
        dark: io.dark,
        width: io.width,
        height: io.height,
      });
      if (!world) return; // WebGL unavailable → CSS theme still applies
      worldRef.current = world;
      // the theme may have flipped while the module was loading — sync now
      world.setDark?.(document.documentElement.classList.contains("dark"));
      if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      last = performance.now();
      raf = requestAnimationFrame(frame);
      setReady(true);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      worldRef.current?.dispose();
      worldRef.current = null;
      setReady(false);
    };
  }, [style, mounted]);

  // light/dark flips re-tint the world without a rebuild
  useEffect(() => {
    worldRef.current?.setDark?.(theme === "dark");
  }, [theme]);

  if (!hasWorld) return null;

  return (
    <canvas
      // a canvas can only ever hold one context type; re-key per style so
      // 2D worlds (terminal) and WebGL worlds never share an element
      key={style}
      ref={canvasRef}
      className="world-canvas"
      data-ready={ready || undefined}
      aria-hidden="true"
    />
  );
}
