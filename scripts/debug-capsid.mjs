import * as THREE from 'three';
import { createVirion } from '../src/three/createVirion.js';

const virion = createVirion();
virion.group.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(virion.capsid);
console.log('capsid world box', JSON.stringify(box, null, 1));
virion.capsid.children.forEach((child) => {
  const childBox = new THREE.Box3().setFromObject(child);
  const center = new THREE.Vector3();
  childBox.getCenter(center);
  console.log(child.name || child.type, 'extent', childBox.max.length().toFixed(3), childBox.min.length().toFixed(3), 'center', center.length().toFixed(3));
});
console.log('capsid position', virion.capsid.position.toArray().map((v) => v.toFixed(3)));
console.log('capsid rotation', virion.capsid.rotation.toArray().map((v) => v.toFixed(3)));
