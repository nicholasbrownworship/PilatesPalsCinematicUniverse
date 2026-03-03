/*
  PPCU Site JS (lightweight)
  - Highlights active nav item
  - Populates sample standings + player cards from a single data object
  - Designed to be replaced later with JSON files / automation
*/

const PPCU = {
  season: "Season 1",
  updated: "Manual (prototype)",
  divisions: {
    battle: {
      name: "Battle Division",
      blurb: "Miniatures league (40k, Legion, MESBG, Armada, Shatterpoint). Season-first standings with career snapshots.",
      leaders: [
        { rank: 1, player: "TBD", points: 0, w: 0, l: 0, mvp: 0 },
      ]
    },
    emberforge: {
      name: "Emberforge",
      blurb: "TTRPG division. Champion is voted (players now, community later). Track narrative impact, spotlight, and legacy.",
      leaders: [
        { rank: 1, player: "TBD", impact: 0, votes: 0 },
      ]
    },
    cabinet: {
      name: "The Cabinet",
      blurb: "Board game division. Mix of hard stats and table politics in a parliamentary scorecard aesthetic.",
      leaders: [
        { rank: 1, player: "Nick", winPct: "50%", games: 6, rating: "8.4" },
        { rank: 2, player: "Josh", winPct: "TBD", games: 0, rating: "TBD" },
      ]
    }
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
          infamous: "Come-from-behind win in Dune, stealing the final battle from Josh on the last turn."
        }
      }
    }
  }
};

function setActiveNav(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if(href === path) a.classList.add('active');
  });
}

function fillHome(){
  const elSeason = document.getElementById('seasonLabel');
  if(elSeason) elSeason.textContent = PPCU.season;

  const elUpdated = document.getElementById('updatedLabel');
  if(elUpdated) elUpdated.textContent = PPCU.updated;

  const leadWrap = document.getElementById('homeLeaders');
  if(!leadWrap) return;

  const blocks = [
    { accent:"Battle Division", line:"Leader: " + (PPCU.divisions.battle.leaders[0]?.player ?? "TBD") },
    { accent:"Emberforge", line:"Leader: " + (PPCU.divisions.emberforge.leaders[0]?.player ?? "TBD") },
    { accent:"The Cabinet", line:"Leader: " + (PPCU.divisions.cabinet.leaders[0]?.player ?? "TBD") },
  ];

  leadWrap.innerHTML = blocks.map(b => `
    <div class="kpi">
      <div class="label">${b.accent}</div>
      <div class="value">${b.line}</div>
    </div>
  `).join('');
}

function fillTable(tableId, rows, columns){
  const table = document.getElementById(tableId);
  if(!table) return;

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  if(!thead || !tbody) return;

  thead.innerHTML = "<tr>" + columns.map(c => `<th>${c.label}</th>`).join('') + "</tr>";
  tbody.innerHTML = rows.map(r => "<tr>" + columns.map(c => `<td>${r[c.key] ?? ""}</td>`).join('') + "</tr>").join('');
}

function fillDivisionPages(){
  fillTable("battleStandings", PPCU.divisions.battle.leaders, [
    { key:"rank", label:"#"},
    { key:"player", label:"Player"},
    { key:"points", label:"Pts"},
    { key:"w", label:"W"},
    { key:"l", label:"L"},
    { key:"mvp", label:"MVP"},
  ]);

  fillTable("emberStandings", PPCU.divisions.emberforge.leaders, [
    { key:"rank", label:"#"},
    { key:"player", label:"Player"},
    { key:"impact", label:"Impact"},
    { key:"votes", label:"Votes"},
  ]);

  fillTable("cabinetStandings", PPCU.divisions.cabinet.leaders, [
    { key:"rank", label:"#"},
    { key:"player", label:"Player"},
    { key:"winPct", label:"Win %"},
    { key:"games", label:"Games"},
    { key:"rating", label:"Influence"},
  ]);
}

function fillNickCabinetProfile(){
  const d = PPCU.players.nick?.cabinet;
  if(!d) return;

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

  Object.entries(map).forEach(([id,val]) => {
    const el = document.getElementById(id);
    if(el) el.textContent = val;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  fillHome();
  fillDivisionPages();
  fillNickCabinetProfile();
});
