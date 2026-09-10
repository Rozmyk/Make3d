import type { OrganizerParams } from "@make3d/types";
import { organizerDefaults, organizerParamsSchema } from "@make3d/validation";

export type OrganizerPreset = {
  id: "cables" | "drawer" | "stationery" | "accessories";
  title: string;
  description: string;
  params: OrganizerParams;
};

const preset = (data: OrganizerPreset): OrganizerPreset => ({
  ...data,
  params: organizerParamsSchema.parse(data.params),
});

export const organizerPresets: OrganizerPreset[] = [
  preset({
    id: "cables",
    title: "Cable & adapters",
    description: "A compact home for chargers, adapters and short leads.",
    params: { ...organizerDefaults, width: 160, depth: 100, height: 35, columns: 3, rows: 2 },
  }),
  preset({
    id: "drawer",
    title: "Desk drawer",
    description: "A broad insert for the things that disappear into a drawer.",
    params: { ...organizerDefaults, width: 240, depth: 160, height: 45, columns: 4, rows: 3 },
  }),
  preset({
    id: "stationery",
    title: "Stationery tray",
    description: "A shallow row for pens, clips and everyday desk tools.",
    params: { ...organizerDefaults, width: 180, depth: 80, height: 35, columns: 3, rows: 1 },
  }),
  preset({
    id: "accessories",
    title: "Small accessories",
    description: "Four even compartments for little pieces that need a place.",
    params: { ...organizerDefaults, width: 120, depth: 100, height: 35, columns: 2, rows: 2 },
  }),
];

export function organizerEditorInitialParams(initialParams?: OrganizerParams): OrganizerParams {
  return initialParams ?? organizerDefaults;
}
