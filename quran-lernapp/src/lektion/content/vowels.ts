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
