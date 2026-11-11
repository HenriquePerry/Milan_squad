// Recolha de dados do plantel a partir da FotMob. Sem dependências.
// collect(io, cfg) devolve { data, checks, ok }. io = { text(url), json(url) }.
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
  const T = JSON.parse(m[1]).props.pageProps.fallback["team-" + TEAM];
  const today = (cfg.today || new Date().toISOString()).slice(0, 10);

  const fixtures = T.fixtures.allFixtures.fixtures.filter(f => !cfg.excludeLeagues.includes(f.tournament.leagueId) && !f.status.cancelled).map(f => {
    const home = f.home.id === TEAM, done = !!f.status.finished;
    return { date: f.status.utcTime, comp: String(f.tournament.leagueId), compName: f.tournament.name, opp: f.opponent.name, venue: home ? "H" : "A", done, gf: done ? (home ? f.home.score : f.away.score) : null, ga: done ? (home ? f.away.score : f.home.score) : null };
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
  }

  // 2) Jogadores
  const members = T.squad.squad.filter(g => g.title !== "coach").flatMap(g => g.members).filter(p => p.shirtNumber != null);
  const coach = (T.squad.squad.find(g => g.title === "coach") || { members: [{}] }).members[0].name || null;
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
    return { id: p.id, name: p.name, short: parts.length > 1 ? parts.slice(1).join(" ") : p.name, num: p.shirtNumber, dob: p.dateOfBirth || null, nat: NAT[p.cname] || p.cname, roles: String(p.positionIdsDesc || "").split(",").map(s => ROLE[s.trim()] || s.trim()).filter(Boolean).join(" / "), grp: grp(pos[0]) || ROLEKEY(p.role ? p.role.key : ""), pct: null, c };
  });
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
  const ok = !checks.some(c => c.level === "fail");
  fixtures.forEach(f => { delete f.compName; });
  const data = { meta: { team: T.details.name, teamId: TEAM, season: SEASON, collected: today, coach, primary: PL, minMinutesRadar: cfg.minMinutesRadar, minMatchesRadar: cfg.minMatchesRadar }, compOrder: compIds.filter(id => comps[id]), comps, fixtures, groups, players };
  return { data, checks, ok };
}
