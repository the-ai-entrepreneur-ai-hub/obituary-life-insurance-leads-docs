#!/usr/bin/env bash
# Obituary Life-Insurance Lead Scraper — curl examples
# Replace APIFY_TOKEN with your token from https://console.apify.com/account/integrations

URL="https://george-the-developer--obituary-life-insurance-leads.apify.actor"
TOKEN="${APIFY_TOKEN:-your_token_here}"

echo "=== Service info ==="
curl -s "${URL}/" -H "Authorization: Bearer ${TOKEN}"

echo
echo "=== Recent obituaries in Phoenix, AZ ==="
curl -s "${URL}/search?location=Phoenix,AZ&days=7&limit=20" \
  -H "Authorization: Bearer ${TOKEN}"

echo
echo "=== Single obituary enrichment ==="
curl -s "${URL}/enrich?url=https%3A%2F%2Fwww.legacy.com%2Fus%2Fobituaries%2Fexample" \
  -H "Authorization: Bearer ${TOKEN}"

echo
echo "=== Bulk enrichment ==="
curl -s -X POST "${URL}/enrich/bulk" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://www.legacy.com/...","https://www.tributes.com/..."]}'
