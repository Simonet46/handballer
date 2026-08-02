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
      body: "La tribuna de pie. El entrenador te busca con la mirada.",
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
      eyebrow: "Comité de disciplina", title: "Descalificación y expediente",
      body: "Un impacto en la cabeza en el contraataque. Roja directa, y como fue en la cara, la mesa saca la azul: va con informe a la federación.",
      choices: { disculparse: { label: "Pedir disculpas públicas", detail: "Bajás la sanción · perdés carácter" }, bancarsela: { label: "Bancártela", detail: "El vestuario te respeta · tres fechas afuera" } },
    },
    "crisis-club": {
      eyebrow: "Vestuario", title: "El club no paga hace tres meses",
      body: "Podés encabezar el reclamo del plantel o mirar para otro lado y jugar.",
      choices: { encabezar: { label: "Encabezar el reclamo", detail: "Te respetan · te marcan" }, jugar: { label: "Sólo jugar", detail: "Guardás energía · perdés peso" } },
    },
    capitania: {
      eyebrow: "Antes del sorteo", title: "Te ofrecen la capitanía",
      body: "Ser capitán te da voz en el club y la culpa de cada noche mala.",
      choices: { "aceptar-cinta": { label: "Aceptar la capitanía", detail: "Liderás · cargás" }, "sin-cinta": { label: "Dejarla pasar", detail: "Cuidás tu juego" } },
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
    "medico-milagroso": {
      eyebrow: "Consultorio", title: "El médico tiene algo que te levanta",
      body: "Volvés de la lesión y no llegás. Te dice que hay algo que no da positivo, que lo toma medio vestuario y que nadie pregunta nunca.",
      choices: { tomarlo: { label: "Tomarlo", detail: "Volvés antes · si algún día salta, se terminó" }, "no-tomarlo": { label: "No", detail: "Perdés el puesto · dormís tranquilo" } },
    },
    "apuesta-amigo": {
      eyebrow: "Un mensaje a las 2 am", title: "Un conocido te pide el dato",
      body: "Sólo quiere saber si el arquero llega. Dice que es entre nosotros. Dice que después te tira algo.",
      choices: { "pasar-dato": { label: "Pasarle el dato", detail: "Plata fácil · queda registrado en algún lado" }, cortar: { label: "Cortar el vínculo", detail: "Se pudre una amistad · te sacás el problema" } },
    },
    "partido-arreglado": {
      eyebrow: "Estacionamiento del club", title: "Te ofrecen plata por perder",
      body: "Dos apellidos que ya escuchaste. Un número que es tres años de sueldo. Un partido que ya venían a perder igual.",
      choices: { "aceptar-plata": { label: "Agarrar la plata", detail: "Se te acomoda la vida · te la jugás entera" }, denunciar: { label: "Ir a la federación", detail: "Hacés lo correcto · te quedás solo" } },
    },
    "boliche-clasico": {
      eyebrow: "Jueves, 4 de la mañana", title: "Alguien te filmó en el boliche",
      body: "El clásico es el sábado. El video ya está dando vueltas por los grupos.",
      choices: { salir: { label: "Bancar que sos así", detail: "El vestuario se ríe · el DT no" }, "quedarse-casa": { label: "Pedir disculpas y encerrarte", detail: "Aburrido · llegás entero al sábado" } },
    },
    "falta-tactica": {
      eyebrow: "Quedan 20 segundos", title: "El entrenador te pide LA falta",
      body: "Van uno abajo y el extremo rival se escapa solo al contragolpe. El banco grita. Sabés que la única manera de frenarlo es cruzarlo en el aire, y sabés lo que cuesta: descalificación directa.",
      choices: { "falta-limpia": { label: "Cruzarlo limpio", detail: "Descalificación igual · le das la mano al levantarse" }, "falta-sucia": { label: "Bajarlo como sea", detail: "Azul directa · lo sacás del partido y capaz del mes" } },
    },
    "simular-exclusion": {
      eyebrow: "Seis metros", title: "Te rozan y te podés tirar",
      body: "No fue nada. Pero el árbitro está mirando y son dos minutos que cambian el partido.",
      choices: { tirarse: { label: "Tirarte", detail: "Ganás la exclusión · el rival no se olvida" }, "seguir-jugando": { label: "Aguantar y tirar", detail: "Te la bancás · quizá no entra" } },
    },
    "sueldo-negro": {
      eyebrow: "Oficina del tesorero", title: "Te ofrecen la mitad en negro",
      body: "Dicen que es así en todos lados, que cobrás más limpio, que el contrato dice otra cosa por si acaso.",
      choices: { "firmar-igual": { label: "Firmar igual", detail: "Cobrás más ahora · no existís para nadie" }, "exigir-blanco": { label: "Exigir todo en blanco", detail: "Te ponés pesado · quedás cubierto" } },
    },
    "agente-treinta": {
      eyebrow: "Café en Puerto Madero", title: "Un representante te promete Europa",
      body: "Tiene los contactos, tiene las fotos con jugadores que conocés. Quiere el 30 % de todo lo que ganes, para siempre.",
      choices: { "firmar-agente": { label: "Firmar con él", detail: "Se te abren puertas · se te va un tercio" }, "manejarte-solo": { label: "Manejarte solo", detail: "Todo tuyo · nadie atiende tus llamados" } },
    },
    "tuit-viejo": {
      eyebrow: "Te explota el teléfono", title: "Se viralizó algo que escribiste a los 17",
      body: "Once años atrás, una boludez que ya ni te acordabas. Hoy está en todos lados y el club te pide una respuesta.",
      choices: { "pedir-perdon": { label: "Pedir disculpas públicas", detail: "Se apaga rápido · queda la foto" }, "no-explicar": { label: "No explicar nada", detail: "Te bancás el ruido · el club se incomoda" } },
    },
    "oferta-petrodolar": {
      eyebrow: "Una llamada del Golfo", title: "El triple de plata por la mitad de nivel",
      body: "Un contrato que te cambia la vida y la de tu familia, en una liga donde nadie va a ver un partido tuyo.",
      choices: { "ir-por-plata": { label: "Ir por la plata", detail: "Te asegurás el futuro · te bajás del mapa" }, "quedarse-nivel": { label: "Quedarte en el nivel", detail: "Menos plata · seguís existiendo" } },
    },
    "cambiar-seleccion": {
      eyebrow: "Una propuesta incómoda", title: "Otro país te ofrece el pasaporte",
      body: "Tenés los papeles y ellos tienen plaza en el Mundial. Tu selección hace dos años que no te llama.",
      choices: { nacionalizarte: { label: "Cambiar de selección", detail: "Jugás el Mundial · no volvés a casa igual" }, "esperar-tu-pais": { label: "Esperar a los tuyos", detail: "La camiseta de siempre · puede que nunca llegue" } },
    },
    "portero-jugador": {
      eyebrow: "Pizarrón, último minuto", title: "Te quieren de séptimo jugador",
      body: "Sacan al arquero y entrás vos. Si sale, sos el héroe. Si te roban la pelota, es gol en arco vacío y te lo van a recordar.",
      choices: { "salir-al-ataque": { label: "Salir al ataque", detail: "Protagonismo puro · el error se ve desde la tribuna" }, "no-arriesgar": { label: "Que salga otro", detail: "Nadie te culpa · nadie te nombra" } },
    },
    "vas-a-ser-padre": {
      eyebrow: "Una noticia en marzo", title: "Vas a ser padre en plena temporada",
      body: "El parto cae en la semana de los playoffs y estás a 2.000 km de tu casa.",
      choices: { "priorizar-familia": { label: "Estar ahí", detail: "Te perdés la serie · ganás lo otro" }, "no-aflojar": { label: "No aflojar ahora", detail: "Jugás la serie · vas a pensarlo toda la vida" } },
    },
    "pelea-vestuario": {
      eyebrow: "Después del partido", title: "Te vas a las manos con el referente",
      body: "Te viene cargando hace tres meses. Hoy, con la derrota fresca, se te cortó.",
      choices: { "bancar-la-piña": { label: "Ir de frente", detail: "Media cancha te respeta · la otra media te odia" }, tragarsela: { label: "Tragártela", detail: "Se acaba ahí · te queda adentro" } },
    },
    "bajar-peso": {
      eyebrow: "Balanza del club", title: "El preparador dice que estás pasado",
      body: "Cuatro kilos. Dice que en el uno contra uno se nota y que la rodilla lo va a pagar.",
      choices: { "hacer-dieta": { label: "Ponerte a dieta", detail: "Te movés mejor · perdés el choque" }, ignorarlo: { label: "Ignorarlo", detail: "Seguís siendo el que empuja · el cuerpo cobra" } },
    },
    emigrar: {
      eyebrow: "La decisión", title: "En Argentina no vas a poder vivir de esto",
      body: "Acá se juega gratis: entrenás a la noche, después del laburo, y el club te paga los viáticos si hay. Todos los que llegaron se fueron antes de los 23. Estas son las dos puertas que hay.",
      choices: {
        filial: { label: "Filial de un club grande", detail: "Entrenás con los mejores · jugás con los suplentes" },
        "liga-chica": { label: "Liga chica de Europa", detail: "Jugás los 60 minutos · no te ve nadie" },
        "quedarse-en-casa": { label: "Quedarte", detail: "Tu club, tu gente, tu techo" },
      },
    },
    "lateral-a-extremo": {
      eyebrow: "Pizarrón", title: "El entrenador te quiere de extremo",
      body: "Dice que tenés el salto y que en el ala vas a jugar los 60 minutos. También que desde ahí nunca más vas a armar un ataque.",
      choices: { "correrse-al-ala": { label: "Correrte al ala", detail: "Minutos asegurados · otro juego" }, "seguir-de-lateral": { label: "Seguir de lateral", detail: "Tu puesto de siempre · peleás por el lugar" } },
    },
    "extremo-a-lateral": {
      eyebrow: "Pizarrón", title: "Te quieren meter adentro, de lateral",
      body: "Se lesionó el lateral y sos el que mejor tira de los que quedan. Adentro se cobra más, pero también se pega más.",
      choices: { "meterse-adentro": { label: "Meterte adentro", detail: "Más pelota · más golpes" }, "seguir-de-extremo": { label: "Seguir en el ala", detail: "Lo que sabés hacer · el techo que ya conocés" } },
    },
    "siete-metros-parada": {
      eyebrow: "Últimos segundos", title: "Siete metros para salvar la serie",
      body: "Uno arriba, cero en el reloj. El tirador te miró el palo largo dos veces y vos ya sabés que eso es mentira.",
      choices: { jugartela: { label: "Salir a jugártela", detail: "Si la adivinás sos leyenda · si no, sos el que se tiró antes" }, "quedarte-parado": { label: "Quedarte parado", detail: "Sin invento · que decida él" } },
    },
    "septimo-jugador-gk": {
      eyebrow: "Banco de suplentes", title: "Te sacan en todos los ataques",
      body: "El entrenador juega siete contra seis todo el partido. Vos entrás y salís cada 30 segundos y nunca terminás de entrar en calor.",
      choices: { "aceptar-salir": { label: "Aceptarlo", detail: "Es lo que pide el equipo · te enfriás y se te nota" }, plantarse: { label: "Plantarte", detail: "Le decís que así no atajás · se pudre el vestuario" } },
    },
    "arquero-al-arco-vacio": {
      eyebrow: "Contraataque", title: "Arco vacío del otro lado",
      body: "Agarrás el rebote y del otro lado no hay nadie. Son 40 metros y una foto que puede quedar para siempre. O el ridículo del año.",
      choices: { "tirar-al-arco-vacio": { label: "Tirar", detail: "Gol de arquero · o el papelón" }, "no-tirar": { label: "Jugarla al pivote", detail: "Lo correcto · nadie se acuerda" } },
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
  beats: {
    up: "Subiste de categoría: {club} · {league}",
    down: "Bajaste de categoría: {club} · {league}",
    move: "Fichaste por {club} · {league}",
    injured: "Te lesionaste en {year}",
    better: "+{n} de valoración",
    worse: "−{n} de valoración",
    role: "Pasaste a ser {role}",
    debut: "Debutaste en la selección",
    tap: "tocá para seguir",
  },
  swap: {
    encajo: "Se adaptó al puesto nuevo",
    "no-encajo": "No terminó de encajar en el puesto nuevo",
  },
  climb: {
    label: "El salto",
    line: "De {from} a {to}",
    none: "Empezaste arriba y te quedaste arriba.",
  },
  scandals: {
    doping: "Sancionado por dopaje",
    apuestas: "Investigado por filtrar información",
    amanio: "Suspendido por amaño de partidos",
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
      eyebrow: "Commission de discipline", title: "Disqualification et dossier ouvert",
      body: "Un impact à la tête sur le contre-attaque. Disqualification directe, et comme c'était au visage, la table sort le carton bleu : rapport à la fédération.",
      choices: { disculparse: { label: "T'excuser publiquement", detail: "Sanction réduite · image adoucie" }, bancarsela: { label: "Assumer", detail: "Le vestiaire te respecte · trois matchs de suspension" } },
    },
    "crisis-club": {
      eyebrow: "Vestiaire", title: "Le club ne paie plus depuis trois mois",
      body: "Tu peux mener la fronde du groupe ou regarder ailleurs et jouer.",
      choices: { encabezar: { label: "Mener la fronde", detail: "On te respecte · on te fiche" }, jugar: { label: "Juste jouer", detail: "Tu gardes ton énergie · tu perds du poids" } },
    },
    capitania: {
      eyebrow: "Avant l'engagement", title: "On te propose la capitainerie",
      body: "Être capitaine te donne une voix au club et la faute de chaque mauvaise soirée.",
      choices: { "aceptar-cinta": { label: "Accepter la capitainerie", detail: "Tu mènes · tu portes" }, "sin-cinta": { label: "La laisser passer", detail: "Tu protèges ton jeu" } },
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
    "medico-milagroso": {
      eyebrow: "Cabinet médical", title: "Le médecin a quelque chose qui te relance",
      body: "Tu reviens de blessure et tu n'y es pas. Il te dit que ça ne sort pas aux contrôles, que la moitié du vestiaire en prend et que personne ne pose de questions.",
      choices: { tomarlo: { label: "En prendre", detail: "Tu reviens plus tôt · si ça sort un jour, c'est fini" }, "no-tomarlo": { label: "Refuser", detail: "Tu perds ta place · tu dors tranquille" } },
    },
    "apuesta-amigo": {
      eyebrow: "Un message à 2 h du matin", title: "Une connaissance te demande l'info",
      body: "Il veut juste savoir si le gardien est apte. Il dit que ça reste entre vous. Il dit qu'il te renverra l'ascenseur.",
      choices: { "pasar-dato": { label: "Donner l'info", detail: "Argent facile · ça reste écrit quelque part" }, cortar: { label: "Couper les ponts", detail: "Une amitié en moins · un problème en moins" } },
    },
    "partido-arreglado": {
      eyebrow: "Parking du club", title: "On te propose de l'argent pour perdre",
      body: "Deux noms que tu as déjà entendus. Un chiffre qui vaut trois ans de salaire. Un match que vous alliez perdre de toute façon.",
      choices: { "aceptar-plata": { label: "Prendre l'argent", detail: "Ta vie change · tu joues tout sur un coup" }, denunciar: { label: "Aller voir la fédération", detail: "Tu fais ce qu'il faut · tu te retrouves seul" } },
    },
    "boliche-clasico": {
      eyebrow: "Jeudi, 4 h du matin", title: "Quelqu'un t'a filmé en boîte",
      body: "Le derby est samedi. La vidéo tourne déjà dans tous les groupes.",
      choices: { salir: { label: "Assumer", detail: "Le vestiaire rit · le coach non" }, "quedarse-casa": { label: "T'excuser et t'enfermer", detail: "Ennuyeux · tu arrives entier samedi" } },
    },
    "falta-tactica": {
      eyebrow: "Il reste 20 secondes", title: "L'entraîneur te demande LA faute",
      body: "Vous êtes menés d'un but et l'ailier adverse part seul en contre-attaque. Le banc hurle. Tu sais que la seule façon de l'arrêter est de le prendre en l'air, et tu sais ce que ça coûte : disqualification directe.",
      choices: { "falta-limpia": { label: "Le prendre proprement", detail: "Disqualification quand même · tu lui tends la main" }, "falta-sucia": { label: "Le faucher net", detail: "Carton bleu · tu le sors du match, peut-être du mois" } },
    },
    "simular-exclusion": {
      eyebrow: "Six mètres", title: "Il t'effleure et tu peux tomber",
      body: "Ce n'était rien. Mais l'arbitre regarde, et deux minutes changent le match.",
      choices: { tirarse: { label: "Te laisser tomber", detail: "Tu gagnes l'exclusion · l'adversaire n'oublie pas" }, "seguir-jugando": { label: "Tenir et tirer", detail: "Tu encaisses · ça ne rentre peut-être pas" } },
    },
    "sueldo-negro": {
      eyebrow: "Bureau du trésorier", title: "On te propose la moitié au noir",
      body: "Ils disent que c'est partout pareil, que tu touches plus net, que le contrat dit autre chose au cas où.",
      choices: { "firmar-igual": { label: "Signer quand même", detail: "Tu gagnes plus maintenant · tu n'existes pour personne" }, "exigir-blanco": { label: "Exiger tout au clair", detail: "Tu passes pour un lourd · tu es couvert" } },
    },
    "agente-treinta": {
      eyebrow: "Café en ville", title: "Un agent te promet l'Europe",
      body: "Il a les contacts et les photos avec des joueurs que tu connais. Il veut 30 % de tout ce que tu gagneras, à vie.",
      choices: { "firmar-agente": { label: "Signer avec lui", detail: "Des portes s'ouvrent · un tiers s'en va" }, "manejarte-solo": { label: "Te gérer seul", detail: "Tout est à toi · personne ne répond à tes appels" } },
    },
    "tuit-viejo": {
      eyebrow: "Ton téléphone explose", title: "Un vieux message de tes 17 ans refait surface",
      body: "Onze ans plus tard, une bêtise dont tu ne te souvenais même plus. Aujourd'hui elle est partout et le club attend une réponse.",
      choices: { "pedir-perdon": { label: "T'excuser publiquement", detail: "Ça s'éteint vite · la capture reste" }, "no-explicar": { label: "Ne rien expliquer", detail: "Tu encaisses le bruit · le club est mal à l'aise" } },
    },
    "oferta-petrodolar": {
      eyebrow: "Un appel du Golfe", title: "Le triple du salaire pour la moitié du niveau",
      body: "Un contrat qui change ta vie et celle de ta famille, dans un championnat où personne ne verra jamais un de tes matchs.",
      choices: { "ir-por-plata": { label: "Y aller pour l'argent", detail: "Ton avenir est assuré · tu sors de la carte" }, "quedarse-nivel": { label: "Rester au niveau", detail: "Moins d'argent · tu existes encore" } },
    },
    "cambiar-seleccion": {
      eyebrow: "Une proposition gênante", title: "Un autre pays t'offre le passeport",
      body: "Tu as les papiers et eux ont une place au Mondial. Ta sélection ne t'a pas appelé depuis deux ans.",
      choices: { nacionalizarte: { label: "Changer de sélection", detail: "Tu joues le Mondial · tu ne rentres plus pareil" }, "esperar-tu-pais": { label: "Attendre les tiens", detail: "Le maillot de toujours · qui n'arrivera peut-être jamais" } },
    },
    "portero-jugador": {
      eyebrow: "Dernière minute", title: "On te veut en septième joueur de champ",
      body: "Le gardien sort et tu entres. Si ça passe, tu es le héros. Si on te pique la balle, c'est but dans le but vide et on te le rappellera.",
      choices: { "salir-al-ataque": { label: "Monter à l'attaque", detail: "Pleine lumière · l'erreur se voit des tribunes" }, "no-arriesgar": { label: "Laisser un autre y aller", detail: "Personne ne t'accuse · personne ne te cite" } },
    },
    "vas-a-ser-padre": {
      eyebrow: "Une nouvelle en mars", title: "Tu vas être père en pleine saison",
      body: "L'accouchement tombe la semaine des playoffs et tu es à 2 000 km de chez toi.",
      choices: { "priorizar-familia": { label: "Être là", detail: "Tu rates la série · tu gagnes le reste" }, "no-aflojar": { label: "Ne rien lâcher", detail: "Tu joues la série · tu y penseras toute ta vie" } },
    },
    "pelea-vestuario": {
      eyebrow: "Après le match", title: "Tu en viens aux mains avec le cadre du groupe",
      body: "Il te chambre depuis trois mois. Aujourd'hui, la défaite encore chaude, ça a lâché.",
      choices: { "bancar-la-piña": { label: "Y aller franchement", detail: "La moitié du vestiaire te respecte · l'autre te déteste" }, tragarsela: { label: "Encaisser", detail: "Ça s'arrête là · ça reste en toi" } },
    },
    "bajar-peso": {
      eyebrow: "Balance du club", title: "Le préparateur te trouve trop lourd",
      body: "Quatre kilos. Il dit que ça se voit dans le un contre un et que le genou finira par payer.",
      choices: { "hacer-dieta": { label: "Te mettre au régime", detail: "Tu bouges mieux · tu perds l'impact" }, ignorarlo: { label: "L'ignorer", detail: "Tu restes celui qui pousse · le corps encaisse" } },
    },
    emigrar: {
      eyebrow: "La décision", title: "En Argentine tu ne pourras pas en vivre",
      body: "Ici on joue gratuitement : entraînement le soir, après le travail, et le club rembourse les trajets quand il peut. Tous ceux qui sont arrivés sont partis avant 23 ans. Voilà les deux portes qui existent.",
      choices: {
        filial: { label: "Équipe réserve d'un grand club", detail: "Tu t'entraînes avec les meilleurs · tu joues avec les remplaçants" },
        "liga-chica": { label: "Petit championnat européen", detail: "Tu joues les 60 minutes · personne ne te voit" },
        "quedarse-en-casa": { label: "Rester", detail: "Ton club, tes gens, ton plafond" },
      },
    },
    "lateral-a-extremo": {
      eyebrow: "Tableau tactique", title: "Le coach te veut ailier",
      body: "Il dit que tu as la détente et que sur l'aile tu joueras les 60 minutes. Il dit aussi que de là, tu ne construiras plus jamais une attaque.",
      choices: { "correrse-al-ala": { label: "Passer sur l'aile", detail: "Temps de jeu garanti · un autre jeu" }, "seguir-de-lateral": { label: "Rester arrière", detail: "Ton poste de toujours · tu te bats pour la place" } },
    },
    "extremo-a-lateral": {
      eyebrow: "Tableau tactique", title: "On veut te faire rentrer à l'arrière",
      body: "L'arrière s'est blessé et tu es celui qui tire le mieux parmi ceux qui restent. À l'intérieur on touche plus de ballons, mais on prend aussi plus de coups.",
      choices: { "meterse-adentro": { label: "Rentrer à l'intérieur", detail: "Plus de ballons · plus de contacts" }, "seguir-de-extremo": { label: "Rester sur l'aile", detail: "Ce que tu sais faire · le plafond que tu connais" } },
    },
    "siete-metros-parada": {
      eyebrow: "Dernières secondes", title: "Sept mètres pour sauver la série",
      body: "Un but d'avance, zéro au chrono. Le tireur a regardé ton grand côté deux fois et tu sais déjà que c'est du bluff.",
      choices: { jugartela: { label: "Tenter le coup", detail: "Si tu devines tu es une légende · sinon tu es celui qui a plongé trop tôt" }, "quedarte-parado": { label: "Rester debout", detail: "Sans invention · à lui de décider" } },
    },
    "septimo-jugador-gk": {
      eyebrow: "Banc de touche", title: "On te sort à chaque attaque",
      body: "L'entraîneur joue à sept contre six tout le match. Tu entres et tu sors toutes les 30 secondes et tu n'es jamais vraiment chaud.",
      choices: { "aceptar-salir": { label: "L'accepter", detail: "C'est ce que l'équipe demande · tu refroidis et ça se voit" }, plantarse: { label: "Refuser", detail: "Tu lui dis que comme ça tu n'arrêtes rien · le vestiaire s'enflamme" } },
    },
    "arquero-al-arco-vacio": {
      eyebrow: "Contre-attaque", title: "But vide en face",
      body: "Tu captes le rebond et de l'autre côté il n'y a personne. 40 mètres et une image qui peut rester pour toujours. Ou le ridicule de l'année.",
      choices: { "tirar-al-arco-vacio": { label: "Tirer", detail: "But de gardien · ou la honte" }, "no-tirar": { label: "La jouer au pivot", detail: "Le bon choix · personne ne s'en souvient" } },
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
  beats: {
    up: "Tu montes d'un cran : {club} · {league}",
    down: "Tu descends d'un cran : {club} · {league}",
    move: "Tu signes à {club} · {league}",
    injured: "Blessure en {year}",
    better: "+{n} de note",
    worse: "−{n} de note",
    role: "Tu deviens {role}",
    debut: "Première sélection",
    tap: "touche pour continuer",
  },
  swap: {
    encajo: "Il s'est adapté au nouveau poste",
    "no-encajo": "Il ne s'est jamais adapté au nouveau poste",
  },
  climb: {
    label: "La montée",
    line: "De {from} à {to}",
    none: "Tu as commencé en haut et tu y es resté.",
  },
  scandals: {
    doping: "Suspendu pour dopage",
    apuestas: "Mis en cause pour fuite d'informations",
    amanio: "Suspendu pour matchs truqués",
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
      eyebrow: "Sportgericht", title: "Disqualifikation und Verfahren",
      body: "Ein Treffer am Kopf im Tempogegenstoß. Direkte Disqualifikation, und weil es ins Gesicht ging, zeigt der Kampfrichter Blau: Bericht an den Verband.",
      choices: { disculparse: { label: "Dich öffentlich entschuldigen", detail: "Weniger Sperre · weicheres Image" }, bancarsela: { label: "Dazu stehen", detail: "Die Kabine respektiert dich · drei Spiele Sperre" } },
    },
    "crisis-club": {
      eyebrow: "Kabine", title: "Der Verein zahlt seit drei Monaten nicht",
      body: "Du kannst den Protest der Mannschaft anführen oder wegsehen und spielen.",
      choices: { encabezar: { label: "Den Protest anführen", detail: "Man respektiert dich · man merkt es sich" }, jugar: { label: "Einfach spielen", detail: "Du sparst Kraft · du verlierst Gewicht" } },
    },
    capitania: {
      eyebrow: "Vor dem Anwurf", title: "Man bietet dir die Kapitänsrolle an",
      body: "Die Kapitänsrolle gibt dir eine Stimme im Verein — und die Schuld für jeden schlechten Abend.",
      choices: { "aceptar-cinta": { label: "Die Kapitänsrolle annehmen", detail: "Du führst · du trägst" }, "sin-cinta": { label: "Ablehnen", detail: "Du schützt dein Spiel" } },
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
    "medico-milagroso": {
      eyebrow: "Sprechzimmer", title: "Der Arzt hat etwas, das dich hochbringt",
      body: "Du kommst aus der Verletzung und bist nicht da. Er sagt, das schlägt bei keiner Kontrolle an, die halbe Kabine nimmt es, und niemand fragt je nach.",
      choices: { tomarlo: { label: "Nehmen", detail: "Du kommst früher zurück · fliegt es auf, ist Schluss" }, "no-tomarlo": { label: "Ablehnen", detail: "Du verlierst den Platz · du schläfst ruhig" } },
    },
    "apuesta-amigo": {
      eyebrow: "Eine Nachricht um 2 Uhr", title: "Ein Bekannter will die Info",
      body: "Er will nur wissen, ob der Torwart fit ist. Bleibt unter uns, sagt er. Er revanchiert sich, sagt er.",
      choices: { "pasar-dato": { label: "Die Info geben", detail: "Leichtes Geld · irgendwo steht es geschrieben" }, cortar: { label: "Kontakt abbrechen", detail: "Eine Freundschaft weniger · ein Problem weniger" } },
    },
    "partido-arreglado": {
      eyebrow: "Parkplatz am Verein", title: "Man bietet dir Geld fürs Verlieren",
      body: "Zwei Namen, die du schon gehört hast. Eine Summe von drei Jahresgehältern. Ein Spiel, das ihr ohnehin verloren hättet.",
      choices: { "aceptar-plata": { label: "Das Geld nehmen", detail: "Dein Leben ändert sich · du setzt alles aufs Spiel" }, denunciar: { label: "Zum Verband gehen", detail: "Du tust das Richtige · du stehst allein da" } },
    },
    "boliche-clasico": {
      eyebrow: "Donnerstag, 4 Uhr morgens", title: "Jemand hat dich im Club gefilmt",
      body: "Das Derby ist am Samstag. Das Video geht schon durch alle Gruppen.",
      choices: { salir: { label: "Dazu stehen", detail: "Die Kabine lacht · der Trainer nicht" }, "quedarse-casa": { label: "Entschuldigen und daheim bleiben", detail: "Langweilig · du kommst fit in den Samstag" } },
    },
    "falta-tactica": {
      eyebrow: "Noch 20 Sekunden", title: "Der Trainer will DAS Foul",
      body: "Ihr liegt einen zurück und der gegnerische Außen zieht allein den Tempogegenstoß. Die Bank schreit. Du weißt, dass ihn nur ein Foul im Sprung stoppt — und du weißt, was das kostet: Disqualifikation.",
      choices: { "falta-limpia": { label: "Ihn sauber stoppen", detail: "Trotzdem Disqualifikation · du hilfst ihm hoch" }, "falta-sucia": { label: "Ihn abräumen", detail: "Blaue Karte · raus aus dem Spiel, vielleicht aus dem Monat" } },
    },
    "simular-exclusion": {
      eyebrow: "Sechs Meter", title: "Er streift dich und du könntest fallen",
      body: "Es war nichts. Aber der Schiedsrichter schaut hin, und zwei Minuten drehen das Spiel.",
      choices: { tirarse: { label: "Fallen lassen", detail: "Du holst die Zeitstrafe · der Gegner vergisst nicht" }, "seguir-jugando": { label: "Durchziehen und werfen", detail: "Du hältst stand · vielleicht sitzt er nicht" } },
    },
    "sueldo-negro": {
      eyebrow: "Büro des Schatzmeisters", title: "Die Hälfte soll schwarz laufen",
      body: "Machen alle so, sagen sie, du bekommst netto mehr, und im Vertrag steht sicherheitshalber etwas anderes.",
      choices: { "firmar-igual": { label: "Trotzdem unterschreiben", detail: "Jetzt mehr Geld · offiziell existierst du nicht" }, "exigir-blanco": { label: "Alles offiziell verlangen", detail: "Du giltst als schwierig · du bist abgesichert" } },
    },
    "agente-treinta": {
      eyebrow: "Café in der Stadt", title: "Ein Berater verspricht dir Europa",
      body: "Er hat die Kontakte und die Fotos mit Spielern, die du kennst. Er will 30 % von allem, was du je verdienst. Für immer.",
      choices: { "firmar-agente": { label: "Bei ihm unterschreiben", detail: "Türen gehen auf · ein Drittel geht weg" }, "manejarte-solo": { label: "Dich selbst managen", detail: "Alles gehört dir · niemand geht ans Telefon" } },
    },
    "tuit-viejo": {
      eyebrow: "Dein Handy explodiert", title: "Ein alter Post von dir mit 17 taucht auf",
      body: "Elf Jahre her, ein Blödsinn, an den du dich nicht mal erinnerst. Heute steht er überall und der Verein erwartet eine Antwort.",
      choices: { "pedir-perdon": { label: "Dich öffentlich entschuldigen", detail: "Geht schnell vorbei · der Screenshot bleibt" }, "no-explicar": { label: "Nichts erklären", detail: "Du hältst den Lärm aus · dem Verein ist es unangenehm" } },
    },
    "oferta-petrodolar": {
      eyebrow: "Ein Anruf vom Golf", title: "Das Dreifache für das halbe Niveau",
      body: "Ein Vertrag, der dein Leben und das deiner Familie verändert — in einer Liga, in der niemand je ein Spiel von dir sehen wird.",
      choices: { "ir-por-plata": { label: "Dem Geld folgen", detail: "Die Zukunft ist sicher · du verschwindest von der Landkarte" }, "quedarse-nivel": { label: "Auf dem Niveau bleiben", detail: "Weniger Geld · du existierst weiter" } },
    },
    "cambiar-seleccion": {
      eyebrow: "Ein unbequemes Angebot", title: "Ein anderes Land bietet dir den Pass",
      body: "Du hast die Papiere, sie haben einen Platz bei der WM. Deine eigene Auswahl hat seit zwei Jahren nicht angerufen.",
      choices: { nacionalizarte: { label: "Die Nation wechseln", detail: "Du spielst die WM · du kommst nicht mehr derselbe heim" }, "esperar-tu-pais": { label: "Auf deine warten", detail: "Das Trikot von immer · das vielleicht nie kommt" } },
    },
    "portero-jugador": {
      eyebrow: "Letzte Minute", title: "Du sollst der siebte Feldspieler sein",
      body: "Der Torwart geht raus, du kommst rein. Klappt es, bist du der Held. Verlierst du den Ball, ist es das leere Tor — und man erinnert dich daran.",
      choices: { "salir-al-ataque": { label: "Mit nach vorn", detail: "Volles Rampenlicht · der Fehler ist von der Tribüne sichtbar" }, "no-arriesgar": { label: "Einen anderen schicken", detail: "Niemand gibt dir die Schuld · niemand nennt dich" } },
    },
    "vas-a-ser-padre": {
      eyebrow: "Eine Nachricht im März", title: "Du wirst mitten in der Saison Vater",
      body: "Der Termin fällt in die Playoff-Woche und du bist 2.000 km von zu Hause weg.",
      choices: { "priorizar-familia": { label: "Da sein", detail: "Du verpasst die Serie · du gewinnst das andere" }, "no-aflojar": { label: "Jetzt nicht nachlassen", detail: "Du spielst die Serie · du denkst dein Leben lang daran" } },
    },
    "pelea-vestuario": {
      eyebrow: "Nach dem Spiel", title: "Du gehst auf den Führungsspieler los",
      body: "Er stichelt seit drei Monaten. Heute, die Niederlage noch frisch, ist bei dir etwas gerissen.",
      choices: { "bancar-la-piña": { label: "Es ausfechten", detail: "Die halbe Kabine respektiert dich · die andere hasst dich" }, tragarsela: { label: "Runterschlucken", detail: "Damit ist es vorbei · es bleibt in dir" } },
    },
    "bajar-peso": {
      eyebrow: "Waage im Verein", title: "Der Athletiktrainer sagt, du bist zu schwer",
      body: "Vier Kilo. Er sagt, im Eins-gegen-eins sieht man es, und das Knie zahlt am Ende die Rechnung.",
      choices: { "hacer-dieta": { label: "Diät machen", detail: "Du bewegst dich besser · du verlierst die Wucht" }, ignorarlo: { label: "Ignorieren", detail: "Du bleibst der, der drückt · der Körper zahlt" } },
    },
    emigrar: {
      eyebrow: "Die Entscheidung", title: "In Argentinien kannst du davon nicht leben",
      body: "Hier spielt man umsonst: Training abends, nach der Arbeit, und der Verein zahlt die Fahrt, wenn Geld da ist. Alle, die es geschafft haben, sind vor 23 gegangen. Das sind die zwei Türen, die es gibt.",
      choices: {
        filial: { label: "Zweite Mannschaft eines Großen", detail: "Du trainierst mit den Besten · du spielst mit den Reservisten" },
        "liga-chica": { label: "Kleine europäische Liga", detail: "Du spielst die vollen 60 Minuten · niemand sieht dich" },
        "quedarse-en-casa": { label: "Bleiben", detail: "Dein Verein, deine Leute, deine Grenze" },
      },
    },
    "lateral-a-extremo": {
      eyebrow: "Taktiktafel", title: "Der Trainer will dich auf Außen",
      body: "Er sagt, du hast den Sprung und auf Außen spielst du die vollen 60 Minuten. Er sagt auch, dass du von dort nie wieder einen Angriff lenkst.",
      choices: { "correrse-al-ala": { label: "Auf Außen gehen", detail: "Sichere Einsatzzeit · ein anderes Spiel" }, "seguir-de-lateral": { label: "Im Rückraum bleiben", detail: "Deine Position von immer · du kämpfst um den Platz" } },
    },
    "extremo-a-lateral": {
      eyebrow: "Taktiktafel", title: "Sie wollen dich nach innen holen",
      body: "Der Rückraumspieler ist verletzt und du wirfst am besten von denen, die übrig sind. Innen bekommst du mehr Bälle — und mehr Schläge.",
      choices: { "meterse-adentro": { label: "Nach innen gehen", detail: "Mehr Bälle · mehr Kontakt" }, "seguir-de-extremo": { label: "Auf Außen bleiben", detail: "Was du kannst · die Grenze, die du kennst" } },
    },
    "siete-metros-parada": {
      eyebrow: "Letzte Sekunden", title: "Siebenmeter, um die Serie zu retten",
      body: "Ein Tor Vorsprung, null auf der Uhr. Der Werfer hat zweimal in deine lange Ecke geschaut, und du weißt längst, dass das gelogen ist.",
      choices: { jugartela: { label: "Es riskieren", detail: "Triffst du die Ecke, bist du Legende · sonst der, der zu früh fiel" }, "quedarte-parado": { label: "Stehen bleiben", detail: "Kein Trick · soll er entscheiden" } },
    },
    "septimo-jugador-gk": {
      eyebrow: "Auswechselbank", title: "Du wirst bei jedem Angriff rausgenommen",
      body: "Der Trainer spielt das ganze Spiel sieben gegen sechs. Du gehst alle 30 Sekunden rein und raus und wirst nie richtig warm.",
      choices: { "aceptar-salir": { label: "Es hinnehmen", detail: "Die Mannschaft braucht es · du kühlst aus, und man sieht es" }, plantarse: { label: "Dich weigern", detail: "Du sagst, so hältst du nichts · die Kabine kocht" } },
    },
    "arquero-al-arco-vacio": {
      eyebrow: "Tempogegenstoß", title: "Auf der anderen Seite steht kein Torwart",
      body: "Du fängst den Abpraller und gegenüber ist niemand. 40 Meter und ein Bild, das für immer bleiben kann. Oder die Blamage des Jahres.",
      choices: { "tirar-al-arco-vacio": { label: "Werfen", detail: "Torwarttor · oder die Blamage" }, "no-tirar": { label: "Zum Kreisläufer spielen", detail: "Das Richtige · niemand erinnert sich" } },
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
  beats: {
    up: "Eine Klasse höher: {club} · {league}",
    down: "Eine Klasse tiefer: {club} · {league}",
    move: "Wechsel zu {club} · {league}",
    injured: "Verletzung {year}",
    better: "+{n} Stärke",
    worse: "−{n} Stärke",
    role: "Du bist jetzt {role}",
    debut: "Länderspieldebüt",
    tap: "tippen zum Weitermachen",
  },
  swap: {
    encajo: "Hat sich auf der neuen Position zurechtgefunden",
    "no-encajo": "Ist auf der neuen Position nie angekommen",
  },
  climb: {
    label: "Der Aufstieg",
    line: "Von {from} bis {to}",
    none: "Du hast oben angefangen und bist oben geblieben.",
  },
  scandals: {
    doping: "Wegen Dopings gesperrt",
    apuestas: "Wegen Informationsweitergabe belangt",
    amanio: "Wegen Spielmanipulation gesperrt",
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
