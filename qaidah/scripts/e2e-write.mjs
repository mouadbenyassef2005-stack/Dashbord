// E2E Schreiben: zeichnet mit echten Mausereignissen auf die Zeichenfläche.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (n, c, x = "") => { console.log(`${c ? "PASS" : "FAIL"}  ${n} ${c ? "" : x}`); if (!c) failed++; };

const B = [[94,38],[90,54],[78,64],[60,68],[40,68],[22,64],[10,52],[6,44]]; // Bā-Körper rechts→links
const ALIF = [[51,6],[50,50],[49,94]];
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
const errors = []; page.on("pageerror", (e) => errors.push(String(e))); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

async function draw(pts, { jitter = 0 } = {}) {
  const box = await page.locator("canvas.pad-canvas").boundingBox();
  const m = (p) => [box.x + box.width * (0.12 + 0.76 * (p[0] + jitter * Math.sin(p[1])) / 100), box.y + box.height * (0.12 + 0.76 * p[1] / 100)];
  const [x0, y0] = m(pts[0]); await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i < pts.length; i++) { const [a, b] = m(pts[i - 1]), [c, d] = m(pts[i]); for (let s = 1; s <= 6; s++) await page.mouse.move(a + (c - a) * s / 6, b + (d - b) * s / 6); }
  await page.mouse.up();
}
const dot = async (x, y) => { const box = await page.locator("canvas.pad-canvas").boundingBox();
  const px = box.x + box.width * (0.12 + 0.76 * x / 100), py = box.y + box.height * (0.12 + 0.76 * y / 100);
  await page.mouse.move(px, py); await page.mouse.down(); await page.mouse.move(px + 2, py + 2); await page.mouse.up(); };
const events = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open("qaidah"); r.onsuccess = () => { const g = r.result.transaction("events").objectStore("events").getAll(); g.onsuccess = () => res(g.result); }; }));

await page.goto(base + "/#/schreiben");
await page.getByText("Noch nichts zu schreiben").waitFor();
check("Ohne gelernte Buchstaben: Leerzustand", true);
for (const id of ["alif", "ba", "ta"]) { await page.goto(`${base}/#/buchstaben/${id}`); await page.getByRole("button", { name: /Kennengelernt/ }).click(); await page.waitForURL(/ueben/); }

await page.goto(base + "/#/schreiben");
await page.locator("canvas.pad-canvas").waitFor();
check("Alif: Nachzeichnen-Modus", await page.getByText("Nachzeichnen", { exact: true }).isVisible());
check("Prüfen ist ohne Striche deaktiviert", await page.getByRole("button", { name: "Prüfen" }).isDisabled());
await page.screenshot({ path: `${out}/10-schreiben-alif.png` });

// zu klein
await draw([[50, 50], [52, 54]]); await page.getByRole("button", { name: "Prüfen" }).click();
check("Zu kleine Eingabe: Hinweis, keine Wertung", await page.getByText("Zu klein.").isVisible());
const e0 = (await events()).filter((e) => e.skill === "writing").length;
check("Zu kleine Eingabe wird nicht protokolliert", e0 === 0, String(e0));
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Alif richtig
await draw(ALIF); await page.getByRole("button", { name: "Prüfen" }).click();
check("Alif richtig: 'Gut geschrieben.'", await page.getByText("Gut geschrieben.").isVisible());
check("Alif: Richtung richtig angezeigt", await page.getByText("Richtung: richtig").isVisible());
await page.screenshot({ path: `${out}/11-schreiben-gut.png` });
await page.getByRole("button", { name: "Weiter" }).click();

// Bā rückwärts (links→rechts) + Punkt unten
await draw([...B].reverse()); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā rückwärts: Richtung umgekehrt gemeldet", await page.getByText("Richtung: umgekehrt").isVisible());
check("Bā rückwärts: nicht 'Gut geschrieben'", !(await page.getByText("Gut geschrieben.").isVisible()));
await page.screenshot({ path: `${out}/12-schreiben-richtung.png` });
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Bā ohne Punkt
await draw(B); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā ohne Punkt: Punkte fehlen", await page.getByText(/Punkte: erwartet 1, erkannt 0/).isVisible());
await page.getByRole("button", { name: "Nochmal versuchen" }).click();

// Bā richtig
await draw(B, { jitter: 0.6 }); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Bā richtig mit Punkt: 'Gut geschrieben.'", await page.getByText("Gut geschrieben.").isVisible());
await page.getByRole("button", { name: "Weiter" }).click();

// Tā mit einem Punkt (falsch) → Punkte-Hinweis
await draw(B); await dot(50, 22); await page.getByRole("button", { name: "Prüfen" }).click();
check("Tā mit nur 1 Punkt: erwartet 2", await page.getByText(/erwartet 2, erkannt 1/).isVisible());
await page.getByRole("button", { name: "Überspringen" }).isVisible().catch(() => {});
await page.getByRole("button", { name: "Nochmal versuchen" }).click();
await draw(B); await dot(38, 24); await dot(62, 24); await page.getByRole("button", { name: "Prüfen" }).click();
check("Tā richtig", await page.getByText("Gut geschrieben.").isVisible());
await page.getByRole("button", { name: "Weiter" }).click();
check("Ende: Zusammenfassung", await page.getByRole("heading", { name: "Geschafft." }).isVisible());

const ev = (await events()).filter((e) => e.skill === "writing");
check("Schreib-Ereignisse protokolliert (activity trace, evidence recognition)", ev.length >= 6 && ev.every((e) => e.activity === "trace" && e.evidence === "recognition"), JSON.stringify(ev.map((e) => [e.letterId, e.grade])));
check("Falsche Versuche haben Note 0 bzw. ≤1", ev.some((e) => e.grade === 0) && ev.some((e) => e.grade === 2));

// Freier Modus: Erfolg im Nachzeichnen genügt nicht → Seed eines freien Erfolgs für ba, dann Plan
await page.evaluate(() => new Promise((res) => { const r = indexedDB.open("qaidah"); r.onsuccess = () => { const tx = r.result.transaction("events", "readwrite");
  tx.objectStore("events").put({ id: "seed-free", ts: Date.now(), letterId: "ba", skill: "writing", activity: "free", grade: 2, evidence: "production" }); tx.oncomplete = res; }; }));
await page.goto(base + "/#/"); await page.reload(); await page.goto(base + "/#/schreiben");
await page.getByText("Nachzeichnen", { exact: true }).waitFor(); // Alif noch ohne freien Erfolg
await page.getByRole("button", { name: "Überspringen" }).click();
check("Bā mit freiem Erfolg → Modus 'Frei schreiben'", await page.getByText("Frei schreiben", { exact: true }).isVisible());
check("Frei: Vorlage ist zunächst verborgen (Button 'Vorlage zeigen')", await page.getByRole("button", { name: /Vorlage zeigen/ }).isVisible());
await draw(B); await dot(50, 86); await page.getByRole("button", { name: "Prüfen" }).click();
check("Frei: Bā erkannt", await page.getByText("Gut geschrieben.").isVisible());
const free = (await events()).filter((e) => e.activity === "free" && e.id !== "seed-free");
check("Frei geschrieben zählt als Produktion", free.length === 1 && free[0].evidence === "production");
await page.getByRole("button", { name: "Weiter" }).click();
await page.getByRole("button", { name: "Überspringen" }).click(); // Tā (Nachzeichnen)
// Frei: ت als ب geschrieben → "anderer Buchstabe"? (Bā hat bereits Erfolg; erneut Plan mit Tā als freiem Ziel nicht nötig)

// Labor
await page.goto(base + "/#/labor"); await page.locator("canvas.pad-canvas").waitFor();
await draw(B); await dot(38, 24); await dot(62, 24);
check("Labor: zeigt Messwerte und bester Treffer", (await page.getByTestId("lab-readout").textContent()).includes("bester Treffer: Tā"));

check("Kein horizontaler Scroll", !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));
await browser.close(); process.exit(failed ? 1 : 0);
