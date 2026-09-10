export type GeneratorType = "organizer" | "phone-stand" | "cable-guide" | "cable-desk-organizer" | "pegboard-shelf" | "cable-clip" | "under-desk-holder" | "storage-box";

export interface OrganizerParams {
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  bottomThickness: number;
  cornerRadius: number;
  columns: number;
  rows: number;
  dividerThickness: number;
  roundedInside: boolean;
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
  snapLatches: boolean;
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
