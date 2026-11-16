import { describe, expect, it } from "vitest";
import { surahPage } from "@/content/mushaf";
import { skeleton, similarity, firstDifference } from "@/lib/live/normalize";
import { ReadingTracker, type Hypothesis } from "@/lib/live/tracker";

const page = surahPage(85)!;
const mk = () => new ReadingTracker(page.flat.map((w) => ({ skel: w.skel, optional: w.optional })));
const H = (text: string, confidence = 0.9): Hypothesis[] => [{ text, confidence }];
const idx = (verse: number, pos: number) => page.flat.findIndex((w) => w.verse === verse && w.pos === pos && !w.optional);
const states = (t: ReadingTracker, verse: number) => page.verses[verse - 1].words.map((w) => t.results[idx(verse, w.pos)].state);

describe("Normalisierung", () => {
  it("entfernt Harakat, vereinheitlicht Hamza/Alif und streicht Alif", () => {
    expect(skeleton("وَٱلسَّمَآءِ")).toBe(skeleton("والسماء"));
    expect(skeleton("ٱلرَّحۡمَٰنِ")).toBe(skeleton("الرحمن"));
    expect(skeleton("ٱلۡعَٰلَمِينَ")).toBe(skeleton("العالمين"));
  });
  it("Ähnlichkeit und Buchstaben-Unterschied", () => {
    expect(similarity("بروج", "بروج")).toBe(1);
    expect(similarity("بروج", "نجوم")).toBeLessThan(0.5);
    expect(firstDifference("ثمود", "تمود")).toEqual({ expected: "ث", heard: "ت" });
  });
});

describe("Live-Verfolgung Sure 85", () => {
  it("Sure hat 22 Ayat und vollständigen Text mit Harakat", () => {
    expect(page.verses.length).toBe(22);
    const v1 = page.verses[0].words.map((w) => w.text).join(" ");
    expect(skeleton(v1)).toBe(skeleton("والسماء ذات البروج"));
    expect(v1).toContain("\u064E"); // Fatha
    expect(v1).toContain("\u06E1"); // Sukun (Mushaf-Form)
    expect(v1).toContain("\u0651"); // Shadda
    expect(page.basmala.length).toBe(4);
  });

  it("richtig gelesene Wörter bleiben unmarkiert (ok), nichts ist falsch", () => {
    const t = mk();
    t.beginSession();
    t.update(H("والسماء ذات البروج"), true);
    t.update(H("والسماء ذات البروج واليوم الموعود"), true);
    expect(states(t, 1)).toEqual(["ok", "ok", "ok"]);
    expect(states(t, 2)).toEqual(["ok", "ok"]);
    expect(t.summary().wrong).toBe(0);
  });

  it("Basmala ist optional: mit und ohne Basmala funktioniert das Verfolgen", () => {
    const a = mk(); a.beginSession(); a.update(H("بسم الله الرحمن الرحيم والسماء ذات البروج"), true);
    expect(states(a, 1)).toEqual(["ok", "ok", "ok"]);
    const b = mk(); b.beginSession(); b.update(H("والسماء ذات البروج"), true);
    expect(states(b, 1)).toEqual(["ok", "ok", "ok"]);
  });

  it("falsch gelesenes Wort wird erst rot, wenn der Nutzer weitergelesen hat – nicht vorschnell", () => {
    const t = mk(); t.beginSession();
    // Zwischenergebnis: falsches Wort ist das letzte Token → noch nicht rot
    t.update(H("والسماء ذات النجوم", 0), false);
    expect(states(t, 1)[2]).not.toBe("wrong");
    // Nutzer liest weiter → jetzt abgeschlossen → falsch
    t.update(H("والسماء ذات النجوم واليوم", 0), false);
    expect(states(t, 1)).toEqual(["ok", "ok", "wrong"]);
    expect(t.results[idx(1, 3)].heard).toBe(skeleton("النجوم"));
  });

  it("Wort nicht rot bei niedriger Erkennungssicherheit oder Ähnlichkeit im Graubereich", () => {
    const low = mk(); low.beginSession();
    low.update(H("والسماء ذات النجوم واليوم الموعود", 0.2), true);
    expect(states(low, 1)[2]).toBe("uncertain");
    const near = mk(); near.beginSession();
    near.update(H("والسماء ذات البروح واليوم الموعود"), true); // 1 Buchstabe daneben → Graubereich/ok, nie rot
    expect(states(near, 1)[2]).not.toBe("wrong");
  });

  it("niedrige Sicherheit betrifft nur das eigene Ergebnis, nicht früher bestätigte Wörter", () => {
    const t = mk(); t.beginSession();
    t.update([{ text: "والسماء ذات النجوم واليوم الموعود", confidence: 0.2, parts: [{ text: "والسماء ذات النجوم", confidence: 0.9 }, { text: "واليوم الموعود", confidence: 0.2 }] }], true);
    expect(states(t, 1)[2]).toBe("wrong"); // sicher erkannt → falsch
    expect(states(t, 2)).toEqual(["ok", "ok"]);
  });

  it("n-best: eine Alternative mit dem richtigen Wort verhindert rot", () => {
    const t = mk(); t.beginSession();
    t.update([{ text: "والسماء ذات النجوم واليوم", confidence: 0.8 }, { text: "والسماء ذات البروج واليوم", confidence: 0.6 }], true);
    expect(states(t, 1)[2]).toBe("ok");
  });

  it("ausgelassene Wörter: erst nach zwei sicheren späteren Wörtern", () => {
    const t = mk(); t.beginSession();
    t.update(H("والسماء البروج"), false); // „ذات“ fehlt, aber noch zu wenig Beleg
    expect(states(t, 1)[1]).not.toBe("skipped");
    t.update(H("والسماء البروج واليوم الموعود وشاهد"), true);
    expect(states(t, 1)[1]).toBe("skipped");
    expect(states(t, 1)[0]).toBe("ok");
    expect(states(t, 1)[2]).toBe("ok");
  });

  it("langsames Lesen mit Pausen: gesprochene Teile werden fortgeschrieben, Rest bleibt neutral", () => {
    const t = mk(); t.beginSession();
    t.update(H("والسماء", 0), false);
    expect(t.results[idx(1, 1)].state).toBe("ok");
    expect(states(t, 1).slice(1)).toEqual(["pending", "pending"]);
    // lange Pause: Erkennung startet neu (neue Sitzung) – es geht ab dem Cursor weiter
    t.beginSession();
    t.update(H("ذات البروج"), true);
    expect(states(t, 1)).toEqual(["ok", "ok", "ok"]);
    expect(t.cursor).toBeGreaterThan(idx(1, 3));
  });

  it("ASR trennt oder verbindet Wörter anders (Merge)", () => {
    const t = mk(); t.beginSession();
    t.update(H("و السماء ذات ال بروج واليوم"), true); // „وَٱلسَّمَآءِ“ in 2 Teile, „ٱلۡبُرُوجِ“ in 2 Teile
    expect(states(t, 1)).toEqual(["ok", "ok", "ok"]);
    const u = mk(); u.beginSession();
    u.update(H("والسماءذات البروج"), true); // zwei Wörter zusammengeschrieben
    expect(states(u, 1)).toEqual(["ok", "ok", "ok"]);
  });

  it("Einstieg mitten in der Sure per Cursor", () => {
    const t = mk();
    t.setCursor(idx(4, 1));
    t.update(H("قتل أصحاب الأخدود"), true);
    expect(states(t, 4)).toEqual(["ok", "ok", "ok"]);
    expect(states(t, 1)).toEqual(["pending", "pending", "pending"]);
  });

  it("zusammenfassen und zurücksetzen", () => {
    const t = mk(); t.beginSession();
    t.update(H("والسماء ذات النجوم واليوم الموعود"), true);
    const s = t.summary();
    expect(s.total).toBe(109);
    expect(s.wrong).toBe(1);
    expect(s.ok).toBe(4);
    t.reset();
    expect(t.summary().ok).toBe(0);
  });
});
