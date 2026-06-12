export type Curriculum = 'CBSE' | 'ICSE' | 'IGCSE';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ClassLevel = 4 | 8 | 9 | 10;

export type AnswerSpec =
  | { kind: 'integer';  value: number }
  | { kind: 'decimal';  value: number; tolerance: number }
  | { kind: 'fraction'; numerator: number; denominator: number }  // always lowest terms
  | { kind: 'mcq';      options: string[]; correctIndex: number }
  | { kind: 'multi_value'; values: number[] };          // e.g. two roots

export interface Question {
  id: string;
  class: ClassLevel;
  topic: string;
  curriculum: Curriculum;
  difficulty: Difficulty;
  text: string;          // KaTeX-ready string, use $ ... $ for inline math
  hint?: string;
  answerSpec: AnswerSpec;
  displayAnswer: string; // human-readable correct answer for reveal
  explanation?: string;
}

export interface TopicDef {
  id: string;
  label: string;
  class: ClassLevel;
  generate: (difficulty: Difficulty, curriculum: Curriculum) => Question;
}
