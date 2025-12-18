import { Injectable } from "@angular/core";
import { RestService } from "../../core/services/rest.service";
import { Observable, catchError, throwError } from "rxjs";
import { QuizDto, QuizPayload } from "./quizzes.models";

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {
  constructor(private rest: RestService) {}

  public getQuiz(id: number): Observable<QuizDto> {
    return this.rest.get<QuizDto>(`/api/quizzes/${id}`);
  }

  public createQuiz(payload: QuizPayload): Observable<QuizDto> {
    return this.rest.post<QuizDto>('/api/quizzes', payload);
  }

  public updateQuiz(id: number, payload: QuizPayload): Observable<QuizDto> {
    return this.rest.put<QuizDto>(`/api/quizzes/${id}`, payload);
  }

  public saveQuiz(payload: QuizPayload): Observable<QuizDto> {
    return payload.id ? this.updateQuiz(payload.id, payload) : this.createQuiz(payload);
  }

  public deleteQuizz(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/quizzes/${id}`).pipe(
      catchError(error => {
        console.error(`Blad usuwania quizu o id=${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}


