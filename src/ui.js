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

// Cada rama tiene su propio universo de clubes: leagues.json (masculino) y
// leagues-f.json (femenino). Se cargan una sola vez y se cambia al elegir.
const datasets = { M: null, F: null };
let activeLeagues = [];
let countriesData = null;

async function loadRama(rama) {
  const file = rama === "F" ? "data/leagues-f.json" : "data/leagues.json";
  if (!datasets[rama]) {
    datasets[rama] = await fetch(file).then((r) => r.json());
  }
  activeLeagues = datasets[rama];
  universe = loadUniverse({ leagues: activeLeagues, countries: countriesData });
}

async function boot() {
  countriesData = await fetch("data/countries.json").then((r) => r.json());
  await loadRama(form.rama);
  renderSetup();
  el("app").dataset.ready = "1";
}

// ---------------------------------------------------------------------------
// Pantalla 1: creación del jugador
// ---------------------------------------------------------------------------

const form = { lastName: "", number: 7, rama: "M", hand: "Diestra", country: "ARG", position: "CB", pace: 2 };

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

  el("rama-options").innerHTML =
    chip("rama", "M", t("ui.ramaM")) + chip("rama", "F", t("ui.ramaF"));

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

// ---------------------------------------------------------------------------
// La media pista de balonmano, en perspectiva y a escala real.
//
// Todo se calcula en METROS sobre una pista reglamentaria (20 m de ancho, arco
// de 3 m) y después se proyecta a la vista inclinada. Así el área de 6 m, la
// línea de 9 m y cada puesto caen exactamente donde caen en una cancha.
// ---------------------------------------------------------------------------

const COURT = {
  // lienzo SVG (con aire a los costados para que los extremos entren enteros)
  topY: 48, bottomY: 232, topHalf: 96, bottomHalf: 168, centerX: 200,
  // pista real
  widthM: 20, depthM: 14, goalHalfM: 1.5,
};

/** (u, v) normalizados -> punto en el SVG. v = 0 lejos, v = 1 línea de gol. */
function project(u, v) {
  const y = COURT.topY + (COURT.bottomY - COURT.topY) * v;
  const half = COURT.topHalf + (COURT.bottomHalf - COURT.topHalf) * v;
  return [COURT.centerX + (u - 0.5) * 2 * half, y];
}

/** metros (x desde el centro, d desde la línea de gol) -> punto en el SVG. */
function meters(xm, dm) {
  return project(0.5 + xm / COURT.widthM, 1 - dm / COURT.depthM);
}

/**
 * El área de X metros no es un semicírculo: son dos cuartos de círculo
 * alrededor de cada poste unidos por una recta. Así es en la cancha y así se
 * dibuja acá.
 */
function areaPath(radius, steps = 26) {
  const post = COURT.goalHalfM;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = (Math.PI / 2) * (i / steps);
    points.push([-post - radius * Math.cos(a), radius * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const a = (Math.PI / 2) * (i / steps);
    points.push([post + radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return points.map(([xm, dm], i) => {
    const [x, y] = meters(xm, dm);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

// Dónde se para cada puesto en un ataque 3-3, en metros: los extremos abiertos
// contra la banda casi sobre los 6 m, el pivote de espaldas en el área, los
// laterales y el central sobre los 9 m.
const SPOT_METERS = {
  GK: [0, 1.7], PV: [0, 6.4],
  // La cancha se ve desde atrás del arco, así que los lados van espejados:
  // el lateral izquierdo del ataque queda a la derecha de la pantalla.
  LW: [8.4, 2.9], RW: [-8.4, 2.9],
  LB: [5.4, 10.0], CB: [0, 10.8], RB: [-5.4, 10.0],
};

function renderCourt() {
  const [tl, tr] = [project(0, 0), project(1, 0)];
  const [bl, br] = [project(0, 1), project(1, 1)];
  const depth = 26;                       // grosor del "bloque" de la pista
  const [gl, gr] = [meters(-COURT.goalHalfM, 0), meters(COURT.goalHalfM, 0)];

  const svg = `<svg class="court-svg" viewBox="0 0 400 300" aria-hidden="true">
    <defs>
      <!-- La línea de 9 m llega a 10,5 m del centro y la media cancha mide 10:
           en la cancha real se corta en la banda, así que acá también. -->
      <clipPath id="pitch">
        <polygon points="${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${bl[0]},${bl[1]}"/>
      </clipPath>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ef7346"/><stop offset="1" stop-color="#d9482c"/>
      </linearGradient>
      <linearGradient id="area6" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c33a44"/><stop offset="1" stop-color="#a62b38"/>
      </linearGradient>
    </defs>

    <!-- caras laterales: le dan el volumen de la foto -->
    <polygon points="${bl[0]},${bl[1]} ${br[0]},${br[1]} ${br[0]},${br[1] + depth} ${bl[0]},${bl[1] + depth}" fill="#7d2231"/>
    <polygon points="${tl[0]},${tl[1]} ${bl[0]},${bl[1]} ${bl[0]},${bl[1] + depth} ${tl[0]},${tl[1] + depth * 0.55}" fill="#8d2836"/>
    <polygon points="${tr[0]},${tr[1]} ${br[0]},${br[1]} ${br[0]},${br[1] + depth} ${tr[0]},${tr[1] + depth * 0.55}" fill="#8d2836"/>

    <!-- superficie -->
    <polygon points="${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${bl[0]},${bl[1]}" fill="url(#floor)"/>

    <g clip-path="url(#pitch)">
      <!-- área de 6 m -->
      <path d="${areaPath(6)} Z" fill="url(#area6)"/>
      <path d="${areaPath(6)}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>
      <!-- línea de 9 m, punteada -->
      <path d="${areaPath(9)}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".9"/>
      <!-- marca de siete metros -->
      <line x1="${meters(-0.5, 7)[0]}" y1="${meters(0, 7)[1]}"
            x2="${meters(0.5, 7)[0]}" y2="${meters(0, 7)[1]}" stroke="#fff" stroke-width="2.4"/>
    </g>

    <!-- líneas de banda y de fondo -->
    <polygon points="${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${bl[0]},${bl[1]}"
             fill="none" stroke="#fff" stroke-width="2.4"/>
    <!-- arco -->
    <rect x="${gl[0]}" y="${gl[1] - 2}" width="${gr[0] - gl[0]}" height="13"
          fill="none" stroke="#fff" stroke-width="2.6"/>
  </svg>`;

  const spots = POSITIONS.map((position) => {
    const [xm, dm] = SPOT_METERS[position.code] || [0, 7];
    const [x, y] = meters(xm, dm);
    return `<button type="button" data-value="${position.code}" class="spot"
      style="left:${(x / 400 * 100).toFixed(2)}%;top:${(y / 300 * 100).toFixed(2)}%"
      title="${t(`positions.${position.code}`)}">${position.code}</button>`;
  }).join("");

  el("position-court").innerHTML = svg + spots;
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

async function startCareer() {
  // La rama elegida define el universo: se garantiza acá, por si el dataset
  // femenino todavía no terminó de bajar cuando apretaron "Empezar".
  await loadRama(form.rama);
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

  renderCareerTimeline();
  renderDecision();
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
    // Si la opción es un club, el club ES el título. En el celu se veía
    // "Aceptar la oferta" con un escudo suelto y nadie sabía a dónde iba.
    if (choice.club) {
      return {
        label: `${choice.club.flag || ""} ${choice.club.name}`.trim(),
        detail: `${custom.label} · ${custom.detail}`,
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
    if (season.maternity) {
      beats.push({ kind: "good", icon: "👶", text: t("beats.maternity", { year: season.year }), big: true });
    }
    if (season.injured) {
      beats.push({ kind: "bad", icon: "🚑", text: t("beats.injured", { year: season.year }) });
    }
    if (season.gamble) {
      const win = season.gamble.result === "win";
      const icons = { "siete-metros": "🎯", parada: "🧤", "arco-vacio": "🥅" };
      beats.push({
        kind: win ? "good" : "bad",
        icon: win ? (icons[season.gamble.key] || "🎯") : "❌",
        text: t(`gambles.${season.gamble.key}.${season.gamble.result}`),
        big: true,
      });
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
  const chunks = [];
  if (career.climb > 0 && detail.from && detail.to) {
    chunks.push(`<span>${t("climb.label")}</span>` +
      `<strong>+${career.climb}</strong>` +
      `<em>${t("climb.line", { from: detail.from, to: detail.to })}</em>`);
  }
  if (career.comeback > 0) {
    chunks.push(`<span>${t("climb.comebackLabel")}</span>` +
      `<strong>+${career.comeback}</strong>` +
      `<em>${t("climb.comeback", { n: career.comebackTitles })}</em>`);
  }
  climbBox.hidden = !chunks.length;
  climbBox.innerHTML = chunks.join("");

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

  renderBoard(saveRun());

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
  super8: "🏅", "nacional-clubes": "⚔️", panamericano: "🌎", "asian-clubs": "🌏",
  "ihf-player": "👑", "top-scorer": "🎯", "all-star": "⭐",
};

function clubIndex() {
  const clubById = new Map();
  for (const league of universeLeagues()) for (const team of league.teams) clubById.set(team.id, team);
  return clubById;
}

/**
 * Agrupa temporadas consecutivas en el mismo club en un "tramo" y suma sus
 * números. Igual que Copero: una fila por etapa, no por temporada.
 */
function buildStints() {
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
  return stints;
}

function timelineHeader(keeper) {
  return `<li class="tl-head">
    <span class="tl-age">${t("ui.age")}</span>
    <span class="tl-club-h">${t("ui.club")}</span>
    <span class="tl-ovr">${t("ui.rating")}</span>
    <span class="tl-stat">${t("ui.matches")}</span>
    <span class="tl-stat">${keeper ? t("ui.savesShort") : t("ui.goalsShort")}</span>
    <span class="tl-stat">${keeper ? "" : t("ui.assistsShort")}</span>
  </li>`;
}

function stintRow(stint, keeper, clubById) {
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
}

/** Fila de la selección, con sus propios números y sus copas internacionales. */
function nationalRow(keeper) {
  const totals = career.totals;
  if (!totals.caps) return "";
  const intl = uniqueHonourIcons(
    career.trophies.filter((h) => ["worlds", "olympics", "euro", "continental"].includes(h.key))
  );
  const country = t(`countries.${career.player.country}`) || career.player.countryName;
  return `<li class="tl-row tl-national">
    <span class="tl-age"></span>
    <img class="tl-crest" src="${flagCrest(career.player)}" alt="" loading="lazy">
    <span class="tl-club">
      <span class="tl-name">${career.player.flag || ""} ${country}</span>
      ${intl ? `<span class="tl-trophies">${intl}</span>` : ""}
    </span>
    <span class="tl-ovr"></span>
    <span class="tl-stat">${totals.caps}</span>
    <span class="tl-stat">${keeper ? "—" : totals.nationalGoals}</span>
    <span class="tl-stat">${keeper ? "—" : totals.nationalAssists}</span>
  </li>`;
}

/** La carrera completa, en la pantalla de resultado. */
function renderTimeline(keeper) {
  const clubById = clubIndex();
  el("timeline").innerHTML = timelineHeader(keeper) +
    buildStints().map((stint) => stintRow(stint, keeper, clubById)).join("") +
    nationalRow(keeper);
}

/**
 * La misma carrera pero mientras jugás, al costado. Se va llenando con cada
 * decisión y la última fila muestra que estás por elegir club, como Copero.
 */
function renderCareerTimeline() {
  const keeper = career.player.position === "GK";
  const clubById = clubIndex();
  const stints = buildStints();

  const kind = career.pendingEvent?.kind;
  const choosing = kind === "club-offer" || kind === "contract-offer" ||
    career.pendingEvent?.id === "emigrar";

  const pendingRow = choosing ? `<li class="tl-row tl-choosing">
    <span class="tl-age">${career.age}</span>
    <span class="tl-crest tl-crest-empty">?</span>
    <span class="tl-club"><span class="tl-name">${t("ui.choosing")}</span></span>
    <span class="tl-ovr">${Math.round(career.rating)}</span>
    <span class="tl-stat"></span><span class="tl-stat"></span><span class="tl-stat"></span>
  </li>` : "";

  el("career-timeline").innerHTML = timelineHeader(keeper) +
    stints.map((stint) => stintRow(stint, keeper, clubById)).join("") +
    pendingRow + nationalRow(keeper);
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


// ---------------------------------------------------------------------------
// Tabla de posiciones
//
// Se guarda en el navegador: cada carrera terminada entra al ranking y queda
// ahí. Si el teléfono va pasando de mano en mano, todos compiten en la misma
// tabla. No hay servidor: es la misma decisión de Copero, que tampoco guarda
// carreras en ningún lado.
// ---------------------------------------------------------------------------

const BOARD_KEY = "handballer:board:v1";
const BOARD_MAX = 50;

function loadBoard() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];   // navegador sin storage o dato corrupto: el juego sigue igual
  }
}

function storeBoard(entries) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(entries.slice(0, BOARD_MAX)));
  } catch {
    // en modo incógnito puede fallar: no es motivo para romper el resultado
  }
}

/** Guarda la carrera recién terminada y devuelve su id para resaltarla. */
function saveRun() {
  if (career.boardId) return career.boardId;
  const id = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  career.boardId = id;

  const entries = loadBoard();
  entries.push({
    id,
    name: career.player.lastName,
    flag: career.player.flag,
    number: career.player.number,
    position: career.player.position,
    score: career.score,
    verdict: career.verdict.key,
    club: career.timeline.at(-1)?.club || "",
  });
  entries.sort((a, b) => b.score - a.score);
  storeBoard(entries);
  return id;
}

function renderBoard(highlightId) {
  const entries = loadBoard();
  const box = el("board");

  if (!entries.length) {
    box.innerHTML = `<li class="board-empty">${t("board.empty")}</li>`;
    return;
  }

  box.innerHTML = entries.slice(0, 20).map((entry, index) => {
    const medal = ["🥇", "🥈", "🥉"][index] || index + 1;
    return `<li class="board-row${entry.id === highlightId ? " board-me" : ""}">
      <span class="board-rank">${medal}</span>
      <span class="board-who">
        <span class="board-name">${entry.flag || ""} ${entry.name}</span>
        <span class="board-meta">${t(`positions.${entry.position}`)} · ${t(`verdicts.${entry.verdict}.title`)}</span>
      </span>
      <span class="board-score">${entry.score}</span>
    </li>`;
  }).join("");

  el("board-clear").onclick = () => {
    if (!window.confirm(t("board.confirm"))) return;
    storeBoard([]);
    renderBoard(null);
  };
}

function universeLeagues() {
  return activeLeagues;
}

// ---------------------------------------------------------------------------

function show(stage) {
  for (const [name, node] of Object.entries(view)) node.hidden = name !== stage;
}

boot().catch((error) => {
  console.error(error);
  el("app").innerHTML = `<p class="error">No se pudo cargar el juego. Recargá la página.</p>`;
});
