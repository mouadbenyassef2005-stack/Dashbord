// Baut die App als EINE HTML-Datei (React-SPA, Hash-Routing) für die Online-Vorschau als Artifact.
import { build } from "esbuild";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const b64 = (p, t) => `data:${t};base64,${readFileSync(p).toString("base64")}`;

const out = await build({
  entryPoints: ["artifact/entry.tsx"], bundle: true, write: false, minify: true, format: "iife", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/link": "./artifact/next-link.tsx", "next/navigation": "./artifact/next-navigation.ts" },
  loader: { ".json": "json" }, charset: "ascii", logLevel: "warning",
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const dir = ".next/static/chunks/";
let css = readdirSync(dir).filter((f) => f.endsWith(".css")).map((f) => readFileSync(dir + f, "utf8")).join("\n");
css = css.replace(/@font-face\{[^}]*\}/g, "");
const amiri = b64("node_modules/@fontsource/amiri-quran/files/amiri-quran-arabic-400-normal.woff2", "font/woff2");
const inter = b64("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "font/woff2");
const fonts = `@font-face{font-family:"Amiri Quran";font-weight:400;font-display:swap;src:url(${amiri}) format("woff2")}
@font-face{font-family:"Inter Variable";font-weight:100 900;font-display:swap;src:url(${inter}) format("woff2")}`;

const html = `<meta charset="utf-8">
<title>Qaidah Quran-Lernapp</title>
<style>
:root{--bg:#f7f4ee;--fg:#1b2a2a;color-scheme:light}
html,body{background:var(--bg);color:var(--fg);margin:0}
${fonts}
${css}
body{font-size:16px}
</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync("artifact/qaidah.html", html);
console.log("artifact/qaidah.html", (html.length / 1024).toFixed(0) + " KB");
