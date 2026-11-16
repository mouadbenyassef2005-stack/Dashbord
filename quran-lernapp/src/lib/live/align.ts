import { similarity } from "./normalize";

export interface ExpectedWord {
  /** Konsonantengerüst */
  skel: string;
  /** optional (z. B. Basmala): Auslassen kostet nichts und wird nicht als „ausgelassen“ gewertet */
  optional?: boolean;
}

export interface Pair {
  /** Index in `expected` */
  j: number;
  /** Index im gesprochenen Token-Strom (erstes Token bei Merge) */
  i: number;
  /** Ähnlichkeit 0..1 */
  sim: number;
  /** wie viele gesprochene Tokens zu diesem Wort gehören (1 normal, 2 Merge) */
  spoken: number;
  /** wie viele erwartete Wörter durch dieses Token abgedeckt sind (1 normal, 2 Merge) */
  covers: number;
  heard: string;
}

export interface Alignment {
  pairs: Pair[];
  cost: number;
}

const SKIP_COST = 0.8;
const OPTIONAL_SKIP_COST = 0.05;
const INSERT_COST = 0.6;

/**
 * Sequenz-Alignment (DP) zwischen gesprochenen Tokens und erwarteten Wörtern.
 * Zulässige Schritte: Zuordnung (Kosten 1−Ähnlichkeit), Auslassung (erwartetes Wort ohne Token),
 * Einschub (überzähliges Token), Merge 2 Tokens→1 Wort und 1 Token→2 Wörter (ASR trennt/verbindet Wörter uneinheitlich).
 * Das Ende des erwarteten Texts ist frei: noch nicht gelesene Wörter kosten nichts.
 */
export function align(spoken: string[], expected: ExpectedWord[], start = 0, window = Math.min(expected.length - start, spoken.length * 2 + 8)): Alignment {
  const E = expected.slice(start, start + window);
  const n = spoken.length;
  const m = E.length;
  const INF = 1e9;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(INF));
  type Step = { pi: number; pj: number; kind: "match" | "skip" | "ins" | "merge-s" | "merge-e"; sim?: number };
  const back: (Step | null)[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));
  dp[0][0] = 0;
  const skip = (j: number) => (E[j].optional ? OPTIONAL_SKIP_COST : SKIP_COST);

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const cur = dp[i][j];
      if (cur >= INF) continue;
      const relax = (ni: number, nj: number, cost: number, step: Step) => {
        if (cur + cost < dp[ni][nj]) { dp[ni][nj] = cur + cost; back[ni][nj] = step; }
      };
      if (i < n && j < m) {
        const sim = similarity(spoken[i], E[j].skel);
        relax(i + 1, j + 1, 1 - sim, { pi: i, pj: j, kind: "match", sim });
      }
      if (j < m) relax(i, j + 1, skip(j), { pi: i, pj: j, kind: "skip" });
      if (i < n) relax(i + 1, j, INSERT_COST, { pi: i, pj: j, kind: "ins" });
      if (i + 1 < n && j < m) {
        const sim = similarity(spoken[i] + spoken[i + 1], E[j].skel);
        if (sim >= 0.88) relax(i + 2, j + 1, (1 - sim) + 0.05, { pi: i, pj: j, kind: "merge-s", sim });
      }
      if (i < n && j + 1 < m) {
        const sim = similarity(spoken[i], E[j].skel + E[j + 1].skel);
        if (sim >= 0.88) relax(i + 1, j + 2, (1 - sim) + 0.05, { pi: i, pj: j, kind: "merge-e", sim });
      }
    }
  }
  // freies Ende: alle gesprochenen Tokens verbraucht, beliebig viele erwartete Wörter noch offen
  let bj = 0;
  for (let j = 0; j <= m; j++) if (dp[n][j] < dp[n][bj]) bj = j;
  const pairs: Pair[] = [];
  let i = n;
  let j = bj;
  while (i > 0 || j > 0) {
    const st = back[i][j];
    if (!st) break;
    if (st.kind === "match") pairs.push({ j: start + st.pj, i: st.pi, sim: st.sim!, spoken: 1, covers: 1, heard: spoken[st.pi] });
    else if (st.kind === "merge-s") pairs.push({ j: start + st.pj, i: st.pi, sim: st.sim!, spoken: 2, covers: 1, heard: spoken[st.pi] + spoken[st.pi + 1] });
    else if (st.kind === "merge-e") pairs.push({ j: start + st.pj, i: st.pi, sim: st.sim!, spoken: 1, covers: 2, heard: spoken[st.pi] });
    i = st.pi;
    j = st.pj;
  }
  pairs.reverse();
  return { pairs, cost: dp[n][bj] };
}
