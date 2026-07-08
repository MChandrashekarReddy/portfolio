"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { WORLDS } from "./registry";
import type { CursorConfig } from "./types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
  glyph?: string;
}

const GLYPHS = "アイウエオカキクケコ01<>/{}=+*#$";

/**
 * Per-world pointer trail on a 2D overlay canvas. Emits particles from the
 * world module's CursorConfig while the pointer moves; the rAF loop only
 * runs while particles are alive. Fine pointers only; honors reduced motion.
 */
export function CursorFX() {
  const { style, mounted } = useTheme();
  // keyed by style so a stale config never renders for the wrong world —
  // avoids needing a synchronous reset when the style changes
  const [entry, setEntry] = useState<{ style: string; cfg: CursorConfig } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const config = entry && entry.style === style ? entry.cfg : null;

  useEffect(() => {
    if (!mounted) return;
    const loader = WORLDS[style];
    if (!loader) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    loader().then((mod) => {
      if (alive && mod.cursor) setEntry({ style, cfg: mod.cursor });
    });
    return () => {
      alive = false;
    };
  }, [style, mounted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let last = performance.now();
    let lastX = -1;
    let lastY = -1;
    let carry = 0;

    const spawn = (x: number, y: number, mx: number, my: number) => {
      const [smin, smax] = config.size;
      const [lmin, lmax] = config.life;
      particles.push({
        x,
        y,
        vx: mx * 2 + (Math.random() - 0.5) * config.drift,
        vy: my * 2 + (Math.random() - 0.5) * config.drift - Math.abs(config.gravity) * 0.05,
        life: 0,
        maxLife: lmin + Math.random() * (lmax - lmin),
        size: smin + Math.random() * (smax - smin),
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 4,
        color: config.colors[(Math.random() * config.colors.length) | 0],
        glyph: config.shape === "glyph" ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : undefined,
      });
    };

    const draw = (p: Particle) => {
      const t = p.life / p.maxLife;
      const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.rot);
      ctx.scale(dpr, dpr);
      ctx.globalAlpha = Math.max(alpha, 0) * 0.9;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      switch (config.shape) {
        case "leaf":
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha *= 0.6;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
          break;
        case "petal":
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.9, -p.size * 0.2, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.9, -p.size * 0.2, 0, -p.size);
          ctx.fill();
          break;
        case "bubble":
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha *= 0.5;
          ctx.beginPath();
          ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "star":
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.stroke();
          break;
        case "spark":
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-p.vx * 0.06, -p.vy * 0.06);
          ctx.stroke();
          break;
        case "ember":
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "glyph":
          ctx.font = `${Math.round(p.size * 2.4)}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fillText(p.glyph ?? "0", 0, 0);
          break;
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.vy += config.gravity * dt;
        p.vx += Math.sin((p.life * 3 + p.rot) * 2) * config.drift * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        draw(p);
      }
      if (particles.length > 0) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (lastX >= 0) {
        const mx = e.clientX - lastX;
        const my = e.clientY - lastY;
        const dist = Math.hypot(mx, my);
        carry += (dist / 90) * config.rate * 0.06;
        while (carry >= 1 && particles.length < 160) {
          carry -= 1;
          spawn(e.clientX, e.clientY, mx, my);
        }
        if (!running && particles.length > 0) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [config]);

  if (!config) return null;

  return <canvas ref={canvasRef} className="cursor-fx" aria-hidden="true" />;
}
