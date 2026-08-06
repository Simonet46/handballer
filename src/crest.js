/**
 * Escudos: archivo real si existe, monograma generado si no.
 *
 * El juego tiene que verse bien con cero escudos con derechos (ver
 * docs/LICENCIAS.md), así que el monograma no es un parche: es el modo por
 * defecto y el archivo real es la mejora.
 */

const PALETTE = [
  "#1d4ed8", "#b91c1c", "#047857", "#7c3aed", "#0f766e",
  "#c2410c", "#1e293b", "#a16207", "#be185d", "#0369a1"
];

/** Hash estable para que un club tenga siempre el mismo color. */
function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) {
    result ^= character.codePointAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function clubColor(club) {
  return club.primary_color || PALETTE[hash(club.id || club.name) % PALETTE.length];
}

/** Iniciales: hasta 3 letras, saltando artículos y sufijos deportivos. */
export function monogram(name) {
  const skip = new Set([
    "de", "del", "la", "el", "los", "las", "du", "des", "le", "les",
    "club", "handball", "handbol", "balonmano", "andebol", "hb", "hc", "sc",
    "cs", "cd", "ac", "sg", "rk", "hk", "bm", "tv", "tus", "vfl", "tsv"
  ]);
  const words = String(name)
    .split(/[\s./'-]+/)
    .filter((word) => word && !skip.has(word.toLowerCase()));
  const source = words.length ? words : [String(name)];
  return source.slice(0, 3).map((word) => word[0]).join("").toUpperCase() || "?";
}

/** SVG en data URI, listo para un <img src>. */
export function monogramCrest(club, size = 96) {
  const color = clubColor(club);
  const letters = monogram(club.short_name || club.name);
  const fontSize = letters.length >= 3 ? 30 : letters.length === 2 ? 38 : 48;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112" width="${size}" height="${Math.round(size * 112 / 96)}">
<path d="M6 6h84v58c0 26-18 38-42 46C24 102 6 90 6 64Z" fill="${color}"/>
<path d="M6 6h84v58c0 26-18 38-42 46C24 102 6 90 6 64Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
<text x="48" y="62" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${fontSize}" fill="#fff">${letters}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Qué escudos reales se muestran.
 *
 *   league  → la web oficial de la liga (LNH, HBL, ASOBAL)
 *   femebal → el Tournament Tracker de la federación metropolitana
 *   ehf     → la API pública de la Federación Europea
 *   wikipedia → último recurso
 *
 * Los tres primeros son la federación o la liga publicando el escudo que el
 * propio club le dio. Para apagar todos de golpe, dejá el set vacío: el juego
 * sigue funcionando con monogramas. Ver docs/LICENCIAS.md.
 */
export const ALLOWED_CREST_SOURCES = new Set(["league", "femebal", "cbhb", "ehf", "wikipedia"]);

/** Ruta del escudo del club, con monograma de reserva. */
export function crestSrc(club) {
  const allowed = club.crest && ALLOWED_CREST_SOURCES.has(club.crest_source);
  return allowed ? club.crest : monogramCrest(club);
}

/**
 * Para usar en el DOM: si el archivo real falla al cargar, cae al monograma
 * sin dejar el hueco roto.
 *
 *   <img data-crest src="..."> ; attachCrestFallback(img, club)
 */
export function attachCrestFallback(image, club) {
  image.addEventListener("error", () => {
    image.src = monogramCrest(club);
  }, { once: true });
  image.src = crestSrc(club);
  return image;
}
