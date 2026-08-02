#!/usr/bin/env python3
"""Reemplaza los clubes sin escudo por clubes reales del mismo país que sí lo tienen.

    python3 scripts/fill_from_ehf.py --dry
    python3 scripts/fill_from_ehf.py

Las divisiones bajas de nuestro seed salieron de Wikipedia y muchos de esos
clubes no tienen escudo en ninguna fuente pública. Pero la EHF tiene ~466
clubes europeos con escudo oficial, y de varios países le sobran respecto de
los que estábamos usando: son equipos igual de reales que juegan en esa misma
liga o en la de al lado.

Cambiar un club por otro del mismo país no le quita verdad al juego y sí le
saca los huecos. Lo que se agrega queda anotado en data/league-fill.json.

Corre después de los fetchers de escudos y antes de prune_crestless.
"""
import argparse
import json
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_ehf_crests as ehf  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEAGUES = os.path.join(ROOT, "data", "leagues.json")
MANIFEST = os.path.join(ROOT, "data", "crests.json")
FILL_LOG = os.path.join(ROOT, "data", "league-fill.json")
CRESTS = os.path.join(ROOT, "assets", "crests")
UA = {"User-Agent": "handballer/1.0 (crest fetch; contact: appidisko@gmail.com)"}

COUNTRY_NAMES = {
    "DEN": "Denmark", "HUN": "Hungary", "POL": "Poland", "POR": "Portugal",
    "SWE": "Sweden", "NOR": "Norway", "ROU": "Romania", "SLO": "Slovenia",
    "CRO": "Croatia", "MKD": "North Macedonia", "SUI": "Switzerland",
    "AUT": "Austria", "ISL": "Iceland", "ESP": "Spain", "FRA": "France",
    "GER": "Germany", "QAT": "Qatar",
}


def slug(value):
    import re
    import unicodedata
    value = unicodedata.normalize("NFD", str(value))
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    value = value.lower().replace("ß", "ss").replace("ø", "o").replace("ł", "l")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def similar(name, existing_tokens):
    """¿Es el mismo club con otro patrocinador delante?"""
    ours = ehf.tokens(name)
    if not ours:
        return True
    for theirs in existing_tokens:
        shared = ours & theirs
        if not shared:
            continue
        if len(shared) / len(ours | theirs) >= 0.45:
            return True
        # Un nombre propio largo compartido ya alcanza: "Tatabanya", "Mielec".
        if any(len(w) >= 7 for w in shared):
            return True
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()

    payload = ehf.load_ehf()
    leagues = json.load(open(LEAGUES, encoding="utf8"))
    manifest = json.load(open(MANIFEST, encoding="utf8")) if os.path.exists(MANIFEST) else {}
    os.makedirs(CRESTS, exist_ok=True)

    taken = [ehf.tokens(t["name"]) for l in leagues for t in l["teams"]]
    log = {}
    added = removed = 0

    for league in leagues:
        holes = [t for t in league["teams"] if not t.get("crest")]
        if not holes:
            continue
        country = COUNTRY_NAMES.get(league["country"])
        if not country:
            continue

        pool = []
        for club in payload["clubMen"]:
            logo = club.get("logoBig") or club.get("logoSmall")
            name = club.get("fullName")
            if not logo or not name:
                continue
            if club.get("countryName") != country and club.get("nationAbbreviation") != league["country"]:
                continue
            if similar(name, taken):
                continue
            pool.append((name, logo))
            taken.append(ehf.tokens(name))
        if not pool:
            continue

        use = pool[:len(holes)]
        print(f"  {league['name'][:30]:32} −{len(holes)} sin escudo, +{len(use)} de la EHF")
        for hole, (name, logo) in zip(holes, use):
            print(f"      {hole['name'][:28]:30} → {name[:34]}")

        keep = [t for t in league["teams"] if t.get("crest")]
        for hole, (name, logo) in zip(holes, use):
            team_id = slug(name)
            entry = {
                **hole, "id": team_id, "name": name,
                "short_name": name.split(" (")[0][:22],
                "abbreviation": "".join(w[0] for w in name.split() if w[:1].isalpha())[:3].upper(),
                "crest": f"assets/crests/ehf-{team_id}.jpg",
                "crest_source": "ehf", "wiki": None,
            }
            if not args.dry:
                path = os.path.join(ROOT, entry["crest"])
                if not os.path.exists(path):
                    try:
                        request = urllib.request.Request(logo, headers=UA)
                        open(path, "wb").write(urllib.request.urlopen(request, timeout=60).read())
                        time.sleep(0.2)
                    except Exception as error:  # noqa: BLE001
                        print(f"      ! {name}: {error}")
                        continue
                manifest[team_id] = {"file": entry["crest"], "source": logo,
                                     "origin": "EHF (relleno de división baja)"}
            keep.append(entry)
            log.setdefault(league["id"], []).append({"out": hole["name"], "in": name})
            added += 1
        removed += len(holes)
        league["teams"] = keep

    print(f"\nreemplazados {removed} clubes sin escudo por {added} con escudo oficial")
    if args.dry:
        print("(--dry: no se escribió nada)")
        return 0

    json.dump(leagues, open(LEAGUES, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(manifest, open(MANIFEST, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(log, open(FILL_LOG, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("-> data/leagues.json · data/crests.json · data/league-fill.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
