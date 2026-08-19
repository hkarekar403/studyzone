import type { Metadata } from "next"
import { notFound } from "next/navigation"
import TopicLandingPage from "@/app/components/TopicLandingPage"
import { TOPIC_CONFIGS, getTopicBySlug } from "@/lib/topicConfigs"

// All 22 topic pages are pre-rendered at build time — no runtime work, and the
// full page including sample questions is in the HTML a crawler receives.
export const dynamicParams = false

export function generateStaticParams() {
  return TOPIC_CONFIGS.map((t) => ({ slug: t.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const topic = getTopicBySlug(params.slug)
  if (!topic) return {}

  const url = `https://studyzone.co.in/topics/${topic.slug}`
  const title = `Free Class 4 ${topic.title} Practice | ${topic.curriculums.join(", ")} | StudyZone`
  const description = `Interactive Class 4 ${topic.title.toLowerCase()} practice with instant feedback and printable worksheets. ${topic.description} Free, no login. ${topic.curriculums.join(" & ")} aligned.`

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
      title: `Free Class 4 ${topic.title} Practice`,
      description: topic.description,
    },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug)
  if (!topic) notFound()
  return <TopicLandingPage topic={topic} />
}
