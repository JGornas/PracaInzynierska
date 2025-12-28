import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RestService } from '../../core/services/rest.service';
import { GridData, GridRequest } from '../../core/components/grid-component/grid-component.models';
import {
  InteractionReportDto,
  ReportGroupOption,
  ReportSelectOption,
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
    return this.rest.get<ReportsFiltersDto>(`${this.baseUrl}/filters`).pipe(
      catchError(() => this.loadFiltersFallback())
    );
  }

  loadInteractions(payload: ReportsFilterPayload): Observable<InteractionReportDto[]> {
    return this.rest.post<InteractionReportDto[]>(`${this.baseUrl}/interactions`, payload);
  }

  loadSummary(payload: ReportsFilterPayload): Observable<ReportsSummaryDto> {
    return this.rest.post<ReportsSummaryDto>(`${this.baseUrl}/summary`, payload);
  }

  private loadFiltersFallback(): Observable<ReportsFiltersDto> {
    const request: GridRequest = {
      sort: 'id',
      order: 'desc',
      pageInfo: {
        pageIndex: 0,
        pageSize: 1000,
        totalCount: 0
      },
      filter: '',
      selectedItemId: null,
      excludedItems: []
    };

    const campaigns$ = this.rest.post<GridData>('/api/campaigns/grid', request).pipe(
      map(grid => this.mapCampaigns(grid?.items ?? []))
    );

    const groups$ = this.rest.get<any[]>('/api/recipients/groups').pipe(
      map(groups => this.mapGroups(groups ?? [])),
      catchError(() => of([] as ReportGroupOption[]))
    );

    return forkJoin({ campaigns: campaigns$, groups: groups$ }).pipe(
      map(({ campaigns, groups }) => ({
        campaigns,
        groups
      }))
    );
  }

  private mapCampaigns(items: Array<Record<string, unknown>>): ReportSelectOption[] {
    return items
      .map(item => ({
        id: Number(item['id'] ?? item['Id']) || 0,
        name: String(item['name'] ?? item['Name'] ?? '').trim()
      }))
      .filter(item => item.id > 0 && item.name.length > 0);
  }

  private mapGroups(items: Array<Record<string, unknown>>): ReportGroupOption[] {
    return items
      .map(item => ({
        id: Number(item['id'] ?? item['Id']) || 0,
        name: String(item['name'] ?? item['Name'] ?? '').trim(),
        campaignId: null
      }))
      .filter(item => item.id > 0 && item.name.length > 0);
  }

  exportToPdf(filters: ReportsFilterPayload, exportData: ReportsExportPayload): Observable<Blob> {
    const headers = this.buildHeadersForExport();
    const urlHtml = `${this.baseUrl}/export/html`;
    const urlSimple = `${this.baseUrl}/export`;

    const requestHtml = this.http.post(urlHtml, exportData, {
      headers,
      withCredentials: true,
      responseType: 'blob'
    });

    const requestSimple = () => {
      return this.http.post(urlSimple, filters, {
        headers,
        withCredentials: true,
        responseType: 'blob'
      });
    };

    return requestHtml.pipe(
      catchError(error => {
        const httpErr = error as HttpErrorResponse;
        const status = httpErr?.status;
        if (status === 404 || status === 415) {
          return requestSimple();
        }
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
      return of('Raport nie jest dostępny. Upewnij się, że filtry zwracają wyniki.');
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
