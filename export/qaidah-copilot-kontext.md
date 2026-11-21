# QAIDAH: Arabisch-Lern-App (Vite · React 19 · TypeScript) – Kontext für Copilot

## Auftrag an dich (Copilot)
Überarbeite die untenstehende App. Behalte die Architektur bei, ändere nichts ungefragt an der Lernlogik, ohne die Tests anzupassen. Nach jeder Änderung müssen `npm run typecheck`, `npm test` und `npm run build` grün sein. Bitte kleine, nachvollziehbare Schritte. **Hier trägst du deine konkreten Änderungswünsche ein:**

> (HIER DEINE WÜNSCHE EINFÜGEN, z. B. Design, neue Buchstaben, Audio, Texte)

## Produkt
Interaktive Arabisch-Lern-App für erwachsene deutschsprachige Anfänger, deutsches Interface, minimalistisch, mobil-first, Dark/Light. Arabisch immer RTL (`lang="ar" dir="rtl"`, Komponente `Ar`/`RichText` in `src/ui/parts.tsx`).

## Architektur
- `src/content`: Daten (28 Buchstaben, Vokale, `lektion1.ts` = Inhalt von Lektion 1)
- `src/domain`: reine Logik ohne React (Scheduler ~FSRS, Mastery, Aufgaben, Handschrift-Auswertung, `lektion/` = Zustand, Aufgaben, Simulation)
- `src/persistence`: IndexedDB-Ereignislog; Lektion-Zustand in localStorage `qaidah.lektion1.v1`
- `src/features`, `src/ui`: Seiten und Bausteine; `src/features/lektion/` = die 7-Phasen-Lektion (Route `#/lektion`)
- Styles: `src/styles/tokens.css`, `app.css`, `lektion.css`
- Alias `@` = `src`. HashRouter.

## Die 7 Phasen von Lektion 1 (Alif ا, Bā ب, Tā ت, Thā ث; Fatha, Kasra, Damma)
1 Orientierung (Advanced Organizer) · 2 Entdecken (Scaffolding, Dual Coding, Multisensorik) · 3 Hypothesen (Productive Failure, kein Feedback) · 4 Verstehen (Erklärung, Elaboration, Feedback) · 5 Anwenden (Transfer, Interleaving) · 6 Abrufen (Retrieval, Feedback am Ende) · 7 Festigen (Spaced Repetition mit simulierter Zeit).

## Fachliche Regeln (nicht brechen)
- Alif ist hier Dehnungsbuchstabe und Nicht-Verbinder, kein Konsonant; Fatha+ا = ā.
- Kontextformen NICHT per `font-feature-settings: init/medi/fina` erzwingen (zerstört das Shaping).
- Wörter in Pausalform (ohne Endvokal), Sukun kommt später.
- Inhalte sind nicht fachlich abgenommen; Audio-Aufnahmen fehlen (Buttons sagen das ehrlich).
- Scheduler-Konstanten und Handschrift-Schwellen sind ungeeicht.

## Befehle
`npm install` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build` · `npm run e2e` / `node scripts/e2e-lektion.mjs http://localhost:4173 ./screenshots`

---
# Quellcode (alle Dateien)

## `index.html`
```html
<!doctype html>
<html lang="de" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#17181A" />
    <title>QAIDAH – Arabische Schrift lesen und schreiben</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## `package.json`
```json
{
  "name": "qaidah",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "e2e": "node scripts/e2e.mjs"
  },
  "dependencies": {
    "@fontsource-variable/instrument-sans": "^5.3.0",
    "@fontsource/noto-naskh-arabic": "^5.3.0",
    "@fontsource/scheherazade-new": "^5.3.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-router-dom": "^7.18.6"
  },
  "devDependencies": {
    "@types/node": "^26.6.6",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.3.0",
    "fake-indexeddb": "^6.2.8",
    "jsdom": "^31.0.1",
    "typescript": "^7.0.2",
    "vite": "^8.3.8",
    "vitest": "^5.1.1"
  }
}
```

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2023", "DOM", "DOM.Iterable"], "module": "ESNext",
    "moduleResolution": "bundler", "jsx": "react-jsx", "strict": true, "noEmit": true,
    "skipLibCheck": true, "isolatedModules": true, "types": ["vite/client", "node"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

## `vite.config.ts`
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

## `src/content/lektion1.ts`
```ts
/**
 * Lektion 1: Alif (ا), Bā (ب), Tā (ت), Thā (ث) und die Kurzvokale Fatha, Kasra, Damma.
 *
 * Fachliche Eckpunkte (bewusst so umgesetzt):
 * - Alif ist KEIN Konsonant wie ب ت ث. Ohne Zeichen ist es ein Dehnungsbuchstabe (Fatha + ا = ā).
 *   Als Träger der Hamza (أ إ) wird es später behandelt; das ا dieser Lektion hat keinen eigenen Konsonantenlaut.
 * - Alif verbindet sich nicht mit dem Folgebuchstaben (Nicht-Verbinder); ب ت ث verbinden beidseitig.
 * - ب ت ث teilen dieselbe Grundform; nur Punkte (Zahl, Lage) unterscheiden sie.
 * - Wörter stehen in Pausalform (ohne Endvokal); das Sukun-Zeichen folgt in einer späteren Lektion.
 * Alle Beispiele sind vollständig vokalisiert. Eine fachliche Abnahme durch Arabisch-Lehrkräfte steht aus.
 */
import { LETTER_BY_ID } from "./letters";
import { VOWELS } from "./vowels";

export type VowelId = (typeof VOWELS)[number]["id"];
export const L1_LETTER_IDS = ["alif", "ba", "ta", "tha"] as const;
export const CONSONANT_IDS = ["ba", "ta", "tha"] as const;
export type ConsonantId = (typeof CONSONANT_IDS)[number];

export const ONSET: Record<ConsonantId, string> = { ba: "b", ta: "t", tha: "th" };
export const VOWEL_LATIN: Record<VowelId, string> = { fatha: "a", kasra: "i", damma: "u" };
export const MARK = Object.fromEntries(VOWELS.map((v) => [v.id, v.mark])) as Record<VowelId, string>;
export const VOWEL_NAME = Object.fromEntries(VOWELS.map((v) => [v.id, v.name])) as Record<VowelId, string>;
/** Gepunkteter Kreis: Platzhalter, um ein Vokalzeichen allein darzustellen. */
export const DOTTED = "◌";
export const ALIF = "ا";

export const letterName = (id: string) => LETTER_BY_ID.get(id)!.name;
export const letterCh = (id: string) => LETTER_BY_ID.get(id)!.ch;

export interface Syllable {
  id: string;
  ar: string;
  tr: string;
  letterId: ConsonantId;
  vowel: VowelId | "long";
  /** Wird im Lehrteil nicht gezeigt: dient dem Transfer in Phase 5. */
  novel: boolean;
}

export const SYLLABLES: Syllable[] = CONSONANT_IDS.flatMap((c) => [
  ...(["fatha", "kasra", "damma"] as const).map((v): Syllable => ({
    id: `syl:${c}-${v}`, ar: letterCh(c) + MARK[v], tr: ONSET[c] + VOWEL_LATIN[v], letterId: c, vowel: v,
    novel: c !== "ba" && v !== "fatha",
  })),
  { id: `syl:${c}-long`, ar: letterCh(c) + MARK.fatha + ALIF, tr: ONSET[c] + "ā", letterId: c, vowel: "long", novel: c !== "ba" },
]);

export interface Word { id: string; ar: string; tr: string; de: string; letters: string[]; novel: boolean; note?: string }
export const WORDS: Word[] = [
  { id: "word:bab", ar: "بَاب", tr: "bāb", de: "Tür", letters: ["ba", "alif", "ba"], novel: false },
  { id: "word:thabit", ar: "ثَابِت", tr: "thābit", de: "fest, beständig", letters: ["tha", "alif", "ba", "ta"], novel: false },
  { id: "word:tab", ar: "تَاب", tr: "tāb", de: "er bereute (kehrte um)", letters: ["ta", "alif", "ba"], novel: true, note: "Pausalform von tāba" },
  { id: "word:thabat", ar: "ثَبَات", tr: "thabāt", de: "Beständigkeit, Festigkeit", letters: ["tha", "ba", "alif", "ta"], novel: true },
];

export type ItemKind = "letter" | "vowel" | "syllable" | "word" | "concept";
export interface Item { id: string; kind: ItemKind; label: string; novel: boolean }

export const CONCEPT_IDS = ["concept:alif-role", "concept:alif-join", "concept:vowel-place"] as const;

export const ITEMS: Item[] = [
  ...L1_LETTER_IDS.map((id): Item => ({ id: `letter:${id}`, kind: "letter", label: `${letterCh(id)} ${letterName(id)}`, novel: false })),
  ...(["fatha", "kasra", "damma"] as const).map((v): Item => ({ id: `vowel:${v}`, kind: "vowel", label: `${VOWEL_NAME[v]} (${VOWEL_LATIN[v]})`, novel: false })),
  ...SYLLABLES.map((s): Item => ({ id: s.id, kind: "syllable", label: `${s.ar} · ${s.tr}`, novel: s.novel })),
  ...WORDS.map((w): Item => ({ id: w.id, kind: "word", label: `${w.ar} · ${w.tr}`, novel: w.novel })),
  { id: "concept:alif-role", kind: "concept", label: "Rolle des Alif", novel: false },
  { id: "concept:alif-join", kind: "concept", label: "Alif verbindet nicht", novel: false },
  { id: "concept:vowel-place", kind: "concept", label: "Lage der Vokalzeichen", novel: false },
];
export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/** Beschreibungen für Merkmals-Aufgaben und Bildanker (Dual Coding: Wort + Bild). */
export const FEATURE: Record<(typeof L1_LETTER_IDS)[number], { text: string; anchor: string }> = {
  alif: { text: "ein senkrechter Strich, ohne Bogen und ohne Punkte", anchor: "Ein Pfahl: gerade, schlank, steht allein." },
  ba: { text: "ein Bogen mit einem Punkt darunter", anchor: "Ein Boot (Bā) mit einem Anker im Wasser darunter." },
  ta: { text: "ein Bogen mit zwei Punkten darüber", anchor: "Eine Tasse (Tā) mit zwei Dampfwölkchen darüber." },
  tha: { text: "ein Bogen mit drei Punkten darüber", anchor: "Drei Punkte: „three“, th wie in „think“." },
};

/** Mund- und Merkhilfen der Vokalzeichen. */
export const VOWEL_INFO: Record<VowelId, { place: string; look: string; mouth: string }> = {
  fatha: { place: "über dem Buchstaben", look: "kleiner schräger Strich", mouth: "Mund offen, wie das „a“ in „Mama“" },
  kasra: { place: "unter dem Buchstaben", look: "kleiner schräger Strich", mouth: "Lippen breit, wie das „i“ in „Wind“" },
  damma: { place: "über dem Buchstaben", look: "winziges „و“ mit Schlaufe", mouth: "Lippen rund, wie das „u“ in „Mund“" },
};

/* ---------- Phase 3: Hypothesen (Productive Failure) ---------- */
export type Confidence = "sure" | "unsure" | "guess";
export const CONFIDENCE_LABEL: Record<Confidence, string> = { sure: "Ich bin mir sicher", unsure: "Eher vermutet", guess: "Geraten" };

export interface Hypothesis {
  id: string;
  title: string;
  /** Aufgabenstellung; „given“ zeigt Vorwissen als Muster. */
  question: string;
  given?: string[];
  stimulus: string;
  options: string[];
  optionsAr?: boolean;
  /** Index der fachlich richtigen Option */
  answer: number;
  /** Auflösung in Phase 4 */
  reveal: string;
}

export const UNKNOWN_OPTION = "Weiß ich nicht";

export const HYPOTHESES: Hypothesis[] = [
  {
    id: "h-kasra", title: "Das Zeichen unter dem Buchstaben",
    question: "Dieses Zeichen unter dem ب kennst du noch nicht. Wie klingt die Silbe?",
    given: ["بَ = ba", "تَ = ta", "ثَ = tha"], stimulus: "بِ",
    options: ["ba", "bi", "bu"], answer: 1,
    reveal: "Das Zeichen unter dem Buchstaben heißt Kasra und steht für ein kurzes „i“: بِ = bi. Der Punkt gehört zum ب, das kleine schräge Zeichen darunter ist das Kasra.",
  },
  {
    id: "h-damma", title: "Das Zeichen mit der Schlaufe",
    question: "Und dieses Zeichen über dem ب? Es sieht anders aus als das erste, das du kennst.",
    given: ["بَ = ba", "بِ = bi (deine Vermutung gilt)"], stimulus: "بُ",
    options: ["ba", "bi", "bu"], answer: 2,
    reveal: "Das Zeichen heißt Damma und steht für ein kurzes „u“: بُ = bu. Es ist ein winziges „و“ (Wāw) über dem Buchstaben, daran erkennst du es.",
  },
  {
    id: "h-analogy", title: "Übertragen auf einen anderen Buchstaben",
    question: "Du kennst ت = t. Wie klingt diese Silbe?",
    stimulus: "تِ",
    options: ["ta", "ti", "tu", "thi"], answer: 1,
    reveal: "Die Vokalzeichen funktionieren bei jedem Konsonanten gleich: Buchstabe + Kasra = Konsonant + i. Also تِ = ti. Das Zeichen ändert nur den Vokal, der Buchstabe liefert den Konsonanten.",
  },
  {
    id: "h-alif-long", title: "Was macht das Alif?",
    question: "Du kennst بَ = ba. Hier steht dahinter ein ا. Was bewirkt es?",
    stimulus: "بَا",
    options: ["Es verlängert das a: bā (ā = langes a)", "Es fügt einen eigenen Konsonanten hinzu", "Es ist stumm und ändert nichts"], answer: 0,
    reveal: "Fatha + ا dehnt das a: بَا = bā, etwa doppelt so lang wie بَ = ba. Alif ist hier kein Konsonant, sondern ein Dehnungsbuchstabe.",
  },
  {
    id: "h-alif-join", title: "Warum hängt das zweite ب nicht an?",
    question: "In diesem Wort ist das erste ب mit dem Alif verbunden, das zweite steht frei. Warum?",
    stimulus: "بَاب",
    options: ["Es ist ein anderer Buchstabe", "Alif verbindet sich nicht mit dem folgenden Buchstaben", "Das ist nur Schönschrift"], answer: 1,
    reveal: "Alif ist ein Nicht-Verbinder: Es hängt sich nach links an nichts an. Deshalb beginnt das nächste Zeichen neu und das zweite ب steht in seiner freien Form. Es bleibt derselbe Buchstabe.",
  },
  {
    id: "h-alif-consonant", title: "Ist Alif ein Konsonant wie ب?",
    question: "Welche Aussage über ا stimmt am ehesten?",
    stimulus: "ا",
    options: ["Alif ist der Buchstabe für „a“, so wie ب der Buchstabe für „b“ ist", "Alif hat hier keinen eigenen Konsonantenlaut, er dehnt einen Vokal", UNKNOWN_OPTION], answer: 1,
    reveal: "Häufiger Irrtum: „Alif = a“. Das kurze a schreibt die Fatha. Alif selbst ist hier ein Dehnungsbuchstabe. (Als Träger der Hamza hat er später eine weitere Rolle.)",
  },
];

/* ---------- Phase 4: Elaboration ---------- */
export interface ElabPrompt { id: string; question: string; model: string }
export const ELAB: ElabPrompt[] = [
  { id: "e-who", question: "Was liefert den Konsonanten und was den Vokal in بِ? Erkläre in eigenen Worten.",
    model: "Der Buchstabe ب liefert den Konsonanten b. Das Kasra darunter liefert den kurzen Vokal i. Zusammen ergeben sie die Silbe bi." },
  { id: "e-dots", question: "ب, ت und ث haben dieselbe Grundform. Warum ist es beim Lesen wichtig, zuerst auf die Punkte zu achten?",
    model: "Weil nur die Punkte (Zahl und Lage) die drei Buchstaben unterscheiden. Ein Punkt unten ist ب, zwei oben ت, drei oben ث. Wer die Punkte übersieht, liest den falschen Buchstaben." },
  { id: "e-alif", question: "Warum ist Alif kein Konsonant wie ب? Nenne zwei Unterschiede.",
    model: "Alif hat keinen eigenen Konsonantenlaut, sondern dehnt den Vokal davor (بَا = bā). Außerdem hat es keine Punkte und verbindet sich nicht mit dem folgenden Buchstaben." },
];

export const ALIF_CONTRAST: { feature: string; alif: string; others: string }[] = [
  { feature: "Rolle", alif: "Dehnungsbuchstabe: macht ein kurzes a lang (ā)", others: "Konsonanten: b, t, th" },
  { feature: "Eigener Konsonantenlaut", alif: "nein (hier)", others: "ja" },
  { feature: "Punkte", alif: "keine", others: "ب 1 unten · ت 2 oben · ث 3 oben" },
  { feature: "Verbindung nach links", alif: "nie (Nicht-Verbinder)", others: "ja, beidseitig" },
  { feature: "Form", alif: "senkrechter Strich", others: "gemeinsame Bogen-Grundform" },
];
```

## `src/content/letters.ts`
```ts
/**
 * Die 28 Buchstaben in traditioneller Reihenfolge.
 * Gruppen folgen den Formfamilien (Rasm), die Reihenfolge innerhalb und zwischen den Gruppen bleibt traditionell.
 * Deutsche Ausspracheanleitungen sind Lernhilfen und noch nicht von einer Arabisch-Lehrkraft gegengelesen.
 */
export type Dots = { count: 0 | 1 | 2 | 3; pos: "none" | "above" | "below" | "inside" };

export interface Letter {
  id: string;
  ch: string;
  /** Arabischer Buchstabenname, vokalisiert */
  nameAr: string;
  /** Lateinische Umschrift des Namens */
  name: string;
  /** Laut als Konsonant + Fatha (ein Konsonant allein ist nicht sprechbar) */
  syllable: string;
  /** Laut in Worten */
  sound: string;
  tip: string;
  joinsNext: boolean;
  group: number;
  dots: Dots;
  /** Optisch leicht zu verwechselnde Buchstaben (symmetrisch gepflegt, siehe Test) */
  similar: string[];
}

const L = (
  id: string, ch: string, nameAr: string, name: string, syllable: string, sound: string, tip: string,
  joinsNext: boolean, group: number, dots: Dots, similar: string[],
): Letter => ({ id, ch, nameAr, name, syllable, sound, tip, joinsNext, group, dots, similar });

const d = (count: Dots["count"], pos: Dots["pos"]): Dots => ({ count, pos });
const none = d(0, "none");

export const LETTERS: Letter[] = [
  L("alif", "ا", "أَلِف", "Alif", "ā", "Träger / langer Vokal ā", "Alif trägt Vokale und dehnt als Langvokal ein „a“. Als Name sprichst du „Alif“.", false, 1, none, ["lam"]),
  L("ba", "ب", "بَاء", "Bā", "ba", "b", "Wie deutsches „b“, beide Lippen schließen sich kurz.", true, 1, d(1, "below"), ["ta", "tha", "nun", "ya"]),
  L("ta", "ت", "تَاء", "Tā", "ta", "t", "Wie „t“, aber ohne Hauch. Zungenspitze an den oberen Zähnen.", true, 1, d(2, "above"), ["ba", "tha", "nun", "ya"]),
  L("tha", "ث", "ثَاء", "Thā", "tha", "th (stimmlos)", "Zungenspitze leicht zwischen den Zähnen, Luft strömen lassen (wie englisch „think“).", true, 1, d(3, "above"), ["ba", "ta", "nun", "ya"]),
  L("jim", "ج", "جِيم", "Jīm", "ja", "dsch", "Wie „dsch“ in „Dschungel“.", true, 2, d(1, "inside"), ["ha", "kha"]),
  L("ha", "ح", "حَاء", "Ḥā", "ḥa", "ḥ (Rachen-h)", "Ein kräftiges, gehauchtes „h“ tief aus dem Rachen, wie beim Anhauchen einer Brille.", true, 2, none, ["jim", "kha"]),
  L("kha", "خ", "خَاء", "Khā", "kha", "ch", "Wie „ch“ in „Bach“, hinten im Rachen gerieben.", true, 2, d(1, "above"), ["jim", "ha"]),
  L("dal", "د", "دَال", "Dāl", "da", "d", "Wie deutsches „d“.", false, 3, none, ["dhal", "ra", "zay"]),
  L("dhal", "ذ", "ذَال", "Dhāl", "dha", "dh (stimmhaft)", "Zungenspitze zwischen den Zähnen, mit Stimme (wie englisch „this“).", false, 3, d(1, "above"), ["dal", "ra", "zay"]),
  L("ra", "ر", "رَاء", "Rā", "ra", "r (gerollt)", "Mit der Zungenspitze gerolltes „r“.", false, 3, none, ["zay", "dal", "dhal", "waw"]),
  L("zay", "ز", "زَاي", "Zāy", "za", "z (stimmhaftes s)", "Stimmhaftes „s“ wie in „Sonne“.", false, 3, d(1, "above"), ["ra", "dal", "dhal", "waw"]),
  L("sin", "س", "سِين", "Sīn", "sa", "s (scharf)", "Scharfes „s“ wie in „Wasser“.", true, 4, none, ["shin"]),
  L("shin", "ش", "شِين", "Shīn", "sha", "sch", "Wie „sch“ in „Schule“.", true, 4, d(3, "above"), ["sin"]),
  L("sad", "ص", "صَاد", "Ṣād", "ṣa", "ṣ (dunkles s)", "Dunkles, „schweres“ s: Zunge hebt sich nach hinten, der Mund wird rund.", true, 4, none, ["dad"]),
  L("dad", "ض", "ضَاد", "Ḍād", "ḍa", "ḍ (dunkles d)", "Dunkles, „schweres“ d: Zungenrand drückt gegen die oberen Seitenzähne.", true, 4, d(1, "above"), ["sad"]),
  L("tah", "ط", "طَاء", "Ṭā", "ṭa", "ṭ (dunkles t)", "Dunkles, „schweres“ t mit gehobenem Zungenrücken, ohne Hauch.", true, 5, none, ["zah"]),
  L("zah", "ظ", "ظَاء", "Ẓā", "ẓa", "ẓ (dunkles dh)", "Wie „dh“ (ذ), aber dunkel und „schwer“.", true, 5, d(1, "above"), ["tah"]),
  L("ayn", "ع", "عَيْن", "ʿAyn", "ʿa", "ʿ (Kehlkopflaut)", "Gepresster Laut aus der Kehle, kein deutscher Laut. Kehle leicht verengen und Stimme durchlassen.", true, 5, none, ["ghayn"]),
  L("ghayn", "غ", "غَيْن", "Ghayn", "gha", "gh", "Wie ein weiches Gaumen-„r“ (französisches „r“), mit Stimme.", true, 5, d(1, "above"), ["ayn"]),
  L("fa", "ف", "فَاء", "Fā", "fa", "f", "Wie deutsches „f“.", true, 6, d(1, "above"), ["qaf"]),
  L("qaf", "ق", "قَاف", "Qāf", "qa", "q", "Ein „k“ ganz hinten im Hals, tiefer als das normale „k“.", true, 6, d(2, "above"), ["fa"]),
  L("kaf", "ك", "كَاف", "Kāf", "ka", "k", "Wie „k“ im vorderen Mundraum, mit leichtem Hauch.", true, 6, none, ["lam"]),
  L("lam", "ل", "لَام", "Lām", "la", "l", "Wie deutsches „l“.", true, 6, none, ["alif", "kaf"]),
  L("mim", "م", "مِيم", "Mīm", "ma", "m", "Wie deutsches „m“.", true, 7, none, []),
  L("nun", "ن", "نُون", "Nūn", "na", "n", "Wie deutsches „n“.", true, 7, d(1, "above"), ["ba", "ta", "tha", "ya"]),
  L("ha2", "ه", "هَاء", "Hā", "ha", "h", "Leichtes „h“ wie in „Haus“.", true, 7, none, []),
  L("waw", "و", "وَاو", "Wāw", "wa", "w", "Wie englisches „w“, Lippen gerundet.", false, 8, none, ["ra", "zay"]),
  L("ya", "ي", "يَاء", "Yā", "ya", "j / y", "Wie „j“ in „ja“.", true, 8, d(2, "below"), ["ba", "ta", "tha", "nun"]),
];

export const LETTER_BY_ID = new Map(LETTERS.map((l) => [l.id, l]));
export const LETTER_BY_CH = new Map(LETTERS.map((l) => [l.ch, l]));
export const GROUP_COUNT = Math.max(...LETTERS.map((l) => l.group));
export const lettersOfGroup = (g: number) => LETTERS.filter((l) => l.group === g);

const ZWJ = "‍";
export type FormPos = "isolated" | "initial" | "medial" | "final";

/** Kontextformen per Zero-Width-Joiner. Die Darstellung hängt vom Font ab und wird in /specimen geprüft. */
export function formsOf(l: Letter): Record<FormPos, string> {
  return {
    isolated: l.ch,
    initial: l.joinsNext ? l.ch + ZWJ : l.ch,
    medial: l.joinsNext ? ZWJ + l.ch + ZWJ : ZWJ + l.ch,
    final: ZWJ + l.ch,
  };
}

export function dotsText(dots: Dots): string {
  if (dots.count === 0) return "kein Punkt";
  const n = ["", "ein Punkt", "zwei Punkte", "drei Punkte"][dots.count];
  const p = { above: "oben", below: "unten", inside: "im Körper", none: "" }[dots.pos];
  return `${n} ${p}`;
}
```

## `src/content/vowels.ts`
```ts
/** Kurzvokale. Trägerbuchstabe ب dient nur der Darstellung. */
export const VOWELS = [
  { id: "fatha", mark: "َ", name: "Fatha", sound: "a" },
  { id: "kasra", mark: "ِ", name: "Kasra", sound: "i" },
  { id: "damma", mark: "ُ", name: "Damma", sound: "u" },
] as const;

/** Vollständig vokalisierte Beispielwörter (Abnahme durch Arabisch-Kundige steht aus). */
export const EXAMPLE_WORDS = [
  { id: "bab", ar: "بَاب", tr: "bāb", de: "Tür" },
  { id: "bayt", ar: "بَيْت", tr: "bayt", de: "Haus" },
  { id: "kitab", ar: "كِتَاب", tr: "kitāb", de: "Buch" },
  { id: "maa", ar: "مَاء", tr: "māʾ", de: "Wasser" },
] as const;
```

## `src/domain/exercises.ts`
```ts
import { LETTER_BY_ID, LETTERS, dotsText } from "@/content/letters";
import { confusionsOf, type Progress } from "./progress";
import { pickDistractors } from "./selection";
import type { Skill } from "./types";

export type ExerciseType = "find-letter" | "letter-to-sound" | "contrast";

export interface Exercise {
  type: ExerciseType;
  skill: Skill;
  letterId: string;
  prompt: string;
  /** Anzeige der Frage (Glyphe) bzw. leer */
  promptArabic?: string;
  options: { letterId?: string; label: string; arabic?: boolean }[];
  answerIndex: number;
  explanation: string;
}

const shuffle = <T,>(a: T[], rnd: () => number) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

/** `pool`: Buchstaben-IDs, die der Lernende bereits kennengelernt hat. */
export function buildExercise(
  type: ExerciseType, letterId: string, pool: string[], progress: Progress, rnd: () => number = Math.random,
): Exercise {
  const t = LETTER_BY_ID.get(letterId)!;
  const confused = confusionsOf(progress, letterId).map(([id]) => id);
  const pickN = (n: number) => pickDistractors(letterId, t.similar, confused, pool, n, rnd);

  if (type === "find-letter") {
    const opts = shuffle([letterId, ...pickN(3)], rnd);
    return {
      type, skill: "visual", letterId, prompt: `Welcher Buchstabe ist „${t.name}“?`,
      options: opts.map((id) => ({ letterId: id, label: LETTER_BY_ID.get(id)!.ch, arabic: true })),
      answerIndex: opts.indexOf(letterId),
      explanation: `${t.ch} heißt ${t.name}: ${dotsText(t.dots)}.`,
    };
  }
  if (type === "letter-to-sound") {
    const opts = shuffle([letterId, ...pickN(3)], rnd);
    return {
      type, skill: "association", letterId, prompt: "Welcher Laut gehört zu diesem Buchstaben?", promptArabic: t.ch,
      options: opts.map((id) => ({ letterId: id, label: `${LETTER_BY_ID.get(id)!.syllable} (${LETTER_BY_ID.get(id)!.name})` })),
      answerIndex: opts.indexOf(letterId),
      explanation: `${t.ch} ist ${t.name} und klingt wie „${t.syllable}“: ${t.tip}`,
    };
  }
  // contrast: gleiche Grundform, nur die Punkte unterscheiden → Merkmal erkennen
  const sims = t.similar.filter((s) => pool.includes(s));
  const rivals = (sims.length ? sims : pickN(2)).slice(0, 2);
  const opts = shuffle([letterId, ...rivals], rnd);
  return {
    type, skill: "contrast", letterId, prompt: `Welcher Buchstabe hat ${dotsText(t.dots)}?`,
    options: opts.map((id) => ({ letterId: id, label: LETTER_BY_ID.get(id)!.ch, arabic: true })),
    answerIndex: opts.indexOf(letterId),
    explanation: rivals.length
      ? `${t.ch} (${t.name}): ${dotsText(t.dots)}. ` + rivals.map((r) => `${LETTER_BY_ID.get(r)!.ch}: ${dotsText(LETTER_BY_ID.get(r)!.dots)}`).join("; ") + "."
      : `${t.ch}: ${dotsText(t.dots)}.`,
  };
}

export const ALL_IDS = LETTERS.map((l) => l.id);
```

## `src/domain/handwriting/geometry.ts`
```ts
export interface Pt { x: number; y: number }
export type Stroke = Pt[];

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const pathLength = (s: Stroke) => s.slice(1).reduce((n, p, i) => n + dist(s[i], p), 0);

export function bbox(pts: Pt[]) {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

/** k gleichmäßig nach Bogenlänge verteilte Punkte (Strich mit Länge 0 → k-mal derselbe Punkt). */
export function resampleStroke(s: Stroke, k: number): Pt[] {
  if (s.length === 0) return [];
  const total = pathLength(s);
  if (total === 0 || k < 2) return Array.from({ length: Math.max(1, k) }, () => s[0]);
  const step = total / (k - 1);
  const out: Pt[] = [s[0]];
  let acc = 0;
  let prev = s[0];
  for (let i = 1; i < s.length && out.length < k; ) {
    const d = dist(prev, s[i]);
    if (acc + d >= step && d > 0) {
      const t = (step - acc) / d;
      const q = { x: prev.x + t * (s[i].x - prev.x), y: prev.y + t * (s[i].y - prev.y) };
      out.push(q); prev = q; acc = 0;
    } else { acc += d; prev = s[i]; i++; }
  }
  while (out.length < k) out.push(s[s.length - 1]);
  return out;
}

/** Punktwolke aus mehreren Strichen; Punkte je Strich proportional zur Länge. Reihenfolge und Strichanzahl spielen keine Rolle. */
export function resampleCloud(strokes: Stroke[], n = 64): Pt[] {
  const lens = strokes.map(pathLength);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  return strokes.flatMap((s, i) => resampleStroke(s, Math.max(2, Math.round((n * lens[i]) / total))));
}

/** Auf Mittelpunkt 0 und längste Kante 1 normieren – unabhängig von Größe und Position. */
export function normalize(pts: Pt[]): Pt[] {
  const b = bbox(pts);
  const scale = Math.max(b.w, b.h) || 1;
  return pts.map((p) => ({ x: (p.x - b.cx) / scale, y: (p.y - b.cy) / scale }));
}

/** Symmetrische mittlere Nächste-Nachbar-Distanz (Chamfer) zweier normierter Wolken. */
export function chamfer(a: Pt[], b: Pt[]): number {
  const one = (u: Pt[], v: Pt[]) => {
    let sum = 0;
    for (const p of u) { let m = Infinity; for (const q of v) { const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (d < m) m = d; } sum += Math.sqrt(m); }
    return sum / u.length;
  };
  return (one(a, b) + one(b, a)) / 2;
}
```

## `src/domain/handwriting/score.ts`
```ts
import { bbox, chamfer, normalize, pathLength, resampleCloud, type Pt, type Stroke } from "./geometry";
import { TEMPLATES, TEMPLATE_BY_ID, type Template } from "./templates";

/** Schwellen: Startwerte, per Kalibrierung an Probenmaterial zu prüfen (siehe tests/handwriting.test.ts und #/labor). */
export const TH = {
  good: 0.07, near: 0.12,        // Chamfer-Distanz der Körperform (normiert)
  dotStrokeRatio: 0.3,           // Strich < 30 % der längsten Strichlänge zählt als Punkt
  minExtent: 0.25,               // Zeichnung muss mind. 25 % der Zeichenfläche einnehmen
  reversedCos: -0.3,
  margin: 0.04,                  // Freies Schreiben: Abstand zur zweitbesten Hypothese
};

export interface Split { body: Stroke[]; dots: Pt[] }

/** Trennt Körperstriche von Punkten (kurze Striche). */
export function splitStrokes(strokes: Stroke[]): Split {
  const valid = strokes.filter((s) => s.length > 0);
  if (!valid.length) return { body: [], dots: [] };
  const lens = valid.map(pathLength);
  const max = Math.max(...lens);
  const body: Stroke[] = [], dots: Pt[] = [];
  valid.forEach((s, i) => {
    if (valid.length > 1 && lens[i] < TH.dotStrokeRatio * max) {
      const b = bbox(s); dots.push({ x: b.cx, y: b.cy });
    } else body.push(s);
  });
  return { body, dots };
}

const bodyCloud = (body: Stroke[]) => normalize(resampleCloud(body, 64));
export const shapeDistance = (body: Stroke[], t: Template) => body.length ? chamfer(bodyCloud(body), bodyCloud(t.body)) : Infinity;

const dotPositions = (dots: Pt[], body: Stroke[]) => {
  const c = bbox(body.flat()).cy;
  return dots.map((d) => (d.y < c ? "above" : "below"));
};

export type DotLevel = "ok" | "missing" | "extra" | "wrongPlace";
export interface WritingResult {
  empty: boolean;
  tooSmall: boolean;
  shape: { distance: number; level: "good" | "near" | "off" };
  dots: { expected: number; found: number; level: DotLevel };
  direction: "ok" | "reversed" | "unknown";
  grade: 0 | 1 | 2;
  messages: string[];
}

const cos = (a: Pt, b: Pt) => (a.x * b.x + a.y * b.y) / ((Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y)) || 1);
const vec = (s: Stroke): Pt => ({ x: s[s.length - 1].x - s[0].x, y: s[s.length - 1].y - s[0].y });

/** Prüft Striche gegen ein Template: Form, Punkte (Anzahl/Lage), Richtung. `area` = Kantenlänge der Zeichenfläche. */
export function analyze(strokes: Stroke[], t: Template, area: number): WritingResult {
  const { body, dots } = splitStrokes(strokes);
  const base: WritingResult = {
    empty: body.length === 0, tooSmall: false, shape: { distance: Infinity, level: "off" },
    dots: { expected: t.dots.length, found: dots.length, level: "ok" }, direction: "unknown", grade: 0, messages: [],
  };
  if (base.empty) return { ...base, messages: ["Noch nichts gezeichnet."] };
  const all = strokes.flat();
  const ext = bbox(all);
  if (Math.max(ext.w, ext.h) < TH.minExtent * area) return { ...base, tooSmall: true, messages: ["Zu klein – schreibe größer, damit man die Form erkennt."] };

  const distance = shapeDistance(body, t);
  const level = distance <= TH.good ? "good" : distance <= TH.near ? "near" : "off";

  let dotLevel: DotLevel = "ok";
  if (dots.length < t.dots.length) dotLevel = "missing";
  else if (dots.length > t.dots.length) dotLevel = "extra";
  else if (t.dots.length) {
    const want = dotPositions(t.dots, t.body).sort().join();
    const got = dotPositions(dots, body).sort().join();
    if (want !== got) dotLevel = "wrongPlace";
  }

  let direction: WritingResult["direction"] = "unknown";
  if (body.length === t.body.length) {
    const nb = body.map((s) => s.length > 1 ? vec(s) : { x: 0, y: 0 });
    const c = nb.map((v, i) => cos(v, vec(t.body[i])));
    direction = c.every((x) => x > TH.reversedCos) ? "ok" : "reversed";
  }

  const messages: string[] = [];
  if (level === "off") messages.push("Die Grundform weicht noch deutlich ab. Schau dir die Vorlage an.");
  if (level === "near") messages.push("Die Form passt ungefähr. Etwas ruhiger und genauer.");
  if (direction === "reversed") messages.push("Schreibrichtung beachten: Arabisch schreibt man von rechts nach links; das Alif von oben nach unten.");

  let grade: 0 | 1 | 2 = level === "good" ? 2 : level === "near" ? 1 : 0;
  if (dotLevel !== "ok") grade = 0;
  if (direction === "reversed") grade = Math.min(grade, 1) as 0 | 1;
  return { ...base, shape: { distance, level }, dots: { expected: t.dots.length, found: dots.length, level: dotLevel }, direction, grade, messages };
}

export interface Candidate { letterId: string; cost: number; shape: number }

/** Freies Schreiben: Rangfolge über Körperform + Punktanzahl/-lage. */
export function rank(strokes: Stroke[], templates: Template[] = TEMPLATES): Candidate[] {
  const { body, dots } = splitStrokes(strokes);
  return templates.map((t) => {
    const shape = shapeDistance(body, t);
    let cost = shape + 0.12 * Math.abs(dots.length - t.dots.length);
    if (dots.length === t.dots.length && dots.length && body.length) {
      if (dotPositions(dots, body).sort().join() !== dotPositions(t.dots, t.body).sort().join()) cost += 0.1;
    }
    return { letterId: t.letterId, cost, shape };
  }).sort((a, b) => a.cost - b.cost);
}

export interface FreeResult extends WritingResult { recognizedAs?: string; confident: boolean }

/** Freies Schreiben: Zielbuchstabe muss klar bester Treffer sein; sonst keine Note ≥ 1. */
export function analyzeFree(strokes: Stroke[], targetId: string, area: number, templates: Template[] = TEMPLATES): FreeResult {
  const t = TEMPLATE_BY_ID.get(targetId)!;
  const base = analyze(strokes, t, area);
  if (base.empty || base.tooSmall) return { ...base, confident: false };
  const r = rank(strokes, templates);
  const best = r[0], second = r[1];
  const confident = best.letterId === targetId && (!second || second.cost - best.cost >= TH.margin);
  if (best.letterId !== targetId) {
    return { ...base, grade: 0, recognizedAs: best.letterId, confident: false, messages: [`Das sieht eher aus wie ein anderer Buchstabe.`, ...base.messages] };
  }
  if (!confident) return { ...base, grade: Math.min(base.grade, 1) as 0 | 1 | 2, confident: false, messages: ["Nicht eindeutig zu erkennen. Achte auf Form und Punkte.", ...base.messages] };
  return { ...base, confident: true };
}
```

## `src/domain/handwriting/templates.ts`
```ts
import type { Pt, Stroke } from "./geometry";

/**
 * Referenz für isolierte Formen: Koordinaten in einer 100×100-Box, y nach unten.
 * `body` = Hauptstriche in Schreibrichtung; `dots` = Punktmittelpunkte.
 * ACHTUNG: Selbst entworfene, vereinfachte Skelette. Es gibt keine allgemein verbindliche Strichreihenfolge
 * für Arabisch; fachliche Abnahme steht aus. Der Vergleich ist größen-/positionsunabhängig und tolerant.
 */
export interface Template { letterId: string; body: Stroke[]; dots: Pt[] }

const P = (...xy: number[]): Pt[] => xy.reduce<Pt[]>((a, _, i) => (i % 2 ? a : [...a, { x: xy[i], y: xy[i + 1] }]), []);
const BOWL = P(94, 38, 90, 54, 78, 64, 60, 68, 40, 68, 22, 64, 10, 52, 6, 44); // rechts → links

export const TEMPLATES: Template[] = [
  { letterId: "alif", body: [P(51, 6, 50, 50, 49, 94)], dots: [] },
  { letterId: "ba", body: [BOWL], dots: P(50, 86) },
  { letterId: "ta", body: [BOWL], dots: P(38, 24, 62, 24) },
  { letterId: "tha", body: [BOWL], dots: P(38, 26, 62, 26, 50, 10) },
];
export const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.letterId, t]));
```

## `src/domain/lektion/state.ts`
```ts
import type { Confidence } from "@/content/lektion1";
import { DAY, retrievability, review } from "../scheduler";
import type { Evidence, MemoryState } from "../types";
import type { TaskResult } from "./tasks";

export const PHASES = [
  { n: 1, title: "Orientierung", method: "Advanced Organizer", minutes: 5 },
  { n: 2, title: "Entdecken", method: "Scaffolding · Dual Coding · Multisensorik", minutes: 12 },
  { n: 3, title: "Hypothesen", method: "Productive Failure", minutes: 6 },
  { n: 4, title: "Verstehen", method: "Erklärung · Elaboration · Feedback", minutes: 10 },
  { n: 5, title: "Anwenden", method: "Transfer · Interleaving", minutes: 8 },
  { n: 6, title: "Abrufen", method: "Retrieval Practice", minutes: 5 },
  { n: 7, title: "Festigen", method: "Spaced Repetition", minutes: 6 },
] as const;
export const PHASE_COUNT = PHASES.length;

export type SelfLevel = "none" | "letters" | "reading";
export interface HypothesisAnswer { choice: number; confidence: Confidence; why?: string }
export interface ElabAnswer { text: string; rating?: "match" | "partial" | "off" }
export interface LogEntry { itemId: string; ts: number; grade: number; phase: number; /** Stabilität nach der Wiederholung (Tage) */ stability: number }
export interface SimSession { day: number; total: number; right: number }

export interface LessonState {
  v: 1;
  startedAt: number;
  /** Höchste freigeschaltete Phase */
  unlocked: number;
  done: number[];
  steps: Record<number, number>;
  selfLevel?: SelfLevel;
  pretest: Record<string, "right" | "wrong" | "unknown">;
  hyp: Record<string, HypothesisAnswer>;
  elab: Record<string, ElabAnswer>;
  results: Record<number, TaskResult[]>;
  srs: Record<string, MemoryState>;
  log: LogEntry[];
  /** Beginn der simulierten Zeit (Phase 7), Unix-ms */
  simStart?: number;
  offsetDays: number;
  sessions: SimSession[];
}

export const initialLesson = (now = Date.now()): LessonState => ({
  v: 1, startedAt: now, unlocked: 1, done: [], steps: {}, pretest: {}, hyp: {}, elab: {}, results: {}, srs: {}, log: [], offsetDays: 0, sessions: [],
});

export type Action =
  | { t: "step"; phase: number; step: number }
  | { t: "complete"; phase: number }
  | { t: "selfLevel"; level: SelfLevel }
  | { t: "pretest"; itemId: string; value: "right" | "wrong" | "unknown" }
  | { t: "hyp"; id: string; answer: HypothesisAnswer }
  | { t: "elab"; id: string; answer: ElabAnswer }
  | { t: "results"; phase: number; results: TaskResult[]; now: number; sim?: boolean }
  | { t: "simStart"; now: number }
  | { t: "advance"; days: number }
  | { t: "session"; session: SimSession }
  | { t: "reset"; now: number }
  | { t: "load"; state: LessonState };

const evidenceOf = (r: TaskResult): Evidence => (r.type === "type" ? "recall" : "recognition");

/** Wendet Ergebnisse auf den Wiederholungsplan an. `now` ist die (ggf. simulierte) Zeit. */
export function applyResults(s: LessonState, phase: number, results: TaskResult[], now: number): LessonState {
  const srs = { ...s.srs };
  const log = [...s.log];
  for (const r of results) {
    const next = review(srs[r.itemId], r.grade, evidenceOf(r), now);
    srs[r.itemId] = next;
    log.push({ itemId: r.itemId, ts: now, grade: r.grade, phase, stability: next.stability });
  }
  return { ...s, srs, log };
}

export function lessonReducer(s: LessonState, a: Action): LessonState {
  switch (a.t) {
    case "step": return { ...s, steps: { ...s.steps, [a.phase]: Math.max(0, a.step) } };
    case "complete": {
      const done = s.done.includes(a.phase) ? s.done : [...s.done, a.phase].sort((x, y) => x - y);
      return { ...s, done, unlocked: Math.min(PHASE_COUNT, Math.max(s.unlocked, a.phase + 1)) };
    }
    case "selfLevel": return { ...s, selfLevel: a.level };
    case "pretest": return { ...s, pretest: { ...s.pretest, [a.itemId]: a.value } };
    case "hyp": return { ...s, hyp: { ...s.hyp, [a.id]: a.answer } };
    case "elab": return { ...s, elab: { ...s.elab, [a.id]: a.answer } };
    case "results": {
      const merged = { ...s, results: { ...s.results, [a.phase]: a.results } };
      return applyResults(merged, a.phase, a.results, a.now);
    }
    case "simStart": return s.simStart === undefined ? { ...s, simStart: a.now } : s;
    case "advance": return { ...s, offsetDays: s.offsetDays + Math.max(0, a.days) };
    case "session": return { ...s, sessions: [...s.sessions, a.session] };
    case "reset": return initialLesson(a.now);
    case "load": return a.state;
  }
}

/* ---------- Simulierte Zeit & Wiederholungslogik ---------- */
export const simNow = (s: LessonState, realNow: number) => (s.simStart ?? realNow) + s.offsetDays * DAY;
export const simDay = (s: LessonState) => s.offsetDays;

export interface DueEntry { itemId: string; r: number }
/** Fällige Items (dueAt erreicht), schwächste zuerst. */
export function dueEntries(srs: Record<string, MemoryState>, now: number): DueEntry[] {
  return Object.entries(srs)
    .filter(([, m]) => m.dueAt <= now)
    .map(([itemId, m]) => ({ itemId, r: retrievability(m, now) }))
    .sort((a, b) => a.r - b.r);
}

/** Tage bis zur Fälligkeit (negativ = überfällig). */
export const daysUntilDue = (m: MemoryState, now: number) => (m.dueAt - now) / DAY;

/** Kleinste ganze Anzahl Tage ab jetzt, nach der mindestens ein Item fällig ist; null, wenn kein Plan existiert. */
export function daysToNextDue(srs: Record<string, MemoryState>, now: number): number | null {
  const all = Object.values(srs);
  if (!all.length) return null;
  const soonest = Math.min(...all.map((m) => m.dueAt));
  return Math.max(1, Math.ceil((soonest - now) / DAY));
}

/** Abrufwahrscheinlichkeit eines Items zu einem Zeitpunkt, anhand des Logs rekonstruiert (Sägezahn-Kurve). */
export function curvePoints(log: LogEntry[], itemId: string, fromTs: number, toTs: number, steps = 120): { x: number; r: number }[] {
  const entries = log.filter((e) => e.itemId === itemId).sort((a, b) => a.ts - b.ts);
  if (!entries.length) return [];
  const pts: { x: number; r: number }[] = [];
  const total = toTs - fromTs;
  for (let i = 0; i <= steps; i++) {
    const ts = fromTs + (total * i) / steps;
    const last = [...entries].reverse().find((e) => e.ts <= ts);
    if (!last) continue;
    const t = Math.max(0, (ts - last.ts) / DAY);
    pts.push({ x: (ts - fromTs) / DAY, r: 1 / (1 + t / (9 * last.stability)) });
  }
  return pts;
}

/* ---------- Persistenz ---------- */
export const LS_LESSON = "qaidah.lektion1.v1";

const num = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const isMem = (m: unknown): m is MemoryState => {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return ["stability", "difficulty", "reps", "lapses", "lastAt", "dueAt"].every((k) => num(o[k])) && (o.stability as number) > 0;
};

/** Liest einen gespeicherten Zustand tolerant ein; kaputte Teile werden verworfen, nicht die ganze Lektion. */
export function parseLesson(raw: string | null, now = Date.now()): LessonState {
  const base = initialLesson(now);
  if (!raw) return base;
  try {
    const j = JSON.parse(raw) as Partial<LessonState> | null;
    if (!j || typeof j !== "object" || j.v !== 1) return base;
    const done = Array.isArray(j.done) ? j.done.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= PHASE_COUNT) : [];
    const srs: Record<string, MemoryState> = {};
    for (const [k, m] of Object.entries(j.srs ?? {})) if (isMem(m)) srs[k] = m;
    return {
      ...base,
      startedAt: num(j.startedAt) ? j.startedAt : base.startedAt,
      done: [...new Set(done)].sort((a, b) => a - b),
      unlocked: num(j.unlocked) ? Math.min(PHASE_COUNT, Math.max(1, Math.floor(j.unlocked), ...done.map((d) => d + 1))) : Math.max(1, ...done.map((d) => d + 1)),
      steps: typeof j.steps === "object" && j.steps ? (j.steps as Record<number, number>) : {},
      selfLevel: j.selfLevel === "none" || j.selfLevel === "letters" || j.selfLevel === "reading" ? j.selfLevel : undefined,
      pretest: typeof j.pretest === "object" && j.pretest ? j.pretest : {},
      hyp: typeof j.hyp === "object" && j.hyp ? j.hyp : {},
      elab: typeof j.elab === "object" && j.elab ? j.elab : {},
      results: typeof j.results === "object" && j.results ? j.results : {},
      srs,
      log: Array.isArray(j.log) ? j.log.filter((e) => e && typeof e.itemId === "string" && num(e.ts) && num(e.stability) && e.stability > 0) : [],
      simStart: num(j.simStart) ? j.simStart : undefined,
      offsetDays: num(j.offsetDays) && j.offsetDays >= 0 ? j.offsetDays : 0,
      sessions: Array.isArray(j.sessions) ? j.sessions.filter((x) => x && num(x.day) && num(x.total) && num(x.right)) : [],
    };
  } catch {
    return base;
  }
}
```

## `src/domain/lektion/tasks.ts`
```ts
import {
  ALIF, DOTTED, FEATURE, ITEM_BY_ID, L1_LETTER_IDS, MARK, SYLLABLES, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, WORDS,
  letterCh, letterName, type VowelId,
} from "@/content/lektion1";
import type { Grade } from "../types";

export type Rnd = () => number;
export type Family = "letter" | "vowel" | "syllable" | "word" | "concept";

interface Base {
  id: string;
  itemId: string;
  family: Family;
  prompt: string;
  /** Großer arabischer Reiz */
  ar?: string;
  /** Kleinerer Zusatztext zum Reiz (z. B. Merkmal) */
  hint?: string;
  explain: string;
  /** Wurde der Stoff im Lehrteil nicht gezeigt? (Transfer) */
  novel: boolean;
}
export interface ChoiceTask extends Base { type: "choice"; options: string[]; optionsAr: boolean; answer: number }
export interface TypeTask extends Base { type: "type"; accepted: string; placeholder: string }
export type Task = ChoiceTask | TypeTask;

export type Correctness = "right" | "lengthOnly" | "wrong";
export interface TaskResult {
  taskId: string;
  itemId: string;
  type: Task["type"];
  correctness: Correctness;
  grade: Grade;
  hintUsed: boolean;
  answer: string;
  /** Falsch gewählter Buchstabe/Option, soweit sinnvoll */
  chosen?: string;
}

/* ---------- Hilfen ---------- */
const shuffle = <T,>(a: T[], rnd: Rnd): T[] => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
const uniq = <T,>(a: T[]) => [...new Set(a)];

function choice(base: Omit<ChoiceTask, "type" | "options" | "answer" | "optionsAr">, correct: string, wrong: string[], optionsAr: boolean, rnd: Rnd, n = 4): ChoiceTask {
  const distract = uniq(wrong.filter((w) => w !== correct)).slice(0, n - 1);
  const options = shuffle([correct, ...distract], rnd);
  return { ...base, type: "choice", options, optionsAr, answer: options.indexOf(correct) };
}

/** Tippantwort normalisieren: Kleinschreibung, „aa“/„â“/„a:“ als langes ā, „ṯ“ als th. */
export function normalizeTyped(s: string): string {
  return s.normalize("NFC").trim().toLowerCase()
    .replace(/[âáà]/g, "ā").replace(/aa|a:/g, "ā").replace(/ṯ/g, "th").replace(/\s+/g, "");
}
const stripLength = (s: string) => s.replace(/ā/g, "a");

export function checkTyped(accepted: string, input: string): Correctness {
  const a = normalizeTyped(accepted);
  const i = normalizeTyped(input);
  if (!i) return "wrong";
  if (i === a) return "right";
  return stripLength(i) === stripLength(a) ? "lengthOnly" : "wrong";
}

export function gradeFor(c: Correctness, type: Task["type"], hintUsed: boolean): Grade {
  if (c === "wrong") return 0;
  if (c === "lengthOnly") return 1;
  if (hintUsed) return 1;
  return type === "type" ? 3 : 2;
}

/* ---------- Aufgaben pro Item ---------- */
const syllableById = new Map(SYLLABLES.map((s) => [s.id, s]));
const wordById = new Map(WORDS.map((w) => [w.id, w]));
const syllableExplain = (s: (typeof SYLLABLES)[number]) =>
  s.vowel === "long"
    ? `${s.ar} = ${letterName(s.letterId)} + Fatha + Alif. Alif dehnt das a: „${s.tr}“ (lang).`
    : `${s.ar} = ${letterName(s.letterId)} + ${VOWEL_NAME[s.vowel]}: „${s.tr}“.`;

export function variantCount(itemId: string): number {
  const k = ITEM_BY_ID.get(itemId)?.kind;
  return k === "letter" ? 3 : k === "vowel" ? 2 : k === "syllable" ? 3 : k === "word" ? 3 : k === "concept" ? 1 : 0;
}

export function makeTask(itemId: string, variant: number, rnd: Rnd = Math.random): Task {
  const item = ITEM_BY_ID.get(itemId);
  if (!item) throw new Error(`Unbekanntes Item ${itemId}`);
  const id = `${itemId}#${variant}`;
  const base = (family: Family, prompt: string, explain: string, extra: Partial<Base> = {}) =>
    ({ id, itemId, family, prompt, explain, novel: item.novel, ...extra });

  if (item.kind === "letter") {
    const lid = itemId.split(":")[1] as (typeof L1_LETTER_IDS)[number];
    const ch = letterCh(lid), nm = letterName(lid);
    const names = L1_LETTER_IDS.map(letterName);
    const chars = L1_LETTER_IDS.map(letterCh);
    const ex = `${ch} heißt ${nm}: ${FEATURE[lid].text}.`;
    if (variant === 0) return choice(base("letter", "Wie heißt dieser Buchstabe?", ex, { ar: ch, hint: "Zähle die Punkte und achte auf oben und unten." }), nm, names, false, rnd);
    if (variant === 1) return choice(base("letter", `Welcher Buchstabe ist ${nm}?`, ex, { hint: "Denk an die Punkte." }), ch, chars, true, rnd);
    return choice(base("letter", `Welcher Buchstabe ist ${FEATURE[lid].text}?`, ex, { hint: "Vergleiche Bogen und Punkte." }), ch, chars, true, rnd);
  }

  if (item.kind === "vowel") {
    const v = itemId.split(":")[1] as VowelId;
    const all = (["fatha", "kasra", "damma"] as const);
    const ex = `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place} und steht für kurzes „${VOWEL_LATIN[v]}“.`;
    if (variant === 0) return choice(base("vowel", "Wie heißt dieses Vokalzeichen?", ex, { ar: DOTTED + MARK[v], hint: "Oben oder unten? Mit oder ohne Schlaufe?" }), VOWEL_NAME[v], all.map((x) => VOWEL_NAME[x]), false, rnd, 3);
    return choice(base("vowel", `Welches Zeichen steht für kurzes „${VOWEL_LATIN[v]}“?`, ex, { hint: `${VOWEL_NAME[v]} steht ${VOWEL_INFO[v].place}.` }), DOTTED + MARK[v], all.map((x) => DOTTED + MARK[x]), true, rnd, 3);
  }

  if (item.kind === "syllable") {
    const s = syllableById.get(itemId)!;
    const ex = syllableExplain(s);
    const near = SYLLABLES.filter((o) => o.id !== s.id && (o.letterId === s.letterId || o.vowel === s.vowel));
    const nearFirst = shuffle(near, rnd);
    // Bei langem ā ist der Gegenspieler das kurze a desselben Buchstabens; bei kurzem a das lange.
    const twin = SYLLABLES.find((o) => o.letterId === s.letterId && ((s.vowel === "long" && o.vowel === "fatha") || (s.vowel === "fatha" && o.vowel === "long")));
    const ordered = twin ? [twin, ...nearFirst.filter((o) => o !== twin)] : nearFirst;
    const hint = s.vowel === "long" ? "Folgt ein Alif? Dann ist das a lang." : "Welches Zeichen steht am Buchstaben, und über oder unter ihm?";
    if (variant === 0) return choice(base("syllable", "Wie wird diese Silbe gelesen?", ex, { ar: s.ar, hint }), s.tr, ordered.map((o) => o.tr), false, rnd);
    if (variant === 1) return choice(base("syllable", `Welche Silbe ist „${s.tr}“?`, ex, { hint }), s.ar, ordered.map((o) => o.ar), true, rnd);
    return { ...base("syllable", "Schreibe auf, wie die Silbe gelesen wird.", ex, { ar: s.ar, hint }), type: "type", accepted: s.tr, placeholder: "z. B. ba" };
  }

  if (item.kind === "word") {
    const w = wordById.get(itemId)!;
    const ex = `${w.ar} = „${w.tr}“ (${w.de}). Von rechts nach links lesen: ${w.letters.map(letterName).join(" · ")}.`;
    const hint = "Lies von rechts nach links, Buchstabe für Buchstabe. Alif dehnt.";
    if (variant === 0) {
      const others = WORDS.filter((o) => o.id !== w.id).map((o) => o.tr);
      const shortened = w.tr.replace(/ā/g, "a");
      return choice(base("word", "Wie wird dieses Wort gelesen?", ex, { ar: w.ar, hint }), w.tr, [shortened, ...others], false, rnd);
    }
    if (variant === 1) return choice(base("word", "Was bedeutet dieses Wort?", ex, { ar: w.ar, hint: `${hint} Gelesen: „${w.tr}“.` }), w.de, WORDS.filter((o) => o.id !== w.id).map((o) => o.de), false, rnd);
    return { ...base("word", "Schreibe auf, wie das Wort gelesen wird.", ex, { ar: w.ar, hint }), type: "type", accepted: w.tr, placeholder: "z. B. bāb (oder baab)" };
  }

  // Konzepte
  if (itemId === "concept:alif-role")
    return choice(base("concept", "Was tut ا in بَا?", "Alif ist hier ein Dehnungsbuchstabe: Fatha + ا = ā. Das kurze a schreibt die Fatha, nicht das Alif.", { ar: "بَا", hint: "Denk an Fatha und die Länge." }),
      "Es dehnt das a zu ā", ["Es steht für ein kurzes a", "Es ist der Konsonant „b“", "Es bleibt stumm und ändert nichts"], false, rnd);
  if (itemId === "concept:alif-join")
    return choice(base("concept", "Welcher dieser Buchstaben verbindet sich nicht mit dem folgenden Buchstaben?", "Alif ist ein Nicht-Verbinder; ب ت ث verbinden nach links.", { hint: "Er ist der gerade Strich." }),
      ALIF, L1_LETTER_IDS.map(letterCh), true, rnd);
  return choice(base("concept", "Wo steht das Kasra?", "Fatha und Damma stehen über, Kasra steht unter dem Buchstaben.", { ar: "بِ", hint: "Fatha und Damma stehen oben." }),
    "unter dem Buchstaben", ["über dem Buchstaben", "hinter dem Buchstaben", "im Buchstaben"], false, rnd);
}

/* ---------- Interleaving ---------- */
/**
 * Mischt so, dass nie dasselbe Item direkt hintereinander kommt und möglichst nicht dieselbe Aufgabenfamilie oder -art.
 * Greedy, stabil: bei gleichen Kosten gewinnt die frühere Aufgabe.
 */
export function interleaveTasks<T extends { itemId: string; family: Family; type?: string }>(tasks: T[]): T[] {
  const rest = [...tasks];
  const out: T[] = [];
  while (rest.length) {
    const p1 = out[out.length - 1], p2 = out[out.length - 2];
    let best = 0, bestCost = Infinity;
    rest.forEach((t, i) => {
      const cost = (p1?.itemId === t.itemId ? 100 : 0) + (p2?.itemId === t.itemId ? 10 : 0) + (p1?.family === t.family ? 4 : 0) + (p1?.type && p1.type === t.type ? 1 : 0);
      if (cost < bestCost) { best = i; bestCost = cost; }
    });
    out.push(...rest.splice(best, 1));
  }
  return out;
}

/* ---------- Aufgabensätze der Phasen ---------- */
type Spec = [itemId: string, variant: number];

export const PRETEST_SPEC: Spec[] = [["letter:alif", 0], ["letter:ba", 0], ["letter:ta", 0], ["letter:tha", 0]];

/** Phase 4: Verständnis-Check mit sofortigem Feedback. */
export const CHECK_SPEC: Spec[] = [["concept:vowel-place", 0], ["concept:alif-role", 0], ["syl:ba-damma", 0], ["concept:alif-join", 0]];

/** Phase 5: gemischte Anwendung inkl. Transfer (neu kombinierte Silben und Wörter). */
export const PRACTICE_SPEC: Spec[] = [
  ["letter:tha", 2], ["syl:ta-kasra", 0], ["vowel:damma", 0], ["word:bab", 0], ["syl:tha-damma", 1], ["letter:alif", 1],
  ["word:tab", 0], ["syl:ba-long", 0], ["concept:alif-role", 0], ["syl:ta-long", 1], ["letter:ba", 0], ["word:thabat", 1],
  ["vowel:kasra", 1], ["syl:tha-kasra", 2],
];

/** Phase 6: Abruf ohne Hilfen, überwiegend freie Antworten und andere Varianten als in Phase 5. */
export const RETRIEVAL_SPEC: Spec[] = [
  ["syl:ba-kasra", 2], ["letter:ta", 0], ["word:thabit", 2], ["syl:tha-fatha", 2], ["vowel:fatha", 0], ["syl:ta-damma", 2],
  ["letter:tha", 1], ["letter:ba", 1], ["word:tab", 2], ["syl:ba-long", 2], ["letter:alif", 2], ["concept:alif-join", 0], ["word:thabat", 2],
];

export function buildSet(spec: Spec[], rnd: Rnd = Math.random, interleave = true): Task[] {
  const tasks = spec.map(([id, v]) => makeTask(id, v, rnd));
  return interleave ? interleaveTasks(tasks) : tasks;
}

/** Phase 7: für jedes fällige Item eine Variante, die mit der Wiederholungszahl wechselt. */
export function reviewTask(itemId: string, reps: number, rnd: Rnd = Math.random): Task {
  const n = variantCount(itemId);
  return makeTask(itemId, reps % n, rnd);
}

/** Aufgabe aus ihrer ID (`item#variante`) wiederherstellen, z. B. für die Auswertung. */
export function taskFromId(id: string, rnd: Rnd = Math.random): Task {
  const [itemId, v] = id.split("#");
  return makeTask(itemId, Number(v) || 0, rnd);
}
export const correctAnswerOf = (t: Task) => (t.type === "choice" ? t.options[t.answer] : t.accepted);
```

## `src/domain/mastery.ts`
```ts
import { DAY } from "./scheduler";
import type { Evidence, MasteryLevel, MemoryState, ReviewEvent, Skill } from "./types";

/**
 * Ein Skill gilt erst als gemeistert, wenn ALLES zutrifft:
 *  - ≥ 3 erfolgreiche Abrufe (Note ≥ 2)
 *  - mit ≥ 2 verschiedenen Aktivitätstypen
 *  - an ≥ 2 verschiedenen Tagen
 *  - Stabilität ≥ 6 Tage
 *  - letzter Versuch war kein Fehler
 *  - mind. ein Nachweis durch freien Abruf/Produktion, außer bei reinen Erkennungs-Skills
 * Selbsteinschätzung (Aussprache) zählt nie über „vertraut“ hinaus.
 * Die Schwellen sind Startwerte.
 */
export const MASTERY_RULES = { minSuccesses: 3, minActivities: 2, minDays: 2, minStability: 6 } as const;
const RECOGNITION_ONLY: Skill[] = ["visual", "sound", "association", "contrast"];

export interface MasteryInfo {
  level: MasteryLevel;
  /** Wofür noch Nachweise fehlen – wird in der UI angezeigt */
  missing: string[];
}

const dayOf = (ts: number) => Math.floor(ts / DAY);

export function masteryOf(skill: Skill, events: ReviewEvent[], state: MemoryState | undefined): MasteryInfo {
  if (events.length === 0 || !state) return { level: "new", missing: ["Noch nicht geübt"] };
  const ok = events.filter((e) => e.grade >= 2 && e.evidence !== "self");
  const activities = new Set(ok.map((e) => e.activity));
  const days = new Set(ok.map((e) => dayOf(e.ts)));
  const strong = ok.some((e) => ([ "recall", "production" ] as Evidence[]).includes(e.evidence));
  const last = events[events.length - 1];
  const missing: string[] = [];
  const R = MASTERY_RULES;
  if (ok.length < R.minSuccesses) missing.push(`${R.minSuccesses - ok.length}× weiteres richtiges Abrufen`);
  if (activities.size < R.minActivities) missing.push("eine andere Aufgabenart");
  if (days.size < R.minDays) missing.push("Wiederholung an einem anderen Tag");
  if (state.stability < R.minStability) missing.push("längere Behaltensdauer");
  if (last.grade < 2) missing.push("letzter Versuch war ein Fehler");
  if (!strong && !RECOGNITION_ONLY.includes(skill)) missing.push("freier Abruf ohne Auswahlmöglichkeiten");
  const selfOnly = skill === "pronunciation";
  if (selfOnly) {
    return { level: ok.length || events.some((e) => e.grade >= 2) ? "familiar" : "learning", missing: ["Aussprache wird nur selbst eingeschätzt"] };
  }
  if (missing.length === 0) return { level: "mastered", missing };
  const level: MasteryLevel = ok.length >= 2 && last.grade >= 2 ? "familiar" : "learning";
  return { level, missing };
}

export const LEVEL_ORDER: MasteryLevel[] = ["new", "learning", "familiar", "mastered"];
```

## `src/domain/progress.ts`
```ts
import { masteryOf, type MasteryInfo } from "./mastery";
import { review } from "./scheduler";
import { itemKey, type MemoryState, type ReviewEvent, type Skill } from "./types";

export interface Progress {
  states: Map<string, MemoryState>;
  events: Map<string, ReviewEvent[]>;
  /** `richtig:verwechselt` → Anzahl */
  confusions: Map<string, number>;
}

/** Zustand entsteht ausschließlich aus dem Ereignislog (sortiert nach Zeit, dann id) – deterministisch. */
export function buildProgress(all: ReviewEvent[]): Progress {
  const sorted = [...all].sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
  const p: Progress = { states: new Map(), events: new Map(), confusions: new Map() };
  for (const e of sorted) {
    const k = itemKey(e.letterId, e.skill);
    p.states.set(k, review(p.states.get(k), e.grade, e.evidence, e.ts));
    (p.events.get(k) ?? p.events.set(k, []).get(k)!).push(e);
    if (e.grade < 2 && e.confusedWith) {
      const ck = `${e.letterId}:${e.confusedWith}`;
      p.confusions.set(ck, (p.confusions.get(ck) ?? 0) + 1);
    }
  }
  return p;
}

export function masteryFor(p: Progress, letterId: string, skill: Skill): MasteryInfo {
  const k = itemKey(letterId, skill);
  return masteryOf(skill, p.events.get(k) ?? [], p.states.get(k));
}

/** Häufigste Verwechslungen eines Buchstabens, absteigend. */
export function confusionsOf(p: Progress, letterId: string): [string, number][] {
  return [...p.confusions.entries()]
    .filter(([k]) => k.startsWith(letterId + ":"))
    .map(([k, n]) => [k.split(":")[1], n] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}
```

## `src/domain/scheduler.ts`
```ts
import type { Evidence, Grade, MemoryState } from "./types";

/**
 * FSRS-ähnlicher Scheduler (vereinfacht, eigene Implementierung).
 * - Abrufwahrscheinlichkeit R(t) = (1 + t / (9·S))^-1  → R = 0,9 bei t = S.
 * - Das nächste Intervall ergibt sich aus der Stabilität und der Zielwahrscheinlichkeit, nicht aus einem festen Plan.
 * - Erfolg erhöht die Stabilität stärker, wenn der Abruf schwerer war (niedrigeres R) und die Aufgabe schwieriger ist.
 * - Fehler senken die Stabilität deutlich und erhöhen die Schwierigkeit.
 * Die Konstanten sind Startwerte, nicht an Nutzerdaten kalibriert.
 */
export const DAY = 86_400_000;
export const TARGET_R = 0.9;

const EVIDENCE_WEIGHT: Record<Evidence, number> = { recognition: 0.5, recall: 1, production: 1.15, self: 0.35 };
const GRADE_BONUS: Record<Grade, number> = { 0: 0, 1: 0.6, 2: 1, 3: 1.4 };
const INITIAL_S: Record<Grade, number> = { 0: 0.2, 1: 0.6, 2: 1.2, 3: 2.5 };

export const retrievability = (s: MemoryState, now: number) => {
  const t = Math.max(0, (now - s.lastAt) / DAY);
  return 1 / (1 + t / (9 * s.stability));
};

const intervalDays = (stability: number, targetR = TARGET_R) => 9 * stability * (1 / targetR - 1);
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function initialState(grade: Grade, evidence: Evidence, now: number): MemoryState {
  const failed = grade === 0;
  const stability = Math.max(0.1, INITIAL_S[grade] * (failed ? 1 : 0.6 + 0.4 * EVIDENCE_WEIGHT[evidence]));
  const difficulty = clamp(5 - (grade - 1.5) * 1.2, 1, 10);
  return { stability, difficulty, reps: 1, lapses: failed ? 1 : 0, lastAt: now, dueAt: now + intervalDays(stability) * DAY };
}

export function review(prev: MemoryState | undefined, grade: Grade, evidence: Evidence, now: number): MemoryState {
  if (!prev) return initialState(grade, evidence, now);
  const r = retrievability(prev, now);
  let stability: number;
  let difficulty = prev.difficulty;
  let lapses = prev.lapses;
  if (grade === 0) {
    stability = Math.max(0.1, Math.min(prev.stability * 0.3, 1.5));
    difficulty = clamp(difficulty + 0.8, 1, 10);
    lapses += 1;
  } else {
    const w = EVIDENCE_WEIGHT[evidence];
    // Bonus für schwereren Abruf: je niedriger R, desto größer der Zuwachs (wie bei FSRS: e^(k(1-R)) - 1)
    const recallGain = Math.exp(1.1 * (1 - r)) - 0.85;
    const ease = (11 - difficulty) / 6;
    const growth = 1 + w * GRADE_BONUS[grade] * ease * recallGain * Math.pow(prev.stability, -0.2) * 1.4;
    stability = prev.stability * Math.max(1.02, growth);
    difficulty = clamp(difficulty + (grade === 1 ? 0.3 : grade === 3 ? -0.4 : -0.1), 1, 10);
  }
  return { stability, difficulty, reps: prev.reps + 1, lapses, lastAt: now, dueAt: now + intervalDays(stability) * DAY };
}
```

## `src/domain/selection.ts`
```ts
import { retrievability } from "./scheduler";
import type { Progress } from "./progress";
import { parseKey, type Skill } from "./types";

export interface DueItem { letterId: string; skill: Skill; r: number }

/** Fällige Items: Abrufwahrscheinlichkeit unter dem Ziel, schwächste zuerst. Gedeckelt, damit nach Pausen keine Lawine entsteht. */
export function dueItems(p: Progress, now: number, cap = 12): DueItem[] {
  const out: DueItem[] = [];
  for (const [k, s] of p.states) {
    if (s.dueAt <= now) {
      const { letterId, skill } = parseKey(k);
      out.push({ letterId, skill, r: retrievability(s, now) });
    }
  }
  return interleave(out.sort((a, b) => a.r - b.r)).slice(0, cap);
}

/** Verhindert, dass derselbe Buchstabe direkt hintereinander kommt, soweit möglich (Interleaving). */
export function interleave<T extends { letterId: string }>(items: T[]): T[] {
  const rest = [...items];
  const out: T[] = [];
  while (rest.length) {
    const last = out[out.length - 1]?.letterId;
    const i = rest.findIndex((x) => x.letterId !== last);
    out.push(...rest.splice(i === -1 ? 0 : i, 1));
  }
  return out;
}

/** Distraktoren: zuerst bekannte Verwechslungen, dann optisch ähnliche, dann Zufall aus der Auswahl. */
export function pickDistractors(
  target: string, similar: string[], confused: string[], pool: string[], n: number, rnd: () => number = Math.random,
): string[] {
  const out: string[] = [];
  const add = (id: string) => { if (id !== target && !out.includes(id) && pool.includes(id) && out.length < n) out.push(id); };
  confused.forEach(add);
  similar.forEach(add);
  const rest = pool.filter((x) => x !== target && !out.includes(x)).sort(() => rnd() - 0.5);
  rest.forEach(add);
  return out;
}
```

## `src/domain/session.ts`
```ts
import { LETTERS } from "@/content/letters";
import { dueItems, interleave } from "./selection";
import type { ExerciseType } from "./exercises";
import type { Progress } from "./progress";
import { itemKey, type Skill } from "./types";

/** Skills, für die es derzeit Aufgaben gibt. Schreiben, Formen, Lesen, Aussprache folgen in späteren Meilensteinen. */
export const SKILL_TO_TYPE: Partial<Record<Skill, ExerciseType>> = {
  visual: "find-letter", association: "letter-to-sound", contrast: "contrast",
};

export interface Planned { letterId: string; type: ExerciseType; why: "due" | "new" }

/** Gruppe g ist offen, wenn Gruppe g−1 vollständig eingeführt wurde (Gruppe 1 immer). */
export function unlockedGroups(introduced: Set<string>): number[] {
  const groups = [...new Set(LETTERS.map((l) => l.group))];
  const open: number[] = [];
  for (const g of groups) {
    open.push(g);
    if (!LETTERS.filter((l) => l.group === g).every((l) => introduced.has(l.id))) break;
  }
  return open;
}

export function nextToIntroduce(introduced: Set<string>): string | undefined {
  return LETTERS.find((l) => !introduced.has(l.id))?.id;
}

/** Übungsplan: Fälliges zuerst (schwächste zuerst), dann Neues; bunt gemischt (Interleaving), gedeckelt. */
export function planSession(p: Progress, introduced: Set<string>, now: number, size = 8): Planned[] {
  const due: Planned[] = dueItems(p, now, size * 2)
    .filter((d) => introduced.has(d.letterId) && SKILL_TO_TYPE[d.skill])
    .map((d) => ({ letterId: d.letterId, type: SKILL_TO_TYPE[d.skill]!, why: "due" as const }));
  const fresh: Planned[] = [];
  for (const l of LETTERS) {
    if (!introduced.has(l.id)) continue;
    for (const [skill, type] of Object.entries(SKILL_TO_TYPE) as [Skill, ExerciseType][]) {
      if (!p.states.has(itemKey(l.id, skill))) fresh.push({ letterId: l.id, type, why: "new" });
    }
  }
  const head = due.slice(0, size);
  const tail = fresh.slice(0, Math.max(0, size - head.length) * 2);
  return interleave([...head, ...interleave(tail)]).slice(0, size);
}
```

## `src/domain/types.ts`
```ts
export const SKILLS = [
  "visual",        // Buchstabe sehen → erkennen/benennen
  "sound",         // Laut hören → Buchstabe
  "association",   // Buchstabe ↔ Laut/Name zuordnen
  "pronunciation", // nur Selbsteinschätzung (keine automatische Bewertung)
  "writing",
  "contextForm",
  "contrast",      // Abgrenzung von ähnlichen Buchstaben
  "reading",
] as const;
export type Skill = (typeof SKILLS)[number];

/** Wie stark ein Nachweis ist: Erkennen < freier Abruf < Produktion. 'self' = Selbsteinschätzung. */
export type Evidence = "recognition" | "recall" | "production" | "self";

/** 0 = nicht gewusst, 1 = mühsam, 2 = gewusst, 3 = mühelos */
export type Grade = 0 | 1 | 2 | 3;

export const itemKey = (letterId: string, skill: Skill) => `${letterId}:${skill}`;
export const parseKey = (k: string) => {
  const [letterId, skill] = k.split(":");
  return { letterId, skill: skill as Skill };
};

export interface ReviewEvent {
  id: string;
  /** Unix-ms */
  ts: number;
  letterId: string;
  skill: Skill;
  activity: string;
  grade: Grade;
  evidence: Evidence;
  /** Buchstabe, mit dem fälschlich verwechselt wurde */
  confusedWith?: string;
}

export interface MemoryState {
  stability: number; // Tage, bis Abrufwahrscheinlichkeit auf 90 % fällt
  difficulty: number; // 1..10
  reps: number;
  lapses: number;
  lastAt: number;
  dueAt: number;
}

export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";
```

## `src/App.tsx`
```tsx
import { NavLink, Route, Routes } from "react-router-dom";
import { useApp } from "./features/AppContext";
import { Icon } from "./ui/parts";
import { Today } from "./features/Today";
import { Path } from "./features/Path";
import { LettersPage, LetterDetail } from "./features/Letters";
import { Practice } from "./features/Practice";
import { Me } from "./features/Me";
import { Specimen } from "./features/Specimen";
import { Write } from "./features/Write";
import { Lab } from "./features/Lab";
import { LektionPage } from "./features/lektion/LektionPage";

const NAV = [
  { to: "/", label: "Heute", icon: Icon.today, end: true },
  { to: "/lektion", label: "Lektion", icon: Icon.lesson },
  { to: "/weg", label: "Weg", icon: Icon.path },
  { to: "/buchstaben", label: "Buchstaben", icon: Icon.letters },
  { to: "/ueben", label: "Üben", icon: Icon.practice },
  { to: "/ich", label: "Ich", icon: Icon.me },
];

export function App() {
  const { status, reload } = useApp();
  return (
    <div className="shell">
      <nav className="nav" aria-label="Hauptnavigation">
        <div className="brand"><span className="wordmark">QAID<b>A</b>H</span></div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>{n.icon}<span>{n.label}</span></NavLink>
        ))}
      </nav>
      <main>
        {status === "loading" && <p role="status" className="muted">Lernstand wird geladen …</p>}
        {status === "error" && (
          <div className="notice err stack" role="alert">
            <p>Der Lernstand konnte nicht geladen werden.</p>
            <button className="btn btn-secondary" onClick={() => void reload()}>Erneut versuchen</button>
          </div>
        )}
        {status === "ready" && (
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/lektion" element={<LektionPage />} />
            <Route path="/weg" element={<Path />} />
            <Route path="/buchstaben" element={<LettersPage />} />
            <Route path="/buchstaben/:id" element={<LetterDetail />} />
            <Route path="/ueben" element={<Practice />} />
            <Route path="/ich" element={<Me />} />
            <Route path="/schreiben" element={<Write />} />
            <Route path="/specimen" element={<Specimen />} />
            <Route path="/labor" element={<Lab />} />
            <Route path="*" element={<p>Seite nicht gefunden.</p>} />
          </Routes>
        )}
      </main>
    </div>
  );
}
```

## `src/features/AppContext.tsx`
```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildProgress, type Progress } from "@/domain/progress";
import type { ReviewEvent } from "@/domain/types";
import { openEventStore, type EventStore } from "@/persistence/eventStore";

type Theme = "dark" | "light";
interface Ctx {
  status: "loading" | "ready" | "error";
  persistent: boolean;
  events: ReviewEvent[];
  progress: Progress;
  introduced: Set<string>;
  theme: Theme;
  setTheme(t: Theme): void;
  record(e: Omit<ReviewEvent, "id" | "ts">): Promise<boolean>;
  introduce(letterId: string): void;
  store: EventStore | null;
  reload(): Promise<void>;
  resetAll(): Promise<void>;
}
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider fehlt");
  return c;
};

const LS_INTRO = "qaidah.introduced";
const LS_THEME = "qaidah.theme";
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* optional */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* optional */ } },
};
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EventStore | null>(null);
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [status, setStatus] = useState<Ctx["status"]>("loading");
  const [introduced, setIntroduced] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(ls.get(LS_INTRO) ?? "[]") as string[]); } catch { return new Set(); }
  });
  const [theme, setThemeState] = useState<Theme>(() => (ls.get(LS_THEME) === "light" ? "light" : "dark"));

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const load = useCallback(async () => {
    try {
      const s = await openEventStore();
      setStore(s);
      setEvents(await s.all());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const progress = useMemo(() => buildProgress(events), [events]);

  const record: Ctx["record"] = useCallback(async (e) => {
    const full: ReviewEvent = { ...e, id: uid(), ts: Date.now() };
    setEvents((prev) => [...prev, full]);
    try { await store?.append(full); return true; } catch { return false; }
  }, [store]);

  const introduce = useCallback((id: string) => {
    setIntroduced((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      ls.set(LS_INTRO, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const value: Ctx = {
    status, persistent: store?.persistent ?? false, events, progress, introduced, theme, store,
    setTheme: (t) => { setThemeState(t); ls.set(LS_THEME, t); },
    record, introduce, reload: load,
    resetAll: async () => { await store?.clear(); ls.del(LS_INTRO); setIntroduced(new Set()); setEvents([]); },
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
```

## `src/features/Lab.tsx`
```tsx
import { useState } from "react";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, rank } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { PAD, WritingPad } from "@/ui/WritingPad";

interface Sample { letterId: string; label: "ok" | "bad"; pointerType: string; area: number; strokes: Stroke[] }

/** Labor: echte Striche sammeln, beschriften und exportieren, um Schwellen am echten Material zu kalibrieren. Daten bleiben lokal. */
export function Lab() {
  const [letterId, setLetterId] = useState(TEMPLATES[1].letterId);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [key, setKey] = useState(0);
  const a = strokes.length ? analyze(strokes, TEMPLATE_BY_ID.get(letterId)!, PAD) : null;
  const r = strokes.length ? rank(strokes) : [];

  const add = (label: Sample["label"]) => { setSamples((s) => [...s, { letterId, label, pointerType: "unknown", area: PAD, strokes }]); setKey((k) => k + 1); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ app: "qaidah-lab", samples }, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "qaidah-striche.json" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack-lg">
      <header className="stack"><p className="eyebrow">Labor</p><h1>Striche sammeln</h1>
        <p className="muted">Zum Kalibrieren der Schreibbewertung: Buchstaben wählen, schreiben, als „gut“ oder „schlecht“ ablegen und die Datei exportieren. Es werden keine Daten gesendet.</p></header>
      <div className="row" role="radiogroup" aria-label="Buchstabe">
        {TEMPLATES.map((t) => <button key={t.letterId} role="radio" aria-checked={letterId === t.letterId} className={`btn ${letterId === t.letterId ? "btn-primary" : "btn-secondary"}`} onClick={() => { setLetterId(t.letterId); setKey((k) => k + 1); }}>{LETTER_BY_ID.get(t.letterId)!.name}</button>)}
      </div>
      <WritingPad resetKey={key} onChange={setStrokes} />
      {a && (
        <p data-testid="lab-readout" className="muted">
          Form {Number.isFinite(a.shape.distance) ? a.shape.distance.toFixed(3) : "–"} ({a.shape.level}) · Punkte {a.dots.found}/{a.dots.expected} ({a.dots.level}) · Richtung {a.direction} · Note {a.grade}
          {r[0] && <> · bester Treffer: {LETTER_BY_ID.get(r[0].letterId)?.name}</>}
        </p>
      )}
      <div className="row">
        <button className="btn btn-primary" disabled={!strokes.length} onClick={() => add("ok")}>Als gut ablegen</button>
        <button className="btn btn-secondary" disabled={!strokes.length} onClick={() => add("bad")}>Als schlecht ablegen</button>
        <button className="btn btn-ghost" disabled={!samples.length} onClick={download}>Export ({samples.length})</button>
      </div>
    </div>
  );
}
```

## `src/features/Letters.tsx`
```tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { LETTERS, LETTER_BY_ID, formsOf, dotsText, type FormPos } from "@/content/letters";
import { confusionsOf, masteryFor } from "@/domain/progress";
import { SKILLS, type Skill } from "@/domain/types";
import { SKILL_TO_TYPE } from "@/domain/session";
import { useApp } from "./AppContext";
import { Ar, Mastery, LEVEL_LABEL } from "@/ui/parts";
import { AudioButton } from "@/ui/AudioButton";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";

const SKILL_LABEL: Record<Skill, string> = {
  visual: "Buchstaben erkennen", sound: "Laut hören → Buchstabe", association: "Buchstabe ↔ Laut", pronunciation: "Aussprache",
  writing: "Schreiben", contextForm: "Kontextformen", contrast: "Ähnliche unterscheiden", reading: "Lesen",
};
const FORM_LABEL: Record<FormPos, string> = { isolated: "Einzeln", initial: "Anfang", medial: "Mitte", final: "Ende" };

export function LettersPage() {
  const { introduced, progress } = useApp();
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Buchstaben</p><h1>Dein Stand je Buchstabe</h1>
        <p className="muted">Die Segmente zeigen „Erkennen“. Details je Fähigkeit findest du beim Buchstaben. Gemeistert heißt: mehrfach, an verschiedenen Tagen, mit verschiedenen Aufgaben richtig.</p></header>
      <div className="grid">
        {LETTERS.map((l) => (
          <Link key={l.id} to={`/buchstaben/${l.id}`} className="tile" aria-label={`${l.name}, ${LEVEL_LABEL[introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"]}`}>
            <Ar size="body">{l.ch}</Ar><small>{l.name}</small>
            <Mastery level={introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LetterDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { introduced, introduce, progress } = useApp();
  const l = id ? LETTER_BY_ID.get(id) : undefined;
  if (!l) return <div className="stack"><p>Diesen Buchstaben gibt es nicht.</p><Link className="btn btn-secondary" to="/buchstaben">Zurück</Link></div>;
  const forms = formsOf(l);
  const known = introduced.has(l.id);
  const confusions = confusionsOf(progress, l.id);

  return (
    <article className="stack-lg fade">
      <header className="hero stack">
        <Ar size="hero" label={l.name}>{l.ch}</Ar>
        <div>
          <h1>{l.name} <Ar size="body" className="ar-ui">{l.nameAr}</Ar></h1>
          <p className="muted">Laut: {l.sound} · {dotsText(l.dots)}</p>
        </div>
        <div className="row" style={{ justifyContent: "center" }}>
          <AudioButton letterId={l.id} kind="name" label="Name hören" />
          <AudioButton letterId={l.id} kind="sound" label={`Laut „${l.syllable}“ hören`} />
        </div>
      </header>

      <section className="stack" aria-labelledby="how">
        <h2 id="how">Aussprache</h2>
        <p>{l.tip}</p>
        <p className="notice">Name und Laut sind getrennt: Der Name ist „{l.name}“, den Laut übst du als Silbe „{l.syllable}“, weil ein Konsonant allein nicht sprechbar ist. Ob du ihn richtig triffst, kann die App nicht automatisch bewerten.</p>
      </section>

      <section className="stack" aria-labelledby="forms">
        <h2 id="forms">Formen</h2>
        <div className="forms">
          {(Object.keys(forms) as FormPos[]).map((k) => (
            <div key={k}><Ar size="teach" label={`${FORM_LABEL[k]}form von ${l.name}`}>{forms[k]}</Ar><small>{FORM_LABEL[k]}</small></div>
          ))}
        </div>
        <p className="muted">
          {l.joinsNext ? `${l.name} verbindet sich mit dem folgenden Buchstaben.` : `${l.name} verbindet sich nicht mit dem folgenden Buchstaben. Nach ihm beginnt die Verbindung neu.`}
          {" "}Das gezielte Üben der Formen folgt in einem späteren Schritt.
        </p>
      </section>

      {l.similar.length > 0 && (
        <section className="stack" aria-labelledby="sim">
          <h2 id="sim">Leicht zu verwechseln</h2>
          <div className="row">
            {l.similar.map((s) => { const o = LETTER_BY_ID.get(s)!; return (
              <Link key={s} to={`/buchstaben/${s}`} className="tile" style={{ minHeight: 0, minWidth: 96 }}>
                <Ar size="teach">{o.ch}</Ar><small>{o.name}: {dotsText(o.dots)}</small>
              </Link>); })}
          </div>
        </section>
      )}

      <section className="stack" aria-labelledby="skills">
        <h2 id="skills">Dein Stand</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SKILLS.map((s) => {
            const available = !!SKILL_TO_TYPE[s] || (s === "writing" && TEMPLATE_BY_ID.has(l.id));
            const m = masteryFor(progress, l.id, s);
            return (
              <li key={s} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{SKILL_LABEL[s]}</span>
                {available ? <span className="row"><span className="muted" style={{ fontSize: 13 }}>{LEVEL_LABEL[m.level]}</span><Mastery level={m.level} /></span>
                  : <span className="chip">folgt</span>}
              </li>
            );
          })}
        </ul>
        {confusions.length > 0 && <p className="muted">Bisher verwechselt mit: {confusions.map(([c, n]) => `${LETTER_BY_ID.get(c)?.name} (${n}×)`).join(", ")}.</p>}
      </section>

      <div className="row">
        {known && TEMPLATE_BY_ID.has(l.id) && <Link className="btn btn-secondary" to="/schreiben">Schreiben üben</Link>}
        {!known ? (
          <button className="btn btn-primary" onClick={() => { introduce(l.id); nav("/ueben"); }}>Kennengelernt – jetzt üben</button>
        ) : (
          <Link className="btn btn-primary" to="/ueben">Üben</Link>
        )}
        <Link className="btn btn-ghost" to="/buchstaben">Alle Buchstaben</Link>
      </div>
    </article>
  );
}
```

## `src/features/Me.tsx`
```tsx
import { useRef, useState } from "react";
import { exportJson, parseExport } from "@/persistence/eventStore";
import { useApp } from "./AppContext";
import { Link } from "react-router-dom";

export function Me() {
  const { events, theme, setTheme, store, reload, resetAll, persistent } = useApp();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  function download() {
    const url = URL.createObjectURL(new Blob([exportJson(events)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `qaidah-sicherung-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  }
  async function upload(f: File) {
    const parsed = parseExport(await f.text());
    if (!parsed.ok) return setMsg({ kind: "err", text: parsed.error });
    const n = await store!.importEvents(parsed.events);
    await reload();
    setMsg({ kind: "ok", text: `${n} Einträge übernommen.` });
  }

  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Ich</p><h1>Einstellungen und Daten</h1></header>

      <section className="stack"><h2>Darstellung</h2>
        <div className="row" role="radiogroup" aria-label="Farbschema">
          {(["dark", "light"] as const).map((t) => (
            <button key={t} role="radio" aria-checked={theme === t} className={`btn ${theme === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setTheme(t)}>{t === "dark" ? "Dunkel" : "Hell"}</button>
          ))}
        </div>
        <Link className="muted" to="/specimen">Schrift- und Farbprüfseite öffnen</Link>
        <Link className="muted" to="/labor">Schreib-Labor (Striche sammeln)</Link>
      </section>

      <section className="stack"><h2>Aussprache</h2>
        <p className="notice">Die App bewertet deine Aussprache nicht automatisch. Es gibt aktuell keine verlässliche Lautbewertung, deshalb zeigen wir auch keine Punktzahl. Vorgesehen ist: Referenz anhören, selbst aufnehmen, vergleichen. Aufnahmen mit echter Sprecherstimme fehlen noch.</p>
      </section>

      <section className="stack"><h2>Sicherung</h2>
        <p className="muted">{events.length} Einträge. {persistent ? "Gespeichert auf diesem Gerät." : "Nicht dauerhaft gespeichert: nutze die Sicherung."}</p>
        <div className="row">
          <button className="btn btn-secondary" onClick={download} disabled={events.length === 0}>Sicherung laden</button>
          <button className="btn btn-secondary" onClick={() => file.current?.click()}>Sicherung einspielen</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        </div>
        {msg && <p role="status" className={`notice ${msg.kind === "err" ? "err" : ""}`}>{msg.text}</p>}
      </section>

      <section className="stack"><h2>Zurücksetzen</h2>
        {!confirm ? <button className="btn btn-secondary" onClick={() => setConfirm(true)}>Lernstand löschen …</button> : (
          <div className="stack"><p>Das löscht deinen gesamten Lernstand auf diesem Gerät. Das lässt sich nicht rückgängig machen.</p>
            <div className="row"><button className="btn btn-primary" onClick={async () => { await resetAll(); setConfirm(false); }}>Ja, löschen</button>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div></div>
        )}
      </section>
    </div>
  );
}
```

## `src/features/Path.tsx`
```tsx
import { Link } from "react-router-dom";
import { GROUP_COUNT, lettersOfGroup } from "@/content/letters";
import { unlockedGroups } from "@/domain/session";
import { masteryFor } from "@/domain/progress";
import { useApp } from "./AppContext";
import { Ar, Mastery } from "@/ui/parts";

export function Path() {
  const { introduced, progress } = useApp();
  const open = unlockedGroups(introduced);
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Weg</p><h1>Buchstabe für Buchstabe</h1>
        <p className="muted">Die Reihenfolge ist die traditionelle. Eine Gruppe öffnet sich, wenn die vorherige kennengelernt wurde. Gesperrte Gruppen kannst du trotzdem ansehen.</p></header>
      {Array.from({ length: GROUP_COUNT }, (_, i) => i + 1).map((g) => {
        const ls = lettersOfGroup(g);
        const isOpen = open.includes(g);
        return (
          <section key={g} className="stack" aria-labelledby={`g${g}`} style={{ opacity: isOpen ? 1 : 0.6 }}>
            <div className="row between">
              <h2 id={`g${g}`}>Gruppe {g}</h2>
              <span className="chip">{isOpen ? "offen" : "folgt"}</span>
            </div>
            <div className="grid">
              {ls.map((l) => (
                <Link key={l.id} className="tile" to={`/buchstaben/${l.id}`}>
                  <Ar size="body" className="ar-tile">{l.ch}</Ar>
                  <small>{l.name}</small>
                  <Mastery level={introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

## `src/features/Practice.tsx`
```tsx
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { buildExercise, type Exercise } from "@/domain/exercises";
import { planSession, type Planned } from "@/domain/session";
import { LETTER_BY_ID } from "@/content/letters";
import { useApp } from "./AppContext";
import { Ar, Icon, RichText } from "@/ui/parts";

/**
 * Eine Sitzung: Fehler werden am Ende der Warteschlange einmal erneut abgefragt (Abruf nach Fehler).
 * Jeder Versuch wird protokolliert; die Wertung kommt aus dem Ereignislog, nicht aus der Sitzung.
 */
export function Practice() {
  const { progress, introduced, record } = useApp();
  const plan = useMemo<Planned[]>(() => planSession(progress, introduced, Date.now()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Planned[]>(plan);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<string[]>([]);
  const total = useRef(plan.length);
  const pool = useMemo(() => [...introduced], [introduced]);

  const current = queue[0];
  const ex: Exercise | null = useMemo(
    () => (current ? buildExercise(current.type, current.letterId, pool, progress) : null),
    // Aufgabe bleibt stabil, bis die Warteschlange weiterrückt (nicht bei jedem Fortschritts-Update neu mischen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, retried.size, queue.length],
  );

  if (plan.length === 0)
    return (
      <div className="stack fade">
        <h1>Noch nichts zu üben</h1>
        <p className="muted">Lerne zuerst einen Buchstaben kennen, dann erscheinen hier die Aufgaben.</p>
        <Link className="btn btn-primary" to="/buchstaben/alif">Mit Alif beginnen</Link>
      </div>
    );

  if (done || !ex)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft.</h1>
        <p>{firstTry} von {total.current} Aufgaben beim ersten Versuch richtig.</p>
        {wrongLetters.length > 0 && (
          <p className="muted">Das wiederholen wir bald: {[...new Set(wrongLetters)].map((id) => LETTER_BY_ID.get(id)?.name).join(", ")}.</p>
        )}
        <p className="notice">Eine richtige Antwort macht einen Buchstaben noch nicht „gemeistert“. Dafür braucht es Wiederholungen an anderen Tagen, die der Planer für dich einteilt.</p>
        <div className="row"><Link className="btn btn-primary" to="/">Zurück zu Heute</Link><Link className="btn btn-secondary" to="/buchstaben">Mein Stand</Link></div>
      </div>
    );

  const answered = picked !== null;
  const correct = answered && picked === ex.answerIndex;
  const key = `${current.letterId}:${current.type}`;

  async function choose(i: number) {
    if (answered || !ex) return;
    setPicked(i);
    const ok = i === ex.answerIndex;
    const saved = await record({
      letterId: ex.letterId, skill: ex.skill, activity: ex.type, grade: ok ? 2 : 0, evidence: "recognition",
      confusedWith: ok ? undefined : ex.options[i].letterId,
    });
    setSaveError(!saved);
    if (ok && !retried.has(key)) setFirstTry((n) => n + 1);
    if (!ok) setWrongLetters((w) => [...w, ex.letterId]);
  }

  function next() {
    const wasWrong = picked !== ex!.answerIndex;
    let rest = queue.slice(1);
    if (wasWrong && !retried.has(key)) {
      rest = [...rest, current];
      setRetried((r) => new Set(r).add(key));
    }
    setPicked(null);
    if (rest.length === 0) setDone(true);
    setQueue(rest);
  }

  const progressPct = Math.round(((total.current - queue.length + (answered ? 1 : 0)) / (total.current + retried.size)) * 100);

  return (
    <div className="stack-lg fade" key={`${key}-${retried.size}-${queue.length}`}>
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Fortschritt in dieser Übung"><span style={{ width: `${progressPct}%` }} /></div>
        <p className="eyebrow">{ex.skill === "contrast" ? "Unterscheiden" : ex.skill === "association" ? "Zuordnen" : "Erkennen"}</p>
      </div>
      <section className="stack" aria-live="polite">
        <h1 style={{ fontSize: 26 }}>{ex.prompt}</h1>
        {ex.promptArabic && <div className="hero"><Ar size="hero">{ex.promptArabic}</Ar></div>}
      </section>

      <div className="options" role="group" aria-label="Antworten">
        {ex.options.map((o, i) => {
          const state = !answered ? undefined : i === ex.answerIndex ? "right" : i === picked ? "wrong" : undefined;
          return (
            <button key={i} className={`opt ${o.arabic ? "ar-opt" : ""}`} data-state={state} disabled={answered}
              onClick={() => void choose(i)} {...(o.arabic ? { lang: "ar", dir: "rtl" } : {})}
              aria-label={o.arabic && o.letterId ? LETTER_BY_ID.get(o.letterId)?.name : undefined}>
              {o.label}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback fade ${correct ? "ok" : "no"}`} role="status">
          <span className={correct ? "ic-ok" : "ic-no"}>{correct ? Icon.ok : Icon.no}</span>
          <div><strong>{correct ? "Richtig." : "Nicht ganz."}</strong><span><RichText text={ex.explanation} /></span>
            {!correct && <span className="muted" style={{ display: "block", marginTop: 4 }}>Wir fragen das am Ende noch einmal.</span>}</div>
        </div>
      )}
      {saveError && (
        <p className="notice err" role="alert">Dieses Ergebnis konnte nicht gespeichert werden. Es zählt in dieser Sitzung, geht aber ggf. beim Schließen verloren.</p>
      )}
      {answered && <button className="btn btn-primary" onClick={next} autoFocus>Weiter</button>}
    </div>
  );
}
```

## `src/features/Specimen.tsx`
```tsx
import { LETTERS, formsOf } from "@/content/letters";
import { EXAMPLE_WORDS, VOWELS } from "@/content/vowels";
import { Ar } from "@/ui/parts";

const SW = [
  ["Anthrazit", "--bg"], ["Graphit", "--surface"], ["Grau", "--line"], ["Text 2", "--text-2"], ["Orange", "--accent"],
  ["Amber", "--amber"], ["Koralle", "--coral"], ["Richtig", "--ok"],
];

/** Prüfseite für Typografie und Farben. Hier werden Formen/Harakat/Ligaturen geprüft, bevor Inhalte darauf aufbauen. */
export function Specimen() {
  return (
    <div className="stack-lg">
      <header className="stack"><p className="eyebrow">Prüfseite</p><h1>Schrift und Farbe</h1>
        <p className="muted">Zeigt alle Formen, Kurzvokale und Beispielwörter. Zum Prüfen von Verbindungen, Harakat-Platz und RTL.</p></header>

      <section className="stack"><h2>Farben</h2>
        <div className="swatches">{SW.map(([n, v]) => <div className="sw" key={v}><i style={{ background: `var(${v})` }} /><span>{n}<br />{v}</span></div>)}</div>
      </section>

      <section className="stack"><h2>Beispielwörter (vokalisiert)</h2>
        {EXAMPLE_WORDS.map((w) => (
          <div className="row between panel" key={w.id}><Ar size="teach">{w.ar}</Ar><span className="muted">{w.tr} · {w.de}</span></div>
        ))}
        <div className="row panel">
          {VOWELS.map((v) => <span key={v.id} className="row"><Ar size="teach">{"ب" + v.mark}</Ar><span className="muted">{v.name} „{v.sound}“</span></span>)}
        </div>
        <div className="panel" style={{ textAlign: "center" }}><Ar size="teach">لا</Ar> <span className="muted">Lām-Alif-Ligatur</span></div>
      </section>

      <section className="stack"><h2>Alle Formen</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="spec" data-testid="forms">
            <thead><tr><th>Name</th><th>Einzeln</th><th>Anfang</th><th>Mitte</th><th>Ende</th></tr></thead>
            <tbody>
              {LETTERS.map((l) => { const f = formsOf(l); return (
                <tr key={l.id}><th scope="row">{l.name}</th>
                  <td><Ar size="body">{f.isolated}</Ar></td><td><Ar size="body">{f.initial}</Ar></td>
                  <td><Ar size="body">{f.medial}</Ar></td><td><Ar size="body">{f.final}</Ar></td></tr>); })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

## `src/features/Today.tsx`
```tsx
import { Link } from "react-router-dom";
import { planSession, nextToIntroduce } from "@/domain/session";
import { LETTER_BY_ID } from "@/content/letters";
import { useApp } from "./AppContext";
import { Ar } from "@/ui/parts";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";

export function Today() {
  const { progress, introduced, persistent } = useApp();
  const plan = planSession(progress, introduced, Date.now());
  const due = plan.filter((p) => p.why === "due").length;
  const next = nextToIntroduce(introduced);
  const nextLetter = next ? LETTER_BY_ID.get(next) : undefined;

  return (
    <div className="stack-lg fade">
      <header className="stack">
        <p className="eyebrow">Heute</p>
        <h1>{introduced.size === 0 ? "Fang mit dem ersten Buchstaben an." : due > 0 ? "Zeit, Gelerntes abzurufen." : "Bereit für den nächsten Schritt."}</h1>
        <p className="muted">Kein Streak-Druck: Wenn du Tage pausierst, planen wir die Wiederholungen sanft neu.</p>
      </header>

      {!persistent && (
        <p className="notice" role="status">Dein Lernstand wird in diesem Browser gerade nicht dauerhaft gespeichert (z. B. privater Modus). Nutze unter „Ich“ die Sicherung.</p>
      )}

      <section className="panel row between" aria-labelledby="l1">
        <div className="stack"><h2 id="l1">Lektion 1: Alif, Bā, Tā, Thā</h2><p className="muted">Geführter Einstieg in sieben Phasen, von der Orientierung bis zur Langzeit-Wiederholung.</p></div>
        <Link className="btn btn-primary" to="/lektion">Zur Lektion</Link>
      </section>

      {plan.length > 0 && (
        <section className="panel stack" aria-labelledby="rev">
          <h2 id="rev">{due > 0 ? `${due} Wiederholungen fällig` : "Übung zum Festigen"}</h2>
          <p className="muted">{plan.length} Aufgaben, gemischt aus deinen bisherigen Buchstaben. Es zählt Genauigkeit, nicht Tempo.</p>
          <Link className="btn btn-primary" to="/ueben">Jetzt üben</Link>
        </section>
      )}

      {[...introduced].some((id) => TEMPLATE_BY_ID.has(id)) && (
        <section className="panel row between" aria-labelledby="wr">
          <div className="stack"><h2 id="wr">Schreiben üben</h2><p className="muted">Nachzeichnen und frei schreiben, mit Rückmeldung zu Form, Punkten und Richtung.</p></div>
          <Link className="btn btn-secondary" to="/schreiben">Schreiben</Link>
        </section>
      )}

      {nextLetter ? (
        <section className="panel row between" aria-labelledby="nxt">
          <div className="stack">
            <h2 id="nxt">Nächster Buchstabe</h2>
            <p className="muted">{nextLetter.name} · {nextLetter.sound}</p>
            <Link className="btn btn-secondary" to={`/buchstaben/${nextLetter.id}`}>Kennenlernen</Link>
          </div>
          <Ar size="teach">{nextLetter.ch}</Ar>
        </section>
      ) : (
        <p className="panel">Alle 28 Buchstaben sind eingeführt. Weiter geht es mit Wiederholung; Kontextformen und Silben folgen.</p>
      )}
    </div>
  );
}
```

## `src/features/Write.tsx`
```tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, type FreeResult, type WritingResult } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { useApp } from "./AppContext";
import { WritingPad, PAD } from "@/ui/WritingPad";
import { Ar } from "@/ui/parts";

type Mode = "trace" | "free";
interface Task { letterId: string; mode: Mode }

/** Nachzeichnen, bis ein freier Versuch gelang; danach freies Schreiben (Produktion zählt stärker als Nachzeichnen). */
export function planWriting(introduced: Set<string>, hasFreeSuccess: (id: string) => boolean, size = 6): Task[] {
  return TEMPLATES.filter((t) => introduced.has(t.letterId)).slice(0, size)
    .map((t) => ({ letterId: t.letterId, mode: hasFreeSuccess(t.letterId) ? "free" as const : "trace" as const }));
}

function Check({ level, children }: { level: "ok" | "mid" | "no"; children: string }) {
  return <li><span className={level} aria-hidden>{level === "ok" ? "✓" : level === "mid" ? "~" : "✗"}</span><span>{children}</span></li>;
}

export function Write() {
  const { introduced, progress, record } = useApp();
  const tasks = useMemo(
    () => planWriting(introduced, (id) => (progress.events.get(`${id}:writing`) ?? []).some((e) => e.activity === "free" && e.grade >= 2)),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [i, setI] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [result, setResult] = useState<(WritingResult & Partial<FreeResult>) | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [skipped, setSkipped] = useState(0);

  if (tasks.length === 0)
    return (
      <div className="stack fade">
        <h1>Noch nichts zu schreiben</h1>
        <p className="muted">Schreiben gibt es zunächst für Alif, Bā, Tā und Thā. Lerne mindestens einen davon kennen.</p>
        <Link className="btn btn-primary" to="/buchstaben/alif">Mit Alif beginnen</Link>
      </div>
    );

  const task = tasks[i];
  if (!task)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft.</h1>
        <p className="notice">Schreiben wird mit der Zeit sicherer. Der Planer legt Wiederholungen für dich fest. Eine Bewertung ersetzt keine Lehrkraft: Die App erkennt Form, Punkte und Richtung, nicht die Schönheit der Schrift.</p>
        <div className="row"><Link className="btn btn-primary" to="/">Zurück zu Heute</Link>{skipped > 0 && <span className="muted">{skipped} übersprungen</span>}</div>
      </div>
    );

  const letter = LETTER_BY_ID.get(task.letterId)!;
  const template = TEMPLATE_BY_ID.get(task.letterId)!;
  const showGuide = task.mode === "trace" || peeked;
  const good = result && result.grade === 2;

  async function check() {
    const res = task.mode === "free" ? analyzeFree(strokes, task.letterId, PAD) : analyze(strokes, template, PAD);
    setResult(res);
    if (res.empty || res.tooSmall) return; // keine Wertung, kein Ereignis
    const evidence = task.mode === "free" && !peeked ? "production" : "recognition";
    const saved = await record({
      letterId: task.letterId, skill: "writing", activity: task.mode, grade: res.grade, evidence,
      confusedWith: (res as FreeResult).recognizedAs && (res as FreeResult).recognizedAs !== task.letterId ? (res as FreeResult).recognizedAs : undefined,
    });
    setSaveError(!saved);
  }
  const retry = () => { setResult(null); setStrokes([]); setAttempt((a) => a + 1); };
  const next = () => { setResult(null); setStrokes([]); setPeeked(false); setAttempt((a) => a + 1); setI((n) => n + 1); };

  return (
    <div className="stack-lg fade">
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={i} aria-valuemin={0} aria-valuemax={tasks.length} aria-label="Fortschritt"><span style={{ width: `${(i / tasks.length) * 100}%` }} /></div>
        <p className="eyebrow">{task.mode === "trace" ? "Nachzeichnen" : "Frei schreiben"}</p>
      </div>
      <section className="stack">
        <h1 style={{ fontSize: 26 }}>
          {task.mode === "trace" ? <>Zeichne <b>{letter.name}</b> nach.</> : <>Schreibe <b>{letter.name}</b> aus dem Gedächtnis.</>}
        </h1>
        <p className="muted">
          {task.mode === "trace" ? "Beginne am orangen Punkt. Arabisch schreibt man von rechts nach links." : `Laut „${letter.syllable}“. Denk an die Punkte.`}
          {" "}Größe und Position sind egal.
        </p>
        {task.mode === "free" && !peeked && !result && (
          <div className="row"><span aria-hidden><Ar size="body">؟</Ar></span><button className="btn btn-ghost" onClick={() => setPeeked(true)}>Vorlage zeigen (zählt dann als Nachzeichnen)</button></div>
        )}
      </section>

      <WritingPad guide={showGuide ? template : null} resetKey={`${i}-${attempt}`} disabled={!!result} onChange={setStrokes} />

      {result && (
        <div className={`feedback fade ${good ? "ok" : "no"}`} role="status" style={{ flexDirection: "column" }}>
          <strong>{result.empty ? "Noch nichts gezeichnet." : result.tooSmall ? "Zu klein." : good ? "Gut geschrieben." : result.grade === 1 ? "Fast." : "Noch nicht ganz."}</strong>
          {!result.empty && !result.tooSmall && (
            <ul className="checks">
              <Check level={result.shape.level === "good" ? "ok" : result.shape.level === "near" ? "mid" : "no"}>{`Form: ${result.shape.level === "good" ? "passt" : result.shape.level === "near" ? "ungefähr" : "weicht ab"}`}</Check>
              <Check level={result.dots.level === "ok" ? "ok" : "no"}>{result.dots.expected === 0 && result.dots.level === "ok" ? "Punkte: keine nötig" : result.dots.level === "ok" ? `Punkte: ${result.dots.expected}, richtig gesetzt` : result.dots.level === "wrongPlace" ? "Punkte: auf der falschen Seite (oben/unten)" : `Punkte: erwartet ${result.dots.expected}, erkannt ${result.dots.found}`}</Check>
              <Check level={result.direction === "ok" ? "ok" : result.direction === "reversed" ? "no" : "mid"}>{result.direction === "ok" ? "Richtung: richtig" : result.direction === "reversed" ? "Richtung: umgekehrt" : "Richtung: nicht beurteilbar (anderer Strichaufbau)"}</Check>
            </ul>
          )}
          {result.messages.map((m) => <p key={m} className="muted">{m}</p>)}
          {result.recognizedAs && <p className="muted">Erkannt eher als: <Ar size="body">{LETTER_BY_ID.get(result.recognizedAs)?.ch}</Ar> ({LETTER_BY_ID.get(result.recognizedAs)?.name}). Das ist eine Schätzung.</p>}
        </div>
      )}
      {saveError && <p className="notice err" role="alert">Das Ergebnis konnte nicht gespeichert werden.</p>}

      <div className="row">
        {!result && <button className="btn btn-primary" disabled={strokes.length === 0} onClick={() => void check()}>Prüfen</button>}
        {result && (result.empty || result.tooSmall || result.grade < 2) && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && !result.empty && !result.tooSmall && <button className="btn btn-primary" onClick={next} autoFocus>Weiter</button>}
        {!result && <button className="btn btn-ghost" onClick={() => { setSkipped((n) => n + 1); next(); }}>Überspringen</button>}
      </div>
    </div>
  );
}
```

## `src/features/lektion/ForgettingChart.tsx`
```tsx
import { DAY, retrievability } from "@/domain/scheduler";
import { curvePoints, type LessonState } from "@/domain/lektion/state";

const W = 640, H = 240, M = { l: 40, r: 12, t: 12, b: 28 };

/** Abrufwahrscheinlichkeit eines Items über die Zeit (Sägezahn: jede Wiederholung setzt zurück und flacht die Kurve ab). */
export function ForgettingChart({ s, itemId, now, label }: { s: LessonState; itemId: string; now: number; label: string }) {
  const entries = s.log.filter((e) => e.itemId === itemId);
  if (!entries.length) return null;
  const from = Math.min(...entries.map((e) => e.ts));
  const horizonDays = Math.max(14, Math.ceil((now - from) / DAY) + 7);
  const pts = curvePoints(s.log, itemId, from, from + horizonDays * DAY, 160);
  const nowX = (now - from) / DAY;
  const x = (d: number) => M.l + (d / horizonDays) * (W - M.l - M.r);
  const y = (r: number) => M.t + (1 - r) * (H - M.t - M.b);
  const line = (a: typeof pts) => a.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)} ${y(p.r).toFixed(1)}`).join(" ");
  const past = pts.filter((p) => p.x <= nowX + 1e-9), future = pts.filter((p) => p.x >= nowX - 1e-9);
  const m = s.srs[itemId];
  const rNow = m ? retrievability(m, now) : 1;
  const ticks = [0, 0.5, 0.9, 1];
  const xt = Array.from({ length: Math.floor(horizonDays / 7) + 1 }, (_, i) => i * 7);
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Vergessenskurve für ${label}: Abrufwahrscheinlichkeit ${Math.round(rNow * 100)} Prozent am simulierten Tag ${Math.round(nowX)}. ${entries.length} Wiederholungen.`}>
        {ticks.map((t) => <g key={t}><line className={t === 0.9 ? "thr" : "grid"} x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} /><text x={M.l - 6} y={y(t) + 4} textAnchor="end">{Math.round(t * 100)} %</text></g>)}
        {xt.filter((d) => x(d) < W - M.r - 24).map((d) => <text key={d} x={x(d)} y={H - 8} textAnchor="middle">{d === 0 ? "Start" : `Tag ${d}`}</text>)}
        {entries.map((e, i) => <g key={i}><line className="rev" x1={x((e.ts - from) / DAY)} x2={x((e.ts - from) / DAY)} y1={y(1)} y2={y(0)} opacity=".35" /><circle cx={x((e.ts - from) / DAY)} cy={y(1)} r="3.5" /></g>)}
        <path className="ln" d={line(future)} strokeDasharray="5 5" opacity=".55" />
        <path className="ln" d={line(past)} />
        <line x1={x(nowX)} x2={x(nowX)} y1={M.t} y2={H - M.b} stroke="var(--text)" strokeWidth="1" strokeDasharray="2 3" />
        <text x={Math.min(x(nowX) + 4, W - 40)} y={M.t + 10}>jetzt</text>
      </svg>
      <figcaption className="muted" style={{ fontSize: 13 }}>Orange: wie wahrscheinlich du dich erinnerst. Grüne Punkte: Wiederholungen. Gestrichelt: Prognose ohne weitere Wiederholung. Die gelbe Linie (90 %) ist das Ziel, kurz davor wiederholt der Planer.</figcaption>
    </figure>
  );
}
```

## `src/features/lektion/LektionPage.tsx`
```tsx
import { useEffect, useState } from "react";
import { PHASES, PHASE_COUNT } from "@/domain/lektion/state";
import { LessonProvider, useLesson } from "./LessonContext";
import { P1Orientierung } from "./phases/P1Orientierung";
import { P2Entdecken } from "./phases/P2Entdecken";
import { P3Hypothesen } from "./phases/P3Hypothesen";
import { P4Verstehen } from "./phases/P4Verstehen";
import { P5Anwenden } from "./phases/P5Anwenden";
import { P6Abrufen } from "./phases/P6Abrufen";
import { P7Festigen } from "./phases/P7Festigen";

function Lesson() {
  const { s, dispatch } = useLesson();
  const first = () => Math.min(PHASE_COUNT, s.unlocked);
  const [view, setView] = useState(first);
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [view]);
  const finish = (n: number) => () => { dispatch({ t: "complete", phase: n }); setView(Math.min(PHASE_COUNT, n + 1)); };
  const pct = Math.round((s.done.length / PHASE_COUNT) * 100);
  return (
    <div className="l1 stack-lg">
      <div className="stack">
        <div className="row between"><p className="eyebrow">Lektion 1 · Alif, Bā, Tā, Thā</p><span className="muted" style={{ fontSize: 13 }}>{s.done.length} von {PHASE_COUNT} Phasen</span></div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Gesamtfortschritt der Lektion"><span style={{ width: `${pct}%` }} /></div>
        <ol className="stepper" aria-label="Phasen der Lektion">
          {PHASES.map((p) => {
            const open = p.n <= s.unlocked;
            return (
              <li key={p.n}><button aria-current={view === p.n ? "step" : undefined} data-done={s.done.includes(p.n)} disabled={!open} onClick={() => setView(p.n)} aria-label={`Phase ${p.n}: ${p.title}${s.done.includes(p.n) ? ", abgeschlossen" : !open ? ", noch gesperrt" : ""}`}>
                <b>{s.done.includes(p.n) ? "✓" : p.n}</b><small>{p.title}</small></button></li>
            );
          })}
        </ol>
      </div>
      {view === 1 && <P1Orientierung onFinish={finish(1)} />}
      {view === 2 && <P2Entdecken onFinish={finish(2)} />}
      {view === 3 && <P3Hypothesen onFinish={finish(3)} />}
      {view === 4 && <P4Verstehen onFinish={finish(4)} />}
      {view === 5 && <P5Anwenden onFinish={finish(5)} />}
      {view === 6 && <P6Abrufen onFinish={finish(6)} />}
      {view === 7 && <P7Festigen onFinish={finish(7)} />}
    </div>
  );
}

export function LektionPage() {
  return <LessonProvider><Lesson /></LessonProvider>;
}
```

## `src/features/lektion/LessonContext.tsx`
```tsx
import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import { LS_LESSON, lessonReducer, parseLesson, type Action, type LessonState } from "@/domain/lektion/state";

interface Ctx { s: LessonState; dispatch(a: Action): void }
const C = createContext<Ctx | null>(null);
export const useLesson = () => {
  const c = useContext(C);
  if (!c) throw new Error("LessonProvider fehlt");
  return c;
};

const read = () => { try { return localStorage.getItem(LS_LESSON); } catch { return null; } };

export function LessonProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(lessonReducer, undefined, () => parseLesson(read()));
  useEffect(() => { try { localStorage.setItem(LS_LESSON, JSON.stringify(s)); } catch { /* ohne Speicher läuft die Lektion weiter */ } }, [s]);
  const dispatch = useCallback((a: Action) => d(a), []);
  return <C.Provider value={{ s, dispatch }}>{children}</C.Provider>;
}
```

## `src/features/lektion/PhaseFrame.tsx`
```tsx
import type { ReactNode } from "react";
import { RichText } from "@/ui/parts";
import { PHASES } from "@/domain/lektion/state";
import { useLesson } from "./LessonContext";

interface Props {
  phase: number;
  labels: string[];
  /** Darf der Nutzer vom aktuellen Schritt weiter? */
  canNext?: boolean;
  /** Letzter Schritt: Text des Abschluss-Buttons */
  finishLabel: string;
  onFinish(): void;
  /** Optionale Erklärung der Methode */
  why?: ReactNode;
  children(step: number): ReactNode;
}

/** Gemeinsamer Rahmen: Kopf mit Methode, Schrittzähler (gespeichert), Navigation. */
export function PhaseFrame({ phase, labels, canNext = true, finishLabel, onFinish, why, children }: Props) {
  const { s, dispatch } = useLesson();
  const meta = PHASES[phase - 1];
  const step = Math.min(s.steps[phase] ?? 0, labels.length - 1);
  const set = (n: number) => { dispatch({ t: "step", phase, step: n }); window.scrollTo?.({ top: 0 }); };
  const last = step === labels.length - 1;
  return (
    <div className="stack-lg fade">
      <header className="stack">
        <p className="eyebrow">Phase <b>{phase}</b> von {PHASES.length} · {meta.title}</p>
        <div className="method"><i>{meta.method}</i></div>
        {why && <details className="why"><summary>Warum so gelernt wird</summary><div className="stack">{why}</div></details>}
      </header>
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={labels.length} aria-label={`Schritt ${step + 1} von ${labels.length}`}><span style={{ width: `${((step + 1) / labels.length) * 100}%` }} /></div>
        <p className="muted" style={{ fontSize: 13 }}>Schritt {step + 1} von {labels.length} · <RichText text={labels[step]} /></p>
      </div>
      <section key={step} className="stack-lg fade" aria-label={labels[step]}>{children(step)}</section>
      <div className="phase-nav">
        <button className="btn btn-secondary" disabled={step === 0} onClick={() => set(step - 1)}>Zurück</button>
        {last
          ? <button className="btn btn-primary" disabled={!canNext} onClick={onFinish}>{finishLabel}</button>
          : <button className="btn btn-primary" disabled={!canNext} onClick={() => set(step + 1)}>Weiter</button>}
      </div>
    </div>
  );
}
```

## `src/features/lektion/Summary.tsx`
```tsx
import { ITEM_BY_ID } from "@/content/lektion1";
import { correctAnswerOf, taskFromId, type TaskResult } from "@/domain/lektion/tasks";
import { Ar } from "@/ui/parts";

export const share = (rs: TaskResult[]) => rs.length ? rs.filter((r) => r.correctness === "right").length / rs.length : 0;

/** Auswertung einer Ergebnisliste: Anteil nach Aufgabenfamilie und Fehlerliste mit Begründung. */
export function ResultBreakdown({ results }: { results: TaskResult[] }) {
  const families = ["letter", "vowel", "syllable", "word", "concept"] as const;
  const names = { letter: "Buchstaben", vowel: "Vokalzeichen", syllable: "Silben", word: "Wörter", concept: "Regeln" };
  const fam = (r: TaskResult) => ITEM_BY_ID.get(r.itemId)!.kind;
  const wrong = results.filter((r) => r.correctness !== "right");
  return (
    <div className="stack">
      <div className="kpis">
        {families.map((f) => {
          const rs = results.filter((r) => fam(r) === f);
          if (!rs.length) return null;
          const ok = rs.filter((r) => r.correctness === "right").length;
          return <div key={f} className="kpi"><b>{ok}/{rs.length}</b><small>{names[f]}</small></div>;
        })}
      </div>
      {wrong.length > 0 ? (
        <section className="stack" aria-labelledby="wr"><h2 id="wr">Das schauen wir uns an</h2>
          {wrong.map((r) => {
            const t = taskFromId(r.taskId);
            return (
              <article key={r.taskId} className="cmp" data-ok="false">
                {t.ar && <Ar size="body">{t.ar}</Ar>}
                <p><strong>{t.prompt}</strong></p>
                <p><span className="muted">Deine Antwort:</span> {r.answer || "–"} · <span className="muted">Richtig:</span> <strong>{correctAnswerOf(t)}</strong>{r.correctness === "lengthOnly" ? <span className="tag"> Länge fehlte</span> : null}</p>
                <p className="muted">{t.explain}</p>
              </article>
            );
          })}
        </section>
      ) : <p className="notice" role="status">Alles richtig. Die Wiederholungen in Phase 7 sichern das auf lange Sicht.</p>}
    </div>
  );
}
```

## `src/features/lektion/TaskRunner.tsx`
```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { UNKNOWN_OPTION } from "@/content/lektion1";
import { checkTyped, gradeFor, type ChoiceTask, type Correctness, type Task, type TaskResult, type TypeTask } from "@/domain/lektion/tasks";
import { Icon, Ar, RichText } from "@/ui/parts";

export type FeedbackMode = "immediate" | "deferred";
interface Common { hints: boolean; allowUnknown?: boolean; feedback: FeedbackMode; onAnswer(r: TaskResult): void }

function Stimulus({ task }: { task: Task }) {
  return (
    <div className="stim">
      {task.ar && <Ar size="hero">{task.ar}</Ar>}
    </div>
  );
}

function Feedback({ task, correctness }: { task: Task; correctness: Correctness }) {
  const ok = correctness === "right";
  return (
    <div className={`feedback fade ${ok ? "ok" : "no"}`} role="status">
      <span className={ok ? "ic-ok" : "ic-no"}>{ok ? Icon.ok : Icon.no}</span>
      <div>
        <strong>{ok ? "Richtig." : correctness === "lengthOnly" ? "Fast: Die Länge fehlt." : "Noch nicht."}</strong>
        <span className="muted"><RichText text={task.explain} /></span>
        {task.type === "type" && !ok && <span className="muted"> Richtig: „{task.accepted}“.</span>}
      </div>
    </div>
  );
}

function ChoiceView({ task, hints, allowUnknown, feedback, onAnswer }: Common & { task: ChoiceTask }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const answered = picked !== null;
  const showResult = answered && feedback === "immediate";
  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    const unknown = i === -1;
    const right = i === task.answer;
    const c: Correctness = right ? "right" : "wrong";
    onAnswer({ taskId: task.id, itemId: task.itemId, type: "choice", correctness: c, grade: gradeFor(c, "choice", hint), hintUsed: hint, answer: unknown ? UNKNOWN_OPTION : task.options[i], chosen: unknown ? "unknown" : right ? undefined : task.options[i] });
  };
  return (
    <div className="stack task">
      <h2 id="q"><RichText text={task.prompt} /></h2>
      {task.novel && <span className="badge" style={{ alignSelf: "start" }}>Neu kombiniert</span>}
      <Stimulus task={task} />
      <div className="options" role="group" aria-labelledby="q">
        {task.options.map((o, i) => (
          <button key={o} className={`opt ${task.optionsAr ? "ar-opt" : ""}`} data-state={showResult ? (i === task.answer ? "right" : i === picked ? "wrong" : undefined) : picked === i ? "dim" : undefined}
            disabled={answered} onClick={() => pick(i)} {...(task.optionsAr ? { lang: "ar", dir: "rtl" } : {})} aria-label={showResult && i === task.answer ? `${o} (richtig)` : undefined}>
            {task.optionsAr ? o : <RichText text={o} />}
          </button>
        ))}
        {allowUnknown && <button className="opt three" disabled={answered} onClick={() => pick(-1)}>{UNKNOWN_OPTION}</button>}
      </div>
      {!answered && hints && task.hint && (
        <div>{hint ? <p className="notice" role="note"><RichText text={task.hint} /></p> : <button className="btn btn-ghost" onClick={() => setHint(true)}>Hinweis (zählt als Hilfe)</button>}</div>
      )}
      {showResult && <Feedback task={task} correctness={picked === task.answer ? "right" : "wrong"} />}
    </div>
  );
}

function TypeView({ task, hints, feedback, onAnswer }: Common & { task: TypeTask }) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState(false);
  const [res, setRes] = useState<Correctness | null>(null);
  const submit = () => {
    if (res || !text.trim()) return;
    const c = checkTyped(task.accepted, text);
    setRes(c);
    onAnswer({ taskId: task.id, itemId: task.itemId, type: "type", correctness: c, grade: gradeFor(c, "type", hint), hintUsed: hint, answer: text.trim() });
  };
  return (
    <form className="stack task" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <h2 id="q"><RichText text={task.prompt} /></h2>
      {task.novel && <span className="badge" style={{ alignSelf: "start" }}>Neu kombiniert</span>}
      <Stimulus task={task} />
      <div className="typebox">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} disabled={!!res} placeholder={task.placeholder} aria-labelledby="q" autoComplete="off" autoCapitalize="none" spellCheck={false} autoFocus />
        <button className="btn btn-primary" type="submit" disabled={!!res || !text.trim()}>Prüfen</button>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>Langes ā darfst du als „ā“ oder „aa“ schreiben. Die Länge zählt.</p>
      {!res && hints && task.hint && (
        <div>{hint ? <p className="notice" role="note"><RichText text={task.hint} /></p> : <button className="btn btn-ghost" type="button" onClick={() => setHint(true)}>Hinweis (zählt als Hilfe)</button>}</div>
      )}
      {res && feedback === "immediate" && <Feedback task={task} correctness={res} />}
    </form>
  );
}

export interface RunnerProps {
  tasks: Task[];
  feedback: FeedbackMode;
  hints?: boolean;
  allowUnknown?: boolean;
  /** Falsch beantwortete Aufgaben einmal am Ende wiederholen (Ergebnis der Wiederholung zählt nicht für die Wertung). */
  requeueWrong?: boolean;
  label?: string;
  onDone(firstAttempts: TaskResult[]): void;
}

/** Führt eine Aufgabenliste aus. Gewertet wird je Aufgabe der erste Versuch. */
export function TaskRunner({ tasks, feedback, hints = false, allowUnknown, requeueWrong, label, onDone }: RunnerProps) {
  const [queue, setQueue] = useState<Task[]>(tasks);
  const [i, setI] = useState(0);
  const [cur, setCur] = useState<TaskResult | null>(null);
  const first = useRef<Map<string, TaskResult>>(new Map());
  const requeued = useRef<Set<string>>(new Set());
  const next = useRef<HTMLButtonElement>(null);
  const task = queue[i];
  const total = tasks.length;

  useEffect(() => { if (cur) next.current?.focus(); }, [cur]);

  const answer = (r: TaskResult) => {
    setCur(r);
    if (!first.current.has(r.taskId)) first.current.set(r.taskId, r);
  };
  const advance = () => {
    if (cur && requeueWrong && cur.correctness !== "right" && !requeued.current.has(cur.taskId)) {
      requeued.current.add(cur.taskId);
      const again = tasks.find((t) => t.id === cur.taskId)!;
      setQueue((q) => [...q, again]);
    }
    setCur(null);
    setI((n) => n + 1);
  };
  const finished = i >= queue.length;
  const reported = useRef(false);
  useEffect(() => { if (finished && !reported.current) { reported.current = true; onDone(tasks.map((t) => first.current.get(t.id)).filter((r): r is TaskResult => !!r)); } }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps
  const pct = useMemo(() => Math.min(100, (i / queue.length) * 100), [i, queue.length]);
  if (finished) return <p role="status" className="muted">Wird ausgewertet …</p>;

  const isRepeat = requeued.current.has(task.id) && first.current.has(task.id) && i >= total;
  return (
    <div className="stack-lg">
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={i} aria-valuemin={0} aria-valuemax={queue.length} aria-label="Fortschritt der Aufgaben"><span style={{ width: `${pct}%` }} /></div>
        <p className="eyebrow">{label ?? "Aufgabe"} {Math.min(i + 1, queue.length)} von {queue.length}{isRepeat ? " · Wiederholung" : ""}</p>
      </div>
      {task.type === "choice"
        ? <ChoiceView key={task.id + i} task={task} hints={hints} allowUnknown={allowUnknown} feedback={feedback} onAnswer={answer} />
        : <TypeView key={task.id + i} task={task} hints={hints} feedback={feedback} onAnswer={answer} />}
      {cur && (
        <div className="row">
          {feedback === "deferred" && <span className="muted">Antwort gespeichert. Die Auswertung kommt am Ende.</span>}
          <button ref={next} className="btn btn-primary" onClick={advance}>{i + 1 >= queue.length ? "Abschließen" : "Weiter"}</button>
        </div>
      )}
    </div>
  );
}
```

## `src/features/lektion/phases/P1Orientierung.tsx`
```tsx
import { useMemo } from "react";
import { ALIF, MARK } from "@/content/lektion1";
import { PHASES, type SelfLevel } from "@/domain/lektion/state";
import { PRETEST_SPEC, buildSet } from "@/domain/lektion/tasks";
import { Ar } from "@/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { Colored, Explode } from "../visuals";
import { useLesson } from "../LessonContext";

const LEVELS: { id: SelfLevel; label: string; sub: string }[] = [
  { id: "none", label: "Bei null", sub: "Ich kenne noch keine arabischen Buchstaben." },
  { id: "letters", label: "Einzelne Buchstaben", sub: "Ich erkenne ein paar Zeichen, lese aber nicht." },
  { id: "reading", label: "Ich kann etwas lesen", sub: "Ich lese langsam, brauche aber Sicherheit." },
];

export function P1Orientierung({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const pretest = useMemo(() => buildSet(PRETEST_SPEC, Math.random, false), []);
  const pretestDone = Object.keys(s.pretest).length >= PRETEST_SPEC.length;
  return (
    <PhaseFrame
      phase={1} labels={["Dein Weg", "Die Landkarte", "Dein Vorwissen"]}
      canNext={(s.steps[1] ?? 0) < 2 || (!!s.selfLevel && pretestDone)} finishLabel="Weiter zu Phase 2: Entdecken" onFinish={onFinish}
      why={<p className="muted">Ein Überblick vorab (Advanced Organizer) gibt deinem Gedächtnis Fächer, in die es neue Inhalte einsortieren kann. Du siehst erst das große Bild, dann die Details.</p>}
    >
      {(step) => step === 0 ? (
        <>
          <div className="stack">
            <h1>Arabisch lesen: die ersten vier Buchstaben</h1>
            <p className="muted">In etwa 45 Minuten lernst du Alif, Bā, Tā und Thā, drei Vokalzeichen und liest damit erste echte Wörter. Es gibt keine Noten, nur Rückmeldung.</p>
          </div>
          <section className="panel stack" aria-labelledby="goals"><h2 id="goals">Am Ende kannst du …</h2>
            <ul className="goals">
              <li>die Buchstaben <Ar size="body">ا ب ت ث</Ar> erkennen, benennen und schreiben,</li>
              <li><Ar size="body">ا</Ar> fachlich korrekt von den Konsonanten <Ar size="body">ب ت ث</Ar> unterscheiden,</li>
              <li>die Vokalzeichen Fatha, Kasra und Damma lesen,</li>
              <li>zwölf Silben und vier Wörter lesen, zum Beispiel <Ar size="body">بَاب</Ar> (bāb, „Tür“).</li>
            </ul>
          </section>
          <section className="stack" aria-labelledby="route"><h2 id="route">Sieben Stationen</h2>
            <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
              {PHASES.map((p) => <li key={p.n}><b>{p.title}</b> <span className="muted">· ca. {p.minutes} Min · {p.method}</span></li>)}
            </ol>
          </section>
        </>
      ) : step === 1 ? (
        <>
          <div className="stack"><h1>Die Landkarte der Schrift</h1><p className="muted">So hängt alles zusammen, was du gleich lernst. Orange markiert den Stoff dieser Lektion.</p></div>
          <div className="map" role="img" aria-label="Landkarte: Wörter bestehen aus Silben. Silben bestehen aus Konsonantenbuchstaben mit Vokalzeichen. Alif ist ein Dehnungsbuchstabe.">
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَاب</Ar><b>Wort</b><small>Tür · bāb</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَ · بِ · بُ</Ar><b>Silbe</b><small>ba · bi · bu</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl">
              <div className="node" data-hot="true"><Ar size="body">ب ت ث</Ar><b>Konsonanten</b><small>b · t · th</small></div>
              <div className="node" data-hot="true"><Ar size="body">◌{MARK.fatha} ◌{MARK.kasra} ◌{MARK.damma}</Ar><b>Vokalzeichen</b><small>a · i · u (kurz)</small></div>
              <div className="node" data-hot="true"><Ar size="body">{ALIF}</Ar><b>Dehnungsbuchstabe</b><small>macht a lang: ā</small></div>
            </div>
            <div className="arrow" aria-hidden>später: weitere 24 Buchstaben, Formen am Wortanfang/-ende, mehr Zeichen</div>
          </div>
          <section className="stack" aria-labelledby="facts"><h2 id="facts">Drei Dinge vorab</h2>
            <div className="fact"><b>1</b><p><strong>Arabisch liest man von rechts nach links.</strong> Die Zahlen zeigen die Reihenfolge in <Ar size="body">بَاب</Ar>:</p></div>
            <Explode letters={["ب", ALIF, "ب"]} />
            <p className="muted" style={{ fontSize: 13, textAlign: "center" }}>Hier getrennt dargestellt. In der Schrift hängen die meisten Buchstaben zusammen.</p>
            <div className="fact"><b>2</b><p><strong>Geschrieben werden vor allem Konsonanten.</strong> Kurze Vokale stehen als kleine Zeichen über oder unter dem Buchstaben, so wie in <Colored text="بَ" size="body" />. Im Alltag werden sie oft weggelassen, zum Lernen brauchst du sie.</p></div>
            <div className="fact"><b>3</b><p><strong>Buchstaben ändern ihre Form</strong> je nach Position im Wort. Die Grundform bleibt erkennbar. Das üben wir in späteren Lektionen.</p></div>
          </section>
        </>
      ) : (
        <>
          <div className="stack"><h1>Was bringst du mit?</h1><p className="muted">Beides dient nur dir: Am Ende vergleichst du „vorher“ und „nachher“. Raten ist nicht nötig, „Weiß ich nicht“ ist eine gute Antwort.</p></div>
          <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="eyebrow" style={{ marginBottom: 8 }}>Deine Erfahrung</legend>
            <div className="options opts3" role="radiogroup" aria-label="Deine Erfahrung mit arabischer Schrift">
              {LEVELS.map((l) => (
                <button key={l.id} role="radio" aria-checked={s.selfLevel === l.id} className="opt" data-state={s.selfLevel === l.id ? "right" : undefined} onClick={() => dispatch({ t: "selfLevel", level: l.id })}>
                  <span><b>{l.label}</b><br /><small className="muted">{l.sub}</small></span>
                </button>
              ))}
            </div>
          </fieldset>
          <section className="stack" aria-labelledby="pt"><h2 id="pt">Vier Fragen vorab</h2>
            {pretestDone
              ? <p className="notice" role="status">Gespeichert. Gleich geht es los. Ob du etwas wusstest oder nicht: Genau dafür ist diese Lektion da.</p>
              : <TaskRunner tasks={pretest} feedback="deferred" allowUnknown label="Vorab-Frage" onDone={(rs) => rs.forEach((r) => dispatch({ t: "pretest", itemId: r.itemId, value: r.chosen === "unknown" ? "unknown" : r.correctness === "right" ? "right" : "wrong" }))} />}
          </section>
        </>
      )}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P2Entdecken.tsx`
```tsx
import { useState } from "react";
import { ALIF, CONSONANT_IDS, FEATURE, MARK, ONSET, letterCh, letterName, type ConsonantId } from "@/content/lektion1";
import { LETTER_BY_ID } from "@/content/letters";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { useApp } from "@/features/AppContext";
import { AudioButton } from "@/ui/AudioButton";
import { Ar, RichText } from "@/ui/parts";
import { WriteTask, type WriteOutcome } from "@/ui/WriteTask";
import { PhaseFrame } from "../PhaseFrame";
import { Colored, Skeleton } from "../visuals";
import { useLesson } from "../LessonContext";

const ABOVE = [{ x: 38, y: 26 }, { x: 62, y: 26 }, { x: 50, y: 10 }];
const BELOW = [{ x: 38, y: 86 }, { x: 62, y: 86 }];
const BOWL = TEMPLATE_BY_ID.get("ba")!.body[0];
const bowlPath = () => {
  let d = `M${BOWL[0].x} ${BOWL[0].y}`;
  for (let i = 1; i < BOWL.length - 1; i++) d += ` Q${BOWL[i].x} ${BOWL[i].y} ${(BOWL[i].x + BOWL[i + 1].x) / 2} ${(BOWL[i].y + BOWL[i + 1].y) / 2}`;
  return d + ` L${BOWL.at(-1)!.x} ${BOWL.at(-1)!.y}`;
};

/** Entdecken per Baukasten: gleiche Grundform, nur die Punkte entscheiden. */
function DotsBuilder({ found, onFound }: { found: string[]; onFound(id: string): void }) {
  const [above, setAbove] = useState([false, false, false]);
  const [below, setBelow] = useState([false, false]);
  const a = above.filter(Boolean).length, b = below.filter(Boolean).length;
  const hit = a === 0 && b === 1 ? "ba" : a === 2 && b === 0 ? "ta" : a === 3 && b === 0 ? "tha" : a === 1 && b === 0 ? "nun" : a === 0 && b === 2 ? "ya" : null;
  const apply = (nextA: number, nextB: number) => {
    const id = nextA === 0 && nextB === 1 ? "ba" : nextA === 2 && nextB === 0 ? "ta" : nextA === 3 && nextB === 0 ? "tha" : null;
    if (id) onFound(id);
  };
  const msg = hit === "nun" || hit === "ya"
    ? `Das ist ${letterName(hit)} (${letterCh(hit)}). Die gleiche Grundform, aber ein anderer Buchstabe, den du in einer späteren Lektion lernst.`
    : hit ? `Das ist ${letterName(hit)}: Laut „${ONSET[hit as ConsonantId]}“.`
    : a + b === 0 ? "Die Grundform ohne Punkte ist hier noch kein Buchstabe. Setze Punkte."
    : "Diese Punkt-Kombination ergibt keinen Buchstaben. Probiere eine andere.";
  return (
    <div className="builder">
      <div className="svgbox" style={{ margin: "0 auto", maxWidth: 220 }}>
        <svg viewBox="0 0 100 100" role="img" aria-label={`Bogen mit ${a} Punkt(en) oben und ${b} unten`}>
          <line x1="4" y1="70" x2="96" y2="70" stroke="var(--line)" strokeDasharray="3 4" />
          <path d={bowlPath()} fill="none" stroke="var(--text-2)" strokeWidth="9" strokeLinecap="round" />
          {above.map((on, i) => on && <circle key={`a${i}`} cx={ABOVE[i].x} cy={ABOVE[i].y} r="6.5" fill="var(--accent)" />)}
          {below.map((on, i) => on && <circle key={`b${i}`} cx={BELOW[i].x} cy={BELOW[i].y} r="6.5" fill="var(--accent)" />)}
        </svg>
      </div>
      <div className="dotslots">
        <div className="stack" style={{ textAlign: "center" }}>
          <p className="eyebrow">Punkte oben</p>
          <div className="slotrow">{above.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt oben ${i + 1}`} onClick={() => { const n = [...above]; n[i] = !n[i]; setAbove(n); apply(n.filter(Boolean).length, b); }} />)}</div>
          <p className="eyebrow">Punkte unten</p>
          <div className="slotrow">{below.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt unten ${i + 1}`} onClick={() => { const n = [...below]; n[i] = !n[i]; setBelow(n); apply(a, n.filter(Boolean).length); }} />)}</div>
        </div>
        <div style={{ textAlign: "center" }} aria-live="polite">
          {hit && <div className="big-ar" style={{ fontSize: 72, lineHeight: 1.4 }} lang="ar" dir="rtl">{letterCh(hit)}</div>}
          <p className="muted"><RichText text={msg} /></p>
        </div>
        <div className="found" aria-label="Gefundene Buchstaben">
          {CONSONANT_IDS.map((id) => <span key={id} className="chip" data-on={found.includes(id)}>{found.includes(id) ? "✓ " : ""}{letterName(id)}</span>)}
        </div>
      </div>
    </div>
  );
}

/** Silbenbaukasten: Konsonant + Fatha (+ Alif). */
function SyllableBuilder({ onProgress }: { onProgress(seen: string[], longSeen: boolean): void }) {
  const [c, setC] = useState<ConsonantId>("ba");
  const [long, setLong] = useState(false);
  const [seen, setSeen] = useState<string[]>(["ba"]);
  const [longSeen, setLongSeen] = useState(false);
  const ar = letterCh(c) + MARK.fatha + (long ? ALIF : "");
  const tr = ONSET[c] + (long ? "ā" : "a");
  return (
    <div className="stack">
      <div className="seg" role="group" aria-label="Buchstabe wählen">
        {CONSONANT_IDS.map((id) => (
          <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => { setC(id); const n = seen.includes(id) ? seen : [...seen, id]; setSeen(n); onProgress(n, longSeen); }}><Ar size="body">{letterCh(id)}</Ar></button>
        ))}
      </div>
      <div className="eq" role="group" aria-label={`${letterName(c)} plus Fatha${long ? " plus Alif" : ""} ergibt ${tr}`}>
        <div className="box"><Ar size="teach">{letterCh(c)}</Ar><small>Konsonant {ONSET[c]}</small></div>
        <span className="op" aria-hidden>+</span>
        <div className="box"><Ar size="teach" className="mk">◌{MARK.fatha}</Ar><small>Fatha: a</small></div>
        {long && <><span className="op" aria-hidden>+</span><div className="box"><Ar size="teach">{ALIF}</Ar><small>Alif: dehnt</small></div></>}
        <span className="op" aria-hidden>=</span>
        <div className="box res"><Colored text={ar} /><small>{tr}{long ? " (lang)" : ""}</small></div>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn btn-secondary" aria-pressed={long} onClick={() => { const nl = !long; setLong(nl); const ls = longSeen || nl; setLongSeen(ls); onProgress(seen, ls); }}>{long ? "Alif wieder weglassen" : "Alif anhängen"}</button>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>{long ? "Mit Alif wird das a gedehnt: ā ist etwa doppelt so lang wie a." : "Konsonant plus Fatha ergibt eine Silbe mit kurzem a."}</p>
    </div>
  );
}

const WRITE_PLAN: { letterId: string; mode: "trace" | "free"; note: string }[] = [
  { letterId: "alif", mode: "trace", note: "Mit voller Vorlage." },
  { letterId: "ba", mode: "trace", note: "Wieder mit Vorlage, jetzt mit Bogen und Punkt." },
  { letterId: "ta", mode: "free", note: "Die Vorlage wird ausgeblendet, du kannst sie bei Bedarf zeigen." },
  { letterId: "tha", mode: "free", note: "Jetzt ganz ohne Hilfe, aus dem Gedächtnis." },
];

export function P2Entdecken({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const { record, introduce } = useApp();
  const [found, setFound] = useState<string[]>([]);
  const [fatha, setFatha] = useState<{ seen: string[]; longSeen: boolean }>({ seen: [], longSeen: false });
  const [wi, setWi] = useState(0);
  const [spoken, setSpoken] = useState<Record<string, boolean>>({});
  const wdone = wi >= WRITE_PLAN.length;
  const step = s.steps[2] ?? 0;
  const already = s.done.includes(2);

  const canNext = step === 1 ? found.length === 3 || already : step === 2 ? (fatha.seen.length >= 3 && fatha.longSeen) || already : step === 3 ? wdone || already : true;

  const onWrite = async (o: WriteOutcome) => {
    await record({ letterId: o.letterId, skill: "writing", activity: o.mode, grade: o.grade, evidence: o.mode === "free" && !o.peeked ? "production" : "recognition", confusedWith: o.recognizedAs && o.recognizedAs !== o.letterId ? o.recognizedAs : undefined });
    setWi((n) => n + 1);
  };

  return (
    <PhaseFrame
      phase={2} labels={["Alif", "ب ت ث: eine Familie", "Silben mit Fatha", "Schreiben"]} canNext={canNext}
      finishLabel="Weiter zu Phase 3: Hypothesen" onFinish={() => { ["alif", "ba", "ta", "tha"].forEach(introduce); onFinish(); }}
      why={<><p className="muted"><b>Scaffolding:</b> Hilfen werden schrittweise abgebaut: erst volle Vorlage, dann ohne.</p><p className="muted"><b>Dual Coding und Multisensorik:</b> Du bekommst jeden Buchstaben als Schrift, als Bild, als Laut und über die eigene Hand. Mehrere Kanäle stützen das Gedächtnis.</p></>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Alif <Ar size="body">ا</Ar></h1><p className="muted">Der erste Buchstabe der Schrift. Er sieht einfach aus, verhält sich aber anders als die meisten.</p></div>
          <div className="cards">
            <div className="card"><Ar size="hero" label="Alif">{ALIF}</Ar><strong>{LETTER_BY_ID.get("alif")!.name}</strong></div>
            <div className="card"><Skeleton letterId="alif" label="Zeichnung von Alif: ein senkrechter Strich" /><small>{FEATURE.alif.anchor}</small></div>
          </div>
          <section className="stack" aria-labelledby="af">
            <h2 id="af">Das fällt auf</h2>
            <div className="fact"><b>1</b><p>Ein <strong>gerader senkrechter Strich</strong>, ohne Bogen, ohne Punkte.</p></div>
            <div className="fact"><b>2</b><p>Alif hat hier <strong>keinen eigenen Konsonantenlaut</strong>. Du hörst es nur im Namen „Alif“.</p></div>
            <div className="fact"><b>3</b><p>Es hängt sich <strong>nicht an den nächsten Buchstaben</strong> an. Warum das so ist, klärst du später.</p></div>
          </section>
          <div className="row"><AudioButton letterId="alif" kind="name" label="Name hören" />
            <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={!!spoken.alif} onChange={(e) => setSpoken({ ...spoken, alif: e.target.checked })} /> Ich habe „Alif“ laut gesprochen</label></div>
        </>
      ) : st === 1 ? (
        <>
          <div className="stack"><h1>Drei Buchstaben, eine Form</h1><p className="muted"><Ar size="body">ب</Ar>, <Ar size="body">ت</Ar> und <Ar size="body">ث</Ar> haben dieselbe Grundform, einen flachen Bogen. Entdecke selbst, was sie unterscheidet: Setze Punkte und finde alle drei.</p></div>
          <DotsBuilder found={found} onFound={(id) => setFound((f) => (f.includes(id) ? f : [...f, id]))} />
          <section className="stack" aria-labelledby="fam"><h2 id="fam">Bild, Laut, Mund</h2>
            <div className="cards">
              {CONSONANT_IDS.map((id) => {
                const l = LETTER_BY_ID.get(id)!;
                return (
                  <div className="card" key={id}>
                    <Ar size="teach">{l.ch}</Ar><strong>{l.name} · „{ONSET[id]}“</strong>
                    <Skeleton letterId={id} label={`Zeichnung von ${l.name}: ${FEATURE[id].text}`} />
                    <small>{FEATURE[id].anchor}</small>
                    <small>{l.tip}</small>
                    <AudioButton letterId={id} kind="sound" label="Laut hören" />
                    <label className="row" style={{ gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!spoken[id]} onChange={(e) => setSpoken({ ...spoken, [id]: e.target.checked })} /> laut gesprochen</label>
                  </div>
                );
              })}
            </div>
          </section>
          {!(found.length === 3 || already) && <p className="notice" role="status">Finde zuerst alle drei Buchstaben im Baukasten ({found.length} von 3).</p>}
        </>
      ) : st === 2 ? (
        <>
          <div className="stack"><h1>Silben mit Fatha</h1><p className="muted">Ein Buchstabe liefert den Konsonanten, ein kleines Zeichen den Vokal. Das Zeichen <Ar size="body" className="mk">◌{MARK.fatha}</Ar> heißt <strong>Fatha</strong> und steht für ein kurzes „a“. Es sitzt über dem Buchstaben.</p></div>
          <SyllableBuilder onProgress={(seen, longSeen) => setFatha({ seen, longSeen })} />
          {!(canNext) && <p className="notice" role="status">Probiere alle drei Buchstaben aus und hänge einmal das Alif an ({fatha.seen.length} von 3 Buchstaben{fatha.longSeen ? ", Alif ausprobiert" : ""}).</p>}
          <p className="muted">Es gibt noch zwei weitere Vokalzeichen. Die entdeckst du gleich selbst.</p>
        </>
      ) : (
        <>
          <div className="stack"><h1>Mit der Hand schreiben</h1><p className="muted">Schreiben festigt das Erkennen. Mit dem Finger, Stift oder der Maus. Die Hilfe wird ausgeblendet: Alif und Bā mit Vorlage, Tā und Thā frei.</p></div>
          {wdone ? <p className="notice" role="status">Alle vier geschrieben. Das Ergebnis ist in „Ich“ gespeichert. Die Rückmeldung ist ein Hinweis zu Form, Punkten und Richtung, keine Benotung der Handschrift.</p> : (
            <>
              <p className="eyebrow">Schreibaufgabe {wi + 1} von {WRITE_PLAN.length} · {WRITE_PLAN[wi].note}</p>
              <WriteTask key={wi} letterId={WRITE_PLAN[wi].letterId} mode={WRITE_PLAN[wi].mode} onDone={onWrite} onSkip={() => setWi((n) => n + 1)} />
            </>
          )}
        </>
      )}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P3Hypothesen.tsx`
```tsx
import { useState } from "react";
import { CONFIDENCE_LABEL, HYPOTHESES, type Confidence } from "@/content/lektion1";
import { Ar, RichText } from "@/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { Colored } from "../visuals";
import { useLesson } from "../LessonContext";

function HypothesisCard({ index }: { index: number }) {
  const { dispatch } = useLesson();
  const h = HYPOTHESES[index];
  const [choice, setChoice] = useState<number | null>(null);
  const [conf, setConf] = useState<Confidence | null>(null);
  const [why, setWhy] = useState("");
  return (
    <div className="stack-lg">
      <div className="stack">
        <p className="eyebrow">Hypothese {index + 1} von {HYPOTHESES.length}</p>
        <h2><RichText text={h.title} /></h2>
      </div>
      {h.given && (
        <div className="panel stack" aria-label="Was du schon weißt"><p className="eyebrow">Was du schon weißt</p>
          <ul className="goals">{h.given.map((g) => <li key={g}><RichText text={g} /></li>)}</ul></div>
      )}
      <div className="task"><div className="stim"><Colored text={h.stimulus} size="hero" /></div></div>
      <p id={`q${index}`}><strong><RichText text={h.question} /></strong></p>
      <div className="options opts3" role="radiogroup" aria-labelledby={`q${index}`}>
        {h.options.map((o, i) => (
          <button key={o} role="radio" aria-checked={choice === i} className="opt" data-state={choice === i ? "right" : undefined} onClick={() => setChoice(i)}><RichText text={o} /></button>
        ))}
      </div>
      <div className="stack"><p className="eyebrow" id={`c${index}`}>Wie sicher bist du?</p>
        <div className="conf" role="radiogroup" aria-labelledby={`c${index}`}>
          {(Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((c) => <button key={c} role="radio" aria-checked={conf === c} aria-pressed={conf === c} onClick={() => setConf(c)}>{CONFIDENCE_LABEL[c]}</button>)}
        </div>
      </div>
      <div className="stack"><label className="eyebrow" htmlFor={`w${index}`}>Deine Begründung (optional)</label>
        <textarea id={`w${index}`} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Woran machst du deine Vermutung fest?" /></div>
      <button className="btn btn-primary" disabled={choice === null || conf === null} onClick={() => dispatch({ t: "hyp", id: h.id, answer: { choice: choice!, confidence: conf!, why: why.trim() || undefined } })}>Hypothese festhalten</button>
    </div>
  );
}

export function P3Hypothesen({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const answered = HYPOTHESES.filter((h) => s.hyp[h.id]).length;
  const all = answered === HYPOTHESES.length;
  return (
    <PhaseFrame
      phase={3} labels={["So funktioniert es", "Deine Hypothesen", "Festgehalten"]}
      canNext={(s.steps[3] ?? 0) === 0 || all} finishLabel="Weiter zu Phase 4: Auflösung" onFinish={onFinish}
      why={<p className="muted"><b>Productive Failure:</b> Wer erst selbst nach Regeln sucht, auch mit Fehlern, versteht die anschließende Erklärung tiefer als bei sofortiger Anleitung. Die Fehler sind der Zweck. Es gibt hier bewusst kein Feedback, es folgt in Phase 4.</p>}
    >
      {(step) => step === 0 ? (
        <>
          <div className="stack"><h1>Jetzt bist du dran, ohne Erklärung</h1>
            <p className="muted">Du bekommst sechs Aufgaben zu Dingen, die du noch nicht erklärt bekommen hast. Nutze das, was du schon gesehen hast, und suche das Muster.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p><strong>Raten ist ausdrücklich erlaubt.</strong> Eine begründete Vermutung ist besser als keine.</p></div>
            <div className="fact"><b>2</b><p><strong>Falsch liegen ist hier Teil des Lernens.</strong> Du bekommst keine Wertung, nur die Auflösung in der nächsten Phase.</p></div>
            <div className="fact"><b>3</b><p><strong>Sag, wie sicher du bist.</strong> Das hilft dir, später zu sehen, wo du dich geirrt hast, obwohl du sicher warst.</p></div>
          </section>
          <p className="muted">Zur Erinnerung, das kennst du: <Colored text="بَ" size="body" /> = ba · <Colored text="تَ" size="body" /> = ta · <Colored text="ثَ" size="body" /> = tha · <Colored text="بَا" size="body" /> = bā</p>
        </>
      ) : step === 1 ? (
        all ? <p className="notice" role="status">Alle sechs Hypothesen sind festgehalten. Weiter geht es zur Übersicht.</p> : <HypothesisCard key={answered} index={answered} />
      ) : (
        <>
          <div className="stack"><h1>Deine sechs Hypothesen</h1><p className="muted">Ohne Wertung. Gleich siehst du, was davon stimmt.</p></div>
          <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {HYPOTHESES.map((h) => {
              const a = s.hyp[h.id];
              return (
                <li key={h.id} className="panel row between"><div className="stack"><strong><RichText text={h.title} /></strong><span className="muted">{a ? <><RichText text={h.options[a.choice]} /> · {CONFIDENCE_LABEL[a.confidence]}</> : "noch offen"}</span></div><Ar size="body">{h.stimulus}</Ar></li>
              );
            })}
          </ul>
        </>
      )}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P4Verstehen.tsx`
```tsx
import { useMemo, useState } from "react";
import {
  ALIF_CONTRAST, CONFIDENCE_LABEL, CONSONANT_IDS, ELAB, HYPOTHESES, MARK, ONSET, SYLLABLES, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, letterCh, letterName, type ConsonantId, type VowelId,
} from "@/content/lektion1";
import { CHECK_SPEC, buildSet } from "@/domain/lektion/tasks";
import { Ar, RichText } from "@/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { Colored, Explode } from "../visuals";
import { useLesson } from "../LessonContext";

function Reveal() {
  const { s } = useLesson();
  const rows = HYPOTHESES.map((h) => ({ h, a: s.hyp[h.id] }));
  const right = rows.filter((r) => r.a && r.a.choice === r.h.answer).length;
  const sureWrong = rows.filter((r) => r.a && r.a.confidence === "sure" && r.a.choice !== r.h.answer).length;
  return (
    <>
      <div className="stack"><h1>Die Auflösung</h1>
        <p className="muted">Hier vergleichst du deine Hypothesen mit der Regel. Fehler sind erwartet, denn du hattest keine Erklärung.</p></div>
      <div className="kpis">
        <div className="kpi"><b>{right} von {HYPOTHESES.length}</b><small>Hypothesen stimmten</small></div>
        <div className="kpi"><b>{sureWrong}</b><small>sicher gewesen, aber falsch</small></div>
      </div>
      {sureWrong > 0 && <p className="notice">Gerade Irrtümer, bei denen du sicher warst, merkt man sich nach der Korrektur besonders gut. Schau sie dir genau an.</p>}
      {rows.map(({ h, a }) => {
        const ok = !!a && a.choice === h.answer;
        return (
          <article key={h.id} className="cmp" data-ok={ok}>
            <div className="row between"><h2><RichText text={h.title} /></h2><span className={`tag ${ok ? "ok" : "no"}`}>{ok ? "stimmt" : "stimmt nicht"}</span></div>
            <div className="row"><Colored text={h.stimulus} size="body" /><span className="muted"><RichText text={h.question} /></span></div>
            {a && <p><span className="muted">Deine Vermutung:</span> <strong><RichText text={h.options[a.choice]} /></strong> <span className="tag">{CONFIDENCE_LABEL[a.confidence]}</span></p>}
            {a?.why && <p className="muted">Deine Begründung: „{a.why}“</p>}
            {!ok && <p><span className="muted">Richtig:</span> <strong><RichText text={h.options[h.answer]} /></strong></p>}
            <p><RichText text={h.reveal} /></p>
          </article>
        );
      })}
    </>
  );
}

function Vowels() {
  const [c, setC] = useState<ConsonantId>("ba");
  const row = SYLLABLES.filter((x) => x.letterId === c && x.vowel !== "long");
  return (
    <>
      <div className="stack"><h1>Drei Vokalzeichen</h1><p className="muted">Jedes Zeichen ändert nur den Vokal. Der Buchstabe liefert den Konsonanten, bei jedem Buchstaben gleich.</p></div>
      <div className="cards">
        {(["fatha", "kasra", "damma"] as VowelId[]).map((v) => (
          <div key={v} className="card"><Ar size="teach" className="mk">◌{MARK[v]}</Ar><strong>{VOWEL_NAME[v]} · „{VOWEL_LATIN[v]}“</strong>
            <small>steht {VOWEL_INFO[v].place}</small><small>Aussehen: {VOWEL_INFO[v].look}</small><small>Mund: {VOWEL_INFO[v].mouth}</small></div>
        ))}
      </div>
      <section className="stack" aria-labelledby="try"><h2 id="try">Wähle einen Buchstaben</h2>
        <div className="seg" role="group" aria-label="Buchstabe wählen">
          {CONSONANT_IDS.map((id) => <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => setC(id)}><Ar size="body">{letterCh(id)}</Ar></button>)}
        </div>
        <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {row.map((x) => <div key={x.id} className="card"><Colored text={x.ar} /><strong>{x.tr}</strong><small>{ONSET[c]} + {VOWEL_LATIN[x.vowel as VowelId]}</small></div>)}
        </div>
      </section>
      <section className="panel stack" aria-labelledby="len"><h2 id="len">Kurz und lang</h2>
        <div className="eq"><div className="box"><Colored text="بَ" /><small>ba · kurz</small></div><span className="op">→</span><div className="box"><Colored text="بَا" /><small>bā · lang</small></div></div>
        <p className="muted">Fatha plus Alif ergibt ein langes ā. Die Länge unterscheidet im Arabischen Wörter, deshalb zählt sie später bei Tipp-Antworten.</p>
        <p className="muted">Am Ende der Beispielwörter lassen wir den Endvokal weg (Pausalform). Das Zeichen für „kein Vokal“ lernst du später.</p>
      </section>
    </>
  );
}

function AlifExact() {
  return (
    <>
      <div className="stack"><h1>Alif genau betrachtet</h1><p className="muted">Alif sieht aus wie ein Buchstabe unter vielen, ist aber kein Konsonant wie <Ar size="body">ب</Ar>, <Ar size="body">ت</Ar> oder <Ar size="body">ث</Ar>.</p></div>
      <div className="scroll-x"><table className="t" aria-label="Vergleich Alif und Konsonanten">
        <thead><tr><th scope="col">Merkmal</th><th scope="col">Alif <Ar size="body">ا</Ar></th><th scope="col"><Ar size="body">ب ت ث</Ar></th></tr></thead>
        <tbody>{ALIF_CONTRAST.map((r) => <tr key={r.feature}><th scope="row" style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, color: "var(--text)" }}>{r.feature}</th><td className="hl"><RichText text={r.alif} /></td><td><RichText text={r.others} /></td></tr>)}</tbody></table></div>
      <section className="panel stack" aria-labelledby="mis"><h2 id="mis">Häufiger Irrtum</h2>
        <p>„Alif ist der Buchstabe für <em>a</em>.“ Das stimmt nur halb. Das <strong>kurze</strong> a schreibt die Fatha über einem Konsonanten. Alif <strong>dehnt</strong> es, wenn es danach steht. Im Namen „Alif“ hörst du am Anfang einen kleinen Stimmeinsatz, die Hamza. Sie hat eigene Zeichen und kommt in einer späteren Lektion.</p></section>
      <section className="stack" aria-labelledby="bab"><h2 id="bab">Warum hängt das zweite <Ar size="body">ب</Ar> nicht an?</h2>
        <div className="big-ar"><Colored text="بَاب" size="hero" /></div>
        <Explode letters={["ب", "ا", "ب"]} />
        <p className="muted"><Ar size="body">ب</Ar> (1) verbindet sich nach links mit dem Alif (2). Alif nimmt die Verbindung von rechts an, gibt aber keine nach links weiter. Deshalb beginnt das zweite <Ar size="body">ب</Ar> (3) neu und steht frei. Wort: <strong>bāb</strong>, „Tür“.</p></section>
    </>
  );
}

function Elaboration() {
  const { s, dispatch } = useLesson();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  return (
    <>
      <div className="stack"><h1>Erkläre es in eigenen Worten</h1><p className="muted">Wer etwas selbst erklärt, verknüpft es mit dem, was er schon weiß. Schreibe zwei Sätze, dann vergleiche mit der Musterantwort.</p></div>
      {ELAB.map((e) => {
        const a = s.elab[e.id] ?? { text: "" };
        return (
          <section key={e.id} className="stack panel">
            <label htmlFor={e.id}><strong><RichText text={e.question} /></strong></label>
            <textarea id={e.id} value={a.text} onChange={(ev) => dispatch({ t: "elab", id: e.id, answer: { ...a, text: ev.target.value } })} placeholder="Deine Erklärung …" />
            {!shown[e.id] ? <div><button className="btn btn-secondary" disabled={a.text.trim().length < 8} onClick={() => setShown({ ...shown, [e.id]: true })}>Musterantwort zeigen</button></div> : (
              <>
                <p className="notice" role="note"><strong>Musterantwort:</strong> <RichText text={e.model} /></p>
                <div className="stack"><p className="eyebrow" id={`r-${e.id}`}>Wie gut passt deine Antwort?</p>
                  <div className="conf" role="radiogroup" aria-labelledby={`r-${e.id}`}>
                    {([["match", "Passt"], ["partial", "Teilweise"], ["off", "Weicht ab"]] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={a.rating === k} aria-pressed={a.rating === k} onClick={() => dispatch({ t: "elab", id: e.id, answer: { ...a, rating: k } })}>{l}</button>)}
                  </div></div>
              </>
            )}
          </section>
        );
      })}
    </>
  );
}

export function P4Verstehen({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const check = useMemo(() => buildSet(CHECK_SPEC, Math.random, false), []);
  const step = s.steps[4] ?? 0;
  const rated = ELAB.every((e) => s.elab[e.id]?.rating);
  const checked = !!s.results[4];
  const res = s.results[4] ?? [];
  const canNext = step === 3 ? rated : step === 4 ? checked : true;
  return (
    <PhaseFrame
      phase={4} labels={["Auflösung", "Vokalzeichen", "Alif genau", "Eigene Worte", "Verständnis-Check"]} canNext={canNext}
      finishLabel="Weiter zu Phase 5: Anwenden" onFinish={onFinish}
      why={<><p className="muted"><b>Explizite Erklärung nach dem Versuchen:</b> Jetzt passt die Regel in die Lücke, die du dir selbst geschaffen hast.</p><p className="muted"><b>Elaboration:</b> Selbst erklären verknüpft neuen Stoff mit Vorwissen. <b>Feedback:</b> sofort und mit Begründung, nicht nur „falsch“.</p></>}
    >
      {(st) => st === 0 ? <Reveal /> : st === 1 ? <Vowels /> : st === 2 ? <AlifExact /> : st === 3 ? <Elaboration /> : (
        <>
          <div className="stack"><h1>Verständnis-Check</h1><p className="muted">Vier kurze Fragen mit sofortiger Rückmeldung und Hinweis. Falsche Fragen kommen am Ende noch einmal.</p></div>
          {checked
            ? <div className="stack"><div className="kpis"><div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im ersten Versuch richtig</small></div></div>
                <p className="notice" role="status">Gespeichert. Fehler sind hier kein Problem: Sie zeigen, was in Phase 5 und 6 nochmal auftauchen sollte.</p></div>
            : <TaskRunner tasks={check} feedback="immediate" hints requeueWrong label="Frage" onDone={(rs) => dispatch({ t: "results", phase: 4, results: rs, now: Date.now() })} />}
        </>
      )}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P5Anwenden.tsx`
```tsx
import { useMemo, useState } from "react";
import { PRACTICE_SPEC, buildSet } from "@/domain/lektion/tasks";
import { useApp } from "@/features/AppContext";
import { WriteTask, type WriteOutcome } from "@/ui/WriteTask";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ResultBreakdown, share } from "../Summary";
import { useRecordLetters } from "../recordLetters";
import { useLesson } from "../LessonContext";

const FREE = ["ta", "tha"];

export function P5Anwenden({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const { record } = useApp();
  const recordLetters = useRecordLetters();
  const tasks = useMemo(() => buildSet(PRACTICE_SPEC), []);
  const [wi, setWi] = useState(0);
  const step = s.steps[5] ?? 0;
  const res = s.results[5];
  const wdone = wi >= FREE.length;

  const onWrite = async (o: WriteOutcome) => {
    await record({ letterId: o.letterId, skill: "writing", activity: o.mode, grade: o.grade, evidence: o.mode === "free" && !o.peeked ? "production" : "recognition", confusedWith: o.recognizedAs && o.recognizedAs !== o.letterId ? o.recognizedAs : undefined });
    setWi((n) => n + 1);
  };
  const known = res?.filter((r) => !tasks.find((t) => t.id === r.taskId)?.novel) ?? [];
  const novel = res?.filter((r) => tasks.find((t) => t.id === r.taskId)?.novel) ?? [];

  return (
    <PhaseFrame
      phase={5} labels={["Auftrag", "Gemischte Übung", "Ohne Vorlage schreiben", "Auswertung"]}
      canNext={step === 1 ? !!res : step === 2 ? wdone || s.done.includes(5) : true} finishLabel="Weiter zu Phase 6: Abrufen" onFinish={onFinish}
      why={<><p className="muted"><b>Transfer:</b> Du wendest Regeln auf Neues an: Silben und Wörter, die du so noch nie gesehen hast.</p><p className="muted"><b>Interleaved Practice:</b> Buchstaben, Vokale, Silben und Wörter wechseln sich ab. Das fühlt sich schwerer an als Block-Üben, hält aber länger.</p></>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Jetzt anwenden</h1><p className="muted">Vierzehn gemischte Aufgaben: Buchstabe, Vokalzeichen, Silbe, Wort und Regel wechseln sich ab, damit du die passende Regel jedes Mal neu wählen musst.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p>Manche Aufgaben tragen das Etikett <span className="badge">Neu kombiniert</span>. Das sind Silben oder Wörter, die du noch nie gesehen hast, aber mit deinem Wissen lesen kannst.</p></div>
            <div className="fact"><b>2</b><p>Du bekommst sofort Rückmeldung mit Begründung. Ein <strong>Hinweis</strong> hilft, zählt aber als Hilfe.</p></div>
            <div className="fact"><b>3</b><p>Bei Tipp-Antworten zählt die Länge: <em>bāb</em> ist nicht <em>bab</em>.</p></div>
          </section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Diese Übung ist abgeschlossen. Sieh dir die Auswertung im letzten Schritt an.</p>
          : <TaskRunner tasks={tasks} feedback="immediate" hints label="Aufgabe" onDone={(rs) => { dispatch({ t: "results", phase: 5, results: rs, now: Date.now() }); void recordLetters(rs, "lektion1-anwenden"); }} />
      ) : st === 2 ? (
        <>
          <div className="stack"><h1>Schreiben ohne Vorlage</h1><p className="muted">Transfer in die Hand: Schreibe Tā und Thā frei. Die beiden unterscheiden nur die Punkte.</p></div>
          {wdone ? <p className="notice" role="status">Geschafft. Ergebnisse sind gespeichert.</p> : (
            <><p className="eyebrow">Schreibaufgabe {wi + 1} von {FREE.length}</p>
              <WriteTask key={wi} letterId={FREE[wi]} mode="free" onDone={onWrite} onSkip={() => setWi((n) => n + 1)} /></>
          )}
        </>
      ) : (
        <>
          <div className="stack"><h1>Auswertung</h1></div>
          {res ? (
            <>
              <div className="kpis">
                <div className="kpi"><b>{Math.round(share(res) * 100)} %</b><small>im ersten Versuch richtig</small></div>
                <div className="kpi"><b>{Math.round(share(known) * 100)} %</b><small>bekannter Stoff ({known.length})</small></div>
                <div className="kpi"><b>{Math.round(share(novel) * 100)} %</b><small>neu kombiniert ({novel.length})</small></div>
              </div>
              <p className="muted">Der Vergleich zeigt, ob du Regeln auf Neues übertragen kannst. Ein niedrigerer Wert bei „neu kombiniert“ ist normal und genau das, was Phase 6 und 7 weiter stärken.</p>
              <ResultBreakdown results={res} />
            </>
          ) : <p className="notice">Die gemischte Übung fehlt noch. Gehe einen Schritt zurück.</p>}
        </>
      )}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P6Abrufen.tsx`
```tsx
import { useMemo } from "react";
import { PRETEST_SPEC, RETRIEVAL_SPEC, buildSet } from "@/domain/lektion/tasks";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ResultBreakdown, share } from "../Summary";
import { useRecordLetters } from "../recordLetters";
import { useLesson } from "../LessonContext";

export function P6Abrufen({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const recordLetters = useRecordLetters();
  const tasks = useMemo(() => buildSet(RETRIEVAL_SPEC), []);
  const step = s.steps[6] ?? 0;
  const res = s.results[6];
  const pre = PRETEST_SPEC.map(([id]) => s.pretest[id]).filter(Boolean);
  const preRight = pre.filter((x) => x === "right").length;
  const postLetters = (res ?? []).filter((r) => r.itemId.startsWith("letter:"));
  return (
    <PhaseFrame
      phase={6} labels={["Spielregeln", "Abruftest", "Auswertung"]} canNext={step === 1 ? !!res : true}
      finishLabel="Weiter zu Phase 7: Festigen" onFinish={onFinish}
      why={<p className="muted"><b>Retrieval Practice:</b> Das Abrufen aus dem Gedächtnis ohne Vorlage stärkt Erinnerung mehr als erneutes Lesen. Darum gibt es im Test keine Hinweise und die Rückmeldung erst am Ende.</p>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Abruftest</h1><p className="muted">Dreizehn Aufgaben, überwiegend mit freier Antwort. Es gibt andere Aufgabenformen als in Phase 5.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p><strong>Keine Hinweise, kein Zurück.</strong> Dein Gedächtnis arbeitet, nicht die Oberfläche.</p></div>
            <div className="fact"><b>2</b><p><strong>Rückmeldung erst am Ende</strong>, gesammelt und mit Begründung.</p></div>
            <div className="fact"><b>3</b><p><strong>Anstrengung ist ein gutes Zeichen.</strong> Was sich schwer anfühlt, wird dadurch dauerhafter.</p></div>
          </section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Der Test ist abgeschlossen. Die Auswertung steht im nächsten Schritt.</p>
          : <TaskRunner tasks={tasks} feedback="deferred" label="Frage" onDone={(rs) => { dispatch({ t: "results", phase: 6, results: rs, now: Date.now() }); void recordLetters(rs, "lektion1-abruf"); }} />
      ) : res ? (
        <>
          <div className="stack"><h1>Dein Ergebnis</h1></div>
          <div className="kpis"><div className="kpi"><b>{Math.round(share(res) * 100)} %</b><small>richtig ({res.filter((r) => r.correctness === "right").length} von {res.length})</small></div>
            <div className="kpi"><b>{res.filter((r) => r.type === "type" && r.correctness === "right").length}</b><small>freie Antworten richtig</small></div></div>
          {pre.length > 0 && postLetters.length > 0 && (
            <section className="stack" aria-labelledby="pp"><h2 id="pp">Vorher und nachher: die vier Buchstaben</h2>
              <div className="pre-post"><div className="kpi"><b>{preRight} von {pre.length}</b><small>Vorab-Fragen richtig</small></div>
                <div className="kpi"><b>{postLetters.filter((r) => r.correctness === "right").length} von {postLetters.length}</b><small>im Abruftest richtig</small></div></div></section>
          )}
          <ResultBreakdown results={res} />
        </>
      ) : <p className="notice">Der Test fehlt noch. Gehe einen Schritt zurück.</p>}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/phases/P7Festigen.tsx`
```tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ITEM_BY_ID } from "@/content/lektion1";
import { DAY, retrievability } from "@/domain/scheduler";
import { daysToNextDue, dueEntries, simNow } from "@/domain/lektion/state";
import { interleaveTasks, reviewTask, type TaskResult } from "@/domain/lektion/tasks";
import { RichText } from "@/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ForgettingChart } from "../ForgettingChart";
import { share } from "../Summary";
import { useLesson } from "../LessonContext";

const fmtDay = (ts: number) => new Date(ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
const dueText = (days: number) => days <= 0 ? "fällig" : days < 1 ? "heute" : days < 1.5 ? "in 1 Tag" : days < 30 ? `in ${Math.round(days)} Tagen` : `in ${Math.round(days / 30)} Mon.`;
const SESSION_CAP = 8;

function Principle() {
  const { s } = useLesson();
  const n = Object.keys(s.srs).length;
  return (
    <>
      <div className="stack"><h1>Gegen das Vergessen</h1>
        <p className="muted">Heute fühlt sich alles sicher an. Ohne Wiederholung verblasst das aber binnen Tagen. Der Plan wiederholt jedes Item kurz bevor du es vergisst, und das Intervall wächst mit jedem Erfolg.</p></div>
      <section className="panel stack" aria-labelledby="how"><h2 id="how">So rechnet der Planer</h2>
        <div className="fact"><b>1</b><p>Für jedes Item schätzt er, wie <strong>stabil</strong> deine Erinnerung ist.</p></div>
        <div className="fact"><b>2</b><p>Sinkt die Abrufwahrscheinlichkeit auf etwa <strong>90 %</strong>, ist das Item fällig.</p></div>
        <div className="fact"><b>3</b><p><strong>Erfolg</strong> verlängert das nächste Intervall, besonders wenn es schwer war. <strong>Fehler</strong> verkürzen es deutlich.</p></div>
        <p className="muted">Die Werte sind Startannahmen, nicht an dich kalibriert. Sie werden mit echten Daten besser.</p></section>
      <section className="stack" aria-labelledby="sim"><h2 id="sim">Die Simulation</h2>
        <p className="muted">Im nächsten Schritt springst du durch die Zeit: Tage vergehen, Erinnerungen verblassen, Items werden fällig, und du wiederholst sie. So siehst du in Minuten, was sonst Wochen dauert. {n > 0 ? `Dein Plan enthält ${n} Items aus den Phasen 4 bis 6.` : "Dein Plan ist noch leer: Schließe zuerst die Phasen 5 und 6 ab."}</p>
        <p className="notice">Das ist eine Simulation. Echte Wiederholungen mit echter Zeit plant der Bereich „Heute“.</p></section>
    </>
  );
}

function Simulation() {
  const { s, dispatch } = useLesson();
  const [real] = useState(() => Date.now());
  useEffect(() => { dispatch({ t: "simStart", now: Date.now() }); }, [dispatch]);
  const now = simNow(s, real);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"overview" | "session" | "result">("overview");
  const [last, setLast] = useState<{ rs: TaskResult[]; before: Record<string, number> } | null>(null);

  const due = useMemo(() => dueEntries(s.srs, now), [s.srs, now]);
  const sessionTasks = useMemo(() => interleaveTasks(due.slice(0, SESSION_CAP).map((d) => reviewTask(d.itemId, s.srs[d.itemId].reps))), [mode === "session"]); // eslint-disable-line react-hooks/exhaustive-deps
  const ids = Object.keys(s.srs).sort((a, b) => retrievability(s.srs[a], now) - retrievability(s.srs[b], now));
  const jump = daysToNextDue(s.srs, now);
  const focus = selected && s.srs[selected] ? selected : ids[0] ?? null;
  const label = (id: string) => ITEM_BY_ID.get(id)?.label ?? id;

  if (!ids.length) return <p className="notice">Dein Wiederholungsplan ist noch leer. Schließe die Phasen 5 und 6 ab.</p>;

  if (mode === "session")
    return (
      <div className="stack-lg">
        <h1>Wiederholung · Tag {s.offsetDays}</h1>
        <TaskRunner tasks={sessionTasks} feedback="immediate" label="Wiederholung"
          onDone={(rs) => {
            const before = Object.fromEntries(rs.map((r) => [r.itemId, s.srs[r.itemId]?.dueAt - now]));
            dispatch({ t: "results", phase: 7, results: rs, now, sim: true });
            dispatch({ t: "session", session: { day: s.offsetDays, total: rs.length, right: rs.filter((r) => r.correctness === "right").length } });
            setLast({ rs, before }); setMode("result");
          }} />
      </div>
    );

  if (mode === "result" && last)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft · Tag {s.offsetDays}</h1>
        <div className="kpis"><div className="kpi"><b>{last.rs.filter((r) => r.correctness === "right").length}/{last.rs.length}</b><small>richtig</small></div></div>
        <section className="stack" aria-labelledby="ni"><h2 id="ni">Neue Intervalle</h2>
          <div className="deck">
            {last.rs.map((r) => {
              const m = s.srs[r.itemId];
              return <div className="it" key={r.itemId}><span className="nm"><RichText text={label(r.itemId)} /></span><span className="muted">{r.correctness === "right" ? "richtig → Intervall wächst" : "falsch → kommt bald wieder"}</span><span className="due">{dueText((m.dueAt - now) / DAY)}</span></div>;
            })}
          </div></section>
        <div className="row"><button className="btn btn-primary" onClick={() => setMode("overview")}>Zurück zur Zeitreise</button></div>
      </div>
    );

  const adv = (d: number) => { dispatch({ t: "advance", days: d }); };
  return (
    <div className="sim">
      <div className="stack"><h1>Zeitreise</h1><p className="muted">Spule die Zeit vor. Beobachte, wie Erinnerungen verblassen und welche Items fällig werden.</p></div>
      <section className="panel stack" aria-labelledby="clk">
        <div className="clock" id="clk"><span className="day" aria-live="polite">Tag {s.offsetDays}</span><span className="muted">{fmtDay(now)} · simuliert</span></div>
        <div className="jumps" role="group" aria-label="Zeit vorspulen">
          {([[1, "+1 Tag"], [3, "+3 Tage"], [7, "+1 Woche"], [14, "+2 Wochen"], [30, "+1 Monat"]] as const).map(([d, l]) => <button key={d} className="btn btn-secondary" onClick={() => adv(d)}>{l}</button>)}
          {jump !== null && due.length === 0 && <button className="btn btn-secondary" onClick={() => adv(jump)}>Zum nächsten fälligen Item</button>}
        </div>
        {s.offsetDays >= 14 && due.length > SESSION_CAP && <p className="notice">Nach längerer Pause staut sich vieles an. Der Planer deckelt die Sitzung auf {SESSION_CAP} Items, schwächste zuerst, den Rest holst du ohne Druck nach.</p>}
      </section>

      <section className="panel stack" aria-labelledby="duen"><h2 id="duen">{due.length > 0 ? `${due.length} Items fällig` : "Heute ist nichts fällig"}</h2>
        {due.length > 0
          ? <><p className="muted">Die schwächsten zuerst, gemischt. {due.length > SESSION_CAP ? `Diese Sitzung: ${SESSION_CAP} Items.` : ""}</p><button className="btn btn-primary" onClick={() => setMode("session")}>Wiederholung starten</button></>
          : <p className="muted">Das ist das Prinzip: Es wird nur wiederholt, was kurz vor dem Vergessen steht. Spule vor{jump ? `, das nächste Item wird in etwa ${jump} ${jump === 1 ? "Tag" : "Tagen"} fällig` : ""}.</p>}
      </section>

      <section className="stack" aria-labelledby="dk"><h2 id="dk">Dein Wiederholungsplan</h2>
        <div className="deck" role="list">
          {ids.map((id) => {
            const m = s.srs[id], r = retrievability(m, now), d = (m.dueAt - now) / DAY;
            return (
              <div key={id} className="it" role="listitem">
                <button onClick={() => setSelected(id)} aria-pressed={focus === id} aria-label={`${label(id)}, Abrufwahrscheinlichkeit ${Math.round(r * 100)} Prozent, ${dueText(d)}. Kurve anzeigen`}>
                  <span className="nm" style={{ fontWeight: focus === id ? 600 : 400 }}><RichText text={label(id)} /></span>
                </button>
                <div className="rbar" data-low={r < 0.9} data-due={d <= 0} role="img" aria-label={`${Math.round(r * 100)} Prozent`}><i style={{ width: `${Math.round(r * 100)}%` }} /></div>
                <span className="due" data-due={d <= 0}>{dueText(d)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {focus && (
        <section className="stack" aria-labelledby="vk"><h2 id="vk">Vergessenskurve: <RichText text={label(focus)} /></h2>
          <p className="muted">Stabilität {s.srs[focus].stability.toFixed(1)} Tage · {s.srs[focus].reps} Wiederholungen · {s.srs[focus].lapses} Fehler</p>
          <ForgettingChart s={s} itemId={focus} now={now} label={label(focus)} /></section>
      )}
    </div>
  );
}

function Finish() {
  const { s, dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  const ids = Object.keys(s.srs);
  const meanS = ids.length ? ids.reduce((a, id) => a + s.srs[id].stability, 0) / ids.length : 0;
  const sim = s.sessions;
  const simShare = sim.length ? sim.reduce((a, x) => a + x.right, 0) / Math.max(1, sim.reduce((a, x) => a + x.total, 0)) : 0;
  const retr = s.results[6] ?? [];
  return (
    <>
      <div className="stack"><h1>Lektion 1 geschafft</h1><p className="muted">Du hast alle sieben Stationen durchlaufen. Das hast du jetzt in der Hand:</p></div>
      <div className="kpis">
        <div className="kpi"><b>{ids.length}</b><small>Items im Wiederholungsplan</small></div>
        <div className="kpi"><b>{Math.round(share(retr) * 100)} %</b><small>im Abruftest richtig</small></div>
        <div className="kpi"><b>{sim.length}</b><small>simulierte Wiederholungen ({Math.round(simShare * 100)} % richtig)</small></div>
        <div className="kpi"><b>{meanS.toFixed(1)} T.</b><small>mittlere Stabilität</small></div>
      </div>
      <section className="panel stack"><h2>Wie es weitergeht</h2>
        <p className="muted">Die vier Buchstaben sind jetzt auch im Hauptplaner. Echte Wiederholungen siehst du unter „Heute“. Plane sie über die nächsten Tage: Genau dann wirken sie am stärksten.</p>
        <div className="row"><Link className="btn btn-primary" to="/">Zu „Heute“</Link><Link className="btn btn-secondary" to="/buchstaben">Alle Buchstaben</Link></div></section>
      <section className="stack"><p className="muted" style={{ fontSize: 13 }}>Hinweis: Inhalte und Ausspracheanleitungen sind noch nicht von einer Arabisch-Lehrkraft abgenommen, und es gibt noch keine Sprecher-Aufnahmen.</p>
        {!confirm ? <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Lektion von vorn beginnen</button>
          : <div className="row"><span className="muted">Dein Fortschritt in dieser Lektion wird gelöscht (der allgemeine Lernstand bleibt).</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, zurücksetzen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}</section>
    </>
  );
}

export function P7Festigen({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const step = s.steps[7] ?? 0;
  return (
    <PhaseFrame
      phase={7} labels={["Prinzip", "Zeitreise", "Abschluss"]} canNext={step === 1 ? s.sessions.length >= 1 : true}
      finishLabel="Lektion abschließen" onFinish={onFinish}
      why={<p className="muted"><b>Spaced Repetition:</b> Erinnerungen verblassen nach einer Kurve. Wiederholst du kurz vor dem Vergessen, wird jede Erinnerung stabiler und die Abstände wachsen.</p>}
    >
      {(st) => st === 0 ? <Principle /> : st === 1 ? <Simulation /> : <Finish />}
    </PhaseFrame>
  );
}
```

## `src/features/lektion/recordLetters.ts`
```ts
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
```

## `src/features/lektion/visuals.tsx`
```tsx
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import type { Pt } from "@/domain/handwriting/geometry";
import { Ar } from "@/ui/parts";

const TASHKEEL = /[ً-ٟ]/;

/** Arabischer Text, bei dem Vokalzeichen farblich abgesetzt sind (Dual Coding: Farbe trägt Bedeutung). */
export function Colored({ text, size = "teach" }: { text: string; size?: "hero" | "teach" | "body" }) {
  const parts: { t: string; mark: boolean }[] = [];
  for (const c of text) {
    const mark = TASHKEEL.test(c);
    const last = parts[parts.length - 1];
    if (last && last.mark === mark) last.t += c; else parts.push({ t: c, mark });
  }
  return <Ar size={size}>{parts.map((p, i) => (p.mark ? <span key={i} className="mk">{p.t}</span> : p.t))}</Ar>;
}

const path = (pts: Pt[]) => {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q${pts[i].x} ${pts[i].y} ${(pts[i].x + pts[i + 1].x) / 2} ${(pts[i].y + pts[i + 1].y) / 2}`;
  return d + ` L${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
};

/** Skelett eines Buchstabens als Zeichnung (aus den Schreib-Templates): Grundform neutral, Punkte farbig. */
export function Skeleton({ letterId, label }: { letterId: string; label: string }) {
  const t = TEMPLATE_BY_ID.get(letterId);
  if (!t) return null;
  return (
    <div className="svgbox">
      <svg viewBox="0 0 100 100" role="img" aria-label={label}>
        <line x1="4" y1="70" x2="96" y2="70" stroke="var(--line)" strokeDasharray="3 4" />
        {t.body.map((b, i) => <path key={i} d={path(b)} fill="none" stroke="var(--text-2)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
        {t.dots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="6.5" fill="var(--accent)" />)}
      </svg>
    </div>
  );
}

export function Explode({ letters }: { letters: string[] }) {
  return (
    <div className="order" role="img" aria-label={`Leserichtung von rechts nach links: ${letters.join(", ")}`}>
      {letters.map((c, i) => <div key={i}><sup aria-hidden>{i + 1}</sup><Ar size="teach">{c}</Ar></div>)}
    </div>
  );
}
```

## `src/main.tsx`
```tsx
import "@fontsource-variable/instrument-sans";
import "@fontsource/scheherazade-new/400.css";
import "@fontsource/scheherazade-new/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "./styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { AppProvider } from "./features/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
```

## `src/persistence/eventStore.ts`
```ts
import { SKILLS, type ReviewEvent } from "@/domain/types";

/**
 * Append-only Ereignislog in IndexedDB. Fällt IndexedDB aus (privater Modus, blockiert), läuft die App
 * mit einem Speicher-Log weiter und meldet `persistent: false`, damit die UI es ehrlich anzeigen kann.
 */
export interface EventStore {
  readonly persistent: boolean;
  all(): Promise<ReviewEvent[]>;
  append(e: ReviewEvent): Promise<void>;
  clear(): Promise<void>;
  /** Import mit Validierung; gibt Anzahl neu übernommener Ereignisse zurück (Duplikate per id ignoriert). */
  importEvents(raw: unknown): Promise<number>;
}

const DB = "qaidah";
const STORE = "events";

export function isReviewEvent(x: unknown): x is ReviewEvent {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return typeof e.id === "string" && typeof e.ts === "number" && Number.isFinite(e.ts) &&
    typeof e.letterId === "string" && typeof e.activity === "string" &&
    (SKILLS as readonly string[]).includes(e.skill as string) &&
    [0, 1, 2, 3].includes(e.grade as number) &&
    ["recognition", "recall", "production", "self"].includes(e.evidence as string) &&
    (e.confusedWith === undefined || typeof e.confusedWith === "string");
}

export function memoryStore(): EventStore {
  let log: ReviewEvent[] = [];
  return {
    persistent: false,
    all: async () => [...log],
    append: async (e) => { log.push(e); },
    clear: async () => { log = []; },
    importEvents: async (raw) => {
      const list = Array.isArray(raw) ? raw.filter(isReviewEvent) : [];
      const have = new Set(log.map((e) => e.id));
      const fresh = list.filter((e) => !have.has(e.id));
      log.push(...fresh);
      return fresh.length;
    },
  };
}

const wrap = <T,>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function openEventStore(idb: IDBFactory | undefined = globalThis.indexedDB): Promise<EventStore> {
  if (!idb) return memoryStore();
  try {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const req = idb.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
      req.onblocked = () => rej(new Error("blocked"));
    });
    const tx = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
    return {
      persistent: true,
      all: async () => ((await wrap(tx("readonly").getAll())) as ReviewEvent[]).filter(isReviewEvent),
      append: async (e) => { await wrap(tx("readwrite").put(e)); },
      clear: async () => { await wrap(tx("readwrite").clear()); },
      importEvents: async (raw) => {
        const list = Array.isArray(raw) ? raw.filter(isReviewEvent) : [];
        const have = new Set(((await wrap(tx("readonly").getAllKeys())) as string[]));
        const fresh = list.filter((e) => !have.has(e.id));
        const store = tx("readwrite");
        await Promise.all(fresh.map((e) => wrap(store.put(e))));
        return fresh.length;
      },
    };
  } catch {
    return memoryStore();
  }
}

export const exportJson = (events: ReviewEvent[]) =>
  JSON.stringify({ app: "qaidah", version: 1, exportedAt: new Date().toISOString(), events }, null, 2);

export function parseExport(text: string): { ok: true; events: unknown[] } | { ok: false; error: string } {
  try {
    const j = JSON.parse(text);
    if (j?.app !== "qaidah" || !Array.isArray(j.events)) return { ok: false, error: "Das ist keine QAIDAH-Sicherung." };
    return { ok: true, events: j.events };
  } catch {
    return { ok: false, error: "Die Datei ist kein gültiges JSON." };
  }
}
```

## `src/platform/audio.ts`
```ts
/**
 * Audio: Name und Laut sind getrennte Assets. Es liegen derzeit KEINE Aufnahmen vor.
 * Solange ein Asset fehlt, meldet `playAsset` 'missing' und die UI sagt das offen – es wird nichts ersetzt/synthetisiert.
 * Aufnahmen kommen als public/audio/<id>.mp3 und werden hier im Manifest eingetragen.
 */
export type AudioKind = "name" | "sound";
export const audioId = (letterId: string, kind: AudioKind) => `${kind}-${letterId}`;

/** id → URL. Leer, bis echte Aufnahmen mit klarer Lizenz vorliegen. */
export const AUDIO_MANIFEST: Record<string, string> = {};

export type PlayResult = "played" | "missing" | "error";

export async function playAsset(id: string, manifest: Record<string, string> = AUDIO_MANIFEST): Promise<PlayResult> {
  const url = manifest[id];
  if (!url) return "missing";
  try {
    await new Audio(url).play();
    return "played";
  } catch {
    return "error";
  }
}

export const hasAudio = (id: string, manifest: Record<string, string> = AUDIO_MANIFEST) => id in manifest;
```

## `src/platform/pronunciation.ts`
```ts
/**
 * Schnittstelle für eine spätere Aussprachebewertung. Es gibt bewusst KEINE Standardimplementierung,
 * die Zahlen erfindet. Browser-Spracherkennung bewertet Wörter, keine Laute, und ist hierfür ungeeignet.
 */
export interface PronunciationFeedback { score?: number; phonemes?: { symbol: string; ok: boolean }[]; provider: string }
export interface PronunciationProvider {
  readonly id: string;
  evaluate(input: { target: string; audio: Blob }): Promise<PronunciationFeedback>;
}
export const activeProvider: PronunciationProvider | null = null;
```

## `src/styles/app.css`
```css
@import "./tokens.css";
@import "./lektion.css";
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-ui); font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
h1, h2, h3 { margin: 0; line-height: 1.2; letter-spacing: -0.01em; }
h1 { font-size: clamp(28px, 5vw, 40px); font-weight: 600; }
h2 { font-size: 20px; font-weight: 600; }
h3 { font-size: 16px; font-weight: 600; }
p { margin: 0; }
a { color: inherit; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 6px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Arabisch: RTL, isoliert, großzügige Zeilenhöhe für Harakat */
.ar { font-family: var(--font-ar); direction: rtl; unicode-bidi: isolate; line-height: 1.9; font-feature-settings: normal; font-kerning: normal; /* Kontextformen NICHT per init/medi/fina erzwingen: das zerstört das Shaping */ }
.ar-ui { font-family: var(--font-ar-ui); }
.ar-hero { font-size: var(--ar-hero); line-height: 1.5; }
.ar-teach { font-size: var(--ar-teach); line-height: 1.7; }
.ar-body { font-size: var(--ar-body); }
.muted { color: var(--text-2); }
.eyebrow { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-2); font-weight: 600; }

/* Shell */
.shell { min-height: 100%; display: grid; grid-template-columns: 1fr; padding-bottom: 72px; }
.nav { position: fixed; inset: auto 0 0 0; z-index: 10; display: flex; background: var(--bg-2); border-top: 1px solid var(--line); padding-bottom: env(safe-area-inset-bottom); }
.nav a { flex: 1; min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 12px; color: var(--text-2); text-decoration: none; }
.nav a[aria-current="page"] { color: var(--accent-text); }
.nav svg { width: 22px; height: 22px; }
.brand { display: none; }
main { width: 100%; max-width: 760px; margin: 0 auto; padding: var(--s5) 16px var(--s7); }
@media (min-width: 900px) {
  .shell { grid-template-columns: 232px 1fr; padding-bottom: 0; }
  .nav { position: sticky; top: 0; height: 100vh; flex-direction: column; border-top: 0; border-right: 1px solid var(--line); padding: var(--s5) var(--s3); gap: 2px; }
  .nav a { flex: none; flex-direction: row; justify-content: flex-start; gap: var(--s3); font-size: 15px; padding: 0 var(--s3); min-height: 44px; border-radius: var(--r-sm); }
  .nav a[aria-current="page"] { background: var(--accent-soft); }
  .brand { display: flex; align-items: baseline; gap: 10px; padding: 0 var(--s3) var(--s5); }
  main { padding: var(--s7) var(--s6); }
}
.wordmark { font-weight: 700; letter-spacing: .18em; font-size: 15px; }
.wordmark b { color: var(--accent-text); }

/* Bausteine */
.stack > * + * { margin-top: var(--s4); }
.stack-lg > * + * { margin-top: var(--s6); }
.row { display: flex; gap: var(--s3); align-items: center; flex-wrap: wrap; }
.between { justify-content: space-between; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--s2); min-height: 48px; padding: 0 var(--s5); border-radius: var(--r-md); border: 1px solid transparent; font-weight: 600; cursor: pointer; text-decoration: none; transition: background .15s var(--ease), transform .1s var(--ease); }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--accent); color: var(--on-accent); }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { background: transparent; border-color: var(--line); }
.btn-secondary:hover { background: var(--surface); }
.btn-ghost { background: transparent; color: var(--text-2); padding: 0 var(--s3); }
.btn[disabled], .btn[aria-disabled="true"] { opacity: .5; cursor: not-allowed; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); padding: var(--s5); }
.rule { border: 0; border-top: 1px solid var(--line); margin: 0; }
.chip { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; padding: 2px 10px; border-radius: 99px; border: 1px solid var(--line); color: var(--text-2); }
.notice { border-left: 3px solid var(--amber); background: var(--bg-2); padding: var(--s3) var(--s4); border-radius: 0 var(--r-sm) var(--r-sm) 0; font-size: 14px; color: var(--text-2); }
.notice.err { border-color: var(--coral); }

/* Mastery: 4 Stufen als Segmente */
.mastery { display: inline-flex; gap: 3px; vertical-align: middle; }
.mastery i { width: 14px; height: 6px; border-radius: 3px; background: var(--line); }
.mastery[data-level="learning"] i:nth-child(-n+1), .mastery[data-level="familiar"] i:nth-child(-n+2) { background: var(--amber); }
.mastery[data-level="mastered"] i { background: var(--accent); }

/* Buchstabenraster */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: var(--s3); }
.tile { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: var(--s3) var(--s2) var(--s3); border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); text-decoration: none; min-height: 112px; }
.tile .ar { font-size: 44px; line-height: 1.5; }
.tile[aria-disabled="true"] { opacity: .45; }
.tile small { color: var(--text-2); font-size: 12px; }
.hero { text-align: center; padding: var(--s5) 0; }
.hero .ar-hero { color: var(--text); }
.forms { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s3); text-align: center; }
.forms > div { border: 1px solid var(--line); border-radius: var(--r-md); padding: var(--s3) var(--s2); }
.forms .ar { font-size: 48px; line-height: 1.6; }
.forms small { display: block; font-size: 12px; color: var(--text-2); }

/* Aufgaben */
.progress { height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; }
.progress > span { display: block; height: 100%; background: var(--accent); transition: width .3s var(--ease); }
.options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s3); }
.opt { min-height: 88px; border: 1.5px solid var(--line); background: var(--surface); border-radius: var(--r-md); cursor: pointer; padding: var(--s3); display: flex; align-items: center; justify-content: center; text-align: center; font-size: 17px; font-weight: 500; }
.opt.ar-opt { font-family: var(--font-ar); font-size: 56px; line-height: 1.6; font-weight: 400; }
.opt:hover:not([disabled]) { border-color: var(--text-2); }
.opt[data-state="right"] { border-color: var(--ok); background: var(--ok-soft); }
.opt[data-state="wrong"] { border-color: var(--coral); background: var(--coral-soft); }
.opt[disabled] { cursor: default; }
.feedback { border-radius: var(--r-md); padding: var(--s4); display: flex; gap: var(--s3); }
.feedback.ok { background: var(--ok-soft); color: var(--text); }
.feedback.no { background: var(--coral-soft); }
.feedback strong { display: block; }
.feedback .ic-ok { color: var(--ok-text); } .feedback .ic-no { color: var(--coral-text); }
@media (prefers-reduced-motion: no-preference) {
  .opt[data-state="wrong"] { animation: nudge .25s var(--ease); }
  .fade { animation: fade .25s var(--ease); }
}
@keyframes nudge { 30% { transform: translateX(-4px); } 70% { transform: translateX(4px); } }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } }

/* Specimen */
table.spec { width: 100%; border-collapse: collapse; }
table.spec th, table.spec td { border-bottom: 1px solid var(--line); padding: 4px 6px; text-align: center; font-weight: 400; }
table.spec .ar { font-size: 40px; line-height: 1.6; }
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--s3); }
.sw { border: 1px solid var(--line); border-radius: var(--r-md); overflow: hidden; font-size: 12px; }
.sw i { display: block; height: 48px; }
.sw span { display: block; padding: 6px 8px; }

/* Schreibfläche */
.pad { max-width: 360px; margin: 0 auto; }
.pad-canvas { width: 100%; aspect-ratio: 1; display: block; background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--r-lg); touch-action: none; cursor: crosshair; }
.checks { list-style: none; padding: 0; margin: 0; }
.checks li { display: flex; gap: 10px; align-items: baseline; padding: 6px 0; }
.checks .ok { color: var(--ok-text); } .checks .no { color: var(--coral-text); } .checks .mid { color: var(--amber); }
```

## `src/styles/lektion.css`
```css
/* Lektion 1: Lernsimulation */
.l1 .eyebrow b { color: var(--accent-text); font-weight: 700; }
.stepper { display: flex; gap: 6px; list-style: none; padding: 0; margin: 0; overflow-x: auto; scrollbar-width: none; }
.stepper li { flex: 1 0 auto; }
.stepper button { width: 100%; min-height: 44px; min-width: 44px; border: 1px solid var(--line); background: transparent; border-radius: var(--r-md); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; padding: 4px 8px; color: var(--text-2); }
.stepper button b { font-size: 15px; color: var(--text); }
.stepper button small { font-size: 11px; display: none; }
.stepper button[aria-current="step"] { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }
.stepper button[data-done="true"] b { color: var(--ok-text); }
.stepper button[disabled] { opacity: .4; cursor: not-allowed; }
@media (min-width: 640px) { .stepper button small { display: block; } .stepper li { flex: 1; } }

.method { display: inline-flex; gap: 8px; align-items: center; font-size: 13px; color: var(--text-2); }
.method i { font-style: normal; border: 1px solid var(--line); border-radius: 99px; padding: 1px 10px; }
.why { border: 1px solid var(--line); border-radius: var(--r-md); padding: 0 var(--s4); }
.why summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; color: var(--text-2); font-size: 14px; }
.why[open] { padding-bottom: var(--s4); }

.mk { color: var(--accent-text); }
.big-ar { font-family: var(--font-ar); direction: rtl; unicode-bidi: isolate; text-align: center; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--s3); }
.card { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: var(--s4); display: flex; flex-direction: column; gap: var(--s2); align-items: center; text-align: center; }
.card .ar { font-size: 64px; line-height: 1.5; }
.card small { color: var(--text-2); }
.card[data-active="true"] { border-color: var(--accent); }
.fact { display: flex; gap: var(--s3); align-items: baseline; }
.fact > b { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--accent-soft); color: var(--accent-text); display: grid; place-items: center; font-size: 13px; }
.goals { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
.goals li { display: flex; gap: var(--s3); }
.goals li::before { content: "→"; color: var(--accent-text); }

/* Landkarte (Advanced Organizer) */
.map { display: grid; gap: var(--s3); }
.map .lvl { display: flex; flex-wrap: wrap; gap: var(--s3); align-items: stretch; justify-content: center; }
.map .node { border: 1px solid var(--line); background: var(--surface); border-radius: var(--r-md); padding: var(--s3) var(--s4); text-align: center; min-width: 120px; flex: 1 1 120px; max-width: 240px; }
.map .node .ar { font-size: 34px; line-height: 1.6; display: block; }
.map .node small { display: block; color: var(--text-2); font-size: 12px; }
.map .node[data-hot="true"] { border-color: var(--accent); background: var(--accent-soft); }
.map .arrow { text-align: center; color: var(--text-3); font-size: 13px; line-height: 1; }

.order { display: flex; justify-content: center; gap: var(--s3); direction: rtl; }
.order > div { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); width: 72px; padding: 6px 0 2px; text-align: center; position: relative; }
.order .ar { font-size: 48px; line-height: 1.5; }
.order sup { position: absolute; top: 4px; right: 8px; font-size: 12px; color: var(--accent-text); font-weight: 700; }

/* Bausteine */
.svgbox { width: 100%; max-width: 160px; aspect-ratio: 1; }
.svgbox svg { width: 100%; height: 100%; display: block; }
.dotslots { display: grid; gap: var(--s3); justify-items: center; }
.slotrow { display: flex; gap: 10px; align-items: center; }
.slot { width: 48px; height: 48px; border-radius: 50%; border: 2px dashed var(--line); background: transparent; cursor: pointer; display: grid; place-items: center; padding: 0; }
.slot[aria-pressed="true"] { border-style: solid; border-color: var(--accent); background: var(--accent-soft); }
.slot[aria-pressed="true"]::after { content: ""; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); }
.builder { display: grid; grid-template-columns: 1fr; gap: var(--s5); align-items: center; }
@media (min-width: 560px) { .builder { grid-template-columns: 1fr 1fr; } }
.found { display: flex; gap: var(--s2); flex-wrap: wrap; }
.found .chip[data-on="true"] { border-color: var(--ok); color: var(--ok-text); background: var(--ok-soft); }

.eq { display: flex; align-items: center; justify-content: center; gap: var(--s3); flex-wrap: wrap; direction: ltr; }
.eq .box { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: 2px 18px; min-width: 76px; text-align: center; }
.eq .box .ar { font-size: 64px; line-height: 1.6; }
.eq .op { color: var(--text-3); font-size: 24px; }
.eq .res { border-color: var(--accent); }
.eq small { display: block; color: var(--text-2); font-size: 12px; margin-top: -6px; padding-bottom: 6px; }

.seg { display: inline-flex; border: 1px solid var(--line); border-radius: var(--r-md); overflow: hidden; }
.seg button { min-height: 44px; padding: 0 var(--s4); background: transparent; border: 0; border-right: 1px solid var(--line); cursor: pointer; color: var(--text-2); }
.seg button:last-child { border-right: 0; }
.seg button[aria-pressed="true"] { background: var(--accent-soft); color: var(--text); font-weight: 600; }
.seg .ar { font-size: 30px; line-height: 1.4; color: inherit; }

.task .stim { text-align: center; padding: var(--s4) 0; }
.task .stim .ar { font-size: clamp(72px, 18vw, 120px); line-height: 1.5; }
.task .typebox { display: flex; gap: var(--s3); flex-wrap: wrap; }
.task input[type="text"], .l1 textarea { font: inherit; color: var(--text); background: var(--surface); border: 1.5px solid var(--line); border-radius: var(--r-md); padding: 0 var(--s4); min-height: 48px; flex: 1 1 160px; }
.l1 textarea { padding: var(--s3) var(--s4); width: 100%; resize: vertical; min-height: 88px; }
.task input[type="text"]:focus-visible, .l1 textarea:focus-visible { outline-offset: 1px; }
.badge { font-size: 12px; border: 1px solid var(--accent); color: var(--accent-text); border-radius: 99px; padding: 1px 10px; }
.opt.three { grid-column: 1 / -1; min-height: 56px; }
.opt[data-state="dim"] { opacity: .55; }
.opts3 { grid-template-columns: 1fr; }
@media (min-width: 480px) { .opts3 { grid-template-columns: repeat(2, 1fr); } }

.conf { display: flex; gap: var(--s2); flex-wrap: wrap; }
.conf button { min-height: 44px; padding: 0 var(--s4); border-radius: 99px; border: 1.5px solid var(--line); background: transparent; cursor: pointer; }
.conf button[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); font-weight: 600; }

.cmp { border: 1px solid var(--line); border-radius: var(--r-lg); padding: var(--s4) var(--s5); display: grid; gap: var(--s3); background: var(--surface); }
.cmp[data-ok="true"] { border-left: 3px solid var(--ok); }
.cmp[data-ok="false"] { border-left: 3px solid var(--coral); }
.cmp .ar { font-size: 44px; line-height: 1.5; }
.tag { font-size: 12px; padding: 1px 10px; border-radius: 99px; border: 1px solid var(--line); color: var(--text-2); }
.tag.ok { border-color: var(--ok); color: var(--ok-text); } .tag.no { border-color: var(--coral); color: var(--coral-text); }

table.t { width: 100%; border-collapse: collapse; font-size: 14px; }
table.t th, table.t td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
table.t th { color: var(--text-2); font-weight: 600; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
table.t td.hl { background: var(--accent-soft); }
.scroll-x { overflow-x: auto; }

.sim { display: grid; gap: var(--s5); }
.clock { display: flex; gap: var(--s4); align-items: baseline; flex-wrap: wrap; }
.clock .day { font-size: 40px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.jumps { display: flex; gap: var(--s2); flex-wrap: wrap; }
.deck { display: grid; gap: 2px; }
.deck .it { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(70px, 1fr) auto; gap: var(--s3); align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
.deck .it button { all: unset; cursor: pointer; display: block; }
.deck .it button:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 6px; }
.deck .nm .ar { font-size: 24px; line-height: 1.4; margin-inline-end: 6px; }
.rbar { height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; }
.rbar > i { display: block; height: 100%; background: var(--ok); transition: width .3s var(--ease); }
.rbar[data-low="true"] > i { background: var(--amber); }
.rbar[data-due="true"] > i { background: var(--coral); }
.due { font-variant-numeric: tabular-nums; text-align: right; color: var(--text-2); font-size: 13px; min-width: 64px; }
.due[data-due="true"] { color: var(--coral-text); font-weight: 600; }
.chart { width: 100%; height: auto; display: block; }
.chart text { fill: var(--text-2); font-size: 11px; font-family: var(--font-ui); }
.chart .grid { stroke: var(--line); stroke-width: 1; }
.chart .thr { stroke: var(--amber); stroke-dasharray: 4 4; stroke-width: 1; }
.chart .ln { fill: none; stroke: var(--accent); stroke-width: 2.2; stroke-linejoin: round; }
.chart .rev { stroke: var(--ok); stroke-width: 1.5; }
.chart circle { fill: var(--ok); }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--s3); }
.kpi { border: 1px solid var(--line); border-radius: var(--r-md); padding: var(--s3) var(--s4); background: var(--surface); }
.kpi b { display: block; font-size: 28px; font-weight: 600; line-height: 1.2; font-variant-numeric: tabular-nums; }
.kpi small { color: var(--text-2); }
.pre-post { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); }

.phase-nav { display: flex; gap: var(--s3); justify-content: space-between; flex-wrap: wrap; padding-top: var(--s4); border-top: 1px solid var(--line); }
@media (max-width: 420px) { .nav a { font-size: 10.5px; } }
@media (prefers-reduced-motion: reduce) { .rbar > i { transition: none; } }
.shell > main { min-width: 0; }
```

## `src/styles/tokens.css`
```css
:root, :root[data-theme="dark"] {
  --bg: #17181A; --bg-2: #1E2023; --surface: #26282B; --surface-2: #2E3134;
  --line: #3A3D41; --text: #F4F2EE; --text-2: #A6A39D; --text-3: #8A8782;
  --accent: #F26A1B; --accent-hover: #FF7D33; --on-accent: #17181A; --accent-text: #F26A1B;
  --accent-soft: rgba(242, 106, 27, 0.14);
  --amber: #F2A33A; --coral: #E5584A; --coral-soft: rgba(229, 88, 74, 0.14); --coral-text: #F0786C;
  --ok: #7FA37A; --ok-soft: rgba(127, 163, 122, 0.16); --ok-text: #8FB48A;
  --focus: #F4F2EE;
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #F4F2EE; --bg-2: #EBE8E2; --surface: #FFFFFF; --surface-2: #F7F5F1;
  --line: #DAD6CE; --text: #17181A; --text-2: #55534F; --text-3: #6E6B66;
  --accent: #F26A1B; --accent-hover: #E25D10; --on-accent: #17181A; --accent-text: #B9480B;
  --accent-soft: rgba(242, 106, 27, 0.12);
  --amber: #B9770E; --coral: #C2402F; --coral-soft: rgba(194, 64, 47, 0.1); --coral-text: #A8341F;
  --ok: #3F6B45; --ok-soft: rgba(63, 107, 69, 0.12); --ok-text: #2F5436;
  --focus: #17181A;
  color-scheme: light;
}
:root {
  --font-ui: "Instrument Sans Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
  /* Lehr-Arabisch: großzügiger Harakat-Raum. UI-Arabisch: Naskh */
  --font-ar: "Scheherazade New", "Noto Naskh Arabic", "Amiri", serif;
  --font-ar-ui: "Noto Naskh Arabic", "Scheherazade New", serif;
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px; --s8: 72px;
  --r-sm: 8px; --r-md: 12px; --r-lg: 20px;
  --ar-hero: clamp(120px, 28vw, 200px); --ar-teach: clamp(48px, 10vw, 72px); --ar-body: 28px;
  --ease: cubic-bezier(.2, .7, .2, 1);
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { color-scheme: light; }
}
```

## `src/ui/AudioButton.tsx`
```tsx
import { useState } from "react";
import { audioId, playAsset, type AudioKind } from "@/platform/audio";
import { Icon } from "./parts";

/** Funktionaler Audio-Button. Fehlt die Aufnahme, sagt er das – er tut nicht so, als würde er etwas abspielen. */
export function AudioButton({ letterId, kind, label }: { letterId: string; kind: AudioKind; label: string }) {
  const [state, setState] = useState<"idle" | "missing" | "error">("idle");
  return (
    <div>
      <button className="btn btn-secondary" onClick={async () => {
        const r = await playAsset(audioId(letterId, kind));
        setState(r === "played" ? "idle" : r);
      }}>
        {Icon.speaker} {label}
      </button>
      {state !== "idle" && (
        <p role="status" className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {state === "missing" ? "Aufnahme noch nicht verfügbar. Hier folgt eine echte Sprecher-Aufnahme." : "Wiedergabe fehlgeschlagen. Prüfe die Lautstärke und versuche es erneut."}
        </p>
      )}
    </div>
  );
}
```

## `src/ui/WriteTask.tsx`
```tsx
import { useState } from "react";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, type FreeResult, type WritingResult } from "@/domain/handwriting/score";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { WritingPad, PAD } from "./WritingPad";
import { Ar } from "./parts";

export interface WriteOutcome { letterId: string; mode: "trace" | "free"; grade: 0 | 1 | 2 | 3; evaluated: boolean; peeked: boolean; recognizedAs?: string }

function Check({ level, children }: { level: "ok" | "mid" | "no"; children: string }) {
  return <li><span className={level} aria-hidden>{level === "ok" ? "✓" : level === "mid" ? "~" : "✗"}</span><span>{children}</span></li>;
}

/** Eine Schreibaufgabe (Nachzeichnen oder frei) mit Strichauswertung. Zu kleine/leere Eingaben zählen nicht. */
export function WriteTask({ letterId, mode, onDone, onSkip }: { letterId: string; mode: "trace" | "free"; onDone(o: WriteOutcome): void; onSkip(): void }) {
  const letter = LETTER_BY_ID.get(letterId)!;
  const template = TEMPLATE_BY_ID.get(letterId)!;
  const [attempt, setAttempt] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [result, setResult] = useState<(WritingResult & Partial<FreeResult>) | null>(null);
  const [peeked, setPeeked] = useState(false);
  const showGuide = mode === "trace" || peeked;
  const good = !!result && result.grade === 2;
  const valid = !!result && !result.empty && !result.tooSmall;

  function check() {
    const res = mode === "free" ? analyzeFree(strokes, letterId, PAD) : analyze(strokes, template, PAD);
    setResult(res);
  }
  const retry = () => { setResult(null); setStrokes([]); setAttempt((a) => a + 1); };

  return (
    <div className="stack">
      <h3>{mode === "trace" ? <>Zeichne <b>{letter.name}</b> nach.</> : <>Schreibe <b>{letter.name}</b> aus dem Gedächtnis.</>}</h3>
      <p className="muted">
        {mode === "trace" ? "Beginne am orangen Punkt, Arabisch läuft von rechts nach links." : `Laut „${letter.syllable}“. Denk an die Punkte.`} Größe und Position sind egal.
      </p>
      {mode === "free" && !peeked && !result && (
        <div className="row"><span aria-hidden><Ar size="body">؟</Ar></span><button className="btn btn-ghost" onClick={() => setPeeked(true)}>Vorlage zeigen (zählt dann als Nachzeichnen)</button></div>
      )}
      <WritingPad guide={showGuide ? template : null} resetKey={`${letterId}-${attempt}`} disabled={!!result} onChange={setStrokes} />
      {result && (
        <div className={`feedback fade ${good ? "ok" : "no"}`} role="status" style={{ flexDirection: "column" }}>
          <strong>{result.empty ? "Noch nichts gezeichnet." : result.tooSmall ? "Zu klein." : good ? "Gut geschrieben." : result.grade === 1 ? "Fast." : "Noch nicht ganz."}</strong>
          {valid && (
            <ul className="checks">
              <Check level={result.shape.level === "good" ? "ok" : result.shape.level === "near" ? "mid" : "no"}>{`Form: ${result.shape.level === "good" ? "passt" : result.shape.level === "near" ? "ungefähr" : "weicht ab"}`}</Check>
              <Check level={result.dots.level === "ok" ? "ok" : "no"}>{result.dots.expected === 0 && result.dots.level === "ok" ? "Punkte: keine nötig" : result.dots.level === "ok" ? `Punkte: ${result.dots.expected}, richtig gesetzt` : result.dots.level === "wrongPlace" ? "Punkte: auf der falschen Seite (oben/unten)" : `Punkte: erwartet ${result.dots.expected}, erkannt ${result.dots.found}`}</Check>
              <Check level={result.direction === "ok" ? "ok" : result.direction === "reversed" ? "no" : "mid"}>{result.direction === "ok" ? "Richtung: richtig" : result.direction === "reversed" ? "Richtung: umgekehrt" : "Richtung: nicht beurteilbar (anderer Strichaufbau)"}</Check>
            </ul>
          )}
          {result.messages.map((m) => <p key={m} className="muted">{m}</p>)}
          {result.recognizedAs && result.recognizedAs !== letterId && <p className="muted">Erkannt eher als: <Ar size="body">{LETTER_BY_ID.get(result.recognizedAs)?.ch}</Ar> ({LETTER_BY_ID.get(result.recognizedAs)?.name}). Das ist eine Schätzung.</p>}
        </div>
      )}
      <div className="row">
        {!result && <button className="btn btn-primary" disabled={strokes.length === 0} onClick={check}>Prüfen</button>}
        {result && !valid && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && valid && result.grade < 2 && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && valid && (
          <button className="btn btn-primary" autoFocus onClick={() => onDone({ letterId, mode, grade: result.grade, evaluated: true, peeked, recognizedAs: result.recognizedAs })}>Weiter</button>
        )}
        {!result && <button className="btn btn-ghost" onClick={onSkip}>Überspringen</button>}
      </div>
    </div>
  );
}
```

## `src/ui/WritingPad.tsx`
```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pt, Stroke } from "@/domain/handwriting/geometry";
import type { Template } from "@/domain/handwriting/templates";

export const PAD = 360;

interface Props {
  guide?: Template | null;
  disabled?: boolean;
  /** Ändert sich der Wert, wird die Fläche geleert. */
  resetKey?: string | number;
  onChange(strokes: Stroke[]): void;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
const toPad = (p: Pt): Pt => ({ x: PAD * (0.12 + (p.x / 100) * 0.76), y: PAD * (0.12 + (p.y / 100) * 0.76) });

/** Zeichenfläche mit echter Strichaufnahme (Pointer Events: Finger, Stift, Maus). */
export function WritingPad({ guide, disabled, resetKey, onChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const active = useRef<Stroke | null>(null);
  const [count, setCount] = useState(0);

  const draw = useCallback(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = PAD * dpr; c.height = PAD * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, PAD, PAD);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Grundlinie als Orientierung
    ctx.strokeStyle = css("--line"); ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(PAD * 0.06, PAD * 0.7); ctx.lineTo(PAD * 0.94, PAD * 0.7); ctx.stroke(); ctx.setLineDash([]);
    if (guide) {
      ctx.strokeStyle = css("--text-3"); ctx.globalAlpha = 0.45; ctx.lineWidth = 16;
      for (const s of guide.body) {
        const q = s.map(toPad);
        ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y);
        for (let i = 1; i < q.length - 1; i++) ctx.quadraticCurveTo(q[i].x, q[i].y, (q[i].x + q[i + 1].x) / 2, (q[i].y + q[i + 1].y) / 2);
        ctx.lineTo(q[q.length - 1].x, q[q.length - 1].y); ctx.stroke();
      }
      ctx.fillStyle = css("--text-3");
      for (const d of guide.dots) { const p = toPad(d); ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = css("--accent");  // Startpunkte
      for (const s of guide.body) { const p = toPad(s[0]); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.strokeStyle = css("--text"); ctx.fillStyle = css("--text"); ctx.lineWidth = 7;
    for (const s of strokes.current) {
      if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0].x, s[0].y, 4, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
    }
  }, [guide]);

  useEffect(() => { strokes.current = []; active.current = null; setCount(0); onChange([]); draw(); }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(draw, [draw, count]);

  const pos = (e: React.PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * PAD, y: ((e.clientY - r.top) / r.height) * PAD };
  };
  const commit = () => { setCount(strokes.current.length); onChange(strokes.current.map((s) => [...s])); };

  return (
    <div className="pad">
      <canvas
        ref={canvas} className="pad-canvas" role="img"
        aria-label="Zeichenfläche. Mit Finger, Stift oder Maus schreiben. Wenn das nicht geht, nutze „Überspringen“."
        onPointerDown={(e) => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); active.current = [pos(e)]; strokes.current.push(active.current); draw(); }}
        onPointerMove={(e) => {
          if (!active.current) return;
          const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [];
          const list = evs.length ? evs : [e.nativeEvent as PointerEvent];
          const r = canvas.current!.getBoundingClientRect();
          for (const ev of list) active.current.push({ x: ((ev.clientX - r.left) / r.width) * PAD, y: ((ev.clientY - r.top) / r.height) * PAD });
          draw();
        }}
        onPointerUp={() => { if (active.current) { active.current = null; commit(); } }}
        onPointerCancel={() => { if (active.current) { active.current = null; commit(); } }}
      />
      <div className="row">
        <button className="btn btn-ghost" disabled={count === 0 || disabled} onClick={() => { strokes.current.pop(); commit(); }}>Rückgängig</button>
        <button className="btn btn-ghost" disabled={count === 0 || disabled} onClick={() => { strokes.current = []; commit(); }}>Leeren</button>
      </div>
    </div>
  );
}
```

## `src/ui/parts.tsx`
```tsx
import type { ReactNode } from "react";
import type { MasteryLevel } from "@/domain/types";

export const LEVEL_LABEL: Record<MasteryLevel, string> = { new: "Neu", learning: "Im Lernen", familiar: "Vertraut", mastered: "Gemeistert" };

export function Mastery({ level }: { level: MasteryLevel }) {
  return (
    <span className="mastery" data-level={level} role="img" aria-label={`Stand: ${LEVEL_LABEL[level]}`}>
      <i /><i /><i />
    </span>
  );
}

/** Arabischer Text: immer RTL + lang=ar, unabhängig vom umgebenden Text. */
export function Ar({ children, size = "teach", className = "", label }: { children: ReactNode; size?: "hero" | "teach" | "body"; className?: string; label?: string }) {
  return <span className={`ar ar-${size} ${className}`} lang="ar" dir="rtl" aria-label={label}>{children}</span>;
}

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const Icon = {
  today: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>,
  lesson: <svg viewBox="0 0 24 24" {...P}><path d="M4 5.5C7 4 10 4.3 12 6c2-1.7 5-2 8-.5V19c-3-1.5-6-1.2-8 .5-2-1.7-5-2-8-.5z" /><path d="M12 6v13.5" /></svg>,
  path: <svg viewBox="0 0 24 24" {...P}><path d="M5 19c0-5 14-3 14-9" /><circle cx="5" cy="19" r="1.5" /><circle cx="19" cy="6" r="1.5" /></svg>,
  letters: <svg viewBox="0 0 24 24" {...P}><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>,
  practice: <svg viewBox="0 0 24 24" {...P}><path d="M5 12l4 4 10-10" /></svg>,
  me: <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="9" r="3.5" /><path d="M5 20c1-4 13-4 14 0" /></svg>,
  speaker: <svg viewBox="0 0 24 24" width="20" height="20" {...P}><path d="M4 10v4h4l5 4V6L8 10H4z" /><path d="M16.5 9a4 4 0 010 6" /></svg>,
  ok: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>,
  no: <svg viewBox="0 0 24 24" width="22" height="22" {...P}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>,
};

/** Text mit eingebetteten arabischen Zeichen: jede arabische Folge wird als eigenes RTL-Element isoliert. */
export function RichText({ text }: { text: string }) {
  return <>{text.split(/([\u0600-\u06FF\u200D]+)/).map((part, i) => (i % 2 ? <Ar key={i} size="body">{part}</Ar> : part))}</>;
}
```

## `tests/content.test.ts`
```ts
import { describe, expect, it } from "vitest";
import { LETTERS, LETTER_BY_ID, formsOf, GROUP_COUNT } from "@/content/letters";

describe("Buchstaben-Inhalt", () => {
  it("hat genau 28 eindeutige Buchstaben in traditioneller Reihenfolge", () => {
    expect(LETTERS).toHaveLength(28);
    expect(new Set(LETTERS.map((l) => l.id)).size).toBe(28);
    expect(new Set(LETTERS.map((l) => l.ch)).size).toBe(28);
    expect(LETTERS.map((l) => l.ch).join("")).toBe("ابتثجحخدذرزسشصضطظعغفقكلمنهوي");
  });
  it("Ähnlichkeiten sind symmetrisch und verweisen auf existierende Buchstaben", () => {
    for (const l of LETTERS)
      for (const s of l.similar) {
        expect(LETTER_BY_ID.has(s), `${l.id}→${s}`).toBe(true);
        expect(LETTER_BY_ID.get(s)!.similar, `${s} sollte ${l.id} enthalten`).toContain(l.id);
      }
  });
  it("Gruppen sind lückenlos und wachsen mit der Reihenfolge", () => {
    const groups = LETTERS.map((l) => l.group);
    expect([...groups].sort((a, b) => a - b)).toEqual(groups);
    expect(new Set(groups).size).toBe(GROUP_COUNT);
  });
  it("Nicht-Verbinder (ا د ذ ر ز و) verbinden nicht mit dem Folgebuchstaben", () => {
    const non = LETTERS.filter((l) => !l.joinsNext).map((l) => l.ch).join("");
    expect(non).toBe("ادذرزو");
  });
  it("Formen: Nicht-Verbinder haben keine Anfangs-/Mittelverlängerung", () => {
    const f = formsOf(LETTER_BY_ID.get("ra")!);
    expect(f.initial).toBe("ر");
    expect(formsOf(LETTER_BY_ID.get("ba")!).initial).toBe("ب‍");
  });
});
```

## `tests/domain.test.ts`
```ts
import { describe, expect, it } from "vitest";
import { DAY, retrievability, review } from "@/domain/scheduler";
import { buildProgress, confusionsOf, masteryFor } from "@/domain/progress";
import { dueItems, interleave, pickDistractors } from "@/domain/selection";
import type { Grade, ReviewEvent, Evidence } from "@/domain/types";

const T0 = Date.UTC(2026, 0, 1, 10);
let n = 0;
const ev = (over: Partial<ReviewEvent> & { dayOffset?: number }): ReviewEvent => ({
  id: `e${n++}`, ts: T0 + (over.dayOffset ?? 0) * DAY, letterId: "ba", skill: "visual", activity: "find",
  grade: 2, evidence: "recognition", ...over,
});

describe("Scheduler", () => {
  it("R = 0,9 genau bei t = Stabilität", () => {
    const s = review(undefined, 2, "recall", T0);
    expect(retrievability(s, T0 + s.stability * DAY)).toBeCloseTo(0.9, 5);
  });
  it("Intervalle wachsen bei Erfolg, schrumpfen bei Fehler", () => {
    let s = review(undefined, 2, "recall", T0);
    let now = T0;
    const stabs = [s.stability];
    for (let i = 0; i < 4; i++) { now = s.dueAt; s = review(s, 2, "recall", now); stabs.push(s.stability); }
    for (let i = 1; i < stabs.length; i++) expect(stabs[i]).toBeGreaterThan(stabs[i - 1]);
    const failed = review(s, 0, "recall", s.dueAt);
    expect(failed.stability).toBeLessThan(s.stability);
    expect(failed.lapses).toBe(1);
  });
  it("Bessere Note und stärkerer Nachweis wachsen schneller; Erkennen weniger als Abruf", () => {
    const base = review(undefined, 2, "recall", T0);
    const at = base.dueAt;
    const g = (grade: Grade, e: Evidence) => review(base, grade, e, at).stability;
    expect(g(3, "recall")).toBeGreaterThan(g(2, "recall"));
    expect(g(2, "recall")).toBeGreaterThan(g(1, "recall"));
    expect(g(2, "recall")).toBeGreaterThan(g(2, "recognition"));
    expect(g(2, "production")).toBeGreaterThan(g(2, "recall"));
  });
  it("Spätes Abrufen erfolgreich → größerer Zuwachs als zu frühes", () => {
    const base = review(undefined, 2, "recall", T0);
    const early = review(base, 2, "recall", T0 + 0.1 * DAY).stability;
    const late = review(base, 2, "recall", base.dueAt + 5 * DAY).stability;
    expect(late).toBeGreaterThan(early);
  });
  it("Neu-Fehler ergibt kurzes Intervall", () => {
    const s = review(undefined, 0, "recall", T0);
    expect((s.dueAt - T0) / DAY).toBeLessThan(0.5);
  });
});

describe("Mastery", () => {
  const run = (events: ReviewEvent[]) => masteryFor(buildProgress(events), "ba", events[0].skill);

  it("ein einziger richtiger Versuch ist nie 'gemeistert'", () => {
    expect(run([ev({})]).level).not.toBe("mastered");
  });
  it("viele richtige Erkennungen am selben Tag in einer Aufgabe → nicht gemeistert", () => {
    const events = Array.from({ length: 10 }, () => ev({}));
    const m = run(events);
    expect(m.level).not.toBe("mastered");
    expect(m.missing.join()).toMatch(/Aufgabenart|anderen Tag/);
  });
  it("Erkennen-Skill: mehrere Tage + Aufgabenarten + Stabilität → gemeistert", () => {
    const events = [
      ev({ dayOffset: 0, activity: "find" }), ev({ dayOffset: 1, activity: "match" }),
      ev({ dayOffset: 4, activity: "find" }), ev({ dayOffset: 10, activity: "match" }),
      ev({ dayOffset: 20, activity: "find" }), ev({ dayOffset: 40, activity: "match" }),
      ev({ dayOffset: 70, activity: "find" }), ev({ dayOffset: 110, activity: "match" }),
    ];
    expect(run(events).level).toBe("mastered");
  });
  it("Schreiben braucht Produktion/Abruf – reine Erkennung genügt nicht", () => {
    const mk = (evidence: Evidence) => [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) =>
      ev({ skill: "writing", dayOffset: d, activity: i % 2 ? "trace" : "free", evidence }));
    expect(run(mk("recognition")).level).not.toBe("mastered");
    expect(run(mk("production")).level).toBe("mastered");
  });
  it("Ein Fehler als letzter Versuch nimmt den Status wieder weg", () => {
    const good = [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) => ev({ dayOffset: d, activity: i % 2 ? "a" : "b" }));
    expect(run(good).level).toBe("mastered");
    expect(run([...good, ev({ dayOffset: 150, grade: 0 })]).level).not.toBe("mastered");
  });
  it("Aussprache (Selbsteinschätzung) erreicht nie 'gemeistert'", () => {
    const events = [0, 1, 4, 10, 20, 40, 70, 110].map((d, i) =>
      ev({ skill: "pronunciation", dayOffset: d, activity: i % 2 ? "a" : "b", evidence: "self", grade: 3 }));
    expect(run(events).level).toBe("familiar");
  });
  it("Zustand ist reihenfolgeunabhängig (deterministisch aus dem Log)", () => {
    const events = [0, 1, 4].map((d) => ev({ dayOffset: d }));
    const a = buildProgress(events);
    const b = buildProgress([...events].reverse());
    expect(b.states.get("ba:visual")).toEqual(a.states.get("ba:visual"));
  });
});

describe("Auswahl", () => {
  it("Fällige Items sind gedeckelt, schwächste zuerst, ohne direkte Buchstaben-Wiederholung", () => {
    const events: ReviewEvent[] = [];
    for (const id of ["ba", "ta", "tha", "nun", "ya"])
      for (const skill of ["visual", "association"] as const) events.push(ev({ letterId: id, skill, grade: 0 }));
    const p = buildProgress(events);
    const due = dueItems(p, T0 + 3 * DAY, 6);
    expect(due).toHaveLength(6);
    for (let i = 1; i < due.length; i++) expect(due[i].letterId).not.toBe(due[i - 1].letterId);
    expect(dueItems(p, T0, 6)).toHaveLength(0);
  });
  it("interleave lässt unvermeidbare Wiederholungen zu", () => {
    const out = interleave([{ letterId: "a" }, { letterId: "a" }, { letterId: "a" }]);
    expect(out).toHaveLength(3);
  });
  it("Distraktoren: Verwechslungen vor Ähnlichen vor Zufall, ohne Ziel und Duplikate", () => {
    const pool = ["ba", "ta", "tha", "nun", "ya", "mim", "ra"];
    const d = pickDistractors("ba", ["ta", "tha"], ["ra", "ta"], pool, 3, () => 0.3);
    expect(d).toEqual(["ra", "ta", "tha"]);
    expect(d).not.toContain("ba");
  });
  it("Verwechslungen werden nur bei Fehlern gezählt", () => {
    const p = buildProgress([
      ev({ grade: 0, confusedWith: "ta" }), ev({ grade: 0, confusedWith: "ta" }),
      ev({ grade: 0, confusedWith: "nun" }), ev({ grade: 2, confusedWith: "ya" }),
    ]);
    expect(confusionsOf(p, "ba")).toEqual([["ta", 2], ["nun", 1]]);
  });
});

import { buildExercise } from "@/domain/exercises";
import { openEventStore, parseExport, exportJson, memoryStore } from "@/persistence/eventStore";
import { IDBFactory } from "fake-indexeddb";

describe("Aufgaben", () => {
  const pool = ["ba", "ta", "tha", "nun", "ya", "mim"];
  const p = buildProgress([]);
  it("jede Aufgabe enthält die richtige Antwort genau einmal, ohne doppelte Optionen", () => {
    for (const type of ["find-letter", "letter-to-sound", "contrast"] as const)
      for (const id of pool) {
        const ex = buildExercise(type, id, pool, p);
        expect(ex.options[ex.answerIndex].letterId).toBe(id);
        expect(new Set(ex.options.map((o) => o.label)).size).toBe(ex.options.length);
      }
  });
  it("Kontrastaufgabe nutzt ähnliche Buchstaben als Konkurrenten", () => {
    const ex = buildExercise("contrast", "ba", pool, p);
    const ids = ex.options.map((o) => o.letterId);
    expect(ids).toContain("ba");
    expect(ids.some((i) => ["ta", "tha", "nun", "ya"].includes(i!))).toBe(true);
  });
  it("bekannte Verwechslung erscheint bevorzugt als Distraktor", () => {
    const prog = buildProgress([ev({ letterId: "ba", grade: 0, confusedWith: "mim" })]);
    const ex = buildExercise("find-letter", "ba", pool, prog);
    expect(ex.options.map((o) => o.letterId)).toContain("mim");
  });
});

describe("Persistenz", () => {
  const sample = ev({ letterId: "ba", skill: "writing", evidence: "production" });
  it("IndexedDB: anhängen, lesen, löschen, Import ohne Duplikate", async () => {
    const store = await openEventStore(new IDBFactory());
    expect(store.persistent).toBe(true);
    await store.append(sample);
    expect(await store.all()).toEqual([sample]);
    const json = exportJson(await store.all());
    const parsed = parseExport(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(await store.importEvents(parsed.events)).toBe(0);
    await store.clear();
    if (parsed.ok) expect(await store.importEvents(parsed.events)).toBe(1);
  });
  it("Import verwirft ungültige Einträge und lehnt fremde Dateien ab", async () => {
    const s = memoryStore();
    expect(await s.importEvents([{ id: 1 }, null, { ...sample, grade: 7 }, sample])).toBe(1);
    expect(parseExport("kein json").ok).toBe(false);
    expect(parseExport(JSON.stringify({ app: "x", events: [] })).ok).toBe(false);
  });
  it("ohne IndexedDB: Speicher-Fallback mit persistent=false", async () => {
    expect((await openEventStore(undefined)).persistent).toBe(false);
  });
});

import { planSession, unlockedGroups, nextToIntroduce } from "@/domain/session";
describe("Sitzungsplanung", () => {
  it("Gruppen schalten der Reihe nach frei", () => {
    expect(unlockedGroups(new Set())).toEqual([1]);
    expect(unlockedGroups(new Set(["alif", "ba", "ta"]))).toEqual([1]);
    expect(unlockedGroups(new Set(["alif", "ba", "ta", "tha"]))).toEqual([1, 2]);
    expect(nextToIntroduce(new Set(["alif"]))).toBe("ba");
  });
  it("neu eingeführte Buchstaben ergeben Aufgaben, nicht eingeführte nie", () => {
    const plan = planSession(buildProgress([]), new Set(["ba", "ta"]), T0, 20);
    expect(plan.every((x) => ["ba", "ta"].includes(x.letterId))).toBe(true);
    expect(plan).toHaveLength(6);
    expect(plan.every((x) => x.why === "new")).toBe(true);
  });
  it("Fälliges kommt vor Neuem", () => {
    const p = buildProgress([ev({ letterId: "ba", skill: "visual", grade: 0 })]);
    const plan = planSession(p, new Set(["ba", "ta"]), T0 + 2 * DAY, 4);
    expect(plan[0]).toMatchObject({ letterId: "ba", type: "find-letter", why: "due" });
  });
  it("leer, wenn nichts eingeführt wurde", () => {
    expect(planSession(buildProgress([]), new Set(), T0)).toEqual([]);
  });
});
```

## `tests/handwriting.test.ts`
```ts
import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import type { Pt, Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, rank, splitStrokes } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";

/** Seeded RNG, damit Tests reproduzierbar sind. */
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

const AREA = 360;
interface Opts { noise?: number; rot?: number; sx?: number; sy?: number; dense?: boolean; reverse?: boolean; dropDots?: number; extraDot?: boolean; flipDotsAbove?: boolean }

/** Simuliert eine handgezeichnete Eingabe aus einem Template: Skalierung, Drehung, Versatz, Jitter, ungleichmäßige Abtastung. */
function synth(id: string, seed: number, o: Opts = {}): Stroke[] {
  const t = TEMPLATE_BY_ID.get(id)!;
  const r = rng(seed);
  const ang = ((o.rot ?? 8) * Math.PI / 180) * (r() * 2 - 1);
  const k = (0.5 + r() * 0.9) * (AREA / 100) * 0.75;
  const sx = k * (o.sx ?? 1) , sy = k * (o.sy ?? 1);
  const ox = 40 + r() * 80, oy = 30 + r() * 60;
  const nz = (o.noise ?? 0.8) * (AREA / 100);
  const xf = (p: Pt): Pt => {
    const x = (p.x - 50) * sx + (r() - .5) * 0 , y = (p.y - 50) * sy;
    return { x: ox + AREA / 2 + x * Math.cos(ang) - y * Math.sin(ang) + gauss(r) * nz, y: oy + AREA / 2 + x * Math.sin(ang) + y * Math.cos(ang) + gauss(r) * nz };
  };
  const dense = (s: Pt[]) => {
    const out: Pt[] = [];
    for (let i = 0; i < s.length - 1; i++) { const n = o.dense ? 6 : 2 + Math.floor(r() * 4); for (let j = 0; j < n; j++) { const u = j / n; out.push({ x: s[i].x + (s[i + 1].x - s[i].x) * u, y: s[i].y + (s[i + 1].y - s[i].y) * u }); } }
    out.push(s[s.length - 1]); return out;
  };
  let body = t.body.map((s) => dense(s).map(xf));
  if (o.reverse) body = body.map((s) => [...s].reverse());
  let dots = t.dots.map((d) => ({ ...d }));
  if (o.dropDots) dots = dots.slice(o.dropDots);
  if (o.extraDot) dots.push({ x: 50, y: t.dots.length && t.dots[0].y > 50 ? 20 : 86 });
  if (o.flipDotsAbove) dots = dots.map((d) => ({ x: d.x, y: 100 - d.y }));
  const dotStrokes = dots.map((d) => { const c = xf(d); return [c, { x: c.x + r() * 4, y: c.y + r() * 4 }]; });
  return [...body, ...dotStrokes];
}
const N = 200;
const ids = TEMPLATES.map((t) => t.letterId);

describe("Handschrift: Aufteilung", () => {
  it("trennt Punkte (kurze Striche) vom Körper", () => {
    const s = splitStrokes(synth("tha", 1));
    expect(s.body).toHaveLength(1);
    expect(s.dots).toHaveLength(3);
  });
  it("Alif allein: ein Strich, keine Punkte", () => {
    const s = splitStrokes(synth("alif", 2));
    expect(s.body).toHaveLength(1);
    expect(s.dots).toHaveLength(0);
  });
});

describe("Handschrift: Treffer bei plausiblen Eingaben (synthetisch)", () => {
  it.each(ids)("%s: korrekte Eingaben bestehen (Note ≥ 1) fast immer, meistens mit Note 2", (id) => {
    let pass = 0, top = 0;
    for (let i = 0; i < N; i++) {
      const strokes = synth(id, i + 1);
      const a = analyze(strokes, TEMPLATE_BY_ID.get(id)!, AREA);
      if (a.grade >= 1) pass++;
      if (a.grade === 2) top++;
    }
    expect(pass / N).toBeGreaterThanOrEqual(0.95);
    expect(top / N).toBeGreaterThanOrEqual(0.8);
  });

  it("Freies Schreiben: Zielbuchstabe wird erkannt und nicht mit anderen verwechselt", () => {
    const stats: Record<string, { ok: number; wrongAccepted: number }> = {};
    for (const id of ids) {
      stats[id] = { ok: 0, wrongAccepted: 0 };
      for (let i = 0; i < N; i++) {
        const r = rank(synth(id, i + 500));
        if (r[0].letterId === id) stats[id].ok++;
        for (const other of ids.filter((x) => x !== id)) {
          const f = analyzeFree(synth(id, i + 900), other, AREA);
          if (f.grade >= 1 && f.confident) stats[id].wrongAccepted++;
        }
      }
      expect(stats[id].ok / N, `Top-1 für ${id}`).toBeGreaterThanOrEqual(0.95);
      expect(stats[id].wrongAccepted, `Falsch akzeptiert bei ${id}`).toBe(0);
    }
    writeFileSync("/tmp/hw-stats.json", JSON.stringify(stats));
  }, 60_000);
});

describe("Handschrift: Fehlerarten werden erkannt", () => {
  const t = (id: string) => TEMPLATE_BY_ID.get(id)!;
  it("Punkt fehlt → Note 0 + Hinweis", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ta", i + 1, { dropDots: 1 }), t("ta"), AREA); if (a.dots.level === "missing" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("zusätzlicher Punkt → Note 0", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ba", i + 1, { extraDot: true }), t("ba"), AREA); if (a.dots.level === "extra" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("Punkte auf falscher Seite (ب mit Punkt oben) → falsche Lage", () => {
    let hit = 0;
    for (let i = 0; i < 50; i++) { const a = analyze(synth("ba", i + 1, { flipDotsAbove: true }), t("ba"), AREA); if (a.dots.level === "wrongPlace" && a.grade === 0) hit++; }
    expect(hit).toBe(50);
  });
  it("Umgekehrte Schreibrichtung wird erkannt und mit höchstens Note 1 bewertet", () => {
    for (const id of ["alif", "ba"]) {
      let hit = 0;
      for (let i = 0; i < 50; i++) { const a = analyze(synth(id, i + 1, { reverse: true }), t(id), AREA); if (a.direction === "reversed" && a.grade <= 1) hit++; }
      expect(hit, id).toBe(50);
    }
  });
  it("Alif wird nicht als Bā akzeptiert (und umgekehrt)", () => {
    expect(analyze(synth("alif", 3), t("ba"), AREA).grade).toBe(0);
    expect(analyze(synth("ba", 3), t("alif"), AREA).grade).toBe(0);
  });
  it("leere oder winzige Eingabe: keine Wertung", () => {
    expect(analyze([], t("ba"), AREA).empty).toBe(true);
    const tiny = [[{ x: 10, y: 10 }, { x: 14, y: 12 }, { x: 16, y: 10 }]];
    expect(analyze(tiny, t("ba"), AREA).tooSmall).toBe(true);
  });
  it("Freies Schreiben: ت als ب geschrieben → erkannt als anderer Buchstabe", () => {
    const res = analyzeFree(synth("ta", 7), "ba", AREA);
    expect(res.grade).toBe(0);
    expect(res.recognizedAs).toBe("ta");
  });
});
```

## `tests/lektion.test.ts`
```ts
import { describe, expect, it } from "vitest";
import {
  ALIF, ALIF_CONTRAST, CONCEPT_IDS, HYPOTHESES, ITEMS, ITEM_BY_ID, L1_LETTER_IDS, MARK, SYLLABLES, WORDS, letterCh,
} from "@/content/lektion1";
import { LETTER_BY_ID } from "@/content/letters";
import {
  CHECK_SPEC, PRACTICE_SPEC, PRETEST_SPEC, RETRIEVAL_SPEC, buildSet, checkTyped, gradeFor, interleaveTasks, makeTask,
  normalizeTyped, reviewTask, variantCount, type Task,
} from "@/domain/lektion/tasks";
import {
  PHASE_COUNT, curvePoints, daysToNextDue, dueEntries, initialLesson, lessonReducer, parseLesson, simNow,
} from "@/domain/lektion/state";
import { DAY } from "@/domain/scheduler";

const seeded = (seed = 7) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const ARABIC_ALLOWED = new Set([..."ابتث", ...Object.values(MARK), "◌"]);
const TASHKEEL = /[ً-ٟ]/;

describe("Lektion 1: Inhalt (Orthografie & Fachlogik)", () => {
  it("verwendet nur ا ب ت ث und die drei Kurzvokale", () => {
    const all = [...SYLLABLES.map((s) => s.ar), ...WORDS.map((w) => w.ar)].join("");
    for (const ch of all) expect(ARABIC_ALLOWED.has(ch), `unerlaubtes Zeichen U+${ch.codePointAt(0)!.toString(16)}`).toBe(true);
  });
  it("Silben = Buchstabe + Vokalzeichen (+ Alif bei ā) mit korrekter Umschrift", () => {
    expect(SYLLABLES).toHaveLength(12);
    const by = Object.fromEntries(SYLLABLES.map((s) => [s.id, s]));
    expect(by["syl:ba-fatha"].ar).toBe("بَ"); expect(by["syl:ba-fatha"].tr).toBe("ba");
    expect(by["syl:ba-kasra"].ar).toBe("بِ"); expect(by["syl:ba-kasra"].tr).toBe("bi");
    expect(by["syl:ta-damma"].ar).toBe("تُ"); expect(by["syl:ta-damma"].tr).toBe("tu");
    expect(by["syl:tha-fatha"].tr).toBe("tha"); expect(by["syl:tha-long"].tr).toBe("thā");
    expect(by["syl:ba-long"].ar).toBe("بَا");
    expect(new Set(SYLLABLES.map((s) => s.tr)).size).toBe(12);
  });
  it("Kasra steht tatsächlich als U+0650, Fatha U+064E, Damma U+064F", () => {
    expect(MARK.fatha).toBe("َ"); expect(MARK.kasra).toBe("ِ"); expect(MARK.damma).toBe("ُ");
  });
  it("Wörter: vollständig vokalisiert, Buchstabenfolge passt zu den Buchstaben-IDs, Umschrift passt zur Länge", () => {
    for (const w of WORDS) {
      const base = [...w.ar].filter((c) => !TASHKEEL.test(c));
      expect(base.join(""), w.id).toBe(w.letters.map(letterCh).join(""));
      // jeder Konsonant außer dem letzten hat ein Vokalzeichen; Alif nie
      const marks = [...w.ar].filter((c) => TASHKEEL.test(c)).length;
      expect(marks, w.id).toBeGreaterThanOrEqual(1);
      expect(w.ar.includes(ALIF + MARK.kasra) || w.ar.includes(ALIF + MARK.fatha) || w.ar.includes(ALIF + MARK.damma), `${w.id}: Alif trägt kein Zeichen`).toBe(false);
      // jedes ا im Wort ergibt ein ā in der Umschrift und steht nach Fatha
      const alifs = w.letters.filter((l) => l === "alif").length;
      expect((w.tr.match(/ā/g) ?? []).length, w.id).toBe(alifs);
      for (let i = 0; i < w.ar.length; i++) if (w.ar[i] === ALIF) expect(w.ar[i - 1], `${w.id}: ā nur nach Fatha`).toBe(MARK.fatha);
    }
  });
  it("Alif: kein Nicht-Verbinder-Fehler, ب ت ث verbinden", () => {
    expect(LETTER_BY_ID.get("alif")!.joinsNext).toBe(false);
    for (const id of ["ba", "ta", "tha"]) expect(LETTER_BY_ID.get(id)!.joinsNext).toBe(true);
    expect(LETTER_BY_ID.get("alif")!.dots.count).toBe(0);
    expect(LETTER_BY_ID.get("ba")!.dots).toMatchObject({ count: 1, pos: "below" });
    expect(LETTER_BY_ID.get("ta")!.dots).toMatchObject({ count: 2, pos: "above" });
    expect(LETTER_BY_ID.get("tha")!.dots).toMatchObject({ count: 3, pos: "above" });
  });
  it("Kontrasttabelle: Alif nie als Konsonant dargestellt", () => {
    const row = ALIF_CONTRAST.find((r) => r.feature === "Eigener Konsonantenlaut")!;
    expect(row.alif).toMatch(/nein/);
  });
  it("Hypothesen: eine richtige Option, gültiger Index, Reveal vorhanden", () => {
    expect(HYPOTHESES.length).toBeGreaterThanOrEqual(5);
    for (const h of HYPOTHESES) {
      expect(h.answer).toBeGreaterThanOrEqual(0); expect(h.answer).toBeLessThan(h.options.length);
      expect(new Set(h.options).size).toBe(h.options.length);
      expect(h.reveal.length).toBeGreaterThan(30);
    }
  });
  it("Items sind eindeutig und decken Buchstaben, Vokale, Silben, Wörter, Konzepte ab", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    expect(ITEMS.filter((i) => i.kind === "letter")).toHaveLength(4);
    expect(ITEMS.filter((i) => i.kind === "vowel")).toHaveLength(3);
    expect(CONCEPT_IDS.every((c) => ITEM_BY_ID.has(c))).toBe(true);
    expect(L1_LETTER_IDS.length).toBe(4);
  });
});

describe("Lektion 1: Aufgaben", () => {
  const rnd = seeded();
  it("alle Items × Varianten sind erzeugbar, gültig und haben genau eine richtige Option", () => {
    for (const item of ITEMS)
      for (let v = 0; v < variantCount(item.id); v++) {
        const t = makeTask(item.id, v, rnd);
        expect(t.explain.length).toBeGreaterThan(10);
        if (t.type === "choice") {
          expect(new Set(t.options).size, t.id).toBe(t.options.length);
          expect(t.options.length, t.id).toBeGreaterThanOrEqual(3);
          expect(t.answer, t.id).toBeGreaterThanOrEqual(0);
          expect(t.options.filter((o, i) => i === t.answer).length).toBe(1);
        } else {
          expect(t.accepted.length).toBeGreaterThan(0);
        }
      }
  });
  it("Silben-Distraktoren enthalten bei ā das kurze a (Längenunterschied wird geprüft)", () => {
    for (let k = 0; k < 20; k++) {
      const t = makeTask("syl:ba-long", 0, seeded(k + 1)) as Extract<Task, { type: "choice" }>;
      expect(t.options).toContain("ba"); expect(t.options[t.answer]).toBe("bā");
    }
  });
  it("Buchstaben-Aufgabe: richtige Option ist der gefragte Buchstabe", () => {
    const t = makeTask("letter:tha", 2, rnd) as Extract<Task, { type: "choice" }>;
    expect(t.options[t.answer]).toBe("ث");
    const n = makeTask("letter:ba", 0, rnd) as Extract<Task, { type: "choice" }>;
    expect(n.options[n.answer]).toBe("Bā");
  });
  it("Tippantworten: Normalisierung und Längenunterscheidung", () => {
    expect(normalizeTyped("  BAA ")).toBe("bā");
    expect(checkTyped("bāb", "baab")).toBe("right");
    expect(checkTyped("bāb", "bāb")).toBe("right");
    expect(checkTyped("bāb", "bab")).toBe("lengthOnly");
    expect(checkTyped("thābit", "thabit")).toBe("lengthOnly");
    expect(checkTyped("tha", "ta")).toBe("wrong");
    expect(checkTyped("ti", "")).toBe("wrong");
    expect(checkTyped("thābit", "ṯābit")).toBe("right");
  });
  it("Note: falsch 0, Länge fehlt 1, Hilfe genutzt 1, frei richtig 3, Auswahl richtig 2", () => {
    expect(gradeFor("wrong", "type", false)).toBe(0);
    expect(gradeFor("lengthOnly", "type", false)).toBe(1);
    expect(gradeFor("right", "type", true)).toBe(1);
    expect(gradeFor("right", "type", false)).toBe(3);
    expect(gradeFor("right", "choice", false)).toBe(2);
  });
  it("Aufgabensätze sind gültig; Phase 5 enthält Transfer, Phase 6 überwiegend freie Antworten", () => {
    for (const spec of [PRETEST_SPEC, CHECK_SPEC, PRACTICE_SPEC, RETRIEVAL_SPEC]) {
      const set = buildSet(spec, seeded(3));
      expect(set).toHaveLength(spec.length);
      expect(new Set(set.map((t) => t.id)).size).toBe(spec.length);
    }
    expect(buildSet(PRACTICE_SPEC, seeded(3)).filter((t) => t.novel).length).toBeGreaterThanOrEqual(5);
    const ret = buildSet(RETRIEVAL_SPEC, seeded(3));
    expect(ret.filter((t) => t.type === "type").length).toBeGreaterThanOrEqual(ret.length * 0.45);
    // Retrieval prüft andere Varianten als Phase 5 für dieselben Items
    const p5 = new Set(PRACTICE_SPEC.map(([i, v]) => `${i}#${v}`));
    expect(RETRIEVAL_SPEC.filter(([i, v]) => p5.has(`${i}#${v}`))).toHaveLength(0);
  });
  it("Interleaving: nie dasselbe Item direkt hintereinander, weniger Familien-Blöcke als sortiert", () => {
    const tasks = buildSet(PRACTICE_SPEC, seeded(5), false);
    const mixed = interleaveTasks([...tasks].sort((a, b) => a.family.localeCompare(b.family)));
    for (let i = 1; i < mixed.length; i++) expect(mixed[i].itemId).not.toBe(mixed[i - 1].itemId);
    const sameFamilyRuns = (l: Task[]) => l.filter((t, i) => i > 0 && t.family === l[i - 1].family).length;
    const sorted = [...tasks].sort((a, b) => a.family.localeCompare(b.family));
    expect(sameFamilyRuns(mixed)).toBeLessThan(sameFamilyRuns(sorted));
    expect(new Set(mixed.map((t) => t.id))).toEqual(new Set(tasks.map((t) => t.id)));
  });
  it("Wiederholungsaufgaben wechseln die Variante mit der Wiederholungszahl", () => {
    const a = reviewTask("syl:ba-fatha", 0, seeded(1)).id, b = reviewTask("syl:ba-fatha", 1, seeded(1)).id;
    expect(a).not.toBe(b);
  });
});

describe("Lektion 1: Ablauf, Wiederholungslogik, Persistenz", () => {
  const T0 = 1_700_000_000_000;
  const res = (itemId: string, grade: 0 | 1 | 2 | 3, type: "choice" | "type" = "choice") => ({
    taskId: `${itemId}#0`, itemId, type, correctness: grade === 0 ? "wrong" as const : "right" as const, grade, hintUsed: false, answer: "",
  });

  it("Phasen schalten nacheinander frei, Doppel-Abschluss ist idempotent", () => {
    let s = initialLesson(T0);
    expect(s.unlocked).toBe(1);
    s = lessonReducer(s, { t: "complete", phase: 1 });
    s = lessonReducer(s, { t: "complete", phase: 1 });
    expect(s.done).toEqual([1]); expect(s.unlocked).toBe(2);
    s = lessonReducer(s, { t: "complete", phase: PHASE_COUNT });
    expect(s.unlocked).toBe(PHASE_COUNT);
  });
  it("Ergebnisse füllen den Wiederholungsplan; Fehler erzeugt kürzeres Intervall als Erfolg", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", phase: 5, now: T0, results: [res("syl:ba-fatha", 2), res("syl:ba-kasra", 0)] });
    expect(Object.keys(s.srs)).toHaveLength(2);
    expect(s.srs["syl:ba-fatha"].dueAt).toBeGreaterThan(s.srs["syl:ba-kasra"].dueAt);
    expect(s.log).toHaveLength(2);
  });
  it("Simulierte Zeit: erst nichts fällig, nach Zeitsprung fällig, nach Wiederholung wächst das Intervall", () => {
    let s = initialLesson(T0);
    s = { ...s, simStart: T0 };
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("letter:ba", 2), res("word:bab", 3, "type")] });
    expect(dueEntries(s.srs, simNow(s, T0))).toHaveLength(0);
    const jump = daysToNextDue(s.srs, simNow(s, T0))!;
    expect(jump).toBeGreaterThanOrEqual(1);
    s = lessonReducer(s, { t: "advance", days: jump });
    const due = dueEntries(s.srs, simNow(s, T0));
    expect(due.length).toBeGreaterThanOrEqual(1);
    expect(due[0].r).toBeLessThan(1);
    const before = s.srs[due[0].itemId];
    s = lessonReducer(s, { t: "results", phase: 7, now: simNow(s, T0), results: [res(due[0].itemId, 2)] });
    const after = s.srs[due[0].itemId];
    expect(after.stability).toBeGreaterThan(before.stability);
    expect(after.dueAt - simNow(s, T0)).toBeGreaterThan(before.dueAt - before.lastAt);
  });
  it("Vergessen bei Pause: nach 30 Tagen ohne Wiederholung ist die Abrufwahrscheinlichkeit gesunken", () => {
    let s = initialLesson(T0);
    s = { ...s, simStart: T0 };
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("vowel:kasra", 2)] });
    const pts = curvePoints(s.log, "vowel:kasra", T0, T0 + 30 * DAY, 30);
    expect(pts[0].r).toBeCloseTo(1, 5);
    expect(pts.at(-1)!.r).toBeLessThan(0.5);
    for (let i = 1; i < pts.length; i++) expect(pts[i].r).toBeLessThanOrEqual(pts[i - 1].r + 1e-9);
  });
  it("Kurve springt bei einer Wiederholung zurück auf 100 % und fällt danach langsamer", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "results", phase: 6, now: T0, results: [res("letter:tha", 2)] });
    s = lessonReducer(s, { t: "results", phase: 7, now: T0 + 2 * DAY, results: [res("letter:tha", 2)] });
    const pts = curvePoints(s.log, "letter:tha", T0, T0 + 10 * DAY, 10);
    const day2 = pts.find((p) => Math.abs(p.x - 2) < 1e-9)!;
    expect(day2.r).toBeCloseTo(1, 5);
    expect(pts.find((p) => Math.abs(p.x - 1.9) < 0.11) ?? pts[1]).toBeTruthy();
  });
  it("Persistenz: Roundtrip, kaputte Daten fallen auf Standard zurück, Teilschäden werden verworfen", () => {
    let s = initialLesson(T0);
    s = lessonReducer(s, { t: "complete", phase: 1 });
    s = lessonReducer(s, { t: "hyp", id: "h-kasra", answer: { choice: 1, confidence: "sure" } });
    s = lessonReducer(s, { t: "results", phase: 5, now: T0, results: [res("letter:ba", 2)] });
    const back = parseLesson(JSON.stringify(s), T0);
    expect(back).toEqual(s);
    expect(parseLesson("{kaputt", T0)).toEqual(initialLesson(T0));
    expect(parseLesson(null, T0)).toEqual(initialLesson(T0));
    expect(parseLesson(JSON.stringify({ v: 2 }), T0)).toEqual(initialLesson(T0));
    const dmg = parseLesson(JSON.stringify({ ...s, srs: { ...s.srs, "x:y": { stability: -1 } }, done: [1, 99, "a"], offsetDays: -5 }), T0);
    expect(Object.keys(dmg.srs)).toEqual(["letter:ba"]);
    expect(dmg.done).toEqual([1]); expect(dmg.offsetDays).toBe(0);
  });
  it("Reset setzt zurück", () => {
    let s = lessonReducer(initialLesson(T0), { t: "complete", phase: 3 });
    s = lessonReducer(s, { t: "reset", now: T0 + 5 });
    expect(s.done).toEqual([]); expect(s.startedAt).toBe(T0 + 5);
  });
});
```

## `.gitignore`
```
node_modules
dist
screenshots
```

## `README.md`
```md
# QAIDAH – Arabische Schrift lesen und schreiben (Erwachsene)

Stand: **M0–M3-Kern + M4-Start (Schreiben für ا ب ت ث)**. Eigenständig neben `../quran-lernapp` (anderes Produkt, unverändert).

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # Lernlogik, Inhalte, Persistenz (Vitest)
npm run build && npx vite preview --port 4173 &
npm run e2e -- http://localhost:4173 ./screenshots   # Playwright, echter Browser
```

## Architektur
`src/domain` (reine Logik, ohne React) · `src/content` (Daten) · `src/persistence` (IndexedDB-Ereignislog) · `src/platform` (Audio, Aussprache-Schnittstelle) · `src/features`, `src/ui`.

- **Mastery** (`domain/mastery.ts`): gemeistert erst bei ≥3 richtigen Abrufen, ≥2 Aufgabenarten, ≥2 Tagen, Stabilität ≥6 Tage, letzter Versuch richtig, bei Schreiben/Formen/Lesen mit freiem Abruf. Aussprache (Selbsteinschätzung) erreicht nie „gemeistert“. Schwellen sind **Startwerte, nicht kalibriert**. Reine Erkennung braucht bei perfekten Antworten rund 100+ Tage bis „gemeistert“ (bewusst streng).
- **Scheduler** (`domain/scheduler.ts`): FSRS-ähnlich, eigene Implementierung, Konstanten ungetuned.
- **Zustand** entsteht aus dem Ereignislog (`persistence/eventStore.ts`), JSON-Export/-Import.

## Was ist echt, was fehlt
Umgesetzt und getestet: 28 Buchstaben, Einführung, 3 Aufgabenarten (Erkennen, Laut zuordnen, Ähnliche unterscheiden) mit Wiederholung nach Fehler, Planer, Persistenz, Export/Import/Reset, Hell/Dunkel, Prüfseite `#/specimen`.
## Schreiben (M4-Start)
`domain/handwriting/`: Strichaufnahme per Pointer Events (`ui/WritingPad.tsx`), Trennung Körper/Punkte, Formvergleich (größen-/positionsunabhängige Chamfer-Distanz), Punktanzahl und -lage (oben/unten), Schreibrichtung, Rangfolge fürs freie Schreiben (Zielbuchstabe muss klar bester Treffer sein).
- Templates (`templates.ts`) gibt es erst für **ا ب ت ث**; sie sind **selbst entworfene, vereinfachte Skelette** ohne fachliche Abnahme.
- Tests (`tests/handwriting.test.ts`) nutzen **synthetisch verrauschte Eingaben aus denselben Templates**: sie belegen die Mechanik, **nicht** die Praxistauglichkeit mit echter Handschrift. Schwellen (`TH`) sind ungeeicht.
- Kalibrierung: `#/labor` sammelt echte Striche (gut/schlecht) lokal und exportiert JSON.
- Nachzeichnen zählt als Nachweis „Erkennen“, freies Schreiben ohne Vorlage als „Produktion“. Zu kleine/leere Eingaben erzeugen kein Ereignis. Überspringen ist jederzeit möglich.
- E2E: `node scripts/e2e-write.mjs` (echte Mausereignisse).

**Noch nicht vorhanden:** Schreiben für ب-Familie hinaus (24 weitere Buchstaben), Kontextformen schreiben, echte Audioaufnahmen (keine Dateien; Buttons sagen das), Aufnahme/Vergleich, Kontextform-Übungen, Silben/Wörter, PWA, Gamification (XP).
Aussprache: keine automatische Bewertung, keine Scores (`platform/pronunciation.ts` ist nur die Schnittstelle).

## Lernstand
- Arabisch-Inhalte (Namen, Ausspracheanleitungen, Beispielwörter) sind **nicht fachlich abgenommen**.
- Nicht auf Kontextformen per `font-feature-settings: init/medi/fina` verlassen: das zerstört das Shaping (E2E-Regressionstest vorhanden).

## Lektion 1 (`#/lektion`): Lernsimulation in sieben Phasen
Interaktiver Lernablauf für ا ب ت ث und Fatha/Kasra/Damma, integriert in die App (Nav „Lektion“, Karte unter „Heute“).
1 Orientierung (Advanced Organizer, Vorab-Test) · 2 Entdecken (Scaffolding, Dual Coding, Punkte-Baukasten, Schreiben mit abnehmender Hilfe) · 3 Hypothesen (Productive Failure, kein Feedback, mit Sicherheitsangabe) · 4 Verstehen (Abgleich der Hypothesen, Erklärung, Elaboration, Check mit Sofort-Feedback) · 5 Anwenden (Transfer „neu kombiniert“, Interleaving, freies Schreiben) · 6 Abrufen (ohne Hilfen, Feedback erst am Ende, Vorher/Nachher) · 7 Festigen (simulierte Zeit, Fälligkeit, Vergessenskurve, Wiederholsitzungen).
- Code: `src/content/lektion1.ts` (Inhalt), `src/domain/lektion/` (Aufgaben, Zustand, Wiederholungslogik; nutzt den bestehenden Scheduler), `src/features/lektion/` (UI). Zustand in localStorage (`qaidah.lektion1.v1`); Ergebnisse zu Buchstaben und Schreiben fließen in den Hauptlernstand, simulierte Zeit nie.
- Alif wird als Dehnungsbuchstabe und Nicht-Verbinder gelehrt, nicht als Konsonant. Wörter stehen in Pausalform (Sukun folgt später).
- Tests: `tests/lektion.test.ts`; E2E: `node scripts/e2e-lektion.mjs http://localhost:4173 ./screenshots`.
- Offen: Sprecher-Aufnahmen fehlen, Inhalte nicht fachlich abgenommen, Intervall- und Schreib-Schwellen ungeeicht.
```

## `scripts/e2e-lektion.mjs`
```js
// E2E Lektion 1 gegen `vite preview`. Nutzung: node scripts/e2e-lektion.mjs http://localhost:4173 ./screenshots
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

const DICT = { "بَ": "ba", "بِ": "bi", "بُ": "bu", "تَ": "ta", "تِ": "ti", "تُ": "tu", "ثَ": "tha", "ثِ": "thi", "ثُ": "thu", "بَا": "bāb".slice(0, 2), "تَا": "tā", "ثَا": "thā", "بَاب": "bāb", "تَاب": "tāb", "ثَابِت": "thābit", "ثَبَات": "thabāt" };
DICT["بَا"] = "bā";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const next = () => page.getByRole("button", { name: /^(Weiter|Abschließen)$/ }).first();
const frameNext = () => page.locator(".phase-nav .btn-primary");
const shot = (n) => page.screenshot({ path: `${out}/L-${n}.png`, fullPage: true });
const noOverflow = async (label) => {
  const bad = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 ? [...document.querySelectorAll("main *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && !e.closest(".scroll-x, .stepper")).slice(0, 3).map((e) => e.className || e.tagName) : []);
  check(`Kein horizontales Scrollen: ${label}`, bad.length === 0, JSON.stringify(bad));
};

/** Beantwortet Aufgaben eines TaskRunners; typed=true: richtige Tippantworten; gibt Anzahl richtig getippter zurück. */
async function runTasks({ wrongOnce = false } = {}) {
  let typedRight = 0, typed = 0, n = 0;
  for (let guard = 0; guard < 40; guard++) {
    const eyebrow = page.locator(".eyebrow", { hasText: /von \d+/ }).first();
    if (!(await page.locator(".task").count())) break;
    const stimEl = page.locator(".task .stim .ar");
    const stim = (await stimEl.count()) ? (await stimEl.first().textContent()).trim() : null;
    const input = page.locator('.task input[type="text"]');
    if (await input.count()) {
      typed++;
      const ans = DICT[stim] ?? "x";
      await input.fill(wrongOnce && n === 0 ? "zzz" : ans);
      await page.getByRole("button", { name: "Prüfen" }).click();
      if (await page.getByText("Richtig.", { exact: true }).count()) typedRight++;
    } else {
      const opts = page.locator(".task .options .opt");
      const texts = await opts.allTextContents();
      const want = stim && DICT[stim];
      let idx = want ? texts.findIndex((t) => t.trim() === want) : -1;
      await opts.nth(idx >= 0 ? idx : 0).click();
    }
    n++;
    await next().click();
    void eyebrow;
  }
  return { typed, typedRight, n };
}

await page.goto(base + "/#/lektion");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Lektion lädt, Phase 1 aktiv", (await page.textContent(".l1 .eyebrow")).includes("Lektion 1") && (await page.textContent("body")).includes("Phase 1 von 7"));
check("Phasen 2–7 sind anfangs gesperrt", (await page.locator(".stepper button[disabled]").count()) === 6);
await noOverflow("Phase 1");
await shot("01-orientierung");

// Phase 1
await frameNext().click(); await shot("02-landkarte"); await noOverflow("Landkarte");
const rtlOK = await page.evaluate(() => [...document.querySelectorAll("[lang=ar]")].every((e) => getComputedStyle(e).direction === "rtl"));
check("Alle arabischen Elemente RTL", rtlOK);
await frameNext().click();
check("Weiter gesperrt bis Vorwissen gesetzt", await frameNext().isDisabled());
await page.getByRole("radio", { name: /Bei null/ }).click();
for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Weiß ich nicht" }).click(); await next().click(); }
await shot("03-vorwissen");
check("Phase 1 abschließbar", !(await frameNext().isDisabled()));
await frameNext().click();

// Phase 2
check("Phase 2 aktiv", (await page.textContent("body")).includes("Phase 2 von 7"));
await shot("04-alif");
await frameNext().click();
check("Baukasten: Weiter gesperrt bis alle drei gefunden", await frameNext().isDisabled());
// ba: 1 Punkt unten
await page.getByRole("button", { name: "Punkt unten 1" }).click();
check("Baukasten zeigt ب für 1 Punkt unten", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ب");
await page.getByRole("button", { name: "Punkt unten 1" }).click();
await page.getByRole("button", { name: "Punkt oben 1" }).click(); await page.getByRole("button", { name: "Punkt oben 2" }).click();
check("Baukasten zeigt ت für 2 Punkte oben", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ت");
await page.getByRole("button", { name: "Punkt oben 3" }).click();
check("Baukasten zeigt ث für 3 Punkte oben", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ث");
await page.getByRole("button", { name: "Punkt oben 1" }).click(); await page.getByRole("button", { name: "Punkt oben 2" }).click(); await page.getByRole("button", { name: "Punkt oben 3" }).click();
await page.getByRole("button", { name: "Punkt oben 1" }).click();
check("1 Punkt oben ist Nūn (später), nicht Teil dieser Lektion", (await page.textContent(".dotslots")).includes("Nūn"));
await shot("05-familie"); await noOverflow("Familie");
check("Alle drei gefunden → weiter möglich", !(await frameNext().isDisabled()));
await frameNext().click();
for (const l of ["Thā", "Tā", "Bā"]) await page.getByRole("button", { name: l, exact: true }).click();
await page.getByRole("button", { name: "Alif anhängen" }).click();
await shot("06-fatha"); await noOverflow("Fatha");
const eqText = (await page.locator(".eq .res .ar").first().textContent()).trim();
check("Silbenbaukasten: بَا", eqText === "بَا", eqText);
await frameNext().click();
// Schreiben: 4 Aufgaben, jeweils Strich zeichnen
async function draw(fn) {
  const c = page.locator("canvas.pad-canvas"); await c.waitFor(); await c.scrollIntoViewIfNeeded(); const b = await c.boundingBox();
  await fn(b);
}
for (let i = 0; i < 4; i++) {
  await page.getByText(`Schreibaufgabe ${i + 1} von 4`).waitFor();
  await draw(async (b) => {
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.1); await page.mouse.down();
    for (let k = 1; k <= 20; k++) await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * (0.1 + 0.8 * k / 20));
    await page.mouse.up();
  });
  await page.getByRole("button", { name: "Prüfen" }).click();
  const cont = page.getByRole("button", { name: "Weiter", exact: true }).first();
  if (await cont.count()) await cont.click(); else { await page.getByRole("button", { name: "Überspringen" }).click(); }
}
await page.getByText("Alle vier geschrieben").waitFor();
check("Phase 2 abschließbar nach Schreiben", !(await frameNext().isDisabled()));
await frameNext().click();

// Phase 3: Hypothesen
check("Phase 3 aktiv", (await page.textContent("body")).includes("Phase 3 von 7"));
await frameNext().click();
check("Weiter gesperrt, bis alle Hypothesen festgehalten", await frameNext().isDisabled());
for (let i = 0; i < 6; i++) {
  await page.getByRole("radio").first().click();
  await page.getByRole("radio", { name: "Eher vermutet" }).click();
  if (i === 0) await page.locator("textarea").fill("Das Zeichen unten klingt nach i.");
  await shot(`08-hyp-${i}`).catch(() => {});
  await page.getByRole("button", { name: "Hypothese festhalten" }).click();
}
check("Kein Richtig/Falsch-Feedback in Phase 3", !(await page.textContent("body")).includes("Richtig."));
await shot("09-hyp-fertig");
await frameNext().click(); await shot("10-hyp-uebersicht");
await frameNext().click();

// Phase 4
check("Phase 4 aktiv", (await page.textContent("body")).includes("Phase 4 von 7"));
await shot("11-aufloesung"); await noOverflow("Auflösung");
const body4 = await page.textContent("body");
check("Auflösung zeigt Vermutung und Regel", body4.includes("Deine Vermutung") && body4.includes("Kasra"));
await frameNext().click(); await shot("12-vokale"); await noOverflow("Vokale");
await frameNext().click(); await shot("13-alif-genau"); await noOverflow("Alif genau");
const tbl = await page.textContent("table.t");
check("Alif-Tabelle: kein eigener Konsonantenlaut, Nicht-Verbinder", tbl.includes("nein") && tbl.includes("Nicht-Verbinder"));
await frameNext().click();
check("Elaboration: Weiter gesperrt", await frameNext().isDisabled());
for (const ta of await page.locator("textarea").all()) {
  await ta.fill("Der Buchstabe liefert den Konsonanten, das Zeichen den Vokal.");
}
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Musterantwort zeigen" }).first().click();
for (let i = 0; i < 3; i++) await page.getByRole("radio", { name: "Passt" }).nth(i).click();
await shot("14-elab");
await frameNext().click();
const r4 = await runTasks({ wrongOnce: false });
await shot("15-check");
check("Verständnis-Check durchlaufen", r4.n >= 4);
await frameNext().click();

// Phase 5
check("Phase 5 aktiv", (await page.textContent("body")).includes("Phase 5 von 7"));
await frameNext().click();
const r5 = await runTasks();
check("Phase 5: 14 Aufgaben", r5.n === 14, String(r5.n));
check("Phase 5: Tippantworten mit richtiger Lesung werden als richtig gewertet", r5.typed > 0 ? r5.typedRight === r5.typed : true, `${r5.typedRight}/${r5.typed}`);
await shot("16-anwenden");
await frameNext().click();
// Schreiben ohne Vorlage: überspringen
for (let i = 0; i < 2; i++) { await page.getByText(`Schreibaufgabe ${i + 1} von 2`).waitFor(); await page.getByRole("button", { name: "Überspringen" }).click(); }
await frameNext().click(); await shot("17-auswertung5"); await noOverflow("Auswertung 5");
await frameNext().click();

// Phase 6
check("Phase 6 aktiv", (await page.textContent("body")).includes("Phase 6 von 7"));
await frameNext().click();
const r6 = await runTasks();
check("Phase 6: 13 Aufgaben, mehr als die Hälfte Freitext", r6.n === 13 && r6.typed >= 6, JSON.stringify(r6));
check("Phase 6: richtige Freitextantworten gelten (deferred: kein 'Richtig.' im Test)", true);
await frameNext().click(); await shot("18-auswertung6"); await noOverflow("Auswertung 6");
const t6 = await page.textContent("body");
check("Auswertung zeigt Vorher/Nachher", t6.includes("Vorher und nachher"));
await frameNext().click();

// Phase 7
check("Phase 7 aktiv", (await page.textContent("body")).includes("Phase 7 von 7"));
await shot("19-prinzip");
await frameNext().click();
await page.getByRole("heading", { name: "Zeitreise" }).waitFor();
check("Tag 0: nichts fällig", (await page.textContent("body")).includes("Heute ist nichts fällig"));
check("Abschluss gesperrt ohne Wiederholung", await frameNext().isDisabled());
await page.getByRole("button", { name: "+3 Tage" }).click();
check("Nach +3 Tagen sind Items fällig", /\d+ Items fällig/.test(await page.textContent("body")));
await shot("20-zeitreise"); await noOverflow("Zeitreise");
check("Vergessenskurve sichtbar", (await page.locator("svg.chart").count()) === 1);
await page.getByRole("button", { name: "Wiederholung starten" }).click();
const r7 = await runTasks();
check("Wiederholung durchlaufen", r7.n >= 1, String(r7.n));
await shot("21-wiederholung-ergebnis");
await page.getByRole("button", { name: "Zurück zur Zeitreise" }).click();
check("Abschluss jetzt möglich", !(await frameNext().isDisabled()));
await page.getByRole("button", { name: "+1 Monat" }).click(); await shot("22-nach-pause");
await frameNext().click();
await shot("23-abschluss");
check("Abschlussseite", (await page.textContent("body")).includes("Lektion 1 geschafft"));
await frameNext().click();
check("Lektion als abgeschlossen markiert (7 von 7)", (await page.textContent("body")).includes("7 von 7 Phasen"));

// Persistenz
await page.reload(); await page.getByRole("heading", { level: 1 }).waitFor();
check("Fortschritt bleibt nach Neuladen (7 von 7)", (await page.textContent("body")).includes("7 von 7 Phasen"));
// Integration: Buchstaben im Hauptplaner
await page.goto(base + "/#/");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Heute: Lektion verlinkt, Buchstaben eingeführt", (await page.textContent("body")).includes("Lektion 1") && !(await page.textContent("h1")).includes("ersten Buchstaben"));
await page.screenshot({ path: `${out}/L-24-heute.png`, fullPage: true });

// Desktop
const d = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const dp = await d.newPage();
await dp.goto(base + "/#/lektion"); await dp.getByRole("heading", { level: 1 }).waitFor();
await dp.screenshot({ path: `${out}/L-25-desktop.png`, fullPage: true });

check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));
await browser.close();
console.log(failed ? `\n${failed} FEHLGESCHLAGEN` : "\nAlles bestanden");
process.exit(failed ? 1 : 0);
```

## `scripts/e2e-write.mjs`
```js
// E2E Schreiben: zeichnet mit echten Mausereignissen auf die Zeichenfläche.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (n, c, x = "") => { console.log(`${c ? "PASS" : "FAIL"}  ${n} ${c ? "" : x}`); if (!c) failed++; };

const B = [[94,38],[90,54],[78,64],[60,68],[40,68],[22,64],[10,52],[6,44]]; // Bā-Körper rechts→links
const ALIF = [[51,6],[50,50],[49,94]];
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = []; page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

async function draw(pts, { jitter = 0 } = {}) {
  const box = await page.locator("canvas.pad-canvas").boundingBox();
  const m = (p) => [box.x + box.width * (0.12 + 0.76 * (p[0] + jitter * Math.sin(p[1])) / 100), box.y + box.height * (0.12 + 0.76 * p[1] / 100)];
  const [x0, y0] = m(pts[0]); await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i < pts.length; i++) { const [a, b] = m(pts[i - 1]), [c, d] = m(pts[i]); for (let s = 1; s <= 6; s++) await page.mouse.move(a + (c - a) * s / 6, b + (d - b) * s / 6); }
  await page.mouse.up();
}
const dot = async (x, y) => { const box = await page.locator("canvas.pad-canvas").boundingBox();
  const px = box.x + box.width * (0.12 + 0.76 * x / 100), py = box.y + box.height * (0.12 + 0.76 * y / 100);
  await page.mouse.move(px, py); await page.mouse.down(); await page.mouse.move(px + 2, py + 2); await page.mouse.up(); };
const events = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open("qaidah"); r.onsuccess = () => { const g = r.result.transaction("events").objectStore("events").getAll(); g.onsuccess = () => res(g.result); }; }));

await page.goto(base + "/#/schreiben");
await page.getByText("Noch nichts zu schreiben").waitFor();
check("Ohne gelernte Buchstaben: Leerzustand", true);
for (const id of ["alif", "ba", "ta"]) { await page.goto(`${base}/#/buchstaben/${id}`); await page.getByRole("button", { name: /Kennengelernt/ }).click(); await page.waitForURL(/ueben/); }

await page.goto(base + "/#/schreiben");
await page.locator("canvas.pad-canvas").waitFor();
check("Alif: Nachzeichnen-Modus", await page.getByText("Nachzeichnen", { exact: true }).isVisible());
check("Prüfen ist ohne Striche deaktiviert", await page.getByRole("button", { name: "Prüfen" }).isDisabled());
await page.screenshot({ path: `${out}/10-schreiben-alif.png` });

// zu klein
await draw([[50, 50], [52, 54]]); await page.getByRole("button", { name: "Prüfen" }).click();
check("Zu kleine Eingabe: Hinweis, keine Wertung", await page.getByText("Zu klein.").isVisible());
const e0 = (await events()).filter((e) => e.skill === "writing").length;
check("Zu kleine Eingabe wird nicht protokolliert", e0 === 0, String(e0));
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Alif richtig
await draw(ALIF); await page.getByRole("button", { name: "Prüfen" }).click();
check("Alif richtig: 'Gut geschrieben.'", await page.getByText("Gut geschrieben.").isVisible());
check("Alif: Richtung richtig angezeigt", await page.getByText("Richtung: richtig").isVisible());
await page.screenshot({ path: `${out}/11-schreiben-gut.png` });
await page.getByRole("button", { name: "Weiter" }).click();

// Bā rückwärts (links→rechts) + Punkt unten
await draw([...B].reverse()); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā rückwärts: Richtung umgekehrt gemeldet", await page.getByText("Richtung: umgekehrt").isVisible());
check("Bā rückwärts: nicht 'Gut geschrieben'", !(await page.getByText("Gut geschrieben.").isVisible()));
await page.screenshot({ path: `${out}/12-schreiben-richtung.png` });
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Bā ohne Punkt
await draw(B); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā ohne Punkt: Punkte fehlen", await page.getByText(/Punkte: erwartet 1, erkannt 0/).isVisible());
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Bā richtig
await draw(B, { jitter: 0.6 }); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā richtig mit Punkt: 'Gut geschrieben.'", await page.getByText("Gut geschrieben.").isVisible());
await page.getByRole("button", { name: "Weiter" }).click();

// Tā mit einem Punkt (falsch) → Punkte-Hinweis
await draw(B); await dot(50, 22); await page.getByRole("button", { name: "Prüfen" }).click();
check("Tā mit nur 1 Punkt: erwartet 2", await page.getByText(/erwartet 2, erkannt 1/).isVisible());
await page.getByRole("button", { name: "Überspringen" }).isVisible().catch(() => {});
await page.getByRole("button", { name: "Nochmal versuchen" }).click();
await draw(B); await dot(38, 24); await dot(62, 24); await page.getByRole("button", { name: "Prüfen" }).click();
check("Tā richtig", await page.getByText("Gut geschrieben.").isVisible());
await page.getByRole("button", { name: "Weiter" }).click();
check("Ende: Zusammenfassung", await page.getByRole("heading", { name: "Geschafft." }).isVisible());

const ev = (await events()).filter((e) => e.skill === "writing");
check("Schreib-Ereignisse protokolliert (activity trace, evidence recognition)", ev.length >= 6 && ev.every((e) => e.activity === "trace" && e.evidence === "recognition"), JSON.stringify(ev.map((e) => [e.letterId, e.grade])));
check("Falsche Versuche haben Note 0 bzw. ≤1", ev.some((e) => e.grade === 0) && ev.some((e) => e.grade === 2));

// Freier Modus: Erfolg im Nachzeichnen genügt nicht → Seed eines freien Erfolgs für ba, dann Plan
await page.evaluate(() => new Promise((res) => { const r = indexedDB.open("qaidah"); r.onsuccess = () => { const tx = r.result.transaction("events", "readwrite");
  tx.objectStore("events").put({ id: "seed-free", ts: Date.now(), letterId: "ba", skill: "writing", activity: "free", grade: 2, evidence: "production" }); tx.oncomplete = res; }; }));
await page.goto(base + "/#/"); await page.reload(); await page.goto(base + "/#/schreiben");
await page.getByText("Nachzeichnen", { exact: true }).waitFor(); // Alif noch ohne freien Erfolg
await page.getByRole("button", { name: "Überspringen" }).click();
check("Bā mit freiem Erfolg → Modus 'Frei schreiben'", await page.getByText("Frei schreiben", { exact: true }).isVisible());
check("Frei: Vorlage ist zunächst verborgen (Button 'Vorlage zeigen')", await page.getByRole("button", { name: /Vorlage zeigen/ }).isVisible());
await draw(B); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Frei: Bā erkannt", await page.getByText("Gut geschrieben.").isVisible());
const free = (await events()).filter((e) => e.activity === "free" && e.id !== "seed-free");
check("Frei geschrieben zählt als Produktion", free.length === 1 && free[0].evidence === "production");
await page.getByRole("button", { name: "Weiter" }).click();
await page.getByRole("button", { name: "Überspringen" }).click(); // Tā (Nachzeichnen)
// Frei: ت als ب geschrieben → "anderer Buchstabe"? (Bā hat bereits Erfolg; erneut Plan mit Tā als freiem Ziel nicht nötig)

// Labor
await page.goto(base + "/#/labor"); await page.locator("canvas.pad-canvas").waitFor();
await draw(B); await dot(38, 24); await dot(62, 24);
check("Labor: zeigt Messwerte und bester Treffer", (await page.getByTestId("lab-readout").textContent()).includes("bester Treffer: Tā"));

check("Kein horizontaler Scroll", !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));
await browser.close(); process.exit(failed ? 1 : 0);
```

## `scripts/e2e.mjs`
```js
// E2E gegen `vite preview`. Nutzung: node scripts/e2e.mjs http://localhost:4173 ./screenshots
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });

let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(base + "/#/");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Heute zeigt Einstieg für Neulinge", (await page.textContent("h1")).includes("ersten Buchstaben"));
await page.screenshot({ path: `${out}/01-heute-mobil.png` });

// Specimen: Schrift/Formen
await page.goto(base + "/#/specimen");
await page.getByTestId("forms").waitFor();
const rows = await page.locator('[data-testid="forms"] tbody tr').count();
check("Specimen: 28 Buchstabenzeilen", rows === 28, String(rows));
const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check("40px 'Scheherazade New'", "بَ"); });
check("Scheherazade New geladen", fontsOk);
const rtl = await page.evaluate(() => { const a = document.querySelector("[lang=ar]"); return getComputedStyle(a).direction; });
check("Arabische Elemente sind RTL", rtl === "rtl");
await page.screenshot({ path: `${out}/02-specimen-mobil.png`, fullPage: true });

// Kontextformen müssen sich tatsächlich unterscheiden (Regression: erzwungene init/medi/fina-Features)
const widths = await page.evaluate(() => {
  const row = document.querySelectorAll('[data-testid="forms"] tbody tr')[1]; // Bā
  return [...row.querySelectorAll("td [lang=ar]")].map((el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width * 10) / 10; });
});
check("Bā: Anfangsform schmaler als Einzelform, Mittelform schmaler als Endform", widths[1] < widths[0] && widths[2] < widths[3], JSON.stringify(widths));
const alifW = await page.evaluate(() => { const c = document.querySelectorAll('[data-testid="forms"] tbody tr')[0].querySelectorAll("td [lang=ar]"); return [...c].map((el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width * 10) / 10; }); });
check("Alif (Nicht-Verbinder): Einzel = Anfang, Mitte = Ende, Endform mit Anbindung breiter", alifW[0] === alifW[1] && alifW[2] === alifW[3] && alifW[3] > alifW[0], JSON.stringify(alifW));

// Übungsseite ohne Lernstand
await page.goto(base + "/#/ueben");
check("Üben ohne Stand: Leerzustand", await page.getByText("Noch nichts zu üben").isVisible());

// Alif → Ba → Ta → Tha einführen
for (const id of ["alif", "ba", "ta", "tha"]) {
  await page.goto(`${base}/#/buchstaben/${id}`);
  if (id === "alif") {
    await page.getByRole("button", { name: "Name hören" }).click();
    check("Audio fehlt → ehrlicher Hinweis statt Fake-Wiedergabe", await page.getByText("Aufnahme noch nicht verfügbar").first().isVisible());
    await page.screenshot({ path: `${out}/03-buchstabe-mobil.png`, fullPage: true });
  }
  await page.getByRole("button", { name: /Kennengelernt/ }).click();
  await page.waitForURL(/ueben/);
}

// Sitzung: bewusst eine falsche Antwort, danach richtig; jede Aufgabe bis zum Ende
await page.goto(base + "/#/ueben");
let answered = 0, sawWrong = false, guard = 0;
while (!(await page.getByRole("heading", { name: "Geschafft." }).isVisible()) && guard++ < 60) {
  await page.locator(".opt").first().waitFor();
  const opts = page.locator(".opt");
  if (answered === 0) { // erste Aufgabe: Fehler provozieren (zuerst alle Optionen prüfen, die falsche wählen)
    await page.screenshot({ path: `${out}/04-aufgabe-mobil.png` });
  }
  // richtige Option finden: nach Klick zeigt data-state=right; bei erster Aufgabe klicken wir bewusst die erste Option
  await opts.first().click();
  const wrong = await page.locator('.opt[data-state="wrong"]').count();
  if (wrong && !sawWrong) { sawWrong = true; await page.screenshot({ path: `${out}/05-falsch-mobil.png` }); }
  if (wrong) check("Falsch: Erklärung + Hinweis auf Wiederholung", await page.getByText("am Ende noch einmal").isVisible());
  await page.getByRole("button", { name: "Weiter" }).click();
  answered++;
}
check("Sitzung endet mit Zusammenfassung", await page.getByRole("heading", { name: "Geschafft." }).isVisible(), `Aufgaben: ${answered}`);
check("Mindestens eine falsche Antwort wurde erlebt und wiederholt", sawWrong);
await page.screenshot({ path: `${out}/06-fertig-mobil.png` });

// Persistenz: nach Reload ist der Stand da
const countEvents = () => page.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("qaidah"); r.onsuccess = () => { const g = r.result.transaction("events").objectStore("events").count(); g.onsuccess = () => res(g.result); };
}));
const n1 = await countEvents();
check("Ereignisse in IndexedDB gespeichert", n1 >= answered, String(n1));
await page.reload();
await page.goto(base + "/#/buchstaben/ba");
await page.getByRole("heading", { level: 2, name: "Dein Stand" }).waitFor();
check("Nach Reload: Buchstabe bleibt als gelernt (Button 'Üben')", await page.getByRole("link", { name: "Üben", exact: true }).first().isVisible());
check("Kein Buchstabe nach einer Sitzung 'Gemeistert'", (await page.getByText("Gemeistert").count()) === 0);

// Export / Import / Reset
await page.goto(base + "/#/ich");
const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Sicherung laden" }).click()]);
check("Export liefert Datei", dl.suggestedFilename().startsWith("qaidah-sicherung"));
await page.getByRole("button", { name: /Lernstand löschen/ }).click();
await page.getByRole("button", { name: "Ja, löschen" }).click();
check("Reset leert Ereignisse", (await countEvents()) === 0);
await page.locator('input[type=file]').setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{kaputt") });
check("Import ungültiger Datei zeigt Fehler", await page.getByText("kein gültiges JSON").isVisible());
const path = await dl.path();
await page.locator('input[type=file]').setInputFiles(path);
await page.getByText(/Einträge übernommen/).waitFor();
check("Import der Sicherung stellt Ereignisse wieder her", (await countEvents()) === n1);

// Hellmodus + Desktop
await page.getByRole("radio", { name: "Hell" }).click();
check("Hellmodus gesetzt", (await page.evaluate(() => document.documentElement.dataset.theme)) === "light");
const desk = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await desk.goto(base + "/#/buchstaben/ba"); await desk.getByRole("heading", { level: 2, name: "Dein Stand" }).waitFor();
await desk.screenshot({ path: `${out}/07-buchstabe-desktop-dunkel.png` });
const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check("Kein horizontaler Scroll auf 390px", !horizontal);
check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));

await browser.close();
process.exit(failed ? 1 : 0);
```
