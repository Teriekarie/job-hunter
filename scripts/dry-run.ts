// Test the search against the live job boards without saving anything:  npm run search:dry
import fs from 'node:fs';
import { runSearch } from '../lib/pipeline/run';

const profile = JSON.parse(fs.readFileSync('profile/search-profile.json', 'utf8'));
const cvText = fs.readFileSync('profile/cv.md', 'utf8');
const companies = JSON.parse(fs.readFileSync('lib/sources/starter-companies.json', 'utf8'));
runSearch({ profile, cvText, existing: [], companies }).then((r) => {
  console.log('Sources:', r.stats.map((s) => `${s.source}=${s.error ? 'FAILED: ' + s.error : s.found}`).join(' | '));
  console.log(`Discovered ${r.discovered.length} new company boards: ${r.discovered.map((b) => b.ats + ':' + b.slug).join(', ')}`);
  console.log(`Found ${r.found} · her kind of role ${r.relevant} · duplicates merged ${r.merged} · dropped ${r.dropped.length} · kept ${r.jobs.length}\n`);
  for (const j of r.jobs) console.log(`${j.match_score} ${j.match_band.padEnd(9)} [${j.eligibility_label}] [${j.trust_label}] [${j.apply_method}] ${j.title} — ${j.company} (${j.sources.map((s) => s.source).join('+')}) ${j.posted_at}\n     ${j.eligibility_evidence}`);
  const why: Record<string, number> = {};
  r.dropped.forEach((d) => { const k = d.reason.split(':')[0]; why[k] = (why[k] || 0) + 1; });
  console.log('\nDropped by reason:', why);
  r.dropped.slice(0, 25).forEach((d) => console.log(`  - ${d.title} — ${d.company}: ${d.reason}`));
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(r, null, 1));
});
