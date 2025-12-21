import { Injectable } from "@angular/core";
import { RestService } from "../../core/services/rest.service";
import { Observable, catchError, throwError } from "rxjs";
import { QuizDto, QuizPayload, QuizzSendingInfo, SendQuizzRequestInfo } from "./quizzes.models";

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
  public sendQuiz(info: QuizzSendingInfo): Observable<boolean> {
    const payload: SendQuizzRequestInfo = {
      id: info.id,
      quizzId: info.quizz.id,
      sendingProfileId: info.sendingProfile?.id ?? 0,
      templateId: info.template?.id ?? 0,
      recipientGroupIds: info.recipientGroups.map(g => g.id)
    };

    return this.rest.post<boolean>('/api/quizzes/send', payload);
  }

}


