# Análisis técnico de Copero — «Convertite en leyenda»

Ingeniería inversa hecha sobre las dos versiones públicas del juego:

| Sitio | Qué es | Cómo está hecho |
|---|---|---|
| `copero.com.ar/juegos/simulador-carrera` | El original (Grinovero + Zbogar, +85M partidas) | SPA React + Vite. Bundle principal `assets/index-*.js` (511 KB) + chunk `CareerSimulatorPage-*.js` (555 KB) con **toda la data embebida** |
| `copero.org` | Clon SEO en 15 idiomas | Vanilla JS con **ES modules sin build**: `game-engine.js`, `game.js`, `i18n.js`, `club-crests.js`, `country-flags.js`, `analytics.js` |

El clon es mucho más legible y expone la arquitectura limpia; el original tiene la
data buena. Usé los dos: **mecánica del clon, modelo de datos del original**.

---

## 1. Arquitectura

### 1.1 Separación en 6 módulos (copero.org)

```
game-engine.js   1536 líneas  ← lógica pura, sin DOM. Exporta createCareer/advanceCareer
game.js          2095 líneas  ← capa de UI: querySelector + render + share canvas
i18n.js          5076 líneas  ← copys de 15 idiomas (217 KB, el archivo más grande)
club-crests.js     52 líneas  ← slug del club → ruta del escudo
country-flags.js  127 líneas  ← banderas SVG inline
analytics.js       61 líneas  ← eventos a GA4 con consentimiento
```

Lo importante: **el motor no toca el DOM**. Es una función pura
`(state, choiceId, rng) -> state`. Eso permite testearlo, correrlo en servidor,
y — clave para lo viral — reproducir una partida entera desde una semilla.

### 1.2 Estado 100 % cliente

No hay backend. La partida vive en memoria, se guarda en `sessionStorage`
(`copero:career-resume-v1`, TTL 6 h) y el resultado se comparte con un **token
base64url que contiene el resumen de la carrera** (`createCareerShareToken`).
Cero costo de infraestructura: se sirve como archivos estáticos.

### 1.3 RNG con semilla (Lehmer / MINSTD)

```js
value = (value * 16_807) % 2_147_483_647
```

Permite el **reto diario**: `dailyChallengeSeed(dailyChallengeId())` hashea la
fecha con FNV-1a → todos juegan exactamente la misma carrera ese día. Es el
motor de la viralidad comparativa.

---

## 2. El bucle de juego

```
createCareer(perfil)         → 16 años, OVR 50, potencial 78-93, agente libre
  ↓
academyOffers()              → 3 clubes de tu país (nivel ≤ 3). Elegís dónde empezás
  ↓
┌─ advanceCareer(choiceId) ──────────────────────────────────┐
│  applyChoice()   aplica efectos {rating, potential, fitness,│
│                  form, fame, loyalty, risk, nationalBoost}  │
│  simulateSeason() × `pace` veces (1, 2 o 3 temporadas)      │
│  chooseNextEvent()                                          │
└────────────────────────────────────────────────────────────┘
  ↓ (age >= 40)
finishCareer()               → score + veredicto + honores
```

### 2.1 Ritmo configurable (`PACES`) — el hallazgo más importante

| pace | Nombre | Decisión cada | Factor de score |
|---|---|---|---|
| 1 | Intenso | 1 temporada | ×0.75 |
| 2 | Normal | 2 temporadas | ×1.00 |
| 3 | Exprés | 3 temporadas | ×1.05 |

Una carrera completa (16→40 años) se juega en **menos de 2 minutos**. Esa es la
razón número uno de que se comparta: cabe en un recreo y en un tuit. El factor de
score compensa que jugar «intenso» da más decisiones y por lo tanto más ventaja.

### 2.2 Tipos de evento

`chooseNextEvent()` alterna de forma determinista:

- **`marketEvent`** (mercado de pases): 2 ofertas + quedarte.
- **`contractExpiryEvent`**: si `contractYears <= 0`, renovar o irse libre.
- **`chooseSpecialEvent`** cada 2 decisiones: 13 eventos narrativos con rango de
  edad (`minAge`/`maxAge`) y anti-repetición (no repite ninguno de los últimos 4).
- **`finalCycleEvent`**: última decisión, 2 ofertas o retirarse ya.

Los 13 eventos especiales: entrenamiento extra, competencia por el puesto,
desgarro isquiotibial, esguince de tobillo, aviso de rodilla, llamado de la
selección, mentor, cambio de rol táctico, préstamo, crisis del club, presión de
la hinchada, capitanía, vuelta a casa.

Tres de ellos son «huecos» que se rellenan en runtime con un club real:
`loanOffer`, `offerExit`, `homeOffer`.

### 2.3 Escalera de clubes — cómo funcionan las «divisiones inferiores»

Ésta es la parte que hay que replicar bien.

En el clon, cada país tiene 5 clubes con `level` 1→5. En el **original**, el
modelo es mucho más rico (lo extraje del bundle):

```json
{
  "id": "liga-profesional", "name": "Liga Profesional",
  "country_fifa_code": "ARG", "confederation": "CONMEBOL",
  "tier": 1, "domestic_cup_id": "arg-copa-argentina",
  "logo_url": "…/competitions/ARG/L/liga-profesional.svg",
  "league_trophy_url": "…/trophies/football/national/ARG/…png",
  "teams": [{
    "id": "boca-juniors", "name": "Boca Juniors", "short_name": "Boca",
    "abbreviation": "BOC", "logo_url": "…/teams/ARG/L/boca.svg",
    "primary_color": "#0d1e5b",
    "domestic_reputation": 3, "continental_reputation": 3,
    "international_reputation": 3
  }]
}
```

**35 ligas, 574 equipos.** Sólo 6 países tienen segunda división:
ARG (Primera Nacional), ENG (Championship), ESP (LaLiga 2), FRA (Ligue 2),
GER (2. Bundesliga), ITA (Serie B). El resto es sólo primera.

La progresión se rige por tres funciones:

```js
offerLevel(state) = clamp(round((rating - 48) / 9) + 1, 1, 5)
```

Tu OVR define a qué nivel de club podés aspirar. Y hay un **embudo geográfico
por edad**:

| Edad | Mercado accesible |
|---|---|
| < 20 | sólo tu país (`expandedDomesticCandidates`) |
| 20-21 | tu región/confederación |
| 22-24 | tu región con 62 % de probabilidad |
| 25+ | mundo entero |

Eso es lo que hace que la carrera *se sienta* como una carrera: empezás en el
ascenso de tu país y te vas yendo. Para handball es idéntico, sólo cambian los
destinos (el pibe argentino sueña con la Bundesliga/Starligue, no con Boca).

### 2.4 Rol en el plantel (`projectSquadRole`)

```js
clubBenchmark = 47 + club.level * 7
roleScore = rating + form*0.8 + min(10, max(0, loyalty))*0.08 - clubBenchmark
```

→ `prospect` / `rotation` / `starter` / `key-player`, cada uno con su cuota de
partidos y minutos. Este es el mecanismo que castiga fichar por un club
demasiado grande demasiado pronto: te sentás en el banco. Es la tensión central
de todo el juego.

### 2.5 Simulación de temporada

```
16-23 años  → crecimiento = (potencial - rating) * (0.15 … 0.215)
24-28       → 75 % sube 0.45-2.0, 25 % baja
29-31       → casi plano, ligeramente negativo
32+         → -(0.45 + rand * (edad-30) * 0.26)   ← declive acelerado
```

Lesión: `clamp(0.035 + risk*0.018 + (100-fitness)*0.0018, 0.02, 0.32)`.

Títulos: `titleChance = clamp(0.015 + club.level*0.035 + max(0, rating-72)*0.006, 0.03, 0.35)`.
Continental sólo si `club.level >= 4`. Mundial sólo si `year % 4 === 2` (año par
de Mundial) y `nationalQuality >= 81`.

### 2.6 Score y veredicto

```js
score = (apps*0.09 + rendimiento + caps*0.35 + trofeos*0.55 +
         premios*0.65 + maxRating*1.5 + max(0,loyalty) + fame*0.8) * paceFactor
```

| Score | Veredicto |
|---|---|
| ≥ 1100 | Football Immortal |
| ≥ 700 | World Icon |
| ≥ 480 | Club Legend |
| ≥ 330 | Cult Hero |
| < 330 | The Journeyman |

---

## 3. Diseño de la viralidad (lo que hay que copiar sí o sí)

1. **Sin registro, sin descarga.** Se juega desde el primer segundo.
2. **< 2 minutos** por carrera completa.
3. **Resultado compartible como imagen** (`<canvas id="share-canvas">` que se
   descarga como PNG) + `navigator.share`.
4. **Token de share auto-contenido**: la URL lleva toda la carrera comprimida en
   base64url. El que abre el link ve tu carrera sin base de datos.
5. **Reto diario con semilla fija** → comparación directa entre amigos.
6. **15 idiomas** con URLs separadas (`/es/`, `/fr/`, `/de/`…) y sugerencia
   automática por idioma del navegador. Esto es lo que lo hizo saltar de
   Argentina al mundo.
7. **Analítica de embudo** (`analytics.js`): `setup_started`, `career_started`,
   `decision_made`, `career_finished` con buckets de score y tiempos.
8. **Escudos reales.** Ver el punto 5.

---

## 4. Qué NO copiar tal cual

- **El código fuente literal.** Es obra ajena con derecho de autor. Las mecánicas,
  fórmulas y estructura de datos son ideas y no se protegen; el archivo `.js`
  sí. Reimplementamos con nuestra propia escritura (que además nos conviene:
  handball necesita otras métricas).
- **Los assets de `media.copero.com.ar`.** Escudos, trofeos y logos de
  competición son de ellos o de terceros.
- **La marca «Copero»** para el producto final. Sirve como nombre de trabajo
  interno, no como nombre público.

## 5. El tema de los escudos

Copero sirve escudos reales desde su propio CDN. Los escudos de club son
**marcas registradas**; en Wikipedia la mayoría están como *non-free / fair use*.

Uso el mismo enfoque técnico (CDN propio, un archivo por club, `slug(nombre)`
como clave) pero con dos capas de seguridad:

1. `data/crests.json` guarda la URL de origen de cada archivo → auditable.
2. **Fallback de monograma**: si un club no tiene escudo utilizable, el juego
   dibuja un escudo generado con las iniciales sobre el `primary_color`. El
   juego funciona al 100 % sin ningún escudo con derechos.

Ver `docs/LICENCIAS.md`.
