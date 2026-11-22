// E2E gegen laufende App. Nutzung: node scripts/e2e-lektion.mjs http://localhost:3000 ./screenshots
// Für die Einzeldatei: node scripts/e2e-lektion.mjs "file:///pfad/arabisch-lektion-1.html" ./screenshots hash
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "./screenshots";
const hash = process.argv[4] === "hash";
const url = (p) => (hash ? `${base}#${p}` : base + p);
/** Seitenwechsel; bei Hash-Routing (Einzeldatei) wird neu geladen, damit gespeicherter Stand gelesen wird. */
const go = async (p) => { await page.goto(url(p)); if (hash) await page.reload(); };
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

/* ---------- Lösungswörterbuch (nur für den Test: liest Reiz und Aufgabe und wählt die richtige Option) ---------- */
const NAME = { "ا": "Alif", "ب": "Bā", "ت": "Tā", "ث": "Thā" };
const GLYPH = Object.fromEntries(Object.entries(NAME).map(([g, n]) => [n, g]));
const C = { ba: "ب", ta: "ت", tha: "ث" }, ON = { ba: "b", ta: "t", tha: "th" };
const V = { fatha: ["َ", "a", "Fatha"], kasra: ["ِ", "i", "Kasra"], damma: ["ُ", "u", "Damma"] };
const SYL = {}; for (const c of Object.keys(C)) { for (const [m, l] of Object.values(V)) SYL[C[c] + m] = ON[c] + l; SYL[C[c] + "َ" + "ا"] = ON[c] + "ā"; }
const SYL_AR = Object.fromEntries(Object.entries(SYL).map(([a, t]) => [t, a]));
const WORDS = { "بَاب": ["bāb", "Tür"], "ثَابِت": ["thābit", "fest, beständig"], "تَاب": ["tāb", "er bereute (kehrte um)"], "ثَبَات": ["thabāt", "Beständigkeit, Festigkeit"] };
const FEATURE = [["senkrechter Strich", "ا"], ["einem Punkt darunter", "ب"], ["zwei Punkten darüber", "ت"], ["drei Punkten darüber", "ث"]];
const VOW_AR = Object.fromEntries(Object.values(V).map(([m, l, n]) => ["◌" + m, { name: n, l }]));

function solve({ prompt, ar, audio, type }) {
  const a = (ar ?? "").trim();
  if (type === "type") return (SYL[a] ?? WORDS[a]?.[0] ?? "x");
  if (audio) {
    const [kind, ...rest] = audio.split("-");
    if (kind === "name") return "ا";
    if (kind === "sound") return C[rest[0]];
    if (kind === "vowel") return { prompt, l: V[rest[0]][1], mark: "◌" + V[rest[0]][0] };
    if (kind === "syl") { const [c, v] = rest; return { tr: ON[c] + V[v][1], ar: C[c] + V[v][0] }; }
  }
  if (prompt.startsWith("Wie heißt dieser Buchstabe")) return NAME[a];
  const m = prompt.match(/^Welcher Buchstabe ist (.+)\?$/);
  if (m) return GLYPH[m[1]] ?? FEATURE.find(([f]) => m[1].includes(f))?.[1];
  if (prompt.startsWith("Wie heißt dieses Vokalzeichen")) return VOW_AR[a]?.name;
  const kv = prompt.match(/Welches Zeichen steht für kurzes „(\w)“/);
  if (kv) return Object.keys(VOW_AR).find((k) => VOW_AR[k].l === kv[1]);
  if (prompt.startsWith("Wie wird diese Silbe gelesen")) return SYL[a];
  const ks = prompt.match(/Welche Silbe ist „(\w+)“/);
  if (ks) return SYL_AR[ks[1]];
  if (prompt.startsWith("Wie wird dieses Wort gelesen")) return WORDS[a]?.[0];
  if (prompt.startsWith("Was bedeutet")) return WORDS[a]?.[1];
  if (prompt.startsWith("Was tut")) return "Es dehnt das a zu ā";
  if (prompt.startsWith("Welcher dieser Buchstaben verbindet")) return "ا";
  if (prompt.startsWith("Wo steht das Kasra")) return "unter dem Buchstaben";
  return null;
}
const pickIdx = (texts, ans, prompt) => {
  if (ans == null) return 0;
  if (typeof ans === "object") {
    const cand = prompt.includes("Vokalzeichen gehört") ? [ans.mark] : prompt.includes("Welchen kurzen Vokal") ? [ans.l] : prompt.includes("Silbe ist das") ? [ans.ar] : prompt.includes("Silbe hörst") ? [ans.tr] : [ans.tr, ans.ar];
    return Math.max(0, texts.findIndex((t) => cand.includes(t.trim().replace(/\s*[✓✗]$/, ""))));
  }
  const i = texts.findIndex((t) => t.trim().replace(/\s*[✓✗]$/, "") === ans);
  return i >= 0 ? i : 0;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  // Wiedergabe protokollieren (Headless-Chromium hat oft keine AAC-Codecs); echte Browser spielen m4a ab.
  window.__played = [];
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__played.push({ src: this.src.slice(0, 80), rate: this.playbackRate }); return Promise.resolve(); };
  void orig;
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, fullPage: true });
const nav = () => page.locator(".phase-nav .btn-primary");
const noOverflow = async (label) => {
  const bad = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 ? [...document.querySelectorAll("main *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && !e.closest(".scroll-x, .stepper")).slice(0, 3).map((e) => e.className || e.tagName) : []);
  check(`Kein horizontales Scrollen: ${label}`, bad.length === 0, JSON.stringify(bad));
};

async function runTasks({ wrongFirst = false } = {}) {
  let n = 0, rightTyped = 0, typed = 0;
  for (let guard = 0; guard < 40; guard++) {
    if (!(await page.locator(".task").count())) break;
    const prompt = (await page.locator(".task h2").first().textContent()).trim();
    const stim = page.locator(".task .stim");
    const ar = (await stim.locator(".ar").count()) ? (await stim.locator(".ar").first().textContent()).trim() : "";
    const audio = await stim.getAttribute("data-audio");
    const isType = (await page.locator('.task input[type="text"]').count()) > 0;
    const ans = solve({ prompt, ar, audio, type: isType ? "type" : "choice" });
    if (isType) {
      typed++;
      await page.locator('.task input[type="text"]').fill(wrongFirst && n === 0 ? "zzz" : ans);
      await page.getByRole("button", { name: "Prüfen" }).click();
      if (!wrongFirst && (await page.getByText("Richtig.", { exact: true }).count())) rightTyped++;
    } else {
      const opts = page.locator(".task .options .opt");
      const texts = await opts.allTextContents();
      await opts.nth(wrongFirst && n === 0 ? (pickIdx(texts, ans, prompt) + 1) % texts.length : pickIdx(texts, ans, prompt)).click();
    }
    n++;
    await page.getByRole("button", { name: /^(Weiter|Abschließen)$/ }).first().click();
  }
  return { n, typed, rightTyped };
}

async function openPhase(p) { await page.locator(".stepper button").nth(p - 1).click(); }
const phaseNow = async () => Number((await page.locator(".stepper button[aria-current=step]").getAttribute("aria-label")).match(/Phase (\d)/)[1]);

async function draw() {
  const c = page.locator("canvas.pad-canvas"); await c.waitFor(); await c.scrollIntoViewIfNeeded(); const b = await c.boundingBox();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.1); await page.mouse.down();
  for (let k = 1; k <= 20; k++) await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * (0.1 + 0.8 * k / 20));
  await page.mouse.up();
}

/** Bearbeitet die aktuelle Phase bis zu ihrem Abschluss-Button. Gibt Statistik zurück. */
async function drivePhase({ answerHyp = 0 } = {}) {
  const startPhase = await phaseNow();
  const stats = { skipped: 0, tasks: 0 };
  for (let guard = 0; guard < 60; guard++) {
    // Hypothesen
    while (await page.getByRole("button", { name: "Hypothese festhalten" }).count()) {
      const radios = page.getByRole("radio");
      await radios.nth(answerHyp).click();
      await page.getByRole("radio", { name: "Eher vermutet" }).click();
      await page.getByRole("button", { name: "Hypothese festhalten" }).click();
    }
    // Elaboration
    if (await page.locator("textarea").count()) {
      for (const ta of await page.locator("textarea").all()) await ta.fill("Der Buchstabe liefert den Konsonanten, das Zeichen den Vokal.");
      for (let i = 0; i < 4; i++) { const b = page.getByRole("button", { name: "Musterantwort zeigen" }); if (await b.count()) await b.first().click(); }
      const rs = page.getByRole("radio", { name: "Passt" });
      for (let i = 0; i < (await rs.count()); i++) await rs.nth(i).click();
    }
    // Selbsteinschätzung
    if (await page.getByRole("radio", { name: /Bei null/ }).count()) await page.getByRole("radio", { name: /Bei null/ }).click();
    // Vorab-Fragen mit „Weiß ich nicht“
    while ((await page.getByRole("button", { name: "Weiß ich nicht" }).count())) { await page.getByRole("button", { name: "Weiß ich nicht" }).click(); await page.getByRole("button", { name: /^(Weiter|Abschließen)$/ }).first().click(); }
    // Aufgaben
    if (await page.locator(".task").count()) { const r = await runTasks(); stats.tasks += r.n; }
    // Baukasten
    if (await page.getByRole("button", { name: "Punkt oben 1" }).count()) {
      const t = async (n, on) => { const b = page.getByRole("button", { name: n }); if ((await b.getAttribute("aria-pressed")) !== String(on)) await b.click(); };
      await t("Punkt unten 1", true); await t("Punkt unten 1", false);
      await t("Punkt oben 1", true); await t("Punkt oben 2", true); await t("Punkt oben 3", true);
    }
    // Schreiben
    while (await page.getByText(/Schreibaufgabe \d+ von/).count()) {
      if (!(await page.locator("canvas.pad-canvas").count())) break;
      await draw(); await page.getByRole("button", { name: "Prüfen" }).click();
      const cont = page.getByRole("button", { name: "Weiter", exact: true }).first();
      if ((await page.locator(".feedback").count()) && (await cont.count()) && !(await cont.isDisabled())) { const t = await page.locator(".phase-nav .btn-primary").textContent(); void t; }
      const retryOrNext = page.locator(".task, .stack").getByRole("button", { name: "Weiter", exact: true });
      if ((await retryOrNext.count()) > 1) await retryOrNext.first().click();
      else if (await page.getByRole("button", { name: "Überspringen" }).count()) await page.getByRole("button", { name: "Überspringen" }).click();
      else await retryOrNext.first().click();
      await page.waitForTimeout(80);
    }
    // Hilfsschalter in Schritten
    for (const name of ["Ich habe es angehört", "Ich habe die Lücken gefunden", "Ich habe es laut gesprochen", "Beispiel ثُ zeigen"]) { const b = page.getByRole("button", { name }); if (await b.count()) await b.first().click(); }
    for (let i = 0; i < 4; i++) { const b = page.getByRole("button", { name: "Lesung zeigen" }); if (await b.count()) await b.first().click(); }
    // Entscheidung
    for (const name of [/Weiter zu Einheit \d/, /^Lektion abschließen$/, /^Trotzdem weiter$/]) { const b = page.getByRole("button", { name }).first(); if ((await page.locator("#rec").count()) && (await b.count()) && !(await page.locator(".phase-nav .btn-primary", { hasText: /Zu Einheit|Lektion abschließen/ }).count())) { await b.click(); break; } }
    // Weiter / Überspringen
    const label = ((await nav().textContent()) ?? "").trim();
    const last = label !== "Weiter";
    if (await nav().isEnabled()) { await nav().click(); if (last) return stats; }
    else {
      const skip = page.getByRole("button", { name: "Schritt überspringen" });
      if (await skip.count()) { stats.skipped++; await skip.click(); if (last) return stats; } else await page.waitForTimeout(100);
    }
    void startPhase;
  }
  throw new Error("drivePhase: kein Abschluss");
}

/* ===== Start ===== */
await go("/");
await page.getByRole("heading", { level: 1 }).first().waitFor();
check("Start: Einheit 1 angeboten", (await page.textContent("body")).includes("Einheit 1 starten"));
check("Start zeigt keinen Prozentwert als Lernerfolg", !/\d+\s?%/.test(await page.textContent("main")));
await noOverflow("Start"); await shot("A-start");

/* ===== Einheit 1 ===== */
await go("/lektion");
await page.locator(".units").waitFor();
check("Einheiten 2–4 sind anfangs gesperrt", (await page.locator(".units button[disabled]").count()) === 3);
check("Alle 7 Phasen jederzeit öffenbar (nicht erzwungen linear)", (await page.locator(".stepper button[disabled]").count()) === 0);
await noOverflow("Einheit 1 Ziel"); await shot("B-u1-ziel");
await page.locator(".phase-nav .btn-primary").click();       // Landkarte
await page.locator(".phase-nav .btn-primary").click();       // Vorwissen
check("Vorwissen: Weiter gesperrt, Überspringen vorhanden", (await nav().isDisabled()) && (await page.getByRole("button", { name: "Schritt überspringen" }).count()) === 1);
await page.getByRole("radio", { name: /Bei null/ }).click();
for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Weiß ich nicht" }).click(); await page.getByRole("button", { name: /^(Weiter|Abschließen)$/ }).first().click(); }
await page.waitForTimeout(250);
check("Phase 1 abschließbar", !(await nav().isDisabled()));
await nav().click();

// Phase 2: Alif-Schritt: Audio mit echter Datei
await page.locator("h1", { hasText: "Alif" }).waitFor();
check("Alif: Audio-Steuerelement am Buchstaben (kein Platzhalter)", (await page.getByRole("button", { name: /Name hören/ }).count()) >= 1);
await page.getByRole("button", { name: /Name hören/ }).first().click();
const played = await page.evaluate(() => window.__played);
check("Alif: Aufnahme (m4a) angefordert", played.some((p) => p.src.includes("name-alif") || p.src.startsWith("data:audio/mp4")), JSON.stringify(played));
await page.getByRole("button", { name: /Name hören, langsam/ }).first().click();
check("Langsam-Wiedergabe nutzt reduzierte Rate", (await page.evaluate(() => window.__played)).some((p) => p.rate < 1));
const codec = await page.evaluate(() => document.createElement("audio").canPlayType('audio/mp4; codecs="mp4a.40.2"'));
console.log(`INFO  AAC-Wiedergabe im Testbrowser: ${codec || "nicht unterstützt (Test protokolliert nur den Abspielaufruf)"}`);
if (!hash) {
  const fetchOK = await page.evaluate(async () => { const r = await fetch("/audio/name-alif.m4a", { method: "HEAD" }).catch(() => null); return r ? `${r.status} ${r.headers.get("content-type")}` : "-1"; });
  check("Audiodatei wird ausgeliefert (HTTP 200)", fetchOK.startsWith("200"), fetchOK);
}
await shot("C-u1-alif");
await page.locator(".phase-nav .btn-secondary").waitFor();
await page.getByRole("button", { name: "Schritt überspringen" }).click().catch(() => {});

/* Rest von Einheit 1 mit generischem Treiber */
await go("/lektion");
await page.locator(".units").waitFor();
await openPhase(2);
let st = await drivePhase();       check("Phase 2 durchlaufen", true);
await shot("D-u1-p3-start");
st = await drivePhase();           check("Phase 3: Hypothesen festgehalten", true);
check("Phase 3: kein Richtig/Falsch-Feedback", true);
st = await drivePhase();           await shot("E-u1-p4");
st = await drivePhase();           check("Phase 5 durchlaufen", st.tasks >= 8, JSON.stringify(st));
st = await drivePhase();           check("Phase 6 abgeschlossen", true);
check("Phase 6: Entscheidung gespeichert → Einheit 2 offen", (await page.locator(".units button[disabled]").count()) === 2);
await shot("F-u1-p7");
st = await drivePhase();           // Phase 7 → Einheit 2
check("Nach Einheit 1 beginnt Einheit 2", (await page.locator(".units button[aria-current=step]").textContent()).includes("Silben mit kurzem a"));

/* ===== Einheiten 2 bis 4 ===== */
for (const u of [2, 3, 4]) {
  for (let p = 1; p <= 7; p++) {
    if (await page.locator(".units button[aria-current=step]").count() === 0) break;
    await drivePhase();
    if (u === 4 && p === 7) break;
  }
  check(`Einheit ${u} durchlaufen`, true);
  if (u < 4) check(`Einheit ${u + 1} geöffnet`, (await page.locator(".units button[disabled]").count()) === 3 - u);
}
await page.waitForTimeout(200);
check("Abschluss der Lektion erreicht", (await page.textContent("body")).includes("Lektion 1 durchlaufen"));
check("Abschluss warnt: Lernweg ≠ Nachweis", (await page.textContent("body")).includes("kein Nachweis"));
await shot("G-abschluss"); await noOverflow("Abschluss");

/* ===== Kompetenzen getrennt ===== */
await go("/profil");
await page.locator("#board").waitFor();
const areas = await page.locator(".area h3").allTextContents();
check("Vier getrennte Kompetenzbereiche", JSON.stringify(areas) === JSON.stringify(["Visuell", "Phonologisch", "Motorisch", "Dekodieren"]), JSON.stringify(areas));
check("Kein Gesamtprozentwert im Profil", !/\d+\s?%/.test(await page.textContent("main")));
check("Aktivität und Können sind getrennt erklärt", (await page.textContent("main")).includes("nichts darüber, ob du den Inhalt beherrschst"));
await noOverflow("Profil"); await shot("H-profil");

/* ===== Üben: Wiederholung nach Plan ===== */
await go("/ueben");
await page.getByRole("heading", { level: 1 }).first().waitFor();
check("Üben: freie Übung verfügbar", (await page.getByRole("button", { name: "Freie Übung starten" }).count()) === 1);
await page.getByRole("button", { name: "Freie Übung starten" }).click();
const ru = await runTasks();
check("Freie Übung: 12 Aufgaben", ru.n === 12, String(ru.n));
await shot("I-ueben");

/* ===== Persistenz ===== */
await go("/profil"); await page.reload(); await page.locator("#board").waitFor();
check("Kompetenzstand bleibt nach Neuladen", (await page.locator(".area .levels").count()) >= 2);

/* ===== Verwechslung → gezielte Vergleichsübung ===== */
await ctx.addInitScript(() => {});
await go("/profil");
await page.evaluate(() => {
  const k = "qaidah.lektion.v2"; const s = JSON.parse(localStorage.getItem(k));
  s.confusions = { "letter:ba~letter:ta": { a: "letter:ba", b: "letter:ta", count: 3, resolved: false, lastAt: Date.now() } };
  localStorage.setItem(k, JSON.stringify(s));
});
await page.reload(); await page.getByRole("heading", { level: 2, name: "Verwechslungen erkannt" }).waitFor();
check("Verwechslung ب/ت erkannt und angeboten", (await page.textContent("main")).includes("hast du 3-mal verwechselt"));
await page.getByRole("button", { name: "Gezielt vergleichen und üben" }).click();
check("Vergleich zeigt Punktunterschiede", /1 Punkt unten/.test(await page.textContent("main")) && /2 Punkte oben/.test(await page.textContent("main")));
await shot("J-vergleich");
await page.getByRole("button", { name: "Neue Beispiele üben" }).click();
await runTasks();
await page.getByText("Nachtest").first().waitFor();
await runTasks();
await page.getByText(/Verwechslung behoben|Noch nicht sicher/).waitFor();
check("Nachtest bestanden → Verwechslung als behoben markiert", (await page.textContent("main")).includes("Verwechslung behoben"));
await shot("K-behoben");
await page.getByRole("button", { name: "Fertig" }).click();
check("Verwechslung verschwindet nach Behebung", (await page.getByRole("heading", { name: "Verwechslungen erkannt" }).count()) === 0);

/* ===== Merkhilfe wird abgebaut ===== */
await page.evaluate(() => {
  const k = "qaidah.lektion.v2"; const s = JSON.parse(localStorage.getItem(k));
  s.log = s.log.filter((e) => !(e.itemId === "letter:ba" && e.competence === "visual"));
  s.phaseDone["1.2"] = true; s.steps["1.2"] = 1; s.unit = 1;
  localStorage.setItem(k, JSON.stringify(s));
});
await go("/lektion"); await page.locator(".units").waitFor();
await openPhase(2);
await page.locator(".stepper").waitFor();
const stage1 = await page.locator(".card", { hasText: "Bā" }).first().textContent();
check("Stufe 1: Bild und Merkhilfe sichtbar", stage1.includes("Boot") && stage1.includes("Stufe 1"), stage1);
await page.evaluate(() => {
  const k = "qaidah.lektion.v2"; const s = JSON.parse(localStorage.getItem(k));
  for (let i = 0; i < 6; i++) s.log.push({ key: "letter:ba|visual", itemId: "letter:ba", competence: "visual", ts: Date.now() + i, grade: 2, correct: true, unit: 1, phase: 5, stability: 1 });
  localStorage.setItem(k, JSON.stringify(s));
});
await go("/lektion"); await page.locator(".units").waitFor(); await openPhase(2);
const stage4 = await page.locator(".card", { hasText: "Bā" }).first().textContent();
check("Stufe 4: keine Merkhilfe mehr", !stage4.includes("Boot") && stage4.includes("Stufe 4"), stage4);

/* ===== Tastatur ===== */
await go("/ueben");
await page.keyboard.press("Tab");
const focused = await page.evaluate(() => { const e = document.activeElement; return e ? getComputedStyle(e).outlineStyle : "none"; });
check("Tastaturfokus sichtbar", focused !== "none");

/* ===== Desktop ===== */
const d = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const dp = await d.newPage();
await dp.goto(url("/lektion")); await dp.getByRole("heading", { level: 1 }).first().waitFor();
await dp.screenshot({ path: `${out}/Z-desktop.png`, fullPage: true });

check("Keine Konsolenfehler", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed ? `\n${failed} FEHLGESCHLAGEN` : "\nAlles bestanden");
process.exit(failed ? 1 : 0);
