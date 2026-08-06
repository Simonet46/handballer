#!/usr/bin/env python3
"""Inyecta la Liga Nacional de Handebol (Brasil) en el universo del juego.

    python3 scripts/add_brazil.py           # aplica
    python3 scripts/add_brazil.py --dry     # sólo informa

No pasa por build_dataset.py a propósito: ese script reconstruye desde la
semilla y pierde los escudos que asignan los pasos posteriores (EHF, ligas
oficiales). Acá sumamos Brasil a lo que ya está, sin tocar nada más.

La Liga Nacional es SEMIPRO: apenas por encima de Argentina. Los dos grandes
(Pinheiros y Taubaté) van con fuerza 3 — nivel de club chico europeo — y el
resto con 2. Prestigio 2: se cobra poco pero se cobra, y se juega el
Panamericano de Clubes.
"""
import argparse
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
GRANDES = {"EC Pinheiros", "Handebol Taubaté"}
LEAGUE_ID = "bra-liga-nacional"
LEAGUE_NAME = "Liga Nacional de Handebol"


def slug(value):
    plain = unicodedata.normalize("NFKD", value)
    plain = "".join(c for c in plain if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


def short_name(name):
    return name if len(name) <= 22 else name[:22]


def abbreviation(name):
    words = [w for w in re.split(r"[\s./-]+", name) if w]
    return "".join(w[0] for w in words[:3]).upper() or "BRA"


def build_league(source, existing_ids):
    payload = json.load(open(os.path.join(DATA, source), encoding="utf8"))
    teams = []
    for club in sorted(payload["clubs"], key=lambda c: c["name"]):
        if not club.get("crest"):
            continue                       # sin escudo no entra
        team_id = slug(club["name"])
        if team_id in existing_ids:
            team_id = f"{team_id}-bra"
        existing_ids.add(team_id)
        teams.append({
            "id": team_id,
            "name": club["name"],
            "short_name": short_name(club["name"]),
            "abbreviation": abbreviation(club["name"]),
            "country": "BRA",
            "flag": "🇧🇷",
            "league": LEAGUE_ID,
            "tier": 1,
            "strength": 3 if club["name"] in GRANDES else 2,
            "crest": club["crest"],
            "crest_source": "cbhb",
            "wiki": None,
        })
    return {
        "id": LEAGUE_ID,
        "name": LEAGUE_NAME,
        "country": "BRA",
        "country_name": "Brasil",
        "confederation": "PATHF",
        "tier": 1,
        "prestige": 2,
        "startable": True,
        "domestic_cup": "Copa Brasil",
        "super_cup": None,
        "amateur": False,
        # Semipro: hay sueldo, pero bajo. El motor lo usa para el sueldo y
        # para que la salida a Europa no sea tan desesperada como la argentina.
        "semipro": True,
        "verified": True,
        "teams": teams,
    }


def apply(target, source, dry):
    path = os.path.join(DATA, target)
    leagues = json.load(open(path, encoding="utf8"))
    leagues = [entry for entry in leagues if entry["id"] != LEAGUE_ID]
    ids = {team["id"] for entry in leagues for team in entry["teams"]}
    league = build_league(source, ids)
    if len(league["teams"]) < 6:
        print(f"  ✗ {target}: sólo {len(league['teams'])} clubes con escudo, no entra")
        return
    leagues.append(league)
    print(f"  ✓ {target}: {LEAGUE_NAME} con {len(league['teams'])} clubes")
    for team in league["teams"]:
        marca = " ★" if team["name"] in GRANDES else ""
        print(f"      {team['name']:26} fuerza {team['strength']}{marca}")
    if not dry:
        with open(path, "w", encoding="utf8") as handle:
            json.dump(leagues, handle, ensure_ascii=False, indent=1)
            handle.write("\n")


def mark_startable(dry):
    path = os.path.join(DATA, "countries.json")
    countries = json.load(open(path, encoding="utf8"))
    for country in countries:
        if country["code"] == "BRA":
            country["startable"] = True
            if LEAGUE_ID not in country.get("pyramid", []):
                country["pyramid"] = [LEAGUE_ID]
    if not dry:
        with open(path, "w", encoding="utf8") as handle:
            json.dump(countries, handle, ensure_ascii=False, indent=1)
            handle.write("\n")
    print("  ✓ Brasil marcado como país jugable")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    apply("leagues.json", "cbhb.json", args.dry)
    apply("leagues-f.json", "cbhb-f.json", args.dry)
    mark_startable(args.dry)
    if args.dry:
        print("\n(--dry: no se escribió nada)")


if __name__ == "__main__":
    main()
