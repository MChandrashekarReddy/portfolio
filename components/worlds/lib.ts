/**
 * Shared world-building helpers. Imports three, so it must only ever be
 * imported from scene modules (lazy chunks) — never from WorldCanvas.
 */
import * as THREE from "three";
import type { QualityTier } from "./types";

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

/** Renderer + scene + camera with tier-appropriate settings, or null if WebGL is unavailable. */
export function makeStage(
  canvas: HTMLCanvasElement,
  tier: QualityTier,
  opts: { fov?: number; far?: number; width: number; height: number }
): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === "high",
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === "high" ? 2 : 1.5));
  renderer.setSize(opts.width, opts.height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    opts.fov ?? 60,
    opts.width / opts.height,
    0.1,
    opts.far ?? 300
  );

  return {
    renderer,
    scene,
    camera,
    render() {
      renderer.render(scene, camera);
    },
    resize(width: number, height: number) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    dispose() {
      disposeObject3D(scene);
      renderer.dispose();
    },
  };
}

/** Recursively free geometries, materials and their textures. */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      mat.dispose();
    }
  });
}

/** Soft radial sprite texture (glows, fog puffs, light dots). */
export function glowTexture(inner: string, outer = "rgba(0,0,0,0)", size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Deterministic PRNG so worlds look identical on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const damp = THREE.MathUtils.damp;
export const lerp = THREE.MathUtils.lerp;
