import type { Eligibility, RawJob } from '../types';
import { norm } from './text';

// Can someone living in Nigeria apply? Evidence order: the board's location field, then the job text.
// "Remote" alone never means Worldwide.

const WORLDWIDE = /\b(worldwide|world wide|anywhere|global|globally|international|any country|all countries|work from anywhere)\b/;
const AFRICA = /\b(africa|african|sub saharan|ssa|mea)\b/;
const EMEA = /\bemea\b|europe middle east (and )?africa/;
const TZ_OK = /\b(cet|cest|gmt|utc|wat|bst|european time|uk time)\b/;
const REGION_WORDS = /\b(usa|us|u s|united states|america|americas|north america|canada|mexico|latam|latin america|south america|brazil|europe|european|eu|eea|uk|united kingdom|england|ireland|germany|france|spain|portugal|italy|netherlands|poland|romania|bulgaria|sweden|norway|denmark|finland|switzerland|austria|belgium|greece|ukraine|turkey|israel|uae|emirates|saudi|india|pakistan|philippines|indonesia|vietnam|thailand|malaysia|singapore|japan|korea|china|taiwan|hong kong|asia|apac|oceania|australia|new zealand|argentina|colombia|chile|peru|dach|nordics|baltics|cee|mena|middle east|caribbean)\b/;
const OTHER_AFRICA_ONLY = /\b(south africa|kenya|egypt|ghana|morocco|tunisia|rwanda|uganda|tanzania|ethiopia|senegal)\b/;

// Phrases in the job text that lock the job to a place she is not in.
const TEXT_LOCKS: [RegExp, string][] = [
  [/\b(us|u\.s\.|usa|united states)[- ](only|based|residents?|citizens?)\b/i, 'the job text says US only'],
  [/\b(must|need to|required to|should)\s+(be\s+)?(reside|live|be located|be based|located|based|resident)[^.\n]{0,40}\b(united states|u\.s\.|usa|\bus\b|canada|uk|united kingdom|europe|eu|latam|latin america|germany|india|philippines|australia)/i, 'the job text requires living in a specific country or region'],
  [/\b(authorized|authorised|eligible|legally (able|permitted)|right) to work in (the )?(united states|u\.s\.|usa|us|uk|united kingdom|canada|eu|european union|germany|australia)\b/i, 'the job text requires existing work rights in another country'],
  [/\b(not|unable to|cannot|can't|do not|don't)\s+(able to\s+)?(offer|provide|sponsor)[^.\n]{0,30}(visa|sponsorship)/i, 'the job text says no visa sponsorship'],
  [/\bonly (open to|considering|accepting) (candidates|applicants) (in|from|based in) (?!africa|nigeria|emea|anywhere)/i, 'the job text limits applicants to a region'],
];
const BASED_IN = /\b(?:fully |100% )?remote (?:position|role|job|opportunity)[^.\n]{0,20}\bbased in (?!africa|nigeria|emea)([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)?)/;
const TEXT_WORLDWIDE = /\b(work from anywhere|anywhere in the world|hire (globally|worldwide|anywhere)|open to (candidates|applicants) (worldwide|globally|anywhere)|fully remote[, ]+worldwide|location:? ?(worldwide|anywhere|global))\b/i;
const RELOCATION = /\b(visa sponsorship (is )?(available|provided|offered|possible)|we (offer|provide|sponsor)[^.\n]{0,30}(visa|relocation)|relocation (support|package|assistance|bonus|allowance)|sponsor(s|ing)? (your )?(work )?visas?)\b/i;

export function eligibility(job: RawJob, text: string): Eligibility {
  const loc = norm(job.locationText);
  const based = text.match(BASED_IN);
  const lock: [RegExp, string] | undefined = TEXT_LOCKS.find(([re]) => re.test(text))
    ?? (based ? [BASED_IN, `the job text says the role is based in ${based[1]}`] : undefined);

  // On-site or hybrid abroad: only worth showing with relocation or visa help.
  if (!job.remote) {
    if (/\b(nigeria|lagos|abuja)\b/.test(loc)) return { label: 'Nigeria eligible', evidence: `Based in ${job.locationText}.` };
    if (RELOCATION.test(text) && !(lock && /sponsorship/.test(lock[1])))
      return { label: 'Relocation supported', evidence: `On-site in ${job.locationText || 'another country'}; the job text mentions visa or relocation support.` };
    return { label: 'Ineligible', evidence: `On-site in ${job.locationText || 'another country'} with no relocation or visa support mentioned.` };
  }

  // A structured country list (Himalayas).
  if (Array.isArray(job.locationList) && job.locationList.length) {
    const list = job.locationList.map((c) => norm(c));
    if (list.includes('nigeria')) return { label: 'Nigeria eligible', evidence: `The board's country list includes Nigeria (${list.length} countries).` };
    return { label: 'Ineligible', evidence: `Open to ${list.length === 1 ? job.locationList[0] : `${list.length} listed countries`} only; Nigeria is not on the list.` };
  }

  if (/\b(nigeria|lagos|abuja)\b/.test(loc)) return { label: 'Nigeria eligible', evidence: `The board lists the location as "${job.locationText}".` };

  if (loc && WORLDWIDE.test(loc) && !/\bonly\b/.test(loc.replace(/anywhere in the world/, ''))) {
    if (based) return { label: 'Ineligible', evidence: `The board says "${job.locationText}", but ${lock![1]}.` };
    if (lock) return { label: 'Unclear', evidence: `The board says "${job.locationText}", but ${lock[1]}. Check before applying.` };
    return { label: 'Worldwide', evidence: `The board lists the location as "${job.locationText}".` };
  }
  if (EMEA.test(loc)) return { label: 'EMEA', evidence: `The board lists the location as "${job.locationText}". Check that Nigeria is not excluded.` };
  if (AFRICA.test(loc) && !OTHER_AFRICA_ONLY.test(loc)) return { label: 'Africa eligible', evidence: `The board lists the location as "${job.locationText}".` };

  if (loc && (REGION_WORDS.test(loc) || OTHER_AFRICA_ONLY.test(loc)))
    return { label: 'Ineligible', evidence: `Limited to: ${job.locationText}.` };

  if (lock) return { label: 'Ineligible', evidence: `Remote, but ${lock[1]}.` };

  // No usable location field: read the text.
  if (/\bnigeria\b/i.test(text) && /\b(open to|based in|candidates (in|from)|hiring in)[^.\n]{0,60}nigeria/i.test(text))
    return { label: 'Nigeria eligible', evidence: 'The job text names Nigeria as an accepted location.' };
  if (TEXT_WORLDWIDE.test(text)) return { label: 'Worldwide', evidence: 'The job text says it is open to applicants anywhere.' };
  if (loc && TZ_OK.test(loc)) return { label: 'Unclear', evidence: `Only a timezone is given ("${job.locationText}"), which fits Lagos (UTC+1). No country rule is stated.` };
  // Only a city or office is named (e.g. "San Francisco", "Zürich", "New York HQ"): that means "be based there".
  if (loc && !/\b(remote|anywhere|global|worldwide|distributed|home based|home|flexible|multiple locations)\b/.test(loc))
    return { label: 'Ineligible', evidence: `Based in ${job.locationText}; the posting does not say people outside that area can apply.` };
  return { label: 'Unclear', evidence: loc ? `The location is given as "${job.locationText}", which does not say who can apply.` : 'The posting says remote but does not say which countries can apply.' };
}
