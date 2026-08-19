# StudyZone

Free maths practice for primary school children, at **[studyzone.co.in](https://studyzone.co.in)**.

No accounts, no subscription, no ads, and nothing about a child is stored on any server. Built and maintained by one parent, and free for everyone.

[![Live site](https://img.shields.io/badge/live-studyzone.co.in-2563eb)](https://studyzone.co.in)
[![License: MIT](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

---

## What it does

StudyZone generates unlimited Class 4 maths questions across **22 topics** and three difficulty levels, aligned to **CBSE**, **ICSE** and **IGCSE Cambridge Primary Stage 4**. Questions are produced by rule-based generators rather than drawn from a fixed bank, so a child never runs out and never sees the same paper twice.

- **22 topics** — addition through to fractions, geometry, data handling and multi-step word problems
- **Three difficulty levels** with per-question working shown after each attempt
- **Printable worksheets** (5–20 questions) with a separate teacher answer key
- **Mock exam generator** with competency-weighted mark distribution
- **Reasoning questions** that ask a child to explain or correct an answer rather than compute one
- **Inline SVG diagrams** for tally charts, bar graphs, shapes, angles and number lines
- Works offline as an installable PWA; full dark mode; no login anywhere

## Why the code is public

The question generators are the interesting part, and they are reusable. If you are building anything that needs curriculum-aligned primary maths questions — a school tool, a tutoring app, a research project — [`lib/questionGenerator.ts`](lib/questionGenerator.ts) is a self-contained, dependency-free place to start.

The rest of the repository is a working example of a genuinely privacy-preserving children's web app: no analytics on the child, no session storage on a server, no consent banner needed because there is nothing to consent to.

## Privacy, in one paragraph

StudyZone is used by nine- and ten-year-olds, so the architecture starts from the assumption that no child data should exist. There is no database of students, no login, and no server-side record of what any child answered. Quiz state lives in React state in the browser and is gone when the tab closes. Site analytics are cookieless and aggregate-only. The one piece of persistent storage is a single integer — a visitor counter. The full policy is at [studyzone.co.in/privacy](https://studyzone.co.in/privacy).

## Tech

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · deployed on Vercel

Question generation runs server-side in API routes; PDF generation (`jspdf`) runs entirely in the browser, so worksheets cost nothing to produce and never round-trip a child's work.

## Running it locally

```bash
git clone https://github.com/hkarekar403/studyzone.git
cd studyzone
npm install
npm run dev
```

Open <http://localhost:3000>. No environment variables are required — the visitor counter and the feedback form both degrade gracefully when their services are not configured.

Optional, for full functionality:

| Variable | Purpose | Without it |
|---|---|---|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis, visitor counter | Counter shows 0 |
| `RESEND_API_KEY` | Feedback form email delivery | Form succeeds silently, sends nothing |

## Layout

```
app/
  page.tsx                   the quiz (client-side; session state lives here)
  [classLevel]/topics/       per-topic landing pages, statically generated
  teachers/                  worksheets and lesson plans for educators
  api/                       question generation, answer checking, worksheets
lib/
  questionGenerator.ts       the Class 4 generators
  topicConfigs.ts            topic + class registry, drives routes and sitemap
  schemaGenerator.ts         structured data for topic pages
  generators/                Class 8 generators (library only — see below)
```

## Status

Live and in **beta**. Class 4 is complete across all three curricula.

Class 8 generators exist in [`lib/generators/class8.ts`](lib/generators/class8.ts) and work, but are not wired to a page — they use a different, typed answer contract from the Class 4 generators, and unifying the two is prerequisite work for the Class 5–8 expansion.

## Contributing

Corrections to the maths are the most valuable contribution by a distance. If you find a question that is wrong, ambiguous, or badly worded for a nine-year-old, please open an issue with the exact question text — that is a bug, and it gets fixed first.

Teachers: if a topic's difficulty is pitched wrong for your board, please say so. That feedback is hard to get and hard to guess.

## Disclaimer

StudyZone is a practice tool, not an assessment platform. Questions are randomly generated and are not a substitute for formal evaluation. It is not affiliated with, endorsed by, or approved by CBSE, CISCE, Cambridge Assessment International Education, or any examination board — curriculum names describe question style only.

## License

MIT — see [LICENSE](LICENSE).
