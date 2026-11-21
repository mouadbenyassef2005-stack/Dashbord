import { useCallback } from "react";
import { useApp } from "@/features/AppContext";
import type { TaskResult } from "@/domain/lektion/tasks";

/** Überträgt Ergebnisse zu Buchstaben-Items in den allgemeinen Lernstand (Hauptplaner „Heute“). Simulierte Zeit wird nie übertragen. */
export function useRecordLetters() {
  const { record } = useApp();
  return useCallback(async (results: TaskResult[], activity: string) => {
    for (const r of results) {
      if (!r.itemId.startsWith("letter:")) continue;
      await record({ letterId: r.itemId.split(":")[1], skill: "visual", activity, grade: r.grade, evidence: r.type === "type" ? "recall" : "recognition" });
    }
  }, [record]);
}
