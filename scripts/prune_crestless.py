#!/usr/bin/env python3
"""Deja en el juego sólo los clubes que tienen escudo real.

    python3 scripts/prune_crestless.py            # aplica
    python3 scripts/prune_crestless.py --dry      # sólo informa

Un club con monograma al lado de veinte con escudo oficial se ve como un error,
no como una decisión. Preferimos un mundo un poco más chico pero parejo.

Corre SIEMPRE al final del pipeline, después de los tres fetchers de escudos:

    build_dataset → fetch_femebal → fetch_league_crests → fetch_ehf_crests
    → fetch_crests → optimize_crests → prune_crestless

Una liga que se queda con menos de MIN_TEAMS clubes sale del juego entera: con
cuatro equipos no se sostiene ni el mercado de pases ni el relato.
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEAGUES = os.path.join(ROOT, "data", "leagues.json")
MIN_TEAMS = 6


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    args = parser.parse_args()

    leagues = json.load(open(LEAGUES, encoding="utf8"))
    before_teams = sum(len(l["teams"]) for l in leagues)
    before_leagues = len(leagues)

    dropped_teams = []
    kept = []
    for league in leagues:
        with_crest = [t for t in league["teams"] if t.get("crest")]
        without = [t for t in league["teams"] if not t.get("crest")]

        if len(with_crest) < MIN_TEAMS:
            dropped_teams.extend(f"{t['name']} ({league['name']})" for t in league["teams"])
            print(f"  ✗ {league['name']:34} se cae entera "
                  f"({len(with_crest)} clubes con escudo, mínimo {MIN_TEAMS})")
            continue

        if without:
            dropped_teams.extend(f"{t['name']} ({league['name']})" for t in without)
            print(f"  ~ {league['name']:34} {len(with_crest)}/{len(league['teams'])} "
                  f"· se van {len(without)}")
        league["teams"] = with_crest
        kept.append(league)

    after_teams = sum(len(l["teams"]) for l in kept)
    print(f"\nligas {before_leagues} → {len(kept)}   clubes {before_teams} → {after_teams}")
    print(f"todos los clubes del juego tienen escudo real: "
          f"{all(t.get('crest') for l in kept for t in l['teams'])}")

    startable = sorted({l["country"] for l in kept if l["startable"]})
    print(f"países jugables: {', '.join(startable)}")
    for code in startable:
        tiers = sorted(l["tier"] for l in kept if l["country"] == code)
        print(f"   {code}: divisiones {tiers}")

    if args.dry:
        print("\n(--dry: no se escribió nada)")
        return 0

    json.dump(kept, open(LEAGUES, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("\n-> data/leagues.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
