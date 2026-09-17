"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { GeneratedModel } from "@make3d/types";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

function readColorToken(name: string): THREE.Color {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Color();
  const scope = document.querySelector(".projectsHome") ?? document.documentElement;
  context.fillStyle = getComputedStyle(scope).getPropertyValue(name).trim();
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Color(red / 255, green / 255, blue / 255);
}

function Mesh({ model, wireframe, color }: { model: GeneratedModel; wireframe: boolean; color: THREE.Color }) {
  const geometry = useMemo(() => {
    const source = model.mesh.positions;
    const converted = new Float32Array(source.length);
    for (let index = 0; index < source.length; index += 3) { converted[index] = source[index]; converted[index + 1] = source[index + 2]; converted[index + 2] = -source[index + 1]; }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(converted, 3));
    next.setIndex(new THREE.BufferAttribute(model.mesh.indices, 1));
    next.computeVertexNormals();
    return next;
  }, [model]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // Generated solids deliberately have sharp print edges. Averaging normals across
  // indexed faces creates false gradients on coplanar surfaces around holes.
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={0.74} metalness={0} flatShading wireframe={wireframe} /></mesh>;
}

function CameraFit({ model, resetToken, interactive, compact, fitScale, autoRotate }: { model: GeneratedModel; resetToken: number; interactive: boolean; compact: boolean; fitScale: number; autoRotate: boolean }) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera } = useThree();
  useEffect(() => {
    const bounds = new THREE.Box3();
    const point = new THREE.Vector3();
    for (let index = 0; index < model.mesh.positions.length; index += 3) {
      point.set(model.mesh.positions[index], model.mesh.positions[index + 2], -model.mesh.positions[index + 1]);
      bounds.expandByPoint(point);
    }
    const center = bounds.getCenter(new THREE.Vector3());
    const diagonal = bounds.getSize(new THREE.Vector3()).length();
    const fieldOfView = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const distance = Math.max(40, diagonal / (2 * Math.tan(fieldOfView / 2)) * (compact ? fitScale : 1.08));
    camera.position.copy(center).add(new THREE.Vector3(0.64, 0.54, 0.64).normalize().multiplyScalar(distance));
    camera.near = Math.max(0.1, distance / 100);
    camera.far = distance * 20;
    camera.updateProjectionMatrix();
    controls.current?.target.copy(center);
    controls.current?.update();
  }, [camera, compact, fitScale, model, resetToken]);
  return <OrbitControls ref={controls} makeDefault enabled={interactive || autoRotate} enableDamping={interactive} dampingFactor={0.08} enablePan={interactive} enableRotate={interactive} enableZoom={interactive} autoRotate={autoRotate} autoRotateSpeed={0.32} />;
}

export function ModelViewport({ model, wireframe, resetToken, compact = false, transparent = false, fitScale = 1.12, autoRotate = false, modelColorToken }: { model?: GeneratedModel; wireframe: boolean; resetToken: number; compact?: boolean; transparent?: boolean; fitScale?: number; autoRotate?: boolean; modelColorToken?: string }) {
  const [colors, setColors] = useState<{ canvas: THREE.Color; model: THREE.Color } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    setColors({ canvas: readColorToken("--color-canvas"), model: readColorToken(modelColorToken ?? "--color-model-3d") });
  }, [modelColorToken]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  if (!colors) return <div className={`canvasWrap ${compact ? "canvasWrap--thumbnail" : ""}`} />;
  const shouldRotate = autoRotate && !reduceMotion;
  return <div className={`canvasWrap ${compact ? "canvasWrap--thumbnail" : ""}`}><Canvas gl={{ alpha: transparent }} dpr={compact ? [1, 1.5] : [1, 2]} frameloop={shouldRotate || !compact ? "always" : "demand"} camera={{ position: [120, 100, 120], fov: compact ? 34 : 38 }}>{!transparent && <color attach="background" args={[colors.canvas]} />}<ambientLight intensity={0.86} /><directionalLight position={[100, 160, 80]} intensity={1.02} /><directionalLight position={[-80, 70, -120]} intensity={0.16} />{model ? <><Mesh model={model} wireframe={wireframe} color={colors.model} /><CameraFit model={model} resetToken={resetToken} interactive={!compact} compact={compact} fitScale={fitScale} autoRotate={shouldRotate} /></> : null}</Canvas></div>;
}
