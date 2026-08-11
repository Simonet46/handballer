/**
 * Tarjeta de resultado. Es la pieza que hace que el juego circule: sin una
 * imagen linda para pegar en una historia, nadie comparte nada.
 */
import { MAJOR_TROPHIES } from "./game-engine.js";
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

/** El recorrido de clubes, condensado como en la tarjeta: 3 primeros … 2 últimos. */
function clubRoute(career) {
  const clubs = [];
  for (const season of career.timeline) {
    if (clubs.at(-1) !== season.club) clubs.push(season.club);
  }
  return clubs.length > 6 ? [...clubs.slice(0, 3), "…", ...clubs.slice(-2)] : clubs;
}

/** La vitrina condensada: los títulos más pesados primero, con su multiplicador. */
function topHonours(career, t, max = 3) {
  const honours = new Map();
  for (const item of [...career.trophies, ...career.awards]) {
    const name = honourName(t, item);
    const entry = honours.get(name) || { count: 0, weight: item.weight || 0 };
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
    `🤾 ${t("ui.clubs")}: ${clubRoute(career).join(" › ")}`,
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

export async function drawShareCard(canvas, career, t, story = "") {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const keeper = career.player.position === "GK";
  const totals = career.totals;

  // La camiseta personalizada se carga primero: si el archivo faltara, la
  // tarjeta sale igual, sólo que sin ella.
  let jersey = null;
  try {
    jersey = await loadImage(`assets/jerseys/${career.player.country}.png`);
  } catch {
    jersey = null;
  }

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
  if (jersey) {
    const jw = 280;
    const jh = jw * (jersey.height / jersey.width);
    const jx = W - 72 - jw;
    const jy = 262;
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

  // La crónica del periodista, con su hilo naranja al costado. Si hay
  // camiseta, el texto se angosta para no pisarla.
  const storyWidth = jersey ? W - 190 - 320 : W - 190;
  const storyEnd = story ? drawStory(ctx, story, storyWidth) : 320;

  // Cuadro de estadísticas: partidos, producción, sueldo pico y pico de VAL.
  const stats = [
    [totals.matches, t("ui.matches")],
    keeper ? [totals.saves, t("ui.saves")] : [totals.goals, t("ui.goals")],
    career.maxSalary > 0
      ? [`${Number(career.maxSalary).toLocaleString("de-DE")} €`, t("share.salary")]
      : keeper ? [totals.caps, t("ui.caps")] : [totals.assists, t("ui.assists")],
    [Math.round(career.maxRating), t("ui.peak")],
  ];
  const boxY = Math.max(storyEnd, jerseyBottom + 6) + 34;
  ctx.fillStyle = "rgba(244,241,234,.06)";
  roundRect(ctx, 72, boxY, W - 144, 160, 24);
  ctx.fill();
  stats.forEach(([value, label], index) => {
    const x = 72 + (W - 144) * (index + 0.5) / stats.length;
    ctx.textAlign = "center";
    ctx.fillStyle = PAPER;
    ctx.font = "800 52px system-ui, sans-serif";
    ctx.fillText(String(value), x, boxY + 76);
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), x, boxY + 118);
  });

  // Recorrido: primeros y últimos clubes
  ctx.textAlign = "left";
  const shown = clubRoute(career);
  const clubsY = boxY + 226;
  ctx.fillStyle = "rgba(244,241,234,.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(t("ui.clubs").toUpperCase(), 72, clubsY);
  ctx.fillStyle = PAPER;
  ctx.font = "500 33px system-ui, sans-serif";
  wrap(ctx, shown.join("  ›  "), 72, clubsY + 46, W - 144, 46, 2);

  // Vitrina: lo más pesado primero
  const top = topHonours(career, t);
  if (top.length) {
    const vitY = clubsY + 150;
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(t("ui.honours").toUpperCase(), 72, vitY);
    ctx.font = "500 32px system-ui, sans-serif";
    // Solo las filas que entran arriba del pie: nada se pisa con nada.
    const rows = Math.max(0, Math.min(top.length, Math.floor((H - 110 - (vitY + 50)) / 44) + 1));
    top.slice(0, rows).forEach(([name, { count }], index) => {
      ctx.fillStyle = "#f0c02c";
      ctx.fillText("🏆", 72, vitY + 50 + index * 44);
      ctx.fillStyle = PAPER;
      ctx.fillText(`${count}× ${name}`.slice(0, 46), 122, vitY + 50 + index * 44);
    });
  }

  // La dirección, bien legible: es el llamado a jugar.
  ctx.textAlign = "right";
  ctx.fillStyle = ACCENT;
  ctx.font = "700 34px system-ui, sans-serif";
  ctx.fillText(SITE, W - 72, H - 44);
}

/** La crónica en la tarjeta: itálica angosta si comparte fila con la camiseta. */
function drawStory(ctx, story, maxWidth) {
  const top = 316;
  const lineHeight = 46;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(244,241,234,.85)";
  ctx.font = "italic 500 32px system-ui, sans-serif";
  const lines = wrap(ctx, story, 104, top + 40, maxWidth, lineHeight, 7);
  const height = 24 + lines * lineHeight + 30;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(72, top, 6, height);
  return top + height;
}

function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      lines += 1;
      line = word;
      if (lines >= maxLines) {
        ctx.fillText(`${line}…`.slice(0, 60), x, y + lines * lineHeight);
        return lines + 1;
      }
    } else {
      line = candidate;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + lines * lineHeight);
    lines += 1;
  }
  return lines;
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
