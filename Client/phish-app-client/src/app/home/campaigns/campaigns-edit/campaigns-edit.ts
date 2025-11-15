import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign } from '../campaigns.models';
import { CampaignsService } from '../campaigns.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-campaigns-edit',
  standalone: true,
  imports: [
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './campaigns-edit.html',
  styleUrl: './campaigns-edit.scss'
})
export class CampaignsEdit {
  isEditMode: boolean = false;
  campaign: Campaign = new Campaign();

  @ViewChild('datetimeInput', { static: false }) datetimeInput?: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private campaignService: CampaignsService
  ) {}

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
    this.router.navigate(['/home/sending-profiles']);
  }

  public async save() {
   
  }

  public async cancel() {
    
  }
}
