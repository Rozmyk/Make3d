import { describe, expect, it } from "vitest";
import { organizerDefaults } from "@make3d/validation";
import { createOrganizer, exportBinaryStl } from "../src/index.js";

describe("exportBinaryStl", () => {
  it("writes one 50-byte record per triangle", async () => {
    const model = await createOrganizer(organizerDefaults);
    const file = exportBinaryStl(model.mesh);
    expect(file.byteLength).toBe(84 + model.metadata.triangleCount * 50);
    expect(new DataView(file).getUint32(80, true)).toBe(model.metadata.triangleCount);
  });
});
