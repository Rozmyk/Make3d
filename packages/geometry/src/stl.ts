import type { MeshData } from "@make3d/types";

function normalForTriangle(positions: Float32Array, a: number, b: number, c: number) {
  const ax = positions[a * 3]; const ay = positions[a * 3 + 1]; const az = positions[a * 3 + 2];
  const bx = positions[b * 3]; const by = positions[b * 3 + 1]; const bz = positions[b * 3 + 2];
  const cx = positions[c * 3]; const cy = positions[c * 3 + 1]; const cz = positions[c * 3 + 2];
  const ux = bx - ax; const uy = by - ay; const uz = bz - az;
  const vx = cx - ax; const vy = cy - ay; const vz = cz - az;
  const nx = uy * vz - uz * vy; const ny = uz * vx - ux * vz; const nz = ux * vy - uy * vx;
  const length = Math.hypot(nx, ny, nz) || 1;
  return [nx / length, ny / length, nz / length] as const;
}

export function exportBinaryStl(mesh: MeshData, header = "Make3D Organizer"): ArrayBuffer {
  const triangleCount = mesh.indices.length / 3;
  const buffer = new ArrayBuffer(84 + triangleCount * 50);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  new TextEncoder().encodeInto(header.slice(0, 80), bytes);
  view.setUint32(80, triangleCount, true);
  let offset = 84;
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = mesh.indices[triangle * 3]; const b = mesh.indices[triangle * 3 + 1]; const c = mesh.indices[triangle * 3 + 2];
    for (const value of normalForTriangle(mesh.positions, a, b, c)) { view.setFloat32(offset, value, true); offset += 4; }
    for (const index of [a, b, c]) for (let axis = 0; axis < 3; axis += 1) { view.setFloat32(offset, mesh.positions[index * 3 + axis], true); offset += 4; }
    view.setUint16(offset, 0, true); offset += 2;
  }
  return buffer;
}
