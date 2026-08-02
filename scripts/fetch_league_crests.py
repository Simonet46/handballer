#!/usr/bin/env python3
"""Baja los escudos desde las webs oficiales de cada liga.

    python3 scripts/fetch_league_crests.py
    python3 scripts/fetch_league_crests.py --dry

Las fuentes están en data/logo-sources/*.json, cada una con su procedencia
anotada. Son las federaciones y ligas publicando el escudo que el propio club
les dio, así que es la mejor fuente posible: mejor que Wikipedia en calidad y
mucho mejor en licencia.

Orden de preferencia cuando un club aparece en varias fuentes:
    liga oficial  >  EHF  >  FeMeBal  >  Wikipedia  >  monograma
"""
import argparse
import glob
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRESTS = os.path.join(ROOT, "assets", "crests")
LEAGUES = os.path.join(ROOT, "data", "leagues.json")
MANIFEST = os.path.join(ROOT, "data", "crests.json")
SOURCES = os.path.join(ROOT, "data", "logo-sources")
UA = {"User-Agent": "handballer/1.0 (crest fetch; contact: appidisko@gmail.com)"}

NOISE = {
    "handball", "handbal", "balonmano", "andebol", "bm", "hb", "hc", "sc", "sg",
    "tv", "tsv", "tus", "vfl", "cb", "cd", "club", "de", "del", "la", "el",
    "los", "der", "die", "das", "und", "sport", "verein",
}


def normalize(value):
    value = unicodedata.normalize("NFD", str(value))
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = value.lower().replace("ß", "ss").replace("ø", "o").replace("ł", "l")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(value):
    return {w for w in normalize(value).split() if w not in NOISE and len(w) > 1}


def load_sources():
    index = {}
    for path in sorted(glob.glob(os.path.join(SOURCES, "*.json"))):
        payload = json.load(open(path, encoding="utf8"))
        origin = payload.get("source", os.path.basename(path))
        for name, url in payload["logos"].items():
            index[normalize(name)] = (name, url, origin)
    return index


def match(name, index):
    direct = index.get(normalize(name))
    if direct:
        return direct

    ours = tokens(name)
    if not ours:
        return None
    best, best_score = None, 0.0
    for key, entry in index.items():
        theirs = {w for w in key.split() if w not in NOISE and len(w) > 1}
        shared = ours & theirs
        if not shared:
            continue
        score = len(shared) / len(ours | theirs)
        if len(shared) == 1 and max(len(w) for w in shared) < 6:
            continue
        if score > best_score:
            best, best_score = entry, score
    return best if best_score >= 0.55 else None


def extension_of(url):
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    return ext if ext in (".png", ".svg", ".jpg", ".jpeg", ".webp") else ".png"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    index = load_sources()
    print(f"fuentes oficiales: {len(index)} escudos\n")

    leagues = json.load(open(LEAGUES, encoding="utf8"))
    manifest = json.load(open(MANIFEST, encoding="utf8")) if os.path.exists(MANIFEST) else {}
    os.makedirs(CRESTS, exist_ok=True)

    hit = downloaded = skipped = 0
    for league in leagues:
        if league["country"] == "ARG":
            continue          # ya tiene el escudo oficial de FeMeBal
        found = 0
        for team in league["teams"]:
            entry = match(team["name"], index)
            if not entry:
                continue
            source_name, url, origin = entry
            hit += 1
            found += 1
            if args.dry:
                continue

            path = os.path.join(CRESTS, f"liga-{team['id']}{extension_of(url)}")
            team["crest"] = os.path.relpath(path, ROOT)
            team["crest_source"] = "league"
            manifest[team["id"]] = {"file": team["crest"], "source": url,
                                    "origin": origin, "matched": source_name}
            if os.path.exists(path) and not args.force:
                skipped += 1
                continue
            try:
                request = urllib.request.Request(url, headers=UA)
                open(path, "wb").write(urllib.request.urlopen(request, timeout=60).read())
                downloaded += 1
                time.sleep(0.2)
            except Exception as error:  # noqa: BLE001
                print(f"  ! {team['name']}: {error}")
                team["crest"] = None
                team["crest_source"] = None
        if found:
            print(f"  {league['name'][:32]:34} {found:2}/{len(league['teams']):2}")

    if not args.dry:
        json.dump(leagues, open(LEAGUES, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        json.dump(manifest, open(MANIFEST, "w", encoding="utf8"), ensure_ascii=False, indent=1)

    print(f"\nemparejados {hit} · bajados {downloaded} · ya estaban {skipped}")


if __name__ == "__main__":
    sys.exit(main())
