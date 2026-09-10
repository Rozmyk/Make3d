import { cableClipDefaults, cableClipParamsSchema, cableDeskOrganizerDefaults, cableDeskOrganizerParamsSchema, pegboardShelfDefaults, pegboardShelfParamsSchema, storageBoxDefaults, storageBoxParamsSchema, underDeskHolderDefaults, underDeskHolderParamsSchema } from "@make3d/validation";
import type { SimpleModelSpec } from "./components/simple-model-editor";

export const simpleModelSpecs = {
  "storage-box": {
    type: "storage-box",
    title: "Storage Box with Lid",
    filename: "storage-box-with-lid",
    defaults: storageBoxDefaults,
    schema: storageBoxParamsSchema,
    groups: [
      { label: "Box size", fields: [{ key: "width", label: "Width", step: 1 }, { key: "depth", label: "Depth", step: 1 }, { key: "height", label: "Height", step: 1 }] },
      { label: "Build", fields: [{ key: "wallThickness", label: "Wall thickness", step: 0.1 }, { key: "lidClearance", label: "Lid clearance", step: 0.05 }, { key: "cornerRadius", label: "Corner radius", step: 0.5 }, { key: "snapLatches", label: "Add snap latches", type: "toggle" }] },
    ],
  },
  "cable-channel-screw": {
    type: "cable-desk-organizer",
    title: "Under-Desk Cable Channel — Screw Mount",
    filename: "under-desk-cable-channel-screw-mount",
    defaults: cableDeskOrganizerDefaults,
    schema: cableDeskOrganizerParamsSchema,
    groups: [{ label: "Channel length", fields: [{ key: "length", label: "Length", step: 1 }] }],
  },
  "cable-channel-adhesive": {
    type: "cable-desk-organizer",
    title: "Under-Desk Cable Channel — Adhesive Mount",
    filename: "under-desk-cable-channel-adhesive-mount",
    defaults: { ...cableDeskOrganizerDefaults, mountStyle: "adhesive" },
    schema: cableDeskOrganizerParamsSchema,
    groups: [{ label: "Channel length", fields: [{ key: "length", label: "Length", step: 1 }] }],
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
} satisfies Record<string, SimpleModelSpec>;

export type SimpleModelSlug = keyof typeof simpleModelSpecs;
