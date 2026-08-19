import { MetadataRoute } from 'next'
import { CLASSES } from '@/lib/topicConfigs'

const BASE = 'https://studyzone.co.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: BASE,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Discovery surfaces — these are the pages search engines and LLM crawlers
    // can actually read content from, so they outrank the static info pages.
    {
      url: `${BASE}/teachers`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...CLASSES.map((c) => ({
      url: `${BASE}/${c.slug}/topics`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...CLASSES.flatMap((c) =>
      c.topics.map((t) => ({
        url: `${BASE}/${c.slug}/topics/${t.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    ),
    {
      url: `${BASE}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
