#!/usr/bin/env python3
"""Convierte a Croacia en país jugable con el padrón oficial del HRS.

    python3 scripts/add_croatia.py           # aplica
    python3 scripts/add_croatia.py --dry     # sólo informa

Igual que add_brazil.py: no pasa por build_dataset.py, que reconstruye desde
la semilla y pierde los escudos de los pasos posteriores. Acá se REEMPLAZA la
liga croata que ya estaba (8 clubes con escudo EHF) por la nómina completa
2025/26 de api.hrs.hr, con el escudo oficial de los 30 clubes (16 + 14).

Croacia es EHF y profesional, así que no lleva las banderas amateur/semipro
de Argentina y Brasil. Definición de Diego: la liga croata se parece a la
española en nivel y sueldos — por debajo de Francia y Alemania, con el
Zagreb un escalón abajo del Barcelona. De ahí el prestigio 4 (banda de
Dinamarca/Hungría) y el recorte de sueldo estilo España en el motor.

Las fuerzas salen de la tabla final 2025/26:
- Zagreb (campeón perpetuo, Champions todos los años) y Nexe (European
  League) van con 4.
- Sesvete, subcampeón y tercera fuerza reciente, con 3.
- El resto con 2: nivel de club chico europeo.
En la femenina Podravka (campeona, Champions) va con 4, Lokomotiva con 3.
"""
import argparse
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

BRANCHES = {
    "leagues.json": {
        "source": "hrs.json",
        "league_id": "cro-premijer-liga",
        "league_name": "Premijer liga",
        "prestige": 4,
        "strengths": {1607: 4, 1514: 4, 1405: 3},
    },
    "leagues-f.json": {
        "source": "hrs-f.json",
        "league_id": "cro-prva-liga-z",
        "league_name": "Prva HRL Žene",
        "prestige": 2,
        "strengths": {1537: 4, 1491: 3},
    },
}


def slug(value):
    plain = unicodedata.normalize("NFKD", value)
    plain = "".join(c for c in plain if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


def short_name(name):
    # Sin la sigla de forma jurídica (RK, MRK, ŽRK...) el nombre respira:
    # "Zagreb" en vez de "RK Zagreb", como ya venía en el seed.
    plain = re.sub(r"^(?:RK|MRK|HRK|GRK|ŽRK)\s+", "", name)
    return plain if len(plain) <= 22 else plain[:22]


def abbreviation(name):
    words = [w for w in re.split(r"[\s./-]+", name) if w]
    return "".join(w[0] for w in words[:3]).upper() or "CRO"


def crest_path(club):
    # Si algún día un optimizador pasa el escudo a .jpg, acá se resuelve la
    # extensión que realmente quedó en el disco.
    for candidate in (club["crest"], club["crest"].rsplit(".", 1)[0] + ".jpg"):
        if os.path.exists(os.path.join(ROOT, candidate)):
            return candidate
    return None


def build_league(config, existing_ids):
    payload = json.load(open(os.path.join(DATA, config["source"]), encoding="utf8"))
    teams = []
    for club in payload["clubs"]:
        crest = crest_path(club)
        if not crest:
            print(f"  ✗ {club['name']}: sin escudo en disco, no entra")
            continue
        team_id = slug(club["name"])
        if team_id in existing_ids:
            team_id = f"{team_id}-cro"
        existing_ids.add(team_id)
        teams.append({
            "id": team_id,
            "name": club["name"],
            "short_name": short_name(club["name"]),
            "abbreviation": abbreviation(club["name"]),
            "country": "CRO",
            "flag": "🇭🇷",
            "league": config["league_id"],
            "tier": 1,
            "strength": config["strengths"].get(club["hrs_id"], 2),
            "crest": crest,
            "crest_source": "hrs",
            "wiki": None,
        })
    return {
        "id": config["league_id"],
        "name": config["league_name"],
        "country": "CRO",
        "country_name": "Croacia",
        "confederation": "EHF",
        "tier": 1,
        "prestige": config["prestige"],
        "startable": True,
        "domestic_cup": "Hrvatski kup",
        "super_cup": None,
        "amateur": False,
        "verified": True,
        "teams": teams,
    }


def apply(target, config, dry):
    path = os.path.join(DATA, target)
    leagues = json.load(open(path, encoding="utf8"))
    replaced = [entry for entry in leagues if entry["id"] != config["league_id"]]
    position = next((i for i, entry in enumerate(leagues)
                     if entry["id"] == config["league_id"]), len(replaced))
    ids = {team["id"] for entry in replaced for team in entry["teams"]}
    league = build_league(config, ids)
    if len(league["teams"]) < 6:
        print(f"  ✗ {target}: sólo {len(league['teams'])} clubes con escudo, no entra")
        return
    replaced.insert(position, league)
    print(f"  ✓ {target}: {config['league_name']} con {len(league['teams'])} clubes")
    for team in league["teams"]:
        marca = " ★" if team["strength"] >= 3 else ""
        print(f"      {team['name']:26} fuerza {team['strength']}{marca}")
    if not dry:
        with open(path, "w", encoding="utf8") as handle:
            json.dump(replaced, handle, ensure_ascii=False, indent=1)
            handle.write("\n")


def mark_startable(dry):
    path = os.path.join(DATA, "countries.json")
    countries = json.load(open(path, encoding="utf8"))
    for country in countries:
        if country["code"] == "CRO":
            country["startable"] = True
            country["pyramid"] = ["cro-premijer-liga"]
    if not dry:
        with open(path, "w", encoding="utf8") as handle:
            json.dump(countries, handle, ensure_ascii=False, indent=1)
            handle.write("\n")
    print("  ✓ Croacia marcada como país jugable")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()
    for target, config in BRANCHES.items():
        apply(target, config, args.dry)
    mark_startable(args.dry)
    if args.dry:
        print("\n(--dry: no se escribió nada)")


if __name__ == "__main__":
    main()
