"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LETTERS } from "@/content/letters";
import { knownLetters } from "@/lib/adaptive";
import { closeMismatch, createDeck, flip, isMismatch, isWon, newGame, type MemoryMode } from "@/lib/memory";
import { awardPass, recordAttempt } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { Button, Card, cx } from "../ui";

const PAIRS = 6;

export function MemoryGame() {
  const { progress: p, update } = useProgress();
  const [mode, setMode] = useState<MemoryMode>("name");
  const [round, setRound] = useState(0);
  const pool = useMemo(() => {
    const known = knownLetters(p);
    const base = LETTERS.map((l) => l.ch).filter((c) => c !== "ا" && known.has(c));
    // schwächere Buchstaben (Fehlerstellen) zuerst, Rest zufällig
    const weak = Object.entries(p.errors).sort((a, b) => b[1] - a[1]).map(([k]) => k).filter((k) => base.includes(k));
    const rest = base.filter((c) => !weak.includes(c));
    const fill = LETTERS.map((l) => l.ch).filter((c) => c !== "ا" && !base.includes(c));
    return [...weak, ...rest, ...fill];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);
  const letters = useMemo(() => {
    const head = pool.slice(0, 10);
    // mischen deterministisch pro Runde
    const arr = [...head];
    let seed = round * 7919 + 13;
    for (let i = arr.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; const j = seed % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.slice(0, PAIRS);
  }, [pool, round]);
  const [game, setGame] = useState(() => newGame(createDeck(letters, mode, 1)));
  const recorded = useRef(false);

  const reset = (m: MemoryMode = mode) => { setMode(m); setRound((r) => r + 1); };
  useEffect(() => { setGame(newGame(createDeck(letters, mode, round + 1))); recorded.current = false; }, [letters, mode, round]);

  // Fehlgriff nach kurzer Zeit wieder umdrehen
  useEffect(() => {
    if (!isMismatch(game)) return;
    const t = setTimeout(() => setGame((g) => closeMismatch(g)), 1000);
    return () => clearTimeout(t);
  }, [game]);

  const won = isWon(game);
  useEffect(() => {
    if (!won || recorded.current) return;
    recorded.current = true;
    update((pr) => {
      let n = pr;
      for (const ch of game.cards.map((c) => c.key).filter((k, i, a) => a.indexOf(k) === i)) {
        const clean = game.clean.includes(ch);
        n = recordAttempt(n, `l:${ch}`, clean, clean ? [] : [ch], Date.now(), "quiz");
        if (clean) n = awardPass(n, true, false);
      }
      return n;
    });
  }, [won, game, update]);

  const accuracy = game.moves ? Math.round((PAIRS / game.moves) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Memory-Variante">
        {([["name", "Buchstabe ↔ Name"], ["form", "Buchstabe ↔ Form"]] as const).map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => reset(m)} data-testid={`mem-${m}`} className={cx("rounded-full px-4 py-2 text-sm font-medium", mode === m ? "bg-primary text-white" : "border border-line bg-surface text-ink/70")}>{label}</button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted">{mode === "name" ? "Finde zu jedem Buchstaben seinen Namen." : "Finde zu jedem Buchstaben seine Form am Wortende (bzw. Wortanfang)."} Deine schwächeren Buchstaben kommen bevorzugt dran. Zeit spielt keine Rolle.</p>
      <div className="grid grid-cols-4 gap-2.5" data-testid="memory-grid">
        {game.cards.map((c, i) => {
          const up = game.open.includes(i) || game.matched.includes(c.key);
          const done = game.matched.includes(c.key);
          return (
            <button key={c.id} type="button" onClick={() => setGame((g) => flip(g, i))} aria-label={up ? c.face : "verdeckte Karte"} aria-pressed={up} data-testid={`card-${i}`} data-key={c.key}
              className={cx("grid aspect-square place-items-center rounded-2xl border text-center transition", up ? (done ? "border-ok bg-ok-soft" : "border-primary bg-surface") : "border-primary-strong bg-primary text-white/70 hover:bg-primary-strong")}>
              {up ? (c.arabic ? <span dir="rtl" lang="ar" className="arabic text-4xl leading-none">{c.face}</span> : <span className="text-sm font-semibold">{c.face}</span>) : <span className="text-2xl">?</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-muted">Züge: {game.moves} · Paare: {game.matched.length}/{PAIRS}</p>
      {won && (
        <Card className="rise mt-5 text-center" data-testid="memory-won">
          <h2 className="text-xl font-semibold">Geschafft!</h2>
          <p className="mt-1 text-[15px] text-ink/80">{game.moves} Züge ({accuracy} % Treffsicherheit). {game.missed.length ? `Zum Üben vorgemerkt: ${game.missed.join(" ")}` : "Kein einziger Fehlgriff."}</p>
          <Button className="mt-4" onClick={() => reset()} data-testid="memory-again">Neue Runde</Button>
        </Card>
      )}
    </div>
  );
}
