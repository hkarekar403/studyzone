# Class 4 Mathematics Practice — Maths Website for Fun

An interactive maths practice app for Class 4 students covering 19 topics across 3 difficulty levels. Questions are generated on the fly with instant feedback, a countdown timer, and a downloadable session report.

## Features

- **19 Topics**: Addition, Subtraction, Multiplication, Division, Fractions, Geometry, Algebra, Data Handling, and more
- **3 Difficulty Levels**: Easy, Medium, Hard
- **Random or topic-specific question generation**
- **60-second countdown timer** per question
- **3 attempts** per question before the answer is revealed
- **Audio feedback** — cheerful sound on correct, low tone on incorrect
- **PDF session report export** — full record of every question, attempt, and answer

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **jsPDF**

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to Vercel — no backend needed, everything runs as Next.js API routes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The three API routes are:

| Route | Method | Purpose |
|---|---|---|
| `/api/generate-question` | POST | Generate a question by difficulty and optional topic |
| `/api/check-answer` | POST | Check if the student's answer is correct |
| `/api/topics` | GET | Return the list of available topics |

---

Personal project by Harshad — built with OpenAI Codex.
