#!/usr/bin/env python3
"""Importa el padrón real de FeMeBal desde su Tournament Tracker.

    https://www.femebal.com/tournament-tracker/

Esa página es un SPA que consume https://api.tournamenttracker.tecdata.net.
Las respuestas vienen como "ivHex:cipherHex" con AES-CTR; la clave viaja en el
bundle del propio front (`REACT_APP_PASSPHRASE`), o sea que es ofuscación, no
autenticación: es el mismo dato público que muestra la web.

Devuelve, por división (Liga de Honor, Liga de Honor Plata, 1º, 2º, 3º, 4º):
la nómina de clubes con su id de federación y la URL de su escudo oficial.

    python3 scripts/fetch_femebal.py                 # rama M, Mayores
    python3 scripts/fetch_femebal.py --rama F        # femenino
    python3 scripts/fetch_femebal.py --crests        # además baja los escudos
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.request

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

API = "https://api.tournamenttracker.tecdata.net"
PASSPHRASE = "uweoEVNeycw7CFBXtHNCy3nbJZmUPl0EosXGRrNDgdU="
KEY = base64.b64decode(PASSPHRASE)
UA = {"User-Agent": "handball-copero/1.0 (dataset build; contact: appidisko@gmail.com)"}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "femebal.json")
CRESTS = os.path.join(ROOT, "assets", "crests")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "femebal")

# Cómo mapea cada división de FeMeBal a la pirámide del juego.
TIERS = {
    "LHC": 1, "Liga de Honor": 1,
    "Liga de Honor Plata": 2,
    "1º División": 3, "1° División": 3,
    "2º División": 4, "2° División": 4,
    "3º División": 5, "3° División": 5,
    "4º División": 6, "4° División": 6,
    "Desarrollo": 7,
}


def is_femebal(name):
    upper = str(name).upper()
    return "FEMEBAL" in upper or "METROPOLITANA DE BALONMANO" in upper


def tier_of(division_name):
    # Prefijo más largo primero: "Liga de Honor Plata" no puede caer en "Liga de Honor".
    name = division_name.strip()
    for prefix in sorted(TIERS, key=len, reverse=True):
        if name.startswith(prefix):
            return TIERS[prefix]
    return None


def get(path, ttl=86400 * 3):
    os.makedirs(CACHE, exist_ok=True)
    cached = os.path.join(CACHE, path.strip("/").replace("/", "_") + ".json")
    if os.path.exists(cached) and time.time() - os.path.getmtime(cached) < ttl:
        return json.load(open(cached, encoding="utf8"))

    request = urllib.request.Request(API + path, headers=UA)
    raw = urllib.request.urlopen(request, timeout=45).read().decode()
    iv_hex, cipher_hex = json.loads(raw).split(":")
    decryptor = Cipher(algorithms.AES(KEY), modes.CTR(bytes.fromhex(iv_hex))).decryptor()
    plain = decryptor.update(bytes.fromhex(cipher_hex)) + decryptor.finalize()
    data = json.loads(plain.decode("utf8"))
    json.dump(data, open(cached, "w", encoding="utf8"), ensure_ascii=False)
    time.sleep(0.35)
    return data


def femebal_seasons():
    """Temporadas donde FeMeBal tiene torneos cargados, de la más nueva a la más vieja."""
    seasons = []
    for season in get("/get-context"):
        for federation in season["federaciones"]:
            if not is_femebal(federation["nombre"]):
                continue
            loaded = any(
                category["cantTorneos"] != "0"
                for branch in federation["ramas"] for category in branch["categorias"]
            )
            if loaded:
                seasons.append((season["id"], season["descripcion"]))
    return sorted(seasons, reverse=True)


def divisions(season_id, branch, category):
    """El 2º parámetro del endpoint no filtra por federación: hay que buscarla."""
    for federation_id in [f"{n:03d}" for n in range(1, 12)]:
        try:
            payload = get(f"/torneos-x-division/{season_id}/{federation_id}/{branch}/{category}")
        except Exception:  # noqa: BLE001
            continue
        for federation in payload:
            if is_femebal(federation["federacionNombre"]) and federation["divisiones"]:
                return federation["divisiones"]
    return []


def clubs_of(tournament_id):
    """Los clubes salen de los partidos: ahí viene id, nombre y escudo oficial."""
    detail = get(f"/torneos/{tournament_id}")
    if not detail:
        return {}
    found = {}
    for phase in detail.get("fases", []):
        for zone in phase.get("zonas", []):
            for match in zone.get("partidos", []):
                for side in ("Local", "Visitante"):
                    club_id = match.get(f"idClub{side}")
                    name = (match.get(f"nombre{side}") or "").strip()
                    if not club_id or not name:
                        continue
                    found.setdefault(club_id, {
                        "femebal_id": club_id,
                        "name": name,
                        "crest_url": match.get(f"escudoImagePath{side}") or None,
                    })
    return found


def download_crests(divisions_out):
    os.makedirs(CRESTS, exist_ok=True)
    done = failed = 0
    for division in divisions_out:
        for club in division["clubs"]:
            url = club.get("crest_url")
            if not url:
                continue
            extension = os.path.splitext(url.split("?")[0])[1].lower() or ".png"
            if extension not in (".png", ".jpg", ".jpeg", ".svg", ".webp"):
                extension = ".png"
            name = f"femebal-{club['femebal_id']}{extension}"
            path = os.path.join(CRESTS, name)
            club["crest"] = f"assets/crests/{name}"
            if os.path.exists(path):
                done += 1
                continue
            try:
                request = urllib.request.Request(url, headers=UA)
                payload = urllib.request.urlopen(request, timeout=45).read()
                open(path, "wb").write(payload)
                done += 1
                time.sleep(0.2)
            except Exception as error:  # noqa: BLE001
                print(f"  ! {club['name']}: {error}")
                club["crest"] = None
                failed += 1
    print(f"escudos: {done} bajados/presentes, {failed} fallaron")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rama", default="M", choices=["M", "F"])
    parser.add_argument("--categoria", default="100", help="100 = Mayores")
    parser.add_argument("--season", default=None, help="id de temporada; por defecto la más nueva con datos")
    parser.add_argument("--crests", action="store_true", help="descargar los escudos")
    args = parser.parse_args()

    seasons = femebal_seasons()
    if not seasons:
        sys.exit("FeMeBal no tiene temporadas con torneos cargados")
    print("temporadas con datos:", ", ".join(f"{i} ({d})" for i, d in seasons))

    # `get-context` a veces anuncia una temporada que todavía no tiene el
    # fixture publicado. Bajamos a la primera que devuelva divisiones de verdad.
    candidates = [args.season] if args.season else [i for i, _ in seasons]
    season_id, found = None, []
    for candidate in candidates:
        found = divisions(candidate, args.rama, args.categoria)
        if found:
            season_id = candidate
            break
        print(f"  temporada {candidate}: sin fixture publicado todavía, sigo")
    if not season_id:
        sys.exit("ninguna temporada tiene divisiones publicadas para esa rama/categoría")

    season_name = dict(seasons).get(season_id, season_id)
    print(f"usando temporada {season_id} ({season_name}), rama {args.rama}, categoría {args.categoria}\n")

    out = []
    for division in found:
        name = division["nombre"].strip()
        clubs = {}
        for tournament in division["torneos"]:
            clubs.update(clubs_of(tournament["id"]))
        if not clubs:
            continue
        entry = {
            "division_id": division["id"],
            "name": name,
            "tier": tier_of(name),
            "tournaments": [{"id": t["id"], "name": t["nombre"], "state": t["estado"]}
                            for t in division["torneos"]],
            "clubs": sorted(clubs.values(), key=lambda c: c["name"]),
        }
        out.append(entry)
        print(f"  T{entry['tier'] or '?'}  {name:26} {len(clubs):3} clubes  "
              f"({len(division['torneos'])} torneos)")

    if args.crests:
        print()
        download_crests(out)

    payload = {"source": "femebal.com/tournament-tracker",
               "season": {"id": season_id, "name": season_name},
               "branch": args.rama, "category": args.categoria,
               "divisions": out}
    # Cada rama a su archivo: el femenino no debe pisar el padrón masculino.
    target = OUT if args.rama == "M" else OUT.replace(".json", "-f.json")
    json.dump(payload, open(target, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    total = sum(len(d["clubs"]) for d in out)
    print(f"\n-> {os.path.relpath(target, ROOT)} · {len(out)} divisiones · {total} clubes")


if __name__ == "__main__":
    main()
