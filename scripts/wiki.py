"""Cached, polite Wikipedia API client for the handball data research."""
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
os.makedirs(CACHE, exist_ok=True)
UA = "handball-copero-research/1.0 (dataset build; contact: appidisko@gmail.com)"
_last = [0.0]


def api(lang, params, ttl=86400 * 7):
    params = dict(params, format="json", formatversion="2")
    query = urllib.parse.urlencode(params)
    key = f"{lang}-{abs(hash(query))}.json"
    path = os.path.join(CACHE, key)
    if os.path.exists(path) and time.time() - os.path.getmtime(path) < ttl:
        return json.load(open(path, encoding="utf8"))

    url = f"https://{lang}.wikipedia.org/w/api.php?{query}"
    for attempt in range(6):
        wait = 1.1 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            request = urllib.request.Request(url, headers={"User-Agent": UA})
            data = json.load(urllib.request.urlopen(request, timeout=40))
            json.dump(data, open(path, "w", encoding="utf8"), ensure_ascii=False)
            return data
        except urllib.error.HTTPError as error:
            if error.code in (429, 503):
                time.sleep(3 * (attempt + 1))
                continue
            raise
    raise RuntimeError(f"wikipedia api failed: {url}")


def wikitext(lang, title):
    data = api(lang, {
        "action": "query",
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
        "titles": title,
        "redirects": "1",
    })
    page = data["query"]["pages"][0]
    if page.get("missing"):
        return None
    return page["revisions"][0]["slots"]["main"]["content"]


def search(lang, term, limit=6):
    data = api(lang, {"action": "query", "list": "search", "srsearch": term, "srlimit": limit})
    return [hit["title"] for hit in data["query"]["search"]]


SKIP_IMAGE = re.compile(
    r"(commons-logo|wiki|flag_of|flagge|bandera|drapeau|ambox|question_book|edit-|"
    r"symbol_|folder|padlock|disambig|portal|nuvola|crystal|gnome|emblem-|"
    r"handball_pictogram|_pictogram|stadium|arena|map|karte|mapa|photo|foto)",
    re.I,
)
PHOTO_HINT = re.compile(
    r"(meister|champion|final|feier|jubel|team|mannschaft|squad|plantel|spieler|"
    r"action|match|game|halle|sporthalle|celebra|festej|19\d\d|20[0-2]\d)",
    re.I,
)
GOOD_IMAGE = re.compile(r"(logo|crest|wappen|escudo|badge|emblem|shield|scudetto|герб)", re.I)


def looks_like_crest(url_or_name):
    """Filtro de nombre aplicable tambien a la URL que devuelve `pageimages`."""
    name = urllib.parse.unquote(str(url_or_name).rsplit("/", 1)[-1])
    if SKIP_IMAGE.search(name) or PHOTO_HINT.search(name):
        return False
    if name.lower().endswith(".svg"):
        return True
    return bool(GOOD_IMAGE.search(name))


def page_images(lang, titles):
    """Fallback: lista las imagenes del articulo y elige la que parece el escudo.

    `pageimages` ignora los archivos non-free (que es como estan casi todos los
    escudos de club), asi que hace falta este segundo pase.
    """
    out = {}
    titles = list(titles)
    for start in range(0, len(titles), 20):
        chunk = titles[start:start + 20]
        data = api(lang, {
            "action": "query",
            "prop": "images",
            "imlimit": "60",
            "titles": "|".join(chunk),
            "redirects": "1",
        })
        query = data.get("query", {})
        normalized = {n["from"]: n["to"] for n in query.get("normalized", [])}
        redirects = {r["from"]: r["to"] for r in query.get("redirects", [])}
        resolved = {}
        for title in chunk:
            final = redirects.get(normalized.get(title, title), normalized.get(title, title))
            resolved[final] = title
        for page in query.get("pages", []):
            names = [image["title"] for image in page.get("images", [])]
            best = choose_image(names, page["title"])
            if best:
                out[resolved.get(page["title"], page["title"])] = best
    return out


def choose_image(names, article_title):
    """Elige el archivo que parece el escudo del club, o None.

    Acepta si el nombre dice logo/crest/wappen/escudo, o si es basicamente el
    nombre del club ("File:THW Kiel.svg"). Rechaza fotos de plantel, canchas y
    banderas. Preferimos quedarnos cortos y caer al monograma antes que meter
    una foto de 11 MB donde va un escudo.
    """
    words = {w.lower() for w in re.findall(r"\w{4,}", article_title)}

    def usable(name):
        if SKIP_IMAGE.search(name) or PHOTO_HINT.search(name):
            return False
        if not name.lower().endswith((".svg", ".png", ".jpg", ".jpeg", ".gif")):
            return False
        # O dice "logo/wappen/escudo...", o el nombre del archivo es
        # basicamente el nombre del club ("File:THW Kiel.svg").
        lowered = name.lower()
        return bool(GOOD_IMAGE.search(lowered)) or any(word in lowered for word in words)

    candidates = [name for name in names if usable(name)]
    if not candidates:
        return None

    def score(name):
        lowered = name.lower()
        value = 6 if GOOD_IMAGE.search(lowered) else 0
        value += 3 * sum(1 for word in words if word in lowered)
        if lowered.endswith(".svg"):
            value += 4          # los escudos vectoriales casi nunca son fotos
        elif lowered.endswith(".png"):
            value += 2
        return value

    return max(candidates, key=score)


def image_urls(lang, file_titles):
    """File:Foo.svg -> url directa."""
    out = {}
    file_titles = list(file_titles)
    for start in range(0, len(file_titles), 20):
        chunk = file_titles[start:start + 20]
        data = api(lang, {
            "action": "query",
            "prop": "imageinfo",
            "iiprop": "url",
            "titles": "|".join(chunk),
        })
        for page in data.get("query", {}).get("pages", []):
            info = page.get("imageinfo")
            if info:
                out[page["title"]] = info[0]["url"]
    return out


def langlinks(lang, titles, wanted):
    """{titulo: {codigo_idioma: titulo_en_ese_idioma}} para los idiomas pedidos."""
    out = {}
    titles = list(titles)
    for start in range(0, len(titles), 20):
        chunk = titles[start:start + 20]
        data = api(lang, {
            "action": "query",
            "prop": "langlinks",
            "lllimit": "500",
            "titles": "|".join(chunk),
            "redirects": "1",
        })
        query = data.get("query", {})
        normalized = {n["from"]: n["to"] for n in query.get("normalized", [])}
        redirects = {r["from"]: r["to"] for r in query.get("redirects", [])}
        resolved = {}
        for title in chunk:
            final = redirects.get(normalized.get(title, title), normalized.get(title, title))
            resolved[final] = title
        for page in query.get("pages", []):
            links = {link["lang"]: link["title"]
                     for link in page.get("langlinks", []) if link["lang"] in wanted}
            if links:
                out[resolved.get(page["title"], page["title"])] = links
    return out


def pageimage(lang, titles):
    """Return {title: image url} using the pageimages extension (original size)."""
    out = {}
    titles = list(titles)
    for start in range(0, len(titles), 20):
        chunk = titles[start:start + 20]
        data = api(lang, {
            "action": "query",
            "prop": "pageimages",
            "piprop": "original|thumbnail",
            "pithumbsize": "512",
            "titles": "|".join(chunk),
            "redirects": "1",
        })
        query = data.get("query", {})
        normalized = {n["from"]: n["to"] for n in query.get("normalized", [])}
        redirects = {r["from"]: r["to"] for r in query.get("redirects", [])}
        resolved = {}
        for title in chunk:
            final = normalized.get(title, title)
            final = redirects.get(final, final)
            resolved[final] = title
        for page in query.get("pages", []):
            original = (page.get("original") or {}).get("source")
            thumb = (page.get("thumbnail") or {}).get("source")
            source = original or thumb
            if source:
                out[resolved.get(page["title"], page["title"])] = source
    return out
