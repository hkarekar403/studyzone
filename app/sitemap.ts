import { MetadataRoute } from 'next'
import { TOPIC_CONFIGS } from '@/lib/topicConfigs'

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
      url: `${BASE}/topics`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE}/teachers`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...TOPIC_CONFIGS.map((t) => ({
      url: `${BASE}/topics/${t.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
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
