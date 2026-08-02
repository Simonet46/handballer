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

export function drawShareCard(canvas, career, t) {
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
  ctx.fillText("HANDBALLER", 72, 100);

  // Dorsal gigante de fondo
  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(244,241,234,.06)";
  ctx.font = "800 420px system-ui, sans-serif";
  ctx.fillText(String(career.player.number), W - 40, 470);
  ctx.restore();

  ctx.fillStyle = PAPER;
  ctx.font = "800 96px system-ui, sans-serif";
  ctx.fillText(`${career.player.flag} ${career.player.lastName}`.slice(0, 22), 72, 250);

  ctx.fillStyle = ACCENT;
  ctx.font = "800 62px system-ui, sans-serif";
  ctx.fillText(t(`verdicts.${career.verdict.key}.title`), 72, 335);

  ctx.fillStyle = "rgba(244,241,234,.7)";
  ctx.font = "400 34px system-ui, sans-serif";
  wrap(ctx, t(`verdicts.${career.verdict.key}.line`), 72, 400, W - 144, 46);

  // Cuadro de estadísticas
  const stats = [
    [totals.matches, t("ui.matches")],
    keeper ? [totals.saves, t("ui.saves")] : [totals.goals, t("ui.goals")],
    keeper ? [totals.caps, t("ui.caps")] : [totals.assists, t("ui.assists")],
    [Math.round(career.maxRating), t("ui.peak")],
  ];
  const boxY = 560;
  ctx.fillStyle = "rgba(244,241,234,.06)";
  roundRect(ctx, 72, boxY, W - 144, 180, 24);
  ctx.fill();
  stats.forEach(([value, label], index) => {
    const x = 72 + (W - 144) * (index + 0.5) / stats.length;
    ctx.textAlign = "center";
    ctx.fillStyle = PAPER;
    ctx.font = "800 64px system-ui, sans-serif";
    ctx.fillText(String(value), x, boxY + 90);
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), x, boxY + 132);
  });

  // Recorrido: primeros y últimos clubes
  ctx.textAlign = "left";
  const clubs = [];
  for (const season of career.timeline) {
    if (clubs.at(-1) !== season.club) clubs.push(season.club);
  }
  const shown = clubs.length > 6 ? [...clubs.slice(0, 3), "…", ...clubs.slice(-2)] : clubs;
  ctx.fillStyle = "rgba(244,241,234,.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(t("ui.clubs").toUpperCase(), 72, 810);
  ctx.fillStyle = PAPER;
  ctx.font = "500 34px system-ui, sans-serif";
  wrap(ctx, shown.join("  ›  "), 72, 860, W - 144, 48, 4);

  // Vitrina
  const honours = new Map();
  for (const item of [...career.trophies, ...career.awards]) {
    const name = honourName(t, item);
    honours.set(name, (honours.get(name) || 0) + 1);
  }
  const top = [...honours].sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (top.length) {
    ctx.fillStyle = "rgba(244,241,234,.5)";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(t("ui.honours").toUpperCase(), 72, 1000);
    ctx.font = "500 32px system-ui, sans-serif";
    top.forEach(([name, count], index) => {
      ctx.fillStyle = "#f0c02c";
      ctx.fillText("🏆", 72, 1052 + index * 46);
      ctx.fillStyle = PAPER;
      ctx.fillText(`${count}× ${name}`, 122, 1052 + index * 46);
    });
  }

  // Puntaje
  ctx.fillStyle = ACCENT;
  roundRect(ctx, 72, H - 150, 330, 96, 20);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(t("ui.score").toUpperCase(), 100, H - 108);
  ctx.font = "800 46px system-ui, sans-serif";
  ctx.fillText(String(career.score), 100, H - 74);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(244,241,234,.45)";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText(shareUrl(), W - 72, H - 82);
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
      if (lines >= maxLines) return;
    } else {
      line = candidate;
    }
  }
  if (line) ctx.fillText(line, x, y + lines * lineHeight);
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
      await navigator.share({ files: [file], text, url });
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
