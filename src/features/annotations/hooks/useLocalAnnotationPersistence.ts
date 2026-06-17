"use client";

import { useEffect, useRef, useState } from "react";

import type { AnnotationStrokesByPage } from "../types/annotation";
import {
  readLocalAnnotationStore,
  writeLocalAnnotationStore,
} from "../services/localAnnotationStorage";

export function useLocalAnnotationPersistence(pdfId: string) {
  const [strokesByPage, setStrokesByPage] = useState<AnnotationStrokesByPage>(
    {},
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const hydratedPdfIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void Promise.resolve().then(() => {
      if (isCancelled) {
        return;
      }

      const savedStore = readLocalAnnotationStore(window.localStorage, pdfId);

      setStrokesByPage(savedStore?.pages ?? {});
      hydratedPdfIdRef.current = pdfId;
      setIsHydrated(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfId]);

  useEffect(() => {
    if (!isHydrated || hydratedPdfIdRef.current !== pdfId) {
      return;
    }

    writeLocalAnnotationStore(window.localStorage, pdfId, strokesByPage);
  }, [isHydrated, pdfId, strokesByPage]);

  return {
    isHydrated,
    setStrokesByPage,
    strokesByPage,
  };
}
