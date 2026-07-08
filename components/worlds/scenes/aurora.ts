/**
 * AURORA — a night under real northern lights.
 * Three 4K photographs (Unsplash License — free for commercial use) form a
 * scroll journey: green aurora over pine silhouettes → pink lights over a
 * snowy tundra → a colossal aurora swirl above a fjord. Each stage slowly
 * zooms (Ken Burns), pans against the pointer, pushes in as you scroll, and
 * crossfades into the next. On top, a live sky: flowing aurora curtains
 * (scrolling canvas textures), twinkling star layers, occasional shooting
 * stars and gently drifting snow. Light mode is arctic twilight; dark mode
 * deepens the night and intensifies the lights.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import { withBasePath } from "@/lib/basePath";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "star",
  colors: ["#7cf5c8", "#8ab8ff", "#d9a5ff"],
  rate: 16,
  gravity: -25,
  drift: 30,
  size: [2.5, 4.5],
  life: [0.7, 1.5],
};

const PHOTOS = ["/worlds/aurora-1.webp", "/worlds/aurora-2.webp", "/worlds/aurora-3.webp"];

/* scroll windows: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] */
const SEGMENTS: [number, number, number, number][] = [
  [-1, -0.5, 0.3, 0.46],
  [0.3, 0.46, 0.62, 0.78],
  [0.62, 0.78, 2, 3],
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export function createWorld(ctx: WorldContext): World | null {
  const stage = makeStage(ctx.canvas, ctx.tier, {
    fov: 55,
    far: 120,
    width: ctx.width,
    height: ctx.height,
  });
  if (!stage) return null;
  const { scene, camera } = stage;
  const rng = mulberry32(9021);
  const high = ctx.tier === "high";

  const bg = new THREE.Color();
  scene.background = bg;

  /* --- the photographic stages --- */
  const PHOTO_DIST = 30;
  interface Stage3 {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    aspect: number;
    loadFade: number;
    ready: boolean;
    panDir: number;
  }
  const stages: Stage3[] = [];
  const loader = new THREE.TextureLoader();
  const photoGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < PHOTOS.length; i++) {
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
    });
    const mesh = new THREE.Mesh(photoGeo, mat);
    mesh.position.set(0, 0, -PHOTO_DIST - i * 0.6);
    mesh.renderOrder = i;
    scene.add(mesh);
    const st: Stage3 = { mesh, mat, aspect: 1.5, loadFade: 0, ready: false, panDir: i % 2 ? -1 : 1 };
    stages.push(st);
    loader.load(withBasePath(PHOTOS[i]), (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = high ? 4 : 2;
      st.aspect = (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height;
      st.mat.map = tex;
      st.mat.needsUpdate = true;
      st.ready = true;
      layout(st);
    });
  }

  /** cover-fit the photo plane to the viewport (with margin for parallax/zoom) */
  const layout = (st: Stage3) => {
    const viewH = 2 * PHOTO_DIST * Math.tan((camera.fov * Math.PI) / 360);
    const viewW = viewH * camera.aspect;
    const h = Math.max(viewH, viewW / st.aspect) * 1.24;
    st.mesh.scale.set(h * st.aspect, h, 1);
  };

  /* --- flowing aurora curtains: streaked canvas texture scrolled per-frame --- */
  const curtainTex = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    for (let i = 0; i < 110; i++) {
      const x = rng() * 512;
      const w = 2 + rng() * 15;
      const a = 0.05 + rng() * 0.11;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, `rgba(130, 255, 196, ${a})`);
      grad.addColorStop(0.5, `rgba(74, 222, 168, ${a * 0.6})`);
      grad.addColorStop(0.85, `rgba(120, 130, 255, ${a * 0.22})`);
      grad.addColorStop(1, "rgba(120, 130, 255, 0)");
      g.fillStyle = grad;
      g.fillRect(x - w / 2, 0, w, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  interface Curtain {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    tex: THREE.Texture;
    speed: number;
    phase: number;
    base: number;
  }
  const curtains: Curtain[] = [];
  for (let i = 0; i < (high ? 4 : 3); i++) {
    const tex = curtainTex.clone();
    tex.needsUpdate = true;
    tex.offset.x = rng();
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(34 + rng() * 16, 10 + rng() * 7), mat);
    mesh.position.set((rng() - 0.5) * 24, 7.5 + i * 2.2, -20 - i * 3);
    mesh.rotation.z = (rng() - 0.5) * 0.22;
    scene.add(mesh);
    curtains.push({ mesh, mat, tex, speed: 0.008 + rng() * 0.014, phase: rng() * 9, base: 0.1 + rng() * 0.07 });
  }
  /* soft green glow behind the curtains for volume */
  const auroraGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture("rgba(96, 240, 180, 0.5)"),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  auroraGlow.scale.set(46, 18, 1);
  auroraGlow.position.set(0, 9, -26);
  scene.add(auroraGlow);

  /* --- twinkling stars (two layers, phased opacity) --- */
  const makeStars = (n: number, size: number) => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (rng() - 0.5) * 60;
      p[i * 3 + 1] = 2 + rng() * 22;
      p[i * 3 + 2] = -26 - rng() * 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({
      map: glowTexture("rgba(230, 240, 255, 1)", "rgba(0,0,0,0)", 32),
      size,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return mat;
  };
  const starsA = makeStars(high ? 220 : 120, 0.22);
  const starsB = makeStars(high ? 140 : 70, 0.34);

  /* --- shooting stars --- */
  const streakTex = (() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 16;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.75, "rgba(220,235,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0.95)");
    g.fillStyle = grad;
    g.fillRect(0, 4, 128, 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  interface Meteor {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    vel: THREE.Vector2;
    life: number;
    active: boolean;
  }
  const meteors: Meteor[] = [];
  for (let i = 0; i < 2; i++) {
    const mat = new THREE.MeshBasicMaterial({
      map: streakTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.4), mat);
    mesh.position.z = -25;
    scene.add(mesh);
    meteors.push({ mesh, mat, vel: new THREE.Vector2(), life: 0, active: false });
  }
  let meteorTimer = 4;

  /* --- drifting snow --- */
  const nSnow = high ? 260 : 130;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(nSnow * 3);
  const snowSeed: number[] = [];
  for (let i = 0; i < nSnow; i++) {
    snowPos[i * 3] = (rng() - 0.5) * 40;
    snowPos[i * 3 + 1] = -8 + rng() * 24;
    snowPos[i * 3 + 2] = -8 - rng() * 16;
    snowSeed.push(rng() * 10, 0.35 + rng() * 0.6);
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    map: glowTexture("rgba(240, 246, 255, 0.95)", "rgba(0,0,0,0)", 32),
    size: 0.18,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const snow = new THREE.Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  scene.add(snow);

  /* --- horizon glow --- */
  const horizon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture("rgba(110, 200, 220, 0.4)"),
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  horizon.scale.set(60, 10, 1);
  horizon.position.set(0, -7, -28);
  scene.add(horizon);

  /* --- twilight / deep-night --- */
  const P = {
    bgDay: new THREE.Color("#0b1424"),
    bgNight: new THREE.Color("#02040a"),
    gradeDay: new THREE.Color("#ffffff"),
    gradeNight: new THREE.Color("#8e9cc0"),
  };
  let mix = ctx.dark ? 1 : 0;
  let targetMix = mix;
  const grade = new THREE.Color();

  return {
    update(t, dt, io) {
      mix += (targetMix - mix) * Math.min(dt * 2, 1);
      bg.copy(P.bgDay).lerp(P.bgNight, mix);
      grade.copy(P.gradeDay).lerp(P.gradeNight, mix);

      // breathing, hand-held camera
      camera.position.set(Math.sin(t * 0.8) * 0.06, Math.sin(t * 1.6) * 0.07, 0);
      camera.lookAt(io.px * 2.4, -io.py * 1.7, -22);
      camera.rotateZ(Math.sin(t * 0.7) * 0.006);

      // photographic journey: Ken Burns + push-in + crossfade
      for (let i = 0; i < stages.length; i++) {
        const st = stages[i];
        if (!st.ready) continue;
        st.loadFade = Math.min(st.loadFade + dt * 1.2, 1);
        const [i0, i1, o0, o1] = SEGMENTS[i];
        const alpha = smoothstep(i0, i1, io.scroll) * (1 - smoothstep(o0, o1, io.scroll));
        st.mat.opacity = alpha * st.loadFade;
        st.mat.color.copy(grade);
        if (alpha <= 0.001) continue;
        const start = Math.max(i0, 0);
        const end = Math.min(o1, 1);
        const p = Math.min(Math.max((io.scroll - start) / (end - start), 0), 1);
        const zoom = 1 + p * 0.09 + Math.sin(t * 0.1 + i * 2) * 0.008;
        const baseH = st.mesh.scale.y / (st.mesh.userData.zoom ?? 1);
        st.mesh.userData.zoom = zoom;
        st.mesh.scale.set(baseH * st.aspect * zoom, baseH * zoom, 1);
        st.mesh.position.z = -PHOTO_DIST - i * 0.6 + p * 5.5;
        st.mesh.position.x = st.panDir * p * 1.6 - io.px * 2.2;
        st.mesh.position.y = p * 0.9 + io.py * 1.5;
      }

      // curtains flow sideways and shimmer; stronger in deep night
      const intensity = lerp(0.75, 1.25, mix);
      for (let i = 0; i < curtains.length; i++) {
        const cu = curtains[i];
        cu.tex.offset.x += cu.speed * dt * (1 + Math.sin(t * 0.11 + cu.phase) * 0.4);
        cu.mat.opacity = (cu.base + Math.sin(t * 0.23 + cu.phase) * 0.05) * intensity;
        cu.mesh.rotation.z += Math.sin(t * 0.09 + cu.phase) * dt * 0.004;
        cu.mesh.scale.y = 1 + Math.sin(t * 0.16 + cu.phase * 2) * 0.08;
        cu.mesh.position.x += Math.sin(t * 0.05 + cu.phase) * dt * 0.35;
      }
      auroraGlow.material.opacity = (0.1 + Math.sin(t * 0.19) * 0.04) * intensity;
      horizon.material.opacity = 0.08 + Math.sin(t * 0.13) * 0.03;

      // star twinkle, brighter at night
      starsA.opacity = (0.35 + Math.sin(t * 0.9) * 0.15) * lerp(0.7, 1.15, mix);
      starsB.opacity = (0.4 + Math.sin(t * 1.3 + 2) * 0.18) * lerp(0.7, 1.15, mix);

      // snowfall: sink and sway, wrap around
      const sp = snowGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < nSnow; i++) {
        const ph = snowSeed[i * 2];
        const speed = snowSeed[i * 2 + 1];
        sp[i * 3 + 1] -= speed * dt * 1.1;
        sp[i * 3] += Math.sin(t * 0.6 + ph) * dt * 0.5;
        if (sp[i * 3 + 1] < -9) sp[i * 3 + 1] = 15;
      }
      snowGeo.attributes.position.needsUpdate = true;

      // shooting stars streak across the sky now and then
      meteorTimer -= dt;
      if (meteorTimer <= 0) {
        const m = meteors.find((mm) => !mm.active);
        if (m) {
          m.active = true;
          m.life = 0;
          const dir = rng() < 0.5 ? 1 : -1;
          m.mesh.position.set(-dir * (14 + rng() * 8), 9 + rng() * 8, -25);
          m.vel.set(dir * (16 + rng() * 8), -(3 + rng() * 3));
          // plane's +x carries the bright head of the streak — aim it along the velocity
          m.mesh.rotation.z = Math.atan2(m.vel.y, m.vel.x);
        }
        meteorTimer = 5 + rng() * 9;
      }
      for (const m of meteors) {
        if (!m.active) continue;
        m.life += dt;
        m.mesh.position.x += m.vel.x * dt;
        m.mesh.position.y += m.vel.y * dt;
        m.mat.opacity = Math.sin(Math.min(m.life / 1.6, 1) * Math.PI) * lerp(0.5, 0.9, mix);
        if (m.life > 1.6) {
          m.active = false;
          m.mat.opacity = 0;
        }
      }

      stage.render();
    },
    setDark(d) {
      targetMix = d ? 1 : 0;
    },
    resize(w, h) {
      stage.resize(w, h);
      for (const st of stages) {
        if (st.ready) {
          st.mesh.userData.zoom = 1;
          layout(st);
        }
      }
    },
    dispose() {
      stage.dispose();
    },
  };
}
