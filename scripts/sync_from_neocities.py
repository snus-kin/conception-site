#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["httpx"]
# ///
"""
Sync files from Neocities to the local repository.

This script fetches the current state of files from Neocities and updates
the local repository to match. Useful when someone makes manual changes
directly on Neocities.

Usage:
    ./scripts/sync_from_neocities.py              # Sync all files
    ./scripts/sync_from_neocities.py --dry-run    # Show what would be synced without making changes

Environment:
    NEOCITIES_API_TOKEN: Your Neocities API token (required)
                         Get it from: https://neocities.org/settings/YOUR_SITE_NAME

    You can also create a .env file in the project root with:
        NEOCITIES_API_TOKEN=your_token_here
"""

import argparse
import hashlib
import os
import sys
from pathlib import Path

import httpx

# Neocities API endpoints
NEOCITIES_API_BASE = "https://neocities.org/api"
SITE_BASE_URL = "https://conceivedconception.neocities.org"

# Files/directories to skip syncing (these shouldn't be on Neocities anyway)
SKIP_PATTERNS = {
    ".git",
    ".github",
    ".gitignore",
    ".env",
    "scripts",
    ".DS_Store",
    "desktop.ini",
    "README.md",
    "sitemap.xml",
}


def load_env_file(project_root: Path) -> None:
    """Load environment variables from .env file if it exists."""
    env_file = project_root / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


def get_api_token() -> str:
    """Get the Neocities API token from environment."""
    token = os.environ.get("NEOCITIES_API_TOKEN")
    if not token:
        print(
            "Error: NEOCITIES_API_TOKEN environment variable not set", file=sys.stderr
        )
        print("\nTo get your API token:", file=sys.stderr)
        print(
            "  1. Go to https://neocities.org/settings/conceivedconception",
            file=sys.stderr,
        )
        print("  2. Click 'API Key' and generate/copy your key", file=sys.stderr)
        print("  3. Set it as: export NEOCITIES_API_TOKEN=your_key", file=sys.stderr)
        print(
            "     Or create a .env file with: NEOCITIES_API_TOKEN=your_key",
            file=sys.stderr,
        )
        sys.exit(1)
    return token


def should_skip(path: str) -> bool:
    """Check if a path should be skipped during sync."""
    parts = Path(path).parts
    return any(part in SKIP_PATTERNS for part in parts)


def get_remote_file_list(client: httpx.Client, token: str) -> list[dict]:
    """Get list of all files from Neocities with their SHA1 hashes."""
    response = client.get(
        f"{NEOCITIES_API_BASE}/list",
        headers={"Authorization": f"Bearer {token}"},
    )
    response.raise_for_status()
    data = response.json()

    if data.get("result") != "success":
        raise RuntimeError(f"API error: {data}")

    return data.get("files", [])


def download_file(client: httpx.Client, path: str) -> bytes:
    """Download a file from the Neocities site."""
    url = f"{SITE_BASE_URL}/{path}"
    response = client.get(url)
    response.raise_for_status()
    return response.content


def compute_sha1(content: bytes) -> str:
    """Compute SHA1 hash of content (matches Neocities API format)."""
    return hashlib.sha1(content).hexdigest()


def get_local_sha1(file_path: Path) -> str | None:
    """Get SHA1 hash of a local file, or None if it doesn't exist."""
    if not file_path.exists():
        return None
    return compute_sha1(file_path.read_bytes())


def sync_from_neocities(project_root: Path, dry_run: bool = False) -> None:
    """Sync files from Neocities to the local repository."""
    token = get_api_token()

    print(f"{'[DRY RUN] ' if dry_run else ''}Syncing from Neocities...\n")

    with httpx.Client(timeout=30.0) as client:
        # Get list of files on Neocities (includes SHA1 hashes!)
        print("Fetching file list from Neocities...")
        remote_files = get_remote_file_list(client, token)

        files_updated = 0
        files_added = 0
        files_unchanged = 0

        for file_info in remote_files:
            path = file_info.get("path", "").lstrip("/")
            is_directory = file_info.get("is_directory", False)
            remote_sha1 = file_info.get("sha1_hash")

            # Skip directories and files matching skip patterns
            if is_directory or should_skip(path):
                continue

            local_path = project_root / path

            # Compare SHA1 hashes without downloading
            local_sha1 = get_local_sha1(local_path)

            if local_sha1 == remote_sha1:
                # Files are identical, skip
                files_unchanged += 1
                continue

            # Files differ or local doesn't exist - need to download
            try:
                remote_content = download_file(client, path)
            except httpx.HTTPError as e:
                print(f"  Warning: Failed to download {path}: {e}")
                continue

            if local_sha1 is None:
                # New file from Neocities
                action = "Would add" if dry_run else "Added"
                print(f"  {action}: {path}")

                if not dry_run:
                    local_path.parent.mkdir(parents=True, exist_ok=True)
                    local_path.write_bytes(remote_content)
                files_added += 1
            else:
                # Files differ
                action = "Would update" if dry_run else "Updated"
                print(f"  {action}: {path}")

                if not dry_run:
                    local_path.write_bytes(remote_content)
                files_updated += 1

        # Summary
        print("\nSummary:")
        print(f"  Files {'would be ' if dry_run else ''}updated: {files_updated}")
        print(f"  Files {'would be ' if dry_run else ''}added: {files_added}")
        print(f"  Files unchanged: {files_unchanged}")

        if dry_run and (files_updated > 0 or files_added > 0):
            print("\nRun without --dry-run to apply these changes.")

        if not dry_run and (files_updated > 0 or files_added > 0):
            print("\nDon't forget to commit and push the changes!")
            print("  git add -A && git commit -m 'chore: sync from Neocities'")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync files from Neocities to the local repository"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be synced without making changes",
    )
    args = parser.parse_args()

    # Determine project root (parent of scripts directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    # Load .env file if present
    load_env_file(project_root)

    sync_from_neocities(project_root, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
