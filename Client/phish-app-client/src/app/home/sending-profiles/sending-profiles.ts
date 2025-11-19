import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { SendingProfilesService } from './sending-profiles.service';
import { SendingProfileDto, SendingProfilePayload } from './sending-profiles.models';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { SharedCampaignService } from '../campaigns/shared-campaigns.service';
import { SendingProfile } from '../campaigns/campaigns.models';



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
  imports: [CommonModule, ReactiveFormsModule, GridComponent, ButtonComponent]
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

  isSelectMode = false;

  readonly protocolOptions = ['SMTP'];
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private fb: FormBuilder,
    private profilesService: SendingProfilesService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedCampaignService: SharedCampaignService) {
    this.editForm = this.buildForm(false);
    this.createForm = this.buildForm(true);
    this.resetEditForm();
    this.resetCreateForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const selectMode = params['selectMode'] === 'true';
      const campaignId = params['campaignId'] ? Number(params['campaignId']) : null;

      if (selectMode && campaignId) {
        // ładuj kampanię z shared service
        this.sharedCampaignService.loadById(campaignId).then(() => {
          this.isSelectMode = true;
          // jeśli jest już wybrany sending profile -> preselect w gridzie
          const campaign = this.sharedCampaignService.getCurrentValue();
          if (campaign?.sendingProfile) {
            this.selectedProfileId = campaign.sendingProfile.id;
          }
        }).catch(err => {
          console.error('Błąd ładowania kampanii:', err);
          Swal.fire({
            icon: 'error',
            title: 'Błąd',
            text: 'Nie udało się załadować kampanii.'
          }).then(() => this.router.navigate(['/home/campaigns']));
        });
      } else {
        this.isSelectMode = false;
      }
    });

    // jeśli ktoś wcześniej zapisał kampanię w shared service - też ustaw select mode i preselect
    const pending = this.sharedCampaignService.getCurrentValue();
    if (pending) {
      this.isSelectMode = true;
      if (pending.sendingProfile) {
        this.selectedProfileId = pending.sendingProfile.id;
      }
    }

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
      replyTo: profile.replyTo ?? '',
      testEmail: profile.testEmail
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
    this.setSelectedRowId(row);

    if(!this.isSelectMode){
      if (this.selectedProfileId === null) {
        return;
      }
      else{
        this.openEditModalById(this.selectedProfileId);
      }
    }
    
    
  }
  handleClick(row: GridElement): void {
    this.setSelectedRowId(row);
  }

  private setSelectedRowId(row: GridElement): void {
    const id = Number(row['id']);
    if (!Number.isFinite(id)) {
      return;
    }

    this.selectedProfileId = id;
  }

  selectProfile(): void {
    if (this.selectedProfileId === null) {
      return;
    }

    const selectedDto = this.profiles.find(p => p.id === this.selectedProfileId);
    if (!selectedDto) {
      return;
    }

    const pendingCampaign = this.sharedCampaignService.getCurrentValue();
    if (pendingCampaign) {
      const sendingProfile = new SendingProfile();
      sendingProfile.id = selectedDto.id;
      sendingProfile.name = selectedDto.name;
      sendingProfile.protocol = selectedDto.protocol;
      sendingProfile.senderName = selectedDto.senderName;
      sendingProfile.senderEmail = selectedDto.senderEmail;
      sendingProfile.host = selectedDto.host;
      sendingProfile.port = selectedDto.port;
      sendingProfile.username = selectedDto.username;
      sendingProfile.useSsl = selectedDto.useSsl;
      sendingProfile.replyTo = selectedDto.replyTo ?? null;
      sendingProfile.testEmail = selectedDto.testEmail ?? null;
      sendingProfile.hasPassword = selectedDto.hasPassword;

      pendingCampaign.sendingProfile = sendingProfile;

      this.sharedCampaignService.setCurrent(pendingCampaign);
      console.log('Selected sending profile set in pending campaign:', pendingCampaign);

      this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
      return;
    }

    this.router.navigate(['/home/campaigns']);
  }

  sendTestEmail(row: GridElement, event: MouseEvent): void {
    const id = Number(row['id']);
    if (!Number.isFinite(id)) {
      Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nieprawidłowy identyfikator profilu.'
      });
      return;
    }

    this.profilesService.sendOneTimeEmail(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Wysłano',
          text: 'E-mail testowy został wysłany.'
        });
      },
      error: (err) => {
        const message =
          (err && (err.error?.message || err.message)) ||
          (typeof err === 'string' ? err : JSON.stringify(err));
        Swal.fire({
          icon: 'error',
          title: 'Nie udało się wysłać',
          text: String(message)
        });
      }
    });
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
      replyTo: formValue.replyTo?.trim() ? formValue.replyTo.trim() : null,
      testEmail: formValue.testEmail?.trim() ? formValue.testEmail.trim() : null // already handled
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
      replyTo: formValue.replyTo?.trim() ? formValue.replyTo.trim() : null,
      testEmail: formValue.testEmail?.trim() ? formValue.testEmail.trim() : null // include testEmail for update
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
      replyTo: ['', (control: AbstractControl) => this.optionalEmailValidator(control)],
      testEmail: ['', (control: AbstractControl) => this.optionalEmailValidator(control)] // added testEmail control
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
      replyTo: '',
      testEmail: '' // ensure testEmail is reset
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
      replyTo: '',
      testEmail: null
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
