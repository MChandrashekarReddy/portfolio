/**
 * SAKURA — spring in Japan, photographed for real.
 * Three 4K photographs (Unsplash License — free for commercial use) form a
 * scroll journey: under a pink blossom canopy → Mount Fuji framed by cherry
 * branches → the lantern-lit Meguro river in full bloom. Each stage slowly
 * zooms (Ken Burns), pans against the pointer, pushes in as you scroll, and
 * crossfades into the next. A living spring layer drifts on top: fluttering
 * petals riding occasional wind gusts, warm light rays and sun motes,
 * butterflies by day, glowing lantern bokeh by night. Dark mode grades the
 * photography into a hanami evening.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import { withBasePath } from "@/lib/basePath";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "petal",
  colors: ["#f7c8d4", "#f2a7bb", "#ffdde5"],
  rate: 18,
  gravity: 42,
  drift: 55,
  size: [3.5, 6],
  life: [0.9, 1.8],
};

const PHOTOS = ["/worlds/sakura-1.webp", "/worlds/sakura-2.webp", "/worlds/sakura-3.webp"];

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
  const rng = mulberry32(4128);
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

  /* --- warm light rays --- */
  const rayTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(255, 233, 224, 0.5)");
    grad.addColorStop(1, "rgba(255, 233, 224, 0)");
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
  for (let i = 0; i < (high ? 5 : 3); i++) {
    const ray = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5 + rng() * 3.5, 28),
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    ray.position.set(-12 + i * 6.5 + rng() * 3, 6 + rng() * 3, -18 - rng() * 6);
    ray.rotation.z = -0.28 + rng() * 0.1;
    scene.add(ray);
    rays.push(ray);
  }

  /* --- fluttering petals riding wind gusts --- */
  const petalTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgba(248, 198, 212, 0.96)";
    g.beginPath();
    // single sakura petal: teardrop with the classic notched tip
    g.moveTo(32, 6);
    g.bezierCurveTo(50, 14, 56, 34, 44, 52);
    g.quadraticCurveTo(38, 58, 32, 52);
    g.quadraticCurveTo(26, 58, 20, 52);
    g.bezierCurveTo(8, 34, 14, 14, 32, 6);
    g.fill();
    g.fillStyle = "rgba(255, 235, 241, 0.55)";
    g.beginPath();
    g.ellipse(30, 26, 8, 14, -0.4, 0, Math.PI * 2);
    g.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const petalMat = new THREE.MeshBasicMaterial({
    map: petalTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const nPetals = high ? 150 : 75;
  const petals = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.16), petalMat, nPetals);
  petals.frustumCulled = false;
  const petalSeed: number[] = [];
  for (let i = 0; i < nPetals; i++) {
    petalSeed.push(
      (rng() - 0.5) * 34, // x home
      rng() * 40, // fall offset
      -5 - rng() * 16, // z
      0.35 + rng() * 0.65, // fall speed
      rng() * Math.PI * 2 // phase
    );
  }
  scene.add(petals);
  const dummy = new THREE.Object3D();
  let gust = 0; // eased wind strength, retargeted on a timer
  let gustTarget = 0;
  let gustTimer = 5;

  /* --- sun motes (day) + lantern bokeh (night) --- */
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
  const motes = makeDrifters(high ? 260 : 130, "rgba(255, 240, 230, 0.9)", 0.15, -4, 9);
  const lanterns = makeDrifters(high ? 90 : 50, "rgba(255, 190, 120, 1)", 0.5, -7, 3);

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
      color: i ? "#fef0f4" : "#f2b0c4",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const group = new THREE.Group();
    const wingL = new THREE.Mesh(wingGeo, mat);
    const wingR = new THREE.Mesh(wingGeo, mat);
    wingR.rotation.y = Math.PI;
    group.add(wingL, wingR);
    const anchor = new THREE.Vector3(i ? 5.5 : -6, -3 + i, -8 - i * 2);
    group.position.copy(anchor);
    scene.add(group);
    butterflies.push({ group, wingL, wingR, anchor, phase: rng() * 9 });
  }

  /* --- day / hanami evening --- */
  const P = {
    bgDay: new THREE.Color("#41333c"),
    bgNight: new THREE.Color("#120e1c"),
    gradeDay: new THREE.Color("#ffffff"),
    gradeNight: new THREE.Color("#9187b2"),
    rayDay: new THREE.Color("#ffe9e0"),
    rayNight: new THREE.Color("#b7a7e6"),
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

      // light rays shimmer by day, fade to cool lantern haze at night
      for (let i = 0; i < rays.length; i++) {
        const m = rays[i].material as THREE.MeshBasicMaterial;
        m.opacity = (0.09 + Math.sin(t * 0.5 + i * 1.9) * 0.035) * lerp(1, 0.4, mix);
        m.color.copy(P.rayDay).lerp(P.rayNight, mix);
      }

      // wind: ease toward a new gust strength every few seconds
      gustTimer -= dt;
      if (gustTimer <= 0) {
        gustTarget = rng() < 0.45 ? 1.5 + rng() * 2.5 : 0.2 + rng() * 0.5;
        gustTimer = 4 + rng() * 6;
      }
      gust += (gustTarget - gust) * Math.min(dt * 0.7, 1);
      const breeze = gust + Math.sin(t * 0.4) * 0.3;

      // petals: flutter down, swept sideways by the breeze
      for (let i = 0; i < nPetals; i++) {
        const x0 = petalSeed[i * 5];
        const off = petalSeed[i * 5 + 1];
        const z0 = petalSeed[i * 5 + 2];
        const sp = petalSeed[i * 5 + 3];
        const ph = petalSeed[i * 5 + 4];
        const fall = (off + t * sp) % 18;
        const sway = Math.sin(t * 1.1 + ph) * 1.6 + Math.sin(t * 0.31 + ph * 2) * 0.9;
        const drift = ((off + t * sp * breeze * 0.55) % 24) - 6;
        dummy.position.set(x0 + sway + drift * 0.35, 8.5 - fall, z0);
        dummy.rotation.set(t * 1.6 + ph, ph + t * 1.1, t * 1.3 + ph * 2);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;
      petalMat.opacity = lerp(0.9, 0.65, mix);

      // motes by day, warm lantern bokeh after dark
      motes.mat.opacity = 0.55 * day;
      lanterns.mat.opacity = 0.15 + 0.75 * mix;
      for (const sys of [motes, lanterns]) {
        const arr = sys.geo.attributes.position.array as Float32Array;
        for (let i = 0; i < sys.n; i++) {
          const ph = sys.seeds[i * 2];
          const sp = sys.seeds[i * 2 + 1];
          arr[i * 3] += Math.sin(t * sp + ph) * dt * 0.5;
          arr[i * 3 + 1] += Math.cos(t * sp * 0.8 + ph * 2) * dt * 0.35;
        }
        sys.geo.attributes.position.needsUpdate = true;
      }

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
