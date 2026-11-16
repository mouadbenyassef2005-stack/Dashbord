import { skeleton } from "./normalize";

/**
 * Optionaler Abgleich mit Quran.com (öffentliche API v4), im Browser des Nutzers:
 *  - prüft, ob der gebündelte Text mit Quran.com übereinstimmt (Konsonantengerüst + Wortanzahl je Ayah),
 *  - liefert Wort-für-Wort-Audio (menschliche Rezitation) für „Wort anhören“.
 * Schlägt der Abruf fehl, arbeitet die App unverändert mit dem gebündelten Text weiter.
 * Hinweis: Für produktiven Einsatz die Nutzungsbedingungen/den API-Zugang der Quran Foundation beachten.
 */
export type QuranComStatus = "loading" | "verified" | "mismatch" | "unavailable";

export interface QuranComResult {
  status: QuranComStatus;
  /** "85:1:2" → Audio-URL */
  audio: Record<string, string>;
  note?: string;
}

interface ApiWord { position: number; text_uthmani?: string; char_type_name?: string; audio_url?: string | null }
interface ApiVerse { verse_number: number; words: ApiWord[] }

export async function loadQuranCom(surah: number, bundled: { verse: number; text: string }[][], timeoutMs = 7000): Promise<QuranComResult> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${surah}?words=true&word_fields=text_uthmani,audio_url,char_type_name&per_page=300&fields=verse_number`;
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) return { status: "unavailable", audio: {}, note: `HTTP ${res.status}` };
    const json = (await res.json()) as { verses?: ApiVerse[] };
    const verses = json.verses ?? [];
    const audio: Record<string, string> = {};
    let mismatches = 0;
    if (verses.length !== bundled.length) mismatches++;
    for (const v of verses) {
      const words = v.words.filter((w) => (w.char_type_name ?? "word") === "word");
      const mine = bundled[v.verse_number - 1] ?? [];
      if (words.length !== mine.length) { mismatches++; continue; }
      words.forEach((w, i) => {
        if (skeleton(w.text_uthmani ?? "") !== skeleton(mine[i].text)) mismatches++;
        if (w.audio_url) audio[`${surah}:${v.verse_number}:${i + 1}`] = /^https?:/.test(w.audio_url) ? w.audio_url : `https://verses.quran.com/${w.audio_url.replace(/^\/+/, "")}`;
      });
    }
    return mismatches ? { status: "mismatch", audio, note: `${mismatches} Abweichung(en)` } : { status: "verified", audio };
  } catch (e) {
    return { status: "unavailable", audio: {}, note: e instanceof Error ? e.message : "Fehler" };
  } finally {
    clearTimeout(timer);
  }
}
