import { cableDeskOrganizerDefaults, cableGuideDefaults, phoneStandDefaults } from "@make3d/validation";
import { describe, expect, it } from "vitest";
import { createCableDeskOrganizer, createCableGuide, createPhoneStand } from "../src/index.js";

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
});
