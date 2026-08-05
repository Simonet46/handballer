#!/usr/bin/env python3
"""Genera assets/og.png, la imagen que aparece cuando alguien pega el link.

    python3 scripts/build_og.py

Es lo primero que ve la gente cuando el juego circula por WhatsApp o Instagram,
así que usa la misma identidad que la tarjeta de resultado (src/share.js).
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "og.png")

W, H = 1200, 630
INK = (11, 15, 20)
PAPER = (244, 241, 234)
ACCENT = (232, 85, 47)

FONTS = "/System/Library/Fonts/Supplemental"


def font(name, size):
    for candidate in (f"{FONTS}/{name}", f"/Library/Fonts/{name}"):
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size)


def build():
    image = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(image, "RGBA")

    draw.rectangle([0, 0, W, 12], fill=ACCENT)

    # Dorsal gigante de fondo. Se dibuja en una capa aparte y se mezcla al 7 %:
    # con `fill` translúcido directo, PIL lo pinta opaco.
    layer = Image.new("RGB", (W, H), INK)
    ImageDraw.Draw(layer).text((1215, 40), "7", font=font("Arial Bold.ttf", 430),
                               fill=PAPER, anchor="ra")
    image = Image.blend(image, layer, 0.07)
    draw = ImageDraw.Draw(image, "RGBA")

    # Título con degradado: se pinta el texto como máscara sobre el degradado.
    title_font = font("Arial Bold.ttf", 112)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).text((70, 120), "HANDBOLUDO.COM", font=title_font, fill=255)
    gradient = Image.new("RGB", (W, H))
    for x in range(W):
        ratio = min(1.0, max(0.0, (x - 70) / 780))
        gradient.putpixel((x, 0), tuple(
            round(PAPER[i] + (ACCENT[i] - PAPER[i]) * ratio) for i in range(3)
        ))
    gradient = gradient.crop((0, 0, W, 1)).resize((W, H))
    image.paste(gradient, (0, 0), mask)

    draw.text((70, 268), "Una carrera de handball entera en dos minutos",
              font=font("Arial Bold.ttf", 40), fill=PAPER)
    draw.text((70, 332), "Francia · Alemania · Argentina — de inferiores al Mundial",
              font=font("Arial.ttf", 31), fill=(244, 241, 234, 150))

    pills = ["Liga de Honor", "Starligue", "Bundesliga", "EHF Champions League"]
    pill_font = font("Arial Bold.ttf", 27)
    x = 70
    for label in pills:
        width = round(draw.textlength(label, font=pill_font)) + 44
        draw.rounded_rectangle([x, 430, x + width, 488], radius=29,
                               fill=(244, 241, 234, 20))
        draw.text((x + 22, 447), label, font=pill_font, fill=PAPER)
        x += width + 14

    draw.text((70, 552), "Gratis · sin registro · español · français · deutsch",
              font=font("Arial.ttf", 27), fill=(244, 241, 234, 120))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    image.save(OUT, optimize=True)
    print(f"  -> assets/og.png ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    build()
