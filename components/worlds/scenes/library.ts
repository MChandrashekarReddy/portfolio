/**
 * LIBRARY — an ancient rotunda of shelves. The camera rises up the central
 * well as you scroll, drifting past floating books and candlelight toward
 * a glowing skylight. Day is warm reading light; night is candlelit.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "ember",
  colors: ["#ffb35c", "#ffd9a0", "#e8b878"],
  rate: 16,
  gravity: -60,
  drift: 18,
  size: [1.6, 3],
  life: [0.5, 1.1],
};

/** A shelf face packed with colored book spines. */
function spineTexture(rng: () => number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#241505";
  g.fillRect(0, 0, 256, 256);
  const spines = ["#7d3b28", "#9c6b2f", "#4a5a3a", "#5b3a5e", "#2f4a5e", "#8a4a3a", "#6b5537"];
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y0 = r * (256 / rows) + 6;
    const rowH = 256 / rows - 10;
    let x = 4;
    while (x < 248) {
      const w = 8 + rng() * 14;
      const h = rowH * (0.75 + rng() * 0.25);
      g.fillStyle = spines[(rng() * spines.length) | 0];
      g.fillRect(x, y0 + (rowH - h), w, h);
      if (rng() < 0.5) {
        g.fillStyle = "rgba(232,195,145,0.5)";
        g.fillRect(x + 2, y0 + (rowH - h) + h * 0.25, w - 4, 2);
      }
      x += w + 2;
    }
    // shelf board
    g.fillStyle = "#3a2410";
    g.fillRect(0, y0 + rowH, 256, 5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWorld(ctx: WorldContext): World | null {
  const stage = makeStage(ctx.canvas, ctx.tier, {
    fov: 58,
    far: 220,
    width: ctx.width,
    height: ctx.height,
  });
  if (!stage) return null;
  const { scene, camera } = stage;
  const rng = mulberry32(1455);
  const high = ctx.tier === "high";

  const bg = new THREE.Color();
  scene.background = bg;
  scene.fog = new THREE.FogExp2("#1c120a", 0.02);

  // --- rotunda of shelves: rings of spine-textured panels
  const levels = 7;
  const segments = high ? 14 : 10;
  const radius = 16;
  const shelfTex = spineTexture(rng);
  const shelfMat = new THREE.MeshLambertMaterial({ map: shelfTex, color: "#ffffff" });
  const panel = new THREE.BoxGeometry(7.4, 9.2, 0.8);
  const shelves = new THREE.InstancedMesh(panel, shelfMat, levels * segments);
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let level = 0; level < levels; level++) {
    for (let s = 0; s < segments; s++) {
      const ang = (s / segments) * Math.PI * 2 + level * 0.12;
      dummy.position.set(Math.sin(ang) * radius, level * 10 + 4, Math.cos(ang) * radius);
      dummy.lookAt(0, dummy.position.y, 0);
      dummy.updateMatrix();
      shelves.setMatrixAt(idx++, dummy.matrix);
    }
  }
  shelves.instanceMatrix.needsUpdate = true;
  scene.add(shelves);

  // --- floating books in the central well (cover + pages via material array)
  const pagesMat = new THREE.MeshLambertMaterial({ color: "#efe2c4" });
  const coverColors = ["#7d3b28", "#4a5a3a", "#5b3a5e", "#9c6b2f", "#2f4a5e"];
  const coverMats = coverColors.map((c) => new THREE.MeshLambertMaterial({ color: c }));
  interface Book {
    mesh: THREE.Mesh;
    base: THREE.Vector3;
    phase: number;
    spin: number;
  }
  const books: Book[] = [];
  const bookGeo = new THREE.BoxGeometry(1.6, 2.3, 0.4);
  const bookCount = high ? 16 : 9;
  for (let i = 0; i < bookCount; i++) {
    const cover = coverMats[(rng() * coverMats.length) | 0];
    // x: pages | pages, y: pages | pages, z: cover | cover
    const mesh = new THREE.Mesh(bookGeo, [pagesMat, cover, pagesMat, pagesMat, cover, cover]);
    const ang = rng() * Math.PI * 2;
    const r = 4 + rng() * 7;
    const base = new THREE.Vector3(Math.sin(ang) * r, 4 + rng() * 62, Math.cos(ang) * r);
    mesh.position.copy(base);
    mesh.rotation.set(rng() * 0.8 - 0.4, rng() * Math.PI * 2, rng() * 0.5 - 0.25);
    scene.add(mesh);
    books.push({ mesh, base, phase: rng() * 9, spin: (rng() - 0.5) * 0.3 });
  }

  // --- candles: warm point lights + flickering flame sprites
  interface Candle {
    light: THREE.PointLight;
    flame: THREE.Sprite;
    phase: number;
  }
  const candles: Candle[] = [];
  const candleCount = high ? 4 : 3;
  for (let i = 0; i < candleCount; i++) {
    const ang = (i / candleCount) * Math.PI * 2 + 0.6;
    const pos = new THREE.Vector3(Math.sin(ang) * (radius - 3.5), 8 + i * 16, Math.cos(ang) * (radius - 3.5));
    const light = new THREE.PointLight("#ffa94d", 60, 40, 1.8);
    light.position.copy(pos);
    scene.add(light);
    const flame = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture("rgba(255,190,110,1)"),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    flame.scale.setScalar(2.4);
    flame.position.copy(pos);
    scene.add(flame);
    candles.push({ light, flame, phase: rng() * 8 });
  }

  // --- dust motes drifting in the well
  const dustCount = high ? 220 : 110;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeed: number[] = [];
  for (let i = 0; i < dustCount; i++) {
    const ang = rng() * Math.PI * 2;
    const r = rng() * 13;
    dustPos[i * 3] = Math.sin(ang) * r;
    dustPos[i * 3 + 1] = rng() * 72;
    dustPos[i * 3 + 2] = Math.cos(ang) * r;
    dustSeed.push(rng() * 10, 0.2 + rng() * 0.5);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: glowTexture("rgba(255,226,180,0.9)", "rgba(255,226,180,0)", 32),
      color: "#ffe2b4",
      size: 0.28,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // --- skylight at the top of the well
  const skylight = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture("rgba(255,236,200,0.95)"),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  skylight.scale.set(40, 40, 1);
  skylight.position.set(0, 84, 0);
  scene.add(skylight);

  const ambient = new THREE.AmbientLight("#8a6a45", 1.1);
  scene.add(ambient);
  const topLight = new THREE.DirectionalLight("#ffe9c4", 1.2);
  topLight.position.set(0, 60, 8);
  scene.add(topLight);

  const P = {
    bgDay: new THREE.Color("#2a1c10"),
    bgNight: new THREE.Color("#120a05"),
    fogDay: new THREE.Color("#241708"),
    fogNight: new THREE.Color("#0e0703"),
  };
  let mix = ctx.dark ? 1 : 0;
  let targetMix = mix;

  return {
    update(t, dt, io) {
      mix += (targetMix - mix) * Math.min(dt * 2.5, 1);
      bg.copy(P.bgDay).lerp(P.bgNight, mix);
      (scene.fog as THREE.FogExp2).color.copy(P.fogDay).lerp(P.fogNight, mix);
      ambient.intensity = lerp(1.1, 0.4, mix);
      topLight.intensity = lerp(1.2, 0.35, mix);

      // ascend the well, slowly turning
      const y = lerp(4, 62, io.scroll);
      const ang = t * 0.05 + io.px * 1.2;
      camera.position.set(Math.sin(ang) * 1.5, y, Math.cos(ang) * 1.5);
      camera.lookAt(Math.sin(ang + 0.5) * 12, y + 3.5 - io.py * 4, Math.cos(ang + 0.5) * 12);

      for (const b of books) {
        b.mesh.position.y = b.base.y + Math.sin(t * 0.6 + b.phase) * 0.8;
        b.mesh.rotation.y += dt * b.spin;
        b.mesh.rotation.x = Math.sin(t * 0.4 + b.phase) * 0.15;
      }

      for (const c of candles) {
        const flick = 0.85 + Math.sin(t * 11 + c.phase) * 0.08 + Math.sin(t * 23 + c.phase * 2) * 0.07;
        c.light.intensity = lerp(40, 80, mix) * flick;
        c.flame.material.opacity = 0.75 * flick + mix * 0.2;
      }

      const dp = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const phase = dustSeed[i * 2];
        const speed = dustSeed[i * 2 + 1];
        dp[i * 3] += Math.sin(t * speed + phase) * dt * 0.3;
        dp[i * 3 + 1] += Math.cos(t * speed * 0.7 + phase) * dt * 0.2;
      }
      dustGeo.attributes.position.needsUpdate = true;

      stage.render();
    },
    setDark(d) {
      targetMix = d ? 1 : 0;
    },
    resize(w, h) {
      stage.resize(w, h);
    },
    dispose() {
      stage.dispose();
    },
  };
}
