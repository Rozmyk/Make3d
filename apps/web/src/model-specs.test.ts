import { describe, expect, it } from "vitest";
import { simpleModelSpecs } from "./model-specs";

describe("simple model catalogue", () => {
  it("exposes every implemented non-organizer generator", () => {
    expect(Object.keys(simpleModelSpecs).sort()).toEqual([
      "cable-channel-adhesive",
      "cable-channel-screw",
      "cable-grommet",
      "cable-guide",
      "compact-cable-organizer",
      "l-bracket",
      "pegboard-shelf",
      "phone-stand",
      "screw-cover",
      "spacer",
      "storage-box",
      "under-desk-holder",
      "washer",
    ]);
  });

  it("exposes the dimensions that change the cable-channel geometry", () => {
    const fields = simpleModelSpecs["cable-channel-screw"].groups.flatMap((group) => group.fields.map((field) => field.key));
    expect(fields).toEqual(expect.arrayContaining(["length", "depth", "cableDiameter", "baseThickness", "backHeight"]));
  });
});
