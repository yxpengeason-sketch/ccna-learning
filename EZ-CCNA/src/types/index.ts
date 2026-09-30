export interface Question {
  m: number; // 0 to 5 (Module index)
  q: string; // Question text
  o: string[]; // Options array
  a: number | number[]; // Correct index or array of indices
  e: string; // Explanation
}

export interface RuntimeQuestion {
  raw: Question;
  m: number;
  q: string;
  e: string;
  o: string[];
  a: number | number[];
  isMulti: boolean;
  requiredCount: number;
}

export interface WrongBookRecord {
  q: string;
  correct: string;
  yourAns: string;
  m: number;
  e: string;
  resolved: boolean;
  count: number;
  last: string;
}

export type WrongBookStore = Record<string, WrongBookRecord>;

export type ExamStrategy = 'weighted' | 'uniform' | 'module' | 'weakness';
export type ExamStyle = 'simulation' | 'practice';

export interface ExamConfig {
  questionCount: number;
  strategy: ExamStrategy;
  selectedModule?: number;
  style: ExamStyle;
  timed: boolean;
  timeLimitMinutes: number; // e.g. 1.5 min per question or fixed
}

export interface ExamUserAnswer {
  questionIndex: number;
  selectedIndices: number[];
  isFlagged: boolean;
  isAnswered: boolean;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  score: number; // 0 to 1000
  isPass: boolean;
  timeSpentSeconds: number;
  moduleStats: Record<number, { total: number; correct: number }>;
  questions: RuntimeQuestion[];
  userAnswers: Record<number, number[]>;
  flaggedSet: number[];
  date: string;
}
