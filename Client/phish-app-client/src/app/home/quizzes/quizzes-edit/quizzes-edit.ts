import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { QuizDto, QuizPayload, QuizQuestionDto, QuizQuestionType, QuizOptionDto, createEmptyQuiz } from '../quizzes.models';
import { QuizzesService } from '../quizzes.service';
import { GridComponent } from '../../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../../core/components/grid-component/grid-component.models';

type QuestionWorking = {
  id?: number;
  text: string;
  type: QuizQuestionType;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string | null;
  correctAnswerValue?: boolean | null;
  clientKey?: string;
};

@Component({
  selector: 'app-quizzes-edit',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ReactiveFormsModule, GridComponent],
  templateUrl: './quizzes-edit.html',
  styleUrls: ['./quizzes-edit.scss']
})
export class QuizzesEdit implements OnInit {
  @ViewChild('questionsGridRef') questionsGrid?: GridComponent;

  isEditMode = false;
  quizId: number | null = null;
  quizForm: FormGroup;
  questionForm: FormGroup;
  loading = false;
  saving = false;
  questions: QuestionWorking[] = [];
  editingQuestionIndex: number | null = null;
  questionGridData: GridElement[] = [];
  questionColumns: GridColumn[] = [
    { field: 'text', label: 'Pytanie' },
    { field: 'typeLabel', label: 'Typ' },
    { field: 'correctLabel', label: 'Poprawna' }
  ];
  selectedQuestionKey: string | number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizzesService: QuizzesService,
    private fb: FormBuilder
  ) {
    this.quizForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

    this.questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ABCD' as QuizQuestionType, Validators.required],
      optionA: [''],
      optionB: [''],
      optionC: [''],
      optionD: [''],
      correctAnswer: ['A'],
      correctAnswerValue: [true]
    });
  }

  async ngOnInit(): Promise<void> {
    const idRaw = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idRaw;
    this.quizId = idRaw ? Number(idRaw) : null;
    if (this.isEditMode && this.quizId) {
      await this.loadQuiz(this.quizId);
    } else {
      this.applyQuiz(createEmptyQuiz());
    }
  }

  private async loadQuiz(id: number): Promise<void> {
    this.loading = true;
    try {
      const quiz = await firstValueFrom(this.quizzesService.getQuiz(id));
      this.applyQuiz(quiz);
    } catch (error) {
      alert('Nie udalo sie pobrac quizu');
      await this.router.navigate(['/home/quizzes']);
    } finally {
      this.loading = false;
    }
  }

  private applyQuiz(quiz: QuizDto): void {
    const resolvedName = quiz.name || quiz.title || '';
    this.quizForm.patchValue({
      name: resolvedName,
      description: quiz.description || ''
    });
    this.questions = (quiz.questions || []).map<QuestionWorking>(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      optionA: q.options?.find(o => o.key === 'A')?.value || '',
      optionB: q.options?.find(o => o.key === 'B')?.value || '',
      optionC: q.options?.find(o => o.key === 'C')?.value || '',
      optionD: q.options?.find(o => o.key === 'D')?.value || '',
      correctAnswer: q.correctAnswer ?? null,
      correctAnswerValue: q.correctAnswerValue ?? null
    }));
    this.refreshQuestionGrid();
  }

  onTypeChange(): void {
    const type = this.questionForm.get('type')?.value as QuizQuestionType;
    if (type === 'TRUE_FALSE') {
      this.questionForm.patchValue({
        correctAnswerValue: true,
        correctAnswer: null,
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: ''
      });
    } else {
      this.questionForm.patchValue({
        correctAnswer: 'A',
        correctAnswerValue: null
      });
    }
  }

  addOrUpdateQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const value = this.questionForm.value;
    const type = value['type'] as QuizQuestionType;
    const text = (value['text'] || '').trim();
    if (!text) return;

    const question: QuestionWorking = {
      text,
      type,
      optionA: value['optionA'] || '',
      optionB: value['optionB'] || '',
      optionC: value['optionC'] || '',
      optionD: value['optionD'] || '',
      correctAnswer: type === 'ABCD' ? value['correctAnswer'] : null,
      correctAnswerValue: type === 'TRUE_FALSE' ? !!value['correctAnswerValue'] : null
    };

    if (type === 'ABCD') {
      const optionsFilled = [question.optionA, question.optionB, question.optionC, question.optionD].every(o => (o || '').trim().length > 0);
      if (!optionsFilled) {
        alert('Uzupelnij wszystkie odpowiedzi ABCD');
        return;
      }
    }

    if (this.editingQuestionIndex !== null && this.editingQuestionIndex >= 0) {
      const existing = this.questions[this.editingQuestionIndex];
      this.questions[this.editingQuestionIndex] = { ...question, id: existing?.id, clientKey: existing?.clientKey };
    } else {
      this.questions.push({ ...question, clientKey: this.generateClientKey() });
    }
    this.refreshQuestionGrid();
    this.resetQuestionForm();
  }

  editQuestion(index: number): void {
    const q = this.questions[index];
    if (!q) return;
    this.editingQuestionIndex = index;
    this.selectedQuestionKey = q.id ?? q['clientKey'] ?? index;
    this.questionForm.patchValue({
      text: q.text,
      type: q.type,
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'A',
      correctAnswerValue: q.correctAnswerValue ?? true
    });
  }

  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
    if (this.editingQuestionIndex === index) {
      this.resetQuestionForm();
    }
    this.refreshQuestionGrid();
  }

  async save(): Promise<void> {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }
    const name = (this.quizForm.value['name'] || '').trim();
    const description = (this.quizForm.value['description'] || '').trim();
    if (this.questions.length === 0) {
      alert('Dodaj przynajmniej jedno pytanie.');
      return;
    }

    const payload: QuizPayload = {
      id: this.isEditMode ? this.quizId || undefined : undefined,
      name,
      title: name,
      description: description || null,
      questions: this.questions.map(q => this.toDto(q))
    };

    this.saving = true;
    try {
      await firstValueFrom(this.quizzesService.saveQuiz(payload));
      await this.router.navigate(['/home/quizzes']);
    } catch (error) {
      alert('Nie udalo sie zapisac quizu');
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/home/quizzes']);
  }

  private toDto(q: QuestionWorking): QuizQuestionDto {
    const options: QuizOptionDto[] | undefined = q.type === 'ABCD' ? [
      { key: 'A', value: q.optionA || '' },
      { key: 'B', value: q.optionB || '' },
      { key: 'C', value: q.optionC || '' },
      { key: 'D', value: q.optionD || '' }
    ] : undefined;

    return {
      id: q.id,
      text: q.text,
      type: q.type,
      options,
      correctAnswer: q.type === 'ABCD' ? (q.correctAnswer || null) : null,
      correctAnswerValue: q.type === 'TRUE_FALSE' ? !!q.correctAnswerValue : null
    };
  }

  public resetQuestionForm(): void {
    this.editingQuestionIndex = null;
    this.selectedQuestionKey = null;
    this.clearGridSelection();
    this.questionForm.reset({
      text: '',
      type: 'ABCD',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      correctAnswerValue: true
    });
  }

  private refreshQuestionGrid(): void {
    this.questionGridData = this.questions.map((q, index) => {
      const key = q.id ?? q['clientKey'] ?? index;
      return {
        id: key,
        text: q.text,
        typeLabel: q.type === 'TRUE_FALSE' ? 'Prawda/Falsz' : 'ABCD',
        correctLabel: q.type === 'TRUE_FALSE' ? (q.correctAnswerValue ? 'Prawda' : 'Falsz') : (q.correctAnswer || '-')
      } as GridElement;
    });
  }

  onQuestionSelection(elements: GridElement[]): void {
    const first = elements?.[0];
    if (!first) {
      this.resetQuestionForm();
      return;
    }
    const key = first['id'];
    this.selectedQuestionKey = key;
    const index = this.questions.findIndex(q => (q.id ?? q['clientKey']) === key);
    if (index >= 0) {
      this.editQuestion(index);
    }
  }

  startNewQuestion(): void {
    this.resetQuestionForm();
  }

  private clearGridSelection(): void {
    if (this.questionsGrid) {
      this.questionsGrid.selectedElements = [];
      this.questionsGrid.selectedGridElement = null;
    }
  }

  private generateClientKey(): string {
    return `tmp-${Math.random().toString(36).slice(2, 9)}`;
  }

  handleQuestionRemoved(row: GridElement): void {
    const key = row['id'];
    const index = this.questions.findIndex(q => (q.id ?? q.clientKey) === key);
    if (index >= 0) {
      this.removeQuestion(index);
    }
  }
}
