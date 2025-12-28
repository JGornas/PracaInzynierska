import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign } from '../campaigns.models';
import { CampaignsService } from '../campaigns.service';
import { firstValueFrom, min, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SharedCampaignService } from '../shared-campaigns.service';
import { GridComponent } from '../../../core/components/grid-component/grid-component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaigns-edit',
  standalone: true,
  imports: [
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    GridComponent,
    CommonModule
  ],
  templateUrl: './campaigns-edit.html',
  styleUrl: './campaigns-edit.scss'
})
export class CampaignsEdit implements OnInit, OnDestroy {
  isEditMode: boolean = false;
  canEdit: boolean = true;
  campaign: Campaign = new Campaign();
  private _sharedSub?: Subscription;

  @ViewChild('datetimeInput', { static: false }) datetimeInput?: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private campaignService: CampaignsService,
    private sharedCampaignService: SharedCampaignService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      const campaignId = Number(id);
      
      const sharedCampaign = this.sharedCampaignService.getCurrentValue();

      if (sharedCampaign && sharedCampaign.id === campaignId) {
        this.campaign = sharedCampaign;

        this.canEdit = !this.campaign.isSentSuccessfully;

      } else {
        this.loadCampaign(campaignId);
      }

    } else {
      this.campaign = new Campaign();
      this.sharedCampaignService.setCurrent(this.campaign);

      this.canEdit = true;
    }

    this._sharedSub = this.sharedCampaignService.current$.subscribe(c => {
      if (!c) return;
      if (c.id === this.campaign.id) {
        this.campaign = c;
        this.canEdit = !this.campaign.isSentSuccessfully;
      }
    });
  }


  ngOnDestroy() {
    this._sharedSub?.unsubscribe();
  }


  recipientGroupColumns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Grupa' },
    { field: 'membersCount', label: 'Członków' }
  ];

  public get minDateTime(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());


    return `${year}-${month}-${day}T${hour}:${minute}`;
  }


  public onDateTimeChange(val: string | null): void {
    if (!val) return;

    const chosen = new Date(val);
    const now = new Date();

    // jeśli wybrano przeszły czas → wymuś minDateTime
    if (chosen < now) {
      const corrected = this.minDateTime;
      this.campaign.sendTime = corrected;

      // nadpisanie INPUTA — to rozwiązuje problem widoku
      setTimeout(() => {
        if (this.datetimeInput?.nativeElement) {
          this.datetimeInput.nativeElement.value = corrected;
        }
      });
    }
  }



  private async loadCampaign(id: number) {
    try {
      const camp = await firstValueFrom(this.campaignService.getCampaign(id));
      if (!camp) throw new Error('Brak kampanii o podanym ID');

      this.campaign = camp;
      
      this.sharedCampaignService.setCurrent(this.campaign);

    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie udało się wczytać kampanii.'
      });

      await this.router.navigate(['/home/campaigns']);
    }
  }


  public get startedAtLocal(): string | null {
    return this.campaign.sendTime ?? null; 
  }

  public set startedAtLocal(val: string | null) {
    if (!val) {
      this.campaign.sendTime = null;
      return;
    }

    const chosen = new Date(val);
    const now = new Date();

    if (chosen < now) {
      this.campaign.sendTime = this.minDateTime;
    } else {
      this.campaign.sendTime = val;
    }
  }


  public openDateTimePicker(): void {
    const el = this.datetimeInput?.nativeElement;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      (el as any).showPicker();
    } else {
      el.focus();
    }
  }

  public get sendingProfileName(): string {
    return this.campaign.sendingProfile?.name || 'Wybierz profil wysyłki';
  }

  public get templateName(): string {
    return this.campaign.template?.name || 'Wybierz szablon';
  }

  public get landingPageName(): string {
    return this.campaign.landingPage?.name || 'Wybierz stronę docelową';
  }


  public selectSendingProfile(): void {
    if(!this.canEdit) return;

    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/sending-profiles'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public selectTemplate(): void {
    if(!this.canEdit) return;
    
    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/templates'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public selectLandingPage(): void {
    if(!this.canEdit) return;

    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/landing-pages'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public addRecipientGroup(): void {  
    if(!this.canEdit) return;

    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate([`/home/campaigns/${this.campaign.id}/edit/addReciepientGroup`]);

  }

  handleRecipientGroupClick(row: any): void {
    
  }

  public handleRecipientGroupRemoved(row: any): void {
    const groupId = row['id'];
    this.campaign.campaignRecipientGroups = this.campaign.campaignRecipientGroups.filter(g => g.id !== groupId);
  }


  public async save(): Promise<void> {

    if (!this.campaign.campaignRecipientGroups?.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak grup odbiorców',
        text: 'Kampania musi mieć przypisaną przynajmniej jedną grupę odbiorców.'
      });
      return;
    }

    if (!this.campaign.template) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak szablonu',
        text: 'Kampania musi mieć przypisany szablon.'
      });
      return;
    }

    if (!this.campaign.sendingProfile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak profilu wysyłki',
        text: 'Kampania musi mieć przypisany profil wysyłki.'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Zapisz zmiany?',
      text: 'Czy na pewno chcesz zapisać zmiany w kampanii?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tak, zapisz',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const updatedCampaign = await firstValueFrom(
        this.campaignService.updateCampaign(this.campaign)
      );

      this.campaign = updatedCampaign;

      await Swal.fire({
        icon: 'success',
        title: 'Zapisano',
        text: 'Kampania została zapisana pomyślnie.'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd zapisu',
        text: error?.message || 'Nie udało się zapisać kampanii.'
      });
    }
  }

  public async cancel(): Promise<void> {
    const result = await Swal.fire({
      title: 'Czy na pewno chcesz anulować?',
      text: 'Wprowadzone zmiany nie zostaną zapisane.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, anuluj',
      cancelButtonText: 'Nie, wróć'
    });

    if (result.isConfirmed) {
      await this.router.navigate(['/home/campaigns']);
    }
  }

}
