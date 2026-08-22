#!/usr/bin/env python3
"""Turn raw Amazon search captures into the curated product catalog the site renders.

Input : app/data/source-product-listings.json  (raw records per guide slug)
Output: app/data/product-catalog.json           (filtered, de-duplicated, enriched)
        scripts/catalog-audit.json              (what was removed or merged, and why)

Rules applied per guide:
  1. Relevance  – the record must describe the appliance the article is about.
                  Accessories, consumables, seasonings and off-category items are dropped.
  2. Intent     – guide-specific size/format filters (e.g. "small" guides drop 12-qt ovens).
  3. De-dupe    – colour / finish variants of the same model are merged into one card.
  4. Enrich     – a short display name, brand, spec chips, fit line, pros and cons are
                  derived from the exact listing title so every card reads differently.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "app" / "data" / "source-product-listings.json"
OUT_PATH = ROOT / "app" / "data" / "product-catalog.json"
AUDIT_PATH = ROOT / "scripts" / "catalog-audit.json"
PICKS_PATH = ROOT / "scripts" / "guide-picks.json"

# --------------------------------------------------------------------------- categories

def guide_category(slug: str) -> str:
    if "pizza" in slug:
        return "pizza-ovens"
    if "wine" in slug or "beverage" in slug:
        return "wine-coolers"
    if "vacuum" in slug:
        return "vacuum-sealers"
    if "rice" in slug:
        return "rice-cookers"
    if "coffee" in slug or "espresso" in slug or "brewers" in slug:
        return "coffee-makers"
    if "blender" in slug:
        return "blenders"
    return "air-fryers"


ANCHORS = {
    "air-fryers": r"air.?fry|airfryer",
    "blenders": r"blender|kitchen system|smoothie maker|prep system",
    "coffee-makers": r"coffee|espresso|moka|percolator|cafetera|pour.?over|french press|brewer|cezve|aeropress",
    "rice-cookers": r"rice",
    "vacuum-sealers": r"vacuum|sealer",
    "wine-coolers": r"wine|beverage|fridge|refrigerator|cooler",
    "pizza-ovens": r"pizza",
}

# Things that are never the appliance itself.
EXCLUDE_COMMON = re.compile(
    r"\bliners?\b|basket for oven|crisper basket & tray|\brack for\b|kebab rack|grill pan for|"
    r"replacement (?:tray|basket|part)|seasoning|\brub\b|spice blend|\bspices\b|fresh chicken|"
    r"shark tank|deep fryer|chiller set|chiller bucket|freeze cup|wine bag|cooler bag|holds 750ml|vacuum insulated",
    re.I,
)
# Consumables: only applied when the title does not describe a machine.
EXCLUDE_CONSUMABLE = re.compile(r"coffee filters|\bfilters,|\b\d+ count\b|coffee pods|k-cup pods,", re.I)
APPLIANCE_WORDS = re.compile(r"maker|machine|brewer|percolator|coffee pot|moka|press|dripper", re.I)

# Guide-specific intent rules: (require_regex, exclude_regex)
INTENT: dict[str, tuple[str | None, str | None]] = {
    "best-small-air-fryer": (None, r"\blarge\b|\b(?:[89]|1\d|2\d)(?:\.\d)?\s?-?(?:qt|quart)|\boven\b|microwave"),
    "best-dual-basket-air-fryer": (r"dual|double|twin|2-basket|2 basket|two basket|doublestack|divider|megazone|2×", None),
    "best-glass-air-fryer-non-toxic": (r"glass|non.?toxic|pfas", None),
    "best-non-toxic-air-fryer": (r"pfas|ptfe|ceramic|glass|stainless|non.?toxic", None),
    "best-air-fryer-microwave-combo": (r"microwave", None),
    "best-toaster-oven-air-fryer": (r"oven|toaster|bravo", None),
    "best-air-fryer-toaster-ovens": (r"oven|toaster|bravo", None),
    "best-air-fryer-toaster-oven-combo": (r"oven|toaster|bravo", None),
    "best-small-rice-cooker": (None, r"\b(?:10|12|20)[- ]?cup"),
    "best-small-coffee-maker": (None, r"\b(?:10|12|14)[- ]?cup"),
    "best-single-serve-coffee-maker": (r"single.?serve|single.?cup|one.?cup|1.?cup|k.?cup|\bpod|nespresso|vertuo|personal|mini", None),
    "best-pod-coffee-maker": (r"\bpod|k.?cup|nespresso|vertuo|capsule|keurig|flexbrew|lavazza", None),
    "best-1-cup-coffee-brewers": (r"single|one cup|1 cup|1-cup|pour.?over|dripper|french press|mini|k.?cup|\bpod|personal", r"\b(?:5|8|10|12|14)[- ]?cup|cold brew"),
    "best-grind-and-brew-coffee-maker": (r"grind|grinder|burr|bean|fully automatic|automatic espresso|superautomatic|luxe caf", None),
    "best-home-espresso-machines": (r"espresso|barista|cappuccino|latte|nespresso|vertuo|bambino|\bpump", None),
    "best-coffee-makers-for-stove-top": (r"moka|stovetop|stove top|percolator|greca|cezve|turkish|cafetera|coffee pot", r"\bdrip\b|k-cup|single serve|pour-over|chemex|french press"),
    "best-small-blender-for-smoothies": (None, r"48 oz|72 ?oz|64 oz|countertop blender|professional blender|duo blender|kitchen system|immersion|hand blender|power elite"),
    "best-portable-blenders-for-smoothies": (r"portable|cordless|rechargeable|usb|wireless|travel|blast|to-go|to go|tumbler", None),
    "best-immersion-blenders-for-soups-and-sauces": (r"immersion|hand blender|stick", None),
    "best-blender-food-processor-combo": (r"processor|kitchen system|chopper|prep|duet|trio|2-in-1", None),
}
SMOOTHIE_GUIDES = {
    "blender-for-kitchen", "best-blender-for-smoothies-and-ice", "best-blender-for-fruit-smoothies",
    "best-blenders-for-protein-shakes", "best-inexpensive-blender", "best-affordable-blender",
    "best-blender-for-smoothies", "best-small-blender-for-smoothies", "best-portable-blenders-for-smoothies",
}

# Guides that were written before a search capture existed. Their comparison lists are
# assembled from Amazon records already present in other captures: a hand-picked seed list
# plus any record whose title matches the include pattern.
VIRTUAL_LISTINGS: dict[str, dict] = {
    "best-air-fryers-2026": {
        "seeds": ["B0C33CHG99", "B0CSZ7WBYW", "B096X9LGJ1", "B096N3FTZP", "B0CZS6SS3Y", "B0DDDD8WD6", "B07FDJMC9Q",
                  "B0B15Q3HCQ", "B08DKYBTPH", "B0BYF8PT3L", "B0CKP6Y6KB", "B09MR7QWKZ", "B0FJYK886N", "B0CS3V8M9H",
                  "B0936FGLQS", "B0GLX9TGJV", "B0D1LCBTK3", "B0CVCDM9T5"],
        "include": None, "exclude": None, "limit": 18,
    },
    "best-air-fryer-for-one-person": {
        "seeds": ["B0CSZ7WBYW", "B0C33CHG99", "B096N3FTZP", "B07FDJMC9Q", "B0DDDD8WD6", "B0BYF8PT3L", "B0DC11YH4J",
                  "B0BDFRZX3F", "B0D98WLVTB", "B08R6KMBQT", "B0936FGLQS", "B07VZ65M7H", "B0CYJDVT31"],
        "include": r"\b(?:2|2\.1|2\.6|3|3\.2|3\.5|3\.6|4|4\.5)\s?-?(?:qt|quart)", "exclude": r"oven|microwave|dual", "limit": 20,
    },
    "best-glass-air-fryer": {
        "seeds": ["B0DDDD8WD6", "B096N3FTZP", "B0C33CHG99", "B0BYF8PT3L", "B0CKP6Y6KB"],
        "include": r"\bglass\b|clearcook|clearview", "exclude": r"microwave", "limit": 18,
    },
    "best-5-quart-air-fryer": {
        "seeds": ["B0CSZ7WBYW", "B0C33CHG99", "B096N3FTZP", "B0CKP6Y6KB", "B0BYF8PT3L", "B07FDJMC9Q"],
        "include": r"\b(?:4\.5|5|5\.5|5\.8|6|6\.5)\s?-?(?:qt|quart)", "exclude": r"oven|microwave|dual|double|twin", "limit": 20,
    },
    "best-large-air-fryer": {
        "seeds": ["B096X9LGJ1", "B0CZS6SS3Y", "B0C33CHG99", "B0B15Q3HCQ", "B08DKYBTPH", "B09MR7QWKZ"],
        "include": r"\b(?:[89]|1[0-9])(?:\.\d)?\s?-?(?:qt|quart)", "exclude": r"oven|microwave|rotisserie oven", "limit": 20,
    },
    "best-air-fryer-for-beginners": {
        "seeds": ["B0C33CHG99", "B0CSZ7WBYW", "B096N3FTZP", "B07FDJMC9Q", "B08DKYBTPH", "B0BYF8PT3L", "B0936FGLQS",
                  "B0D1LCBTK3", "B07VZ65M7H", "B0DC11YH4J", "B0CVCDM9T5", "B0D8HNDS4Q", "B0CNY1YVDD"],
        "include": None, "exclude": None, "limit": 14,
    },
}

# Records that are not present in any capture but are needed for an existing pick.
EXTRA_RECORDS = [
    {
        "asin": "B096X9LGJ1",
        "title": "Ninja Foodi DZ401 10 Quart 6-in-1 DualZone XL Air Fryer, 2 Independent Baskets, Match Cook & Smart Finish",
        "image": "https://m.media-amazon.com/images/I/61A3ePViuoL._AC_SL1500_.jpg",
        "amazonUrl": "https://www.amazon.com/dp/B096X9LGJ1?tag=visitbest07-20",
    },
]


# --------------------------------------------------------------------------- helpers

COLOR_WORDS = {
    "black", "white", "grey", "gray", "silver", "red", "blue", "green", "navy", "stone", "cyberspace",
    "sage", "mint", "watermelon", "pink", "purple", "cream", "oatmilk", "blossom", "cobalt", "bone",
    "lavender", "evergreen", "matte", "beige", "gold", "yellow", "aqua", "teal", "charcoal", "slate",
    "graphite", "deep", "soft", "dark", "light", "polar", "shadow", "juniper", "raspberry", "natural",
    "brushed", "warm", "ivory", "sand", "rose", "copper", "orange", "midnight", "mirrored", "cloud",
}
GENERIC_FIRST_WORDS = {
    "air", "single", "portable", "vacuum", "wine", "coffee", "k", "pour", "small", "compact", "personal",
    "immersion", "food", "drip", "rice", "cold", "stovetop", "non", "electric", "countertop", "indoor",
    "large", "mini", "glass", "stainless", "double", "dual", "8-cup", "2-way", "14-in-1", "smart",
    "commercial", "camping", "crystal", "the", "for", "organic",
}


def normalize_key(title: str) -> list[str]:
    text = title.lower()
    text = re.sub(r"\(.*?\)", " ", text)
    text = re.sub(r"[®™©“”\"'’]", "", text)
    text = re.sub(r"[^a-z0-9.+-]+", " ", text)
    tokens = []
    for tok in text.split():
        tok = tok.strip(".-")
        if not tok or tok in COLOR_WORDS:
            continue
        # strip colour suffixes from model codes: af142bl -> af142, bc251pk1 -> bc251
        tok = re.sub(r"^([a-z]{1,4}-?\d{2,4})(?:amz|brn|[a-z]{1,3}\d?)$", r"\1", tok)
        tokens.append(tok)
    return tokens


def jaccard(a: list[str], b: list[str]) -> float:
    sa, sb = set(a), set(b)
    return len(sa & sb) / max(1, len(sa | sb))


def clean_title(title: str) -> str:
    title = re.sub(r"[®™©]", "", title)
    title = re.sub(r"\s+", " ", title).strip()
    return title


def short_name(title: str) -> str:
    base = clean_title(title)
    base = re.sub(r"\s*\(.*?\)\s*", " ", base)
    base = re.sub(r"\s*[|–—]\s*", ", ", base)
    parts = [p.strip(" -") for p in re.split(r",|\s-\s|\sw/\s|\swith\s|\sfor\s", base) if p.strip(" -")]
    name = parts[0] if parts else base
    generic = brand_of(title) is None
    i = 1
    while len(parts) > i and (len(name) < 16 or (generic and len(name) + len(parts[i]) < 58)):
        name = f"{name}, {parts[i]}"
        i += 1
    model = re.search(r"\b([A-Z]{1,4}-?\d{2,}[A-Z0-9-]*)\b", base)
    if model and model.group(1) not in name and len(model.group(1)) <= 14:
        name = f"{name} {model.group(1)}"
    name = re.sub(r"\s+", " ", name).strip(" ,:")
    name = name.replace(":", "")
    if len(name) > 72:
        name = name[:70].rsplit(" ", 1)[0] + "…"
    return name


KNOWN_BRANDS = [
    "Wine Enthusiast", "Instant Pot", "Hamilton Beach", "Magic Bullet", "Mr. Coffee", "Elite Gourmet", "Amazon Basics",
    "Big Horn", "Chef Preserve", "Commercial Chef", "Coffee Gator", "Paris Hilton", "Emeril Lagasse", "Gotham Steel",
    "Wine Fridge", "Café Brew", "Cafe Du Chateau", "West Bend", "Pit Boss", "Ninja Foodi", "Non Toxic Air Fryer",
]


def brand_of(title: str) -> str | None:
    cleaned = clean_title(title)
    for known in KNOWN_BRANDS:
        if cleaned.lower().startswith(known.lower()) and known not in {"Wine Fridge", "Non Toxic Air Fryer"}:
            return known
    first = cleaned.split(" ")[0].strip(",")
    low = first.lower()
    if not first or first[0].isdigit() or low in GENERIC_FIRST_WORDS or len(first) < 2:
        return None
    if low.endswith("qt") or low.endswith("kpa") or low.endswith("oz"):
        return None
    return first.strip("-")


def num(value: str) -> float:
    return float(value)


def fmt_num(value: float) -> str:
    return str(int(value)) if value == int(value) else f"{value:g}"


# --------------------------------------------------------------------------- feature extraction

def extract_specs(title: str, category: str) -> dict:
    t = clean_title(title)
    low = t.lower()
    specs: list[str] = []
    f: dict = {}

    cap = re.search(r"(\d+(?:\.\d+)?)\s?-?(?:qt|quart|quarts)\b", low)
    if cap:
        f["quarts"] = num(cap.group(1))
        specs.append(f"{fmt_num(f['quarts'])} qt")
    cuft = re.search(r"(\d+(?:\.\d+)?)\s?-?cu\.?\s?ft", low)
    if cuft:
        f["cuft"] = num(cuft.group(1))
        specs.append(f"{fmt_num(f['cuft'])} cu ft")
    oz = re.search(r"(\d+(?:\.\d+)?)\s?-?(?:oz|ounce|ounces)\b", low)
    if oz and category in {"blenders", "coffee-makers"}:
        f["oz"] = num(oz.group(1))
        specs.append(f"{fmt_num(f['oz'])} oz")
    liters = re.search(r"(\d+(?:\.\d+)?)\s?-?(?:l|liter|liters|litre)\b", low)
    if liters and category in {"blenders", "vacuum-sealers", "coffee-makers", "wine-coolers"} and "oz" not in f:
        f["liters"] = num(liters.group(1))
        specs.append(f"{fmt_num(f['liters'])} L")
    cups = re.search(r"(\d+(?:\.\d+)?)\s?-?(?:cups?)\b(?!-?\s?(?:sizes?|options))", low)
    if cups and category in {"rice-cookers", "coffee-makers", "blenders"}:
        f["cups"] = num(cups.group(1))
        unit = "cups"
        if category == "rice-cookers":
            unit = "cups uncooked" if "uncooked" in low else ("cups cooked" if "cooked" in low else "cups")
        specs.append(f"{fmt_num(f['cups'])} {unit}")
    bottles = re.search(r"(\d+)\s?-?\s?bottles?\b", low)
    if bottles:
        f["bottles"] = int(bottles.group(1))
        specs.append(f"{f['bottles']} bottles")
    cans = re.search(r"(\d+)\s?cans?\b", low)
    if cans:
        f["cans"] = int(cans.group(1))
        specs.append(f"{f['cans']} cans")
    inch = re.search(r"(\d+(?:\.\d+)?)\s?-?(?:inch|in\b(?!-\d)|\"|”)", low)
    if inch and category in {"pizza-ovens", "wine-coolers"}:
        f["inches"] = num(inch.group(1))
        specs.append(f"{fmt_num(f['inches'])}-inch")
    temp = re.search(r"(\d{3})\s?°?\s?f\b", low)
    if temp:
        f["tempF"] = int(temp.group(1))
        specs.append(f"{f['tempF']}°F max")
    power = re.search(r"(\d{3,4})\s?-?(?:w\b|watt|watts|pw\b|wp\b|peak watts)", low)
    if power:
        f["watts"] = int(power.group(1))
        specs.append(f"{f['watts']} W")
    bar = re.search(r"(\d{1,2})\s?-?bar", low)
    if bar:
        f["bar"] = int(bar.group(1))
        specs.append(f"{f['bar']} bar")
    kpa = re.search(r"(\d{2,3})\s?kpa", low)
    if kpa:
        f["kpa"] = int(kpa.group(1))
        specs.append(f"{f['kpa']} kPa")
    fn = re.search(r"(\d+)\s?-?in-\s?1", low)
    if fn:
        f["functions"] = int(fn.group(1))
        specs.append(f"{f['functions']}-in-1")
    presets = re.search(r"(\d+)\s?(?:one-touch\s)?(?:presets?|programs?|cooking functions|functions|modes|brew styles|brew sizes|cup sizes|speeds?)\b", low)
    if presets and "functions" not in f:
        f["presets"] = int(presets.group(1))
        words = presets.group(0).split()
        label = " ".join(words[-2:]) if words[-1] in {"sizes", "styles", "functions"} and len(words) > 2 else words[-1]
        f["presetLabel"] = label
        specs.append(f"{f['presets']} {label}")

    flags = {
        "dual": r"dual.?zone|dual basket|double basket|2-basket|2 basket|two basket|doublestack|twin|2×|divider|megazone|2 independent",
        "window": r"window|clearcook|clearview|see-thru|viewing",
        "pfas": r"pfas.?free|ptfe.?free|pfoa.?free|non.?toxic",
        "ceramic": r"ceramic",
        "stainless": r"stainless",
        "glass": r"\bglass\b",
        "dishwasher": r"dishwasher",
        "touch": r"touch ?screen|touch control|digital|lcd|led display",
        "rotisserie": r"rotisserie",
        "dehydrate": r"dehydrat",
        "probe": r"probe|thermometer",
        "smart": r"\bsmart\b|wifi|wi-fi|app[- ]control|\bai smart\b|\bai\b(?! recipes)",
        "frenchdoor": r"french door",
        "oven": r"\boven\b|toaster",
        "microwave": r"microwave",
        "compressor": r"compressor",
        "thermoelectric": r"thermoelectric",
        "dualtemp": r"dual temp|dual zone|dual-zone|independent dual",
        "lock": r"\block\b",
        "led": r"\bled\b",
        "builtin": r"built-?in|under.?counter|undercounter",
        "freestanding": r"freestanding|free standing",
        "outdoor": r"outdoor|weather",
        "woodfire": r"wood fire|wood-fired|wood fired",
        "stone": r"\bstone\b|ceramic stone",
        "peel": r"\bpeel\b",
        "rotating": r"rotating",
        "portable": r"portable|cordless|rechargeable|usb|wireless|travel",
        "selfclean": r"self-?clean",
        "keepwarm": r"keep.?warm",
        "fuzzy": r"fuzzy logic|micom",
        "steamer": r"steam",
        "programmable": r"programmable|delay",
        "frother": r"froth",
        "iced": r"\biced\b|over ice|cold brew",
        "strong": r"strong",
        "reusable": r"reusable",
        "thermal": r"thermal",
        "carafe": r"carafe",
        "grinder": r"grind|grinder|burr",
        "superauto": r"fully automatic|bean-to-cup|superautomatic|grind, tamp",
        "pods": r"\bpod|k.?cup|capsule|nespresso|vertuo",
        "grounds": r"grounds|ground coffee",
        "induction": r"induction",
        "autobag": r"automatic bag|auto bag|bag detection",
        "moistdry": r"moist|wet/dry|wet & dry|dry/moist|wet",
        "doubleseal": r"double (?:heat )?seal",
        "handheld": r"handheld|hand-held",
        "chamber": r"chamber",
        "cutter": r"cutter|bag storage",
        "personalcups": r"cups?\b.*(?:to-go|to go|travel)|\(\d\)\s?\d+oz cups|personal",
        "pitcher": r"pitcher",
        "autoiq": r"auto-?iq|auto program|blendsense|smartsense",
        "immersion": r"immersion|hand blender|stick",
        "processor": r"processor|kitchen system|chopper",
        "whisk": r"whisk",
        "variable": r"variable speed|\d+ speeds?|trigger speed",
        "quiet": r"quiet",
        "hifry": r"450°f|hi-fry|turbofry|dc motor|max 450",
    }
    for key, pattern in flags.items():
        if re.search(pattern, low):
            f[key] = True

    # Format labels
    if category == "air-fryers":
        if f.get("microwave"):
            fmt = "Microwave air-fryer combo"
        elif f.get("frenchdoor"):
            fmt = "French-door air fryer oven"
        elif f.get("dual") and "basket" in low:
            fmt = "Dual-zone air fryer"
        elif f.get("oven"):
            fmt = "Air fryer toaster oven"
        elif f.get("glass"):
            fmt = "Glass air fryer"
        elif f.get("dual"):
            fmt = "Dual-zone air fryer"
        elif "indoor grill" in low or "grill &" in low:
            fmt = "Grill and air fryer"
        else:
            fmt = "Basket air fryer"
    elif category == "blenders":
        if f.get("immersion"):
            fmt = "Immersion blender"
        elif f.get("processor"):
            fmt = "Blender and processor system"
        elif f.get("portable"):
            fmt = "Portable blender"
        elif re.search(r"personal|single.?serve|nutribullet|magic bullet|ninja fit|nutri-|bullet|mini|compact|to-go|tumbler", low):
            fmt = "Personal blender"
        else:
            fmt = "Full-size blender"
    elif category == "coffee-makers":
        if re.search(r"moka|stovetop|stove top|percolator|greca|cezve|turkish|cafetera", low):
            fmt = "Stovetop coffee maker"
        elif re.search(r"espresso machine|barista|bambino|\bbar\b|cappuccino|latte", low) and not f.get("pods"):
            fmt = "Espresso machine"
        elif f.get("grinder") and f.get("pods"):
            fmt = "Grind-and-brew pod machine"
        elif f.get("grinder"):
            fmt = "Grind-and-brew coffee maker"
        elif f.get("pods") and f.get("grounds"):
            fmt = "Pod and grounds brewer"
        elif f.get("pods"):
            fmt = "Pod coffee maker"
        elif re.search(r"pour.?over|dripper|french press|aeropress", low):
            fmt = "Manual brewer"
        elif re.search(r"single.?serve|single.?cup|one.?cup|1.?cup", low):
            fmt = "Single-cup brewer"
        else:
            fmt = "Drip coffee maker"
    elif category == "rice-cookers":
        fmt = "Fuzzy-logic rice cooker" if f.get("fuzzy") else ("Mini rice cooker" if re.search(r"mini|personal|1 quart|2-cup", low) else "Compact rice cooker")
    elif category == "vacuum-sealers":
        fmt = "Chamber vacuum sealer" if f.get("chamber") else ("Handheld vacuum sealer" if f.get("handheld") else "Countertop vacuum sealer")
    elif category == "wine-coolers":
        if re.search(r"beverage|cans|beer|mini personal fridge|mini fridge", low):
            fmt = "Beverage and wine fridge"
        elif f.get("builtin"):
            fmt = "Under-counter wine cooler"
        elif f.get("thermoelectric"):
            fmt = "Thermoelectric wine cooler"
        elif f.get("compressor"):
            fmt = "Compressor wine cooler"
        else:
            fmt = "Wine cooler"
    else:  # pizza
        if f.get("outdoor") or f.get("woodfire"):
            fmt = "Outdoor pizza oven"
        elif f.get("rotating"):
            fmt = "Rotating pizza oven"
        elif re.search(r"nonstick|cooking plates|everything maker", low):
            fmt = "Pizza maker with plates"
        else:
            fmt = "Indoor electric pizza oven"
    f["format"] = fmt
    f["specs"] = specs[:5]
    return f


def people_from_quarts(q: float | None, dual: bool) -> str:
    if dual:
        return "families and anyone cooking a main and a side at once"
    if q is None:
        return "everyday cooking"
    if q <= 3:
        return "snacks, sides and single portions"
    if q < 6:
        return "one or two people"
    if q < 8:
        return "two to four people"
    return "larger households and batch cooking"


def fit_line(f: dict, category: str, low: str) -> str:
    fmt = f["format"]
    if category == "air-fryers":
        if fmt == "Microwave air-fryer combo":
            return "One countertop box for reheating and crisping when space only allows a single appliance"
        if fmt in {"Air fryer toaster oven", "French-door air fryer oven"}:
            return "Toast, sheet-pan dinners, pizza and roasts that need a flat oven-style cavity"
        if fmt == "Glass air fryer":
            return "Cooks who want to watch browning and keep a coating-free glass vessel"
        if fmt == "Dual-zone air fryer":
            return "Dinners where the protein and the side need different times or temperatures"
        return f"Everyday crisping, roasting and reheating for {people_from_quarts(f.get('quarts'), False)}"
    if category == "blenders":
        if fmt == "Immersion blender":
            return "Blending soups, sauces and purées directly in the pot"
        if fmt == "Blender and processor system":
            return "Kitchens that want one motor base for smoothies, chopping and dough"
        if fmt == "Portable blender":
            return "Shakes on the way to work or the gym without a wall outlet"
        if fmt == "Personal blender":
            return "One or two single-serve smoothies a day with minimal cleanup"
        return "Family-size smoothies, frozen drinks and ice crushing"
    if category == "coffee-makers":
        if fmt == "Stovetop coffee maker":
            return "Strong, hands-on coffee with no electrics on the counter"
        if fmt == "Espresso machine":
            return "Espresso shots and milk drinks made at home"
        if fmt.startswith("Grind-and-brew"):
            return "Fresh-ground coffee without a separate grinder on the counter"
        if fmt == "Pod and grounds brewer":
            return "Households that switch between pods and ground coffee"
        if fmt == "Pod coffee maker":
            return "Fast, repeatable single cups with almost no cleanup"
        if fmt == "Manual brewer":
            return "One carefully brewed cup at a time with full control"
        if fmt == "Single-cup brewer":
            return "One fresh cup without a carafe to empty"
        return "Several cups or a shared carafe every morning"
    if category == "rice-cookers":
        cups = f.get("cups")
        if cups and cups <= 3:
            return "Rice for one to three people with a small footprint"
        return "Everyday rice and grain batches with automatic keep-warm"
    if category == "vacuum-sealers":
        if fmt == "Chamber vacuum sealer":
            return "Liquids, marinades and serious sous-vide prep"
        if fmt == "Handheld vacuum sealer":
            return "Leftovers and small jobs with reusable zipper bags"
        return "Freezer portions, bulk meat and sous-vide bags"
    if category == "wine-coolers":
        if fmt == "Beverage and wine fridge":
            return "Mixed storage for wine, cans and bottles in one cabinet"
        if fmt == "Under-counter wine cooler":
            return "Kitchen remodels where the cooler slides under a counter"
        b = f.get("bottles")
        if b and b <= 12:
            return "A small everyday wine stash on or beside the counter"
        return "A growing collection that needs stable storage temperatures"
    if fmt == "Outdoor pizza oven":
        return "Backyard pizza nights with a wood-fire flavor"
    if fmt == "Rotating pizza oven":
        return "Frozen and pre-made pizzas with no preheating fuss"
    if fmt == "Pizza maker with plates":
        return "Quick flatbreads, quesadillas and thin pizzas on a budget"
    t = f.get("tempF") or 0
    inch = f.get("inches")
    size = f"{fmt_num(inch)}-inch pizzas" if inch else "pizzas"
    if t >= 800:
        return f"Blistered Neapolitan-style {size} at {t}°F"
    if t >= 650:
        return f"Pizzeria-style {size} without an outdoor oven"
    if t:
        return f"New York-style and frozen {size} at up to {t}°F"
    return f"Home-made and frozen {size} on an electric countertop oven"


def pros_for(f: dict, category: str, low: str) -> list[str]:
    pros: list[str] = []
    if f.get("dual"):
        pros.append("Two cooking zones let a main and a side run at different settings")
    if f.get("tempF") and f["tempF"] >= 450 and category == "air-fryers":
        pros.append(f"{f['tempF']}°F top temperature for deeper browning")
    if f.get("pfas") and f.get("ceramic"):
        pros.append("PFAS-free ceramic coating on the cooking surface")
    elif f.get("pfas"):
        pros.append("Sold as a PFAS-free or non-toxic cooking surface")
    elif f.get("ceramic") and category != "pizza-ovens":
        pros.append("Ceramic-coated cooking surface")
    if f.get("glass") and category == "air-fryers":
        pros.append("Glass cooking vessel shows browning without opening the lid")
    elif f.get("window"):
        pros.append("Viewing window to check color without losing heat")
    if f.get("stainless") and category in {"air-fryers", "coffee-makers", "wine-coolers", "rice-cookers"}:
        pros.append("Stainless-steel finish that is easy to wipe down")
    if f.get("dishwasher"):
        pros.append("Dishwasher-safe removable parts")
    if f.get("probe"):
        pros.append("Built-in probe takes the guesswork out of doneness")
    if f.get("rotisserie"):
        pros.append("Rotisserie function for whole chickens and kebabs")
    if f.get("selfclean"):
        pros.append("Self-cleaning cycle cuts down scrubbing")
    if f.get("smart") and category != "wine-coolers":
        pros.append("App or smart controls for presets and monitoring")
    mode_word = {"air-fryers": "cooking modes", "pizza-ovens": "cooking modes", "blenders": "functions",
                 "vacuum-sealers": "sealing modes", "coffee-makers": "brew modes", "rice-cookers": "cooking programs",
                 "wine-coolers": "settings"}[category]
    if f.get("functions"):
        pros.append(f"{f['functions']} {mode_word} in one footprint")
    elif f.get("presets") and f.get("presetLabel") not in {"sizes", "brew sizes", "cup sizes", "speed", "speeds"}:
        pros.append(f"{f['presets']} one-touch {f.get('presetLabel', 'programs')}")
    elif f.get("presets") and f.get("presetLabel") in {"sizes", "brew sizes", "cup sizes"}:
        pros.append(f"{f['presets']} brew sizes to choose from")
    if f.get("frenchdoor"):
        pros.append("French doors open without swinging into the counter")
    if f.get("microwave"):
        pros.append("Replaces both a microwave and an air fryer")
    if category == "blenders":
        if f.get("watts") and f["watts"] >= 1200:
            pros.append(f"{f['watts']}-watt motor handles ice and frozen fruit")
        elif f.get("watts"):
            pros.append(f"{f['watts']}-watt motor sized for soft and frozen fruit")
        if f.get("portable"):
            pros.append("Rechargeable, so it blends anywhere")
        if f.get("autoiq"):
            pros.append("Auto programs run the blend cycle for you")
        if f.get("processor"):
            pros.append("Processor bowl covers chopping and dough as well as drinks")
        if f.get("whisk"):
            pros.append("Whisk attachment included")
        if f.get("variable"):
            pros.append("Variable speed for control over texture")
        if f.get("quiet"):
            pros.append("Marketed as a quieter blend")
        if re.search(r"\(\d\)\s?\d+oz|2 cups|3 cups|to-go cups|travel cups|cups", low) and f.get("format") in {"Personal blender", "Portable blender"}:
            pros.append("Comes with more than one cup, so two people can blend back to back")
        if f.get("oz") and f["oz"] >= 64:
            pros.append(f"{fmt_num(f['oz'])} oz pitcher for family batches")
    if category == "coffee-makers":
        if f.get("pods") and f.get("grounds"):
            pros.append("Brews both pods and ground coffee")
        if f.get("superauto"):
            pros.append("Fully automatic: grinds, tamps and brews at one touch")
        elif f.get("grinder"):
            pros.append("Built-in grinder for fresh-ground coffee")
        if f.get("frother"):
            pros.append("Milk frother included for lattes and cappuccinos")
        if f.get("iced"):
            pros.append("Iced or cold-brew setting")
        if f.get("strong"):
            pros.append("Strong-brew button for a bolder cup")
        if f.get("thermal"):
            pros.append("Thermal carafe keeps coffee hot without a warming plate")
        if f.get("programmable"):
            pros.append("Programmable timer so coffee is ready when you wake")
        if f.get("reusable"):
            pros.append("Reusable filter, no paper filters to buy")
        if f.get("induction"):
            pros.append("Works on induction as well as gas and electric hobs")
        if f.get("bar"):
            pros.append(f"{f['bar']}-bar pump pressure for espresso extraction")
        if f.get("cups") and f.get("format") == "Stovetop coffee maker":
            pros.append(f"{fmt_num(f['cups'])}-cup capacity for the stovetop")
        if f.get("oz") and f.get("format") in {"Pod coffee maker", "Pod and grounds brewer", "Single-cup brewer", "Grind-and-brew pod machine"}:
            if "reservoir" in low:
                pros.append(f"{fmt_num(f['oz'])} oz reservoir between refills")
            else:
                pros.append(f"Brews up to {fmt_num(f['oz'])} oz in one cup")
    if category == "rice-cookers":
        if f.get("fuzzy"):
            pros.append("Fuzzy-logic control adjusts cooking to the batch")
        if f.get("steamer"):
            pros.append("Steaming tray or basket included")
        if f.get("keepwarm"):
            pros.append("Automatic keep-warm after cooking")
        if f.get("cups"):
            pros.append(f"{fmt_num(f['cups'])}-cup batch size suits small households")
        if f.get("pfas") or f.get("ceramic"):
            pros.append("Coating-conscious inner pot")
    if category == "vacuum-sealers":
        if f.get("kpa"):
            pros.append(f"{f['kpa']} kPa suction rating")
        if f.get("moistdry"):
            pros.append("Separate moist and dry modes")
        if f.get("doubleseal"):
            pros.append("Double heat seal for a more reliable closure")
        if f.get("autobag"):
            pros.append("Automatic bag detection")
        if f.get("cutter"):
            pros.append("Built-in roll storage and cutter")
        if f.get("handheld"):
            pros.append("Small enough to live in a drawer")
        if f.get("chamber"):
            pros.append("Chamber design seals liquids and marinades")
        if f.get("reusable"):
            pros.append("Ships with reusable bags")
    if category == "wine-coolers":
        if f.get("compressor"):
            pros.append("Compressor cooling holds temperature in a warm kitchen")
        if f.get("thermoelectric"):
            pros.append("Thermoelectric cooling runs quietly with little vibration")
        if f.get("dualtemp"):
            pros.append("Two temperature zones for reds and whites")
        if f.get("bottles"):
            pros.append(f"Holds {f['bottles']} bottles")
        if f.get("lock"):
            pros.append("Lockable door")
        if f.get("builtin"):
            pros.append("Front-venting design for under-counter installation")
        if f.get("led"):
            pros.append("LED interior lighting")
        if f.get("outdoor"):
            pros.append("Rated for outdoor or covered-patio use")
    if category == "pizza-ovens":
        if f.get("tempF"):
            pros.append(f"Reaches {f['tempF']}°F for a leopard-spotted crust")
        if f.get("stone"):
            pros.append("Cooks on a baking stone for a crisp base")
        if f.get("inches"):
            pros.append(f"Fits a {fmt_num(f['inches'])}-inch pizza")
        if f.get("peel"):
            pros.append("Pizza peel included")
        if f.get("rotating"):
            pros.append("Rotating tray cooks evenly without turning the pizza")
        if f.get("woodfire"):
            pros.append("Wood-fired flavor")
        if f.get("portable"):
            pros.append("Portable enough to move between kitchen and patio")
        if f.get("watts"):
            pros.append(f"{f['watts']}-watt heating element")
    if category == "air-fryers":
        if f.get("quarts"):
            pros.append(f"{fmt_num(f['quarts'])}-quart basket sized for {people_from_quarts(f['quarts'], bool(f.get('dual')))}")
        if f.get("dehydrate"):
            pros.append("Dehydrate mode for jerky and fruit")
        if f.get("hifry") and "450°F top temperature for deeper browning" not in pros:
            pros.append("High-heat setting for crispier results")
    # de-duplicate and cap
    seen = set()
    out = []
    for p in pros:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out[:3]


def cons_for(f: dict, category: str, low: str) -> list[str]:
    cons: list[str] = []
    fmt = f["format"]
    q = f.get("quarts")
    if category == "air-fryers":
        if fmt == "Dual-zone air fryer":
            cons.append("Wide body takes noticeably more counter space than a single drawer")
            cons.append("Each basket is narrower, so big single batches get crowded")
        elif fmt in {"Air fryer toaster oven", "French-door air fryer oven"}:
            cons.append("More interior surfaces to wipe after greasy foods")
            cons.append("Slower to preheat than a basket for small portions")
        elif fmt == "Microwave air-fryer combo":
            cons.append("You cannot microwave and air fry at the same time")
            cons.append("Cookware rules differ by mode, so read the manual carefully")
        elif fmt == "Glass air fryer":
            cons.append("Glass is heavier and needs careful cooling before washing")
            cons.append("Open cooking area is smaller than a square drawer of the same quarts")
        else:
            cons.append("One zone means a main and a side share a temperature")
            if q and q <= 3:
                cons.append("Two portions usually need two batches")
            elif q and q >= 8:
                cons.append("Large basket is overkill and bulky for one or two people")
            elif not f.get("window"):
                cons.append("No window, so you open the drawer to check color")
            else:
                cons.append("Window seam collects grease and needs wiping")
    elif category == "blenders":
        if fmt == "Immersion blender":
            cons.append("Splashes if the blade breaks the surface; keep it submerged")
            cons.append("Not suited to ice or thick frozen smoothies")
        elif fmt == "Blender and processor system":
            cons.append("Extra bowls, blades and lids need cabinet space")
            cons.append("More parts to wash after a simple smoothie")
        elif fmt == "Portable blender":
            cons.append("Battery and motor limits rule out dense frozen loads")
            cons.append("Small vessel only makes one drink per charge cycle")
        elif fmt == "Personal blender":
            cons.append("Single cups do not suit family batches")
            cons.append("Sealed cups should never take hot liquids")
        else:
            cons.append("Full-size base and pitcher need permanent counter space")
            cons.append("Small single servings may not circulate well in a big jar")
    elif category == "coffee-makers":
        if fmt == "Stovetop coffee maker":
            cons.append("Needs attention on the hob; it can scorch if left")
            cons.append("Check hob compatibility, especially for induction")
        elif fmt == "Espresso machine":
            cons.append("Results depend heavily on grind quality and technique")
            cons.append("Milk wand and group head need cleaning after every session")
        elif fmt.startswith("Grind-and-brew"):
            cons.append("Grinder chute holds old grounds and needs regular brushing out")
            cons.append("If the grinder fails, the whole unit is out of action")
        elif fmt in {"Pod coffee maker", "Pod and grounds brewer"}:
            cons.append("Ongoing pod cost and packaging waste")
            cons.append("Needs descaling on a schedule to keep brewing well")
        elif fmt == "Manual brewer":
            cons.append("Every cup is hands-on; no timer or batch brewing")
            cons.append("You supply the kettle and, in some cases, paper filters")
        elif fmt == "Single-cup brewer":
            cons.append("Slow when several people want coffee at once")
            cons.append("Limited cup-size range on most compact models")
        else:
            cons.append("A full carafe goes stale if you only drink one cup")
            cons.append("Hot plate can cook coffee left sitting on it")
    elif category == "rice-cookers":
        cons.append("Nonstick pots need gentle utensils and hand washing")
        if f.get("cups") and f["cups"] <= 3:
            cons.append("Too small for a crowd or meal-prep batches")
        else:
            cons.append("Small one-cup batches can come out uneven")
    elif category == "vacuum-sealers":
        if fmt == "Chamber vacuum sealer":
            cons.append("Heavy and large for a drawer or small kitchen")
            cons.append("Chamber bags are a different size system from roll bags")
        elif fmt == "Handheld vacuum sealer":
            cons.append("Only works with compatible zipper or valve bags")
            cons.append("No custom bag lengths from a roll")
        else:
            cons.append("Needs room on a counter or shelf plus textured bag rolls")
            cons.append("Moist foods can pull liquid into the seal strip")
    elif category == "wine-coolers":
        if f.get("thermoelectric"):
            cons.append("Thermoelectric cooling struggles in a warm kitchen above about 77°F")
        elif f.get("compressor"):
            cons.append("Compressor units hum and vibrate more than thermoelectric models")
        else:
            cons.append("Check the cooling type; thermoelectric units lose ground in warm rooms")
        if not f.get("dualtemp"):
            cons.append("Single zone, so reds and whites share one temperature")
        elif f.get("freestanding") and not f.get("builtin"):
            cons.append("Freestanding venting needs clearance; not for a tight cabinet")
        else:
            cons.append("Confirm venting and door swing before a built-in install")
    else:
        if fmt == "Outdoor pizza oven":
            cons.append("Outdoor only; needs fuel, space and weather protection")
            cons.append("Longer heat-up and more skill than an electric oven")
        elif fmt == "Rotating pizza oven":
            cons.append("Open design cannot reach true pizzeria temperatures")
            cons.append("Best for frozen and thin pizzas, not thick dough")
        elif fmt == "Pizza maker with plates":
            cons.append("Plates cannot mimic a stone-baked crust")
            cons.append("Limited to thin pizzas and flatbreads")
        else:
            cons.append("Pulls a lot of power; use a dedicated kitchen circuit")
            if f.get("inches") and f["inches"] <= 12:
                cons.append("12-inch limit rules out large family pizzas")
            else:
                cons.append("Large footprint for a countertop appliance")
    return cons[:2]


# --------------------------------------------------------------------------- pipeline

def relevant(title: str, slug: str, category: str) -> str | None:
    """Return a reason string when the record should be dropped, else None."""
    low = title.lower()
    if EXCLUDE_COMMON.search(low):
        return "accessory, consumable or off-category item"
    if EXCLUDE_CONSUMABLE.search(low) and not APPLIANCE_WORDS.search(low):
        return "consumable (pods or filters), not a coffee maker"
    if not re.search(ANCHORS[category], low):
        return "does not describe the appliance this guide covers"
    require, exclude = INTENT.get(slug, (None, None))
    if require and not re.search(require, low):
        return "does not match the guide's format or intent"
    if exclude and re.search(exclude, low):
        return "outside the size or format this guide covers"
    if slug in SMOOTHIE_GUIDES and re.search(r"immersion|hand blender", low):
        return "immersion blenders do not fit a smoothie guide"
    if slug == "best-grind-and-brew-coffee-maker" and re.search(r"coffee grinder|bean grinder", low) and not re.search(r"maker|brew|machine", low):
        return "standalone grinder, not a grind-and-brew machine"
    if slug == "best-blender-food-processor-combo" and "food processor" in low and not re.search(r"blender|kitchen system|combo", low):
        return "food processor only, not a blender combo"
    return None


def main() -> int:
    raw = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    picks = json.loads(PICKS_PATH.read_text(encoding="utf-8")) if PICKS_PATH.exists() else {}
    catalog: dict[str, list[dict]] = {}
    audit: dict[str, dict] = {}
    listings: dict[str, list[dict]] = {slug: list(records) for slug, records in raw["listings"].items()}

    # global record pool for virtual listings
    pool: dict[str, dict] = {}
    for slug, records in raw["listings"].items():
        if guide_category(slug) != "air-fryers":
            continue
        for rec in records:
            pool.setdefault(rec["asin"], rec)
    for rec in EXTRA_RECORDS:
        pool.setdefault(rec["asin"], rec)
    for slug, spec in VIRTUAL_LISTINGS.items():
        chosen: list[dict] = []
        seen: set[str] = set()
        for asin in spec["seeds"]:
            if asin in pool and asin not in seen:
                chosen.append(pool[asin]); seen.add(asin)
        if spec["include"]:
            for asin, rec in pool.items():
                if asin in seen or len(chosen) >= spec["limit"]:
                    continue
                low = rec["title"].lower()
                if re.search(spec["include"], low) and not (spec["exclude"] and re.search(spec["exclude"], low)) \
                        and not EXCLUDE_COMMON.search(low) and re.search(ANCHORS["air-fryers"], low):
                    chosen.append(rec); seen.add(asin)
        listings[slug] = [dict(rec, position=i + 1) for i, rec in enumerate(chosen[: spec["limit"]])]

    for slug, records in listings.items():
        category = guide_category(slug)
        pick_asins = set(picks.get(slug, []))
        kept: list[dict] = []
        removed: list[dict] = []
        merged: list[dict] = []

        for rec in records:
            reason = relevant(rec["title"], slug, category)
            if reason and rec["asin"] not in pick_asins:
                removed.append({"asin": rec["asin"], "title": rec["title"], "reason": reason})
                continue
            kept.append(dict(rec))

        # de-duplicate colour variants
        groups: list[dict] = []
        for rec in kept:
            key = normalize_key(rec["title"])
            target = None
            for g in groups:
                if g["key"][0] == key[0] and (g["key"] == key or jaccard(g["key"], key) >= 0.82):
                    target = g
                    break
            if target is None:
                groups.append({"key": key, "members": [rec]})
            else:
                target["members"].append(rec)

        products: list[dict] = []
        for g in groups:
            members = g["members"]
            rep = next((m for m in members if m["asin"] in pick_asins), members[0])
            if len(members) > 1:
                merged.append({"kept": rep["asin"], "merged": [m["asin"] for m in members if m is not rep], "title": rep["title"]})
            f = extract_specs(rep["title"], category)
            low = rep["title"].lower()
            products.append({
                "asin": rep["asin"],
                "title": clean_title(rep["title"]),
                "name": short_name(rep["title"]),
                "brand": brand_of(rep["title"]),
                "image": rep["image"],
                "amazonUrl": rep["amazonUrl"],
                "format": f["format"],
                "specs": f["specs"],
                "fit": fit_line(f, category, low),
                "pros": pros_for(f, category, low),
                "cons": cons_for(f, category, low),
                "variants": len(members) - 1,
            })

        catalog[slug] = products
        audit[slug] = {
            "category": category,
            "source": len(records),
            "published": len(products),
            "removed": removed,
            "merged": merged,
        }
        missing = [a for a in pick_asins if all(p["asin"] != a for p in products)]
        if missing:
            print(f"WARNING {slug}: pick ASINs not present after processing: {missing}", file=sys.stderr)
        print(f"{slug:46s} {len(records):3d} -> {len(products):3d}  (removed {len(removed)}, merged {sum(len(m['merged']) for m in merged)})")

    index: dict[str, dict] = {}
    for slug, products in catalog.items():
        for product in products:
            index.setdefault(product["asin"], product)
    counts = {slug: {"source": len(raw["listings"].get(slug, [])), "published": len(products)} for slug, products in catalog.items()}
    payload = {
        "generatedBy": "scripts/build-product-catalog.py",
        "totalProducts": sum(len(v) for v in catalog.values()),
        "uniqueAsins": len(index),
        "counts": counts,
        "listings": catalog,
        "index": index,
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    AUDIT_PATH.write_text(json.dumps(audit, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"\nWrote {payload['totalProducts']} products ({payload['uniqueAsins']} unique ASINs) to {OUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
