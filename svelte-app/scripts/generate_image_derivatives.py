#!/usr/bin/env python3
"""
Generate web-ready image derivatives for the Global Heshmat app.

The artwork data references large originals kept in ``originals/`` (some up
to ~18 MB) — deliberately OUTSIDE ``static/`` so they are archived in the
repository but never shipped in the deployed site. The app only ever serves
two much smaller variants:

  * a **thumbnail** for the gallery / lightbox thumb strips, and
  * a **web** image for the main gallery view and the full-screen lightbox.

This script reads every image in ``originals/`` and writes downscaled WebP
copies into ``static/images/``, keeping the originals untouched:

    originals/<original>.jpeg            (left as-is, not deployed)
    static/images/web/<original>.webp    (long edge <= --web-size,  default 2000px)
    static/images/thumb/<original>.webp  (long edge <= --thumb-size, default 400px)

NAMING RULE (this is the contract the app relies on):
    The derivative keeps the original file's *stem* and swaps the extension
    for ``.webp``.  So in a Svelte component you map a stored filename to its
    derivative like this:

        const stem  = (f) => f.replace(/\\.[^./\\\\]+$/, '');
        const thumb = (src) => `/images/thumb/${stem(src)}.webp`;
        const web   = (src) => `/images/web/${stem(src)}.webp`;

FEATURES
  * Incremental: skips a derivative that is already newer than its source
    (use --force to rebuild everything).
  * EXIF-orientation aware (phone photos won't come out rotated).
  * Handles JPEG/PNG/TIFF natively, and HEIC if the optional ``pillow-heif``
    package is installed (otherwise HEIC files are reported and skipped).
  * Preserves transparency (PNG) by emitting RGBA WebP; flattens CMYK/other.
  * Detects stem collisions (e.g. ``foo.jpg`` + ``foo.tif`` -> same .webp) and
    reports them instead of silently overwriting.
  * Prints a size-savings summary at the end.

USAGE
    # from anywhere — paths are resolved relative to this script
    python svelte-app/scripts/generate_image_derivatives.py

    # rebuild everything, custom sizes
    python svelte-app/scripts/generate_image_derivatives.py --force \\
        --web-size 1920 --thumb-size 360

    # see what would happen without writing anything
    python svelte-app/scripts/generate_image_derivatives.py --dry-run

Requires: Pillow  (pip install Pillow)
Optional: pillow-heif  (pip install pillow-heif)   # for .HEIC sources
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Force UTF-8 stdout/stderr so filenames with umlauts / diacritics don't crash
# the default cp1252 Windows console.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:
    sys.exit("ERROR: Pillow is not installed. Run:  pip install Pillow")

# Optional HEIC/HEIF support.
HEIF_OK = False
try:
    import pillow_heif  # type: ignore

    pillow_heif.register_heif_opener()
    HEIF_OK = True
except Exception:
    HEIF_OK = False

# Source extensions we attempt to process. Output is always .webp.
SOURCE_EXTS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic", ".heif"}

# Sub-folder names created inside the images directory.
WEB_DIRNAME = "web"
THUMB_DIRNAME = "thumb"


def human(n: float) -> str:
    """Human-readable byte size."""
    for unit in ("B", "KB", "MB", "GB"):
        if abs(n) < 1024.0:
            return f"{n:,.1f} {unit}"
        n /= 1024.0
    return f"{n:,.1f} TB"


def normalise(im: Image.Image) -> Image.Image:
    """Apply EXIF orientation and convert to a WebP-friendly mode."""
    im = ImageOps.exif_transpose(im)
    has_alpha = im.mode in ("RGBA", "LA") or (
        im.mode == "P" and "transparency" in im.info
    )
    return im.convert("RGBA" if has_alpha else "RGB")


def make_derivative(
    src: Path,
    dst: Path,
    max_edge: int,
    quality: int,
    *,
    force: bool,
    dry_run: bool,
) -> tuple[str, int]:
    """
    Build one derivative. Returns (status, bytes_written) where status is one
    of: "written", "skipped", "error". bytes_written is 0 unless "written".
    """
    # Incremental: skip if an up-to-date derivative already exists.
    if (
        not force
        and dst.exists()
        and dst.stat().st_mtime >= src.stat().st_mtime
    ):
        return "skipped", 0

    if dry_run:
        return "written", 0

    try:
        with Image.open(src) as im:
            im = normalise(im)
            # thumbnail() preserves aspect ratio and only ever downscales,
            # so small originals are copied through at their native size.
            im.thumbnail((max_edge, max_edge), Image.LANCZOS)
            dst.parent.mkdir(parents=True, exist_ok=True)
            save_kwargs = {"quality": quality, "method": 6}
            im.save(dst, "WEBP", **save_kwargs)
        return "written", dst.stat().st_size
    except Exception as exc:  # noqa: BLE001 - report and keep going
        print(f"  ! ERROR  {src.name}: {exc}")
        return "error", 0


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    default_src = script_dir.parent / "originals"
    default_out = script_dir.parent / "static" / "images"

    ap = argparse.ArgumentParser(
        description="Generate WebP thumbnail + web derivatives for app images.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    ap.add_argument(
        "--src",
        type=Path,
        default=default_src,
        help="Folder containing the original images.",
    )
    ap.add_argument(
        "--out",
        type=Path,
        default=default_out,
        help="Folder that receives the web/ and thumb/ output sub-folders.",
    )
    ap.add_argument("--web-size", type=int, default=2000, help="Web long-edge (px).")
    ap.add_argument("--thumb-size", type=int, default=400, help="Thumb long-edge (px).")
    ap.add_argument("--web-quality", type=int, default=82, help="Web WebP quality.")
    ap.add_argument(
        "--thumb-quality", type=int, default=72, help="Thumb WebP quality."
    )
    ap.add_argument(
        "--recursive",
        action="store_true",
        help="Recurse into sub-folders (output folders are always skipped).",
    )
    ap.add_argument(
        "--force", action="store_true", help="Rebuild even if up-to-date."
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="List what would be done without writing files.",
    )
    args = ap.parse_args()

    src_dir: Path = args.src
    if not src_dir.is_dir():
        sys.exit(f"ERROR: source folder not found: {src_dir}")

    out_dir: Path = args.out
    web_dir = out_dir / WEB_DIRNAME
    thumb_dir = out_dir / THUMB_DIRNAME
    # Guard against output folders living inside the source folder (the old
    # layout) — never treat generated files as sources.
    skip_dirs = {web_dir.resolve(), thumb_dir.resolve()}

    # Collect source files (never descend into our own output folders).
    globber = src_dir.rglob("*") if args.recursive else src_dir.glob("*")
    sources: list[Path] = []
    for p in globber:
        if not p.is_file():
            continue
        if any(parent.resolve() in skip_dirs for parent in p.parents):
            continue
        if p.suffix.lower() in SOURCE_EXTS:
            sources.append(p)
    sources.sort(key=lambda p: p.name.lower())

    if not sources:
        sys.exit(f"No images found in {src_dir}")

    # Detect stem collisions (foo.jpg + foo.tif -> foo.webp).
    seen: dict[str, Path] = {}
    collisions: list[tuple[Path, Path]] = []
    for p in sources:
        key = p.with_suffix(".webp").name.lower()
        if key in seen:
            collisions.append((seen[key], p))
        else:
            seen[key] = p

    heic_present = any(p.suffix.lower() in (".heic", ".heif") for p in sources)

    print(f"Source folder : {src_dir}")
    print(f"Web output    : {web_dir}   (<= {args.web_size}px, q{args.web_quality})")
    print(
        f"Thumb output  : {thumb_dir}   (<= {args.thumb_size}px, q{args.thumb_quality})"
    )
    print(f"Images found  : {len(sources)}")
    if args.dry_run:
        print(">>> DRY RUN — no files will be written")
    if heic_present and not HEIF_OK:
        print(
            "!!! HEIC/HEIF sources detected but 'pillow-heif' is not installed.\n"
            "    Install it to convert them:  pip install pillow-heif\n"
            "    (those files will be reported as errors below for now)"
        )
    if collisions:
        print("!!! Name collisions — these map to the SAME .webp, rename one:")
        for a, b in collisions:
            print(f"      {a.name}   <->   {b.name}")
    print("-" * 64)

    stats = {"written": 0, "skipped": 0, "error": 0}
    out_bytes = 0
    in_bytes_processed = 0

    for i, src in enumerate(sources, 1):
        rel = src.relative_to(src_dir)
        stem_name = src.with_suffix(".webp").name
        web_out = web_dir / stem_name
        thumb_out = thumb_dir / stem_name

        s1, b1 = make_derivative(
            src, web_out, args.web_size, args.web_quality,
            force=args.force, dry_run=args.dry_run,
        )
        s2, b2 = make_derivative(
            src, thumb_out, args.thumb_size, args.thumb_quality,
            force=args.force, dry_run=args.dry_run,
        )

        out_bytes += b1 + b2
        if "written" in (s1, s2):
            in_bytes_processed += src.stat().st_size

        # Per-file status line.
        tag = {
            ("written", "written"): "OK ",
            ("skipped", "skipped"): "-- ",
        }.get((s1, s2), f"{s1[:2]}/{s2[:2]}")
        if "error" in (s1, s2):
            stats["error"] += 1
        elif s1 == "written" or s2 == "written":
            stats["written"] += 1
        else:
            stats["skipped"] += 1

        # Keep the log quiet for skips unless verbose-ish; show written/errors.
        if (s1, s2) != ("skipped", "skipped"):
            print(f"  [{i:>3}/{len(sources)}] {tag} {rel}")

    print("-" * 64)
    print(
        f"Done. written={stats['written']}  skipped={stats['skipped']}  "
        f"errors={stats['error']}"
    )
    if not args.dry_run and stats["written"]:
        print(
            f"Originals processed: {human(in_bytes_processed)}  ->  "
            f"derivatives: {human(out_bytes)} "
            f"({(1 - out_bytes / in_bytes_processed) * 100:.0f}% smaller)"
            if in_bytes_processed
            else ""
        )
    return 1 if stats["error"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
