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
