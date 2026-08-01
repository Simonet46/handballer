# Prompt para auditar las ligas que faltan

Para pegar en una sesión nueva (Claude Code o Cowork) con el repo montado.
Una liga por sesión, o el bloque entero si querés dejarlo corriendo.

---

```
Trabajo en el repo "handball copero" (simulador de carrera de handball).
El dataset vive en data/leagues.json y se genera desde scripts/seed_handball.py
con scripts/build_dataset.py. Los escudos los baja scripts/fetch_crests.py.

TAREA: auditar y corregir las nóminas de las ligas marcadas verified:false en
data/leagues.json, empezando por: fra-nationale-1, pol-superliga, por-andebol-1,
swe-handbollsligan, nor-ligaen, esp-plata.

Para cada liga necesito, de la temporada 2025-26:
  - la lista COMPLETA y real de clubes de esa división
  - el escudo oficial de cada uno
  - una fuerza 1-5 por club (5 = candidato a Champions, 1 = recién ascendido)

MÉTODO QUE YA FUNCIONÓ (usalo antes que cualquier otra cosa):
Las webs de federación casi siempre son SPAs que consumen una API JSON. En vez
de scrapear HTML renderizado, encontrá la API:
  1. curl la página, buscá el bundle JS propio (/static/js/main.*.js)
  2. grepeá el bundle por http, "REACT_APP_", apiUrl, .get(", /api/
  3. de ahí salen el endpoint base y las rutas
  4. si la respuesta viene cifrada, la clave suele estar en el mismo bundle
Ver scripts/fetch_femebal.py: así resolví FeMeBal, que devuelve AES-CTR con la
passphrase embebida en el front. 163 clubes con escudo oficial en una pasada.

Fuentes oficiales por liga (en docs/FUENTES.md):
  fra-nationale-1      ffhandball.fr    (N1M, 3 poules de 14)
  pol-superliga        superliga.pl
  por-andebol-1        fpa.pt
  swe-handbollsligan   handbollsligan.se
  nor-ligaen           handball.no
  esp-plata            asobal.es / rfebm.com
Transversal: eurohandball.com tiene ficha con logo oficial de todo club que haya
jugado Champions o European League (~120 clubes europeos).

ENTREGABLES:
  1. Un script por federación en scripts/ que se pueda re-correr y cachee, con
     el mismo estilo que scripts/fetch_femebal.py (idempotente, sin secretos
     nuevos, User-Agent identificable, pausa entre requests).
  2. scripts/seed_handball.py actualizado: nóminas reales y verified=True.
  3. Escudos en public/assets/crests/ con su origen anotado en data/crests.json.
  4. Al terminar: python3 scripts/build_dataset.py && node scripts/smoke-test.mjs 300
     tiene que correr sin errores y el reparto de veredictos no debe moverse
     mucho de: ~24 % Trotamundos, ~34 % Ídolo, ~23 % Leyenda, ~16 % Ícono, ~3 % Inmortal.

REGLAS:
  - NO inventes clubes. Si una nómina no se puede verificar, dejá la liga con
    verified:false y anotá en docs/FUENTES.md qué falta y por qué.
  - NO metas fotos de planteles como escudos: scripts/wiki.py tiene el filtro
    (looks_like_crest) y hay un guardia de tamaño en fetch_crests.py. Respetalos.
  - Escudos: registrá siempre la URL de origen. Ver docs/LICENCIAS.md.
  - Decime al final qué quedó sin verificar y qué liga necesita decisión mía.
```

---

## Cuándo conviene Cowork y cuándo no

- **No hace falta** para esto: es todo terminal (curl, python, node) y funciona
  igual en una sesión normal de Claude Code, que además ya tiene el repo.
- **Sí conviene** si querés dejar las 18 ligas corriendo en paralelo mientras
  hacés otra cosa, o si alguna federación no expone API y hay que navegar el
  sitio con un browser de verdad (login, captcha, contenido que sólo aparece al
  hacer click).
- Para una liga suelta, pegá el prompt de arriba cambiando la lista de la línea
  `TAREA:` por esa sola liga. Sale más limpio que pedir las seis juntas.
