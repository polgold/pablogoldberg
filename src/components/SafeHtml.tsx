"use client";

const ALLOWED_TAGS = ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br"];

function sanitize(html: string): string {
  if (!html) return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, (tag) => {
      const match = tag.match(/^<\/?([a-zA-Z0-9]+)/);
      const name = match ? match[1].toLowerCase() : "";
      if (!ALLOWED_TAGS.includes(name)) return "";
      if (name === "a") {
        const hrefMatch = tag.match(/href=["']([^"']*)["']/i);
        const href = hrefMatch ? hrefMatch[1] : "#";
        const safe = href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#") ? href : "#";
        const target = tag.includes('target="_blank"') ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${safe}"${target}>`;
      }
      return tag;
    });
}

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const cleaned = sanitize(html);
  return <div className={className} dangerouslySetInnerHTML={{ __html: cleaned }} />;
}
