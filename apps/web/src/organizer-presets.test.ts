import { organizerParamsSchema } from "@make3d/validation";
import { describe, expect, it } from "vitest";
import { organizerEditorInitialParams, organizerPresets } from "./organizer-presets";

describe("organizer presets", () => {
  it("keeps every desk project within the Organizer validation rules", () => {
    expect(organizerPresets).toHaveLength(4);
    for (const preset of organizerPresets) expect(organizerParamsSchema.safeParse(preset.params).success).toBe(true);
  });

  it("passes a selected preset to the editor without changing its dimensions", () => {
    for (const preset of organizerPresets) expect(organizerEditorInitialParams(preset.params)).toEqual(preset.params);
  });
});
