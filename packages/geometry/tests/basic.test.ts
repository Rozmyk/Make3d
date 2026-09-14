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
      expect(model.metadata.printability.messages[0]).toMatch(/Watertight mesh verified/);
      expect(model.mesh.indices.length).toBeGreaterThan(0);
      expect(model.mesh.indices.every((index) => index < model.mesh.positions.length / 3)).toBe(true);
    }
  });

  it("keeps the storage-box lid separate from the box in the exported mesh", async () => {
    const model = await createStorageBox(storageBoxDefaults);
    expect(model.metadata.boundingBox.width).toBeGreaterThan(storageBoxDefaults.width * 2);
  });

  it("applies the configured storage-box corner radius to both box and lid", async () => {
    const square = await createStorageBox({ ...storageBoxDefaults, cornerRadius: 0 });
    const rounded = await createStorageBox({ ...storageBoxDefaults, cornerRadius: 14 });
    expect(rounded.metadata.volumeMm3).not.toBeCloseTo(square.metadata.volumeMm3, 3);
    expect(rounded.metadata.triangleCount).toBeGreaterThan(square.metadata.triangleCount);
  });

  it("matches the compact cable organizer reference envelope", async () => {
    const oneCable = await createCableClip({ ...cableClipDefaults, cableCount: 1 });
    const model = await createCableClip(cableClipDefaults);
    expect(model.metadata.compartmentCount).toBe(cableClipDefaults.cableCount);
    expect(model.metadata.boundingBox.width).toBeGreaterThan(oneCable.metadata.boundingBox.width);
    expect(model.metadata.triangleCount).toBeGreaterThan(oneCable.metadata.triangleCount);
  });

  it("creates a distinct mounting-hole layout for every supported screw count", async () => {
    const volumes = await Promise.all([2, 3, 4, 5, 6].map(async (screwCount) =>
      (await createUnderDeskHolder({ ...underDeskHolderDefaults, screwCount })).metadata.volumeMm3,
    ));
    expect(new Set(volumes.map((volume) => volume.toFixed(3))).size).toBe(volumes.length);
  });
});
