"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { GeneratedModel, GeneratorType } from "@make3d/types";
import { useEffect, useRef, useState } from "react";
import { organizerPresets } from "../organizer-presets";
import { simpleModelSpecs } from "../model-specs";
import { ModelViewport } from "./model-viewport";

type HomeView = "categories" | "organizers" | "cable-management" | "desk-mounts" | "pegboard";
const premiumEase = [0.16, 1, 0.3, 1] as const;

function viewFromLocation(): HomeView {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "organizers" || category === "cable-management" || category === "desk-mounts" || category === "pegboard" ? category : "categories";
}

type WorkerResponse = { id: number; model?: GeneratedModel; error?: string };

function ModelThumbnail({ type, params, label }: { type: GeneratorType; params: unknown; label: string }) {
  const [model, setModel] = useState<GeneratedModel>();
  const [error, setError] = useState<string>();
  const worker = useRef<Worker | null>(null);
  useEffect(() => {
    const instance = new Worker(new URL("../geometry.worker.ts", import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.error) setError(data.error);
      else setModel(data.model);
    };
    instance.postMessage({ id: 1, type, params });
    return () => instance.terminate();
  }, [params, type]);
  return <div className="projectThumbnail projectThumbnail--model" aria-label={`3D preview: ${label}`}><ModelViewport model={model} wireframe={false} resetToken={0} compact /><span className="srOnly" role="status">{error ? `Preview unavailable: ${error}` : model ? `${label} preview ready` : `Preparing ${label} preview`}</span></div>;
}

function ModelCard({ href, type, params, title, description }: { href: string; badge: string; type: GeneratorType; params: unknown; title: string; description: string; detail: string }) {
  return <a className="projectCard projectCard--technical modelCard" href={href}>
    <div className="modelCardCaption"><strong>{title}</strong><span className="modelCardDescription">{description}</span></div>
    <div className="modelCardStage"><span className="modelCardBadge">Editable</span><ModelThumbnail type={type} params={params} label={title} /></div>
  </a>;
}

function CategoryIcon({ type }: { type: "organizers" | "cable" | "mount" | "pegboard" }) {
  const shared = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.7 };
  return <svg className="categoryGlyph" viewBox="0 0 48 48" aria-hidden="true">
    {type === "organizers" && <><rect {...shared} x="7" y="7" width="34" height="34" rx="2" /><path {...shared} d="M18 7v34M30 7v34M7 18h34M7 30h34" /></>}
    {type === "cable" && <><path {...shared} d="M8 15h8l16 18h8" /><path {...shared} d="M8 33h8L32 15h8" /><path {...shared} d="M18 11v8M30 29v8" /></>}
    {type === "mount" && <><path {...shared} d="M11 10v24h26" /><path {...shared} d="M18 17h19v17" /><path {...shared} d="M11 39h26" /><circle cx="31" cy="25" r="1.5" fill="currentColor" /></>}
    {type === "pegboard" && <><rect {...shared} x="8" y="8" width="32" height="32" rx="2" /><circle cx="17" cy="17" r="2" fill="currentColor" /><circle cx="31" cy="17" r="2" fill="currentColor" /><circle cx="17" cy="31" r="2" fill="currentColor" /><circle cx="31" cy="31" r="2" fill="currentColor" /></>}
  </svg>;
}

export function GeneratorHome() {
  const [view, setView] = useState<HomeView>("categories");
  const reduceMotion = useReducedMotion();
  const enter = (_delay = 0) => ({ initial: false });
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
      <motion.section className="projectsCatalogue projectsCatalogue--home" aria-labelledby="categories-title" {...enter(0.15)}>
        <div className="catalogueHead"><div><h1 id="categories-title">Choose a category.</h1><p>Start with a tested component, adjust its dimensions and export an STL when it is ready.</p></div></div>
        <div className="categoryGrid">
          <motion.button className="categoryCard" onClick={() => navigate("organizers")} {...cardMotion(0)}><CategoryIcon type="organizers" /><span className="projectCardMeta">5 projects available</span><strong>Organizers</strong><span className="projectCardDescription">Configurable trays, boxes and compact storage for the little things that need a place.</span><span className="projectCardAction">Browse organizers <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("cable-management")} {...cardMotion(1)}><CategoryIcon type="cable" /><span className="projectCardMeta">4 projects available</span><strong>Cable management</strong><span className="projectCardDescription">Channels and clips that keep the desk setup tidy and easy to change.</span><span className="projectCardAction">Browse cable models <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("desk-mounts")} {...cardMotion(2)}><CategoryIcon type="mount" /><span className="projectCardMeta">2 projects available</span><strong>Desk mounts</strong><span className="projectCardDescription">Made-to-fit holders for hardware mounted under the desk.</span><span className="projectCardAction">Browse desk mounts <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("pegboard")} {...cardMotion(3)}><CategoryIcon type="pegboard" /><span className="projectCardMeta">1 project available</span><strong>Pegboard</strong><span className="projectCardDescription">Modular add-ons for IKEA Skådis-compatible pegboards.</span><span className="projectCardAction">Browse pegboard models <span aria-hidden="true">→</span></span></motion.button>
        </div>
      </motion.section>
    </> : view === "organizers" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Choose an organizer<br />to make your own.</h1><p>Pick a starting layout, then adjust its dimensions, walls and compartments in the editor.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a starting point</h2></div></div><div className="projectGrid">{organizerPresets.map((preset) => <ModelCard key={preset.id} href={`/models/organizer-${preset.id}`} badge={`${preset.params.width} × ${preset.params.depth} × ${preset.params.height} mm`} type="organizer" params={preset.params} title={preset.title} description={preset.description} detail={`${preset.params.columns} × ${preset.params.rows} compartments · Adjustable layout`} />)}<ModelCard href="/models/storage-box" badge="Box + separate lid" type="storage-box" params={simpleModelSpecs["storage-box"].defaults} title="Storage Box with Lid" description="A configurable storage box designed with a separate lid." detail="Separate lid · Adjustable size" /></div></section>
    </> : view === "cable-management" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Keep cables<br />where they belong.</h1><p>Mount a channel under the desk, then press cables through its flexible front lip to keep them tidy and removable.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a cable model</h2></div></div><div className="projectGrid"><ModelCard href="/models/cable-channel-screw" badge="Screw mount" type="cable-desk-organizer" params={simpleModelSpecs["cable-channel-screw"].defaults} title="Under-Desk Cable Channel" description="A channel that routes cables cleanly beneath the desk." detail="Screw mount · Adjustable channel" /><ModelCard href="/models/cable-channel-adhesive" badge="Adhesive mount" type="cable-desk-organizer" params={simpleModelSpecs["cable-channel-adhesive"].defaults} title="Adhesive Under-Desk Cable Channel" description="An under-desk channel that installs with adhesive." detail="Adhesive mount · Adjustable channel" /><ModelCard href="/models/compact-cable-organizer" badge="Tape or screws · 1–8 cables" type="cable-clip" params={simpleModelSpecs["compact-cable-organizer"].defaults} title="Compact Cable Organizer" description="A small organizer for keeping several cables in place." detail="1–8 cables · Tape or screws" /><ModelCard href="/models/cable-guide" badge="Open-front guide" type="cable-guide" params={simpleModelSpecs["cable-guide"].defaults} title="Open Cable Guide" description="An open-front guide for cables that need to stay removable." detail="Open front · Adjustable opening" /></div></section>
    </> : view === "desk-mounts" ? <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Mount hardware<br />out of sight.</h1><p>Create a precise under-desk holder for a hub, power supply, router or dock.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a desk mount</h2></div></div><div className="projectGrid"><ModelCard href="/models/under-desk-holder" badge="Device-size fit" type="under-desk-holder" params={simpleModelSpecs["under-desk-holder"].defaults} title="Under-Desk Device Holder" description="A fitted holder for hardware mounted below a desk." detail="Device-size fit · Screw mount" /><ModelCard href="/models/phone-stand" badge="Made-to-fit device stand" type="phone-stand" params={simpleModelSpecs["phone-stand"].defaults} title="Phone Stand" description="A made-to-fit stand for a phone or similar device." detail="Custom fit · Adjustable support" /></div></section>
    </> : <>
      <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title"><h1 id="projects-title">Build out<br />your pegboard.</h1><p>Start with a shelf sized for an IKEA Skådis-compatible pegboard.</p></section>
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a pegboard model</h2></div></div><div className="projectGrid"><ModelCard href="/models/pegboard-shelf" badge="Skådis compatible" type="pegboard-shelf" params={simpleModelSpecs["pegboard-shelf"].defaults} title="Pegboard Shelf" description="A configurable shelf for an IKEA Skådis-compatible pegboard." detail="Skådis compatible · Adjustable size" /></div></section>
    </>}
    <footer className="consoleFooter">Made for FDM-printing hobbyists <span aria-hidden="true">·</span> Models stay in your browser <span aria-hidden="true">·</span> Export STL when ready</footer>
  </motion.main>;
}
