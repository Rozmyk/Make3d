"use client";

import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { GeneratedModel } from "@make3d/types";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

function Mesh({ model, wireframe }: { model: GeneratedModel; wireframe: boolean }) {
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
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#dce9ff" roughness={0.48} metalness={0.08} wireframe={wireframe} /></mesh>;
}

function CameraFit({ model, resetToken }: { model: GeneratedModel; resetToken: number }) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera } = useThree();
  useEffect(() => {
    const size = Math.max(model.metadata.boundingBox.width, model.metadata.boundingBox.depth, model.metadata.boundingBox.height);
    camera.position.set(size * 0.9, size * 0.8, size * 0.9);
    controls.current?.target.set(0, model.metadata.boundingBox.height / 2, 0);
    controls.current?.update();
  }, [camera, model, resetToken]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />;
}

export function ModelViewport({ model, wireframe, resetToken }: { model?: GeneratedModel; wireframe: boolean; resetToken: number }) {
  return <div className="canvasWrap"><Canvas shadows camera={{ position: [120, 100, 120], fov: 38 }}><color attach="background" args={["#f7faff"]} /><ambientLight intensity={1.3} /><directionalLight position={[100, 160, 80]} intensity={2.2} castShadow /><Grid args={[400, 400]} cellSize={10} cellThickness={0.6} sectionSize={50} sectionThickness={1.1} cellColor="#dce4f2" sectionColor="#b7c7de" fadeDistance={450} /><axesHelper args={[30]} />{model ? <><Mesh model={model} wireframe={wireframe} /><CameraFit model={model} resetToken={resetToken} /></> : null}</Canvas></div>;
}
