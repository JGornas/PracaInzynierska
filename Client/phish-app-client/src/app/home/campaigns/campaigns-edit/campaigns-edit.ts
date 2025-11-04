import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign } from '../campaigns.models';
import { CampaignsService } from '../campaigns.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-campaigns-edit',
  imports: [],
  templateUrl: './campaigns-edit.html',
  styleUrl: './campaigns-edit.scss'
})
export class CampaignsEdit {
  isEditMode: boolean = false;
  campaign: Campaign = new Campaign();

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private campaignService: CampaignsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      this.loadCampaign(id);
    }
  }

  private async loadCampaign(id: string | null) {
    if (!id) return;

    try {
      const campaignId = Number(id);
      if (isNaN(campaignId)) throw new Error('Nieprawidłowe ID kampanii');

      this.campaign = await firstValueFrom(this.campaignService.getCampaign(campaignId));
      console.log('Pobrana kampania:', this.campaign);
    } catch (error) {
      console.error('Błąd pobierania kampanii:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie istnieje kampania o podanym ID.'
      });

      await this.router.navigate(['home/campaigns']);
    }
  }
}
