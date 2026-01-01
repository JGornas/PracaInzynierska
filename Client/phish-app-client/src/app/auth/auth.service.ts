import { Injectable } from '@angular/core';
import { RestService } from '../core/services/rest.service';
import { LoginModel, JwtPayload, RegisterModel } from './auth.models';
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
        localStorage.setItem('accessToken', token);

        const decoded = jwtDecode<JwtPayload>(token);

        if (decoded.mustSetPassword?.toLowerCase() === 'true') {
          return false;
        }
        return true;
      }),
      catchError(error => {
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
        return response;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  public register(data: RegisterModel): Observable<string> {
    return this.rest.post<string>('/api/auth/register', data).pipe(
      map((password: string) => password),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}