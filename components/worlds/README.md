# World Engine

Each theme in the style switcher can be a **world**: a live, immersive environment
rendered on a full-viewport canvas behind the page, paired with its own CSS theme
(palette, typography, surfaces), cursor particle trail, and scroll-driven camera
journey. Worlds are the hybrid immersive pattern — a 3D environment with readable
DOM content on top — so the portfolio stays usable for recruiters while feeling
like a place, not a page.

## Shipped worlds

| World     | Environment                                              | Scroll journey            | Cursor trail |
|-----------|----------------------------------------------------------|---------------------------|--------------|
| Space     | Galaxy: star layers, nebulae, planets, shooting stars    | Fly 160 units into deep space | stardust |
| Cyberpunk | Rainy neon city, lit towers, flickering signs, flying cars | Fly down an endless street | neon sparks |
| Ocean     | Sun shafts, bubbles, fish schools, jellyfish, sea floor  | Dive from shallows to the deep (water darkens) | bubbles |
| Aurora    | Real 4K northern-lights photography (Unsplash License, bundled in public/worlds/): green aurora over pines → pink lights over snowy tundra → a colossal swirl above a fjord, with flowing procedural aurora curtains, twinkling stars, shooting stars and drifting snow on top; light mode is arctic twilight, dark deepens the night | Travel deeper into the polar night across three photographic stages | stardust |
| Wildwood  | Real 4K forest photography (Unsplash License, bundled in public/worlds/): three stages crossfade as you scroll — sunlit trail → misty pines → mountain-sunset vista — with Ken Burns drift, pointer parallax, push-in, plus live god rays, fog, pollen, leaves, birds, butterflies, fireflies; dark mode grades the photos into moonlit night | Walk deeper through three photographic stages | leaves |
| Library   | Rotunda of book spines, floating books, candles, dust    | Ascend toward the skylight | embers |
| Sakura    | Real 4K cherry-blossom photography (Unsplash License, bundled in public/worlds/): blossom canopy → Mount Fuji framed in sakura → the lantern-lit Meguro river, with fluttering petals riding wind gusts, light rays, sun motes, butterflies by day and lantern bokeh by night; dark mode grades into a hanami evening | Stroll through spring across three photographic stages | petals |
| Terminal  | CRT matrix rain, scan band, glitch slices (2D canvas)    | —                         | glyphs |

All worlds respond to the pointer (parallax/steering) and to light/dark mode
(`setDark` cross-fades day/night palettes where the world allows it — space and
cyberpunk are always night by design).

## Architecture

```
components/worlds/
├── types.ts        World / WorldModule / WorldIO / CursorConfig contracts
├── lib.ts          three.js helpers (stage, dispose, glow textures, seeded RNG)
│                     — only ever imported by scene chunks, never eagerly
├── registry.ts     style id → () => import("./scenes/<world>")  (code-splitting)
├── WorldCanvas.tsx lifecycle: lazy-load, rAF loop, damped pointer/scroll input,
│                     tab-visibility pause, resize, dispose, canvas re-key per style
├── CursorFX.tsx    per-world pointer particle trail on a 2D overlay
└── scenes/         one self-contained module per world
```

Supporting pieces elsewhere:

- `ThemeProvider.tsx` — style ids + `world: true` metadata for the switcher.
- `globals.css` — "WORLD THEMES" section: per-world design tokens, surfaces,
  body::before readability veils, `.world-canvas` / `.cursor-fx` layering
  (canvas at z -2, veil at z -1, content above).
- The site-wide 3D depth system (card tilt, glare, reveals) applies inside
  worlds automatically via each world's `--tilt` / `--hover-*` tokens.

## Performance model

- **Zero cost by default**: the default Modern theme loads no world code at all.
  three.js + all scenes live in lazy chunks (~550 KB raw, ≈150 KB gz) fetched
  only when a world style activates.
- One rAF loop, damped inputs, `dt` clamped; loop pauses when the tab is hidden.
- Quality tiers: coarse pointers / ≤4 GB deviceMemory get "low" — fewer
  instances, lower DPR cap (1.5 vs 2), no antialiasing.
- Instancing everywhere (trees, buildings, shelves, petals, fish); shared
  canvas-generated textures; no per-frame allocations in update loops.
- Full disposal on style switch (geometries, materials, textures, renderer);
  the canvas element is re-keyed per style so 2D and WebGL contexts never
  collide.

## Accessibility

- `prefers-reduced-motion`: worlds and cursor trails never mount (the chunk is
  not even downloaded); the CSS theme still fully applies.
- Canvases are `aria-hidden` and `pointer-events: none`; keyboard navigation
  and focus order are untouched.
- WebGL unavailable → `createWorld` returns null and the CSS theme stands alone.
- Each world's veil (body::before) maintains text contrast over the canvas.

## Adding a world

1. Create `scenes/<name>.ts` exporting `createWorld(ctx): World | null` and
   optionally `cursor: CursorConfig`. Use `makeStage()` from `lib.ts` for the
   renderer/scene/camera boilerplate, or a 2D context for canvas worlds
   (see `terminal.ts`).
2. Add the id to `Style` + `STYLE_OPTIONS` (with `world: true`) in
   `ThemeProvider.tsx`, and a swatch in `StyleSwitcher.tsx`.
3. Register it in `registry.ts` (one line — this is what code-splits it).
4. Add a `[data-style="<name>"]` block in `globals.css`: tokens for both light
   and dark, a body::before veil, and surface treatments.
5. Screenshot-test light/dark, mobile, and reduced-motion.

Design rules of thumb: build props procedurally (instancing + canvas textures,
no external assets), give scroll a narrative (dive, ascend, travel), keep the
veil strong enough that body text passes contrast, and let `io.px/py/scroll`
drive everything — they arrive pre-damped.

## Future worlds (recipes)

- **Museum** — white gallery hall, spotlit floating frames (project cards as
  exhibits), long dolly down the hall. Frames = instanced boxes + canvas
  textures of project screenshots; spotlights = SpotLight + glow cones.
- **Medieval Castle** — torch-lit stone corridor: instanced wall blocks with a
  canvas stone texture, flickering PointLights (reuse library candles), banner
  planes swaying (reuse canopy sway), scroll walks the royal hallway.
- **Sound design** — `WorldModule` can grow an `audio?: { src, gain }` field;
  gate playback behind a user toggle (autoplay policies) and reduced motion.
- **Per-section 3D adapters** — the engine exposes scroll progress already;
  a world could react to section boundaries (e.g. planets aligning with the
  Projects grid) by reading `io.scroll` against section offsets.
