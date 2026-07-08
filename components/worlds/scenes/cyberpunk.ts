/**
 * CYBERPUNK — rainy neon night city. The camera flies down an endless
 * street as you scroll; rain falls in camera space, signs flicker, and
 * neon curb lines run to a purple horizon. Always night, always raining.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "spark",
  colors: ["#ff2ec4", "#00e5ff", "#a855f7"],
  rate: 34,
  gravity: 220,
  drift: 30,
  size: [2, 4],
  life: [0.25, 0.6],
};

const NEON = ["#ff2ec4", "#00e5ff", "#a855f7", "#f59e0b", "#22d3ee"];

function windowTexture(rng: () => number) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0a0512";
  g.fillRect(0, 0, 64, 128);
  const palette = ["#8be9ff", "#ffd9a0", "#ff9de0", "#b7a6ff"];
  for (let y = 4; y < 124; y += 7) {
    for (let x = 4; x < 60; x += 7) {
      if (rng() < 0.32) {
        g.fillStyle = palette[(rng() * palette.length) | 0];
        g.globalAlpha = 0.35 + rng() * 0.65;
        g.fillRect(x, y, 4, 4);
      }
    }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export function createWorld(ctx: WorldContext): World | null {
  const stage = makeStage(ctx.canvas, ctx.tier, {
    fov: 60,
    far: 320,
    width: ctx.width,
    height: ctx.height,
  });
  if (!stage) return null;
  const { scene, camera } = stage;
  const rng = mulberry32(2077);
  const high = ctx.tier === "high";

  scene.background = new THREE.Color("#07020d");
  scene.fog = new THREE.FogExp2("#0a0416", 0.016);

  // --- street floor + neon curb lines
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 500),
    new THREE.MeshBasicMaterial({ color: "#040108" })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -160);
  scene.add(ground);

  const curb = (x: number, color: string) => {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35, 460),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(x, 0.02, -160);
    scene.add(strip);
  };
  curb(-7.5, "#00e5ff");
  curb(7.5, "#ff2ec4");

  // --- buildings: instanced dark towers with lit-window texture
  const buildingCount = high ? 96 : 52;
  const winTex = windowTexture(rng);
  const buildings = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ map: winTex, color: "#8f86a8", fog: true }),
    buildingCount
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const tint = new THREE.Color();
  for (let i = 0; i < buildingCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const w = 6 + rng() * 9;
    const h = 14 + rng() * 46;
    const d = 6 + rng() * 9;
    pos.set(side * (11 + w / 2 + rng() * 22), h / 2, 16 - (i / buildingCount) * 300 - rng() * 6);
    scale.set(w, h, d);
    m.compose(pos, q, scale);
    buildings.setMatrixAt(i, m);
    tint.setHSL(0.72 + rng() * 0.12, 0.35, 0.5 + rng() * 0.3);
    buildings.setColorAt(i, tint);
  }
  buildings.instanceMatrix.needsUpdate = true;
  scene.add(buildings);

  // --- neon signs on the street walls, with soft glow + flicker
  interface Sign {
    mesh: THREE.Mesh;
    base: number;
    phase: number;
    speed: number;
  }
  const signs: Sign[] = [];
  const signCount = high ? 16 : 9;
  for (let i = 0; i < signCount; i++) {
    const color = NEON[(rng() * NEON.length) | 0];
    const vertical = rng() < 0.45;
    const wdt = vertical ? 0.7 + rng() * 0.7 : 4 + rng() * 5;
    const hgt = vertical ? 5 + rng() * 6 : 0.8 + rng() * 0.9;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(wdt, hgt),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
      })
    );
    const side = rng() < 0.5 ? -1 : 1;
    mesh.position.set(side * (9.5 + rng() * 4), 4 + rng() * 22, 8 - rng() * 280);
    mesh.rotation.y = (side * -Math.PI) / 2;
    scene.add(mesh);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(color),
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.set(Math.max(wdt, hgt) * 3, Math.max(wdt, hgt) * 3, 1);
    glow.position.copy(mesh.position);
    glow.position.x -= side * 0.4;
    scene.add(glow);
    signs.push({ mesh, base: 0.75 + rng() * 0.25, phase: rng() * 10, speed: 6 + rng() * 10 });
  }

  // --- horizon haze
  for (let i = 0; i < 3; i++) {
    const haze = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(["rgba(124,58,237,0.8)", "rgba(255,46,196,0.6)", "rgba(0,229,255,0.5)"][i]),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    haze.scale.set(160, 70, 1);
    haze.position.set((i - 1) * 60, 18, -270);
    scene.add(haze);
  }

  // --- rain in camera space (follows the flight automatically)
  const rainCount = high ? 850 : 420;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 6);
  const rainSeed = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainSeed[i * 3] = (rng() - 0.5) * 44;
    rainSeed[i * 3 + 1] = rng() * 36;
    rainSeed[i * 3 + 2] = -4 - rng() * 40;
  }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.LineBasicMaterial({
      color: "#7dd3fc",
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  rain.frustumCulled = false;
  camera.add(rain);
  scene.add(camera);

  // --- flying vehicles: colored streaks crossing the sky
  interface Car {
    sprite: THREE.Sprite;
    vel: number;
    life: number;
    active: boolean;
  }
  const cars: Car[] = [];
  for (let i = 0; i < 3; i++) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(i % 2 ? "rgba(255,46,196,1)" : "rgba(0,229,255,1)"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    sprite.scale.set(5, 0.6, 1);
    scene.add(sprite);
    cars.push({ sprite, vel: 0, life: 0, active: false });
  }
  let carTimer = 2;

  return {
    update(t, dt, io) {
      const z = lerp(10, -170, io.scroll);
      camera.position.set(io.px * 3.2, 4.2 - io.py * 2.2, z);
      camera.lookAt(io.px * 1.2, 3.4 - io.py * 1.2, z - 16);

      // rain fall + wrap in camera-local space
      const p = rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        const y = ((rainSeed[i * 3 + 1] - t * 26) % 36 + 36) % 36 - 16;
        const x = rainSeed[i * 3];
        const zz = rainSeed[i * 3 + 2];
        p[i * 6] = x;
        p[i * 6 + 1] = y + 0.9;
        p[i * 6 + 2] = zz;
        p[i * 6 + 3] = x - 0.12;
        p[i * 6 + 4] = y;
        p[i * 6 + 5] = zz;
      }
      rainGeo.attributes.position.needsUpdate = true;

      for (const s of signs) {
        const flick =
          Math.sin(t * s.speed + s.phase) * 0.5 + Math.sin(t * s.speed * 2.7 + s.phase * 3) * 0.5;
        (s.mesh.material as THREE.MeshBasicMaterial).opacity =
          s.base * (flick > -0.85 ? 1 : 0.25);
      }

      carTimer -= dt;
      if (carTimer <= 0) {
        const car = cars.find((c) => !c.active);
        if (car) {
          car.active = true;
          car.life = 0;
          const dir = rng() < 0.5 ? 1 : -1;
          car.vel = dir * (26 + rng() * 18);
          car.sprite.position.set(-dir * 70, 16 + rng() * 22, z - 70 - rng() * 60);
        }
        carTimer = 2.5 + rng() * 4;
      }
      for (const c of cars) {
        if (!c.active) continue;
        c.life += dt;
        c.sprite.position.x += c.vel * dt;
        c.sprite.material.opacity = Math.sin(Math.min(c.life / 4.5, 1) * Math.PI) * 0.85;
        if (c.life > 4.5) {
          c.active = false;
          c.sprite.material.opacity = 0;
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
