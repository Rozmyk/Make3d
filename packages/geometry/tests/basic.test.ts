import { cableGuideDefaults, phoneStandDefaults } from "@make3d/validation";
import { describe, expect, it } from "vitest";
import { createCableGuide, createPhoneStand } from "../src/index.js";

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
});
