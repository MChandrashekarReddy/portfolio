/**
 * TERMINAL — a CRT phosphor screen. Pure 2D canvas: matrix rain columns
 * with a roving scan band and occasional glitch flicker. The heavy lifting
 * for this world is its CSS theme (mono type, green-on-black, scanlines);
 * this environment keeps the glass alive behind it. No WebGL required.
 */
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "glyph",
  colors: ["#34d971", "#5ff08e", "#1f8f4c"],
  rate: 22,
  gravity: 90,
  drift: 6,
  size: [4, 6],
  life: [0.35, 0.8],
};

const CHARS = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>[]{}$#@*+=";

export function createWorld(ctx: WorldContext): World | null {
  const g = ctx.canvas.getContext("2d");
  if (!g) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, ctx.tier === "high" ? 2 : 1.25);
  let w = ctx.width;
  let h = ctx.height;
  let fontSize = 15;
  let cols = 0;
  let heads: number[] = [];
  let speeds: number[] = [];
  let glow: boolean[] = [];

  const setup = () => {
    ctx.canvas.width = Math.round(w * dpr);
    ctx.canvas.height = Math.round(h * dpr);
    fontSize = Math.max(13, Math.round(w / 110));
    cols = Math.ceil(w / fontSize);
    heads = Array.from({ length: cols }, () => Math.random() * (h / fontSize));
    speeds = Array.from({ length: cols }, () => 4 + Math.random() * 14);
    glow = Array.from({ length: cols }, () => Math.random() < 0.12);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#020a04";
    g.fillRect(0, 0, w, h);
  };
  setup();

  let glitchAt = 3 + Math.random() * 6;

  return {
    update(t, dt) {
      // translucent wash creates the falling trails
      g.fillStyle = "rgba(2, 10, 4, 0.12)";
      g.fillRect(0, 0, w, h);

      g.font = `${fontSize}px ui-monospace, monospace`;
      g.textBaseline = "top";
      const rows = h / fontSize;
      for (let i = 0; i < cols; i++) {
        heads[i] += speeds[i] * dt;
        if (heads[i] > rows + 8) {
          heads[i] = -Math.random() * 20;
          speeds[i] = 4 + Math.random() * 14;
          glow[i] = Math.random() < 0.12;
        }
        const x = i * fontSize;
        const y = Math.floor(heads[i]) * fontSize;
        const ch = CHARS[(Math.random() * CHARS.length) | 0];
        if (glow[i]) {
          g.shadowColor = "#34d971";
          g.shadowBlur = 8;
          g.fillStyle = "rgba(160, 255, 190, 0.9)";
        } else {
          g.shadowBlur = 0;
          g.fillStyle = "rgba(52, 217, 113, 0.55)";
        }
        g.fillText(ch, x, y);
        g.shadowBlur = 0;
      }

      // roving scan band
      const bandY = ((t * 40) % (h + 160)) - 80;
      const grad = g.createLinearGradient(0, bandY - 40, 0, bandY + 40);
      grad.addColorStop(0, "rgba(52,217,113,0)");
      grad.addColorStop(0.5, "rgba(52,217,113,0.05)");
      grad.addColorStop(1, "rgba(52,217,113,0)");
      g.fillStyle = grad;
      g.fillRect(0, bandY - 40, w, 80);

      // occasional glitch flicker: shift a horizontal slice
      glitchAt -= dt;
      if (glitchAt <= 0) {
        const sliceY = Math.random() * h * dpr;
        const sliceH = (6 + Math.random() * 18) * dpr;
        const shift = (Math.random() - 0.5) * 26 * dpr;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(
          ctx.canvas,
          0, sliceY, ctx.canvas.width, sliceH,
          shift, sliceY, ctx.canvas.width, sliceH
        );
        g.restore();
        glitchAt = 2.5 + Math.random() * 7;
      }
    },
    resize(width, height) {
      w = width;
      h = height;
      setup();
    },
    dispose() {
      // nothing beyond the canvas itself, which the engine re-keys
    },
  };
}
