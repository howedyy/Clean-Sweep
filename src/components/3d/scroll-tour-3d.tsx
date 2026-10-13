"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { isWebGLAvailable, prefersReducedMotion, isMobileDevice } from "./webgl-check";
import { create3DHorusEye } from "./horus-eye-3d";
import { Eye, Compass, Sparkles, X, ChevronRight, ChevronLeft, Maximize2, Minimize2 } from "lucide-react";

export interface TourStage {
  id: string;
  name: string;
  subtitle: string;
  progress: [number, number]; // [start, end]
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
  tag: string;
}

export const TOUR_STAGES: TourStage[] = [
  {
    id: "hero",
    name: "The Awakened Eye of Horus",
    subtitle: "Scroll Down to Open the Eye & Embark on the 3D Oasis Tour",
    progress: [0, 0.16],
    cameraPos: [0, 0.3, 6.2],
    cameraLookAt: [0, 0.2, 0],
    tag: "3D Eye Portal",
  },
  {
    id: "about",
    name: "Foundation of Trust",
    subtitle: "Full Public Liability (£5M) & Certified COSHH Protocols",
    progress: [0.16, 0.35],
    cameraPos: [-3.8, 1.8, 6.2],
    cameraLookAt: [-1.2, 0.5, 0],
    tag: "About & Standards",
  },
  {
    id: "commercial",
    name: "Commercial & Office Suites",
    subtitle: "Corporate Workspaces, Restrooms & High-Touch Disinfection",
    progress: [0.35, 0.52],
    cameraPos: [3.5, 2.2, 5.8],
    cameraLookAt: [0.8, 0.2, 0],
    tag: "Commercial Services",
  },
  {
    id: "domestic",
    name: "Domestic, Deep Clean & Grounds",
    subtitle: "Homes, Tenancy Turnovers, Gardens & Odd Jobs",
    progress: [0.52, 0.70],
    cameraPos: [0.5, -0.8, 5.5],
    cameraLookAt: [0, -0.5, 0],
    tag: "Specialist Services",
  },
  {
    id: "process",
    name: "4-Step Quality Pathway",
    subtitle: "Site Visit → Free Quotation → Schedule → Inspection",
    progress: [0.70, 0.86],
    cameraPos: [-2.2, -1.8, 6.0],
    cameraLookAt: [0, -1.8, 0],
    tag: "Our Process",
  },
  {
    id: "contact",
    name: "5-Star Sanctuary & Bookings",
    subtitle: "London & UK Service Coverage • 100% Satisfaction Guarantee",
    progress: [0.86, 1.0],
    cameraPos: [0, 0.5, 7.0],
    cameraLookAt: [0, 0, 0],
    tag: "Reviews & Contact",
  },
];

export function ScrollTour3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [hudVisible, setHudVisible] = useState(true);
  const [isFullTourMode, setIsFullTourMode] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [eyeOpenPercent, setEyeOpenPercent] = useState(0);

  const isDraggingTour = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const manualOrbit = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf0fdfa, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 6.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const isMobile = isMobileDevice();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x0d9488, 2.8); // Deep Teal
    mainLight.position.set(6, 9, 6);
    scene.add(mainLight);

    const goldLight = new THREE.DirectionalLight(0xf59e0b, 2.2); // Gold ambient
    goldLight.position.set(-6, -4, 4);
    scene.add(goldLight);

    // --- 1. THE 3D HORUS EYE CONTROLLER (Centerpiece Opening Portal) ---
    const horusEye = create3DHorusEye();
    horusEye.group.position.set(0, 0.3, 0);
    horusEye.group.scale.set(1.4, 1.4, 1.4);
    scene.add(horusEye.group);

    // --- 2. Ambient Sparkle & Bubble Field ---
    const particleCount = isMobile ? 90 : 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      particleSpeeds[i] = 0.2 + Math.random() * 0.7;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x14b8a6,
      size: isMobile ? 0.09 : 0.14,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const sparkleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(sparkleSystem);

    // --- 3. Portal Torus Aura surrounding Eye ---
    const torusGeo = new THREE.TorusGeometry(2.35, 0.06, 16, 64);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x042f2e,
      roughness: 0.2,
      metalness: 0.92,
      transparent: true,
      opacity: 0.75,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, 0.3, -0.1);
    scene.add(torusMesh);

    // --- 4. Zone 1 (About): Trust Shield Pillars ---
    const aboutGroup = new THREE.Group();
    aboutGroup.position.set(-3.2, 0.8, -1.0);
    scene.add(aboutGroup);

    const pillarGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    for (let p = 0; p < 3; p++) {
      const pMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pMesh.position.set((p - 1) * 1.4, (p % 2) * 0.45, 0);
      pMesh.rotation.x = Math.PI / 2.4;
      aboutGroup.add(pMesh);
    }

    // --- 5. Zone 2 (Services): Modern Workspaces & Clean Architecture ---
    const servicesGroup = new THREE.Group();
    servicesGroup.position.set(2.8, 0.6, -1.2);
    scene.add(servicesGroup);

    const floorGridGeo = new THREE.PlaneGeometry(5.0, 4.0, 10, 8);
    const floorGridMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const floorGrid = new THREE.Mesh(floorGridGeo, floorGridMat);
    floorGrid.rotation.x = -Math.PI / 2.4;
    servicesGroup.add(floorGrid);

    const boxGeo = new THREE.BoxGeometry(0.85, 0.5, 0.85);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.2,
      metalness: 0.75,
      transparent: true,
      opacity: 0.7,
    });

    [-1.3, 0, 1.3].forEach((xPos, idx) => {
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(xPos, 0.25 + idx * 0.15, (idx - 1) * 0.6);
      servicesGroup.add(box);
    });

    // --- 6. Zone 3 (Process): 4-Node Trajectory Railway ---
    const processGroup = new THREE.Group();
    processGroup.position.set(0, -2.0, -1.5);
    scene.add(processGroup);

    const stepNodes: THREE.Mesh[] = [];
    const stepSphereGeo = new THREE.SphereGeometry(0.26, 24, 24);

    for (let s = 0; s < 4; s++) {
      const stepMat = new THREE.MeshStandardMaterial({
        color: s === 0 ? 0x0d9488 : 0x94a3b8,
        emissive: s === 0 ? 0x0f766e : 0x000000,
        metalness: 0.9,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(stepSphereGeo, stepMat);
      sphere.position.set((s - 1.5) * 1.8, Math.sin(s * 0.8) * 0.3, 0);
      processGroup.add(sphere);
      stepNodes.push(sphere);

      if (s < 3) {
        const lineGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 16);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.45 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set((s - 1.5 + 0.5) * 1.8, 0, 0);
        line.rotation.z = Math.PI / 2;
        processGroup.add(line);
      }
    }

    // --- Scroll & Camera Path Management ---
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      targetScrollProgress = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Interactive Orbit in Full Tour Mode ---
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (!isFullTourMode) return;
      isDraggingTour.current = true;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStart.current = { x: cx, y: cy };
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingTour.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = cx - dragStart.current.x;
      const dy = cy - dragStart.current.y;
      manualOrbit.current.x += dx * 0.005;
      manualOrbit.current.y += dy * 0.005;
      dragStart.current = { x: cx, y: cy };
    };

    const handleMouseUp = () => {
      isDraggingTour.current = false;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("touchstart", handleMouseDown, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);

    // --- Render Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const reducedMotion = prefersReducedMotion();

      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;
      const p = currentScrollProgress;

      // Update stage index
      const stageIdx = TOUR_STAGES.findIndex((stage) => p >= stage.progress[0] && p <= stage.progress[1]);
      if (stageIdx !== -1) {
        setCurrentStageIndex(stageIdx);
      }
      setProgressPercent(Math.round(p * 100));

      // --- Eye of Horus Opening Animation ---
      // When at top (p = 0): eye is closed (0.0)
      // As user scrolls down (0 -> 0.12): eye opens smoothly to 1.0!
      const eyeOpen = Math.min(1, p / 0.11);
      setEyeOpenPercent(Math.round(eyeOpen * 100));
      horusEye.setOpenProgress(eyeOpen);
      horusEye.update(elapsedTime);

      // Transition the eye upwards as guardian once user scrolls past the hero
      if (p > 0.12) {
        const exitProgress = (p - 0.12) / 0.88;
        horusEye.group.position.y = 0.3 + exitProgress * 4.2;
        horusEye.group.position.z = -exitProgress * 4.8;
        horusEye.group.rotation.x = -exitProgress * 0.35;
        horusEye.group.rotation.y = Math.sin(elapsedTime * 0.4) * 0.08;
        torusMesh.position.y = horusEye.group.position.y;
        torusMesh.position.z = horusEye.group.position.z - 0.1;
      } else {
        horusEye.group.position.set(0, 0.3, 0);
        horusEye.group.rotation.set(0, 0, 0);
        torusMesh.position.set(0, 0.3, -0.1);
      }

      // Calculate camera position interpolation
      let startStage = TOUR_STAGES[0];
      let endStage = TOUR_STAGES[TOUR_STAGES.length - 1];
      let localT = 0;

      for (let i = 0; i < TOUR_STAGES.length - 1; i++) {
        if (p >= TOUR_STAGES[i].progress[0] && p <= TOUR_STAGES[i + 1].progress[0]) {
          startStage = TOUR_STAGES[i];
          endStage = TOUR_STAGES[i + 1];
          const range = endStage.progress[0] - startStage.progress[0];
          localT = range > 0 ? (p - startStage.progress[0]) / range : 0;
          break;
        }
      }

      const easeT = 0.5 - Math.cos(localT * Math.PI) * 0.5;

      const baseCamX = THREE.MathUtils.lerp(startStage.cameraPos[0], endStage.cameraPos[0], easeT);
      const baseCamY = THREE.MathUtils.lerp(startStage.cameraPos[1], endStage.cameraPos[1], easeT);
      const baseCamZ = THREE.MathUtils.lerp(startStage.cameraPos[2], endStage.cameraPos[2], easeT);

      // Add manual orbit offset if user interacted
      const targetCamX = baseCamX + manualOrbit.current.x * 2.5;
      const targetCamY = baseCamY - manualOrbit.current.y * 2.0;
      const targetCamZ = baseCamZ;

      targetLookAt.set(
        THREE.MathUtils.lerp(startStage.cameraLookAt[0], endStage.cameraLookAt[0], easeT),
        THREE.MathUtils.lerp(startStage.cameraLookAt[1], endStage.cameraLookAt[1], easeT),
        THREE.MathUtils.lerp(startStage.cameraLookAt[2], endStage.cameraLookAt[2], easeT)
      );

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;

      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

      if (!reducedMotion) {
        // Sparkle float
        const positions = sparkleSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += Math.sin(elapsedTime * particleSpeeds[i] + i) * 0.005;
          positions[i * 3] += Math.cos(elapsedTime * 0.3 + i) * 0.003;
        }
        sparkleSystem.geometry.attributes.position.needsUpdate = true;

        torusMesh.rotation.z = elapsedTime * 0.15;
        torusMesh.rotation.y = elapsedTime * 0.1;

        aboutGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2 + p * 2;
        servicesGroup.rotation.y = -Math.cos(elapsedTime * 0.4) * 0.15 - p * 2;

        stepNodes.forEach((node, idx) => {
          const stepThreshold = 0.70 + (idx / 4) * 0.16;
          const isActive = p >= stepThreshold;
          const mat = node.material as THREE.MeshStandardMaterial;
          if (isActive) {
            mat.color.setHex(0x14b8a6);
            mat.emissive.setHex(0x0f766e);
            node.scale.setScalar(1.2 + Math.sin(elapsedTime * 4 + idx) * 0.1);
          } else {
            mat.color.setHex(0x94a3b8);
            mat.emissive.setHex(0x000000);
            node.scale.setScalar(1.0);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      horusEye.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [isFullTourMode]);

  const activeStage = TOUR_STAGES[currentStageIndex] || TOUR_STAGES[0];

  const jumpToStage = (idx: number) => {
    const stage = TOUR_STAGES[idx];
    if (!stage) return;
    const targetProgress = (stage.progress[0] + stage.progress[1]) / 2;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targetProgress * maxScroll,
      behavior: "smooth",
    });
  };

  if (!hasWebGL) return null;

  return (
    <>
      {/* Background WebGL Viewport (Locked to background, non-interfering) */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`fixed inset-0 transition-all duration-700 ${
          isFullTourMode
            ? "z-50 pointer-events-auto bg-slate-950/75 backdrop-blur-md opacity-100 cursor-grab active:cursor-grabbing"
            : "z-0 pointer-events-none opacity-90"
        }`}
      />

      {/* Full Tour Mode Banner & Controls */}
      {isFullTourMode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-slate-900/90 px-5 py-2.5 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl">
          <Sparkles className="size-4 text-teal-400 animate-spin" />
          <span className="text-xs font-semibold tracking-wide">
            Interactive 3D Mode Active • Drag to Explore 360°
          </span>
          <button
            type="button"
            onClick={() => setIsFullTourMode(false)}
            className="ml-2 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold hover:bg-teal-500 transition-colors"
          >
            Exit 3D View
          </button>
        </div>
      )}

      {/* Sleek 3D Tour HUD (Heads-Up Display) at bottom right */}
      {hudVisible ? (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl border border-teal-200/70 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all hover:bg-white sm:bottom-6 sm:right-6">
          <div className="flex items-center justify-between gap-3 border-b border-teal-100/70 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-600" />
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-teal-900">
                Live 3D Tour Experience
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-bold text-teal-700">
                {progressPercent}%
              </span>
              <button
                type="button"
                onClick={() => setIsFullTourMode(!isFullTourMode)}
                className="rounded-md p-1 text-slate-400 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                title={isFullTourMode ? "Minimize 3D View" : "Enter Interactive 3D Mode"}
              >
                {isFullTourMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setHudVisible(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Minimize 3D Tour HUD"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-600">
                <Compass className="h-3.5 w-3.5" />
                <span>{activeStage.tag}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">
                Stage {currentStageIndex + 1} of {TOUR_STAGES.length}
              </span>
            </div>
            <h4 className="mt-0.5 font-display text-sm font-bold text-slate-900 leading-tight">
              {activeStage.name}
            </h4>
            <p className="mt-1 text-xs text-slate-600 line-clamp-1 leading-relaxed">
              {activeStage.subtitle}
            </p>

            {/* Dynamic Eye of Horus Awakening Status */}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-teal-50/80 px-2.5 py-1.5 text-[11px]">
              <span className="font-semibold text-teal-900 flex items-center gap-1">
                <Eye className="size-3.5 text-teal-600" />
                <span>Eye of Horus:</span>
              </span>
              <span className="font-bold text-teal-700">
                {eyeOpenPercent === 0
                  ? "Sleeping (Closed)"
                  : eyeOpenPercent < 100
                  ? `Awakening (${eyeOpenPercent}%)`
                  : "Awakened & Open"}
              </span>
            </div>
          </div>

          {/* Quick Stage Navigation Buttons */}
          <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-2">
            <button
              type="button"
              disabled={currentStageIndex === 0}
              onClick={() => jumpToStage(currentStageIndex - 1)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" /> Prev
            </button>
            <div className="flex gap-1">
              {TOUR_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => jumpToStage(idx)}
                  className={`size-2 rounded-full transition-all ${
                    idx === currentStageIndex ? "w-4 bg-teal-600" : "bg-slate-200 hover:bg-teal-300"
                  }`}
                  title={s.name}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={currentStageIndex === TOUR_STAGES.length - 1}
              onClick={() => jumpToStage(currentStageIndex + 1)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Mini progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-teal-500 to-amber-400 transition-all duration-300"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setHudVisible(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-teal-800 shadow-xl backdrop-blur-md transition-all hover:bg-teal-50 sm:bottom-6 sm:right-6"
          title="Open Live 3D Tour HUD"
        >
          <Eye className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>3D Tour Active</span>
          <span className="rounded-full bg-teal-100 px-1.5 py-0.2 text-[10px] text-teal-700 font-bold">
            {progressPercent}%
          </span>
        </button>
      )}
    </>
  );
}
