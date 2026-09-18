"use client";

import { exportBinaryStl } from "@make3d/geometry/stl";
import type { GeneratedModel, GeneratorType } from "@make3d/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorToast } from "./error-toast";
import { ModelViewport } from "./model-viewport";

type WorkerResponse = { id: number; model?: GeneratedModel; error?: string };
type Field = { key: string; label: string; step?: number; type?: "number" | "select" | "toggle"; options?: Array<{ label: string; value: string }> };
type Schema = { safeParse(value: unknown): { success: boolean; data?: unknown; error?: { issues: Array<{ message: string }> } } };

export type SimpleModelSpec = {
  type: Exclude<GeneratorType, "organizer">;
  title: string;
  filename: string;
  defaults: Record<string, number | string | boolean>;
  schema: Schema;
  groups: Array<{ label: string; fields: Field[] }>;
};

export function SimpleModelEditor({ spec }: { spec: SimpleModelSpec }) {
  const [params, setParams] = useState(spec.defaults);
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
    return () => instance.terminate();
  }, []);

  useEffect(() => {
    const parsed = spec.schema.safeParse(params);
    if (!parsed.success) { setError(parsed.error?.issues[0]?.message ?? "Invalid parameters."); setStatus("Fix parameters"); return; }
    setError(undefined); setStatus("Updating model…");
    const timeout = window.setTimeout(() => {
      const id = latestRequest.current + 1;
      latestRequest.current = id;
      worker.current?.postMessage({ id, type: spec.type, params });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [params, spec]);

  const update = useCallback((key: string, value: number | string | boolean) => setParams((previous) => ({ ...previous, [key]: value })), []);
  const download = () => {
    if (!model) return;
    const blob = new Blob([exportBinaryStl(model.mesh)], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `${spec.filename}.stl`; link.click();
    URL.revokeObjectURL(url);
  };

  return <main className="workbench projectsHome">
    <header className="consoleHeader"><nav className="floatingNav" aria-label="Main navigation"><a className="brand" href="/"><img className="brandLogo" src="/make3d-logo.svg" alt="Make3D" /></a><div className="navLinks"><a className="navLink is-active" href="/">Models</a><a className="navLink" href="https://github.com/Rozmyk/Make3d" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a className="navLink" href="https://github.com/Rozmyk/Make3d/issues/new" target="_blank" rel="noreferrer">Request a model <span aria-hidden="true">↗</span></a></div><span className="srOnly" aria-live="polite">{status}</span></nav></header>
    <section className="workbenchIdentity" aria-label="Current model"><div><span>Model / configurable</span><h1>{spec.title}</h1></div></section>
    <section className="editor" aria-label={`${spec.title} editor`}>
      <aside className="parameters"><div className="parameterDetails"><div className="panelHeading"><span>Model settings</span><span className="unitLabel">mm</span></div>
        {spec.groups.map((group) => <section className="parameterGroup" key={group.label}><h2>{group.label}</h2><div className="fieldList">{group.fields.map((field) => field.type === "toggle" ? <label className="toggle" key={field.key}><input type="checkbox" checked={Boolean(params[field.key])} onChange={(event) => update(field.key, event.target.checked)} /><span>{field.label}</span></label> : field.type === "select" ? <label className="field" key={field.key}><span>{field.label}</span><div className="inputWrap"><select aria-label={field.label} value={String(params[field.key])} onChange={(event) => update(field.key, event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></label> : <label className="field" key={field.key}><span>{field.label}</span><div className="inputWrap"><input aria-label={field.label} type="number" value={String(params[field.key])} step={field.step ?? 1} onChange={(event) => update(field.key, Number(event.target.value))} /><span>mm</span></div></label>)}</div></section>)}
        </div>
      </aside>
      <div className="viewerPanel"><div className="viewerToolbar"><div><span className="viewLabel">Live preview</span><p>Drag to orbit · scroll to zoom</p></div><div className="viewerActions"><button className="reset" onClick={() => setResetView((value) => value + 1)}>Reset view</button><label className="wireframe"><input type="checkbox" checked={wireframe} onChange={(event) => setWireframe(event.target.checked)} /> Wireframe</label><button className="viewerExport" disabled={!model} onClick={download}>Export STL <span aria-hidden="true">↓</span></button></div></div><ModelViewport model={model} wireframe={wireframe} resetToken={resetView} /></div>
    </section>
    <footer className="inspector">{model ? <><span><b>Size</b> {model.metadata.boundingBox.width.toFixed(1)} × {model.metadata.boundingBox.depth.toFixed(1)} × {model.metadata.boundingBox.height.toFixed(1)} mm</span><span><b>Parts</b> {model.metadata.compartmentCount}</span><span><b>Material</b> {(model.metadata.volumeMm3 / 1000).toFixed(1)} cm³</span><span><b>Mesh</b> {model.metadata.triangleCount.toLocaleString()} triangles</span></> : <span>Preparing your model…</span>}</footer>
    <ErrorToast message={error} />
  </main>;
}
