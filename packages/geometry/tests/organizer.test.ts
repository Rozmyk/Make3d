import { describe, expect, it } from "vitest";
import { organizerDefaults } from "@make3d/validation";
import { createOrganizer } from "../src/index.js";

describe("createOrganizer", () => {
  it("creates a six-compartment organizer with requested dimensions", async () => {
    const model = await createOrganizer(organizerDefaults);
    expect(model.metadata.compartmentCount).toBe(6);
    expect(model.metadata.boundingBox.width).toBeCloseTo(120, 3);
    expect(model.metadata.boundingBox.depth).toBeCloseTo(80, 3);
    expect(model.metadata.boundingBox.height).toBeCloseTo(35, 3);
    expect(model.metadata.volumeMm3).toBeGreaterThan(0);
    expect(model.metadata.printability.messages[0]).toMatch(/Watertight mesh verified/);
  });
  it("supports one row and column", async () => expect((await createOrganizer({ ...organizerDefaults, columns: 1, rows: 1 })).metadata.compartmentCount).toBe(1));
  it("controls inside and outside corner radii independently", async () => {
    const sharpInside = await createOrganizer({ ...organizerDefaults, innerCornerRadius: 0 });
    const roundedInside = await createOrganizer({ ...organizerDefaults, innerCornerRadius: 6 });
    const roundedOutside = await createOrganizer({ ...organizerDefaults, cornerRadius: 12 });
    expect(roundedInside.metadata.volumeMm3).not.toBeCloseTo(sharpInside.metadata.volumeMm3, 3);
    expect(roundedOutside.metadata.volumeMm3).not.toBeCloseTo(roundedInside.metadata.volumeMm3, 3);
    expect(roundedInside.metadata.boundingBox).toEqual(sharpInside.metadata.boundingBox);
  });
  it("supports the maximum grid within the documented bounds", async () => {
    const model = await createOrganizer({ ...organizerDefaults, width: 300, depth: 300, columns: 12, rows: 12 });
    expect(model.metadata.compartmentCount).toBe(144);
    expect(model.metadata.triangleCount).toBeGreaterThan(0);
  });
  it("rejects invalid dimensions", async () => expect(createOrganizer({ ...organizerDefaults, width: -50 })).rejects.toThrow());
});
