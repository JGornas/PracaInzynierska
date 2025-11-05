import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RestService } from '../../core/services/rest.service';
import {
  InteractionReportDto,
  ReportsFilterPayload,
  ReportsFiltersDto,
  ReportsSummaryDto
} from './reports.models';

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

  exportToPdf(payload: ReportsFilterPayload): Observable<Blob> {
    const headers = this.buildHeadersForExport();
    return this.http.post(`${this.baseUrl}/export`, payload, {
      headers,
      withCredentials: true,
      responseType: 'blob'
    }).pipe(
      catchError(error => this.resolveExportError(error))
    );
  }

  private buildHeadersForExport(): HttpHeaders {
    const headers: Record<string, string> = { Accept: 'application/pdf' };
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
    const fallback = 'Nie udalo sie wyeksportowac raportu.';

    if (httpError?.status === 0) {
      return of('Brak polaczenia z serwerem. Sprawdz siec i sprobuj ponownie.');
    }

    if (httpError?.status === 401) {
      return of('Sesja wygasla. Zaloguj sie ponownie.');
    }

    if (httpError?.status === 403) {
      return of('Brak uprawnien do wygenerowania raportu.');
    }

    if (httpError?.status === 404) {
      return of('Raport nie jest dostepny. Upewnij sie, ze filtry zwracaja wyniki lub skorzystaj z przykladowych danych.');
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
