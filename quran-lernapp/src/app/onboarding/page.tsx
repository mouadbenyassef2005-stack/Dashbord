"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArabicText } from "@/components/ArabicText";
import { IconArrow } from "@/components/icons";
import { Button, Card, ProgressBar, cx } from "@/components/ui";
import { LESSON_BY_ID } from "@/content/lessons";
import { startLessonForScore, type Level } from "@/lib/progress";
import { useProgress } from "@/lib/store";

interface Q { q: string; arabic?: string; options: string[]; answer: number; arabicOptions?: boolean }
const QUESTIONS: Q[] = [
  { q: "Welcher Buchstabe ist „Dāl“ (d)?", options: ["ر", "د", "ز"], answer: 1, arabicOptions: true },
  { q: "Wie liest du diese Silbe?", arabic: "بِ", options: ["ba", "bi", "bu"], answer: 1 },
  { q: "Was bedeutet das Zeichen ۡ im Wort مِنۡ?", options: ["Der Buchstabe hat keinen Vokal", "Der Buchstabe wird verdoppelt", "Der Vokal wird lang"], answer: 0 },
  { q: "Was bewirkt das Zeichen ّ in رَبِّ?", options: ["Der Buchstabe wird verdoppelt", "Der Buchstabe verstummt", "Der Vokal wird gedehnt"], answer: 0 },
  { q: "Wie wird das erste „a“ in قَالَ gesprochen?", arabic: "قَالَ", options: ["kurz", "lang (ā)", "gar nicht"], answer: 1 },
];

const LEVELS: { id: Level; title: string; text: string }[] = [
  { id: "beginner", title: "Ganz am Anfang", text: "Ich kenne die Buchstaben (noch) nicht sicher." },
  { id: "letters", title: "Buchstaben bekannt", text: "Ich erkenne das Alphabet, aber lese keine Wörter." },
  { id: "reader", title: "Unsicher beim Lesen", text: "Ich lese schon, aber unsicher und mit Fehlern." },
];
const START_FOR: Record<Level, string> = { beginner: "A1", letters: "C1", reader: "D1" };

export default function Onboarding() {
  const router = useRouter();
  const { update, hydrated, progress } = useProgress();
  const [step, setStep] = useState<"welcome" | "test" | "level" | "goal">("welcome");
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tested, setTested] = useState(false);
  const [level, setLevel] = useState<Level>("beginner");
  const [goal, setGoal] = useState(10);

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === QUESTIONS[qi].answer) setScore((s) => s + 1);
  };
  const nextQ = () => {
    if (qi + 1 >= QUESTIONS.length) {
      setLevel(startLessonForScore(score).level);
      setTested(true);
      setStep("level");
    } else {
      setQi(qi + 1);
      setPicked(null);
    }
  };
  const skipTest = () => {
    setScore(0);
    setLevel("beginner");
    setStep("level");
  };
  const finish = () => {
    update((p) => ({ ...p, onboarded: true, level, placement: { score, total: QUESTIONS.length }, startLessonId: START_FOR[level], dailyGoal: goal }));
    router.replace("/");
  };

  // Bereits eingerichtet → direkt zur Startseite (Einstellungen setzen das Flag zurück, um neu einzustufen).
  const already = hydrated && progress.onboarded && step === "welcome";
  useEffect(() => {
    if (already) router.replace("/");
  }, [already, router]);
  if (!hydrated || already) return null;
  const rec = startLessonForScore(score).level;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-8 pt-8">
      {step === "welcome" && (
        <div className="rise flex flex-1 flex-col">
          <p className="text-lg font-semibold tracking-tight">Qaidah<span className="text-gold">.</span></p>
          <div className="mt-10 grid place-items-center rounded-3xl border border-line bg-surface py-10 shadow-card">
            <ArabicText text="اقْرَأْ" size="xl" className="text-primary" />
          </div>
          <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight">Lerne, den Quran selbstständig zu lesen.</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink/80">
            Schritt für Schritt – vom ersten Buchstaben bis zu kurzen Suren. Du hörst, sprichst nach und bekommst verständliches Feedback.
          </p>
          <ul className="mt-5 space-y-2 text-[15px] text-ink/75">
            <li>• Stage 1: Lesen lernen (Qaidah-Nuraniyyah-Stil) – jetzt verfügbar</li>
            <li>• Stage 2 &amp; 3: Tajweed – in Planung</li>
          </ul>
          <p className="mt-5 rounded-2xl bg-gold-soft p-4 text-sm text-ink/80">
            <strong>Demo-Version:</strong> Das Sprachfeedback ist simuliert. Referenzaufnahmen durch Sprecher werden noch ergänzt.
          </p>
          <div className="mt-auto space-y-2 pt-8">
            <Button className="w-full" onClick={() => setStep("test")} data-testid="to-test">Kurzer Einstufungstest <IconArrow className="size-5" /></Button>
            <Button variant="ghost" className="w-full" onClick={skipTest} data-testid="skip-test">Test überspringen – ich fange vorn an</Button>
          </div>
        </div>
      )}

      {step === "test" && (
        <div className="rise flex flex-1 flex-col">
          <div className="mb-6 flex items-center gap-3">
            <ProgressBar value={qi / QUESTIONS.length} label="Einstufungstest" className="flex-1" />
            <span className="text-sm tabular-nums text-muted">{qi + 1}/{QUESTIONS.length}</span>
          </div>
          <h1 className="text-2xl font-semibold leading-snug">{QUESTIONS[qi].q}</h1>
          {QUESTIONS[qi].arabic && <div className="mt-4 text-center"><ArabicText text={QUESTIONS[qi].arabic!} size="lg" /></div>}
          <div className={cx("mt-6 grid gap-2", QUESTIONS[qi].arabicOptions && "grid-cols-3")}>
            {QUESTIONS[qi].options.map((o, i) => {
              const right = picked !== null && i === QUESTIONS[qi].answer;
              const wrong = picked === i && i !== QUESTIONS[qi].answer;
              return (
                <button key={i} type="button" onClick={() => answer(i)} data-testid={`q-opt-${i}`} className={cx("rounded-2xl border px-4 py-3.5 text-left font-medium transition", QUESTIONS[qi].arabicOptions && "text-center", right ? "border-ok bg-ok-soft text-ok" : wrong ? "border-warn bg-warn-soft text-warn" : "border-line bg-surface hover:border-primary/50")}>
                  {QUESTIONS[qi].arabicOptions ? <ArabicText text={o} size="md" className="leading-[1.5]" /> : o}
                </button>
              );
            })}
            <button type="button" onClick={() => answer(-1)} className="rounded-2xl px-4 py-3 text-left text-sm text-muted hover:text-ink">Ich weiß es nicht</button>
          </div>
          {picked !== null && <Button className="mt-auto w-full" onClick={nextQ} data-testid="q-next">Weiter <IconArrow className="size-5" /></Button>}
        </div>
      )}

      {step === "level" && (
        <div className="rise flex flex-1 flex-col">
          <h1 className="text-2xl font-semibold">{tested ? `${score} von ${QUESTIONS.length} richtig` : "Wo möchtest du starten?"}</h1>
          <p className="mt-2 text-muted">Wähle dein Niveau. Du kannst später jederzeit zu früheren Lektionen zurückgehen.</p>
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Lernniveau">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => setLevel(l.id)} data-testid={`level-${l.id}`} className={cx("w-full rounded-3xl border p-5 text-left transition", level === l.id ? "border-primary bg-primary-soft/60" : "border-line bg-surface hover:border-primary/40")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{l.title}</span>
                  {l.id === rec && tested && <span className="text-xs font-medium text-primary">Empfohlen</span>}
                </div>
                <p className="mt-1 text-[15px] text-muted">{l.text}</p>
                <p className="mt-2 text-xs text-ink/50">Start: {LESSON_BY_ID.get(START_FOR[l.id])?.title}</p>
              </button>
            ))}
          </div>
          <Button className="mt-auto w-full" onClick={() => setStep("goal")} data-testid="level-next">Weiter <IconArrow className="size-5" /></Button>
        </div>
      )}

      {step === "goal" && (
        <div className="rise flex flex-1 flex-col">
          <h1 className="text-2xl font-semibold">Dein Tagesziel</h1>
          <p className="mt-2 text-muted">Wie viele Übungen möchtest du pro Tag schaffen? Kleine, regelmäßige Schritte wirken am besten.</p>
          <div className="mt-6 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tagesziel">
            {[{ n: 5, t: "Leicht" }, { n: 10, t: "Ausgewogen" }, { n: 20, t: "Intensiv" }].map((g) => (
              <button key={g.n} type="button" role="radio" aria-checked={goal === g.n} onClick={() => setGoal(g.n)} className={cx("rounded-3xl border p-4 text-center transition", goal === g.n ? "border-primary bg-primary-soft/60" : "border-line bg-surface")}>
                <div className="text-2xl font-semibold">{g.n}</div>
                <div className="text-xs text-muted">{g.t}</div>
              </button>
            ))}
          </div>
          <Card className="mt-6 !shadow-none">
            <p className="text-sm text-muted">Dein Lernpfad beginnt bei</p>
            <p className="mt-1 text-lg font-semibold">{LESSON_BY_ID.get(START_FOR[level])?.title}</p>
          </Card>
          <Button className="mt-auto w-full" onClick={finish} data-testid="finish">Lernpfad starten <IconArrow className="size-5" /></Button>
        </div>
      )}
    </div>
  );
}
