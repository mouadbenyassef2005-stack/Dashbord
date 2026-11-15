"use client";
import { useProgress } from "@/lib/store";
import { LessonPlayer } from "./LessonPlayer";

export function LessonLoader({ lessonId }: { lessonId: string }) {
  const { hydrated } = useProgress();
  if (!hydrated) return <div className="grid min-h-dvh place-items-center text-muted">Lade …</div>;
  return <LessonPlayer lessonId={lessonId} />;
}
