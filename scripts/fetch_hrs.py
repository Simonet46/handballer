#!/usr/bin/env python3
"""Importa la Premijer liga y la 1. HRL Žene desde la API del HRS (Croacia).

    python3 scripts/fetch_hrs.py                # rama masculina
    python3 scripts/fetch_hrs.py --rama F       # femenina
    python3 scripts/fetch_hrs.py --crests       # además baja los escudos

El sitio del Hrvatski rukometni savez (hrs.hr) es un WordPress que incrusta
un widget de livescore. El script del widget (api.hrs.hr/score/scripts/home.js)
declara los endpoints reales:

    https://api.hrs.hr/ed/competition/{id}      # torneo completo, JSON abierto
    https://www.sportinfocentar2.com/coman/logo/{k}.png   # escudo oficial

Cada `natjecanje` del sitio es un id de competición. Los de la temporada
2025/26 (la última completa) son 1632 (Paket24 Premijer liga) y 1629
(1. HRL Žene). El torneo trae las ligas internas (grupos, liguillas y
playoffs) con tabla, y cada fila de tabla trae `k`: el código de club que
nombra su escudo en sportinfocentar2.

La pirámide croata completa, para cuando haga falta bajar más:
    T1 M  Paket24 Premijer liga (16 en dos grupos + liguillas)
    T2 M  1. HRL Sjever / 1. HRL Jug
    T3 M  2. HRL Istok / Jug / Sjever / Zapad
    T1 F  1. HRL Žene (14, todos contra todos)
    T2 F  2. HRL Sjever / Zapad / Jug
"""
import argparse
import json
import os
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.hrs.hr/ed"
LOGO = "https://www.sportinfocentar2.com/coman/logo"
CRESTS = os.path.join(ROOT, "assets", "crests")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "hrs")
UA = {"User-Agent": "handboludo/1.0 (dataset build; contact: appidisko@gmail.com)",
      "Accept": "application/json"}

COMPETITIONS = {
    "M": {"id": 1632, "season": "2025/26", "name": "Paket24 Premijer liga"},
    "F": {"id": 1629, "season": "2025/26", "name": "1. HRL Žene"},
}

# La API publica el nombre con el sponsor pegado ("Sesvete Triglav
# Osiguranje", "Metković-Zalmo", "Bjelin Spačva..."). Acá va el nombre real
# del club, con su prefijo (RK/MRK/HRK/GRK masculinos, ŽRK femeninos).
PRETTY = {
    # --- Premijer liga 2025/26 ---
    1607: "RK Zagreb",
    1514: "RK Nexe",
    1405: "MRK Sesvete",
    1390: "HRK Gorica",
    1407: "MRK Trogir",
    1398: "MRK Dugo Selo",
    1540: "RK Poreč",
    1397: "MRK Čakovec",
    1550: "RK Rudar",
    1502: "RK Metković",
    1528: "RK Osijek",
    1569: "RK Spačva Vinkovci",
    1608: "RK Zamet",
    1511: "RK Moslavina",
    1388: "GRK Varaždin 1930",
    1584: "RK Umag",
    # --- 1. HRL Žene 2025/26 ---
    1537: "RK Podravka",
    1491: "RK Lokomotiva Zagreb",
    1732: "ŽRK Zrinski Čakovec",
    1643: "ŽRK Bjelovar",
    1434: "ŽRK Dalmatinka Ploče",
    1706: "ŽRK Rudar Labin",
    1673: "ŽRK Koka Varaždin",
    1714: "ŽRK Split 2010",
    1730: "ŽRK Zamet",
    1694: "ŽRK Osijek",
    1710: "ŽRK Sinj",
    1557: "ŽRK Sesvete",
    1644: "RK Brod",
    1655: "ŽRK Dugo Selo '55",
}


def fetch_json(url, cache_name):
    os.makedirs(CACHE, exist_ok=True)
    cached = os.path.join(CACHE, cache_name)
    if os.path.exists(cached):
        return json.load(open(cached, encoding="utf8"))
    request = urllib.request.Request(url, headers=UA)
    payload = json.loads(urllib.request.urlopen(request, timeout=30).read())
    json.dump(payload, open(cached, "w", encoding="utf8"), ensure_ascii=False)
    time.sleep(0.5)
    return payload


def final_order(competition):
    """Orden final de la temporada, del campeón para abajo.

    En la Premijer liga el orden sale de los playoffs y las liguillas, en
    este orden: Doigravanje za prvaka (1-2), Doigravanje za Europu (3-4),
    resto de la Liga za prvaka (5-6) y Liga za ostanak (7-16). En la liga
    femenina alcanza con la tabla única.
    """
    stages = ["Doigravanje za prvaka", "Doigravanje za Europu",
              "Liga za prvaka", "Liga za ostanak"]
    by_name = {league["naziv"]: league for league in competition["lige"]}
    ordered, seen = [], set()
    plan = [by_name[n] for n in stages if n in by_name] or competition["lige"]
    for league in plan:
        for row in sorted(league.get("tablica") or [], key=lambda r: r["por"]):
            if row["k"] not in seen:
                seen.add(row["k"])
                ordered.append(row)
    return ordered


def fetch_branch(rama, with_crests, dry):
    meta = COMPETITIONS[rama]
    competition = fetch_json(f"{API}/competition/{meta['id']}",
                             f"competition-{meta['id']}.json")
    clubs = []
    for rank, row in enumerate(final_order(competition), start=1):
        code = row["k"]
        name = PRETTY.get(code)
        if not name:
            print(f"  ! club {code} «{row['n']}» sin nombre curado, revisar PRETTY")
            name = row["n"]
        crest = f"assets/crests/hrs-{code}.png"
        clubs.append({
            "hrs_id": code,
            "name": name,
            "raw_name": row["n"],
            "rank": rank,
            "crest_url": f"{LOGO}/{code}.png",
            "crest": crest,
        })
        if with_crests and not dry:
            target = os.path.join(ROOT, crest)
            if not os.path.exists(target) or os.path.getsize(target) == 0:
                # sportinfocentar2 devuelve 406 si pedís JSON: acá va sin Accept.
                request = urllib.request.Request(
                    clubs[-1]["crest_url"], headers={"User-Agent": UA["User-Agent"]})
                payload = urllib.request.urlopen(request, timeout=30).read()
                if payload:
                    open(target, "wb").write(payload)
                time.sleep(0.5)

    out = {
        "source": "api.hrs.hr (Hrvatski rukometni savez, widget de livescore)",
        "branch": rama,
        "competition": meta["name"],
        "season": meta["season"],
        "clubs": clubs,
    }
    suffix = "-f" if rama == "F" else ""
    path = os.path.join(ROOT, "data", f"hrs{suffix}.json")
    if dry:
        print(f"  (dry) {meta['name']}: {len(clubs)} clubes")
    else:
        json.dump(out, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print(f"  ✓ {os.path.relpath(path, ROOT)}: {len(clubs)} clubes")
    for club in clubs:
        print(f"    {club['rank']:>2}. {club['name']}  ({club['raw_name']})")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rama", choices=["M", "F"], default=None,
                        help="una sola rama; por defecto van las dos")
    parser.add_argument("--crests", action="store_true", help="baja los escudos")
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    for rama in ([args.rama] if args.rama else ["M", "F"]):
        fetch_branch(rama, args.crests, args.dry)


if __name__ == "__main__":
    main()
