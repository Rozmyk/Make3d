import { createOrganizer } from "@make3d/geometry/organizer";
import { createCableDeskOrganizer, createCableGuide, createPhoneStand } from "@make3d/geometry/basic";
import type { CableDeskOrganizerParams, CableGuideParams, GeneratorType, OrganizerParams, PhoneStandParams } from "@make3d/types";

type Request = { id: number; type: GeneratorType; params: OrganizerParams | PhoneStandParams | CableGuideParams | CableDeskOrganizerParams };

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

workerScope.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    const model = data.type === "organizer"
      ? await createOrganizer(data.params)
      : data.type === "phone-stand"
        ? await createPhoneStand(data.params)
        : data.type === "cable-guide"
          ? await createCableGuide(data.params)
          : await createCableDeskOrganizer(data.params);
    workerScope.postMessage({ id: data.id, model }, [model.mesh.positions.buffer, model.mesh.indices.buffer]);
  } catch (error) {
    workerScope.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Geometry generation failed." });
  }
};
