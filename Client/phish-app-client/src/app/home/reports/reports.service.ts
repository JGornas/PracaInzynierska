import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { RestService } from '../../core/services/rest.service';
import {
  InteractionReportDto,
  ReportsExportPayload,
  ReportsFilterPayload,
  ReportsFiltersDto,
  ReportsSummaryDto
} from './reports.models';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly baseUrl = '/api/reports';

  constructor(private rest: RestService, private http: HttpClient) {}

  loadFilters(): Observable<ReportsFiltersDto> {
    return this.rest.get<ReportsFiltersDto>(`${this.baseUrl}/filters`);
  }

  loadInteractions(payload: ReportsFilterPayload): Observable<InteractionReportDto[]> {
    return this.rest.post<InteractionReportDto[]>(`${this.baseUrl}/interactions`, payload);
  }

  loadSummary(payload: ReportsFilterPayload): Observable<ReportsSummaryDto> {
    return this.rest.post<ReportsSummaryDto>(`${this.baseUrl}/summary`, payload);
  }

  exportToPdf(filters: ReportsFilterPayload, exportData: ReportsExportPayload): Observable<Blob> {
    const headers = this.buildHeadersForExport();
    const urlHtml = `${this.baseUrl}/export/html`;
    const urlSimple = `${this.baseUrl}/export`;

    console.log('%c[EXPORT PDF] Próba HTML (Puppeteer backend)', 'color: #007bff; font-weight: bold;');
    console.log('URL:', urlHtml);
    console.log('Headers:', headers);
    console.log('Payload:', exportData);

    const requestHtml = this.http.post(urlHtml, exportData, {
      headers,
      withCredentials: true,
      responseType: 'blob'
    }).pipe(
      tap((response: Blob) => {
        console.log('%c[EXPORT PDF] Odebrano Blob (HTML)', 'color: green; font-weight: bold;');
        console.log('Blob size:', response.size, 'bytes');
        console.log('Blob type:', response.type);
      })
    );

    const requestSimple = () => {
      console.log('%c[EXPORT PDF] Próba fallback /export z samymi filtrami', 'color: #f59e0b; font-weight: bold;');
      console.log('URL:', urlSimple);
      console.log('Payload:', filters);
      return this.http.post(urlSimple, filters, {
        headers,
        withCredentials: true,
        responseType: 'blob'
      }).pipe(
        tap((response: Blob) => {
          console.log('%c[EXPORT PDF] Odebrano Blob (fallback)', 'color: green; font-weight: bold;');
          console.log('Blob size:', response.size, 'bytes');
          console.log('Blob type:', response.type);
        })
      );
    };

    return requestHtml.pipe(
      catchError(error => {
        const httpErr = error as HttpErrorResponse;
        const status = httpErr?.status;
        console.warn('[EXPORT PDF] HTML endpoint nie zadziałał, status:', status);
        if (status === 404 || status === 415) {
          return requestSimple();
        }
        console.error('%c[EXPORT PDF] BŁĄD', 'color: red; font-weight: bold;');
        console.error('Status:', status);
        console.error('Status text:', httpErr?.statusText);
        console.error('URL:', httpErr?.url);
        console.error('Error object:', error);
        return this.resolveExportError(error);
      })
    );
  }


  private buildHeadersForExport(): HttpHeaders {
    const headers: Record<string, string> = {
      Accept: 'application/pdf',
      'Content-Type': 'application/json',
      'X-Report-Engine': 'puppeteer'
    };
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  private resolveExportError(error: unknown): Observable<never> {
    return this.buildExportErrorMessage(error).pipe(
      switchMap(message => throwError(() => new Error(message)))
    );
  }

  private buildExportErrorMessage(error: unknown): Observable<string> {
    const httpError = error as { status?: number; error?: any };
    const fallback = 'Nie udało się wyeksportować raportu.';

    if (httpError?.status === 0) {
      return of('Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.');
    }

    if (httpError?.status === 401) {
      return of('Sesja wygasła. Zaloguj się ponownie.');
    }

    if (httpError?.status === 403) {
      return of('Brak uprawnień do wygenerowania raportu.');
    }

    if (httpError?.status === 404) {
      return of('Raport nie jest dostępny. Upewnij się, że filtry zwracają wyniki lub skorzystaj z przykładowych danych.');
    }

    if (httpError?.error instanceof Blob) {
      return from(httpError.error.text()).pipe(
        map(text => this.parseErrorMessage(text) ?? fallback),
        catchError(() => of(fallback))
      );
    }

    const directMessage = this.extractPlainMessage(httpError?.error) ?? this.extractPlainMessage(error);
    return of(directMessage ?? fallback);
  }

  private extractPlainMessage(source: unknown): string | null {
    if (!source) {
      return null;
    }

    if (typeof source === 'string') {
      const trimmed = source.trim();
      return trimmed || null;
    }

    if (typeof source === 'object') {
      const obj = source as Record<string, unknown>;
      const candidate = obj['message'] ?? obj['error'] ?? obj['data'] ?? obj['detail'];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return null;
  }

  private parseErrorMessage(raw: string): string | null {
    const direct = this.extractPlainMessage(raw);
    if (direct) {
      return direct;
    }

    try {
      const parsed = JSON.parse(raw);
      return this.extractPlainMessage(parsed);
    } catch {
      return null;
    }
  }
}
