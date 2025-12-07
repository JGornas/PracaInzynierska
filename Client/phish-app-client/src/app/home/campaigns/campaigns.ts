import { Component, ViewChild } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { CampaignsService } from './campaigns.service';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [GridComponent, ButtonComponent],
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.scss'
})
export class Campaigns {
  @ViewChild(GridComponent) grid!: GridComponent;

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'description', label: 'Opis' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private campaignsService: CampaignsService // added service
  ) {}

  async createCampaign(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });
  }

  async handleRowDeleted(selected: GridElement) {
    const name = selected['name'] ?? 'kampanię';
    const result = await Swal.fire({
      title: 'Usunąć kampanię?',
      text: `Czy na pewno chcesz usunąć kampanię ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, usuń',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) {
      return;
    }

    const id = Number(selected['id']);
    if (!Number.isFinite(id)) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nieprawidłowy identyfikator kampanii.'
      });
      return;
    }

    try {
      await firstValueFrom(this.campaignsService.deleteCampaign(id));

      await Swal.fire({
        icon: 'success',
        title: 'Usunięto',
        text: 'Kampania została pomyślnie usunięta.'
      });

      // odśwież grid
      this.grid.loadRemoteData(true);

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: error?.message || 'Nie udało się usunąć kampanii.'
      });
    }
  }
}