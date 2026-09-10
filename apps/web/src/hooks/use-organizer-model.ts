"use client";

import type { GeneratedModel, OrganizerParams } from "@make3d/types";
import { organizerParamsSchema } from "@make3d/validation";
import { useEffect, useRef, useState } from "react";

type WorkerResponse = { id: number; model?: GeneratedModel; error?: string };

export function useOrganizerModel(params: OrganizerParams) {
  const [model, setModel] = useState<GeneratedModel>();
  const [status, setStatus] = useState("Preparing geometry…");
  const [error, setError] = useState<string>();
  const worker = useRef<Worker | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    const instance = new Worker(new URL("../geometry.worker.ts", import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.id !== latestRequest.current) return;
      if (data.error) {
        setError(data.error);
        setStatus("Geometry error");
        return;
      }
      setModel(data.model);
      setError(undefined);
      setStatus("Geometry ready");
    };
    instance.onerror = (event) => {
      setError(event.message || "The geometry worker could not start.");
      setStatus("Geometry error");
    };
    return () => instance.terminate();
  }, []);

  useEffect(() => {
    const parsed = organizerParamsSchema.safeParse(params);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid parameters.");
      setStatus("Fix parameters");
      return;
    }
    setError(undefined);
    setStatus("Updating model…");
    const timeout = window.setTimeout(() => {
      const id = latestRequest.current + 1;
      latestRequest.current = id;
      worker.current?.postMessage({ id, type: "organizer", params: parsed.data });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [params]);

  return { model, status, error };
}
