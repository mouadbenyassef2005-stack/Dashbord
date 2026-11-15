import type { ChooseItem, Lesson, LessonItem, ReadItem, Unit } from "./types";
import { DAMMA, FATHA, KASRA, LATIN, LETTERS, SHADDA, SUKOON, VOWEL_LATIN, formsOf, LETTER_BY_CH } from "./letters";
import { WORD_BY_ID, ayatOf, surahInfo, uniqueWordsOf } from "./quran";

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen zum Bauen von Items                                  */
/* ------------------------------------------------------------------ */

const L = (ch: string) => LETTER_BY_CH.get(ch)!;

const letterItem = (ch: string): ReadItem => ({
  id: `l:${ch}`,
  kind: "read",
  arabic: ch,
  hint: L(ch).name,
  prompt: "Lies den Buchstaben – sprich seinen Namen.",
  size: "xl",
});

/** Silbe aus Konsonant + Vokalzeichen. */
const syl = (ch: string, mark: string, extra = ""): ReadItem => ({
  id: `s:${ch}${mark}${extra}`,
  kind: "read",
  arabic: ch + mark + extra,
  hint: LATIN[ch] + (VOWEL_LATIN[mark] ?? ""),
  prompt: "Lies die Silbe.",
  size: "xl",
});

const practice = (arabic: string, hint: string, prompt = "Lies das Übungswort langsam und genau."): ReadItem => ({
  id: `p:${arabic}`,
  kind: "read",
  arabic,
  hint,
  prompt,
  size: "xl",
});

/** Ähnlich aussehende Buchstaben als Ablenker. */
const LOOKALIKES = ["بتثني", "جحخ", "دذ", "رز", "سش", "صض", "طظ", "عغ", "فق"];
function distractors(ch: string): string[] {
  const group = LOOKALIKES.find((g) => g.includes(ch));
  const pool = group ? Array.from(group).filter((c) => c !== ch) : [];
  const fill = LETTERS.map((l) => l.ch).filter((c) => c !== ch && !pool.includes(c) && c !== "ا");
  return [...pool, ...fill].slice(0, 2);
}

function recognise(ch: string, idx: number): ChooseItem {
  const opts = [ch, ...distractors(ch)];
  const rot = idx % 3;
  const rotated = opts.map((_, i) => opts[(i + rot) % 3]);
  return {
    id: `c:${ch}`,
    kind: "choose",
    question: `Welcher Buchstabe ist „${L(ch).name}“?`,
    options: rotated,
    optionsArabic: true,
    answer: rotated.indexOf(ch),
    explanation: `${L(ch).name} (${ch}) – ${L(ch).tip}`,
  };
}

function chunk<T>(a: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
}

const chars = (s: string) => Array.from(s);

/* ------------------------------------------------------------------ */
/* Einheiten                                                           */
/* ------------------------------------------------------------------ */

export const UNITS: Unit[] = [
  { id: "buchstaben", title: "Arabische Buchstaben", summary: "Die 28 Buchstaben erkennen und benennen." },
  { id: "formen", title: "Buchstabenformen", summary: "Wie sich Buchstaben am Wortanfang, in der Mitte und am Ende verändern." },
  { id: "harakat", title: "Fatha, Kasra, Damma", summary: "Die kurzen Vokale – damit werden aus Buchstaben Silben." },
  { id: "verbindungen", title: "Buchstabenverbindungen", summary: "Silben zu kurzen Wörtern verbinden." },
  { id: "sukoon", title: "Sukoon", summary: "Buchstaben ohne Vokal lesen." },
  { id: "shadda", title: "Shadda", summary: "Verdoppelte Buchstaben lesen." },
  { id: "madd", title: "Madd", summary: "Lange Vokale erkennen und dehnen." },
  { id: "lesen", title: "Zusammengesetzte Lesebeispiele", summary: "Alle Regeln in Übungswörtern kombinieren." },
  { id: "woerter", title: "Quranische Wörter", summary: "Echte Wörter aus kurzen Suren lesen." },
  { id: "passagen", title: "Kurze Quran-Passagen", summary: "Ganze Ayat lesen." },
];

/* ------------------------------------------------------------------ */
/* Lektionen                                                           */
/* ------------------------------------------------------------------ */

const lessons: Lesson[] = [];
const add = (l: Omit<Lesson, "stage" | "minutes"> & { minutes?: number }) =>
  lessons.push({ stage: 1, minutes: l.minutes ?? Math.max(3, Math.round(l.items.length * 0.5)), ...l });

/* --- A: Buchstaben (4 × 7) --- */
const letterGroups = chunk(LETTERS.map((l) => l.ch), 7);
letterGroups.forEach((g, i) => {
  const reads = g.map(letterItem);
  const checks = [g[1], g[4]].map((c, k) => recognise(c, i + k));
  add({
    id: `A${i + 1}`,
    unitId: "buchstaben",
    title: `Buchstaben ${i + 1}: ${L(g[0]).name} bis ${L(g[g.length - 1]).name}`,
    goal: `Du erkennst und benennst diese ${g.length} Buchstaben: ${g.join(" ")}`,
    intro: {
      title: i === 0 ? "Das arabische Alphabet" : "Weitere Buchstaben",
      body:
        i === 0
          ? [
              "Arabisch wird von rechts nach links gelesen. Das Alphabet hat 28 Buchstaben.",
              "Hör dir zuerst den Buchstaben an, dann sprich ihn selbst. Genauigkeit zählt mehr als Tempo.",
            ]
          : ["Jeder Buchstabe hat einen Namen und einen Laut. Achte auf Punkte – sie unterscheiden ähnliche Buchstaben."],
      examples: g.map((c) => ({ arabic: c, label: L(c).name })),
    },
    items: [...reads.slice(0, 4), checks[0], ...reads.slice(4), checks[1]],
  });
});

/* --- B: Formen (3 Lektionen) --- */
const formGroups = [
  { id: "B1", title: "Formen: Zahn- und Punktbuchstaben", set: "بتثنيس" },
  { id: "B2", title: "Formen: Haken- und Bauchbuchstaben", set: "جحخعغفقم" },
  { id: "B3", title: "Formen: weitere Buchstaben", set: "شصضطظكله" },
];
formGroups.forEach((g) => {
  const items: LessonItem[] = [];
  chars(g.set).forEach((c) => {
    const f = formsOf(L(c));
    items.push({ id: `f:i:${c}`, kind: "read", arabic: f.initial, hint: `${L(c).name} – am Wortanfang`, prompt: "Lies den Buchstaben in der Anfangsform.", size: "xl" });
    items.push({ id: `f:f:${c}`, kind: "read", arabic: f.final, hint: `${L(c).name} – am Wortende`, prompt: "Lies den Buchstaben in der Endform.", size: "xl" });
  });
  const mid = chars(g.set).slice(0, 2).map((c, k): ChooseItem => {
    const f = formsOf(L(c));
    const other = L(chars(g.set)[(k + 3) % g.set.length]);
    const opts = [f.medial, formsOf(other).medial, formsOf(L(chars(g.set)[(k + 5) % g.set.length])).medial];
    return { id: `fc:${g.id}:${c}`, kind: "choose", optionsArabic: true, question: `Welche Form ist „${L(c).name}“ in der Wortmitte?`, options: opts, answer: 0, explanation: `${L(c).name} in der Mitte: ${f.medial}` };
  });
  // Antworten durchmischen (deterministisch)
  mid.forEach((m, k) => {
    const rot = (k + 1) % 3;
    const rotated = m.options.map((_, i) => m.options[(i + rot) % 3]);
    m.answer = rotated.indexOf(m.options[0]);
    m.options = rotated;
    m.arabic = undefined;
  });
  add({
    id: g.id,
    unitId: "formen",
    title: g.title,
    goal: "Du erkennst die Buchstaben auch am Wortanfang, in der Mitte und am Ende.",
    intro: {
      title: "Buchstaben verbinden sich",
      body: [
        "In einem Wort verbinden sich die meisten Buchstaben. Dabei ändert sich ihre Form leicht – der Kern bleibt gleich.",
        "Sechs Buchstaben verbinden sich nicht mit dem folgenden: ا د ذ ر ز و.",
      ],
      examples: chars(g.set).slice(0, 3).map((c) => ({ arabic: formsOf(L(c)).initial, label: `${L(c).name}: Anfang` })),
    },
    items: [...items.slice(0, 8), ...mid, ...items.slice(8)],
  });
});

/* --- C: Harakat --- */
const fathaLetters = chars("بتثجحخدرسش");
const kasraLetters = chars("ذزصضطظعغفق");
const dammaLetters = chars("كلمنهويسبت");
const harakatLesson = (id: string, title: string, mark: string, letters: string[], intro: Lesson["intro"], goal: string) =>
  add({ id, unitId: "harakat", title, goal, intro, items: letters.map((c) => syl(c, mark)) });

harakatLesson("C1", "Fatha – der kurze „a“-Laut", FATHA, fathaLetters.slice(0, 8), {
  title: "Fatha",
  body: ["Die Fatha ist ein kleiner Strich über dem Buchstaben. Sie macht aus einem Konsonanten eine Silbe mit „a“.", "Beispiel: ب + Fatha = „ba“."],
  examples: [{ arabic: "بَ", label: "ba" }, { arabic: "تَ", label: "ta" }, { arabic: "سَ", label: "sa" }],
}, "Du liest Buchstaben mit Fatha als Silben („ba“, „ta“, …).");
harakatLesson("C2", "Kasra – der kurze „i“-Laut", KASRA, kasraLetters.slice(0, 8), {
  title: "Kasra",
  body: ["Die Kasra ist ein kleiner Strich unter dem Buchstaben. Sie macht aus ihm eine Silbe mit „i“.", "Beispiel: ب + Kasra = „bi“."],
  examples: [{ arabic: "بِ", label: "bi" }, { arabic: "تِ", label: "ti" }, { arabic: "سِ", label: "si" }],
}, "Du liest Buchstaben mit Kasra als Silben („bi“, „ti“, …).");
harakatLesson("C3", "Damma – der kurze „u“-Laut", DAMMA, dammaLetters.slice(0, 8), {
  title: "Damma",
  body: ["Die Damma sieht aus wie ein kleines „و“ über dem Buchstaben. Sie ergibt ein kurzes „u“.", "Beispiel: ب + Damma = „bu“."],
  examples: [{ arabic: "بُ", label: "bu" }, { arabic: "تُ", label: "tu" }, { arabic: "سُ", label: "su" }],
}, "Du liest Buchstaben mit Damma als Silben („bu“, „tu“, …).");

const mixed: [string, string][] = [
  ["ص", FATHA], ["ض", KASRA], ["ط", DAMMA], ["ظ", FATHA], ["ع", KASRA], ["غ", DAMMA], ["ق", FATHA], ["ح", KASRA], ["خ", DAMMA], ["ث", FATHA],
];
add({
  id: "C4",
  unitId: "harakat",
  title: "Alle drei Vokale mischen",
  goal: "Du unterscheidest a, i und u sicher – auch bei schweren Buchstaben.",
  intro: { title: "Jetzt gemischt", body: ["Achte genau auf die Position des Zeichens: darüber = a oder u, darunter = i.", "Bei den „schweren“ Buchstaben ص ض ط ظ ist der Vokal dunkler."] },
  items: mixed.map(([c, m]) => syl(c, m)),
});

const tanwin = (c: string, kind: "f" | "k" | "d"): ReadItem => {
  const mark = kind === "f" ? "ً" : kind === "k" ? "ٍ" : "ٌ";
  const extra = kind === "f" ? "ا" : "";
  const sound = kind === "f" ? "an" : kind === "k" ? "in" : "un";
  return { id: `t:${c}${mark}`, kind: "read", arabic: c + mark + extra, hint: LATIN[c] + sound, prompt: "Lies die Silbe mit Tanwin (Endung -an/-in/-un).", size: "xl" };
};
add({
  id: "C5",
  unitId: "harakat",
  title: "Tanwin – die doppelten Zeichen",
  goal: "Du liest die Endungen „-an“, „-in“ und „-un“.",
  intro: {
    title: "Tanwin",
    body: ["Doppelte Vokalzeichen am Wortende ergeben zusätzlich ein „n“: -an, -in, -un.", "Das Fatha-Tanwin steht meist über einem Alif."],
    examples: [{ arabic: "بًا", label: "ban" }, { arabic: "بٍ", label: "bin" }, { arabic: "بٌ", label: "bun" }],
  },
  items: [tanwin("ب", "f"), tanwin("ب", "k"), tanwin("ب", "d"), tanwin("ك", "f"), tanwin("ل", "k"), tanwin("م", "d")],
});

/* --- D: Verbindungen (Übungssilben, keine Quran-Wörter) --- */
const combo = (pairs: [string, string][], hintOverride?: string): ReadItem => {
  const arabic = pairs.map(([c, m]) => c + m).join("");
  const hint = hintOverride ?? pairs.map(([c, m]) => LATIN[c] + (VOWEL_LATIN[m] ?? "")).join("");
  return practice(arabic, hint, "Lies die Silben ohne Pause hintereinander.");
};
add({
  id: "D1",
  unitId: "verbindungen",
  title: "Zwei Silben verbinden",
  goal: "Du liest zwei Silben flüssig hintereinander.",
  intro: { title: "Silben verbinden", body: ["Jetzt liest du zwei Silben als ein Wort. Lies langsam, ohne Pause zwischen den Silben.", "Diese Übungsfolgen sind Lesetraining und nicht unbedingt echte Wörter."], examples: [{ arabic: "بَتَ", label: "bata" }] },
  items: [
    combo([["ب", FATHA], ["ت", FATHA]]), combo([["س", FATHA], ["م", FATHA]]), combo([["ن", KASRA], ["ب", FATHA]]),
    combo([["ك", DAMMA], ["ل", KASRA]]), combo([["ح", FATHA], ["ش", DAMMA]]), combo([["ر", KASRA], ["ف", FATHA]]),
    combo([["ج", DAMMA], ["م", FATHA]]), combo([["ق", FATHA], ["ط", KASRA]]),
  ],
});
add({
  id: "D2",
  unitId: "verbindungen",
  title: "Drei Silben verbinden",
  goal: "Du liest drei Silben flüssig und ohne zu stocken.",
  intro: { title: "Länger lesen", body: ["Jetzt drei Silben nacheinander. Fahre mit dem Auge von rechts nach links und lies Silbe für Silbe."] },
  items: [
    combo([["ك", FATHA], ["ت", FATHA], ["ب", FATHA]]), combo([["ن", FATHA], ["ص", FATHA], ["ر", FATHA]]),
    combo([["ع", FATHA], ["ل", KASRA], ["م", FATHA]]), combo([["ح", FATHA], ["س", FATHA], ["ن", FATHA]]),
    combo([["ف", FATHA], ["ه", KASRA], ["م", FATHA]]), combo([["خ", FATHA], ["ل", FATHA], ["ق", FATHA]]),
    combo([["ش", FATHA], ["ر", KASRA], ["ب", FATHA]]), combo([["غ", FATHA], ["ف", FATHA], ["ر", FATHA]]),
  ],
});

/* --- E: Sukoon --- */
const sk = (a: [string, string], b: string, hint: string): ReadItem => practice(a[0] + a[1] + b + SUKOON, hint, "Der letzte Buchstabe hat keinen Vokal.");
add({
  id: "E1",
  unitId: "sukoon",
  title: "Sukoon – Buchstabe ohne Vokal",
  goal: "Du liest Silben, die auf einen vokallosen Konsonanten enden.",
  intro: {
    title: "Das Sukoon",
    body: [
      "Ein Sukoon zeigt: dieser Buchstabe hat keinen Vokal. Er wird direkt an die vorige Silbe gehängt: ب + Fatha + م mit Sukoon = „bam“.",
      "In Standard-Schrift sieht es so aus: ْ , im Quran-Druck (Mushaf) meist so: ۡ . Beide bedeuten dasselbe.",
    ],
    examples: [{ arabic: "بَمۡ", label: "bam" }, { arabic: "مِنۡ", label: "min" }],
  },
  items: [
    sk(["ب", FATHA], "م", "bam"), sk(["م", KASRA], "ن", "min"), sk(["ق", FATHA], "د", "qad"), sk(["ه", FATHA], "ل", "hal"),
    sk(["ع", FATHA], "ن", "ʿan"), sk(["ل", FATHA], "م", "lam"), sk(["ك", DAMMA], "ن", "kun"), sk(["ق", DAMMA], "ل", "qul"),
  ],
});

/* --- F: Shadda --- */
add({
  id: "F1",
  unitId: "shadda",
  title: "Shadda – verdoppelter Buchstabe",
  goal: "Du liest Buchstaben mit Shadda doppelt und bewusst.",
  intro: {
    title: "Die Shadda",
    body: ["Die Shadda ( ّ ) verdoppelt einen Buchstaben: Der erste Teil beendet die vorherige Silbe, der zweite beginnt die nächste.", "Beispiel: رَبَّ = „rab-ba“. Halte den Buchstaben kurz an, drücke ihn dann nach."],
    examples: [{ arabic: "رَبَّ", label: "rab-ba" }, { arabic: "ثُمَّ", label: "thum-ma" }],
  },
  items: [
    practice("رَبَّ", "rab-ba"), practice("ثُمَّ", "thum-ma"), practice("رَبِّ", "rab-bi"), practice("حَقِّ", "ḥaq-qi"),
    practice("عَمَّ", "ʿam-ma"), practice("مَدَّ", "mad-da"), practice("كُلُّ", "kul-lu"), practice("رُدَّ", "rud-da"),
  ],
});

/* --- G: Madd --- */
const longA = (c: string) => practice(c + FATHA + "ا", LATIN[c] + "ā", "Dehne den Vokal – ca. zwei Zählzeiten.");
const longI = (c: string) => practice(c + KASRA + "ي", LATIN[c] + "ī", "Dehne den Vokal – ca. zwei Zählzeiten.");
const longU = (c: string) => practice(c + DAMMA + "و", LATIN[c] + "ū", "Dehne den Vokal – ca. zwei Zählzeiten.");
add({
  id: "G1",
  unitId: "madd",
  title: "Madd – lange Vokale",
  goal: "Du erkennst Alif, Yā und Wāw als Dehnung und liest sie lang.",
  intro: {
    title: "Lange Vokale (Madd)",
    body: ["Nach Fatha + Alif, Kasra + Yā oder Damma + Wāw wird der Vokal etwa doppelt so lang gesprochen.", "Das Alif/Yā/Wāw wird dabei nicht als eigener Konsonant gesprochen, sondern verlängert den Vokal."],
    examples: [{ arabic: "بَا", label: "bā" }, { arabic: "بِي", label: "bī" }, { arabic: "بُو", label: "bū" }],
  },
  items: [longA("ب"), longI("ت"), longU("ن"), longA("م"), longI("ك"), longU("ل"), longA("ر"), longI("س"), longU("ق")],
});
add({
  id: "G2",
  unitId: "madd",
  title: "Madd in Wörtern",
  goal: "Du dehnst lange Vokale auch in längeren Wörtern richtig.",
  intro: { title: "Dehnung im Wort", body: ["Lies das ganze Wort und dehne nur den markierten langen Vokal. Der Rest bleibt kurz."] },
  items: [
    practice("كِتَابٌ", "ki-tā-bun"), practice("بَابٌ", "bā-bun"), practice("نُورٌ", "nū-run"), practice("قَالَ", "qā-la"),
    practice("دِينٌ", "dī-nun"), practice("سَلَامٌ", "sa-lā-mun"), practice("رَسُولٌ", "ra-sū-lun"), practice("قِيلَ", "qī-la"),
  ],
});

/* --- H: Lesebeispiele --- */
add({
  id: "H1",
  unitId: "lesen",
  title: "Alle Regeln zusammen",
  goal: "Du kombinierst Vokale, Sukoon, Shadda und Madd in einem Wort.",
  intro: { title: "Alles zusammen", body: ["In diesen Übungswörtern steckt alles, was du bisher gelernt hast. Gehe Zeichen für Zeichen vor und lies erst dann das ganze Wort."] },
  items: [
    practice("كَتَبَ", "ka-ta-ba"), practice("قَلَمٌ", "qa-la-mun"), practice("مُسۡلِمٌ", "mus-li-mun"), practice("مَكۡتَبٌ", "mak-ta-bun"),
    practice("جَنَّةٌ", "jan-na-tun"), practice("صَبۡرٌ", "ṣab-run"), practice("عِلۡمٌ", "ʿil-mun"), practice("نَاصِرٌ", "nā-ṣi-run"),
    practice("مُحَمَّدٌ", "mu-ḥam-ma-dun"), practice("يَقُولُ", "ya-qū-lu"),
  ],
});

/* --- I: Quranische Wörter (aus verifizierter Quelle) --- */
function wordItem(id: string): ReadItem {
  const w = WORD_BY_ID.get(id)!;
  return {
    id: `w:${w.id}`,
    kind: "read",
    arabic: w.uthmani,
    hint: w.transliteration ?? "",
    prompt: `Sure ${surahInfo(w.surah).nameTranslit}, Ayah ${w.ayah}`,
    wordId: w.id,
    ref: `${w.surah}:${w.ayah}`,
    size: "xl",
  };
}
const fatihaWords = chunk(uniqueWordsOf(1), 9);
fatihaWords.forEach((ws, i) =>
  add({
    id: `W${i + 1}`,
    unitId: "woerter",
    title: `Wörter aus Al-Fātiḥa (${i + 1}/${fatihaWords.length})`,
    goal: "Du liest echte Quran-Wörter aus Sure 1 sicher.",
    intro: {
      title: i === 0 ? "Echte Quran-Wörter" : "Weiter mit Al-Fātiḥa",
      body: ["Jetzt liest du Wörter aus dem Quran im Mushaf-Schriftbild (Uthmani). Lies Zeichen für Zeichen – die Lautschrift ist nur eine Hilfe.", "Jede Karte zeigt die Fundstelle (Sure:Ayah)."],
    },
    items: ws.map((w) => wordItem(w.id)),
  }),
);
const wordLessonFor = (idx: number, surah: number, title: string) =>
  add({
    id: `W${idx}`,
    unitId: "woerter",
    title,
    goal: `Du liest die Wörter aus Sure ${surahInfo(surah).nameTranslit} (${surah}) sicher.`,
    intro: { title: surahInfo(surah).nameTranslit, body: [`Wörter aus Sure ${surah}. Du siehst sie gleich in ganzen Ayat im Zusammenhang.`] },
    items: uniqueWordsOf(surah).map((w) => wordItem(w.id)),
  });
wordLessonFor(fatihaWords.length + 1, 112, "Wörter aus Al-Ikhlāṣ");
wordLessonFor(fatihaWords.length + 2, 108, "Wörter aus Al-Kauthar");
wordLessonFor(fatihaWords.length + 3, 103, "Wörter aus Al-ʿAṣr");

/* --- J: Passagen --- */
const passage = (id: string, surah: number, title: string, intro: string) =>
  add({
    id,
    unitId: "passagen",
    title,
    goal: `Du liest Sure ${surahInfo(surah).nameTranslit} Ayah für Ayah flüssig.`,
    intro: { title, body: [intro, "Lies jede Ayah langsam und genau. Sicherheit vor Tempo."] },
    items: ayatOf(surah).map(
      (a): ReadItem => ({
        id: `a:${a.id}`,
        kind: "read",
        arabic: a.text,
        hint: a.translit ?? "",
        prompt: `Sure ${a.surahName}, Ayah ${a.n}`,
        ref: a.id,
        size: a.text.length > 40 ? "md" : "lg",
      }),
    ),
    minutes: ayatOf(surah).length * 2,
  });
passage("P1", 112, "Sure 112: Al-Ikhlāṣ", "Eine kurze Sure mit vier Ayat.");
passage("P2", 108, "Sure 108: Al-Kauthar", "Die kürzeste Sure – drei Ayat.");
passage("P3", 103, "Sure 103: Al-ʿAṣr", "Drei Ayat, die letzte ist länger.");
passage("P4", 1, "Sure 1: Al-Fātiḥa", "Die Eröffnung – sieben Ayat (in dieser Zählung mit der Basmala als erster Ayah).");

export const LESSONS: Lesson[] = lessons;
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
export const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

export function nextLessonId(id: string): string | undefined {
  const i = LESSON_INDEX.get(id);
  return i === undefined ? undefined : LESSONS[i + 1]?.id;
}

export function unitLessons(unitId: string) {
  return LESSONS.filter((l) => l.unitId === unitId);
}

/** Zukünftige Stufen – nur als Vorschau, nicht implementiert. */
export const FUTURE_STAGES = [
  { stage: 2, title: "Basis-Tajweed", summary: "Regeln für Nūn Sākina, Mīm Sākina, Qalqala u. a." },
  { stage: 3, title: "Fortgeschrittenes Tajweed", summary: "Feinheiten, Pausenregeln und flüssige Rezitation." },
];
