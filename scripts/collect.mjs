// Recolha de dados do plantel a partir da FotMob. Sem dependências.
// collect(io, cfg) devolve { data, checks, ok, cache }. io = { text(url), json(url), pause?(ms) }.
// cfg.cache = resultado "cache" da recolha anterior: os jogos já terminados não voltam a ser pedidos.
// cfg.prev = dados publicados atualmente: se o Fantacalcio ou a UEFA falharem, mantêm-se os valores anteriores.
// O mesmo código corre em Node 20+ (scripts/update.mjs) e no browser.
export async function collect(io, cfg) {
  const TEAM = cfg.teamId, SEASON = cfg.season;
  const LABEL = { 55: ["Serie A", "SA"], 73: ["Europa League", "EL"], 141: ["Coppa Italia", "CI"], 42: ["Champions League", "CL"], 10216: ["Conference League", "ECL"], 222: ["Supercoppa Italiana", "SC"] };
  const NAT = { "United States": "USA" }; // FotMob country names are already in English
  const ROLE = { CAM: "AM", CDM: "DM" }; // FotMob position codes are already in English
  const KEYS = ["goals", "goal_assist", "mins_played", "expected_goals", "expected_assists", "total_scoring_att", "total_att_assist", "accurate_pass", "total_tackle", "interception", "rating", "yellow_card", "red_card", "saves", "_save_percentage", "clean_sheet", "_goals_prevented", "goals_conceded"];
  const TEAMKEYS = { xg: "expected_goals_team", xga: "expected_goals_conceded_team", possession: "possession_percentage_team", cleanSheets: "clean_sheet_team" };
  const ROLEKEY = k => /keeper/i.test(k) ? "GK" : /defender/i.test(k) ? "CB" : /attacker|forward/i.test(k) ? "ST" : "CM";
  const grp = p => { if (p == null) return null; const t = Math.floor(p / 10), d = p % 10, c = d >= 3 && d <= 7; if (t === 1) return "GK"; if (t === 3) return c ? "CB" : "FB"; if (t >= 5 && t <= 7) return c ? "CM" : "FB"; if (t === 8) return "AM"; return d >= 4 && d <= 6 ? "ST" : "AM"; };
  const r1 = v => Math.round(v * 10) / 10;

  // 1) Página da equipa: plantel, classificações, calendário, épocas por competição
  const html = await io.text(`https://www.fotmob.com/en/teams/${TEAM}/fixtures/${cfg.teamSlug}`);
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("Página da equipa sem __NEXT_DATA__: a FotMob mudou o formato ou bloqueou o pedido.");
  const ND = JSON.parse(m[1]), T = ND.props.pageProps.fallback["team-" + TEAM], TR = ND.props.translations || {};
  const PRIM = String(cfg.primaryLeague), CACHE_V = 2, GX = 24, GY = 16;   // GX × GY: grelha do mapa de toques (campo de 105 × 68)
  const pause = ms => io.pause ? io.pause(ms) : null;
  const today = (cfg.today || new Date().toISOString()).slice(0, 10);

  const fixtures = T.fixtures.allFixtures.fixtures.filter(f => !cfg.excludeLeagues.includes(f.tournament.leagueId) && !f.status.cancelled).map(f => {
    const home = f.home.id === TEAM, done = !!f.status.finished;
    return { id: f.id, date: f.status.utcTime, comp: String(f.tournament.leagueId), compName: f.tournament.name, opp: f.opponent.name, oppId: f.opponent.id, venue: home ? "H" : "A", done, gf: done ? (home ? f.home.score : f.away.score) : null, ga: done ? (home ? f.away.score : f.home.score) : null };
  });
  const compIds = [...new Set(fixtures.map(f => f.comp))].sort((a, b) => (a === String(cfg.primaryLeague) ? -1 : b === String(cfg.primaryLeague) ? 1 : a - b));
  const seasons = T.stats.tournamentSeasons || [];
  const lists = {}, comps = {}, minMp = {};

  for (const id of compIds) {
    const done = fixtures.filter(f => f.comp === id && f.done);
    const lab = LABEL[id] || [fixtures.find(f => f.comp === id).compName, id];
    const C = comps[id] = { label: lab[0], short: lab[1], played: done.length, gf: done.reduce((s, f) => s + f.gf, 0), ga: done.reduce((s, f) => s + f.ga, 0), w: done.filter(f => f.gf > f.ga).length, d: done.filter(f => f.gf === f.ga).length, l: done.filter(f => f.gf < f.ga).length, table: null, top: null, team: {}, hasStats: false };
    const tb = (T.table || []).map(t => t.data).find(t => String(t.leagueId) === id);
    const rows = tb && (tb.table ? tb.table.all : tb.tables && tb.tables[0] && tb.tables[0].table && tb.tables[0].table.all);
    if (rows) {
      C.teams = rows.length;
      const row = rows.find(r => r.id === TEAM);
      if (row) { const [gf, ga] = row.scoresStr.split("-").map(Number); C.table = { pos: row.idx, played: row.played, w: row.wins, d: row.draws, l: row.losses, gf, ga, pts: row.pts }; }
      const lo = row ? Math.max(0, Math.min(row.idx - 4, rows.length - 6)) : 0;
      C.top = rows.slice(lo, lo + 6).map(r => ({ pos: r.idx, team: r.shortName || r.name, p: r.played, gd: r.goalConDiff, pts: r.pts, me: r.id === TEAM }));
    }
    if (!done.length) continue;
    const ts = seasons.find(s => String(s.parentLeagueId) === id && s.season === SEASON);
    if (!ts) continue;
    const base = `https://data.fotmob.com/stats/${id}/season/${ts.tournamentId}/`;
    const L = lists[id] = {}; minMp[id] = {};
    await Promise.all(KEYS.map(async k => {
      try { const j = await io.json(base + k + ".json"); const l = j.TopLists[0].StatList; L[k] = Object.fromEntries(l.map(x => [x.ParticiantId, x])); minMp[id][k] = l.length ? Math.min(...l.map(x => x.MatchesPlayed)) : Infinity; L["#" + k] = l; }
      catch (e) { L[k] = null; }
    }));
    if (!L.mins_played) { delete lists[id]; continue; }
    C.hasStats = true;
    await Promise.all(Object.entries(TEAMKEYS).map(async ([name, k]) => {
      try { const j = await io.json(base + k + ".json"); const e = j.TopLists[0].StatList.find(x => x.TeamId === TEAM || x.ParticiantId === TEAM); if (e) C.team[name] = { v: e.StatValue, rank: e.Rank, matches: e.MatchesPlayed }; } catch (e) {}
    }));
    C.team = Object.fromEntries(Object.keys(TEAMKEYS).filter(k => C.team[k]).map(k => [k, C.team[k]]));   // ordem fixa: os pedidos chegam por ordem aleatória
  }

  // 1b) Dificuldade do calendário: posição atual do adversário na tabela da competição (ou, sem tabela, na liga principal)
  const tableRows = id => { const tb = (T.table || []).map(t => t.data).find(t => String(t.leagueId) === id); return (tb && (tb.table ? tb.table.all : tb.tables && tb.tables[0] && tb.tables[0].table && tb.tables[0].table.all)) || null; };
  const posOf = {}; for (const id of compIds) { const rows = tableRows(id); if (rows) posOf[id] = { n: rows.length, by: Object.fromEntries(rows.map(r => [r.id, r.idx])) }; }
  fixtures.forEach(f => { const src = posOf[f.comp] && posOf[f.comp].by[f.oppId] != null ? f.comp : posOf[PRIM] && posOf[PRIM].by[f.oppId] != null ? PRIM : null; f.oppPos = src ? posOf[src].by[f.oppId] : null; f.oppOf = src ? posOf[src].n : null; f.oppTbl = src; });

  // 1c) Posição jornada a jornada na liga principal, reconstruída a partir de todos os resultados da liga
  let roundsErr = null;
  try {
    const lg = await io.json(`https://www.fotmob.com/api/data/leagues?id=${PRIM}`), allM = lg.fixtures.allMatches;
    const roundOf = Object.fromEntries(allM.map(x => [String(x.id), Number(x.round)]));
    fixtures.forEach(f => { if (f.comp === PRIM && roundOf[f.id]) f.round = roundOf[f.id]; });
    const fin = allM.filter(x => x.status && x.status.finished && !x.status.cancelled && /^\d+\s*-\s*\d+$/.test(x.status.scoreStr || "") && Number(x.round));
    const last = Math.max(0, ...fin.filter(x => +x.home.id === TEAM || +x.away.id === TEAM).map(x => +x.round)), rounds = [];
    for (let r = 1; r <= last; r++) {
      const tb = {}, row = id => tb[id] || (tb[id] = { id: +id, p: 0, pts: 0, gf: 0, ga: 0 });
      for (const x of fin) {
        if (+x.round > r) continue;
        const [hs, as] = x.status.scoreStr.split("-").map(v => parseInt(v, 10)), h = row(x.home.id), a = row(x.away.id);
        h.p++; a.p++; h.gf += hs; h.ga += as; a.gf += as; a.ga += hs; h.pts += hs > as ? 3 : hs === as ? 1 : 0; a.pts += as > hs ? 3 : hs === as ? 1 : 0;
      }
      const sorted = Object.values(tb).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.id - b.id), i = sorted.findIndex(x => x.id === TEAM);
      if (i >= 0) rounds.push({ r, pos: i + 1, pts: sorted[i].pts, p: sorted[i].p, gd: sorted[i].gf - sorted[i].ga });
    }
    if (comps[PRIM] && rounds.length) comps[PRIM].rounds = rounds;
  } catch (e) { roundsErr = e.message; }

  // 1d) Páginas de jogo: onze, marcadores, xG, notas e mapa de toques. Jogos com mais de 4 dias vêm da cache.
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; }, r2 = v => Math.round(v * 100) / 100;
  const lean = o => { for (const k of Object.keys(o)) if (o[k] == null || o[k] === 0 || o[k] === false) delete o[k]; return o; };
  const details = id => io.json(`https://www.fotmob.com/api/data/matchDetails?matchId=${id}`);
  async function fetchMatch(f) {
    const d = await details(f.id), c = d.content, home = f.venue === "H", mi = home ? 0 : 1, oi = 1 - mi;
    const LU = c.lineup || {}, me = (home ? LU.homeTeam : LU.awayTeam) || {}, op = (home ? LU.awayTeam : LU.homeTeam) || {};
    const groups = (((c.stats || {}).Periods || {}).All || {}).stats || [];
    const raw = key => { for (const g of groups) for (const x of g.stats || []) if (x.key === key && x.stats && x.stats[0] != null) return x.stats; return null; };
    const pair = (key, f2) => { const x = raw(key); if (!x) return null; const a = (f2 || num)(x[mi]), b = (f2 || num)(x[oi]); return a == null || b == null ? null : [a, b]; };
    const pctIn = v => { const k = /\((\d+)%\)/.exec(String(v)); return k ? +k[1] : null; };
    const evs = ((c.matchFacts || {}).events || {}).events || [];
    // Estatísticas individuais do jogo (nomes curtos; zeros omitidos; [certos, tentados] nas frações)
    const PS = c.playerStats || {}, SK = { minutes_played: "min", expected_goals: "xg", expected_assists: "xa", total_shots: "sh", ShotsOnTarget: "sot", chances_created: "kp", touches: "tch", touches_opp_box: "box", accurate_passes: "pa", passes_into_final_third: "f3", "matchstats.headers.tackles": "tk", interceptions: "int", clearances: "clr", recoveries: "rec", duel_won: "dw", duel_lost: "dl", dribbles_succeeded: "dr", fouls: "fc", was_fouled: "fd", saves: "sv", goals_conceded: "gc", expected_goals_on_target_faced: "xgf", goals_prevented: "gp" };
    const pstat = id => {
      const ps = PS[id]; if (!ps) return null; const o = {};
      for (const g of ps.stats || []) for (const x of Object.values(g.stats || {})) { const k = SK[x.key], v = x.stat && x.stat.value; if (!k || typeof v !== "number") continue; o[k] = typeof x.stat.total === "number" ? [v, x.stat.total] : r2(v); }
      if (ps.isGoalkeeper) o.gk = 1;
      return Object.keys(lean(o)).length ? o : null;
    };
    const perf = p => {
      const pf = p.performance || {}, ev = pf.events || [], n = t => ev.filter(e => e.type === t).length, se = pf.substitutionEvents || [], at = k => { const e = se.find(x => x.type === k); return e ? e.time : null; };
      return lean({ id: p.id, name: p.lastName || p.name, num: Number(p.shirtNumber) || null, r: pf.rating != null ? num(pf.rating) : null, g: n("goal"), a: n("assist"), yc: n("yellowCard"), rc: n("redCard"), og: n("ownGoal"), on: at("subIn"), off: at("subOut"), s: pstat(p.id) });
    };
    const M = {
      v: CACHE_V, round: Number(d.general && d.general.matchRound) || null, form: me.formation || null, oform: op.formation || null,
      tr: me.rating != null && op.rating != null ? [num(me.rating), num(op.rating)] : null,
      st: lean({ xg: pair("expected_goals"), poss: pair("BallPossesion"), shots: pair("total_shots"), sot: pair("ShotsOnTarget"), big: pair("big_chance"), corners: pair("corners"), pass: pair("accurate_passes", pctIn) }),
      goals: evs.filter(e => e.type === "Goal" && !e.isPenaltyShootoutEvent).map(e => lean({ min: e.time, add: e.overloadTime || null, side: !!e.isHome === home ? "M" : "O", name: e.nameStr || (e.player && e.player.name) || "?", pid: e.playerId || null, og: !!e.ownGoal, pen: e.goalDescriptionKey === "penalty", assist: e.assistInput || null })),
      reds: evs.filter(e => e.type === "Card" && /red/i.test(e.card || "")).map(e => lean({ min: e.time, side: !!e.isHome === home ? "M" : "O", name: e.nameStr || (e.player && e.player.name) || "?" })),
      stadium: ((c.matchFacts || {}).infoBox || {}).Stadium ? c.matchFacts.infoBox.Stadium.name : null,
      xi: (me.starters || []).map(p => { const vl = p.verticalLayout || {}; return Object.assign(perf(p), vl.x != null ? { x: r2(1 - vl.x), y: r2(1 - vl.y) } : {}); }),   // rodado 180°: a equipa ataca para cima
      subs: (me.subs || []).filter(p => ((p.performance || {}).substitutionEvents || []).some(e => e.type === "subIn")).map(perf),
      potm: null, heat: null
    };
    const pm = (c.matchFacts || {}).playerOfTheMatch;
    if (pm && pm.id) M.potm = { id: pm.id, name: pm.name && pm.name.fullName ? pm.name.fullName : String(pm.name || ""), r: pm.rating ? num(pm.rating.num) : null, mine: pm.teamId === TEAM };
    if (c.heatmapUrl) try {
      const h = await io.json("https://www.fotmob.com" + c.heatmapUrl), heat = {};
      for (const p of Object.values(c.playerStats || {})) {
        const svg = p.teamId === TEAM && h.players && h.players["p" + p.optaId]; if (!svg) continue;
        const cells = new Array(GX * GY).fill(0); let n = 0;
        for (const k of svg.matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)) { cells[Math.min(GY - 1, Math.floor(k[2] / 68 * GY)) * GX + Math.min(GX - 1, Math.floor(k[1] / 105 * GX))]++; n++; }
        if (n) heat[p.id] = cells.map(v => Math.min(35, v).toString(36)).join("");
      }
      if (Object.keys(heat).length) M.heat = heat;
    } catch (e) {}
    return M;
  }
  const old = cfg.cache && cfg.cache.v === CACHE_V && cfg.cache.matches ? cfg.cache.matches : {}, cache = { v: CACHE_V, matches: {} }, matchErr = [];
  for (const f of fixtures.filter(x => x.done)) {
    const fresh = (Date.parse(today) - Date.parse(f.date)) / 864e5 < 4;
    let M = old[f.id] || null;
    if (!M || fresh) { try { M = await fetchMatch(f); } catch (e) { if (!M) matchErr.push(f.opp); } await pause(250); }
    if (M) { cache.matches[f.id] = M; if (M.round && !f.round) f.round = M.round; }
  }

  // 1e) Indisponíveis para o próximo jogo (lesões e castigos)
  const nextF = fixtures.find(f => !f.done), injury = id => TR["injury_" + id] || "Injury";
  let unavailable = null;
  if (nextF) try {
    const d = await details(nextF.id), LU = d.content.lineup || {}, me = nextF.venue === "H" ? LU.homeTeam : LU.awayTeam;
    if (me && Array.isArray(me.unavailable)) unavailable = { matchId: nextF.id, list: me.unavailable.map(u => { const k = u.unavailability || {}; return { id: u.id, name: u.name, type: k.type || "injury", reason: k.type === "suspension" ? "Suspended" : k.injuryId != null ? injury(k.injuryId) : "Unavailable", back: k.expectedReturn || null }; }) };
  } catch (e) {}

  // 2) Jogadores
  const members = T.squad.squad.filter(g => g.title !== "coach").flatMap(g => g.members).filter(p => p.shirtNumber != null);
  const coach = (T.squad.squad.find(g => g.title === "coach") || { members: [{}] }).members[0].name || null;
  if (!unavailable) unavailable = { matchId: nextF ? nextF.id : null, list: members.filter(p => p.injury).map(p => ({ id: p.id, name: p.name, type: "injury", reason: injury(p.injury.id), back: p.injury.expectedReturn || null })) };
  const statOf = (id, pid) => {
    const L = lists[id]; if (!L || !L.mins_played[pid]) return null;
    const mp = L.mins_played[pid].SubStatValue, min = L.mins_played[pid].StatValue, inferred = [];
    const g = (k, f) => L[k] && L[k][pid] ? L[k][pid][f || "StatValue"] : null;
    const elig = k => L[k] && mp >= minMp[id][k];
    const zero = (v, name, ok) => { if (v != null) return v; if (ok) { inferred.push(name); return 0; } return null; };
    const s = { mp, min, g: g("goals") || 0, pg: g("goals", "SubStatValue") || 0, a: g("goal_assist") || 0, yc: g("yellow_card") || 0, rc: g("red_card") || 0 };
    s.xg = zero(g("expected_goals"), "xg", !!L.expected_goals);
    s.xa = g("expected_assists");
    s.sh90 = zero(g("total_scoring_att"), "sh", elig("total_scoring_att"));
    s.sh = null;
    if (s.sh90 != null) { // total de remates: único inteiro compatível com a taxa por 90 (e com a % de conversão)
      const conv = g("total_scoring_att", "SubStatValue");
      const cand = []; for (let n = Math.max(0, Math.floor((s.sh90 - 0.06) * min / 90)); n <= Math.ceil((s.sh90 + 0.06) * min / 90); n++) { if (r1(n / min * 90) === s.sh90 && (!s.g || !conv || (n && r1(s.g / n * 100) === conv))) cand.push(n); }
      if (cand.length === 1) s.sh = cand[0];
    }
    s.kp = zero(g("total_att_assist"), "kp", !!L.total_att_assist);
    s.tk = zero(g("total_tackle", "SubStatValue"), "tk", elig("total_tackle"));
    s.int = zero(g("interception", "SubStatValue"), "int", elig("interception"));
    s.passPct = g("accurate_pass", "SubStatValue"); s.accPass90 = g("accurate_pass");
    s.rating = g("rating");
    if (L.saves && L.saves[pid]) s.gk = { saves: g("saves", "SubStatValue"), savePct: g("_save_percentage"), ga: g("_save_percentage", "SubStatValue"), cs: g("clean_sheet") || 0, prevented: g("_goals_prevented") };
    s.inferred = inferred;
    return s;
  };
  const players = members.map(p => {
    const pos = String(p.positionIds || "").split(",").map(Number).filter(Boolean);
    const c = {}; for (const id of Object.keys(lists)) { const s = statOf(id, p.id); if (s) c[id] = s; }
    const parts = p.name.split(" ");
    return { id: p.id, name: p.name, short: parts.length > 1 ? parts.slice(1).join(" ") : p.name, num: p.shirtNumber, dob: p.dateOfBirth || null, nat: NAT[p.cname] || p.cname, roles: String(p.positionIdsDesc || "").split(",").map(s => ROLE[s.trim()] || s.trim()).filter(Boolean).join(" / "), grp: grp(pos[0]) || ROLEKEY(p.role ? p.role.key : ""), pct: null, heat: null, fanta: null, phys: null, c };
  });
  // Mapa de toques por competição: soma das grelhas dos jogos; g = intensidade 0–35 (base 36) relativa ao máximo m
  players.forEach(p => {
    const acc = {};
    for (const f of fixtures) { const g = cache.matches[f.id] && cache.matches[f.id].heat && cache.matches[f.id].heat[p.id]; if (!g) continue; const a = acc[f.comp] || (acc[f.comp] = { k: 0, cells: new Array(GX * GY).fill(0) }); a.k++; for (let i = 0; i < g.length; i++) a.cells[i] += parseInt(g[i], 36); }
    for (const [id, a] of Object.entries(acc)) { const n = a.cells.reduce((t, v) => t + v, 0), mx = Math.max(...a.cells); if (!n) continue; (p.heat || (p.heat = {}))[id] = { k: a.k, n, m: mx, g: a.cells.map(v => Math.round(v / mx * 35).toString(36)).join("") }; }
  });
  // Fontes secundárias (nunca impedem a publicação): correspondência com o plantel pelo nome, sem acentos
  const norm = v => String(v == null ? "" : v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 \-]/g, " ").replace(/\s+/g, " ").trim();
  const prevOf = k => Object.fromEntries(((cfg.prev && cfg.prev.players) || []).map(p => [p.id, p[k] || null]));
  const extra = {}, extraErr = {};
  const settle = (k, fresh) => {   // fresh = { idJogador: valor } ou null se a recolha falhou
    const before = prevOf(k), had = cfg.prev && cfg.prev.extra && cfg.prev.extra[k];
    players.forEach(p => { p[k] = (fresh ? fresh[p.id] : before[p.id]) || null; });
    const same = had && JSON.stringify(players.map(p => p[k])) === JSON.stringify(players.map(p => before[p.id] || null));
    const n = players.filter(p => p[k]).length;
    if (n) extra[k] = { asOf: !fresh || same ? (had ? had.asOf : today) : today, n };
  };

  // 2b) Fantamedia: tabela pública de estatísticas do Fantacalcio (só liga principal)
  let fanta = null;
  if (cfg.fantaUrl) try {
    const page = await io.text(cfg.fantaUrl), ent = v => v.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
    const rows = page.split('<tr class="player-row"').slice(1).map(r => r.split("</tr>")[0]).filter(r => r.includes(`/squadre/${cfg.fantaSlug}/`));
    if (!rows.length) throw new Error("tabela sem jogadores da equipa");
    fanta = {};
    for (const r of rows) {
      const col = k => { const x = new RegExp(`data-col-key="${k}"[^>]*>\\s*([^<]*?)\\s*<`).exec(r); return x ? num(x[1].replace(",", ".")) : null; };
      const nm = /class="player-name player-link"[^>]*>\s*<span>([^<]*)<\/span>/.exec(r), role = /data-filter-role-classic="([^"]*)"/.exec(r), pv = col("pg");
      if (!nm || !pv) continue;
      const full = norm(ent(nm[1])), ini = / ([a-z])$/.exec(full), sur = ini ? full.slice(0, -2) : full;
      let cand = players.filter(p => { const n = norm(p.name); return n === sur || n.endsWith(" " + sur); });
      if (cand.length > 1 && ini) cand = cand.filter(p => norm(p.name)[0] === ini[1]);
      if (cand.length > 1 && role) cand = cand.filter(p => (p.grp === "GK") === (role[1] === "p"));
      if (cand.length === 1) fanta[cand[0].id] = { pv, mv: col("mv"), fm: col("mfv") };
    }
  } catch (e) { extraErr.fanta = e.message; }
  if (cfg.fantaUrl) settle("fanta", fanta);

  // 2c) Dados físicos: km percorridos e velocidade máxima, publicados pela UEFA para as provas europeias
  const UEFA = { 42: 1, 73: 14, 10216: 2019 };
  let phys = null;
  for (const id of compIds) {
    if (!UEFA[id] || !cfg.uefaTeamId || !comps[id].played) continue;
    try {
      const rows = await io.json(`https://compstats.uefa.com/v1/player-ranking?competitionId=${UEFA[id]}&limit=60&offset=0&optionalFields=PLAYER%2CTEAM&order=DESC&phase=TOURNAMENT&seasonYear=${SEASON.split("/")[1]}&stats=distance_covered%2Ctop_speed%2Cminutes_played_official%2Cmatches_appearance&teamId=${cfg.uefaTeamId}`);
      if (!Array.isArray(rows)) throw new Error("resposta inesperada");
      phys = phys || {};
      for (const x of rows) {
        const st = Object.fromEntries((x.statistics || []).map(k => [k.name, num(k.value)])), km = st.distance_covered; if (!km) continue;
        const n = norm(x.player && x.player.internationalName), last = n.split(" ").pop();
        let cand = players.filter(p => norm(p.name) === n);
        if (cand.length !== 1) cand = players.filter(p => norm(p.name).split(" ").pop() === last && String(p.num) === String(x.player.clubJerseyNumber));
        if (cand.length !== 1) cand = players.filter(p => norm(p.name).split(" ").pop() === last);
        if (cand.length === 1) (phys[cand[0].id] || (phys[cand[0].id] = {}))[id] = lean({ km, top: st.top_speed, min: st.minutes_played_official, mp: st.matches_appearance });
      }
    } catch (e) { extraErr.phys = e.message; }
  }
  if (phys || extraErr.phys) settle("phys", extraErr.phys ? null : phys);

  // 2d) Onze-base: formação mais usada na liga principal e, para cada posição dessa formação, quem mais vezes a ocupou
  let lineup = null;
  {
    const ms = fixtures.filter(f => f.comp === PRIM && f.done).map(f => cache.matches[f.id]).filter(M => M && M.form && M.xi.length === 11 && M.xi.every(p => p.x != null));
    const count = {}; ms.forEach((M, i) => { const c = count[M.form] || (count[M.form] = { n: 0, last: 0 }); c.n++; c.last = i; });
    const form = Object.keys(count).sort((a, b) => count[b].n - count[a].n || count[b].last - count[a].last)[0];
    if (form) {
      const inSquad = new Set(players.map(p => p.id)), starts = {}, tally = [];
      ms.forEach(M => M.xi.forEach(p => { starts[p.id] = (starts[p.id] || 0) + 1; }));
      const slots = {}; ms.filter(M => M.form === form).forEach(M => M.xi.forEach(p => { const k = p.x + "|" + p.y, sl = slots[k] || (slots[k] = {}); sl[p.id] = (sl[p.id] || 0) + 1; }));
      for (const [k, sl] of Object.entries(slots)) for (const [pid, n] of Object.entries(sl)) if (inSquad.has(+pid)) tally.push({ k, id: +pid, n });
      tally.sort((a, b) => b.n - a.n || starts[b.id] - starts[a.id] || a.id - b.id);
      const usedS = new Set(), usedP = new Set(), xi = [];
      for (const t of tally) { if (usedS.has(t.k) || usedP.has(t.id)) continue; usedS.add(t.k); usedP.add(t.id); const [x, y] = t.k.split("|").map(Number); xi.push({ id: t.id, x, y, starts: starts[t.id] }); }
      xi.sort((a, b) => a.y - b.y || a.x - b.x);
      lineup = { formation: form, used: count[form].n, of: ms.length, comp: PRIM, forms: Object.fromEntries(Object.entries(count).map(([k, c]) => [k, c.n])), xi };
    }
  }

  const dup = {}; players.forEach(p => { (dup[p.short] = dup[p.short] || []).push(p); });
  Object.values(dup).filter(a => a.length > 1).forEach(a => a.forEach(p => { p.short = p.name[0] + ". " + p.short; }));

  // 3) Percentis face à liga principal, por grupo de posição
  const PL = String(cfg.primaryLeague), L = lists[PL], groups = { GK: { label: "Goalkeepers", n: 0 }, CB: { label: "Centre-backs", n: 0 }, FB: { label: "Full-backs and wing-backs", n: 0 }, CM: { label: "Central midfielders", n: 0 }, AM: { label: "Attacking midfielders and wingers", n: 0 }, ST: { label: "Strikers", n: 0 } };
  if (L) {
    const g = (k, id, f) => L[k] && L[k][id] ? L[k][id][f || "StatValue"] : null, z = v => v == null ? 0 : v;
    const met = x => {
      const id = x.ParticiantId, min = x.StatValue, gr = grp((x.Positions || [])[0]);
      if (gr === "GK") { if (!L.saves || !L.saves[id]) return null; return { gr, v: [g("saves", id), g("_save_percentage", id), -g("goals_conceded", id), g("_goals_prevented", id) / min * 90, z(g("clean_sheet", id)) / x.SubStatValue * 100, g("accurate_pass", id, "SubStatValue")] }; }
      return { gr, v: [(z(g("goals", id)) - z(g("goals", id, "SubStatValue"))) / min * 90, z(g("expected_goals", id)) / min * 90, z(g("total_scoring_att", id)), z(g("expected_assists", id)) / min * 90, z(g("total_att_assist", id)) / min * 90, g("accurate_pass", id, "SubStatValue"), z(g("total_tackle", id, "SubStatValue")) / min * 90, z(g("interception", id, "SubStatValue")) / min * 90] };
    };
    const ref = L["#mins_played"].filter(x => x.StatValue >= cfg.minMinutesRadar && x.SubStatValue >= cfg.minMatchesRadar && (x.Positions || []).length).map(x => ({ x, m: met(x) })).filter(o => o.m && o.m.gr);
    const by = {}; ref.forEach(o => { (by[o.m.gr] = by[o.m.gr] || []).push(o); });
    const pct = (arr, val) => { const a = arr.filter(u => u != null); if (val == null || !a.length) return null; let lo = 0, eq = 0; for (const u of a) { if (u < val - 1e-9) lo++; else if (Math.abs(u - val) <= 1e-9) eq++; } return Math.round((lo + 0.5 * eq) / a.length * 100); };
    Object.keys(groups).forEach(k => { groups[k].n = (by[k] || []).length; });
    ref.filter(o => o.x.TeamId === TEAM).forEach(o => { const p = players.find(q => q.id === o.x.ParticiantId); if (p) { p.grp = o.m.gr; p.pct = o.m.v.map((val, i) => pct(by[o.m.gr].map(q => q.m.v[i]), val)); } });
  }
  const order = { GK: 0, CB: 1, FB: 2, CM: 3, AM: 4, ST: 5 }, mins = p => Object.values(p.c).reduce((s, c) => s + c.min, 0);
  players.sort((a, b) => order[a.grp] - order[b.grp] || mins(b) - mins(a) || a.num - b.num);

  // 4) Validações. "fail" impede a publicação; "note" só avisa.
  const checks = [], add = (level, title, detail) => checks.push({ level, title, detail });
  if (players.length < 18) add("fail", "Plantel incompleto", `Só ${players.length} jogadores recolhidos.`);
  for (const id of compIds) {
    const C = comps[id]; if (!C.played) continue;
    if (C.table) { const t = C.table, ok = t.played === C.played && t.gf === C.gf && t.ga === C.ga && t.pts === 3 * t.w + t.d; add(ok ? "ok" : "fail", `${C.label}: resultados jogo a jogo = classificação`, `Jogos somam ${C.gf}–${C.ga} em ${C.played} jogos; classificação: ${t.gf}–${t.ga} em ${t.played} jogos, ${t.pts} pontos.`); }
    if (!C.hasStats) { add("note", `${C.label}: sem estatísticas individuais`, "A FotMob ainda não publicou listas de jogadores para esta competição."); continue; }
    const ps = players.map(p => p.c[id]).filter(Boolean), sum = f => ps.reduce((s, c) => s + (f(c) || 0), 0);
    const sg = sum(c => c.g), og = C.gf - sg;
    add(og >= 0 && og <= 3 ? "ok" : "fail", `${C.label}: golos dos jogadores = golos da equipa`, `Soma dos jogadores: ${sg}. Golos da equipa: ${C.gf}.${og > 0 ? ` A diferença de ${og} corresponde a autogolos a favor, que a fonte não atribui a jogadores.` : ""}`);
    C.ownGoalsFor = og;
    const sa = sum(c => c.a); add(sa <= C.gf ? "ok" : "fail", `${C.label}: assistências não excedem os golos`, `Assistências: ${sa}. Golos: ${C.gf}.`);
    const smin = sum(c => c.min), exp = C.played * 990, reds = sum(c => c.rc), diff = exp - smin;
    add(diff === 0 ? "ok" : diff > 0 && diff <= 90 * reds + 15 * C.played ? "note" : Math.abs(diff) <= exp * 0.03 ? "note" : "fail", `${C.label}: minutos somam 11 × 90 × jogos`, `Soma: ${smin}. Esperado: ${exp}.${reds ? ` Expulsões: ${reds}.` : ""}`);
    if (C.team.xg) { const sx = r1(sum(c => c.xg)), stale = C.team.xg.matches !== C.played; add(stale ? "note" : Math.abs(sx - C.team.xg.v) <= 1.5 ? "ok" : "fail", `${C.label}: xG dos jogadores ≈ xG da equipa`, `Soma dos jogadores: ${sx}. xG da equipa: ${C.team.xg.v}${stale ? ` (ficheiro da equipa ainda com ${C.team.xg.matches} jogos)` : ""}. Valores individuais com uma casa decimal.`); }
    const gka = sum(c => c.gk ? c.gk.ga : 0), anyGk = ps.some(c => c.gk);
    if (anyGk) add(gka === C.ga ? "ok" : "note", `${C.label}: golos sofridos pelos guarda-redes = golos sofridos pela equipa`, `Guarda-redes listados: ${gka}. Equipa: ${C.ga}.${gka !== C.ga ? " A fonte só lista guarda-redes acima de um mínimo de minutos." : ""}`);
  }
  // Jogos, jornadas e indisponíveis: nunca impedem a publicação, só avisam
  for (const id of compIds) {
    const C = comps[id], fx = fixtures.filter(f => f.comp === id && f.done); if (!fx.length) continue;
    const got = fx.filter(f => cache.matches[f.id]);
    add(got.length === fx.length ? "ok" : "note", `${C.label}: páginas de jogo recolhidas`, `${got.length} de ${fx.length} jogos com onze, marcadores e estatísticas.`);
    const off = got.filter(f => { const g = cache.matches[f.id].goals; return g.filter(x => x.side === "M").length !== f.gf || g.filter(x => x.side === "O").length !== f.ga; });
    if (got.length) add(off.length ? "note" : "ok", `${C.label}: marcadores dos jogos = resultados`, off.length ? `Não batem certo: ${off.map(f => f.opp).join(", ")}.` : `Os marcadores de ${got.length} jogos somam os resultados.`);
    const withXg = got.filter(f => cache.matches[f.id].st.xg);
    if (C.team.xg && withXg.length === fx.length && C.team.xg.matches === fx.length) { const sx = r1(withXg.reduce((t, f) => t + cache.matches[f.id].st.xg[0], 0)); add(Math.abs(sx - C.team.xg.v) <= 0.5 ? "ok" : "note", `${C.label}: xG jogo a jogo ≈ xG da equipa`, `Soma dos jogos: ${sx}. xG da equipa: ${C.team.xg.v}.`); }
  }
  if (matchErr.length) add("note", "Páginas de jogo em falta", `Falhou a recolha de: ${matchErr.join(", ")}.`);
  if (extraErr.fanta) add("note", "Fantamedia não atualizada", `Fantacalcio: ${extraErr.fanta}. Mantêm-se os valores anteriores.`);
  if (extraErr.phys) add("note", "Dados físicos não atualizados", `UEFA: ${extraErr.phys}. Mantêm-se os valores anteriores.`);
  if (!lineup) add("note", "Onze-base indisponível", "Sem páginas de jogo da liga principal com onze completo.");
  else if (lineup.xi.length !== 11) add("note", "Onze-base incompleto", `Só ${lineup.xi.length} posições preenchidas com jogadores do plantel atual.`);
  const P0 = comps[PRIM];
  if (roundsErr || !P0 || !P0.rounds) add("note", "Posição por jornada indisponível", roundsErr || "Sem resultados da liga.");
  else if (P0.table) { const lastR = P0.rounds[P0.rounds.length - 1]; add(lastR.pos === P0.table.pos && lastR.pts === P0.table.pts ? "ok" : "note", `${P0.label}: posição por jornada = classificação`, `Reconstruída: ${lastR.pos}.º com ${lastR.pts} pontos. Classificação: ${P0.table.pos}.º com ${P0.table.pts} pontos. O desempate usa a diferença de golos.`); }
  const ok = !checks.some(c => c.level === "fail");
  fixtures.forEach(f => { delete f.compName; if (f.round == null) delete f.round; });   // gf/ga a zero têm de ficar: não usar lean() aqui
  const matches = Object.fromEntries(Object.entries(cache.matches).map(([id, M]) => { const { heat, v, ...rest } = M; return [id, rest]; }));
  const data = { meta: { team: T.details.name, teamId: TEAM, season: SEASON, collected: today, coach, primary: PL, minMinutesRadar: cfg.minMinutesRadar, minMatchesRadar: cfg.minMatchesRadar, heatGrid: [GX, GY] }, compOrder: compIds.filter(id => comps[id]), comps, fixtures, matches, unavailable, lineup, extra, groups, players };
  return { data, checks, ok, cache };
}
