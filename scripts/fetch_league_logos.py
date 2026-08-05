#!/usr/bin/env python3
"""Baja el logo oficial de cada liga y competición del juego.

    python3 scripts/fetch_league_logos.py            # sólo los que faltan
    python3 scripts/fetch_league_logos.py --force    # vuelve a bajar todo
    python3 scripts/fetch_league_logos.py --dry      # muestra qué encontraría

Los emblemas de competición son la misma categoría que los escudos de club
(marca usada de forma descriptiva en un juego gratuito, ver docs/LICENCIAS.md):
se bajan de la Wikipedia del país, se guarda la URL de origen en
data/competition-logos.json y el juego cae al ícono dorado si falta alguno.

Excepción deliberada: los aros olímpicos NO se bajan. El COI los protege por
estatuto propio (Tratado de Nairobi) y no es una pelea que valga la pena.
"""
import argparse
import json
import os
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "competitions")
MANIFEST = os.path.join(ROOT, "data", "competition-logos.json")
UA = {"User-Agent": "handboludo/1.0 (league logos; contact: appidisko@gmail.com)"}

# Cada entrada: clave del juego -> (wiki, término de búsqueda).
# El wiki del país es donde el logo está bien cargado y actualizado.
TARGETS = {
    # --- ligas masculinas ---
    "fra-starligue": ("fr", "Championnat de France masculin de handball"),
    "fra-proligue": ("fr", "Proligue"),
    "ger-hbl": ("de", "Handball-Bundesliga"),
    "ger-2hbl": ("de", "2. Handball-Bundesliga"),
    "ger-3liga": ("de", "3. Liga (Handball)"),
    "esp-asobal": ("es", "Liga Asobal"),
    "esp-plata": ("es", "División de Honor Plata de balonmano"),
    "esp-primera": ("es", "Primera División Nacional de balonmano"),
    "den-handboldligaen": ("da", "Herrehåndboldligaen"),
    "hun-nbi": ("hu", "Magyar férfi kézilabda-bajnokság (első osztály)"),
    "pol-superliga": ("pl", "Superliga polska w piłce ręcznej mężczyzn"),
    "por-andebol-1": ("pt", "Andebol 1"),
    "swe-handbollsligan": ("sv", "Handbollsligan herr"),
    "nor-ligaen": ("no", "Eliteserien i håndball for menn"),
    "rou-liga-nationala": ("ro", "Liga Națională (handbal masculin)"),
    "slo-liga-nlb": ("sl", "1. slovenska rokometna liga"),
    "cro-premijer-liga": ("hr", "Prva hrvatska rukometna liga"),
    "mkd-super-liga": ("mk", "Македонска ракометна супер лига"),
    "sui-qhl": ("de", "Nationalliga A (Handball)"),
    "aut-hla": ("de", "HLA Meisterliga"),
    "isl-urvalsdeild": ("is", "Olísdeild karla í handknattleik"),
    "qat-league": ("en", "Qatar Handball League"),
    # --- ligas femeninas ---
    "fra-lbe": ("fr", "Championnat de France féminin de handball"),
    "hun-nb1-noi": ("hu", "Magyar női kézilabda-bajnokság (első osztály)"),
    "den-damehandboldligaen": ("da", "Damehåndboldligaen"),
    "rou-liga-florilor": ("ro", "Liga Națională (handbal feminin)"),
    "ger-hbf": ("de", "Handball-Bundesliga (Frauen)"),
    "esp-lgi": ("es", "División de Honor femenina de balonmano"),
    "pol-superliga-kobiet": ("pl", "Superliga polska w piłce ręcznej kobiet"),
    "swe-handbollsligan-dam": ("sv", "Handbollsligan dam"),
    "aut-wha": ("de", "WHA Meisterliga"),
    "cro-prva-liga-z": ("hr", "Prva hrvatska rukometna liga za žene"),
    # --- competiciones internacionales ---
    "champions": ("en", "EHF Champions League"),
    "european-league": ("en", "EHF European League"),
    "worlds": ("en", "IHF World Men's Handball Championship"),
    "euro": ("en", "European Men's Handball Championship"),
    "panamericano": ("es", "Campeonato Panamericano de clubes de balonmano"),
    "asian-clubs": ("en", "Asian Club League Handball Championship"),
}

# Archivo exacto cuando la heurística no acierta pero sabemos cuál es.
FILE_OVERRIDES = {
    "ger-hbl": ("de", "Datei:HBL Logo 01.svg"),
}
# Lo que la heurística trajo mal alguna vez: escudos de club, logos de
# federación y fotos de acción. Si el archivo elegido matchea, se descarta.
BLOCK = ("magdeburg", "cisne", "linz", "ehf_logo", "ehf logo", "jubilant",
         "dhb_logo", "dhb logo", "hsv", "tirol", "ferlach", "nantes")

GOOD = (".png", ".svg", ".jpg", ".jpeg", ".webp")
MAX_BYTES = 900_000

# Archivos que aparecen en todos los artículos y nunca son el logo buscado.
JUNK = (
    "commons-logo", "disambig", "pictogram", "red pog", "location map",
    "flag of", "flagge", "bandera", "drapeau", "zastava", "wikidata",
    "edit-", "folder", "question", "ambox", "crystal", "gnome", "symbol",
    "star full", "loudspeaker", "padlock", "wiktionary", "portal",
)
# Palabras que marcan un logo (en los idiomas que tocamos).
LOGO_WORDS = ("logo", "logotipo", "wappen", "emblem", "badge", "znak", "címer")


def api(wiki, params):
    url = f"https://{wiki}.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
        {**params, "format": "json", "formatversion": "2"})
    request = urllib.request.Request(url, headers=UA)
    for attempt in range(4):
        try:
            return json.loads(urllib.request.urlopen(request, timeout=45).read())
        except Exception as error:  # noqa: BLE001
            if attempt == 3:
                print(f"    ! api {wiki}: {error}")
                return {}
            time.sleep(1.5 * (attempt + 1))
    return {}


def tokens(text):
    plain = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in text.lower())
    return {word for word in plain.split() if len(word) >= 4}


def score_file(filename, wanted):
    """Cuánto se parece este archivo al logo de la competición que buscamos."""
    low = filename.lower()
    if any(bad in low for bad in JUNK):
        return -1
    if not low.endswith(GOOD):
        return -1
    score = 0
    if any(word in low for word in LOGO_WORDS):
        score += 4
    score += 2 * len(tokens(filename) & wanted)
    if low.endswith(".svg"):
        score += 1          # vectorial: se rasteriza nítido a cualquier tamaño
    return score


# Licencias que sí podemos usar en un juego. El resto (los "fair use" que
# cada wiki sube para ilustrar su artículo) no es transferible acá.
FREE = ("cc0", "public domain", "cc by", "cc-by", "cc sa", "cc-sa", "pd-",
        "dominio público", "gemeinfrei", "domaine public")


def is_free(license_name):
    low = (license_name or "").lower()
    return any(token in low for token in FREE)


def commons_thumb(filename):
    """Resuelve un archivo de Commons a PNG de 512 px + su licencia."""
    info = api("commons", {"action": "query", "titles": f"File:{filename}",
                           "prop": "imageinfo", "iiprop": "url|extmetadata",
                           "iiurlwidth": 512})
    for entry in ((info.get("query") or {}).get("pages") or []):
        for image in (entry.get("imageinfo") or []):
            url = image.get("thumburl") or image.get("url")
            meta = image.get("extmetadata") or {}
            if url:
                return url, (meta.get("LicenseShortName") or {}).get("value", "?")
    return None, None


def wikidata_logo(wiki, article):
    """El logo declarado como propiedad oficial (P154) del artículo."""
    props = api(wiki, {"action": "query", "titles": article, "prop": "pageprops"})
    qid = None
    for entry in ((props.get("query") or {}).get("pages") or []):
        qid = (entry.get("pageprops") or {}).get("wikibase_item")
    if not qid:
        return None, None
    try:
        request = urllib.request.Request(
            f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json", headers=UA)
        data = json.loads(urllib.request.urlopen(request, timeout=45).read())
    except Exception:  # noqa: BLE001
        return None, None
    claims = (data.get("entities", {}).get(qid) or {}).get("claims", {})
    for prop in ("P154", "P8972"):    # logo oficial, ícono
        for claim in claims.get(prop, []):
            value = (claim.get("mainsnak", {}).get("datavalue") or {}).get("value")
            if isinstance(value, str):
                return commons_thumb(value)
    return None, None


def find_logo(wiki, title):
    """Devuelve (url PNG, artículo, licencia) del logo de la competición.

    Título exacto (siguiendo redirecciones) para no terminar en el artículo
    de otro equipo. Primero el logo declarado en Wikidata (libre, de Commons);
    si no hay, el mejor archivo del propio artículo. La licencia se registra
    siempre en el manifiesto para poder auditar y filtrar después.
    """
    override = FILE_OVERRIDES.get(getattr(find_logo, "_key", None))
    if override:
        ov_wiki, ov_file = override
        info = api(ov_wiki, {"action": "query", "titles": ov_file,
                             "prop": "imageinfo", "iiprop": "url|extmetadata",
                             "iiurlwidth": 512})
        for entry in ((info.get("query") or {}).get("pages") or []):
            for image in (entry.get("imageinfo") or []):
                src = image.get("thumburl") or image.get("url")
                meta = image.get("extmetadata") or {}
                if src:
                    return src, ov_file, (meta.get("LicenseShortName") or {}).get("value", "?")

    resolved = api(wiki, {"action": "query", "titles": title,
                          "prop": "pageprops", "redirects": 1})
    pages = (resolved.get("query") or {}).get("pages") or []
    if not pages or pages[0].get("missing"):
        return None, None, None
    real_title = pages[0].get("title", title)

    url, license_name = wikidata_logo(wiki, real_title)
    if url:
        return url, real_title, license_name

    wanted = tokens(real_title) | tokens(title)
    page = api(wiki, {"action": "query", "titles": real_title,
                      "prop": "images", "imlimit": 60})
    files = [item["title"]
             for entry in ((page.get("query") or {}).get("pages") or [])
             for item in (entry.get("images") or [])]
    ranked = [(sc, f) for sc, f in sorted(((score_file(f, wanted), f) for f in files),
                                          reverse=True)
              if not any(bad in f.lower() for bad in BLOCK)]
    # 4 = tiene palabra de logo. Sin eso no lo tocamos.
    if not ranked or ranked[0][0] < 4:
        return None, None, None

    info = api(wiki, {"action": "query", "titles": ranked[0][1],
                      "prop": "imageinfo", "iiprop": "url|extmetadata",
                      "iiurlwidth": 512})
    for entry in ((info.get("query") or {}).get("pages") or []):
        for image in (entry.get("imageinfo") or []):
            src = image.get("thumburl") or image.get("url")
            meta = image.get("extmetadata") or {}
            if src:
                return src, real_title, (meta.get("LicenseShortName") or {}).get("value", "?")
    return None, None, None


def download(key, url, force=False):
    base = os.path.join(OUT_DIR, key)
    target = base + ".png"
    if os.path.exists(target) and not force:
        return target, "ya estaba"
    request = urllib.request.Request(url, headers=UA)
    payload = urllib.request.urlopen(request, timeout=60).read()
    if len(payload) > MAX_BYTES:
        return None, f"pesa {len(payload)//1024} KB, parece foto"

    import io  # noqa: PLC0415
    from PIL import Image  # noqa: PLC0415
    try:
        image = Image.open(io.BytesIO(payload)).convert("RGBA")
        # Alto fijo: en el juego se ven a 24-40 px, 256 alcanza y sobra.
        if image.height > 256:
            ratio = 256 / image.height
            image = image.resize((max(1, round(image.width * ratio)), 256), Image.LANCZOS)
        image.save(target, "PNG", optimize=True)
    except Exception as error:  # noqa: BLE001
        return None, f"no se pudo convertir: {error}"
    return target, f"{os.path.getsize(target)//1024} KB"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry", action="store_true")
    parser.add_argument("--only", help="una sola clave, para probar")
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST, encoding="utf8"))

    items = TARGETS.items()
    if args.only:
        items = [(args.only, TARGETS[args.only])]

    found = missing = 0
    for key, (wiki, term) in items:
        if key in manifest and os.path.exists(os.path.join(OUT_DIR, key + ".png")) and not args.force:
            found += 1
            continue
        find_logo._key = key
        url, title, license_name = find_logo(wiki, term)
        if not url:
            print(f"  ✗ {key:26} sin logo en {wiki}.wikipedia ({term})")
            missing += 1
            continue
        if args.dry:
            print(f"  · {key:26} {title[:32]:34} [{license_name}] {url.split('/')[-1][:44]}")
            found += 1
            continue
        path, note = download(key, url, args.force)
        if not path:
            print(f"  ✗ {key:26} {note}")
            missing += 1
            continue
        manifest[key] = {"file": f"assets/competitions/{key}.png",
                         "source": url, "wiki": f"{wiki}:{title}",
                         "license": license_name}
        print(f"  ✓ {key:26} {title[:34]:36} [{(license_name or '?')[:14]:14}] {note}")
        found += 1
        time.sleep(0.4)

    if not args.dry:
        json.dump(dict(sorted(manifest.items())), open(MANIFEST, "w", encoding="utf8"),
                  ensure_ascii=False, indent=1)
    print(f"\nlogos: {found} listos · {missing} sin encontrar")


if __name__ == "__main__":
    main()
