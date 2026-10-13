"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { isWebGLAvailable, prefersReducedMotion, isMobileDevice } from "./webgl-check";

interface Logo3DProps {
  className?: string;
  size?: number; // Size in px (default 150)
  interactive?: boolean;
}

export function Logo3D({ className = "", size = 150, interactive = true }: Logo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.15, y: -0.2 });
  const currentRotation = useRef({ x: 0.15, y: -0.2 });

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.0;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const isMobile = isMobileDevice();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLightTeal = new THREE.DirectionalLight(0x0d9488, 3.2); // Rich Teal
    dirLightTeal.position.set(3, 4, 3);
    scene.add(dirLightTeal);

    const dirLightGold = new THREE.DirectionalLight(0xf59e0b, 2.5); // Warm Gold
    dirLightGold.position.set(-3, -3, 2);
    scene.add(dirLightGold);

    const pointLight = new THREE.PointLight(0xffffff, 2.2, 8);
    pointLight.position.set(0, 0, 3.2);
    scene.add(pointLight);

    // --- 3D Logo Medallion Group ---
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    let particleSystem: THREE.Points | null = null;

    // Load Image onto an Offscreen Canvas to preserve 1:1 Aspect Ratio without stretching
    const img = new window.Image();
    img.src = "/logo.png";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Create high-res 512x512 canvas for the medallion face
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Luxury White / Soft Ivory radial badge background
        const grad = ctx.createRadialGradient(256, 256, 60, 256, 256, 256);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.7, "#f0fdfa");
        grad.addColorStop(1, "#ccfbf1");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(256, 256, 254, 0, Math.PI * 2);
        ctx.fill();

        // Inner Gold ring border
        ctx.strokeStyle = "#e2a03f";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(256, 256, 240, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary Teal ring
        ctx.strokeStyle = "#0d9488";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(256, 256, 226, 0, Math.PI * 2);
        ctx.stroke();

        // Draw logo centered with preserved aspect ratio and upright orientation
        const scale = Math.min(380 / img.width, 240 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        ctx.save();
        ctx.translate(256, 256);
        ctx.rotate(-Math.PI / 2); // Perfectly upright orientation on Cylinder top cap
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }

      const faceTexture = new THREE.CanvasTexture(canvas);
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Back Face Canvas (Opposite UV orientation)
      const backCanvas = document.createElement("canvas");
      backCanvas.width = 512;
      backCanvas.height = 512;
      const backCtx = backCanvas.getContext("2d");
      if (backCtx) {
        const grad = backCtx.createRadialGradient(256, 256, 60, 256, 256, 256);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.7, "#fef3c7");
        grad.addColorStop(1, "#fde68a");
        backCtx.fillStyle = grad;
        backCtx.beginPath();
        backCtx.arc(256, 256, 254, 0, Math.PI * 2);
        backCtx.fill();

        backCtx.strokeStyle = "#ca8a04";
        backCtx.lineWidth = 14;
        backCtx.beginPath();
        backCtx.arc(256, 256, 240, 0, Math.PI * 2);
        backCtx.stroke();

        backCtx.strokeStyle = "#0d9488";
        backCtx.lineWidth = 4;
        backCtx.beginPath();
        backCtx.arc(256, 256, 226, 0, Math.PI * 2);
        backCtx.stroke();

        const scale = Math.min(380 / img.width, 240 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        backCtx.save();
        backCtx.translate(256, 256);
        backCtx.rotate(Math.PI / 2);
        backCtx.drawImage(img, -w / 2, -h / 2, w, h);
        backCtx.restore();
      }

      const backFaceTexture = new THREE.CanvasTexture(backCanvas);
      backFaceTexture.colorSpace = THREE.SRGBColorSpace;
      backFaceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Create Medallion Disc
      const discGeometry = new THREE.CylinderGeometry(1.25, 1.25, 0.16, 64);

      // Gold Metallic Edge
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xca8a04,
        emissive: 0x713f12,
        emissiveIntensity: 0.15,
        metalness: 0.92,
        roughness: 0.18,
      });

      // Front Face Material
      const frontFaceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        metalness: 0.25,
        roughness: 0.2,
      });

      // Back Face Material (Minted Gold Seal)
      const backFaceMaterial = new THREE.MeshStandardMaterial({
        map: backFaceTexture,
        metalness: 0.35,
        roughness: 0.25,
      });

      const medallionMaterials = [rimMaterial, frontFaceMaterial, backFaceMaterial];
      const medallionMesh = new THREE.Mesh(discGeometry, medallionMaterials);
      medallionMesh.rotation.x = Math.PI / 2;
      logoGroup.add(medallionMesh);

      // Outer Beveled Torus Accent Ring
      const outerTorusGeo = new THREE.TorusGeometry(1.27, 0.055, 16, 64);
      const outerTorusMat = new THREE.MeshStandardMaterial({
        color: 0x0f766e,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x042f2e,
      });
      const outerTorus = new THREE.Mesh(outerTorusGeo, outerTorusMat);
      logoGroup.add(outerTorus);

      // Sparkling clean particles orbiting the medallion
      const pCount = 32;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);

      for (let i = 0; i < pCount; i++) {
        const angle = (i / pCount) * Math.PI * 2;
        const radius = 1.55 + (Math.random() - 0.5) * 0.35;
        pPos[i * 3] = Math.cos(angle) * radius;
        pPos[i * 3 + 1] = Math.sin(angle) * radius;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }

      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x2dd4bf,
        size: 0.09,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      particleSystem = new THREE.Points(pGeo, pMat);
      logoGroup.add(particleSystem);

      setIsLoaded(true);
    };

    img.onerror = () => {
      setHasWebGL(false);
    };

    // --- Interactive Pointer & Drag Handlers ---
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingRef.current) {
        const deltaX = clientX - previousMousePosition.current.x;
        const deltaY = clientY - previousMousePosition.current.y;

        targetRotation.current.y += deltaX * 0.018;
        targetRotation.current.x += deltaY * 0.015;

        // Clamp vertical tilt
        targetRotation.current.x = Math.max(-0.65, Math.min(0.65, targetRotation.current.x));

        previousMousePosition.current = { x: clientX, y: clientY };
      } else {
        // Subtle tilt on hover relative to container
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        if (normX >= -1.5 && normX <= 1.5 && normY >= -1.5 && normY <= 1.5) {
          targetRotation.current.y = normX * 0.45;
          targetRotation.current.x = -normY * 0.35;
        }
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const reducedMotion = prefersReducedMotion();

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      if (!reducedMotion) {
        // Gentle vertical float
        logoGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.05;

        // Auto spin slowly when idle
        if (!isDraggingRef.current) {
          targetRotation.current.y += 0.005;
        }

        if (particleSystem) {
          particleSystem.rotation.z = elapsedTime * 0.4;
        }
      }

      logoGroup.rotation.x = currentRotation.current.x;
      logoGroup.rotation.y = currentRotation.current.y;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", handlePointerDown);
      domElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [interactive, size]);

  if (!hasWebGL) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-white/70 p-2 shadow-inner ring-1 ring-white/60 backdrop-blur-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Clean Sweep Oasis LTD Logo"
          width={size - 24}
          height={size - 24}
          className="object-contain drop-shadow-md"
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing transition-transform duration-300 hover:scale-105 drop-shadow-lg"
        style={{ width: size, height: size }}
        title="Interactive 3D Clean Sweep Emblem (Drag or hover to rotate)"
      />

      {/* Interactive indicator pill */}
      {isLoaded && (
        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-teal-800 ring-1 ring-teal-200/70 shadow-xs">
          <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
          Interactive 3D • Drag to Spin
        </span>
      )}
    </div>
  );
}
