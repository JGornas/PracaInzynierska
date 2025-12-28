import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, of, Subject, timer } from 'rxjs';
import { catchError, exhaustMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { InteractionReportDto, ReportSelectOption, ReportsFilterPayload, ReportsFiltersDto } from '../reports/reports.models';
import { ReportsService } from '../reports/reports.service';

interface SummaryCounts {
  sent: number;
  opened: number;
  clicked: number;
  submitted: number;
}

interface RateSummary {
  openRate: number;
  clickRate: number;
  submissionRate: number;
}

interface DashboardKpiCard {
  label: string;
  value: string;
  delta: string;
  meta: string;
  tone: string;
  spark: number[];
}

interface ActivityItem {
  title: string;
  action: string;
  campaign: string;
  time: string;
  tone: string;
}

interface CampaignPerformance {
  name: string;
  status: string;
  sent: number;
  openRate: number;
  clickRate: number;
  submittedRate: number;
  tone: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage: string | null = null;

  lastUpdatedLabel = '--';
  heroScore = 0;
  heroPulse: number[] = Array.from({ length: 8 }, () => 12);

  kpiCards: DashboardKpiCard[] = [];
  activities: ActivityItem[] = [];
  campaigns: CampaignPerformance[] = [];

  private readonly refreshIntervalMs = 30000;
  private readonly destroy$ = new Subject<void>();
  private hasLoadedOnce = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    timer(0, this.refreshIntervalMs)
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(() => this.loadDashboard$())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboard$() {
    const payload = this.buildDashboardPayload();
    this.isLoading = !this.hasLoadedOnce;
    this.errorMessage = null;

    return forkJoin({
      filters: this.reportsService.loadFilters().pipe(
        catchError(() => {
          this.errorMessage = 'Nie udało się pobrać listy kampanii.';
          return of({ campaigns: [], groups: [] } as ReportsFiltersDto);
        })
      ),
      interactions: this.reportsService.loadInteractions(payload).pipe(
        catchError(() => {
          this.errorMessage = 'Nie udało się pobrać danych dashboardu.';
          return of([] as InteractionReportDto[]);
        })
      )
    }).pipe(
      tap(({ filters, interactions }) => {
        const summary = this.buildSummary(interactions);
        const rates = this.calculateRates(summary);

        this.heroScore = this.calculateResilienceScore(rates);
        this.heroPulse = this.buildHeroPulse(interactions);
        this.lastUpdatedLabel = this.resolveLastUpdated(interactions);

        this.campaigns = this.buildCampaigns(interactions, filters.campaigns ?? []);
        this.activities = this.buildActivities(interactions);
        this.kpiCards = this.buildKpis(summary, rates, filters, interactions);
        this.hasLoadedOnce = true;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  private buildDashboardPayload(): ReportsFilterPayload {
    return {};
  }

  private buildSummary(interactions: InteractionReportDto[]): SummaryCounts {
    return interactions.reduce(
      (acc, item) => {
        if (item.sentAt) {
          acc.sent += 1;
        }
        if (item.opened) {
          acc.opened += 1;
        }
        if (item.clicked) {
          acc.clicked += 1;
        }
        if (item.submitted) {
          acc.submitted += 1;
        }
        return acc;
      },
      { sent: 0, opened: 0, clicked: 0, submitted: 0 }
    );
  }

  private calculateRates(summary: SummaryCounts): RateSummary {
    const sent = summary.sent || 0;
    const openRate = sent > 0 ? (summary.opened / sent) * 100 : 0;
    const clickRate = sent > 0 ? (summary.clicked / sent) * 100 : 0;
    const submissionRate = sent > 0 ? (summary.submitted / sent) * 100 : 0;
    return { openRate, clickRate, submissionRate };
  }

  private calculateResilienceScore(rates: RateSummary): number {
    const risk = rates.clickRate * 0.6 + rates.submissionRate * 0.4;
    const score = Math.max(0, Math.min(100, Math.round(100 - risk)));
    return score;
  }

  private resolveLastUpdated(interactions: InteractionReportDto[]): string {
    const latest = interactions
      .map(item => this.getInteractionTimestamp(item))
      .filter((date): date is Date => !!date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return latest ? this.formatRelativeTime(latest) : 'Brak danych';
  }

  private buildHeroPulse(interactions: InteractionReportDto[]): number[] {
    const counts = this.buildDailyCounts(interactions, 8, 'clicked');
    return this.normalizeSeries(counts, 18, 58);
  }

  private buildKpis(
    summary: SummaryCounts,
    rates: RateSummary,
    filters: ReportsFiltersDto,
    interactions: InteractionReportDto[]
  ): DashboardKpiCard[] {
    const campaignsCount = filters.campaigns?.length ?? 0;
    const primaryCampaign = this.campaigns[0]?.name ?? 'Brak aktywnych kampanii';

    const sentSpark = this.normalizeSeries(this.buildDailyCounts(interactions, 6, 'sent'), 16, 46);
    const openedSpark = this.normalizeSeries(this.buildDailyCounts(interactions, 6, 'opened'), 16, 46);
    const clickedSpark = this.normalizeSeries(this.buildDailyCounts(interactions, 6, 'clicked'), 16, 46);
    const submittedSpark = this.normalizeSeries(this.buildDailyCounts(interactions, 6, 'submitted'), 16, 46);

    return [
      {
        label: 'Aktywne kampanie',
        value: this.formatNumber(campaignsCount),
        delta: `Największa: ${primaryCampaign}`,
        meta: '',
        tone: '#2563eb',
        spark: sentSpark
      },
      {
        label: 'Wysłane maile',
        value: this.formatNumber(summary.sent),
        delta: `Otwarcia: ${this.formatNumber(summary.opened)}`,
        meta: ``,
        tone: '#0f766e',
        spark: clickedSpark
      },
      {
        label: 'Otwarcia',
        value: this.formatNumber(summary.opened),
        delta: `${rates.openRate.toFixed(1)}%`,
        meta: ``,
        tone: '#f97316',
        spark: openedSpark
      },
      {
        label: 'Wypełnione formularze',
        value: this.formatNumber(summary.submitted),
        delta: `${rates.submissionRate.toFixed(1)}%`,
        meta: ``,
        tone: '#7c3aed',
        spark: submittedSpark
      }
    ];
  }

  private buildActivities(interactions: InteractionReportDto[]): ActivityItem[] {
    const sorted = interactions
      .map(item => ({
        item,
        timestamp: this.getInteractionTimestamp(item)
      }))
      .filter(entry => entry.timestamp)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, 4);

    return sorted.map(({ item, timestamp }) => {
      const action = this.resolveAction(item);
      return {
        title: item.recipientName?.trim() || item.recipientEmail,
        action: action.label,
        campaign: item.campaignName,
        time: timestamp ? this.formatRelativeTime(timestamp) : '--',
        tone: action.tone
      };
    });
  }

  private buildCampaigns(
    interactions: InteractionReportDto[],
    campaigns: ReportSelectOption[]
  ): CampaignPerformance[] {
    const stats = new Map<number, SummaryCounts & { name: string }>();
    interactions.forEach(item => {
      const key = item.campaignId;
      const current = stats.get(key) ?? {
        name: item.campaignName,
        sent: 0,
        opened: 0,
        clicked: 0,
        submitted: 0
      };

      if (item.sentAt) {
        current.sent += 1;
      }
      if (item.opened) {
        current.opened += 1;
      }
      if (item.clicked) {
        current.clicked += 1;
      }
      if (item.submitted) {
        current.submitted += 1;
      }

      stats.set(key, current);
    });

    const merged = campaigns.map(campaign => {
      const current = stats.get(campaign.id) ?? {
        name: campaign.name,
        sent: 0,
        opened: 0,
        clicked: 0,
        submitted: 0
      };
      const rates = this.calculateRates(current);
      return {
        name: current.name,
        status: current.sent > 0 ? 'Aktywna' : 'W przygotowaniu',
        sent: current.sent,
        openRate: this.roundRate(rates.openRate),
        clickRate: this.roundRate(rates.clickRate),
        submittedRate: this.roundRate(rates.submissionRate),
        tone: this.pickCampaignTone(current.sent)
      };
    });

    return merged
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 3);
  }

  private buildDailyCounts(
    interactions: InteractionReportDto[],
    days: number,
    type: 'sent' | 'opened' | 'clicked' | 'submitted'
  ): number[] {
    const today = this.startOfDay(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));

    const counts = Array.from({ length: days }, () => 0);
    interactions.forEach(item => {
      const timestamp = this.getEventTimestamp(item, type);
      if (!timestamp) {
        return;
      }
      const dayIndex = Math.floor((this.startOfDay(timestamp).getTime() - start.getTime()) / 86400000);
      if (dayIndex >= 0 && dayIndex < days) {
        counts[dayIndex] += 1;
      }
    });

    return counts;
  }

  private normalizeSeries(counts: number[], minHeight: number, maxHeight: number): number[] {
    const max = Math.max(...counts, 0);
    if (max <= 0) {
      return counts.map(() => minHeight);
    }
    return counts.map(count => Math.round(minHeight + ((maxHeight - minHeight) * count) / max));
  }

  private getInteractionTimestamp(item: InteractionReportDto): Date | null {
    return (
      this.parseDate(item.submittedAt) ||
      this.parseDate(item.clickedAt) ||
      this.parseDate(item.openedAt) ||
      this.parseDate(item.sentAt)
    );
  }

  private getEventTimestamp(
    item: InteractionReportDto,
    type: 'sent' | 'opened' | 'clicked' | 'submitted'
  ): Date | null {
    switch (type) {
      case 'sent':
        return this.parseDate(item.sentAt);
      case 'opened':
        return this.parseDate(item.openedAt);
      case 'clicked':
        return this.parseDate(item.clickedAt);
      case 'submitted':
        return this.parseDate(item.submittedAt);
      default:
        return null;
    }
  }

  private resolveAction(item: InteractionReportDto): { label: string; tone: string } {
    if (item.submitted) {
      return { label: 'Wypełniono formularz', tone: '#7c3aed' };
    }
    if (item.clicked) {
      return { label: 'Kliknięto w link phishingowy', tone: '#0f766e' };
    }
    if (item.opened) {
      return { label: 'Otworzył wiadomość', tone: '#2563eb' };
    }
    return { label: 'Wysłano wiadomość', tone: '#64748b' };
  }

  private pickCampaignTone(sent: number): string {
    if (sent >= 400) {
      return '#2563eb';
    }
    if (sent >= 200) {
      return '#0f766e';
    }
    return '#f97316';
  }

  private roundRate(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('pl-PL');
  }

  private formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 60) {
      return `${diffMinutes} min temu`;
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} godz. temu`;
    }
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} dni temu`;
    }
    return this.formatDate(date);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}



