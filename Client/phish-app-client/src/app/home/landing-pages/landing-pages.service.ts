import { Injectable } from "@angular/core";
import { RestService } from "../../core/services/rest.service";
import { Observable, catchError, throwError } from "rxjs";
import { LandingPage } from "./landing-pages.models";

@Injectable({
  providedIn: 'root'
})
export class LandingPagesService {
  constructor(private rest: RestService) {}


  public saveLandingPage(landingPage: LandingPage): Observable<LandingPage> {
    return this.rest.post<LandingPage>('/api/landingPages/update', landingPage).pipe(
      catchError(error => {
        console.error('Błąd zapisu strony docelowej:', error);
        return throwError(() => error);
      })
    );
  }


  public deleteLandingPage(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/landingPages/${id}`).pipe(
      catchError(error => {
        console.error(`Błąd usuwania landing page o id=${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  public getLandingPage(id: number): Observable<LandingPage> {
    return this.rest.get<LandingPage>(`/api/landingPages/${id}`).pipe(
        catchError(error => {
            console.error(`Błąd pobrania strony docelowej o id=${id}:`, error);
            return throwError(() => error);
        })
    );
  }
}
