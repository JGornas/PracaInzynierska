import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RestService {
  constructor(private http: HttpClient, private router: Router) {}

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', 'Bearer ' + token);
    return headers;
  }

  public get<T>(url: string, params?: any): Observable<T> {
    return this.http
      .get<{ data: T }>(url, { headers: this.createHeaders(), params, withCredentials: true })
      .pipe(
        map(response => response.data),
        catchError(err => this.handleError<T>(err, () => this.get(url, params)))
      );
  }

  public post<T>(url: string, body: any, params?: any): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, { headers: this.createHeaders(), params, withCredentials: true })
      .pipe(
        map(response => response.data),
        catchError(err => this.handleError<T>(err, () => this.post(url, body, params)))
      );
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http
      .put<{ data: T }>(url, body, { headers: this.createHeaders(), withCredentials: true })
      .pipe(
        map(response => response.data),
        catchError(err => this.handleError<T>(err, () => this.put(url, body)))
      );
  }

  public delete<T>(url: string, params?: any): Observable<T> {
    return this.http
      .delete<{ data: T }>(url, { headers: this.createHeaders(), params, withCredentials: true })
      .pipe(
        map(response => response.data),
        catchError(err => this.handleError<T>(err, () => this.delete(url, params)))
      );
  }

  private handleError<T>(error: any, retryFn: () => Observable<T>): Observable<T> {
    const backendMessage = error?.error?.data || 'Wystąpił nieznany błąd.';

    if (error.status === 401) {
      // Dla 401 próbujemy odświeżyć token
      return this.refreshAccessToken().pipe(
        switchMap(() => {
          // Po odświeżeniu tokena, ponawiamy oryginalne zapytanie
          return retryFn().pipe(
            catchError((retryError) => {
              // Jeżeli ponowne zapytanie też zwróci 401 - sesja wygasła
              if (retryError.status === 401) {
                this.showSessionExpiredError(
                  retryError?.error?.data || 'Sesja wygasła. Zaloguj się ponownie.'
                );
                return EMPTY;
              }
              // Dla innych błędów przy ponownej próbie - rzucamy dalej
              return throwError(() => new Error(
                retryError?.error?.data || 'Wystąpił nieznany błąd.'
              ));
            })
          );
        }),
        catchError((refreshError) => {
          // Jeżeli refresh token się nie udał - również pokazujemy błąd
          this.showSessionExpiredError(
            refreshError.message || 'Sesja wygasła. Zaloguj się ponownie.'
          );
          return EMPTY;
        })
      );
    } else {
      // Dla wszystkich innych błędów po prostu rzucamy dalej z backendMessage
      return throwError(() => new Error(backendMessage));
    }
  }

  private refreshAccessToken(): Observable<any> {
    return this.http.post('/api/auth/refresh', {}, {
      withCredentials: true
    }).pipe(
      catchError(error => {

        let errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';

        if (error?.error?.data) {
          errorMessage = error.error.data;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        // TYLKO rzucamy error, bez pokazywania Swal
        return throwError(() => new Error(errorMessage));
      }),
      switchMap((response: any) => {
        if (response?.data) {
          localStorage.setItem('accessToken', response.data);
          return of(response.data);
        } else {
          // Rzucamy error zamiast pokazywać Swal
          return throwError(() => new Error('Brak accessToken w odpowiedzi'));
        }
      })
    );
  }

  private showSessionExpiredError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Sesja wygasła',
      text: message,
      confirmButtonText: 'Zaloguj się',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
