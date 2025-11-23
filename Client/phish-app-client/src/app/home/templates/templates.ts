import { Component, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TemplatesService } from './templates.service';
import { SharedCampaignService } from '../campaigns/shared-campaigns.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-templates',
  imports: [GridComponent, ButtonComponent, CommonModule],
  templateUrl: './templates.html',
  styleUrl: './templates.scss'
})
export class Templates implements OnInit {

   @ViewChild(GridComponent) grid!: GridComponent;
  isSelectMode: boolean = false;
  selectedProfileId: number | null = null;
  selectedTemplateId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private templateService: TemplatesService,
    private sharedCampaignService: SharedCampaignService
  )
  {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const selectMode = params['selectMode'] === 'true';
      const campaignId = params['campaignId'] ? Number(params['campaignId']) : null;

      console.log('Query Params:', selectMode, campaignId);

      if (selectMode && campaignId) {
        this.sharedCampaignService.loadById(campaignId).then(() => {
        this.isSelectMode = true;
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

    
  }

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' },
    { field: 'subject', label: 'Tytuł' }
  ];


  async createTemplate(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    this.setSelectedRowId(selected);

    if (!this.isSelectMode) {
      if (this.selectedTemplateId === null) {
        return;
      } else {
        await this.router.navigate([this.selectedTemplateId, 'edit'], { relativeTo: this.route });
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

    this.selectedTemplateId = id;
  }

  selectTemplate(): void {
    if (this.selectedTemplateId === null) {
      return;
    }

    // pobierz template z serwisu
    this.templateService.getTemplate(this.selectedTemplateId).subscribe({
      next: (template) => {
        const pendingCampaign = this.sharedCampaignService.getCurrentValue();
        if (pendingCampaign) {
          // przypisz wybrany template do kampanii
          pendingCampaign.template = template;

          // zaktualizuj w shared service
          this.sharedCampaignService.setCurrent(pendingCampaign);
          console.log('Selected template set in pending campaign:', pendingCampaign);

          // nawiguj z powrotem do edycji kampanii
          this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
          return;
        }

        // fallback
        this.router.navigate(['/home/campaigns']);
      },
      error: (err) => {
        console.error('Błąd pobierania szablonu:', err);
        Swal.fire({
          icon: 'error',
          title: 'Błąd',
          text: 'Nie udało się pobrać szablonu.'
        });
      }
    });
  }


  async handleRowDeleted(selected: GridElement) {
    const result = await Swal.fire({
      title: 'Usunąć szablon?',
      text: `Czy na pewno chcesz usunąć szablon ${selected['name']}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, usuń',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await firstValueFrom(this.templateService.deleteTemplate(selected['id']));

      await Swal.fire({
        icon: 'success',
        title: 'Usunięto',
        text: 'Szablon został pomyślnie usunięty.'
      });

      this.grid.loadRemoteData(true);

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: error?.message || 'Nie udało się usunąć szablonu.'
      });
    }
  }


}
