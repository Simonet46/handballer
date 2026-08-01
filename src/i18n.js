/**
 * Textos de HANDBALLER en español, francés y alemán.
 *
 * El motor no sabe de idiomas: guarda claves (`worlds`, `doble-turno`) y acá
 * se resuelven. Si falta una traducción cae al español, así nunca queda un
 * hueco en pantalla.
 */

export const LOCALES = ["es", "fr", "de"];
export const LOCALE_NAMES = { es: "Español", fr: "Français", de: "Deutsch" };

const es = {
  meta: {
    title: "HANDBALLER · Simulá tu carrera de handball",
    description:
      "Creá un handbolista, tomá las decisiones difíciles y mirá hasta dónde llega. " +
      "Una carrera entera en dos minutos. Gratis, sin registro.",
  },
  ui: {
    tagline: "Una carrera de handball entera en dos minutos",
    intro:
      "Elegí de dónde salís, tomá cada decisión y descubrí si terminás siendo " +
      "leyenda de tu club o trotamundos.",
    setupTitle: "Creá tu jugador",
    lastName: "Apellido",
    lastNamePlaceholder: "TU APELLIDO",
    number: "Dorsal",
    hand: "Mano hábil",
    handRight: "Diestra",
    handLeft: "Zurda",
    country: "País",
    position: "Puesto",
    pace: "Ritmo",
    start: "Empezar la carrera",
    season: "Temporada",
    age: "Edad",
    years: "años",
    rating: "VAL",
    role: "Rol",
    club: "Club",
    matches: "PJ",
    goals: "Goles",
    assists: "Asist.",
    saves: "Atajadas",
    savePct: "% atajadas",
    shotPct: "% de tiro",
    twoMinutes: "2 min",
    caps: "Caps",
    continue: "Seguir",
    seasonSummary: "Lo que pasó",
    injured: "Lesión",
    loan: "Cedido",
    yourCareer: "Tu carrera",
    honours: "Vitrina",
    noHonours: "Sin títulos. No todas las carreras se miden en vitrina.",
    score: "Puntaje",
    peak: "Pico",
    clubs: "Clubes",
    share: "Compartir",
    shareImage: "Bajar imagen",
    copied: "¡Copiado!",
    playAgain: "Jugar de nuevo",
    freeAgent: "Sin club",
    startsAt: "Empezás acá",
    contract: "Contrato",
    seasonsShort: "temp.",
  },
  positions: {
    GK: "Arquero", LW: "Extremo izquierdo", LB: "Lateral izquierdo",
    CB: "Central", RB: "Lateral derecho", RW: "Extremo derecho", PV: "Pivote",
  },
  roles: {
    juvenil: "Juvenil", rotacion: "Rotación", titular: "Titular", franquicia: "Figura",
  },
  paces: {
    1: { name: "Intenso", detail: "Una decisión por temporada" },
    2: { name: "Normal", detail: "Una decisión cada 2 temporadas" },
    3: { name: "Exprés", detail: "Una decisión cada 3 temporadas" },
  },
  countries: {
    FRA: "Francia", GER: "Alemania", ARG: "Argentina", ESP: "España",
    DEN: "Dinamarca", HUN: "Hungría", POL: "Polonia", POR: "Portugal",
    SWE: "Suecia", NOR: "Noruega", ROU: "Rumanía", SLO: "Eslovenia",
    CRO: "Croacia", MKD: "Macedonia del Norte", SUI: "Suiza", AUT: "Austria",
    ISL: "Islandia", QAT: "Qatar", EGY: "Egipto", TUN: "Túnez",
    BRA: "Brasil", JPN: "Japón",
  },
  honours: {
    league: "{league}",
    cup: "Copa de {country}",
    champions: "EHF Champions League",
    "european-league": "EHF European League",
    worlds: "Campeonato Mundial IHF",
    olympics: "Juegos Olímpicos",
    euro: "EHF Euro",
    continental: "Campeonato continental",
    "ihf-player": "Mejor jugador del mundo IHF",
    "top-scorer": "Máximo goleador de la liga",
    "all-star": "Equipo ideal del torneo",
  },
  verdicts: {
    inmortal: { title: "Inmortal del handball", line: "Una era lleva tu nombre. Los números dejaron de ser creíbles hace rato." },
    icono: { title: "Ícono mundial", line: "Finales grandes, títulos y una carrera que pasó por encima de un solo escudo." },
    leyenda: { title: "Leyenda de club", line: "Una generación entera aprendió el juego mirándote a vos." },
    idolo: { title: "Ídolo de tribuna", line: "No hizo falta ser perfecto. Te ganaste cantitos, cicatrices y cariño para siempre." },
    trotamundos: { title: "Trotamundos", line: "Cada camiseta fue un capítulo. El camino terminó siendo la historia." },
  },
  market: {
    inferiores: { eyebrow: "Inferiores", title: "¿Dónde empieza tu carrera?", body: "Tres clubes te quieren en su plantel juvenil. Elegí de dónde salís." },
    mercado: { eyebrow: "Mercado de pases", title: "Elegí tu próximo club", body: "Llegaron ofertas después de tu última temporada. Aceptá una o quedate." },
    contrato: { eyebrow: "Fin de contrato", title: "Se te vence el contrato", body: "Renovar con el club que te conoce, o salir libre a otro proyecto." },
    ultimo: { eyebrow: "Último contrato", title: "Una decisión más", body: "Dos clubes quieren tu experiencia. Firmá un último capítulo o retirate ahora." },
    actions: { firmar: "Firmar", seguir: "Quedarte", renovar: "Renovar", libre: "Salir libre", cedido: "Ir cedido", retirarse: "Retirarte" },
    retire: { label: "Retirarte", detail: "Colgar las zapatillas" },
  },
  events: {
    "doble-turno": {
      eyebrow: "Gimnasio", title: "El preparador te ofrece doble turno",
      body: "Podés ganar el kilo de músculo que te falta para aguantar el contacto en seis metros, o llegar fundido al fin de semana.",
      choices: { doble: { label: "Doble turno", detail: "Más fuerza, menos frescura" }, cuidarse: { label: "Cuidar el cuerpo", detail: "La temporada es larga" } },
    },
    "competencia-puesto": {
      eyebrow: "Oficina del entrenador", title: "El club fichó a otro para tu puesto",
      body: "Un internacional llega a pelearte el lugar. Podés quedarte a ganártelo o aceptar la oferta que apareció.",
      choices: { pelear: { label: "Pelear el puesto", detail: "50 % titular · 50 % rotación" }, salir: { label: "Aceptar la oferta", detail: "Camiseta nueva, minutos seguros" } },
    },
    "rotura-ligamento": {
      eyebrow: "Quirófano", title: "Cruzado anterior",
      body: "La lesión que todo handbolista teme. Ocho meses afuera y una decisión sobre cómo volver.",
      choices: { "rehab-completa": { label: "Rehabilitación completa", detail: "−3 VAL · mucho menos riesgo después" }, "volver-antes": { label: "Volver antes de tiempo", detail: "Recuperás el puesto · la rodilla queda marcada" } },
    },
    "hombro-lanzador": {
      eyebrow: "Kinesiología", title: "El hombro de lanzar dice basta",
      body: "Tendinitis crónica. Podés infiltrarte y seguir jugando o parar y perder el ritmo.",
      choices: { parar: { label: "Parar y tratarlo", detail: "Perdés ritmo · protegés el brazo" }, infiltrarse: { label: "Infiltrarse y jugar", detail: "No perdés el puesto · pagás después" } },
    },
    "siete-metros": {
      eyebrow: "Últimos segundos", title: "Siete metros para ganar la serie",
      body: "El estadio de pie. El entrenador te busca con la mirada.",
      choices: { tirar: { label: "Agarrar la pelota", detail: "Gloria o silbatina" }, ceder: { label: "Dejárselo al capitán", detail: "Sin riesgo, sin historia" } },
    },
    seleccion: {
      eyebrow: "Ventana internacional", title: "Te citan justo antes del clásico",
      body: "Cruzar el Atlántico para dos amistosos, con el técnico del club pidiéndote que no vayas.",
      choices: { ir: { label: "Ir a la selección", detail: "El seleccionado primero" }, quedarse: { label: "Quedarte en el club", detail: "Cuidás el puesto que te paga" } },
    },
    "defensa-6-0": {
      eyebrow: "Pizarrón", title: "Te quieren de central de la 6-0",
      body: "Aprender a defender adentro te da minutos que hoy no tenés, pero te saca del ataque.",
      choices: { aprender: { label: "Aprender el rol", detail: "Más caminos · menos protagonismo" }, atacar: { label: "Seguir siendo atacante", detail: "Tu juego, tu riesgo" } },
    },
    cesion: {
      eyebrow: "Plan de desarrollo", title: "Una cesión para jugar de verdad",
      body: "Un año en un club más chico, jugando los 60 minutos, y volvés.",
      choices: { "aceptar-cesion": { label: "Aceptar la cesión", detail: "Una temporada de minutos" }, "quedarse-pelear": { label: "Quedarte a pelearla", detail: "Banco, pero en el club grande" } },
    },
    "roja-directa": {
      eyebrow: "Comité de disciplina", title: "Roja directa y expediente",
      body: "Un impacto en la cabeza en contraataque. La federación pide explicaciones.",
      choices: { disculparse: { label: "Pedir disculpas públicas", detail: "Bajás la sanción · perdés carácter" }, bancarsela: { label: "Bancártela", detail: "El vestuario te respeta · tres fechas afuera" } },
    },
    "crisis-club": {
      eyebrow: "Vestuario", title: "El club no paga hace tres meses",
      body: "Podés encabezar el reclamo del plantel o mirar para otro lado y jugar.",
      choices: { encabezar: { label: "Encabezar el reclamo", detail: "Te respetan · te marcan" }, jugar: { label: "Sólo jugar", detail: "Guardás energía · perdés peso" } },
    },
    capitania: {
      eyebrow: "Antes del sorteo", title: "Te ofrecen la cinta",
      body: "Ser capitán te da voz en el club y la culpa de cada noche mala.",
      choices: { "aceptar-cinta": { label: "Ponerte la cinta", detail: "Liderás · cargás" }, "sin-cinta": { label: "Seguir sin cinta", detail: "Cuidás tu juego" } },
    },
    "volver-a-casa": {
      eyebrow: "Un llamado desde casa", title: "Tu club de origen quiere tus últimos años",
      body: "Volver a la liga donde empezaste, o exprimir el último contrato grande en Europa.",
      choices: { volver: { label: "Volver a casa", detail: "Cerrar el círculo" }, "seguir-afuera": { label: "Seguir afuera", detail: "El nivel más alto hasta el final" } },
    },
    mentor: {
      eyebrow: "Últimos capítulos", title: "Un pibe de 18 te pide consejos",
      body: "Es el que va a ocupar tu lugar. Podés enseñarle todo o hacérselo ganar.",
      choices: { ensenar: { label: "Enseñarle todo", detail: "Legado más allá de los números" }, "que-lo-gane": { label: "Que se lo gane", detail: "Un último pico egoísta" } },
    },
  },
  share: {
    line: "¿Podés armar una carrera mejor?",
    matches: "{n} partidos",
    goalsLine: "{goals} goles · {assists} asistencias",
    savesLine: "{saves} atajadas",
    major: "{n} títulos grandes",
    peak: "Pico {n} VAL",
    caps: "{n} caps",
  },
};

const fr = {
  meta: {
    title: "HANDBALLER · Simule ta carrière de handball",
    description:
      "Crée un handballeur, prends les décisions difficiles et vois jusqu'où il monte. " +
      "Une carrière entière en deux minutes. Gratuit, sans inscription.",
  },
  ui: {
    tagline: "Une carrière de handball entière en deux minutes",
    intro:
      "Choisis d'où tu viens, prends chaque décision et découvre si tu finis " +
      "légende d'un club ou globe-trotter.",
    setupTitle: "Crée ton joueur",
    lastName: "Nom",
    lastNamePlaceholder: "TON NOM",
    number: "Numéro",
    hand: "Main forte",
    handRight: "Droitier",
    handLeft: "Gaucher",
    country: "Pays",
    position: "Poste",
    pace: "Rythme",
    start: "Commencer la carrière",
    season: "Saison",
    age: "Âge",
    years: "ans",
    rating: "NOTE",
    role: "Rôle",
    club: "Club",
    matches: "MJ",
    goals: "Buts",
    assists: "Passes",
    saves: "Arrêts",
    savePct: "% d'arrêts",
    shotPct: "% de tir",
    twoMinutes: "2 min",
    caps: "Sélections",
    continue: "Continuer",
    seasonSummary: "Ce qui s'est passé",
    injured: "Blessure",
    loan: "Prêté",
    yourCareer: "Ta carrière",
    honours: "Palmarès",
    noHonours: "Aucun titre. Toutes les carrières ne se mesurent pas en trophées.",
    score: "Score",
    peak: "Pic",
    clubs: "Clubs",
    share: "Partager",
    shareImage: "Télécharger l'image",
    copied: "Copié !",
    playAgain: "Rejouer",
    freeAgent: "Sans club",
    startsAt: "Tu commences ici",
    contract: "Contrat",
    seasonsShort: "sais.",
  },
  positions: {
    GK: "Gardien", LW: "Ailier gauche", LB: "Arrière gauche",
    CB: "Demi-centre", RB: "Arrière droit", RW: "Ailier droit", PV: "Pivot",
  },
  roles: {
    juvenil: "Espoir", rotacion: "Rotation", titular: "Titulaire", franquicia: "Cadre",
  },
  paces: {
    1: { name: "Intense", detail: "Une décision par saison" },
    2: { name: "Normal", detail: "Une décision toutes les 2 saisons" },
    3: { name: "Express", detail: "Une décision toutes les 3 saisons" },
  },
  countries: {
    FRA: "France", GER: "Allemagne", ARG: "Argentine", ESP: "Espagne",
    DEN: "Danemark", HUN: "Hongrie", POL: "Pologne", POR: "Portugal",
    SWE: "Suède", NOR: "Norvège", ROU: "Roumanie", SLO: "Slovénie",
    CRO: "Croatie", MKD: "Macédoine du Nord", SUI: "Suisse", AUT: "Autriche",
    ISL: "Islande", QAT: "Qatar", EGY: "Égypte", TUN: "Tunisie",
    BRA: "Brésil", JPN: "Japon",
  },
  honours: {
    league: "{league}",
    cup: "Coupe · {country}",
    champions: "EHF Champions League",
    "european-league": "EHF European League",
    worlds: "Championnat du monde IHF",
    olympics: "Jeux olympiques",
    euro: "Euro EHF",
    continental: "Championnat continental",
    "ihf-player": "Meilleur joueur du monde IHF",
    "top-scorer": "Meilleur buteur du championnat",
    "all-star": "Équipe type du tournoi",
  },
  verdicts: {
    inmortal: { title: "Immortel du handball", line: "Une époque porte ton nom. Les chiffres ont cessé d'être crédibles depuis longtemps." },
    icono: { title: "Icône mondiale", line: "Des grands soirs, des titres, et une carrière qui a dépassé un seul maillot." },
    leyenda: { title: "Légende du club", line: "Toute une génération a appris le jeu en te regardant." },
    idolo: { title: "Idole des tribunes", line: "Pas besoin d'être parfait. Tu as gagné des chants, des cicatrices et de l'affection pour toujours." },
    trotamundos: { title: "Globe-trotter", line: "Chaque maillot fut un chapitre. La route est devenue l'histoire." },
  },
  market: {
    inferiores: { eyebrow: "Centre de formation", title: "Où commence ta carrière ?", body: "Trois clubs te veulent dans leur équipe jeune. Choisis d'où tu sors." },
    mercado: { eyebrow: "Mercato", title: "Choisis ton prochain club", body: "Des offres sont arrivées après ta dernière saison. Accepte-en une ou reste." },
    contrato: { eyebrow: "Fin de contrat", title: "Ton contrat arrive à terme", body: "Prolonger avec le club qui te connaît, ou partir libre vers un autre projet." },
    ultimo: { eyebrow: "Dernier contrat", title: "Une décision de plus", body: "Deux clubs veulent ton expérience. Signe un dernier chapitre ou arrête maintenant." },
    actions: { firmar: "Signer", seguir: "Rester", renovar: "Prolonger", libre: "Partir libre", cedido: "Partir en prêt", retirarse: "Prendre ta retraite" },
    retire: { label: "Prendre ta retraite", detail: "Raccrocher les chaussures" },
  },
  events: {
    "doble-turno": {
      eyebrow: "Salle de muscu", title: "Le préparateur te propose un double entraînement",
      body: "Tu peux gagner les kilos de muscle qui te manquent pour tenir le contact à six mètres, ou arriver cramé le week-end.",
      choices: { doble: { label: "Double entraînement", detail: "Plus de force, moins de fraîcheur" }, cuidarse: { label: "Préserver le corps", detail: "La saison est longue" } },
    },
    "competencia-puesto": {
      eyebrow: "Bureau du coach", title: "Le club a recruté à ton poste",
      body: "Un international débarque pour te prendre ta place. Tu peux te battre ou accepter l'offre qui vient d'arriver.",
      choices: { pelear: { label: "Te battre pour ta place", detail: "50 % titulaire · 50 % rotation" }, salir: { label: "Accepter l'offre", detail: "Nouveau maillot, temps de jeu garanti" } },
    },
    "rotura-ligamento": {
      eyebrow: "Bloc opératoire", title: "Ligament croisé antérieur",
      body: "La blessure que tout handballeur redoute. Huit mois dehors et une décision sur la façon de revenir.",
      choices: { "rehab-completa": { label: "Rééducation complète", detail: "−3 NOTE · beaucoup moins de risque ensuite" }, "volver-antes": { label: "Revenir trop tôt", detail: "Tu récupères ta place · le genou reste marqué" } },
    },
    "hombro-lanzador": {
      eyebrow: "Kiné", title: "Ton épaule de tir dit stop",
      body: "Tendinite chronique. Tu peux t'infiltrer et continuer, ou t'arrêter et perdre le rythme.",
      choices: { parar: { label: "T'arrêter et te soigner", detail: "Tu perds le rythme · tu protèges le bras" }, infiltrarse: { label: "T'infiltrer et jouer", detail: "Tu gardes ta place · tu paieras plus tard" } },
    },
    "siete-metros": {
      eyebrow: "Dernières secondes", title: "Sept mètres pour gagner la série",
      body: "La salle debout. Le coach te cherche du regard.",
      choices: { tirar: { label: "Prendre le ballon", detail: "Gloire ou sifflets" }, ceder: { label: "Le laisser au capitaine", detail: "Aucun risque, aucune histoire" } },
    },
    seleccion: {
      eyebrow: "Fenêtre internationale", title: "Sélectionné juste avant le derby",
      body: "Traverser l'Atlantique pour deux amicaux, avec le coach du club qui te demande de rester.",
      choices: { ir: { label: "Répondre à la sélection", detail: "Le maillot national d'abord" }, quedarse: { label: "Rester au club", detail: "Tu protèges la place qui te paie" } },
    },
    "defensa-6-0": {
      eyebrow: "Tableau tactique", title: "On te veut au centre de la 6-0",
      body: "Apprendre à défendre à l'intérieur te donne du temps de jeu que tu n'as pas, mais te sort de l'attaque.",
      choices: { aprender: { label: "Apprendre le rôle", detail: "Plus de portes ouvertes · moins de lumière" }, atacar: { label: "Rester attaquant", detail: "Ton jeu, ton risque" } },
    },
    cesion: {
      eyebrow: "Plan de progression", title: "Un prêt pour jouer vraiment",
      body: "Un an dans un club plus petit, à jouer les 60 minutes, puis tu reviens.",
      choices: { "aceptar-cesion": { label: "Accepter le prêt", detail: "Une saison de temps de jeu" }, "quedarse-pelear": { label: "Rester et te battre", detail: "Le banc, mais dans le grand club" } },
    },
    "roja-directa": {
      eyebrow: "Commission de discipline", title: "Rouge direct et dossier ouvert",
      body: "Un impact à la tête en contre-attaque. La fédération demande des explications.",
      choices: { disculparse: { label: "T'excuser publiquement", detail: "Sanction réduite · image adoucie" }, bancarsela: { label: "Assumer", detail: "Le vestiaire te respecte · trois matchs de suspension" } },
    },
    "crisis-club": {
      eyebrow: "Vestiaire", title: "Le club ne paie plus depuis trois mois",
      body: "Tu peux mener la fronde du groupe ou regarder ailleurs et jouer.",
      choices: { encabezar: { label: "Mener la fronde", detail: "On te respecte · on te fiche" }, jugar: { label: "Juste jouer", detail: "Tu gardes ton énergie · tu perds du poids" } },
    },
    capitania: {
      eyebrow: "Avant le coup d'envoi", title: "On te propose le brassard",
      body: "Être capitaine te donne une voix au club et la faute de chaque mauvaise soirée.",
      choices: { "aceptar-cinta": { label: "Prendre le brassard", detail: "Tu mènes · tu portes" }, "sin-cinta": { label: "Rester sans brassard", detail: "Tu protèges ton jeu" } },
    },
    "volver-a-casa": {
      eyebrow: "Un appel du pays", title: "Ton club formateur veut tes dernières années",
      body: "Rentrer dans le championnat où tu as commencé, ou presser un dernier gros contrat en Europe.",
      choices: { volver: { label: "Rentrer au pays", detail: "Boucler la boucle" }, "seguir-afuera": { label: "Rester à l'étranger", detail: "Le plus haut niveau jusqu'au bout" } },
    },
    mentor: {
      eyebrow: "Derniers chapitres", title: "Un gamin de 18 ans te demande conseil",
      body: "C'est lui qui prendra ta place. Tu peux tout lui apprendre ou le lui faire mériter.",
      choices: { ensenar: { label: "Tout lui apprendre", detail: "Un héritage au-delà des chiffres" }, "que-lo-gane": { label: "Qu'il le mérite", detail: "Un dernier pic égoïste" } },
    },
  },
  share: {
    line: "Tu peux faire mieux ?",
    matches: "{n} matchs",
    goalsLine: "{goals} buts · {assists} passes",
    savesLine: "{saves} arrêts",
    major: "{n} titres majeurs",
    peak: "Pic {n} NOTE",
    caps: "{n} sélections",
  },
};

const de = {
  meta: {
    title: "HANDBALLER · Simuliere deine Handballkarriere",
    description:
      "Erstelle einen Handballer, triff die harten Entscheidungen und sieh, wie weit " +
      "er kommt. Eine ganze Karriere in zwei Minuten. Kostenlos, ohne Anmeldung.",
  },
  ui: {
    tagline: "Eine ganze Handballkarriere in zwei Minuten",
    intro:
      "Wähle, wo du herkommst, triff jede Entscheidung und finde heraus, ob du als " +
      "Vereinslegende oder als Weltenbummler endest.",
    setupTitle: "Erstelle deinen Spieler",
    lastName: "Nachname",
    lastNamePlaceholder: "DEIN NAME",
    number: "Nummer",
    hand: "Wurfhand",
    handRight: "Rechts",
    handLeft: "Links",
    country: "Land",
    position: "Position",
    pace: "Tempo",
    start: "Karriere starten",
    season: "Saison",
    age: "Alter",
    years: "Jahre",
    rating: "STÄRKE",
    role: "Rolle",
    club: "Verein",
    matches: "Sp.",
    goals: "Tore",
    assists: "Assists",
    saves: "Paraden",
    savePct: "Paradenquote",
    shotPct: "Wurfquote",
    twoMinutes: "2 Min.",
    caps: "Länderspiele",
    continue: "Weiter",
    seasonSummary: "Was passiert ist",
    injured: "Verletzung",
    loan: "Ausgeliehen",
    yourCareer: "Deine Karriere",
    honours: "Titelsammlung",
    noHonours: "Keine Titel. Nicht jede Karriere misst sich in Pokalen.",
    score: "Punkte",
    peak: "Bestwert",
    clubs: "Vereine",
    share: "Teilen",
    shareImage: "Bild speichern",
    copied: "Kopiert!",
    playAgain: "Nochmal spielen",
    freeAgent: "Vereinslos",
    startsAt: "Hier fängst du an",
    contract: "Vertrag",
    seasonsShort: "Sais.",
  },
  positions: {
    GK: "Torwart", LW: "Linksaußen", LB: "Rückraum links",
    CB: "Rückraum Mitte", RB: "Rückraum rechts", RW: "Rechtsaußen", PV: "Kreisläufer",
  },
  roles: {
    juvenil: "Talent", rotacion: "Rotation", titular: "Stammspieler", franquicia: "Leistungsträger",
  },
  paces: {
    1: { name: "Intensiv", detail: "Eine Entscheidung pro Saison" },
    2: { name: "Normal", detail: "Eine Entscheidung alle 2 Saisons" },
    3: { name: "Express", detail: "Eine Entscheidung alle 3 Saisons" },
  },
  countries: {
    FRA: "Frankreich", GER: "Deutschland", ARG: "Argentinien", ESP: "Spanien",
    DEN: "Dänemark", HUN: "Ungarn", POL: "Polen", POR: "Portugal",
    SWE: "Schweden", NOR: "Norwegen", ROU: "Rumänien", SLO: "Slowenien",
    CRO: "Kroatien", MKD: "Nordmazedonien", SUI: "Schweiz", AUT: "Österreich",
    ISL: "Island", QAT: "Katar", EGY: "Ägypten", TUN: "Tunesien",
    BRA: "Brasilien", JPN: "Japan",
  },
  honours: {
    league: "{league}",
    cup: "Pokal · {country}",
    champions: "EHF Champions League",
    "european-league": "EHF European League",
    worlds: "IHF-Weltmeisterschaft",
    olympics: "Olympische Spiele",
    euro: "EHF Euro",
    continental: "Kontinentalmeisterschaft",
    "ihf-player": "IHF-Welthandballer",
    "top-scorer": "Torschützenkönig der Liga",
    "all-star": "All-Star-Team des Turniers",
  },
  verdicts: {
    inmortal: { title: "Handball-Unsterblicher", line: "Eine Ära trägt deinen Namen. Die Zahlen sind längst nicht mehr zu glauben." },
    icono: { title: "Weltstar", line: "Große Abende, Titel und eine Karriere, die über ein einziges Wappen hinausging." },
    leyenda: { title: "Vereinslegende", line: "Eine ganze Generation hat das Spiel gelernt, indem sie dir zusah." },
    idolo: { title: "Publikumsliebling", line: "Perfekt musstest du nie sein. Du hast dir Gesänge, Narben und bleibende Zuneigung verdient." },
    trotamundos: { title: "Weltenbummler", line: "Jedes Trikot war ein Kapitel. Der Weg selbst wurde zur Geschichte." },
  },
  market: {
    inferiores: { eyebrow: "Jugend", title: "Wo beginnt deine Karriere?", body: "Drei Vereine wollen dich in ihrer Jugend. Wähle, wo du herkommst." },
    mercado: { eyebrow: "Transfermarkt", title: "Wähle deinen nächsten Verein", body: "Nach deiner letzten Saison sind Angebote gekommen. Nimm eins an oder bleib." },
    contrato: { eyebrow: "Vertragsende", title: "Dein Vertrag läuft aus", body: "Verlängern beim Verein, der dich kennt, oder ablösefrei zu einem neuen Projekt." },
    ultimo: { eyebrow: "Letzter Vertrag", title: "Eine Entscheidung noch", body: "Zwei Vereine wollen deine Erfahrung. Unterschreibe ein letztes Kapitel oder hör jetzt auf." },
    actions: { firmar: "Unterschreiben", seguir: "Bleiben", renovar: "Verlängern", libre: "Ablösefrei wechseln", cedido: "Leihe annehmen", retirarse: "Karriere beenden" },
    retire: { label: "Karriere beenden", detail: "Die Schuhe an den Nagel hängen" },
  },
  events: {
    "doble-turno": {
      eyebrow: "Kraftraum", title: "Der Athletiktrainer bietet dir eine Doppelschicht an",
      body: "Du kannst das Kilo Muskelmasse holen, das dir am Kreis fehlt — oder ausgelaugt ins Wochenende gehen.",
      choices: { doble: { label: "Doppelschicht", detail: "Mehr Kraft, weniger Frische" }, cuidarse: { label: "Den Körper schonen", detail: "Die Saison ist lang" } },
    },
    "competencia-puesto": {
      eyebrow: "Trainerbüro", title: "Der Verein hat auf deiner Position verpflichtet",
      body: "Ein Nationalspieler kommt und will deinen Platz. Du kannst kämpfen oder das Angebot annehmen, das gerade da ist.",
      choices: { pelear: { label: "Um den Platz kämpfen", detail: "50 % Stammspieler · 50 % Rotation" }, salir: { label: "Das Angebot annehmen", detail: "Neues Trikot, sichere Einsatzzeit" } },
    },
    "rotura-ligamento": {
      eyebrow: "OP-Saal", title: "Vorderes Kreuzband",
      body: "Die Verletzung, die jeder Handballer fürchtet. Acht Monate raus und eine Entscheidung über die Rückkehr.",
      choices: { "rehab-completa": { label: "Vollständige Reha", detail: "−3 STÄRKE · danach deutlich weniger Risiko" }, "volver-antes": { label: "Zu früh zurückkommen", detail: "Du holst dir den Platz · das Knie bleibt gezeichnet" } },
    },
    "hombro-lanzador": {
      eyebrow: "Physiotherapie", title: "Deine Wurfschulter macht nicht mehr mit",
      body: "Chronische Sehnenentzündung. Spritze setzen und weiterspielen — oder pausieren und den Rhythmus verlieren.",
      choices: { parar: { label: "Pausieren und behandeln", detail: "Du verlierst Rhythmus · du schonst den Arm" }, infiltrarse: { label: "Spritze und spielen", detail: "Du behältst den Platz · du zahlst später" } },
    },
    "siete-metros": {
      eyebrow: "Letzte Sekunden", title: "Siebenmeter zum Sieg in der Serie",
      body: "Die Halle steht. Der Trainer sucht deinen Blick.",
      choices: { tirar: { label: "Den Ball nehmen", detail: "Ruhm oder Pfiffe" }, ceder: { label: "Dem Kapitän überlassen", detail: "Kein Risiko, keine Geschichte" } },
    },
    seleccion: {
      eyebrow: "Länderspielfenster", title: "Nominierung kurz vor dem Derby",
      body: "Über den Atlantik für zwei Testspiele — und dein Vereinstrainer bittet dich zu bleiben.",
      choices: { ir: { label: "Zur Nationalmannschaft", detail: "Das Land zuerst" }, quedarse: { label: "Beim Verein bleiben", detail: "Du schützt den Platz, der dich bezahlt" } },
    },
    "defensa-6-0": {
      eyebrow: "Taktiktafel", title: "Man will dich im Zentrum der 6-0",
      body: "Innen verteidigen lernen bringt dir Einsatzzeit, die du heute nicht hast — kostet dich aber den Angriff.",
      choices: { aprender: { label: "Die Rolle lernen", detail: "Mehr Wege · weniger Rampenlicht" }, atacar: { label: "Angreifer bleiben", detail: "Dein Spiel, dein Risiko" } },
    },
    cesion: {
      eyebrow: "Entwicklungsplan", title: "Eine Leihe, um wirklich zu spielen",
      body: "Ein Jahr bei einem kleineren Verein, 60 Minuten auf der Platte, dann kommst du zurück.",
      choices: { "aceptar-cesion": { label: "Die Leihe annehmen", detail: "Eine Saison mit Einsatzzeit" }, "quedarse-pelear": { label: "Bleiben und kämpfen", detail: "Bank, aber im großen Verein" } },
    },
    "roja-directa": {
      eyebrow: "Sportgericht", title: "Rote Karte und Verfahren",
      body: "Ein Treffer am Kopf im Tempogegenstoß. Der Verband will eine Erklärung.",
      choices: { disculparse: { label: "Dich öffentlich entschuldigen", detail: "Weniger Sperre · weicheres Image" }, bancarsela: { label: "Dazu stehen", detail: "Die Kabine respektiert dich · drei Spiele Sperre" } },
    },
    "crisis-club": {
      eyebrow: "Kabine", title: "Der Verein zahlt seit drei Monaten nicht",
      body: "Du kannst den Protest der Mannschaft anführen oder wegsehen und spielen.",
      choices: { encabezar: { label: "Den Protest anführen", detail: "Man respektiert dich · man merkt es sich" }, jugar: { label: "Einfach spielen", detail: "Du sparst Kraft · du verlierst Gewicht" } },
    },
    capitania: {
      eyebrow: "Vor dem Anwurf", title: "Man bietet dir die Kapitänsbinde an",
      body: "Kapitän sein gibt dir eine Stimme im Verein — und die Schuld für jeden schlechten Abend.",
      choices: { "aceptar-cinta": { label: "Die Binde nehmen", detail: "Du führst · du trägst" }, "sin-cinta": { label: "Ohne Binde weiter", detail: "Du schützt dein Spiel" } },
    },
    "volver-a-casa": {
      eyebrow: "Ein Anruf von zu Hause", title: "Dein Heimatverein will deine letzten Jahre",
      body: "Zurück in die Liga, in der du angefangen hast — oder den letzten großen Vertrag in Europa ausreizen.",
      choices: { volver: { label: "Nach Hause zurück", detail: "Den Kreis schließen" }, "seguir-afuera": { label: "Im Ausland bleiben", detail: "Höchstes Niveau bis zum Schluss" } },
    },
    mentor: {
      eyebrow: "Letzte Kapitel", title: "Ein 18-Jähriger fragt dich um Rat",
      body: "Er ist der, der deinen Platz einnehmen wird. Du kannst ihm alles beibringen oder es ihn verdienen lassen.",
      choices: { ensenar: { label: "Ihm alles beibringen", detail: "Ein Vermächtnis jenseits der Zahlen" }, "que-lo-gane": { label: "Soll er es sich verdienen", detail: "Ein letzter egoistischer Höhepunkt" } },
    },
  },
  share: {
    line: "Schaffst du eine bessere Karriere?",
    matches: "{n} Spiele",
    goalsLine: "{goals} Tore · {assists} Assists",
    savesLine: "{saves} Paraden",
    major: "{n} große Titel",
    peak: "Bestwert {n}",
    caps: "{n} Länderspiele",
  },
};

const BUNDLES = { es, fr, de };

function lookup(bundle, path) {
  return path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), bundle);
}

function fill(template, params) {
  if (typeof template !== "string" || !params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] === undefined ? match : String(params[key])
  );
}

/** `t("ui.share")`, `t("honours.cup", { country: "Francia" })` */
export function createTranslator(locale) {
  const bundle = BUNDLES[locale] || BUNDLES.es;
  const t = (path, params) => {
    const value = lookup(bundle, path) ?? lookup(BUNDLES.es, path);
    return typeof value === "string" ? fill(value, params) : value;
  };
  t.locale = locale in BUNDLES ? locale : "es";
  return t;
}

/** Traduce un honor guardado por el motor ({ key, params, name }). */
export function honourName(t, honour) {
  if (!honour) return "";
  // El motor guarda el país como código ISO ("GER"); acá se vuelve legible.
  const params = { ...honour.params };
  if (params.country && /^[A-Z]{3}$/.test(params.country)) {
    params.country = t(`countries.${params.country}`) || params.country;
  }
  const translated = t(`honours.${honour.key}`, params);
  return typeof translated === "string" ? translated : honour.name || honour.key;
}
