import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { SendingProfilesService } from './sending-profiles.service';
import { SendingProfileDto, SendingProfilePayload } from './sending-profiles.models';

interface SendingProfileGridRow extends GridElement {
  id: number;
  name: string;
  senderDisplay: string;
  hostDisplay: string;
  username: string;
  useSslLabel: string;
}

@Component({
  selector: 'app-sending-profiles',
  standalone: true,
  templateUrl: './sending-profiles.html',
  styleUrls: ['./sending-profiles.scss'],
  imports: [CommonModule, ReactiveFormsModule, GridComponent]
})
export class SendingProfiles implements OnInit {
  profiles: SendingProfileDto[] = [];
  gridRows: SendingProfileGridRow[] = [];
  columns: GridColumn[] = [
    { field: 'name', label: 'Nazwa' },
    { field: 'senderDisplay', label: 'Nadawca' },
    { field: 'hostDisplay', label: 'Serwer' },
    { field: 'username', label: 'Uzytkownik' },
    { field: 'useSslLabel', label: 'Szyfrowanie' }
  ];

  editForm: FormGroup;
  createForm: FormGroup;

  showCreateModal = false;
  showEditModal = false;

  selectedProfileId: number | null = null;

  isLoading = false;
  isSaving = false;
  isCreating = false;
  isDeletingId: number | null = null;

  readonly protocolOptions = ['SMTP'];
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private fb: FormBuilder, private profilesService: SendingProfilesService) {
    this.editForm = this.buildForm(false);
    this.createForm = this.buildForm(true);
    this.resetEditForm();
    this.resetCreateForm();
  }

  ngOnInit(): void {
    this.loadProfiles();
  }

  openCreateModal(): void {
    this.resetCreateForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.isCreating) {
      return;
    }
    this.showCreateModal = false;
  }

  openEditModalById(id: number): void {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) {
      return;
    }
    this.selectedProfileId = profile.id;
    this.editForm.reset({
      name: profile.name,
      protocol: profile.protocol,
      senderName: profile.senderName,
      senderEmail: profile.senderEmail,
      host: profile.host,
      port: profile.port,
      username: profile.username,
      password: '',
      useSsl: profile.useSsl,
      replyTo: profile.replyTo ?? ''
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (this.isSaving) {
      return;
    }
    this.showEditModal = false;
    this.resetEditForm();
  }

  handleRowDoubleClick(row: GridElement): void {
    const id = Number(row['id']);
    if (!Number.isFinite(id)) {
      return;
    }
    this.openEditModalById(id);
  }

  openEditFromActions(row: GridElement, event: MouseEvent): void {
    event.stopPropagation();
    this.handleRowDoubleClick(row);
  }

  handleRowRemoved(row: GridElement): void {
    const id = Number(row['id']);
    if (!Number.isFinite(id)) {
      return;
    }
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) {
      return;
    }
    if (!confirm(`Usunac profil "${profile.name}"?`)) {
      return;
    }
    this.isDeletingId = id;
    this.profilesService.deleteProfile(id).subscribe({
      next: () => {
        this.isDeletingId = null;
        this.profiles = this.profiles.filter(p => p.id !== id);
        this.updateGridRows();
        if (this.selectedProfileId === id) {
          this.closeEditModal();
        }
      },
      error: err => {
        this.isDeletingId = null;
        this.handleError(err);
      }
    });
  }

  createProfile(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    const payload: SendingProfilePayload = {
      name: formValue.name?.trim() ?? '',
      protocol: formValue.protocol ?? 'SMTP',
      senderName: (formValue.senderName ?? '').trim(),
      senderEmail: (formValue.senderEmail ?? '').trim().toLowerCase(),
      host: formValue.host?.trim() ?? '',
      port: Number(formValue.port) || 0,
      username: formValue.username?.trim() ?? '',
      password: (formValue.password ?? '').trim(),
      useSsl: !!formValue.useSsl,
      replyTo: formValue.replyTo?.trim() ? formValue.replyTo.trim() : null
    };

    this.isCreating = true;
    this.profilesService.createProfile(payload).subscribe({
      next: created => {
        this.isCreating = false;
        this.showCreateModal = false;
        this.resetCreateForm();
        this.profiles.push(created);
        this.updateGridRows();
        this.openEditModalById(created.id);
      },
      error: err => {
        this.isCreating = false;
        this.handleError(err);
      }
    });
  }

  saveEdit(): void {
    if (this.selectedProfileId === null) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;
    const payload: SendingProfilePayload = {
      name: formValue.name?.trim() ?? '',
      protocol: formValue.protocol ?? 'SMTP',
      senderName: (formValue.senderName ?? '').trim(),
      senderEmail: (formValue.senderEmail ?? '').trim().toLowerCase(),
      host: formValue.host?.trim() ?? '',
      port: Number(formValue.port) || 0,
      username: formValue.username?.trim() ?? '',
      useSsl: !!formValue.useSsl,
      replyTo: formValue.replyTo?.trim() ? formValue.replyTo.trim() : null
    };

    const passwordRaw = (formValue.password ?? '').trim();
    if (passwordRaw.length > 0) {
      payload.password = passwordRaw;
    }

    this.isSaving = true;
    this.profilesService.updateProfile(this.selectedProfileId, payload).subscribe({
      next: updated => {
        this.isSaving = false;
        const index = this.profiles.findIndex(p => p.id === updated.id);
        if (index >= 0) {
          this.profiles[index] = updated;
        }
        this.updateGridRows();
        this.closeEditModal();
      },
      error: err => {
        this.isSaving = false;
        this.handleError(err);
      }
    });
  }

  formatSender(profile: SendingProfileDto): string {
    return `${profile.senderName} <${profile.senderEmail}>`;
  }

  formatTransport(profile: SendingProfileDto): string {
    return `${profile.protocol} ${profile.host}:${profile.port}`;
  }

  private loadProfiles(): void {
    this.isLoading = true;
    this.profilesService.getProfiles().subscribe({
      next: profiles => {
        this.profiles = profiles;
        this.isLoading = false;
        this.updateGridRows();
        this.refreshEditState();
      },
      error: err => {
        this.isLoading = false;
        this.handleError(err);
      }
    });
  }

  private buildForm(passwordRequired: boolean): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      protocol: ['SMTP', Validators.required],
      senderName: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      username: ['', Validators.required],
      password: ['', passwordRequired ? [Validators.required] : []],
      useSsl: [true],
      replyTo: ['', (control: AbstractControl) => this.optionalEmailValidator(control)]
    });
  }

  private resetEditForm(): void {
    this.selectedProfileId = null;
    this.editForm.reset({
      name: '',
      protocol: 'SMTP',
      senderName: '',
      senderEmail: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      useSsl: true,
      replyTo: ''
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }

  private resetCreateForm(): void {
    this.createForm.reset({
      name: '',
      protocol: 'SMTP',
      senderName: '',
      senderEmail: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      useSsl: true,
      replyTo: ''
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }

  private refreshEditState(): void {
    if (this.selectedProfileId === null) {
      return;
    }
    const profile = this.profiles.find(p => p.id === this.selectedProfileId);
    if (!profile) {
      this.closeEditModal();
      return;
    }
    if (this.showEditModal) {
      this.openEditModalById(profile.id);
    }
  }

  private updateGridRows(): void {
    this.gridRows = this.profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      senderDisplay: this.formatSender(profile),
      hostDisplay: this.formatTransport(profile),
      username: profile.username,
      useSslLabel: profile.useSsl ? 'TLS/SSL' : 'Brak'
    }));
  }

  private optionalEmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '').trim();
    if (!value) {
      return null;
    }
    return this.emailRegex.test(value.toLowerCase()) ? null : { email: true };
  }

  private handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Wystapil nieznany blad.';
    alert(message);
  }
}
