#!/usr/bin/env python3
"""Genera index.html para cada idioma a partir de site/index.template.html.

    python3 scripts/build_site.py

Sale un sitio estático puro, sin bundler: se sube tal cual a GitHub Pages.
    /index.html      español
    /fr/index.html   francés
    /de/index.html   alemán
Las rutas relativas las resuelve el <base> de cada página.
"""
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "site", "index.template.html")
LOCALES = ["es", "fr", "de"]

DISCLAIMER = {
    "es": "Juego no oficial y gratuito. Sin relación con la IHF, la EHF ni con los clubes mencionados.",
    "fr": "Jeu non officiel et gratuit. Sans lien avec l'IHF, l'EHF ni les clubs mentionnés.",
    "de": "Inoffizielles, kostenloses Spiel. Ohne Verbindung zur IHF, EHF oder den genannten Vereinen.",
}


def strings_for(locale):
    """Lee los textos directamente de src/i18n.js con node, sin duplicarlos acá."""
    script = (
        "import('file://%s').then(m => {"
        "  const t = m.createTranslator('%s');"
        "  process.stdout.write(JSON.stringify({"
        "    title: t('meta.title'), description: t('meta.description'),"
        "    tagline: t('ui.tagline'), intro: t('ui.intro'),"
        "    lastName: t('ui.lastName'), lastNamePh: t('ui.lastNamePlaceholder'),"
        "    number: t('ui.number'), hand: t('ui.hand'), country: t('ui.country'),"
        "    rama: t('ui.rama'),"
        "    position: t('ui.position'), pace: t('ui.pace'), start: t('ui.start'),"
        "    age: t('ui.age'), rating: t('ui.rating'), role: t('ui.role'),"
        "    score: t('ui.score'), career: t('ui.yourCareer'), honours: t('ui.honours'),"
        "    share: t('ui.share'), again: t('ui.playAgain'),"
        "    board: t('board.title'), boardClear: t('board.clear'), boardNote: t('board.note')"
        "  }));"
        "});"
    ) % (os.path.join(ROOT, "src", "i18n.js"), locale)
    out = subprocess.run([node(), "--input-type=module", "-e", script],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def node():
    for candidate in ("node", "/usr/local/bin/node", "/opt/homebrew/bin/node"):
        if shutil.which(candidate) or os.path.exists(candidate):
            return candidate
    sys.exit("hace falta node para leer src/i18n.js")


def locale_links(current):
    names = {"es": "ES", "fr": "FR", "de": "DE"}
    parts = []
    for locale in LOCALES:
        href = "./" if locale == "es" else f"{locale}/"
        # Desde /fr/ o /de/ el <base> ya apunta a la raíz, así que sirve igual.
        mark = ' aria-current="page"' if locale == current else ""
        parts.append(f'<a href="{href}" hreflang="{locale}"{mark}>{names[locale]}</a>')
    return "".join(parts)


def alternates(current):
    tags = []
    for locale in LOCALES:
        href = "./" if locale == "es" else f"{locale}/"
        tags.append(f'<link rel="alternate" hreflang="{locale}" href="{href}">')
    tags.append('<link rel="alternate" hreflang="x-default" href="./">')
    return "\n".join(tags)


def build():
    template = open(TEMPLATE, encoding="utf8").read()
    shutil.copyfile(os.path.join(ROOT, "site", "styles.css"), os.path.join(ROOT, "styles.css"))

    for locale in LOCALES:
        s = strings_for(locale)
        base = "./" if locale == "es" else "../"
        page = template
        values = {
            "LOCALE": locale,
            "BASE": base,
            "TITLE": s["title"],
            "DESCRIPTION": s["description"],
            "ALTERNATES": alternates(locale),
            "LOCALE_LINKS": locale_links(locale),
            "TAGLINE": s["tagline"],
            "INTRO": s["intro"],
            "L_LASTNAME": s["lastName"],
            "L_LASTNAME_PH": s["lastNamePh"],
            "L_NUMBER": s["number"],
            "L_RAMA": s["rama"],
            "L_HAND": s["hand"],
            "L_COUNTRY": s["country"],
            "L_POSITION": s["position"],
            "L_PACE": s["pace"],
            "L_START": s["start"],
            "L_AGE": s["age"],
            "L_RATING": s["rating"],
            "L_ROLE": s["role"],
            "L_SCORE": s["score"],
            "L_CAREER": s["career"],
            "L_HONOURS": s["honours"],
            "L_SHARE": s["share"],
            "L_AGAIN": s["again"],
            "L_BOARD": s["board"],
            "L_BOARD_CLEAR": s["boardClear"],
            "L_BOARD_NOTE": s["boardNote"],
            "DISCLAIMER": DISCLAIMER[locale],
        }
        for key, value in values.items():
            page = page.replace("{{%s}}" % key, str(value))

        leftover = re.findall(r"\{\{(\w+)\}\}", page)
        if leftover:
            sys.exit(f"faltan valores en la plantilla: {sorted(set(leftover))}")

        target = os.path.join(ROOT, "index.html") if locale == "es" \
            else os.path.join(ROOT, locale, "index.html")
        os.makedirs(os.path.dirname(target), exist_ok=True)
        open(target, "w", encoding="utf8").write(page)
        print(f"  -> {os.path.relpath(target, ROOT)}")

    # GitHub Pages no sirve rutas que empiecen con _ sin esto.
    open(os.path.join(ROOT, ".nojekyll"), "w").close()
    print("  -> .nojekyll, styles.css")


if __name__ == "__main__":
    build()
