export type QuizQuestionType = 'TRUE_FALSE' | 'ABCD';

export interface QuizOptionDto {
  key: string; // for ABCD (A-D)
  value: string;
}

export interface QuizQuestionDto {
  id?: number;
  text: string;
  type: QuizQuestionType;
  options?: QuizOptionDto[]; // for ABCD
  correctAnswer?: string | null; // e.g. 'A'|'B'|'C'|'D'
  correctAnswerValue?: boolean | null; // for TRUE_FALSE
}

export interface QuizDto {
  id: number;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  questions: QuizQuestionDto[];
}

export interface QuizPayload {
  id?: number;
  name: string;
  title?: string | null;
  description?: string | null;
  questions: QuizQuestionDto[];
}

export const createEmptyQuiz = (): QuizDto => ({
  id: 0,
  name: '',
  title: '',
  description: null,
  questions: []
});
