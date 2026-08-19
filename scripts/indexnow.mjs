#!/usr/bin/env node
/**
 * Submit every URL in the live sitemap to IndexNow.
 *
 * IndexNow pushes URLs to Bing (and Yandex, Seznam, Naver) instead of waiting
 * to be crawled. That matters here because ChatGPT's search is Bing-backed, so
 * this is the shortest path between publishing a page and an LLM being able to
 * cite it.
 *
 * The key is not a secret — it is deliberately published at
 * https://studyzone.co.in/<key>.txt, which is how IndexNow verifies that
 * whoever is submitting controls the domain.
 *
 * Usage:  npm run indexnow
 */

const HOST = 'studyzone.co.in'
const KEY = '3c7d9be30b7910264d3ce3b8a01a5a68'
const SITEMAP = `https://${HOST}/sitemap.xml`
const ENDPOINT = 'https://api.indexnow.org/indexnow'

async function main() {
  const res = await fetch(SITEMAP)
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status} ${res.statusText}`)

  const xml = await res.text()
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())

  if (urlList.length === 0) throw new Error('no <loc> entries found in sitemap')
  console.log(`Submitting ${urlList.length} URLs from ${SITEMAP}`)

  const submit = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  })

  // IndexNow answers 200 or 202 on success; 403 means the key file is not
  // reachable, which is the usual failure right after a domain change.
  if (submit.status === 200 || submit.status === 202) {
    console.log(`OK (${submit.status}) — ${urlList.length} URLs accepted`)
  } else {
    console.error(`FAILED (${submit.status}): ${await submit.text()}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exitCode = 1
})
