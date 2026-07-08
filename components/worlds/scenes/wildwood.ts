/**
 * WILDWOOD — a cinematic walk through real forest photography.
 * Three 4K photographs (Unsplash License — free for commercial use) form a
 * scroll journey: a sunlit trail → misty golden pines → a mountain-sunset
 * overlook. Each stage slowly zooms (Ken Burns), pans against the pointer,
 * pushes in as you scroll, and crossfades into the next. A live atmosphere
 * layer — god rays, drifting fog, pollen, falling leaves, butterflies and
 * birds by day, fireflies by night — keeps the forest breathing. Dark mode
 * grades the photography into a moonlit night.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import { withBasePath } from "@/lib/basePath";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "leaf",
  colors: ["#9ccb77", "#6f9c4f", "#dfa45f"],
  rate: 18,
  gravity: 60,
  drift: 42,
  size: [3, 5.5],
  life: [0.8, 1.7],
};

const PHOTOS = ["/worlds/wildwood-1.webp", "/worlds/wildwood-2.webp", "/worlds/wildwood-3.webp"];

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
  const rng = mulberry32(7314);
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

  /* --- god rays --- */
  const rayTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(255, 244, 205, 0.55)");
    grad.addColorStop(1, "rgba(255, 244, 205, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    g.globalCompositeOperation = "destination-in";
    const gx = g.createLinearGradient(0, 0, 64, 0);
    gx.addColorStop(0, "rgba(0,0,0,0)");
    gx.addColorStop(0.5, "rgba(255,255,255,1)");
    gx.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gx;
    g.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const rays: THREE.Mesh[] = [];
  for (let i = 0; i < (high ? 6 : 4); i++) {
    const ray = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5 + rng() * 4, 30),
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    ray.position.set(-14 + i * 6 + rng() * 3, 6 + rng() * 3, -18 - rng() * 6);
    ray.rotation.z = -0.32 + rng() * 0.1;
    scene.add(ray);
    rays.push(ray);
  }

  /* --- drifting fog banks --- */
  const fogSprites: THREE.Sprite[] = [];
  for (let i = 0; i < (high ? 7 : 4); i++) {
    const f = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture("rgba(228, 236, 224, 0.5)"),
        transparent: true,
        opacity: 0.1 + rng() * 0.07,
        depthWrite: false,
      })
    );
    f.scale.set(22 + rng() * 20, 4.5 + rng() * 3.5, 1);
    f.position.set((rng() - 0.5) * 34, -6 + rng() * 6, -12 - rng() * 12);
    scene.add(f);
    fogSprites.push(f);
  }

  /* --- pollen (day) + fireflies (night) --- */
  const makeDrifters = (n: number, color: string, size: number, yLo: number, yHi: number) => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    const seeds: number[] = [];
    for (let i = 0; i < n; i++) {
      p[i * 3] = (rng() - 0.5) * 38;
      p[i * 3 + 1] = yLo + rng() * (yHi - yLo);
      p[i * 3 + 2] = -6 - rng() * 18;
      seeds.push(rng() * 10, 0.3 + rng() * 0.7);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({
      map: glowTexture(color, "rgba(0,0,0,0)", 32),
      size,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return { geo, mat, seeds, n };
  };
  const pollen = makeDrifters(high ? 300 : 150, "rgba(255, 236, 180, 0.9)", 0.16, -4, 8);
  const fireflies = makeDrifters(high ? 130 : 70, "rgba(255, 226, 120, 1)", 0.34, -7, 2);

  /* --- falling leaves --- */
  const leafMat = new THREE.MeshBasicMaterial({
    color: "#7e8f42",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const nLeaves = high ? 80 : 40;
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.11, 0.08), leafMat, nLeaves);
  leaves.frustumCulled = false;
  const leafSeed: number[] = [];
  for (let i = 0; i < nLeaves; i++) {
    leafSeed.push((rng() - 0.5) * 30, rng() * 40, -5 - rng() * 14, 0.5 + rng() * 0.9, rng() * Math.PI * 2);
  }
  scene.add(leaves);
  const dummy = new THREE.Object3D();

  /* --- butterflies (day) --- */
  interface Butterfly {
    group: THREE.Group;
    wingL: THREE.Mesh;
    wingR: THREE.Mesh;
    anchor: THREE.Vector3;
    phase: number;
  }
  const butterflies: Butterfly[] = [];
  const wingGeo = new THREE.PlaneGeometry(0.16, 0.22);
  wingGeo.translate(0.08, 0, 0);
  for (let i = 0; i < 2; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i ? "#e07a5f" : "#f2b64c",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const group = new THREE.Group();
    const wingL = new THREE.Mesh(wingGeo, mat);
    const wingR = new THREE.Mesh(wingGeo, mat);
    wingR.rotation.y = Math.PI;
    group.add(wingL, wingR);
    const anchor = new THREE.Vector3(i ? 5 : -6, -3.5 + i, -8 - i * 2);
    group.position.copy(anchor);
    scene.add(group);
    butterflies.push({ group, wingL, wingR, anchor, phase: rng() * 9 });
  }

  /* --- bird flocks (day) --- */
  const birdTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 32;
    const g = c.getContext("2d")!;
    g.strokeStyle = "rgba(20, 24, 20, 0.9)";
    g.lineWidth = 3.4;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(6, 16);
    g.quadraticCurveTo(20, 4, 32, 15);
    g.quadraticCurveTo(44, 4, 58, 16);
    g.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  interface Flock {
    group: THREE.Group;
    mat: THREE.SpriteMaterial;
    birds: THREE.Sprite[];
    vel: number;
    life: number;
    active: boolean;
  }
  const flocks: Flock[] = [];
  for (let f = 0; f < 2; f++) {
    const group = new THREE.Group();
    const mat = new THREE.SpriteMaterial({ map: birdTex, transparent: true, opacity: 0, depthWrite: false });
    const birds: THREE.Sprite[] = [];
    for (let b = 0; b < 4; b++) {
      const s = new THREE.Sprite(mat);
      s.scale.set(1.3, 0.65, 1);
      s.position.set(b * 1.3 - 2, -Math.abs(b - 1.5) * 0.45, 0);
      group.add(s);
      birds.push(s);
    }
    scene.add(group);
    flocks.push({ group, mat, birds, vel: 0, life: 0, active: false });
  }
  let flockTimer = 3;

  /* --- day / night --- */
  const P = {
    bgDay: new THREE.Color("#0e150e"),
    bgNight: new THREE.Color("#04080a"),
    gradeDay: new THREE.Color("#ffffff"),
    gradeNight: new THREE.Color("#54617f"),
    rayDay: new THREE.Color("#fff4cd"),
    rayNight: new THREE.Color("#9db4e8"),
  };
  let mix = ctx.dark ? 1 : 0;
  let targetMix = mix;
  const grade = new THREE.Color();

  return {
    update(t, dt, io) {
      mix += (targetMix - mix) * Math.min(dt * 2, 1);
      const day = 1 - mix;
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

      // god rays shimmer; cool faint moonbeams at night
      for (let i = 0; i < rays.length; i++) {
        const m = rays[i].material as THREE.MeshBasicMaterial;
        m.opacity = (0.11 + Math.sin(t * 0.5 + i * 1.9) * 0.045) * lerp(1, 0.35, mix);
        m.color.copy(P.rayDay).lerp(P.rayNight, mix);
      }

      for (let i = 0; i < fogSprites.length; i++) {
        fogSprites[i].position.x += Math.sin(t * 0.07 + i * 2.1) * dt * 0.8;
        fogSprites[i].material.opacity = (0.09 + Math.sin(t * 0.18 + i) * 0.035) * lerp(1, 1.5, mix);
      }

      pollen.mat.opacity = 0.6 * day;
      fireflies.mat.opacity = 0.2 + 0.8 * mix;
      for (const sys of [pollen, fireflies]) {
        const arr = sys.geo.attributes.position.array as Float32Array;
        for (let i = 0; i < sys.n; i++) {
          const ph = sys.seeds[i * 2];
          const sp = sys.seeds[i * 2 + 1];
          arr[i * 3] += Math.sin(t * sp + ph) * dt * 0.55;
          arr[i * 3 + 1] += Math.cos(t * sp * 0.8 + ph * 2) * dt * 0.4;
        }
        sys.geo.attributes.position.needsUpdate = true;
      }

      for (let i = 0; i < nLeaves; i++) {
        const x0 = leafSeed[i * 5];
        const off = leafSeed[i * 5 + 1];
        const z0 = leafSeed[i * 5 + 2];
        const sp = leafSeed[i * 5 + 3];
        const ph = leafSeed[i * 5 + 4];
        const fall = (off + t * sp) % 16;
        dummy.position.set(x0 + Math.sin(t * 0.7 + ph) * 1.4, 8 - fall, z0);
        dummy.rotation.set(t * 2.2 + ph, ph + t, t * 1.5 + ph * 2);
        dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
      }
      leaves.instanceMatrix.needsUpdate = true;

      for (const bf of butterflies) {
        const flap = Math.sin(t * 15 + bf.phase) * 0.75;
        bf.wingL.rotation.y = 0.5 + flap;
        bf.wingR.rotation.y = Math.PI - 0.5 - flap;
        bf.group.position.set(
          bf.anchor.x + Math.sin(t * 0.45 + bf.phase) * 2,
          bf.anchor.y + Math.sin(t * 1.2 + bf.phase * 2) * 0.5,
          bf.anchor.z + Math.cos(t * 0.35 + bf.phase) * 1.2
        );
        bf.group.rotation.y = Math.sin(t * 0.45 + bf.phase) * 1.1;
        bf.group.visible = day > 0.35;
      }

      flockTimer -= dt;
      if (flockTimer <= 0 && mix < 0.5) {
        const fl = flocks.find((f) => !f.active);
        if (fl) {
          fl.active = true;
          fl.life = 0;
          const dir = rng() < 0.5 ? 1 : -1;
          fl.vel = dir * (4 + rng() * 3);
          fl.group.position.set(-dir * 26, 4 + rng() * 5, -16 - rng() * 6);
        }
        flockTimer = 7 + rng() * 9;
      }
      for (const fl of flocks) {
        if (!fl.active) continue;
        fl.life += dt;
        fl.group.position.x += fl.vel * dt;
        fl.group.position.y += Math.sin(t * 0.8) * dt * 0.4;
        fl.mat.opacity = Math.sin(Math.min(fl.life / 13, 1) * Math.PI) * 0.8 * day;
        for (let b = 0; b < fl.birds.length; b++) {
          fl.birds[b].scale.y = 0.4 + Math.abs(Math.sin(t * 9 + b * 1.4)) * 0.45;
        }
        if (fl.life > 13) {
          fl.active = false;
          fl.mat.opacity = 0;
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
