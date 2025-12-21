import { SendingProfile } from "../sending-profiles/sending-profiles.models";
import { Template } from "../templates/templates.models";

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


export class Quizz {
  id: number;
  name: string | null;
  title: string | null;
  description: string | null;

  constructor() {
    this.id = 0;
    this.name = null;
    this.title = null;
    this.description = null;
  }
}

export class QuizzSendingInfo {
  id: number = 0;
  quizz: Quizz;
  sendingProfile: SendingProfile | null = null;
  template: Template | null = null;
  recipientGroups: RecipientGroup[];

  constructor() {
    this.quizz = new Quizz();
    this.recipientGroups = [];
  }

  get recipientGroupIds(): number[] {
    return this.recipientGroups.map(g => g.id);
  }
}


export class RecipientGroup {
  id: number;
  name: string;
  campaign?: string | null;
  createdAt?: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.campaign = null;
    this.createdAt = undefined;
  }
}

export interface SendQuizzRequestInfo {
  id: number;
  quizzId: number;
  sendingProfileId: number;
  templateId: number;
  recipientGroupIds: number[];
}
