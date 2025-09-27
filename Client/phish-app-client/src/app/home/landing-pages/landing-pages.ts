import { Component, ViewChild } from '@angular/core';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { LandingPagesService } from './landing-pages.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing-pages',
  imports: [GridComponent, ButtonComponent],
  templateUrl: './landing-pages.html',
  styleUrl: './landing-pages.scss'
})
export class LandingPages {
  @ViewChild(GridComponent) grid!: GridComponent;

  constructor(
    private landingPagesService: LandingPagesService,
    private router: Router,
    private route: ActivatedRoute) {}

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' }
  ];

  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });
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

    if (!result.isConfirmed) {
      return; // użytkownik anulował
    }

    try {
      // Wywołanie metody deleteLandingPage z serwisu
      await firstValueFrom(this.landingPagesService.deleteLandingPage(selected['id']));

      await Swal.fire({
        icon: 'success',
        title: 'Usunięto',
        text: 'Strona docelowa została pomyślnie usunięta.'
      });

      // Odświeżenie grida
      this.grid.loadRemoteData(true);

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: error?.message || 'Nie udało się usunąć strony docelowej.'
      });
    }
  }

}
