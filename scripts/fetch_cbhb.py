#!/usr/bin/env python3
"""Importa la Liga Nacional de Handebol de Brasil desde la API de la CBHb.

    python3 scripts/fetch_cbhb.py               # rama masculina
    python3 scripts/fetch_cbhb.py --rama F      # femenina
    python3 scripts/fetch_cbhb.py --crests      # además baja los escudos

El sitio de la CBHb (cbhb.org.br) es un SPA de React cuyo bundle declara
`REACT_APP_REST` y `REACT_APP_REST_API_PREFIX`. De ahí sale el patrón real:

    https://restcbhb.bigmidia.com/{modulo}/api/{recurso}

con los módulos gestao / cbhb / portal / governanca / geral. Es una API Yii2
abierta, sin clave: el mismo dato público que muestra la web.

De cada evento sacamos los clubes por dos vías (clasificación y partidos), y
cada club es un `estabelecimento` con su escudo oficial en sge.cbhb.org.br.
"""
import argparse
import json
import os
import re
import time
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://restcbhb.bigmidia.com"
OUT = os.path.join(ROOT, "data", "cbhb.json")
CRESTS = os.path.join(ROOT, "assets", "crests")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "cbhb")
UA = {"User-Agent": "handboludo/1.0 (dataset build; contact: appidisko@gmail.com)",
      "Accept": "application/json"}

# Palabras que sobran en el nombre de un club brasileño: o son la forma
# jurídica, o son el sponsor pegado con barras.
NOISE = {
    "associacao", "associação", "assoc", "beneficente", "clube", "club",
    "esporte", "esportivo", "esportiva", "sociedade", "grupo", "gremio",
    "grêmio", "recreativo", "handebol", "handbol", "de", "do", "da", "dos",
    "das", "e", "ec", "ac", "ad", "adc", "sme", "fme", "fmel", "prefeitura",
    "municipal", "secretaria", "liga", "sport", "team",
    # abreviaturas jurídicas y siglas de sponsor que vienen pegadas
    "ass", "assoc", "desp", "desportiva", "desportivo", "atletica", "atlética",
    "tcc", "cbc", "csp", "cjb", "sc", "aa", "programa",
}
# Los grandes con nombre propio: acá mandamos nosotros, no la API.
PRETTY = {
    "pinheiros": "EC Pinheiros",
    "aceu": "Itajaí Handebol",
    "univali": "Itajaí Handebol",
    "jaboatao": "Jaboatão dos Guararapes",
    "nilton lins": "Nilton Lins",
    "nacion": "Nacional HC",
    "cerrado": "Cerrado Handebol",
    "guarulhos": "Guarulhos Handebol",
    "giuliano": "Giuliano EC",
    "manauense": "Manauense",
    "handunifap": "Handunifap",
    "unisociesc": "São José",
    "intelbras": "São José",
    "campo bom": "Campo Bom",
    "concordia": "Concórdia",
    "torres": "Hand Torres",
    "solidario": "Esporte Solidário",
    "la salle": "São Carlos",
    "sao carlos": "São Carlos",
    "acrihf": "ACRIHF",
    "taubate": "Handebol Taubaté",
    "sao jose": "São José",
    "sao caetano": "São Caetano",
    "carajas": "Carajás Handebol",
    "londrina": "Londrina Handebol",
    "blumenau": "Blumenau Handebol",
    "itajai": "Itajaí Handebol",
    "maringa": "Maringá Handebol",
    "cascavel": "Cascavel Handebol",
    "metodista": "ADC Metodista",
    "portugues": "Português do Recife",
}


def plain(text):
    text = unicodedata.normalize("NFKD", str(text or ""))
    return "".join(c for c in text if not unicodedata.combining(c)).lower()


def get(path, ttl=86400 * 3):
    os.makedirs(CACHE, exist_ok=True)
    key = re.sub(r"[^a-z0-9]+", "_", plain(path))[:120] + ".json"
    cached = os.path.join(CACHE, key)
    if os.path.exists(cached) and time.time() - os.path.getmtime(cached) < ttl:
        return json.load(open(cached, encoding="utf8"))
    request = urllib.request.Request(f"{API}/{path}", headers=UA)
    for attempt in range(4):
        try:
            data = json.loads(urllib.request.urlopen(request, timeout=45).read())
            break
        except Exception as error:  # noqa: BLE001
            if attempt == 3:
                print(f"    ! {path}: {error}")
                return {}
            time.sleep(1.5 * (attempt + 1))
    json.dump(data, open(cached, "w", encoding="utf8"), ensure_ascii=False)
    time.sleep(0.25)
    return data


def liga_nacional_events(rama, limit_pages=26, quiero=3):
    """Ediciones recientes de la Liga Nacional propiamente dicha.

    Ojo: la CBHb también publica las CONFERÊNCIAS regionales (Norte, Nordeste,
    Centro Oeste) y las SELETIVAS, que son clasificatorias con clubes chicos.
    Si no se filtran, el plantel que sale no tiene ni a Pinheiros ni a Taubaté.
    """
    palabra = "masc" if rama == "M" else "femin"
    encontrados = []
    for page in range(1, limit_pages + 1):
        items = (get(f"cbhb/api/evento?per-page=50&sort=-id&page={page}") or {}).get("items") or []
        if not items:
            break
        for item in items:
            desc = plain(item.get("descricao"))
            if "liga nacional" not in desc or palabra not in desc:
                continue
            if "conferencia" in desc or "seletiva" in desc:
                continue
            encontrados.append((item["id"], item.get("descricao", "")))
        if len(encontrados) >= quiero:
            break
    return encontrados[:quiero]


def club_ids(evento_id):
    """Los clubes salen de la clasificación y, por las dudas, de los partidos."""
    ids = set()
    for item in (get(f"cbhb/api/evento-classificacao?id_evento={evento_id}&per-page=200")
                 .get("items") or []):
        if item.get("id_evento") == evento_id and item.get("id_estabelecimento"):
            ids.add(item["id_estabelecimento"])
    for item in (get(f"cbhb/api/evento-partida?id_evento={evento_id}&per-page=300")
                 .get("items") or []):
        if item.get("id_evento") != evento_id:
            continue
        for side in ("casa", "visitante"):
            if item.get(f"id_estabelecimento_{side}"):
                ids.add(item[f"id_estabelecimento_{side}"])
    return ids


def pretty_name(club):
    """Nombre corto y presentable: sin forma jurídica y sin sponsors."""
    raw = club.get("nome_fantasia") or club.get("sigla_evento") or ""
    # Los sponsors vienen pegados con barras: nos quedamos con el trozo que
    # de verdad nombra al club (el más largo que no sea ruido).
    trozos = [t.strip() for t in re.split(r"[/|]", raw) if t.strip()]
    candidatos = []
    for trozo in trozos:
        palabras = [w for w in re.split(r"\s+", trozo)
                    if plain(w).strip(".") not in NOISE and len(w) > 1]
        if palabras:
            candidatos.append(" ".join(palabras))
    limpio = max(candidatos, key=len) if candidatos else (trozos[0] if trozos else raw)

    for clave, bonito in PRETTY.items():
        if clave in plain(limpio) or clave in plain(raw):
            return bonito
    # Title Case respetando preposiciones y sin destrozar las siglas:
    # "HCM" y "H.C." se quedan como están, "PORTUGUÊS" pasa a "Português".
    palabras = limpio.split()
    salida = []
    for i, w in enumerate(palabras):
        if plain(w) in {"de", "do", "da", "dos", "das"} and i:
            salida.append(w.lower())
        elif w.isupper() and len(w) <= 3:
            salida.append(w.upper())
        elif w.isupper() or w.islower():
            salida.append(w.capitalize())
        else:
            salida.append(w)
    return " ".join(salida)


def fetch_clubs(ids):
    clubes = {}
    for club_id in sorted(ids):
        data = get(f"gestao/api/estabelecimento/{club_id}")
        if not data or not data.get("nome_fantasia"):
            continue
        clubes[club_id] = {
            "cbhb_id": club_id,
            "name": pretty_name(data),
            "raw_name": data.get("nome_fantasia"),
            "sigla": data.get("sigla"),
            "crest_url": data.get("urlLogo") or None,
        }
    return clubes


def download_crests(clubes):
    os.makedirs(CRESTS, exist_ok=True)
    ok = fail = 0
    for club in clubes.values():
        url = club.get("crest_url")
        if not url:
            fail += 1
            continue
        ext = os.path.splitext(url.split("?")[0])[1].lower() or ".png"
        if ext not in (".png", ".jpg", ".jpeg", ".webp"):
            ext = ".png"
        name = f"cbhb-{club['cbhb_id']}{ext}"
        path = os.path.join(CRESTS, name)
        club["crest"] = f"assets/crests/{name}"
        if os.path.exists(path):
            ok += 1
            continue
        try:
            payload = urllib.request.urlopen(
                urllib.request.Request(url, headers=UA), timeout=60).read()
            open(path, "wb").write(payload)
            ok += 1
            time.sleep(0.2)
        except Exception as error:  # noqa: BLE001
            print(f"  ! escudo {club['name']}: {error}")
            club["crest"] = None
            fail += 1
    print(f"escudos: {ok} listos, {fail} sin escudo")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rama", default="M", choices=["M", "F"])
    parser.add_argument("--crests", action="store_true")
    args = parser.parse_args()

    eventos = liga_nacional_events(args.rama)
    if not eventos:
        raise SystemExit(f"no encontré ediciones de Liga Nacional para la rama {args.rama}")
    print(f"ediciones encontradas (rama {args.rama}):")
    for eid, desc in eventos:
        print(f"  {eid:6}  {desc[:64]}")

    ids = set()
    for eid, _ in eventos:
        ids |= club_ids(eid)
    print(f"\nclubes distintos: {len(ids)}")

    clubes = fetch_clubs(ids)
    # La CBHb a veces tiene dos fichas del mismo club (ids distintos). Nos
    # quedamos con una sola por nombre: el juego no puede tener duplicados.
    unicos, vistos = {}, set()
    for cid, club in sorted(clubes.items()):
        if club["name"] in vistos:
            continue
        vistos.add(club["name"])
        unicos[cid] = club
    if len(unicos) < len(clubes):
        print(f"duplicados descartados: {len(clubes) - len(unicos)}")
    clubes = unicos
    print(f"con ficha completa: {len(clubes)}")
    if args.crests:
        download_crests(clubes)

    target = OUT if args.rama == "M" else OUT.replace(".json", "-f.json")
    payload = {"source": "restcbhb.bigmidia.com (API pública de la CBHb)",
               "branch": args.rama,
               "events": [{"id": e, "name": d} for e, d in eventos],
               "clubs": sorted(clubes.values(), key=lambda c: c["name"])}
    json.dump(payload, open(target, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"\n-> {os.path.relpath(target, ROOT)} · {len(clubes)} clubes")
    for club in payload["clubs"][:14]:
        print(f"   {club['name']:26} ← {(club['raw_name'] or '')[:44]}")


if __name__ == "__main__":
    main()
