import { Component, ViewChild } from '@angular/core';
import { GridColumn, GridElement } from '../../core/components/grid-component/grid-component.models';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzesService } from './quizzes.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { GridComponent } from '../../core/components/grid-component/grid-component';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import { QuizDto, QuizzSendingInfo } from './quizzes.models';
import { SharedQuizzesService } from './shared-quizzes.service';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [GridComponent, ButtonComponent],
  templateUrl: './quizzes.html',
  styleUrls: ['./quizzes.scss']
})
export class Quizzes {
  @ViewChild(GridComponent) grid!: GridComponent;

  selectedQuizz: QuizDto | null = null;

  constructor(
    private quizzesService: QuizzesService,
    private router: Router,
    private route: ActivatedRoute,
    private sharedQuizzesService: SharedQuizzesService
  ) {}

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Nazwa' },
    { field: 'description', label: 'Opis' }
  ];

  async handleRowDoubleClick(selected: GridElement): Promise<void> {
    await this.router.navigate([selected['id'], 'edit'], { relativeTo: this.route });
  }
  async handleRowClick(selected: GridElement): Promise<void> {
    this.selectedQuizz = {
      id: selected['id'],
      title: selected['title'],
      description: selected['description'],
      questions: []
    };
  }
  
  async createQuiz(): Promise<void> {
    await this.router.navigate(['create'], { relativeTo: this.route });
  }

  async sendQuiz(): Promise<void> {
    if (!this.selectedQuizz) {
      return;
    }

    const info = new QuizzSendingInfo();

    info.quizz.id = this.selectedQuizz.id;
    info.quizz.name = this.selectedQuizz.name ?? null;
    info.quizz.title = this.selectedQuizz.title ?? null;
    info.quizz.description = this.selectedQuizz.description ?? null;

    this.sharedQuizzesService.setCurrent(info);

    await this.router.navigate(['send'], { relativeTo: this.route });
  }


  async handleRowDeleted(selected: GridElement) {
    const result = await Swal.fire({
      title: 'Usunac quiz?',
      text: `Czy na pewno chcesz usunac quiz ${selected['title'] ?? selected['name'] ?? ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, usun',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) return;

    try {
      await firstValueFrom(this.quizzesService.deleteQuizz(selected['id']));
      await Swal.fire({ icon: 'success', title: 'Usunieto', text: 'Quiz zostal pomyslnie usuniety.' });
      this.grid.loadRemoteData(true);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Blad', text: error?.message || 'Nie udalo sie usunac quizu.' });
    }
  }
}
