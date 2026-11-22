"use client";
import { useState } from "react";
import { LESSONS, LESSON_BY_ID, LESSON_KIND_LABEL, STRECKEN, lessonsOf, type Lesson } from "@/lektion/content/path";
import { Ar } from "@/lektion/ui/parts";
import { useLesson } from "./LessonContext";
import { LessonPlayer } from "./play/LessonPlayer";

const GLYPH: Record<string, string> = { "b-alif": "ا", "b-ba": "ب", "b-ta": "ت", "b-tha": "ث", "t-fatha": "ـَ", "t-kasra": "ـِ", "t-damma": "ـُ", "k-ba": "بَ", "k-ta": "تِ", "k-tha": "ثُ" };
const SYMBOL: Record<string, string> = { entdecken: "?", erklaeren: "!", anwenden: "→", wiederholung: "↻", gezielt: "◎", einfuehrung: "★" };

/** Der Lernpfad: vier Strecken aus kurzen Lektionen. Die nächste Lektion ist hervorgehoben, nichts sonst konkurriert um Aufmerksamkeit. */
export function Start() {
  const { s } = useLesson();
  const [open, setOpen] = useState<Lesson | null>(null);
  const [locked, setLocked] = useState<Lesson | null>(null);
  const doneOf = (id: string) => !!s.lessons[id]?.done;
  const currentIdx = LESSONS.findIndex((l) => !doneOf(l.id));
  const current = currentIdx === -1 ? null : LESSONS[currentIdx];
  const isOpen = (idx: number) => idx === 0 || doneOf(LESSONS[idx - 1].id);
  const start = (l: Lesson) => { const idx = LESSONS.indexOf(l); if (isOpen(idx) || doneOf(l.id)) setOpen(l); else setLocked(l); };

  return (
    <div className="qd path">
      <header className="path-head">
        <h1>Arabisch lesen</h1>
        <p className="muted">{current ? <>Nächste Lektion: <b>{current.title}</b></> : "Alle Lektionen dieser ersten Strecke sind geschafft."}</p>
      </header>
      {STRECKEN.map((st) => {
        const ls = lessonsOf(st.id);
        const nDone = ls.filter((l) => doneOf(l.id)).length;
        return (
          <section key={st.id} className="path-sec" aria-labelledby={`st${st.id}`}>
            <div className="path-banner" data-active={ls.some((l) => l === current)}>
              <div><p className="lp-eyebrow">Strecke {st.id}</p><h2 id={`st${st.id}`}>{st.title}</h2><p>{st.goal}</p></div>
              <span className="path-count" aria-label={`${nDone} von ${ls.length} Lektionen geschafft`}>{nDone}/{ls.length}</span>
            </div>
            <ol className="path-list">
              {ls.map((l, i) => {
                const idx = LESSONS.indexOf(l);
                const done = doneOf(l.id), cur = l === current, lock = !done && !isOpen(idx);
                const g = GLYPH[l.id];
                const rec = s.lessons[l.id];
                return (
                  <li key={l.id} className="path-item" data-off={i % 4}>
                    <button className="node" data-state={done ? "done" : cur ? "current" : lock ? "locked" : "open"} onClick={() => start(l)}
                      aria-label={`${l.title}, ${l.sub}, etwa ${l.minutes} Minuten, ${done ? "geschafft" : cur ? "als Nächstes" : lock ? "noch gesperrt" : "offen"}`}>
                      {cur && <span className="node-flag" aria-hidden>Start</span>}
                      <span className="node-face" aria-hidden>{g ? <Ar size="body">{g}</Ar> : SYMBOL[l.kind]}</span>
                      {done && <span className="node-check" aria-hidden>✓</span>}
                      {lock && <span className="node-lock" aria-hidden>🔒</span>}
                    </button>
                    <div className="node-label"><b>{l.title}</b><span>{LESSON_KIND_LABEL[l.kind]} · ca. {l.minutes} Min.{done && rec ? ` · ${rec.first}/${rec.total} gleich richtig` : ""}</span></div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <p className="muted path-foot">Wörter, lange Vokale und Verbindungen folgen in einer späteren Strecke.</p>

      {open && <LessonPlayer key={open.id} id={open.id} title={open.title} lesson={open} src={open.id} onClose={() => setOpen(null)} />}
      {locked && (
        <div className="qd lp-sheet" role="alertdialog" aria-label="Lektion noch gesperrt">
          <div className="lp-sheet-card">
            <h3>Noch gesperrt</h3>
            <p className="muted">Schließe zuerst <b>{LESSON_BY_ID.get(LESSONS[Math.max(0, LESSONS.indexOf(locked) - 1)].id)!.title}</b> ab. So baut alles aufeinander auf.</p>
            <button className="btn-big" onClick={() => { if (current) setOpen(current); setLocked(null); }}>Zur nächsten Lektion</button>
            <button className="btn-big btn-ghost" onClick={() => { setOpen(locked); setLocked(null); }}>Trotzdem öffnen</button>
            <button className="btn-big btn-ghost" onClick={() => setLocked(null)}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
