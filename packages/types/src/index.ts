export type GeneratorType = "organizer" | "phone-stand" | "cable-guide" | "cable-desk-organizer" | "pegboard-shelf" | "cable-clip" | "under-desk-holder" | "storage-box" | "spacer" | "washer" | "cable-grommet" | "screw-cover" | "l-bracket";

export interface OrganizerParams {
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  bottomThickness: number;
  cornerRadius: number;
  innerCornerRadius: number;
  columns: number;
  rows: number;
  dividerThickness: number;
}

export interface PhoneStandParams {
  width: number;
  depth: number;
  height: number;
  baseThickness: number;
  backThickness: number;
  lipHeight: number;
  lipDepth: number;
}

export interface CableGuideParams {
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  bottomThickness: number;
}

export interface CableDeskOrganizerParams {
  length: number;
  depth: number;
  baseThickness: number;
  backHeight: number;
  cableDiameter: number;
  mountStyle: "screws" | "adhesive";
}

export interface PegboardShelfParams {
  width: number;
  depth: number;
}

export interface CableClipParams {
  cableDiameter: number;
  cableCount: number;
  spacing: number;
  mountStyle: "screws" | "adhesive";
}

export interface UnderDeskHolderParams {
  deviceWidth: number;
  deviceHeight: number;
  deviceDepth: number;
  screwCount: number;
  holeDiameter: number;
}

export interface StorageBoxParams {
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  lidClearance: number;
  cornerRadius: number;
}

export interface SpacerParams {
  outerDiameter: number;
  height: number;
  holeDiameter: number;
  flangeDiameter: number;
  flangeHeight: number;
}

export interface WasherParams {
  outerDiameter: number;
  holeDiameter: number;
  thickness: number;
  style: "flat" | "countersunk";
  countersinkDiameter: number;
  countersinkDepth: number;
}

export interface CableGrommetParams {
  cutoutDiameter: number;
  openingDiameter: number;
  deskThickness: number;
  flangeDiameter: number;
  flangeThickness: number;
}

export interface ScrewCoverParams {
  screwHeadDiameter: number;
  screwHeadHeight: number;
  wallThickness: number;
  topThickness: number;
  clearance: number;
}

export interface LBracketParams {
  width: number;
  horizontalLength: number;
  verticalLength: number;
  thickness: number;
  holeDiameter: number;
  edgeOffset: number;
  horizontalHoleCount: number;
  verticalHoleCount: number;
}

export interface MeshData {
  positions: Float32Array;
  indices: Uint32Array;
}

export interface BoundingBox {
  width: number;
  depth: number;
  height: number;
}

export interface ModelMetadata {
  boundingBox: BoundingBox;
  volumeMm3: number;
  triangleCount: number;
  compartmentCount: number;
  printability: { valid: boolean; messages: string[] };
}

export interface GeneratedModel {
  mesh: MeshData;
  metadata: ModelMetadata;
}
