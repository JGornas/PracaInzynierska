import { Component, ViewChild } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TemplatesService } from './templates.service';

@Component({
  selector: 'app-templates',
  imports: [GridComponent, ButtonComponent],
  templateUrl: './templates.html',
  styleUrl: './templates.scss'
})
export class Templates {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private templateService: TemplatesService
  )
  {}

   @ViewChild(GridComponent) grid!: GridComponent;

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' },
    { field: 'subject', label: 'Tytuł' }
  ];


  async createTemplate(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });
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
      return; // użytkownik anulował
    }

    try {
      // Wywołanie metody deleteTemplate z serwisu
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
