#!/usr/bin/env python3
"""Descarga los escudos de todos los clubes de data/leagues.json.

Fuente: la imagen principal (pageimage) del articulo de Wikipedia de cada club.
Guarda en public/assets/crests/<id>.<ext> y actualiza el campo `crest` del dataset.

    python3 scripts/fetch_crests.py            # solo los que faltan
    python3 scripts/fetch_crests.py --force    # vuelve a bajar todo

IMPORTANTE (licencias): muchos escudos de club son marcas registradas y en
Wikipedia estan bajo "uso legitimo" (non-free), no bajo licencia libre.
Este script deja constancia de la URL de origen en data/crests.json para poder
auditar cada archivo antes de publicar. Ver docs/LICENCIAS.md.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wiki  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRESTS = os.path.join(ROOT, "assets", "crests")
LEAGUES = os.path.join(ROOT, "data", "leagues.json")
MANIFEST = os.path.join(ROOT, "data", "crests.json")
NATIVE_WIKIS = {"da", "hu", "pl", "sv", "no", "nb", "is", "ro", "hr", "sl", "mk",
                "de", "fr", "es", "pt", "ar", "ja", "ko", "it", "nl", "tr"}
UA = {"User-Agent": "handball-copero/1.0 (crest fetch; contact: appidisko@gmail.com)"}


def resolve_all(teams):
    """teams: [(id, 'lang:Titulo')] -> {id: url}"""
    by_lang = defaultdict(list)
    for team_id, reference in teams:
        lang, _, title = reference.partition(":")
        by_lang[lang].append((team_id, title))

    urls = {}
    for lang, items in by_lang.items():
        titles = [title for _, title in items]
        # `pageimages` devuelve la imagen destacada del articulo, que muchas
        # veces es una foto del equipo festejando. Filtramos por nombre.
        found = {title: url for title, url in wiki.pageimage(lang, titles).items()
                 if wiki.looks_like_crest(url)}

        # `pageimages` se saltea los archivos non-free, que es como esta subido
        # casi todo escudo de club. Segundo pase sobre la lista de imagenes.
        pending = [title for title in titles if title not in found]
        if pending:
            picks = wiki.page_images(lang, pending)
            resolved = wiki.image_urls(lang, set(picks.values()))
            for title, file_title in picks.items():
                if file_title in resolved:
                    found[title] = resolved[file_title]

        # Tercer pase: los escudos suelen estar sólo en la wiki del idioma del
        # club (da, hu, pl, sv, no, is, ro, hr...). Saltamos por langlinks.
        pending = [title for title in titles if title not in found]
        if pending and lang == "en":
            crossed = wiki.langlinks(lang, pending, NATIVE_WIKIS)
            by_target = defaultdict(dict)
            for title, links in crossed.items():
                for code, native_title in links.items():
                    by_target[code][native_title] = title
            for code, mapping in by_target.items():
                native = wiki.page_images(code, list(mapping))
                resolved = wiki.image_urls(code, set(native.values()))
                for native_title, file_title in native.items():
                    if file_title in resolved and mapping[native_title] not in found:
                        found[mapping[native_title]] = resolved[file_title]

        for team_id, title in items:
            if title in found:
                urls[team_id] = found[title]
        print(f"  [{lang}] {len(found)}/{len(titles)} articulos con imagen")
    return urls


def download(url, destination, attempts=6):
    last = None
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(request, timeout=60) as response:
                payload = response.read()
            with open(destination, "wb") as handle:
                handle.write(payload)
            return len(payload)
        except urllib.error.HTTPError as error:
            last = error
            if error.code in (429, 503):
                time.sleep(4 * (attempt + 1))
                continue
            raise
        except Exception as error:  # noqa: BLE001
            last = error
            time.sleep(2 * (attempt + 1))
    raise last


def main():
    force = "--force" in sys.argv
    os.makedirs(CRESTS, exist_ok=True)
    leagues = json.load(open(LEAGUES, encoding="utf8"))

    wanted = [(team["id"], team["wiki"])
              for league in leagues for team in league["teams"] if team["wiki"]]
    print(f"clubes con articulo de wikipedia: {len(wanted)}")

    urls = resolve_all(wanted)
    print(f"escudos localizados: {len(urls)}")

    manifest = {}
    if os.path.exists(MANIFEST) and not force:
        manifest = json.load(open(MANIFEST, encoding="utf8"))

    downloaded = skipped = failed = 0
    for team_id, url in sorted(urls.items()):
        extension = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or ".png"
        if extension not in (".png", ".svg", ".jpg", ".jpeg", ".webp", ".gif"):
            extension = ".png"
        path = os.path.join(CRESTS, f"{team_id}{extension}")
        if os.path.exists(path) and not force:
            manifest[team_id] = {"file": f"assets/crests/{team_id}{extension}", "source": url}
            skipped += 1
            continue
        try:
            size = download(url, path)
            # Un escudo raster no pesa 3 MB: si pasa, es una foto que se coló.
            if extension != ".svg" and size > 600_000:
                os.remove(path)
                print(f"  ~ {team_id}: descartado, {size // 1024} KB no es un escudo")
                failed += 1
                continue
            manifest[team_id] = {
                "file": f"assets/crests/{team_id}{extension}",
                "source": url,
                "bytes": size,
            }
            downloaded += 1
            time.sleep(0.9)
        except Exception as error:  # noqa: BLE001 - queremos seguir con el resto
            print(f"  ! {team_id}: {error}")
            failed += 1

    # Sólo tocamos los escudos que administra este script. Los que vienen de
    # una fuente oficial (el tracker de FeMeBal) mandan siempre: son el escudo
    # que el club usa de verdad y no arrastran dudas de licencia.
    for league in leagues:
        for team in league["teams"]:
            # Wikipedia es la última opción: no pisa a una liga oficial.
            if team.get("crest") and team.get("crest_source") not in (None, "wikipedia"):
                continue
            entry = manifest.get(team["id"])
            if entry:
                team["crest"] = entry["file"]
                team["crest_source"] = "wikipedia"

    json.dump(leagues, open(LEAGUES, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(manifest, open(MANIFEST, "w", encoding="utf8"), ensure_ascii=False, indent=1)

    total = sum(len(l["teams"]) for l in leagues)
    with_crest = sum(1 for l in leagues for t in l["teams"] if t["crest"])
    print(f"\ndescargados {downloaded} | ya estaban {skipped} | fallaron {failed}")
    print(f"cobertura: {with_crest}/{total} clubes con escudo "
          f"({with_crest * 100 // max(total, 1)}%)")
    missing = [t["name"] for l in leagues for t in l["teams"] if not t["crest"]]
    print(f"sin escudo ({len(missing)}): usan monograma generado por color")


if __name__ == "__main__":
    main()
