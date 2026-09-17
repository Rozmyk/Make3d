import { cableClipDefaults, cableClipParamsSchema, cableDeskOrganizerDefaults, cableDeskOrganizerParamsSchema, cableGuideDefaults, cableGuideParamsSchema, cableGrommetDefaults, cableGrommetParamsSchema, lBracketDefaults, lBracketParamsSchema, pegboardShelfDefaults, pegboardShelfParamsSchema, phoneStandDefaults, phoneStandParamsSchema, screwCoverDefaults, screwCoverParamsSchema, spacerDefaults, spacerParamsSchema, storageBoxDefaults, storageBoxParamsSchema, underDeskHolderDefaults, underDeskHolderParamsSchema, washerDefaults, washerParamsSchema } from "@make3d/validation";
import type { SimpleModelSpec } from "./components/simple-model-editor";

export const simpleModelSpecs = {
  "cable-grommet": {
    type: "cable-grommet",
    title: "Cable Grommet",
    filename: "cable-grommet",
    defaults: cableGrommetDefaults,
    schema: cableGrommetParamsSchema,
    groups: [
      { label: "Desk cutout", fields: [{ key: "cutoutDiameter", label: "Cutout diameter", step: 0.5 }, { key: "openingDiameter", label: "Cable opening", step: 0.5 }, { key: "deskThickness", label: "Desk thickness", step: 0.5 }] },
      { label: "Top flange", fields: [{ key: "flangeDiameter", label: "Flange diameter", step: 0.5 }, { key: "flangeThickness", label: "Flange thickness", step: 0.1 }] },
    ],
  },
  "screw-cover": {
    type: "screw-cover",
    title: "Screw Cover",
    filename: "screw-cover",
    defaults: screwCoverDefaults,
    schema: screwCoverParamsSchema,
    groups: [
      { label: "Screw head", fields: [{ key: "screwHeadDiameter", label: "Head diameter", step: 0.1 }, { key: "screwHeadHeight", label: "Head height", step: 0.1 }, { key: "clearance", label: "Fit clearance", step: 0.05 }] },
      { label: "Cover build", fields: [{ key: "wallThickness", label: "Wall thickness", step: 0.1 }, { key: "topThickness", label: "Top thickness", step: 0.1 }] },
    ],
  },
  "l-bracket": {
    type: "l-bracket",
    title: "L-Bracket",
    filename: "l-bracket",
    defaults: lBracketDefaults,
    schema: lBracketParamsSchema,
    groups: [
      { label: "Bracket size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "horizontalLength", label: "Horizontal leg", step: 1 }, { key: "verticalLength", label: "Vertical leg", step: 1 }, { key: "thickness", label: "Material thickness", step: 0.1 }] },
      { label: "Mounting holes", fields: [{ key: "holeDiameter", label: "Hole diameter", step: 0.1 }, { key: "edgeOffset", label: "Edge margin", step: 0.5 }, { key: "horizontalHoleCount", label: "Horizontal holes", step: 1 }, { key: "verticalHoleCount", label: "Vertical holes", step: 1 }] },
    ],
  },
  washer: {
    type: "washer",
    title: "Custom Washer",
    filename: "custom-washer",
    defaults: washerDefaults,
    schema: washerParamsSchema,
    groups: [
      { label: "Washer size", fields: [{ key: "outerDiameter", label: "Outer diameter", step: 0.5 }, { key: "holeDiameter", label: "Hole diameter", step: 0.1 }, { key: "thickness", label: "Thickness", step: 0.1 }] },
      { label: "Top profile", fields: [{ key: "style", label: "Style", type: "select", options: [{ label: "Flat", value: "flat" }, { label: "Countersunk", value: "countersunk" }] }, { key: "countersinkDiameter", label: "Countersink diameter", step: 0.1 }, { key: "countersinkDepth", label: "Countersink depth", step: 0.1 }] },
    ],
  },
  spacer: {
    type: "spacer",
    title: "Custom Spacer",
    filename: "custom-spacer",
    defaults: spacerDefaults,
    schema: spacerParamsSchema,
    groups: [
      { label: "Spacer size", fields: [{ key: "outerDiameter", label: "Outer diameter", step: 0.5 }, { key: "height", label: "Height", step: 0.5 }, { key: "holeDiameter", label: "Hole diameter (0 = solid)", step: 0.1 }] },
      { label: "Optional flange", fields: [{ key: "flangeDiameter", label: "Flange diameter (0 = none)", step: 0.5 }, { key: "flangeHeight", label: "Flange height", step: 0.1 }] },
    ],
  },
  "storage-box": {
    type: "storage-box",
    title: "Storage Box with Lid",
    filename: "storage-box-with-lid",
    defaults: storageBoxDefaults,
    schema: storageBoxParamsSchema,
    groups: [
      { label: "Box size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Height", step: 1 }] },
      { label: "Build", fields: [{ key: "wallThickness", label: "Wall thickness", step: 0.1 }, { key: "lidClearance", label: "Lid clearance", step: 0.05 }, { key: "cornerRadius", label: "Corner radius", step: 0.5 }] },
    ],
  },
  "cable-channel-screw": {
    type: "cable-desk-organizer",
    title: "Under-Desk Cable Channel — Screw Mount",
    filename: "under-desk-cable-channel-screw-mount",
    defaults: cableDeskOrganizerDefaults,
    schema: cableDeskOrganizerParamsSchema,
    groups: [
      { label: "Channel size", fields: [{ key: "length", label: "Length", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "cableDiameter", label: "Largest cable diameter", step: 0.5 }] },
      { label: "Build", fields: [{ key: "baseThickness", label: "Mounting plate", step: 0.1 }, { key: "backHeight", label: "Channel height", step: 1 }] },
    ],
  },
  "cable-channel-adhesive": {
    type: "cable-desk-organizer",
    title: "Under-Desk Cable Channel — Adhesive Mount",
    filename: "under-desk-cable-channel-adhesive-mount",
    defaults: { ...cableDeskOrganizerDefaults, mountStyle: "adhesive" },
    schema: cableDeskOrganizerParamsSchema,
    groups: [
      { label: "Channel size", fields: [{ key: "length", label: "Length", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "cableDiameter", label: "Largest cable diameter", step: 0.5 }] },
      { label: "Build", fields: [{ key: "baseThickness", label: "Mounting plate", step: 0.1 }, { key: "backHeight", label: "Channel height", step: 1 }] },
    ],
  },
  "compact-cable-organizer": {
    type: "cable-clip",
    title: "Compact Under-Desk Cable Organizer",
    filename: "compact-under-desk-cable-organizer",
    defaults: cableClipDefaults,
    schema: cableClipParamsSchema,
    groups: [
      { label: "Cable layout", fields: [{ key: "cableDiameter", label: "Cable diameter", step: 0.5 }, { key: "cableCount", label: "Cable count", step: 1 }, { key: "spacing", label: "Spacing", step: 1 }] },
      { label: "Mounting", fields: [{ key: "mountStyle", label: "Method", type: "select", options: [{ label: "Screw mount", value: "screws" }, { label: "Adhesive mount", value: "adhesive" }] }] },
    ],
  },
  "under-desk-holder": {
    type: "under-desk-holder",
    title: "Under-Desk Device Holder",
    filename: "under-desk-device-holder",
    defaults: underDeskHolderDefaults,
    schema: underDeskHolderParamsSchema,
    groups: [
      { label: "Device size", fields: [{ key: "deviceWidth", label: "Width", step: 1 }, { key: "deviceHeight", label: "Height", step: 1 }, { key: "deviceDepth", label: "Depth", step: 1 }] },
      { label: "Mounting", fields: [{ key: "screwCount", label: "Screw count", step: 1 }, { key: "holeDiameter", label: "Hole diameter", step: 0.5 }] },
    ],
  },
  "pegboard-shelf": {
    type: "pegboard-shelf",
    title: "Pegboard Shelf",
    filename: "pegboard-shelf",
    defaults: pegboardShelfDefaults,
    schema: pegboardShelfParamsSchema,
    groups: [{ label: "Shelf size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }] }],
  },
  "phone-stand": {
    type: "phone-stand",
    title: "Phone Stand",
    filename: "phone-stand",
    defaults: phoneStandDefaults,
    schema: phoneStandParamsSchema,
    groups: [
      { label: "Stand size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Height", step: 1 }] },
      { label: "Device support", fields: [{ key: "baseThickness", label: "Base thickness", step: 0.1 }, { key: "backThickness", label: "Back thickness", step: 0.1 }, { key: "lipHeight", label: "Front lip height", step: 1 }, { key: "lipDepth", label: "Front lip depth", step: 1 }] },
    ],
  },
  "cable-guide": {
    type: "cable-guide",
    title: "Open Cable Guide",
    filename: "open-cable-guide",
    defaults: cableGuideDefaults,
    schema: cableGuideParamsSchema,
    groups: [
      { label: "Guide size", fields: [{ key: "width", label: "Cable opening", step: 0.5 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Wall height", step: 1 }] },
      { label: "Build", fields: [{ key: "wallThickness", label: "Wall thickness", step: 0.1 }, { key: "bottomThickness", label: "Bottom thickness", step: 0.1 }] },
    ],
  },
} satisfies Record<string, SimpleModelSpec>;

export type SimpleModelSlug = keyof typeof simpleModelSpecs;
