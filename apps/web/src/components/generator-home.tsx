"use client";

import type { GeneratorType } from "@make3d/types";
import { cableGuideDefaults, cableGuideParamsSchema, phoneStandDefaults, phoneStandParamsSchema } from "@make3d/validation";
import { useState } from "react";
import { OrganizerEditor } from "./organizer-editor";
import { type SimpleModelSpec, SimpleModelEditor } from "./simple-model-editor";

const phoneStand: SimpleModelSpec = {
  type: "phone-stand",
  title: "Phone Stand",
  filename: "phone-stand",
  defaults: phoneStandDefaults,
  schema: phoneStandParamsSchema,
  groups: [
    { label: "Overall size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Height", step: 1 }] },
    { label: "Build", fields: [{ key: "baseThickness", label: "Base", step: 0.1 }, { key: "backThickness", label: "Back", step: 0.1 }] },
    { label: "Front lip", fields: [{ key: "lipHeight", label: "Height", step: 1 }, { key: "lipDepth", label: "Depth", step: 1 }] },
  ],
};

const cableGuide: SimpleModelSpec = {
  type: "cable-guide",
  title: "Cable Guide",
  filename: "cable-guide",
  defaults: cableGuideDefaults,
  schema: cableGuideParamsSchema,
  groups: [
    { label: "Overall size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Height", step: 1 }] },
    { label: "Build", fields: [{ key: "wallThickness", label: "Wall", step: 0.1 }, { key: "bottomThickness", label: "Bottom", step: 0.1 }] },
  ],
};

const generators: Array<{ type: GeneratorType; title: string; description: string; detail: string }> = [
  { type: "organizer", title: "Organizer", description: "Compartments for parts, tools and desk items.", detail: "Grid tray" },
  { type: "phone-stand", title: "Phone Stand", description: "A simple, printable dock for your phone.", detail: "Desk dock" },
  { type: "cable-guide", title: "Cable Guide", description: "A snap-in guide that keeps one cable in place.", detail: "Cable holder" },
];

export function GeneratorHome() {
  const [selected, setSelected] = useState<GeneratorType>();
  if (selected === "organizer") return <OrganizerEditor />;
  if (selected === "phone-stand") return <SimpleModelEditor spec={phoneStand} />;
  if (selected === "cable-guide") return <SimpleModelEditor spec={cableGuide} />;

  return <main className="generatorHome">
    <header className="pickerHeader"><span className="brand"><span>Make</span><b>3D</b></span><span className="pickerMeta">Parametric models for 3D printing</span></header>
    <section className="pickerContent" aria-labelledby="picker-title"><p className="pickerKicker">Choose a starting point</p><h1 id="picker-title">What do you want to make?</h1><p className="pickerLead">Pick a model, adjust its dimensions and export a ready-to-slice STL.</p><div className="generatorGrid">{generators.map((generator) => <button className="generatorCard" key={generator.type} onClick={() => setSelected(generator.type)}><span className="generatorDetail">{generator.detail}</span><strong>{generator.title}</strong><span>{generator.description}</span><i aria-hidden="true">Open →</i></button>)}</div></section>
    <footer className="pickerFooter">All dimensions are in millimetres · Models generate in your browser</footer>
  </main>;
}
