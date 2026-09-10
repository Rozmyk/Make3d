import type { CableDeskOrganizerParams, CableGuideParams, GeneratedModel, MeshData, ModelMetadata, PhoneStandParams } from "@make3d/types";
import { cableDeskOrganizerParamsSchema, cableGuideParamsSchema, phoneStandParamsSchema } from "@make3d/validation";
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
