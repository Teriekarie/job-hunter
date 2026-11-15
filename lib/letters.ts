// Template letters and emails, used when no AI key is set. Every sentence below is taken from profile/cv.md.
// When an AI key is added, lib/ai/prompts.ts writes these instead.
type J = { title: string; company: string; role_families?: string[] | null; required_subject?: string | null };

const LINKS = `- Portfolio: https://theresakaramor.lovable.app/#projects
- GitHub: https://github.com/Teriekarie
- LinkedIn: http://www.linkedin.com/in/theresa-karamor`;

const PARA: Record<string, string> = {
  'Automation': 'I have designed and deployed workflow ecosystems using Zapier, Make, GoHighLevel, Pabbly and n8n that automated 60% of manual tasks and improved project turnaround by 35%. At Descasio I designed and built 20+ end-to-end business processes from client briefs and led implementation and onboarding for 15+ customers, reducing average time-to-value by 35%.',
  'AI & Agents': 'I built and trained voice AI agents and chatbots that handled over 70% of inbound client interactions, boosting response speed by 50% and cutting support costs by 40%. I have also integrated OpenAI and Anthropic models for intelligent data routing, reducing manual data entry by 75%.',
  'CRM & RevOps': 'I developed end-to-end CRM automations integrating lead capture, onboarding and lifecycle workflows, achieving zero lead leakage across sales and marketing funnels, and engineered centralized data pipelines synchronizing CRMs, Airtable and analytics tools.',
  'Data & BI': 'I built an automated analytics platform that replaced manual weekly reports with a self-updating dashboard, and at GPI I developed dashboards and KPI reporting structures that strengthened operational visibility and supported data-informed management decisions.',
  'Product & Business Ops': 'I re-engineered client business processes, eliminating 40–60% of manual steps, and worked with QA and Engineering teams to validate workflows, contributing to a 25% reduction in post-deployment issues. At GPI I worked with departments across Century Group to identify process bottlenecks and prioritise opportunities for automation and reporting.',
  'Customer Ops': 'I led client implementation and onboarding for 15+ customers, reducing average time-to-value by 35%, and acted as the voice of the customer, translating feedback, bugs and feature requests into product improvements.',
};

function paras(job: J): string[] {
  const fams = (job.role_families?.length ? job.role_families : ['Automation']).slice(0, 2);
  const out = fams.map((f) => PARA[f]).filter(Boolean);
  return out.length ? out : [PARA['Automation']];
}

const dot = (s: string) => s.replace(/\.+$/, '');

export function templateLetter(job: J): string {
  return `Dear Hiring Manager,

I am applying for the ${job.title} role at ${dot(job.company)}. [Add one line about what this company does and why the role interests you.]

I am a data, automation and business systems professional with over five years of experience turning operational problems into practical, measurable solutions. At Global Performance Index (GPI), the technology subsidiary of Century Group, I led analytics, automation and digital-solution work across departments: building dashboards and KPI reporting, automating IT help-desk logging, compliance reminders and facility-management processes, rebuilding the company intranet, and training staff through the GPI Learn programme.

${paras(job).join('\n\n')}

Before that, I built and deployed AI-driven workflows with Zapier, Make, n8n and GoHighLevel that automated 60% of manual tasks and improved project turnaround by 35%, and designed dashboards in Python, Streamlit and Tableau that cut reporting time by 50%. I map a process before I automate it, document every workflow, and work closely with product, QA and engineering teams so that what I build is adopted and maintained.

I work remotely from Lagos, Nigeria (UTC+1) and am comfortable overlapping with your team's hours. I would welcome a conversation about how I can support ${dot(job.company)}.

Kind regards,
Theresa Karamor`;
}

export function templateEmail(job: J): { subject: string; body: string } {
  return {
    subject: job.required_subject || `Application: ${job.title} — Theresa Karamor`,
    body: `Hello ${job.company} team,

I would like to apply for the ${job.title} role at ${dot(job.company)}.

${paras(job)[0]}

Attached are my CV and a cover letter. Work samples:
${LINKS}

Notice period: [add your notice period]
Location: Lagos, Nigeria (UTC+1).

Thank you for your time. I would be glad to walk you through my work on a call.

Best regards,
Theresa Karamor
+234 816 512 1663`,
  };
}

export function templateFollowUp(job: J, appliedOn: string): { subject: string; body: string } {
  return {
    subject: `Following up: ${job.title} application — Theresa Karamor`,
    body: `Hello ${job.company} team,

I applied for the ${job.title} role on ${appliedOn} and wanted to check whether there is any update. I remain very interested in the role and would be glad to share more about my work or answer any questions.

Thank you for your time.

Best regards,
Theresa Karamor
+234 816 512 1663`,
  };
}
