First, I want you to approach this as more than a job-search spreadsheet or a bot that sends you random LinkedIn vacancies.

I want us to build you an AI-powered Global Job Intelligence & Application Tracker.

Think of it as your personal recruitment research team. It works in the background, searches the global job market, identifies opportunities, checks whether companies and vacancies are legitimate, evaluates how well each role matches your experience, and presents a curated shortlist for you to review.

You should be spending your time reviewing good opportunities and applying, not spending three hours every day searching through job boards.

And I agree with your decision to keep applications manual. The agent should prepare everything, but you remain in control of submitting applications.

There are a few things I want to get right before we build this, particularly the job discovery strategy, international eligibility, fraud detection, and how we prevent duplicate opportunities.

# 1. The application we're building

Working name: Global Career Intelligence Agent

Your job intelligence dashboard

Proposed design

# --

New jobs discovered

# --

Strong matches

# --

Applications submitted

# --

Interviews

Opportunity pipeline

New opportunities

Incoming

Shortlisted

Review

Application prepared

Ready

Applied / Interview / Rejected

Tracking

Illustrative dashboard structure, not live job-search data.

The application should have five major components:

1. Job Discovery: Searches multiple job sources and discovers opportunities beyond your usual LinkedIn searches.
2. AI Job Evaluator: Checks skills, seniority, experience, location, sponsorship and suitability.
3. Company & Vacancy Verification: Checks legitimacy, original job postings, company presence and suspicious recruitment practices.
4. Application Assistant: Generates a tailored CV recommendation, cover letter and application email.
5. Application Tracker & Learning Engine: Tracks your progress and learns from the jobs you accept or reject.

# 2. Your professional profile: what the agent should search for

I retrieved the career context from our previous conversations. The agent should not position you as just a Data Analyst or just an Automation Specialist.

Your career progression and experience support a broader positioning:

Data Analytics → Business Automation → Intelligent Automation → AI Solutions & Business Transformation.

Your current position as Intelligence & Analytics Lead at Global Performance Index (GPI), Century Group, should be reflected in your profile.

I would build your job-search profile around these role families:

[Workflow automation systems power next-gen multi-agent data flows - AI CERTs News](https://images.openai.com/static-rsc-4/A4Tdf7yxTjBXbNXxkdlERPEgQ9O99n2BIpIK-nhviDTZFgrs4pN0Ka9_6k-01XqtIo4fSv0MuewtcLZZCCp4WW1oaJVyyhRJYbtoD0LWJDPXIlxkmUQf7fJS6rAAgyOm6d0yQN6R02zK8CdLqD5OKsqOtS-i5E-0qX6BhKAXRUM?purpose=inline)

1\. Automation & Intelligent Systems

Automation Specialist, AI Automation Specialist, Intelligent Automation Analyst, Workflow Automation Consultant, Automation Architect, Business Process Automation Specialist.

[BI Dashboards Self-hosted Solution with Kyubit](https://images.openai.com/static-rsc-4/bYOwJSYkqBCOHu_eCwLdYbcAnLbP6ZW03YBD-0307eDxzjt6ahmBBiwUGVm1H9L6gFtWxfFYP6v-kS5L9EhFsmvQ8koQf5TMmS_ojkSN_-8PlDRwRr_eVaJtavdS1-8C8tLiEOW8zNGhfOQYrTpSpaz4Pny2aJqoAqXXie0V-kc?purpose=inline)

2\. Data & Business Intelligence

Data Analyst, BI Analyst, Business Intelligence Developer, Analytics Lead, Reporting Analyst, Data & Insights Specialist.

[Sales & Revenue Management - HES](https://images.openai.com/static-rsc-4/yM5DcJ9eB1stCGeOf-A6raqTy6_HNiKzxfqT3ShbxscrAoaioHQcoqPuJzDMHUuugfAlqQ2w-oR-JWnvTAYJ3DYoDPzIW-apSid255GcGqTpxSCKK0JeTymMU2KoKMKsyNQZA6iLGrG3O5ZHuU9Xfi_dDpB7Exu_Ih889FED1r0?purpose=inline)

3\. CRM & Revenue Operations

CRM Specialist, CRM Automation Specialist, Revenue Operations Analyst, Sales Operations Specialist, Marketing Automation Specialist, Customer Operations Analyst.

[AI agent and intelligent automation for business workflows, digital assistants, document management, data analysis, communication and productivity. Smart SaaS interface concept. Vector illustration.](https://images.openai.com/static-rsc-4/Ux_OwpASBnz8U7qeOY_ZfbwGgWzoxKQ1JjWW4jaselT7UivOscCgMSz-51TxVSsgpDoRmWFxOVLv7TYttuh06ZtZOtg32kWEfbmVtal2G05mDbnRepYJcmNxs6WQzi6WplYmE5-Bm1FjzTYsuzrGjZx6_gloV9JfUOY2kAJvvIVQSEI4Cq7Md899WX1DNQ3J?purpose=inline)

4\. AI & Agentic Solutions

AI Solutions Specialist, AI Operations Specialist, AI Agent Developer, AI Workflow Engineer, LLM Automation Specialist, AI Implementation Consultant.

[オペレーション管理 | Smartsheet](https://images.openai.com/static-rsc-4/H4U6aW2kAvSM0OgPQtzkbAHIsstPpGBzr3Qc8r8TXez-REeF8t67D4AyurLMSNalJCrbXY-G2AqgnBX-9GWhx7B3IPeH9P8osX0LxccY8UJzQ8vukST4-l-tIEMmOrwmDOYQm7ZGAPJ6iHQZ-aNWld65kwc9U-A5OacPRoDx-1Q?purpose=inline)

5\. Product & Business Operations

Product Operations Specialist, Business Systems Analyst, Digital Transformation Analyst, Implementation Specialist, Technical Project Manager, Solutions Consultant.

[The Complete Guide to Zendesk for Startups and Small Businesses in 2025](https://images.openai.com/static-rsc-4/bjvy_yNwGeyTDEmFRRZb_JlZEaV7mqGpgO8lKbQl7LzfBT60fquF06uzcn8Rjc_yjgBD28iNlH6kIdsaGGSAx4pzoKiJDJrR6FkLu_p-Wj0uHceKA1Cctiq8qzzXStwYjIlxsEEfhZk2a1UfDTUW2rXTaj6bnVwcCLBy1ryxt5c?purpose=inline)

6\. Customer Experience & Operations

Customer Success Operations, Customer Experience Analyst, Technical Support Specialist, Customer Operations Specialist, Service Delivery Analyst.

I also want the system to search for adjacent roles that you might not have thought of, provided they are realistic matches.

Your skills database should include:

- Automation: Zapier, Make, n8n, Pabbly, GoHighLevel.
- CRM & business systems: Airtable, Softr, Formstack, GoHighLevel, CRM pipelines and integrations.
- Data: SQL, Python, Power BI, Tableau, Looker Studio, Streamlit, dashboards and reporting.
- Integrations: APIs, webhooks, data transformation, scraping and workflow orchestration.
- AI: OpenAI, Claude, LLM workflows, AI agents and intelligent automation.
- Business operations: Process optimization, project management, customer operations, workflow design and cross-functional stakeholder management.

The matching engine should distinguish between:

- Roles you can confidently perform today.
- Roles where you meet most requirements and can bridge the gaps.
- Stretch roles that could accelerate your career.
- Roles that are not worth your application time.

I don't want the AI rejecting an opportunity because it asks for one tool you haven't used. For example, a role asking for Workato when you have Make, Zapier and n8n experience should not automatically be excluded.

# 3. Global job discovery: where it should search

I would not make LinkedIn the primary dependency. We should build a multi-source discovery system.

## Recommended job sources

[LinkedIn color icon in PNG, SVG](https://images.openai.com/static-rsc-4/woM_4GmMaoNH7bnfhj_5hFqrTSImx5abRqGg80Ykmuc2YibriDWQUZlaXn0wdc8D49V-dbCkjVGx-KDzswNuXz3zrpTTGC6_yUXi4b01yPOdxvhDHen6V6U_1XQdkIb4OqUxE6-6NBpl29tUS8K6yZ2PMQzLmT53Hejcf6eijlk?purpose=inline)

LinkedIn Jobs

High priority

Global employers, recruiters, direct company postings, remote and relocation opportunities. Search through permitted public listings and links, not unauthorized scraping.

[Find jobs](https://www.linkedin.com/jobs/?utm_source=chatgpt.com)

[WWR Logo (We Work Remotely) in 2024](https://images.openai.com/static-rsc-4/sxhOVIq5aXHtOK9cM_yEQBMN0xNdQb4-6-wEJRdJ-dW-oiL0ovGCRzuTmrBWNRJuV2lPMNEiCvGwnse2d8YorxH7Fw0FAHqMgDcPWsttoudc0-fUcOZdh7MGSYNZQbz3zOShOS1i0urh2UAiW0sL56klz93s1iYHyI8JUvTTL1E?purpose=inline)

We Work Remotely

High priority

Public RSS feeds, including customer support, product, marketing and other roles.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://weworkremotely.com\&sz=32)

RSS Feed



[Find jobs](https://weworkremotely.com/?utm_source=chatgpt.com)

[AngelList Talent is now Wellfound | Wellfound](https://images.openai.com/static-rsc-4/McJnCikNlm-TwMkuwCQ_4ueHdGgQGY8OfMMxiWFq4EA9TbX1-8LEYEMrN_x8Gto_xjp-c_JHg2-iRRh9wRczj04wyrgmFmvvQE27YsVrD0TL3UOvrjRzwLGNEhq2v7j1GSXZBv0Bs8KtapZFmA0ZG2NCyQsSQpufllor1lupFcE?purpose=inline)

Wellfound

High priority

Excellent for startup roles, product operations, AI, data and business systems. Explicit global hiring and remote eligibility are particularly useful.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://wellfound.com\&sz=32)

Wellfound



[Find jobs](https://wellfound.com/jobs?utm_source=chatgpt.com)

[Search Jobs in Johannesburg, Cape Town, South Africa & Beyond | Adzuna](https://images.openai.com/static-rsc-4/CfopiUIrxE9H8S7jZQPGaiMG4bff0cHXaHIAfyf_cmUuZVhGNHn8S6PoZDEGSv4FqXd2bOxF65aVKGb821mmGhbtL_YsdyWSV8sy4d256xtKxaDqTLGEsXtlu9uVdI8mJoVO8FDEiNvWPhASuxhe0nkLPPp272gNyU3fPZgyEgc?purpose=inline)

Adzuna

High priority

API-driven job discovery across supported countries, with salary and location data.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.adzuna.com\&sz=32)

developer.adzuna.com+1



[Find jobs](https://www.adzuna.com/?utm_source=chatgpt.com)

[Top 20 Websites for Finding Remote Jobs | by RemoteTeamcom | Medium](https://images.openai.com/static-rsc-4/HOQETok-hXr5onuRJ9CWu0acMAiYskv6qeJeKqIl_WP_zlwsMR6TlgNQiudZsIlqtcgbpSmgKeCskVQMXkxySAHe8adN5BXozq7nyrmmdglspIEpIMi0D0escGNWs-B8QhkiUqj7zi8spO4ih9Rak6t2xrmx4Wl1X5c1IL0xHto?purpose=inline)

Working Nomads

High priority

Remote roles across operations, data, customer success, consulting, product and other fields. Country restrictions and seniority are visible.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.workingnomads.com\&sz=32)

Working Nomads+1



[Find jobs](https://www.workingnomads.com/jobs?utm_source=chatgpt.com)

[Remote Developer Jobs](https://images.openai.com/static-rsc-4/ijLsQF9Y7PdUv2ads3u03opMODr_ilVZeKGcraKDNhSTIfhXePjzqmWuCPxthQfdubQSuyACa3lmRfMX3-93pV8r_8Re5JwwxkYsgUlFREJ_0e_YBI8aK5nNDEsB_iRHvFHUlt6qBia_wlIcp-GTLbHln_uDUmB7cZHF2V1Tgnk?purpose=inline)

Remote OK

High priority

Free public JSON and RSS feeds for remote vacancies.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://remoteok.com\&sz=32)

Frequently Asked Questions



[Find jobs](https://remoteok.com/?utm_source=chatgpt.com)

[7 Best Nigerian Job Websites for Jobseekers in 2025 | Pulse Nigeria](https://images.openai.com/static-rsc-4/xsqyoW_jBWYKbuKxQ64aOA_Gs8cPF9vvMSaZ3laNFMw2i6vydBRaNkul9MFB5Rjz1RgNVBPt_L7kuUJcG4xaVCFydPuRtDTUnWcViuR5qbBy7COTYbD1CIaRphjwnVqr2Ed9sjUPKIvHD-OvEJeIpq7mgAasKSGEWMbtizsbiXQ?purpose=inline)

Jobberman

Important for Nigerian and African opportunities, including hybrid, onsite and remote jobs.

[Find jobs](https://www.jobberman.com/?utm_source=chatgpt.com)

[Saiba tudo sobre o Glassdoor](https://images.openai.com/static-rsc-4/ovY3dsZiseGnA6YwnvMweG4qCOoaQcwZrn_ak6LzX8_NHhDQutru4c4WK3mXb8CbUYvYfNSKu7diCHBqj8rKshFa_tOqg_7wFV3_lm__6nETu5qpQm-uD-AYWUoShAcYU5yqZFKIGE6jQsmedgdzlsvneT5ZN13uL2n34MJhppA?purpose=inline)

Glassdoor

Useful for discovering openings and, more importantly, checking company reviews, salary information and workplace reputation.

[Find jobs](https://www.glassdoor.com/Job/index.htm?utm_source=chatgpt.com)

[Bank Teller job in Nationwide - Workforce Group - Nigeria - WorkforceOutsource](https://images.openai.com/static-rsc-4/K-uVgLxuIgkhzPTFzI0r-gm5s0crzysTjlC2FBIHWB0JzogSlJyg0XB-YVFeBiXdI7FfPXGSYFYGOzBF7gwLNyrj7BS2lcrscGBc7YS4JAmRiw8fIW2j5FcZj4zI42Dxu_USY-2lVDL9hHn8xBLNb_rMwJTZlmLOFUiB0h0DNaI?purpose=inline)

Workafro

Especially relevant

Specifically tracks remote jobs open to African residents, with country-specific eligibility. This is exactly the kind of source that can save you time.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://workafro.com\&sz=32)

workafro



[Find jobs](https://workafro.com/?utm_source=chatgpt.com)

I would also add:

- Remotive — [Website](https://remotive.com/?utm_source=chatgpt.com).
- Remote.co — [Website](https://remote.co/remote-jobs/?utm_source=chatgpt.com).
- FlexJobs — [Website](https://www.flexjobs.com/?utm_source=chatgpt.com).
- Indeed — [Website](https://www.indeed.com/?utm_source=chatgpt.com).
- Otta / Welcome to the Jungle — [Website](https://www.welcometothejungle.com/?utm_source=chatgpt.com).
- Y Combinator Work at a Startup — [Website](https://www.workatastartup.com/?utm_source=chatgpt.com).

An important discovery: Workafro already tracks remote jobs across African countries and links to employer application pages. It should be one of our primary sources, not an afterthought.

## 4. The international eligibility engine

This is one of the most important features.

A job marked Remote does not necessarily mean someone living in Nigeria can do it.

The agent must distinguish these categories:

| Classification       | Meaning                                       |
| -------------------- | --------------------------------------------- |
| Worldwide            | Explicitly accepts applicants globally        |
| Africa eligible      | Nigeria or other African countries included   |
| Nigeria eligible     | Explicitly accepts Nigerian residents         |
| EMEA                 | Eligible depending on country restrictions    |
| Regional remote      | Restricted to a specified group of countries  |
| Relocation supported | Employer offers relocation or visa assistance |
| Sponsorship possible | Employer indicates visa sponsorship           |
| Unclear              | Requires further investigation                |
| Ineligible           | Explicitly excludes your location             |

I want the agent to prioritize:

1. Worldwide remote positions.
2. Remote jobs explicitly accepting Nigerians.
3. Remote positions open to Africa or EMEA.
4. International companies offering relocation and visa sponsorship.
5. Hybrid and onsite roles where relocation is supported.
6. International contract opportunities.

It should not automatically discard an excellent position just because you currently live in Nigeria.

However, it must never label a position as worldwide simply because the job description says remote.

# 5. How the agent should actually discover jobs

This is where I would avoid a common mistake people make when building AI job searchers.

Don't build one giant AI prompt that visits 15 websites, reads everything and returns results.

Build a multi-source collection and intelligence pipeline.

## Proposed job discovery architecture

GLOBAL JOB SOURCES

Job APIs · RSS feeds · Career pages · Permitted searches

COLLECTION ENGINE

Fetch · Parse · Extract · Normalize

DUPLICATE DETECTION

Canonical URL · Job ID · Company · Title · Similarity

AI INTELLIGENCE ENGINE

Skills matching

Experience matching

Eligibility checks

Fraud verification

Salary analysis

Application priority

YOUR CAREER DASHBOARD

Curated vacancies · Evidence · Apply links · Documents · Tracking

### A critical technical decision: source connectors

I would use different collection methods depending on the source.

| Source                  | Collection method                                              |
| ----------------------- | -------------------------------------------------------------- |
| Adzuna                  | Official API                                                   |
| We Work Remotely        | RSS                                                            |
| Remote OK               | JSON/RSS                                                       |
| Remotive                | API with attribution and usage restrictions                    |
| Greenhouse career pages | Public Job Board API                                           |
| Lever career pages      | Public postings API                                            |
| Workafro                | Permitted feed/page integration                                |
| LinkedIn                | Search links and permitted discovery, no unauthorized scraping |
| Jobberman               | Permitted search/browser discovery                             |
| Glassdoor               | Permitted search/browser discovery                             |
| Company career websites | Official APIs, RSS or permitted page extraction                |

Greenhouse and Lever are particularly interesting. Their public job-posting interfaces can expose job descriptions directly, without having to scrape the main job boards.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.greenhouse.io\&sz=32)

Greenhouse+1



One caution: Remotive requires attribution and direct links to its original job listing, and its public API data is delayed by 24 hours.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://remotive.com\&sz=32)

Remotive+1



Also, I would not build this around LinkedIn scraping extensions. LinkedIn explicitly prohibits unauthorized automated scraping. We can still use LinkedIn as a discovery destination and direct application source without making the whole application dependent on it.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

LinkedIn+1



# 6. The technology stack I recommend

Since you're building this with Claude, I want a proper application architecture, not a collection of disconnected prompts.

## Recommended build stack

[Next.js Logo Vector - Free Download](https://images.openai.com/static-rsc-4/a667tSbjNodvVwFZ85RoO22tN4iSYbCgLPJCHoiCNfx39y1gkO2XTBbQRC8owkqsQN_WIl0L1MCBLIcnALJtOuki5U5A_8rHK9UaY6RoRm2KMtWlypi5xrCC7Hb3HmjR1vHBUq-1bbnNBDMt9jgQkkMJsbnbfmMlkCLclzMOgNY?purpose=inline)

Next.js + TypeScript

The application interface, dashboard, job cards, filters and tracking pages.

Core

[Supabase - Review, Pricing & Alternatives | Delv](https://images.openai.com/static-rsc-4/Y5ZDSxXptYusc6H-LwOOaZr1NWv-6ygntImLJOKjpPj8gi7OO-ulh46sVJe68pAacXXvq-aTuWbHCQovewzGDpgVcsJzw4P2NDGIRmNGQr8cG17fL3q3QkbhUsuBD8Wjm_ApkkhY2VZF0beqJvbGpHfIjw9gN_44Snv9ComAw_I?purpose=inline)

Supabase

PostgreSQL database, authentication, file storage, user preferences and job records.

Core

[n8n Logo PNG Vector, Icon Free Download](https://images.openai.com/static-rsc-4/fqOHROrKsVKD8YwX-rXVur3hN9QkBS3sbgDv48CRce0WwqNUjG2Nzg9hSH53XoX3r3zHDQOyn32d6qD3PD_A75EuYDkjc-f1PU2waw0MlhtUXw5UGH64dqq8PRFIssKlCuCXNhUvUyYKX8O_gFs1agHJX2ShfNg_xUF-HNiEmhE?purpose=inline)

n8n

Scheduled discovery, API connections, RSS collection, job processing and notifications.

Core

[Claude](https://images.openai.com/static-rsc-4/cLHBfiXuOV35_PSb5wC1jXivsAXbOR_8j6QIuMUVJNmHhvqDTZSAjip3DZXEZE8rrigO3zrBPXPTm3OPFqtXG1oYbfxtfR2epfKwRiaR-r0auw26KWwnnPiRgtOfu6qqeScD6KjrINNkb8STcXPBIHcixXdk1xpiKuwC8UdBT_8?purpose=inline)

Claude API

Job-description analysis, semantic matching, eligibility reasoning and tailored application documents.

AI engine

[Oakstone & Github | Executive Search for GTM SaaS](https://images.openai.com/static-rsc-4/HQnzkeZepdcbz6yki5F911xaI7qZFrq-EjoAnoh5focKQlZBBR_xVRxmdszYIh8CF9ZImt1zDUWQIDbeJm9vx6gJmTSUYpEpChiHmY_gLt1gXp9uq4lq-oxfEEM9g7FJhQpCYi7WHrUwBF9vcV_4-kwArSHYrPmmA6I2uBI6wFE?purpose=inline)

GitHub

Source code, version control, build history and deployment integration.

[How to Use Vercel - Getting Started Guide (2026) | Delv](https://images.openai.com/static-rsc-4/II9DBEprjDf0_Y2RIUGxgZ4bjOULzr-2p-vKNBRgqy7HlRqGOMqEpPcOwUNksEJ5cF_VNDkA9VOZEQMGM7tEd68wU6Qq1Ie8oBMWk56TuhpHeXCmYhRbaAIW1gPry2H2caHr25d3R9XsGDeBbGjL3gVZdw_ZqTY_kipySshbK7A?purpose=inline)

Vercel

Application hosting and deployment.

### Why this combination?

You already have experience with n8n and workflow automation. I would use that knowledge rather than introduce an entirely unfamiliar orchestration platform.

The division of responsibilities is important:

- Claude is the intelligence.
- n8n is the workflow orchestrator.
- Supabase is the memory and database.
- Next.js is the user-facing application.
- APIs and feeds are the information sources.

### Claude connectors and AI development tools

There are some particularly useful tools worth integrating into your development environment.

[Supabase Changelog & Updates](https://images.openai.com/static-rsc-4/gzHk68nunUgTpB5V9uzzrROkzhKN3xN84acNX7uPYML5ySJ7gKZPbWZu80pTH3KHAQ_rVBxLtqt6BU80uFqrGMJKLF8EerVo0FDE10bT7aUNPYAq63XaVUBFRE7QsK5xGKtMunxV9sXZl8i_twsx17GEO3VScOgxN8CUIZn2lGQ?purpose=inline)

Supabase MCP / Claude Code integration

Allows Claude to work with your database, inspect schemas, run queries and manage project resources. Supabase also provides an official Claude Code plugin and MCP integration.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://supabase.com\&sz=32)

Supabase Docs



[Supabase AI tools documentation](https://supabase.com/docs/guides/ai-tools?utm_source=chatgpt.com)

[MCP Icons, Logos, Symbols - Free Download PNG and SVG](https://images.openai.com/static-rsc-4/MJ3ZSnDJBvyGunpjHJyFvnbpIwRet3cgBQpouWa6A7rvbJunawAi6xy8gVTkFsP9A1blR8NQlmP4xXBJt0tnRVDUVpY3t5tIx1SPUTZGCE0EyCGR0AuNSvj9RsAhaJGMIHquQYBAzA1nzwVN7WUEru981ykioC_KvzXLUX8uJJA?purpose=inline)

Model Context Protocol (MCP)

Connects Claude to external tools and services. It is useful for giving your development agent access to GitHub, Supabase and other supported systems.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://platform.claude.com\&sz=32)

Claude Platform Docs+1



[MCP documentation](https://modelcontextprotocol.io/?utm_source=chatgpt.com)

[Érico Renato — Cursos de Automação, IA e Vibe Coding](https://images.openai.com/static-rsc-4/iePnkf8XJQok8ZGABTeMVarFuOeylLkl44iEQletV6FFCTaFAmovEvIVd-_ogkNgSVWt272ipjUaBuqIjkKqxftC2K6SLN8LzoTsy223XRiBAUYE5RCzq1OYSyQOBXKL-Pq-1qwZcitch2_40rb35y_wGa2iPQcRl5QW4Rwa5Xc?purpose=inline)

n8n AI Agent + Human Review

This is useful for separating automated research from actions requiring your approval. n8n supports human approval gates for AI tool calls.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub+1



[n8n documentation](https://docs.n8n.io/?utm_source=chatgpt.com)

One distinction: MCP helps Claude interact with development tools. It does not automatically give your finished application access to every job board. Those integrations still need to be implemented in the application backend.

Also, your Claude Pro subscription is not automatically API credit. If we use Claude API to run the finished application's AI features, API usage will generally be billed separately. We should design the AI provider layer so we can change models without rebuilding the application.

# 7. The intelligence features that will make this better than ordinary job aggregators

These are the features I consider non-negotiable.

### A. Intelligent matching and scoring

Every job should receive a transparent match score.

I suggest this initial scoring model:

| Evaluation                       | Weight |
| -------------------------------- | ------ |
| Skills and tools match           | 25%    |
| Relevant experience              | 20%    |
| Role and responsibility match    | 20%    |
| Location and work eligibility    | 20%    |
| Seniority and career progression | 10%    |
| Salary alignment                 | 5%     |
| Total                            | 100%   |

Initial configurable weights. Explicit ineligibility and closed vacancies are hard exclusions, not matters that a high score can override.

The dashboard could classify vacancies as:

Excellent match

85–100%

Strong match

70–84%

Potential match

55–69%

Stretch opportunity

Below 55%, with specific transferable skills

Don't let the score make the decision alone. Every match should explain:

- Why you qualify.
- Which of your skills match.
- Which experience requirements you satisfy.
- What requirements you don't satisfy.
- What gaps are trainable.
- Whether the company accepts your location.
- Why the AI recommends applying or not applying.

### B. Company legitimacy and job verification

This needs its own verification engine.

A job can appear on a popular job board and still be fraudulent.

The system should check:

| Verification            | What it checks                                               |
| ----------------------- | ------------------------------------------------------------ |
| Company existence       | Official website and business presence                       |
| Domain authenticity     | Does the job link belong to the company or a legitimate ATS? |
| Original vacancy        | Is the same role published on the company's career page?     |
| Recruitment activity    | Is the role still open?                                      |
| Company reputation      | Independent reviews and public information                   |
| Recruitment red flags   | Payment requests, suspicious emails, fake recruiters         |
| Application destination | Does the application link lead to a credible destination?    |

I would use three separate verification statuses:

-

  Verified

  &#x20;Company and vacancy independently corroborated.


-

  Needs review

  &#x20;Some information is missing or cannot be confirmed.


-

  High risk

  &#x20;Significant inconsistencies or scam indicators.



A legitimate company does not automatically make every vacancy legitimate. The system must verify both.

It should also never describe a company as fraudulent based solely on a missing website or limited online footprint.

### C. Duplicate prevention

This is extremely important.

Imagine a company posts the same job on LinkedIn, Indeed, Glassdoor and its careers page.

You should see one job, not four.

The system should use:

1. Original job URL and canonical URL.
2. Employer and job ID.
3. Normalized job title.
4. Location and employment type.
5. Description fingerprints.
6. Similarity matching for slightly altered descriptions.

Where multiple sources contain the same job, keep all source references under one record and prioritize the original employer application link.

### D. Application preparation

When you open a job, you should have an application workspace.

[Job Application Dashboard | Track Interviews & Offers | Interactive Job Search Tracker | Hired OS | Digital Download - Etsy](https://images.openai.com/static-rsc-4/UQmAwdxN5SScB2eskuI0Ne9NYifRunVj3_DlBW_r-14IlOEiyF-ycXqy4JZAsZOn-IzHBlgdtTJEONH0MLX4y9C41uGABK-FY5dUEbQHMbf_eD-iJMa9CkgswgXcdEAHkvlctZfx9kojWY6lOn2jCi8Dv3pI3I9GFMrOfow7p6I?purpose=inline)

[etsy.com](https://www.etsy.com/listing/4500444202/job-application-dashboard-track?utm_source=chatgpt.com)

It should generate:

- A tailored cover letter.
- A customized email if the company requests direct email applications.
- Recommended CV adjustments.
- Relevant experience and achievements to emphasize.
- A list of required application documents.
- Answers to application questions, where sufficient information is available.
- A preparation checklist.

Important: The system should never invent experience, qualifications, metrics or projects to make an application look stronger.

Your original CV remains the master version. Each tailored version is saved separately.

### E. Feedback and learning

This is where I want to make the system genuinely intelligent.

When you reject a job, it should ask for a reason through a simple feedback action:

- Not my skill set.
- Too senior.
- Too junior.
- Salary too low.
- Location restriction.
- No relocation support.
- Company not credible.
- Not interested in this industry.
- Already applied.
- Other.

If you like a job, it should record that too.

The agent then updates its preference profile.

For example, if you repeatedly reject jobs that are primarily customer service but accept jobs combining customer operations with automation, it should gradually prioritize the latter.

I would implement this as an editable preference and feedback database, not blindly retrain a model every time you click dislike.

# 8. What the actual job record should contain

Every opportunity needs a proper data structure. This is important because the application will eventually contain hundreds or thousands of vacancies.

| Field                | Purpose                                |
| -------------------- | -------------------------------------- |
| Job title            | Exact advertised title                 |
| Company              | Employer name                          |
| Company website      | Official domain                        |
| Job description      | Full description                       |
| Responsibilities     | Extracted responsibilities             |
| Requirements         | Essential and desirable qualifications |
| Skills               | Required and preferred skills          |
| Location             | City, country or worldwide             |
| Remote policy        | Remote, hybrid, onsite                 |
| Country eligibility  | Countries explicitly accepted          |
| Relocation           | Availability and evidence              |
| Visa sponsorship     | Available, unavailable, unknown        |
| Employment type      | Full-time, contract, part-time         |
| Seniority            | Entry, mid, senior, lead               |
| Salary               | Range, currency and payment period     |
| Date posted          | Original publication date              |
| Date discovered      | When your agent found it               |
| Last verified        | Last time the vacancy was checked      |
| Application deadline | If available                           |
| Source               | Original job board                     |
| Apply URL            | Direct application page                |
| Match score          | AI evaluation                          |
| Verification         | Company and job verification           |
| Application status   | Your progress                          |
| AI explanation       | Why it matches or doesn't              |

Also include a distinction between the date the job was originally published and the date your system first discovered it. Otherwise, a job reposted today might be incorrectly presented as a newly created vacancy.

# 9. Dashboard pages I want us to build

I would give the application these main navigation sections:

## Career Intelligence

Product blueprint

Proposed application navigation

Overview

Daily insights and pipeline summary

Discover Jobs

Curated global opportunities

Shortlisted

Jobs you want to pursue

Application Studio

CVs, letters and emails

Application Tracker

Applied, interviews and outcomes

AI Preferences

Teach the agent what you want

Company Intelligence

Employer verification and research

Settings

Profile, sources and search rules

### The individual job card

Each opportunity should be presented with enough information to make a decision without opening five browser tabs.

Strong match · Example

New opportunity

AI Automation & Business Systems Specialist

Example employer · Remote · International

Full-time

Remote

Salary undisclosed

# 88%

Illustrative match score

## Pending

Location eligibility

Why this matches

- Workflow automation experience.
- CRM integrations and business systems.
- AI-powered process solutions.
- Data and reporting experience.

Things to investigate

- Confirm Nigeria eligibility.
- Salary not disclosed.
- Check required experience level.

Review applicationShortlist

Illustrative card. These are not live vacancies or working controls.

When implemented, the real card will have:

- View full job description
- Apply on company website
- Generate cover letter
- Prepare application email
- Shortlist
- Mark as applied
- Reject and give feedback

The application link must always point to the actual employer or legitimate application destination, not just the job board homepage.

# 10. Additional features I think you might have missed

These are features that will make the difference between an ordinary job aggregator and something you can actually use throughout your job search.

| Feature                | Why it matters                                           |
| ---------------------- | -------------------------------------------------------- |
| Saved searches         | Search different role families independently             |
| Search history         | See which searches generate the best opportunities       |
| Reposted job detection | Avoid old vacancies presented as new                     |
| Closing-date alerts    | Avoid missing application deadlines                      |
| Interview preparation  | Generate company research and likely interview questions |
| Salary intelligence    | Compare offers with market salary ranges                 |
| Company watchlist      | Monitor employers you particularly like                  |
| Follow-up reminders    | Know when to follow up after applying                    |
| CV version management  | Keep track of the CV used for each application           |
| Rejection analytics    | Understand where your applications are falling short     |
| Skills gap analysis    | Identify skills worth learning for better opportunities  |
| Career growth insights | Identify roles that could lead to your next career level |

I particularly like the idea of a Skills Gap Intelligence feature.

For example, if the agent analyses 100 relevant jobs and notices that a particular certification or platform appears repeatedly in positions matching your profile, it can recommend learning it.

It could even rank the most valuable skills to acquire based on how many suitable vacancies request them.

This means your job search becomes a career development system as well.

# 11. How I would build it with Claude

Don't ask Claude to build everything in one go. You already know how quickly that can become a mess.

I recommend six implementation phases.

1. Phase 1 — Foundation

   Build the responsive Next.js application, authentication, Supabase database, profile configuration and dashboard shell.

   Deliverable: A functioning private career workspace.
2. Phase 2 — Job Discovery Engine

   Connect APIs, RSS feeds, employer career pages and permitted web discovery. Implement normalization, duplicate prevention and scheduled searches.

   Deliverable: Jobs actually flowing into your database.
3. Phase 3 — AI Intelligence

   Implement profile matching, eligibility classification, company verification, fraud detection and match explanations.

   Deliverable: A genuinely curated job feed.
4. Phase 4 — Application Studio

   Add tailored cover letters, CV recommendations, direct application emails and document versioning.

   Deliverable: Application packages ready for your review.
5. Phase 5 — Application Tracking

   Add the application pipeline, feedback system, interview tracking, follow-up reminders and learning engine.

   Deliverable: A complete application management system.
6. Phase 6 — Intelligence & Optimization

   Add salary intelligence, skills gap analysis, company watchlists, source performance and advanced reporting.

   Deliverable: A continuously improving career intelligence platform.

## 12. Some important implementation rules

I would put these directly into the project instructions for Claude:

1. Never fabricate a vacancy, employer, salary, job description or application link.
2. Never mark a job as verified without evidence.
3. Never present a restricted remote job as worldwide.
4. Never generate duplicate opportunities.
5. Never automatically apply for a job.
6. Never send an application email without my approval.
7. Never invent professional achievements or qualifications.
8. Preserve the original job description and source.
9. Make every AI match score explainable.
10. Keep API credentials and personal documents secure.
11. Allow me to edit my professional profile and job-search preferences.
12. Ensure scheduled runs are idempotent, with retries, error logs and clear failure states.

I would also make the entire system provider-independent. If you later want to switch from Claude to OpenAI or another model, you should not have to rebuild the application.

# 13. Before we start building: a few things to establish

I have your professional positioning and a good amount of your career context from our previous conversations. However, my search of the saved files did not surface your actual latest CV and cover letter. I don't want to build the matching engine around an incomplete version of your experience.

Please upload those two documents again so we can use them as the authoritative source.

There are also three settings I want to establish.

## Global job-search preferences

1\. Salary expectations

What should the agent use when filtering vacancies?

Open to market rates; prioritize good opportunities.

Only show jobs above a minimum salary (we'll configure the amount later).

Show all salaries, including undisclosed salaries.

2\. Employment type

All types: full-time, contract, part-time and consulting.

Primarily full-time, but include exceptional contracts.

Full-time, part-time and contract only.

3\. Working hours

Flexible across time zones.

Prefer UK/Europe and overlapping African working hours.

Any English-speaking working environment, including US hours.

4\. International work authorization

This helps the agent distinguish remote eligibility from relocation and visa sponsorship.

I currently have Nigerian work authorization only.

I also have work authorization in another country.

Assess this opportunity by opportunity.

5\. Job discovery frequency

Daily, with a fresh shortlist.

Twice daily.

Weekly digest.

Save my search preferences

## My final recommendation

I would build this as a proper standalone application, with Claude Code/Work helping us develop it, rather than relying on Claude to conduct a fresh manual search every time.

The biggest strategic advantage will be the combination of:

- Global job discovery.
- Nigerian and African eligibility intelligence.
- AI-powered skills matching.
- Employer and vacancy verification.
- Duplicate-free job records.
- Tailored application documents.
- A feedback-driven recommendation engine.

And one more thing: I don't want us to build an application that only searches for jobs with the exact title Automation Specialist. Your experience cuts across data, automation, business systems, AI and operations. The agent needs to find opportunities hiding behind different job titles.

Our goal is not to find you the most jobs. It is to find you the most credible jobs you have a realistic chance of getting.

Once you upload your CV and cover letter and save those preferences, I can turn this blueprint into a complete Claude-ready Product Requirements Document, database schema, connector specification, AI agent instructions and phased implementation prompts.

While we're building the application, I can also send you a daily curated shortlist here so your job search doesn't have to wait.

🔎Daily global job shortlistTap to set up