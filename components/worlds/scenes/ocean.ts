/**
 * OCEAN — an underwater dive. Scrolling descends from sunlit shallows
 * toward the deep: the water darkens, sun shafts fade, fish school around
 * you, jellyfish pulse upward. Dark mode starts the dive at night.
 */
import * as THREE from "three";
import { makeStage, glowTexture, mulberry32, lerp } from "../lib";
import type { World, WorldContext, CursorConfig } from "../types";

export const cursor: CursorConfig = {
  shape: "bubble",
  colors: ["rgba(165,243,252,0.9)", "rgba(125,211,252,0.8)"],
  rate: 22,
  gravity: -140,
  drift: 26,
  size: [2, 5.5],
  life: [0.6, 1.4],
};

export function createWorld(ctx: WorldContext): World | null {
  const stage = makeStage(ctx.canvas, ctx.tier, {
    fov: 62,
    far: 260,
    width: ctx.width,
    height: ctx.height,
  });
  if (!stage) return null;
  const { scene, camera } = stage;
  const rng = mulberry32(700);
  const high = ctx.tier === "high";
  let dark = ctx.dark;

  const bg = new THREE.Color();
  scene.background = bg;
  scene.fog = new THREE.FogExp2("#06425c", 0.02);

  // --- sun disc + light shafts near the surface
  const sun = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture("rgba(255,255,235,0.95)"),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  sun.scale.set(60, 60, 1);
  sun.position.set(10, 55, -60);
  scene.add(sun);

  const shaftTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(220,250,255,0.55)");
    grad.addColorStop(1, "rgba(220,250,255,0)");
    g.fillStyle = grad;
    const gx = g.createLinearGradient(0, 0, 64, 0);
    gx.addColorStop(0, "rgba(0,0,0,0)");
    gx.addColorStop(0.5, "rgba(255,255,255,1)");
    gx.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = gx;
    g.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const shafts: THREE.Mesh[] = [];
  const shaftCount = high ? 7 : 4;
  for (let i = 0; i < shaftCount; i++) {
    const shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(7 + rng() * 10, 90),
      new THREE.MeshBasicMaterial({
        map: shaftTex,
        transparent: true,
        opacity: 0.2 + rng() * 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    shaft.position.set(-40 + i * (90 / shaftCount) + rng() * 8, 22, -46 - rng() * 30);
    shaft.rotation.z = -0.22 + rng() * 0.1;
    scene.add(shaft);
    shafts.push(shaft);
  }

  // --- bubbles rising through the whole dive column
  const bubbleCount = high ? 320 : 150;
  const bubblePos = new Float32Array(bubbleCount * 3);
  const bubbleSeed: number[] = [];
  for (let i = 0; i < bubbleCount; i++) {
    bubblePos[i * 3] = (rng() - 0.5) * 120;
    bubblePos[i * 3 + 1] = 0;
    bubblePos[i * 3 + 2] = -10 - rng() * 90;
    bubbleSeed.push(rng() * 140, 3 + rng() * 5, rng() * 10); // offset, speed, phase
  }
  const bubbleGeo = new THREE.BufferGeometry();
  bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePos, 3));
  const bubbles = new THREE.Points(
    bubbleGeo,
    new THREE.PointsMaterial({
      map: glowTexture("rgba(190,240,255,0.9)", "rgba(190,240,255,0)", 32),
      color: "#bfefff",
      size: 0.9,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  bubbles.frustumCulled = false;
  scene.add(bubbles);

  // --- fish schools: instanced tapered bodies following orbital paths
  const fishCount = high ? 48 : 26;
  const fishGeo = new THREE.ConeGeometry(0.32, 1.6, 6);
  fishGeo.rotateX(Math.PI / 2); // nose forward along +Z
  const fish = new THREE.InstancedMesh(
    fishGeo,
    new THREE.MeshLambertMaterial({ color: "#ffffff" }),
    fishCount
  );
  const schoolTints = [new THREE.Color("#7dd3fc"), new THREE.Color("#fbbf24"), new THREE.Color("#a5b4fc")];
  const fishData: { school: number; radius: number; speed: number; phase: number; y: number; wob: number }[] = [];
  const tintC = new THREE.Color();
  for (let i = 0; i < fishCount; i++) {
    const school = i % 3;
    fishData.push({
      school,
      radius: 9 + rng() * 7,
      speed: 0.25 + rng() * 0.2,
      phase: rng() * Math.PI * 2,
      y: (rng() - 0.5) * 4,
      wob: rng() * 10,
    });
    tintC.copy(schoolTints[school]).offsetHSL(0, 0, (rng() - 0.5) * 0.15);
    fish.setColorAt(i, tintC);
  }
  scene.add(fish);
  const schoolCenters = [
    new THREE.Vector3(-16, -6, -34),
    new THREE.Vector3(18, -26, -40),
    new THREE.Vector3(-6, -48, -30),
  ];
  const dummy = new THREE.Object3D();

  // --- jellyfish: pulsing translucent domes with trailing tentacles
  interface Jelly {
    group: THREE.Group;
    dome: THREE.Mesh;
    tentacles: THREE.Line[];
    speed: number;
    phase: number;
    base: THREE.Vector3;
  }
  const jellies: Jelly[] = [];
  const jellyCount = high ? 4 : 3;
  for (let i = 0; i < jellyCount; i++) {
    const group = new THREE.Group();
    const color = i % 2 ? "#f0abfc" : "#a5f3fc";
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    group.add(dome);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(i % 2 ? "rgba(240,171,252,0.8)" : "rgba(165,243,252,0.8)"),
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.setScalar(5);
    group.add(glow);
    const tentacles: THREE.Line[] = [];
    for (let k = 0; k < 6; k++) {
      const pts = new Float32Array(8 * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
        })
      );
      line.frustumCulled = false;
      group.add(line);
      tentacles.push(line);
    }
    const base = new THREE.Vector3((rng() - 0.5) * 60, -20 - rng() * 45, -26 - rng() * 40);
    group.position.copy(base);
    scene.add(group);
    jellies.push({ group, dome, tentacles, speed: 0.5 + rng() * 0.5, phase: rng() * 9, base });
  }

  // --- sea floor hints at the bottom of the dive
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 200),
    new THREE.MeshBasicMaterial({ color: "#032535" })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -86, -60);
  scene.add(floor);
  for (let i = 0; i < 8; i++) {
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2 + rng() * 4, 0),
      new THREE.MeshLambertMaterial({ color: "#0a3247" })
    );
    rock.position.set((rng() - 0.5) * 120, -85 + rng() * 2, -30 - rng() * 70);
    rock.scale.y = 0.5 + rng() * 0.4;
    scene.add(rock);
  }

  scene.add(new THREE.AmbientLight("#9fd2e4", 0.9));
  const keyLight = new THREE.DirectionalLight("#e0f6ff", 1.4);
  keyLight.position.set(4, 10, 6);
  scene.add(keyLight);

  const shallow = { day: new THREE.Color("#0e5c7e"), night: new THREE.Color("#06283c") };
  const deep = { day: new THREE.Color("#021826"), night: new THREE.Color("#010b12") };
  const fogC = new THREE.Color();

  return {
    update(t, dt, io) {
      const depth = io.scroll;
      const y = lerp(6, -78, depth);
      camera.position.set(io.px * 5, y + Math.sin(t * 0.5) * 0.5, 0);
      camera.lookAt(io.px * 2, y - 2 - io.py * 3, -18);

      // water darkens with depth (and at night)
      const from = dark ? shallow.night : shallow.day;
      const to = dark ? deep.night : deep.day;
      bg.copy(from).lerp(to, Math.min(depth * 1.25, 1));
      fogC.copy(bg).offsetHSL(0, 0.05, 0.04);
      (scene.fog as THREE.FogExp2).color.copy(fogC);

      const surfaceLight = Math.max(1 - depth * 1.6, 0) * (dark ? 0.35 : 1);
      sun.material.opacity = 0.85 * surfaceLight;
      for (let i = 0; i < shafts.length; i++) {
        const mat = shafts[i].material as THREE.MeshBasicMaterial;
        mat.opacity = (0.16 + Math.sin(t * 0.7 + i * 2.1) * 0.06) * surfaceLight;
        shafts[i].rotation.z = -0.18 + Math.sin(t * 0.15 + i) * 0.05;
      }

      // bubbles rise forever through the column
      const bp = bubbleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        const off = bubbleSeed[i * 3];
        const speed = bubbleSeed[i * 3 + 1];
        const phase = bubbleSeed[i * 3 + 2];
        bp[i * 3 + 1] = ((off + t * speed) % 140) - 100;
        bp[i * 3] += Math.sin(t * 1.4 + phase) * dt * 0.6;
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      // fish schools orbit their centers, noses along the path
      for (let i = 0; i < fishCount; i++) {
        const f = fishData[i];
        const c = schoolCenters[f.school];
        const a = t * f.speed + f.phase;
        const wob = Math.sin(t * 3 + f.wob) * 0.4;
        dummy.position.set(
          c.x + Math.cos(a) * f.radius,
          c.y + f.y + Math.sin(a * 2.3) * 1.6 + wob * 0.2,
          c.z + Math.sin(a) * f.radius * 0.7
        );
        dummy.lookAt(
          c.x + Math.cos(a + 0.12) * f.radius,
          c.y + f.y + Math.sin((a + 0.12) * 2.3) * 1.6,
          c.z + Math.sin(a + 0.12) * f.radius * 0.7
        );
        dummy.rotation.z = wob * 0.4;
        dummy.updateMatrix();
        fish.setMatrixAt(i, dummy.matrix);
      }
      fish.instanceMatrix.needsUpdate = true;

      // jellyfish pulse and drift upward
      for (const j of jellies) {
        const pulse = Math.sin(t * j.speed * 2 + j.phase);
        j.dome.scale.set(1 + pulse * 0.12, 1 - pulse * 0.18, 1 + pulse * 0.12);
        j.group.position.y = j.base.y + ((t * j.speed * 1.2 + j.phase * 4) % 70);
        if (j.group.position.y > 20) j.group.position.y -= 70;
        j.group.position.x = j.base.x + Math.sin(t * 0.3 + j.phase) * 2.5;
        for (let k = 0; k < j.tentacles.length; k++) {
          const arr = j.tentacles[k].geometry.attributes.position.array as Float32Array;
          const ang = (k / j.tentacles.length) * Math.PI * 2;
          const rx = Math.cos(ang) * 0.7;
          const rz = Math.sin(ang) * 0.7;
          for (let s = 0; s < 8; s++) {
            const seg = s / 7;
            arr[s * 3] = rx + Math.sin(t * 2 + j.phase + seg * 4 + k) * seg * 0.5;
            arr[s * 3 + 1] = -seg * 4.5 * (1 + pulse * 0.08);
            arr[s * 3 + 2] = rz + Math.cos(t * 1.7 + j.phase + seg * 3 + k) * seg * 0.5;
          }
          j.tentacles[k].geometry.attributes.position.needsUpdate = true;
        }
      }

      stage.render();
    },
    setDark(d) {
      dark = d;
    },
    resize(w, h) {
      stage.resize(w, h);
    },
    dispose() {
      stage.dispose();
    },
  };
}
