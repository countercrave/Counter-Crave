#!/usr/bin/env python3
"""Extract article-scoped Amazon product records from uploaded view-source HTML files."""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

from lxml import html as lxml_html


SITE_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = SITE_ROOT.parents[1] / "upload"
OUTPUT_PATH = SITE_ROOT / "app" / "data" / "source-product-listings.json"

SOURCE_FILES = {
    "best-non-toxic-air-fryer": "01-best-non-toxic-air-fryer-",
    "best-toaster-oven-air-fryer": "02-best-toaster-oven-air-fryer-",
    "best-small-air-fryer": "03-best-small-air-fryer-",
    "best-air-fryer-chicken-wings": "04-best-air-fryer-chicken-wings-",
    "best-air-fryer-microwave-combo": "05-best-air-fryer-microwave-combo-",
    "best-air-fryer-toaster-oven-combo": "06-best-air-fryer-toaster-oven-combo-",
    "best-stainless-steel-air-fryer": "07-best-stainless-steel-air-fryer-",
    "best-air-fryers-for-french-fries": "08-best-air-fryers-for-french-fries-",
    "best-air-fryer-chicken-thighs": "09-best-air-fryer-chicken-thighs-",
    "best-budget-air-fryer": "10-best-budget-air-fryer-",
    "best-air-fryer-for-two-people": "11-best-air-fryer-for-2-people-",
    "best-air-fryer-toaster-ovens": "13-best-air-fryer-toaster-ovens-",
    "best-dual-basket-air-fryer": "14-best-dual-basket-air-fryer-",
    "best-glass-air-fryer-non-toxic": "15-best-glass-air-fryer-non-toxic-",
    "best-inexpensive-blender": "best inexpensive blender",
    "best-small-blender-for-smoothies": "best small blender for smoothies",
    "best-portable-blenders-for-smoothies": "best portable blenders for smoothies",
    "best-immersion-blenders-for-soups-and-sauces": "best immersion blenders for soups and sauces",
    "best-affordable-blender": "best affordable blender",
    "blender-for-kitchen": "blender for kitchen",
    "best-blender-for-smoothies-and-ice": "best blender for smoothies and ice",
    "best-blender-for-fruit-smoothies": "best blender for fruit smoothies",
    "best-blenders-for-protein-shakes": "best blenders for protein shakes",
    "best-blender-food-processor-combo": "best blender food processor combo",
    "best-blender-for-smoothies": "12-best-blender-for-smoothies-",
    "best-small-rice-cooker": "01-best-small-rice-cooker-",
    "best-single-serve-coffee-maker": "02-best-single-serve-coffee-maker-",
    "best-home-espresso-machines": "03-best-home-espresso-machines-",
    "best-grind-and-brew-coffee-maker": "04-best-grind-and-brew-coffee-maker-",
    "best-pod-coffee-maker": "05-best-pod-coffee-maker-",
    "best-small-coffee-maker": "06-best-small-coffee-maker-",
    "best-coffee-makers-for-stove-top": "07-best-coffee-makers-for-stove-top-",
    "best-drip-coffee-machine": "08-best-drip-coffee-machine-",
    "best-1-cup-coffee-brewers": "09-best-1-cup-coffee-brewers-",
    "best-vacuum-sealer": "10-best-vacuum-sealer-",
}


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def find_source_file(fragment: str) -> Path:
    normalized_fragment = normalize_name(fragment)
    matches = [
        path
        for path in UPLOAD_ROOT.glob("*.html")
        if normalized_fragment in normalize_name(path.stem)
    ]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected one uploaded HTML file for {fragment!r}; found {len(matches)}: {matches}"
        )
    return matches[0]


def decode_view_source(path: Path) -> str:
    wrapper = path.read_text(encoding="utf-8", errors="ignore")
    cells = re.findall(r'<td class="line-content">(.*?)</td>', wrapper, flags=re.S)
    if not cells:
        raise RuntimeError(f"No view-source cells found in {path.name}")

    decoded_lines: list[str] = []
    for cell in cells:
        cell = re.sub(r"<br\s*/?>", "\n", cell, flags=re.I)
        cell = re.sub(r"<[^>]+>", "", cell)
        decoded_lines.append(html.unescape(cell))
    return "\n".join(decoded_lines)


def clean_text(parts: list[str]) -> str:
    return " ".join(" ".join(parts).split())


def large_amazon_image(url: str) -> str:
    # Amazon search thumbnails use several size tokens; request a larger source asset.
    return re.sub(r"\._AC_[A-Z]{2}\d+_\.", "._AC_SL1500_.", url)


def extract_products(path: Path) -> list[dict[str, object]]:
    document = lxml_html.fromstring(decode_view_source(path))
    nodes = document.xpath('//*[@data-component-type="s-search-result" and @data-asin]')
    products: list[dict[str, object]] = []
    seen: set[str] = set()

    for node in nodes:
        asin = (node.get("data-asin") or "").strip()
        title = clean_text(node.xpath(".//h2//span//text()"))
        images = node.xpath(
            './/img[contains(concat(" ", normalize-space(@class), " "), " s-image ")]/@src'
        )
        if not asin or not title or not images or asin in seen:
            continue

        seen.add(asin)
        original_image = images[0]
        products.append(
            {
                "position": len(products) + 1,
                "asin": asin,
                "title": title,
                "image": large_amazon_image(original_image),
                "originalImage": original_image,
                "amazonUrl": f"https://www.amazon.com/dp/{asin}?tag=visitbest07-20",
            }
        )

    if not products:
        raise RuntimeError(f"No products extracted from {path.name}")
    return products


def main() -> int:
    if not UPLOAD_ROOT.exists():
        raise RuntimeError(f"Upload directory not found: {UPLOAD_ROOT}")

    result: dict[str, list[dict[str, object]]] = {}
    source_manifest: dict[str, str] = {}
    total = 0
    for slug, fragment in SOURCE_FILES.items():
        path = find_source_file(fragment)
        products = extract_products(path)
        result[slug] = products
        source_manifest[slug] = path.name
        total += len(products)
        print(f"{slug}: {len(products)} products <- {path.name}")

    payload = {
        "generatedFrom": "Curated product catalogs",
        "totalArticleProductEntries": total,
        "sourceFiles": source_manifest,
        "listings": result,
    }
    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {total} article product entries to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
