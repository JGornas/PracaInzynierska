import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { LandingPagesService } from './landing-pages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedCampaignService } from '../campaigns/shared-campaigns.service';

@Component({
  selector: 'app-landing-pages',
  imports: [GridComponent, ButtonComponent, CommonModule],
  templateUrl: './landing-pages.html',
  styleUrl: './landing-pages.scss'
})
export class LandingPages implements OnInit {
  @ViewChild(GridComponent) grid!: GridComponent;

  isSelectMode: boolean = false;
  selectedLandingPageId: number | null = null;

  constructor(
    private landingPagesService: LandingPagesService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedCampaignService: SharedCampaignService
  ) {}

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' }
  ];

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      const selectMode = params['selectMode'] === 'true';
      const campaignId = params['campaignId'] !== undefined ? Number(params['campaignId']) : null;

      if (selectMode) {
        const campaign = this.sharedCampaignService.getCurrentValue();

        if (!campaign || campaign.id !== campaignId) {
          this.router.navigate(['/home/campaigns']);
          return;
        }

        this.isSelectMode = true;

        if (campaign.landingPage) {
          this.selectedLandingPageId = campaign.landingPage.id;
        }
      } else {
        this.isSelectMode = false;
      }
    });
  }



  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    this.setSelectedRowId(selected);
    if(!this.isSelectMode) {
      if(this.selectedLandingPageId === null) return;
      else{
        await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });
      }
    
    }

  }

  handleRowClick(row: GridElement): void {
    this.setSelectedRowId(row);
  }

  private setSelectedRowId(row: GridElement): void {
    const id = Number(row['id']);
    if (!Number.isFinite(id)) {
      return;
    }
    this.selectedLandingPageId = id;
  }


  cancelLandingPageSelection(): void {
    const pendingCampaign = this.sharedCampaignService.getCurrentValue();
    if (pendingCampaign) {
      this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
    }
  }

  selectLandingPage(): void {
    if (this.selectedLandingPageId === null) return;

    this.landingPagesService.getLandingPage(this.selectedLandingPageId).subscribe({
      next: (landing) => {
        const pendingCampaign = this.sharedCampaignService.getCurrentValue();
        if (pendingCampaign) {
          pendingCampaign.landingPage = landing;
          this.sharedCampaignService.setCurrent(pendingCampaign);
          this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
          return;
        }
        this.router.navigate(['/home/campaigns']);
      },
      error: (err) => {
        console.error('Błąd pobierania landing page:', err);
        Swal.fire({
          icon: 'error',
          title: 'Błąd',
          text: 'Nie udało się pobrać strony docelowej.'
        });
      }
    });
  }

  async createLandingPage(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async handleRowDeleted(selected: GridElement) {
    const result = await Swal.fire({
      title: 'Usunąć stronę docelową?',
      text: `Czy na pewno chcesz usunąć stronę docelową ${selected['name']}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, usuń',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) return;

    try {
      await firstValueFrom(this.landingPagesService.deleteLandingPage(selected['id']));
      await Swal.fire({ icon: 'success', title: 'Usunięto', text: 'Strona docelowa została pomyślnie usunięta.' });
      this.grid.loadRemoteData(true);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Błąd', text: error?.message || 'Nie udało się usunąć strony docelowej.' });
    }
  }
}
