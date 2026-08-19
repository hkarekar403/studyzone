// JSON-LD generators for topic landing pages.
//
// The plan this implements specified an "EducationalResource" type — that type
// does not exist in schema.org and would fail validation. The type that both
// validates and earns a Google rich result for pages like these is `Quiz`
// carrying `hasPart` Question/Answer pairs (Google's "Practice problems"
// result), which is what is emitted here.

import type { TopicConfig, ClassDef } from "./topicConfigs"

const SITE_URL = "https://studyzone.co.in"

/**
 * Practice-problems schema for one topic page: a Quiz whose parts are the
 * visible sample questions, aligned to the curricula that actually offer the
 * topic. Returns a JSON string ready for a ld+json script tag.
 */
export function generateEducationalSchema(cls: ClassDef, topic: TopicConfig): string {
  const url = `${SITE_URL}/${cls.slug}/topics/${topic.slug}`

  const schema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${cls.label} ${topic.title} Practice`,
    description: topic.description,
    url,
    educationalLevel: `Grade ${cls.level}`,
    learningResourceType: "Practice problem set",
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    typicalAgeRange: cls.ageRange,
    about: {
      "@type": "Thing",
      name: `${cls.label} ${topic.title}`,
      description: topic.description,
    },
    educationalAlignment: topic.curriculums.map((c) => ({
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      educationalFramework: `${c} ${cls.label} Mathematics`,
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
      educationalLevel: `Grade ${cls.level}`,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }

  return JSON.stringify(schema)
}

/** BreadcrumbList for Home > Topics > <Topic>. */
export function generateBreadcrumbSchema(cls: ClassDef, topic: TopicConfig): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `${cls.label} Topics`,
        item: `${SITE_URL}/${cls.slug}/topics`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: topic.title,
        item: `${SITE_URL}/${cls.slug}/topics/${topic.slug}`,
      },
    ],
  })
}

/** ItemList schema for the /topics index page. */
export function generateTopicListSchema(cls: ClassDef): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cls.label} Maths Topics`,
    description:
      `Every ${cls.label} maths topic available to practise free on StudyZone, across ${cls.curriculums.join(", ")}.`,
    numberOfItems: cls.topics.length,
    itemListElement: cls.topics.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${cls.label} ${t.title} Practice`,
      url: `${SITE_URL}/${cls.slug}/topics/${t.slug}`,
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
  return `/practice?${params.toString()}`
}
