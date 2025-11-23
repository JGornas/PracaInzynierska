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

    // subskrybuj zmiany z shared service (np. gdy wrócisz z wyboru sending profile)
    this._sharedSub = this.sharedCampaignService.current$.subscribe(c => {
      if (!c) return;
      if (c.id === this.campaign.id) {
        this.campaign = c;
      }
    });

    console.log('CampaignsEdit initialized, campaign=', this.campaign);
  }

  ngOnDestroy() {
    this._sharedSub?.unsubscribe();
  }

  private async loadCampaign(id: number) {
    try {
      const camp = await firstValueFrom(this.campaignService.getCampaign(id));
      if (!camp) {
        throw new Error('Brak kampanii o podanym ID');
      }

      this.campaign = camp;

      if (this.campaign.startDateTime && typeof this.campaign.startDateTime === 'string') {
        const d = new Date(this.campaign.startDateTime as any);
        this.campaign.startDateTime = isNaN(d.getTime()) ? null : d;
      }

      this.sharedCampaignService.setCurrent(this.campaign);

    } catch (error) {
      console.error('Błąd pobierania kampanii:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie udało się wczytać kampanii.'
      });
      await this.router.navigate(['/home/campaigns']);
    }
  }

  public get startedAtLocal(): string | null {
    const v = this.campaign.startDateTime;
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
      this.campaign.startDateTime = null;
      return;
    }
    const d = new Date(val);
    this.campaign.startDateTime = isNaN(d.getTime()) ? null : d;
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

  public selectSendingProfile(): void {
    this.sharedCampaignService.setCurrent(this.campaign);
    this.router.navigate(['/home/sending-profiles'], {
      queryParams: { selectMode: 'true', campaignId: this.campaign.id }
    });
  }

  public selectTemplate(): void {
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

  public async save() {
  }

  public async cancel() {
    await this.router.navigate(['/home/campaigns']);
  }
}
