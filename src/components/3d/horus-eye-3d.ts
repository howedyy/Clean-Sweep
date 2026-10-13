import * as THREE from "three";

export interface HorusEyeController {
  group: THREE.Group;
  setOpenProgress: (progress: number) => void; // 0 = closed, 1 = fully open
  update: (elapsedTime: number) => void;
  dispose: () => void;
}

export function create3DHorusEye(): HorusEyeController {
  const group = new THREE.Group();
  group.name = "HorusEyeRoot";

  // --- Materials ---
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2a03f,
    emissive: 0x78350f,
    emissiveIntensity: 0.15,
    metalness: 0.92,
    roughness: 0.18,
  });

  const darkTealMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    emissive: 0x042f2e,
    metalness: 0.85,
    roughness: 0.25,
  });

  const scleraMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.15,
    metalness: 0.05,
  });

  const irisMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    emissive: 0x14b8a6,
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.5,
  });

  const pupilMaterial = new THREE.MeshBasicMaterial({
    color: 0x022c22,
  });

  // --- 1. Sclera (Eyeball Background - Almond Shape) ---
  const almondShape = new THREE.Shape();
  almondShape.moveTo(-2.2, 0);
  almondShape.quadraticCurveTo(0, 1.35, 2.2, 0);
  almondShape.quadraticCurveTo(0, -1.35, -2.2, 0);

  const almondGeo = new THREE.ShapeGeometry(almondShape, 48);
  const scleraMesh = new THREE.Mesh(almondGeo, scleraMaterial);
  scleraMesh.position.z = -0.05;
  group.add(scleraMesh);

  // --- 2. Iris & Pupil Group ---
  const irisGroup = new THREE.Group();
  irisGroup.position.set(0, 0, 0.02);
  group.add(irisGroup);

  // Iris Outer Ring (Gold)
  const irisRingGeo = new THREE.RingGeometry(0.85, 0.95, 48);
  const irisRing = new THREE.Mesh(irisRingGeo, goldMaterial);
  irisGroup.add(irisRing);

  // Vibrant Turquoise Iris Disc
  const irisDiscGeo = new THREE.CircleGeometry(0.85, 48);
  const irisDisc = new THREE.Mesh(irisDiscGeo, irisMaterial);
  irisDisc.position.z = 0.01;
  irisGroup.add(irisDisc);

  // Deep Central Pupil
  const pupilGeo = new THREE.CircleGeometry(0.38, 36);
  const pupil = new THREE.Mesh(pupilGeo, pupilMaterial);
  pupil.position.z = 0.02;
  irisGroup.add(pupil);

  // Specular Highlight Star on pupil
  const highlightGeo = new THREE.CircleGeometry(0.09, 16);
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const highlight = new THREE.Mesh(highlightGeo, highlightMat);
  highlight.position.set(0.14, 0.14, 0.03);
  irisGroup.add(highlight);

  // Dynamic Eye Glow Light (intensifies when opened)
  const eyeLight = new THREE.PointLight(0x2dd4bf, 0, 6);
  eyeLight.position.set(0, 0, 0.5);
  irisGroup.add(eyeLight);

  // --- 3. Eyelids (Upper & Lower which move to OPEN the eye) ---
  // Upper Eyelid Shell
  const upperLidGroup = new THREE.Group();
  upperLidGroup.position.set(0, 0, 0.04);
  group.add(upperLidGroup);

  const upperLidShape = new THREE.Shape();
  upperLidShape.moveTo(-2.25, 0);
  upperLidShape.quadraticCurveTo(0, 1.4, 2.25, 0);
  upperLidShape.lineTo(2.25, 0);
  upperLidShape.quadraticCurveTo(0, 0, -2.25, 0);

  const upperLidGeo = new THREE.ShapeGeometry(upperLidShape, 48);
  const upperLidMesh = new THREE.Mesh(upperLidGeo, darkTealMaterial);
  upperLidGroup.add(upperLidMesh);

  // Upper Eyelid Gold Rim Edge (Curves along upper lid)
  const upperCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.25, 0, 0.02),
    new THREE.Vector3(0, 1.4, 0.02),
    new THREE.Vector3(2.25, 0, 0.02)
  );
  const upperRimGeo = new THREE.TubeGeometry(upperCurve, 40, 0.06, 12, false);
  const upperRimMesh = new THREE.Mesh(upperRimGeo, goldMaterial);
  upperLidGroup.add(upperRimMesh);

  // Lower Eyelid Shell
  const lowerLidGroup = new THREE.Group();
  lowerLidGroup.position.set(0, 0, 0.04);
  group.add(lowerLidGroup);

  const lowerLidShape = new THREE.Shape();
  lowerLidShape.moveTo(-2.25, 0);
  lowerLidShape.quadraticCurveTo(0, -1.4, 2.25, 0);
  lowerLidShape.lineTo(2.25, 0);
  lowerLidShape.quadraticCurveTo(0, 0, -2.25, 0);

  const lowerLidGeo = new THREE.ShapeGeometry(lowerLidShape, 48);
  const lowerLidMesh = new THREE.Mesh(lowerLidGeo, darkTealMaterial);
  lowerLidGroup.add(lowerLidMesh);

  // Lower Eyelid Gold Rim Edge
  const lowerCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.25, 0, 0.02),
    new THREE.Vector3(0, -1.4, 0.02),
    new THREE.Vector3(2.25, 0, 0.02)
  );
  const lowerRimGeo = new THREE.TubeGeometry(lowerCurve, 40, 0.05, 12, false);
  const lowerRimMesh = new THREE.Mesh(lowerRimGeo, goldMaterial);
  lowerLidGroup.add(lowerRimMesh);

  // --- 4. Horus Eyebrow (Arching above the eye) ---
  const browCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 1.35, 0.03),
    new THREE.Vector3(-1.0, 1.95, 0.05),
    new THREE.Vector3(0.6, 2.05, 0.05),
    new THREE.Vector3(2.3, 1.45, 0.03),
  ]);
  const browGeo = new THREE.TubeGeometry(browCurve, 48, 0.08, 12, false);
  const browMesh = new THREE.Mesh(browGeo, goldMaterial);
  group.add(browMesh);

  // --- 5. Horus Teardrop Marking (Vertical downstroke from inner eye) ---
  const teardropCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, -1.1, 0.03),
    new THREE.Vector3(-0.4, -1.7, 0.04),
    new THREE.Vector3(-0.45, -2.3, 0.03),
  ]);
  const teardropGeo = new THREE.TubeGeometry(teardropCurve, 32, 0.065, 12, false);
  const teardropMesh = new THREE.Mesh(teardropGeo, goldMaterial);
  group.add(teardropMesh);

  // Teardrop end bulb
  const teardropBulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const teardropBulb = new THREE.Mesh(teardropBulbGeo, goldMaterial);
  teardropBulb.position.set(-0.45, -2.32, 0.03);
  group.add(teardropBulb);

  // --- 6. Horus Falcon Spiral Tail (Curling to the right) ---
  const spiralCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, -1.25, 0.03),
    new THREE.Vector3(0.3, -1.55, 0.04),
    new THREE.Vector3(1.1, -1.75, 0.04),
    new THREE.Vector3(1.8, -1.6, 0.03),
    new THREE.Vector3(2.0, -1.2, 0.03),
    new THREE.Vector3(1.65, -0.95, 0.03),
  ]);
  const spiralGeo = new THREE.TubeGeometry(spiralCurve, 48, 0.06, 12, false);
  const spiralMesh = new THREE.Mesh(spiralGeo, goldMaterial);
  group.add(spiralMesh);

  // --- 7. Clean Sparkle Particle Emitter around the Eye ---
  const sparkleCount = 45;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(sparkleCount * 3);
  const sparkleVel = new Float32Array(sparkleCount * 3);

  for (let i = 0; i < sparkleCount; i++) {
    sparklePos[i * 3] = (Math.random() - 0.5) * 4.0;
    sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
    sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

    sparkleVel[i * 3] = (Math.random() - 0.5) * 0.02;
    sparkleVel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    sparkleVel[i * 3 + 2] = Math.random() * 0.03 + 0.01;
  }

  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
  const sparkleMat = new THREE.PointsMaterial({
    color: 0x5eead4,
    size: 0.12,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const sparkleSystem = new THREE.Points(sparkleGeo, sparkleMat);
  group.add(sparkleSystem);

  // --- Animation State & Methods ---
  let currentOpen = 0;

  const setOpenProgress = (target: number) => {
    // Clamp target between 0 (closed) and 1 (fully open)
    currentOpen = Math.max(0, Math.min(1, target));

    // Smooth sinusoidal curve for natural eyelid motion
    const ease = Math.sin(currentOpen * (Math.PI / 2));

    // 1. Upper eyelid slides UPWARD (revealing the top of iris)
    upperLidGroup.position.y = ease * 1.5;
    upperLidGroup.scale.y = 1 - ease * 0.7; // Thin out as it retracts into brow

    // 2. Lower eyelid slides DOWNWARD
    lowerLidGroup.position.y = -ease * 1.25;
    lowerLidGroup.scale.y = 1 - ease * 0.65;

    // 3. Iris dilates and comes forward
    const pupilScale = 0.4 + ease * 0.6;
    irisGroup.scale.set(pupilScale, pupilScale, 1);
    irisGroup.position.z = 0.02 + ease * 0.08;

    // 4. Glow light intensifies with open progress
    eyeLight.intensity = ease * 3.8;
    (irisMaterial as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + ease * 0.8;

    // 5. Eyebrow raises subtly in greeting
    browMesh.position.y = ease * 0.25;

    // 6. Sparkle density / opacity increases
    sparkleMat.opacity = 0.3 + ease * 0.7;
    sparkleMat.size = 0.08 + ease * 0.08;
  };

  const update = (elapsedTime: number) => {
    // Subtle breathing float on whole eye
    group.position.y += Math.sin(elapsedTime * 2.0) * 0.0015;

    // Particles swirl gently
    const pos = sparkleSystem.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < sparkleCount; i++) {
      pos[i * 3] += sparkleVel[i * 3];
      pos[i * 3 + 1] += sparkleVel[i * 3 + 1];
      pos[i * 3 + 2] += sparkleVel[i * 3 + 2];

      // Reset particles that drift too far
      if (pos[i * 3 + 2] > 2.5) {
        pos[i * 3] = (Math.random() - 0.5) * 3.0;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
        pos[i * 3 + 2] = -0.2;
      }
    }
    sparkleSystem.geometry.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    almondGeo.dispose();
    irisRingGeo.dispose();
    irisDiscGeo.dispose();
    pupilGeo.dispose();
    highlightGeo.dispose();
    upperLidGeo.dispose();
    upperRimGeo.dispose();
    lowerLidGeo.dispose();
    lowerRimGeo.dispose();
    browGeo.dispose();
    teardropGeo.dispose();
    teardropBulbGeo.dispose();
    spiralGeo.dispose();
    sparkleGeo.dispose();

    goldMaterial.dispose();
    darkTealMaterial.dispose();
    scleraMaterial.dispose();
    irisMaterial.dispose();
    pupilMaterial.dispose();
    highlightMat.dispose();
    sparkleMat.dispose();
  };

  // Start in closed state
  setOpenProgress(0);

  return {
    group,
    setOpenProgress,
    update,
    dispose,
  };
}
