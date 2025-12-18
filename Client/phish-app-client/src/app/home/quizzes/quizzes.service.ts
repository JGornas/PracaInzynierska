import { Injectable } from "@angular/core";
import { RestService } from "../../core/services/rest.service";
import { Observable, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {
  constructor(private rest: RestService) {}


  public deleteQuizz(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/quizzes/${id}`).pipe(
      catchError(error => {
        console.error(`Błąd usuwania quizu o id=${id}:`, error);
        return throwError(() => error);
      })
    );
  }

}
