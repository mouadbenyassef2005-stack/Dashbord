// E2E gegen `vite preview`. Nutzung: node scripts/e2e.mjs http://localhost:4173 ./screenshots
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });

let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(base + "/#/");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Heute zeigt Einstieg für Neulinge", (await page.textContent("h1")).includes("ersten Buchstaben"));
await page.screenshot({ path: `${out}/01-heute-mobil.png` });

// Specimen: Schrift/Formen
await page.goto(base + "/#/specimen");
await page.getByTestId("forms").waitFor();
const rows = await page.locator('[data-testid="forms"] tbody tr').count();
check("Specimen: 28 Buchstabenzeilen", rows === 28, String(rows));
const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check("40px 'Scheherazade New'", "بَ"); });
check("Scheherazade New geladen", fontsOk);
const rtl = await page.evaluate(() => { const a = document.querySelector("[lang=ar]"); return getComputedStyle(a).direction; });
check("Arabische Elemente sind RTL", rtl === "rtl");
await page.screenshot({ path: `${out}/02-specimen-mobil.png`, fullPage: true });

// Kontextformen müssen sich tatsächlich unterscheiden (Regression: erzwungene init/medi/fina-Features)
const widths = await page.evaluate(() => {
  const row = document.querySelectorAll('[data-testid="forms"] tbody tr')[1]; // Bā
  return [...row.querySelectorAll("td [lang=ar]")].map((el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width * 10) / 10; });
});
check("Bā: Anfangsform schmaler als Einzelform, Mittelform schmaler als Endform", widths[1] < widths[0] && widths[2] < widths[3], JSON.stringify(widths));
const alifW = await page.evaluate(() => { const c = document.querySelectorAll('[data-testid="forms"] tbody tr')[0].querySelectorAll("td [lang=ar]"); return [...c].map((el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width * 10) / 10; }); });
check("Alif (Nicht-Verbinder): Einzel = Anfang, Mitte = Ende, Endform mit Anbindung breiter", alifW[0] === alifW[1] && alifW[2] === alifW[3] && alifW[3] > alifW[0], JSON.stringify(alifW));

// Übungsseite ohne Lernstand
await page.goto(base + "/#/ueben");
check("Üben ohne Stand: Leerzustand", await page.getByText("Noch nichts zu üben").isVisible());

// Alif → Ba → Ta → Tha einführen
for (const id of ["alif", "ba", "ta", "tha"]) {
  await page.goto(`${base}/#/buchstaben/${id}`);
  if (id === "alif") {
    await page.getByRole("button", { name: "Name hören" }).click();
    check("Audio fehlt → ehrlicher Hinweis statt Fake-Wiedergabe", await page.getByText("Aufnahme noch nicht verfügbar").first().isVisible());
    await page.screenshot({ path: `${out}/03-buchstabe-mobil.png`, fullPage: true });
  }
  await page.getByRole("button", { name: /Kennengelernt/ }).click();
  await page.waitForURL(/ueben/);
}

// Sitzung: bewusst eine falsche Antwort, danach richtig; jede Aufgabe bis zum Ende
await page.goto(base + "/#/ueben");
let answered = 0, sawWrong = false, guard = 0;
while (!(await page.getByRole("heading", { name: "Geschafft." }).isVisible()) && guard++ < 60) {
  await page.locator(".opt").first().waitFor();
  const opts = page.locator(".opt");
  if (answered === 0) { // erste Aufgabe: Fehler provozieren (zuerst alle Optionen prüfen, die falsche wählen)
    await page.screenshot({ path: `${out}/04-aufgabe-mobil.png` });
  }
  // richtige Option finden: nach Klick zeigt data-state=right; bei erster Aufgabe klicken wir bewusst die erste Option
  await opts.first().click();
  const wrong = await page.locator('.opt[data-state="wrong"]').count();
  if (wrong && !sawWrong) { sawWrong = true; await page.screenshot({ path: `${out}/05-falsch-mobil.png` }); }
  if (wrong) check("Falsch: Erklärung + Hinweis auf Wiederholung", await page.getByText("am Ende noch einmal").isVisible());
  await page.getByRole("button", { name: "Weiter" }).click();
  answered++;
}
check("Sitzung endet mit Zusammenfassung", await page.getByRole("heading", { name: "Geschafft." }).isVisible(), `Aufgaben: ${answered}`);
check("Mindestens eine falsche Antwort wurde erlebt und wiederholt", sawWrong);
await page.screenshot({ path: `${out}/06-fertig-mobil.png` });

// Persistenz: nach Reload ist der Stand da
const countEvents = () => page.evaluate(() => new Promise((res) => {
  const r = indexedDB.open("qaidah"); r.onsuccess = () => { const g = r.result.transaction("events").objectStore("events").count(); g.onsuccess = () => res(g.result); };
}));
const n1 = await countEvents();
check("Ereignisse in IndexedDB gespeichert", n1 >= answered, String(n1));
await page.reload();
await page.goto(base + "/#/buchstaben/ba");
await page.getByRole("heading", { level: 2, name: "Dein Stand" }).waitFor();
check("Nach Reload: Buchstabe bleibt als gelernt (Button 'Üben')", await page.getByRole("link", { name: "Üben", exact: true }).first().isVisible());
check("Kein Buchstabe nach einer Sitzung 'Gemeistert'", (await page.getByText("Gemeistert").count()) === 0);

// Export / Import / Reset
await page.goto(base + "/#/ich");
const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Sicherung laden" }).click()]);
check("Export liefert Datei", dl.suggestedFilename().startsWith("qaidah-sicherung"));
await page.getByRole("button", { name: /Lernstand löschen/ }).click();
await page.getByRole("button", { name: "Ja, löschen" }).click();
check("Reset leert Ereignisse", (await countEvents()) === 0);
await page.locator('input[type=file]').setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{kaputt") });
check("Import ungültiger Datei zeigt Fehler", await page.getByText("kein gültiges JSON").isVisible());
const path = await dl.path();
await page.locator('input[type=file]').setInputFiles(path);
await page.getByText(/Einträge übernommen/).waitFor();
check("Import der Sicherung stellt Ereignisse wieder her", (await countEvents()) === n1);

// Hellmodus + Desktop
await page.getByRole("radio", { name: "Hell" }).click();
check("Hellmodus gesetzt", (await page.evaluate(() => document.documentElement.dataset.theme)) === "light");
const desk = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await desk.goto(base + "/#/buchstaben/ba"); await desk.getByRole("heading", { level: 2, name: "Dein Stand" }).waitFor();
await desk.screenshot({ path: `${out}/07-buchstabe-desktop-dunkel.png` });
const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check("Kein horizontaler Scroll auf 390px", !horizontal);
check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));

await browser.close();
process.exit(failed ? 1 : 0);
