import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign, SendingProfile } from '../campaigns.models';
import { CampaignsService } from '../campaigns.service';
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SharedCampaignService } from '../shared-campaigns.service';
import { GridComponent } from '../../../core/components/grid-component/grid-component';

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
    GridComponent
  ],
  templateUrl: './campaigns-edit.html',
  styleUrl: './campaigns-edit.scss'
})
export class CampaignsEdit implements OnInit, OnDestroy {
  isEditMode: boolean = false;
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
        
      } else {
        this.loadCampaign(campaignId);
      }
    }
    else{
      this.sharedCampaignService.setCurrent(this.campaign);
    }

    // subskrybuj zmiany z shared service (np. gdy wrócisz z wyboru sending profile)
    this._sharedSub = this.sharedCampaignService.current$.subscribe(c => {
      if (!c) return;
      if (c.id === this.campaign.id) {
        this.campaign = c;
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

  private async loadCampaign(id: number) {
    try {
      const camp = await firstValueFrom(this.campaignService.getCampaign(id));
      if (!camp) {
        throw new Error('Brak kampanii o podanym ID');
      }

      this.campaign = camp;

      if (this.campaign.sendTime && typeof this.campaign.sendTime === 'string') {
        const d = new Date(this.campaign.sendTime as any);
        this.campaign.sendTime = isNaN(d.getTime()) ? null : d;
      }

      console.log('Wczytana kampania:', this.campaign);

      this.sharedCampaignService.setCurrent(this.campaign);

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie udało się wczytać kampanii.'
      });
      await this.router.navigate(['/home/campaigns']);
    }
  }

  public get startedAtLocal(): string | null {
    const v = this.campaign.sendTime;
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v as any);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  public set startedAtLocal(val: string | null) {
    if (!val) {
      this.campaign.sendTime = null;
      return;
    }
    const d = new Date(val);
    this.campaign.sendTime = isNaN(d.getTime()) ? null : d;
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
    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/sending-profiles'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public selectTemplate(): void {
    console.log('Przed przejsciem do szablonow', this.campaign);
    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/templates'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public selectLandingPage(): void {
    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/landing-pages'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public addRecipientGroup(): void {    
    this.sharedCampaignService.setCurrent(this.campaign);
    console.log('Dodawanie grupy, kampania=', this.campaign);
    this.router.navigate([`/home/campaigns/${this.campaign.id}/edit/addReciepientGroup`]);

  }

  handleRecipientGroupClick(row: any): void {
    
  }

  public handleRecipientGroupRemoved(row: any): void {
    const groupId = row['id'];
    this.campaign.campaignRecipientGroups = this.campaign.campaignRecipientGroups.filter(g => g.id !== groupId);
  }


  public async save(): Promise<void> {
    console.log('Zapisywana kampania:', this.campaign);

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
