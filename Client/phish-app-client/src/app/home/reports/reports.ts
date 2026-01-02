﻿import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import {
  InteractionReportDto,
  ReportGroupOption,
  ReportSelectOption,
  ReportsExportBarDto,
  ReportsExportPayload,
  ReportsExportRowDto,
  ReportsFilterPayload,
  ReportsSummaryDto
} from './reports.models';
import { ReportsService } from './reports.service';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../core/components/button-component/button-component';

interface ReportGridRow extends GridElement {
  id: number;
  campaignName: string;
  groupName: string;
  recipient: string;
  sentAtLabel: string;
  openedAtLabel: string;
  clickedAtLabel: string;
  submittedLabel: string;
  statusLabel: string;
}

interface ChartBar {
  key: 'sent' | 'opened' | 'clicked' | 'submitted';
  label: string;
  value: number;
  color: string;
  rate: number | null;
}

interface PdfDocumentData {
  title: string;
  generatedAt: string;
  filters: {
    campaign: string;
    group: string;
    dateFrom: string;
    dateTo: string;
  };
  summary: ReportsSummaryDto;
  metrics: {
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    formSubmissions: number;
  };
  bars: ChartBar[];
  rows: ReportGridRow[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
  imports: [CommonModule, ReactiveFormsModule, GridComponent, ButtonComponent]
})
export class Reports implements OnInit, AfterViewInit, OnDestroy {
  filtersForm: FormGroup;

  columns: GridColumn[] = [
    { field: 'campaignName', label: 'Kampania' },
    { field: 'groupName', label: 'Grupa' },
    { field: 'recipient', label: 'Odbiorca' },
    { field: 'sentAtLabel', label: 'Wysłano' },
    { field: 'openedAtLabel', label: 'Otwarcie maila' },
    { field: 'clickedAtLabel', label: 'Kliknięcie w URL' },
    { field: 'submittedLabel', label: 'Wypełniony formularz' },
    { field: 'statusLabel', label: 'Status' }
  ];

  gridRows: ReportGridRow[] = [];
  chartBars: ChartBar[] = [];
  chartMaxValue = 1;

  campaigns: ReportSelectOption[] = [];
  groups: ReportGroupOption[] = [];

  isLoading = false;
  isLoadingFilters = false;
  isExporting = false;
  errorMessage: string | null = null;

  metrics = {
    openRate: 0,
    clickRate: 0,
    clickToOpenRate: 0,
    formSubmissions: 0
  };

  private filtersReady = false;
  private readonly destroy$ = new Subject<void>();

  @ViewChild('performanceChart') performanceChartRef?: ElementRef<HTMLCanvasElement>;

  private renderScheduled = false;
  private currentSummary: ReportsSummaryDto = { sent: 0, opened: 0, clicked: 0, submitted: 0 };

  constructor(private fb: FormBuilder, private reportsService: ReportsService) {
    this.filtersForm = this.fb.group({
      campaignId: [null],
      groupId: [null],
      dateFrom: [null],
      dateTo: [null]
    });
    this.updateChart(null);
  }

  ngOnInit(): void {
    this.observeFilterChanges();
    this.loadFilters();
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visibleGroups(): ReportGroupOption[] {
    const campaignId = this.filtersForm.get('campaignId')?.value;
    if (campaignId === null || campaignId === undefined) {
      return this.groups;
    }
    return this.groups.filter(g => g.campaignId === null || g.campaignId === undefined || g.campaignId === campaignId);
  }

  clearFilters(): void {
    this.filtersForm.reset({
      campaignId: null,
      groupId: null,
      dateFrom: null,
      dateTo: null
    });
  }

  get canExportReport(): boolean {
    const campaignId = this.filtersForm.get('campaignId')?.value;
    return this.normalizeId(campaignId) !== null;
  }

  exportToPdf(): void {
    if (!this.canExportReport) {
      Swal.fire({
        icon: 'info',
        title: 'Wybierz kampanię',
        text: 'Aby wygenerować raport PDF, wybierz konkretną kampanię.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.isExporting) {
      return;
    }

    this.isExporting = true;
    const filtersPayload = this.buildPayload();

    this.reportsService
      .exportToPdf(filtersPayload, this.buildExportPayload())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          this.isExporting = false;
          this.triggerFileDownload(blob, this.buildExportFileName());
          Swal.fire({
            icon: 'success',
            title: 'Eksport PDF',
            text: 'Wygenerowano raport PDF z serwera.',
            confirmButtonText: 'OK'
          });
        },
        error: err => {
          this.isExporting = false;
          const status = (err as { status?: number })?.status;
          const message = err instanceof Error ? err.message : 'Nie udało się wyeksportować raportu z serwera.';
          Swal.fire({
            icon: 'error',
            title: 'Eksport PDF',
            text: `${message}${status ? ` (status: ${status})` : ''}. Szczegóły w konsoli.`,
            confirmButtonText: 'Zamknij'
          });
        }
      });
  }

  private observeFilterChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(250),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (!this.filtersReady) {
          return;
        }
        this.ensureGroupConsistency();
        this.applyFilters();
      });
  }

  private loadFilters(): void {
    this.isLoadingFilters = true;
    this.reportsService
      .loadFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: filters => {
          this.campaigns = filters.campaigns ?? [];
          this.groups = filters.groups ?? [];
          this.isLoadingFilters = false;
          this.filtersReady = true;
          this.applyFilters();
        },
        error: err => {
          this.isLoadingFilters = false;
          this.filtersReady = true;
          const message = err instanceof Error ? err.message : 'Nie udało się załadować filtrów raportu.';
          this.errorMessage = message;
          this.updateGridRows([]);
          this.updateChart(null);
        }
      });
  }

  private applyFilters(): void {
    const payload = this.buildPayload();
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      interactions: this.reportsService.loadInteractions(payload),
      summary: this.reportsService.loadSummary(payload)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ interactions, summary }) => {
          this.isLoading = false;
          this.updateGridRows(interactions ?? []);
          this.updateChart(summary ?? null);
        },
        error: err => {
          this.isLoading = false;
          const message = err instanceof Error ? err.message : 'Nie udało się pobrać danych raportu.';
          this.errorMessage = message;
          this.updateGridRows([]);
          this.updateChart(null);
        }
      });
  }

  private buildPayload(): ReportsFilterPayload {
    const raw = this.filtersForm.value;
    return {
      campaignId: this.normalizeId(raw['campaignId']),
      groupId: this.normalizeId(raw['groupId']),
      dateFrom: this.normalizeDate(raw['dateFrom']),
      dateTo: this.normalizeDate(raw['dateTo'])
    };
  }

  private normalizeId(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : null;
  }

  private normalizeDate(value: unknown): string | null {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    return null;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.renderCharts();
  }

  private ensureGroupConsistency(): void {
    const campaignId = this.filtersForm.get('campaignId')?.value;
    const groupId = this.filtersForm.get('groupId')?.value;
    if (groupId === null || groupId === undefined) {
      return;
    }
    const validGroup = this.visibleGroups.some(group => group.id === groupId);
    if (!validGroup) {
      this.filtersForm.patchValue({ groupId: null }, { emitEvent: false });
    }
  }

  private updateGridRows(interactions: InteractionReportDto[]): void {
    const dataset = interactions ?? [];

    this.gridRows = dataset.map((item, index) => {
      const displayName = item.recipientName?.trim()
        ? `${item.recipientName} <${item.recipientEmail}>`
        : item.recipientEmail;

      return {
        id: item.id ?? index,
        campaignName: item.campaignName,
        groupName: item.groupName?.trim() || '--',
        recipient: displayName,
        sentAtLabel: this.formatDate(item.sentAt),
        openedAtLabel: this.formatDate(item.openedAt),
        clickedAtLabel: this.formatDate(item.clickedAt),
        submittedLabel: item.submitted ? 'Tak' : 'Nie',
        statusLabel: this.buildStatusLabel(item)
      };
    });
  }

  private updateChart(summary: ReportsSummaryDto | null): void {
    const sent = summary?.sent ?? 0;
    const opened = summary?.opened ?? 0;
    const clicked = summary?.clicked ?? 0;
    const submitted = summary?.submitted ?? 0;

    this.chartMaxValue = Math.max(sent, opened, clicked, submitted, 1);
    this.currentSummary = { sent, opened, clicked, submitted };

    const openRate = sent > 0 ? (opened / sent) * 100 : 0;
    const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
    const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0;
    const submissionRate = sent > 0 ? (submitted / sent) * 100 : 0;

    this.metrics = {
      openRate,
      clickRate,
      clickToOpenRate,
      formSubmissions: submissionRate
    };

    this.chartBars = [
      { key: 'sent', label: 'Wysłane maile', value: sent, color: '#334155', rate: null },
      { key: 'opened', label: 'Otwarcia', value: opened, color: '#1d4ed8', rate: openRate },
      { key: 'clicked', label: 'Kliknięcia', value: clicked, color: '#0f766e', rate: clickRate },
      { key: 'submitted', label: 'Wypełnione formularze', value: submitted, color: '#b45309', rate: submissionRate }
    ];

    this.renderCharts();
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) {
      return '--';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString();
  }

  private renderCharts(): void {
    if (this.renderScheduled) {
      return;
    }
    this.renderScheduled = true;
    requestAnimationFrame(() => {
      this.renderScheduled = false;
      this.renderPerformanceChart();
    });
  }

  private renderPerformanceChart(): void {
    const canvas = this.performanceChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = this.prepareCanvas(canvas);
    if (!ctx) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    if (!this.chartBars.length || this.chartMaxValue <= 0) {
      this.drawCanvasMessage(ctx, width, height, 'Brak danych do wyświetlenia');
      return;
    }

    const padding = { top: 24, right: 24, bottom: 48, left: 48 };
    const chartWidth = Math.max(0, width - padding.left - padding.right);
    const chartHeight = Math.max(0, height - padding.top - padding.bottom);
    const barSpace = chartWidth / this.chartBars.length;
    const barWidth = barSpace * 0.38;

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    const scaleStep = this.computeScaleStep(this.chartMaxValue);
    for (let value = 0; value <= this.chartMaxValue; value += scaleStep) {
      const y = height - padding.bottom - (value / this.chartMaxValue) * chartHeight;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '12px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(value)}`, padding.left - 10, y);
    }

    this.chartBars.forEach((bar, index) => {
      const valueHeight = (bar.value / this.chartMaxValue) * chartHeight;
      const barX = padding.left + index * barSpace + (barSpace - barWidth) / 2;
      const barY = height - padding.bottom - valueHeight;

      const gradient = ctx.createLinearGradient(barX, barY, barX, barY + valueHeight);
      gradient.addColorStop(0, bar.color);
      gradient.addColorStop(1, this.lightenColor(bar.color, 0.35));

      ctx.fillStyle = gradient;
      this.drawRoundedRect(ctx, barX, barY, barWidth, valueHeight, 6);

      ctx.fillStyle = '#111827';
      ctx.font = '13px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${bar.value}`, barX + barWidth / 2, barY - 6);

      ctx.fillStyle = '#475569';
      ctx.font = '12px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(bar.label, barX + barWidth / 2, height - padding.bottom + 18);
    });
  }

  private prepareCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpi = window.devicePixelRatio || 1;

    if (canvas.width !== width * dpi) {
      canvas.width = width * dpi;
    }
    if (canvas.height !== height * dpi) {
      canvas.height = height * dpi;
    }

    ctx.resetTransform?.();
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);

    return ctx;
  }

  private drawCanvasMessage(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    message: string
  ): void {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
  }

  private computeScaleStep(maxValue: number): number {
    if (maxValue <= 5) {
      return 1;
    }
    if (maxValue <= 20) {
      return 2;
    }
    if (maxValue <= 50) {
      return 5;
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / (5 * magnitude)) * magnitude;
  }

  private lightenColor(hex: string, factor: number): string {
    const normalized = hex.replace('#', '');
    const num = parseInt(normalized, 16);
    const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * factor));
    const g = Math.min(255, Math.round(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * factor));
    const b = Math.min(255, Math.round((num & 0xff) + (255 - (num & 0xff)) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private buildPdfData(): PdfDocumentData {
    const campaignId = this.normalizeId(this.filtersForm.get('campaignId')?.value ?? null);
    const groupId = this.normalizeId(this.filtersForm.get('groupId')?.value ?? null);
    const dateFrom = (this.filtersForm.get('dateFrom')?.value as string | null) || '--';
    const dateTo = (this.filtersForm.get('dateTo')?.value as string | null) || '--';

    const filters = {
      campaign: this.findName(this.campaigns, campaignId),
      group: this.findName(this.groups, groupId),
      dateFrom,
      dateTo
    };

    const rows = this.gridRows.slice(0, 8);
    const title = filters.campaign !== 'Wszystkie'
      ? `Raport kampanii: ${filters.campaign}`
      : 'Raport kampanii - zestawienie';

    return {
      title,
      generatedAt: new Date().toLocaleString(),
      filters,
      summary: this.currentSummary,
      metrics: {
        openRate: this.metrics.openRate,
        clickRate: this.metrics.clickRate,
        clickToOpenRate: this.metrics.clickToOpenRate,
        formSubmissions: this.metrics.formSubmissions
      },
      bars: [...this.chartBars],
      rows
    };
  }

  private buildPdfDocument(data: PdfDocumentData): Blob {
    const pageWidth = 595;
    const pageHeight = 842;
    const commands: string[] = [];

    const push = (value: string) => commands.push(value);

    this.setFillColor(commands, '#ffffff');
    push(`0 0 ${pageWidth} ${pageHeight} re f`);

    this.setFillColor(commands, '#e0ecff');
    push(`36 ${pageHeight - 96} ${pageWidth - 72} 52 re f`);
    this.setStrokeColor(commands, '#bfd7ff');
    push('1 w');
    push(`36 ${pageHeight - 96} ${pageWidth - 72} 52 re S`);

    this.addPdfText(commands, data.title, 54, pageHeight - 66, 20, '#1f2937');
    this.addPdfText(commands, `Wygenerowano: ${data.generatedAt}`, 54, pageHeight - 86, 11, '#475569');

    const summaryTop = pageHeight - 124;
    const boxHeight = 68;
    const boxWidth = 164;
    const boxGap = 12;
    const bars = data.bars.length ? data.bars : [
      { key: 'sent', label: 'Wysłane maile', value: data.summary.sent, color: '#334155', rate: null },
      { key: 'opened', label: 'Otwarcia', value: data.summary.opened, color: '#1d4ed8', rate: data.metrics.openRate },
      { key: 'clicked', label: 'Kliknięcia', value: data.summary.clicked, color: '#0f766e', rate: data.metrics.clickRate }
    ];

    bars.slice(0, 3).forEach((bar, index) => {
      const x = 54 + index * (boxWidth + boxGap);
      const y = summaryTop - boxHeight;

      this.setFillColor(commands, bar.color, 0.68);
      push(`${x} ${y} ${boxWidth} ${boxHeight} re f`);
      this.setStrokeColor(commands, bar.color, 0.25);
      push(`1.2 w`);
      push(`${x} ${y} ${boxWidth} ${boxHeight} re S`);

      this.addPdfText(commands, bar.label, x + 12, y + boxHeight - 18, 11, '#0f172a');
      this.addPdfText(commands, `${bar.value}`, x + 12, y + boxHeight - 36, 18, '#111827');
      if (bar.rate !== null) {
        this.addPdfText(commands, `${bar.rate.toFixed(1)}%`, x + 12, y + 18, 11, '#1f2937');
      }
    });

    const filterX = 54 + 3 * (boxWidth + boxGap);
    const filterWidth = pageWidth - filterX - 54;
    const filterHeight = boxHeight;
    const filterY = summaryTop - boxHeight;

    this.setFillColor(commands, '#f1f5f9');
    push(`${filterX} ${filterY} ${filterWidth} ${filterHeight} re f`);
    this.setStrokeColor(commands, '#cbd5f5');
    push('1 w');
    push(`${filterX} ${filterY} ${filterWidth} ${filterHeight} re S`);

    this.addPdfText(commands, 'Filtry raportu', filterX + 12, filterY + filterHeight - 18, 11, '#1e293b');
    this.addPdfText(commands, `Kampania: ${data.filters.campaign}`, filterX + 12, filterY + filterHeight - 34, 10, '#475569');
    this.addPdfText(commands, `Grupa: ${data.filters.group}`, filterX + 12, filterY + filterHeight - 49, 10, '#475569');
    this.addPdfText(commands, `Zakres: ${data.filters.dateFrom} - ${data.filters.dateTo}`, filterX + 12, filterY + 18, 10, '#475569');

    const chartX = 54;
    const chartY = 360;
    const chartWidth = pageWidth - 108;
    const chartHeight = 220;
    const axisPadding = 42;

    this.setFillColor(commands, '#f8fafc');
    push(`${chartX} ${chartY} ${chartWidth} ${chartHeight} re f`);
    this.setStrokeColor(commands, '#d6e3f8');
    push('1 w');
    push(`${chartX} ${chartY} ${chartWidth} ${chartHeight} re S`);

    const chartBarsAreaHeight = chartHeight - axisPadding;
    const chartBarsAreaBottom = chartY + 24;
    const chartBarsAreaTop = chartBarsAreaBottom + chartBarsAreaHeight;
    const maxBarValue = Math.max(...bars.map(bar => bar.value), 1);
    const scaleStep = this.computeScaleStep(maxBarValue);

    for (let value = 0; value <= maxBarValue; value += scaleStep) {
      const y = chartBarsAreaBottom + (value / maxBarValue) * chartBarsAreaHeight;
      this.setStrokeColor(commands, '#e2e8f0');
      push('0.6 w');
      push(`${chartX + 32} ${y} ${chartWidth - 48} 0 re S`);
      this.addPdfText(commands, `${Math.round(value)}`, chartX + 24, y + 4, 9, '#64748b');
    }

    const slotWidth = (chartWidth - 64) / bars.length;
    const barWidth = slotWidth * 0.5;

    bars.forEach((bar, index) => {
      const barHeight = (bar.value / maxBarValue) * chartBarsAreaHeight;
      const barX = chartX + 64 + index * slotWidth - barWidth / 2;
      const barY = chartBarsAreaBottom;

      this.setFillColor(commands, bar.color);
      push(`${barX} ${barY} ${barWidth} ${barHeight} re f`);

      const valueX = barX + barWidth / 2 - 8;
      this.addPdfText(commands, `${bar.value}`, valueX, barY + barHeight + 20, 10, '#0f172a');
    });

    this.addPdfText(commands, 'WydajnoĹ›Ä‡ kampanii', chartX + 12, chartY + chartHeight + 26, 12, '#1e293b');

    const tableX = 54;
    const tableBottom = 165;
    const tableWidth = pageWidth - 108;
    const headerHeight = 34;
    const rowHeight = 24;
    const rows = data.rows;
    const rowCount = rows.length;
    const tableHeight = headerHeight + rowCount * rowHeight;

    if (rowCount === 0) {
      this.addPdfText(commands, 'Brak danych interakcji dla wybranego zakresu.', tableX, tableBottom + 12, 11, '#475569');
    } else {
      this.setStrokeColor(commands, '#cbd5f5');
      push('1 w');
      push(`${tableX} ${tableBottom} ${tableWidth} ${tableHeight} re S`);

      this.setFillColor(commands, '#1d4ed8', 0.2);
      push(`${tableX} ${tableBottom + tableHeight - headerHeight} ${tableWidth} ${headerHeight} re f`);

      const headerBaseline = tableBottom + tableHeight - 16;
      this.addPdfText(commands, 'Odbiorca', tableX + 12, headerBaseline, 11, '#1f2937');
      this.addPdfText(commands, 'Status', tableX + tableWidth * 0.45 + 8, headerBaseline, 11, '#1f2937');
      this.addPdfText(commands, 'Wysłano', tableX + tableWidth * 0.62 + 8, headerBaseline, 11, '#1f2937');
      this.addPdfText(commands, 'Kliknięcie', tableX + tableWidth * 0.78 + 8, headerBaseline, 11, '#1f2937');

      rows.forEach((row, index) => {
        const y = tableBottom + tableHeight - headerHeight - (index + 1) * rowHeight;
        if (index % 2 === 0) {
          this.setFillColor(commands, '#f8fafc');
          push(`${tableX} ${y} ${tableWidth} ${rowHeight} re f`);
        }

        const textBaseline = y + rowHeight - 8;
        const clickLabel = row.clickedAtLabel && row.clickedAtLabel !== '--' ? row.clickedAtLabel : '--';

        this.addPdfText(commands, this.shortenForPdf(row.recipient, 52), tableX + 12, textBaseline, 9, '#111827');
        this.addPdfText(commands, this.shortenForPdf(row.statusLabel, 18), tableX + tableWidth * 0.45 + 8, textBaseline, 9, '#1f2937');
        this.addPdfText(commands, this.shortenForPdf(row.sentAtLabel, 26), tableX + tableWidth * 0.62 + 8, textBaseline, 9, '#1f2937');
        this.addPdfText(commands, this.shortenForPdf(clickLabel, 26), tableX + tableWidth * 0.78 + 8, textBaseline, 9, '#1f2937');
      });
    }

    const content = commands.join('\n');
    const contentLength = new TextEncoder().encode(content).length;

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    const addObject = (id: number, body: string) => {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${body}\nendobj\n`;
    };

    addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    addObject(4, `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`);
    addObject(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const xrefPosition = pdf.length;
    const totalObjects = 5;

    pdf += `xref\n0 ${totalObjects + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= totalObjects; i++) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private setFillColor(commands: string[], hex: string, lighten = 0): void {
    const [r, g, b] = this.hexToRgb(hex, lighten);
    commands.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`);
  }

  private setStrokeColor(commands: string[], hex: string, lighten = 0): void {
    const [r, g, b] = this.hexToRgb(hex, lighten);
    commands.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`);
  }

  private addPdfText(
    commands: string[],
    text: string,
    x: number,
    y: number,
    fontSize: number,
    colorHex: string
  ): void {
    this.setFillColor(commands, colorHex);
    commands.push('BT');
    commands.push(`/F1 ${fontSize.toFixed(2)} Tf`);
    commands.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`);
    commands.push(`(${this.escapePdfText(text)}) Tj`);
    commands.push('ET');
  }

  private hexToRgb(hex: string, lighten = 0): [number, number, number] {
    const normalized = hex.replace('#', '');
    const value = parseInt(normalized, 16);
    const r = (value >> 16) & 0xff;
    const g = (value >> 8) & 0xff;
    const b = value & 0xff;
    const adjust = (component: number) =>
      Math.min(255, Math.round(component + (255 - component) * lighten));
    return [adjust(r), adjust(g), adjust(b)];
  }

  private shortenForPdf(value: string | null | undefined, maxLength: number): string {
    const text = (value ?? '').trim();
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, Math.max(0, maxLength - 3)) + '...';
  }

  private escapePdfText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private findName<T extends ReportSelectOption>(collection: T[], id: number | null): string {
    if (id === null || id === undefined) {
      return 'Wszystkie';
    }
    const match = collection.find(item => item.id === id);
    return match?.name ?? 'Wszystkie';
  }

  private buildStatusLabel(item: InteractionReportDto): string {
    if (item.clicked) {
      return 'Kliknięty';
    }
    if (item.opened) {
      return 'Otwarty';
    }
    return 'Wysłany';
  }

  private triggerFileDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  private buildExportPayload(): ReportsExportPayload {
    const filters = this.buildPayload();
    const filtersLabel = {
      campaign: this.findName(this.campaigns, filters.campaignId ?? null),
      group: this.findName(this.groups, filters.groupId ?? null),
      range: `${filters.dateFrom || '--'} - ${filters.dateTo || '--'}`
    };

    const title =
      filtersLabel.campaign !== 'Wszystkie'
        ? `Raport kampanii: ${filtersLabel.campaign}`
        : 'Raport kampanii - zestawienie';

    const bars: ReportsExportBarDto[] = this.chartBars.map(bar => ({
      label: bar.label,
      value: bar.value,
      colorStart: bar.color,
      colorEnd: this.lightenColor(bar.color, 0.45)
    }));

    const rows: ReportsExportRowDto[] = this.gridRows.map(row => ({
      recipient: row.recipient,
      status: row.statusLabel,
      sent: row.sentAtLabel,
      opened: row.openedAtLabel,
      clicked: row.clickedAtLabel
    }));

    return {
      filters: filtersLabel,
      filtersRaw: filters,
      title,
      generatedAt: new Date().toLocaleString('pl-PL'),
      summary: this.currentSummary,
      metrics: {
        openRate: this.metrics.openRate,
        clickRate: this.metrics.clickRate,
        clickToOpenRate: this.metrics.clickToOpenRate,
        formSubmissions: this.metrics.formSubmissions
      },
      bars,
      rows
    };
  }

  private buildExportFileName(): string {
    const campaignId = this.filtersForm.get('campaignId')?.value;
    const campaign = this.campaigns.find(c => c.id === campaignId);
    const date = new Date().toISOString().slice(0, 10);
    const suffix = campaign ? `-${this.slugify(campaign.name)}` : '';
    return `raport-campaign${suffix}-${date}.pdf`;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

}

















