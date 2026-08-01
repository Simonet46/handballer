# Fuentes de datos por liga

Estado de cada nómina en `data/leagues.json` y de dónde sacar la buena.

## Argentina — resuelta con la fuente oficial ✅

`femebal.com/tournament-tracker` es un SPA que consume
`https://api.tournamenttracker.tecdata.net`. Las respuestas vienen como
`ivHex:cipherHex` con **AES-CTR**; la clave (`REACT_APP_PASSPHRASE`) viaja en
el propio bundle del front, o sea que es ofuscación y no autenticación: es el
mismo dato público que muestra la página.

Tres endpoints, nada más:

| Endpoint | Devuelve |
|---|---|
| `/get-context` | temporadas × federaciones × ramas × categorías |
| `/torneos-x-division/{temporada}/{fed}/{rama}/{categoría}` | divisiones y sus torneos |
| `/torneos/{id}` | el torneo entero: fases, zonas, partidos, goleadores |

Los clubes salen de los partidos: cada uno trae `idClubLocal`, `nombreLocal` y
**`escudoImagePathLocal`** — el escudo oficial en su CDN. Por eso Argentina es
el único país del dataset con 100 % de escudos.

`scripts/fetch_femebal.py` automatiza todo esto y cachea las respuestas.
Ojo: el 2º parámetro de `/torneos-x-division/` **no** filtra por federación
(hay que recorrer ids y quedarse con la que matchea), y `/get-context` anuncia
la temporada 2026 aunque todavía no tenga fixture publicado — el script baja
sola a la última temporada completa.

Pirámide masculina de Mayores tal como la publica FeMeBal:

| Tier | División FeMeBal | Clubes propios |
|---|---|---|
| 1 | LHC Hipotecario Seguros (Liga de Honor) | 16 |
| 2 | Liga de Honor Plata | 12 |
| 3 | 1ª + 2ª División (fusionadas) | 24 |
| — | 3ª, 4ª, Desarrollo | fuera del juego, demasiado profundo |

Los equipos «B»/«C» son filiales del mismo club: quedan en `data/femebal.json`
para referencia pero no entran a la pirámide jugable.

---

## Verificadas contra la temporada 2025-26 ✅

| Liga | Fuente |
|---|---|
| Starligue (FRA T1) | fr.wikipedia — *Championnat de France masculin de handball 2025-2026* |
| Proligue (FRA T2) | fr.wikipedia — *… de deuxième division 2025-2026* (falta 1 club de 16) |
| Handball-Bundesliga (GER T1) | de.wikipedia — *Handball-Bundesliga 2025/26* |
| 2. Bundesliga (GER T2) | de.wikipedia — *2. Handball-Bundesliga 2025/26* |
| 3. Liga (GER T3) | de.wikipedia — *3. Liga Männer (Handball) 2025/26*, 4 Staffeln |
| Liga ASOBAL (ESP T1) | en.wikipedia — *2025–26 Liga ASOBAL* |
| Håndboldligaen (DEN T1) | en.wikipedia — *2025–26 Håndboldligaen* |
| Nemzeti Bajnokság I (HUN T1) | en.wikipedia — *2025–26 NB I (men's handball)* |

## Pendientes de auditar ⚠️

### Prioridad alta — país jugable

**Francia Nationale 1.** No hay artículo de la temporada en Wikipedia.
Fuente: `ffhandball.fr` → competiciones → N1M, 3 poules de 14.

### Prioridad media

| Liga | Dónde |
|---|---|
| Orlen Superliga (POL) | `superliga.pl` — pl.wikipedia tiene la temporada pero sin tabla de equipos parseable |
| Andebol 1 (POR) | `fpa.pt` |
| Handbollsligan (SWE) | `handbollsligan.se` |
| REMA 1000-ligaen (NOR) | `handball.no` |
| División de Honor Plata (ESP) | `asobal.es` / RFEBM |

### Prioridad baja — destinos ocasionales

Rumania (`frh.ro`), Eslovenia (`rokometna-zveza.si`), Croacia (`hrs.hr`),
Macedonia (`rfm.mk`), Suiza (`handball.ch`), Austria (`hla.at`),
Islandia (`hsi.is`), Qatar (`qha.qa`), Egipto (`egyhandball.com`),
Túnez (`fthb.tn`), Brasil (`cbhb.org.br`), Japón (`handball.jp`).

## Fuente transversal recomendada

**EHF** (`eurohandball.com`) tiene ficha de club con logo oficial para todo
equipo que haya jugado Champions o European League. Cubre a los ~120 clubes
europeos más fuertes con datos y escudos consistentes — es la mejor segunda
pasada para subir la cobertura de escudos por encima del 42 % actual.

## Escudos

`scripts/fetch_crests.py` hace tres pasadas sobre Wikipedia:

1. `prop=pageimages` — imagen principal del artículo.
2. `prop=images` + heurística de nombre — necesario porque los escudos suelen
   estar como *non-free* y `pageimages` los ignora.
3. `prop=langlinks` — salta al artículo en el idioma del club (los clubes
   nórdicos y húngaros tienen escudo en su wiki, no en la inglesa).

Cada archivo queda registrado en `data/crests.json` con su URL de origen.
