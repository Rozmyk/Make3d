import type { GeneratedModel, MeshData, ModelMetadata, OrganizerParams } from "@make3d/types";
import { organizerParamsSchema } from "@make3d/validation";
import createManifold, { type ManifoldToplevel } from "manifold-3d";

const CAVITY_TOP_OVERLAP_MM = 0.02;

export class GeometryGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeometryGenerationError";
  }
}

let manifoldPromise: Promise<ManifoldToplevel> | undefined;

async function getManifold(): Promise<ManifoldToplevel> {
  manifoldPromise ??= createManifold().then((module) => {
    module.setup();
    return module;
  });
  return manifoldPromise;
}

function circularSegments(radius: number): number {
  if (radius <= 0) return 4;
  const angle = 2 * Math.acos(Math.max(-1, 1 - 0.1 / radius));
  return Math.max(8, Math.min(64, Math.ceil((2 * Math.PI) / angle / 4) * 4));
}

function roundedRectangle(module: ManifoldToplevel, width: number, depth: number, radius: number) {
  if (radius <= 0) return module.CrossSection.square([width, depth], true);
  const points: [number, number][] = [];
  const segmentsPerCorner = circularSegments(radius) / 4;
  const centers: [number, number, number][] = [
    [width / 2 - radius, depth / 2 - radius, 0],
    [-width / 2 + radius, depth / 2 - radius, Math.PI / 2],
    [-width / 2 + radius, -depth / 2 + radius, Math.PI],
    [width / 2 - radius, -depth / 2 + radius, Math.PI * 1.5],
  ];
  for (const [x, y, startAngle] of centers) {
    for (let step = 0; step <= segmentsPerCorner; step += 1) {
      const angle = startAngle + (step / segmentsPerCorner) * (Math.PI / 2);
      points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
    }
  }
  return new module.CrossSection(points);
}

function makePrism(module: ManifoldToplevel, width: number, depth: number, height: number, radius: number, zOffset = 0) {
  const profile = roundedRectangle(module, width, depth, radius);
  try {
    const prism = profile.extrude(height);
    return zOffset === 0 ? prism : prism.translate([0, 0, zOffset]);
  } finally {
    profile.delete();
  }
}

type Solid = ReturnType<ManifoldToplevel["Manifold"]["cube"]>;

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

function metadataFrom(manifold: Solid, mesh: MeshData, params: OrganizerParams): ModelMetadata {
  const bounds = manifold.boundingBox();
  return {
    boundingBox: { width: bounds.max[0] - bounds.min[0], depth: bounds.max[1] - bounds.min[1], height: bounds.max[2] - bounds.min[2] },
    volumeMm3: Math.abs(manifold.volume()),
    triangleCount: mesh.indices.length / 3,
    compartmentCount: params.columns * params.rows,
    printability: { valid: true, messages: [] },
  };
}

export async function createOrganizer(input: unknown): Promise<GeneratedModel> {
  const params = organizerParamsSchema.parse(input);
  const module = await getManifold();
  const outer = makePrism(module, params.width, params.depth, params.height, params.cornerRadius);
  const cavities: Solid[] = [];
  const cutouts: Solid[] = [];
  const additions: Solid[] = [];
  try {
    const innerWidth = params.width - 2 * params.wallThickness;
    const innerDepth = params.depth - 2 * params.wallThickness;
    const compartmentWidth = (innerWidth - (params.columns - 1) * params.dividerThickness) / params.columns;
    const compartmentDepth = (innerDepth - (params.rows - 1) * params.dividerThickness) / params.rows;
    const cavityRadius = params.roundedInside ? Math.min(params.cornerRadius, compartmentWidth / 2 - 0.01, compartmentDepth / 2 - 0.01) : 0;
    for (let row = 0; row < params.rows; row += 1) {
      for (let column = 0; column < params.columns; column += 1) {
        const x = -params.width / 2 + params.wallThickness + compartmentWidth / 2 + column * (compartmentWidth + params.dividerThickness);
        const y = -params.depth / 2 + params.wallThickness + compartmentDepth / 2 + row * (compartmentDepth + params.dividerThickness);
        const cavity = makePrism(module, compartmentWidth, compartmentDepth, params.height - params.bottomThickness + CAVITY_TOP_OVERLAP_MM, Math.max(0, cavityRadius), params.bottomThickness).translate([x, y, 0]);
        cavities.push(cavity);
      }
    }
    if (params.floorHoles) {
      const holeRadius = Math.min(2.4, Math.max(1.2, params.wallThickness * 0.72));
      const inset = Math.max(params.wallThickness + holeRadius + 2, 8);
      const holes: [number, number][] = [
        [-params.width / 2 + inset, -params.depth / 2 + inset],
        [-params.width / 2 + inset, params.depth / 2 - inset],
        [params.width / 2 - inset, -params.depth / 2 + inset],
        [params.width / 2 - inset, params.depth / 2 - inset],
      ];
      holes.forEach(([x, y]) => cutouts.push(module.Manifold.cylinder(params.bottomThickness + 0.04, holeRadius, holeRadius, 20).translate([x, y, -0.02])));
    }

    if (params.stackingLip) {
      const lipHeight = Math.min(2.4, Math.max(1.2, params.wallThickness));
      const lipOffset = Math.max(0.8, params.wallThickness * 0.45);
      const lipOuter = makePrism(module, params.width + lipOffset * 2, params.depth + lipOffset * 2, lipHeight, params.cornerRadius + lipOffset, params.height);
      const lipInner = makePrism(module, params.width, params.depth, lipHeight + 0.04, params.cornerRadius, params.height - 0.02);
      try {
        additions.push(module.Manifold.difference([lipOuter, lipInner]));
      } finally {
        lipOuter.delete();
        lipInner.delete();
      }
    }

    if (params.labelTab) {
      additions.push(makePrism(module, Math.min(32, params.width * 0.32), Math.max(1.6, params.wallThickness), Math.min(18, params.height * 0.5), 1.2, params.height - Math.min(18, params.height * 0.5) / 2).translate([0, -params.depth / 2 - params.wallThickness / 2, 0]));
    }

    const result = module.Manifold.difference([outer, ...cavities, ...cutouts]);
    try {
      const finalModel = additions.length ? module.Manifold.union([result, ...additions]) : result;
      try {
      if (finalModel.status() !== "NoError") throw new GeometryGenerationError(`Manifold failed: ${finalModel.status()}`);
      const mesh = meshFromManifold(finalModel);
      if (mesh.indices.length === 0 || mesh.positions.some((value) => !Number.isFinite(value))) throw new GeometryGenerationError("Generated mesh is empty or contains invalid vertices.");
      return { mesh, metadata: metadataFrom(finalModel, mesh, params) };
      } finally {
        if (finalModel !== result) finalModel.delete();
      }
    } finally {
      result.delete();
    }
  } finally {
    outer.delete();
    cavities.forEach((cavity) => cavity.delete());
    cutouts.forEach((cutout) => cutout.delete());
    additions.forEach((addition) => addition.delete());
  }
}
