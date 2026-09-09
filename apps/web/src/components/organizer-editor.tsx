"use client";

import { exportBinaryStl } from "@make3d/geometry/stl";
import type { GeneratedModel, OrganizerParams } from "@make3d/types";
import { organizerDefaults, organizerParamsSchema } from "@make3d/validation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ModelViewport } from "./model-viewport";

type WorkerResponse = { id: number; model?: GeneratedModel; error?: string };
type NumericField = { key: Exclude<keyof OrganizerParams, "roundedInside">; label: string; unit?: string; step: number };

const parameterGroups: Array<{ label: string; fields: NumericField[] }> = [
  { label: "Overall size", fields: [
    { key: "width", label: "Width", unit: "mm", step: 1 }, { key: "depth", label: "Depth", unit: "mm", step: 1 }, { key: "height", label: "Height", unit: "mm", step: 1 },
  ] },
  { label: "Build", fields: [
    { key: "wallThickness", label: "Wall", unit: "mm", step: 0.1 }, { key: "bottomThickness", label: "Bottom", unit: "mm", step: 0.1 }, { key: "cornerRadius", label: "Outer corners", unit: "mm", step: 0.5 },
  ] },
  { label: "Compartments", fields: [
    { key: "columns", label: "Across", step: 1 }, { key: "rows", label: "Down", step: 1 }, { key: "dividerThickness", label: "Divider", unit: "mm", step: 0.1 },
  ] },
];

export function OrganizerEditor() {
  const [params, setParams] = useState<OrganizerParams>(organizerDefaults);
  const [model, setModel] = useState<GeneratedModel>();
  const [status, setStatus] = useState("Preparing geometry…");
  const [error, setError] = useState<string>();
  const [wireframe, setWireframe] = useState(false);
  const [resetView, setResetView] = useState(0);
  const worker = useRef<Worker | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    const instance = new Worker(new URL("../geometry.worker.ts", import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.id !== latestRequest.current) return;
      if (data.error) { setError(data.error); setStatus("Geometry error"); return; }
      setModel(data.model); setError(undefined); setStatus("Geometry ready");
    };
    instance.onerror = (event) => {
      if (latestRequest.current > 0) {
        setError(event.message || "The geometry worker could not start.");
        setStatus("Geometry error");
      }
    };
    return () => instance.terminate();
  }, []);

  useEffect(() => {
    const parsed = organizerParamsSchema.safeParse(params);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Invalid parameters."); setStatus("Fix parameters"); return; }
    setError(undefined); setStatus("Updating model…");
    const timeout = window.setTimeout(() => {
      const id = latestRequest.current + 1;
      latestRequest.current = id;
      worker.current?.postMessage({ id, params: parsed.data });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [params]);

  const update = useCallback((key: keyof OrganizerParams, value: number | boolean) => {
    setParams((previous) => ({ ...previous, [key]: value }));
  }, []);

  const download = () => {
    if (!model) return;
    const blob = new Blob([exportBinaryStl(model.mesh)], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `organizer-${params.width}x${params.depth}x${params.height}.stl`; link.click();
    URL.revokeObjectURL(url);
  };

  return <main className="workbench">
    <header className="topbar"><a className="brand" href="/"><span>Make</span><b>3D</b></a><span className="productLabel">Organizer</span><div className="topbarActions"><span className="status" aria-live="polite">{status}</span><button className="button buttonExport" disabled={!model} onClick={download}>Export STL <span aria-hidden="true">↓</span></button></div></header>
    <section className="editor" aria-label="Organizer editor">
      <aside className="parameters"><div className="parameterDetails"><div className="panelHeading"><span>Model settings</span><span className="unitLabel">mm</span></div>
        {parameterGroups.map((group) => <section className="parameterGroup" key={group.label}><h2>{group.label}</h2><div className="fieldList">{group.fields.map((field) => <label className="field" key={field.key}><span>{field.label}</span><div className="inputWrap"><input aria-label={field.label} type="number" value={params[field.key]} step={field.step} onChange={(event) => update(field.key, Number(event.target.value))} /><span>{field.unit}</span></div></label>)}</div></section>)}
        <label className="toggle"><input type="checkbox" checked={params.roundedInside} onChange={(event) => update("roundedInside", event.target.checked)} /><span>Round inside corners</span></label>
        {error ? <p className="error" role="alert">{error}</p> : <p className="formHint">Changes update the model automatically.</p>}</div>
      </aside>
      <div className="viewerPanel"><div className="viewerToolbar"><div><span className="viewLabel">Live preview</span><p>Drag to orbit · scroll to zoom</p></div><div className="viewerActions"><button className="reset" onClick={() => setResetView((value) => value + 1)}>Reset view</button><label className="wireframe"><input type="checkbox" checked={wireframe} onChange={(event) => setWireframe(event.target.checked)} /> Wireframe</label></div></div><ModelViewport model={model} wireframe={wireframe} resetToken={resetView} /></div>
    </section>
    <footer className="inspector">{model ? <><span><b>Size</b> {model.metadata.boundingBox.width.toFixed(1)} × {model.metadata.boundingBox.depth.toFixed(1)} × {model.metadata.boundingBox.height.toFixed(1)} mm</span><span><b>Compartments</b> {model.metadata.compartmentCount}</span><span><b>Material</b> {(model.metadata.volumeMm3 / 1000).toFixed(1)} cm³</span><span><b>Mesh</b> {model.metadata.triangleCount.toLocaleString()} triangles</span></> : <span>Preparing your model…</span>}</footer>
  </main>;
}
