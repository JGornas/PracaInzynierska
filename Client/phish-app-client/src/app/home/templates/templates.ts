import { Component } from '@angular/core';
import { GridComponent } from '../../core/components/grid-component/grid-component';

@Component({
  selector: 'app-templates',
  imports: [GridComponent],
  templateUrl: './templates.html',
  styleUrl: './templates.scss'
})
export class Templates {
  columns = ['id', 'title', 'body'];
}
