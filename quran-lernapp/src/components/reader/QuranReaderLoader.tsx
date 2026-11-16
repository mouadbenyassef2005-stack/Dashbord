"use client";
import { useProgress } from "@/lib/store";
import { QuranReader } from "./QuranReader";

export function QuranReaderLoader({ surahId }: { surahId: number }) {
  const { hydrated } = useProgress();
  if (!hydrated) return <div className="grid min-h-dvh place-items-center text-muted">Lade …</div>;
  return <QuranReader surahId={surahId} />;
}
