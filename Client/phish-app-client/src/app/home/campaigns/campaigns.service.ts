import { Injectable } from '@angular/core';
import { RestService } from '../../core/services/rest.service';
import { Campaign } from './campaigns.models';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CampaignsService {
  constructor(private rest: RestService) {}


  public getCampaign(id: number): Observable<Campaign> {
    return this.rest.get<any>(`/api/campaigns/${id}`).pipe(
      map(response => this.mapToCampaign(response)),
      catchError(err => {
        console.error(`Błąd pobierania kampanii id=${id}`, err);
        return throwError(() => err);
      })
    );
  }


  public updateCampaign(id: number, payload: Partial<Campaign>): Observable<Campaign> {
    return this.rest.post<any>(`/api/campaigns/${id}`, payload).pipe(
      map(response => this.mapToCampaign(response)),
      catchError(err => {
        console.error(`Błąd aktualizacji kampanii id=${id}`, err);
        return throwError(() => err);
      })
    );
  }

  public deleteCampaign(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/campaigns/${id}`).pipe(
      catchError(err => {
        console.error(`Błąd usuwania kampanii id=${id}`, err);
        return throwError(() => err);
      })
    );
  }

  private mapToCampaign(input: any): Campaign {
    const c = new Campaign();
    if (!input) {
      c.id = 0;
      c.name = '';
      return c;
    }
    c.id = Number(input.id) || 0;
    c.name = input.name ?? '';
    return c;
  }
}