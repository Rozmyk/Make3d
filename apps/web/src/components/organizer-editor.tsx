"use client";

import { exportBinaryStl } from "@make3d/geometry/stl";
import type { OrganizerParams } from "@make3d/types";
import { organizerDefaults } from "@make3d/validation";
import { useCallback, useState } from "react";
import { useOrganizerModel } from "../hooks/use-organizer-model";
import { organizerEditorInitialParams } from "../organizer-presets";
import { ModelViewport } from "./model-viewport";

type NumericField = { key: keyof OrganizerParams; label: string; unit?: string; step: number };

const parameterGroups: Array<{ label: string; fields: NumericField[] }> = [
  { label: "Overall size", fields: [{ key: "width", label: "Width", unit: "mm", step: 1 }, { key: "depth", label: "Depth", unit: "mm", step: 1 }, { key: "height", label: "Height", unit: "mm", step: 1 }] },
  { label: "Build", fields: [{ key: "wallThickness", label: "Wall", unit: "mm", step: 0.1 }, { key: "bottomThickness", label: "Bottom", unit: "mm", step: 0.1 }, { key: "cornerRadius", label: "Outer corners", unit: "mm", step: 0.5 }] },
  { label: "Compartments", fields: [{ key: "columns", label: "Across", step: 1 }, { key: "rows", label: "Down", step: 1 }, { key: "dividerThickness", label: "Divider", unit: "mm", step: 0.1 }, { key: "innerCornerRadius", label: "Inside corners", unit: "mm", step: 0.5 }] },
];

export function OrganizerEditor({ initialParams = organizerDefaults }: { initialParams?: OrganizerParams }) {
  const [params, setParams] = useState<OrganizerParams>(() => organizerEditorInitialParams(initialParams));
  const [wireframe, setWireframe] = useState(false);
  const [resetView, setResetView] = useState(0);
  const { model, status, error } = useOrganizerModel(params);
  const update = useCallback((key: keyof OrganizerParams, value: number | boolean) => setParams((previous) => ({ ...previous, [key]: value })), []);
  const download = () => {
    if (!model) return;
    const blob = new Blob([exportBinaryStl(model.mesh)], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `organizer-${params.width}x${params.depth}x${params.height}.stl`; link.click();
    URL.revokeObjectURL(url);
  };

  return <main className="workbench projectsHome">
    <header className="consoleHeader"><nav className="floatingNav" aria-label="Main navigation"><a className="brand" href="/"><img className="brandLogo" src="/make3d-logo.svg" alt="Make3D" /></a><div className="navLinks"><a className="navLink is-active" href="/">Models</a><a className="navLink" href="https://github.com/Rozmyk/Make3d" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a className="navLink" href="https://github.com/Rozmyk/Make3d/issues/new" target="_blank" rel="noreferrer">Request a model <span aria-hidden="true">↗</span></a></div><span className="srOnly" aria-live="polite">{status}</span></nav></header>
    <section className="workbenchIdentity" aria-label="Current model"><div><span>Model / configurable</span><h1>Custom Organizer</h1></div><p>Changes are generated locally in your browser.</p></section>
    <section className="editor" aria-label="Organizer editor">
      <aside className="parameters"><div className="parameterDetails"><div className="panelHeading"><span>Model settings</span><span className="unitLabel">mm</span></div>
        {parameterGroups.map((group) => <section className="parameterGroup" key={group.label}><h2>{group.label}</h2><div className="fieldList">{group.fields.map((field) => <label className="field" key={field.key}><span>{field.label}</span><div className="inputWrap"><input aria-label={field.label} type="number" value={params[field.key]} step={field.step} onChange={(event) => update(field.key, Number(event.target.value))} /><span>{field.unit}</span></div></label>)}</div></section>)}
        <div className="parameterStatus">{error ? <p className="error" role="alert">{error}</p> : <><p className="formHint">Updates apply to the preview automatically.</p>{model?.metadata.printability.messages.map((message) => <p className="formHint" key={message}>{message}</p>)}</>}</div></div></aside>
      <div className="viewerPanel"><div className="viewerToolbar"><div><span className="viewLabel">Live preview</span><p>Drag to orbit · scroll to zoom</p></div><div className="viewerActions"><button className="reset" onClick={() => setResetView((value) => value + 1)}>Reset view</button><label className="wireframe"><input type="checkbox" checked={wireframe} onChange={(event) => setWireframe(event.target.checked)} /> Wireframe</label><button className="viewerExport" disabled={!model} onClick={download}>Export STL <span aria-hidden="true">↓</span></button></div></div><ModelViewport model={model} wireframe={wireframe} resetToken={resetView} /></div>
    </section>
    <footer className="inspector">{model ? <><span><b>Size</b> {model.metadata.boundingBox.width.toFixed(1)} × {model.metadata.boundingBox.depth.toFixed(1)} × {model.metadata.boundingBox.height.toFixed(1)} mm</span><span><b>Compartments</b> {model.metadata.compartmentCount}</span><span><b>Material</b> {(model.metadata.volumeMm3 / 1000).toFixed(1)} cm³</span><span><b>Mesh</b> {model.metadata.triangleCount.toLocaleString()} triangles</span></> : <span>Preparing your model…</span>}</footer>
  </main>;
}
