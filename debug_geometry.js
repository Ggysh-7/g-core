const THREE = require('three');
const { SVGLoader } = require('three/examples/jsm/loaders/SVGLoader.js');

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M 100,15 A 85,85 0 1,1 15,100 L 55,100 A 45,45 0 1,0 100,55 L 100,85 L 55,85 L 55,115 L 100,115 A 70,70 0 1,0 100,25 Z" fill-rule="evenodd" /></svg>';

const loader = new SVGLoader();
const parsed = loader.parse(svg);
console.log('paths:', parsed.paths.length);

const shapes = [];
for (const path of parsed.paths) {
  for (const sp of path.subPaths) {
    shapes.push(new THREE.Shape(sp.getPoints()));
  }
}
console.log('shapes:', shapes.length);
console.log('points in first shape:', shapes[0] ? shapes[0].getPoints().length : 0);

const geom = new THREE.ExtrudeGeometry(shapes, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.04, bevelSegments: 4 });
geom.scale(0.03, 0.03, 0.03);
geom.computeVertexNormals();

const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geom));
console.log('bbox min:', bbox.min.toArray());
console.log('bbox max:', bbox.max.toArray());
console.log('center:', bbox.getCenter(new THREE.Vector3()).toArray());
console.log('faces:', geom.index ? geom.index.count / 3 : 'none');
