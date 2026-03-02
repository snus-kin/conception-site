#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["beautifulsoup4"]
# ///
"""
Generate or update LD-JSON structured data in HTML files based on their content.

This script analyzes HTML files and generates appropriate schema.org structured data
based on the page type and content.

Usage:
    ./scripts/generate_ld_json.py              # Process all HTML files
    ./scripts/generate_ld_json.py index.html   # Process a specific file
    ./scripts/generate_ld_json.py --dry-run    # Show what would be generated without modifying files
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

# Base URL for the site
BASE_URL = "https://conceivedconception.neocities.org"

# Organization info used across multiple schemas
ORGANIZATION_INFO = {
    "@type": "Organization",
    "name": "Conception",
    "url": f"{BASE_URL}/",
    "logo": f"{BASE_URL}/Images/faviconcept.png",
    "email": "ourconception@gmail.com",
}


def get_meta_content(
    soup: BeautifulSoup, name: str | None = None, property: str | None = None
) -> str | None:
    """Extract content from a meta tag by name or property."""
    if name:
        tag = soup.find("meta", attrs={"name": name})
    elif property:
        tag = soup.find("meta", attrs={"property": property})
    else:
        return None

    if tag and tag.get("content"):
        return tag["content"]
    return None


def get_canonical_url(soup: BeautifulSoup) -> str | None:
    """Extract the canonical URL from the page."""
    link = soup.find("link", attrs={"rel": "canonical"})
    if link and link.get("href"):
        return link["href"]
    return None


def get_page_title(soup: BeautifulSoup) -> str:
    """Extract the page title."""
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text(strip=True)
    return "Conception"


def get_page_description(soup: BeautifulSoup) -> str:
    """Extract the page description from meta tags."""
    description = get_meta_content(soup, name="description")
    if description:
        return description

    og_description = get_meta_content(soup, property="og:description")
    if og_description:
        return og_description

    return "Conception - An experimental open mic in Leeds, UK"


def detect_page_type(soup: BeautifulSoup, filename: str) -> str:
    """Detect the type of page based on filename and content."""
    name = filename.lower()

    if name == "index.html":
        return "organization"
    elif name == "faq.html":
        return "faq"
    elif name == "when.html":
        return "events"
    elif name == "testimonials.html":
        return "testimonials"
    elif name == "gallery.html":
        return "gallery"
    elif name == "who.html":
        return "about"
    elif name == "what.html":
        return "about"
    elif name == "words.html":
        return "articles"
    elif name == "not_found.html":
        return "error"
    else:
        return "webpage"


def normalize_whitespace(text: str) -> str:
    """Normalize whitespace in text, collapsing multiple spaces and newlines."""
    # Replace multiple whitespace characters (including newlines) with a single space
    return " ".join(text.split())


def get_text_with_spacing(element) -> str:
    """Extract text from an element, ensuring spaces around inline elements like links."""
    if element is None:
        return ""

    # Get all text parts, adding spaces around links
    parts = []
    for child in element.children:
        if hasattr(child, "name") and child.name == "a":
            # Add space before and after link text
            parts.append(f" {child.get_text(strip=True)} ")
        elif hasattr(child, "get_text"):
            parts.append(child.get_text())
        else:
            parts.append(str(child))

    return normalize_whitespace("".join(parts))


def extract_faq_items(soup: BeautifulSoup) -> list[dict[str, Any]]:
    """Extract FAQ items from the page content."""
    faq_items = []

    # Look for FAQ items in div.faq-item elements
    for faq_div in soup.find_all("div", class_="faq-item"):
        h2 = faq_div.find("h2")
        p = faq_div.find("p")

        if h2 and p:
            question = normalize_whitespace(h2.get_text(strip=True))
            # Get text content, with proper spacing around links
            answer_text = get_text_with_spacing(p)

            faq_items.append(
                {
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {"@type": "Answer", "text": answer_text},
                }
            )

    return faq_items


def extract_testimonials(soup: BeautifulSoup) -> list[dict[str, Any]]:
    """Extract testimonials/reviews from the page content."""
    reviews = []

    for testimonial_div in soup.find_all("div", class_="testimonial"):
        quote = testimonial_div.find("p", class_="testimonial-quote")

        if quote:
            review_text = normalize_whitespace(quote.get_text(strip=True).strip('"'))

            reviews.append(
                {
                    "@type": "Review",
                    "reviewBody": review_text,
                    "author": {"@type": "Person", "name": "Anonymous"},
                    "itemReviewed": {"@type": "Event", "name": "Conception Open Mic"},
                }
            )

    return reviews


def extract_events(
    soup: BeautifulSoup,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Extract upcoming and past events from the page content."""
    upcoming_events = []
    past_events = []

    current_section = None

    for element in soup.find("main").descendants if soup.find("main") else []:
        if element.name == "h2":
            text = element.get_text(strip=True).lower()
            if "upcoming" in text:
                current_section = "upcoming"
            elif "previous" in text or "past" in text:
                current_section = "past"

        if element.name == "li" and current_section:
            text = element.get_text(strip=True)
            # Parse date format: DD/MM/YYYY
            date_match = re.search(r"(\d{2})/(\d{2})/(\d{4})", text)

            if date_match:
                day, month, year = date_match.groups()
                iso_date = f"{year}-{month}-{day}"

                # Extract venue name from link
                link = element.find("a")
                venue_name = link.get_text(strip=True) if link else "TBA"

                event = {
                    "@type": "Event",
                    "name": f"Conception Open Mic - {_month_name(int(month))} {year}",
                    "startDate": iso_date,
                    "eventStatus": "https://schema.org/EventScheduled",
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "location": {
                        "@type": "Place",
                        "name": venue_name,
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Leeds",
                            "addressCountry": "UK",
                        },
                    },
                }

                if current_section == "upcoming":
                    upcoming_events.append(event)
                else:
                    past_events.append(event)

    return upcoming_events, past_events


def _month_name(month_num: int) -> str:
    """Convert month number to name."""
    months = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    return months[month_num] if 1 <= month_num <= 12 else ""


def extract_gallery_images(soup: BeautifulSoup) -> list[str]:
    """Extract image URLs from gallery page."""
    images = []

    # Look for images in the gallery
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "poster" in src.lower() or "gallery" in src.lower():
            # Make sure it's an absolute URL
            if not src.startswith("http"):
                src = f"{BASE_URL}/{src.lstrip('/')}"
            images.append(src)

    # Also look for buttons with background images or data attributes
    for button in soup.find_all("button"):
        onclick = button.get("onclick", "")
        # Extract image URL from onclick handler
        img_match = re.search(
            r"['\"]([^'\"]+\.(?:png|jpg|jpeg|gif|webp))['\"]", onclick, re.IGNORECASE
        )
        if img_match:
            img_url = img_match.group(1)
            if not img_url.startswith("http"):
                img_url = f"{BASE_URL}/{img_url.lstrip('/')}"
            if img_url not in images:
                images.append(img_url)

    return images


def extract_articles(soup: BeautifulSoup) -> list[dict[str, Any]]:
    """Extract article links from the words page."""
    articles = []

    for li in soup.find_all("li"):
        link = li.find("a")
        if link:
            text = li.get_text(strip=True)
            title = link.get_text(strip=True)
            url = link.get("href", "")

            # Extract author if present (format: "Title — Author")
            author = "Conception"
            if "—" in text:
                parts = text.split("—")
                if len(parts) > 1:
                    author = parts[-1].strip()

            articles.append(
                {
                    "@type": "Article",
                    "name": title,
                    "url": url,
                    "author": {"@type": "Person", "name": author},
                }
            )

    return articles


def generate_ld_json(soup: BeautifulSoup, filename: str) -> dict[str, Any] | None:
    """Generate appropriate LD-JSON based on page type and content."""
    page_type = detect_page_type(soup, filename)

    title = get_page_title(soup)
    description = get_page_description(soup)
    canonical_url = get_canonical_url(soup) or f"{BASE_URL}/{filename}"

    if page_type == "organization":
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Conception",
            "description": description,
            "url": f"{BASE_URL}/",
            "logo": f"{BASE_URL}/Images/faviconcept.png",
            "email": "ourconception@gmail.com",
            "location": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Leeds",
                    "addressCountry": "UK",
                },
            },
            "sameAs": ["https://www.instagram.com/conceivedconception/"],
        }

    elif page_type == "faq":
        faq_items = extract_faq_items(soup)
        if faq_items:
            return {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faq_items,
            }

    elif page_type == "events":
        upcoming_events, _ = extract_events(soup)
        return {
            "@context": "https://schema.org",
            "@type": "EventSeries",
            "name": "Conception Open Mic",
            "description": description,
            "url": canonical_url,
            "location": {
                "@type": "Place",
                "name": "Various venues in Leeds",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Leeds",
                    "addressCountry": "UK",
                },
            },
            "organizer": ORGANIZATION_INFO,
            "isAccessibleForFree": True,
            "eventSchedule": upcoming_events if upcoming_events else [],
        }

    elif page_type == "testimonials":
        reviews = extract_testimonials(soup)
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": canonical_url,
            "mainEntity": {"@type": "ItemList", "itemListElement": reviews},
        }

    elif page_type == "gallery":
        images = extract_gallery_images(soup)
        return {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": title,
            "description": description,
            "url": canonical_url,
            "image": images if images else [],
        }

    elif page_type == "articles":
        articles = extract_articles(soup)
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": description,
            "url": canonical_url,
            "mainEntity": {"@type": "ItemList", "itemListElement": articles},
        }

    elif page_type == "about":
        return {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": title,
            "description": description,
            "url": canonical_url,
            "mainEntity": ORGANIZATION_INFO,
        }

    elif page_type == "error":
        # Don't generate LD-JSON for error pages
        return None

    else:
        # Generic WebPage schema
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": canonical_url,
        }

    return None


def find_existing_ld_json(soup: BeautifulSoup) -> list:
    """Find existing LD-JSON script tags in the document."""
    return soup.find_all("script", attrs={"type": "application/ld+json"})


def update_or_insert_ld_json(html_content: str, ld_json: dict[str, Any]) -> str:
    """Update existing LD-JSON or insert a new one in the HTML."""
    soup = BeautifulSoup(html_content, "html.parser")

    # Format the JSON with proper indentation
    json_str = json.dumps(ld_json, indent=4, ensure_ascii=False)
    # Indent each line for proper HTML formatting
    indented_json = "\n".join(
        "            " + line if line.strip() else line for line in json_str.split("\n")
    )

    existing_scripts = find_existing_ld_json(soup)

    if existing_scripts:
        # Update the first existing LD-JSON script
        script = existing_scripts[0]
        script.string = "\n" + indented_json + "\n        "
    else:
        # Insert new LD-JSON script before </head>
        head = soup.find("head")
        if head:
            new_script = soup.new_tag("script", type="application/ld+json")
            new_script.string = "\n" + indented_json + "\n        "

            # Try to insert before the closing </head> but after other meta/link tags
            # Find the last link or meta tag to insert after
            last_meta_or_link = None
            for tag in head.find_all(["meta", "link"]):
                last_meta_or_link = tag

            if last_meta_or_link:
                last_meta_or_link.insert_after(new_script)
            else:
                head.append(new_script)

    # Return the modified HTML as a string
    # Use the original formatter to preserve formatting as much as possible
    return str(soup)


def format_html_output(html: str) -> str:
    """Clean up the HTML output formatting."""
    # Fix some common formatting issues from BeautifulSoup
    # Ensure proper newlines around script tags
    html = re.sub(
        r'(<script type="application/ld\+json">)\s*\n\s*{', r"\1\n            {", html
    )
    return html


def process_file(file_path: Path, dry_run: bool = False) -> bool:
    """Process a single HTML file and update its LD-JSON."""
    print(f"Processing: {file_path.name}")

    try:
        html_content = file_path.read_text(encoding="utf-8")
        soup = BeautifulSoup(html_content, "html.parser")

        ld_json = generate_ld_json(soup, file_path.name)

        if ld_json is None:
            print("  Skipping: No LD-JSON needed for this page type")
            return False

        existing = find_existing_ld_json(soup)

        if dry_run:
            print(f"  Page type: {detect_page_type(soup, file_path.name)}")
            print(f"  Would generate schema: @type={ld_json.get('@type', 'Unknown')}")
            if existing:
                print("  Would update existing LD-JSON")
            else:
                print("  Would insert new LD-JSON")
            print(f"  Generated JSON:\n{json.dumps(ld_json, indent=2)}\n")
            return True

        updated_html = update_or_insert_ld_json(html_content, ld_json)
        updated_html = format_html_output(updated_html)

        # Only write if there were actual changes
        if updated_html != html_content:
            file_path.write_text(updated_html, encoding="utf-8")
            action = "Updated" if existing else "Added"
            print(f"  {action} LD-JSON (@type={ld_json.get('@type', 'Unknown')})")
            return True
        else:
            print("  No changes needed")
            return False

    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate or update LD-JSON structured data in HTML files"
    )
    parser.add_argument(
        "files",
        nargs="*",
        help="Specific HTML files to process (default: all HTML files)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be generated without modifying files",
    )
    args = parser.parse_args()

    # Determine project root (parent of scripts directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    # Get list of HTML files to process
    if args.files:
        html_files = []
        for f in args.files:
            path = Path(f)
            if not path.is_absolute():
                # Try relative to project root first
                if (project_root / path).exists():
                    path = project_root / path
                elif (project_root / path.name).exists():
                    path = project_root / path.name
            if path.exists() and path.suffix == ".html":
                html_files.append(path)
            else:
                print(f"Warning: File not found or not HTML: {f}", file=sys.stderr)
    else:
        html_files = sorted(project_root.glob("*.html"))

    if not html_files:
        print("No HTML files found to process", file=sys.stderr)
        sys.exit(1)

    print(
        f"{'[DRY RUN] ' if args.dry_run else ''}Processing {len(html_files)} HTML file(s)...\n"
    )

    updated_count = 0
    for html_file in html_files:
        if process_file(html_file, dry_run=args.dry_run):
            updated_count += 1

    print(f"\n{'Would update' if args.dry_run else 'Updated'} {updated_count} file(s)")


if __name__ == "__main__":
    main()
