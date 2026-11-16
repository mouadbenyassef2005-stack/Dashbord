/**
 * Normalisierung für den Abgleich von Spracherkennung (ohne Harakat) mit dem Uthmani-Text.
 * Ergebnis ist das „Konsonantengerüst“ ohne Alif (Dehnungs-Alif werden von ASR uneinheitlich geschrieben).
 */
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ‌‍‎‏]/g;

export function skeleton(input: string): string {
  let s = input.normalize("NFKC").replace(/ٰ/g, "ا"); // Dolch-Alif zählt als Alif (dann unten entfernt)
  s = s.replace(MARKS, "");
  s = s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ئ/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/ء/g, "");
  s = s.replace(/[^ء-ي]/g, "");
  return s.replace(/ا/g, "");
}

/** Aufteilen eines ASR-Transkripts in normalisierte Tokens (leere fallen weg). */
export function tokens(text: string): string[] {
  return text
    .split(/\s+/)
    .map(skeleton)
    .filter((t) => t.length > 0);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** Ähnlichkeit 0..1 zweier Konsonantengerüste. */
export function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - levenshtein(a, b) / max;
}

/** Erste abweichende Buchstaben (für den Hinweis „erkannt X statt Y“). */
export function firstDifference(expected: string, heard: string): { expected: string; heard: string } | null {
  const m = expected.length;
  const n = heard.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1));
  let i = m;
  let j = n;
  let diff: { expected: string; heard: string } | null = null;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      if (expected[i - 1] !== heard[j - 1]) diff = { expected: expected[i - 1], heard: heard[j - 1] };
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      diff = { expected: expected[i - 1], heard: "" };
      i--;
    } else {
      diff = { expected: "", heard: heard[j - 1] };
      j--;
    }
  }
  return diff;
}
