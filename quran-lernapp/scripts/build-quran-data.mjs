// Erzeugt src/content/generated/quran-source.json aus dem npm-Paket "quran-json"
// (Uthmani-Text: The Noble Qur'an Encyclopedia; Transliteration: Tanzil.net; Lizenz CC BY-SA 4.0).
// Es werden nur die im MVP genutzten kurzen Suren übernommen. Kein Text wird von Hand getippt.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const dir = require.resolve("quran-json/package.json").replace("package.json", "dist/");
const quran = JSON.parse(readFileSync(dir + "quran.json", "utf8"));
const translit = JSON.parse(readFileSync(dir + "quran_transliteration.json", "utf8"));

const SURAHS = [1, 112, 108, 103, 106, 105, 113, 114, 110, 109, 85];
const out = {
  source: {
    arabic: "Uthmani-Text aus quran-json 3.1.2 (The Noble Qur'an Encyclopedia, quranenc.com)",
    transliteration: "Tanzil.net (en.transliteration), nur wortweise übernommen, wenn Wortanzahl exakt übereinstimmt",
    license: "CC BY-SA 4.0 (quran-json)",
    note: "Vor einem Produktivstart gegen eine zweite, kollationierte Quelle (z. B. Tanzil Uthmani / Medina-Mushaf) prüfen lassen.",
  },
  surahs: [],
};
for (const id of SURAHS) {
  const s = quran[id - 1];
  const t = translit[id - 1];
  if (s.id !== id || t.id !== id) throw new Error("ID-Mismatch " + id);
  out.surahs.push({
    id,
    name: s.name,
    nameTranslit: s.transliteration,
    verses: s.verses.map((v, i) => {
      const aw = v.text.split(" ");
      const tw = t.verses[i].transliteration.split(" ");
      const aligned = aw.length === tw.length;
      return {
        n: v.id,
        text: v.text,
        words: aw.map((w, k) => ({ t: w, ...(aligned ? { tr: tw[k].replace(/AA/g, "ʿ") } : {}) })),
      };
    }),
  });
}
writeFileSync("src/content/generated/quran-source.json", JSON.stringify(out, null, 1));
console.log("ok", out.surahs.map((s) => `${s.id}:${s.verses.length}`).join(" "));
