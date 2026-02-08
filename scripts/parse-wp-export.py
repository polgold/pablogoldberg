#!/usr/bin/env python3
"""
Parser para WordPress WXR (eXtended RSS) export.

Uso:
  python scripts/parse-wp-export.py content/wp-export.xml
  python scripts/parse-wp-export.py content/wp-export.xml --stats
  python scripts/parse-wp-export.py content/wp-export.xml --post-type page
  python scripts/parse-wp-export.py content/wp-export.xml --post-type page --post-type post
  python scripts/parse-wp-export.py content/wp-export.xml --projects-page
  python scripts/parse-wp-export.py content/wp-export.xml -o content/parsed.json

Ver content/wp-export-summary.md para resumen de post_types y categorías.
"""

import argparse
import json
import re
import sys
from pathlib import Path

# Namespaces del XML WXR
NAMESPACES = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
}


def text(el, strip=True):
    """Obtiene el texto de un elemento XML."""
    if el is None:
        return ""
    s = (el.text or "") + "".join((n.tail or "") for n in el.iter() if n.text)
    return s.strip() if strip else s


def parse_item(item):
    """Extrae datos de un item (post/page/attachment)."""
    def get(name, ns="wp"):
        if ns:
            el = item.find(f".//{{{NAMESPACES[ns]}}}{name}")
        else:
            el = item.find(f".//{name}")
        return (text(el) if el is not None else "").strip()

    post_type = get("post_type")
    status = get("status")

    data = {
        "id": get("post_id"),
        "title": item.find("title").text if item.find("title") is not None else "",
        "link": get("link", None) or (item.find("link").text if item.find("link") is not None else ""),
        "pubDate": get("pubDate", None) or (item.find("pubDate").text if item.find("pubDate") is not None else ""),
        "creator": get("creator", "dc"),
        "guid": text(item.find("guid")) if item.find("guid") is not None else "",
        "post_type": post_type,
        "post_name": get("post_name"),
        "post_date": get("post_date"),
        "post_modified": get("post_modified"),
        "post_parent": get("post_parent") or "0",
        "status": status,
        "content": get("encoded", "content"),
        "excerpt": get("encoded", "excerpt"),
        "meta": {},
    }

    # Attachments: url del archivo
    if post_type == "attachment":
        att_url = item.find(".//{http://wordpress.org/export/1.2/}attachment_url")
        if att_url is not None and att_url.text:
            data["attachment_url"] = att_url.text
        # Meta útil para attachments
        for meta in item.findall(".//{http://wordpress.org/export/1.2/}postmeta"):
            key_el = meta.find("{http://wordpress.org/export/1.2/}meta_key")
            val_el = meta.find("{http://wordpress.org/export/1.2/}meta_value")
            if key_el is not None and val_el is not None and key_el.text:
                key = key_el.text.strip()
                if key in ("_wp_attached_file", "_wp_attachment_metadata"):
                    data["meta"][key] = val_el.text or ""

    # Postmeta para todos los items
    for meta in item.findall(".//{http://wordpress.org/export/1.2/}postmeta"):
        key_el = meta.find("{http://wordpress.org/export/1.2/}meta_key")
        val_el = meta.find("{http://wordpress.org/export/1.2/}meta_value")
        if key_el is not None and val_el is not None and key_el.text:
            key = key_el.text.strip()
            # Evitar meta muy grande (Elementor, etc.) salvo si se pide explícito
            if key.startswith("_elementor_data"):
                data["meta"][key] = "(truncated)" if len(val_el.text or "") > 500 else (val_el.text or "")
            else:
                data["meta"][key] = val_el.text or ""

    # Categorías y términos del item
    terms = []
    for cat in item.findall(".//{http://wordpress.org/export/1.2/}category"):
        domain = cat.get("domain")
        nicename = cat.get("nicename")
        if domain or nicename:
            terms.append({"domain": domain or "category", "slug": nicename or ""})
    data["terms"] = terms

    return data


def parse_channel(channel):
    """Extrae metadata del canal y listas de categorías/términos."""
    result = {
        "site": {
            "title": "",
            "link": "",
            "description": "",
        },
        "authors": [],
        "categories": [],
        "terms": [],  # Otras taxonomías (elementor_library_type, nav_menu, etc.)
        "items": [],
    }

    title_el = channel.find("title")
    if title_el is not None and title_el.text:
        result["site"]["title"] = title_el.text
    link_el = channel.find("link")
    if link_el is not None and link_el.text:
        result["site"]["link"] = link_el.text
    desc_el = channel.find("description")
    if desc_el is not None and desc_el.text:
        result["site"]["description"] = desc_el.text

    for author in channel.findall(".//{http://wordpress.org/export/1.2/}author"):
        a = {
            "id": text(author.find("{http://wordpress.org/export/1.2/}author_id")),
            "login": text(author.find("{http://wordpress.org/export/1.2/}author_login")),
            "email": text(author.find("{http://wordpress.org/export/1.2/}author_email")),
            "display_name": text(author.find("{http://wordpress.org/export/1.2/}author_display_name")),
        }
        result["authors"].append(a)

    for cat in channel.findall(".//{http://wordpress.org/export/1.2/}category"):
        c = {
            "term_id": text(cat.find("{http://wordpress.org/export/1.2/}term_id")),
            "nicename": text(cat.find("{http://wordpress.org/export/1.2/}category_nicename")),
            "name": text(cat.find("{http://wordpress.org/export/1.2/}cat_name")),
            "parent": text(cat.find("{http://wordpress.org/export/1.2/}category_parent")),
        }
        result["categories"].append(c)

    for term in channel.findall(".//{http://wordpress.org/export/1.2/}term"):
        term_tax = term.find("{http://wordpress.org/export/1.2/}term_taxonomy")
        if term_tax is not None and term_tax.text:
            t = {
                "term_id": text(term.find("{http://wordpress.org/export/1.2/}term_id")),
                "taxonomy": term_tax.text,
                "slug": text(term.find("{http://wordpress.org/export/1.2/}term_slug")),
                "name": text(term.find("{http://wordpress.org/export/1.2/}term_name")),
            }
            result["terms"].append(t)

    return result


def extract_vimeo_ids(content):
    """Extrae IDs de Vimeo de contenido HTML."""
    pattern = r"vimeo\.com/(?:video/)?(\d+)"
    return list(set(re.findall(pattern, content or "")))


def extract_youtube_ids(content):
    """Extrae IDs de YouTube de contenido HTML."""
    patterns = [
        r"youtube\.com/watch\?v=([a-zA-Z0-9_-]+)",
        r"youtu\.be/([a-zA-Z0-9_-]+)",
    ]
    ids = []
    for p in patterns:
        ids.extend(re.findall(p, content or ""))
    return list(set(ids))


def main():
    parser = argparse.ArgumentParser(description="Parser de WordPress WXR export")
    parser.add_argument("xml_path", type=Path, help="Ruta al archivo wp-export.xml")
    parser.add_argument(
        "--post-type",
        action="append",
        help="Filtrar solo estos post types (puede repetirse: --post-type page --post-type post)",
    )
    parser.add_argument("--status", default="", help="Solo items con este status (vacío = todos)")
    parser.add_argument("-o", "--output", type=Path, help="Archivo JSON de salida")
    parser.add_argument("--stats", action="store_true", help="Mostrar estadísticas y salir")
    parser.add_argument("--projects-page", action="store_true", help="Incluir solo la página Projects y sus attachments")
    args = parser.parse_args()

    if not args.xml_path.exists():
        print(f"Error: no existe {args.xml_path}", file=sys.stderr)
        sys.exit(1)

    try:
        import xml.etree.ElementTree as ET
    except ImportError:
        print("Error: se requiere xml.etree.ElementTree", file=sys.stderr)
        sys.exit(1)

    tree = ET.parse(args.xml_path)
    root = tree.getroot()

    channel = root.find("channel")
    if channel is None:
        print("Error: no se encontró elemento channel", file=sys.stderr)
        sys.exit(1)

    data = parse_channel(channel)

    post_types_count = {}
    all_parsed = []

    for item in channel.findall("item"):
        parsed = parse_item(item)
        post_type = parsed["post_type"]
        post_types_count[post_type] = post_types_count.get(post_type, 0) + 1
        all_parsed.append(parsed)

    if not args.stats:
        projects_page_id = None
        for p in all_parsed:
            if p["post_name"] == "projects" and p["post_type"] == "page":
                projects_page_id = p["id"]
                break

        for parsed in all_parsed:
            post_type = parsed["post_type"]

            if args.status and parsed.get("status", "").strip() != args.status:
                continue

            if args.post_type and post_type not in args.post_type:
                continue

            if args.projects_page:
                if post_type == "page" and parsed["post_name"] == "projects":
                    data["items"].append(parsed)
                elif post_type == "attachment" and projects_page_id and parsed["post_parent"] == str(projects_page_id):
                    data["items"].append(parsed)
                continue

            data["items"].append(parsed)

    if args.stats:
        print("=== Resumen wp-export.xml ===\n")
        print("Post types:")
        for pt, count in sorted(post_types_count.items(), key=lambda x: -x[1]):
            print(f"  - {pt}: {count}")
        print("\nCategorías:")
        for c in data["categories"]:
            print(f"  - {c['name']} (slug: {c['nicename']})")
        print("\nCustom post type 'project'/'projects': NO. 'Projects' es una página (post_type=page).")
        return

    # Enriquecer items: Vimeo/YouTube IDs
    for item in data["items"]:
        content = item.get("content", "") or ""
        item["vimeo_ids"] = extract_vimeo_ids(content)
        item["youtube_ids"] = extract_youtube_ids(content)
        # Meta _elementor_data puede tener más URLs
        el_data = item.get("meta", {}).get("_elementor_data", "")
        if el_data and el_data != "(truncated)":
            item["vimeo_ids"] = list(set(item["vimeo_ids"] + extract_vimeo_ids(el_data)))
            item["youtube_ids"] = list(set(item["youtube_ids"] + extract_youtube_ids(el_data)))

    out = args.output or Path("content/parsed.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Parseado: {len(data['items'])} items → {out}")


if __name__ == "__main__":
    main()
