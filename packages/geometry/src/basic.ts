import type { CableClipParams, CableDeskOrganizerParams, CableGuideParams, GeneratedModel, MeshData, ModelMetadata, PegboardShelfParams, PhoneStandParams, StorageBoxParams, UnderDeskHolderParams } from "@make3d/types";
import { cableClipParamsSchema, cableDeskOrganizerParamsSchema, cableGuideParamsSchema, pegboardShelfParamsSchema, phoneStandParamsSchema, storageBoxParamsSchema, underDeskHolderParamsSchema } from "@make3d/validation";
import createManifold, { type ManifoldToplevel } from "manifold-3d";
import { GeometryGenerationError } from "./organizer";

type Solid = ReturnType<ManifoldToplevel["Manifold"]["cube"]>;

let manifoldPromise: Promise<ManifoldToplevel> | undefined;

async function getManifold(): Promise<ManifoldToplevel> {
  manifoldPromise ??= createManifold().then((module) => {
    module.setup();
    return module;
  });
  return manifoldPromise;
}

function cuboid(module: ManifoldToplevel, width: number, depth: number, height: number, x = 0, y = 0, z = height / 2): Solid {
  return module.Manifold.cube([width, depth, height], true).translate([x, y, z]);
}

function meshFromManifold(manifold: Solid): MeshData {
  const mesh = manifold.getMesh();
  const positions = new Float32Array((mesh.vertProperties.length / mesh.numProp) * 3);
  for (let source = 0, target = 0; source < mesh.vertProperties.length; source += mesh.numProp, target += 3) {
    positions[target] = mesh.vertProperties[source];
    positions[target + 1] = mesh.vertProperties[source + 1];
    positions[target + 2] = mesh.vertProperties[source + 2];
  }
  return { positions, indices: new Uint32Array(mesh.triVerts) };
}

function buildModel(manifold: Solid, messages: string[] = []): GeneratedModel {
  try {
    if (manifold.status() !== "NoError") throw new GeometryGenerationError(`Manifold failed: ${manifold.status()}`);
    const mesh = meshFromManifold(manifold);
    if (mesh.indices.length === 0 || mesh.positions.some((value) => !Number.isFinite(value))) throw new GeometryGenerationError("Generated mesh is empty or contains invalid vertices.");
    const bounds = manifold.boundingBox();
    const metadata: ModelMetadata = {
      boundingBox: { width: bounds.max[0] - bounds.min[0], depth: bounds.max[1] - bounds.min[1], height: bounds.max[2] - bounds.min[2] },
      volumeMm3: Math.abs(manifold.volume()),
      triangleCount: mesh.indices.length / 3,
      compartmentCount: 1,
      printability: { valid: true, messages },
    };
    return { mesh, metadata };
  } finally {
    manifold.delete();
  }
}

export async function createPhoneStand(input: unknown): Promise<GeneratedModel> {
  const params: PhoneStandParams = phoneStandParamsSchema.parse(input);
  const module = await getManifold();
  const parts = [
    cuboid(module, params.width, params.depth, params.baseThickness),
    cuboid(module, params.width, params.backThickness, params.height, 0, (params.depth - params.backThickness) / 2, params.height / 2),
    cuboid(module, params.width, params.lipDepth, params.lipHeight, 0, -params.depth / 2 + params.lipDepth / 2, params.baseThickness + params.lipHeight / 2),
  ];
  try {
    return buildModel(module.Manifold.union(parts), ["Print upright with the back plate supported by a brim if needed."]);
  } finally {
    parts.forEach((part) => part.delete());
  }
}

export async function createCableGuide(input: unknown): Promise<GeneratedModel> {
  const params: CableGuideParams = cableGuideParamsSchema.parse(input);
  const module = await getManifold();
  const armDepth = params.depth * 0.7;
  const parts = [
    cuboid(module, params.width, params.depth, params.bottomThickness),
    cuboid(module, params.wallThickness, armDepth, params.height, -(params.width - params.wallThickness) / 2, -params.depth * 0.1, params.bottomThickness + params.height / 2),
    cuboid(module, params.wallThickness, armDepth, params.height, (params.width - params.wallThickness) / 2, -params.depth * 0.1, params.bottomThickness + params.height / 2),
    cuboid(module, params.width, params.wallThickness, params.height, 0, (params.depth - params.wallThickness) / 2, params.bottomThickness + params.height / 2),
  ];
  try {
    return buildModel(module.Manifold.union(parts), ["The open front lets you snap a cable into the guide."]);
  } finally {
    parts.forEach((part) => part.delete());
  }
}

export async function createCableDeskOrganizer(input: unknown): Promise<GeneratedModel> {
  const params: CableDeskOrganizerParams = cableDeskOrganizerParamsSchema.parse(input);
  const module = await getManifold();
  const wallThickness = Math.max(3, params.baseThickness * 0.75);
  const mountDepth = Math.max(28, params.cableDiameter * 2.5);
  const channelDepth = params.depth - mountDepth;
  const channelBottom = params.baseThickness - params.backHeight;
  const lipHeight = Math.max(8, Math.min(params.backHeight * 0.45, params.cableDiameter * 0.9));
  const mountCenter = -params.depth / 2 + mountDepth / 2;
  const backCenter = -params.depth / 2 + mountDepth - wallThickness / 2;
  const channelCenter = mountDepth / 2;
  const parts = [
    // This plate sits against the underside of the desk. The channel hangs below it.
    cuboid(module, params.length, mountDepth, params.baseThickness, 0, mountCenter),
    cuboid(module, params.length, wallThickness, params.backHeight, 0, backCenter, params.baseThickness - params.backHeight / 2),
    cuboid(module, params.length, channelDepth, params.baseThickness, 0, channelCenter, channelBottom + params.baseThickness / 2),
    // A low retaining lip leaves a deliberate front opening: push a cable in and it snaps behind the lip.
    cuboid(module, params.length, wallThickness, lipHeight, 0, params.depth / 2 - wallThickness / 2, channelBottom + lipHeight / 2),
  ];
  const screwHoles = params.mountStyle === "screws"
    ? [-params.length * 0.36, params.length * 0.36].flatMap((x) => [-params.depth / 2 + mountDepth * 0.3, -params.depth / 2 + mountDepth * 0.7]
      .map((y) => module.Manifold.cylinder(params.baseThickness + 0.04, 2.25, 2.25, 24).translate([x, y, -0.02])))
    : [];
  try {
    const body = module.Manifold.union(parts);
    try {
      const result = screwHoles.length ? module.Manifold.difference([body, ...screwHoles]) : body;
      return buildModel(result, [
        params.mountStyle === "screws"
          ? "Fasten the mounting plate to the underside of the desk with four screws."
          : "Apply strong double-sided mounting tape to the flat mounting plate.",
        "Press cables through the open front lip; it retains them while keeping them removable.",
      ]);
    } finally {
      if (screwHoles.length) body.delete();
    }
  } finally {
    parts.forEach((part) => part.delete());
    screwHoles.forEach((hole) => hole.delete());
  }
}

export async function createPegboardShelf(input: unknown): Promise<GeneratedModel> {
  const params: PegboardShelfParams = pegboardShelfParamsSchema.parse(input);
  const module = await getManifold();
  const thickness = 3;
  const backHeight = 48;
  const hookWidth = 12;
  const hookOffset = Math.min(params.width * 0.28, 34);
  const parts = [
    cuboid(module, params.width, params.depth, thickness, 0, 0, thickness / 2),
    cuboid(module, params.width, thickness, backHeight, 0, -params.depth / 2 + thickness / 2, backHeight / 2),
    cuboid(module, thickness, params.depth, 16, -params.width / 2 + thickness / 2, 0, 8),
    cuboid(module, thickness, params.depth, 16, params.width / 2 - thickness / 2, 0, 8),
    // Two Skådis-style hook stems and upward catches sit behind the back plate.
    cuboid(module, hookWidth, 5, 36, -hookOffset, -params.depth / 2 - 2.5, backHeight - 18),
    cuboid(module, hookWidth, 12, 5, -hookOffset, -params.depth / 2 - 6, backHeight - 2.5),
    cuboid(module, hookWidth, 5, 36, hookOffset, -params.depth / 2 - 2.5, backHeight - 18),
    cuboid(module, hookWidth, 12, 5, hookOffset, -params.depth / 2 - 6, backHeight - 2.5),
  ];
  try {
    return buildModel(module.Manifold.union(parts), ["Designed as a lightweight shelf for an IKEA Skådis-compatible pegboard."]);
  } finally {
    parts.forEach((part) => part.delete());
  }
}

export async function createCableClip(input: unknown): Promise<GeneratedModel> {
  const params: CableClipParams = cableClipParamsSchema.parse(input);
  const module = await getManifold();
  const wall = 2.4;
  const channelWidth = params.cableDiameter + wall * 2;
  const totalWidth = params.cableCount * channelWidth + (params.cableCount - 1) * params.spacing + wall * 2;
  // The supplied reference is a single continuous under-desk channel rather than
  // separate clips: its default silhouette is approximately 73 × 29 × 37 mm.
  const totalDepth = 29;
  const channelHeight = 37;
  const plateThickness = 3.5;
  const floorZ = plateThickness - channelHeight;
  const lipHeight = 14;
  const parts: Solid[] = [
    // Full plate against the underside of the desk.
    cuboid(module, totalWidth, totalDepth, plateThickness, 0, 0, plateThickness / 2),
    // Continuous U-shaped channel below the plate.
    cuboid(module, totalWidth, wall, channelHeight, 0, -totalDepth / 2 + wall / 2, plateThickness - channelHeight / 2),
    cuboid(module, totalWidth, totalDepth, wall, 0, 0, floorZ + wall / 2),
    cuboid(module, wall, totalDepth, channelHeight - wall, -totalWidth / 2 + wall / 2, 0, floorZ + (channelHeight - wall) / 2),
    cuboid(module, wall, totalDepth, channelHeight - wall, totalWidth / 2 - wall / 2, 0, floorZ + (channelHeight - wall) / 2),
    // Low open-front retaining lip — cables can be pushed in and pulled out below it.
    cuboid(module, totalWidth - wall * 2, wall, lipHeight, 0, totalDepth / 2 - wall / 2, floorZ + lipHeight / 2),
  ];
  const holes = params.mountStyle === "screws"
    ? [-totalWidth * 0.27, totalWidth * 0.27].map((x) => module.Manifold.cylinder(plateThickness + 0.04, 2.25, 2.25, 24).translate([x, 0, -0.02]))
    : [];
  try {
    const body = module.Manifold.union(parts);
    try {
      return buildModel(holes.length ? module.Manifold.difference([body, ...holes]) : body, [params.mountStyle === "screws" ? "Fasten the compact top plate through the two mounting holes." : "Apply strong double-sided tape to the flat top plate.", "Press cables through the low front lip; the individual channels keep them separated and removable."]);
    } finally { if (holes.length) body.delete(); }
  } finally {
    parts.forEach((part) => part.delete());
    holes.forEach((hole) => hole.delete());
  }
}

export async function createUnderDeskHolder(input: unknown): Promise<GeneratedModel> {
  const params: UnderDeskHolderParams = underDeskHolderParamsSchema.parse(input);
  const module = await getManifold();
  const wall = 3;
  const plateDepth = 30;
  const railDepth = params.deviceDepth + wall * 2;
  const plate = cuboid(module, params.deviceWidth + wall * 2, plateDepth, wall, 0, -railDepth / 2 + plateDepth / 2);
  const parts = [
    plate,
    cuboid(module, wall, railDepth, params.deviceHeight + wall, -params.deviceWidth / 2 - wall / 2, 0, -(params.deviceHeight + wall) / 2),
    cuboid(module, wall, railDepth, params.deviceHeight + wall, params.deviceWidth / 2 + wall / 2, 0, -(params.deviceHeight + wall) / 2),
    cuboid(module, params.deviceWidth + wall * 2, wall, wall, 0, railDepth / 2 - wall / 2, -params.deviceHeight),
  ];
  const holePositions = Array.from({ length: params.screwCount }, (_, index) => {
    const x = params.screwCount === 1 ? 0 : -params.deviceWidth * 0.36 + (index % 2) * params.deviceWidth * 0.72;
    const y = -railDepth / 2 + (index < 2 ? plateDepth * 0.3 : plateDepth * 0.7);
    return module.Manifold.cylinder(wall + 0.04, params.holeDiameter / 2, params.holeDiameter / 2, 24).translate([x, y, -0.02]);
  });
  try {
    const body = module.Manifold.union(parts);
    try {
      return buildModel(module.Manifold.difference([body, ...holePositions]), ["Screw the mounting plate under the desk, then slide the device into the open-front holder."]);
    } finally { body.delete(); }
  } finally {
    parts.forEach((part) => part.delete());
    holePositions.forEach((hole) => hole.delete());
  }
}

export async function createStorageBox(input: unknown): Promise<GeneratedModel> {
  const params: StorageBoxParams = storageBoxParamsSchema.parse(input);
  const module = await getManifold();
  const wall = params.wallThickness;
  const lidThickness = wall;
  const lidOffset = params.width * 0.65 + wall * 4;
  const outerWidth = params.width + params.lidClearance * 2 + wall * 2;
  const outerDepth = params.depth + params.lidClearance * 2 + wall * 2;
  const parts = [
    // Open box.
    cuboid(module, params.width, params.depth, wall),
    cuboid(module, wall, params.depth, params.height, -params.width / 2 + wall / 2, 0, params.height / 2),
    cuboid(module, wall, params.depth, params.height, params.width / 2 - wall / 2, 0, params.height / 2),
    cuboid(module, params.width - wall * 2, wall, params.height, 0, -params.depth / 2 + wall / 2, params.height / 2),
    cuboid(module, params.width - wall * 2, wall, params.height, 0, params.depth / 2 - wall / 2, params.height / 2),
    // Separate slip-on lid, printed beside the box.
    cuboid(module, outerWidth, outerDepth, lidThickness, lidOffset, 0, lidThickness / 2),
    cuboid(module, wall, outerDepth, wall * 2, lidOffset - outerWidth / 2 + wall / 2, 0, lidThickness + wall),
    cuboid(module, wall, outerDepth, wall * 2, lidOffset + outerWidth / 2 - wall / 2, 0, lidThickness + wall),
    cuboid(module, outerWidth - wall * 2, wall, wall * 2, lidOffset, -outerDepth / 2 + wall / 2, lidThickness + wall),
    cuboid(module, outerWidth - wall * 2, wall, wall * 2, lidOffset, outerDepth / 2 - wall / 2, lidThickness + wall),
  ];
  if (params.snapLatches) {
    parts.push(cuboid(module, wall * 2, wall * 2, wall * 2, lidOffset - outerWidth / 2 - wall / 2, 0, lidThickness + wall));
    parts.push(cuboid(module, wall * 2, wall * 2, wall * 2, lidOffset + outerWidth / 2 + wall / 2, 0, lidThickness + wall));
  }
  try {
    return buildModel(module.Manifold.union(parts), ["The lid is generated beside the box so both parts export in one STL.", params.snapLatches ? "Two small retention tabs are included on the lid." : "Use the configured clearance for a smooth slip-on lid."]);
  } finally {
    parts.forEach((part) => part.delete());
  }
}
