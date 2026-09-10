import { createOrganizer } from "@make3d/geometry/organizer";
import { createCableClip, createCableDeskOrganizer, createCableGuide, createPegboardShelf, createPhoneStand, createStorageBox, createUnderDeskHolder } from "@make3d/geometry/basic";
import type { CableClipParams, CableDeskOrganizerParams, CableGuideParams, GeneratorType, OrganizerParams, PegboardShelfParams, PhoneStandParams, StorageBoxParams, UnderDeskHolderParams } from "@make3d/types";

type Request = { id: number; type: GeneratorType; params: OrganizerParams | PhoneStandParams | CableGuideParams | CableDeskOrganizerParams | PegboardShelfParams | CableClipParams | UnderDeskHolderParams | StorageBoxParams };

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
          : data.type === "cable-desk-organizer"
            ? await createCableDeskOrganizer(data.params)
            : data.type === "pegboard-shelf"
              ? await createPegboardShelf(data.params)
              : data.type === "cable-clip"
                ? await createCableClip(data.params)
                : data.type === "under-desk-holder"
                  ? await createUnderDeskHolder(data.params)
                  : await createStorageBox(data.params);
    workerScope.postMessage({ id: data.id, model }, [model.mesh.positions.buffer, model.mesh.indices.buffer]);
  } catch (error) {
    workerScope.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Geometry generation failed." });
  }
};
