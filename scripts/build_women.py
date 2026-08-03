#!/usr/bin/env python3
"""Arma data/leagues-f.json: el universo del handball femenino.

    python3 scripts/build_women.py

Fuentes, en el mismo estándar que el masculino (100 % escudos reales):
  - EHF GetTeams -> clubWomen: 618 clubes europeos, 411 con escudo oficial.
    Se queda con los que jugaron competencia europea reciente: eso filtra
    clubes desaparecidos y deja, en la práctica, la primera división de cada
    país (Metz, Győr, Esbjerg, CSM București...).
  - FeMeBal rama F (data/femebal-f.json): el padrón oficial del femenino
    argentino, LHD Hipotecario Seguros y todo el ascenso.

El mapa del femenino no es el del masculino: acá mandan Hungría, Dinamarca,
Francia, Noruega y Rumania; Alemania y España están un escalón abajo. Los
prestigios reflejan eso.
"""
import json
import os
import re
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_dataset import abbreviation, short_name, slug  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CRESTS = os.path.join(ROOT, "assets", "crests")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "ehf-teams.json")
API = "https://www.eurohandball.com/umbraco/api/homeofhandballapi/GetTeams"
UA = {"User-Agent": "handballer/1.0 (women dataset; contact: appidisko@gmail.com)"}

# Liga femenina por país. El prestigio (1-5) manda en títulos, selección y
# en cuánto vale el salto: la jerarquía real del femenino, no la del masculino.
WOMEN_LEAGUES = {
    "FRA": dict(id="fra-lbe", name="Ligue Butagaz Énergie", prestige=5),
    "HUN": dict(id="hun-nb1-noi", name="K&H Női Liga", prestige=5),
    "DEN": dict(id="den-damehandboldligaen", name="Damehåndboldligaen", prestige=5),
    "NOR": dict(id="nor-rema1000", name="REMA 1000-ligaen", prestige=4),
    "ROU": dict(id="rou-liga-florilor", name="Liga Florilor", prestige=4),
    "GER": dict(id="ger-hbf", name="1. Bundesliga Frauen", prestige=4),
    "ESP": dict(id="esp-lgi", name="Liga Guerreras Iberdrola", prestige=3),
    "POL": dict(id="pol-superliga-kobiet", name="Orlen Superliga Kobiet", prestige=3),
    "SWE": dict(id="swe-handbollsligan-dam", name="Handbollsligan Dam", prestige=3),
    "AUT": dict(id="aut-wha", name="WHA Meisterliga", prestige=2),
    "SUI": dict(id="sui-spl1", name="SPL1", prestige=2),
    "POR": dict(id="por-1-divisao-f", name="1ª Divisão Feminina", prestige=2),
    "CRO": dict(id="cro-prva-liga-z", name="Prva HRL Žene", prestige=2),
}
MAX_TEAMS = 14
MIN_TEAMS = 6

# La EHF lista al mismo club con varios nombres según la temporada
# ("Metz Handball" dos veces, "FTC" y "FTC-Toyota Kovács"). Palabras que no
# identifican al club para el dedupe por tokens.
NOISE = {
    "handball", "handbal", "handbold", "haandbold", "handboll", "handballklubb",
    "kezilabda", "team", "club", "sport", "elite", "hb", "hc", "hk", "kc", "sc",
    "cs", "csm", "zrk", "rk", "if", "ik", "es", "sg", "tv", "tsv", "sk", "gs",
    "spr", "kpr", "mks", "bel", "gsk", "sf", "kkc", "se", "fc",
}
# Filiales, academias y juveniles: no son destino de una carrera profesional.
ACADEMY = re.compile(r"akad[eé]mia|akademi|ungdom|youth|junior|\bU\d{2}\b|\bII\b", re.IGNORECASE)
# Clubes que ya no existen o cayeron del máximo nivel (quiebra de Vipers 2025,
# Larvik hace años en el ascenso) pero siguen en la lista de la EHF.
EXCLUDE = {"vipers kristiansand", "larvik", "sg bbm bietigheim"}


def tokens_of(name):
    plain = "".join(
        ch if ch.isalnum() or ch.isspace() else " "
        for ch in unicodedata_normalize(name).lower()
    )
    words = [word for word in plain.split() if len(word) >= 2]
    distinct = {word for word in words if len(word) >= 3 and word not in NOISE}
    # "CSM Bucuresti" queda en {bucuresti} y chocaría con "CS Rapid Bucuresti":
    # cuando el nombre casi no tiene tokens propios, las siglas también cuentan.
    return distinct if len(distinct) >= 2 else set(words)


def unicodedata_normalize(value):
    import unicodedata
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch)
    )

# FeMeBal rama F. "LHD" es la Liga de Honor Damas; 1ª y 2ª se fusionan igual
# que en el masculino para que el escalón tenga tamaño jugable.
FEMEBAL_F = {
    1: dict(id="argf-lhd", name="Liga de Honor Damas", tier=1, strength=2),
    2: dict(id="argf-plata", name="Liga de Honor Plata", tier=2, strength=2),
    3: dict(id="argf-primera", name="1ª División", tier=3, strength=1),
    4: dict(id="argf-primera", name="1ª División", tier=3, strength=1),
}
RESERVE_TEAM = re.compile(r"\s+[BCD]$")

SEASON_RE = re.compile(r"(\d{4})/\d{2}")


def load_country_meta():
    meta = {}
    for country in json.load(open(os.path.join(DATA, "countries.json"), encoding="utf8")):
        meta[country["code"]] = country
    return meta


def ehf_women():
    if os.path.exists(CACHE) and time.time() - os.path.getmtime(CACHE) < 86400 * 7:
        payload = json.load(open(CACHE, encoding="utf8"))
    else:
        request = urllib.request.Request(API, headers=UA)
        payload = json.loads(urllib.request.urlopen(request, timeout=60).read().decode())
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        json.dump(payload, open(CACHE, "w", encoding="utf8"), ensure_ascii=False)
    return payload["clubWomen"]


def latest_participation(club):
    """(año, tipo) de la última competencia europea que jugó el club.

    La EHF lista la participación vigente SIN prefijo de temporada
    ("EHF European League Women") y las históricas con él ("2019/20 ...").
    """
    best_year, best_type = 0, ""
    entries = []
    for key in ("lastParticipation", "LastParticipation"):
        value = club.get(key)
        if isinstance(value, list):
            entries += value
        elif isinstance(value, dict):
            entries.append(value)
    for item in entries:
        name = item.get("name") or ""
        match = SEASON_RE.search(name)
        year = int(match.group(1)) if match else 2025
        if year > best_year:
            best_year, best_type = year, name
    return best_year, best_type


def strength_of(year, competition, prestige):
    """Fuerza 1-5 según qué tan arriba compitió en Europa y qué tan reciente."""
    base = 3
    if "Champions League" in competition:
        base = 5
    elif "European League" in competition or "EHF Cup" in competition:
        base = 4
    if year < 2023:
        base -= 1
    # En una liga chica el mejor club sigue sin ser un transatlántico.
    return max(2, min(base, prestige + 1, 5))


def download_crest(club, team_id):
    url = club.get("logoBig") or club.get("logoSmall")
    if not url:
        return None
    name = f"ehfw-{team_id}.png"
    path = os.path.join(CRESTS, name)
    rel = f"assets/crests/{name}"
    if os.path.exists(path):
        return rel
    try:
        request = urllib.request.Request(url, headers=UA)
        payload = urllib.request.urlopen(request, timeout=45).read()
        if len(payload) > 600_000 or len(payload) < 500:
            return None
        open(path, "wb").write(payload)
        time.sleep(0.15)
        return rel
    except Exception as error:  # noqa: BLE001
        print(f"  ! escudo {club.get('name')}: {error}")
        return None


def european_leagues(country_meta, seen_ids):
    clubs = ehf_women()
    leagues = []
    for code, config in WOMEN_LEAGUES.items():
        pool = []
        for club in clubs:
            if club.get("nationAbbreviation") != code:
                continue
            if not (club.get("logoBig") or club.get("logoSmall")):
                continue
            name = ((club.get("fullName") or club.get("name")) or "").strip()
            if not name or ACADEMY.search(name) or unicodedata_normalize(name).lower() in EXCLUDE:
                continue
            year, competition = latest_participation(club)
            if year < 2021:
                continue
            pool.append((year, competition, club))
        # Los más fuertes y recientes primero: si hay duplicados, gana esa versión.
        pool.sort(key=lambda item: (-strength_of(item[0], item[1], config["prestige"]), -item[0]))
        if len(pool) < MIN_TEAMS:
            print(f"  {code}: solo {len(pool)} clubes vigentes, liga descartada")
            continue

        meta = country_meta[code]
        teams = []
        accepted_tokens = []
        for year, competition, club in pool:
            if len(teams) >= MAX_TEAMS:
                break
            name = ((club.get("fullName") or club.get("name")) or "").strip()
            mine = tokens_of(name)
            # Mismo club con otro nombre (con o sin sponsor): un set de tokens
            # contiene al otro. "CS Rapid Bucuresti" vs "CSM Bucuresti" NO es
            # subset en ninguna dirección, así que los tocayos de ciudad viven.
            duplicate = any(
                mine and theirs and (mine <= theirs or theirs <= mine)
                for theirs in accepted_tokens
            )
            if duplicate:
                print(f"    (dup) {name}")
                continue
            accepted_tokens.append(mine)
            team_id = slug(name)
            if team_id in seen_ids:
                team_id = f"{team_id}-{code.lower()}"
            seen_ids.add(team_id)
            crest = download_crest(club, team_id)
            if not crest:
                continue  # sin escudo real no entra: mismo estándar que el masculino
            teams.append({
                "id": team_id,
                "name": name,
                "short_name": short_name(name),
                "abbreviation": abbreviation(name),
                "country": code,
                "flag": meta["flag"],
                "league": config["id"],
                "tier": 1,
                "strength": strength_of(year, competition, config["prestige"]),
                "crest": crest,
                "crest_source": "ehf",
                "wiki": None,
            })
        if len(teams) < MIN_TEAMS:
            print(f"  {code}: solo {len(teams)} clubes con escudo, liga descartada")
            continue
        leagues.append({
            "id": config["id"],
            "name": config["name"],
            "country": code,
            "country_name": meta["name"],
            "confederation": meta["confederation"],
            "tier": 1,
            "prestige": config["prestige"],
            "startable": bool(meta.get("startable")),
            "domestic_cup": meta.get("domestic_cup"),
            "super_cup": None,
            "amateur": False,
            "verified": False,
            "teams": teams,
        })
        print(f"  {code}: {config['name']} · {len(teams)} clubes")
    return leagues


def tier_of_division(name):
    if name.startswith("LHD") or name.startswith("Liga de Honor Damas"):
        return 1
    if name.startswith("Liga de Honor Plata"):
        return 2
    if name[:1].isdigit() and "División" in name:
        return int(name[0]) + 2  # "1º División" -> 3, "2º División" -> 4
    return None


def argentina_leagues(country_meta, seen_ids):
    path = os.path.join(DATA, "femebal-f.json")
    if not os.path.exists(path):
        sys.exit("falta data/femebal-f.json: corré scripts/fetch_femebal.py --rama F --crests")
    payload = json.load(open(path, encoding="utf8"))
    meta = country_meta["ARG"]
    merged = {}

    for division in payload["divisions"]:
        tier = division.get("tier") or tier_of_division(division["name"])
        config = FEMEBAL_F.get(tier)
        if not config:
            continue
        entry = merged.setdefault(config["id"], {
            "id": config["id"], "name": config["name"],
            "country": "ARG", "country_name": meta["name"],
            "confederation": meta["confederation"], "tier": config["tier"],
            "prestige": 1, "startable": True, "domestic_cup": meta.get("domestic_cup"),
            "super_cup": None, "amateur": True, "verified": True, "teams": [],
        })
        known = {team["name"] for team in entry["teams"]}
        for club in sorted(division["clubs"], key=lambda c: c["name"]):
            if club["name"] in known or RESERVE_TEAM.search(club["name"]):
                continue
            if not club.get("crest"):
                continue
            team_id = slug(club["name"])
            if team_id in seen_ids:
                team_id = f"{team_id}-argf"
            seen_ids.add(team_id)
            entry["teams"].append({
                "id": team_id,
                "name": club["name"],
                "short_name": short_name(club["name"]),
                "abbreviation": abbreviation(club["name"]),
                "country": "ARG",
                "flag": meta["flag"],
                "league": config["id"],
                "tier": config["tier"],
                "strength": config["strength"],
                "crest": club["crest"],
                "crest_source": "femebal",
                "wiki": None,
            })

    out = sorted(merged.values(), key=lambda entry: entry["tier"])
    for league in out:
        print(f"  ARG: {league['name']} · {len(league['teams'])} clubes")
    return out


def build():
    country_meta = load_country_meta()
    seen_ids = set()
    os.makedirs(CRESTS, exist_ok=True)
    print("Europa (EHF, clubWomen):")
    leagues = european_leagues(country_meta, seen_ids)
    print("Argentina (FeMeBal rama F):")
    leagues += argentina_leagues(country_meta, seen_ids)

    target = os.path.join(DATA, "leagues-f.json")
    with open(target, "w", encoding="utf8") as handle:
        json.dump(leagues, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    total = sum(len(league["teams"]) for league in leagues)
    crested = sum(1 for league in leagues for team in league["teams"] if team["crest"])
    print(f"\n-> data/leagues-f.json · {len(leagues)} ligas · {total} clubes · "
          f"{crested}/{total} con escudo real")


if __name__ == "__main__":
    build()
