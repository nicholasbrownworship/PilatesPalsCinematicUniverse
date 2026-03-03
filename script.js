/*
  PPCU Site JS (single-file prototype)
  - Fixes nav links from /players/
  - Highlights active nav item reliably
  - Auto-fills leaderboards from rosters (Battle + Cabinet only)
  - Renders standings even if <thead>/<tbody> are missing
  - Makes leaderboard player names clickable when href is provided
  - Populates Emberforge campaign tracker (NOT a leaderboard)
  - Populates Hall of Champions (Season 1)
  - Populates Nick Cabinet profile fields
*/

const PPCU = {
  season: "Season 1",
  updated: "Manual (prototype)",

  // Canonical rosters (used to auto-build leaderboards)
  rosters: {
    battle: [
      { name: "Nick", href: "players/nick-battle.html" },
      { name: "Josh Burchfield", href: "players/josh-burchfield-battle.html" },
      { name: "Josh Brown", href: "players/josh-brown-battle.html" },
      { name: "Katelyn Brown", href: "players/katelyn-brown-battle.html" },
      { name: "Spencer Hinrichs", href: "players/spencer-hinrichs-battle.html" },
      { name: "Carson Hinrichs", href: "players/carson-hinrichs-battle.html" },
      { name: "Corey Jackson", href: "players/corey-jackson-battle.html" },
    ],
    emberforge: [
      { name: "Nick", href: "players/nick-emberforge.html" },
      { name: "Josh Burchfield", href: "players/josh-burchfield-emberforge.html" },
      { name: "Josh Brown", href: "players/josh-brown-emberforge.html" },
      { name: "Katelyn Brown", href: "players/katelyn-brown-emberforge.html" },
      { name: "Spencer Hinrichs", href: "players/spencer-hinrichs-emberforge.html" },
      { name: "Carson Hinrichs", href: "players/carson-hinrichs-emberforge.html" },
      { name: "Corey Jackson", href: "players/corey-jackson-emberforge.html" },
    ],
    cabinet: [
      { name: "Nick", href: "players/nick-cabinet.html" },
      { name: "Josh Burchfield", href: "players/josh-burchfield-cabinet.html" },
      { name: "Josh Brown", href: "players/josh-brown-cabinet.html" },
      { name: "Katelyn Brown", href: "players/katelyn-brown-cabinet.html" },
      { name: "Spencer Hinrichs", href: "players/spencer-hinrichs-cabinet.html" },
      { name: "Carson Hinrichs", href: "players/carson-hinrichs-cabinet.html" },
      { name: "Corey Jackson", href: "players/corey-jackson-cabinet.html" },
    ],
  },

  divisions: {
    battle: {
      name: "Battle Division",
      blurb:
        "Miniatures league (40k, Legion, MESBG, Armada, Shatterpoint). Season-first standings with career snapshots.",
      leaders: null, // auto-built from roster
    },

    // Emberforge is NOT a leaderboard—it's a campaign tracker.
    emberforge: {
      name: "Emberforge",
      blurb:
        "TTRPG division. Champion is voted (players now; community later). Track narrative impact, spotlight episodes, and legacy.",
      campaign: {
        arc: "Arc 1: TBD",
        lastSession: "TBD",
        spotlight: "TBD",
        mvp: "TBD",
        nextSession: "TBD",
        // optional future fields:
        // champion: "TBD",
      },
    },

    cabinet: {
      name: "The Cabinet",
      blurb:
        "Board game division. Mix of hard stats and table politics in a parliamentary scorecard aesthetic.",
      // Seed a couple rows; missing roster entries are added automatically.
      leaders: [
        {
          player: "Nick",
          href: "players/nick-cabinet.html",
          winPct: "50%",
          games: 6,
          rating: "8.4",
        },
        {
          player: "Josh Burchfield",
          href: "players/josh-burchfield-cabinet.html",
          winPct: "TBD",
          games: 0,
          rating: "TBD",
        },
      ],
    },
  },

  // Hall of Champions (manual until seasons finish; later we can auto-compute)
  hallOfChampions: {
    season1: {
      battleChampion: "TBD",
      emberforgeChampion: "TBD",
      cabinetChampion: "TBD",
    },
  },

  players: {
    nick: {
      cabinet: {
        name: "Nick",
        seat: 3,
        alignment: "Diplomatic / Opportunistic",
        reputation: "Scheming",
        season: {
          gamesPlayed: 6,
          winPct: "50%",
          avgFinish: "2.1",
          endgameConversion: "67%",
          streak: "W1",
          allianceReliability: "Moderate",
          betrayalIncidents: 2,
          coalitionBuilder: "8 / 10",
          riskAppetite: "Controlled",
          influenceIndex: "8.4 / 10",
        },
        career: {
          wins: 14,
          winPct: "58%",
          titles: 0,
          mostPlayed: "Dune",
          infamous:
            "Come-from-behind win in Dune, stealing the final battle from Josh on the last turn.",
        },
      },
    },
  },
};

/* =========================
   NAV FIXES
========================= */

function isInPlayersFolder() {
  return location.pathname.toLowerCase().includes("/players/");
}

function normalizeNavLinks() {
  if (!isInPlayersFolder()) return;

  document.querySelectorAll(".nav a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (
      href.startsWith("http") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("../")
    ) return;

    a.setAttribute("href", "../" + href);
  });
}

function setActiveNav() {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const file = href.split("/").pop();
    if (file === current) a.classList.add("active");
  });
}

/* =========================
   AUTO-FILL LEADERBOARDS
   (Battle + Cabinet only)
========================= */

function ensureDivisionLeaders() {
  // Battle: build from roster if leaders not present
  if (!Array.isArray(PPCU.divisions.battle.leaders) || PPCU.divisions.battle.leaders.length === 0) {
    PPCU.divisions.battle.leaders = (PPCU.rosters.battle || []).map((p, i) => ({
      rank: i + 1,
      player: p.name,
      href: p.href,
      points: 0,
      w: 0,
      l: 0,
      mvp: 0,
    }));
  }

  // Cabinet: keep seeded rows but add missing roster entries
  const seeded = Array.isArray(PPCU.divisions.cabinet.leaders) ? PPCU.divisions.cabinet.leaders : [];
  const existing = new Set(seeded.map((r) => (r.player || "").toLowerCase()));

  const added = (PPCU.rosters.cabinet || [])
    .filter((p) => !existing.has(p.name.toLowerCase()))
    .map((p) => ({
      player: p.name,
      href: p.href,
      winPct: "TBD",
      games: 0,
      rating: "TBD",
    }));

  PPCU.divisions.cabinet.leaders = [...seeded, ...added].map((row, i) => ({
    rank: i + 1,
    ...row,
  }));
}

/* =========================
   HOME SNAPSHOT
========================= */

function fillHome() {
  const elSeason = document.getElementById("seasonLabel");
  if (elSeason) elSeason.textContent = PPCU.season;

  const elUpdated = document.getElementById("updatedLabel");
  if (elUpdated) elUpdated.textContent = PPCU.updated;

  const leadWrap = document.getElementById("homeLeaders");
  if (!leadWrap) return;

  const battleLeader = PPCU.divisions.battle.leaders?.[0]?.player ?? "—";
  const cabinetLeader = PPCU.divisions.cabinet.leaders?.[0]?.player ?? "—";
  const emberArc = PPCU.divisions.emberforge?.campaign?.arc ?? "—";

  leadWrap.innerHTML = [
    { label: "Battle Division", value: battleLeader },
    { label: "Emberforge", value: emberArc },
    { label: "The Cabinet", value: cabinetLeader },
  ]
    .map(
      (b) => `
      <div class="kpi">
        <div class="label">${b.label}</div>
        <div class="value">${b.value}</div>
      </div>
    `
    )
    .join("");
}

/* =========================
   TABLE RENDERING
========================= */

function ensureTheadTbody(table) {
  let thead = table.querySelector("thead");
  let tbody = table.querySelector("tbody");
  if (!thead) {
    thead = document.createElement("thead");
    table.appendChild(thead);
  }
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  return { thead, tbody };
}

function fillTable(tableId, rows, columns) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const { thead, tbody } = ensureTheadTbody(table);

  thead.innerHTML = "<tr>" + columns.map((c) => `<th>${c.label}</th>`).join("") + "</tr>";

  if (!Array.isArray(rows) || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columns.length}">No data yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map((r, i) => {
      const isTop = r.rank === 1 || i === 0;
      return `<tr class="${isTop ? "is-top" : ""}">
        ${columns
          .map((c) => {
            const val = r[c.key] ?? "";
            if (c.key === "player") {
              const href = r.href;
              if (href) return `<td><a href="${href}">${val}</a></td>`;
              return `<td>${val}</td>`;
            }
            return `<td>${val}</td>`;
          })
          .join("")}
      </tr>`;
    })
    .join("");
}

function fillDivisionPages() {
  // Battle leaderboard
  fillTable("battleStandings", PPCU.divisions.battle.leaders, [
    { key: "rank", label: "#" },
    { key: "player", label: "Player" },
    { key: "points", label: "Pts" },
    { key: "w", label: "W" },
    { key: "l", label: "L" },
    { key: "mvp", label: "MVP" },
  ]);

  // Cabinet leaderboard
  fillTable("cabinetStandings", PPCU.divisions.cabinet.leaders, [
    { key: "rank", label: "#" },
    { key: "player", label: "Player" },
    { key: "winPct", label: "Win %" },
    { key: "games", label: "Games" },
    { key: "rating", label: "Influence" },
  ]);
}

/* =========================
   EMBERFORGE CAMPAIGN TRACKER (KPIs)
   IDs expected on emberforge.html:
     efArc, efLast, efSpotlight, efMvp, efNext
========================= */

function fillEmberforgeCampaign() {
  const c = PPCU.divisions.emberforge?.campaign;
  if (!c) return;

  const map = {
    efArc: c.arc,
    efLast: c.lastSession,
    efSpotlight: c.spotlight,
    efMvp: c.mvp,
    efNext: c.nextSession,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* =========================
   HALL OF CHAMPIONS (Season 1)
   IDs expected on hall-of-champions.html:
     hocBattleS1, hocEmberS1, hocCabinetS1
========================= */

function fillHallOfChampions() {
  const s1 = PPCU.hallOfChampions?.season1;
  if (!s1) return;

  const map = {
    hocBattleS1: s1.battleChampion,
    hocEmberS1: s1.emberforgeChampion,
    hocCabinetS1: s1.cabinetChampion,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "TBD";
  });
}

/* =========================
   PLAYER PROFILE POPULATION
========================= */

function fillNickCabinetProfile() {
  const d = PPCU.players.nick?.cabinet;
  if (!d) return;

  const map = {
    pName: d.name,
    pSeat: d.seat,
    pAlign: d.alignment,
    pRep: d.reputation,
    sGames: d.season.gamesPlayed,
    sWin: d.season.winPct,
    sAvg: d.season.avgFinish,
    sEnd: d.season.endgameConversion,
    sStreak: d.season.streak,
    sAllies: d.season.allianceReliability,
    sBetray: d.season.betrayalIncidents,
    sCoal: d.season.coalitionBuilder,
    sRisk: d.season.riskAppetite,
    sIndex: d.season.influenceIndex,
    cWins: d.career.wins,
    cWin: d.career.winPct,
    cTitles: d.career.titles,
    cMost: d.career.mostPlayed,
    cInf: d.career.infamous,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  normalizeNavLinks();
  ensureDivisionLeaders(); // build Battle + Cabinet before rendering
  setActiveNav();
  fillHome();
  fillDivisionPages();
  fillEmberforgeCampaign();
  fillHallOfChampions();
  fillNickCabinetProfile();
});
