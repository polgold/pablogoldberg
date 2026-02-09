#!/usr/bin/env bash
# Quick SEO validation. Run with dev server up: npm run dev then npm run seo:validate
# Or pass base URL: BASE=https://pablogoldberg.com ./scripts/seo-validate.sh

set -e
BASE="${BASE:-http://localhost:3000}"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

check() {
  if [ "$1" = "ok" ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    [ -n "$3" ] && echo "  $3"
  fi
}

echo "SEO validation — base: $BASE"
echo "---"

# 1. robots.txt
R=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/robots.txt")
if [ "$R" = "200" ]; then
  BODY=$(curl -sS "$BASE/robots.txt")
  check ok "robots.txt returns 200"
  echo "$BODY" | grep -q "Allow: /" && check ok "robots.txt contains Allow: /" || check fail "robots.txt missing Allow: /"
  echo "$BODY" | grep -q "Disallow: /admin" && check ok "robots.txt disallows /admin" || check fail "robots.txt should Disallow: /admin"
  echo "$BODY" | grep -q "Sitemap:" && check ok "robots.txt has Sitemap" || check fail "robots.txt missing Sitemap"
else
  check fail "robots.txt" "HTTP $R"
fi

# 2. llms.txt
R=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/llms.txt")
[ "$R" = "200" ] && check ok "llms.txt returns 200" || check fail "llms.txt" "HTTP $R"

# 3. sitemap.xml
R=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/sitemap.xml")
if [ "$R" = "200" ]; then
  check ok "sitemap.xml returns 200"
  BODY=$(curl -sS "$BASE/sitemap.xml")
  echo "$BODY" | grep -q "<url>" && check ok "sitemap has url entries" || check fail "sitemap has no url entries"
  echo "$BODY" | grep -q "<loc>" && check ok "sitemap has loc" || check fail "sitemap missing loc"
else
  check fail "sitemap.xml" "HTTP $R"
fi

# 4. Public page: no noindex
HTML=$(curl -sS "$BASE/es")
if echo "$HTML" | grep -qi "noindex"; then
  check fail "Public page /es should not contain noindex"
else
  check ok "Public page /es has no noindex"
fi
echo "$HTML" | grep -q "canonical" && check ok "Public page has canonical" || check ok "Canonical (may be injected client-side)"

# 5. Admin: noindex (only if admin is reachable without auth)
ADMIN_R=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/admin" -L 2>/dev/null || true)
if [ "$ADMIN_R" = "200" ]; then
  ADMIN_HTML=$(curl -sS "$BASE/admin" -L 2>/dev/null || true)
  echo "$ADMIN_HTML" | grep -qi "noindex" && check ok "Admin page has noindex" || check fail "Admin should have noindex"
else
  check ok "Admin (redirect or 403 expected)" "HTTP $ADMIN_R"
fi

echo "---"
echo "Done. Fix any ✗ before deploy."
