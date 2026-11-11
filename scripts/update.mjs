#!/usr/bin/env node
// Atualiza o bloco DATA do index.html (e o data.json) com os dados mais recentes.
//   node scripts/update.mjs              recolhe, valida e escreve
//   node scripts/update.mjs --dry        recolhe e valida, sem escrever
//   node scripts/update.mjs --from f.json  usa um ficheiro já recolhido (sem rede)
// Sai com código 1, sem escrever nada, se alguma validação falhar.
// cache/matches.json guarda os jogos já terminados (onze, marcadores, mapa de toques) para não voltarem a ser pedidos.
import fs from "node:fs";
import { collect } from "./collect.mjs";

const CFG = {
  teamId: 8564, teamSlug: "ac-milan", season: "2026/2027",
  primaryLeague: 55,          // Serie A: liga usada nos percentis, no onze-base e na posição por jornada
  excludeLeagues: [489],      // jogos particulares
  minMinutesRadar: 300, minMatchesRadar: 5,
  uefaTeamId: 50058,          // id do clube na UEFA: km percorridos e velocidade máxima nas provas europeias
  fantaUrl: "https://www.fantacalcio.it/statistiche-serie-a", fantaSlug: "milan"   // fantamedia (vazio = não recolher)
};
const ROOT = new URL("../", import.meta.url);
const START = "/* DATA:START */", END = "/* DATA:END */";
const args = process.argv.slice(2), flag = n => args.includes(n);

const HEADERS = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", "Accept-Language": "en", Accept: "text/html,application/json;q=0.9,*/*;q=0.8" };
async function get(url, kind) {
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
      return kind === "json" ? await r.json() : await r.text();
    } catch (e) { last = e; if (/HTTP 40[34]/.test(e.message)) break; await new Promise(res => setTimeout(res, 1500 * (i + 1))); }
  }
  throw last;
}

export function formatData(d) {
  const j = v => JSON.stringify(v), lines = (arr, ind = "    ") => arr.map(x => ind + j(x)).join(",\n");
  const map = o => Object.entries(o || {}).map(([k, v]) => `    ${j(k)}: ${j(v)}`).join(",\n");
  return `const DATA = {
  "meta": ${j(d.meta)},
  "compOrder": ${j(d.compOrder)},
  "comps": {
${map(d.comps)}
  },
  "fixtures": [
${lines(d.fixtures)}
  ],
  "matches": {
${map(d.matches)}
  },
  "unavailable": ${j(d.unavailable ?? null)},
  "lineup": ${j(d.lineup ?? null)},
  "extra": ${j(d.extra ?? {})},
  "groups": ${j(d.groups)},
  "players": [
${lines(d.players)}
  ]
};`;
}

function readCurrent(html) {
  const a = html.indexOf(START), b = html.indexOf(END);
  if (a < 0 || b < 0) throw new Error("index.html sem marcadores DATA:START / DATA:END.");
  const block = html.slice(a + START.length, b).trim();
  let current = null;
  try { current = JSON.parse(block.replace(/^const DATA = /, "").replace(/;\s*$/, "")); } catch (e) {}
  return { a, b, current };
}
const readJson = url => { try { return JSON.parse(fs.readFileSync(url, "utf8")); } catch (e) { return null; } };

const file = new URL("index.html", ROOT), html = fs.readFileSync(file, "utf8"), { a, b, current } = readCurrent(html);
const cacheFile = new URL("cache/matches.json", ROOT), oldCache = readJson(cacheFile);

const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
let data, checks = [], ok = true, cache = null;
if (from) data = JSON.parse(fs.readFileSync(from, "utf8"));
else ({ data, checks, ok, cache } = await collect({ text: u => get(u, "text"), json: u => get(u, "json"), pause: ms => new Promise(res => setTimeout(res, ms)) }, { ...CFG, cache: oldCache, prev: current }));

for (const c of checks) console.log(`${c.level === "ok" ? "CONFERE" : c.level === "note" ? "NOTA   " : "FALHA  "} ${c.title} — ${c.detail}`);
if (!ok) { console.error("\nValidação falhou: nada foi escrito. O site mantém os dados anteriores."); process.exit(1); }
if (flag("--dry")) { console.log("\n--dry: nada foi escrito."); process.exit(0); }

if (cache && JSON.stringify(cache) !== JSON.stringify(oldCache)) {
  fs.mkdirSync(new URL("cache/", ROOT), { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache) + "\n");
  console.log(`\ncache/matches.json atualizado (${Object.keys(cache.matches).length} jogos).`);
}
// Comparação sem depender da ordem das chaves nem da data de recolha
const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const strip = d => d && JSON.stringify(canon({ ...d, meta: { ...d.meta, collected: null } }));
if (strip(current) === strip(data)) { console.log("\nSem alterações desde a última recolha."); process.exit(0); }
fs.writeFileSync(file, html.slice(0, a + START.length) + "\n" + formatData(data) + "\n" + html.slice(b));
fs.writeFileSync(new URL("data.json", ROOT), JSON.stringify(data, null, 1) + "\n");
console.log(`\nindex.html e data.json atualizados (${data.players.length} jogadores, ${Object.keys(data.matches || {}).length} jogos, recolha de ${data.meta.collected}).`);
