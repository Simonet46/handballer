#!/usr/bin/env python3
"""Genera data/*.json a partir del seed curado.

    python3 scripts/build_dataset.py
"""
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seed_handball import CONFEDERATIONS, COUNTRIES, LEAGUES  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def slug(value):
    value = unicodedata.normalize("NFD", str(value))
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = value.lower().replace("ß", "ss").replace("ø", "o").replace("æ", "ae")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def abbreviation(name):
    words = [w for w in re.split(r"[\s/'-]+", name) if w]
    letters = "".join(w[0] for w in words if w[0].isalpha()).upper()
    return (letters or slug(name)[:3].upper())[:3]


def short_name(name):
    noise = r"^(Club |CS |CSM |CSA |SC |RK |HC |HK |BM |AC |CD |EC |SG |TSV |TV |TuS |VfL )"
    trimmed = re.sub(noise, "", name)
    return trimmed.split(" (")[0][:22] or name


# Cuántos escalones de FeMeBal entran al juego y con qué fuerza global.
# Aun el mejor club argentino está lejos del nivel europeo: por eso el techo es 3.
# Eso es justamente lo que hace que la carrera de un argentino sea emigrar.
# Las divisiones 1ª y 2ª se fusionan: sacando los equipos B, la 1ª sola queda
# en 6 clubes y no alcanza para ser un escalón jugable.
FEMEBAL_LEAGUES = {
    1: dict(id="arg-liga-honor", name="Liga de Honor", tier=1, strength=2),
    2: dict(id="arg-liga-honor-plata", name="Liga de Honor Plata", tier=2, strength=2),
    3: dict(id="arg-primera", name="1ª División", tier=3, strength=1),
    4: dict(id="arg-primera", name="1ª División", tier=3, strength=1),
}

# Los clubes que de verdad pelean la Liga de Honor. El resto del país está un
# escalón abajo; ninguno llega al nivel de un club europeo de media tabla.
ARG_ELITE = {
    "C.A. River Plate", "S.A.G. Villa Ballester", "S.E.D.A.L.O.",
    "Ferro Carril Oeste", "Dorrego Handball", "Municipalidad de Vicente López",
    "Nuestra Señora de Luján", "S.A.G. Polvorines",
}
RESERVE_TEAM = re.compile(r"\s+[BCD]$")


def femebal_leagues():
    """Reemplaza las ligas argentinas por el padrón real de data/femebal.json."""
    path = os.path.join(DATA, "femebal.json")
    if not os.path.exists(path):
        return None
    payload = json.load(open(path, encoding="utf8"))
    crests = {}
    merged = {}

    for division in payload["divisions"]:
        config = FEMEBAL_LEAGUES.get(division.get("tier"))
        if not config:
            continue
        # Los equipos B/C son filiales del mismo club: sirven para el fixture
        # real pero no como destino de una carrera.
        clubs = [c for c in division["clubs"] if not RESERVE_TEAM.search(c["name"])]
        entry = merged.setdefault(config["id"], dict(
            id=config["id"], name=config["name"], country="ARG",
            tier=config["tier"], teams=[], verified=True))
        known = {name for name, _, _ in entry["teams"]}
        for club in sorted(clubs, key=lambda c: c["name"]):
            if club["name"] in known:
                continue
            strength = 3 if club["name"] in ARG_ELITE else config["strength"]
            entry["teams"].append((club["name"], strength, None))
            if club.get("crest"):
                crests[club["name"]] = club["crest"]

    out = sorted(merged.values(), key=lambda e: e["tier"])
    return out, crests, payload["season"]


# Cuánto vale competir en cada liga. Manda tres cosas: los títulos que dan,
# si desde ahí te llama tu selección, y cuánto suma haber llegado hasta ahí.
#   5  las tres grandes de Europa
#   4  primeras divisiones fuertes
#   3  el resto de las primeras europeas
#   2  segundas divisiones
#   1  terceras y el amateur argentino
PRESTIGE = {
    "fra-starligue": 5, "ger-hbl": 5, "esp-asobal": 5,
    "den-handboldligaen": 4, "hun-nbi": 4, "pol-superliga": 4,
    "fra-proligue": 2, "ger-2hbl": 2, "esp-plata": 2,
    "ger-3liga": 1, "esp-primera": 1,
    "arg-liga-honor": 1, "arg-liga-honor-plata": 1, "arg-primera": 1,
}
DEFAULT_PRESTIGE = 3


def prestige_of(league_id, tier, country):
    if league_id in PRESTIGE:
        return PRESTIGE[league_id]
    if country == "ARG":
        return 1
    return {1: DEFAULT_PRESTIGE, 2: 2}.get(tier, 1)


def build():
    leagues = []
    seen_team_ids = set()
    femebal = femebal_leagues()
    sources = list(LEAGUES)
    femebal_crests = {}
    if femebal:
        replacements, femebal_crests, season = femebal
        sources = [entry for entry in sources if entry["country"] != "ARG"] + replacements
        print(f"FeMeBal {season['name']}: {len(replacements)} divisiones, "
              f"{sum(len(r['teams']) for r in replacements)} clubes (padrón oficial)")

    for entry in sources:
        country = COUNTRIES[entry["country"]]
        teams = []
        for name, strength, wiki in entry["teams"]:
            team_id = slug(name)
            if team_id in seen_team_ids:
                team_id = f"{team_id}-{entry['country'].lower()}"
            seen_team_ids.add(team_id)
            teams.append({
                "id": team_id,
                "name": name,
                "short_name": short_name(name),
                "abbreviation": abbreviation(name),
                "country": entry["country"],
                "flag": country["flag"],
                "league": entry["id"],
                "tier": entry["tier"],
                "strength": strength,
                "crest": femebal_crests.get(name),
                "crest_source": "femebal" if femebal_crests.get(name) else None,
                "wiki": wiki,
            })
        leagues.append({
            "id": entry["id"],
            "name": entry["name"],
            "country": entry["country"],
            "country_name": country["name"],
            "confederation": country["conf"],
            "tier": entry["tier"],
            "prestige": prestige_of(entry["id"], entry["tier"], entry["country"]),
            "startable": bool(country.get("startable")) and entry["tier"] >= 1,
            "domestic_cup": country.get("cup"),
            "super_cup": country.get("supercup"),
            # En Argentina el handball es amateur: no hay contrato ni sueldo.
            "amateur": entry["country"] == "ARG",
            "verified": entry["verified"],
            "teams": teams,
        })

    competitions = {
        "world": {
            "id": "ihf-world-championship",
            "name": "Campeonato Mundial IHF",
            "weight": 130,
            "cycle": "impar",
        },
        "olympics": {"id": "olympic-games", "name": "Juegos Olimpicos", "weight": 150, "cycle": "4-anios"},
        "confederations": {
            key: {
                "region": value["name"],
                "continental_primary": value["continental"],
                "continental_secondary": value["continental_2"],
                "national": value["national"],
            }
            for key, value in CONFEDERATIONS.items()
        },
        "awards": [
            {"id": "ihf-world-player", "name": "Mejor jugador del mundo IHF", "weight": 95},
            {"id": "all-star-team", "name": "Equipo ideal del torneo", "weight": 45},
            {"id": "top-scorer", "name": "Maximo goleador", "weight": 40},
            {"id": "best-defender", "name": "Mejor defensor", "weight": 35},
        ],
    }

    countries = []
    for code, value in COUNTRIES.items():
        pyramid = sorted(
            [league["id"] for league in leagues if league["country"] == code],
            key=lambda lid: next(l["tier"] for l in leagues if l["id"] == lid),
        )
        countries.append({
            "code": code,
            "name": value["name"],
            "flag": value["flag"],
            "confederation": value["conf"],
            "startable": bool(value.get("startable")),
            "domestic_cup": value.get("cup"),
            "pyramid": pyramid,
        })

    positions = [
        {"code": "GK", "name": "Arquero", "line": "GK", "goal_rate": 0.02, "assist_rate": 0.04, "save_based": True},
        {"code": "LW", "name": "Extremo izquierdo", "line": "ALA", "goal_rate": 3.1, "assist_rate": 0.9},
        {"code": "LB", "name": "Lateral izquierdo", "line": "LAT", "goal_rate": 3.6, "assist_rate": 2.1},
        {"code": "CB", "name": "Central", "line": "CEN", "goal_rate": 2.2, "assist_rate": 5.4},
        {"code": "RB", "name": "Lateral derecho", "line": "LAT", "goal_rate": 3.6, "assist_rate": 2.1},
        {"code": "RW", "name": "Extremo derecho", "line": "ALA", "goal_rate": 3.1, "assist_rate": 0.9},
        {"code": "PV", "name": "Pivote", "line": "PIV", "goal_rate": 2.8, "assist_rate": 1.2},
    ]

    os.makedirs(DATA, exist_ok=True)
    write(os.path.join(DATA, "leagues.json"), leagues)
    write(os.path.join(DATA, "competitions.json"), competitions)
    write(os.path.join(DATA, "countries.json"), countries)
    write(os.path.join(DATA, "positions.json"), positions)

    total = sum(len(l["teams"]) for l in leagues)
    unverified = [l["id"] for l in leagues if not l["verified"]]
    print(f"ligas: {len(leagues)}   clubes: {total}   paises: {len(countries)}")
    print(f"con escudo de wikipedia disponible: "
          f"{sum(1 for l in leagues for t in l['teams'] if t['wiki'])}/{total}")
    print(f"ligas a auditar ({len(unverified)}): {', '.join(unverified)}")


def write(path, payload):
    with open(path, "w", encoding="utf8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=1)
    print(f"  -> {os.path.relpath(path, ROOT)}")


if __name__ == "__main__":
    build()
