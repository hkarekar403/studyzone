import { MathQuestionGenerator } from './questionGenerator';

export const cbseGenerator = new MathQuestionGenerator('CBSE')
export const icseGenerator = new MathQuestionGenerator('ICSE')
export const igcseGenerator = new MathQuestionGenerator('IGCSE')

export function getGenerator(curriculum: string): MathQuestionGenerator {
  if (curriculum === 'ICSE') return icseGenerator
  if (curriculum === 'IGCSE') return igcseGenerator
  return cbseGenerator
}
