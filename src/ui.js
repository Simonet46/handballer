/**
 * Capa de interfaz de HANDBALLER. El motor (src/game-engine.js) no toca el DOM;
 * acá se dibuja lo que devuelve y se le mandan las decisiones del jugador.
 */
import {
  PACES,
  POSITIONS,
  advanceCareer,
  createCareer,
  createRng,
  loadUniverse,
  startableCountries,
} from "./game-engine.js";
import { attachCrestFallback, clubColor, crestSrc } from "./crest.js";
import { createTranslator, honourName } from "./i18n.js";
import { drawShareCard, shareCareer } from "./share.js";

const locale = document.documentElement.lang || "es";
const t = createTranslator(locale);

const el = (id) => document.getElementById(id);
const view = {
  setup: el("setup"),
  career: el("career"),
  result: el("result"),
};

let universe = null;
let career = null;
let rng = null;
let busy = false;

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

async function boot() {
  const [leagues, countries] = await Promise.all([
    fetch("data/leagues.json").then((r) => r.json()),
    fetch("data/countries.json").then((r) => r.json()),
  ]);
  universe = loadUniverse({ leagues, countries });
  renderSetup();
  el("app").dataset.ready = "1";
}

// ---------------------------------------------------------------------------
// Pantalla 1: creación del jugador
// ---------------------------------------------------------------------------

const form = { lastName: "", number: 7, hand: "Diestra", country: "ARG", position: "CB", pace: 2 };

function renderSetup() {
  const countries = startableCountries();
  form.country = countries.some((c) => c.code === form.country) ? form.country : countries[0].code;

  el("country-options").innerHTML = countries
    .map((country) => chip("country", country.code, `${country.flag} ${t(`countries.${country.code}`) || country.name}`))
    .join("");

  renderCourt();

  el("pace-options").innerHTML = PACES
    .map((pace) => chip("pace", pace.value, t(`paces.${pace.value}.name`), null, t(`paces.${pace.value}.detail`)))
    .join("");

  el("hand-options").innerHTML =
    chip("hand", "Diestra", t("ui.handRight")) + chip("hand", "Zurda", t("ui.handLeft"));

  for (const group of document.querySelectorAll("[data-group]")) {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;
      const key = group.dataset.group;
      form[key] = key === "pace" ? Number(button.dataset.value) : button.dataset.value;
      syncChips();
      renderPreview();
    });
  }

  el("lastName").addEventListener("input", (event) => {
    form.lastName = event.target.value.toUpperCase().slice(0, 16);
    event.target.value = form.lastName;
    renderPreview();
  });
  el("number").addEventListener("input", (event) => {
    form.number = Math.max(1, Math.min(99, Number(event.target.value) || 1));
    renderPreview();
  });
  el("start").addEventListener("click", startCareer);

  syncChips();
  renderPreview();
}

// Media pista de balonmano vista desde arriba, con las 7 posiciones donde
// juegan de verdad: portería abajo, los seis de campo arriba en ataque.
// left/top en %, sobre el rectángulo de la pista.
const COURT_SPOTS = {
  LW: { left: 12, top: 26 }, LB: { left: 30, top: 44 }, CB: { left: 50, top: 50 },
  RB: { left: 70, top: 44 }, RW: { left: 88, top: 26 },
  PV: { left: 50, top: 22 }, GK: { left: 50, top: 84 },
};

function renderCourt() {
  el("position-court").innerHTML = POSITIONS.map((position) => {
    const spot = COURT_SPOTS[position.code] || { left: 50, top: 50 };
    return `<button type="button" data-value="${position.code}" class="spot"
      style="left:${spot.left}%;top:${spot.top}%">${position.code}</button>`;
  }).join("");
}

function chip(group, value, label, badge, detail) {
  return `<button type="button" data-value="${value}" class="chip${detail ? " chip-wide" : ""}">
    ${badge ? `<span class="chip-badge">${badge}</span>` : ""}
    <span class="chip-label">${label}</span>
    ${detail ? `<span class="chip-detail">${detail}</span>` : ""}
  </button>`;
}

function syncChips() {
  for (const group of document.querySelectorAll("[data-group]")) {
    const current = String(form[group.dataset.group]);
    for (const button of group.querySelectorAll("button[data-value]")) {
      button.setAttribute("aria-pressed", String(button.dataset.value === current));
    }
  }
}

function renderPreview() {
  const country = startableCountries().find((c) => c.code === form.country);
  el("preview-name").textContent = form.lastName || t("ui.lastNamePlaceholder");
  el("preview-number").textContent = form.number;
  el("preview-flag").textContent = country?.flag || "";
  el("preview-position").textContent = t(`positions.${form.position}`);
  el("position-pick").textContent = t(`positions.${form.position}`);
  el("start").disabled = false;
}

function startCareer() {
  rng = createRng(Date.now() ^ Math.floor(Math.random() * 1e9));
  career = createCareer({ ...form, lastName: form.lastName || t("ui.lastNamePlaceholder") }, rng);
  advanceCareer(career, null, rng);
  show("career");
  renderCareer();
}

// ---------------------------------------------------------------------------
// Pantalla 2: la carrera
// ---------------------------------------------------------------------------

function renderCareer() {
  const player = career.player;
  el("hud-name").textContent = player.lastName;
  el("hud-number").textContent = player.number;
  el("hud-position").textContent = t(`positions.${player.position}`);
  el("hud-flag").textContent = player.flag;

  const club = career.club;
  el("hud-club").textContent = club.freeAgent ? t("ui.freeAgent") : `${club.flag || ""} ${club.name}`.trim();
  el("hud-league").textContent = club.freeAgent ? "" : `${club.leagueName} · ${club.countryName}`;
  el("hud-age").textContent = career.age;
  el("hud-rating").textContent = Math.round(career.rating);
  el("hud-role").textContent = t(`roles.${career.squadRole}`);

  const totals = career.totals;
  const keeper = player.position === "GK";
  el("hud-stat-1-label").textContent = t("ui.matches");
  el("hud-stat-1").textContent = totals.matches;
  el("hud-stat-2-label").textContent = keeper ? t("ui.saves") : t("ui.goals");
  el("hud-stat-2").textContent = keeper ? totals.saves : totals.goals;
  el("hud-stat-3-label").textContent = keeper ? t("ui.caps") : t("ui.assists");
  el("hud-stat-3").textContent = keeper ? totals.caps : totals.assists;

  const span = career.retirementAge - 17;
  el("progress").style.setProperty("--p", `${Math.round((totals.seasons / span) * 100)}%`);
  el("season-label").textContent = `${t("ui.season")} ${career.seasonYear}`;

  renderLastBlock();
  renderDecision();
}

function renderLastBlock() {
  const block = career.latestBlock || [];
  const box = el("recap");
  if (!block.length) {
    box.innerHTML = "";
    box.hidden = true;
    return;
  }
  const keeper = career.player.position === "GK";
  box.hidden = false;
  box.innerHTML = `<h3>${t("ui.seasonSummary")}</h3>` + block.map((season) => `
    <div class="recap-row">
      <span class="recap-year">${season.year}</span>
      <span class="recap-club">${season.club}</span>
      <span class="recap-stat">${season.matches} ${t("ui.matches")}</span>
      <span class="recap-stat">${keeper ? `${season.saves} ${t("ui.saves")}` : `${season.goals} ${t("ui.goals")}`}</span>
      ${season.swap ? `<span class="tag ${season.swap === "encajo" ? "tag-good" : "tag-warn"}">${t(`swap.${season.swap}`)}</span>` : ""}
      ${season.scandal ? `<span class="tag tag-bad">⚠ ${t(`scandals.${season.scandal}`)}</span>` : ""}
      ${season.injured ? `<span class="tag tag-warn">${t("ui.injured")}</span>` : ""}
      ${season.loan ? `<span class="tag">${t("ui.loan")}</span>` : ""}
      ${season.honours.map((h) => `<span class="tag tag-gold">🏆 ${honourName(t, h)}</span>`).join("")}
    </div>`).join("");
}

function decisionCopy(event) {
  const fromMarket = t(`market.${marketKey(event)}`);
  if (fromMarket && typeof fromMarket === "object") return fromMarket;
  const custom = t(`events.${event.id}`);
  return custom && typeof custom === "object"
    ? custom
    : { eyebrow: event.eyebrow, title: event.title, body: event.body };
}

function marketKey(event) {
  if (event.id === "inferiores") return "inferiores";
  if (event.id.startsWith("mercado")) return "mercado";
  if (event.id.startsWith("contrato")) return "contrato";
  if (event.id === "ultimo-contrato") return "ultimo";
  return null;
}

function choiceCopy(event, choice) {
  const custom = t(`events.${event.id}.choices.${choice.id}`);
  if (custom && typeof custom === "object") {
    // Las opciones de club dentro de un evento narrativo muestran a quién vas.
    if (choice.club) {
      return {
        ...custom,
        label: `${choice.club.flag || ""} ${custom.label}`.trim(),
        detail: `${choice.club.name} · ${custom.detail}`,
        role: t(`roles.${choice.projectedRole}`),
      };
    }
    return custom;
  }
  if (choice.action === "retire") return t("market.retire");
  if (choice.club) {
    const club = choice.club;
    return {
      label: `${club.flag || ""} ${choice.label}`.trim(),
      detail: [t(`market.actions.${choice.action}`), club.leagueName, club.countryName]
        .filter(Boolean).join(" · "),
      role: t(`roles.${choice.projectedRole}`),
    };
  }
  return { label: choice.label, detail: choice.detail };
}

function renderDecision() {
  const event = career.pendingEvent;
  if (!event) return;
  const copy = decisionCopy(event);
  el("decision-eyebrow").textContent = copy.eyebrow || "";
  el("decision-title").textContent = copy.title || "";
  el("decision-body").textContent = copy.body || "";

  const options = el("decision-options");
  options.innerHTML = "";
  for (const choice of event.choices) {
    const copyFor = choiceCopy(event, choice);
    const button = document.createElement("button");
    button.type = "button";
    button.className = choice.club ? "option option-club" : "option";
    button.dataset.id = choice.id;

    if (choice.club) {
      const image = document.createElement("img");
      image.className = "option-crest";
      image.alt = "";
      image.loading = "lazy";
      attachCrestFallback(image, choice.club);
      button.append(image);
      button.style.setProperty("--club", clubColor(choice.club));
    }

    const text = document.createElement("span");
    text.className = "option-text";
    text.innerHTML = `<strong>${copyFor.label}</strong><span>${copyFor.detail || ""}</span>`;
    button.append(text);

    if (copyFor.role) {
      const role = document.createElement("span");
      role.className = "option-role";
      role.textContent = copyFor.role;
      button.append(role);
    }

    button.addEventListener("click", () => choose(choice.id));
    options.append(button);
  }
}


// ---------------------------------------------------------------------------
// Transición entre decisiones: qué te pasó por haber elegido eso
// ---------------------------------------------------------------------------

const ROLE_RANK = { juvenil: 0, rotacion: 1, titular: 2, franquicia: 3 };

/** Foto del estado justo antes de simular, para poder comparar después. */
function snapshot() {
  return {
    clubId: career.club.id,
    prestige: career.club.prestige ?? 3,
    rating: career.rating,
    role: ROLE_RANK[career.squadRole] ?? 0,
    caps: career.totals.caps,
    position: career.player.position,
    year: career.seasonYear,
  };
}

/**
 * Traduce el bloque de temporadas recién simulado a una lista corta de cosas
 * que pasaron. Es el feedback de la decisión: sin esto, elegir era apretar un
 * botón y ver números cambiar sin saber por qué.
 */
function summarize(before) {
  const block = career.latestBlock || [];
  if (!block.length) return [];
  const beats = [];

  // Cambio de club, y si eso fue subir o bajar de categoría.
  if (career.club.id !== before.clubId && !career.club.freeAgent) {
    const now = career.club.prestige ?? 3;
    const kind = now > before.prestige ? "up" : now < before.prestige ? "down" : "move";
    beats.push({
      kind,
      icon: kind === "up" ? "⬆" : kind === "down" ? "⬇" : "✈",
      text: t(`beats.${kind}`, { club: career.club.name, league: career.club.leagueName }),
    });
  }

  for (const season of block) {
    for (const honour of season.honours) {
      const major = ["worlds", "olympics", "champions"].includes(honour.key);
      beats.push({
        kind: "trophy",
        icon: major ? "🏆" : honour.key === "ihf-player" ? "🥇" : "🏅",
        text: `${honourName(t, honour)} · ${season.year}`,
        big: major,
      });
    }
    if (season.scandal) {
      beats.push({ kind: "bad", icon: "⚠", text: t(`scandals.${season.scandal}`), big: true });
    }
    if (season.injured) {
      beats.push({ kind: "bad", icon: "🚑", text: t("beats.injured", { year: season.year }) });
    }
    if (season.swap) {
      beats.push({
        kind: season.swap === "encajo" ? "good" : "bad",
        icon: "🔁",
        text: t(`swap.${season.swap}`),
      });
    }
  }

  const rating = Math.round(career.rating - before.rating);
  if (rating !== 0) {
    beats.push({
      kind: rating > 0 ? "good" : "bad",
      icon: rating > 0 ? "📈" : "📉",
      text: t(rating > 0 ? "beats.better" : "beats.worse", { n: Math.abs(rating) }),
    });
  }

  const role = ROLE_RANK[career.squadRole] ?? 0;
  if (role > before.role) {
    beats.push({ kind: "good", icon: "⭐", text: t("beats.role", { role: t(`roles.${career.squadRole}`) }) });
  }

  const caps = career.totals.caps - before.caps;
  if (caps > 0 && before.caps === 0) {
    beats.push({ kind: "good", icon: "🌍", text: t("beats.debut"), big: true });
  }

  // Cinco es lo que se lee de un vistazo. Lo grande manda.
  return beats.sort((a, b) => (b.big ? 1 : 0) - (a.big ? 1 : 0)).slice(0, 5);
}

let transitionTimer = null;

function showTransition(before, done) {
  const beats = summarize(before);
  const box = el("transition");
  if (!beats.length) {
    done();
    return;
  }

  const block = career.latestBlock;
  const span = block.length > 1
    ? `${block[0].year}–${block.at(-1).year}`
    : `${block[0].year}`;

  box.innerHTML =
    `<p class="transition-years">${span}</p>` +
    beats.map((beat, index) =>
      `<div class="beat beat-${beat.kind}${beat.big ? " beat-big" : ""}" style="--i:${index}">
         <span class="beat-icon">${beat.icon}</span>
         <span class="beat-text">${beat.text}</span>
       </div>`).join("") +
    `<p class="transition-hint">${t("beats.tap")}</p>`;

  // Mientras se cuenta lo que pasó, la decisión ya contestada y el resumen
  // viejo se van: si no, quedan en pantalla y confunden.
  el("recap").hidden = true;
  document.querySelector(".decision").hidden = true;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "center" });

  const finish = () => {
    clearTimeout(transitionTimer);
    box.removeEventListener("click", finish);
    box.hidden = true;
    document.querySelector(".decision").hidden = false;
    done();
  };
  box.addEventListener("click", finish);
  transitionTimer = setTimeout(finish, 1400 + beats.length * 420);
}

function choose(choiceId) {
  if (busy) return;
  busy = true;
  const before = snapshot();
  advanceCareer(career, choiceId, rng);

  showTransition(before, () => {
    busy = false;
    if (career.ended) {
      show("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderResult();
    } else {
      renderCareer();
      view.career.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// ---------------------------------------------------------------------------
// Pantalla 3: resultado
// ---------------------------------------------------------------------------

function renderResult() {
  const keeper = career.player.position === "GK";
  const totals = career.totals;

  el("verdict-title").textContent = t(`verdicts.${career.verdict.key}.title`);
  el("verdict-line").textContent = t(`verdicts.${career.verdict.key}.line`);
  el("result-name").textContent = `${career.player.flag} ${career.player.lastName}`;
  el("result-meta").textContent =
    `${t(`positions.${career.player.position}`)} · ${totals.seasons} ${t("ui.season").toLowerCase()}s`;
  el("result-score").textContent = career.score;

  // El salto es el componente más grande del puntaje, así que se cuenta aparte.
  const climbBox = el("result-climb");
  const detail = career.climbDetail || {};
  if (career.climb > 0 && detail.from && detail.to) {
    climbBox.hidden = false;
    climbBox.innerHTML = `<span>${t("climb.label")}</span>` +
      `<strong>+${career.climb}</strong>` +
      `<em>${t("climb.line", { from: detail.from, to: detail.to })}</em>`;
  } else {
    climbBox.hidden = true;
  }

  const stats = [
    [t("ui.matches"), totals.matches],
    keeper ? [t("ui.saves"), totals.saves] : [t("ui.goals"), totals.goals],
    keeper ? [t("ui.caps"), totals.caps] : [t("ui.assists"), totals.assists],
    [t("ui.peak"), Math.round(career.maxRating)],
  ];
  el("result-stats").innerHTML = stats
    .map(([label, value]) => `<div><strong>${value}</strong><span>${label}</span></div>`)
    .join("");

  renderTimeline(keeper);

  const honours = [...career.trophies, ...career.awards];
  const counted = new Map();
  for (const honour of honours) {
    const name = honourName(t, honour);
    counted.set(name, (counted.get(name) || 0) + 1);
  }
  el("honours").innerHTML = counted.size
    ? [...counted].sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `<li><span class="honour-count">${count}×</span> ${name}</li>`).join("")
    : `<li class="muted">${t("ui.noHonours")}</li>`;

  drawShareCard(el("share-canvas"), career, t);
  el("share").onclick = () => shareCareer(career, t, el("share-canvas"), el("share-feedback"));
  el("play-again").onclick = () => { show("setup"); window.scrollTo({ top: 0 }); };
}


// ---------------------------------------------------------------------------
// La carrera vertical: cada club por el que pasaste, con tus números ahí, y
// la fila de la selección al final. Es la pantalla que la gente comparte.
// ---------------------------------------------------------------------------

const HONOUR_ICON = {
  worlds: "🏆", olympics: "🥇", champions: "⭐", "european-league": "🎖",
  euro: "🌍", continental: "🌍", league: "🛡", cup: "🏅",
  "ihf-player": "👑", "top-scorer": "🎯", "all-star": "⭐",
};

function renderTimeline(keeper) {
  const clubById = new Map();
  for (const league of universeLeagues()) for (const team of league.teams) clubById.set(team.id, team);

  // Agrupamos temporadas consecutivas en el mismo club en un "tramo", y
  // sumamos los números de ese tramo. Igual que Copero: una fila por etapa.
  const stints = [];
  for (const season of career.timeline) {
    const last = stints.at(-1);
    if (last && last.clubId === season.clubId) {
      last.to = season.year;
      last.endAge = season.age;
      last.matches += season.matches;
      last.goals += season.goals;
      last.assists += season.assists;
      last.saves += season.saves;
      last.rating = season.rating;
      for (const honour of season.honours) last.honours.push(honour);
    } else {
      stints.push({
        clubId: season.clubId, club: season.club, league: season.league,
        country: season.country, startAge: season.age, endAge: season.age,
        from: season.year, to: season.year, rating: season.rating,
        matches: season.matches, goals: season.goals, assists: season.assists,
        saves: season.saves, loan: season.loan, honours: [...season.honours],
      });
    }
  }

  const rows = stints.map((stint) => {
    const club = clubById.get(stint.clubId) || { id: stint.clubId, name: stint.club };
    const trophies = uniqueHonourIcons(stint.honours);
    const prod = keeper ? stint.saves : stint.goals;
    const third = keeper ? "—" : stint.assists;
    return `<li class="tl-row${stint.loan ? " tl-loan" : ""}">
      <span class="tl-age">${stint.startAge}</span>
      <img class="tl-crest" src="${crestSrc(club)}" alt="" loading="lazy">
      <span class="tl-club">
        <span class="tl-name">${stint.loan ? "↳ " : ""}${club.flag || ""} ${stint.club}</span>
        ${trophies ? `<span class="tl-trophies">${trophies}</span>` : ""}
      </span>
      <span class="tl-ovr">${Math.round(stint.rating)}</span>
      <span class="tl-stat">${stint.matches}</span>
      <span class="tl-stat">${prod}</span>
      <span class="tl-stat">${third}</span>
    </li>`;
  }).join("");

  // Fila de la selección, con sus propios números y sus copas internacionales.
  const totals = career.totals;
  let nationalRow = "";
  if (totals.caps > 0) {
    const intl = uniqueHonourIcons(
      career.trophies.filter((h) => ["worlds", "olympics", "euro", "continental"].includes(h.key))
    );
    const prod = keeper ? "—" : totals.nationalGoals;
    const third = keeper ? "—" : totals.nationalAssists;
    nationalRow = `<li class="tl-row tl-national">
      <span class="tl-age"></span>
      <img class="tl-crest" src="${flagCrest(career.player)}" alt="" loading="lazy">
      <span class="tl-club">
        <span class="tl-name">${career.player.flag || ""} ${t(`countries.${career.player.country}`) || career.player.countryName}</span>
        ${intl ? `<span class="tl-trophies">${intl}</span>` : ""}
      </span>
      <span class="tl-ovr"></span>
      <span class="tl-stat">${totals.caps}</span>
      <span class="tl-stat">${prod}</span>
      <span class="tl-stat">${third}</span>
    </li>`;
  }

  el("timeline").innerHTML =
    `<li class="tl-head">
       <span class="tl-age">${t("ui.age")}</span>
       <span class="tl-club-h">${t("ui.club")}</span>
       <span class="tl-ovr">${t("ui.rating")}</span>
       <span class="tl-stat">${t("ui.matches")}</span>
       <span class="tl-stat">${keeper ? t("ui.savesShort") : t("ui.goalsShort")}</span>
       <span class="tl-stat">${keeper ? "" : t("ui.assistsShort")}</span>
     </li>` + rows + nationalRow;
}

function uniqueHonourIcons(honours) {
  const seen = new Set();
  const icons = [];
  for (const honour of honours) {
    if (seen.has(honour.key)) continue;
    seen.add(honour.key);
    if (HONOUR_ICON[honour.key]) icons.push(HONOUR_ICON[honour.key]);
  }
  return icons.slice(0, 4).join("");
}

/** Bandera del país como escudo circular para la fila de la selección. */
function flagCrest(player) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="30" fill="#1e2833"/>` +
    `<text x="32" y="44" font-size="34" text-anchor="middle">${player.flag || "🏳"}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function universeLeagues() {
  return window.__leagues || [];
}

// ---------------------------------------------------------------------------

function show(stage) {
  for (const [name, node] of Object.entries(view)) node.hidden = name !== stage;
}

fetch("data/leagues.json").then((r) => r.json()).then((leagues) => { window.__leagues = leagues; });
boot().catch((error) => {
  console.error(error);
  el("app").innerHTML = `<p class="error">No se pudo cargar el juego. Recargá la página.</p>`;
});
