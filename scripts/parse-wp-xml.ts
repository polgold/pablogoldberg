/**
 * WordPress WXR parser — outputs JSON to content/generated/
 * Run: npx tsx scripts/parse-wp-xml.ts
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { XMLParser } from "fast-xml-parser";

const XML_PATH = join(process.cwd(), "content/wp-export.xml");
const OUT_DIR = join(process.cwd(), "content/generated");

const SKIP_SLUGS = new Set([
  "home",
  "about",
  "contact",
  "contact-2",
  "services",
  "projects",
  "fondoweb",
]);
const SKIP_TITLE_LOWER = new Set([
  "login",
  "register",
  "members",
  "account",
  "wp-login",
  "elementor",
]);

interface WpItem {
  title?: string;
  link?: string;
  "content:encoded"?: string;
  "excerpt:encoded"?: string;
  "wp:post_id"?: string;
  "wp:post_date"?: string;
  "wp:post_modified"?: string;
  "wp:post_name"?: string;
  "wp:post_type"?: string;
  "wp:post_parent"?: string;
  "wp:status"?: string;
  "wp:attachment_url"?: string;
  "wp:postmeta"?: Array<{ "wp:meta_key"?: string; "wp:meta_value"?: string }> | { "wp:meta_key"?: string; "wp:meta_value"?: string };
  "category"?: Array<{ "@_domain"?: string; "#text"?: string }> | { "@_domain"?: string; "#text"?: string };
}

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return String(v).trim();
}

function first<T>(arr: T | T[] | undefined): T | undefined {
  if (arr == null) return undefined;
  return Array.isArray(arr) ? arr[0] : arr;
}

function array<T>(arr: T | T[] | undefined): T[] {
  if (arr == null) return [];
  return Array.isArray(arr) ? arr : [arr];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}

const ALLOWED_TAGS = /<(p|h2|h3|h4|ul|ol|li|strong|em|a|blockquote|br)(\s[^>]*)?>|<\/(p|h2|h3|h4|ul|ol|li|strong|em|a|blockquote|br)>/gi;
const ALLOWED_ATTRS = /(\s(href|target|rel)=["'][^"']*["'])/gi;

function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[contact-form-7[^\]]*\]/gi, "")
    .replace(/\[elementor[^\]]*\]/gi, "")
    .replace(/\s*data-elementor[^=]*="[^"]*"/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  const stripExceptAllowed = out.replace(/<[^>]+>/g, (tag) => {
    const match = tag.match(/^<\/?([a-zA-Z0-9]+)/);
    const name = match ? match[1].toLowerCase() : "";
    if (["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br"].includes(name)) {
      if (name === "a") {
        const hrefMatch = tag.match(/href=["']([^"']*)["']/i);
        const href = hrefMatch ? hrefMatch[1] : "#";
        const target = tag.includes('target="_blank"') ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${href}"${target}>`;
      }
      return tag;
    }
    return "";
  });
  return stripExceptAllowed.replace(/\n{3,}/g, "\n\n").trim();
}

function extractVimeoIds(html: string): string[] {
  const ids: string[] = [];
  const iframe = /player\.vimeo\.com\/video\/(\d+)/gi;
  const link = /vimeo\.com\/(\d+)/g;
  let m;
  while ((m = iframe.exec(html)) !== null) ids.push(m[1]);
  while ((m = link.exec(html)) !== null) { if (!ids.includes(m[1])) ids.push(m[1]); }
  return [...new Set(ids)];
}

function extractYoutubeIds(html: string): string[] {
  const ids: string[] = [];
  const patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    /youtu\.be\/([a-zA-Z0-9_-]+)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) { if (!ids.includes(m[1])) ids.push(m[1]); }
  }
  return [...new Set(ids)];
}

function getMeta(item: WpItem, key: string): string {
  const meta = item["wp:postmeta"];
  if (!meta) return "";
  const list = array(meta);
  const found = list.find((m) => text(m["wp:meta_key"]) === key);
  return found ? text(found["wp:meta_value"]) : "";
}

function extractFromElementorData(dataJson: string): { vimeoIds: string[]; youtubeIds: string[]; firstVimeo?: string } {
  const vimeoIds: string[] = [];
  const youtubeIds: string[] = [];
  try {
    const str = dataJson.replace(/\\\//g, "/");
    const vimeo = /player\.vimeo\.com\/video\/(\d+)/g;
    const yt = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)|youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+)/g;
    let m;
    while ((m = vimeo.exec(str)) !== null) vimeoIds.push(m[1]);
    while ((m = yt.exec(str)) !== null) {
      const id = m[1] || m[2] || m[3];
      if (id && !youtubeIds.includes(id)) youtubeIds.push(id);
    }
  } catch (_) {}
  return {
    vimeoIds: [...new Set(vimeoIds)],
    youtubeIds: [...new Set(youtubeIds)],
    firstVimeo: vimeoIds[0],
  };
}

function main() {
  const xml = readFileSync(XML_PATH, "utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
  });
  const raw = parser.parse(xml);
  const channel = raw?.rss?.channel;
  if (!channel) {
    console.error("No <channel> in XML");
    process.exit(1);
  }

  const items: WpItem[] = array(channel.item).filter(Boolean);

  const attachmentsByUrl = new Map<string, string>();
  const attachmentsById = new Map<string, string>();
  for (const item of items) {
    if (text(item["wp:post_type"]) !== "attachment") continue;
    const url = text(item["wp:attachment_url"]) || text(item.link);
    const id = text(item["wp:post_id"]);
    if (url) {
      attachmentsByUrl.set(url, url);
      if (id) attachmentsById.set(id, url);
    }
  }

  const pages: Array<{
    slug: string;
    title: string;
    content: string;
    date: string;
    modified: string;
    excerpt: string;
  }> = [];
  const projects: Array<{
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    modified: string;
    year: string;
    roles: string[];
    featuredImage?: string;
    videoUrls: { vimeo?: string[]; youtube?: string[] };
    primaryVideo?: { type: "vimeo" | "youtube"; id: string };
    galleryImages: string[];
    credits?: string;
  }> = [];
  const taxonomy: { categories: Array<{ slug: string; name: string }>; tags: Array<{ slug: string; name: string }> } = {
    categories: [],
    tags: [],
  };

  const categoryTerms = array(channel["wp:category"]).concat(array(channel["wp:term"] || []));
  for (const t of categoryTerms) {
    const name = text(t["wp:cat_name"] ?? t["wp:term_name"]);
    const slug = text(t["wp:category_nicename"] ?? t["wp:term_slug"]);
    const tax = text(t["wp:term_taxonomy"] ?? "");
    if (name && slug && !["nav_menu", "elementor_library_type", "wp_theme"].includes(tax)) {
      if (tax === "category" || !tax) taxonomy.categories.push({ slug, name });
      else if (tax === "post_tag") taxonomy.tags.push({ slug, name });
    }
  }

  for (const item of items) {
    const postType = text(item["wp:post_type"]);
    const status = text(item["wp:status"]);
    const slug = slugify(text(item["wp:post_name"]) || text(item.title) || "post");
    const title = text(item.title);

    if (status !== "publish" && postType === "page") continue;
    if (SKIP_TITLE_LOWER.has(title.toLowerCase())) continue;
    if (["nav_menu_item", "elementor_library"].includes(postType)) continue;

    if (postType === "page") {
      const content = sanitizeHtml(text(item["content:encoded"]));
      const excerpt = sanitizeHtml(text(item["excerpt:encoded"]));
      const date = text(item["wp:post_date"]);
      const modified = text(item["wp:post_modified"]);
      const year = date ? date.slice(0, 4) : "";

      const elementorData = getMeta(item, "_elementor_data");
      const { vimeoIds, youtubeIds, firstVimeo } = elementorData
        ? extractFromElementorData(elementorData)
        : { vimeoIds: extractVimeoIds(content), youtubeIds: extractYoutubeIds(content), firstVimeo: undefined };
      const primaryVideo = firstVimeo
        ? { type: "vimeo" as const, id: firstVimeo }
        : youtubeIds[0]
          ? { type: "youtube" as const, id: youtubeIds[0] }
          : undefined;

      const galleryImages: string[] = [];
      const hrefs = content.match(/href=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/gi) || [];
      for (const h of hrefs) {
        const u = h.replace(/href=["']|["']/g, "").trim();
        if (u && !galleryImages.includes(u)) galleryImages.push(u);
      }

      const pageEntry = {
        slug,
        title: title || slug,
        content,
        date,
        modified,
        excerpt,
      };

      if (SKIP_SLUGS.has(slug) || slug.startsWith("elementor")) {
        pages.push(pageEntry);
        continue;
      }

      const thumbnailId = getMeta(item, "_thumbnail_id");
      const featuredImage =
        (thumbnailId && attachmentsById.get(thumbnailId)) || galleryImages[0];

      projects.push({
        ...pageEntry,
        year,
        roles: [],
        featuredImage,
        videoUrls: { vimeo: vimeoIds.length ? vimeoIds : undefined, youtube: youtubeIds.length ? youtubeIds : undefined },
        primaryVideo,
        galleryImages,
      });
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "pages.json"), JSON.stringify(pages, null, 2));
  writeFileSync(join(OUT_DIR, "projects.json"), JSON.stringify(projects, null, 2));
  writeFileSync(join(OUT_DIR, "taxonomy.json"), JSON.stringify(taxonomy, null, 2));

  console.log(`Wrote ${pages.length} pages, ${projects.length} projects to ${OUT_DIR}`);
}

main();
