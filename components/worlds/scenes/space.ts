/**
 * SPACE — a galaxy corridor. Scrolling the page flies the camera ~160 units
 * deep past nebulae and planets; the pointer steers gently. Always night.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "star",
  colors: ["#c4b5fd", "#93c5fd", "#ffffff"],
  rate: 30,
  gravity: 10,
  drift: 16,
  size: [1.6, 3.2],
  life: [0.4, 0.9],
};

export function createWorld(ctx: WorldContext): World | null {
  const stage = makeStage(ctx.canvas, ctx.tier, {
    fov: 62,
    far: 600,
    width: ctx.width,
    height: ctx.height,
  });
  if (!stage) return null;
  const { scene, camera } = stage;
  const rng = mulberry32(20260704);
  const high = ctx.tier === "high";

  scene.background = new THREE.Color("#05010f");

  // --- star field: three parallax layers filling the whole flight corridor
  const starTex = glowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)", 64);
  const makeStars = (count: number, size: number, tint: string, spread: number) => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * spread;
      pos[i * 3 + 1] = (rng() - 0.5) * spread * 0.6;
      pos[i * 3 + 2] = 50 - rng() * 340;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        map: starTex,
        color: tint,
        size,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(pts);
    return pts;
  };
  const starsFar = makeStars(high ? 4200 : 2000, 0.7, "#cbd5ff", 320);
  const starsMid = makeStars(high ? 1800 : 900, 1.15, "#e9e4ff", 230);
  makeStars(high ? 620 : 300, 1.9, "#ffffff", 160);

  // --- nebulae: huge soft additive sprites drifting in the deep
  const nebulaTints = [
    "rgba(139,92,246,0.9)",
    "rgba(59,130,246,0.85)",
    "rgba(236,72,153,0.7)",
    "rgba(34,211,238,0.6)",
  ];
  const nebulae: THREE.Sprite[] = [];
  for (let i = 0; i < (high ? 9 : 5); i++) {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(nebulaTints[i % nebulaTints.length], "rgba(0,0,0,0)", 256),
        transparent: true,
        opacity: 0.14 + rng() * 0.09,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        rotation: rng() * Math.PI,
      })
    );
    const s = 80 + rng() * 100;
    sp.scale.set(s, s * (0.5 + rng() * 0.45), 1);
    sp.position.set((rng() - 0.5) * 260, (rng() - 0.5) * 130, 30 - rng() * 320);
    scene.add(sp);
    nebulae.push(sp);
  }

  // --- planets
  const bandTexture = (colors: string[]) => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 128);
    colors.forEach((col, i) => grad.addColorStop(i / (colors.length - 1), col));
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  const spinning: { obj: THREE.Object3D; speed: number }[] = [];
  const addPlanet = (
    r: number,
    x: number,
    y: number,
    z: number,
    colors: string[],
    halo: string,
    spin = 0.05
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, high ? 48 : 28, high ? 32 : 18),
      new THREE.MeshStandardMaterial({ map: bandTexture(colors), roughness: 0.9, metalness: 0 })
    );
    mesh.position.set(x, y, z);
    mesh.rotation.z = 0.2 + rng() * 0.2;
    scene.add(mesh);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(halo),
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.setScalar(r * 3.4);
    glow.position.set(x, y, z);
    scene.add(glow);
    spinning.push({ obj: mesh, speed: spin });
    return mesh;
  };

  // ringed hero planet with an orbiting moon
  const ringed = addPlanet(6, 17, 3, -72, ["#8f76d6", "#6d51b8", "#4c3195", "#7c5cbf"], "rgba(167,139,250,0.8)", 0.04);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(8.6, 13, 64),
    new THREE.MeshBasicMaterial({
      color: "#b9a6ff",
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  ring.position.copy(ringed.position);
  ring.rotation.x = 1.25;
  ring.rotation.y = 0.25;
  scene.add(ring);
  const moonPivot = new THREE.Group();
  moonPivot.position.copy(ringed.position);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 20, 14),
    new THREE.MeshStandardMaterial({ color: "#d7d3e8", roughness: 1 })
  );
  moon.position.set(11.5, 1.2, 0);
  moonPivot.add(moon);
  scene.add(moonPivot);

  addPlanet(2.3, -15, -4, -40, ["#a5f3fc", "#22d3ee", "#0e7490", "#164e63"], "rgba(34,211,238,0.7)", 0.12);
  addPlanet(11, -36, 10, -160, ["#fde8c8", "#f5b96e", "#c2703e", "#8a4b2a", "#f0d3a1"], "rgba(245,185,110,0.6)", 0.02);
  addPlanet(3.2, 26, -7, -120, ["#fbcfe8", "#ec4899", "#9d2463", "#701a4b"], "rgba(236,72,153,0.55)", 0.08);

  // --- shooting stars: a small pool of streaks that fire occasionally
  const streakTex = (() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 8;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.75, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  interface Shot {
    sprite: THREE.Sprite;
    vel: THREE.Vector3;
    life: number;
    active: boolean;
  }
  const shots: Shot[] = [];
  for (let i = 0; i < 2; i++) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: streakTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        rotation: -0.6,
      })
    );
    sprite.scale.set(9, 0.5, 1);
    scene.add(sprite);
    shots.push({ sprite, vel: new THREE.Vector3(), life: 0, active: false });
  }
  let shotTimer = 3;

  scene.add(new THREE.AmbientLight("#8a86c9", 0.55));
  const sun = new THREE.DirectionalLight("#fff5e0", 2.4);
  sun.position.set(6, 4, 10);
  scene.add(sun);

  return {
    update(t, dt, io) {
      const z = lerp(8, -155, io.scroll);
      camera.position.set(io.px * 5, -io.py * 3.5 + Math.sin(t * 0.35) * 0.4, z);
      camera.lookAt(io.px * 2, -io.py * 1.4, z - 14);

      starsFar.rotation.z += dt * 0.004;
      starsMid.rotation.z -= dt * 0.0025;
      for (const s of spinning) s.obj.rotation.y += dt * s.speed * Math.PI;
      moonPivot.rotation.y += dt * 0.3;
      for (let i = 0; i < nebulae.length; i++) {
        const mat = nebulae[i].material;
        mat.rotation += dt * 0.012 * (i % 2 ? 1 : -1);
      }

      shotTimer -= dt;
      if (shotTimer <= 0) {
        const shot = shots.find((s) => !s.active);
        if (shot) {
          shot.active = true;
          shot.life = 0;
          shot.sprite.position.set(
            camera.position.x + 20 + rng() * 30,
            camera.position.y + 10 + rng() * 14,
            z - 60 - rng() * 40
          );
          shot.vel.set(-38 - rng() * 20, -20 - rng() * 10, 0);
        }
        shotTimer = 3 + rng() * 6;
      }
      for (const s of shots) {
        if (!s.active) continue;
        s.life += dt;
        s.sprite.position.addScaledVector(s.vel, dt);
        s.sprite.material.opacity = Math.sin(Math.min(s.life / 1.1, 1) * Math.PI) * 0.9;
        if (s.life > 1.1) {
          s.active = false;
          s.sprite.material.opacity = 0;
        }
      }

      stage.render();
    },
    resize(w, h) {
      stage.resize(w, h);
    },
    dispose() {
      stage.dispose();
    },
  };
}
