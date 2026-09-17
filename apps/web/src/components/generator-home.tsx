"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { GeneratedModel, GeneratorType } from "@make3d/types";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { organizerPresets } from "../organizer-presets";
import { simpleModelSpecs } from "../model-specs";
import { ModelViewport } from "./model-viewport";

type HomeView = "landing" | "contact" | "categories" | "organizers" | "cable-management" | "desk-mounts" | "mounting" | "pegboard" | "spacers" | "washers";
const premiumEase = [0.16, 1, 0.3, 1] as const;

function viewFromLocation(): HomeView {
  const query = new URLSearchParams(window.location.search);
  const category = query.get("category");
  if (category === "organizers" || category === "cable-management" || category === "desk-mounts" || category === "mounting" || category === "pegboard" || category === "spacers" || category === "washers") return category;
  if (query.get("view") === "contact") return "contact";
  return query.get("view") === "library" ? "categories" : "landing";
}

type WorkerResponse = { id: number; model?: GeneratedModel; error?: string };

function ModelThumbnail({ type, params, label, transparent = false, fitScale, autoRotate = false, modelColorToken }: { type: GeneratorType; params: unknown; label: string; transparent?: boolean; fitScale?: number; autoRotate?: boolean; modelColorToken?: string }) {
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
  return <div className="projectThumbnail projectThumbnail--model" aria-label={`3D preview: ${label}`}>
    {!model && <div className="renderLoading" aria-hidden="true"><span /><small>{error ? "Preview unavailable" : "Preparing preview"}</small></div>}
    <ModelViewport model={model} wireframe={false} resetToken={0} compact transparent={transparent} fitScale={fitScale} autoRotate={autoRotate} modelColorToken={modelColorToken} />
    <span className="srOnly" role="status">{error ? `Preview unavailable: ${error}` : model ? `${label} preview ready` : `Preparing ${label} preview`}</span>
  </div>;
}

function ModelCard({ href, badge, type, params, title, description, detail }: { href: string; badge: string; type: GeneratorType; params: unknown; title: string; description: string; detail: string }) {
  return <a className="projectCard projectCard--technical modelCard" href={href}>
    <div className="modelCardStage"><span className="modelCardBadge">{badge}</span><ModelThumbnail type={type} params={params} label={title} transparent modelColorToken="--color-model-3d" /></div>
    <div className="modelCardCaption"><strong>{title}</strong><span className="modelCardDescription">{description}</span><span className="modelCardMeta">{detail}</span></div>
  </a>;
}

function CategoryIcon({ type }: { type: "organizers" | "cable" | "mount" | "pegboard" | "spacer" | "washer" }) {
  const shared = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.7 };
  return <svg className="categoryGlyph" viewBox="0 0 48 48" aria-hidden="true">
    {type === "organizers" && <><rect {...shared} x="7" y="7" width="34" height="34" rx="2" /><path {...shared} d="M18 7v34M30 7v34M7 18h34M7 30h34" /></>}
    {type === "cable" && <><path {...shared} d="M8 15h8l16 18h8" /><path {...shared} d="M8 33h8L32 15h8" /><path {...shared} d="M18 11v8M30 29v8" /></>}
    {type === "mount" && <><path {...shared} d="M11 10v24h26" /><path {...shared} d="M18 17h19v17" /><path {...shared} d="M11 39h26" /><circle cx="31" cy="25" r="1.5" fill="currentColor" /></>}
    {type === "pegboard" && <><rect {...shared} x="8" y="8" width="32" height="32" rx="2" /><circle cx="17" cy="17" r="2" fill="currentColor" /><circle cx="31" cy="17" r="2" fill="currentColor" /><circle cx="17" cy="31" r="2" fill="currentColor" /><circle cx="31" cy="31" r="2" fill="currentColor" /></>}
    {type === "spacer" && <><ellipse {...shared} cx="24" cy="14" rx="15" ry="6" /><path {...shared} d="M9 14v19M39 14v19" /><ellipse {...shared} cx="24" cy="33" rx="15" ry="6" /></>}
    {type === "washer" && <><circle {...shared} cx="24" cy="24" r="16" /><circle {...shared} cx="24" cy="24" r="6" /></>}
  </svg>;
}

function CategoryHeader({ label, title, description, onBack }: { label: string; title: ReactNode; description: string; onBack: () => void }) {
  return <section className="projectsIntro projectsIntro--compact" aria-labelledby="projects-title">
    <button className="backToCategories" onClick={onBack}>← All categories</button>
    <p className="sectionKicker">{label}</p>
    <h1 id="projects-title">{title}</h1>
    <p>{description}</p>
  </section>;
}

const libraryGroups: Array<{ name: string; description: string; view: HomeView }> = [
  { name: "Organizers", description: "Trays and compartments for the things that need a place.", view: "organizers" },
  { name: "Cable management", description: "Grommets, clips and channels for a calmer desk.", view: "cable-management" },
  { name: "Mounting", description: "Brackets, covers and small hardware made to fit.", view: "mounting" },
  { name: "Small parts", description: "Spacers and washers for precise, printable gaps.", view: "spacers" },
];

function LandingLibrary({ onBrowse, onSelect }: { onBrowse: () => void; onSelect: (view: HomeView) => void }) {
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.56, delay, ease: premiumEase } };
  return <section className="landingLibrary" id="how-it-works" aria-labelledby="library-title">
    <motion.header className="landingLibraryIntro" {...reveal()}><p>Start with the kind of problem you have.</p><h2 id="library-title">A small library<br />for useful parts.</h2><button className="landingLibraryAction" onClick={onBrowse}>Browse all models <span aria-hidden="true">→</span></button></motion.header>
    <ul className="landingLibraryList">{libraryGroups.map(({ name, description, view }, index) => <motion.li key={name} {...reveal(0.08 + index * 0.08)}><button className="landingLibraryItem" onClick={() => onSelect(view)}><strong>{name}</strong><p>{description}</p><span aria-hidden="true">↗</span></button></motion.li>)}</ul>
  </section>;
}

function Contact() {
  return <section className="contactPage" aria-labelledby="contact-title"><p>Contact</p><h1 id="contact-title">Need a part<br />we do not have?</h1><p>Describe what you are trying to fit, mount or organise. A GitHub issue is the best place to request a model or report a problem.</p><div><a className="contactPrimary" href="https://github.com/Rozmyk/Make3d/issues/new" target="_blank" rel="noreferrer">Request a model <span aria-hidden="true">↗</span></a><a className="contactSecondary" href="https://github.com/Rozmyk/Make3d" target="_blank" rel="noreferrer">Open GitHub <span aria-hidden="true">↗</span></a></div></section>;
}

function Landing({ onBrowse, onSelect, onContact }: { onBrowse: () => void; onSelect: (view: HomeView) => void; onContact: () => void }) {
  const reduceMotion = useReducedMotion();
  const ctaReveal = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.22 }, transition: { duration: 0.6, ease: premiumEase } };
  return <>
    <section className="landingHero" aria-labelledby="landing-title">
      <div className="landingHeroCopy"><h1 id="landing-title">Make the part<br />you need.</h1><p>Choose a tested starting point, fit it to your setup and download a ready-to-print STL.</p><div className="landingHeroActions"><button className="landingPrimary" onClick={onBrowse}>Choose a model <span aria-hidden="true">→</span></button><a className="landingSecondary" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a></div><p className="landingHeroProof">No account needed. Adjust dimensions in your browser, then export an STL.</p></div>
      <div className="landingHeroVisual" aria-label="Editable organizer preview"><ModelThumbnail type="organizer" params={organizerPresets[0].params} label="Custom organizer" transparent fitScale={1.12} autoRotate modelColorToken="--maker-model" /></div>
    </section>
    <LandingLibrary onBrowse={onBrowse} onSelect={onSelect} />
    <motion.section className="landingCta" aria-labelledby="cta-title" {...ctaReveal}><p>Made for things that almost fit.</p><h2 id="cta-title">Find a starting point,<br />then make it yours.</h2><button className="landingCtaAction" onClick={onContact}>Suggest a model <span aria-hidden="true">→</span></button></motion.section>
  </>;
}

export function GeneratorHome() {
  const [view, setView] = useState<HomeView>("landing");
  const reduceMotion = useReducedMotion();
  const enter = (_delay = 0) => ({ initial: false });
  const cardMotion = (_index: number) => reduceMotion ? {} : {
    whileTap: { scale: 0.995, transition: { duration: 0.12 } },
  };

  useEffect(() => {
    const syncView = () => setView(viewFromLocation());
    syncView();
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const navigate = (nextView: HomeView) => {
    setView(nextView);
    const url = nextView === "landing" ? window.location.pathname : nextView === "categories" ? `${window.location.pathname}?view=library` : nextView === "contact" ? `${window.location.pathname}?view=contact` : `${window.location.pathname}?category=${nextView}`;
    window.history.pushState({}, "", url);
  };

  return <motion.main className="projectsHome" {...enter()}>
    <header className="consoleHeader"><motion.nav className="floatingNav" aria-label="Main navigation" {...enter(0.08)}><button className="brand brandButton" onClick={() => navigate("landing")} aria-label="Make3D home"><img className="brandLogo" src="/make3d-logo.svg" alt="Make3D" /></button><div className="navLinks"><button className="navLink" onClick={() => navigate("categories")}>Library</button><a className="navLink" href="https://github.com/Rozmyk/Make3d" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><button className="navLink" onClick={() => navigate("contact")}>Contact</button></div></motion.nav></header>
    {view === "landing" ? <Landing onBrowse={() => navigate("categories")} onSelect={navigate} onContact={() => navigate("contact")} /> : view === "contact" ? <Contact /> : view === "categories" ? <>
      <motion.section className="projectsCatalogue projectsCatalogue--home" aria-labelledby="categories-title" {...enter(0.15)}>
        <div className="catalogueHead"><div><h1 id="categories-title">Choose a category.</h1><p>Start with a tested component, adjust its dimensions and export an STL when it is ready.</p></div></div>
        <div className="categoryGrid">
          <motion.button className="categoryCard" onClick={() => navigate("organizers")} {...cardMotion(0)}><CategoryIcon type="organizers" /><span className="projectCardMeta">5 projects available</span><strong>Organizers</strong><span className="projectCardDescription">Configurable trays, boxes and compact storage for the little things that need a place.</span><span className="projectCardAction">Browse organizers <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("cable-management")} {...cardMotion(1)}><CategoryIcon type="cable" /><span className="projectCardMeta">5 projects available</span><strong>Cable management</strong><span className="projectCardDescription">Channels and clips that keep the desk setup tidy and easy to change.</span><span className="projectCardAction">Browse cable models <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("desk-mounts")} {...cardMotion(2)}><CategoryIcon type="mount" /><span className="projectCardMeta">2 projects available</span><strong>Desk mounts</strong><span className="projectCardDescription">Made-to-fit holders for hardware mounted under the desk.</span><span className="projectCardAction">Browse desk mounts <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("pegboard")} {...cardMotion(3)}><CategoryIcon type="pegboard" /><span className="projectCardMeta">1 project available</span><strong>Pegboard</strong><span className="projectCardDescription">Modular add-ons for IKEA Skådis-compatible pegboards.</span><span className="projectCardAction">Browse pegboard models <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("spacers")} {...cardMotion(4)}><CategoryIcon type="spacer" /><span className="projectCardMeta">1 project available</span><strong>Spacers</strong><span className="projectCardDescription">Custom printable standoffs for precise gaps, fasteners and mounting surfaces.</span><span className="projectCardAction">Browse spacers <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("washers")} {...cardMotion(5)}><CategoryIcon type="washer" /><span className="projectCardMeta">1 project available</span><strong>Washers</strong><span className="projectCardDescription">Custom flat and countersunk washers for fasteners and mounting points.</span><span className="projectCardAction">Browse washers <span aria-hidden="true">→</span></span></motion.button>
          <motion.button className="categoryCard" onClick={() => navigate("mounting")} {...cardMotion(6)}><CategoryIcon type="mount" /><span className="projectCardMeta">2 projects available</span><strong>Mounting</strong><span className="projectCardDescription">Brackets and finishing parts for clean, reliable hardware mounting.</span><span className="projectCardAction">Browse mounting parts <span aria-hidden="true">→</span></span></motion.button>
        </div>
      </motion.section>
    </> : view === "organizers" ? <>
      <CategoryHeader label="Category / 05 models" title={<>Choose an organizer<br />to make your own.</>} description="Pick a starting layout, then adjust its dimensions, walls and compartments in the editor." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a starting point</h2></div></div><div className="projectGrid">{organizerPresets.map((preset) => <ModelCard key={preset.id} href={`/models/organizer-${preset.id}`} badge={`${preset.params.width} × ${preset.params.depth} × ${preset.params.height} mm`} type="organizer" params={preset.params} title={preset.title} description={preset.description} detail={`${preset.params.columns} × ${preset.params.rows} compartments · Adjustable layout`} />)}<ModelCard href="/models/storage-box" badge="Box + separate lid" type="storage-box" params={simpleModelSpecs["storage-box"].defaults} title="Storage Box with Lid" description="A configurable storage box designed with a separate lid." detail="Separate lid · Adjustable size" /></div></section>
    </> : view === "cable-management" ? <>
      <CategoryHeader label="Category / 05 models" title={<>Keep cables<br />where they belong.</>} description="Mount a channel under the desk, then press cables through its flexible front lip to keep them tidy and removable." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a cable model</h2></div></div><div className="projectGrid"><ModelCard href="/models/cable-channel-screw" badge="Screw mount" type="cable-desk-organizer" params={simpleModelSpecs["cable-channel-screw"].defaults} title="Under-Desk Cable Channel" description="A channel that routes cables cleanly beneath the desk." detail="Screw mount · Adjustable channel" /><ModelCard href="/models/cable-channel-adhesive" badge="Adhesive mount" type="cable-desk-organizer" params={simpleModelSpecs["cable-channel-adhesive"].defaults} title="Adhesive Under-Desk Cable Channel" description="An under-desk channel that installs with adhesive." detail="Adhesive mount · Adjustable channel" /><ModelCard href="/models/compact-cable-organizer" badge="Tape or screws · 1–8 cables" type="cable-clip" params={simpleModelSpecs["compact-cable-organizer"].defaults} title="Compact Cable Organizer" description="A small organizer for keeping several cables in place." detail="1–8 cables · Tape or screws" /><ModelCard href="/models/cable-guide" badge="Open-front guide" type="cable-guide" params={simpleModelSpecs["cable-guide"].defaults} title="Open Cable Guide" description="An open-front guide for cables that need to stay removable." detail="Open front · Adjustable opening" /><ModelCard href="/models/cable-grommet" badge="Desk cutout fit" type="cable-grommet" params={simpleModelSpecs["cable-grommet"].defaults} title="Cable Grommet" description="A fitted desk insert that routes cables through a clean, protected opening." detail="Cutout · opening · desk thickness" /></div></section>
    </> : view === "desk-mounts" ? <>
      <CategoryHeader label="Category / 02 models" title={<>Mount hardware<br />out of sight.</>} description="Create a precise under-desk holder for a hub, power supply, router or dock." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a desk mount</h2></div></div><div className="projectGrid"><ModelCard href="/models/under-desk-holder" badge="Device-size fit" type="under-desk-holder" params={simpleModelSpecs["under-desk-holder"].defaults} title="Under-Desk Device Holder" description="A fitted holder for hardware mounted below a desk." detail="Device-size fit · Screw mount" /><ModelCard href="/models/phone-stand" badge="Made-to-fit device stand" type="phone-stand" params={simpleModelSpecs["phone-stand"].defaults} title="Phone Stand" description="A made-to-fit stand for a phone or similar device." detail="Custom fit · Adjustable support" /></div></section>
    </> : view === "mounting" ? <>
      <CategoryHeader label="Category / 02 models" title={<>Mount it<br />with confidence.</>} description="Create fitted brackets and finishing parts for clean, strong hardware installations." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a mounting part</h2></div></div><div className="projectGrid"><ModelCard href="/models/l-bracket" badge="Fully adjustable" type="l-bracket" params={simpleModelSpecs["l-bracket"].defaults} title="L-Bracket" description="A right-angle bracket with adjustable legs, thickness and mounting holes." detail="Size · thickness · holes" /><ModelCard href="/models/screw-cover" badge="Custom fit" type="screw-cover" params={simpleModelSpecs["screw-cover"].defaults} title="Screw Cover" description="A press-fit cap that hides and protects an exposed screw head." detail="Head size · clearance · wall" /></div></section>
    </> : view === "spacers" ? <>
      <CategoryHeader label="Category / 01 model" title={<>Create the exact<br />gap you need.</>} description="Configure a printable spacer for a precise mounting distance, with an optional centre hole and support flange." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a spacer</h2></div></div><div className="projectGrid"><ModelCard href="/models/spacer" badge="Fully adjustable" type="spacer" params={simpleModelSpecs.spacer.defaults} title="Custom Spacer" description="A made-to-fit spacer with an optional centre hole and support flange." detail="Diameter · height · hole · flange" /></div></section>
    </> : view === "washers" ? <>
      <CategoryHeader label="Category / 01 model" title={<>Fit every fastener<br />just right.</>} description="Create a flat or countersunk washer with dimensions matched to your screw and mounting surface." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a washer</h2></div></div><div className="projectGrid"><ModelCard href="/models/washer" badge="Flat or countersunk" type="washer" params={simpleModelSpecs.washer.defaults} title="Custom Washer" description="A made-to-fit flat or countersunk washer for your chosen fastener." detail="Diameter · hole · thickness · profile" /></div></section>
    </> : <>
      <CategoryHeader label="Category / 01 model" title={<>Build out<br />your pegboard.</>} description="Start with a shelf sized for an IKEA Skådis-compatible pegboard." onBack={() => navigate("categories")} />
      <section className="projectsCatalogue" aria-labelledby="catalogue-title"><div className="catalogueHead"><div><h2 id="catalogue-title">Choose a pegboard model</h2></div></div><div className="projectGrid"><ModelCard href="/models/pegboard-shelf" badge="Skådis compatible" type="pegboard-shelf" params={simpleModelSpecs["pegboard-shelf"].defaults} title="Pegboard Shelf" description="A configurable shelf for an IKEA Skådis-compatible pegboard." detail="Skådis compatible · Adjustable size" /></div></section>
    </>}
    <footer className="consoleFooter">Made for FDM-printing hobbyists <span aria-hidden="true">·</span> Models stay in your browser <span aria-hidden="true">·</span> Export STL when ready</footer>
  </motion.main>;
}
