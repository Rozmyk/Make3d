"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { GeneratedModel } from "@make3d/types";
import { useEffect, useRef, useState } from "react";
import { organizerPresets, type OrganizerPreset } from "../organizer-presets";
import { simpleModelSpecs } from "../model-specs";
import { useOrganizerModel } from "../hooks/use-organizer-model";
import { ModelViewport } from "./model-viewport";

type HomeView = "categories" | "organizers" | "cable-management" | "desk-mounts" | "pegboard";
const premiumEase = [0.16, 1, 0.3, 1] as const;

function viewFromLocation(): HomeView {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "organizers" || category === "cable-management" || category === "desk-mounts" || category === "pegboard" ? category : "categories";
}

type WorkerResponse = { id: number; model?: GeneratedModel };

function StorageBoxThumbnail() {
  const [model, setModel] = useState<GeneratedModel>();
  const worker = useRef<Worker | null>(null);
  useEffect(() => {
    const instance = new Worker(new URL("../geometry.worker.ts", import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }: MessageEvent<WorkerResponse>) => setModel(data.model);
    return () => instance.terminate();
  }, []);
  useEffect(() => {
    const request = window.setTimeout(() => worker.current?.postMessage({ id: 1, type: "storage-box", params: simpleModelSpecs["storage-box"].defaults }), 80);
    return () => window.clearTimeout(request);
  }, []);
  return <div className="projectThumbnail projectThumbnail--model" aria-label="3D preview of the storage box"><ModelViewport model={model} wireframe={false} resetToken={0} compact /></div>;
}

function OrganizerThumbnail({ preset }: { preset: OrganizerPreset }) {
  const { model } = useOrganizerModel(preset.params);
  return <div className="projectThumbnail projectThumbnail--model" aria-label={`3D preview: ${preset.title}`}><ModelViewport model={model} wireframe={false} resetToken={0} compact /></div>;
}

function CableDeskThumbnail() {
  return <svg className="projectThumbnail cableDeskThumbnail" viewBox="0 0 320 220" aria-hidden="true"><path className="thumbShadow" d="m40 177 125 25 113-33-119-23Z" /><path className="thumbTop" d="m48 61 112-31 112 29-111 34Z" /><path className="thumbSide" d="m48 61 113 32v22L48 84Z" /><path className="thumbFront" d="m161 93 111-34v22l-111 34Z" /><path className="thumbSide" d="m48 84 113 31v55L48 139Z" /><path className="thumbFront" d="m161 115 111-34v55l-111 34Z" /><path className="thumbTop thumbChannel" d="m63 108 98 27 93-28-94-24Z" /><path className="thumbRim" d="m48 61 113 32 111-34M48 61v23l113 31 111-34V59M48 84v55l113 31 111-34V81M63 108l98 27 93-28" /></svg>;
}

export function GeneratorHome() {
  const [view, setView] = useState<HomeView>("categories");
  const reduceMotion = useReducedMotion();
  const enter = (delay = 0) => reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.52, delay, ease: premiumEase } };
  const cardMotion = (index: number) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 180, damping: 22, delay: 0.24 + index * 0.08 },
    whileHover: { y: -6, transition: { type: "spring" as const, stiffness: 340, damping: 24 } },
    whileTap: { y: -2, transition: { type: "spring" as const, stiffness: 420, damping: 30 } },
  };

  useEffect(() => {
    const syncView = () => setView(viewFromLocation());
    syncView();
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const navigate = (nextView: HomeView) => {
    setView(nextView);
    const url = nextView === "categories" ? window.location.pathname : `${window.location.pathname}?category=${nextView}`;
    window.history.pushState({}, "", url);
  };

  return <motion.main className="projectsHome" {...enter()}>
    <header className="consoleHeader"><motion.nav className="floatingNav" aria-label="Main navigation" {...enter(0.08)}><button className="brand brandButton" onClick={() => navigate("categories")} aria-label="Make3D home"><img className="brandLogo" src="/make3d-logo.svg" alt="Make3D" /></button><div className="navLinks"><button className="navLink is-active" onClick={() => navigate("categories")}>Models</button><a className="navLink" href="https://github.com/Rozmyk/Make3d" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a className="navLink" href="https://github.com/Rozmyk/Make3d/issues/new" target="_blank" rel="noreferrer">Request a model <span aria-hidden="true">↗</span></a></div><button className="navCta" onClick={() => navigate("categories")}>Browse models</button></motion.nav></header>
    {view === "categories" ? <>
      <motion.section className="projectsCatalogue projectsCatalogue--home" aria-labelledby="categories-title" {...enter(0.15)}><div className="catalogueHead"><div><h1 id="categories-title">Choose a category.</h1><p>Start with a tested component, adjust its dimensions and export an STL when it is ready.</p></div></div><div className="categoryGrid"><motion.button className="categoryCard" onClick={() => navigate("organizers")} {...cardMotion(0)}><span className="categoryGlyph" aria-hidden="true">▦</span><span className="projectCardMeta">5 projects available</span><strong>Organizers</strong><span className="projectCardDescription">Configurable trays, boxes and compact storage for the little things that need a place.</span><span className="projectCardAction">Browse organizers <span aria-hidden="true">→</span></span></motion.button><motion.button className="categoryCard" onClick={() => navigate("cable-management")} {...cardMotion(1)}><span className="categoryGlyph" aria-hidden="true">⌁</span><span className="projectCardMeta">3 projects available</span><strong>Cable management</strong><span className="projectCardDescription">Channels and clips that keep the desk setup tidy and easy to change.</span><span className="projectCardAction">Browse cable models <span aria-hidden="true">→</span></span></motion.button><motion.button className="categoryCard" onClick={() => navigate("desk-mounts")} {...cardMotion(2)}><span className="categoryGlyph" aria-hidden="true">⌟</span><span className="projectCardMeta">1 project available</span><strong>Desk mounts</strong><span className="projectCardDescription">Made-to-fit holders for hardware mounted under the desk.</span><span className="projectCardAction">Browse desk mounts <span aria-hidden="true">→</span></span></motion.button><motion.button className="categoryCard" onClick={() => navigate("pegboard")} {...cardMotion(3)}><span className="categoryGlyph" aria-hidden="true">⠿</span><span className="projectCardMeta">1 project available</span><strong>Pegboard</strong><span className="projectCardDescription">Modular add-ons for IKEA Skådis-compatible pegboards.</span><span className="projectCardAction">Browse pegboard models <span aria-hidden="true">→</span></span></motion.button></div></motion.section>
    </> : view === "organizers" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Choose an organizer<br />to make your own.</h1><p>Pick a starting layout, then adjust its dimensions, walls and compartments in the editor.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a starting point</h2></div></div><div className="projectGrid">{organizerPresets.map((preset) => <a className="projectCard projectCard--technical" key={preset.id} href={`/models/organizer-${preset.id}`}><span className="projectTechnicalBadge">{preset.params.width} × {preset.params.depth} × {preset.params.height} mm</span><OrganizerThumbnail preset={preset} /><strong>{preset.title}</strong></a>)}<a className="projectCard projectCard--technical" href="/models/storage-box"><span className="projectTechnicalBadge">Box + separate lid</span><StorageBoxThumbnail /><strong>Storage Box with Lid</strong></a></div></section>
    </> : view === "cable-management" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Keep cables<br />where they belong.</h1><p>Mount a channel under the desk, then press cables through its flexible front lip to keep them tidy and removable.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a cable model</h2></div></div><div className="projectGrid"><a className="projectCard projectCard--technical" href="/models/cable-channel-screw"><span className="projectTechnicalBadge">Screw mount</span><CableDeskThumbnail /><strong>Under-Desk Cable Channel</strong></a><a className="projectCard projectCard--technical" href="/models/cable-channel-adhesive"><span className="projectTechnicalBadge">Adhesive mount</span><CableDeskThumbnail /><strong>Under-Desk Cable Channel</strong></a><a className="projectCard projectCard--technical" href="/models/compact-cable-organizer"><span className="projectTechnicalBadge">Tape or screws · 1–8 cables</span><CableDeskThumbnail /><strong>Compact Cable Organizer</strong></a></div></section>
    </> : view === "desk-mounts" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Mount hardware<br />out of sight.</h1><p>Create a precise under-desk holder for a hub, power supply, router or dock.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a desk mount</h2></div></div><div className="projectGrid"><a className="projectCard projectCard--technical" href="/models/under-desk-holder"><span className="projectTechnicalBadge">Device-size fit</span><CableDeskThumbnail /><strong>Under-Desk Device Holder</strong></a></div></section>
    </> : <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Build out<br />your pegboard.</h1><p>Start with a shelf sized for an IKEA Skådis-compatible pegboard.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a pegboard model</h2></div></div><div className="projectGrid"><a className="projectCard projectCard--technical" href="/models/pegboard-shelf"><span className="projectTechnicalBadge">Skådis compatible</span><CableDeskThumbnail /><strong>Pegboard Shelf</strong></a></div></section>
    </>}
    <footer className="consoleFooter">Made for FDM-printing hobbyists <span aria-hidden="true">·</span> Models stay in your browser <span aria-hidden="true">·</span> Export STL when ready</footer>
  </motion.main>;
}
