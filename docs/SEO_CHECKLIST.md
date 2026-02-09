# SEO validation checklist

## Pre-deploy

- [ ] **robots.txt** — `GET /robots.txt` returns 200, contains `Allow: /`, `Disallow: /admin`, `Disallow: /login`, `Disallow: /wp-admin`, `Sitemap: https://pablogoldberg.com/sitemap.xml`
- [ ] **llms.txt** — `GET /llms.txt` returns 200, plain text describing site for LLMs
- [ ] **sitemap.xml** — `GET /sitemap.xml` returns 200, includes `/`, `/es`, `/en`, `/es/work`, `/es/about`, `/es/contact`, project URLs; has `lastmod` and `changefreq`
- [ ] **No legacy WP leaks** — No `noindex`/`nofollow` on public pages; no meta robots from WordPress; `/wp-admin` and `/wp-login` only in robots disallow (not served by app)
- [ ] **Public pages indexable** — Home, work, about, contact, project detail: no `robots: noindex` in metadata
- [ ] **Admin not indexable** — `/admin` and children have `robots: { index: false, follow: false }`
- [ ] **Hreflang** — All public pages have `alternates.languages` with `es`, `en`, `x-default` (check `<link rel="alternate" hreflang="es">` in HTML)
- [ ] **Canonicals** — Every public page has a single canonical URL (via metadata or CanonicalLink), no double slashes
- [ ] **OG/Twitter** — Default OG image and description; project pages have OG title/description/image (fallback to default image if no cover), and `og:video` when `video_url` exists
- [ ] **JSON-LD** — Person on site; VideoObject or CreativeWork on project pages; all URLs absolute

## Quick automated check

With dev server running:

```bash
npm run seo:validate
```

Or against production:

```bash
BASE=https://pablogoldberg.com npm run seo:validate
```

## Sitemap priorities (current)

| Path              | priority | changefreq |
|-------------------|----------|------------|
| / (root)          | 0.95     | weekly     |
| /es, /en (home)   | 1        | weekly     |
| /es/work, /en/work| 0.9      | weekly     |
| /es/about, /en/about | 0.7   | monthly    |
| /es/contact, /en/contact | 0.8 | monthly    |
| /es/work/:slug    | 0.75     | monthly    |

## WP legacy

- `content/wp-export.xml` is legacy data only; it is not served as a route. No WordPress meta or robots are rendered by the Next app.
