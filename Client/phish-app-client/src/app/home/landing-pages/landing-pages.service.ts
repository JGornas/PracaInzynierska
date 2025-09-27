import { Injectable } from "@angular/core";
import { RestService } from "../../core/services/rest.service";
import { Observable, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LandingPagesService {
  constructor(private rest: RestService) {}

  public deleteLandingPage(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/landingPages/${id}`).pipe(
      catchError(error => {
        console.error(`Błąd usuwania landing page o id=${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
