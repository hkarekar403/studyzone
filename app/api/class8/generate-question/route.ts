import { NextRequest, NextResponse } from 'next/server';
import generateClass8Question, { CLASS8_TOPICS } from '@/lib/generators/class8';
import { Difficulty } from '@/lib/generators/shared/types';

const VALID_CURRICULA = ['CBSE', 'ICSE', 'IGCSE']
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Random']

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { difficulty = 'Easy', topic, curriculum = 'CBSE' } = body;
  if (!VALID_CURRICULA.includes(curriculum))
    return NextResponse.json({ error: 'Invalid curriculum' }, { status: 400 })
  if (!VALID_DIFFICULTIES.includes(difficulty))
    return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })

  // Resolve "Random" difficulty
  const resolvedDifficulty: Difficulty = difficulty === 'Random'
    ? (['Easy', 'Medium', 'Hard'] as const)[Math.floor(Math.random() * 3)]
    : (difficulty as Difficulty);

  // Pick random topic if not specified
  let resolvedTopic = topic;
  if (!topic || topic === 'Random') {
    resolvedTopic = CLASS8_TOPICS[Math.floor(Math.random() * CLASS8_TOPICS.length)].id;
  } else {
    // Map label to id if a label was provided
    const topicMatch = CLASS8_TOPICS.find(t => t.label === topic);
    if (topicMatch) {
      resolvedTopic = topicMatch.id;
    }
  }

  const question = generateClass8Question(resolvedTopic, resolvedDifficulty, curriculum as any);
  return NextResponse.json({ ...question, curriculum, timerEnabled: false, hint: question.hint });
}
