#!/usr/bin/env python3
"""Baja los escudos oficiales desde la API pública de la EHF.

    python3 scripts/fetch_ehf_crests.py            # sólo los que faltan
    python3 scripts/fetch_ehf_crests.py --dry      # muestra el emparejamiento y no baja nada
    python3 scripts/fetch_ehf_crests.py --force    # vuelve a bajar todo

eurohandball.com es un SPA que consume `/umbraco/api/homeofhandballapi/GetTeams`:
un JSON con ~670 clubes masculinos europeos, de los cuales ~466 traen el escudo
oficial en el CDN de la EHF. Es la mejor fuente que hay: es la federación
europea publicando el escudo que el propio club le dio.

El emparejamiento con nuestro dataset es por nombre normalizado. Handball tiene
mil formas de escribir el mismo club ("Rhein-Neckar Löwen" / "Die Löwen",
"Barça" / "FC Barcelona"), así que hay alias a mano abajo.
"""
import argparse
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
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "ehf-teams.json")
API = "https://www.eurohandball.com/umbraco/api/homeofhandballapi/GetTeams"
UA = {"User-Agent": "handballer/1.0 (crest fetch; contact: appidisko@gmail.com)"}

# Palabras que no identifican al club y sólo ensucian la comparación.
NOISE = {
    "handball", "handbal", "haandbold", "handbold", "handboll", "handball1",
    "balonmano", "andebol", "handebol", "rukomet", "rokomet", "piłka", "kezilabda",
    "hb", "hc", "hk", "sc", "sg", "sv", "tv", "tsv", "tus", "vfl", "bm", "cb",
    "kc", "rk", "mks", "kpr", "if", "ik", "fc", "cf", "cd", "ac", "as", "us",
    "club", "clube", "club", "team", "sport", "sports", "sportif", "verein",
    "de", "del", "la", "le", "les", "el", "los", "das", "der", "die", "den",
    "og", "und", "and", "y", "e", "i", "ve",
}

# Casos que el emparejamiento automático no saca. Nombre nuestro -> nombre EHF.
ALIASES = {
    "Barça": "FC Barcelona",
    "Barça B": "FC Barcelona",
    "TVB Stuttgart": "TVB 1898 Stuttgart",
    "HSV Hamburg": "Handball Sport Verein Hamburg",
    "Telekom Veszprém": "Veszprém HC",
    "Pick Szeged": "OTP Bank - PICK Szeged",
    "Industria Kielce": "Industria Kielce",
    "Orlen Wisła Płock": "Orlen Wisla Plock",
    "TSV Hannover-Burgdorf": "Recken - TSV Hannover-Burgdorf",
    "Abanca Ademar León": "Abanca Ademar Leon",
    "Fraikin BM Granollers": "Fraikin BM. Granollers",
    "Bidasoa Irun": "Bidasoa Irun",
    "GOG": "GOG",
    "Aalborg Håndbold": "Aalborg Handbold",
    "Kolstad Håndball": "Kolstad Handball",
    "Celje Pivovarna Laško": "RK Celje Pivovarna Lasko",
    "RK Nexe Našice": "RK Nexe",
    "Eurofarm Pelister": "Eurofarm Pelister",
    "Dinamo București": "CS Dinamo Bucuresti",
    "Fivers Margareten": "Fivers Margareten",
    "Alpla HC Hard": "Alpla HC Hard",
    "Kadetten Schaffhausen": "Kadetten Schaffhausen",
    "Sporting CP": "Sporting CP",
    "SL Benfica": "SL Benfica",
    "FC Porto": "FC Porto",
    "ABC Braga": "ABC/UMinho",
    "Al Ahly SC": "Al Ahly",
    "Zamalek SC": "Zamalek SC",
}



# Cuanto más alto, más confiable: no lo pisa una fuente peor.
CREST_PRIORITY = {"league": 4, "femebal": 4, "ehf": 3, "wikipedia": 1, None: 0}


def better_than(new_source, team):
    return CREST_PRIORITY.get(new_source, 0) >= CREST_PRIORITY.get(team.get("crest_source"), 0) \
        or not team.get("crest")


def normalize(value):
    value = unicodedata.normalize("NFD", str(value))
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = value.lower().replace("ß", "ss").replace("ø", "o").replace("æ", "ae").replace("ł", "l")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(value):
    return {word for word in normalize(value).split() if word not in NOISE and len(word) > 1}


def load_ehf(force=False):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    fresh = os.path.exists(CACHE) and time.time() - os.path.getmtime(CACHE) < 86400 * 7
    if fresh and not force:
        return json.load(open(CACHE, encoding="utf8"))
    request = urllib.request.Request(API, headers={**UA, "Accept": "application/json"})
    data = json.load(urllib.request.urlopen(request, timeout=90))
    json.dump(data, open(CACHE, "w", encoding="utf8"), ensure_ascii=False)
    return data


def index_clubs(payload):
    """{nombre normalizado: (nombre EHF, url del escudo)} incluyendo nombres viejos."""
    index = {}
    for club in payload.get("clubMen", []):
        logo = club.get("logoBig") or club.get("logoSmall")
        if not logo:
            continue
        names = [club.get("fullName"), club.get("name"), club.get("shortName")]
        names += [n.get("name") if isinstance(n, dict) else n for n in club.get("formerNames") or []]
        entry = (club.get("fullName") or club.get("name"), logo, club.get("countryName"))
        for name in names:
            if not name:
                continue
            index.setdefault(normalize(name), entry)
    return index


def match(name, index):
    """Exacto primero; si no, el que comparta más palabras significativas."""
    direct = index.get(normalize(ALIASES.get(name, name)))
    if direct:
        return direct, "exacto"

    ours = tokens(name)
    if not ours:
        return None, None

    best, best_score = None, 0.0
    for key, entry in index.items():
        theirs = {w for w in key.split() if w not in NOISE and len(w) > 1}
        if not theirs:
            continue
        shared = ours & theirs
        if not shared:
            continue
        score = len(shared) / len(ours | theirs)
        # Una sola palabra en común sólo vale si es larga y distintiva.
        if len(shared) == 1 and max(len(w) for w in shared) < 6:
            continue
        if score > best_score:
            best, best_score = entry, score
    return (best, f"parecido {best_score:.2f}") if best_score >= 0.5 else (None, None)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true", help="mostrar el emparejamiento sin bajar nada")
    parser.add_argument("--force", action="store_true", help="volver a bajar todo")
    args = parser.parse_args()

    payload = load_ehf(args.force)
    index = index_clubs(payload)
    print(f"EHF: {len(payload.get('clubMen', []))} clubes, {len(index)} nombres con escudo\n")

    leagues = json.load(open(LEAGUES, encoding="utf8"))
    manifest = json.load(open(MANIFEST, encoding="utf8")) if os.path.exists(MANIFEST) else {}
    os.makedirs(CRESTS, exist_ok=True)

    matched = downloaded = skipped = 0
    missing = []

    for league in leagues:
        # Argentina ya tiene su escudo oficial de FeMeBal.
        if league["country"] == "ARG":
            continue
        found_here = 0
        for team in league["teams"]:
            if not better_than("ehf", team):
                matched += 1
                skipped += 1
                continue
            entry, how = match(team["name"], index)
            if not entry:
                missing.append(f"{team['name']} ({league['name']})")
                continue
            matched += 1
            found_here += 1
            ehf_name, url, _country = entry
            if args.dry:
                if how != "exacto":
                    print(f"    ~ {team['name'][:30]:32} -> {ehf_name[:34]:36} [{how}]")
                continue

            path = os.path.join(CRESTS, f"ehf-{team['id']}.jpg")
            team["crest"] = f"assets/crests/ehf-{team['id']}.jpg"
            team["crest_source"] = "ehf"
            manifest[team["id"]] = {"file": team["crest"], "source": url, "ehf_name": ehf_name}
            if os.path.exists(path) and not args.force:
                skipped += 1
                continue
            try:
                request = urllib.request.Request(url, headers=UA)
                open(path, "wb").write(urllib.request.urlopen(request, timeout=60).read())
                downloaded += 1
                time.sleep(0.25)
            except Exception as error:  # noqa: BLE001
                print(f"  ! {team['name']}: {error}")
                team["crest"] = None
                team["crest_source"] = None
        print(f"  {league['name'][:30]:32} {found_here:2}/{len(league['teams']):2}")

    if not args.dry:
        json.dump(leagues, open(LEAGUES, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        json.dump(manifest, open(MANIFEST, "w", encoding="utf8"), ensure_ascii=False, indent=1)

    european = sum(len(l["teams"]) for l in leagues if l["country"] != "ARG")
    print(f"\nemparejados {matched}/{european} · bajados {downloaded} · ya estaban {skipped}")
    if missing:
        print(f"\nsin escudo en la EHF ({len(missing)}):")
        for name in missing[:40]:
            print("   ", name)
        if len(missing) > 40:
            print(f"    … y {len(missing) - 40} más")


if __name__ == "__main__":
    sys.exit(main())
