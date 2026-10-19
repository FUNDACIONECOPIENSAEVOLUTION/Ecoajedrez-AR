#!/usr/bin/env python3
"""Descarga CC0 1K PBR de Poly Haven para ECOAJEDREZ. Python estándar, sin claves ni pagos.
Uso: python scripts/descargar-relieves-pbr.py [--strict]
Los mapas fotográficos se guardan LOCALMENTE; el navegador no solicita nada a Poly Haven.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import time
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent / "assets" / "texturas-pbr"
USER_AGENT = "EcoajedrezAR-PBR/1.0 (+https://github.com/FUNDACIONECOPIENSAEVOLUTION/Ecoajedrez-AR)"
# Todos los IDs corresponden a activos publicados CC0 (no Vault).
ASSETS = {
    "walnut": "walnut_veneer",
    "oak": "oak_wood_planks",
    "stone": "rock_01",
    "marble": "marble_01",
    "obsidian": "dark_rock",
    "bronze": "rusty_metal_02",
    "gold": "metal_plate_02",
    "ice": "snow_02",
    "basalt": "volcanic_rock_tiles",
}
ROLES = {"color": "Diffuse", "normal": "nor_gl", "roughness": "Rough",
         "height": "Displacement", "metalness": "Metal"}
REQUIRED = ("color", "normal", "roughness")
MAX_BYTES = 2_000_000

def request_bytes(url, limit):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ("api.polyhaven.com", "dl.polyhaven.org"):
        raise ValueError("Dominio de descarga no autorizado: " + parsed.hostname.__str__())
    last_error = None
    for attempt in range(3):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json,image/jpeg,image/png,image/webp"})
            with urlopen(req, timeout=24) as response:
                body = response.read(limit + 1)
            if not body or len(body) > limit:
                raise ValueError("Archivo vacío o mayor del límite")
            return body
        except Exception as exc:
            last_error = exc
            if attempt < 2: time.sleep(1 + attempt * 2)
    raise last_error

def valid_image(blob, extension):
    return (len(blob) >= 256 and
            (extension == "jpg" and blob.startswith(bytes.fromhex("ffd8ff")) or
             extension == "png" and blob.startswith(bytes.fromhex("89504e470d0a1a0a")) or
             extension == "webp" and blob[:4] == b"RIFF" and blob[8:12] == b"WEBP"))

def select_file(tree, map_key):
    choices = tree.get(map_key, {}).get("1k", {})
    for ext in ("jpg", "webp", "png"):
        item = choices.get(ext)
        if isinstance(item, dict) and isinstance(item.get("url"), str):
            return ext, item
    return None, None

def install_one(name, slug):
    directory = ROOT / name
    directory.mkdir(parents=True, exist_ok=True)
    # Los mapas antiguos permanecen funcionales si el proveedor tiene una interrupción.
    payload = json.loads(request_bytes(f"https://api.polyhaven.com/files/{slug}", 3_000_000))
    successful = []
    for role, source_key in ROLES.items():
        ext, meta = select_file(payload, source_key)
        if not meta:
            if role in REQUIRED: raise RuntimeError(f"{slug}: falta mapa obligatorio {source_key} 1K")
            continue
        target = directory / (role + "." + ext)
        if target.exists() and valid_image(target.read_bytes(), ext) and target.stat().st_size <= MAX_BYTES:
            successful.append(role)
            continue
        # Descarga únicamente un dominio de archivos oficial HTTPS, máximo 2 MB por mapa.
        blob = request_bytes(meta["url"], MAX_BYTES)
        if not valid_image(blob, ext):
            raise ValueError("Firma de imagen incorrecta: " + name + "/" + role)
        md5 = meta.get("md5")
        if md5 and hashlib.md5(blob).hexdigest().lower() != md5.lower():
            raise ValueError("Checksum incorrecto: " + name + "/" + role)
        temporary = target.with_suffix(target.suffix + ".part")
        temporary.write_bytes(blob)
        temporary.replace(target)
        successful.append(role)
        print(f"  {role}.{ext}: {len(blob)//1024} KiB")
    if any(role not in successful for role in REQUIRED):
        raise RuntimeError(f"{name}: mapas PBR incompletos")
    return len(successful)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict", action="store_true", help="Fallar si cualquier material no se puede descargar")
    args = parser.parse_args()
    ready, failed = [], []
    for name, slug in ASSETS.items():
        print(f"[{name}] Fuente CC0: https://polyhaven.com/a/{slug}", flush=True)
        try:
            count = install_one(name, slug)
            ready.append(name)
            print(f"  OK: {count} mapas PBR")
        except Exception as exc:
            failed.append((name, str(exc)))
            print(f"  NO DISPONIBLE: {exc}", file=sys.stderr)
    ROOT.mkdir(parents=True, exist_ok=True)
    # Registro humano de procedencia; build-pages.mjs genera su manifest público filtrado.
    (ROOT / "FUENTES_CC0.json").write_text(json.dumps({
        "source": "Poly Haven CC0", "license": "CC0-1.0",
        "source_urls": {n: f"https://polyhaven.com/a/{s}" for n, s in ASSETS.items()},
        "downloaded_materials": ready, "failed_materials": failed,
        "resolution": "1K", "color_space": "sRGB for color, linear for data maps"
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Descargados {len(ready)}/9; pendientes: {len(failed)}")
    return int(bool(failed) and args.strict)

if __name__ == "__main__":
    sys.exit(main())
