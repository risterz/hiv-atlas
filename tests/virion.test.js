import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  CA_PENTAMER_COUNT,
  CAPSID_LENGTH,
  ENV_TRIMER_COUNT,
  ENVELOPE_RADIUS,
  MATRIX_RADIUS,
  capsidRadiusAt,
  createCapsidGeometry,
  createCapsidLattice,
  capsidNormal,
  createEnvelopeGeometry,
  createEnvDirections,
  createEnvTrimers,
  createRnaCurves,
  disposeObject,
} from '../src/three/virionGeometry.js';

const material = () => new THREE.MeshPhysicalMaterial();

function edgeCounts(geometry) {
  const counts = new Map();
  const index = geometry.index.array;
  for (let i = 0; i < index.length; i += 3) {
    assert.ok(new Set([index[i], index[i + 1], index[i + 2]]).size === 3, 'No degenerate triangles');
    [[index[i], index[i + 1]], [index[i + 1], index[i + 2]], [index[i + 2], index[i]]].forEach(([a, b]) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  }
  return counts;
}

test('full capsid is a nondegenerate watertight asymmetric fullerene cone', () => {
  const geometry = createCapsidGeometry();
  assert.equal(geometry.userData.closed, true);
  assert.equal(geometry.userData.pentamers, CA_PENTAMER_COUNT);
  assert.ok([...edgeCounts(geometry).values()].every((count) => count === 2), 'Every full-shell edge belongs to two triangles');
  const broadRadius = capsidRadiusAt(-CAPSID_LENGTH / 2 + CAPSID_LENGTH * 0.16);
  const narrowRadius = capsidRadiusAt(-CAPSID_LENGTH / 2 + CAPSID_LENGTH * 0.955);
  assert.ok(broadRadius > narrowRadius * 2.4 && broadRadius < narrowRadius * 2.8);
  assert.ok(capsidRadiusAt(-CAPSID_LENGTH / 2 + CAPSID_LENGTH * 0.98) > 0.18, 'Narrow end remains blunt, not a pointed droplet');
  assert.ok(capsidRadiusAt(-CAPSID_LENGTH / 2) < 0.0001);
  assert.ok(capsidRadiusAt(CAPSID_LENGTH / 2) < 0.0001);
  geometry.dispose();
});

test('bilayer and sectional shells have no open seams or degenerate faces', () => {
  for (const geometry of [createEnvelopeGeometry(), createEnvelopeGeometry({ sectioned: true }), createCapsidGeometry({ sectioned: true })]) {
    assert.ok([...edgeCounts(geometry).values()].every((count) => count === 2), 'Shell edges must belong to two triangles');
    geometry.dispose();
  }
  assert.ok(capsidNormal(0.5, 0).x > 0.8, 'Capsid lattice normals face outward');
  assert.ok(capsidNormal(0.5, Math.PI / 2).z > 0.8);
});

test('capsid has 12 pentamers and a predominantly hexameric lattice', () => {
  const lattice = createCapsidLattice();
  assert.equal(lattice.userData.pentamers, 12);
  assert.ok(lattice.userData.hexamers > 300);
  disposeObject(lattice);
});

test('14 nonuniform Env trimers each contain three gp120 and three gp41 components', () => {
  const directions = createEnvDirections();
  assert.equal(directions.length, ENV_TRIMER_COUNT);
  const nearest = directions.map((direction) => Math.min(...directions.filter((other) => other !== direction).map((other) => direction.distanceTo(other))));
  assert.ok(Math.max(...nearest) / Math.min(...nearest) > 1.15, 'Distribution is not perfectly uniform');
  const env = createEnvTrimers({ gp120: material(), gp41: material(), glycan: material() });
  assert.equal(env.getObjectByName('gp120-head-trimers').count, 42);
  assert.equal(env.getObjectByName('gp41-stalk-trimers').count, 42);
  assert.equal(env.userData.trimers, 14);
  disposeObject(env);
});

test('p17 matrix lies beneath the membrane', () => {
  assert.ok(MATRIX_RADIUS < ENVELOPE_RADIUS);
  assert.ok(ENVELOPE_RADIUS - MATRIX_RADIUS < 0.2);
});

test('capsid and enzymes stay fully enclosed inside the envelope', async () => {
  const { createVirion } = await import('../src/three/createVirion.js');
  const virion = createVirion();
  virion.group.updateMatrixWorld(true);
  // Test the actual transformed vertices; a rotated bounding-box corner
  // is empty space and can lie well outside the capsid itself.
  let capsidExtent = 0;
  const point = new THREE.Vector3();
  const instance = new THREE.Matrix4();
  const transform = new THREE.Matrix4();
  virion.capsid.traverse((mesh) => {
    if (!mesh.geometry) return;
    const vertices = mesh.geometry.attributes.position;
    for (let item = 0; item < (mesh.isInstancedMesh ? mesh.count : 1); item += 1) {
      if (mesh.isInstancedMesh) {
        mesh.getMatrixAt(item, instance);
        transform.multiplyMatrices(mesh.matrixWorld, instance);
      } else transform.copy(mesh.matrixWorld);
      for (let index = 0; index < vertices.count; index += 1) {
        point.fromBufferAttribute(vertices, index).applyMatrix4(transform);
        capsidExtent = Math.max(capsidExtent, point.length());
      }
    }
  });
  assert.ok(capsidExtent < MATRIX_RADIUS - 0.25, `Capsid extent ${capsidExtent.toFixed(3)} must clear the matrix layer`);
  const protease = virion.group.getObjectByName('protease');
  assert.ok(protease.position.length() < MATRIX_RADIUS - 0.3, 'Protease stays inside the matrix layer');
  for (const name of ['reverseTranscriptase', 'integrase']) {
    const enzyme = virion.group.getObjectByName(name);
    const positions = enzyme.geometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      point.fromBufferAttribute(positions, index).applyMatrix4(enzyme.matrix);
      const t = (point.y + CAPSID_LENGTH / 2) / CAPSID_LENGTH;
      const axisX = 0.045 * Math.sin(t * Math.PI) - 0.018 * t;
      const axisZ = 0.025 * Math.sin(t * Math.PI * 1.4);
      assert.ok(Math.hypot(point.x - axisX, point.z - axisZ) < capsidRadiusAt(point.y) * 0.94, `${name} must stay inside the capsid`);
    }
  }
  virion.setLifecycleStep(3);
  virion.setCutaway(true);
  assert.equal(virion.group.getObjectByName('lipid-bilayer-envelope').visible, true);
  let instanceCount = 0, disposedCount = 0;
  virion.group.traverse((object) => {
    if (!object.isInstancedMesh) return;
    instanceCount += 1;
    object.addEventListener('dispose', () => { disposedCount += 1; });
  });
  virion.dispose();
  assert.equal(disposedCount, instanceCount, 'Release every instanced-mesh GPU buffer');
});

test('two condensed RNA strands remain inside the capsid', () => {
  const curves = createRnaCurves();
  assert.equal(curves.length, 2);
  curves.forEach((curve) => {
    for (let index = 0; index <= 200; index += 1) {
      const point = curve.getPointAt(index / 200);
      assert.ok(Math.hypot(point.x, point.z) < capsidRadiusAt(point.y) * 0.8);
      assert.ok(Math.abs(point.y) < CAPSID_LENGTH * 0.4);
    }
  });
});
