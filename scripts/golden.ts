/**
 * Golden snapshot tests for the question generators.
 *
 * Why this exists: questionGenerator.ts is ~3,700 lines with no tests, and the
 * roadmap calls for unifying it with a diverged Class 8 library and then adding
 * Classes 5-7. Restructuring that much generator code without a way to prove the
 * output is unchanged is guesswork, and the output is maths that children are
 * marked against.
 *
 * How it works: every (curriculum, topic, difficulty) combination is generated
 * from a fixed seed and recorded. A refactor that preserves behaviour reproduces
 * the file byte for byte; one that does not shows exactly which question moved.
 *
 *   npm run test:golden      compare against the committed snapshots
 *   npm run test:golden -- --update   re-record (review the diff before committing)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { withSeed } from '../lib/rng'
import { MathQuestionGenerator } from '../lib/questionGenerator'

const HERE = dirname(fileURLToPath(import.meta.url))
const SNAPSHOT_DIR = join(HERE, '..', 'tests', 'golden')

const CURRICULA = ['CBSE', 'ICSE', 'IGCSE'] as const
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
const SEED = 20260819
const PER_COMBINATION = 8

type Snapshot = Record<string, Record<string, unknown[]>>

function capture(curriculum: (typeof CURRICULA)[number]): Snapshot {
  const snapshot: Snapshot = {}

  // A fresh generator per topic keeps the dedup set from making one topic's
  // output depend on how many topics ran before it.
  const topics = new MathQuestionGenerator(curriculum).getTopics()

  for (const topic of topics) {
    snapshot[topic] = {}
    for (const difficulty of DIFFICULTIES) {
      const generator = new MathQuestionGenerator(curriculum)
      snapshot[topic][difficulty] = withSeed(SEED, () =>
        Array.from({ length: PER_COMBINATION }, () => {
          const q = generator.generate(difficulty, topic)
          return {
            question: q.question,
            answer: q.answer,
            working: q.working,
            topic: q.topic,
            ...(q.selfAssess ? { selfAssess: true } : {}),
            ...(q.options ? { options: q.options } : {}),
          }
        })
      )
    }
  }
  return snapshot
}

function main() {
  const update = process.argv.includes('--update')
  mkdirSync(SNAPSHOT_DIR, { recursive: true })

  let failures = 0
  let compared = 0

  for (const curriculum of CURRICULA) {
    const file = join(SNAPSHOT_DIR, `${curriculum}.json`)
    const actual = JSON.stringify(capture(curriculum), null, 2) + '\n'

    if (update || !existsSync(file)) {
      writeFileSync(file, actual)
      console.log(`  recorded  ${curriculum}.json`)
      continue
    }

    const expected = readFileSync(file, 'utf8')
    compared++
    if (actual === expected) {
      const topics = Object.keys(JSON.parse(expected)).length
      console.log(`  ok        ${curriculum}  (${topics} topics x ${DIFFICULTIES.length} difficulties x ${PER_COMBINATION})`)
    } else {
      failures++
      console.error(`  CHANGED   ${curriculum}`)
      const a = JSON.parse(actual) as Snapshot
      const e = JSON.parse(expected) as Snapshot
      for (const topic of new Set([...Object.keys(e), ...Object.keys(a)])) {
        for (const d of DIFFICULTIES) {
          const before = JSON.stringify(e[topic]?.[d])
          const after = JSON.stringify(a[topic]?.[d])
          if (before !== after) console.error(`              ${topic} / ${d}`)
        }
      }
    }
  }

  if (failures > 0) {
    console.error(
      `\n${failures} curriculum snapshot(s) changed.\n` +
      `If the change is intended, run: npm run test:golden -- --update\n` +
      `and read the diff before committing it — it is the maths children see.`
    )
    process.exit(1)
  }
  if (compared > 0) console.log(`\nAll ${compared} snapshots match.`)
}

main()
