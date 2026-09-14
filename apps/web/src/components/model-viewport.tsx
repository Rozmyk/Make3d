"use client";

import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { GeneratedModel } from "@make3d/types";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

function readColorToken(name: string): THREE.Color {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Color();
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={0.82} metalness={0} wireframe={wireframe} /></mesh>;
}

function CameraFit({ model, resetToken, interactive, compact }: { model: GeneratedModel; resetToken: number; interactive: boolean; compact: boolean }) {
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
    const distance = Math.max(40, diagonal / (2 * Math.tan(fieldOfView / 2)) * (compact ? 1.22 : 1.08));
    camera.position.copy(center).add(new THREE.Vector3(0.64, 0.54, 0.64).normalize().multiplyScalar(distance));
    camera.near = Math.max(0.1, distance / 100);
    camera.far = distance * 20;
    camera.updateProjectionMatrix();
    controls.current?.target.copy(center);
    controls.current?.update();
  }, [camera, compact, model, resetToken]);
  return <OrbitControls ref={controls} makeDefault enabled={interactive} enableDamping={interactive} dampingFactor={0.08} />;
}

export function ModelViewport({ model, wireframe, resetToken, compact = false }: { model?: GeneratedModel; wireframe: boolean; resetToken: number; compact?: boolean }) {
  const [colors, setColors] = useState<{ canvas: THREE.Color; model: THREE.Color; grid: THREE.Color; gridStrong: THREE.Color } | null>(null);
  useEffect(() => {
    setColors({ canvas: readColorToken("--color-canvas"), model: readColorToken("--color-model-3d"), grid: readColorToken("--color-grid"), gridStrong: readColorToken("--color-grid-strong") });
  }, []);
  if (!colors) return <div className={`canvasWrap ${compact ? "canvasWrap--thumbnail" : ""}`} />;
  return <div className={`canvasWrap ${compact ? "canvasWrap--thumbnail" : ""}`}><Canvas dpr={compact ? [1, 1.5] : [1, 2]} frameloop={compact ? "demand" : "always"} camera={{ position: [120, 100, 120], fov: compact ? 34 : 38 }}><color attach="background" args={[colors.canvas]} /><ambientLight intensity={1.05} /><directionalLight position={[100, 160, 80]} intensity={1.15} /><directionalLight position={[-80, 70, -120]} intensity={0.55} /><Grid args={[400, 400]} cellSize={10} cellThickness={0.6} sectionSize={50} sectionThickness={1.1} cellColor={colors.grid} sectionColor={colors.gridStrong} fadeDistance={450} />{model ? <><Mesh model={model} wireframe={wireframe} color={colors.model} /><CameraFit model={model} resetToken={resetToken} interactive={!compact} compact={compact} /></> : null}</Canvas></div>;
}
