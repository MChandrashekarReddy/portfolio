/**
 * World Engine — contracts.
 *
 * A "world" is a self-contained immersive environment mounted behind the
 * page content when its style is active. Each world lives in its own module
 * under scenes/ and is lazy-loaded by WorldCanvas, so the default site ships
 * zero 3D bytes. Worlds own their renderer/scene and must fully dispose.
 */

export type QualityTier = "high" | "low";

/** Damped per-frame inputs the engine feeds every world. */
export interface WorldIO {
  /** pointer position, -0.5..0.5 from viewport center (0 on touch/idle) */
  px: number;
  py: number;
  /** document scroll progress 0..1 — worlds map this to camera travel */
  scroll: number;
  dark: boolean;
  width: number;
  height: number;
}

export interface WorldContext {
  canvas: HTMLCanvasElement;
  tier: QualityTier;
  dark: boolean;
  width: number;
  height: number;
}

export interface World {
  /** advance + render one frame; dt is clamped seconds */
  update(time: number, dt: number, io: WorldIO): void;
  /** react to light/dark toggle without a rebuild */
  setDark?(dark: boolean): void;
  resize(width: number, height: number): void;
  /** release GPU resources, listeners, contexts */
  dispose(): void;
}

/** Per-world pointer particle trail, drawn by CursorFX on a 2D overlay. */
export interface CursorConfig {
  shape: "leaf" | "petal" | "bubble" | "star" | "spark" | "ember" | "glyph";
  colors: string[];
  /** particles emitted per second of pointer movement */
  rate: number;
  /** px/s² — positive falls, negative rises */
  gravity: number;
  /** horizontal wander amplitude in px/s */
  drift: number;
  size: [min: number, max: number];
  life: [min: number, max: number];
}

export interface WorldModule {
  /** may return null when the environment can't run (e.g. WebGL denied) */
  createWorld(ctx: WorldContext): World | null;
  cursor?: CursorConfig;
}
