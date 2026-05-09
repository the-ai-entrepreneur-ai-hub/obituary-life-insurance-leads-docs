// Obituary Life-Insurance Lead Scraper — Node.js example
// Requires Node 18+ (built-in fetch)

const URL = 'https://george-the-developer--obituary-life-insurance-leads.apify.actor';
const TOKEN = process.env.APIFY_TOKEN || 'your_token_here';

async function get(path) {
  const res = await fetch(`${URL}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  // 1. Recent Phoenix obituaries (basic discovery)
  const recent = await get('/search?location=Phoenix,AZ&days=7&limit=20');
  console.log(`Found ${recent.count} obituaries in ${recent.location}`);
  for (const r of recent.results.slice(0, 5)) {
    console.log(`  ${r.name} | age ${r.age || '?'} | ${r.date || '?'}`);
  }

  // 2. Enrich one obituary URL
  if (recent.results.length > 0) {
    const target = recent.results[0].url;
    const enrichUrl = `/enrich?url=${encodeURIComponent(target)}`;
    const detail = await get(enrichUrl);
    if (detail.ok) {
      const r = detail.record;
      console.log('\nEnriched record:');
      console.log('  Deceased:', r.deceased.name);
      console.log('  Lead score:', r.lead_score);
      console.log('  Surviving family:', r.surviving_family.length);
      console.log('  Funeral home:', r.funeral_home?.name || 'none');
      console.log('  Pitch angles:');
      for (const angle of r.insurance_pitch_angles) console.log('   -', angle);
    } else {
      console.log('Enrichment failed:', detail.error);
    }
  }

  // 3. Bulk enrich
  const bulkUrls = recent.results.slice(0, 3).map((r) => r.url);
  if (bulkUrls.length > 0) {
    const bulk = await post('/enrich/bulk', { urls: bulkUrls });
    console.log(`\nBulk: ${bulk.count} URLs, ${bulk.billable} billable`);
  }
}

main().catch(console.error);
