// E2E für „Quran lesen“ (Live-Korrektur). Ersetzt NUR die Browser-API SpeechRecognition durch ein Test-Double,
// damit der echte App-Code (Tracker, Ausrichtung, UI) mit vorgegebenen Erkennungsergebnissen getrieben werden kann.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:3100";
const SHOTS = process.argv[3] ?? null;
const shot = async (page, n) => SHOTS && page.screenshot({ path: `${SHOTS}/${n}.png` });
const ok = (c, m) => { if (!c) throw new Error("FAIL: " + m); console.log("✓", m); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  class FakeSR {
    constructor() { window.__sr = this; this.starts = 0; }
    start() { this.starts++; setTimeout(() => this.onstart && this.onstart(), 10); }
    stop() { setTimeout(() => this.onend && this.onend(), 10); }
    abort() { this.stop(); }
  }
  window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
  // results: Array of {alts:[{t,c}], final}
  window.__say = (results) => {
    const list = results.map((r) => Object.assign(r.alts.map((a) => ({ transcript: a.t, confidence: a.c ?? 0 })), { isFinal: !!r.final }));
    window.__sr.onresult({ results: list });
  };
});
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(BASE + "/onboarding");
await page.getByTestId("skip-test").click(); await page.getByTestId("level-next").click(); await page.getByTestId("finish").click();
await page.goto(BASE + "/lesen");
await shot(page, "30-lesen-picker");
await page.getByTestId("open-burooj").click();
await page.getByTestId("mushaf").waitFor();
await shot(page, "31-mushaf");
ok(await page.locator('[data-testid="mushaf"] [data-state]').count() === 109, "109 Wörter der Sure 85 auf der Seite");
ok((await page.locator('[data-testid="mushaf"]').innerText()).includes("۝"), "Ayah-Endmarken sichtbar");

await page.getByTestId("reader-mic").click();
await page.getByTestId("live-consent-ok").click();
await page.waitForFunction(() => window.__sr && window.__sr.starts > 0);
ok((await page.getByTestId("reader-status").innerText()).includes("höre"), "Mikrofon aktiv, Status „Ich höre zu“");

const state = (j) => page.locator(`[data-w="${j}"]`).getAttribute("data-state");
// Basmala = 4 optionale Wörter → Ayah 1 beginnt bei Index 4
await page.evaluate(() => window.__say([{ alts: [{ t: "والسماء ذات", c: 0 }] }]));
await page.waitForTimeout(100);
ok((await state(4)) === "ok" && (await state(5)) === "ok", "langsam gelesen: erste Wörter sofort ok (unmarkiert)");
ok((await state(6)) === "pending", "ungelesene Wörter bleiben neutral");

// falsches 3. Wort, aber Nutzer ist noch dabei (letztes Token, Zwischenergebnis) → nicht vorschnell rot
await page.evaluate(() => window.__say([{ alts: [{ t: "والسماء ذات النجوم", c: 0 }] }]));
await page.waitForTimeout(100);
ok((await state(6)) !== "wrong", "noch nicht rot, solange das Wort das letzte Token ist");
// Nutzer liest weiter → Wort ist abgeschlossen → jetzt rot, während des Lesens
await page.evaluate(() => window.__say([{ alts: [{ t: "والسماء ذات النجوم واليوم", c: 0 }] }]));
await page.waitForTimeout(100);
ok((await state(6)) === "wrong", "falsch gelesenes Wort wird sofort (ohne Ende der Aya) rot");
await shot(page, "32-wrong-live");
const wrongStyle = await page.locator('[data-w="6"]').evaluate((el) => getComputedStyle(el).color);
ok(wrongStyle.startsWith("rgb(211, 47, 47)"), "Markierung ist rot (" + wrongStyle + ")");
ok((await state(4)) === "ok" && (await state(5)) === "ok", "richtige Wörter bleiben unmarkiert");

// Auslassung in Ayah 2: „واليوم [الموعود fehlt]“ → mit zwei späteren sicheren Wörtern ausgelassen
await page.evaluate(() => window.__say([{ alts: [{ t: "والسماء ذات النجوم", c: 0.8 }], final: true }, { alts: [{ t: "واليوم وشاهد ومشهود", c: 0.9 }], final: true }]));
await page.waitForTimeout(100);
ok((await state(8)) === "skipped", "ausgelassenes Wort („الموعود“) erkannt");
await shot(page, "33-skipped");

// unsicher: falsches Wort, aber niedrige Erkennungssicherheit des Ergebnisses → NICHT rot
await page.evaluate(() => window.__say([
  { alts: [{ t: "والسماء ذات النجوم", c: 0.8 }], final: true },
  { alts: [{ t: "واليوم وشاهد ومشهود", c: 0.9 }], final: true },
  { alts: [{ t: "قتل اصحاب الجنة", c: 0.15 }], final: true },
  { alts: [{ t: "النار ذات الوقود", c: 0.9 }], final: true },
]));
await page.waitForTimeout(100);
ok((await state(13)) === "uncertain", "falsches Wort bei niedriger Erkennungssicherheit bleibt unmarkiert (unsicher)");
ok((await state(6)) === "wrong", "früher sicher erkanntes falsches Wort bleibt rot");

// Wort antippen → Sheet mit Erkannt/Erwartet
await page.locator('[data-w="6"]').click();
await page.getByTestId("word-sheet").waitFor();
const sheetText = await page.getByTestId("word-sheet").innerText();
ok(/Erkannt wurde/.test(sheetText), "Wort-Details nennen, was erkannt wurde");
await shot(page, "34-word-sheet");
await page.getByRole("button", { name: "Schließen" }).click();

await page.getByTestId("reader-mic").click(); // stoppen
await page.getByTestId("reader-summary").waitFor();
await shot(page, "35-summary");
const wrong = Number(await page.getByTestId("sum-wrong").innerText());
ok(wrong >= 1, `Zusammenfassung zählt ${wrong} falsche(s) Wort/Wörter`);

// falsche Wörter üben → Lektion „Unsichere Stellen“ enthält das Wort
await page.getByTestId("practice-wrong").click();
await page.getByTestId("start").click();
await page.getByTestId("arabic-card").waitFor();
ok((await page.getByTestId("arabic-card").innerText()).length > 0, "Übung mit dem falsch gelesenen Wort startet");
await shot(page, "36-practice");

// Browser ohne Spracherkennung → klare Fehlermeldung statt Fake
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx2.addInitScript(() => { for (const k of ["SpeechRecognition", "webkitSpeechRecognition"]) Object.defineProperty(window, k, { value: undefined, configurable: true }); });
const p2 = await ctx2.newPage();
await p2.goto(BASE + "/onboarding"); await p2.getByTestId("skip-test").click(); await p2.getByTestId("level-next").click(); await p2.getByTestId("finish").click();
await p2.goto(BASE + "/lesen/85");
await p2.getByTestId("reader-mic").click();
await p2.getByTestId("reader-error").waitFor();
ok((await p2.getByTestId("reader-error").innerText()).includes("unterstützt"), "ohne Web Speech API: ehrliche Fehlermeldung");

ok(errors.length === 0, "keine Seitenfehler" + (errors.length ? ": " + errors.join(" | ") : ""));
await browser.close();
