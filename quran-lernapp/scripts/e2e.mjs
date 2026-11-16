// E2E: spielt die gesamte App (Onboarding → alle Lektionen → Fortschritt) mit Fake-Mikrofon durch.
// Nutzung: npm run build && npm start -- -p 3100 &  node scripts/e2e.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:3100";
const SHOTS = process.argv[3] ?? null;
const shot = async (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` });

const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: ["microphone"] });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => m.type() === "error" && errors.push("console: " + m.text()));

const ok = (c, msg) => { if (!c) throw new Error("FAIL: " + msg); console.log("✓", msg); };

// 1. Onboarding
await page.goto(BASE + "/");
await page.waitForURL("**/onboarding");
await shot(page, "01-welcome");
await page.getByTestId("to-test").click();
for (let i = 0; i < 5; i++) {
  await page.getByTestId("q-opt-1").click(); // egal ob richtig
  await shot(page, `02-test-${i}`);
  await page.getByTestId("q-next").click();
}
await shot(page, "03-level");
await page.getByTestId("level-beginner").click();
await page.getByTestId("level-next").click();
await page.getByTestId("finish").click();
await page.waitForURL(BASE + "/");
await page.getByTestId("continue").waitFor();
ok(true, "Onboarding abgeschlossen, Dashboard sichtbar");
await shot(page, "04-dashboard");

// 2. Alle Lektionen durchspielen
await page.goto(BASE + "/pfad");
await shot(page, "05-pfad");
const ids = await page.$$eval('[data-testid^="lesson-"]', (els) => els.map((e) => e.getAttribute("data-testid").replace("lesson-", "")));
ok(ids.length >= 25, `Lernpfad zeigt ${ids.length} Lektionen`);

let retries = 0, chooseWrong = 0, shotsTaken = 0;
let checksPassed = 0, checksLater = 0, noSignal = 0;
async function answerQuizQuestion() {
  if (await page.getByTestId("qopt-0").isVisible().catch(() => false)) await page.getByTestId("qopt-0").click();
  else if (await page.getByTestId("cl-0").isVisible().catch(() => false)) { await page.getByTestId("cl-0").click(); await page.getByTestId("q-check").click(); }
  else if (await page.getByTestId("piece-0").isVisible().catch(() => false)) {
    const n = await page.locator('[data-testid^="piece-"]').count();
    for (let i = 0; i < n; i++) await page.getByTestId(`piece-${i}`).click();
    await page.getByTestId("q-check").click();
  } else { await page.waitForTimeout(100); return false; }
  await page.getByTestId("q-feedback").waitFor();
  await page.getByTestId("q-next").click();
  return true;
}
async function runCheck(id) {
  await page.getByTestId("check-start").click();
  let g = 0;
  while (!(await page.getByTestId("check-result").isVisible().catch(() => false))) {
    if (++g > 40) throw new Error("Check hängt in " + id);
    await answerQuizQuestion();
  }
  if (id === "A1") await shot(page, "10b-check-result");
  if (await page.getByTestId("check-continue").isVisible().catch(() => false)) { checksPassed++; await page.getByTestId("check-continue").click(); }
  else { checksLater++; await page.getByTestId("check-later").click(); }
}
async function playGame(kind) {
  await page.goto(`${BASE}/spiele/${kind}`);
  if (kind === "memory") {
    await page.getByTestId("memory-grid").waitFor();
    const keys = await page.$$eval('[data-testid^="card-"]', (els) => els.map((e) => e.getAttribute("data-key")));
    const seen = new Set();
    for (let pass = 0; pass < 2; pass++) for (const k of [...new Set(keys)]) {
      const idx = keys.map((x, i) => (x === k ? i : -1)).filter((i) => i >= 0);
      if (idx.length === 2) { await page.getByTestId(`card-${idx[0]}`).click(); await page.getByTestId(`card-${idx[1]}`).click(); }
    }
    await page.getByTestId("memory-won").waitFor();
    await shot(page, "20-memory-won");
    return;
  }
  await page.waitForTimeout(400);
  if (await page.getByText("Dafür fehlen noch passende Inhalte").isVisible().catch(() => false)) { console.log("  (leerer Zustand, zu wenig Inhalt – erwartet bei Teil-Durchlauf)"); await shot(page, `21-game-${kind}-leer`); return; }
  let g = 0;
  while (!(await page.getByTestId("game-result").isVisible().catch(() => false))) {
    if (++g > 40) throw new Error("Spiel hängt: " + kind);
    await answerQuizQuestion();
  }
  await shot(page, `21-game-${kind}`);
}
async function play(id, flag = false) {
  await page.goto(`${BASE}/lektion/${id}`);
  await page.getByTestId("start").click();
  let guard = 0;
  while (!(await page.getByTestId("done").isVisible().catch(() => false))) {
    if (++guard > 120) throw new Error("Endlosschleife in " + id);
    if (await page.getByTestId("check-intro").isVisible().catch(() => false)) { await runCheck(id); continue; }
    if (flag && (await page.getByTestId("flag").isVisible().catch(() => false))) { await page.getByTestId("flag").click(); flag = false; }
    const mic = page.getByTestId("mic");
    if (await mic.isVisible().catch(() => false)) {
      await mic.click();
      const allow = page.getByRole("button", { name: "Mikrofon erlauben" });
      if (await allow.isVisible().catch(() => false)) { if (id === "A1") await shot(page, "06-consent"); await allow.click(); }
      await page.waitForTimeout(1300);
      if (id === "A1" && shotsTaken === 0) { await shot(page, "07-recording"); shotsTaken++; }
      await page.getByRole("button", { name: "Aufnahme beenden" }).click();
      await page.getByTestId("result").waitFor();
      const next = page.getByTestId("next");
      if (await next.isVisible().catch(() => false)) {
        if (id === "A1" && shotsTaken === 1) { await shot(page, "08-result-pass"); shotsTaken++; }
        await next.click();
      } else if (await page.getByTestId("retry").isVisible().catch(() => false)) {
        retries++;
        if (id === "C1" && shotsTaken < 4) { await shot(page, "09-result-retry"); shotsTaken = 4; }
        await page.getByTestId("retry").click();
      } else {
        // „Ich habe fast nichts gehört“ (Fake-Mikrofon piept nur sekündlich) → ehrliche Rückmeldung, nochmal aufnehmen
        noSignal++;
        await page.getByRole("button", { name: "Nochmal aufnehmen" }).click();
      }
    } else if (await page.getByTestId("opt-0").isVisible().catch(() => false)) {
      for (let i = 0; i < 3; i++) {
        await page.getByTestId(`opt-${i}`).click();
        if (await page.getByTestId("next").isVisible().catch(() => false)) { await page.getByTestId("next").click(); break; }
        chooseWrong++;
        await page.getByRole("button", { name: "Nochmal versuchen" }).click();
      }
    } else await page.waitForTimeout(100);
  }
  console.log("  lesson", id, "done", new Date().toISOString().slice(11, 19));
  if (id === "A1" || id === "personal" || id === "transfer") await shot(page, `10-done-${id}`);
}
const LIMIT = Number(process.env.LESSONS ?? ids.length);
for (const id of ids.slice(0, LIMIT)) {
  await play(id, id === "A2");
  if (id === "A2") {
    await page.goto(BASE + "/"); await page.getByTestId("personal-card").waitFor(); await shot(page, "11-home-personal");
    await page.goto(BASE + "/training"); await page.getByTestId("history").waitFor(); await shot(page, "12-training");
  }
  if (id === "A4") { await play("personal"); ok(true, "persönliche Übung (adaptiv) durchgespielt"); }
}
ok(true, `Verständnis-Checks: ${checksPassed} bestanden, ${checksLater} später fortgesetzt`);
for (const k of ["memory", "quiz", "detektiv", "bauen"]) { await playGame(k); ok(true, `Spiel „${k}“ durchgespielt`); }
await page.goto(BASE + "/pfad"); await shot(page, "22-pfad-checks");
ok(true, `${Math.min(LIMIT, ids.length)} Lektionen durchgespielt (Wiederholungen: ${retries}, „nichts gehört“: ${noSignal}, falsche Choose-Antworten: ${chooseWrong})`);
if (LIMIT >= ids.length) {
  await play("flagged"); ok(true, "Unsichere Stellen (Markierung) geübt");
  await play("transfer"); ok(true, "Unbekannte Wörter (Transfer) gelesen");
}

// 3. Fortschritt persistiert
await page.goto(BASE + "/");
await page.getByTestId("missions").waitFor();
await shot(page, "13-home");
await page.reload();
await page.getByTestId("missions").waitFor();
ok(true, "Fortschritt nach Reload vorhanden");
await page.goto(BASE + "/erfolge");
await page.getByTestId("badges").waitFor();
await shot(page, "14-erfolge");
await page.goto(BASE + "/profil");
await page.getByRole("heading", { name: "Lernstand" }).waitFor();
await shot(page, "14b-profil");
await page.goto(BASE + "/training");
await page.getByTestId("history").waitFor();
await shot(page, "14c-training");
await page.goto(BASE + "/woerter");
await page.getByText("Wortdatenbank").first().waitFor();
await page.locator("button[aria-expanded]").first().click();
await shot(page, "15-woerter");

const real = errors.filter((e) => !/favicon/.test(e));
ok(real.length === 0, "keine Konsolenfehler" + (real.length ? ": " + real.join(" | ") : ""));
await browser.close();
