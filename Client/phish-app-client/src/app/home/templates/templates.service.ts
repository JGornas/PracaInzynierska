import { catchError, Observable, throwError } from "rxjs";
import { RestService } from "../../core/services/rest.service";
import { Template } from "./templates.models";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  constructor(private rest: RestService) {}

    public saveTemplate(template: Template): Observable<Template> {
        return this.rest.post<Template>('/api/templates/update', template).pipe(
            catchError(error => {
                console.error('Błąd zapisu szablonu:', error);
                return throwError(() => error);
            })
        );
    }

    public getTemplate(id: number): Observable<Template> {
        return this.rest.get<Template>(`/api/templates/${id}`).pipe(
            catchError(error => {
                console.error(`Błąd pobrania szablonu o id=${id}:`, error);
                return throwError(() => error);
            })
        );
    }

    public deleteTemplate(id: number): Observable<void> {
        return this.rest.delete<void>(`/api/templates/${id}`).pipe(
            catchError(error => {
            console.error(`Błąd usuwania szablonu o id=${id}:`, error);
            return throwError(() => error);
            })
        );
    }


  
}