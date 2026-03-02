#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""
Update sitemap.xml with current lastmod dates based on file modification times.

Usage:
    ./scripts/update_sitemap.py              # Run from project root
    ./scripts/update_sitemap.py --all-today  # Set all lastmod dates to today's date
"""

import argparse
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

# Sitemap XML namespace
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", SITEMAP_NS)


def get_file_mod_date(file_path: Path) -> str:
    """Get the modification date of a file in YYYY-MM-DD format."""
    if file_path.exists():
        mod_time = os.path.getmtime(file_path)
        return datetime.fromtimestamp(mod_time, tz=timezone.utc).strftime("%Y-%m-%d")
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_today() -> str:
    """Get today's date in YYYY-MM-DD format."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def url_to_filename(url: str) -> str | None:
    """Extract the filename from a sitemap URL."""
    match = re.search(r"https?://[^/]+/(.*)$", url)
    if match:
        path = match.group(1)
        if not path or path.endswith("/"):
            return "index.html"
        return path
    return None


def update_sitemap(sitemap_path: Path, all_today: bool = False) -> None:
    """Update the sitemap.xml file with current lastmod dates."""
    if not sitemap_path.exists():
        print(f"Error: Sitemap not found at {sitemap_path}", file=sys.stderr)
        sys.exit(1)

    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    base_dir = sitemap_path.parent
    today = get_today()
    updates_made = 0

    # Find all <url> elements
    for url_elem in root.findall(f"{{{SITEMAP_NS}}}url"):
        loc_elem = url_elem.find(f"{{{SITEMAP_NS}}}loc")
        lastmod_elem = url_elem.find(f"{{{SITEMAP_NS}}}lastmod")

        if loc_elem is None or loc_elem.text is None:
            continue

        url = loc_elem.text

        # Determine new date
        if all_today:
            new_date = today
        else:
            filename = url_to_filename(url)
            if filename:
                file_path = base_dir / filename
                new_date = get_file_mod_date(file_path)
            else:
                new_date = today

        # Update or create lastmod element
        if lastmod_elem is not None:
            old_date = lastmod_elem.text
            if old_date != new_date:
                updates_made += 1
                print(f"  {url}: {old_date} -> {new_date}")
                lastmod_elem.text = new_date
        else:
            # Create lastmod element if it doesn't exist
            lastmod_elem = ET.SubElement(url_elem, f"{{{SITEMAP_NS}}}lastmod")
            lastmod_elem.text = new_date
            updates_made += 1
            print(f"  {url}: (none) -> {new_date}")

    if updates_made > 0:
        # Indent the XML for readability
        ET.indent(tree, space="  ")
        tree.write(
            sitemap_path,
            encoding="UTF-8",
            xml_declaration=True,
        )
        # Add newline at end of file
        with open(sitemap_path, "a") as f:
            f.write("\n")
        print(f"\nUpdated {updates_made} lastmod date(s) in {sitemap_path}")
    else:
        print(f"No updates needed for {sitemap_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update sitemap.xml with current lastmod dates"
    )
    parser.add_argument(
        "--all-today",
        action="store_true",
        help="Set all lastmod dates to today's date instead of file modification times",
    )
    parser.add_argument(
        "sitemap",
        nargs="?",
        default=None,
        help="Path to sitemap.xml (default: ../sitemap.xml relative to script)",
    )
    args = parser.parse_args()

    # Default to sitemap.xml in the parent directory (project root)
    if args.sitemap:
        sitemap_path = Path(args.sitemap)
    else:
        script_dir = Path(__file__).parent
        sitemap_path = script_dir.parent / "sitemap.xml"

    # If the path doesn't exist and we're given just a filename,
    # try looking relative to the project root (script's parent dir)
    if not sitemap_path.exists() and not sitemap_path.is_absolute():
        script_dir = Path(__file__).parent
        alt_path = script_dir.parent / sitemap_path
        if alt_path.exists():
            sitemap_path = alt_path

    print(f"Updating sitemap: {sitemap_path.resolve()}")
    print(
        f"Mode: {'all dates to today' if args.all_today else 'file modification times'}"
    )
    print()

    update_sitemap(sitemap_path, all_today=args.all_today)


if __name__ == "__main__":
    main()
