import { align, type ExpectedWord } from "./align";
import { tokens } from "./normalize";

export type WordState = "pending" | "ok" | "wrong" | "skipped" | "uncertain";

export interface WordResult {
  state: WordState;
  /** beste Übereinstimmung (0..1) aus der Spracherkennung */
  sim: number;
  /** was die Erkennung gehört hat (Konsonantengerüst) */
  heard?: string;
}

export interface Hypothesis {
  text: string;
  /** 0..1 des letzten Ergebnisses, 0 = unbekannt (Zwischenergebnisse haben oft 0) */
  confidence: number;
  /** Aufteilung des Transkripts in Ergebnisse mit je eigener Erkennungssicherheit */
  parts?: { text: string; confidence: number }[];
}

export interface TrackerOptions {
  /** ab dieser Ähnlichkeit gilt ein Wort als richtig */
  okThreshold: number;
  /** höchstens bis zu dieser Ähnlichkeit kommt ein Wort als „falsch“ in Frage; dazwischen: unsicher */
  badThreshold: number;
  /** Erkennungssicherheit, unter der „falsch“ nur als „unsicher“ gezeigt wird */
  minConfidence: number;
  /** so viele spätere richtige Wörter braucht es, um ein Wort als „ausgelassen“ zu werten */
  skipEvidence: number;
}

export const DEFAULT_OPTIONS: TrackerOptions = { okThreshold: 0.72, badThreshold: 0.45, minConfidence: 0.35, skipEvidence: 2 };

/**
 * Verfolgt das Vorlesen Wort für Wort.
 *
 * Konservativ gegen Fehlalarme (Nutzer-Vorgabe: bei Unsicherheit nicht vorschnell rot):
 *  - „falsch“ nur, wenn über ALLE n-best-Alternativen keine ausreichende Ähnlichkeit besteht,
 *  - das Wort „abgeschlossen“ ist (Nutzer hat ein späteres Wort gesprochen oder das Ergebnis ist final),
 *  - die Erkennungssicherheit nicht auffällig niedrig ist.
 * Langsames Lesen/Pausen lösen nichts aus: nicht gesprochene Wörter bleiben „pending“.
 */
export class ReadingTracker {
  readonly words: ExpectedWord[];
  private committed: WordResult[];
  private live: WordResult[];
  private sessionStart = 0;
  private cursorValue = 0;
  readonly opts: TrackerOptions;

  constructor(words: ExpectedWord[], opts: Partial<TrackerOptions> = {}) {
    this.words = words;
    this.opts = { ...DEFAULT_OPTIONS, ...opts };
    this.committed = words.map(() => ({ state: "pending", sim: 0 }));
    this.live = this.committed;
    this.cursorValue = this.firstReal();
  }

  private firstReal() {
    const i = this.words.findIndex((w) => !w.optional);
    return i < 0 ? 0 : 0 * i; // Cursor beginnt bei 0 (optionale Präfix-Wörter werden sichtbar übersprungen)
  }

  get results(): WordResult[] {
    return this.words.map((_, j) => (this.live[j].state !== "pending" ? this.live[j] : this.committed[j]));
  }

  /** Index des nächsten zu lesenden Worts */
  get cursor(): number {
    return this.cursorValue;
  }

  /** Nutzer setzt den Einstieg selbst (Wort antippen). */
  setCursor(j: number) {
    this.beginSession();
    this.cursorValue = Math.max(0, Math.min(this.words.length - 1, j));
    this.sessionStart = this.cursorValue;
    for (let k = 0; k < this.words.length; k++) if (k < this.cursorValue && this.committed[k].state === "pending" && this.words[k].optional) this.committed[k] = { state: "pending", sim: 0 };
  }

  /** Neue Erkennungssitzung (Mikrofon neu gestartet): bisherige Ergebnisse festschreiben, ab Cursor weiter. */
  beginSession() {
    this.committed = this.results.map((r) => ({ ...r }));
    this.live = this.words.map(() => ({ state: "pending", sim: 0 }));
    this.sessionStart = this.cursorValue;
  }

  reset() {
    this.committed = this.words.map(() => ({ state: "pending", sim: 0 }));
    this.live = this.committed;
    this.sessionStart = 0;
    this.cursorValue = 0;
  }

  /**
   * @param hyps  n-best Hypothesen des KOMPLETTEN Transkripts der laufenden Sitzung (beste zuerst)
   * @param isFinal  ob das letzte Ergebnis abgeschlossen ist
   */
  update(hyps: Hypothesis[], isFinal: boolean): WordResult[] {
    const { okThreshold, badThreshold, minConfidence, skipEvidence } = this.opts;
    const list = hyps.filter((h) => h.text.trim());
    const live: WordResult[] = this.words.map(() => ({ state: "pending", sim: 0 }));
    if (!list.length) { this.live = live; return this.results; }

    // Alignment je Hypothese
    const aligned = list.map((h) => ({ h, toks: tokens(h.text), al: null as ReturnType<typeof align> | null }));
    for (const a of aligned) a.al = align(a.toks, this.words, this.sessionStart);

    const top = aligned[0];
    const topPairs = new Map<number, { sim: number; heard: string; i: number; spokenEnd: number }>();
    for (const p of top.al!.pairs) for (let c = 0; c < p.covers; c++) topPairs.set(p.j + c, { sim: p.sim, heard: p.heard, i: p.i, spokenEnd: p.i + p.spoken });
    const lastTopJ = Math.max(-1, ...top.al!.pairs.map((p) => p.j + p.covers - 1));
    const lastSpokenIdx = top.toks.length - 1;
    // Erkennungssicherheit je Token (aus dem jeweiligen Ergebnis); 0 = unbekannt
    const tokConf: number[] = [];
    if (top.h.parts?.length) for (const part of top.h.parts) for (let k = 0; k < tokens(part.text).length; k++) tokConf.push(part.confidence);
    const confAt = (i: number) => (tokConf.length ? tokConf[i] ?? 0 : top.h.confidence);

    for (let j = this.sessionStart; j < this.words.length; j++) {
      // beste Ähnlichkeit über alle Hypothesen, in denen das Wort zugeordnet wurde
      let best = -1;
      let heard: string | undefined;
      for (const a of aligned) {
        for (const p of a.al!.pairs) {
          if (j >= p.j && j < p.j + p.covers && p.sim > best) { best = p.sim; heard = p.heard; }
        }
      }
      if (best < 0) continue;
      const t = topPairs.get(j);
      // „abgeschlossen“: ein späteres Wort wurde zugeordnet ODER das Token ist nicht das letzte im Strom ODER Ergebnis final
      const settled = isFinal || j < lastTopJ || (t !== undefined && t.spokenEnd - 1 < lastSpokenIdx);
      if (best >= okThreshold) live[j] = { state: "ok", sim: best, heard };
      else if (!settled) live[j] = { state: "pending", sim: best, heard };
      else if (best <= badThreshold && !(t && confAt(t.i) > 0 && confAt(t.i) < minConfidence)) live[j] = { state: "wrong", sim: best, heard };
      else live[j] = { state: "uncertain", sim: best, heard };
    }

    // Ausgelassen: nicht zugeordnet, aber ≥ skipEvidence spätere Wörter sicher richtig
    for (let j = this.sessionStart; j < this.words.length; j++) {
      if (live[j].state !== "pending" || live[j].sim > 0) continue;
      const later = live.slice(j + 1).filter((r) => r.state === "ok").length;
      if (this.words[j].optional) continue;
      if (later >= skipEvidence && j < lastTopJ) live[j] = { state: "skipped", sim: 0 };
    }

    this.live = live;
    let c = this.sessionStart;
    for (let j = this.sessionStart; j < this.words.length; j++) if (live[j].state !== "pending" || live[j].sim > 0 || (this.words[j].optional && j < lastTopJ)) c = j + 1;
    this.cursorValue = Math.max(this.cursorValue, c);
    return this.results;
  }

  summary() {
    const r = this.results;
    const real = this.words.map((w, j) => ({ w, r: r[j] })).filter((x) => !x.w.optional);
    const count = (s: WordState) => real.filter((x) => x.r.state === s).length;
    return { total: real.length, ok: count("ok"), wrong: count("wrong"), skipped: count("skipped"), uncertain: count("uncertain"), pending: count("pending") };
  }
}
