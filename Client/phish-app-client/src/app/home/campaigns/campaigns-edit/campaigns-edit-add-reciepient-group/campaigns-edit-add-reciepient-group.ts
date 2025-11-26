import { Component, OnInit } from '@angular/core';
import { GridComponent } from '../../../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../../../core/components/button-component/button-component';
import { CommonModule } from '@angular/common';
import { GridColumn, GridElement } from '../../../../core/components/grid-component/grid-component.models';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedCampaignService } from '../../shared-campaigns.service';
import { Campaign, RecipientGroup } from '../../campaigns.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-campaigns-edit-add-reciepient-group',
  imports: [GridComponent, ButtonComponent, CommonModule],
  templateUrl: './campaigns-edit-add-reciepient-group.html',
  styleUrl: './campaigns-edit-add-reciepient-group.scss'
})
export class CampaignsEditAddReciepientGroup implements OnInit{

  
  campaign: Campaign = new Campaign();
  selectedGroups: GridElement[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private sharedCampaignService: SharedCampaignService

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    const sharedCampaign = this.sharedCampaignService.getCurrentValue();
    console.log('📌 Loaded shared campaign for adding recipient group:', sharedCampaign);
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

  onGroupsSelected(selected: GridElement[]) {
    this.selectedGroups = selected;
    console.log('Zaznaczone:', selected);
  }

  async save(): Promise<void> {
    if (!this.campaign) {
      return;
    }

    if (!this.campaign.campaignRecipientGroups) {
      this.campaign.campaignRecipientGroups = [];
    }

    const existingIds = this.campaign.campaignRecipientGroups.map(g => g.id);

    const groupsToAdd = this.selectedGroups
      .filter(g => !existingIds.includes(g['id']))
      .map(g => {
        const newGroup = new RecipientGroup();
        newGroup.id = g['id'];
        newGroup.name = g['name'];
        return newGroup;
      });

    this.campaign.campaignRecipientGroups.push(...groupsToAdd);

    this.sharedCampaignService.setCurrent(this.campaign);

    await this.router.navigate([`/home/campaigns/${this.campaign.id}/edit`]);
  }




  async cancel(): Promise<void> {
    // Implementation for saving recipient group
  }
  

}
