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

export function shareLines(career, t) {
  const keeper = career.player.position === "GK";
  const totals = career.totals;
  const major = career.trophies.filter((item) => MAJOR_TROPHIES.includes(item.key)).length;
  return [
    `${career.player.flag} ${career.player.lastName} — ${t(`verdicts.${career.verdict.key}.title`)}`,
    keeper
      ? `${t("share.matches", { n: totals.matches })} · ${t("share.savesLine", { saves: totals.saves })}`
      : `${t("share.matches", { n: totals.matches })} · ${t("share.goalsLine", { goals: totals.goals, assists: totals.assists })}`,
    `${t("share.major", { n: major })} · ${t("share.peak", { n: Math.round(career.maxRating) })} · ${t("share.caps", { n: totals.caps })}`,
    ...(career.climb > 0 && career.climbDetail?.from
      ? [`${t("climb.label")}: ${t("climb.line", career.climbDetail)} (+${career.climb})`]
      : []),
    `${t("ui.score")}: ${career.score}`,
    t("share.line"),
  ];
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

export function drawShareCard(canvas, career, t, story = "") {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const keeper = career.player.position === "GK";
  const totals = career.totals;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, W, 14);

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(244,241,234,.55)";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText("HANDBALLER", 72, 96);

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

  // La crónica del periodista, con su hilo naranja al costado.
  const storyEnd = story ? drawStory(ctx, story) : 320;

  // Cuadro de estadísticas
  const stats = [
    [totals.matches, t("ui.matches")],
    keeper ? [totals.saves, t("ui.saves")] : [totals.goals, t("ui.goals")],
    keeper ? [totals.caps, t("ui.caps")] : [totals.assists, t("ui.assists")],
    [Math.round(career.maxRating), t("ui.peak")],
  ];
  const boxY = storyEnd + 34;
  ctx.fillStyle = "rgba(244,241,234,.06)";
  roundRect(ctx, 72, boxY, W - 144, 160, 24);
  ctx.fill();
  stats.forEach(([value, label], index) => {
    const x = 72 + (W - 144) * (index + 0.5) / stats.length;
    ctx.textAlign = "center";
    ctx.fillStyle = PAPER;
    ctx.font = "800 58px system-ui, sans-serif";
    ctx.fillText(String(value), x, boxY + 78);
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), x, boxY + 118);
  });

  // Recorrido: primeros y últimos clubes
  ctx.textAlign = "left";
  const clubs = [];
  for (const season of career.timeline) {
    if (clubs.at(-1) !== season.club) clubs.push(season.club);
  }
  const shown = clubs.length > 6 ? [...clubs.slice(0, 3), "…", ...clubs.slice(-2)] : clubs;
  const clubsY = boxY + 226;
  ctx.fillStyle = "rgba(244,241,234,.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(t("ui.clubs").toUpperCase(), 72, clubsY);
  ctx.fillStyle = PAPER;
  ctx.font = "500 33px system-ui, sans-serif";
  wrap(ctx, shown.join("  ›  "), 72, clubsY + 46, W - 144, 46, 2);

  // Vitrina: lo más pesado primero
  const honours = new Map();
  for (const item of [...career.trophies, ...career.awards]) {
    const name = honourName(t, item);
    const entry = honours.get(name) || { count: 0, weight: item.weight || 0 };
    entry.count += 1;
    honours.set(name, entry);
  }
  const top = [...honours]
    .sort((a, b) => b[1].weight * b[1].count - a[1].weight * a[1].count)
    .slice(0, 3);
  if (top.length) {
    const vitY = clubsY + 150;
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(t("ui.honours").toUpperCase(), 72, vitY);
    ctx.font = "500 32px system-ui, sans-serif";
    // Solo las filas que entran arriba del pie: nada se pisa con nada.
    const rows = Math.max(0, Math.min(top.length, Math.floor((H - 96 - (vitY + 50)) / 44) + 1));
    top.slice(0, rows).forEach(([name, { count }], index) => {
      ctx.fillStyle = "#f0c02c";
      ctx.fillText("🏆", 72, vitY + 50 + index * 44);
      ctx.fillStyle = PAPER;
      ctx.fillText(`${count}× ${name}`.slice(0, 46), 122, vitY + 50 + index * 44);
    });
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(244,241,234,.45)";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText(shareUrl(), W - 72, H - 44);
}

/** La crónica en la tarjeta: hasta 7 líneas en itálica. Devuelve la Y final. */
function drawStory(ctx, story) {
  const top = 316;
  const lineHeight = 46;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(244,241,234,.85)";
  ctx.font = "italic 500 32px system-ui, sans-serif";
  const lines = wrap(ctx, story, 104, top + 40, W - 190, lineHeight, 6);
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

function shareUrl() {
  const { host, pathname } = window.location;
  return (host + pathname).replace(/\/index\.html$/, "").replace(/\/$/, "") || "handballer";
}

export async function shareCareer(career, t, canvas, feedback) {
  const text = shareLines(career, t).join("\n");
  const url = window.location.href.split("?")[0];
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = blob ? new File([blob], "handballer.png", { type: "image/png" }) : null;

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
    await navigator.clipboard.writeText(`${text}\n${url}`);
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
  link.download = "handballer.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

function flash(node, message) {
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  setTimeout(() => { node.hidden = true; }, 2200);
}
