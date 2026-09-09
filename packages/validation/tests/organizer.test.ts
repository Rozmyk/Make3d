import { describe, expect, it } from "vitest";
import { organizerDefaults, organizerParamsSchema } from "../src/index.js";

describe("organizerParamsSchema", () => {
  it("accepts the documented default", () => expect(organizerParamsSchema.parse(organizerDefaults).columns).toBe(3));
  it("rejects grids without usable compartment space", () => {
    expect(organizerParamsSchema.safeParse({ ...organizerDefaults, width: 40, wallThickness: 6, dividerThickness: 6, columns: 12 }).success).toBe(false);
  });
});
