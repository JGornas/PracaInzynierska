export interface ReportSelectOption {
  id: number;
  name: string;
}

export interface ReportGroupOption extends ReportSelectOption {
  campaignId?: number | null;
}

export interface ReportsFiltersDto {
  campaigns: ReportSelectOption[];
  groups: ReportGroupOption[];
}

export interface ReportsFilterPayload {
  campaignId?: number | null;
  groupId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface InteractionReportDto {
  id: number;
  campaignId: number;
  campaignName: string;
  groupId?: number | null;
  groupName?: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  sentAt: string;
  openedAt?: string | null;
  clickedAt?: string | null;
  opened: boolean;
  clicked: boolean;
}

export interface ReportsSummaryDto {
  sent: number;
  opened: number;
  clicked: number;
}

export interface ReportsExportBarDto {
  label: string;
  value: number;
  colorStart?: string;
  colorEnd?: string;
}

export interface ReportsExportRowDto {
  recipient: string;
  status: string;
  sent: string;
  opened: string;
  clicked: string;
}

export interface ReportsExportPayload {
  filters: {
    campaign: string;
    group: string;
    range: string;
  };
  filtersRaw: ReportsFilterPayload;
  title: string;
  generatedAt: string;
  summary: ReportsSummaryDto;
  metrics: {
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
  };
  bars: ReportsExportBarDto[];
  rows: ReportsExportRowDto[];
}
