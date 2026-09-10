"use client";

import { cableDeskOrganizerDefaults, cableDeskOrganizerParamsSchema } from "@make3d/validation";
import { useState } from "react";
import { organizerPresets, type OrganizerPreset } from "../organizer-presets";
import { OrganizerEditor } from "./organizer-editor";
import { type SimpleModelSpec, SimpleModelEditor } from "./simple-model-editor";

type HomeView = "categories" | "organizers" | "desk-accessories";

const cableDeskOrganizerScrew: SimpleModelSpec = {
  type: "cable-desk-organizer",
  title: "Under-Desk Cable Channel — Screw Mount",
  filename: "under-desk-cable-channel-screw-mount",
  defaults: cableDeskOrganizerDefaults,
  schema: cableDeskOrganizerParamsSchema,
  groups: [{ label: "Channel length", fields: [{ key: "length", label: "Length", step: 1 }] }],
};

const cableDeskOrganizerAdhesive: SimpleModelSpec = {
  ...cableDeskOrganizerScrew,
  title: "Under-Desk Cable Channel — Adhesive Mount",
  filename: "under-desk-cable-channel-adhesive-mount",
  defaults: { ...cableDeskOrganizerDefaults, mountStyle: "adhesive" },
};

function OrganizerThumbnail({ preset }: { preset: OrganizerPreset }) {
  const { columns, rows } = preset.params;
  const verticals = Array.from({ length: columns - 1 }, (_, index) => 84 + ((index + 1) * 152) / columns);
  const horizontals = Array.from({ length: rows - 1 }, (_, index) => 74 + ((index + 1) * 90) / rows);
  return <svg className="projectThumbnail" viewBox="0 0 320 220" aria-hidden="true">
    <path className="thumbShadow" d="m43 165 121 32 116-35-118-28Z" /><path className="thumbSide" d="m50 76 112 30v74L50 148Z" /><path className="thumbFront" d="m162 106 110-32v74l-110 32Z" /><path className="thumbTop" d="m50 76 111-34 111 32-110 32Z" />
    {verticals.map((x) => <path className="thumbDivide" d={`M${x} ${((x - 50) * 30) / 111 + 76}l-1 74`} key={`vertical-${x}`} />)}
    {horizontals.map((y) => <path className="thumbDivide" d={`m${50 + ((y - 74) * 112) / 90} ${y} 111 30`} key={`horizontal-${y}`} />)}
    <path className="thumbRim" d="m50 76 112 30 110-32M50 76v72l112 32 110-32V74" />
  </svg>;
}

function CableDeskThumbnail() {
  return <svg className="projectThumbnail cableDeskThumbnail" viewBox="0 0 320 220" aria-hidden="true"><path className="thumbShadow" d="m40 177 125 25 113-33-119-23Z" /><path className="thumbTop" d="m48 61 112-31 112 29-111 34Z" /><path className="thumbSide" d="m48 61 113 32v22L48 84Z" /><path className="thumbFront" d="m161 93 111-34v22l-111 34Z" /><path className="thumbSide" d="m48 84 113 31v55L48 139Z" /><path className="thumbFront" d="m161 115 111-34v55l-111 34Z" /><path className="thumbTop thumbChannel" d="m63 108 98 27 93-28-94-24Z" /><path className="thumbRim" d="m48 61 113 32 111-34M48 61v23l113 31 111-34V59M48 84v55l113 31 111-34V81M63 108l98 27 93-28" /></svg>;
}

export function GeneratorHome() {
  const [view, setView] = useState<HomeView>("categories");
  const [selectedPreset, setSelectedPreset] = useState<OrganizerPreset>();
  const [selectedDeskOrganizer, setSelectedDeskOrganizer] = useState<SimpleModelSpec>();

  if (selectedPreset) return <OrganizerEditor initialParams={selectedPreset.params} />;
  if (selectedDeskOrganizer) return <SimpleModelEditor spec={selectedDeskOrganizer} />;

  return <main className="projectsHome">
    <header className="consoleHeader"><nav className="floatingNav" aria-label="Main navigation"><button className="brand brandButton" onClick={() => setView("categories")}><span>Make</span><b>3D</b></button><div className="navLinks"><button className={view === "categories" ? "navLink is-active" : "navLink"} onClick={() => setView("categories")}>Categories</button><button className={view === "organizers" ? "navLink is-active" : "navLink"} onClick={() => setView("organizers")}>Organizers</button><button className={view === "desk-accessories" ? "navLink is-active" : "navLink"} onClick={() => setView("desk-accessories")}>Desk</button></div><button className="navCta" onClick={() => setView("organizers")}>Browse projects</button></nav></header>
    {view === "categories" ? <>
      <section className="projectsCatalogue projectsCatalogue--home" aria-labelledby="categories-title"><div className="catalogueHead"><div><h1 id="categories-title">Choose a category.</h1><p>Start with a tested component, adjust its dimensions and export an STL when it is ready.</p></div></div><div className="categoryGrid"><button className="categoryCard" onClick={() => setView("organizers")}><span className="categoryGlyph" aria-hidden="true">▦</span><span className="projectCardMeta">4 projects available</span><strong>Organizers</strong><span className="projectCardDescription">Configurable trays for drawers, desks and the little things that need a place.</span><span className="projectCardAction">Browse organizers <span aria-hidden="true">→</span></span></button><button className="categoryCard" onClick={() => setView("desk-accessories")}><span className="categoryGlyph" aria-hidden="true">◒</span><span className="projectCardMeta">2 projects available</span><strong>Desk accessories</strong><span className="projectCardDescription">Purpose-built models for cables and everyday workspace hardware.</span><span className="projectCardAction">Browse desk projects <span aria-hidden="true">→</span></span></button><div className="categoryCard categoryCard--soon"><span className="categoryGlyph" aria-hidden="true">⌁</span><span className="projectCardMeta">Coming soon</span><strong>Cable management</strong><span className="projectCardDescription">Small prints for tidier routes and connections.</span></div></div></section>
    </> : view === "organizers" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Choose an organizer<br />to make your own.</h1><p>Pick a starting layout, then adjust its dimensions, walls and compartments in the editor.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a starting point</h2></div><span>{organizerPresets.length} presets</span></div><div className="projectGrid">{organizerPresets.map((preset) => <button className="projectCard" key={preset.id} onClick={() => setSelectedPreset(preset)}><OrganizerThumbnail preset={preset} /><span className="projectCardMeta">{preset.params.width} × {preset.params.depth} × {preset.params.height} mm · {preset.params.columns * preset.params.rows} compartments</span><strong>{preset.title}</strong><span className="projectCardDescription">{preset.description}</span><span className="projectCardAction">Open project <span aria-hidden="true">→</span></span></button>)}</div></section>
    </> : <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Keep cables<br />where they belong.</h1><p>Mount a channel under the desk, then press cables through its flexible front lip to keep them tidy and removable.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a mounting method</h2></div><span>2 projects</span></div><div className="projectGrid"><button className="projectCard" onClick={() => setSelectedDeskOrganizer(cableDeskOrganizerScrew)}><CableDeskThumbnail /><span className="projectCardMeta">180 mm editable length · 4 mounting holes</span><strong>Under-Desk Cable Channel</strong><span className="projectCardDescription">A screw-mounted cable channel with a snap-in front lip for removable cables.</span><span className="projectCardAction">Choose screw mount <span aria-hidden="true">→</span></span></button><button className="projectCard" onClick={() => setSelectedDeskOrganizer(cableDeskOrganizerAdhesive)}><CableDeskThumbnail /><span className="projectCardMeta">180 mm editable length · flat tape surface</span><strong>Under-Desk Cable Channel</strong><span className="projectCardDescription">The same snap-in channel with a clean mounting plate for strong double-sided tape.</span><span className="projectCardAction">Choose adhesive mount <span aria-hidden="true">→</span></span></button></div></section>
    </>}
    <footer className="consoleFooter">Made for FDM-printing hobbyists <span aria-hidden="true">·</span> Models stay in your browser <span aria-hidden="true">·</span> Export STL when ready</footer>
  </main>;
}
