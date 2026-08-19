import type { Metadata } from "next"
import { notFound } from "next/navigation"
import TopicLandingPage from "@/app/components/TopicLandingPage"
import { CLASSES, getClassBySlug, getTopicIn } from "@/lib/topicConfigs"

// Every (class, topic) page is pre-rendered at build time — no runtime work,
// and the full page including sample questions is in the HTML a crawler gets.
export const dynamicParams = false

export function generateStaticParams() {
  return CLASSES.flatMap((c) =>
    c.topics.map((t) => ({ classLevel: c.slug, slug: t.slug }))
  )
}

type Params = { params: { classLevel: string; slug: string } }

export function generateMetadata({ params }: Params): Metadata {
  const cls = getClassBySlug(params.classLevel)
  const topic = getTopicIn(params.classLevel, params.slug)
  if (!cls || !topic) return {}

  const url = `https://studyzone.co.in/${cls.slug}/topics/${topic.slug}`
  const title = `Free ${cls.label} ${topic.title} Practice | ${topic.curriculums.join(", ")} | StudyZone`
  const description = `Interactive ${cls.label} ${topic.title.toLowerCase()} practice with instant feedback and printable worksheets. ${topic.description} Free, no login. ${topic.curriculums.join(" & ")} aligned.`

  return {
    title,
    description,
    keywords: topic.keywords.join(", "),
    category: "education",
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_IN",
      siteName: "StudyZone",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `Free ${cls.label} ${topic.title} Practice`,
      description: topic.description,
    },
  }
}

export default function Page({ params }: Params) {
  const cls = getClassBySlug(params.classLevel)
  const topic = getTopicIn(params.classLevel, params.slug)
  if (!cls || !topic) notFound()
  return <TopicLandingPage cls={cls} topic={topic} />
}
