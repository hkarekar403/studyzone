import type { Metadata } from "next"
import QuizShell from "../components/QuizShell"

export const metadata: Metadata = {
  title: "Practise Class 4 Maths | CBSE, ICSE & IGCSE | StudyZone",
  description:
    "Free interactive Class 4 maths practice across 22 topics and three difficulty levels, with instant feedback and step-by-step working. No login, no ads.",
  alternates: { canonical: "https://studyzone.co.in/practice" },
  // The landing page and the topic guides are the pages worth ranking; this one
  // is the app itself, and its content is generated per session.
  robots: { index: true, follow: true },
  openGraph: {
    title: "Practise Class 4 Maths | StudyZone",
    description:
      "22 topics, three difficulty levels, instant feedback. Free and no login required.",
    type: "website",
    locale: "en_IN",
    siteName: "StudyZone",
    url: "https://studyzone.co.in/practice",
  },
}

export default function PracticePage() {
  return <QuizShell />
}
