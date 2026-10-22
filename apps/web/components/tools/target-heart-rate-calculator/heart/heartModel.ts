import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";

/**
 * Procedural anatomical heart, built 100% in code (no models, no textures).
 *
 * Frame: anterior view. +x = viewer's right = the patient's LEFT, +y = up (towards the head),
 * +z = anterior (towards the viewer). The apex therefore sits low on the viewer's right, the
 * right atrium high on the viewer's left, the left atrium high at the back.
 *
 * Body: a smooth metaball field of rotated ellipsoids (LV, RV, RA, LA, both auricles, outflow
 * tracts) polygonised once with MarchingCubes and copied into a static geometry. Vessels are
 * tapered TubeGeometry along Catmull-Rom curves; coronaries are projected onto the field's
 * iso-surface so they lie in the grooves. One shared shader patch deforms every part with the
 * same atrial / ventricular contraction, so vessels and coronaries move with the muscle.
 */

type Lobe = { c: THREE.Vector3; r: THREE.Vector3; inv: THREE.Matrix3; w: number };

const K = 2.2;
const ISO = Math.exp(-K);
/** Half-extent of the marching-cubes box in heart units. */
const EXTENT = 1.55;

function lobe(c: [number, number, number], r: [number, number, number], rot: [number, number, number] = [0, 0, 0], w = 1): Lobe {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
  const inv = new THREE.Matrix3().setFromMatrix4(m).transpose();
  return { c: new THREE.Vector3(...c), r: new THREE.Vector3(...r), inv, w };
}

/** Long axis of the ventricles: base (under the AV groove) towards the apex, low on the viewer's right. */
const TILT = -0.62;
const LOBES: Lobe[] = [
  // Left ventricle: thick conical mass, posterior-left, forms the apex.
  lobe([0.22, -0.18, -0.08], [0.62, 0.95, 0.66], [0.05, 0, TILT + 0.08]),
  lobe([0.56, -0.76, -0.02], [0.32, 0.48, 0.36], [0, 0, TILT], 0.85),
  lobe([0.68, -1.0, 0.0], [0.17, 0.22, 0.19], [0, 0, TILT], 0.8),
  // Right ventricle: wraps the front, flatter, stops short of the apex.
  lobe([-0.22, -0.2, 0.28], [0.62, 0.72, 0.4], [0.15, 0.2, TILT + 0.18]),
  lobe([0.02, -0.55, 0.3], [0.38, 0.42, 0.28], [0, 0, TILT], 0.8),
  // Infundibulum (RV outflow) rising to the pulmonary trunk.
  lobe([0.02, 0.28, 0.36], [0.24, 0.3, 0.22], [0, 0, -0.2], 0.9),
  // Right atrium + right auricle (overlapping the aortic root).
  lobe([-0.72, 0.32, 0.02], [0.4, 0.46, 0.42], [0, 0, 0.15]),
  lobe([-0.42, 0.56, 0.36], [0.26, 0.15, 0.16], [0.2, 0, 0.45], 0.85),
  // Left atrium (posterior) + left auricle peeking out on the viewer's right.
  lobe([0.2, 0.42, -0.5], [0.52, 0.32, 0.36], [0, 0, 0.05]),
  lobe([0.56, 0.36, 0.08], [0.2, 0.12, 0.16], [0.2, 0, -0.5], 0.85),
  // Aortic root between the atria.
  lobe([-0.16, 0.38, 0.08], [0.2, 0.26, 0.2], [0, 0, 0.1], 0.9),
];

const tmp = new THREE.Vector3();

/** Smooth metaball field: > ISO inside. */
export function field(x: number, y: number, z: number): number {
  let s = 0;
  for (const l of LOBES) {
    tmp.set(x - l.c.x, y - l.c.y, z - l.c.z).applyMatrix3(l.inv);
    const q = (tmp.x / l.r.x) ** 2 + (tmp.y / l.r.y) ** 2 + (tmp.z / l.r.z) ** 2;
    s += l.w * Math.exp(-K * q);
  }
  // Gentle sculpting: shallow sulci at the AV groove and the interventricular groove.
  const av = avDist(x, y, z);
  s -= 0.25 * ISO * Math.exp(-((av / 0.07) ** 2));
  return s;
}

const AV_N = new THREE.Vector3(-0.42, 1, -0.22).normalize();
const AV_P = new THREE.Vector3(-0.05, 0.14, 0);
/** Signed distance from the atrioventricular (coronary) groove plane; > 0 on the atrial side. */
export function avDist(x: number, y: number, z: number): number {
  return (x - AV_P.x) * AV_N.x + (y - AV_P.y) * AV_N.y + (z - AV_P.z) * AV_N.z;
}

function gradient(p: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
  const e = 0.004;
  return out
    .set(
      field(p.x + e, p.y, p.z) - field(p.x - e, p.y, p.z),
      field(p.x, p.y + e, p.z) - field(p.x, p.y - e, p.z),
      field(p.x, p.y, p.z + e) - field(p.x, p.y, p.z - e),
    )
    .multiplyScalar(-1)
    .normalize();
}

/** Project a guess onto the iso-surface along the ray from an interior point, lifted `lift` outward. */
function onSurface(g: THREE.Vector3, center: THREE.Vector3, lift: number): THREE.Vector3 {
  const d = g.clone().sub(center).normalize();
  let lo = 0;
  let hi = 2.6;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    const p = center.clone().addScaledVector(d, mid);
    if (field(p.x, p.y, p.z) > ISO) lo = mid;
    else hi = mid;
  }
  const p = center.clone().addScaledVector(d, lo);
  return p.addScaledVector(gradient(p, new THREE.Vector3()), lift);
}

const V_CENTER = new THREE.Vector3(0.1, -0.25, 0.02);
const A_CENTER = new THREE.Vector3(-0.15, 0.38, -0.15);

type Pts = [number, number, number][];
const surf = (pts: Pts, lift: number, center = V_CENTER) => pts.map((p) => onSurface(new THREE.Vector3(...p), center, lift));

/** Tube that tapers from r0 to r1 (TubeGeometry rings are pulled towards the curve). */
export function taperedTube(curve: THREE.Curve<THREE.Vector3>, r0: number, r1: number, seg = 64, radial = 12): THREE.BufferGeometry {
  const g = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    curve.getPointAt(t, c);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  pos.needsUpdate = true;
  // Rounded caps so cut ends never look hollow.
  const caps = [0, 1].map((t) => {
    const s = new THREE.SphereGeometry(t === 0 ? r0 : r1, radial, 8);
    const p = curve.getPointAt(t);
    s.translate(p.x, p.y, p.z);
    return s;
  });
  const merged = mergeGeoms([g, ...caps]);
  [g, ...caps].forEach((x) => x.dispose());
  return merged;
}

/** Minimal non-indexed merge of position/normal (avoids pulling in BufferGeometryUtils). */
export function mergeGeoms(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array as Float32Array, o * 3);
    nor.set(g.attributes.normal.array as Float32Array, o * 3);
    o += g.attributes.position.count;
  }
  parts.forEach((g, i) => g !== list[i] && g.dispose());
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return out;
}

const curve = (pts: (THREE.Vector3 | [number, number, number])[]) =>
  new THREE.CatmullRomCurve3(pts.map((p) => (p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p))), false, "centripetal");

/** A coronary branch: projected guesses → tapered tube. */
function vessel(pts: Pts, r0: number, r1: number, center = V_CENTER, lift?: number): THREE.BufferGeometry {
  return taperedTube(curve(surf(pts, lift ?? r0 * 0.55, center)), r0, r1, Math.max(24, pts.length * 14), 8);
}

// Anterior interventricular groove (LAD + great cardiac vein): from under the pulmonary trunk to
// just right of the apex.
const LAD_PATH: Pts = [
  [0.22, 0.16, 0.5],
  [0.26, -0.05, 0.58],
  [0.3, -0.3, 0.55],
  [0.36, -0.58, 0.45],
  [0.46, -0.86, 0.3],
  [0.56, -1.1, 0.12],
  [0.6, -1.22, -0.06],
];

export type HeartParts = {
  body: THREE.BufferGeometry;
  arteries: THREE.BufferGeometry;
  veins: THREE.BufferGeometry;
  aorta: THREE.BufferGeometry;
  pulmonary: THREE.BufferGeometry;
  venaCava: THREE.BufferGeometry;
  pulmonaryVeins: THREE.BufferGeometry;
};

/** Cheap hash noise for fat patches / muscle tint (CPU side, per vertex). */
function vnoise(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  const a = Math.sin(x * 5.1 + y * 3.7) * Math.cos(z * 4.3 - y * 2.9);
  return 0.5 + 0.35 * a + 0.15 * (s - Math.floor(s) - 0.5);
}

function distToPolyline(p: THREE.Vector3, line: THREE.Vector3[]): number {
  let best = Infinity;
  const ab = new THREE.Vector3();
  const ap = new THREE.Vector3();
  for (let i = 0; i < line.length - 1; i++) {
    ab.subVectors(line[i + 1], line[i]);
    ap.subVectors(p, line[i]);
    const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.lengthSq()));
    best = Math.min(best, ap.addScaledVector(ab, -t).length());
  }
  return best;
}

export function buildHeart(resolution = 72): HeartParts {
  // ---- Body: metaball field → MarchingCubes → static geometry ----
  const mc = new MarchingCubes(resolution, new THREE.MeshBasicMaterial(), false, false, 120000);
  mc.isolation = ISO;
  const n = resolution;
  const half = n / 2;
  for (let k = 0; k < n; k++) {
    const z = ((k - half) / half) * EXTENT;
    for (let j = 0; j < n; j++) {
      const y = ((j - half) / half) * EXTENT;
      for (let i = 0; i < n; i++) {
        const x = ((i - half) / half) * EXTENT;
        mc.field[i + j * n + k * n * n] = field(x, y, z);
      }
    }
  }
  mc.update();
  const count = mc.count;
  const srcPos = mc.geometry.attributes.position.array as Float32Array;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = srcPos[i] * EXTENT;
  mc.geometry.dispose();
  (mc.material as THREE.Material).dispose();

  const body = new THREE.BufferGeometry();
  body.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  // Analytic normals from the field gradient (smoother than the grid normals).
  const nor = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const g = new THREE.Vector3();
  const lad = surf(LAD_PATH, 0);
  const muscle = new THREE.Color("#7d1a1d");
  const muscleDark = new THREE.Color("#5a1014");
  const fat = new THREE.Color("#d8b25c");
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    p.fromArray(pos, i * 3);
    gradient(p, g);
    g.toArray(nor, i * 3);
    // Fat: along the AV groove and the interventricular groove, patchy, thinning towards the apex.
    const nz = vnoise(p.x * 3.1, p.y * 3.1, p.z * 3.1);
    const fAv = Math.exp(-((avDist(p.x, p.y, p.z) / (0.06 + 0.05 * nz)) ** 2));
    const fIv = Math.exp(-((distToPolyline(p, lad) / (0.05 + 0.05 * nz)) ** 2)) * THREE.MathUtils.smoothstep(p.y, -1.15, -0.4);
    const f = THREE.MathUtils.clamp(Math.max(fAv, fIv) * (0.45 + 0.85 * nz), 0, 0.95);
    c.copy(muscle).lerp(muscleDark, 0.55 * (1 - nz));
    c.lerp(fat, f);
    c.toArray(col, i * 3);
  }
  body.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  body.setAttribute("color", new THREE.BufferAttribute(col, 3));
  body.computeBoundingSphere();

  // ---- Great vessels ----
  const aortaCurve = curve([
    [-0.14, 0.3, 0.1],
    [-0.2, 0.75, 0.12],
    [-0.12, 1.2, 0.02],
    [0.08, 1.42, -0.16],
    [0.36, 1.42, -0.38],
    [0.56, 1.15, -0.55],
    [0.6, 0.6, -0.68],
    [0.56, -0.1, -0.74],
  ]);
  const branchRoots = [0.33, 0.43, 0.53].map((t) => aortaCurve.getPointAt(t));
  const branches = [
    // Brachiocephalic trunk, then its split into right subclavian + right common carotid.
    taperedTube(curve([branchRoots[0], [-0.16, 1.62, -0.05], [-0.26, 1.82, -0.02]]), 0.085, 0.075, 32, 14),
    taperedTube(curve([[-0.26, 1.82, -0.02], [-0.48, 1.94, 0], [-0.7, 1.96, 0.02]]), 0.06, 0.05, 24, 12),
    taperedTube(curve([[-0.26, 1.82, -0.02], [-0.28, 2.0, -0.02], [-0.3, 2.18, -0.02]]), 0.055, 0.05, 24, 12),
    // Left common carotid.
    taperedTube(curve([branchRoots[1], [0.24, 1.75, -0.24], [0.27, 2.12, -0.24]]), 0.06, 0.05, 32, 12),
    // Left subclavian.
    taperedTube(curve([branchRoots[2], [0.5, 1.7, -0.42], [0.74, 1.9, -0.45], [0.98, 1.92, -0.45]]), 0.068, 0.058, 32, 12),
  ];
  const aorta = mergeGeoms([taperedTube(aortaCurve, 0.17, 0.14, 120, 24), ...branches]);
  branches.forEach((b) => b.dispose());

  const pt = [
    taperedTube(curve([[0.04, 0.3, 0.42], [0.1, 0.7, 0.36], [0.18, 1.0, 0.12], [0.2, 1.06, -0.04]]), 0.17, 0.15, 64, 22),
    // Left pulmonary artery: under the arch, towards the left lung (viewer's right).
    taperedTube(curve([[0.2, 1.06, -0.04], [0.48, 1.08, -0.18], [0.78, 0.98, -0.3], [1.02, 0.9, -0.34]]), 0.12, 0.1, 48, 18),
    // Right pulmonary artery: behind the ascending aorta, towards the right lung.
    taperedTube(curve([[0.2, 1.06, -0.04], [-0.1, 1.02, -0.32], [-0.5, 0.98, -0.4], [-0.9, 0.94, -0.42]]), 0.12, 0.1, 48, 18),
  ];
  const pulmonary = mergeGeoms(pt);
  pt.forEach((x) => x.dispose());

  const vc = [
    // Superior vena cava into the top of the right atrium.
    taperedTube(curve([[-0.66, 1.72, -0.12], [-0.68, 1.2, -0.06], [-0.7, 0.62, 0]]), 0.14, 0.15, 48, 20),
    // Inferior vena cava stub under the right atrium.
    taperedTube(curve([[-0.66, 0.0, -0.12], [-0.64, -0.3, -0.2], [-0.62, -0.55, -0.24]]), 0.15, 0.14, 24, 18),
  ];
  const venaCava = mergeGeoms(vc);
  vc.forEach((x) => x.dispose());

  const pv = [
    [[0.42, 0.5, -0.66], [0.75, 0.6, -0.76], [0.98, 0.66, -0.8]],
    [[0.42, 0.3, -0.7], [0.75, 0.24, -0.8], [0.98, 0.2, -0.84]],
    [[-0.05, 0.5, -0.7], [-0.32, 0.62, -0.84], [-0.52, 0.68, -0.9]],
    [[-0.05, 0.3, -0.74], [-0.32, 0.22, -0.86], [-0.52, 0.18, -0.92]],
  ].map((pts) => taperedTube(curve(pts as Pts), 0.075, 0.07, 24, 12));
  const pulmonaryVeins = mergeGeoms(pv);
  pv.forEach((x) => x.dispose());

  // ---- Coronary arteries (red) ----
  const A = A_CENTER;
  const art = [
    // Left main → LAD down the anterior interventricular groove to the apex.
    vessel([[-0.02, 0.36, 0.22], [0.14, 0.26, 0.42], ...LAD_PATH], 0.032, 0.012),
    // Diagonals across the LV front.
    vessel([[0.29, -0.2, 0.56], [0.48, -0.3, 0.46], [0.66, -0.46, 0.3], [0.78, -0.62, 0.12]], 0.018, 0.008),
    vessel([[0.37, -0.6, 0.44], [0.55, -0.72, 0.3], [0.68, -0.86, 0.12]], 0.015, 0.007),
    vessel([[0.26, 0.0, 0.58], [0.44, 0.0, 0.48], [0.62, -0.08, 0.3], [0.76, -0.18, 0.08]], 0.016, 0.007),
    // Septal-side twigs over the RV.
    vessel([[0.28, -0.42, 0.55], [0.1, -0.5, 0.56], [-0.06, -0.6, 0.5]], 0.012, 0.006),
    // Circumflex: along the AV groove towards the patient's left and back.
    vessel([[0.08, 0.3, 0.32], [0.42, 0.22, 0.3], [0.7, 0.08, 0.12], [0.82, -0.04, -0.2], [0.66, -0.06, -0.55]], 0.026, 0.014, A),
    // Obtuse marginal down the LV side.
    vessel([[0.76, 0.04, 0.02], [0.88, -0.3, -0.04], [0.86, -0.66, -0.06], [0.74, -0.96, -0.08]], 0.017, 0.008),
    // RCA: right along the AV groove, round the acute margin to the back.
    vessel([[-0.2, 0.28, 0.32], [-0.4, 0.14, 0.46], [-0.62, -0.04, 0.4], [-0.76, -0.24, 0.12], [-0.66, -0.36, -0.3], [-0.3, -0.36, -0.62]], 0.03, 0.016, A),
    // Acute marginal down the RV.
    vessel([[-0.66, -0.12, 0.36], [-0.56, -0.42, 0.4], [-0.36, -0.72, 0.36], [-0.12, -0.92, 0.26]], 0.017, 0.008),
    // Posterior descending in the posterior interventricular groove.
    vessel([[-0.3, -0.38, -0.62], [-0.05, -0.62, -0.6], [0.2, -0.9, -0.48], [0.42, -1.1, -0.3]], 0.02, 0.009),
    // Conus branch over the outflow tract.
    vessel([[-0.22, 0.27, 0.34], [-0.12, 0.18, 0.5], [0.0, 0.08, 0.56]], 0.012, 0.006),
  ];
  const arteries = mergeGeoms(art);
  art.forEach((x) => x.dispose());

  // ---- Cardiac veins (bluish) ----
  const offset = (pts: Pts, dx: number, dz = 0): Pts => pts.map(([x, y, z]) => [x + dx, y, z + dz]);
  const vns = [
    // Great cardiac vein beside the LAD, then into the AV groove towards the coronary sinus.
    vessel([...offset(LAD_PATH, 0.07).reverse(), [0.4, 0.22, 0.38], [0.72, 0.14, 0.16], [0.84, 0.02, -0.18]], 0.012, 0.026),
    // Coronary sinus along the posterior AV groove.
    vessel([[0.8, 0.0, -0.3], [0.5, 0.02, -0.62], [0.1, -0.04, -0.72], [-0.4, -0.12, -0.6]], 0.03, 0.036, A),
    // Middle cardiac vein in the posterior groove.
    vessel([[0.5, -1.08, -0.22], [0.26, -0.86, -0.5], [0.0, -0.58, -0.62], [-0.22, -0.3, -0.64]], 0.01, 0.022),
    // Posterior vein of the LV.
    vessel([[0.8, -0.9, -0.2], [0.82, -0.5, -0.4], [0.7, -0.12, -0.52]], 0.01, 0.018),
    // Anterior cardiac veins over the RV.
    vessel([[-0.3, -0.62, 0.48], [-0.48, -0.36, 0.48], [-0.6, -0.08, 0.42]], 0.008, 0.016),
    vessel([[-0.02, -0.4, 0.58], [-0.2, -0.18, 0.56], [-0.36, 0.04, 0.5]], 0.007, 0.014),
    // Small cardiac vein along the acute margin.
    vessel([[-0.42, -0.74, 0.3], [-0.72, -0.4, 0.2], [-0.8, -0.2, -0.05]], 0.008, 0.014),
  ];
  const veins = mergeGeoms(vns);
  vns.forEach((x) => x.dispose());

  return { body, arteries, veins, aorta, pulmonary, venaCava, pulmonaryVeins };
}

export type BeatUniforms = {
  uAtr: { value: number };
  uVen: { value: number };
  uBump: { value: number };
};

export const makeBeatUniforms = (): BeatUniforms => ({ uAtr: { value: 0 }, uVen: { value: 0 }, uBump: { value: 1 } });

const fmt = (v: THREE.Vector3) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;

/**
 * Shared shader patch: the atrial + ventricular contraction (computed from object-space position,
 * so every part of the heart deforms together) and a procedural normal noise for the wet muscle.
 */
export function patchHeartMaterial(mat: THREE.MeshPhysicalMaterial, u: BeatUniforms, bump: number) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAtr = u.uAtr;
    shader.uniforms.uVen = u.uVen;
    shader.uniforms.uBump = u.uBump;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uAtr;
uniform float uVen;
varying vec3 vObjPos;`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
float sAv = dot(position - ${fmt(AV_P)}, ${fmt(AV_N)});
float wA = smoothstep(-0.04, 0.16, sAv) * (1.0 - smoothstep(0.75, 1.05, position.y));
float wV = 1.0 - smoothstep(-0.16, 0.04, sAv);
vec3 toA = transformed - ${fmt(A_CENTER)};
vec3 toV = transformed - ${fmt(V_CENTER)};
transformed -= toA * (0.075 * uAtr * wA);
transformed -= toV * vec3(0.085, 0.06, 0.085) * (uVen * wV);
// Slight wringing twist of the ventricles during systole.
float tw = 0.07 * uVen * wV * (0.3 - position.y);
transformed.xz = mat2(cos(tw), -sin(tw), sin(tw), cos(tw)) * (transformed.xz - ${fmt(V_CENTER)}.xz) + ${fmt(V_CENTER)}.xz;
vObjPos = position;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uBump;
uniform mat4 modelMatrix;
varying vec3 vObjPos;
float hN(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vN(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hN(i), hN(i + vec3(1,0,0)), f.x), mix(hN(i + vec3(0,1,0)), hN(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hN(i + vec3(0,0,1)), hN(i + vec3(1,0,1)), f.x), mix(hN(i + vec3(0,1,1)), hN(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ return 0.6 * vN(p) + 0.3 * vN(p * 2.7) + 0.1 * vN(p * 7.1); }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
{
  vec3 q = vObjPos * 9.0;
  float e = 0.06;
  float b0 = fbm(q);
  vec3 grad = vec3(fbm(q + vec3(e,0,0)) - b0, fbm(q + vec3(0,e,0)) - b0, fbm(q + vec3(0,0,e)) - b0) / e;
  vec3 gv = (viewMatrix * modelMatrix * vec4(grad, 0.0)).xyz;
  normal = normalize(normal - ${bump.toFixed(3)} * uBump * (gv - dot(gv, normal) * normal));
}`,
      );
  };
  mat.customProgramCacheKey = () => `heart-${bump}`;
}

/** Lub-dub envelopes over one beat (phase 0..1): atria first, then the ventricles. */
export function beat(phase: number): { atr: number; ven: number } {
  const g = (x: number, m: number, s: number) => Math.exp(-(((x - m) / s) ** 2));
  const atr = g(phase, 0.06, 0.045);
  // Ventricular systole ("lub" at its onset) with a small recoil at valve closure ("dub").
  const ven = g(phase, 0.26, 0.085) - 0.18 * g(phase, 0.45, 0.035);
  return { atr, ven };
}

export type HeartObject = {
  group: THREE.Group;
  /** Set the contraction (0 = relaxed) for the atria and the ventricles. */
  setBeat: (atr: number, ven: number) => void;
  dispose: () => void;
};

/** The whole heart as one THREE.Group, with its wet MeshPhysicalMaterials and shared beat uniforms. */
export function createHeartObject(): HeartObject {
  const parts = buildHeart(72);
  const u = makeBeatUniforms();
  const m = (o: THREE.MeshPhysicalMaterialParameters, bump: number) => {
    const mat = new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.18, ...o });
    patchHeartMaterial(mat, u, bump);
    return mat;
  };
  const mats = {
    // Deep muscle red (vertex colours carry the muscle tint and the yellow fat streaks).
    body: m({ vertexColors: true, roughness: 0.42, sheen: 0.4, sheenColor: new THREE.Color("#ff6a6a"), sheenRoughness: 0.5 }, 0.22),
    arteries: m({ color: "#c0262b", roughness: 0.32 }, 0.04),
    veins: m({ color: "#3d4f9a", roughness: 0.34 }, 0.04),
    aorta: m({ color: "#b8343a", roughness: 0.36, clearcoatRoughness: 0.25 }, 0.08),
    pulmonary: m({ color: "#4a5fae", roughness: 0.36, clearcoatRoughness: 0.25 }, 0.08),
    venaCava: m({ color: "#33438a", roughness: 0.38 }, 0.08),
    pulmonaryVeins: m({ color: "#a52a34", roughness: 0.38 }, 0.08),
  } satisfies Record<keyof HeartParts, THREE.Material>;
  const group = new THREE.Group();
  for (const k of Object.keys(parts) as (keyof HeartParts)[]) group.add(new THREE.Mesh(parts[k], mats[k]));
  return {
    group,
    setBeat: (atr, ven) => {
      u.uAtr.value = atr;
      u.uVen.value = ven;
    },
    dispose: () => {
      Object.values(parts).forEach((g) => g.dispose());
      Object.values(mats).forEach((x) => x.dispose());
    },
  };
}
