import { cableClipDefaults, cableDeskOrganizerDefaults, cableGuideDefaults, pegboardShelfDefaults, phoneStandDefaults, storageBoxDefaults, underDeskHolderDefaults } from "@make3d/validation";
import { describe, expect, it } from "vitest";
import { createCableClip, createCableDeskOrganizer, createCableGuide, createPegboardShelf, createPhoneStand, createStorageBox, createUnderDeskHolder } from "../src/index.js";

describe("basic printable models", () => {
  it("creates a phone stand with a valid mesh", async () => {
    const model = await createPhoneStand(phoneStandDefaults);
    expect(model.metadata.volumeMm3).toBeGreaterThan(0);
    expect(model.metadata.boundingBox.height).toBeCloseTo(phoneStandDefaults.height, 3);
    expect(model.mesh.indices.length).toBeGreaterThan(0);
  });

  it("creates an open cable guide with a valid mesh", async () => {
    const model = await createCableGuide(cableGuideDefaults);
    expect(model.metadata.volumeMm3).toBeGreaterThan(0);
    expect(model.metadata.boundingBox.width).toBeCloseTo(cableGuideDefaults.width, 3);
    expect(model.mesh.indices.every((index) => index < model.mesh.positions.length / 3)).toBe(true);
  });

  it("creates both under-desk cable channel mounting variants with editable length", async () => {
    const screwMount = await createCableDeskOrganizer({ ...cableDeskOrganizerDefaults, length: 240 });
    const adhesiveMount = await createCableDeskOrganizer({ ...cableDeskOrganizerDefaults, length: 240, mountStyle: "adhesive" });
    expect(screwMount.metadata.volumeMm3).toBeGreaterThan(0);
    expect(adhesiveMount.metadata.volumeMm3).toBeGreaterThan(screwMount.metadata.volumeMm3);
    expect(screwMount.metadata.boundingBox.width).toBeCloseTo(240, 3);
    expect(screwMount.mesh.indices.every((index) => index < screwMount.mesh.positions.length / 3)).toBe(true);
    expect(adhesiveMount.mesh.indices.every((index) => index < adhesiveMount.mesh.positions.length / 3)).toBe(true);
  });

  it("creates the new configurable desk models with valid meshes", async () => {
    const models = await Promise.all([
      createPegboardShelf(pegboardShelfDefaults),
      createCableClip(cableClipDefaults),
      createUnderDeskHolder(underDeskHolderDefaults),
      createStorageBox(storageBoxDefaults),
    ]);
    for (const model of models) {
      expect(model.metadata.volumeMm3).toBeGreaterThan(0);
      expect(model.mesh.indices.length).toBeGreaterThan(0);
      expect(model.mesh.indices.every((index) => index < model.mesh.positions.length / 3)).toBe(true);
    }
  });

  it("matches the compact cable organizer reference envelope", async () => {
    const model = await createCableClip(cableClipDefaults);
    expect(model.metadata.boundingBox.width).toBeCloseTo(73.2, 1);
    expect(model.metadata.boundingBox.depth).toBeCloseTo(29, 1);
    expect(model.metadata.boundingBox.height).toBeCloseTo(37, 1);
  });
});
