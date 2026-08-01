"""Pull club lists out of Wikipedia league-season wikitext."""
import re

LINK = re.compile(r"\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]")
SKIP_PREFIXES = ("Fichier:", "File:", "Datei:", "Image:", "Catégorie:", "Kategorie:", "Category:")


def section(text, *names):
    for name in names:
        match = re.search(r"^==+\s*" + re.escape(name) + r"\s*==+\s*$", text, re.M)
        if not match:
            continue
        rest = text[match.end():]
        end = re.search(r"^==[^=]", rest, re.M)
        return rest[:end.start()] if end else rest
    return None


def tables(text):
    out, depth, start = [], 0, None
    for match in re.finditer(r"\{\||\|\}", text):
        if match.group(0) == "{|":
            if depth == 0:
                start = match.end()
            depth += 1
        else:
            depth -= 1
            if depth == 0 and start is not None:
                out.append(text[start:match.start()])
                start = None
    return out


def rows(table):
    return [r for r in re.split(r"^\|-.*$", table, flags=re.M)[1:] if r.strip()]


def first_link(chunk):
    for target, label in LINK.findall(chunk):
        target = target.strip()
        if target.startswith(SKIP_PREFIXES):
            continue
        return target, (label or target).strip()
    return None, None


def clubs_from_table(table, column=0):
    found = []
    for row in rows(table):
        cells = re.split(r"\|\||\n\|", row)
        cells = [c for c in cells if c.strip() and not c.strip().startswith("!")]
        if len(cells) <= column:
            continue
        target, label = first_link(cells[column])
        if target and target not in [c[0] for c in found]:
            found.append((target, label))
    return found


def clubs_from_bullets(text, deep=False):
    found = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("*"):
            continue
        if not deep and line.startswith("**"):
            continue
        target, label = first_link(line)
        if target and target not in [c[0] for c in found]:
            found.append((target, label))
    return found


TEMPLATE_FIELD = re.compile(r"(?:Verein|Team|Mannschaft|Klub|Club)\s*=\s*(\[\[[^\]]+\]\][^|}\n]*)")


def clubs_from_templates(text):
    found = []
    for chunk in TEMPLATE_FIELD.findall(text):
        target, label = first_link(chunk)
        if target and target not in [c[0] for c in found]:
            found.append((target, label))
    return found


def clubs_from_section(text, *names, min_clubs=6):
    body = section(text, *names)
    if body is None:
        body = text
    best = clubs_from_bullets(body)
    for candidate in (clubs_from_bullets(body, deep=True), clubs_from_templates(body)):
        if len(candidate) > len(best):
            best = candidate
    for table in tables(body):
        found = clubs_from_table(table)
        if len(found) > len(best):
            best = found
    return best if len(best) >= min_clubs else []
