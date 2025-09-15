import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
  templateUrl: './recipients.html',
  styleUrls: ['./recipients.scss']
})
export class Recipients {
  // data
  members: Member[] = [];
  selectedGroupName = 'Domyślna grupa';

  // UI state
  showAddMember = false;
  showCsvImport = false;
  search = '';

  // form
  memberForm: FormGroup;

  // CSV import state
  csvFileName: string | null = null;
  delimiter = ','; // aktualny delimiter
  csvPreview: CsvPreview | null = null;
  csvMapping: Record<string, number> = {}; // e.g. { email: 0, firstName: 1 }
  mappingFields = ['email', 'firstName', 'lastName', 'position', 'externalId'];

  // import report
  dryRun = true;
  importReport: ImportReport | null = null;

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      position: ['']
    });
  }

  // ---- Add member ----
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

    this.members.push(newMember);
    this.toggleAddMember();
  }

  // ---- CSV file selection and parsing ----
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.csvFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.parseCsv(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  parseCsv(text: string) {
    // simple CSV parsing (handles quoted values minimally)
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

    // prefill mapping heuristics
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
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && ch === delim) {
        res.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    res.push(cur);
    return res;
  }

  // ---- handlers called from template (avoid casting in template) ----
  onDelimiterChange(event: Event) {
    const val = (event.target as HTMLSelectElement | null)?.value ?? ',';
    this.delimiter = val;
    // if file already loaded, require reupload for simplicity
    if (this.csvFileName && this.csvPreview) {
      this.csvPreview = null;
      this.csvFileName = null;
      this.csvMapping = {};
      this.importReport = null;
    }
  }

  onMappingChange(field: string, event: Event) {
    const raw = (event.target as HTMLSelectElement | null)?.value ?? '';
    const idx = raw === '' ? -1 : +raw;
    if (idx === -1) {
      delete this.csvMapping[field];
    } else {
      this.csvMapping[field] = idx;
    }
  }

  // ---- import processing ----
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
        this.members.push(v);
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
    return this.members.some(m => m.email.toLowerCase() === email.toLowerCase());
  }

  generateId() {
    return Math.random().toString(36).slice(2, 9);
  }

  // ---- NEW: removeMember (was missing) ----
  removeMember(id?: string) {
    if (!id) return;
    this.members = this.members.filter(m => m.id !== id);
  }

  assignGroupToCampaign() {
    alert(`Grupa "${this.selectedGroupName}" przypisana do kampanii (UI only).`);
  }

  // ---- UI helpers ----
  get filteredMembers(): Member[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.members;
    return this.members.filter(m =>
      (m.firstName || '').toLowerCase().includes(q) ||
      (m.lastName || '').toLowerCase().includes(q) ||
      (m.position || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  }
}
