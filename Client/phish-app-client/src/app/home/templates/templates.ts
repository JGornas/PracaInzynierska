import { Component } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';

@Component({
  selector: 'app-templates',
  imports: [GridComponent],
  templateUrl: './templates.html',
  styleUrl: './templates.scss'
})
export class Templates {
  // columns = ['id', 'title', 'body'];

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' },
    { field: 'subject', label: 'Tytuł' }
  ];

  localColumns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' },
    { field: 'description', label: 'Opis' }
  ];


   templates = [
    { id: 1, name: 'Template 1', description: 'Description 1' },
    { id: 2, name: 'Template 2', description: 'Description 2' },
    { id: 3, name: 'Template 3', description: 'Description 3' },
    { id: 4, name: 'Template 4', description: 'Description 4' },
    { id: 5, name: 'Template 5', description: 'Description 5' },
    { id: 6, name: 'Template 6', description: 'Description 6' },
    { id: 7, name: 'Template 7', description: 'Description 7' },
    { id: 8, name: 'Template 8', description: 'Description 8' },
    { id: 9, name: 'Template 9', description: 'Description 9' },
    { id: 10, name: 'Template 10', description: 'Description 10' },
    { id: 11, name: 'Template 11', description: 'Description 11' },
    { id: 12, name: 'Template 12', description: 'Description 12' },
    { id: 13, name: 'Template 13', description: 'Description 13' },
    { id: 14, name: 'Template 14', description: 'Description 14' },
    { id: 15, name: 'Template 15', description: 'Description 15' },
    { id: 16, name: 'Template 16', description: 'Description 16' },
    { id: 17, name: 'Template 17', description: 'Description 17' },
    { id: 18, name: 'Template 18', description: 'Description 18' },
    { id: 19, name: 'Template 19', description: 'Description 19' },
    { id: 20, name: 'Template 20', description: 'Description 20' },
    { id: 21, name: 'Template 21', description: 'Description 21' },
    { id: 22, name: 'Template 22', description: 'Description 22' },
    { id: 23, name: 'Template 23', description: 'Description 23' },
    { id: 24, name: 'Template 24', description: 'Description 24' },
    { id: 25, name: 'Template 25', description: 'Description 25' }
  ];

  handleRowDoubleClick(selected: GridElement) {
    console.log('Double clicked row:', selected);
    // Tutaj możesz wykonać dowolną logikę
  }

}
