import { z } from "zod";

export const organizerDefaults = {
  width: 120,
  depth: 80,
  height: 35,
  wallThickness: 2.4,
  bottomThickness: 2.4,
  cornerRadius: 5,
  innerCornerRadius: 4,
  columns: 3,
  rows: 2,
  dividerThickness: 2,
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
    innerCornerRadius: millimetres(0, 100),
    columns: z.coerce.number().int().min(1).max(12),
    rows: z.coerce.number().int().min(1).max(12),
    dividerThickness: millimetres(1.2, 6),
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
    if (value.innerCornerRadius > Math.min(compartmentWidth, compartmentDepth) / 2) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["innerCornerRadius"], message: "Inside corner radius is too large for the smallest compartment." });
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

export const cableDeskOrganizerDefaults = {
  length: 180,
  depth: 110,
  baseThickness: 5,
  backHeight: 32,
  cableDiameter: 12,
  mountStyle: "screws",
} as const;

export const cableDeskOrganizerParamsSchema = z.object({
  length: millimetres(100, 320),
  depth: millimetres(70, 180),
  baseThickness: millimetres(3, 10),
  backHeight: millimetres(15, 70),
  cableDiameter: millimetres(6, 20),
  mountStyle: z.enum(["screws", "adhesive"]),
}).superRefine((value, context) => {
  if (value.cableDiameter >= value.depth / 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["cableDiameter"], message: "Cable diameter is too large for this channel depth." });
  if (value.backHeight <= value.baseThickness) context.addIssue({ code: z.ZodIssueCode.custom, path: ["backHeight"], message: "Back height must exceed base thickness." });
});

export const pegboardShelfDefaults = { width: 120, depth: 80 } as const;
export const pegboardShelfParamsSchema = z.object({
  width: millimetres(60, 300),
  depth: millimetres(35, 180),
});

export const cableClipDefaults = { cableDiameter: 8, cableCount: 3, spacing: 15, mountStyle: "screws" } as const;
export const cableClipParamsSchema = z.object({
  cableDiameter: millimetres(3, 16),
  cableCount: z.coerce.number().int().min(1).max(8),
  spacing: millimetres(2, 30),
  mountStyle: z.enum(["screws", "adhesive"]),
});

export const underDeskHolderDefaults = { deviceWidth: 110, deviceHeight: 32, deviceDepth: 85, screwCount: 4, holeDiameter: 4.5 } as const;
export const underDeskHolderParamsSchema = z.object({
  deviceWidth: millimetres(35, 300),
  deviceHeight: millimetres(12, 100),
  deviceDepth: millimetres(35, 220),
  screwCount: z.coerce.number().int().min(2).max(6),
  holeDiameter: millimetres(3, 8),
});

export const storageBoxDefaults = { width: 120, depth: 80, height: 50, wallThickness: 2.4, lidClearance: 0.35, cornerRadius: 6 } as const;
export const storageBoxParamsSchema = z.object({
  width: millimetres(40, 300),
  depth: millimetres(40, 300),
  height: millimetres(20, 180),
  wallThickness: millimetres(1.2, 6),
  lidClearance: millimetres(0.15, 1.2),
  cornerRadius: millimetres(0, 50),
}).superRefine((value, context) => {
  if (value.wallThickness * 2 >= Math.min(value.width, value.depth)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["wallThickness"], message: "Wall thickness leaves no interior space." });
  if (value.wallThickness >= value.height) context.addIssue({ code: z.ZodIssueCode.custom, path: ["wallThickness"], message: "Wall thickness must be less than box height." });
  if (value.cornerRadius > Math.min(value.width, value.depth) / 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["cornerRadius"], message: "Corner radius is too large for these dimensions." });
});

export const spacerDefaults = { outerDiameter: 18, height: 12, holeDiameter: 4.2, flangeDiameter: 0, flangeHeight: 0 } as const;
export const spacerParamsSchema = z.object({
  outerDiameter: millimetres(8, 100),
  height: millimetres(2, 100),
  holeDiameter: millimetres(0, 80),
  flangeDiameter: millimetres(0, 140),
  flangeHeight: millimetres(0, 20),
}).superRefine((value, context) => {
  if (value.holeDiameter >= value.outerDiameter - 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["holeDiameter"], message: "Hole diameter must leave at least a 1 mm wall." });
  if (value.flangeDiameter > 0 && value.flangeDiameter < value.outerDiameter) context.addIssue({ code: z.ZodIssueCode.custom, path: ["flangeDiameter"], message: "Flange diameter must be at least the spacer diameter, or 0 to disable it." });
  if (value.flangeDiameter === 0 && value.flangeHeight > 0) context.addIssue({ code: z.ZodIssueCode.custom, path: ["flangeHeight"], message: "Set a flange diameter before adding flange height." });
  if (value.flangeHeight >= value.height) context.addIssue({ code: z.ZodIssueCode.custom, path: ["flangeHeight"], message: "Flange height must be less than total height." });
});

export const washerDefaults = { outerDiameter: 20, holeDiameter: 4.2, thickness: 2, style: "flat", countersinkDiameter: 8.4, countersinkDepth: 1.2 } as const;
export const washerParamsSchema = z.object({
  outerDiameter: millimetres(8, 120),
  holeDiameter: millimetres(1, 80),
  thickness: millimetres(0.8, 12),
  style: z.enum(["flat", "countersunk"]),
  countersinkDiameter: millimetres(2, 100),
  countersinkDepth: millimetres(0.1, 10),
}).superRefine((value, context) => {
  if (value.holeDiameter >= value.outerDiameter - 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["holeDiameter"], message: "Hole diameter must leave at least a 1 mm rim." });
  if (value.style === "countersunk" && value.countersinkDiameter <= value.holeDiameter) context.addIssue({ code: z.ZodIssueCode.custom, path: ["countersinkDiameter"], message: "Countersink diameter must exceed the hole diameter." });
  if (value.style === "countersunk" && value.countersinkDiameter >= value.outerDiameter - 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["countersinkDiameter"], message: "Countersink diameter must leave at least a 1 mm rim." });
  if (value.style === "countersunk" && value.countersinkDepth >= value.thickness) context.addIssue({ code: z.ZodIssueCode.custom, path: ["countersinkDepth"], message: "Countersink depth must be less than washer thickness." });
});

export const cableGrommetDefaults = { cutoutDiameter: 60, openingDiameter: 36, deskThickness: 25, flangeDiameter: 76, flangeThickness: 3 } as const;
export const cableGrommetParamsSchema = z.object({
  cutoutDiameter: millimetres(20, 120),
  openingDiameter: millimetres(8, 100),
  deskThickness: millimetres(8, 60),
  flangeDiameter: millimetres(28, 150),
  flangeThickness: millimetres(1.2, 8),
}).superRefine((value, context) => {
  if (value.openingDiameter >= value.cutoutDiameter - 2) context.addIssue({ code: z.ZodIssueCode.custom, path: ["openingDiameter"], message: "Opening must leave at least a 1 mm sleeve wall." });
  if (value.flangeDiameter < value.cutoutDiameter + 4) context.addIssue({ code: z.ZodIssueCode.custom, path: ["flangeDiameter"], message: "Flange must overlap the desk cutout by at least 2 mm on each side." });
});

export const screwCoverDefaults = { screwHeadDiameter: 9, screwHeadHeight: 3, wallThickness: 1.6, topThickness: 1.4, clearance: 0.25 } as const;
export const screwCoverParamsSchema = z.object({
  screwHeadDiameter: millimetres(3, 30),
  screwHeadHeight: millimetres(1, 15),
  wallThickness: millimetres(1.2, 5),
  topThickness: millimetres(1, 5),
  clearance: millimetres(0.1, 1),
});

export const lBracketDefaults = { width: 50, horizontalLength: 45, verticalLength: 45, thickness: 3, holeDiameter: 4.2, edgeOffset: 8, horizontalHoleCount: 2, verticalHoleCount: 2 } as const;
export const lBracketParamsSchema = z.object({
  width: millimetres(20, 180),
  horizontalLength: millimetres(20, 180),
  verticalLength: millimetres(20, 180),
  thickness: millimetres(2, 10),
  holeDiameter: millimetres(2, 12),
  edgeOffset: millimetres(3, 40),
  horizontalHoleCount: z.coerce.number().int().min(1).max(4),
  verticalHoleCount: z.coerce.number().int().min(1).max(4),
}).superRefine((value, context) => {
  if (value.holeDiameter >= Math.min(value.width, value.horizontalLength, value.verticalLength) - 4) context.addIssue({ code: z.ZodIssueCode.custom, path: ["holeDiameter"], message: "Hole diameter is too large for this bracket." });
  if (value.edgeOffset + value.holeDiameter / 2 > value.horizontalLength - value.thickness) context.addIssue({ code: z.ZodIssueCode.custom, path: ["edgeOffset"], message: "Horizontal hole margin leaves no room on this leg." });
  if (value.edgeOffset + value.holeDiameter / 2 > value.verticalLength) context.addIssue({ code: z.ZodIssueCode.custom, path: ["edgeOffset"], message: "Vertical hole margin leaves no room on this leg." });
});
