import { cableGuideDefaults, cableGuideParamsSchema, phoneStandDefaults, phoneStandParamsSchema } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("basic model validation", () => {
  it("accepts defaults", () => {
    expect(phoneStandParamsSchema.safeParse(phoneStandDefaults).success).toBe(true);
    expect(cableGuideParamsSchema.safeParse(cableGuideDefaults).success).toBe(true);
  });

  it("rejects unusable dimensions", () => {
    expect(phoneStandParamsSchema.safeParse({ ...phoneStandDefaults, lipDepth: phoneStandDefaults.depth }).success).toBe(false);
    expect(cableGuideParamsSchema.safeParse({ ...cableGuideDefaults, width: 4 }).success).toBe(false);
  });
});
