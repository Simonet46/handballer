/**
 * Tarjeta de resultado. Es la pieza que hace que el juego circule: sin una
 * imagen linda para pegar en una historia, nadie comparte nada.
 */
import { MAJOR_TROPHIES } from "./game-engine.js";
import { crestSrc } from "./crest.js";
import { honourName } from "./i18n.js";

const W = 1080;
const H = 1350;

const INK = "#0b0f14";
const PAPER = "#f4f1ea";
const ACCENT = "#e8552f";

// La dirección se escribe entera y a mano: es lo que la gente tipea después
// de ver la historia de otro.
const SITE = "www.handboludo.com";

// Los mismos colores que usa la vista previa de la camiseta en el setup:
// sobre las blancas el texto va oscuro, sobre las oscuras va claro.
const JERSEY_INK = {
  ARG: "#14274e", FRA: "#10307e", GER: "#16181c",
  BRA: "#0d6b34", CRO: "#c8102e",
};
const JERSEY_NUMBER_INK = { ...JERSEY_INK, ESP: "#ffc400" };

/**
 * El recorrido de clubes, condensado: 3 primeros … 2 últimos. Cada parada
 * lleva el id además del nombre, que es lo que permite buscarle el escudo.
 */
function clubRoute(career) {
  const clubs = [];
  for (const season of career.timeline) {
    if (clubs.at(-1)?.name !== season.club) clubs.push({ name: season.club, id: season.clubId });
  }
  return clubs.length > 6
    ? [...clubs.slice(0, 3), { name: "…" }, ...clubs.slice(-2)]
    : clubs;
}

/** La vitrina condensada: los títulos más pesados primero, con su multiplicador. */
function topHonours(career, t, max = 4) {
  const honours = new Map();
  for (const item of [...career.trophies, ...career.awards]) {
    const name = honourName(t, item);
    // Guardamos la clave del primero: es la que elige qué trofeo se dibuja.
    const entry = honours.get(name) || { count: 0, weight: item.weight || 0, key: item.key };
    entry.count += 1;
    honours.set(name, entry);
  }
  return [...honours]
    .sort((a, b) => b[1].weight * b[1].count - a[1].weight * a[1].count)
    .slice(0, max);
}

function money(amount, t) {
  return `${Number(amount).toLocaleString("de-DE")} €${t("ui.perMonth")}`;
}

/**
 * El resumen para pegar como texto (WhatsApp, principalmente): veredicto,
 * puntaje, sueldo pico, el recorrido de clubes y los títulos. Cierra con la
 * pregunta que pica y la dirección.
 */
export function shareLines(career, t) {
  const honours = topHonours(career, t)
    .map(([name, { count }]) => (count > 1 ? `${count}× ${name}` : name));
  return [
    `${career.player.flag} ${career.player.lastName} — ${t(`verdicts.${career.verdict.key}.title`)}`,
    `🎯 ${t("ui.score")}: ${career.score}`,
    ...(career.maxSalary > 0 ? [`💰 ${t("share.salary")}: ${money(career.maxSalary, t)}`] : []),
    `🤾 ${t("ui.clubs")}: ${clubRoute(career).map((stop) => stop.name).join(" › ")}`,
    honours.length
      ? `🏆 ${t("ui.honours")}: ${honours.join(" · ")}`
      : `🏆 ${t("share.noTitles")}`,
    "",
    t("share.line"),
    SITE,
  ];
}

/** El mismo resumen, listo para abrir WhatsApp con el texto ya escrito. */
export function whatsappShareUrl(career, t) {
  return `https://wa.me/?text=${encodeURIComponent(shareLines(career, t).join("\n"))}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** Como loadImage, pero un archivo que falta devuelve null en vez de romper. */
async function loadImageSafe(src) {
  if (!src) return null;
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

/** Dibuja la imagen dentro de un cuadrado sin deformarla. */
function drawContain(ctx, image, x, y, box) {
  const scale = Math.min(box / image.width, box / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, x + (box - w) / 2, y + (box - h) / 2, w, h);
}

/** Recorta con puntos suspensivos si no entra en el ancho dado. */
function ellipsize(ctx, text, maxWidth) {
  let out = String(text);
  if (ctx.measureText(out).width <= maxWidth) return out;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
  return `${out}…`;
}

export async function drawShareCard(canvas, career, t, story = "", extras = {}) {
  const { clubById = new Map(), trophySrc = null } = extras;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const keeper = career.player.position === "GK";
  const totals = career.totals;

  const route = clubRoute(career);
  const honours = topHonours(career, t);

  // Todo lo que se dibuja como imagen se baja antes de pintar nada: así el
  // orden del dibujo no depende de la red y la tarjeta nunca sale a medias.
  // Lo que falte vuelve null y esa parte simplemente no se dibuja.
  const [jersey, crests, trophies] = await Promise.all([
    loadImageSafe(`assets/jerseys/${career.player.country}.png`),
    Promise.all(route.map((stop) => (stop.id
      ? loadImageSafe(crestSrc(clubById.get(stop.id) || { id: stop.id, name: stop.name }))
      : null))),
    Promise.all(honours.map(([, info]) => loadImageSafe(trophySrc?.(info)))),
  ]);

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, W, 14);

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(244,241,234,.55)";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText("HANDBOLUDO.COM", 72, 96);

  // Dorsal gigante de fondo
  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(244,241,234,.05)";
  ctx.font = "800 380px system-ui, sans-serif";
  ctx.fillText(String(career.player.number), W - 40, 420);
  ctx.restore();

  ctx.fillStyle = PAPER;
  ctx.font = "800 72px system-ui, sans-serif";
  ctx.fillText(`${career.player.flag} ${career.player.lastName}`.slice(0, 18), 72, 192);

  ctx.fillStyle = ACCENT;
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.fillText(t(`verdicts.${career.verdict.key}.title`), 72, 262);

  // El puntaje arriba a la derecha: es el número que se compara.
  ctx.fillStyle = ACCENT;
  roundRect(ctx, W - 72 - 280, 112, 280, 112, 20);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText(t("ui.score").toUpperCase(), W - 72 - 140, 156);
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.fillText(String(career.score), W - 72 - 140, 210);
  ctx.textAlign = "left";

  // La camiseta del jugador a la derecha, debajo del puntaje, con su apellido
  // y su dorsal puestos igual que en la vista previa del setup.
  let jerseyBottom = 300;
  let jerseyLeft = W - 72;
  if (jersey) {
    // Más chica y más arriba que antes: el alto que se libera acá es
    // exactamente el que gana la crónica, que ahora tiene que entrar entera.
    const jw = 210;
    const jh = jw * (jersey.height / jersey.width);
    const jx = W - 72 - jw;
    const jy = 232;
    jerseyLeft = jx;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.55)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(jersey, jx, jy, jw, jh);
    ctx.restore();

    const country = career.player.country;
    ctx.textAlign = "center";
    ctx.fillStyle = JERSEY_INK[country] || PAPER;
    ctx.font = `800 ${Math.round(jw * 0.088)}px system-ui, sans-serif`;
    const nameY = jy + jh * (country === "GER" ? 0.155 : 0.245);
    ctx.fillText(career.player.lastName.slice(0, 12), jx + jw / 2, nameY);
    ctx.fillStyle = JERSEY_NUMBER_INK[country] || PAPER;
    ctx.font = `800 ${Math.round(jw * 0.42)}px system-ui, sans-serif`;
    ctx.fillText(String(career.player.number), jx + jw / 2, jy + jh * 0.62);
    ctx.textAlign = "left";
    jerseyBottom = jy + jh;
  }

  // De acá para abajo el orden se piensa al revés: se mide primero lo que va
  // anclado al pie y lo que sobra es de la crónica. Antes la crónica empujaba
  // a los trofeos fuera de la tarjeta y directamente desaparecían.
  //
  // El recorrido de clubes puede ocupar una fila o dos según cuántos sean y
  // qué largo tengan los nombres, así que se mide en vez de suponerlo.
  const CONTENT_BOTTOM = H - 110;          // debajo sólo va la dirección
  const routeHeight = drawClubRoute(ctx, route, crests, 72, 0, W - 144, true);
  const vitrinaBlock = honours.length ? 168 : 0;
  const STATS_TOP = CONTENT_BOTTOM - vitrinaBlock - routeHeight - 16 - 196;

  // La crónica del periodista, entera, esquivando la camiseta en sus primeras
  // líneas y con su hilo naranja al costado.
  const storyEnd = story ? drawStory(ctx, story, 322, STATS_TOP - 34, jerseyLeft, jerseyBottom) : 322;

  // Cuadro de estadísticas: partidos, producción, sueldo pico y pico de VAL.
  const stats = [
    [totals.matches, t("ui.matches")],
    keeper ? [totals.saves, t("ui.saves")] : [totals.goals, t("ui.goals")],
    career.maxSalary > 0
      ? [`${Number(career.maxSalary).toLocaleString("de-DE")} €`, t("share.salary")]
      : keeper ? [totals.caps, t("ui.caps")] : [totals.assists, t("ui.assists")],
    [Math.round(career.maxRating), t("ui.peak")],
  ];
  // Si la crónica salió corta, todo el bloque sube y no queda un hueco en el
  // medio; si salió larga, se frena en el tope reservado.
  const boxY = Math.min(Math.max(storyEnd, jerseyBottom + 6) + 34, STATS_TOP);
  ctx.fillStyle = "rgba(244,241,234,.06)";
  roundRect(ctx, 72, boxY, W - 144, 150, 24);
  ctx.fill();
  stats.forEach(([value, label], index) => {
    const x = 72 + (W - 144) * (index + 0.5) / stats.length;
    ctx.textAlign = "center";
    ctx.fillStyle = PAPER;
    ctx.font = "800 50px system-ui, sans-serif";
    ctx.fillText(String(value), x, boxY + 72);
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 23px system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), x, boxY + 112);
  });

  // Recorrido: cada club con su escudo delante.
  ctx.textAlign = "left";
  const clubsY = boxY + 196;
  ctx.fillStyle = "rgba(244,241,234,.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(t("ui.clubs").toUpperCase(), 72, clubsY);
  // El alto ya se midió arriba; acá sólo se dibuja.
  drawClubRoute(ctx, route, crests, 72, clubsY + 16, W - 144);

  // Vitrina: los trofeos que ganó, con su imagen y cuántos de cada uno.
  if (honours.length) {
    const vitY = clubsY + 16 + routeHeight + 40;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(t("ui.honours").toUpperCase(), 72, vitY);
    drawTrophies(ctx, honours, trophies, 72, vitY + 18, W - 144);
  }

  // La dirección, bien legible: es el llamado a jugar.
  ctx.textAlign = "right";
  ctx.fillStyle = ACCENT;
  ctx.font = "700 34px system-ui, sans-serif";
  ctx.fillText(SITE, W - 72, H - 44);
}

/**
 * Parte el texto en líneas. El ancho no es fijo: se pregunta a cada altura,
 * que es lo que permite esquivar la camiseta en las primeras líneas y usar
 * todo el ancho más abajo.
 */
function layoutStory(ctx, text, top, lineHeight, widthAt) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const max = widthAt(top + lines.length * lineHeight);
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * La crónica en la tarjeta, con su hilo naranja al costado.
 *
 * Se dibuja entera. En vez de cortar con puntos suspensivos como antes, va
 * probando cuerpos de letra cada vez más chicos hasta que el texto completo
 * entra en el alto disponible; el resumen del periodista es media gracia de
 * la tarjeta y cortado no se entiende.
 */
function drawStory(ctx, story, top, bottom, jerseyLeft, jerseyBottom) {
  const x = 104;
  const wide = W - 72 - x;
  const narrow = Math.max(300, jerseyLeft - 30 - x);
  const available = bottom - top;
  const widthAt = (y) => (y < jerseyBottom + 8 ? narrow : wide);

  let fit = null;
  for (const size of [32, 30, 28, 26, 24, 22, 20]) {
    ctx.font = `italic 500 ${size}px system-ui, sans-serif`;
    const lineHeight = Math.round(size * 1.36);
    fit = { size, lineHeight, lines: layoutStory(ctx, story, top, lineHeight, widthAt) };
    if (fit.lines.length * lineHeight <= available) break;
  }

  // Sólo si ni con la letra más chica entra (una crónica larguísima) se corta.
  const maxLines = Math.max(1, Math.floor(available / fit.lineHeight));
  const lines = fit.lines.slice(0, maxLines);
  if (lines.length < fit.lines.length) lines[lines.length - 1] += "…";

  ctx.font = `italic 500 ${fit.size}px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(244,241,234,.85)";
  lines.forEach((line, index) => ctx.fillText(line, x, top + index * fit.lineHeight));

  const height = lines.length * fit.lineHeight;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(72, top - 26, 6, height + 10);
  return top + height;
}

/**
 * El recorrido, con el escudo delante de cada club y flechitas entre medio.
 * Devuelve el alto que ocupó. Con `measureOnly` sólo mide, que es como el
 * dibujo de arriba sabe cuánto lugar le queda a la crónica.
 */
function drawClubRoute(ctx, route, crests, x, y, maxWidth, measureOnly = false) {
  const size = 44;
  const gap = 12;
  const sep = 24;
  ctx.font = "500 31px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  let cx = x;
  let cy = y;
  let rows = 1;
  route.forEach((stop, index) => {
    const crest = crests[index];
    const name = ellipsize(ctx, stop.name, maxWidth - (crest ? size + gap : 0));
    const width = (crest ? size + gap : 0) + ctx.measureText(name).width;
    // Si no entra en la fila, sigue en la de abajo.
    if (cx > x && cx + width > x + maxWidth) { cx = x; cy += size + 14; rows += 1; }
    if (crest) {
      if (!measureOnly) drawContain(ctx, crest, cx, cy, size);
      cx += size + gap;
    }
    if (!measureOnly) {
      ctx.fillStyle = PAPER;
      ctx.fillText(name, cx, cy + size / 2);
    }
    cx += ctx.measureText(name).width;
    if (index < route.length - 1) {
      if (!measureOnly) {
        ctx.fillStyle = "rgba(244,241,234,.35)";
        ctx.fillText("›", cx + sep / 2 - 4, cy + size / 2);
      }
      cx += sep;
    }
  });
  ctx.textBaseline = "alphabetic";
  return rows * size + (rows - 1) * 14;
}

/** La vitrina: el trofeo dibujado, cuántos ganó y cómo se llama. */
function drawTrophies(ctx, honours, images, x, y, maxWidth) {
  const columns = Math.min(honours.length, 4);
  const cellWidth = maxWidth / columns;
  honours.slice(0, columns).forEach(([name, info], index) => {
    const center = x + cellWidth * index + cellWidth / 2;
    const image = images[index];
    if (image) drawContain(ctx, image, center - 34, y, 68);
    ctx.textAlign = "center";
    if (info.count > 1) {
      ctx.fillStyle = "#f0c02c";
      ctx.font = "800 27px system-ui, sans-serif";
      ctx.fillText(`×${info.count}`, center + 52, y + 46);
    }
    ctx.fillStyle = PAPER;
    ctx.font = "600 21px system-ui, sans-serif";
    ctx.fillText(ellipsize(ctx, name, cellWidth - 14), center, y + 100);
  });
  ctx.textAlign = "left";
}

export async function shareCareer(career, t, canvas, feedback) {
  const text = shareLines(career, t).join("\n");
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = blob ? new File([blob], "handboludo.png", { type: "image/png" }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      // SOLO la imagen: mezclar files + text + url hacía que Safari/WhatsApp
      // adjuntara la tarjeta dos veces y pegara la ruta temporal del archivo.
      // La tarjeta ya lleva adentro el puntaje, la crónica y la URL.
      await navigator.share({ files: [file] });
      return;
    } catch {
      // El usuario canceló: seguimos con las alternativas.
    }
  }
  try {
    // El texto ya termina con la dirección: no hace falta pegarla de nuevo.
    await navigator.clipboard.writeText(text);
    flash(feedback, t("ui.copied"));
  } catch {
    download(blob);
  }
}

/**
 * WhatsApp con la tarjeta, no sólo con el texto.
 *
 * A un enlace wa.me no se le puede adjuntar una imagen: el único camino es la
 * hoja de compartir del sistema, donde el usuario toca WhatsApp y la foto
 * viaja de verdad. En un escritorio, que no tiene esa hoja, bajamos la tarjeta
 * y abrimos WhatsApp con el resumen escrito para adjuntarla a mano.
 */
export async function shareCareerToWhatsapp(career, t, canvas, feedback) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = blob ? new File([blob], "handboludo.png", { type: "image/png" }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch {
      // Canceló: no le abrimos WhatsApp por atrás.
    }
    return;
  }

  download(blob);
  flash(feedback, t("ui.waImage"));
  window.open(whatsappShareUrl(career, t), "_blank", "noopener");
}

export function downloadCard(canvas) {
  canvas.toBlob(download, "image/png");
}

function download(blob) {
  if (!blob) return;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "handboludo.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

function flash(node, message) {
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  setTimeout(() => { node.hidden = true; }, 2200);
}
