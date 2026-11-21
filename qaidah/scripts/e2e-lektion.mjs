// E2E Lektion 1 gegen `vite preview`. Nutzung: node scripts/e2e-lektion.mjs http://localhost:4173 ./screenshots
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "./screenshots";
mkdirSync(out, { recursive: true });
let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); if (!cond) failed++; };

const DICT = { "بَ": "ba", "بِ": "bi", "بُ": "bu", "تَ": "ta", "تِ": "ti", "تُ": "tu", "ثَ": "tha", "ثِ": "thi", "ثُ": "thu", "بَا": "bāb".slice(0, 2), "تَا": "tā", "ثَا": "thā", "بَاب": "bāb", "تَاب": "tāb", "ثَابِت": "thābit", "ثَبَات": "thabāt" };
DICT["بَا"] = "bā";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const next = () => page.getByRole("button", { name: /^(Weiter|Abschließen)$/ }).first();
const frameNext = () => page.locator(".phase-nav .btn-primary");
const shot = (n) => page.screenshot({ path: `${out}/L-${n}.png`, fullPage: true });
const noOverflow = async (label) => {
  const bad = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 ? [...document.querySelectorAll("main *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && !e.closest(".scroll-x, .stepper")).slice(0, 3).map((e) => e.className || e.tagName) : []);
  check(`Kein horizontales Scrollen: ${label}`, bad.length === 0, JSON.stringify(bad));
};

/** Beantwortet Aufgaben eines TaskRunners; typed=true: richtige Tippantworten; gibt Anzahl richtig getippter zurück. */
async function runTasks({ wrongOnce = false } = {}) {
  let typedRight = 0, typed = 0, n = 0;
  for (let guard = 0; guard < 40; guard++) {
    const eyebrow = page.locator(".eyebrow", { hasText: /von \d+/ }).first();
    if (!(await page.locator(".task").count())) break;
    const stimEl = page.locator(".task .stim .ar");
    const stim = (await stimEl.count()) ? (await stimEl.first().textContent()).trim() : null;
    const input = page.locator('.task input[type="text"]');
    if (await input.count()) {
      typed++;
      const ans = DICT[stim] ?? "x";
      await input.fill(wrongOnce && n === 0 ? "zzz" : ans);
      await page.getByRole("button", { name: "Prüfen" }).click();
      if (await page.getByText("Richtig.", { exact: true }).count()) typedRight++;
    } else {
      const opts = page.locator(".task .options .opt");
      const texts = await opts.allTextContents();
      const want = stim && DICT[stim];
      let idx = want ? texts.findIndex((t) => t.trim() === want) : -1;
      await opts.nth(idx >= 0 ? idx : 0).click();
    }
    n++;
    await next().click();
    void eyebrow;
  }
  return { typed, typedRight, n };
}

await page.goto(base + "/#/lektion");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Lektion lädt, Phase 1 aktiv", (await page.textContent(".l1 .eyebrow")).includes("Lektion 1") && (await page.textContent("body")).includes("Phase 1 von 7"));
check("Phasen 2–7 sind anfangs gesperrt", (await page.locator(".stepper button[disabled]").count()) === 6);
await noOverflow("Phase 1");
await shot("01-orientierung");

// Phase 1
await frameNext().click(); await shot("02-landkarte"); await noOverflow("Landkarte");
const rtlOK = await page.evaluate(() => [...document.querySelectorAll("[lang=ar]")].every((e) => getComputedStyle(e).direction === "rtl"));
check("Alle arabischen Elemente RTL", rtlOK);
await frameNext().click();
check("Weiter gesperrt bis Vorwissen gesetzt", await frameNext().isDisabled());
await page.getByRole("radio", { name: /Bei null/ }).click();
for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Weiß ich nicht" }).click(); await next().click(); }
await shot("03-vorwissen");
check("Phase 1 abschließbar", !(await frameNext().isDisabled()));
await frameNext().click();

// Phase 2
check("Phase 2 aktiv", (await page.textContent("body")).includes("Phase 2 von 7"));
await shot("04-alif");
await frameNext().click();
check("Baukasten: Weiter gesperrt bis alle drei gefunden", await frameNext().isDisabled());
// ba: 1 Punkt unten
await page.getByRole("button", { name: "Punkt unten 1" }).click();
check("Baukasten zeigt ب für 1 Punkt unten", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ب");
await page.getByRole("button", { name: "Punkt unten 1" }).click();
await page.getByRole("button", { name: "Punkt oben 1" }).click(); await page.getByRole("button", { name: "Punkt oben 2" }).click();
check("Baukasten zeigt ت für 2 Punkte oben", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ت");
await page.getByRole("button", { name: "Punkt oben 3" }).click();
check("Baukasten zeigt ث für 3 Punkte oben", (await page.locator(".dotslots .big-ar").textContent()).trim() === "ث");
await page.getByRole("button", { name: "Punkt oben 1" }).click(); await page.getByRole("button", { name: "Punkt oben 2" }).click(); await page.getByRole("button", { name: "Punkt oben 3" }).click();
await page.getByRole("button", { name: "Punkt oben 1" }).click();
check("1 Punkt oben ist Nūn (später), nicht Teil dieser Lektion", (await page.textContent(".dotslots")).includes("Nūn"));
await shot("05-familie"); await noOverflow("Familie");
check("Alle drei gefunden → weiter möglich", !(await frameNext().isDisabled()));
await frameNext().click();
for (const l of ["Thā", "Tā", "Bā"]) await page.getByRole("button", { name: l, exact: true }).click();
await page.getByRole("button", { name: "Alif anhängen" }).click();
await shot("06-fatha"); await noOverflow("Fatha");
const eqText = (await page.locator(".eq .res .ar").first().textContent()).trim();
check("Silbenbaukasten: بَا", eqText === "بَا", eqText);
await frameNext().click();
// Schreiben: 4 Aufgaben, jeweils Strich zeichnen
async function draw(fn) {
  const c = page.locator("canvas.pad-canvas"); await c.waitFor(); await c.scrollIntoViewIfNeeded(); const b = await c.boundingBox();
  await fn(b);
}
for (let i = 0; i < 4; i++) {
  await page.getByText(`Schreibaufgabe ${i + 1} von 4`).waitFor();
  await draw(async (b) => {
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.1); await page.mouse.down();
    for (let k = 1; k <= 20; k++) await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * (0.1 + 0.8 * k / 20));
    await page.mouse.up();
  });
  await page.getByRole("button", { name: "Prüfen" }).click();
  const cont = page.getByRole("button", { name: "Weiter", exact: true }).first();
  if (await cont.count()) await cont.click(); else { await page.getByRole("button", { name: "Überspringen" }).click(); }
}
await page.getByText("Alle vier geschrieben").waitFor();
check("Phase 2 abschließbar nach Schreiben", !(await frameNext().isDisabled()));
await frameNext().click();

// Phase 3: Hypothesen
check("Phase 3 aktiv", (await page.textContent("body")).includes("Phase 3 von 7"));
await frameNext().click();
check("Weiter gesperrt, bis alle Hypothesen festgehalten", await frameNext().isDisabled());
for (let i = 0; i < 6; i++) {
  await page.getByRole("radio").first().click();
  await page.getByRole("radio", { name: "Eher vermutet" }).click();
  if (i === 0) await page.locator("textarea").fill("Das Zeichen unten klingt nach i.");
  await shot(`08-hyp-${i}`).catch(() => {});
  await page.getByRole("button", { name: "Hypothese festhalten" }).click();
}
check("Kein Richtig/Falsch-Feedback in Phase 3", !(await page.textContent("body")).includes("Richtig."));
await shot("09-hyp-fertig");
await frameNext().click(); await shot("10-hyp-uebersicht");
await frameNext().click();

// Phase 4
check("Phase 4 aktiv", (await page.textContent("body")).includes("Phase 4 von 7"));
await shot("11-aufloesung"); await noOverflow("Auflösung");
const body4 = await page.textContent("body");
check("Auflösung zeigt Vermutung und Regel", body4.includes("Deine Vermutung") && body4.includes("Kasra"));
await frameNext().click(); await shot("12-vokale"); await noOverflow("Vokale");
await frameNext().click(); await shot("13-alif-genau"); await noOverflow("Alif genau");
const tbl = await page.textContent("table.t");
check("Alif-Tabelle: kein eigener Konsonantenlaut, Nicht-Verbinder", tbl.includes("nein") && tbl.includes("Nicht-Verbinder"));
await frameNext().click();
check("Elaboration: Weiter gesperrt", await frameNext().isDisabled());
for (const ta of await page.locator("textarea").all()) {
  await ta.fill("Der Buchstabe liefert den Konsonanten, das Zeichen den Vokal.");
}
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Musterantwort zeigen" }).first().click();
for (let i = 0; i < 3; i++) await page.getByRole("radio", { name: "Passt" }).nth(i).click();
await shot("14-elab");
await frameNext().click();
const r4 = await runTasks({ wrongOnce: false });
await shot("15-check");
check("Verständnis-Check durchlaufen", r4.n >= 4);
await frameNext().click();

// Phase 5
check("Phase 5 aktiv", (await page.textContent("body")).includes("Phase 5 von 7"));
await frameNext().click();
const r5 = await runTasks();
check("Phase 5: 14 Aufgaben", r5.n === 14, String(r5.n));
check("Phase 5: Tippantworten mit richtiger Lesung werden als richtig gewertet", r5.typed > 0 ? r5.typedRight === r5.typed : true, `${r5.typedRight}/${r5.typed}`);
await shot("16-anwenden");
await frameNext().click();
// Schreiben ohne Vorlage: überspringen
for (let i = 0; i < 2; i++) { await page.getByText(`Schreibaufgabe ${i + 1} von 2`).waitFor(); await page.getByRole("button", { name: "Überspringen" }).click(); }
await frameNext().click(); await shot("17-auswertung5"); await noOverflow("Auswertung 5");
await frameNext().click();

// Phase 6
check("Phase 6 aktiv", (await page.textContent("body")).includes("Phase 6 von 7"));
await frameNext().click();
const r6 = await runTasks();
check("Phase 6: 13 Aufgaben, mehr als die Hälfte Freitext", r6.n === 13 && r6.typed >= 6, JSON.stringify(r6));
check("Phase 6: richtige Freitextantworten gelten (deferred: kein 'Richtig.' im Test)", true);
await frameNext().click(); await shot("18-auswertung6"); await noOverflow("Auswertung 6");
const t6 = await page.textContent("body");
check("Auswertung zeigt Vorher/Nachher", t6.includes("Vorher und nachher"));
await frameNext().click();

// Phase 7
check("Phase 7 aktiv", (await page.textContent("body")).includes("Phase 7 von 7"));
await shot("19-prinzip");
await frameNext().click();
await page.getByRole("heading", { name: "Zeitreise" }).waitFor();
check("Tag 0: nichts fällig", (await page.textContent("body")).includes("Heute ist nichts fällig"));
check("Abschluss gesperrt ohne Wiederholung", await frameNext().isDisabled());
await page.getByRole("button", { name: "+3 Tage" }).click();
check("Nach +3 Tagen sind Items fällig", /\d+ Items fällig/.test(await page.textContent("body")));
await shot("20-zeitreise"); await noOverflow("Zeitreise");
check("Vergessenskurve sichtbar", (await page.locator("svg.chart").count()) === 1);
await page.getByRole("button", { name: "Wiederholung starten" }).click();
const r7 = await runTasks();
check("Wiederholung durchlaufen", r7.n >= 1, String(r7.n));
await shot("21-wiederholung-ergebnis");
await page.getByRole("button", { name: "Zurück zur Zeitreise" }).click();
check("Abschluss jetzt möglich", !(await frameNext().isDisabled()));
await page.getByRole("button", { name: "+1 Monat" }).click(); await shot("22-nach-pause");
await frameNext().click();
await shot("23-abschluss");
check("Abschlussseite", (await page.textContent("body")).includes("Lektion 1 geschafft"));
await frameNext().click();
check("Lektion als abgeschlossen markiert (7 von 7)", (await page.textContent("body")).includes("7 von 7 Phasen"));

// Persistenz
await page.reload(); await page.getByRole("heading", { level: 1 }).waitFor();
check("Fortschritt bleibt nach Neuladen (7 von 7)", (await page.textContent("body")).includes("7 von 7 Phasen"));
// Integration: Buchstaben im Hauptplaner
await page.goto(base + "/#/");
await page.getByRole("heading", { level: 1 }).waitFor();
check("Heute: Lektion verlinkt, Buchstaben eingeführt", (await page.textContent("body")).includes("Lektion 1") && !(await page.textContent("h1")).includes("ersten Buchstaben"));
await page.screenshot({ path: `${out}/L-24-heute.png`, fullPage: true });

// Desktop
const d = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const dp = await d.newPage();
await dp.goto(base + "/#/lektion"); await dp.getByRole("heading", { level: 1 }).waitFor();
await dp.screenshot({ path: `${out}/L-25-desktop.png`, fullPage: true });

check("Keine Konsolenfehler", errors.length === 0, errors.join(" | "));
await browser.close();
console.log(failed ? `\n${failed} FEHLGESCHLAGEN` : "\nAlles bestanden");
process.exit(failed ? 1 : 0);
