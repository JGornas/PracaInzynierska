import { Injectable } from '@angular/core';
import { RestService } from '../core/services/rest.service';
import { LoginModel, JwtPayload } from './auth.models';
import { Observable, catchError, map, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private rest: RestService) {}

  public login(data: LoginModel): Observable<boolean> {
    return this.rest.post<string>('/api/auth/login', data).pipe(
      map(token => {
        // Po otrzymaniu odpowiedzi przypisz token do localStorage
        localStorage.setItem('accessToken', token);

        // Zdekoduj JWT
        const decoded = jwtDecode<JwtPayload>(token);

        // Sprawdź mustSetPassword
        if (decoded.mustSetPassword?.toLowerCase() === 'true') {
          return false;
        }
        return true;
      }),
      catchError(error => {
        // Przechwytujemy błąd z rest.post i rzucamy dalej
        return throwError(() => error);
      })
    );
  }

  public logout(): Observable<void> {
    return this.rest.post<void>('/api/auth/logout', {}).pipe(
      map(() => {
        localStorage.removeItem('accessToken');
      })
    );
  }


  public setPassword(data: LoginModel): Observable<any> {
    return this.rest.post<any>('/api/auth/setPassword', data).pipe(
      map(response => {
        // Możesz przetworzyć odpowiedź jeśli potrzebujesz
        return response;
      }),
      catchError(error => {
        // Przechwytujemy błąd z rest.post i rzucamy dalej
        return throwError(() => error);
      })
    );
  }
}