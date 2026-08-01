# Handball Copero — plan de acción

Simulador de carrera de handball en el navegador, con la mecánica de
[Copero](docs/ANALISIS-COPERO.md) adaptada al deporte: elegís país de origen
(**Francia, Alemania o Argentina**), arrancás en inferiores y subís por la
pirámide de divisiones hasta la Champions y el Mundial.

---

## Fase 0 — Hecho en esta sesión ✅

| Entregable | Dónde | Estado |
|---|---|---|
| Ingeniería inversa de Copero (motor + modelo de datos) | [docs/ANALISIS-COPERO.md](docs/ANALISIS-COPERO.md) | ✅ |
| Referencia del dataset original (35 ligas / 574 equipos) | [docs/copero-football-leagues.reference.json](docs/copero-football-leagues.reference.json) | ✅ |
| Dataset de handball: 29 ligas, 359 clubes, 22 países | [data/leagues.json](data/leagues.json) | ✅ |
| Pirámides completas de los 3 países jugables | ídem, `tier` 1-3 | ✅ |
| Escudos con manifiesto de origen | `public/assets/crests/` + [data/crests.json](data/crests.json) | ✅ parcial |
| **Padrón oficial de FeMeBal vía su Tournament Tracker** | [scripts/fetch_femebal.py](scripts/fetch_femebal.py) + [data/femebal.json](data/femebal.json) | ✅ |
| Motor de juego adaptado a handball | [src/game-engine.js](src/game-engine.js) | ✅ funcional |
| Prueba de humo + calibración de veredictos | [scripts/smoke-test.mjs](scripts/smoke-test.mjs) | ✅ |
| **Interfaz jugable en español, francés y alemán** | [src/ui.js](src/ui.js) · [src/i18n.js](src/i18n.js) · [site/](site/) | ✅ |
| **Tarjeta de resultado en PNG para compartir** | [src/share.js](src/share.js) | ✅ |
| **Imagen de previsualización social** | [scripts/build_og.py](scripts/build_og.py) | ✅ |

```bash
node scripts/smoke-test.mjs 600
```

### Estructura de la pirámide

| País | T1 | T2 | T3 |
|---|---|---|---|
| 🇫🇷 Francia | Starligue (16) | Proligue (15) | Nationale 1 (12) |
| 🇩🇪 Alemania | Handball-Bundesliga (18) | 2. Bundesliga (18) | 3. Liga (24) |
| 🇦🇷 Argentina | Liga de Honor (16) | Liga de Honor Plata (12) | 1ª División (24) |

**Argentina sale del padrón oficial de FeMeBal 2025, con el escudo real de los 52 clubes.**

Más 20 ligas destino: ASOBAL y Plata, Dinamarca, Hungría, Polonia, Portugal,
Suecia, Noruega, Rumania, Eslovenia, Croacia, Macedonia, Suiza, Austria,
Islandia, Qatar, Egipto, Túnez, Brasil, Japón.

---

## Fase 1 — Cerrar los datos (1-2 días)

**Objetivo: que ningún club del juego sea inventado y que las nóminas sean 25-26.**

1. ~~**Argentina**~~ ✅ resuelta. Sale del Tournament Tracker oficial de
   FeMeBal (`scripts/fetch_femebal.py`): 3 divisiones jugables, 52 clubes,
   escudo oficial en el 100 %. Cuando FeMeBal publique el fixture 2026 el
   script lo toma solo (hoy cae a 2025, la última temporada completa).
   Falta decidir si el **Nacional de Clubes de la CAH** entra como copa.

2. **Auditar las 18 ligas marcadas `verified: false`** en `data/leagues.json`.
   Prioridad por impacto en el jugador:
   - 🔴 Alta: `fra-nationale-1` — es país jugable, el usuario empieza ahí.
   - 🟡 Media: `pol-superliga`, `por-andebol-1`, `swe-handbollsligan`,
     `nor-ligaen`, `esp-plata`.
   - 🟢 Baja: el resto (destinos ocasionales).

   Fuentes por país en [docs/FUENTES.md](docs/FUENTES.md).

3. **Colores.** Falta `primary_color` por club (hoy no está en el seed). Es lo
   que alimenta el escudo-monograma de fallback y los degradados de la ficha.
   Se puede extraer del píxel dominante de cada escudo ya descargado.

4. **Selecciones nacionales.** Falta el dataset de seleccionados (bandera,
   fuerza, confederación) para el Mundial/Euro/Panamericano.

---

## Fase 2 — Interfaz (3-5 días)

Copiar la **estructura de pantallas** de Copero, no su código:

```
1. SETUP     apellido · dorsal · mano hábil · país · puesto · ritmo
             → preview de camiseta en vivo
2. CARRERA   HUD (club, edad, VAL, rol, partidos, goles, asistencias)
             + tarjeta de decisión + transición de temporada
3. RESULTADO veredicto · línea de tiempo de clubes · vitrina · puntaje
             → botón de compartir
```

Decisiones técnicas ya tomadas (siguiendo lo que hace rápido a Copero):

- **Vanilla JS con ES modules, sin build.** El motor ya está así. Se despliega
  como archivos estáticos en Cloudflare Pages o Netlify. Costo ~0.
- **Sin backend, sin registro.** Estado en `sessionStorage`, resultado en un
  token base64url dentro de la URL.
- **Mobile-first.** El 90 % del tráfico viral es un pulgar en Instagram.

Pendiente de decisión de producto:

- Escudos reales vs. monograma generado. Hoy el motor soporta las dos.
- ¿Mostramos `VAL` (valoración 46-99) o algo más handbolero tipo "nivel"?

---

## Fase 3 — Mecánica de viralidad (2-3 días)

Esto es lo que hizo a Copero, no el simulador en sí. En orden de impacto:

1. **Tarjeta de resultado en PNG** (`<canvas>` → `toBlob` → `navigator.share`).
   Sin esto no hay viralidad, es el 80 % del efecto.
2. **Reto diario con semilla fija** — `dailyChallengeSeed()` ya está en el motor.
   Todos juegan la misma carrera cada día y comparan.
3. **URL de share auto-contenida**: `?c=<base64url>` con el resumen. Quien abre
   el link ve tu carrera sin base de datos.
4. **i18n**: arrancar con **es / fr / de** (son los tres países jugables) y
   después en / pt / da / hu / pl. Rutas separadas `/fr/`, `/de/` para SEO.
5. **Analítica de embudo**: `setup_started` → `career_started` → `decision_made`
   → `career_finished`, con bucket de puntaje y tiempo por decisión.

---

## Fase 4 — Salida (1-2 días)

- Dominio propio. **No usar «Copero»**: es marca de terceros. Ideas:
  *Pivote*, *Seis Metros*, *Handbolero*, *Lateral*, *La Ley del Handball*.
- Deploy estático + CDN propio para escudos (mismo patrón que Copero con
  `media.copero.com.ar`).
- OG image por carrera compartida.
- Difusión: la comunidad de handball es chica y muy conectada — clubes,
  jugadores profesionales, cuentas de la Starligue/HBL/FeMeBal. Un solo jugador
  conocido compartiendo su carrera mueve más que cualquier pauta.

---

## Fase 5 — Legal (hacer antes de publicar, no después)

Ver [docs/LICENCIAS.md](docs/LICENCIAS.md). Resumen:

- ✅ **Mecánicas, fórmulas y estructura de datos**: son ideas, se pueden
  reimplementar. Lo hicimos con código propio.
- ❌ **Copiar los `.js` de Copero**: no.
- ❌ **Usar la marca «Copero»** en el producto público: no.
- ⚠️ **Escudos de club**: son marcas registradas y en Wikipedia están como
  *non-free*. `data/crests.json` guarda el origen de cada archivo para poder
  auditarlos uno por uno. El fallback de monograma permite lanzar sin ninguno.
- ⚠️ **Nombres de clubes**: usarlos como referencia descriptiva en un juego
  gratuito es defendible, pero es la zona gris. Los nombres de jugadores reales
  no aparecen en ningún lado — bien así.

---

## Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| 18 de 29 ligas sin auditar | Fase 1, priorizada por impacto |
| 197 de 359 clubes sin escudo | Monograma por color; segunda pasada por sitios oficiales |
| Reclamo por escudos/marcas | Manifiesto de origen + poder apagar todos los escudos con un flag |
| El handball tiene mucho menos público que el fútbol | La comunidad es chica pero fanática y muy conectada; el techo es menor pero la penetración puede ser mayor |
| Copero saca su propia versión de handball | Velocidad. La ventana es ahora. |

---

## Próximo paso concreto

```bash
# 1. refrescar el padrón de FeMeBal (toma la temporada más nueva publicada)
python3 scripts/fetch_femebal.py --crests

# 2. auditar Nationale 1 y las ligas destino
#    -> editar scripts/seed_handball.py, marcar verified=True
python3 scripts/build_dataset.py
python3 scripts/fetch_crests.py

# 3. verificar que el universo sigue sano
node scripts/smoke-test.mjs 600
```

Con eso cerrado se puede empezar la Fase 2 sin volver a tocar datos.
