import * as THREE from 'three';
import {
  addOrganicSurface,
  createCapsidGeometry,
  createCapsidLattice,
  createCutawayEnv,
  createEnvelopeGeometry,
  createEnvTrimers,
  createEnzymes,
  createGenome,
  createLipidHeads,
  createMatrix,
  disposeObject,
  ENV_TRIMER_COUNT,
} from './virionGeometry.js';

function physical(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.56,
    metalness: 0,
    clearcoat: 0.14,
    clearcoatRoughness: 0.7,
    ...options,
  });
}

export function createVirion() {
  const group = new THREE.Group();
  group.name = 'mature-HIV-1-virion';
  const materials = {
    envelope: addOrganicSurface(physical(0xb38b79, { roughness: 0.64, clearcoat: 0.12 }), 28, 0.065),
    outerLipid: physical(0xd0b9a2, { roughness: 0.7, clearcoat: 0.05 }),
    innerLipid: physical(0x9a7d70, { roughness: 0.76, clearcoat: 0 }),
    matrix: addOrganicSurface(physical(0x7d8e76, { roughness: 0.72, clearcoat: 0.04 }), 30, 0.08),
    capsid: addOrganicSurface(physical(0xffffff, { vertexColors: true, roughness: 0.58, clearcoat: 0.12 }), 32, 0.055),
    gp120: addOrganicSurface(physical(0xe5d6b6, { roughness: 0.55, clearcoat: 0.18 }), 19, 0.09),
    gp41: physical(0xa76f58, { roughness: 0.6, clearcoat: 0.1 }),
    glycan: physical(0xb9c5a2, { roughness: 0.7, clearcoat: 0 }),
    rna: [physical(0xe9c46f, { roughness: 0.48 }), physical(0x86b9aa, { roughness: 0.48 })],
    nucleocapsid: physical(0xe5d9b8, { roughness: 0.64 }),
    enzyme: addOrganicSurface(physical(0xffffff, { vertexColors: true, roughness: 0.55, clearcoat: 0.12 }), 24, 0.07),
  };

  const envelope = new THREE.Group();
  envelope.name = 'lipid-bilayer-envelope';
  const envelopeFull = new THREE.Group();
  const envelopeSection = new THREE.Group();
  [
    [envelopeFull, false],
    [envelopeSection, true],
  ].forEach(([parent, sectioned]) => {
    const shell = new THREE.Mesh(createEnvelopeGeometry({ sectioned }), materials.envelope);
    shell.name = sectioned ? 'sectioned-lipid-bilayer' : 'intact-lipid-bilayer';
    shell.userData.layer = 'envelope';
    shell.castShadow = true;
    shell.receiveShadow = true;
    parent.add(shell, createLipidHeads(materials.outerLipid, { sectioned }), createLipidHeads(materials.innerLipid, { sectioned, inner: true }));
  });
  envelope.add(envelopeFull, envelopeSection);
  group.add(envelope);

  const matrix = createMatrix(materials.matrix);
  group.add(matrix);

  const env = createEnvTrimers(materials);
  const envSection = createCutawayEnv(env);
  group.add(env, envSection);

  const capsid = new THREE.Group();
  capsid.name = 'enclosed-p24-capsid-assembly';
  capsid.position.set(0.03, -0.015, 0.015);
  capsid.rotation.set(0.13, -0.12, -0.58);
  const capsidFull = new THREE.Group();
  const capsidSection = new THREE.Group();
  [
    [capsidFull, false],
    [capsidSection, true],
  ].forEach(([parent, sectioned]) => {
    const shell = new THREE.Mesh(createCapsidGeometry({ sectioned }), materials.capsid);
    shell.name = sectioned ? 'capsid-teaching-window' : 'closed-fullerene-cone-capsid';
    shell.userData.layer = 'capsid';
    shell.castShadow = true;
    shell.receiveShadow = true;
    parent.add(shell, createCapsidLattice({ sectioned }));
  });
  capsid.add(capsidFull, capsidSection);
  group.add(capsid);

  const genome = createGenome(materials);
  capsid.add(genome);

  const enzymes = createEnzymes(materials.enzyme);
  const rt = enzymes.getObjectByName('reverseTranscriptase');
  const integrase = enzymes.getObjectByName('integrase');
  const protease = enzymes.getObjectByName('protease');
  rt.position.set(0.12, -0.47, 0.18);
  rt.rotation.set(0.15, -0.35, 0.5);
  integrase.position.set(-0.13, -0.05, 0.16);
  integrase.rotation.set(0.1, 0.35, -0.2);
  capsid.add(rt, integrase);
  protease.position.set(1.05, 0.65, 0.38);
  protease.rotation.set(0.25, 0.4, -0.2);
  group.add(protease);

  const layerMaterials = {
    envelope: [materials.envelope, materials.outerLipid, materials.innerLipid],
    matrix: [materials.matrix],
    capsid: [materials.capsid],
    spikes: [materials.gp120, materials.gp41, materials.glycan],
    rna: [...materials.rna, materials.nucleocapsid],
    reverseTranscriptase: [rt.material],
    integrase: [integrase.material],
    protease: [protease.material],
  };
  Object.values(layerMaterials).flat().forEach((material) => {
    material.userData.baseEmissive = material.emissive.clone();
    material.userData.baseEmissiveIntensity = material.emissiveIntensity;
  });

  const setCutaway = (cutaway, activeLayer = 'envelope') => {
    envelope.visible = true;
    matrix.visible = true;
    envelopeFull.visible = !cutaway;
    envelopeSection.visible = cutaway;
    env.visible = !cutaway;
    envSection.visible = cutaway;
    matrix.userData.full.forEach((object) => { object.visible = !cutaway; });
    matrix.userData.section.forEach((object) => { object.visible = cutaway; });
    const showGenomeWindow = cutaway && !['capsid', 'matrix', 'protease'].includes(activeLayer);
    capsidFull.visible = !showGenomeWindow;
    capsidSection.visible = showGenomeWindow;
    capsid.visible = true;
    genome.visible = true;
    rt.visible = true;
    integrase.visible = true;
    protease.visible = true;
  };

  const highlight = (activeLayer) => {
    Object.entries(layerMaterials).forEach(([layer, list]) => {
      const active = layer === activeLayer;
      list.forEach((material) => {
        material.emissive.copy(material.userData.baseEmissive);
        material.emissiveIntensity = material.userData.baseEmissiveIntensity;
        if (active) {
          material.emissive.set(layer === 'rna' ? 0x5a4a22 : 0x55452e);
          material.emissiveIntensity = layer === 'envelope' || layer === 'matrix' ? 0.18 : 0.28;
        }
      });
    });
  };

  const setLifecycleStep = (step) => {
    const released = step >= 2 && step <= 4;
    envelope.visible = !released;
    matrix.visible = !released;
    env.visible = !released;
    envSection.visible = false;
    envelopeFull.visible = true;
    envelopeSection.visible = false;
    matrix.userData.full.forEach((object) => { object.visible = true; });
    matrix.userData.section.forEach((object) => { object.visible = false; });
    capsidFull.visible = step < 2 || step >= 5;
    capsidSection.visible = step >= 2 && step <= 4;
    capsid.visible = step <= 4 || step >= 5;
    genome.visible = step >= 2;
    rt.visible = step >= 2 && step <= 4;
    integrase.visible = step >= 2 && step <= 4;
    protease.visible = step < 4 || step >= 5;
    if (step >= 5) {
      envelope.visible = true;
      matrix.visible = true;
      env.visible = true;
    }
  };

  const reset = () => {
    envelope.visible = true;
    matrix.visible = true;
    env.visible = true;
    envSection.visible = false;
    capsid.visible = true;
    genome.visible = true;
    setCutaway(true, 'envelope');
    group.rotation.set(0.04, -0.12, -0.04);
  };

  setCutaway(true, 'envelope');
  reset();

  return {
    group,
    capsid,
    genome,
    env,
    materials,
    setCutaway,
    setLifecycleStep,
    highlight,
    reset,
    stats: {
      envTrimers: ENV_TRIMER_COUNT,
      gp120: ENV_TRIMER_COUNT * 3,
      gp41: ENV_TRIMER_COUNT * 3,
      rnaMolecules: 2,
      capsidClosed: capsidFull.children[0].geometry.userData.closed,
      capsidPentamers: 12,
    },
    dispose: () => disposeObject(group),
  };
}

export function createLifecycleCell() {
  const group = new THREE.Group();
  group.name = 'lifecycle-host-cell';
  const cellMaterial = physical(0x9dbb9c, { transparent: true, opacity: 0.13, roughness: 0.64, side: THREE.DoubleSide, depthWrite: false });
  const cell = new THREE.Mesh(new THREE.SphereGeometry(2.25, 48, 32), cellMaterial);
  cell.position.set(-1.75, 0, -0.35);
  group.add(cell);
  const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xa7c1a0, transparent: true, opacity: 0.3 });
  const border = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.014, 6, 96), borderMaterial);
  border.position.set(-1.75, 0, -0.3);
  group.add(border);
  const nucleusMaterial = physical(0x8ca68b, { transparent: true, opacity: 0.24, roughness: 0.68, depthWrite: false });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 24), nucleusMaterial);
  nucleus.position.set(-1.75, 0, 0);
  group.add(nucleus);
  const nucleusBorder = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.014, 6, 64), new THREE.MeshBasicMaterial({ color: 0xc5d7b9, transparent: true, opacity: 0.52 }));
  nucleusBorder.position.set(-1.75, 0, 0.85);
  group.add(nucleusBorder);

  const makeNucleicAcid = (count, radius, yStep, color, tubeRadius) => {
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const angle = index * 0.35;
      points.push(new THREE.Vector3(-1.75 + Math.sin(angle) * radius, -0.6 + index * yStep, 0.75 + Math.cos(angle) * radius * 0.6));
    }
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 80, tubeRadius, 6, false),
      new THREE.MeshBasicMaterial({ color }),
    );
  };
  const genome = makeNucleicAcid(45, 0.4, 0.027, 0xe7d4a9, 0.022);
  const viralDna = makeNucleicAcid(55, 0.19, 0.023, 0xffae7e, 0.032);
  group.add(genome, viralDna);

  const assembly = new THREE.Group();
  const gagGeometry = new THREE.CapsuleGeometry(0.024, 0.11, 3, 6);
  const gagMaterial = physical(0xcaa276, { roughness: 0.68 });
  const gag = new THREE.InstancedMesh(gagGeometry, gagMaterial, 30);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 30; index += 1) {
    const angle = index * 2.399;
    const radial = 0.24 + (index % 4) * 0.06;
    dummy.position.set(-0.8 + Math.cos(angle) * radial, -0.85 + (index % 10) * 0.18, 0.65 + Math.sin(angle) * radial * 0.5);
    dummy.rotation.set(Math.sin(angle) * 0.5, angle, Math.cos(angle) * 0.45);
    dummy.updateMatrix();
    gag.setMatrixAt(index, dummy.matrix);
  }
  assembly.add(gag);
  group.add(assembly);
  group.visible = false;

  const update = (step) => {
    cellMaterial.opacity = step === 0 ? 0.07 : 0.14;
    viralDna.visible = step >= 2 && step <= 4;
    genome.visible = step >= 3 && step <= 4;
    assembly.visible = step >= 4;
  };
  return { group, update, dispose: () => disposeObject(group) };
}
