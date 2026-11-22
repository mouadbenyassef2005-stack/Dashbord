import type { Competence } from "@/lektion/domain/lektion/competence";
import type { Spec } from "@/lektion/domain/lektion/tasks";
import { UNKNOWN_OPTION } from "./lektion1";

/**
 * Die vier Lerneinheiten von Lektion 1. Jede Einheit durchläuft die sieben Phasen in kompakter Form:
 * 1 Ziel und Einführung · 2 angeleitete Übung · 3 Vermuten und Regel finden · 4 Erklärung und Verständnis ·
 * 5 selbstständige Übung · 6 Überprüfung mit Entscheidung · 7 Wiederholungsplan.
 *
 * Progression (fachlich begründet in docs/AENDERUNGEN.md): erst Schriftbild (visuell), dann Laut mit einem Vokal (Fatha),
 * dann Vokalkontrast (Kasra, Damma), zuletzt Länge, Verbindung und Wörter. Neues steht erst, wenn seine Voraussetzungen geübt sind.
 */
export interface HypCard {
  id: string;
  title: string;
  question: string;
  /** Bekannte Informationen, aus denen sich die Antwort ableiten lässt */
  given?: string[];
  stimulus?: string;
  /** Aufnahmen, die zur Aufgabe gehören (nur gezeigt, wenn vorhanden) */
  audioIds?: string[];
  options: string[];
  optionsAr?: boolean;
  answer: number;
  /** Woraus die Antwort ableitbar war (Phase 4) */
  derivation: string;
  /** Warum die Antwort stimmt (Phase 4) */
  reveal: string;
  /** Typische Fehlannahme und wie sie entsteht (Phase 4) */
  misconception: string;
}

export type GuidedKind = "alif" | "family" | "hearFamily" | "writeFamily" | "fatha" | "hearSyllables" | "vowels" | "hearVowels" | "vowelDot" | "longAlif" | "join" | "words";
export type ExplainKind = "reveal" | "dots" | "alifVsFamily" | "fathaRole" | "vowels" | "join" | "words" | "pronunciation";
export interface ElabPrompt { id: string; question: string; model: string }
export interface Gate { label: string; competences: Competence[]; min: number }

export interface UnitConfig {
  id: 1 | 2 | 3 | 4;
  title: string;
  short: string;
  goal: string;
  minutes: number;
  /** Was neu ist */
  news: string[];
  /** Voraussetzung in einem Satz */
  needs: string;
  /** Aufwärmfragen zu Vorwissen (Phase 1), für Einheit 1 stattdessen der Vortest */
  warm: Spec[];
  guided: { kind: GuidedKind; label: string }[];
  hyps: HypCard[];
  explain: { kind: ExplainKind; label: string }[];
  elab: ElabPrompt[];
  check: Spec[];
  practice: Spec[];
  writes: { letterId: string; mode: "trace" | "free" }[];
  test: Spec[];
  gates: Gate[];
  /** Rücksprung bei Fehlern: Aufgaben-Kompetenz → Schritt der angeleiteten Übung (Index in `guided`) */
  jump: Partial<Record<Competence, number>>;
}

const unknown = UNKNOWN_OPTION;

export const UNITS: UnitConfig[] = [
  {
    id: 1, title: "Alif und die Familie Bā · Tā · Thā", short: "Buchstaben erkennen",
    goal: "Du erkennst ا ب ت ث wieder und unterscheidest ب, ت und ث allein an Zahl und Lage der Punkte.",
    minutes: 10,
    news: ["Alif: ein gerader Strich ohne Punkte", "ب ت ث: dieselbe Grundform, nur die Punkte unterscheiden", "Namen und Laute der vier Buchstaben"],
    needs: "Keine Vorkenntnisse nötig.",
    warm: [],
    guided: [{ kind: "alif", label: "Alif" }, { kind: "family", label: "Eine Familie" }, { kind: "hearFamily", label: "Hören und sprechen" }, { kind: "writeFamily", label: "Schreiben" }],
    hyps: [
      {
        id: "u1-h1", title: "Woran erkennst du den Buchstaben?",
        given: ["ب = Bā: 1 Punkt unter dem Bogen", "ت = Tā: 2 Punkte über dem Bogen", "ث = Thā: 3 Punkte über dem Bogen"], stimulus: "ب ت ث",
        question: "Die drei Buchstaben haben dieselbe Grundform. Woran erkennst du, welcher es ist?",
        options: ["An Anzahl und Lage der Punkte", "An der Größe des Bogens", "An der Dicke der Linie"], answer: 0,
        derivation: "Aus dem Baukasten in der angeleiteten Übung: Der Bogen blieb immer gleich, nur die Punkte änderten sich.",
        reveal: "Anzahl und Lage der Punkte entscheiden. Größe und Strichstärke sind bei handgeschriebenem und gedrucktem Arabisch variabel und tragen keine Bedeutung.",
        misconception: "Wer nur auf die Form achtet, hält die drei für denselben Buchstaben. Die Grundform ist hier tatsächlich identisch, und genau das macht die Punkte so wichtig.",
      },
      {
        id: "u1-h2", title: "Gleiche Zahl, anderer Ort",
        given: ["ت: 2 Punkte über dem Bogen"], stimulus: "ي",
        question: "Dieser Buchstabe hat denselben Bogen und ebenfalls 2 Punkte, aber UNTEN. Was sagt deine Regel?",
        options: ["Es ist ت, nur anders geschrieben", "Es ist ein anderer Buchstabe: Die Lage der Punkte zählt mit", unknown], answer: 1,
        derivation: "Deine Regel nennt Anzahl UND Lage. ت hat zwei Punkte oben, dieser Buchstabe zwei unten.",
        reveal: "Das ist ي (Yā), ein weiterer Buchstabe mit dieser Grundform, den du später lernst. Oben und unten ergeben verschiedene Buchstaben.",
        misconception: "Viele zählen nur die Punkte und vergessen, ob sie oben oder unten stehen.",
      },
      {
        id: "u1-h3", title: "Ein Punkt oben: bekannt?",
        given: ["Bekannt sind: ب (1 unten), ت (2 oben), ث (3 oben)"], stimulus: "ن",
        question: "Bogen mit 1 Punkt OBEN. Welche Aussage passt zu deiner Regel?",
        options: ["Es ist keiner der drei bekannten Buchstaben, sondern ein weiterer", "Es ist ب mit verrutschtem Punkt", "Es ist ث mit fehlenden Punkten"], answer: 0,
        derivation: "1 Punkt oben kommt in deiner Liste nicht vor. Nach der Regel muss es ein anderer Buchstabe sein.",
        reveal: "Das ist ن (Nūn). Dieselbe Regel gilt für alle Buchstaben mit dieser Grundform.",
        misconception: "Ein verrutschter Punkt wäre ein Schreibfehler. Beim Lesen gilt: Jede Punktkombination ist ein eigener Buchstabe.",
      },
      {
        id: "u1-h4", title: "Gehört Alif zur Familie?",
        stimulus: "ا", question: "Alif hat keinen Bogen und keine Punkte. Gehört es zur Familie ب ت ث?",
        options: ["Ja, nur ohne Punkte", "Nein: Die Grundform ist eine andere, ein gerader Strich", unknown], answer: 1,
        derivation: "Die Familie ist über die gemeinsame Bogen-Grundform definiert. Alif hat sie nicht.",
        reveal: "Alif gehört nicht zur Familie. Die Buchstaben unterscheiden sich schon in der Grundform. Außerdem verhält sich Alif anders (Einheit 4).",
        misconception: "„Ohne Punkte“ klingt wie „ب ohne Punkte“. Die Bogenform fehlt aber ganz.",
      },
    ],
    explain: [{ kind: "reveal", label: "Auflösung" }, { kind: "dots", label: "Die Punkte-Regel" }, { kind: "alifVsFamily", label: "Alif und die Familie" }, { kind: "pronunciation", label: "Aussprache" }],
    elab: [
      { id: "u1-e1", question: "ب, ت und ث haben dieselbe Grundform. Warum ist es beim Lesen wichtig, zuerst auf die Punkte zu achten?", model: "Nur die Punkte (Zahl und Lage) unterscheiden die drei Buchstaben. Ein Punkt unten ist ب, zwei oben ت, drei oben ث. Wer sie übersieht, liest den falschen Buchstaben." },
      { id: "u1-e2", question: "Nenne zwei sichtbare Unterschiede zwischen Alif und ب.", model: "Alif ist ein gerader Strich ohne Bogen. ب hat einen Bogen mit einem Punkt darunter." },
    ],
    check: [["letter:alif", 2], ["letter:tha", 1], ["letter:ba", 2], ["letter:ta", 0]],
    practice: [["letter:ba", 0], ["letter:ta", 1], ["letter:tha", 2], ["letter:alif", 1], ["letter:ba", 3], ["letter:ta", 3], ["letter:tha", 3], ["letter:alif", 3], ["letter:ba", 2], ["letter:tha", 0]],
    writes: [{ letterId: "ta", mode: "free" }, { letterId: "tha", mode: "free" }],
    test: [["letter:ba", 1], ["letter:ta", 0], ["letter:tha", 1], ["letter:alif", 0], ["letter:tha", 3], ["letter:ta", 3], ["letter:ba", 3], ["letter:ta", 2]],
    gates: [{ label: "Buchstaben erkennen", competences: ["visual"], min: 0.75 }, { label: "Laute zuordnen", competences: ["sound"], min: 0.5 }],
    jump: { visual: 1, sound: 2, listen: 2 },
  },
  {
    id: 2, title: "Fatha und die ersten Silben", short: "Silben mit kurzem a",
    goal: "Du liest und hörst ba, ta und tha und erklärst, was der Buchstabe und was die Fatha beiträgt.",
    minutes: 8,
    news: ["Fatha ◌َ: ein kurzes a über dem Buchstaben", "Konsonant + Fatha = Silbe", "Hören und unterscheiden: ba, ta, tha"],
    needs: "Du erkennst ب, ت und ث sicher (Einheit 1).",
    warm: [["letter:ba", 0], ["letter:ta", 1], ["letter:tha", 2]],
    guided: [{ kind: "fatha", label: "Konsonant + Fatha" }, { kind: "hearSyllables", label: "Silben hören" }],
    hyps: [
      {
        id: "u2-h1", title: "Eine neue Silbe aus der Regel",
        given: ["بَ = ba", "تَ = ta"], stimulus: "ثَ",
        question: "Wie liest du diese Silbe?", options: ["tha", "ta", "ba"], answer: 0,
        derivation: "ث = Thā kennst du aus Einheit 1, die Fatha liefert das kurze a. Aus den beiden Beispielen folgt: Konsonant + a.",
        reveal: "ثَ = tha: der Konsonant th, dann ein kurzes a.",
        misconception: "ثَ und تَ sehen ähnlich aus und klingen ähnlich. Wer die Punkte nicht zählt, verwechselt sie.",
      },
      {
        id: "u2-h2", title: "Vom Hören zur Schrift",
        audioIds: ["syl-ta-fatha"], given: ["Du kennst ب, ت, ث und die Fatha."],
        question: "Du hörst eine Silbe. Welche Schrift passt?", options: ["بَ", "تَ", "ثَ"], optionsAr: true, answer: 1,
        derivation: "Der Anfangslaut ist ein t (nicht b, nicht th). Du kennst die Buchstaben für b, t und th.",
        reveal: "Zu hören ist „ta“: تَ. Der Anfangslaut t und das kurze a passen zu ت mit Fatha.",
        misconception: "Das deutsche Ohr hört th oft als t oder s. Achte auf den Luftstrom: bei th zischt es, bei t gibt es einen kurzen Verschluss.",
      },
      {
        id: "u2-h3", title: "Wer liefert was?",
        given: ["Bekannt: ث ist Thā mit drei Punkten (Einheit 1)", "Neu ist nur das kleine Zeichen über dem Buchstaben: die Fatha"], stimulus: "ثَ", question: "Welcher Teil von ثَ liefert den Konsonanten, welcher den Vokal?",
        options: ["Der Buchstabe mit den 3 Punkten liefert th, das kleine Zeichen darüber das a", "Die 3 Punkte liefern den Vokal, das kleine Zeichen den Konsonanten", "Beides zusammen ergibt einen Laut, getrennt sind sie nicht erkennbar"], answer: 0,
        derivation: "Punkte gehören zum Buchstaben (Einheit 1). Das kleine Zeichen ist neu und ändert den Vokal, nicht den Konsonanten.",
        reveal: "Der Buchstabe liefert den Konsonanten, die Fatha das kurze a.",
        misconception: "Viele halten die Punkte für Vokale, weil sie wie Zusatzzeichen aussehen. Sie gehören aber zum Buchstaben.",
      },
    ],
    explain: [{ kind: "reveal", label: "Auflösung" }, { kind: "fathaRole", label: "Buchstabe + Fatha" }, { kind: "pronunciation", label: "Aussprache" }],
    elab: [{ id: "u2-e1", question: "Was liefert in تَ den Konsonanten und was den Vokal? Erkläre in eigenen Worten.", model: "Der Buchstabe ت liefert den Konsonanten t. Die Fatha darüber liefert den kurzen Vokal a. Zusammen ergeben sie die Silbe ta." }],
    check: [["syl:ba-fatha", 0], ["syl:tha-fatha", 0], ["vowel:fatha", 0], ["syl:ta-fatha", 3]],
    practice: [["syl:ba-fatha", 0], ["syl:ta-fatha", 1], ["syl:tha-fatha", 2], ["syl:ba-fatha", 3], ["syl:ta-fatha", 3], ["syl:tha-fatha", 3], ["syl:tha-fatha", 4], ["vowel:fatha", 2], ["syl:ba-fatha", 4]],
    writes: [{ letterId: "ba", mode: "free" }],
    test: [["syl:ba-fatha", 2], ["syl:ta-fatha", 0], ["syl:tha-fatha", 2], ["syl:ba-fatha", 3], ["syl:tha-fatha", 3], ["vowel:fatha", 0], ["syl:ta-fatha", 4], ["syl:ba-fatha", 1]],
    gates: [{ label: "Silben lesen", competences: ["syllable", "vowel"], min: 0.75 }, { label: "Silben hören", competences: ["listen", "sound"], min: 0.5 }],
    jump: { syllable: 0, vowel: 0, sound: 1, listen: 1, visual: 0 },
  },
  {
    id: 3, title: "Kasra und Damma: Vokale vergleichen", short: "a, i, u unterscheiden",
    goal: "Du unterscheidest a, i und u beim Hören und Lesen und liest ب, ت, ث mit allen drei Vokalzeichen.",
    minutes: 10,
    news: ["Kasra ◌ِ (i) steht unter, Damma ◌ُ (u) über dem Buchstaben", "Vokale hören und vergleichen", "Punkt des Buchstabens und Vokalzeichen auseinanderhalten"],
    needs: "Du liest ba, ta, tha (Einheit 2).",
    warm: [["syl:ba-fatha", 0], ["syl:ta-fatha", 1], ["syl:tha-fatha", 2]],
    guided: [{ kind: "vowels", label: "Drei Vokale im Vergleich" }, { kind: "hearVowels", label: "Vokale hören" }, { kind: "vowelDot", label: "Punkt oder Zeichen?" }],
    hyps: [
      {
        id: "u3-h1", title: "Das Muster auf ت übertragen",
        given: ["بَ = ba", "بِ = bi", "بُ = bu"], stimulus: "تِ",
        question: "Wie liest du diese Silbe?", options: ["ti", "ta", "tu", "thi"], answer: 0,
        derivation: "Aus den drei Beispielen mit ب: Das Zeichen unter dem Buchstaben ergibt i. ت ist der Buchstabe für t.",
        reveal: "تِ = ti. Dasselbe Zeichen ergibt bei jedem Buchstaben denselben Vokal.",
        misconception: "Manche denken, jeder Buchstabe hätte eigene Vokalzeichen. Die Zeichen sind aber für alle Buchstaben gleich.",
      },
      {
        id: "u3-h2", title: "Dasselbe mit u",
        given: ["بُ = bu"], stimulus: "ثُ",
        question: "Wie liest du diese Silbe?", options: ["thu", "tha", "thi", "tu"], answer: 0,
        derivation: "Das Zeichen mit der kleinen Schlaufe über dem Buchstaben ergab bu. ث liefert th.",
        reveal: "ثُ = thu: Der Buchstabe liefert th, das Zeichen mit der Schlaufe das kurze u.",
        misconception: "Bei ثُ und تُ kippt oft der Anfangslaut: th wird zu t. Achte auf die drei Punkte.",
      },
      {
        id: "u3-h3", title: "Welcher Strich ist der Punkt von ب?",
        given: ["ب hat einen runden Punkt unter dem Bogen", "Die Fatha ist ein kurzer schräger Strich"], stimulus: "بِ",
        question: "Unter diesem Buchstaben stehen zwei Dinge. Was ist was?",
        options: ["Der runde Punkt gehört zu ب, der kurze schräge Strich ist das Kasra", "Der schräge Strich gehört zu ب, der Punkt ist das Kasra", "Beides zusammen ist das Kasra"], answer: 0,
        derivation: "Punkte sind rund und gehören zum Buchstaben. Vokalzeichen sind kurze Striche oder Schlaufen.",
        reveal: "Das Kasra ist der schräge Strich. Der Punkt ist Teil des Buchstabens ب.",
        misconception: "Bei ب und ي steht ein Punkt unten, daneben ein Kasra: Beides liegt unter dem Bogen. Hier hilft die Form: rund = Punkt, schräg = Vokal.",
      },
      {
        id: "u3-h4", title: "Vom Hören zur Schrift: u",
        audioIds: ["syl-ta-damma"], given: ["بَ = ba · بِ = bi · بُ = bu"],
        question: "Du hörst eine Silbe mit t. Welche Schrift passt?", options: ["تَ", "تِ", "تُ"], optionsAr: true, answer: 2,
        derivation: "Der Vokal ist ein u. Das Zeichen für u kennst du aus dem Beispiel بُ.",
        reveal: "Zu hören ist „tu“: تُ. Der Anfangslaut t und das kurze u passen zu ت mit Damma.",
        misconception: "u und i klingen für Anfänger bei schneller Aussprache ähnlich. Achte auf die Lippen: rund bei u, entspannt bei i.",
      },
    ],
    explain: [{ kind: "reveal", label: "Auflösung" }, { kind: "vowels", label: "Die drei Vokalzeichen" }, { kind: "pronunciation", label: "Aussprache" }],
    elab: [
      { id: "u3-e1", question: "Was liefert der Buchstabe und was das Vokalzeichen in بِ? Erkläre in eigenen Worten.", model: "Der Buchstabe ب liefert den Konsonanten b. Das Kasra darunter liefert den kurzen Vokal i. Zusammen ergeben sie bi." },
      { id: "u3-e2", question: "Wie unterscheidest du den Punkt eines Buchstabens von einem Vokalzeichen?", model: "Punkte sind rund und gehören zum Buchstaben. Vokalzeichen sind kurze schräge Striche (Fatha, Kasra) oder ein winziges „و“ (Damma)." },
    ],
    check: [["vowel:kasra", 0], ["vowel:damma", 1], ["syl:ta-kasra", 0], ["concept:vowel-place", 0]],
    practice: [["syl:ta-kasra", 0], ["syl:tha-damma", 1], ["vowel:kasra", 2], ["vowel:damma", 3], ["syl:ba-kasra", 3], ["syl:ba-damma", 4], ["syl:ta-damma", 3], ["syl:tha-kasra", 2], ["vowel:fatha", 1], ["syl:tha-damma", 0]],
    writes: [],
    test: [["syl:ba-kasra", 2], ["syl:ta-damma", 0], ["syl:tha-kasra", 3], ["vowel:damma", 0], ["syl:tha-damma", 2], ["vowel:kasra", 2], ["syl:ta-kasra", 4], ["syl:ba-damma", 3], ["concept:vowel-place", 0]],
    gates: [{ label: "Vokale und Silben lesen", competences: ["vowel", "syllable"], min: 0.7 }, { label: "Vokale hören", competences: ["listen", "sound"], min: 0.5 }],
    jump: { vowel: 0, syllable: 0, listen: 1, sound: 1, visual: 2 },
  },
  {
    id: 4, title: "Verbinden, lange Vokale und erste Wörter", short: "ā, Verbindung, Wörter",
    goal: "Du liest ā als lange Silbe, erkennst, wo Buchstaben verbunden sind, und liest vier erste Wörter.",
    minutes: 12,
    news: ["Fatha + Alif = langes ā", "Alif verbindet sich nicht mit dem Folgebuchstaben", "Vier erste Wörter (Pausalform)"],
    needs: "Du liest Silben mit a, i und u (Einheit 3).",
    warm: [["syl:ba-kasra", 0], ["syl:ta-damma", 1], ["syl:tha-fatha", 2]],
    guided: [{ kind: "longAlif", label: "Langes ā" }, { kind: "join", label: "Verbindungen" }, { kind: "words", label: "Erste Wörter" }],
    hyps: [
      {
        id: "u4-h1", title: "Die Länge ableiten",
        given: ["بَ = ba (kurz)", "بَا = bā (lang)"], stimulus: "تَا",
        question: "Wie liest du diese Silbe?", options: ["tā (lang)", "ta (kurz)", "tha"], answer: 0,
        derivation: "Das Muster Fatha + ا ergibt bei ب ein langes ā. ت liefert t.",
        reveal: "تَا = tā: Fatha + Alif dehnt das a, bei jedem Buchstaben.",
        misconception: "Alif wird oft als eigener Konsonant „a“ gelesen. Es ist hier nur ein Dehnungszeichen.",
      },
      {
        id: "u4-h2", title: "Wo ist eine Lücke?",
        given: ["Beispielwörter: بَاب · ثَابِت · تَاب · ثَبَات"], stimulus: "ثَبَات",
        question: "Beobachte die Wörter. Nach welchem Buchstaben entsteht im Schriftbild eine Lücke?",
        options: ["Nach dem Alif", "Nach dem ث", "Nach dem ب"], answer: 0,
        derivation: "In jedem Beispielwort hängt der Buchstabe nach dem Alif nicht mehr an, während ب, ت und ث sich nach links verbinden.",
        reveal: "Alif ist ein Nicht-Verbinder: Nach ihm beginnt die Schrift neu. Bei ثَبَات sind ث-ب-ا verbunden, danach steht ت frei.",
        misconception: "Man vermutet eine Lücke nach jedem Buchstaben oder nach dem ersten. Das gilt aber nur für wenige Buchstaben wie Alif.",
      },
      {
        id: "u4-h3", title: "Ein erstes Wort",
        given: ["بَ = ba · بَا = bā (lang)", "Am Wortende steht kein Vokalzeichen: Pausalform, ohne Endvokal gelesen"], stimulus: "بَاب", question: "Du kennst alle Teile. Wie liest du das Wort?",
        options: ["bāb", "bab", "bāba"], answer: 0,
        derivation: "Von rechts nach links: ب + Fatha = ba, Alif dehnt zu bā, am Ende ب ohne Vokalzeichen = b.",
        reveal: "بَاب = bāb („Tür“). Das letzte ب hat kein Zeichen: Pausalform, ohne Endvokal.",
        misconception: "Das fehlende Zeichen am Wortende lädt zum Ergänzen eines Vokals ein („bāba“). In der Pausalform wird dort keiner gesprochen.",
      },
    ],
    explain: [{ kind: "reveal", label: "Auflösung" }, { kind: "join", label: "Länge und Verbindung" }, { kind: "alifVsFamily", label: "Alif genau" }, { kind: "words", label: "Wörter" }],
    elab: [{ id: "u4-e1", question: "Warum ist Alif kein Konsonant wie ب? Nenne zwei Unterschiede.", model: "Alif hat hier keinen eigenen Konsonantenlaut, sondern dehnt den Vokal davor (بَا = bā). Außerdem hat es keine Punkte und verbindet sich nicht mit dem folgenden Buchstaben." }],
    check: [["concept:alif-role", 0], ["concept:alif-join", 0], ["syl:ba-long", 0], ["word:bab", 0]],
    practice: [["syl:ta-long", 1], ["word:tab", 0], ["syl:tha-long", 0], ["word:thabat", 1], ["word:thabit", 2], ["concept:alif-role", 0], ["word:bab", 2], ["syl:ba-long", 2], ["word:thabit", 0]],
    writes: [],
    test: [["syl:ba-long", 1], ["word:bab", 1], ["word:tab", 1], ["syl:tha-long", 2], ["word:thabit", 1], ["concept:alif-join", 0], ["word:thabat", 0], ["concept:alif-role", 0]],
    gates: [{ label: "Wörter lesen", competences: ["word"], min: 0.66 }, { label: "Silben und Länge", competences: ["syllable", "vowel", "visual"], min: 0.7 }],
    jump: { word: 2, syllable: 0, vowel: 0, visual: 1 },
  },
];

export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));
export const unitOf = (id: number) => UNIT_BY_ID.get(id as 1 | 2 | 3 | 4)!;
