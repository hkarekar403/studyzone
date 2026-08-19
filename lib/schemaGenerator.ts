// JSON-LD generators for topic landing pages.
//
// The plan this implements specified an "EducationalResource" type — that type
// does not exist in schema.org and would fail validation. The type that both
// validates and earns a Google rich result for pages like these is `Quiz`
// carrying `hasPart` Question/Answer pairs (Google's "Practice problems"
// result), which is what is emitted here.

import type { TopicConfig } from "./topicConfigs"

const SITE_URL = "https://studyzone.co.in"

/**
 * Practice-problems schema for one topic page: a Quiz whose parts are the
 * visible sample questions, aligned to the curricula that actually offer the
 * topic. Returns a JSON string ready for a ld+json script tag.
 */
export function generateEducationalSchema(topic: TopicConfig): string {
  const url = `${SITE_URL}/topics/${topic.slug}`

  const schema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `Class 4 ${topic.title} Practice`,
    description: topic.description,
    url,
    educationalLevel: topic.educationalLevel,
    learningResourceType: "Practice problem set",
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    typicalAgeRange: "9-10",
    about: {
      "@type": "Thing",
      name: `Class 4 ${topic.title}`,
      description: topic.description,
    },
    educationalAlignment: topic.curriculums.map((c) => ({
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      educationalFramework: `${c} Class 4 Mathematics`,
      targetName: topic.title,
    })),
    teaches: topic.learningObjectives,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Children aged 9-10",
    },
    provider: {
      "@type": "Organization",
      name: "StudyZone",
      url: SITE_URL,
    },
    hasPart: topic.sampleQuestions.map((q) => ({
      "@type": "Question",
      eduQuestionType: "Flashcard",
      learningResourceType: "Practice problem",
      name: q.text,
      text: q.text,
      educationalLevel: topic.educationalLevel,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }

  return JSON.stringify(schema)
}

/** BreadcrumbList for Home > Topics > <Topic>. */
export function generateBreadcrumbSchema(topic: TopicConfig): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Topics", item: `${SITE_URL}/topics` },
      {
        "@type": "ListItem",
        position: 3,
        name: topic.title,
        item: `${SITE_URL}/topics/${topic.slug}`,
      },
    ],
  })
}

/** ItemList schema for the /topics index page. */
export function generateTopicListSchema(topics: TopicConfig[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Class 4 Maths Topics",
    description:
      "Every Class 4 maths topic available to practise free on StudyZone, across CBSE, ICSE and IGCSE.",
    numberOfItems: topics.length,
    itemListElement: topics.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Class 4 ${t.title} Practice`,
      url: `${SITE_URL}/topics/${t.slug}`,
    })),
  })
}

/** Deep link into the quiz with the topic and curriculum pre-selected. */
export function quizDeepLink(topic: TopicConfig, curriculum = "CBSE"): string {
  const params = new URLSearchParams({
    topic: topic.generatorKey,
    curriculum,
    utm_source: "topic_page",
    utm_medium: "organic",
    utm_campaign: topic.slug,
  })
  return `/?${params.toString()}#quiz-section`
}
