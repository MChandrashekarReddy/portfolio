import type { Style } from "@/components/providers/ThemeProvider";
import type { WorldModule } from "./types";

/**
 * Style → world loader. Styles absent here are pure-CSS themes (no canvas).
 * Each entry code-splits into its own chunk; nothing loads until the style
 * is activated. To add a world: create scenes/<name>.ts exporting
 * createWorld (+ optional cursor), add the style id, list it here.
 */
export const WORLDS: Partial<Record<Style, () => Promise<WorldModule>>> = {
  space: () => import("./scenes/space"),
  cyberpunk: () => import("./scenes/cyberpunk"),
  ocean: () => import("./scenes/ocean"),
  aurora: () => import("./scenes/aurora"),
  wildwood: () => import("./scenes/wildwood"),
  library: () => import("./scenes/library"),
  sakura: () => import("./scenes/sakura"),
  terminal: () => import("./scenes/terminal"),
};
