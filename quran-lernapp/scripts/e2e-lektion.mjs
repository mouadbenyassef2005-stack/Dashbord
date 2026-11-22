// E2E gegen laufende App. Nutzung: node scripts/e2e-lektion.mjs http://localhost:3000 ./screenshots
// Einzeldatei: node scripts/e2e-lektion.mjs "file:///pfad/arabisch-lektion-1.html" ./screenshots hash
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "./screenshots";
const hash = process.argv[4] === "hash";
const url = (p) => (hash ? `${base}#${p}` : base + p);
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

/* ---------- Lösungswörterbuch (nur Test) ---------- */
const NAME = { "ا": "Alif", "ب": "Bā", "ت": "Tā", "ث": "Thā" };
const GLYPH = Object.fromEntries(Object.entries(NAME).map(([g, n]) => [n, g]));
const C = { ba: "ب", ta: "ت", tha: "ث" }, ON = { ba: "b", ta: "t", tha: "th" };
const V = { fatha: ["َ", "a", "Fatha"], kasra: ["ِ", "i", "Kasra"], damma: ["ُ", "u", "Damma"] };
const SYL = {}; for (const c of Object.keys(C)) for (const [m, l] of Object.values(V)) SYL[C[c] + m] = ON[c] + l;
const SYL_AR = Object.fromEntries(Object.entries(SYL).map(([a, t]) => [t, a]));
const FEATURE = [["senkrechter Strich", "ا"], ["einem Punkt darunter", "ب"], ["zwei Punkten darüber", "ت"], ["drei Punkten darüber", "ث"]];
const MARKS = Object.fromEntries(Object.values(V).map(([m, l, n]) => ["ـ" + m, { name: n, l }]));
const DOTS = { "ب": "1 unten", "ت": "2 oben", "ث": "3 oben" };

function solve({ prompt, ar, audio, type }) {
  const a = (ar ?? "").trim();
  if (type === "type") return SYL[a] ?? "x";
  if (audio) {
    const [kind, ...rest] = audio.split("-");
    if (kind === "name") return "ا";
    if (kind === "sound") return C[rest[0]];
    if (kind === "vowel") return { l: V[rest[0]][1], mark: "ـ" + V[rest[0]][0] };
    if (kind === "syl") { const [c, v] = rest; return { tr: ON[c] + V[v][1], ar: C[c] + V[v][0] }; }
  }
  let m;
  if (prompt.startsWith("Wie viele Punkte")) return DOTS[a];
  if (prompt.startsWith("Ist das")) return "keiner der drei";
  if (prompt === "Wie heißt dieses Zeichen?" || prompt === "Wie heißt dieser Buchstabe?") return NAME[a] ?? MARKS[a]?.name;
  if ((m = prompt.match(/^Welcher Buchstabe ist (.+)\?$/))) return GLYPH[m[1]] ?? FEATURE.find(([f]) => m[1].includes(f))?.[1];
  if ((m = prompt.match(/^Tippe auf (?:die )?(\w+)\.$/))) return GLYPH[m[1]] ?? Object.keys(MARKS).find((k) => MARKS[k].name === m[1]);
  if ((m = prompt.match(/^Welches Zeichen ist (.+)\?$/))) return FEATURE.find(([f]) => m[1].includes(f))?.[1];
  if ((m = prompt.match(/^Wo steht die (\w+)\?$/))) return m[1] === "Kasra" ? "unter dem Buchstaben" : "über dem Buchstaben";
  if (prompt.startsWith("Welchen kurzen Vokal zeigt")) return MARKS[a]?.l;
  if (prompt.startsWith("Wie wird diese Silbe gelesen")) return SYL[a];
  if ((m = prompt.match(/Welche Silbe ist „(\w+)“/))) return SYL_AR[m[1]];
  return null;
}
const pick = (texts, ans, prompt) => {
  const clean = (t) => t.trim().replace(/\s*[✓✗]$/, "");
  if (ans == null) return 0;
  if (typeof ans === "object") {
    const want = prompt.includes("Welchen kurzen Vokal") ? [ans.l] : prompt.includes("Vokalzeichen") ? [ans.mark] : prompt.includes("Silbe ist das") ? [ans.ar] : prompt.includes("Silbe hörst") ? [ans.tr] : [ans.tr, ans.ar];
    return Math.max(0, texts.findIndex((t) => want.includes(clean(t))));
  }
  const i = texts.findIndex((t) => clean(t) === ans);
  return i >= 0 ? i : 0;
};

const browser = await chromium.launch();
const mkCtx = (w, h) => browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
const ctx = await mkCtx(360, 640);
await ctx.addInitScript(() => { window.__played = []; HTMLMediaElement.prototype.play = function () { window.__played.push({ src: this.src.slice(0, 60), rate: this.playbackRate }); return Promise.resolve(); }; });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const go = async (p) => { await page.goto(url(p)); if (hash) await page.reload(); await page.waitForSelector(".path, h1"); };
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
const seen = []; // alle Bildschirmtexte je Lektion

async function playLesson({ wrongFirst = false, label = "" } = {}) {
  const texts = []; let fb = null, wrongDone = false, n = 0, tasks = 0, hyps = 0, wrongSeen = false, footVisible = true, overflowSeen = false;
  for (let guard = 0; guard < 60; guard++) {
    if (await page.locator(".lp-end").count()) break;
    await page.locator(".lp-foot").waitFor();
    texts.push(await page.locator(".lp-main").first().innerText());
    const fbox = await page.locator(".lp-foot .btn-big").first().boundingBox();
    const vh = page.viewportSize().height;
    if (!fbox || fbox.y + fbox.height > vh + 1) footVisible = false;
    if (await overflow()) overflowSeen = true;
    if (await page.locator(".lp-opt").count()) {
      const isHyp = (await page.locator(".lp-eyebrow", { hasText: "Vermute" }).count()) > 0;
      const prompt = ((await page.locator("#lp-q").first().textContent()) ?? "").trim();
      const stim = page.locator(".lp-stim");
      const ar = (await stim.locator(".ar").count()) ? (await stim.locator(".ar").first().textContent()).trim() : "";
      const audio = await stim.getAttribute("data-audio").catch(() => null);
      const texts2 = await page.locator(".lp-opt").allTextContents();
      let idx = isHyp ? 0 : pick(texts2, solve({ prompt, ar, audio, type: "choice" }), prompt);
      const wrongNow = wrongFirst && !isHyp && !wrongDone;
      if (wrongNow) idx = (idx + 1) % texts2.length;
      await page.locator(".lp-opt").nth(idx).click();
      if (isHyp) { hyps++; await page.getByRole("button", { name: "Weiter" }).click(); }
      else if ((await page.getByRole("button", { name: "Prüfen" }).count()) === 0) {
        tasks++; await page.getByRole("button", { name: "Weiter" }).click();   // zurückgestellte Rückmeldung (Nachtest)
      } else {
        tasks++;
        await page.getByRole("button", { name: "Prüfen" }).click();
        if (wrongNow) { wrongDone = true; fb = await page.locator(".lp-foot").innerText(); wrongSeen = fb.includes("Nicht ganz") && fb.includes("Richtig:"); }
        await page.getByRole("button", { name: /^(Weiter|Fertig)$/ }).click();
      }
      n++;
    } else if (await page.locator(".lp-input").count()) {
      const prompt = ((await page.locator("#lp-q").textContent()) ?? "").trim();
      const ar = (await page.locator(".lp-stim .ar").first().textContent()).trim();
      await page.locator(".lp-input").fill(solve({ prompt, ar, type: "type" })); tasks++;
      await page.getByRole("button", { name: "Prüfen" }).click(); await page.getByRole("button", { name: /^(Weiter|Fertig)$/ }).click(); n++;
    } else {
      await page.locator(".lp-foot .btn-big").last().click(); n++;
    }
  }
  const end = await page.locator(".lp-main").innerText();
  await page.locator(".lp-foot .btn-big").click();
  await page.locator(".path").waitFor();
  seen.push({ label, texts });
  return { tasks, hyps, steps: n, end, wrongSeen, footVisible, overflowSeen };
}
const openCurrent = async () => { await page.locator(".node[data-state=current]").click(); await page.locator(".lp").waitFor(); };

/* ===== Start: Lernpfad ===== */
await go("/");
check("Lernpfad: vier Strecken in der verbindlichen Reihenfolge", JSON.stringify(await page.locator(".path-banner h2").allTextContents()) === JSON.stringify(["Buchstaben", "Tashkeel", "Buchstabe + Tashkeel", "Silben festigen"]));
check("Nächste Lektion hervorgehoben (Alif)", (await page.locator(".node[data-state=current]").getAttribute("aria-label")).startsWith("Alif"));
check("Nur eine Lektion offen, der Rest gesperrt", (await page.locator(".node[data-state=locked]").count()) === 22);
check("Kein Dashboard: keine Prozentwerte, kein Streak", !/\d+\s?%|Serie|Streak|XP/.test(await page.textContent("main")));
check("Kein horizontales Scrollen (Pfad, 360 px)", !(await overflow()));
await shot("A-pfad");
await page.locator(".node[data-state=locked]").first().click();
check("Gesperrte Lektion: freundlicher Hinweis mit Wahl", (await page.locator(".lp-sheet").textContent()).includes("Schließe zuerst"));
await page.getByRole("button", { name: "Abbrechen" }).click();

/* ===== Strecke 1: vier Buchstaben, einzeln ===== */
await openCurrent();
check("Alif-Lektion: Vollbild mit Schließen und Fortschritt", (await page.locator(".lp-close").count()) === 1 && (await page.locator(".lp-bar").count()) === 1);
check("Alif: Audio direkt beim Zeichen", (await page.getByRole("button", { name: /hören$/i }).count()) >= 1);
await page.getByRole("button", { name: /hören$/i }).first().click();
check("Alif: Aufnahme wird abgespielt (m4a)", (await page.evaluate(() => window.__played)).some((p) => p.src.startsWith("data:audio") || p.src.includes("name-alif")));
let r = await playLesson({ wrongFirst: true, label: "b-alif" });
check("Fehlerfeedback: „Nicht ganz“, richtige Antwort und Erklärung", r.wrongSeen);
check("Falsche Aufgabe kommt am Ende noch einmal (mehr Schritte als Aufgaben)", r.steps > 6, String(r.steps));
check("Ende-Bildschirm nennt Treffer beim ersten Mal", /von \d+ gleich beim ersten Mal richtig/.test(r.end), r.end);
check("Fortschritt gespeichert: Alif geschafft, Bā als Nächstes", (await page.locator(".node[data-state=done]").count()) === 1 && (await page.locator(".node[data-state=current]").getAttribute("aria-label")).startsWith("Bā"));
await page.reload(); await page.waitForSelector(".path");
check("Fortschritt bleibt nach Neuladen", (await page.locator(".node[data-state=done]").count()) === 1);
for (const id of ["Bā", "Tā", "Thā"]) { await openCurrent(); r = await playLesson({ label: `b-${id}` }); await page.waitForTimeout(50); }
check("Alle vier Buchstaben einzeln abgeschlossen", (await page.locator(".node[data-state=done]").count()) === 4);
check("Familie erst nach den vier Einführungen: nächste Lektion ist „Entdecken“", (await page.locator(".node[data-state=current]").getAttribute("aria-label")).startsWith("Entdecken"));

/* Entdecken (ohne Feedback) → Erklären → Anwenden → Wiederholung */
await openCurrent();
r = await playLesson({ label: "b-entdecken" });
check("Hypothesen-Lektion: Vermutungen ohne sofortiges Feedback", r.hyps === 3 && r.tasks === 0);
await openCurrent(); r = await playLesson({ label: "b-erklaeren" });
await openCurrent(); r = await playLesson({ label: "b-anwenden" });
await openCurrent(); r = await playLesson({ label: "b-wdh" });
check("Strecke 1 abgeschlossen (8 von 8)", (await page.locator(".path-count").first().getAttribute("aria-label")) === "8 von 8 Lektionen geschafft");

/* ===== Strecke 2: Tashkeel einzeln ===== */
await openCurrent();
const firstMark = await page.locator(".lp-main").innerText();
check("Fatha: erst nur das Zeichen, mit Namen", firstMark.includes("Das ist die Fatha"));
await page.locator(".lp-foot .btn-big").click();
check("Fatha: Position erklärt (über dem Buchstaben)", (await page.locator(".lp-main").innerText()).includes("über"));
await page.locator(".lp-foot .btn-big").click();
check("Fatha: Bedeutung mit Audio und Zungenposition", (await page.locator(".lp-main").innerText()).includes("kurzen „a“") && (await page.getByRole("button", { name: /hören$/i }).count()) === 1);
await page.getByRole("button", { name: /hören$/i }).click();
check("Vokal-Aufnahme wird abgespielt (m4a)", (await page.evaluate(() => window.__played)).some((p) => p.src.startsWith("data:audio") || p.src.includes("vowel-fatha")));
await page.locator(".lp-close").click(); await page.getByRole("button", { name: "Beenden", exact: true }).click().catch(() => {});
await page.locator(".path").waitFor();
await openCurrent(); r = await playLesson({ label: "t-fatha" });
await openCurrent();
check("Kasra: eigene Mini-Lektion, Position unten", (await page.locator(".lp-main").innerText()).includes("Das ist die Kasra"));
await page.locator(".lp-foot .btn-big").click();
check("Kasra: „unter“ dem Buchstaben", (await page.locator(".lp-main").innerText()).includes("unter"));
await page.locator(".lp-foot .btn-big").click(); await page.locator(".lp-foot .btn-big").click();
r = await playLesson({ label: "t-kasra" });
await openCurrent(); r = await playLesson({ label: "t-damma" });
await openCurrent(); r = await playLesson({ label: "t-wdh" });
check("Strecke 2 abgeschlossen (4 von 4)", (await page.locator(".path-count").nth(1).getAttribute("aria-label")) === "4 von 4 Lektionen geschafft");

/* ===== Strecke 3: Buchstabe + Tashkeel ===== */
await openCurrent();
const comp = await page.locator(".lp-main").innerText();
check("Kombination beginnt mit ب + Fatha", comp.includes("ب + Fatha") && comp.includes("liefert „b“"));
await shot("B-kombination");
await page.locator(".lp-close").click(); await page.getByRole("button", { name: "Beenden", exact: true }).click().catch(() => {});
await openCurrent(); r = await playLesson({ label: "k-ba" });
await openCurrent(); r = await playLesson({ label: "k-entdecken" });
check("Muster-Entdecken: vier Hypothesen aus Bekanntem (mit Ton)", r.hyps === 4, String(r.hyps));
await openCurrent(); r = await playLesson({ label: "k-erklaeren" });
await openCurrent(); r = await playLesson({ label: "k-ta" });
await openCurrent(); r = await playLesson({ label: "k-tha" });
await openCurrent(); r = await playLesson({ label: "k-wdh" });
check("Strecke 3 abgeschlossen (6 von 6)", (await page.locator(".path-count").nth(2).getAttribute("aria-label")) === "6 von 6 Lektionen geschafft");

/* ===== Strecke 4: Silben festigen ===== */
for (const id of ["s-lesen", "s-hoeren", "s-zuordnen", "s-neu", "s-fehler"]) { await openCurrent(); r = await playLesson({ label: id }); }
check("Strecke 4 abgeschlossen (5 von 5)", (await page.locator(".path-count").nth(3).getAttribute("aria-label")) === "5 von 5 Lektionen geschafft");
check("Pfad komplett: keine nächste Lektion", (await page.locator(".node[data-state=current]").count()) === 0);
await shot("C-pfad-fertig");

/* ===== Inhaltsgrenzen der ersten Lernstrecke ===== */
const all = seen.map((s) => s.texts.join("\n")).join("\n");
check("Keine Wörter im ersten Pfad", !/بَاب|ثَابِت|تَاب|ثَبَات|Wörter lesen/.test(all.replace("Wörter, lange Vokale", "")));
check("Keine langen Vokale (ā-Silben) in Aufgaben", !/(^|\s)(bā|tā|thā)(\s|$)|[بتث]َا/.test(all));
const s1 = seen.filter((s) => s.label.startsWith("b-")).map((s) => s.texts.join("\n")).join("\n");
check("Strecke 1: kein einziges Tashkeel-Zeichen", !/[ً-ْ]/.test(s1));
const s2 = seen.filter((s) => s.label.startsWith("t-")).map((s) => s.texts.join("\n")).join("\n");
check("Strecke 2: Tashkeel ohne Buchstaben (nur Träger-Linie)", !/[ء-غف-ي]/.test(s2.replace(/Buchstabe|Konsonant/g, "")));
const kba = seen.find((s) => s.label === "k-ba").texts.join("\n");
check("Erste Kombination nutzt nur ب (kein ت/ث)", !/[تث]/.test(kba));

/* ===== Üben, Profil ===== */
await go("/ueben");
check("Üben: fällige Wiederholungen oder freie Übung", (await page.getByRole("button", { name: "Freie Übung starten" }).count()) === 1);
await page.getByRole("button", { name: "Freie Übung starten" }).click();
await page.locator(".lp").waitFor();
await playLesson({ label: "ueben" }).catch(() => {});
await go("/profil");
check("Profil: vier getrennte Kompetenzbereiche, kein Gesamtwert", JSON.stringify(await page.locator(".area h3").allTextContents()) === JSON.stringify(["Visuell", "Phonologisch", "Motorisch", "Dekodieren"]) && !/\d+\s?%/.test(await page.textContent("main")));

/* ===== Verwechslung → gezielte Vergleichsübung ===== */
await page.evaluate(() => { const k = "qaidah.lektion.v3"; const s = JSON.parse(localStorage.getItem(k)); s.confusions = { "letter:ba~letter:ta": { a: "letter:ba", b: "letter:ta", count: 3, resolved: false, lastAt: Date.now() } }; localStorage.setItem(k, JSON.stringify(s)); });
await page.reload(); await page.getByRole("heading", { name: "Das verwechselst du oft" }).waitFor();
await page.getByRole("button", { name: "Gezielt vergleichen" }).click();
check("Vergleich zeigt beide Buchstaben mit Punkten", /1 unten/.test(await page.locator(".lp-main").innerText()) && /2 oben/.test(await page.locator(".lp-main").innerText()));
await shot("D-vergleich");
await page.locator(".lp-foot .btn-big").click();
await playLesson({ label: "drill" }).catch(() => {});
await page.waitForTimeout(200);
check("Nach bestandenem Nachtest verschwindet die Verwechslung", (await page.getByRole("heading", { name: "Das verwechselst du oft" }).count()) === 0);

/* ===== Smartphone-Größen ===== */
for (const [w, h, name] of [[360, 640, "klein"], [430, 932, "groß"]]) {
  const c = await mkCtx(w, h); const pg = await c.newPage();
  await pg.goto(url("/")); if (hash) await pg.reload(); await pg.waitForSelector(".path");
  check(`${name} (${w}×${h}): kein horizontales Scrollen im Pfad`, !(await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)));
  await pg.locator(".node[data-state=open], .node[data-state=current]").first().click().catch(() => {});
  await pg.waitForTimeout(150);
  if (await pg.locator(".lp").count()) {
    const b = await pg.locator(".lp-foot .btn-big").boundingBox();
    check(`${name}: Hauptbutton im sichtbaren Bereich`, !!b && b.y + b.height <= h);
    await pg.screenshot({ path: `${out}/E-${name}.png` });
  }
  await c.close();
}

/* ===== Tastatur ===== */
await go("/");
await page.keyboard.press("Tab");
check("Tastaturfokus sichtbar", (await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)) !== "none");

check("Keine Konsolenfehler", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed ? `\n${failed} FEHLGESCHLAGEN` : "\nAlles bestanden");
process.exit(failed ? 1 : 0);
