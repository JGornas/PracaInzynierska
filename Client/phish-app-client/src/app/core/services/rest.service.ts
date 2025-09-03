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

  public post<T>(url: string, body: any): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, { headers: this.createHeaders(), withCredentials: true })
      .pipe(
        map(response => response.data),
        catchError(err => this.handleError<T>(err, () => this.post(url, body)))
      );
  }

  private handleError<T>(error: any, retryFn: () => Observable<T>): Observable<T> {
    const backendMessage = error?.error?.data || 'Wystąpił nieznany błąd.';

    if (error.status === 401) {
      // Dla 401 zostawiamy obecną logikę z refresh token
      return this.refreshAccessToken().pipe(
        switchMap(() => retryFn()),
        catchError(() => {
          return throwError(() => new Error(backendMessage));
        })
      );
    } else {
      // Dla wszystkich innych błędów po prostu rzucamy dalej z backendMessage
      return throwError(() => new Error(backendMessage));
    }
  }


  private refreshAccessToken(): Observable<any> {
  return this.http.post('/api/auth/refresh', {}, { withCredentials: true }).pipe(
    catchError(error => {
      // Obsługa błędów HTTP (400, 500, etc.)
      console.error('Błąd HTTP podczas refresh token:', error);
      
      // Poprawny odczyt wiadomości - sprawdź różne formaty
      let errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
      
      if (error?.error?.data) {
        errorMessage = error.error.data; // Twój format: { data: "message" }
      } else if (error?.error?.message) {
        errorMessage = error.error.message; // Alternatywny format: { message: "message" }
      } else if (error?.message) {
        errorMessage = error.message; // Bezpośrednio w error
      }
      
      console.log('Extracted error message:', errorMessage);
      
      // Pokaż Swal z komunikatem i NATYCHMIASTOWYM przekierowaniem
      Swal.fire({
        icon: 'error',
        title: 'Sesja wygasła',
        text: errorMessage,
        confirmButtonText: 'Zaloguj się',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((result) => {
        // Przekieruj niezależnie od kliknięcia - po 3 sekundach automatycznie
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
        
        if (result.isConfirmed) {
          // Natychmiastowe przekierowanie jeśli kliknięto
          this.router.navigate(['/auth/login']);
        }
      });
      
      return EMPTY; // Kończymy stream
    }),
    switchMap((response: any) => {
      if (response?.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        return of(response); // Używamy of zamiast new Observable
      } else {
        console.error('Brak accessToken w odpowiedzi refresh token:', response);
        
        Swal.fire({
          icon: 'error',
          title: 'Błąd autoryzacji',
          text: 'Nie udało się odświeżyć sesji. Zaloguj się ponownie.',
          confirmButtonText: 'Zaloguj się',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then((result) => {
          this.router.navigate(['/auth/login']);
        });
        
        return EMPTY; // Kończymy stream
      }
    })
  );
}
}
