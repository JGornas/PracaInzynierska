import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { RecipientsService } from './recipients.service';
import { RecipientDto, RecipientGroupDto, RecipientGroupPayload, RecipientPayload } from './recipients.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';

interface CsvPreview {
  headers: string[];
  rows: string[][];
}

interface ImportErrorItem {
  email: string;
  importError: string;
}

interface ImportReport {
  total: number;
  valid: number;
  invalid: number;
  errors: ImportErrorItem[];
}

type RecipientGridRow = RecipientDto & { createdAtLabel: string };

type GroupGridRow = {
  id: number;
  name: string;
  campaignLabel: string;
  membersCount: number;
};

type MemberWorking = RecipientPayload & {
  id?: number | null;
  createdAt?: string | null;
  clientKey: string;
};

@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GridComponent, ButtonComponent],
  templateUrl: 'recipients.html',
  styleUrls: ['recipients.scss']
})
export class Recipients implements OnInit {
  constructor(private fb: FormBuilder, private recipientsService: RecipientsService) {
    this.memberForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      position: ['']
    });

    this.recipientForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      position: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  individualColumns: GridColumn[] = [
    { field: 'email', label: 'E-mail' },
    { field: 'firstName', label: 'Imię' },
    { field: 'lastName', label: 'Nazwisko' },
    { field: 'position', label: 'Stanowisko' }
  ];

  groupColumns: GridColumn[] = [
    { field: 'name', label: 'Nazwa grupy' },
    { field: 'campaignLabel', label: 'Kampania' },
    { field: 'membersCount', label: 'Liczba odbiorców' }
  ];

  individualRecipients: RecipientDto[] = [];
  individualGridData: RecipientGridRow[] = [];

  groups: RecipientGroupDto[] = [];
  groupGridData: GroupGridRow[] = [];

  showRecipientModal = false;
  recipientForm: FormGroup;
  editingRecipientId: number | null = null;

  showGroupModal = false;
  editingGroupId: number | null = null;
  editingIndex: number | null = null;
  groupName = '';
  campaign = '';
  groupNameTouched = false;
  membersTouched = false;

  memberForm: FormGroup;
  membersWorking: MemberWorking[] = [];
  showAddMember = false;
  showCsvImport = false;
  search = '';

  csvFileName: string | null = null;
  delimiter = ',';
  csvPreview: CsvPreview | null = null;
  csvMapping: Record<string, number> = {};
  mappingFields = ['email', 'firstName', 'lastName', 'position', 'externalId'];
  fieldLabels: Record<string, string> = {
    email: 'E-mail',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    position: 'Stanowisko',
    externalId: 'Identyfikator zewnętrzny'
  };
  dryRun = true;
  importReport: ImportReport | null = null;
  lastCsvText: string | null = null;

  isLoading = false;
  isSavingRecipient = false;
  isSavingGroup = false;

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([this.loadRecipients(), this.loadGroups()]);
    } catch (error) {
      this.handleError(error, 'Nie udało się pobrać odbiorców.');
    } finally {
      this.isLoading = false;
    }
  }

  private async loadRecipients(): Promise<void> {
    const recipients = await firstValueFrom(this.recipientsService.getRecipients());
    this.individualRecipients = recipients;
    this.refreshRecipientGridData();
  }

  private async loadGroups(): Promise<void> {
    const groups = await firstValueFrom(this.recipientsService.getGroups());
    this.groups = groups;
    this.refreshGroupGridData();
  }

  private refreshRecipientGridData(): void {
    this.individualGridData = this.individualRecipients.map(rec => ({
      ...rec,
      createdAtLabel: rec.createdAt ? this.formatDate(rec.createdAt) : ''
    }));
  }

  private refreshGroupGridData(): void {
    this.groupGridData = this.groups.map(group => ({
      id: group.id,
      name: group.name,
      campaignLabel: group.campaign || '-',
      membersCount: group.members?.length ?? 0
    }));
  }

  openCreateRecipient(): void {
    this.editingRecipientId = null;
    this.recipientForm.reset();
    this.recipientForm.markAsPristine();
    this.recipientForm.markAsUntouched();
    this.showRecipientModal = true;
  }

  openEditRecipient(row: GridElement): void {
    const id = Number(row['id']);
    if (!id) {
      return;
    }
    const recipient = this.individualRecipients.find(r => r.id === id);
    if (!recipient) {
      return;
    }
    this.editingRecipientId = id;
    this.recipientForm.reset({
      firstName: recipient.firstName || '',
      lastName: recipient.lastName || '',
      email: recipient.email,
      position: recipient.position || ''
    });
    this.recipientForm.markAsPristine();
    this.recipientForm.markAsUntouched();
    this.showRecipientModal = true;
  }

  cancelRecipientModal(): void {
    this.showRecipientModal = false;
    this.editingRecipientId = null;
  }

  async saveRecipient(): Promise<void> {
    if (this.recipientForm.invalid) {
      this.recipientForm.markAllAsTouched();
      return;
    }

    const value = this.recipientForm.value;
    const normalizedEmail = (value.email || '').trim().toLowerCase();
    if (!this.isValidEmail(normalizedEmail)) {
      alert('Nieprawidłowy email');
      return;
    }

    const payload: RecipientPayload = {
      id: this.editingRecipientId ?? undefined,
      email: normalizedEmail,
      firstName: (value.firstName || '').trim() || null,
      lastName: (value.lastName || '').trim() || null,
      position: (value.position || '').trim() || null,
      externalId: null
    };

    this.isSavingRecipient = true;
    try {
      if (this.editingRecipientId) {
        await firstValueFrom(this.recipientsService.updateRecipient(this.editingRecipientId, payload));
      } else {
        await firstValueFrom(this.recipientsService.createRecipient(payload));
      }
      await Promise.all([this.loadRecipients(), this.loadGroups()]);
      this.showRecipientModal = false;
      this.editingRecipientId = null;
    } catch (error) {
      this.handleError(error, 'Nie udało się zapisać odbiorcy.');
    } finally {
      this.isSavingRecipient = false;
    }
  }

  toggleCsvImport(): void {
    this.showCsvImport = !this.showCsvImport;
  }

  applyImport(): void {
    this.performImport(true);
  }

  recalculateImport(): void {
    this.performImport(false);
  }


  async handleRecipientRemoved(row: GridElement): Promise<void> {
    const id = Number(row['id']);
    if (!id) {
      return;
    }
    const recipient = this.individualRecipients.find(r => r.id === id);
    const email = recipient?.email || '';
    const confirmed = confirm(`Usunąć odbiorcę "${email || id}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await firstValueFrom(this.recipientsService.deleteRecipient(id));
      await Promise.all([this.loadRecipients(), this.loadGroups()]);
    } catch (error) {
      this.handleError(error, 'Nie udało się usunąć odbiorcy.');
    }
  }

  handleRecipientDoubleClicked(row: GridElement): void {
    this.openEditRecipient(row);
  }

  openCreateGroup(): void {
    this.editingGroupId = null;
    this.editingIndex = null;
    this.groupName = '';
    this.campaign = '';
    this.membersWorking = [];
    this.groupNameTouched = false;
    this.membersTouched = false;
    this.resetCsvState();
    this.showAddMember = false;
    this.showCsvImport = false;
    this.search = '';
    this.memberForm.reset();
    this.showGroupModal = true;
  }

  openEditGroup(index: number): void {
    const group = this.groups[index];
    if (!group) {
      return;
    }
    this.editingIndex = index;
    this.openGroupForEditing(group);
  }

  openEditGroupById(id: number): void {
    const index = this.groups.findIndex(g => g.id === id);
    const group = index >= 0 ? this.groups[index] : undefined;
    if (!group) {
      return;
    }
    this.editingIndex = index >= 0 ? index : null;
    this.openGroupForEditing(group);
  }

  private openGroupForEditing(group: RecipientGroupDto): void {
    this.editingGroupId = group.id;
    this.groupName = group.name;
    this.campaign = group.campaign || '';
    this.groupNameTouched = false;
    this.membersTouched = false;
    this.membersWorking = (group.members || []).map(member => ({
      id: member.id,
      email: member.email,
      firstName: member.firstName || null,
      lastName: member.lastName || null,
      position: member.position || null,
      externalId: member.externalId || null,
      createdAt: member.createdAt || null,
      clientKey: this.buildClientKey(member.id)
    }));
    this.resetCsvState();
    this.showAddMember = false;
    this.showCsvImport = false;
    this.search = '';
    this.memberForm.reset();
    this.showGroupModal = true;
  }

  cancelGroupModal(): void {
    this.showGroupModal = false;
    this.editingGroupId = null;
    this.editingIndex = null;
  }

  async saveGroup(): Promise<void> {
    this.groupNameTouched = true;
    this.membersTouched = true;

    const name = (this.groupName || '').trim();
    if (!name || this.membersWorking.length < 1) {
      return;
    }

    const campaign = this.normalizeOptionalText(this.campaign);
    const payload: RecipientGroupPayload = {
      name,
      members: this.buildMembersPayload(),
      ...(campaign ? { campaign } : {})
    };

    this.isSavingGroup = true;
    try {
      if (this.editingGroupId === null) {
        await firstValueFrom(this.recipientsService.createGroup(payload));
      } else {
        await firstValueFrom(this.recipientsService.updateGroup(this.editingGroupId, payload));
      }
      this.showGroupModal = false;
      this.editingGroupId = null;
      this.editingIndex = null;
      await Promise.all([this.loadGroups(), this.loadRecipients()]);
    } catch (error) {
      this.handleError(error, 'Nie udało się zapisać grupy.');
    } finally {
      this.isSavingGroup = false;
    }
  }

  private buildMembersPayload(): RecipientPayload[] {
    return this.membersWorking.map(member => {
      const email = (member.email || '').trim().toLowerCase();
      const existing = this.findRecipientByEmail(email);
      const memberId = member.id ?? existing?.id ?? undefined;

      const firstName = this.normalizeOptionalText(member.firstName) ?? this.normalizeOptionalText(existing?.firstName);
      const lastName = this.normalizeOptionalText(member.lastName) ?? this.normalizeOptionalText(existing?.lastName);
      const position = this.normalizeOptionalText(member.position) ?? this.normalizeOptionalText(existing?.position);
      const externalId = this.normalizeOptionalText(member.externalId) ?? this.normalizeOptionalText(existing?.externalId);

      const payload: RecipientPayload = {
        email,
        ...(memberId !== undefined && memberId !== null ? { id: memberId } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(position ? { position } : {}),
        ...(externalId ? { externalId } : {})
      };

      return payload;
    });
  }

  private findRecipientByEmail(email: string): RecipientDto | undefined {
    const normalized = (email || '').trim().toLowerCase();
    return this.individualRecipients.find(r => (r.email || '').toLowerCase() === normalized);
  }

  private normalizeOptionalText(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed ? trimmed : undefined;
  }
  async handleGroupRemoved(row: GridElement): Promise<void> {
    const id = Number(row['id']);
    if (!id) {
      return;
    }
    const group = this.groups.find(g => g.id === id);
    const confirmed = confirm(`Usunąć grupę "${group?.name || id}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await firstValueFrom(this.recipientsService.deleteGroup(id));
      await Promise.all([this.loadGroups(), this.loadRecipients()]);
    } catch (error) {
      this.handleError(error, 'Nie udało się usunąć grupy.');
    }
  }

  handleGroupDoubleClicked(row: GridElement): void {
    const id = Number(row['id']);
    if (!id) {
      return;
    }
    this.openEditGroupById(id);
  }

  toggleAddMember(): void {
    this.showAddMember = !this.showAddMember;
    if (!this.showAddMember) this.memberForm.reset();
  }

  addMemberFromForm(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }
    const val = this.memberForm.value;
    const email = (val.email || '').trim().toLowerCase();
    if (!this.isValidEmail(email)) {
      alert('Nieprawidłowy email');
      return;
    }
    if (this.isDuplicateInWorkingMembers(email)) {
      alert('Taki email już istnieje w tej grupie');
      return;
    }
    const newMember: MemberWorking = {
      id: null,
      email,
      firstName: (val.firstName || '').trim() || null,
      lastName: (val.lastName || '').trim() || null,
      position: (val.position || '').trim() || null,
      externalId: null,
      clientKey: this.generateClientKey()
    };
    this.membersWorking.push(newMember);
    this.toggleAddMember();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.csvFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.lastCsvText = text;
      this.delimiter = this.detectDelimiter(text);
      this.parseCsv(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  parseCsv(text: string): void {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      this.csvPreview = null;
      this.csvMapping = {};
      return;
    }
    const headers = this.splitLine(lines[0], this.delimiter).map(h => h.trim());
    const rows: string[][] = [];
    for (let i = 1; i < lines.length && rows.length < 1000; i++) {
      rows.push(this.splitLine(lines[i], this.delimiter));
    }
    this.csvPreview = { headers, rows };
    this.importReport = null;

    const headerIndex: Record<string, number> = {};
    headers.forEach((h, idx) => {
      const normalized = h.toLowerCase();
      if (normalized.includes('email')) headerIndex['email'] = idx;
      if (normalized.includes('first')) headerIndex['firstName'] = idx;
      if (normalized.includes('last')) headerIndex['lastName'] = idx;
      if (normalized.includes('position') || normalized.includes('title')) headerIndex['position'] = idx;
      if (normalized.includes('external')) headerIndex['externalId'] = idx;
    });
    this.csvMapping = { ...headerIndex };
  }

  private splitLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  onDelimiterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement | null)?.value ?? ',';
    this.delimiter = val;
    if (this.lastCsvText) {
      this.parseCsv(this.lastCsvText);
    }
  }

  onDelimiterModelChange(value: string): void {
    this.delimiter = value || ',';
    if (this.lastCsvText) {
      this.parseCsv(this.lastCsvText);
    }
  }

  private detectDelimiter(text: string): string {
    const candidates = [',', ';'];
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0).slice(0, 10);
    if (lines.length === 0) return ',';
    let best = ',';
    let bestScore = -Infinity;
    for (const d of candidates) {
      const counts = lines.map(l => this.splitLine(l, d).length);
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const min = Math.min(...counts);
      const max = Math.max(...counts);
      const consistency = 1 - (max - min) / Math.max(1, max);
      const score = (avg >= 2 ? avg : 0) + 0.1 * consistency;
      if (score > bestScore) { bestScore = score; best = d; }
    }
    return best;
  }

  onMappingChange(field: string, event: Event): void {
    const raw = (event.target as HTMLSelectElement | null)?.value ?? '';
    const idx = raw === '' ? -1 : +raw;
    if (idx === -1) delete this.csvMapping[field];
    else this.csvMapping[field] = idx;
  }

  performImport(save: boolean): void {
    if (!this.csvPreview) return;
    const rows = this.csvPreview.rows;
    const errors: ImportErrorItem[] = [];
    const valid: MemberWorking[] = [];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const getField = (field: string) => {
        const idx = this.csvMapping[field];
        if (idx === undefined || idx < 0 || idx >= row.length) return '';
        return (row[idx] ?? '').trim();
      };
      const emailRaw = getField('email') || '';
      const email = emailRaw.trim().toLowerCase();
      if (!email || !this.isValidEmail(email)) {
        errors.push({ email: email || '(brak)', importError: 'Nieprawidłowy e-mail' });
        continue;
      }
      if (this.isDuplicateInWorkingMembers(email) || valid.some(v => v.email === email)) {
        errors.push({ email, importError: 'Duplikat e-mail' });
        continue;
      }
      const member: MemberWorking = {
        id: null,
        email,
        firstName: getField('firstName') || null,
        lastName: getField('lastName') || null,
        position: getField('position') || null,
        externalId: getField('externalId') || null,
        clientKey: this.generateClientKey()
      };
      valid.push(member);
    }
    this.importReport = {
      total: rows.length,
      valid: valid.length,
      invalid: errors.length,
      errors
    };
    if (save && !this.dryRun) {
      this.membersWorking.push(...valid);
      this.csvPreview = null;
      this.csvFileName = null;
      this.csvMapping = {};
    }
  }

  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
  }

  private isDuplicateInWorkingMembers(email: string): boolean {
    const normalized = (email || '').trim().toLowerCase();
    return this.membersWorking.some(m => (m.email || '').trim().toLowerCase() === normalized);
  }

  removeMember(clientKey: string | undefined): void {
    if (!clientKey) return;
    this.membersWorking = this.membersWorking.filter(m => m.clientKey !== clientKey);
  }

  get filteredMembers(): MemberWorking[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.membersWorking;
    return this.membersWorking.filter(m =>
      (m.firstName || '').toLowerCase().includes(q) ||
      (m.lastName || '').toLowerCase().includes(q) ||
      (m.position || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  }

  private resetCsvState(): void {
    this.csvFileName = null;
    this.csvPreview = null;
    this.csvMapping = {};
    this.importReport = null;
    this.dryRun = true;
  }

  private buildClientKey(id?: number | null): string {
    return id ? `srv-${id}` : this.generateClientKey();
  }

  private generateClientKey(): string {
    return `tmp-${Math.random().toString(36).slice(2, 11)}`;
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  }

  private handleError(error: unknown, fallbackMessage: string): void {
    const message = error instanceof Error ? error.message : fallbackMessage;
    alert(message || fallbackMessage);
  }
}








