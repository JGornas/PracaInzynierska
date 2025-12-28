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
import { SharedQuizzesService } from '../quizzes/shared-quizzes.service';

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

  isSelectModeFromCampaign: boolean = false;
  isSelectModeFromQuizz: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private templateService: TemplatesService,
    private sharedCampaignService: SharedCampaignService,
    private sharedQuizzService: SharedQuizzesService,
  )
  {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const selectMode = params['selectMode'] === 'true';

      const campaignId = params['campaignId'] !== undefined
        ? Number(params['campaignId'])
        : null;

      const quizzId = params['quizSendingId'] !== undefined
        ? Number(params['quizSendingId'])
        : null;

      if (!selectMode) {
        this.isSelectMode = false;
        return;
      }

      this.isSelectMode = true;

      if (campaignId !== null) {
        const campaign = this.sharedCampaignService.getCurrentValue();

        if (!campaign || campaign.id !== campaignId) {
          this.router.navigate(['/home/campaigns']);
          return;
        }

        this.isSelectModeFromCampaign = true;
        this.isSelectModeFromQuizz = false;

        if (campaign.template) {
          this.selectedTemplateId = campaign.template.id;
        }

        return;
      }

      if (quizzId !== null) {
        const quizz = this.sharedQuizzService.getCurrentValue();

        if (!quizz || quizz.id !== quizzId) {
          this.router.navigate(['/home/quizzes']);
          return;
        }

        this.isSelectModeFromCampaign = false;
        this.isSelectModeFromQuizz = true;

        if (quizz.template) {
          this.selectedTemplateId = quizz.template.id;
        }

        return;
      }

      this.router.navigate(['/home']);
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

  cancelTemplateSelection(): void {
    if (this.isSelectModeFromCampaign) {
      const pendingCampaign = this.sharedCampaignService.getCurrentValue();
      if (pendingCampaign) {
        this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
      }
      return;
    }

    if (this.isSelectModeFromQuizz) {
      this.router.navigate(['/home/quizzes/send']);
      return;
    }

    this.router.navigate(['/home']);
  }

  selectTemplate(): void {
    if (this.selectedTemplateId === null) {
      return;
    }

    this.templateService.getTemplate(this.selectedTemplateId).subscribe({
      next: (template) => {

        if (this.isSelectModeFromCampaign) {
          const pendingCampaign = this.sharedCampaignService.getCurrentValue();
          if (pendingCampaign) {
            pendingCampaign.template = template;
            this.sharedCampaignService.setCurrent(pendingCampaign);

            this.router.navigate([`/home/campaigns/${pendingCampaign.id}/edit`]);
            return;
          }
        }

        if (this.isSelectModeFromQuizz) {
          const quizzInfo = this.sharedQuizzService.getCurrentValue();
          if (quizzInfo) {
            quizzInfo.template = template;
            this.sharedQuizzService.setCurrent(quizzInfo);

            this.router.navigate(['/home/quizzes/send']);
            return;
          }
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
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
