#!/usr/bin/env python3
"""Obituary Life-Insurance Lead Scraper - Python example."""
import os
import urllib.parse
import requests

URL = "https://george-the-developer--obituary-life-insurance-leads.apify.actor"
TOKEN = os.environ.get("APIFY_TOKEN", "your_token_here")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}


def get(path: str):
    r = requests.get(f"{URL}{path}", headers=HEADERS, timeout=120)
    r.raise_for_status()
    return r.json()


def post(path: str, body: dict):
    r = requests.post(f"{URL}{path}", headers=HEADERS, json=body, timeout=120)
    r.raise_for_status()
    return r.json()


def main():
    # 1. Recent Phoenix obituaries
    recent = get("/search?location=Phoenix,AZ&days=7&limit=20")
    print(f"Found {recent['count']} obituaries in {recent['location']}")
    for r in recent["results"][:5]:
        print(f"  {r.get('name'):<30} | age {r.get('age') or '?':<3} | {r.get('date') or '?'}")

    # 2. Enrich first result
    if recent["results"]:
        target = recent["results"][0]["url"]
        encoded = urllib.parse.quote(target, safe="")
        detail = get(f"/enrich?url={encoded}")
        if detail.get("ok"):
            rec = detail["record"]
            print("\nEnriched record:")
            print(f"  Deceased: {rec['deceased']['name']}")
            print(f"  Lead score: {rec['lead_score']}")
            print(f"  Surviving family: {len(rec['surviving_family'])}")
            print(f"  Funeral home: {(rec.get('funeral_home') or {}).get('name') or 'none'}")
            print("  Pitch angles:")
            for angle in rec["insurance_pitch_angles"]:
                print(f"   - {angle}")
        else:
            print("Enrichment failed:", detail.get("error"))

    # 3. Bulk enrich
    bulk_urls = [r["url"] for r in recent["results"][:3]]
    if bulk_urls:
        bulk = post("/enrich/bulk", {"urls": bulk_urls})
        print(f"\nBulk: {bulk['count']} URLs, {bulk['billable']} billable")


if __name__ == "__main__":
    main()
