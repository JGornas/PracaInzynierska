import { Component, ViewChild } from '@angular/core';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzesService } from './quizzes.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../core/components/button-component/button-component';

@Component({
  selector: 'app-quizzes',
  imports: [GridComponent, ButtonComponent],
  templateUrl: './quizzes.html',
  styleUrl: './quizzes.scss'
})
export class Quizzes {

  @ViewChild(GridComponent) grid!: GridComponent;

  constructor(
    private quizzesService: QuizzesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  columns: GridColumn[] = [
      { field: 'id', label: 'ID' },
      { field: 'title', label: 'Nazwa' },
      { field: 'description', label: 'Opis' }
    ];


  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });

  }
  
  async createQuiz(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async handleRowDeleted(selected: GridElement) {
      const result = await Swal.fire({
        title: 'Usunąć quiz?',
        text: `Czy na pewno chcesz usunąć quiz ${selected['name']}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Tak, usuń',
        cancelButtonText: 'Nie, anuluj'
      });
  
      if (!result.isConfirmed) return;
  
      try {
        await firstValueFrom(this.quizzesService.deleteQuizz(selected['id']));
        await Swal.fire({ icon: 'success', title: 'Usunięto', text: 'Quiz został pomyślnie usunięty.' });
        this.grid.loadRemoteData(true);
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Błąd', text: error?.message || 'Nie udało się usunąć quizu.' });
      }
    }
}
