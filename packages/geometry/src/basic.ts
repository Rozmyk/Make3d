import type { CableGuideParams, GeneratedModel, MeshData, ModelMetadata, PhoneStandParams } from "@make3d/types";
import { cableGuideParamsSchema, phoneStandParamsSchema } from "@make3d/validation";
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
