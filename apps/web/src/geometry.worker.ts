import { createOrganizer } from "@make3d/geometry/organizer";
import type { OrganizerParams } from "@make3d/types";

type Request = { id: number; params: OrganizerParams };

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

workerScope.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    const model = await createOrganizer(data.params);
    workerScope.postMessage({ id: data.id, model }, [model.mesh.positions.buffer, model.mesh.indices.buffer]);
  } catch (error) {
    workerScope.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Geometry generation failed." });
  }
};
