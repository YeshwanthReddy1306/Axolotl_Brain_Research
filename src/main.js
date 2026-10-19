import * as THREE from 'three';

/* ==========================================================================
   AXO-NEURO LOGISTICS: INTERACTIVE MULTI-SCALE RESEARCH ENGINE
   ========================================================================== */

// --- Global State ---
const state = {
  activeZoomLevel: 'macro', // macro, cranium, meso, micro, nano
  zoomFactor: 1.0,
  targetCamPos: new THREE.Vector3(0, 0, 16),
  targetLookAt: new THREE.Vector3(0, 0, 0),
  currentLookAt: new THREE.Vector3(0, 0, 0),
  isXRayActive: true,
  isAudioMuted: false,
  isRegenerating: false,
  isLesioned: false,
  activePillar: null, // 'brain', 'dna', 'logistics' or null
  activeMappingIndex: 0,
  audioContext: null,
};

// --- Semantic Zoom Checkpoints ---
const ZOOM_LEVELS = {
  macro: {
    scale: 1,
    label: '1x',
    camPos: new THREE.Vector3(0, 0.5, 18),
    lookAt: new THREE.Vector3(0, 0.1, -0.5),
    title: 'Macro: Full Organism',
    sub: 'Leucistic Axolotl (Ambystoma mexicanum) Swimming Homeostasis',
    opacityBrain: 0.45,
    opacityDNA: 0.0,
  },
  cranium: {
    scale: 10,
    label: '10x',
    camPos: new THREE.Vector3(0, 0.6, 7.8),
    lookAt: new THREE.Vector3(0, 0.35, 1.4),
    title: 'Cranium: Head & Gills',
    sub: 'Vascularized Feathery Gills & Cranial Scaffolding',
    opacityBrain: 0.75,
    opacityDNA: 0.0,
  },
  meso: {
    scale: 100,
    label: '100x',
    camPos: new THREE.Vector3(0, 0.35, 2.5),
    lookAt: new THREE.Vector3(0, 0.35, 0),
    title: 'Meso: Telencephalon Lobes',
    sub: 'Forebrain Hemisphere Connectome & Ventricular Zone',
    opacityBrain: 0.95,
    opacityDNA: 0.15,
  },
  micro: {
    scale: 1000,
    label: '1,000x',
    camPos: new THREE.Vector3(0, 0.35, 0.95),
    lookAt: new THREE.Vector3(0, 0.35, 0),
    title: 'Micro: Radial Glia Scaffold',
    sub: 'Ependymoglial Fibers & Migrating Neuroblasts',
    opacityBrain: 1.0,
    opacityDNA: 0.4,
  },
  nano: {
    scale: 100000,
    label: '100,000x',
    camPos: new THREE.Vector3(0, 0.35, 0.38),
    lookAt: new THREE.Vector3(0, 0.35, 0),
    title: 'Nano: 32Gb Genome & DNA Helix',
    sub: 'Regenerative Transcription Loci (Amx-Sox2, Kazald1, Prod1)',
    opacityBrain: 0.2,
    opacityDNA: 1.0,
  },
};

// --- Research Pillars Knowledge Data ---
const PILLARS_DATA = {
  brain: {
    title: '🧠 Brain Research & Telencephalon Plasticity',
    subtitle: 'Mechanisms of complete structural and functional forebrain regeneration without scar tissue',
    cards: [
      {
        id: 'radial_glia',
        icon: '🌱',
        title: 'Ependymoglial Stem Cells',
        tag: 'STEM NICHE',
        summary: 'Unlike mammalian astrocytes that form dense CSPG glial scars, axolotl radial glia dedifferentiate upon injury, producing new neuroblasts and long guiding cytokeratin fibers.',
        mapping: 'Glial Scaffold Bridging ──► Self-Healing Dynamic Binary Search Tree',
      },
      {
        id: 'circuit_repair',
        icon: '⚡',
        title: 'Functional Synaptogenesis',
        tag: 'ELECTROPHYSIOLOGY',
        summary: 'Regenerated neurons establish correct afferent/efferent projections into the olfactory bulb and pallium, restoring original sensory-motor behavioral maps.',
        mapping: 'Synaptic Retargeting ──► Dynamic Fault-Tolerant Graph Routing',
      },
      {
        id: 'scarless_matrix',
        icon: '🛡️',
        title: 'Non-Fibrotic Extracellular Matrix',
        tag: 'ECM HOMEOSTASIS',
        summary: 'Transient upregulation of matrix metalloproteinases (MMPs) dissolves excessive collagen, preventing fibrosis and allowing cell migration.',
        mapping: 'Matrix Clearance ──► Non-Blocking Garbage Collection & Memory Compaction',
      },
    ],
  },
  dna: {
    title: '🧬 DNA & Axolotl 32-Gigabase Genome',
    subtitle: 'Decoding the giant axolotl genome (10x larger than human) and blastema epigenetic switches',
    cards: [
      {
        id: 'genome_architecture',
        icon: '🧬',
        title: '32Gb Megagenome Architecture',
        tag: 'GENOME BIOLOGY',
        summary: 'Composed of massive introns and extensive retrotransposon expansions, harboring unique non-coding regulatory elements that prime regeneration.',
        mapping: 'Ultra-Dense Intronic Storage ──► Sparse Compressed Inverted Indices',
      },
      {
        id: 'blastema_switches',
        icon: '🔬',
        title: 'Blastema Epigenetic Reprogramming',
        tag: 'EPIGENETICS',
        summary: 'Transient activation of Amx-Sox2, Hes1, and Kazald1 resets somatic cell identity back to a proliferative pluripotent state within 72 hours of injury.',
        mapping: 'Epigenetic State Rollback ──► Persistent Versioned Data Structures',
      },
      {
        id: 'orthologs_amx_vs_human',
        icon: '⚖️',
        title: 'Amx vs. Mammalian Comparative Loci',
        tag: 'COMPARATIVE GENOMICS',
        summary: 'Humans retain latent Sox2/Hes1 homologs, but epigenetic methylation and inflammatory cascades lock them into scarring pathways.',
        mapping: 'Comparative Pathway Optimization ──► Heuristic Genetic Search Algorithms',
      },
    ],
  },
  logistics: {
    title: '📊 DS&A Logistics & Bio-Computational Outputs',
    subtitle: 'Translating biological resilience principles into fault-tolerant distributed data structures',
    cards: [
      {
        id: 'dsa_bst',
        icon: '🌳',
        title: 'Self-Healing BST (RadGlia-BST)',
        tag: 'DATA STRUCTURES',
        summary: 'When any node or subtree is deleted, radial scaffold references trigger an O(log N) localized rotation and re-threading without global re-balancing overhead.',
        mapping: 'Glial Scaffold Bridging ──► Self-Healing Dynamic Binary Search Tree',
      },
      {
        id: 'dsa_graph',
        icon: '🕸️',
        title: 'Fault-Tolerant Dynamic Graph (Amx-Mesh)',
        tag: 'GRAPH ALGORITHMS',
        summary: 'Morphogen gradient heuristics allow distributed network edges to self-repair severed routing paths without full Dijkstra/Bellman-Ford recomputation.',
        mapping: 'Synaptic Retargeting ──► Dynamic Fault-Tolerant Graph Routing',
      },
      {
        id: 'dsa_buffer',
        icon: '💾',
        title: 'Blastema Persistent Buffer',
        tag: 'MEMORY RECOVERY',
        summary: 'Copy-on-write structural sharing with blastema rollback pointers provides zero-loss crash recovery and transactional undo semantics.',
        mapping: 'Blastema Reprogramming ──► Lossless Persistent Memory Buffer',
      },
    ],
  },
};

// --- Three.js Scene Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050811, 0.04);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.copy(state.targetCamPos);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffd1dc, 0.7);
scene.add(ambientLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
rimLight.position.set(-10, 8, -5);
scene.add(rimLight);

const mainKeyLight = new THREE.DirectionalLight(0xffaec9, 2.2);
mainKeyLight.position.set(8, 12, 10);
scene.add(mainKeyLight);

const underGlow = new THREE.PointLight(0xff4d6d, 2.0, 15);
underGlow.position.set(0, -2, 2);
scene.add(underGlow);

// --- PROCEDURAL REALISTIC LEUCISTIC SKIN & BUMP TEXTURES ---
function createRealisticAxolotlTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base pearlescent baby-pink gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#fff1f5');
  grad.addColorStop(0.3, '#fed7e2');
  grad.addColorStop(0.7, '#fbb6ce');
  grad.addColorStop(1, '#f687b3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft vascular / capillary blushing near head and flanks
  const blush = ctx.createRadialGradient(380, 260, 40, 380, 260, 360);
  blush.addColorStop(0, 'rgba(255, 77, 109, 0.28)');
  blush.addColorStop(0.6, 'rgba(255, 117, 151, 0.12)');
  blush.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = blush;
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro-capillary blood vessel branching (procedural veins)
  ctx.strokeStyle = 'rgba(217, 4, 41, 0.18)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let b = 0; b < 24; b++) {
    let x = 200 + Math.random() * 600;
    let y = 150 + Math.random() * 700;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (Math.random() - 0.45) * 45;
      y += (Math.random() - 0.5) * 45;
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Subtle costal groove shadow stripes (vertical salamander flank folds)
  ctx.strokeStyle = 'rgba(235, 110, 140, 0.14)';
  ctx.lineWidth = 14;
  ctx.filter = 'blur(6px)';
  for (let c = 280; c < 850; c += 48) {
    ctx.beginPath();
    ctx.moveTo(c, 200);
    ctx.bezierCurveTo(c + 15, 450, c - 10, 700, c + 8, 900);
    ctx.stroke();
  }
  ctx.filter = 'none';

  // Iridophore sparkles (fine amphibian skin stippling)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 900; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const r = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createAxolotlBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Costal groove indentations
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 10;
  ctx.filter = 'blur(4px)';
  for (let c = 120; c < 440; c += 34) {
    ctx.beginPath();
    ctx.moveTo(c, 80);
    ctx.lineTo(c, 440);
    ctx.stroke();
  }
  ctx.filter = 'none';

  // Micro-skin pores
  ctx.fillStyle = '#606060';
  for (let p = 0; p < 700; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const skinTexture = createRealisticAxolotlTexture();
const bumpTexture = createAxolotlBumpTexture();

// --- High-Fidelity Materials for Realistic Leucistic Axolotl ---
const axoSkinMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffe2ec,
  emissive: 0xff6584,
  emissiveIntensity: 0.12,
  map: skinTexture,
  bumpMap: bumpTexture,
  bumpScale: 0.025,
  roughness: 0.26,
  metalness: 0.02,
  clearcoat: 0.85,
  clearcoatRoughness: 0.16,
  transmission: 0.42,
  ior: 1.34,
  transparent: true,
  opacity: 0.94,
});

const finMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffc2d4,
  emissive: 0xff4d6d,
  emissiveIntensity: 0.18,
  roughness: 0.15,
  transmission: 0.72,
  thickness: 0.25,
  ior: 1.28,
  transparent: true,
  opacity: 0.68,
  side: THREE.DoubleSide,
});

const gillStemMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xd90429,
  emissive: 0x9b0020,
  emissiveIntensity: 0.45,
  roughness: 0.35,
  clearcoat: 0.6,
});

const gillFilamentMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4d6d,
  emissive: 0xef233c,
  emissiveIntensity: 0.35,
  roughness: 0.3,
  transparent: true,
  opacity: 0.92,
});

// Realistic amphibian eye with cornea dome
const eyeIrisMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1a050b,
  emissive: 0x590d22,
  emissiveIntensity: 0.25,
  roughness: 0.08,
  clearcoat: 1.0,
});
const eyeRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffb703,
});

const brainTissueMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x38bdf8,
  emissive: 0x0284c7,
  emissiveIntensity: 0.75,
  roughness: 0.2,
  transmission: 0.7,
  transparent: true,
  opacity: 0.85,
  wireframe: false,
});

// --- Organism Construction (Anatomical Ambystoma mexicanum) ---
const axolotlRoot = new THREE.Group();
scene.add(axolotlRoot);

// 1. Anatomical Spade-Shaped Amphibian Head
const headGroup = new THREE.Group();
headGroup.position.set(0, 0.35, 1.6);
axolotlRoot.add(headGroup);

// Main flattened cranium
const craniumGeo = new THREE.SphereGeometry(1.0, 32, 28);
// Sculpt: flatten top/bottom, broaden cheeks, taper front
const posAttr = craniumGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  let x = posAttr.getX(i);
  let y = posAttr.getY(i);
  let z = posAttr.getZ(i);

  // Flatten dorsoventrally
  y *= 0.52;
  // Broaden temporal jowls
  if (z > -0.3 && z < 0.5) x *= 1.35;
  // Taper snout towards anterior
  if (z > 0.4) {
    const taper = 1.0 - (z - 0.4) * 0.45;
    x *= Math.max(0.65, taper);
    y *= 0.85; // thinner snout
  }
  posAttr.setXYZ(i, x, y, z);
}
craniumGeo.computeVertexNormals();

const craniumMesh = new THREE.Mesh(craniumGeo, axoSkinMaterial);
headGroup.add(craniumMesh);

// Realistic Lower Jaw & Mouth Seam
const lowerJawGeo = new THREE.SphereGeometry(0.92, 24, 20);
const ljPos = lowerJawGeo.attributes.position;
for (let i = 0; i < ljPos.count; i++) {
  let x = ljPos.getX(i);
  let y = ljPos.getY(i) * 0.38 - 0.16;
  let z = ljPos.getZ(i);
  if (z > -0.2 && z < 0.4) x *= 1.28;
  if (z > 0.35) x *= 0.72;
  ljPos.setXYZ(i, x, y, z);
}
lowerJawGeo.computeVertexNormals();
const lowerJawMesh = new THREE.Mesh(lowerJawGeo, axoSkinMaterial);
headGroup.add(lowerJawMesh);

// Subtle Anatomical Nostrils (External Nares)
const naresMat = new THREE.MeshBasicMaterial({ color: 0x800f2f, transparent: true, opacity: 0.75 });
const naresL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), naresMat);
naresL.position.set(0.22, 0.06, 0.94);
const naresR = naresL.clone();
naresR.position.x = -0.22;
headGroup.add(naresL, naresR);

// Anatomically Recessed Amphibian Eyes
function createRealisticEye(isLeft) {
  const eyeHolder = new THREE.Group();
  const side = isLeft ? 1 : -1;
  eyeHolder.position.set(side * 0.68, 0.15, 0.42);

  // Dark obsidian eyeball with glossy wet cornea
  const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 24), eyeIrisMaterial);
  eyeHolder.add(eyeball);

  // Fine glistening gold-flecked iridophore rim
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.095, 24), eyeRingMaterial);
  ring.position.set(0, 0, 0.075);
  ring.rotation.y = side * 0.35;
  eyeHolder.add(ring);

  return eyeHolder;
}
headGroup.add(createRealisticEye(true));
headGroup.add(createRealisticEye(false));

// 2. Anatomical Tapering Salamander Trunk with Spine Curvature
const torsoSegments = [];
const TORSO_LENGTH = 3.6;
const trunkGeo = new THREE.CylinderGeometry(0.85, 0.58, TORSO_LENGTH, 32, 24);
trunkGeo.rotateX(Math.PI / 2);
// Shape trunk: slightly flattened oval with subtle belly drop
const tPos = trunkGeo.attributes.position;
for (let i = 0; i < tPos.count; i++) {
  let x = tPos.getX(i);
  let y = tPos.getY(i);
  let z = tPos.getZ(i);

  x *= 1.15; // wider than tall
  y *= 0.88;
  if (y < 0) y *= 1.12; // gentle belly curve
  tPos.setXYZ(i, x, y, z);
}
trunkGeo.computeVertexNormals();

const trunkMesh = new THREE.Mesh(trunkGeo, axoSkinMaterial);
trunkMesh.position.set(0, 0.28, -0.6);
axolotlRoot.add(trunkMesh);

// 3. Realistic Translucent Dorsal & Caudal Fin
const finShape = new THREE.Shape();
finShape.moveTo(0, 0.45);
finShape.bezierCurveTo(0, 0.65, -1.2, 0.95, -2.6, 1.2);
finShape.bezierCurveTo(-4.2, 1.35, -5.8, 1.1, -6.8, 0.1);
finShape.bezierCurveTo(-6.2, -0.6, -4.5, -0.85, -3.2, -0.65);
finShape.bezierCurveTo(-1.8, -0.45, 0, -0.3, 0, 0.45);

const finExtrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);
finGeo.rotateY(-Math.PI / 2);
finGeo.scale(1.0, 0.85, 1.0);
const finMesh = new THREE.Mesh(finGeo, finMaterial);
finMesh.position.set(0, 0.35, -0.2);
axolotlRoot.add(finMesh);

// 4. Feathery Coral-Crimson External Gills (3 pairs, dense organic plumes)
const gillGroups = [];
const gillAngles = [
  // Upper pair (longest, sweeping up and back)
  { side: 1, angle: 0.38, pitch: 0.42, y: 0.45, z: 0.2, len: 1.55, fCount: 48 },
  // Middle pair (mid-length, sweeping back)
  { side: 1, angle: 0.72, pitch: 0.16, y: 0.28, z: 0.0, len: 1.45, fCount: 44 },
  // Lower pair (shortest, sweeping down and back)
  { side: 1, angle: 1.05, pitch: -0.12, y: 0.12, z: -0.18, len: 1.25, fCount: 38 },
  // Left side pairs
  { side: -1, angle: -0.38, pitch: 0.42, y: 0.45, z: 0.2, len: 1.55, fCount: 48 },
  { side: -1, angle: -0.72, pitch: 0.16, y: 0.28, z: 0.0, len: 1.45, fCount: 44 },
  { side: -1, angle: -1.05, pitch: -0.12, y: 0.12, z: -0.18, len: 1.25, fCount: 38 },
];

gillAngles.forEach((conf, idx) => {
  const gGroup = new THREE.Group();
  gGroup.position.set(conf.side * 0.88, conf.y + 0.35, conf.z + 1.2);

  // Muscular, gracefully curving branchial ramus stalk
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(conf.side * 0.5, 0.35, -0.18),
    new THREE.Vector3(conf.side * conf.len * 0.7, 0.55, -0.42),
    new THREE.Vector3(conf.side * conf.len, 0.65, -0.68),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 28, 0.085, 12, false);
  const stemMesh = new THREE.Mesh(stemGeo, gillStemMaterial);
  gGroup.add(stemMesh);

  // Dense, double-sided feathery fimbriae (filaments)
  const filGeoList = [];
  for (let f = 0; f < conf.fCount; f++) {
    const t = 0.1 + (f / conf.fCount) * 0.88;
    const pt = stemCurve.getPoint(t);
    const tangent = stemCurve.getTangent(t);
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

    // Create 2 filaments per station (upper and lower fringe)
    for (let side = -1; side <= 1; side += 2) {
      const filLen = (0.28 + Math.sin(t * Math.PI) * 0.22) * (0.85 + Math.random() * 0.3);
      const tipPt = new THREE.Vector3(
        pt.x + conf.side * (0.15 + Math.random() * 0.1),
        pt.y + side * filLen * 0.85 - 0.06,
        pt.z - filLen * 0.65 + (Math.random() - 0.5) * 0.12
      );

      const fCurve = new THREE.QuadraticBezierCurve3(
        pt,
        new THREE.Vector3((pt.x + tipPt.x) * 0.5, pt.y + side * filLen * 0.4, pt.z - filLen * 0.2),
        tipPt
      );
      const singleFilGeo = new THREE.TubeGeometry(fCurve, 8, 0.02, 6, false);
      const filMesh = new THREE.Mesh(singleFilGeo, gillFilamentMaterial);
      gGroup.add(filMesh);
    }
  }

  gGroup.userData = { initialRot: new THREE.Euler(conf.pitch, conf.angle, 0), phase: idx * 0.9 };
  gGroup.rotation.copy(gGroup.userData.initialRot);
  axolotlRoot.add(gGroup);
  gillGroups.push(gGroup);
});

// 5. Anatomical Articulated Salamander Limbs with True Digits
function createAnatomicalLimb(isFront, isLeft) {
  const limbGroup = new THREE.Group();
  const side = isLeft ? 1 : -1;
  const x = side * 0.75;
  const y = 0.08;
  const z = isFront ? 0.75 : -1.8;
  limbGroup.position.set(x, y, z);

  // Upper segment (Humerus / Femur)
  const upperGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.55, 12);
  const upperMesh = new THREE.Mesh(upperGeo, axoSkinMaterial);
  upperMesh.rotation.z = side * -0.65;
  upperMesh.rotation.x = isFront ? 0.25 : -0.25;
  upperMesh.position.set(side * 0.22, -0.15, 0);
  limbGroup.add(upperMesh);

  // Forearm / Shin (Radius/Ulna or Tibia/Fibula)
  const lowerGeo = new THREE.CylinderGeometry(0.085, 0.065, 0.5, 12);
  const lowerMesh = new THREE.Mesh(lowerGeo, axoSkinMaterial);
  lowerMesh.rotation.z = side * 0.45;
  lowerMesh.position.set(side * 0.42, -0.42, isFront ? 0.12 : -0.1);
  limbGroup.add(lowerMesh);

  // Splayed delicate salamander digits (4 for front, 5 for hind)
  const digitCount = isFront ? 4 : 5;
  const handGroup = new THREE.Group();
  handGroup.position.set(side * 0.5, -0.62, isFront ? 0.16 : -0.12);

  for (let d = 0; d < digitCount; d++) {
    const angle = ((d - (digitCount - 1) / 2) / digitCount) * 1.1;
    const dCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.sin(angle) * 0.18, -0.06, Math.cos(angle) * 0.22),
      new THREE.Vector3(Math.sin(angle) * 0.32, -0.09, Math.cos(angle) * 0.38),
    ]);
    const dGeo = new THREE.TubeGeometry(dCurve, 8, 0.022, 6, false);
    const dMesh = new THREE.Mesh(dGeo, axoSkinMaterial);
    handGroup.add(dMesh);
  }
  limbGroup.add(handGroup);

  return limbGroup;
}

axolotlRoot.add(createAnatomicalLimb(true, true));
axolotlRoot.add(createAnatomicalLimb(true, false));
axolotlRoot.add(createAnatomicalLimb(false, true));
axolotlRoot.add(createAnatomicalLimb(false, false));

// --- INTERNAL BRAIN / TELENCEPHALON MODEL ---
const brainRoot = new THREE.Group();
brainRoot.position.set(0, 0.35, 1.55);
axolotlRoot.add(brainRoot);

// Telencephalon Hemispheres
const lobeGeo = new THREE.SphereGeometry(0.38, 24, 20);
lobeGeo.scale(0.85, 0.65, 1.3);

const leftLobe = new THREE.Mesh(lobeGeo, brainTissueMaterial);
leftLobe.position.set(0.24, 0.08, 0.1);
const rightLobe = new THREE.Mesh(lobeGeo, brainTissueMaterial);
rightLobe.position.set(-0.24, 0.08, 0.1);

// Olfactory Bulbs
const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
bulbGeo.scale(0.8, 0.7, 1.4);
const bulbL = new THREE.Mesh(bulbGeo, brainTissueMaterial);
bulbL.position.set(0.18, 0.04, 0.65);
const bulbR = new THREE.Mesh(bulbGeo, brainTissueMaterial);
bulbR.position.set(-0.18, 0.04, 0.65);

brainRoot.add(leftLobe, rightLobe, bulbL, bulbR);

// Neural Connectome & Radial Glia Scaffold Particles/Lines
const NEURAL_NODES_COUNT = 90;
const neuralPositions = [];
const neuralColors = [];
const radialGliaLines = [];

for (let i = 0; i < NEURAL_NODES_COUNT; i++) {
  const side = Math.random() > 0.5 ? 1 : -1;
  const x = side * (0.05 + Math.random() * 0.35);
  const y = (Math.random() - 0.5) * 0.25 + 0.08;
  const z = (Math.random() - 0.5) * 0.7 + 0.1;

  neuralPositions.push(x, y, z);
  neuralColors.push(0.22, 0.74, 0.97); // Cyan electric glow
}

const neuralGeo = new THREE.BufferGeometry();
neuralGeo.setAttribute('position', new THREE.Float32BufferAttribute(neuralPositions, 3));
neuralGeo.setAttribute('color', new THREE.Float32BufferAttribute(neuralColors, 3));

const neuralPointsMat = new THREE.PointsMaterial({
  size: 0.07,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
});
const neuralNetPoints = new THREE.Points(neuralGeo, neuralPointsMat);
brainRoot.add(neuralNetPoints);

// Inter-synaptic Axonal & Glial Edges
const edgeLinesMat = new THREE.LineBasicMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.45,
  blending: THREE.AdditiveBlending,
});

const edgePositions = [];
for (let i = 0; i < NEURAL_NODES_COUNT; i++) {
  const xi = neuralPositions[i * 3];
  const yi = neuralPositions[i * 3 + 1];
  const zi = neuralPositions[i * 3 + 2];

  for (let j = i + 1; j < NEURAL_NODES_COUNT; j++) {
    const xj = neuralPositions[j * 3];
    const yj = neuralPositions[j * 3 + 1];
    const zj = neuralPositions[j * 3 + 2];
    const dist = Math.hypot(xi - xj, yi - yj, zi - zj);

    if (dist < 0.26) {
      edgePositions.push(xi, yi, zi, xj, yj, zj);
    }
  }
}
const edgeGeo = new THREE.BufferGeometry();
edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
const neuralEdgeMesh = new THREE.LineSegments(edgeGeo, edgeLinesMat);
brainRoot.add(neuralEdgeMesh);

// --- NANO SCALE: 32Gb DNA DOUBLE HELIX MODEL ---
const dnaGroup = new THREE.Group();
dnaGroup.position.set(0, 0.35, 1.55);
axolotlRoot.add(dnaGroup);

const DNA_PAIRS_COUNT = 38;
const dnaRungs = [];
const dnaStrand1Pts = [];
const dnaStrand2Pts = [];

const rungMaterial = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 });
const strand1Material = new THREE.MeshBasicMaterial({ color: 0xffaec9, transparent: true, opacity: 0.9 });
const strand2Material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });

for (let i = 0; i < DNA_PAIRS_COUNT; i++) {
  const theta = (i / DNA_PAIRS_COUNT) * Math.PI * 5;
  const y = (i / DNA_PAIRS_COUNT - 0.5) * 1.6;
  const radius = 0.22;

  const p1 = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
  const p2 = new THREE.Vector3(Math.cos(theta + Math.PI) * radius, y, Math.sin(theta + Math.PI) * radius);

  dnaStrand1Pts.push(p1);
  dnaStrand2Pts.push(p2);

  // Rung between strands
  const rungGeo = new THREE.CylinderGeometry(0.015, 0.015, radius * 2, 8);
  const rungMesh = new THREE.Mesh(rungGeo, rungMaterial);
  rungMesh.position.set(0, y, 0);
  rungMesh.rotation.y = -theta;
  rungMesh.rotation.z = Math.PI / 2;
  dnaGroup.add(rungMesh);
  dnaRungs.push(rungMesh);
}

const strand1Geo = new THREE.BufferGeometry().setFromPoints(dnaStrand1Pts);
const strand2Geo = new THREE.BufferGeometry().setFromPoints(dnaStrand2Pts);
dnaGroup.add(new THREE.Line(strand1Geo, strand1Material));
dnaGroup.add(new THREE.Line(strand2Geo, strand2Material));
dnaGroup.visible = false; // Initially hidden until zoomed into nano/meso

// Ambient Floating Bioluminescent Water Particles
const PARTICLE_COUNT = 320;
const particleGeo = new THREE.BufferGeometry();
const particleCoords = [];
for (let p = 0; p < PARTICLE_COUNT; p++) {
  particleCoords.push(
    (Math.random() - 0.5) * 28,
    (Math.random() - 0.5) * 16,
    (Math.random() - 0.5) * 24
  );
}
particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particleCoords, 3));
const particleMat = new THREE.PointsMaterial({
  size: 0.06,
  color: 0xffc4d6,
  transparent: true,
  opacity: 0.45,
  blending: THREE.AdditiveBlending,
});
const bioParticles = new THREE.Points(particleGeo, particleMat);
scene.add(bioParticles);

/* ==========================================================================
   WEB AUDIO API BIO-SYNTHESIZER
   ========================================================================== */
function initAudio() {
  if (!state.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      state.audioContext = new AudioCtx();
    }
  }
}

function playBioTone(freq = 440, type = 'sine', duration = 0.25, volume = 0.15) {
  if (state.isAudioMuted || !state.audioContext) return;
  try {
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, state.audioContext.currentTime);

    gain.gain.setValueAtTime(volume, state.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(state.audioContext.destination);

    osc.start();
    osc.stop(state.audioContext.currentTime + duration);
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
}

function playRegenChime() {
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    setTimeout(() => playBioTone(freq, 'sine', 0.4, 0.12), idx * 90);
  });
}

function playDisruptionTone() {
  playBioTone(180, 'sawtooth', 0.5, 0.2);
  setTimeout(() => playBioTone(130, 'triangle', 0.4, 0.2), 120);
}

/* ==========================================================================
   INTERACTIVE MULTI-SCALE ZOOM MECHANICS
   ========================================================================== */
const zoomStepMacro = document.getElementById('zoom-step-macro');
const zoomStepCranium = document.getElementById('zoom-step-cranium');
const zoomStepMeso = document.getElementById('zoom-step-meso');
const zoomStepMicro = document.getElementById('zoom-step-micro');
const zoomStepNano = document.getElementById('zoom-step-nano');
const zoomScaleReadout = document.getElementById('zoom-scale-readout');

const zoomStepElements = {
  macro: zoomStepMacro,
  cranium: zoomStepCranium,
  meso: zoomStepMeso,
  micro: zoomStepMicro,
  nano: zoomStepNano,
};

function setZoomLevel(levelKey) {
  if (!ZOOM_LEVELS[levelKey]) return;
  state.activeZoomLevel = levelKey;
  const cfg = ZOOM_LEVELS[levelKey];

  // Update target camera position
  state.targetCamPos.copy(cfg.camPos);
  state.targetLookAt.copy(cfg.lookAt);

  // Update HUD UI
  Object.values(zoomStepElements).forEach((el) => el.classList.remove('active'));
  if (zoomStepElements[levelKey]) {
    zoomStepElements[levelKey].classList.add('active');
  }
  zoomScaleReadout.textContent = cfg.label;

  // Adjust material visibilities based on semantic level
  dnaGroup.visible = levelKey === 'nano' || levelKey === 'micro';
  brainTissueMaterial.opacity = cfg.opacityBrain;

  showNotification(`Semantic Zoom: ${cfg.title} (${cfg.label})`);
  playBioTone(320 + cfg.scale * 0.05, 'sine', 0.15, 0.08);

  // Update Telemetry metrics according to level
  updateTelemetryForZoom(levelKey);
}

function updateTelemetryForZoom(levelKey) {
  const bioStatusTitle = document.getElementById('bio-status-title');
  const bioStatusText = document.getElementById('bio-status-text');

  switch (levelKey) {
    case 'macro':
      bioStatusTitle.textContent = 'Whole Organism Homeostasis';
      bioStatusText.textContent =
        'Leucistic juvenile specimen. Intact ependymoglial network coordinates systemic regenerative competence and somatic growth.';
      break;
    case 'cranium':
      bioStatusTitle.textContent = 'Cranial & Gill Vascularization';
      bioStatusText.textContent =
        'External feathery gills continuously oxygenate forebrain ventricular zones, supplying morphogen cues (FGF, Wnt5a, BMP) to stem cell pools.';
      break;
    case 'meso':
      bioStatusTitle.textContent = 'Forebrain / Telencephalon Connectome';
      bioStatusText.textContent =
        'Bilateral pallial hemispheres maintain sensory integration. Ventricular zone contains quiescent ependymoglia primed for scarless neurogenesis.';
      break;
    case 'micro':
      bioStatusTitle.textContent = 'Ependymoglial Radial Fiber Scaffolding';
      bioStatusText.textContent =
        'Radial glia span ventricular-to-pial borders. Newborn neuroblasts utilize these cytokeratin tracks to migrate precisely to damaged circuitry.';
      break;
    case 'nano':
      bioStatusTitle.textContent = '32Gb Axolotl Megagenome & Loci';
      bioStatusText.textContent =
        'Massive non-coding regulatory sequences flank Amx-Sox2 and Kazald1, enabling rapid epigenetic reprogramming without fibrotic senescence.';
      break;
  }
}

// Zoom in / out buttons
document.getElementById('zoom-in-btn').addEventListener('click', () => {
  initAudio();
  const order = ['macro', 'cranium', 'meso', 'micro', 'nano'];
  const curIdx = order.indexOf(state.activeZoomLevel);
  if (curIdx < order.length - 1) {
    setZoomLevel(order[curIdx + 1]);
  }
});

document.getElementById('zoom-out-btn').addEventListener('click', () => {
  initAudio();
  const order = ['macro', 'cranium', 'meso', 'micro', 'nano'];
  const curIdx = order.indexOf(state.activeZoomLevel);
  if (curIdx > 0) {
    setZoomLevel(order[curIdx - 1]);
  }
});

// Clickable zoom track steps
Object.keys(zoomStepElements).forEach((lvlKey) => {
  zoomStepElements[lvlKey].addEventListener('click', () => {
    initAudio();
    setZoomLevel(lvlKey);
  });
});

// Mouse wheel zoom
window.addEventListener(
  'wheel',
  (e) => {
    initAudio();
    const order = ['macro', 'cranium', 'meso', 'micro', 'nano'];
    const curIdx = order.indexOf(state.activeZoomLevel);
    if (e.deltaY > 30 && curIdx > 0) {
      setZoomLevel(order[curIdx - 1]);
    } else if (e.deltaY < -30 && curIdx < order.length - 1) {
      setZoomLevel(order[curIdx + 1]);
    }
  },
  { passive: true }
);

/* ==========================================================================
   NOTIFICATIONS HUD
   ========================================================================== */
let notifTimeout = null;
const notifEl = document.getElementById('center-notification');
const notifText = document.getElementById('notification-text');

function showNotification(msg, duration = 3000) {
  notifText.textContent = msg;
  notifEl.classList.add('active');
  if (notifTimeout) clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => {
    notifEl.classList.remove('active');
  }, duration);
}

/* ==========================================================================
   RESEARCH PILLARS MODAL & DOCK LOGISTICS
   ========================================================================== */
const pillarModal = document.getElementById('pillar-modal');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalCardsContainer = document.getElementById('modal-cards-container');
const closeModalBtn = document.getElementById('close-modal-btn');

const navBrainBtn = document.getElementById('nav-brain-btn');
const navDnaBtn = document.getElementById('nav-dna-btn');
const navLogisticsBtn = document.getElementById('nav-logistics-btn');
const navButtons = [navBrainBtn, navDnaBtn, navLogisticsBtn];

function openPillar(pillarKey) {
  initAudio();
  const data = PILLARS_DATA[pillarKey];
  if (!data) return;

  state.activePillar = pillarKey;

  // Update tabs
  navButtons.forEach((btn) => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.pillar-tab-btn[data-section="${pillarKey}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  modalTitle.textContent = data.title;
  modalSubtitle.textContent = data.subtitle;

  // Build interactive cards
  modalCardsContainer.innerHTML = '';
  data.cards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `pillar-interactive-card ${idx === 0 ? 'selected' : ''}`;
    cardEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-icon-badge">${card.icon}</div>
        <span class="card-tag">${card.tag}</span>
      </div>
      <div class="card-title">${card.title}</div>
      <div class="card-summary">${card.summary}</div>
    `;

    cardEl.addEventListener('click', () => {
      document.querySelectorAll('.pillar-interactive-card').forEach((c) => c.classList.remove('selected'));
      cardEl.classList.add('selected');
      updateBioLogisticsMapping(card);
      playBioTone(520, 'sine', 0.15, 0.1);
    });

    modalCardsContainer.appendChild(cardEl);
  });

  pillarModal.classList.add('visible');
  pillarModal.setAttribute('aria-hidden', 'false');

  // Trigger relevant camera focal shift
  if (pillarKey === 'brain') setZoomLevel('meso');
  else if (pillarKey === 'dna') setZoomLevel('nano');
  else if (pillarKey === 'logistics') expandBottomDock(true);

  // Map first card
  updateBioLogisticsMapping(data.cards[0]);
}

function closePillarModal() {
  pillarModal.classList.remove('visible');
  pillarModal.setAttribute('aria-hidden', 'true');
  state.activePillar = null;
  navButtons.forEach((btn) => btn.classList.remove('active'));
}

navBrainBtn.addEventListener('click', () => openPillar('brain'));
navDnaBtn.addEventListener('click', () => openPillar('dna'));
navLogisticsBtn.addEventListener('click', () => openPillar('logistics'));
closeModalBtn.addEventListener('click', closePillarModal);

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePillarModal();
});

/* ==========================================================================
   BOTTOM DOCK LOGISTICS TRANSLATOR (BIOLOGY ➔ DS&A)
   ========================================================================== */
const bottomDock = document.getElementById('bottom-dock');
const dockToggleBar = document.getElementById('dock-toggle-bar');
const dockActiveMapping = document.getElementById('dock-active-mapping');
const dockBioDesc = document.getElementById('dock-bio-desc');
const dockCodeSnippet = document.getElementById('dock-code-snippet');
const algoSimStatus = document.getElementById('algo-sim-status');
const algoTestBreakBtn = document.getElementById('algo-test-break-btn');

function expandBottomDock(forceOpen = null) {
  if (forceOpen !== null) {
    if (forceOpen) bottomDock.classList.add('expanded');
    else bottomDock.classList.remove('expanded');
  } else {
    bottomDock.classList.toggle('expanded');
  }
  // Immediately recalculate canvas dimensions once visible
  setTimeout(() => {
    resizeMiniCanvas();
  }, 50);
}
dockToggleBar.addEventListener('click', () => expandBottomDock());

function updateBioLogisticsMapping(card) {
  dockActiveMapping.textContent = card.mapping;
  dockBioDesc.innerHTML = `<strong>${card.title}:</strong> ${card.summary}`;

  if (card.id.includes('bst') || card.id.includes('radial')) {
    dockCodeSnippet.textContent = `// Bio-Derived RadGlia Self-Healing Binary Search Tree
class RadGliaBST<T> {
  root: RadialNode<T> | null = null;

  // Scarless node repair: re-threads severed edges via cytokeratin scaffold
  repairSeveredNode(targetVal: T): void {
    const scaffoldPointers = this.gatherRadialProjections(this.root);
    this.root = this.rebuildLocalTopology(this.root, targetVal, scaffoldPointers);
    // Guarantees balanced O(log N) depth without full red-black recoloring
  }
}`;
    algoSimStatus.textContent = 'RadGlia-BST: Balanced (Depth 3)';
  } else if (card.id.includes('graph') || card.id.includes('circuit')) {
    dockCodeSnippet.textContent = `// Morphogen-Guided Dynamic Fault-Tolerant Graph
class AmxRegenerativeMesh {
  adjacencyList: Map<string, Set<string>> = new Map();
  gradientField: Map<string, number> = new Map();

  healBrokenEdge(fromNode: string, severedNode: string): string {
    // Queries local morphogen concentration instead of global Dijkstra
    const nearestAfferent = this.findHighestGradientNeighbor(fromNode);
    this.adjacencyList.get(fromNode)?.add(nearestAfferent);
    return nearestAfferent; // O(1) Local Recovery
  }
}`;
    algoSimStatus.textContent = 'Amx-Mesh: Zero Packet Loss';
  } else {
    dockCodeSnippet.textContent = `// Blastema Persistent Buffer with Epigenetic Rollback
class BlastemaPersistentBuffer<T> {
  private historyLoci: Array<Map<string, T>> = [];

  checkpointPluripotentState(): number {
    return this.historyLoci.push(new Map(this.currentLoci)) - 1;
  }

  reprogramToState(blastemaToken: number): void {
    // Lossless epigenetic state rollback upon memory corruption
    this.currentLoci = new Map(this.historyLoci[blastemaToken]);
  }
}`;
    algoSimStatus.textContent = 'Blastema Buffer: Homeostatic';
  }
}

/* ==========================================================================
   MINI 2D CANVAS: INTERACTIVE DS&A REGENERATION SIMULATOR
   ========================================================================== */
const miniCanvas = document.getElementById('algo-mini-canvas');
const miniCtx = miniCanvas.getContext('2d');

function resizeMiniCanvas() {
  miniCanvas.width = miniCanvas.clientWidth * window.devicePixelRatio;
  miniCanvas.height = miniCanvas.clientHeight * window.devicePixelRatio;
}
resizeMiniCanvas();
window.addEventListener('resize', resizeMiniCanvas);

// Mini Graph State
const miniNodes = [
  { id: 1, x: 0.5, y: 0.2, alive: true, label: 'Root' },
  { id: 2, x: 0.28, y: 0.5, alive: true, label: 'L-Pallium' },
  { id: 3, x: 0.72, y: 0.5, alive: true, label: 'R-Pallium' },
  { id: 4, x: 0.16, y: 0.8, alive: true, label: 'Ventricular' },
  { id: 5, x: 0.4, y: 0.8, alive: true, label: 'Glial Hub' },
  { id: 6, x: 0.6, y: 0.8, alive: true, label: 'Olfactory' },
  { id: 7, x: 0.84, y: 0.8, alive: true, label: 'Optic Tectum' },
];
const miniEdges = [
  [1, 2],
  [1, 3],
  [2, 4],
  [2, 5],
  [3, 6],
  [3, 7],
];

let severedEdgePulse = 0;

function renderMiniAlgoCanvas() {
  const w = miniCanvas.width;
  const h = miniCanvas.height;
  miniCtx.clearRect(0, 0, w, h);

  // Draw edges
  miniEdges.forEach(([srcId, tgtId]) => {
    const src = miniNodes.find((n) => n.id === srcId);
    const tgt = miniNodes.find((n) => n.id === tgtId);
    if (!src || !tgt) return;

    const isSevered = !src.alive || !tgt.alive;

    miniCtx.beginPath();
    miniCtx.moveTo(src.x * w, src.y * h);
    miniCtx.lineTo(tgt.x * w, tgt.y * h);

    if (isSevered) {
      miniCtx.strokeStyle = 'rgba(255, 77, 109, 0.4)';
      miniCtx.setLineDash([4, 4]);
      miniCtx.lineWidth = 2;
    } else {
      miniCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      miniCtx.setLineDash([]);
      miniCtx.lineWidth = 1.5;
    }
    miniCtx.stroke();
  });
  miniCtx.setLineDash([]);

  // Draw nodes
  miniNodes.forEach((node) => {
    const nx = node.x * w;
    const ny = node.y * h;

    miniCtx.beginPath();
    miniCtx.arc(nx, ny, 8 * window.devicePixelRatio, 0, Math.PI * 2);

    if (node.alive) {
      miniCtx.fillStyle = '#38bdf8';
      miniCtx.shadowColor = '#38bdf8';
      miniCtx.shadowBlur = 10;
    } else {
      miniCtx.fillStyle = '#ff4d6d';
      miniCtx.shadowColor = '#ff4d6d';
      miniCtx.shadowBlur = 12;
    }
    miniCtx.fill();
    miniCtx.shadowBlur = 0;

    miniCtx.fillStyle = '#ffffff';
    miniCtx.font = `${8 * window.devicePixelRatio}px 'JetBrains Mono', monospace`;
    miniCtx.textAlign = 'center';
    miniCtx.fillText(node.label, nx, ny - 10 * window.devicePixelRatio);
  });

  requestAnimationFrame(renderMiniAlgoCanvas);
}
renderMiniAlgoCanvas();

// Break node button
algoTestBreakBtn.addEventListener('click', () => {
  initAudio();
  const targetNode = miniNodes[1]; // L-Pallium
  targetNode.alive = false;
  algoSimStatus.textContent = 'Node [L-Pallium] Severed! Scaffolding active...';
  playDisruptionTone();

  setTimeout(() => {
    targetNode.alive = true;
    algoSimStatus.textContent = 'RadGlia Repaired! Topological Balance Restored (O(log N))';
    playRegenChime();
  }, 1600);
});

/* ==========================================================================
   SIMULATE DISRUPTION & REGENERATION SEQUENCE
   ========================================================================== */
const induceLesionBtn = document.getElementById('induce-lesion-btn');
const triggerRegenBtn = document.getElementById('trigger-regen-btn');
const stimulateGliaBtn = document.getElementById('stimulate-glia-btn');
const specimenStatusBadge = document.getElementById('specimen-status-badge');
const metricSpike = document.getElementById('metric-spike');
const metricGlia = document.getElementById('metric-glia');

function triggerDisruption() {
  if (state.isRegenerating) return;
  initAudio();
  state.isLesioned = true;
  state.isRegenerating = true;

  // Flash UI & Sound
  playDisruptionTone();
  showNotification('⚠️ MICRO-LESION INDUCED IN FOREBRAIN: Scarless Repair Initiated', 4000);

  specimenStatusBadge.textContent = 'DISRUPTION DETECTED';
  specimenStatusBadge.style.backgroundColor = 'rgba(255, 77, 109, 0.2)';
  specimenStatusBadge.style.color = '#ff7597';
  specimenStatusBadge.style.borderColor = 'rgba(255, 77, 109, 0.5)';

  metricSpike.textContent = '14.2 Hz';
  metricSpike.style.color = '#ff4d6d';
  metricGlia.textContent = 'PROLIFERATING';
  metricGlia.style.color = '#fbbf24';

  // Visually color severed brain nodes red
  const colors = neuralGeo.attributes.color.array;
  for (let i = 0; i < NEURAL_NODES_COUNT; i++) {
    if (i < 30) {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.35;
    }
  }
  neuralGeo.attributes.color.needsUpdate = true;
  brainTissueMaterial.color.setHex(0xff4d6d);
  brainTissueMaterial.emissive.setHex(0xc9184a);

  // Auto-focus camera to the lesion site
  setZoomLevel('meso');

  // Trigger biological repair progression
  setTimeout(() => {
    specimenStatusBadge.textContent = 'RADIAL GLIAL BRIDGING';
    showNotification('🌱 Radial Glia extending cytokeratin scaffold fibers across lesion...', 3000);
    metricGlia.textContent = 'MIGRATING';
    playBioTone(380, 'sine', 0.3, 0.15);
  }, 1800);

  setTimeout(() => {
    // Restore colors & Homeostasis
    for (let i = 0; i < NEURAL_NODES_COUNT; i++) {
      colors[i * 3] = 0.22;
      colors[i * 3 + 1] = 0.74;
      colors[i * 3 + 2] = 0.97;
    }
    neuralGeo.attributes.color.needsUpdate = true;
    brainTissueMaterial.color.setHex(0x38bdf8);
    brainTissueMaterial.emissive.setHex(0x0284c7);

    specimenStatusBadge.textContent = 'REGENERATION COMPLETE';
    specimenStatusBadge.style.backgroundColor = 'rgba(52, 211, 153, 0.15)';
    specimenStatusBadge.style.color = '#34d399';
    specimenStatusBadge.style.borderColor = 'rgba(52, 211, 153, 0.3)';

    metricSpike.textContent = '44.8 Hz';
    metricSpike.style.color = '#ffffff';
    metricGlia.textContent = 'Quiescent';
    metricGlia.style.color = '#ffffff';

    state.isLesioned = false;
    state.isRegenerating = false;

    showNotification('✨ Complete Functional Reconnection: Zero Glial Scarring!', 4000);
    playRegenChime();
  }, 4200);
}

induceLesionBtn.addEventListener('click', triggerDisruption);
triggerRegenBtn.addEventListener('click', triggerDisruption);

stimulateGliaBtn.addEventListener('click', () => {
  initAudio();
  playBioTone(520, 'sine', 0.2, 0.15);
  playBioTone(640, 'triangle', 0.2, 0.12);
  showNotification('⚡ Neural Synaptic Pulse Broadcast across Telencephalon');

  // Quick pulsing glow
  brainTissueMaterial.emissiveIntensity = 1.8;
  setTimeout(() => {
    brainTissueMaterial.emissiveIntensity = 0.75;
  }, 400);
});

/* ==========================================================================
   X-RAY CRANIAL TOGGLE & AUDIO TOGGLE
   ========================================================================== */
const xrayToggleBtn = document.getElementById('xray-toggle-btn');
const xrayBtnLabel = document.getElementById('xray-btn-label');
xrayToggleBtn.addEventListener('click', () => {
  state.isXRayActive = !state.isXRayActive;
  xrayBtnLabel.textContent = state.isXRayActive ? 'X-Ray: On' : 'X-Ray: Off';
  axoSkinMaterial.opacity = state.isXRayActive ? 0.45 : 0.95;
  showNotification(`Cranial X-Ray: ${state.isXRayActive ? 'Translucent Forebrain View' : 'Solid Leucistic Skin'}`);
});

const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioBtnLabel = document.getElementById('audio-btn-label');
audioToggleBtn.addEventListener('click', () => {
  initAudio();
  state.isAudioMuted = !state.isAudioMuted;
  audioBtnLabel.textContent = state.isAudioMuted ? 'Muted' : 'Audio On';
  showNotification(`Bio-Audio Synthesizer: ${state.isAudioMuted ? 'Muted' : 'Enabled'}`);
});

const brandResetBtn = document.getElementById('brand-reset-btn');
brandResetBtn.addEventListener('click', () => {
  initAudio();
  setZoomLevel('macro');
  closePillarModal();
});

/* ==========================================================================
   INTERACTIVE ORBIT & MOUSE ROTATION
   ========================================================================== */
let isDragging = false;
let prevMousePos = { x: 0, y: 0 };
const organismRotVelocity = { x: 0, y: 0 };

window.addEventListener('mousedown', (e) => {
  if (e.target.closest('button, nav, aside, footer, .pillar-detail-modal')) return;
  initAudio();
  isDragging = true;
  prevMousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - prevMousePos.x;
  const deltaY = e.clientY - prevMousePos.y;

  axolotlRoot.rotation.y += deltaX * 0.006;
  axolotlRoot.rotation.x = Math.max(-0.6, Math.min(0.6, axolotlRoot.rotation.x + deltaY * 0.005));

  prevMousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// Touch support for mobile / touchpads
window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1 && !e.target.closest('button, nav, aside, footer')) {
    initAudio();
    isDragging = true;
    prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
});
window.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  const deltaX = e.touches[0].clientX - prevMousePos.x;
  const deltaY = e.touches[0].clientY - prevMousePos.y;

  axolotlRoot.rotation.y += deltaX * 0.006;
  axolotlRoot.rotation.x = Math.max(-0.6, Math.min(0.6, axolotlRoot.rotation.x + deltaY * 0.005));

  prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchend', () => {
  isDragging = false;
});

/* ==========================================================================
   RENDER ANIMATION LOOP
   ========================================================================== */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Natural Axolotl Idle Floating & Tail Undulation
  if (!isDragging) {
    axolotlRoot.rotation.y += 0.0015;
  }
  axolotlRoot.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

  // Organic Salamander Swimming Undulation (Spine wave)
  if (trunkMesh) {
    trunkMesh.rotation.y = Math.sin(elapsedTime * 1.8) * 0.06;
  }
  if (finMesh) {
    finMesh.rotation.y = Math.sin(elapsedTime * 1.8 - 0.6) * 0.16;
  }
  if (headGroup) {
    headGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.03;
  }

  // 2. Feathery External Gills Swaying in Water Currents
  gillGroups.forEach((g) => {
    const p = g.userData.phase;
    g.rotation.z = g.userData.initialRot.z + Math.sin(elapsedTime * 1.8 + p) * 0.08;
    g.rotation.y = g.userData.initialRot.y + Math.cos(elapsedTime * 1.5 + p) * 0.06;
  });

  // 3. DNA Double Helix Rotation
  if (dnaGroup.visible) {
    dnaGroup.rotation.y = elapsedTime * 0.8;
  }

  // 4. Ambient Bio-Particles Drift
  bioParticles.rotation.y = elapsedTime * 0.02;

  // 5. Neural Firing Action Potential Pulses
  const colors = neuralGeo.attributes.color.array;
  if (!state.isLesioned) {
    const pulseFactor = 0.5 + Math.sin(elapsedTime * 6.0) * 0.45;
    neuralPointsMat.size = 0.06 + Math.sin(elapsedTime * 5.0) * 0.02;
  }

  // 6. Smooth Camera Interpolation (Lerp to Target)
  camera.position.lerp(state.targetCamPos, 0.065);
  state.currentLookAt.lerp(state.targetLookAt, 0.065);
  camera.lookAt(state.currentLookAt);

  renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Kick off animation loop
animate();
setZoomLevel('macro');
