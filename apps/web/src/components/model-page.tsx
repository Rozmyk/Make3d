"use client";

import { organizerPresets } from "../organizer-presets";
import { simpleModelSpecs } from "../model-specs";
import { OrganizerEditor } from "./organizer-editor";
import { SimpleModelEditor } from "./simple-model-editor";

export function ModelPage({ slug }: { slug: string }) {
  const organizerId = slug.startsWith("organizer-") ? slug.slice("organizer-".length) : undefined;
  const preset = organizerPresets.find((item) => item.id === organizerId);
  if (preset) return <OrganizerEditor initialParams={preset.params} />;

  const spec = simpleModelSpecs[slug as keyof typeof simpleModelSpecs];
  if (spec) return <SimpleModelEditor spec={spec} />;

  return <main className="projectsHome missingModel"><h1>Model not found.</h1><a className="navCta" href="/">Browse models</a></main>;
}
