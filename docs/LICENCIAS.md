# Licencias, marcas y qué se puede copiar

No soy abogado y esto no es asesoramiento legal. Es el mapa de riesgo para
decidir con qué se sale a producción.

## 1. El código de Copero

| Qué | ¿Se puede? | Por qué |
|---|---|---|
| Las **mecánicas**: carrera por bloques de temporadas, decisiones binarias, escalera de clubes por nivel, veredicto final por puntaje | ✅ Sí | Las reglas de un juego y los métodos de cálculo son ideas, no expresión. No se protegen por derecho de autor. |
| Las **fórmulas** (curva de edad, probabilidad de título, score) | ✅ Sí | Ídem. Además las nuestras ya están adaptadas a handball. |
| La **estructura de datos** (liga → tier → equipos con reputación) | ✅ Sí | Un esquema funcional no es obra protegible. |
| Los **archivos `.js`** de `copero.org` / `copero.com.ar` | ❌ No | Es código ajeno con derecho de autor. Ni copiar ni derivar línea por línea. |
| Los **textos** de los eventos narrativos | ❌ No | Son obra literaria. Los nuestros están escritos de cero y en registro rioplatense. |
| El **diseño visual** exacto | ⚠️ Evitar | La estructura de pantallas se puede replicar; la identidad visual conviene que sea propia. |

**Lo que hicimos:** `src/game-engine.js` está escrito desde cero. Comparte
conceptos con Copero (declarado abiertamente en `docs/ANALISIS-COPERO.md`) pero
no comparte código, textos ni assets.

## 2. La marca «Copero»

`Copero` es el nombre comercial de un producto de terceros con tracción real.
**No usarlo en el producto público** — ni como nombre, ni como dominio, ni en
títulos SEO. Como nombre de carpeta de trabajo interno no molesta a nadie.

## 3. Los escudos de club

Ésta es la zona con riesgo real.

Un escudo de club es a la vez:
- **marca registrada** (uso comercial restringido), y
- **obra gráfica** con derecho de autor (salvo que sea tan simple que no llegue
  al umbral de originalidad — el caso de muchos escudos alemanes viejos).

En Wikipedia casi todos están subidos como *non-free / fair use*, que es una
excepción del derecho estadounidense pensada para artículos enciclopédicos, **no
transferible a un videojuego**.

### Cómo lo manejamos

1. `data/crests.json` guarda para cada archivo su **URL de origen**. Se puede
   auditar club por club y ver cuáles vienen de Wikimedia Commons con licencia
   libre y cuáles no.
2. El motor tiene **fallback de monograma**: iniciales sobre el color primario
   del club. El juego es 100 % jugable con cero escudos.
3. Antes de publicar hay que decidir una de estas tres:
   - **A) Sin escudos.** Sólo monogramas. Riesgo cero, se ve más pobre.
   - **B) Escudos filtrados.** Sólo los que están en Commons con licencia libre
     o por debajo del umbral de originalidad. Cobertura parcial, riesgo bajo.
   - **C) Todos los escudos.** Es lo que hace Copero. Riesgo real pero histórico
     bajo: los clubes rara vez persiguen juegos gratuitos que les dan
     visibilidad. Necesita poder apagarse rápido con un flag.

   Recomendación: **B para el lanzamiento, con la infraestructura de C lista.**

### Lo que NO hacemos

- No usamos `media.copero.com.ar` como CDN. Los assets son nuestros o de origen
  declarado.
- No usamos nombres ni imágenes de **jugadores reales**. El único jugador del
  juego es el que crea el usuario.

## 3 bis. Los emblemas de competición

`assets/competitions/` tiene el logo oficial de 13 competiciones, bajado de la
Wikipedia del país con `scripts/fetch_league_logos.py`. Cada archivo queda
registrado en `data/competition-logos.json` con su URL de origen y su licencia.

| Licencia | Cuáles | Riesgo |
|---|---|---|
| Libre (CC0, CC BY-SA, dominio público) | European League, 3. Liga, Superliga PL (M y F), Andebol 1, Swiss Handball League, Handbollsligan, Champions League | Ninguno, con atribución |
| Sólo marca registrada | Starligue, Proligue, LFH | El de siempre: uso descriptivo en juego gratuito |
| Non-free en la wiki de origen | HBL, HBF | Igual que los escudos de club: decisión de producto |

**Cómo se apaga:** vaciar `COMPETITION_LOGOS` en `src/ui.js`. El juego vuelve al
trofeo dorado propio en el mismo render, sin tocar nada más. Los SVG dorados
(`TROPHY_SVG`) son dibujo original y no dependen de nadie.

**Lo que no bajamos a propósito:** los aros olímpicos. El COI los protege con
estatuto propio (Tratado de Nairobi) y no es una pelea que valga la pena por un
ícono. Los Juegos usan el trofeo dorado.

## 4. Nombres de clubes y ligas

Usar «Starligue», «THW Kiel» o «Liga de Honor» como referencia descriptiva en un
juego gratuito es la práctica habitual del género y es defendible. El riesgo
sube si se agrega monetización agresiva o si se sugiere patrocinio oficial.

Poner un descargo visible: *«Juego no oficial, sin relación con la IHF, la EHF
ni con los clubes mencionados.»*
