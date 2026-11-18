import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const ENVELOPE_RADIUS = 1.96;
export const MATRIX_RADIUS = 1.87;
export const ENV_TRIMER_COUNT = 14;
export const CA_PENTAMER_COUNT = 12;
export const CAPSID_LENGTH = 2.1;
export const CUTAWAY_START = Math.PI * 0.16;
export const CUTAWAY_END = Math.PI * 0.86;

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

// Weld by position before adding shading attributes. Drop whole degenerate
// triangles (not individual indices) where latitude rings meet at a pole.
function weldShell(positions, indices) {
  const source = new THREE.BufferGeometry();
  source.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  source.setIndex(indices);
  const geometry = mergeVertices(source, 0.00001);
  source.dispose();
  const welded = geometry.index.array;
  const faces = [];
  for (let index = 0; index < welded.length; index += 3) {
    const a = welded[index], b = welded[index + 1], c = welded[index + 2];
    if (a !== b && b !== c && c !== a) faces.push(a, b, c);
  }
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function seededRandom(seed = 41) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createProteinGeometry(detail = 2, seed = 0) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const positions = geometry.attributes.position;
  const point = new THREE.Vector3();
  for (let index = 0; index < positions.count; index += 1) {
    point.fromBufferAttribute(positions, index);
    const variation = 1
      + 0.055 * Math.sin(point.x * 4.1 + seed) * Math.cos(point.y * 3.4 - seed)
      + 0.025 * Math.sin(point.z * 7.2 + point.x * 2.3 + seed);
    point.multiplyScalar(variation);
    positions.setXYZ(index, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function addOrganicSurface(material, scale = 24, strength = 0.075) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOrganicPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOrganicPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vOrganicPosition;
        float organicHash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.13, 0.17, 0.19));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float organicNoise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(organicHash(i), organicHash(i + vec3(1,0,0)), f.x),
                mix(organicHash(i + vec3(0,1,0)), organicHash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(organicHash(i + vec3(0,0,1)), organicHash(i + vec3(1,0,1)), f.x),
                mix(organicHash(i + vec3(0,1,1)), organicHash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float organicGrain = organicNoise(vOrganicPosition * ${scale.toFixed(1)}) * 0.68
          + organicNoise(vOrganicPosition * ${(scale * 2.7).toFixed(1)}) * 0.32;
        diffuseColor.rgb *= ${(1 - strength).toFixed(3)} + organicGrain * ${(strength * 2).toFixed(3)};`);
  };
  material.customProgramCacheKey = () => `organic-${scale}-${strength}`;
  return material;
}

export function envelopePoint(theta, phi, radius = ENVELOPE_RADIUS) {
  const organic = 1 + 0.0035 * Math.sin(theta * 5 + phi * 3) * Math.sin(phi * 7 - theta * 2) * Math.sin(phi) ** 2;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    radius * organic * sinPhi * Math.cos(theta),
    radius * organic * Math.cos(phi),
    radius * organic * sinPhi * Math.sin(theta),
  );
}

export function createEnvelopeGeometry({ sectioned = false, radius = ENVELOPE_RADIUS, thickness = 0.045 } = {}) {
  const radialSegments = sectioned ? 62 : 112;
  const heightSegments = 64;
  const positions = [];
  const indices = [];
  const row = radialSegments + 1;
  const surfaceSize = row * (heightSegments + 1);
  const thetaStart = sectioned ? CUTAWAY_END : 0;
  const thetaLength = sectioned ? TAU - (CUTAWAY_END - CUTAWAY_START) : TAU;

  for (let surface = 0; surface < 2; surface += 1) {
    const surfaceRadius = radius - surface * thickness;
    for (let y = 0; y <= heightSegments; y += 1) {
      const phi = (y / heightSegments) * Math.PI;
      for (let x = 0; x <= radialSegments; x += 1) {
        const theta = thetaStart + (x / radialSegments) * thetaLength;
        const point = envelopePoint(theta, phi, surfaceRadius);
        positions.push(point.x, point.y, point.z);
      }
    }
  }

  const edgeCounts = new Map();
  const addTriangle = (a, b, c, trackBoundary = false) => {
    indices.push(a, b, c);
    if (!trackBoundary) return;
    [[a, b], [b, c], [c, a]].forEach(([from, to]) => {
      const key = from < to ? `${from}:${to}` : `${to}:${from}`;
      const edge = edgeCounts.get(key);
      if (edge) edge.count += 1;
      else edgeCounts.set(key, { from, to, count: 1 });
    });
  };

  for (let surface = 0; surface < 2; surface += 1) {
    const offset = surface * surfaceSize;
    for (let y = 0; y < heightSegments; y += 1) {
      for (let x = 0; x < radialSegments; x += 1) {
        const a = offset + y * row + x;
        const b = a + row;
        const c = b + 1;
        const d = a + 1;
        if (surface === 0) {
          addTriangle(a, d, b, sectioned);
          addTriangle(b, d, c, sectioned);
        } else {
          addTriangle(a, b, d);
          addTriangle(b, c, d);
        }
      }
    }
  }

  if (sectioned) {
    edgeCounts.forEach(({ from, to, count }) => {
      if (count !== 1) return;
      indices.push(from, from + surfaceSize, to, to, from + surfaceSize, to + surfaceSize);
    });
  }

  const geometry = weldShell(positions, indices);
  geometry.userData = { sectioned, radius, thickness, bilayer: true };
  return geometry;
}

export function capsidRadiusAt(y) {
  const t = THREE.MathUtils.clamp((y + CAPSID_LENGTH / 2) / CAPSID_LENGTH, 0, 1);
  // Shallow rounded closures keep both ends blunt. An extended small-end
  // dome would suggest a teardrop instead of the mature truncated cone.
  if (t < 0.16) return 0.59 * Math.sqrt(Math.max(0, 1 - (1 - t / 0.16) ** 2));
  if (t > 0.955) return 0.23 * Math.sqrt(Math.max(0, 1 - ((t - 0.955) / 0.045) ** 2));
  const body = (t - 0.16) / 0.795;
  return THREE.MathUtils.lerp(0.59, 0.23, body) + 0.012 * Math.sin(body * Math.PI);
}

export function capsidPoint(t, theta, offset = 0) {
  const y = -CAPSID_LENGTH / 2 + t * CAPSID_LENGTH;
  const asymmetry = 1 + 0.018 * Math.sin(theta * 3 + t * 4) + 0.009 * Math.cos(theta * 5 - t * 3);
  const radius = capsidRadiusAt(y) * asymmetry;
  const axisX = 0.045 * Math.sin(t * Math.PI) - 0.018 * t;
  const axisZ = 0.025 * Math.sin(t * Math.PI * 1.4);
  return new THREE.Vector3(
    axisX + radius * Math.cos(theta),
    y,
    axisZ + radius * Math.sin(theta),
  ).addScaledVector(capsidNormal(t, theta), offset);
}

export function capsidNormal(t, theta) {
  const epsilon = 0.0002;
  const along = capsidSurfacePoint(Math.min(1, t + epsilon), theta)
    .sub(capsidSurfacePoint(Math.max(0, t - epsilon), theta));
  const around = capsidSurfacePoint(t, theta + epsilon)
    .sub(capsidSurfacePoint(t, theta - epsilon));
  if (t <= 0) return new THREE.Vector3(0, -1, 0);
  if (t >= 1) return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3().crossVectors(along, around).normalize();
}

function capsidSurfacePoint(t, theta) {
  const y = -CAPSID_LENGTH / 2 + t * CAPSID_LENGTH;
  const asymmetry = 1 + 0.018 * Math.sin(theta * 3 + t * 4) + 0.009 * Math.cos(theta * 5 - t * 3);
  const radius = capsidRadiusAt(y) * asymmetry;
  return new THREE.Vector3(
    0.045 * Math.sin(t * Math.PI) - 0.018 * t + radius * Math.cos(theta),
    y,
    0.025 * Math.sin(t * Math.PI * 1.4) + radius * Math.sin(theta),
  );
}

function inCapsidWindow(t, theta) {
  return t > 0.19 && t < 0.84 && Math.abs(wrapAngle(theta - Math.PI * 0.5)) < 0.79;
}

export function createCapsidGeometry({ sectioned = false } = {}) {
  const lengthSegments = 84;
  const radialSegments = 112;
  const row = radialSegments + 1;
  const surfaceSize = (lengthSegments + 1) * row;
  const positions = [];
  const indices = [];
  const warm = new THREE.Color(0xd0a064);
  const light = new THREE.Color(0xe0bd83);

  for (let surface = 0; surface < (sectioned ? 2 : 1); surface += 1) {
    for (let y = 0; y <= lengthSegments; y += 1) {
      const t = y / lengthSegments;
      for (let x = 0; x <= radialSegments; x += 1) {
        const theta = (x / radialSegments) * TAU;
        const point = capsidPoint(t, theta);
        if (surface === 1) point.multiply(new THREE.Vector3(0.955, 0.978, 0.955));
        positions.push(point.x, point.y, point.z);
      }
    }
  }

  const boundary = new Map();
  const addFace = (a, b, c, track = false) => {
    indices.push(a, b, c);
    if (!track) return;
    [[a, b], [b, c], [c, a]].forEach(([from, to]) => {
      const key = from < to ? `${from}:${to}` : `${to}:${from}`;
      const edge = boundary.get(key);
      if (edge) edge.count += 1;
      else boundary.set(key, { from, to, count: 1 });
    });
  };

  for (let surface = 0; surface < (sectioned ? 2 : 1); surface += 1) {
    const offset = surface * surfaceSize;
    for (let y = 0; y < lengthSegments; y += 1) {
      const t = (y + 0.5) / lengthSegments;
      for (let x = 0; x < radialSegments; x += 1) {
        const theta = ((x + 0.5) / radialSegments) * TAU;
        if (sectioned && inCapsidWindow(t, theta)) continue;
        const a = offset + y * row + x;
        const b = a + row;
        const c = b + 1;
        const d = a + 1;
        if (surface === 0) {
          addFace(a, b, d, sectioned);
          addFace(b, c, d, sectioned);
        } else {
          addFace(a, d, b);
          addFace(b, d, c);
        }
      }
    }
  }

  if (sectioned) {
    boundary.forEach(({ from, to, count }) => {
      if (count !== 1) return;
      // The periodic theta seam is not a cut edge. Bridging it would add
      // coincident internal faces after vertex welding.
      if ((from % row === 0 && to % row === 0)
        || (from % row === radialSegments && to % row === radialSegments)) return;
      indices.push(from, to, from + surfaceSize, to, to + surfaceSize, from + surfaceSize);
    });
  }

  const geometry = weldShell(positions, indices);
  const vertices = geometry.attributes.position;
  const weldedColors = [];
  const color = new THREE.Color();
  for (let index = 0; index < vertices.count; index += 1) {
    const x = vertices.getX(index), y = vertices.getY(index), z = vertices.getZ(index);
    color.copy(warm).lerp(light, 0.34 + 0.18 * Math.sin(x * 13 + y * 17 + z * 11));
    weldedColors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(weldedColors, 3));
  geometry.userData = {
    closed: !sectioned,
    sectioned,
    morphology: 'asymmetric-fullerene-cone',
    pentamers: CA_PENTAMER_COUNT,
  };
  return geometry;
}

export function createCapsidLattice({ sectioned = false } = {}) {
  const hexGeometry = new THREE.TorusGeometry(0.046, 0.004, 4, 6);
  const pentGeometry = new THREE.TorusGeometry(0.052, 0.005, 4, 5);
  const hexMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb58b58, roughness: 0.66, metalness: 0, clearcoat: 0.08 });
  const pentMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe1c585, roughness: 0.6, metalness: 0 });
  const placements = { hex: [], pent: [] };

  const addPlacement = (type, t, theta, scale = 1) => {
    if (sectioned && inCapsidWindow(t, theta)) return;
    const normal = capsidNormal(t, theta);
    placements[type].push({ position: capsidPoint(t, theta, 0.007), normal, scale });
  };

  addPlacement('pent', 0.972, 0, 0.86);
  for (let index = 0; index < 4; index += 1) addPlacement('pent', 0.925, index * Math.PI * 0.5 + 0.35, 0.9);
  addPlacement('pent', 0.03, 0, 0.9);
  for (let index = 0; index < 6; index += 1) addPlacement('pent', 0.082, index * TAU / 6 + 0.15, 0.94);

  const bands = 25;
  for (let band = 0; band < bands; band += 1) {
    const t = 0.115 + (band / (bands - 1)) * 0.79;
    const radius = capsidRadiusAt(-CAPSID_LENGTH / 2 + t * CAPSID_LENGTH);
    const count = Math.max(5, Math.round((TAU * radius) / 0.115));
    for (let index = 0; index < count; index += 1) {
      const theta = (index / count) * TAU + (band % 2) * Math.PI / count;
      const nearPentamer = (t < 0.13 || t > 0.89);
      if (!nearPentamer) addPlacement('hex', t, theta, 0.9 + 0.1 * Math.sin(index * 1.7 + band));
    }
  }

  const build = (geometry, material, items, layer) => {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    const dummy = new THREE.Object3D();
    const normalAxis = new THREE.Vector3(0, 0, 1);
    const color = new THREE.Color();
    items.forEach((item, index) => {
      dummy.position.copy(item.position);
      dummy.quaternion.setFromUnitVectors(normalAxis, item.normal);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      color.setHSL(0.085, 0.22, 0.82 + 0.08 * Math.sin(index * 2.39));
      mesh.setColorAt(index, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.layer = layer;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const group = new THREE.Group();
  group.add(
    build(hexGeometry, hexMaterial, placements.hex, 'capsid'),
    build(pentGeometry, pentMaterial, placements.pent, 'capsid'),
  );
  group.userData = { hexamers: placements.hex.length, pentamers: placements.pent.length };
  return group;
}

export function createEnvDirections() {
  const random = seededRandom(73);
  const directions = [];
  for (let index = 0; index < ENV_TRIMER_COUNT; index += 1) {
    const y = 1 - ((index + 0.5) / ENV_TRIMER_COUNT) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = index * Math.PI * (3 - Math.sqrt(5)) + (random() - 0.5) * 0.55 + 0.18;
    const direction = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    direction.x += (random() - 0.5) * 0.08;
    direction.y += (random() - 0.5) * 0.05;
    directions.push(direction.normalize());
  }
  return directions;
}

export function createEnvTrimers(materials) {
  const directions = createEnvDirections();
  const headGeometry = createProteinGeometry(3, 1.7);
  const stalkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.065, 0),
    new THREE.Vector3(0.008, 0.035, 0),
    new THREE.Vector3(-0.006, 0.13, 0.005),
    new THREE.Vector3(0, 0.22, 0),
  ]);
  const stalkGeometry = new THREE.TubeGeometry(stalkCurve, 12, 0.025, 7, false);
  const glycanGeometry = createProteinGeometry(1, 2.1);
  const heads = new THREE.InstancedMesh(headGeometry, materials.gp120, ENV_TRIMER_COUNT * 3);
  const stalks = new THREE.InstancedMesh(stalkGeometry, materials.gp41, ENV_TRIMER_COUNT * 3);
  const glycans = new THREE.InstancedMesh(glycanGeometry, materials.glycan, ENV_TRIMER_COUNT * 3 * 5);
  const parent = new THREE.Object3D();
  const part = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  let headIndex = 0;
  let glycanIndex = 0;

  directions.forEach((normal, trimerIndex) => {
    parent.position.copy(normal).multiplyScalar(ENVELOPE_RADIUS - 0.012);
    parent.quaternion.setFromUnitVectors(UP, normal);
    parent.rotateY(trimerIndex * 1.17);
    parent.updateMatrix();
    for (let subunit = 0; subunit < 3; subunit += 1) {
      const angle = subunit * TAU / 3;
      part.position.set(Math.cos(angle) * 0.047, 0.025, Math.sin(angle) * 0.047);
      part.rotation.set(Math.sin(angle) * -0.08, 0, Math.cos(angle) * 0.08);
      part.scale.set(1, 1, 1);
      part.updateMatrix();
      matrix.multiplyMatrices(parent.matrix, part.matrix);
      stalks.setMatrixAt(headIndex, matrix);

      part.position.set(Math.cos(angle) * 0.087, 0.285 + (subunit === 1 ? 0.012 : 0), Math.sin(angle) * 0.087);
      part.rotation.set(Math.sin(angle) * 0.19, angle + 0.25, Math.cos(angle) * -0.19);
      part.scale.set(0.092, 0.116, 0.085);
      part.updateMatrix();
      matrix.multiplyMatrices(parent.matrix, part.matrix);
      heads.setMatrixAt(headIndex, matrix);
      color.setHSL(0.105, 0.24, 0.88 + 0.035 * Math.sin(trimerIndex * 2.1 + subunit));
      heads.setColorAt(headIndex, color);

      for (let glycan = 0; glycan < 5; glycan += 1) {
        const glycanAngle = glycan * 2.399 + subunit;
        part.position.set(
          Math.cos(angle) * 0.087 + Math.cos(glycanAngle) * 0.075,
          0.295 + Math.sin(glycan * 1.7) * 0.067,
          Math.sin(angle) * 0.087 + Math.sin(glycanAngle) * 0.068,
        );
        part.rotation.set(0, glycanAngle, 0);
        part.scale.set(0.014, 0.019, 0.014);
        part.updateMatrix();
        matrix.multiplyMatrices(parent.matrix, part.matrix);
        glycans.setMatrixAt(glycanIndex, matrix);
        glycanIndex += 1;
      }
      headIndex += 1;
    }
  });

  [heads, stalks, glycans].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.layer = 'spikes';
  });
  heads.name = 'gp120-head-trimers';
  stalks.name = 'gp41-stalk-trimers';
  glycans.name = 'Env-glycan-detail';
  const group = new THREE.Group();
  group.add(heads, stalks, glycans);
  group.userData = { trimers: ENV_TRIMER_COUNT, gp120: ENV_TRIMER_COUNT * 3, gp41: ENV_TRIMER_COUNT * 3 };
  return group;
}

export function createLipidHeads(material, { sectioned = false, inner = false } = {}) {
  const count = inner ? 2300 : 3900;
  const random = seededRandom(inner ? 321 : 123);
  const directions = [];
  for (let index = 0; index < count; index += 1) {
    const y = 1 - ((index + 0.5) / count) * 2;
    const radial = Math.sqrt(1 - y * y);
    const theta = index * Math.PI * (3 - Math.sqrt(5)) + (random() - 0.5) * 0.12;
    const phi = Math.acos(y);
    if (sectioned && theta % TAU > CUTAWAY_START && theta % TAU < CUTAWAY_END) continue;
    directions.push({ theta, phi, scale: 0.82 + random() * 0.34 });
  }
  const geometry = createProteinGeometry(1, inner ? 3.1 : 0.7);
  const mesh = new THREE.InstancedMesh(geometry, material, directions.length);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  directions.forEach(({ theta, phi, scale }, index) => {
    const radius = ENVELOPE_RADIUS - (inner ? 0.046 : 0.006);
    dummy.position.copy(envelopePoint(theta, phi, radius));
    dummy.quaternion.setFromUnitVectors(UP, dummy.position.clone().normalize());
    dummy.scale.set(0.022 * scale, 0.012 * scale, 0.022 * scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    color.setHSL(inner ? 0.065 : 0.082, inner ? 0.14 : 0.18, 0.72 + random() * 0.17);
    mesh.setColorAt(index, color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.userData.layer = 'envelope';
  mesh.receiveShadow = true;
  mesh.name = inner ? 'inner-lipid-leaflet' : 'outer-lipid-leaflet';
  return mesh;
}

export function createMatrix(material) {
  const group = new THREE.Group();
  // Mature MA is membrane-associated and discontinuous, not a second
  // solid capsid. Thin protein patches leave the inner leaflet visible.
  const count = 1500;
  const random = seededRandom(901);
  const geometry = createProteinGeometry(1, 4.2);
  const full = new THREE.InstancedMesh(geometry, material, count);
  const sectionPositions = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const y = 1 - ((index + 0.5) / count) * 2;
    const radial = Math.sqrt(1 - y * y);
    const theta = index * Math.PI * (3 - Math.sqrt(5)) + (random() - 0.5) * 0.13;
    const phi = Math.acos(y);
    const normal = new THREE.Vector3(Math.cos(theta) * radial, y, Math.sin(theta) * radial);
    dummy.position.copy(normal).multiplyScalar(MATRIX_RADIUS + 0.018);
    dummy.quaternion.setFromUnitVectors(UP, normal);
    dummy.rotateY(random() * Math.PI);
    dummy.scale.set(0.04 + random() * 0.014, 0.016, 0.034 + random() * 0.012);
    dummy.updateMatrix();
    full.setMatrixAt(index, dummy.matrix);
    color.setHSL(0.21, 0.09, 0.69 + random() * 0.13);
    full.setColorAt(index, color);
    if (!(theta % TAU > CUTAWAY_START && theta % TAU < CUTAWAY_END)) sectionPositions.push(dummy.matrix.clone());
  }
  const section = new THREE.InstancedMesh(geometry, material, sectionPositions.length);
  sectionPositions.forEach((matrix, index) => {
    section.setMatrixAt(index, matrix);
    color.setHSL(0.21, 0.09, 0.69 + random() * 0.13);
    section.setColorAt(index, color);
  });
  [full, section].forEach((mesh, index) => {
    mesh.name = index === 0 ? 'p17-protein-full' : 'p17-protein-section';
    mesh.userData.layer = 'matrix';
    mesh.instanceMatrix.needsUpdate = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });
  group.userData.full = [full];
  group.userData.section = [section];
  return group;
}

export function createRnaCurves() {
  return [0, 1].map((strand) => {
    const points = [];
    for (let index = 0; index <= 180; index += 1) {
      const t = index / 180;
      // Independently folded, condensed single strands; no shared helix axis
      // or paired rungs. Both 5-prime ends meet near the broad capsid end.
      const phase = strand * 1.83;
      const y = -0.37 + 0.31 * Math.sin(t * TAU * (2.15 + strand * 0.35) + phase)
        + 0.075 * Math.sin(t * TAU * 5.4 + phase);
      const radius = capsidRadiusAt(y) * (0.38 + 0.13 * Math.sin(t * TAU * 2.6 + phase));
      const angle = t * TAU * (3.15 + strand * 0.65) + phase + 0.7 * Math.sin(t * TAU * 2.2);
      const folded = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.85 + 0.035);
      const joinedEnd = new THREE.Vector3(strand ? 0.022 : -0.022, -0.7, 0.06);
      points.push(joinedEnd.lerp(folded, Math.min(1, t / 0.085)));
    }
    return new THREE.CatmullRomCurve3(points);
  });
}

export function createGenome(materials) {
  const group = new THREE.Group();
  const curves = createRnaCurves();
  curves.forEach((curve, index) => {
    const rna = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.014, 7, false), materials.rna[index]);
    rna.name = `single-stranded-RNA-${index + 1}`;
    rna.userData.layer = 'rna';
    rna.castShadow = true;
    group.add(rna);
  });

  const ncGeometry = createProteinGeometry(1, 5.4);
  const ncCount = curves.length * 48;
  const nucleocapsid = new THREE.InstancedMesh(ncGeometry, materials.nucleocapsid, ncCount);
  const dummy = new THREE.Object3D();
  const tangent = new THREE.Vector3();
  let instance = 0;
  curves.forEach((curve, strand) => {
    for (let index = 0; index < 48; index += 1) {
      const t = (index + 0.5) / 48;
      dummy.position.copy(curve.getPointAt(t));
      tangent.copy(curve.getTangentAt(t));
      dummy.quaternion.setFromUnitVectors(UP, tangent);
      dummy.rotateY(index * 2.39 + strand);
      dummy.scale.set(0.024, 0.016, 0.021);
      dummy.updateMatrix();
      nucleocapsid.setMatrixAt(instance, dummy.matrix);
      instance += 1;
    }
  });
  nucleocapsid.name = 'RNA-associated-nucleocapsid';
  nucleocapsid.userData.layer = 'rna';
  nucleocapsid.castShadow = true;
  group.add(nucleocapsid);
  group.userData = { rnaMolecules: 2, nucleocapsidMarkers: ncCount, representation: 'condensed-single-strands-not-a-duplex' };
  return group;
}

function createEnzymeGeometry(lobes, palette, seed) {
  const geometries = lobes.map((lobe, index) => {
    const geometry = createProteinGeometry(2, seed + index * 0.7);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(lobe.rotation || [0, 0, 0])));
    matrix.compose(new THREE.Vector3(...lobe.position), quaternion, new THREE.Vector3(...lobe.scale));
    geometry.applyMatrix4(matrix);
    const colors = [];
    const color = new THREE.Color(palette[index % palette.length]);
    for (let vertex = 0; vertex < geometry.attributes.position.count; vertex += 1) colors.push(color.r, color.g, color.b);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  });
  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  return merged;
}

export function createEnzymes(material) {
  const group = new THREE.Group();
  const definitions = {
    reverseTranscriptase: {
      palette: [0x78a99a, 0x4f7d75, 0x9dbca6],
      lobes: [
        { position: [-0.075, 0, 0], scale: [0.11, 0.16, 0.09], rotation: [0.1, 0, -0.25] },
        { position: [0.07, -0.04, 0.01], scale: [0.1, 0.105, 0.085] },
        { position: [-0.09, 0.115, 0.015], scale: [0.07, 0.08, 0.065] },
        { position: [0.015, -0.12, 0.02], scale: [0.06, 0.075, 0.06] },
      ],
    },
    integrase: {
      palette: [0x8a91b3, 0x626f98, 0xa5a7c0],
      lobes: [
        { position: [0, 0, 0], scale: [0.11, 0.1, 0.09] },
        { position: [-0.09, 0.075, 0], scale: [0.065, 0.09, 0.065], rotation: [0, 0, -0.45] },
        { position: [0.09, 0.07, 0.015], scale: [0.065, 0.085, 0.065], rotation: [0, 0, 0.45] },
      ],
    },
    protease: {
      palette: [0xb68491, 0xd1a1a4],
      lobes: [
        { position: [-0.055, 0, 0], scale: [0.075, 0.105, 0.06], rotation: [0.1, 0.2, -0.3] },
        { position: [0.055, 0, 0], scale: [0.075, 0.105, 0.06], rotation: [-0.1, -0.2, 0.3] },
        { position: [-0.045, 0.067, 0.035], scale: [0.055, 0.035, 0.035] },
        { position: [0.045, 0.067, 0.035], scale: [0.055, 0.035, 0.035] },
      ],
    },
  };

  Object.entries(definitions).forEach(([layer, definition], index) => {
    const enzymeMaterial = material.clone();
    const enzyme = new THREE.Mesh(createEnzymeGeometry(definition.lobes, definition.palette, index + 8), enzymeMaterial);
    enzyme.name = layer;
    enzyme.userData.layer = layer;
    enzyme.castShadow = true;
    enzyme.receiveShadow = true;
    group.add(enzyme);
  });
  return group;
}

export function createCutawayEnv(source) {
  const group = new THREE.Group();
  const directions = createEnvDirections();
  const retain = directions.map((direction) => {
    const theta = (Math.atan2(direction.z, direction.x) + TAU) % TAU;
    // Omit whole trimers near the section boundary, never individual subunits.
    return theta < CUTAWAY_START - 0.08 || theta > CUTAWAY_END + 0.08;
  });
  source.traverse((object) => {
    if (!object.isInstancedMesh) return;
    const retained = [];
    const matrix = new THREE.Matrix4();
    const subunits = object.name === 'Env-glycan-detail' ? 15 : 3;
    for (let index = 0; index < object.count; index += 1) {
      if (!retain[Math.floor(index / subunits)]) continue;
      object.getMatrixAt(index, matrix);
      retained.push(matrix.clone());
    }
    const mesh = new THREE.InstancedMesh(object.geometry, object.material, retained.length);
    retained.forEach((item, index) => mesh.setMatrixAt(index, item));
    if (object.instanceColor) {
      const color = new THREE.Color();
      let retainedIndex = 0;
      for (let index = 0; index < object.count; index += 1) {
        if (!retain[Math.floor(index / subunits)]) continue;
        object.getColorAt(index, color);
        mesh.setColorAt(retainedIndex, color);
        retainedIndex += 1;
      }
    }
    mesh.name = `${object.name}-section`;
    mesh.userData.layer = 'spikes';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  });
  [...group.children].forEach((object) => {
    if (object.isInstancedMesh && !object.name.endsWith('-section')) group.remove(object);
  });
  group.name = 'sparse-Env-trimers-section';
  return group;
}

export function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse((object) => {
    if (object.isInstancedMesh) object.dispose();
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach((material) => materials.add(material));
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
