#!/usr/bin/env python3
"""Achica los escudos al tamaño que realmente se muestra.

    python3 scripts/optimize_crests.py

En pantalla un escudo ocupa 40×46 px; algunos venían a 2000 px y 1,5 MB. Bajarlos
a 160 px de lado es la diferencia entre que el juego cargue al instante en un
celular con datos o que la gente se vaya antes de jugar.

Los SVG no se tocan: ya pesan poco y escalan solos.

Cuando un escudo cambia de extensión (.png→.jpg o viceversa), el script
reescribe él mismo las rutas en todos los json de data/. Antes sugería
`build_dataset.py`, que reconstruye desde la semilla y pisa los escudos que
asignan los pasos posteriores — una vez rompió 80 rutas de un saque.
"""
import glob
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRESTS = os.path.join(ROOT, "assets", "crests")
DATA = os.path.join(ROOT, "data")
MAX_SIDE = 160


def rewrite_paths(renames):
    """Reescribe assets/crests/... en cada json de data/ según los renombres."""
    if not renames:
        return
    for path in sorted(glob.glob(os.path.join(DATA, "*.json"))):
        payload = json.load(open(path, encoding="utf8"))
        count = 0

        def fix(node):
            nonlocal count
            if isinstance(node, dict):
                for key, value in node.items():
                    if isinstance(value, str) and value in renames:
                        node[key] = renames[value]
                        count += 1
                    else:
                        fix(value)
            elif isinstance(node, list):
                for item in node:
                    fix(item)

        fix(payload)
        if count:
            with open(path, "w", encoding="utf8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=1)
                handle.write("\n")
            print(f"  ↳ {os.path.relpath(path, ROOT)}: {count} rutas reescritas")


def optimize():
    before = after = 0
    touched = 0
    renames = {}

    for name in sorted(os.listdir(CRESTS)):
        path = os.path.join(CRESTS, name)
        if name.lower().endswith(".svg") or not os.path.isfile(path):
            continue
        size = os.path.getsize(path)
        before += size

        try:
            image = Image.open(path)
        except Exception as error:  # noqa: BLE001
            print(f"  ! {name}: {error}")
            after += size
            continue

        needs_resize = max(image.size) > MAX_SIDE
        if not needs_resize and size < 40_000:
            after += size
            continue

        # Sólo pasamos a PNG lo que tiene transparencia. Convertir un JPEG de
        # 200x200 a PNG lo hace más grande, no más chico: es lo contrario de
        # lo que este script tiene que hacer.
        has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
        if needs_resize:
            image = image.convert("RGBA" if has_alpha else "RGB")
            image.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)

        if has_alpha:
            target = os.path.splitext(path)[0] + ".png"
            image.save(target, "PNG", optimize=True)
        else:
            target = os.path.splitext(path)[0] + ".jpg"
            image.convert("RGB").save(target, "JPEG", quality=86, optimize=True)

        if os.path.getsize(target) >= size and target != path:
            # No mejoró: nos quedamos con el original.
            os.remove(target)
            after += size
            continue
        if target != path:
            os.remove(path)
            renames[f"assets/crests/{name}"] = f"assets/crests/{os.path.basename(target)}"
        after += os.path.getsize(target)
        touched += 1

    print(f"optimizados {touched} escudos")
    print(f"  antes: {before / 1_048_576:.1f} MB   después: {after / 1_048_576:.1f} MB "
          f"({100 - after * 100 // max(before, 1)} % menos)")
    if renames:
        print(f"  {len(renames)} cambiaron de extensión, reescribiendo data/:")
        rewrite_paths(renames)


if __name__ == "__main__":
    if not os.path.isdir(CRESTS):
        sys.exit("no hay assets/crests")
    optimize()
