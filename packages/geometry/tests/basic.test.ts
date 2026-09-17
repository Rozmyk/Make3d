import { cableClipDefaults, cableDeskOrganizerDefaults, cableGuideDefaults, cableGrommetDefaults, lBracketDefaults, pegboardShelfDefaults, phoneStandDefaults, screwCoverDefaults, spacerDefaults, storageBoxDefaults, underDeskHolderDefaults, washerDefaults } from "@make3d/validation";
import { describe, expect, it } from "vitest";
import { createCableClip, createCableDeskOrganizer, createCableGuide, createCableGrommet, createLBracket, createPegboardShelf, createPhoneStand, createScrewCover, createSpacer, createStorageBox, createUnderDeskHolder, createWasher } from "../src/index.js";

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

  it("creates an editable spacer with an optional hole and flange", async () => {
    const solid = await createSpacer({ ...spacerDefaults, holeDiameter: 0 });
    const flanged = await createSpacer({ ...spacerDefaults, flangeDiameter: 28, flangeHeight: 3 });
    expect(flanged.metadata.boundingBox.width).toBeCloseTo(28, 3);
    expect(flanged.metadata.boundingBox.height).toBeCloseTo(spacerDefaults.height, 3);
    expect(flanged.metadata.volumeMm3).toBeGreaterThan(solid.metadata.volumeMm3);
    expect(flanged.mesh.indices.every((index) => index < flanged.mesh.positions.length / 3)).toBe(true);
  });

  it("creates flat and countersunk washer profiles", async () => {
    const flat = await createWasher(washerDefaults);
    const countersunk = await createWasher({ ...washerDefaults, style: "countersunk" });
    expect(flat.metadata.boundingBox.height).toBeCloseTo(washerDefaults.thickness, 3);
    expect(countersunk.metadata.volumeMm3).toBeLessThan(flat.metadata.volumeMm3);
    expect(countersunk.mesh.indices.every((index) => index < countersunk.mesh.positions.length / 3)).toBe(true);
  });

  it("creates configurable grommet, screw cover and L-bracket models", async () => {
    const [grommet, cover, bracket] = await Promise.all([
      createCableGrommet(cableGrommetDefaults),
      createScrewCover(screwCoverDefaults),
      createLBracket(lBracketDefaults),
    ]);
    expect(grommet.metadata.boundingBox.height).toBeCloseTo(cableGrommetDefaults.deskThickness + cableGrommetDefaults.flangeThickness, 3);
    expect(cover.metadata.boundingBox.height).toBeCloseTo(screwCoverDefaults.screwHeadHeight + screwCoverDefaults.topThickness, 3);
    expect(bracket.metadata.boundingBox.height).toBeCloseTo(lBracketDefaults.verticalLength, 3);
    expect(bracket.metadata.boundingBox.depth).toBeLessThanOrEqual(lBracketDefaults.horizontalLength);
    expect(bracket.metadata.compartmentCount).toBe(lBracketDefaults.horizontalHoleCount + lBracketDefaults.verticalHoleCount);
    for (const model of [grommet, cover, bracket]) expect(model.metadata.volumeMm3).toBeGreaterThan(0);
  });
});
