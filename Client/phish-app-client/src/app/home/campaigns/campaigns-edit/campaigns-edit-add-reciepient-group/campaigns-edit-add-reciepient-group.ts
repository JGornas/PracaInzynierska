import { Component, OnInit } from '@angular/core';
import { GridComponent } from '../../../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../../../core/components/button-component/button-component';
import { CommonModule } from '@angular/common';
import { GridColumn } from '../../../../core/components/grid-component/grid-component.models';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedCampaignService } from '../../shared-campaigns.service';
import { Campaign } from '../../campaigns.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-campaigns-edit-add-reciepient-group',
  imports: [GridComponent, ButtonComponent, CommonModule],
  templateUrl: './campaigns-edit-add-reciepient-group.html',
  styleUrl: './campaigns-edit-add-reciepient-group.scss'
})
export class CampaignsEditAddReciepientGroup implements OnInit{

  
  campaign: Campaign = new Campaign();

  constructor(private route: ActivatedRoute,
    private router: Router,
    private sharedCampaignService: SharedCampaignService

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    const sharedCampaign = this.sharedCampaignService.getCurrentValue();

    if(sharedCampaign && sharedCampaign.id === Number(id)) {
      this.campaign = sharedCampaign;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie załadowano kampanii. Powrót do edycji kampanii.'
      });
      this.router.navigate([`/home/campaigns/${id}/edit`]);
    }
  }

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' }
  ];

  async save(): Promise<void> {
    // Implementation for saving recipient group
  }

  async cancel(): Promise<void> {
    // Implementation for saving recipient group
  }


}
