import type { SearchProfile } from '../types';
import { norm } from './text';

// Which of Thess's role families does a job title belong to? No match = not her kind of job.
const FAMILY_PATTERNS: Record<string, RegExp> = {
  'Automation': /\b(automation|automations|no code|low code|nocode|n8n|zapier|make com|workflow|power automate|power platform|rpa)\b/,
  'Data & BI': /\b(data analyst|bi analyst|bi developer|bi engineer|business intelligence|analytics lead|analytics manager|analytics analyst|analytics engineer|reporting analyst|insights analyst|insights specialist|data and insights|power bi|tableau|data analytics)\b/,
  'CRM & RevOps': /\b(crm|revops|revenue operations|sales operations|sales ops|marketing operations|marketing ops|marketing automation|gtm engineer|gtm operations|gtm ops|hubspot|zoho|salesforce admin|salesforce administrator|gohighlevel)\b/,
  'AI & Agents': /\b(ai|llm|agentic|genai|generative ai)\b.*\b(automation|solutions?|operations|ops|agents?|workflows?|implementation|consultant|specialist|enablement|adoption|transformation|strategist)\b|\b(automation|solutions?|operations|agents?|workflow|implementation)\b.*\b(ai|llm)\b/,
  'Product & Business Ops': /\b(product operations|product ops|business systems|digital transformation|implementation specialist|implementation engineer|implementation consultant|implementation manager|solutions consultant|technical project manager|business analyst|systems analyst|process improvement|process analyst|business operations)\b/,
  'Customer Ops': /\b(customer success operations|cs ops|cs operations|customer experience analyst|technical support specialist|technical support engineer|customer operations|service delivery|support operations)\b/,
};

// Titles that contain "automation" etc. but are a different profession.
const NOT_HER_FIELD = /\b(qa|sdet|test|testing|quality assurance|plc|controls|hvac|building automation|industrial|electrical|mechanical|robotics|manufacturing|account executive|sales development|devops|cloud|quality|blockchain|infrastructure|security|embedded|network automation|firmware)\b/;

export function roleFamilies(title: string, profile: SearchProfile): string[] {
  const t = norm(title);
  if (NOT_HER_FIELD.test(t)) return [];
  const out = new Set<string>();
  for (const [fam, re] of Object.entries(FAMILY_PATTERNS)) if (re.test(t)) out.add(fam);
  for (const [fam, words] of Object.entries(profile.roleFamilies || {})) {
    for (const w of words) {
      const k = norm(w);
      if (k.includes(' ') && t.includes(k)) out.add(fam);
    }
  }
  for (const a of profile.avoid || []) if (a && t.includes(norm(a))) return [];
  return [...out];
}
