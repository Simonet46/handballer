# Handball Copero

Simulador de carrera de handball para navegador, inspirado en la mecánica del
juego viral argentino **Copero — «Convertite en leyenda»**.

Elegís de dónde salís —🇫🇷 **Francia**, 🇩🇪 **Alemania** o 🇦🇷 **Argentina**—,
arrancás a los 17 en inferiores y vas subiendo por la pirámide de divisiones
hasta la Champions y el Mundial. Una carrera entera en menos de dos minutos.

> Juego no oficial. Sin relación con la IHF, la EHF ni con los clubes mencionados.
> «Copero» es marca de terceros; se usa acá sólo como nombre de trabajo interno.

## Estado

| | |
|---|---|
| Motor de juego | ✅ funcional (`src/game-engine.js`) |
| Dataset | ✅ 29 ligas · 359 clubes · 22 países |
| Escudos | ✅ Argentina real (52 clubes) · el resto, monograma por color |
| Interfaz | ✅ jugable en es · fr · de |
| Tarjeta de resultado para compartir | ✅ PNG 1080×1350 + `navigator.share` |
| Reto diario con semilla fija | ⛔ pendiente |

Plan completo en **[PLAN.md](PLAN.md)**.

## Documentación

- **[PLAN.md](PLAN.md)** — plan de acción por fases
- **[docs/ANALISIS-COPERO.md](docs/ANALISIS-COPERO.md)** — ingeniería inversa del original
- **[docs/FUENTES.md](docs/FUENTES.md)** — de dónde sale cada nómina y qué falta auditar
- **[docs/LICENCIAS.md](docs/LICENCIAS.md)** — qué se puede copiar y qué no

## Estructura

```
data/            leagues.json · femebal.json · countries.json · positions.json · competitions.json · crests.json
src/             game-engine.js       ← lógica pura, sin DOM
scripts/         seed_handball.py     ← dataset curado (fuente de verdad)
                 fetch_femebal.py     ← padrón oficial argentino (Tournament Tracker)
                 build_dataset.py     ← genera data/*.json
                 fetch_crests.py      ← baja escudos de Wikipedia (3 pasadas)
                 smoke-test.mjs       ← 600 carreras y distribución de veredictos
                 wiki.py, extract.py  ← cliente de la API de Wikipedia
public/assets/   crests/ · trophies/
docs/            análisis, fuentes, licencias, dataset original de Copero
```

## Jugarlo local

```bash
python3 -m http.server 4321
```

Y abrir <http://localhost:4321>. No hay build ni bundler: son archivos estáticos.

## Regenerar

```bash
python3 scripts/fetch_femebal.py --crests   # padrón oficial argentino
python3 scripts/build_dataset.py            # data/*.json
python3 scripts/fetch_crests.py             # escudos de Wikipedia
python3 scripts/build_site.py               # index.html en es · fr · de
python3 scripts/build_og.py                 # imagen de previsualización social
node scripts/smoke-test.mjs 600             # 600 carreras, distribución de veredictos
```

Dependencias: Python 3 (`cryptography` y `pillow` para dos de los scripts) y Node
para el motor. El juego en sí no depende de nada.

## Publicar en GitHub Pages

Es un sitio estático puro, así que se sirve directo desde el repo:

1. Subir el repo a GitHub.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `root`.**
3. En un par de minutos queda en `https://<usuario>.github.io/<repo>/`.

Las rutas son relativas (`<base href>` por idioma), así que funciona igual en la
raíz de un dominio propio que en un subdirectorio de Pages.

## El motor en 20 líneas

```js
import { loadUniverse, createCareer, advanceCareer, createRng } from "./src/game-engine.js";

loadUniverse({ leagues, countries });

const rng = createRng(Date.now());
const carrera = createCareer(
  { lastName: "SIMONET", number: 7, country: "ARG", position: "CB", pace: 2 },
  rng
);

while (!carrera.ended) {
  const decision = carrera.pendingEvent;        // título, texto y 2-3 opciones
  advanceCareer(carrera, decision.choices[0].id, rng);
  //           ↑ simula `pace` temporadas y devuelve la siguiente decisión
}

carrera.verdict;   // { title: "Ícono mundial", line: "…" }
carrera.score;     // 1284
carrera.timeline;  // una fila por temporada: club, liga, VAL, partidos, goles, títulos
```

## Posiciones

`GK` arquero · `LW` extremo izquierdo · `LB` lateral izquierdo · `CB` central ·
`RB` lateral derecho · `RW` extremo derecho · `PV` pivote

Cada una tiene su tasa de gol y asistencia por partido; el arquero se mide por
atajadas y porcentaje de atajadas en vez de goles.
