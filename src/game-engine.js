/**
 * Motor de carrera de handball. Lógica pura: no toca el DOM.
 *
 *   const carrera = createCareer({ apellido, dorsal, pais, posicion, ritmo });
 *   advanceCareer(carrera, choiceId, rng);   // hasta carrera.ended === true
 *
 * Escrito de cero para handball: el deporte cambia las métricas (goles por
 * partido en vez de por temporada, % de tiro, atajadas, exclusiones de 2'),
 * la curva de edad (los pivotes y arqueros rinden hasta los 40) y el mapa de
 * mercado (Argentina -> Brasil/Península -> Francia/Alemania).
 */

// ---------------------------------------------------------------------------
// Configuración del deporte
// ---------------------------------------------------------------------------

// `scoreFactor` sólo afecta al puntaje final, no a la simulación: iguala la
// producción entre puestos que generan volúmenes muy distintos.
export const POSITIONS = [
  { code: "GK", name: "Arquero", line: "GK", goalRate: 0.02, assistRate: 0.05, keeper: true, scoreFactor: 0.5 },
  { code: "LW", name: "Extremo izquierdo", line: "ALA", goalRate: 3.1, assistRate: 0.9, scoreFactor: 1.1 },
  { code: "LB", name: "Lateral izquierdo", line: "LAT", goalRate: 3.6, assistRate: 2.1, scoreFactor: 0.62 },
  { code: "CB", name: "Central", line: "CEN", goalRate: 2.2, assistRate: 5.4, scoreFactor: 0.41 },
  { code: "RB", name: "Lateral derecho", line: "LAT", goalRate: 3.6, assistRate: 2.1, scoreFactor: 0.62 },
  { code: "RW", name: "Extremo derecho", line: "ALA", goalRate: 3.1, assistRate: 0.9, scoreFactor: 1.1 },
  { code: "PV", name: "Pivote", line: "PIV", goalRate: 2.8, assistRate: 1.2, scoreFactor: 1.11 }
];

export const PACES = [
  { value: 1, name: "Intenso", detail: "Una decisión por temporada", scoreFactor: 0.84 },
  { value: 2, name: "Normal", detail: "Una decisión cada 2 temporadas", scoreFactor: 1 },
  { value: 3, name: "Exprés", detail: "Una decisión cada 3 temporadas", scoreFactor: 1.14 }
];

export const SQUAD_ROLES = [
  { key: "juvenil", share: 0.42, minutesMin: 12, minutesMax: 26 },
  { key: "rotacion", share: 0.68, minutesMin: 22, minutesMax: 38 },
  { key: "titular", share: 0.86, minutesMin: 38, minutesMax: 50 },
  { key: "franquicia", share: 0.95, minutesMin: 46, minutesMax: 58 }
];

const START_AGE = 17;
const RETIREMENT_AGE = 38;
const START_SEASON = 2026;
const MATCHES_PER_SEASON = 34;
// En Argentina se juega un fin de semana sí y otro no, y el calendario es corto.
const AMATEUR_MATCHES = 22;
// Quedarse en una liga amateur pasada cierta edad te baja el techo: ya no
// aprendés lo que sólo se aprende entrenando todos los días.
const AMATEUR_CEILING_AGE = 25;

// Pesos base de los títulos domésticos, que se multiplican por el prestigio de
// la liga (1 a 5). Una liga de las tres grandes vale 45; el amateur argentino, 9.
const LEAGUE_TITLE_WEIGHT = 9;
// Peso fijo: una copa nacional vale ~15 puntos (27 × 0,55), gane quien gane.
const CUP_WEIGHT = 27;

// Desde qué prestigio de liga te empieza a ver el seleccionador. En Argentina
// o en la segunda de España no te llaman: hay que estar en una primera seria.
const NATIONAL_TEAM_PRESTIGE = 3;

// Cuánto vale cada escalón de prestigio que subiste desde tu primer club.
// Salir del ascenso argentino y terminar en la Starligue son cuatro escalones.
const CLIMB_WEIGHT = 42;
// Cuántas temporadas hay que haber jugado abajo para cobrar el salto entero.
// Tres temporadas abajo ya son "abajo de verdad": el bono del salto se cobra
// entero desde ahí.
const CLIMB_MIN_SEASONS = 3;

// Embudo geográfico: a dónde puede fichar un jugador según su edad y de dónde es.
// En handball la ruta real de un sudamericano es liga local -> Península/Brasil ->
// Francia/Alemania. La de un francés o alemán es su propia primera división.
const MARKET_STEPS = [
  { maxAge: 19, scope: "domestic" },
  { maxAge: 22, scope: "regional" },
  { maxAge: 99, scope: "world" }
];

const REGION_BY_CONFEDERATION = {
  EHF: ["EHF"],
  PATHF: ["PATHF", "EHF"],
  AHF: ["AHF", "EHF"],
  CAHB: ["CAHB", "EHF"],
  OCHF: ["OCHF", "EHF"]
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value) => Math.max(0, Math.round(value));

export function createRng(seed) {
  let value = Number(seed) || 1;
  value %= 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function dailyChallengeId(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function dailyChallengeSeed(challengeId) {
  let hash = 2166136261;
  for (const character of `handball:${challengeId}`) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const between = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));

function sampleUnique(list, count, rng) {
  const pool = [...list];
  const out = [];
  while (pool.length && out.length < count) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

function noisy(expected, rng, spread = 0.3) {
  return round(expected * (1 - spread + rng() * spread * 2) + rng());
}

// ---------------------------------------------------------------------------
// Universo (se inyecta desde data/leagues.json)
// ---------------------------------------------------------------------------

let CLUBS = [];
let LEAGUES = [];
let COUNTRIES = [];

/** Carga el dataset generado por scripts/build_dataset.py. */
export function loadUniverse({ leagues, countries }) {
  LEAGUES = leagues;
  COUNTRIES = countries;
  CLUBS = leagues.flatMap((league) =>
    league.teams.map((team) => ({
      ...team,
      leagueName: league.name,
      confederation: league.confederation,
      countryName: league.country_name,
      amateur: Boolean(league.amateur),
      prestige: league.prestige ?? 3,
      // Filial de un club grande: el "B" o "II". Es la puerta de entrada
      // típica del sudamericano que llega a Europa sin nombre.
      reserve: /\s(?:B|C|II)$/.test(team.name)
    }))
  );
  return { clubs: CLUBS.length, leagues: LEAGUES.length };
}

export const startableCountries = () => COUNTRIES.filter((country) => country.startable);

const countryOf = (code) => COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
const positionOf = (code) => POSITIONS.find((p) => p.code === code) || POSITIONS[3];
const clubLabel = (club) => `${club.leagueName} · ${club.countryName}`;

// ---------------------------------------------------------------------------
// Mercado
// ---------------------------------------------------------------------------

/** Fuerza de club a la que puede aspirar el jugador según su valoración. */
function targetStrength(state) {
  return clamp(Math.round((state.rating - 46) / 9) + 1, 1, 5);
}

function marketScope(state) {
  return MARKET_STEPS.find((step) => state.age <= step.maxAge).scope;
}

function candidatePool(state, { minStrength, maxStrength }) {
  const home = countryOf(state.player.country);
  const scope = marketScope(state);
  const regions = REGION_BY_CONFEDERATION[home.confederation] || ["EHF"];

  for (let widen = 0; widen <= 4; widen += 1) {
    const low = clamp(minStrength - widen, 1, 5);
    const high = clamp(maxStrength + widen, 1, 5);
    const pool = CLUBS.filter((club) => {
      if (club.id === state.club.id) return false;
      if (club.strength < low || club.strength > high) return false;
      if (scope === "domestic") return club.country === home.code;
      if (scope === "regional") return regions.includes(club.confederation);
      return true;
    });
    if (pool.length >= 4) return pool;
  }
  return CLUBS.filter((club) => club.id !== state.club.id);
}

export function transferOffers(state, rng, count = 2, farewell = false) {
  let level = targetStrength(state);
  // Con el brazo de armado del lado equivocado, los que llaman son siempre
  // clubes chicos: nadie paga por un extremo sin ángulo de tiro.
  const badSide = state.wrongHand && state.brazoRefusedYear;
  if (badSide) level = 1;
  // Los gigantes no fichan veteranos: a los 36 dejan de llamar, a los 38 el
  // mercado es de clubes medianos para abajo.
  const ageCeiling = state.age >= 38 ? 3 : state.age >= 36 ? 4 : 5;
  const pool = candidatePool(state, {
    minStrength: clamp(level - (farewell ? 2 : 1), 1, 5),
    maxStrength: badSide ? 2
      : Math.min(ageCeiling, clamp(level + (state.age < 23 ? 0 : 1), 1, 5))
  });
  return sampleUnique(pool, count, rng);
}

export function projectSquadRole(state, club = state.club) {
  if (!club || club.freeAgent) return SQUAD_ROLES[0];
  if (club.id === state.club?.id && state.roleOverride?.seasonsLeft > 0) {
    return SQUAD_ROLES.find((role) => role.key === state.roleOverride.key) || SQUAD_ROLES[0];
  }
  // En un gigante (fuerza 5) la vara es de verdad alta: hace falta rondar los
  // 90 para ser algo más que rotación. Con 85 en el Veszprém sos un jugador
  // más, no la figura.
  const benchmark = 46 + club.strength * 7.5 + (club.strength >= 5 ? 5 : 0);
  const score = state.rating + state.form * 0.8 + clamp(state.loyalty, 0, 10) * 0.08 - benchmark;
  // "Juvenil" es rol de pibe: pasados los 21, al que llega justo lo anotan
  // como rotación. Sin este corte, un veterano de 37 que firmaba en un club
  // grande aparecía ofertado "de juvenil".
  const shortOfLevel = score < -5 || (state.age <= 19 && score < 0);
  let role = shortOfLevel ? (state.age <= 21 ? 0 : 1)
    : score < 1 ? 1
    : score < 7 ? 2
    : 3;

  // A un club nuevo llegás como veterano, no como estrella: a los 35 el techo
  // es titular y a los 37, rotación. Renovar donde ya sos ídolo no tiene tope:
  // ahí la casa te conoce.
  const renewal = club.id === state.club?.id;
  if (!renewal) {
    if (state.age >= 37) role = Math.min(role, 1);
    else if (state.age >= 35) role = Math.min(role, 2);
  }
  return SQUAD_ROLES[role];
}

/**
 * Sueldo mensual estimado en euros. No afecta el puntaje: es la capa de
 * realidad del handball profesional, calibrada con datos de primera mano:
 * el tope real es ~30.000 (la figura del PSG); los colistas de la Starligue
 * promedian 4.000; la Bundesliga promedia 8.000 con los seis grandes en
 * 14.000; un buen jugador de Montpellier ronda los 15.000; en España se
 * paga 1.000-5.000 salvo el Barcelona (hasta ~20.000); en Argentina no hay
 * sueldo: es amateur.
 */
export function estimateSalary(state, roleKey = state.squadRole) {
  const club = state.club;
  if (!club || club.freeAgent || club.amateur) return 0;
  const strength = club.strength ?? 2;
  const prestige = club.prestige ?? 3;
  const base = [0, 1500, 3000, 5500, 10000, 14500][strength];
  const league = 0.5 + prestige * 0.12;
  const role = { juvenil: 0.35, rotacion: 0.7, titular: 1, franquicia: 1.5 }[roleKey] || 0.7;
  const level = 0.7 + (state.rating / 99) * 0.6;
  let salary = base * league * role * level;
  // España paga poco... salvo el Barcelona, que aun así ronda los 20.000.
  if (club.country === "ESP") salary *= strength === 5 ? 0.65 : 0.4;
  return Math.min(30000, Math.round(salary / 500) * 500);
}

export function contractLength(state) {
  return Math.min(Math.max(2, state.pace * 2), Math.max(1, RETIREMENT_AGE - state.age));
}

function clubChoice(state, club, action, index) {
  const role = projectSquadRole(state, club);
  const effects = {
    firmar: { fame: 1, loyalty: -1 },
    seguir: { loyalty: 3, form: 1 },
    renovar: { loyalty: 4, form: 1 },
    libre: { fame: 1, loyalty: -3, form: 1 },
    cedido: { potential: 2, form: 2 }
  }[action] || {};

  return {
    id: `${action}-${club.id}-${index}`,
    kind: "club",
    action,
    label: club.name,
    detail: clubLabel(club),
    club,
    projectedRole: role.key,
    contractYears: action === "cedido" ? 0 : contractLength(state),
    effects
  };
}

// ---------------------------------------------------------------------------
// Eventos narrativos propios del handball
// ---------------------------------------------------------------------------

export const SPECIAL_EVENTS = [
  {
    id: "doble-turno",
    minAge: 18, maxAge: 27,
    eyebrow: "Gimnasio",
    title: "El preparador te ofrece doble turno",
    body: "Podés ganar el kilo de músculo que te falta para aguantar el contacto en seis metros, o llegar fundido al fin de semana.",
    choices: [
      { id: "doble", label: "Doble turno", detail: "Más fuerza, menos frescura", effects: { rating: 3, potential: 2, fitness: -4 } },
      { id: "cuidarse", label: "Cuidar el cuerpo", detail: "La temporada es larga", effects: { fitness: 5, form: 1, loyalty: 1 } }
    ]
  },
  {
    id: "competencia-puesto",
    minAge: 20, maxAge: 34,
    eyebrow: "Oficina del entrenador",
    title: "El club fichó a otro para tu puesto",
    body: "Un internacional llega a pelearte el lugar. Podés quedarte a ganártelo o aceptar la oferta que apareció.",
    choices: [
      { id: "pelear", label: "Pelear el puesto", detail: "50 % titular · 50 % rotación", effects: { rating: 2, form: 1, loyalty: 2, fitness: -2 } },
      { id: "salir", label: "Aceptar la oferta", detail: "Camiseta nueva, minutos seguros", offerExit: true, effects: { fame: 1, loyalty: -2, form: 2 } }
    ]
  },
  {
    id: "rotura-ligamento",
    minAge: 21, maxAge: 34,
    eyebrow: "Quirófano",
    title: "Cruzado anterior",
    body: "La lesión que todo handbolista teme. Ocho meses afuera y una decisión sobre cómo volver.",
    choices: [
      { id: "rehab-completa", label: "Rehabilitación completa", detail: "-3 VAL · mucho menos riesgo después", effects: { rating: -3, fitness: 14, risk: -4 } },
      { id: "volver-antes", label: "Volver antes de tiempo", detail: "Recuperás el puesto · la rodilla queda marcada", effects: { form: 2, fame: 1, fitness: -8, risk: 4 } }
    ]
  },
  {
    id: "hombro-lanzador",
    minAge: 22, maxAge: 36,
    positions: ["LW", "LB", "CB", "RB", "RW", "PV"],
    eyebrow: "Kinesiología",
    title: "El hombro de lanzar dice basta",
    body: "Tendinitis crónica. Podés infiltrarte y seguir jugando o parar y perder el ritmo.",
    choices: [
      { id: "parar", label: "Parar y tratarlo", detail: "Perdés ritmo · protegés el brazo", effects: { fitness: 9, form: -2, risk: -2 } },
      { id: "infiltrarse", label: "Infiltrarse y jugar", detail: "No perdés el puesto · pagás después", effects: { form: 2, fitness: -6, risk: 3, fame: 1 } }
    ]
  },
  {
    id: "siete-metros",
    minAge: 19, maxAge: 36,
    positions: ["LW", "LB", "CB", "RB", "RW", "PV"],
    eyebrow: "Últimos segundos",
    title: "Siete metros para ganar la serie",
    body: "La tribuna de pie. El entrenador te busca con la mirada.",
    choices: [
      { id: "tirar", label: "Agarrar la pelota", detail: "Gloria o silbatina", effects: { fame: 3, form: 2, risk: 1 } },
      { id: "ceder", label: "Dejárselo al capitán", detail: "Sin riesgo, sin historia", effects: { loyalty: 2, form: -1 } }
    ]
  },
  {
    id: "seleccion",
    minAge: 19, maxAge: 35,
    eyebrow: "Ventana internacional",
    title: "Te citan justo antes del clásico",
    body: "Cruzar el Atlántico para dos amistosos, con el técnico del club pidiéndote que no vayas.",
    choices: [
      { id: "ir", label: "Ir a la selección", detail: "El seleccionado primero", effects: { nationalBoost: 4, fame: 2, fitness: -5 } },
      { id: "quedarse", label: "Quedarte en el club", detail: "Cuidás el puesto que te paga", effects: { form: 3, fitness: 4, nationalBoost: -2 } }
    ]
  },
  {
    id: "defensa-6-0",
    minAge: 20, maxAge: 33,
    positions: ["LB", "CB", "RB", "PV"],
    eyebrow: "Pizarrón",
    title: "Te quieren de central de la 6-0",
    body: "Aprender a defender adentro te da minutos que hoy no tenés, pero te saca del ataque.",
    choices: [
      { id: "aprender", label: "Aprender el rol", detail: "Más caminos · menos protagonismo", effects: { rating: 2, potential: 2, form: -1 } },
      { id: "atacar", label: "Seguir siendo atacante", detail: "Tu juego, tu riesgo", effects: { form: 2, loyalty: -1 } }
    ]
  },
  {
    id: "cesion",
    minAge: 18, maxAge: 23,
    eyebrow: "Plan de desarrollo",
    title: "Una cesión para jugar de verdad",
    body: "Un año en un club más chico, jugando los 60 minutos, y volvés.",
    choices: [
      { id: "aceptar-cesion", label: "Aceptar la cesión", detail: "Una temporada de minutos", loanOffer: true, effects: { potential: 2, form: 2, loyalty: 1 } },
      { id: "quedarse-pelear", label: "Quedarte a pelearla", detail: "Banco, pero en el club grande", effects: { form: 1, loyalty: 2, fitness: -1 } }
    ]
  },
  {
    id: "roja-directa",
    minAge: 19, maxAge: 35,
    eyebrow: "Comité de disciplina",
    title: "Descalificación y expediente",
    body: "Un impacto en la cabeza en el contraataque. Roja directa y azul: informe a la federación.",
    choices: [
      { id: "disculparse", label: "Pedir disculpas públicas", detail: "Bajás la sanción · perdés carácter", effects: { fame: -1, loyalty: 2, risk: -1 } },
      { id: "bancarsela", label: "Bancártela", detail: "El vestuario te respeta · tres fechas afuera", effects: { fame: 2, form: -2, risk: 1 } }
    ]
  },
  {
    id: "crisis-club",
    minAge: 21, maxAge: 36,
    eyebrow: "Vestuario",
    title: "El club no paga hace tres meses",
    body: "Podés encabezar el reclamo del plantel o mirar para otro lado y jugar.",
    choices: [
      { id: "encabezar", label: "Encabezar el reclamo", detail: "Te respetan · te marcan", effects: { loyalty: 3, fame: 1, fitness: -3, risk: 1 } },
      { id: "jugar", label: "Sólo jugar", detail: "Guardás energía · perdés peso", effects: { fitness: 3, form: 1, loyalty: -2 } }
    ]
  },
  {
    id: "capitania",
    minAge: 25, maxAge: 35,
    eyebrow: "Antes del sorteo",
    title: "Te ofrecen la capitanía",
    body: "Ser capitán te da voz en el club y la culpa de cada noche mala.",
    choices: [
      { id: "aceptar-cinta", label: "Ponerte la cinta", detail: "Liderás · cargás", effects: { loyalty: 4, fame: 2, fitness: -3 } },
      { id: "sin-cinta", label: "Seguir sin cinta", detail: "Cuidás tu juego", effects: { form: 2, fitness: 3, loyalty: -1 } }
    ]
  },
  {
    id: "volver-a-casa",
    minAge: 30, maxAge: 37,
    eyebrow: "Un llamado desde casa",
    title: "Tu club de origen quiere tus últimos años",
    body: "Volver a la liga donde empezaste, o exprimir el último contrato grande en Europa.",
    choices: [
      { id: "volver", label: "Volver a casa", detail: "Cerrar el círculo", homeOffer: true, effects: { fame: 1, loyalty: 4, form: 1 } },
      { id: "seguir-afuera", label: "Seguir afuera", detail: "El nivel más alto hasta el final", effects: { rating: 1, fame: 2, loyalty: -2 } }
    ]
  },
  {
    id: "mentor",
    minAge: 31, maxAge: 37,
    eyebrow: "Últimos capítulos",
    title: "Un pibe de 18 te pide consejos",
    body: "Es el que va a ocupar tu lugar. Podés enseñarle todo o hacérselo ganar.",
    choices: [
      { id: "ensenar", label: "Enseñarle todo", detail: "Legado más allá de los números", effects: { loyalty: 4, fame: 2, rating: -1, fitness: 2 } },
      { id: "que-lo-gane", label: "Que se lo gane", detail: "Un último pico egoísta", effects: { rating: 2, form: 3, loyalty: -2, risk: 1 } }
    ]
  }
,

  // ------------------------------------------------------------------ zona gris
  // Estos eventos dejan una marca en `state.flags`. Cada marca es una ruleta
  // que se tira todas las temporadas: si sale, hay sanción y se te cae la
  // carrera. Es la única forma de que la decisión pese de verdad.
  {
    id: "medico-milagroso",
    minAge: 21, maxAge: 34,
    choices: [
      { id: "tomarlo", effects: { rating: 3, form: 3, fitness: 8, flag: "doping" } },
      { id: "no-tomarlo", effects: { form: -2, fitness: -2, loyalty: 2 } }
    ]
  },
  {
    id: "apuesta-amigo",
    professional: true,
    minAge: 19, maxAge: 33,
    choices: [
      { id: "pasar-dato", effects: { fame: -1, flag: "apuestas" } },
      { id: "cortar", effects: { loyalty: 2, form: 1 } }
    ]
  },
  {
    id: "partido-arreglado",
    professional: true,
    minAge: 22, maxAge: 34,
    choices: [
      { id: "aceptar-plata", effects: { fame: -2, form: -1, flag: "amanio" } },
      { id: "denunciar", effects: { fame: 3, loyalty: 3, form: -2, risk: 1 } }
    ]
  },
  {
    id: "boliche-clasico",
    minAge: 18, maxAge: 29,
    choices: [
      { id: "salir", effects: { fame: 2, form: -2, fitness: -6, risk: 2 } },
      { id: "quedarse-casa", effects: { fitness: 4, form: 2, fame: -1 } }
    ]
  },
  {
    id: "falta-tactica",
    minAge: 19, maxAge: 36,
    choices: [
      { id: "falta-limpia", effects: { form: 2, loyalty: 2, risk: 1 } },
      { id: "falta-sucia", effects: { fame: 2, form: 3, loyalty: -2, risk: 3 } }
    ]
  },
  {
    id: "simular-exclusion",
    minAge: 18, maxAge: 34,
    choices: [
      { id: "tirarse", effects: { form: 2, fame: -1, risk: 1 } },
      { id: "seguir-jugando", effects: { fame: 1, loyalty: 1, fitness: -2 } }
    ]
  },
  {
    id: "sueldo-negro",
    professional: true,
    minAge: 20, maxAge: 35,
    choices: [
      { id: "firmar-igual", effects: { loyalty: 2, form: 1, risk: 1 } },
      { id: "exigir-blanco", effects: { fame: 1, loyalty: -3, form: -1 } }
    ]
  },
  {
    id: "agente-treinta",
    professional: true,
    minAge: 18, maxAge: 27,
    choices: [
      { id: "firmar-agente", effects: { fame: 3, form: 1, loyalty: -1 } },
      { id: "manejarte-solo", effects: { loyalty: 2, fame: -2, rating: 1 } }
    ]
  },
  {
    id: "tuit-viejo",
    minAge: 19, maxAge: 33,
    choices: [
      { id: "pedir-perdon", effects: { fame: -2, form: -1, loyalty: 2 } },
      { id: "no-explicar", effects: { fame: 2, form: -2, risk: 2 } }
    ]
  },
  {
    id: "oferta-petrodolar",
    minAge: 26, maxAge: 36,
    choices: [
      { id: "ir-por-plata", effects: { fame: 2, loyalty: -3, rating: -1 }, richOffer: true },
      { id: "quedarse-nivel", effects: { rating: 2, form: 1, loyalty: 2 } }
    ]
  },
  {
    id: "cambiar-seleccion",
    minAge: 22, maxAge: 31,
    choices: [
      { id: "nacionalizarte", effects: { nationalBoost: 7, fame: 3, loyalty: -4 } },
      { id: "esperar-tu-pais", effects: { loyalty: 4, nationalBoost: -1, fame: -1 } }
    ]
  },
  {
    id: "portero-jugador",
    minAge: 20, maxAge: 34,
    positions: ["LW", "LB", "CB", "RB", "RW", "PV"],
    choices: [
      { id: "salir-al-ataque", effects: { rating: 2, form: 2, fame: 2, fitness: -4 } },
      { id: "no-arriesgar", effects: { fitness: 3, loyalty: 1, form: -1 } }
    ]
  },
  {
    id: "vas-a-ser-padre",
    // En el femenino esta historia es "maternidad", con su propia mecánica.
    rama: "M",
    minAge: 24, maxAge: 36,
    choices: [
      { id: "priorizar-familia", effects: { fitness: 5, loyalty: 3, rating: -1, form: -2 } },
      { id: "no-aflojar", effects: { rating: 2, form: 2, fitness: -3, loyalty: -2 } }
    ]
  },
  {
    id: "pelea-vestuario",
    minAge: 20, maxAge: 35,
    choices: [
      { id: "bancar-la-piña", effects: { fame: 2, form: 1, loyalty: -3, risk: 2 } },
      { id: "tragarsela", effects: { loyalty: 2, form: -2, fitness: 2 } }
    ]
  },
  {
    id: "bajar-peso",
    minAge: 19, maxAge: 31,
    choices: [
      { id: "hacer-dieta", effects: { fitness: 7, rating: 1, form: -1 } },
      { id: "ignorarlo", effects: { form: 1, fitness: -5, risk: 2, loyalty: -1 } }
    ]
  }
,
  // ------------------------------------------------- cambios de puesto reales
  // El lateral que se corre al extremo (y al revés) es el cambio más común del
  // handball. A veces te salva la carrera y a veces te la corta: por eso el
  // resultado se sortea y no se sabe hasta la temporada siguiente.
  {
    id: "lateral-a-extremo",
    minAge: 19, maxAge: 31,
    positions: ["LB", "RB"],
    choices: [
      { id: "correrse-al-ala", effects: { potential: 1, form: -2 }, positionSwap: true },
      { id: "seguir-de-lateral", effects: { form: 2, loyalty: -1 } }
    ]
  },
  {
    id: "extremo-a-lateral",
    minAge: 19, maxAge: 31,
    positions: ["LW", "RW"],
    choices: [
      { id: "meterse-adentro", effects: { potential: 1, form: -2 }, positionSwap: true },
      { id: "seguir-de-extremo", effects: { form: 2, loyalty: -1 } }
    ]
  },

  // --------------------------------------------------------- sólo arqueros
  {
    id: "siete-metros-parada",
    minAge: 19, maxAge: 37,
    positions: ["GK"],
    choices: [
      { id: "jugartela", effects: { fame: 3, form: 2, risk: 1 } },
      { id: "quedarte-parado", effects: { form: 1, fitness: 1, fame: -1 } }
    ]
  },
  {
    id: "septimo-jugador-gk",
    minAge: 20, maxAge: 36,
    positions: ["GK"],
    choices: [
      { id: "aceptar-salir", effects: { loyalty: 3, form: -2, fame: -2 } },
      { id: "plantarse", effects: { fame: 2, form: 2, loyalty: -3, risk: 1 } }
    ]
  },
  {
    id: "arquero-al-arco-vacio",
    minAge: 21, maxAge: 36,
    positions: ["GK"],
    choices: [
      { id: "tirar-al-arco-vacio", effects: { fame: 3, form: 2, risk: 2 } },
      { id: "no-tirar", effects: { loyalty: 2, form: 1 } }
    ]
  },

  // --- las historias del femenino ---------------------------------------
  // Nada de esto es inventado: maternidad y vuelta, doble jornada laboral,
  // cláusulas antiembarazo, premios desiguales, la multa por el uniforme
  // (Noruega 2021) y el acoso en redes son la carrera real de una handbolista.
  {
    id: "maternidad",
    rama: "F",
    minAge: 26, maxAge: 32,
    choices: [
      // Parar el año entero: el cuerpo vuelve bien y los títulos de la vuelta
      // valen más (ver finishCareer). Sin flags: esto no es una zona gris.
      { id: "pausa", effects: { maternity: true, loyalty: 3, fame: 1, fitness: 6 } },
      { id: "volver-rapido", effects: { maternity: true, maternityLeave: 0, fitness: -8, form: -2, risk: 1 } }
    ]
  },
  {
    id: "doble-jornada",
    professional: true,
    rama: "F",
    minAge: 18, maxAge: 26,
    choices: [
      { id: "trabajo", effects: { loyalty: 2, fitness: -3, rating: -1 } },
      { id: "a-todo-o-nada", effects: { rating: 2, form: 2, risk: 1, fame: 1 } }
    ]
  },
  {
    id: "clausula",
    professional: true,
    rama: "F",
    minAge: 20, maxAge: 28,
    choices: [
      { id: "firmar-callada", effects: { loyalty: 1, fame: -2 } },
      { id: "denunciar", effects: { fame: 4, loyalty: -3, form: -1 } }
    ]
  },
  {
    id: "premios-desiguales",
    professional: true,
    rama: "F",
    minAge: 22, maxAge: 34,
    choices: [
      { id: "plantarse", effects: { fame: 3, loyalty: -2, nationalBoost: 2 } },
      { id: "cabeza-gacha", effects: { form: 1, fame: -1 } }
    ]
  },
  {
    id: "uniforme",
    rama: "F",
    minAge: 18, maxAge: 30,
    choices: [
      { id: "hacer-ruido", effects: { fame: 3, risk: 1, nationalBoost: 1 } },
      { id: "pagar-la-multa", effects: { loyalty: 1, form: 1 } }
    ]
  },
  {
    id: "redes-acoso",
    rama: "F",
    minAge: 18, maxAge: 28,
    choices: [
      { id: "responder", effects: { fame: 2, form: -1 } },
      { id: "bloquear-y-jugar", effects: { form: 2, fitness: 1 } }
    ]
  }
];

// ---------------------------------------------------------------------------
// Ciclo de vida de la carrera
// ---------------------------------------------------------------------------

export function createCareer(profile, rng = Math.random) {
  const country = countryOf(profile.country);
  const position = positionOf(profile.position);
  const pace = PACES.some((p) => p.value === Number(profile.pace)) ? Number(profile.pace) : 2;

  return {
    id: `${Date.now().toString(36)}-${between(1000, 9999, rng)}`,
    player: {
      lastName: String(profile.lastName || "PIBE").trim().slice(0, 16).toUpperCase() || "PIBE",
      number: clamp(Number(profile.number) || 7, 1, 99),
      hand: profile.hand === "Zurda" ? "Zurda" : "Diestra",
      country: country.code,
      countryName: country.name,
      flag: country.flag,
      position: position.code,
      positionName: position.name,
      rama: profile.rama === "F" ? "F" : "M"
    },
    // Diestro a la derecha o zurdo a la izquierda: el lado equivocado para tu
    // mano. El primer entrenador te lo va a hacer notar.
    wrongHand: wrongSideFor(profile.hand === "Zurda" ? "Zurda" : "Diestra", position.code),
    pace,
    age: START_AGE,
    retirementAge: RETIREMENT_AGE,
    seasonYear: START_SEASON,
    club: { id: "free-agent", name: "Sin club", strength: 1, freeAgent: true, country: country.code },
    firstClub: null,
    rating: 50,
    potential: between(76, 93, rng),
    maxRating: 50,
    fitness: 84,
    form: 0,
    fame: 0,
    loyalty: 0,
    risk: 0,
    nationalBoost: 0,
    contractYears: 0,
    roleOverride: null,
    loan: null,
    flags: {},
    scandals: [],
    startPrestige: null,
    peakPrestige: 0,
    seasonsLow: 0,
    ceilingDropped: false,
    squadRole: "juvenil",
    timeline: [],
    decisions: [],
    trophies: [],
    awards: [],
    totals: {
      seasons: 0, matches: 0, goals: 0, assists: 0, shots: 0,
      saves: 0, shotsFaced: 0, twoMinutes: 0, redCards: 0,
      caps: 0, nationalGoals: 0, nationalAssists: 0, transfers: 0, loans: 0
    },
    pendingEvent: null,
    latestBlock: [],
    ended: false,
    verdict: null,
    score: 0
  };
}

function academyOffers(state, rng) {
  const home = countryOf(state.player.country);
  const pool = CLUBS.filter((club) => club.country === home.code && club.strength <= 3);
  const offers = sampleUnique(pool.length >= 3 ? pool : CLUBS.filter((c) => c.strength <= 2), 3, rng);
  return {
    id: "inferiores",
    kind: "club-offer",
    eyebrow: "Inferiores",
    title: "¿Dónde empieza tu carrera?",
    body: "Tres clubes te quieren en su plantel juvenil. Elegí de dónde salís.",
    choices: offers.map((club, index) => clubChoice(state, club, "firmar", index))
  };
}

// A partir de los 36 colgarlas es una opción de verdad en cualquier mercado,
// no sólo en el último contrato: se puede cortar en lo más alto.
const RETIRE_FROM_AGE = 36;

function retireChoice() {
  return { id: "retirarse", kind: "retire", action: "retire",
           label: "Retirarte", detail: "Colgar las zapatillas",
           effects: { retireNow: true } };
}

function withRetirement(state, choices) {
  return state.age >= RETIRE_FROM_AGE ? [...choices, retireChoice()] : choices;
}

function marketEvent(state, rng) {
  const offers = transferOffers(state, rng, 2);
  return {
    id: `mercado-${state.decisions.length}`,
    kind: "club-offer",
    eyebrow: "Mercado de pases",
    title: "Elegí tu próximo club",
    body: "Llegaron ofertas después de tu última temporada. Aceptá una o quedate.",
    choices: withRetirement(state, [
      ...offers.map((club, index) => clubChoice(state, club, "firmar", index)),
      clubChoice(state, state.club, "seguir", 2)
    ])
  };
}

function contractExpiryEvent(state, rng) {
  const offers = transferOffers(state, rng, 2);
  return {
    id: `contrato-${state.decisions.length}`,
    kind: "contract-offer",
    eyebrow: "Fin de contrato",
    title: "Se te vence el contrato",
    body: "Renovar con el club que te conoce, o salir libre a otro proyecto.",
    choices: withRetirement(state, [
      clubChoice(state, state.club, "renovar", 0),
      ...offers.map((club, index) => clubChoice(state, club, "libre", index + 1))
    ])
  };
}

// Hasta cuándo se puede estirar una carrera. Después de acá, el cuerpo decide.
const MAX_STRETCH_AGE = 42;

function originClub(state) {
  if (!state.firstClub) return null;
  const club = CLUBS.find((entry) => entry.id === state.firstClub.id);
  return club && club.id !== state.club.id ? club : null;
}

/**
 * El final de una carrera no es un botón: es una negociación que se repite.
 * Podés retirarte a lo grande, o estirar... sabiendo que cada año que pasa
 * hay menos ofertas, más lesiones y clubes más chicos. Y siempre está la
 * puerta de cerrar el círculo: volver al club donde empezaste a jugar el
 * torneo de tu país.
 */
function finalCycleEvent(state, rng) {
  const stretching = state.stretchCycles || 0;
  // El mercado se achica un ciclo a la vez: primero dos ofertas, después
  // capaz una, después capaz ninguna. Nadie te promete un final feliz.
  const count = stretching === 0 ? 2
    : stretching === 1 ? (rng() < 0.75 ? 1 : 0)
    : (rng() < 0.3 ? 1 : 0);
  const offers = transferOffers(state, rng, count, true);
  const choices = offers.map((club, index) => clubChoice(state, club, "firmar", index));

  const origin = originClub(state);
  if (origin) {
    choices.push({
      ...clubChoice(state, origin, "volver", choices.length),
      id: "volver-al-origen",
      effects: { loyalty: 6, fame: 2, form: 1 }
    });
  }

  choices.push(retireChoice());

  return {
    id: stretching ? `estirar-${stretching}` : "ultimo-contrato",
    kind: "club-offer",
    eyebrow: stretching ? "El cuerpo pide, la cabeza duda" : "Último contrato",
    title: stretching ? "¿Una temporada más?" : "Una decisión más",
    body: stretching
      ? "Podrías colgarlas ahora, a lo grande. O estirar: menos ofertas, la rodilla que avisa, y ningún final garantizado."
      : "Firmá un último capítulo, cerrá el círculo donde empezaste, o retirate ahora.",
    choices
  };
}

function loanDestination(state, rng) {
  const pool = CLUBS.filter((club) => club.id !== state.club.id && club.strength < state.club.strength);
  const home = countryOf(state.player.country);
  const domestic = pool.filter((club) => club.country === home.code);
  return pick(domestic.length ? domestic : pool.length ? pool : CLUBS, rng);
}

function chooseSpecialEvent(state, rng) {
  const home = countryOf(state.player.country);
  const position = state.player.position;
  const available = SPECIAL_EVENTS.filter(
    (event) =>
      state.age >= event.minAge && state.age <= event.maxAge &&
      // Un arquero no se pone de central de la 6-0 ni tira el siete metros:
      // cada evento declara en qué puestos tiene sentido.
      (!event.positions || event.positions.includes(position)) &&
      // Y cada rama tiene sus propias historias: la maternidad o la pelea por
      // premios igualitarios son del femenino.
      (!event.rama || event.rama === state.player.rama) &&
      // En el amateur argentino no hay plata de por medio: sin sueldo no hay
      // mitad en negro, ni agente, ni primas, ni apuestas sobre tus partidos.
      (!event.professional || !state.club.amateur) &&
      (event.id !== "cesion" || state.club.strength >= 2) &&
      (event.id !== "volver-a-casa" || state.club.country !== home.code)
  );
  if (!available.length) return marketEvent(state, rng);

  // El bug anterior miraba las últimas 4 decisiones, pero los eventos
  // especiales salen una de cada dos: en la práctica alcanzaba con dos para
  // que se repitiera. Ahora llevamos la cuenta de todos los ya vistos.
  const seen = new Set(state.decisions.map((decision) => decision.eventId));
  const fresh = available.filter((event) => !seen.has(event.id));
  // La maternidad es LA historia del femenino: cuando la ventana está abierta
  // (26-32), empuja fuerte para aparecer en vez de sortearse entre 40 eventos.
  const flagship = fresh.find((entry) => entry.id === "maternidad");
  const chosen = flagship && rng() < 0.55 ? flagship : pick(fresh.length ? fresh : available, rng);
  const event = structuredClone(chosen);
  event.kind = "career-event";

  const fill = (predicate, club, id) => {
    const choice = event.choices.find(predicate);
    if (!choice || !club) return;
    Object.assign(choice, clubChoice(state, club, id === "aceptar-cesion" ? "cedido" : "firmar", 0), {
      id,
      effects: choice.effects,
      ...(id === "aceptar-cesion" ? { loanOffer: true } : {})
    });
  };

  fill((c) => c.loanOffer, loanDestination(state, rng), "aceptar-cesion");
  fill((c) => c.offerExit, transferOffers(state, rng, 1)[0], "salir");
  fill(
    (c) => c.homeOffer,
    pick(CLUBS.filter((club) => club.country === home.code && club.id !== state.club.id), rng),
    "volver"
  );
  return event;
}

/**
 * La decisión que define una carrera sudamericana. En Argentina el handball es
 * amateur: no hay contrato ni sueldo, y el que quiere vivir de esto se va.
 * Las dos rutas reales son la filial de un club grande (entrenás con los
 * mejores pero no jugás) o una liga chica de Europa (jugás todo pero no te ve
 * nadie). Quedarse también es una opción... y tiene precio.
 */
function emigrationEvent(state, rng) {
  const home = countryOf(state.player.country);
  const abroad = CLUBS.filter((club) => club.country !== home.code && !club.amateur);

  // "Filial de un club grande" tiene que ser de un club grande de verdad: la
  // gracia es entrenar todos los días con internacionales, no jugar en la
  // reserva de un equipo de mitad de tabla.
  const bigNames = new Set(
    CLUBS.filter((club) => club.strength >= 3)
      .map((club) => club.name.replace(/\s(?:B|C|II)$/, "").toLowerCase())
  );
  const reserves = abroad.filter(
    (club) => club.reserve && bigNames.has(club.name.replace(/\s(?:B|C|II)$/, "").toLowerCase())
  );
  // Segunda o tercera de Francia, Alemania o España: jugás los 60 minutos
  // todos los fines de semana y no te ve nadie. Así empezaron casi todos.
  const smallLeagues = abroad.filter(
    (club) => !club.reserve && club.tier >= 2 && club.strength <= 2 &&
      ["FRA", "GER", "ESP"].includes(club.country)
  );

  const choices = [];
  const filial = pick(reserves.length ? reserves : abroad.filter((c) => c.strength <= 2), rng);
  if (filial) {
    choices.push({
      ...clubChoice(state, filial, "firmar", 0),
      id: "filial",
      effects: { potential: 4, rating: -1, fame: 1, loyalty: -2 }
    });
  }
  const small = pick(smallLeagues.length ? smallLeagues : abroad.filter((c) => c.strength <= 2), rng);
  if (small && small.id !== filial?.id) {
    choices.push({
      ...clubChoice(state, small, "firmar", 1),
      id: "liga-chica",
      effects: { rating: 2, form: 3, fitness: -2, loyalty: -1 }
    });
  }
  choices.push({
    ...clubChoice(state, state.club, "seguir", 2),
    id: "quedarse-en-casa",
    effects: { loyalty: 5, form: 2, fitness: 3 }
  });

  return { id: "emigrar", kind: "career-event", choices };
}

function chooseNextEvent(state, rng) {
  if (state.age >= state.retirementAge - state.pace) return finalCycleEvent(state, rng);
  // El brazo de armado se discute antes que nada: es la primera charla seria
  // que tiene cualquier entrenador con un pibe parado del lado equivocado.
  if (state.wrongHand && !state.brazoAsked && state.age >= 18) {
    state.brazoAsked = true;
    return handednessEvent(1);
  }
  if (state.wrongHand && state.brazoRefusedYear && !state.brazoAskedAgain &&
      state.seasonYear >= state.brazoRefusedYear + 6) {
    state.brazoAskedAgain = true;
    return handednessEvent(2);
  }
  // En una liga amateur no hay contrato que renovar: no existe el evento.
  if (state.firstClub && state.contractYears <= 0 && !state.club.amateur) {
    return contractExpiryEvent(state, rng);
  }
  // El salto a Europa se ofrece una vez, en la ventana en que de verdad pasa.
  if (state.club.amateur && state.age >= 19 && !state.emigrationOffered) {
    state.emigrationOffered = true;
    return emigrationEvent(state, rng);
  }

  const index = state.decisions.length;
  return index > 0 && index % 2 === 0 ? chooseSpecialEvent(state, rng) : marketEvent(state, rng);
}

// El lateral se corre al extremo de su mismo lado y viceversa: es el único
// cambio que de verdad ocurre en handball.
const POSITION_SWAP = { LB: "LW", RB: "RW", LW: "LB", RW: "RB" };

// En handball la mano manda el lado: a la derecha juegan zurdos (el ángulo de
// tiro queda hacia adentro) y a la izquierda diestros. Un diestro de extremo
// derecho no existe en ningún plantel serio.
const HAND_MIRROR = { RW: "LW", RB: "LB", LW: "RW", LB: "RB" };

function wrongSideFor(hand, positionCode) {
  const banned = hand === "Zurda" ? ["LB", "LW"] : ["RW", "RB"];
  return banned.includes(positionCode);
}

/**
 * La charla que define todo: el entrenador te pide cruzarte de lado porque tu
 * brazo de armado quedó contra la línea. Si te negás, los clubes grandes no
 * llaman más; seis años después otro técnico te da la última chance.
 */
function handednessEvent(stage) {
  return {
    id: stage === 1 ? "brazo-armado" : "brazo-armado-2",
    kind: "career-event",
    choices: stage === 1
      ? [
        { id: "cambiar", handFix: true, effects: { rating: 2, potential: 3, form: 1 } },
        { id: "mantener", effects: { loyalty: 1 } }
      ]
      : [
        { id: "cambiar", handFix: true, effects: { rating: 1, potential: 1, form: 1 } },
        { id: "mantener", effects: { loyalty: 1 } }
      ]
  };
}

// Los momentos a todo o nada se resuelven acá: elegiste arriesgar, y el juego
// te dice si la metiste o no. Sin esto, "tirar el siete metros" era un botón
// sin consecuencia visible y la decisión no tenía gusto a nada.
const GAMBLES = {
  "siete-metros:tirar": {
    key: "siete-metros", chance: 0.66,
    win: { fame: 2, form: 2 }, lose: { fame: -2, form: -3 },
  },
  "siete-metros-parada:jugartela": {
    key: "parada", chance: 0.45,
    win: { fame: 3, form: 2 }, lose: { form: -2 },
  },
  "arquero-al-arco-vacio:tirar-al-arco-vacio": {
    key: "arco-vacio", chance: 0.55,
    win: { fame: 3, form: 2 }, lose: { fame: -3, form: -2 },
  },
};

function applyChoice(state, choice, event, rng) {
  const outcome =
    event.id === "competencia-puesto" && choice.id === "pelear"
      ? (rng() < 0.5 ? "titular" : "rotacion")
      : null;
  if (outcome) state.roleOverride = { key: outcome, seasonsLeft: state.pace };

  // Cruzarte de lado por tu mano: cambio deterministico, siempre encaja —
  // es jugar por fin donde el ángulo existe.
  if (choice.handFix) {
    const mirror = HAND_MIRROR[state.player.position];
    if (mirror) {
      const position = positionOf(mirror);
      state.player.position = position.code;
      state.player.positionName = position.name;
      state.positionChanges = (state.positionChanges || 0) + 1;
      state.pendingSwapNote = "encajo";
    }
    state.wrongHand = false;
  }
  if (event.id === "brazo-armado" && choice.id === "mantener") {
    state.brazoRefusedYear = state.seasonYear;
  }
  if (event.id === "brazo-armado-2" && choice.id === "mantener") {
    state.brazoForever = true;
  }

  let swap = null;
  if (choice.positionSwap) {
    const target = POSITION_SWAP[state.player.position];
    if (target) {
      const position = positionOf(target);
      state.player.position = position.code;
      state.player.positionName = position.name;
      // Adaptarse sale bien seis de cada diez veces. Cuando sale mal, perdiste
      // dos años aprendiendo algo que no era para vos.
      swap = rng() < 0.6 ? "encajo" : "no-encajo";
      if (swap === "encajo") {
        state.rating = clamp(state.rating + 2, 46, 99);
        state.potential = clamp(state.potential + 3, state.rating, 99);
      } else {
        state.rating = clamp(state.rating - 2, 46, 99);
        state.potential = clamp(state.potential - 2, state.rating, 99);
        state.form = clamp(state.form - 2, -6, 8);
      }
      state.positionChanges = (state.positionChanges || 0) + 1;
      // Se muestra en el resumen de la primera temporada en el puesto nuevo.
      state.pendingSwapNote = swap;
    }
  }

  const effects = choice.effects || {};
  state.rating = clamp(state.rating + (effects.rating || 0), 46, 99);
  state.potential = clamp(state.potential + (effects.potential || 0), state.rating, 99);
  state.fitness = clamp(state.fitness + (effects.fitness || 0), 35, 100);
  state.form = clamp(state.form + (effects.form || 0), -6, 8);
  state.fame = clamp(state.fame + (effects.fame || 0), -5, 50);
  state.loyalty = clamp(state.loyalty + (effects.loyalty || 0), -20, 50);
  state.risk = clamp(state.risk + (effects.risk || 0), 0, 10);
  state.nationalBoost = clamp(state.nationalBoost + (effects.nationalBoost || 0), 0, 14);

  if (choice.club) {
    const destination = { ...choice.club };
    if (choice.action === "cedido") {
      state.loan = { parentClub: { ...state.club }, seasonsLeft: 1 };
      state.totals.loans += 1;
    } else if (!state.firstClub) {
      state.firstClub = { ...destination };
      state.startPrestige = destination.prestige ?? 3;
      // Formarte en un grande de Argentina arranca la carrera un punto arriba.
      if (destination.country === "ARG" && (destination.strength ?? 1) >= 3) {
        state.rating = clamp(state.rating + 1, 46, 99);
      }
    } else if (destination.id !== state.club.id) {
      state.totals.transfers += 1;
    }
    state.club = destination;
    if (choice.contractYears) state.contractYears = choice.contractYears;
  }

  // Firmar en el último ciclo es estirar la carrera: corre el retiro un año
  // más allá (nunca después de los 42) y degrada el mercado del próximo ciclo.
  if (choice.club && (event.id === "ultimo-contrato" || event.id.startsWith("estirar-"))) {
    state.stretchCycles = (state.stretchCycles || 0) + 1;
    state.retirementAge = Math.min(state.age + state.pace + 1, MAX_STRETCH_AGE);
  }
  // Cerrar el círculo: en el club de origen se juega el torneo del país,
  // aunque el club esté en una categoría de ascenso.
  if (choice.id === "volver-al-origen") state.originReturn = true;

  if (effects.flag) {
    state.flags[effects.flag] = (state.flags[effects.flag] || 0) + 1;
  }

  // Maternidad: si pausás, la próxima temporada es de licencia. En cualquiera
  // de los dos caminos queda marcado el año: los títulos que vengan después
  // valen más (la vuelta de mamá se paga en finishCareer).
  if (effects.maternity) {
    state.maternityLeave = (state.maternityLeave || 0) + (effects.maternityLeave ?? 1);
    state.maternitySeason = state.seasonYear;
  }

  const gamble = GAMBLES[`${event.id}:${choice.id}`];
  let gambleResult = null;
  if (gamble) {
    // Estar en forma ayuda un poco, pero nunca es seguro: por eso es apuesta.
    const chance = clamp(gamble.chance + state.form * 0.02, 0.2, 0.85);
    gambleResult = rng() < chance ? "win" : "lose";
    const extra = gamble[gambleResult];
    state.fame = clamp(state.fame + (extra.fame || 0), -5, 50);
    state.form = clamp(state.form + (extra.form || 0), -6, 8);
    state.pendingGambleNote = { key: gamble.key, result: gambleResult };
  }

  if (effects.retireNow) state.retireNow = true;

  state.decisions.push({
    age: state.age,
    year: state.seasonYear,
    kind: event.kind,
    eventId: event.id,
    event: event.title,
    choiceId: choice.id,
    choice: choice.label,
    club: choice.club?.name || null,
    ...(outcome ? { outcome } : {}),
    ...(swap ? { swap, newPosition: state.player.position } : {}),
    ...(gambleResult ? { gamble: gamble.key, gambleResult } : {})
  });
}

// ---------------------------------------------------------------------------
// Simulación de temporada
// ---------------------------------------------------------------------------

function ratingCurve(state, rng) {
  const { age } = state;
  // Jugar amateur cuesta caro: entrenás de noche, después de laburar, con
  // menos cuerpo técnico y menos partidos exigentes. Se nota en la curva.
  // Y el club donde te formás importa: en un grande entrenás todos los días
  // con internacionales y con cuerpo técnico de verdad. Sin esto, arrancar a
  // propósito en la liga más chica era plata gratis por el bono de salto.
  //
  // Los dos castigos no se acumulan: el amateur ya es el piso.
  // Excepción: la elite argentina (River, Ballester, SEDALO...) forma bien
  // aunque sea amateur — ahí no se castiga el desarrollo.
  const eliteArg = state.club.country === "ARG" && (state.club.strength ?? 1) >= 3;
  const academy = eliteArg ? 1
    : state.club.amateur ? 0.72
    : 0.82 + (state.club.prestige ?? 3) * 0.06;
  const amateur = state.club.amateur && !eliteArg ? 0.85 : 1;
  if (age <= 23) {
    return Math.max(0, (state.potential - state.rating) * (0.16 + rng() * 0.07) * academy);
  }
  if (age <= 29) return (rng() < 0.75 ? 0.4 + rng() * 1.5 : -rng() * 0.6) * amateur;
  // La meseta dura hasta los 33: un profesional cuidado sostiene su nivel
  // (Karabatic jugó de elite hasta los 40). La caída llega después, y es
  // gradual: quien estira hasta los 42 termina en ~74, no en 60.
  if (age <= 33) return (rng() - 0.5) * 1.1;
  return -(0.25 + rng() * (age - 33) * 0.22);
}

function simulateSeason(state, rng) {
  const position = positionOf(state.player.position);
  const role = projectSquadRole(state);
  const { age, seasonYear: year } = state;

  // Licencia por maternidad: la temporada pasa sin partidos, sin lesiones y
  // sin títulos; el cuerpo descansa y la carrera espera.
  const maternity = (state.maternityLeave || 0) > 0;
  if (maternity) state.maternityLeave -= 1;

  let change = ratingCurve(state, rng) + state.form * 0.08;
  if (maternity) change = -0.4;
  // Estirar más allá del retiro natural se paga: el nivel baja más rápido y
  // el cuerpo de un veterano se rompe mucho más seguido — pero es declive,
  // no un precipicio.
  if (state.age >= RETIREMENT_AGE) change -= 0.5 + rng() * 0.8;
  // Jugar del lado equivocado para tu mano, después de que te lo dijeron, se
  // paga todos los fines de semana: sin ángulo de tiro no hay crecimiento.
  if (state.wrongHand && state.brazoRefusedYear) change -= 0.85;
  const injuryChance = clamp(
    0.05 + state.risk * 0.02 + (100 - state.fitness) * 0.002 +
      Math.max(0, state.age - 34) * 0.025,
    0.03, 0.45
  );
  const injured = !maternity && rng() < injuryChance;
  if (injured) {
    change -= 0.5 + rng() * 1.8;
    state.fitness -= between(6, 16, rng);
  }
  if (state.club.amateur && state.age >= AMATEUR_CEILING_AGE && !state.ceilingDropped) {
    state.potential = clamp(state.potential - 8, state.rating, 99);
    state.ceilingDropped = true;
  }
  state.rating = clamp(Math.round((state.rating + change) * 10) / 10, 46, state.potential);
  state.maxRating = Math.max(state.maxRating, state.rating);

  const availability = maternity ? 0 : injured ? 0.5 + rng() * 0.25 : 0.85 + rng() * 0.15;
  const selection = clamp(role.share + state.form * 0.014 + state.loyalty * 0.0015, 0.3, 1);
  const matches = round((state.club.amateur ? AMATEUR_MATCHES : MATCHES_PER_SEASON) * availability * selection);
  const minutes = round(matches * between(role.minutesMin, role.minutesMax, rng));

  const performance = clamp(
    (state.rating - 50) / 36 + state.form * 0.025 + state.club.strength * 0.03,
    0.35, 1.3
  );

  const keeper = Boolean(position.keeper);
  const goals = keeper ? 0 : noisy(matches * position.goalRate * performance, rng);
  const assists = noisy(matches * position.assistRate * performance, rng, 0.35);
  const shots = keeper ? 0 : round(goals / clamp(0.5 + performance * 0.16, 0.42, 0.72));
  const shotsFaced = keeper ? round(matches * between(24, 32, rng)) : 0;
  const savePct = keeper ? clamp(0.24 + (state.rating - 50) * 0.0055 + state.club.strength * 0.006, 0.22, 0.42) : 0;
  const saves = keeper ? round(shotsFaced * savePct) : 0;
  const twoMinutes = round(matches * (position.line === "PIV" || position.line === "LAT" ? 0.34 : 0.16) * (0.7 + rng() * 0.6));
  const redCards = rng() < 0.06 + state.risk * 0.012 ? 1 : 0;

  const season = {
    year, age,
    club: state.club.name,
    clubId: state.club.id,
    league: state.club.leagueName,
    country: state.club.countryName,
    strength: state.club.strength,
    prestige: state.club.prestige ?? 3,
    rating: Math.round(state.rating),
    role: role.key,
    loan: Boolean(state.loan),
    matches, minutes, goals, assists, shots, saves, shotsFaced,
    savePct: keeper ? Math.round(savePct * 100) : null,
    shotPct: shots ? Math.round((goals / shots) * 100) : null,
    twoMinutes, redCards, injured,
    swap: state.pendingSwapNote || null,
    gamble: state.pendingGambleNote || null,
    caps: 0, nationalGoals: 0, nationalAssists: 0,
    honours: []
  };
  state.pendingSwapNote = null;
  state.pendingGambleNote = null;
  if (maternity) season.maternity = true;

  // --- títulos de club --------------------------------------------------
  // De licencia no se levantan copas: titleChance 0 apaga todos los sorteos.
  const titleChance = maternity ? 0 : clamp(
    0.02 + state.club.strength * 0.04 + Math.max(0, state.rating - 72) * 0.006, 0.03, 0.4
  );
  const clubPrestige = state.club.prestige ?? 3;
  if (rng() < titleChance) {
    addTrophy(state, season, "league", { league: state.club.leagueName },
      state.club.leagueName, LEAGUE_TITLE_WEIGHT * clubPrestige);
  }

  if (state.club.country === "ARG") {
    // El handball argentino tiene su propio calendario y sus propias copas:
    // el Super 8 de FeMeBal, el Nacional de Clubes de la CAH (se juega entre
    // todos los clubes del país) y, para los grandes, el Panamericano de
    // Clubes — la Libertadores del handball. Acá no existe la EHF.
    if (rng() < titleChance * 0.6) {
      addTrophy(state, season, "super8", {}, "Super 8", 5);
    }
    if ((state.club.tier === 1 || state.originReturn) && rng() < titleChance * 0.5) {
      addTrophy(state, season, "nacional-clubes", {}, "Nacional de Clubes", 13);
    }
    if (state.club.tier === 1 && state.club.strength >= 3 && rng() < titleChance * 0.35) {
      addTrophy(state, season, "panamericano", {}, "Panamericano de Clubes", 22);
    }
  } else {
    if (rng() < titleChance * 0.6) {
      addTrophy(state, season, "cup", { country: state.club.country },
        `Copa de ${state.club.countryName}`, CUP_WEIGHT);
    }
    if (state.club.confederation === "EHF") {
      if (state.club.strength >= 4 && rng() < titleChance * 0.4) {
        addTrophy(state, season, "champions", {}, "EHF Champions League", 70);
      } else if (state.club.strength === 3 && rng() < titleChance * 0.3) {
        addTrophy(state, season, "european-league", {}, "EHF European League", 34);
      }
    } else if (state.club.confederation === "AHF" && state.club.strength >= 3 &&
               rng() < titleChance * 0.35) {
      addTrophy(state, season, "asian-clubs", {}, "Campeonato Asiático de Clubes", 26);
    }
  }

  // --- selección --------------------------------------------------------
  const nationalQuality = state.rating + state.nationalBoost + state.fame * 0.08;
  let caps = 0;
  let nationalGoals = 0;
  let nationalAssists = 0;
  const scouted = !maternity && (state.club.prestige ?? 3) >= NATIONAL_TEAM_PRESTIGE;
  if (scouted && nationalQuality >= 68 && rng() < clamp((nationalQuality - 64) / 28, 0.1, 0.94)) {
    caps = between(4, 14, rng);
    nationalGoals = keeper ? 0 : noisy(caps * position.goalRate * 0.8, rng, 0.5);
    nationalAssists = keeper ? 0 : noisy(caps * position.assistRate * 0.8, rng, 0.5);
    // Ganar con una selección de fuera de Europa (Argentina) es casi
    // imposible: si pasa, vale un 60 % más.
    const confederation = countryOf(state.player.country).confederation;
    const merit = confederation === "EHF" ? 1 : 1.6;
    if (year % 2 === 1 && nationalQuality >= 80 && rng() < 0.06 + (nationalQuality - 79) * 0.008) {
      addTrophy(state, season, "worlds", {}, "Campeonato Mundial IHF", round(130 * merit));
    }
    if (year % 4 === 0 && nationalQuality >= 84 && rng() < 0.05) {
      addTrophy(state, season, "olympics", {}, "Juegos Olímpicos", round(150 * merit));
    }
    if (year % 2 === 0 && nationalQuality >= 76 && rng() < 0.09) {
      addTrophy(state, season, confederation === "EHF" ? "euro" : "continental", {},
        confederation === "EHF" ? "EHF Euro" : "Campeonato continental", round(55 * merit));
    }
  }

  // --- premios individuales --------------------------------------------
  const awardScore = keeper
    ? state.rating + (season.savePct || 0) * 1.4 + season.honours.length * 12
    : state.rating + goals * 0.4 + assists * 0.5 + season.honours.length * 12;
  // El premio al mejor del mundo se gana una vez cada muchos años: cada uno que
  // ya tenés hace mucho menos probable el siguiente. Sin esto, un jugador de 92
  // se lo lleva casi todas las temporadas y la vitrina pierde sentido.
  const alreadyBest = state.awards.filter((award) => award.key === "ihf-player").length;
  const bestChance = clamp((awardScore - 110) / 90, 0.06, 0.6) / (1 + alreadyBest * 2.4);
  if (maternity) {
    // Sin jugar no hay premios individuales.
  } else if (awardScore >= 128 && clubPrestige >= 4 && caps > 0 && rng() < bestChance) {
    // El premio IHF se juega en los Mundiales: nadie lo gana desde un club
    // chico de Argentina o una segunda división, ni sin vestir su selección.
    addAward(state, season, "ihf-player", {}, "Mejor jugador del mundo IHF", 95);
  } else if (!keeper && goals >= 150 && rng() < 0.3) {
    addAward(state, season, "top-scorer", {}, "Máximo goleador de la liga", 40);
  } else if (rng() < 0.12 && state.rating >= 80) {
    addAward(state, season, "all-star", {}, "Equipo ideal del torneo", 30);
  }

  // --- acumulados -------------------------------------------------------
  // Cada zona gris que aceptaste es una ruleta que se tira todos los años.
  for (const [flag, times] of Object.entries(state.flags)) {
    if (!times || state.caughtFor?.[flag]) continue;
    if (rng() < 0.038 * times) {
      state.caughtFor = { ...(state.caughtFor || {}), [flag]: true };
      state.scandals.push({ flag, year, age });
      season.scandal = flag;
      state.rating = clamp(state.rating - 5, 46, 99);
      state.potential = clamp(state.potential - 4, state.rating, 99);
      state.fame = clamp(state.fame - 8, -5, 50);
      state.form = -4;
      season.matches = Math.round(season.matches * 0.25);
      season.goals = Math.round(season.goals * 0.25);
      season.assists = Math.round(season.assists * 0.25);
      season.saves = Math.round(season.saves * 0.25);
    }
  }

  const totals = state.totals;
  totals.seasons += 1;
  totals.matches += matches;
  totals.goals += goals;
  totals.assists += assists;
  totals.shots += shots;
  totals.saves += saves;
  totals.shotsFaced += shotsFaced;
  totals.twoMinutes += twoMinutes;
  totals.redCards += redCards;
  season.caps = caps;
  season.nationalGoals = nationalGoals;
  season.nationalAssists = nationalAssists;
  totals.caps += caps;
  totals.nationalGoals += nationalGoals;
  totals.nationalAssists += nationalAssists;

  state.squadRole = role.key;
  const salary = estimateSalary(state, role.key);
  season.salary = salary;
  if (salary > (state.maxSalary || 0)) state.maxSalary = salary;
  state.peakPrestige = Math.max(state.peakPrestige, state.club.prestige ?? 1);
  if ((state.club.prestige ?? 1) <= (state.startPrestige ?? 3)) state.seasonsLow += 1;
  state.timeline.push(season);

  if (state.roleOverride && --state.roleOverride.seasonsLeft <= 0) state.roleOverride = null;
  if (state.loan && --state.loan.seasonsLeft <= 0) {
    state.club = { ...state.loan.parentClub };
    state.loan = null;
    state.form = clamp(state.form + 1, -5, 7);
  }
  if (state.contractYears > 0) state.contractYears -= 1;

  state.form = clamp(state.form + (performance > 0.9 ? 1 : -1) + (rng() < 0.35 ? 1 : 0), -5, 7);
  state.fitness = clamp(state.fitness + between(1, 6, rng) - (injured ? 3 : 0), 35, 100);
  state.nationalBoost = Math.max(0, state.nationalBoost - 1);
  state.age += 1;
  state.seasonYear += 1;

  return season;
}

/**
 * Los honores se guardan como clave + parámetros, no como texto: la capa de
 * i18n los traduce. `name` queda como respaldo en español por si falta la
 * traducción.
 */
function addHonour(list, state, season, key, params, name, weight) {
  const item = { key, params, name, weight, year: season.year, age: season.age, club: season.club };
  state[list].push(item);
  season.honours.push({ key, params, name });
  return item;
}

const addTrophy = (state, season, key, params, name, weight) =>
  addHonour("trophies", state, season, key, params, name, weight);

const addAward = (state, season, key, params, name, weight) =>
  addHonour("awards", state, season, key, params, name, weight);

// ---------------------------------------------------------------------------
// Cierre
// ---------------------------------------------------------------------------

const VERDICTS = [
  { min: 1170, key: "inmortal", title: "Inmortal del handball", line: "Una era lleva tu nombre. Los números dejaron de ser creíbles hace rato." },
  { min: 925, key: "icono", title: "Ícono mundial", line: "Finales grandes, títulos y una carrera que pasó por encima de un solo escudo." },
  { min: 695, key: "leyenda", title: "Leyenda de club", line: "Una generación entera aprendió el juego mirándote a vos." },
  { min: 470, key: "idolo", title: "Ídolo de tribuna", line: "No hizo falta ser perfecto. Te ganaste cantitos, cicatrices y cariño para siempre." },
  { min: 0, key: "trotamundos", title: "Trotamundos", line: "Cada camiseta fue un capítulo. El camino terminó siendo la historia." }
];

function finishCareer(state) {
  const position = positionOf(state.player.position);
  const trophyWeight = state.trophies.reduce((sum, item) => sum + item.weight, 0);
  const awardWeight = state.awards.reduce((sum, item) => sum + item.weight, 0);

  // La producción se normaliza por puesto: un arquero hace 5.000 atajadas y un
  // pivote 700 goles, así que sin corregir elegir arquero era la mejor jugada
  // del juego. Los factores están calibrados para que los siete puestos den
  // medias parecidas, con un matiz a favor del arquero y el central.
  const raw = position.keeper
    ? state.totals.saves * 0.06
    : state.totals.goals * 0.05 + state.totals.assists * 0.045;
  const production = raw * position.scoreFactor + state.totals.nationalGoals * 0.5;

  // Lo que más pesa: de dónde saliste y hasta dónde llegaste. Un argentino que
  // arranca en el ascenso y termina jugando la Champions hizo el viaje entero.
  //
  // Pero el salto se cobra por haber estado abajo de verdad, no por pasar un
  // año a propósito en una liga chica para cobrar el bono: sin esto, arrancar
  // en la peor oferta de la academia valía casi 100 puntos gratis.
  const steps = Math.max(0, state.peakPrestige - (state.startPrestige ?? 3));
  const paidDues = Math.min(1, state.seasonsLow / CLIMB_MIN_SEASONS);
  const climb = round(steps * CLIMB_WEIGHT * paidDues);

  const paceFactor = PACES.find((p) => p.value === state.pace).scoreFactor;

  // La vuelta de mamá: parar la carrera y volver a ganar vale más que ganar
  // de corrido. Cada título posterior suma un 60 % extra de su peso, más un
  // piso por haber vuelto.
  const postMaternity = state.maternitySeason
    ? state.trophies.filter((item) => item.year > state.maternitySeason)
    : [];
  const comeback = state.maternitySeason
    ? round(postMaternity.reduce((sum, item) => sum + item.weight, 0) * 0.6) + 12
    : 0;
  state.comeback = comeback;
  state.comebackTitles = postMaternity.length;

  state.climb = climb;
  state.climbDetail = {
    from: state.firstClub?.leagueName || null,
    to: state.timeline.reduce((best, season) =>
      (season.prestige ?? 0) > (best.prestige ?? 0) ? season : best, {}).league || null,
    steps,
  };
  state.score = round(
    (state.totals.matches * 0.12 + production + state.totals.caps * 1.15 +
      trophyWeight * 0.55 + awardWeight * 0.65 + state.maxRating * 1.1 +
      climb + comeback + Math.max(0, state.loyalty) + state.fame * 5) * paceFactor
  );
  state.verdict = VERDICTS.find((verdict) => state.score >= verdict.min);
  state.ended = true;
  state.pendingEvent = null;
}

export function advanceCareer(state, choiceId = null, rng = Math.random) {
  if (state.ended) return state;

  if (!state.pendingEvent && !state.firstClub) {
    state.pendingEvent = academyOffers(state, rng);
    return state;
  }

  if (state.pendingEvent) {
    const choice = state.pendingEvent.choices.find((entry) => entry.id === choiceId);
    if (!choice) throw new Error("Hace falta una decisión válida.");
    applyChoice(state, choice, state.pendingEvent, rng);
    state.pendingEvent = null;
    if (state.retireNow) {
      // Sin esto, la transición del retiro repetía los beats de las
      // temporadas anteriores y parecía que el juego no había terminado.
      state.latestBlock = [];
      finishCareer(state);
      return state;
    }
  }

  state.latestBlock = [];
  for (let index = 0; index < state.pace && state.age < state.retirementAge; index += 1) {
    state.latestBlock.push(simulateSeason(state, rng));
  }

  if (state.age >= state.retirementAge) finishCareer(state);
  else state.pendingEvent = chooseNextEvent(state, rng);

  return state;
}

export function careerProgress(state) {
  return clamp(state.totals.seasons / (RETIREMENT_AGE - START_AGE), 0, 1);
}

export const MAJOR_TROPHIES = ["worlds", "olympics", "champions"];

export function shareText(state) {
  if (!state.ended) return "";
  const keeper = positionOf(state.player.position).keeper;
  const major = state.trophies.filter((item) =>
    ["worlds", "olympics", "champions"].includes(item.key)
  ).length;

  return [
    `${state.player.flag} ${state.player.lastName} — ${state.verdict.title}`,
    keeper
      ? `${state.totals.matches} partidos · ${state.totals.saves} atajadas`
      : `${state.totals.matches} partidos · ${state.totals.goals} goles · ${state.totals.assists} asistencias`,
    `${major} títulos grandes · Pico ${Math.round(state.maxRating)} VAL · ${state.totals.caps} caps`,
    `Puntaje: ${state.score}`,
    "¿Podés armar una carrera mejor?"
  ].join("\n");
}
