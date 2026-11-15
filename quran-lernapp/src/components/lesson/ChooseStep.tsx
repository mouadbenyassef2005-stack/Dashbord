"use client";
import { useState } from "react";
import type { ChooseItem } from "@/content/types";
import { ArabicText } from "../ArabicText";
import { IconArrow, IconCheck } from "../icons";
import { Button, cx } from "../ui";

interface Props {
  item: ChooseItem;
  onAttempt: (passed: boolean) => void;
  onPass: () => void;
  onDefer: () => void;
  canDefer: boolean;
}

export function ChooseStep({ item, onAttempt, onPass, onDefer, canDefer }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === item.answer;

  const pick = (i: number) => {
    if (picked !== null && correct) return;
    setPicked(i);
    onAttempt(i === item.answer);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid flex-1 place-items-center rounded-3xl border border-line bg-surface px-5 py-8 text-center shadow-card">
        <div>
          <p className="text-xl font-medium sm:text-2xl">{item.question}</p>
          {item.arabic && <div className="mt-3"><ArabicText text={item.arabic} size="lg" /></div>}
        </div>
      </div>
      <div className={cx("mt-5 grid gap-2", item.optionsArabic ? "grid-cols-3" : "grid-cols-1")} role="group" aria-label="Antworten">
        {item.options.map((o, i) => {
          const state = picked === null ? "idle" : i === item.answer && (picked === i || correct) ? "right" : picked === i ? "wrong" : "idle";
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              data-testid={`opt-${i}`}
              className={cx(
                "rounded-2xl border px-4 py-3 text-left font-medium transition",
                item.optionsArabic && "text-center",
                state === "idle" && "border-line bg-surface hover:border-primary/50",
                state === "right" && "border-ok bg-ok-soft text-ok",
                state === "wrong" && "border-warn bg-warn-soft text-warn",
              )}
            >
              {item.optionsArabic ? <ArabicText text={o} size="md" className="leading-[1.6]" /> : o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="rise mt-4" aria-live="polite">
          <p className={cx("flex items-start gap-2 text-[15px]", correct ? "text-ok" : "text-warn")}>
            {correct ? <IconCheck className="mt-0.5 size-5 shrink-0" /> : null}
            <span>{correct ? "Richtig. " : "Nicht ganz. "}<span className="text-ink/75">{item.explanation}</span></span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {correct ? (
              <Button className="col-span-2" onClick={onPass} data-testid="next">Weiter <IconArrow className="size-5" /></Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setPicked(null)}>Nochmal versuchen</Button>
                <Button variant="soft" onClick={onDefer} disabled={!canDefer}>Später wiederholen</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
