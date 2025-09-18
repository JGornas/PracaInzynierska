import { Component } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-templates',
  imports: [GridComponent, ButtonComponent],
  templateUrl: './templates.html',
  styleUrl: './templates.scss'
})
export class Templates {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  )
  {}

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' },
    { field: 'subject', label: 'Tytuł' }
  ];


  async createTemplate(): Promise<void> {
    console.log('stworzono nowy');
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  handleRowDoubleClick(selected: GridElement) {
    console.log('Double clicked row:', selected);
    // Tutaj możesz wykonać dowolną logikę
  }

  handleRowDeleted(selected: GridElement) {
    console.log('Usunieto wiersz o id ', selected['id'])
  }

}
