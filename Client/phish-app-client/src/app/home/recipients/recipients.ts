import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Member {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string; // wymagane
  position?: string;
  externalId?: string;
  createdAt?: string;
  importError?: string | null;
}

interface Group {
  id: string;
  name: string;
  campaign?: string; // opcjonalna nazwa kampanii
  members: Member[];
  expanded?: boolean;
}

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

@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'recipients.html',
  styleUrls: ['recipients.scss']
})
export class Recipients {
  // lista grup
  groups: Group[] = [];

  // modal grupy (tworzenie/edycja)
  showGroupModal = false;
  editingIndex: number | null = null;
  groupName = '';
  campaign = '';
  groupNameTouched = false;
  membersTouched = false;

  // formularz i stan dodawania odbiorców w modalu
  memberForm: FormGroup;
  membersWorking: Member[] = [];
  showAddMember = false;
  showCsvImport = false;
  search = '';

  // CSV import stan
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

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      position: ['']
    });
  }

  // ---- Modal group flow ----
  openCreateGroup() {
    this.editingIndex = null;
    this.groupName = '';
    this.campaign = '';
    this.membersWorking = [];
    this.groupNameTouched = false;
    this.membersTouched = false;
    this.resetCsvState();
    this.showAddMember = false;
    this.showCsvImport = false;
    this.showGroupModal = true;
  }

  openEditGroup(index: number) {
    const g = this.groups[index];
    if (!g) return;
    this.editingIndex = index;
    this.groupName = g.name;
    this.campaign = g.campaign || '';
    this.groupNameTouched = false;
    this.membersTouched = false;
    this.membersWorking = (g.members || []).map(m => ({ ...m }));
    this.resetCsvState();
    this.showAddMember = false;
    this.showCsvImport = false;
    this.showGroupModal = true;
  }

  cancelGroupModal() {
    this.showGroupModal = false;
  }

  saveGroup() {
    // zaznacz walidacje, aby pokazać komunikaty
    this.groupNameTouched = true;
    this.membersTouched = true;
    const name = (this.groupName || '').trim();
    if (!name) return;
    if (this.membersWorking.length < 1) return;
    const payload: Group = {
      id: this.editingIndex === null ? this.generateId() : this.groups[this.editingIndex].id,
      name,
      campaign: (this.campaign || '').trim() || undefined,
      members: this.membersWorking.map(m => ({ ...m }))
    };
    if (this.editingIndex === null) {
      this.groups.push(payload);
    } else {
      this.groups[this.editingIndex] = { ...payload, expanded: this.groups[this.editingIndex].expanded };
    }
    this.showGroupModal = false;
  }

  deleteGroup(index: number) {
    const g = this.groups[index];
    if (!g) return;
    const ok = confirm(`Usunąć grupę "${g.name}"?`);
    if (ok) this.groups.splice(index, 1);
  }

  toggleExpand(index: number) {
    const g = this.groups[index];
    if (!g) return;
    g.expanded = !g.expanded;
  }

  // ---- Add member (manual) ----
  toggleAddMember() {
    this.showAddMember = !this.showAddMember;
    if (!this.showAddMember) this.memberForm.reset();
  }

  addMemberFromForm() {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }
    const val = this.memberForm.value;
    const newMember: Member = {
      id: this.generateId(),
      firstName: val.firstName || undefined,
      lastName: val.lastName || undefined,
      email: (val.email || '').trim().toLowerCase(),
      position: val.position || undefined,
      createdAt: new Date().toISOString()
    };
    if (!this.isValidEmail(newMember.email)) {
      alert('Nieprawidłowy email');
      return;
    }
    if (this.isDuplicate(newMember.email)) {
      alert('Taki email już istnieje');
      return;
    }
    this.membersWorking.push(newMember);
    this.toggleAddMember();
  }

  // ---- CSV import ----
  onFileSelected(event: Event) {
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

  parseCsv(text: string) {
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
    // heurystyka mapowania
    this.csvMapping = {};
    const lcHeaders = headers.map(h => h.toLowerCase());
    const tryFind = (cands: string[]) => {
      for (let i = 0; i < lcHeaders.length; i++) {
        if (cands.some(c => lcHeaders[i].includes(c))) return i;
      }
      return -1;
    };
    const candidates: Record<string, string[]> = {
      email: ['email', 'e-mail', 'adres', 'kontakt'],
      firstName: ['firstname', 'first name', 'imie', 'imię'],
      lastName: ['lastname', 'last name', 'nazwisko'],
      position: ['position', 'stanowisko'],
      externalId: ['externalid', 'id', 'employeeid', 'employee id']
    };
    for (const f of this.mappingFields) {
      const idx = tryFind(candidates[f] ?? []);
      if (idx >= 0) this.csvMapping[f] = idx;
    }
    this.importReport = null;
  }

  splitLine(line: string, delim: string) {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (!inQuotes && ch === delim) { res.push(cur); cur = ''; }
      else { cur += ch; }
    }
    res.push(cur);
    return res;
  }

  onDelimiterChange(event: Event) {
    const val = (event.target as HTMLSelectElement | null)?.value ?? ',';
    this.delimiter = val;
    if (this.lastCsvText) {
      this.parseCsv(this.lastCsvText);
    }
  }

  onDelimiterModelChange(value: string) {
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

  onMappingChange(field: string, event: Event) {
    const raw = (event.target as HTMLSelectElement | null)?.value ?? '';
    const idx = raw === '' ? -1 : +raw;
    if (idx === -1) delete this.csvMapping[field];
    else this.csvMapping[field] = idx;
  }

  performImport(save: boolean) {
    if (!this.csvPreview) return;
    const rows = this.csvPreview.rows;
    const errors: ImportErrorItem[] = [];
    const valid: Member[] = [];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const getField = (field: string) => {
        const idx = this.csvMapping[field];
        if (idx === undefined || idx < 0 || idx >= row.length) return '';
        return (row[idx] ?? '').trim();
      };
      const emailRaw = getField('email') || '';
      const email = emailRaw.trim().toLowerCase();
      const member: Member = {
        firstName: getField('firstName') || undefined,
        lastName: getField('lastName') || undefined,
        email,
        position: getField('position') || undefined,
        externalId: getField('externalId') || undefined,
        createdAt: new Date().toISOString(),
        importError: null
      };
      if (!email || !this.isValidEmail(email)) {
        errors.push({ email: email || '(brak)', importError: 'Nieprawidłowy e-mail' });
        continue;
      }
      if (this.isDuplicate(email) || valid.some(v => v.email === email)) {
        errors.push({ email, importError: 'Duplikat e-mail' });
        continue;
      }
      valid.push(member);
    }
    this.importReport = {
      total: rows.length,
      valid: valid.length,
      invalid: errors.length,
      errors
    };
    if (save && !this.dryRun) {
      for (const v of valid) {
        v.id = this.generateId();
        this.membersWorking.push(v);
      }
      this.csvPreview = null;
      this.csvFileName = null;
      this.csvMapping = {};
    }
  }

  // ---- helpers ----
  isValidEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
  }

  isDuplicate(email: string) {
    return this.membersWorking.some(m => m.email.toLowerCase() === email.toLowerCase());
  }

  generateId() { return Math.random().toString(36).slice(2, 9); }

  removeMember(id?: string) {
    if (!id) return;
    this.membersWorking = this.membersWorking.filter(m => m.id !== id);
  }

  get filteredMembers(): Member[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.membersWorking;
    return this.membersWorking.filter(m =>
      (m.firstName || '').toLowerCase().includes(q) ||
      (m.lastName || '').toLowerCase().includes(q) ||
      (m.position || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  }

  private resetCsvState() {
    this.csvFileName = null;
    this.csvPreview = null;
    this.csvMapping = {};
    this.importReport = null;
    this.dryRun = true;
  }
}
