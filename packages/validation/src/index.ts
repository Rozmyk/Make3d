import { z } from "zod";

export const organizerDefaults = {
  width: 120,
  depth: 80,
  height: 35,
  wallThickness: 2.4,
  bottomThickness: 2.4,
  cornerRadius: 5,
  columns: 3,
  rows: 2,
  dividerThickness: 2,
  roundedInside: true,
} as const;

const millimetres = (min: number, max: number) =>
  z.coerce.number().finite().min(min).max(max);

export const organizerParamsSchema = z
  .object({
    width: millimetres(40, 300),
    depth: millimetres(40, 300),
    height: millimetres(15, 150),
    wallThickness: millimetres(1.2, 6),
    bottomThickness: millimetres(1.2, 6),
    cornerRadius: millimetres(0, 100),
    columns: z.coerce.number().int().min(1).max(12),
    rows: z.coerce.number().int().min(1).max(12),
    dividerThickness: millimetres(1.2, 6),
    roundedInside: z.boolean(),
  })
  .superRefine((value, context) => {
    const innerWidth = value.width - 2 * value.wallThickness;
    const innerDepth = value.depth - 2 * value.wallThickness;
    const compartmentWidth =
      (innerWidth - (value.columns - 1) * value.dividerThickness) / value.columns;
    const compartmentDepth =
      (innerDepth - (value.rows - 1) * value.dividerThickness) / value.rows;

    if (value.bottomThickness >= value.height) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["bottomThickness"], message: "Bottom thickness must be less than height." });
    }
    if (value.cornerRadius > Math.min(value.width, value.depth) / 2) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["cornerRadius"], message: "Corner radius is too large for the outer dimensions." });
    }
    if (compartmentWidth <= 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["columns"], message: "Columns and divider thickness leave no compartment width." });
    }
    if (compartmentDepth <= 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["rows"], message: "Rows and divider thickness leave no compartment depth." });
    }
  });

export type OrganizerParamsInput = z.input<typeof organizerParamsSchema>;
export type ValidOrganizerParams = z.output<typeof organizerParamsSchema>;

export const phoneStandDefaults = {
  width: 75,
  depth: 82,
  height: 105,
  baseThickness: 4,
  backThickness: 5,
  lipHeight: 14,
  lipDepth: 14,
} as const;

export const phoneStandParamsSchema = z.object({
  width: millimetres(50, 140),
  depth: millimetres(50, 150),
  height: millimetres(65, 200),
  baseThickness: millimetres(2, 10),
  backThickness: millimetres(2, 12),
  lipHeight: millimetres(5, 35),
  lipDepth: millimetres(5, 35),
}).superRefine((value, context) => {
  if (value.lipDepth >= value.depth) context.addIssue({ code: z.ZodIssueCode.custom, path: ["lipDepth"], message: "Lip depth must be smaller than stand depth." });
  if (value.lipHeight >= value.height) context.addIssue({ code: z.ZodIssueCode.custom, path: ["lipHeight"], message: "Lip height must be smaller than stand height." });
});

export const cableGuideDefaults = {
  width: 22,
  depth: 18,
  height: 18,
  wallThickness: 2.4,
  bottomThickness: 2.4,
} as const;

export const cableGuideParamsSchema = z.object({
  width: millimetres(12, 60),
  depth: millimetres(10, 60),
  height: millimetres(8, 50),
  wallThickness: millimetres(1.2, 5),
  bottomThickness: millimetres(1.2, 6),
}).superRefine((value, context) => {
  if (value.width <= value.wallThickness * 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["width"], message: "Width must leave room for the cable channel." });
  if (value.bottomThickness >= value.height) context.addIssue({ code: z.ZodIssueCode.custom, path: ["bottomThickness"], message: "Bottom thickness must be less than height." });
});
