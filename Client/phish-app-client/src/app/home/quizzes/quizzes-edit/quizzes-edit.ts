import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzesService } from '../quizzes.service';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { GridComponent } from '../../../core/components/grid-component/grid-component';

@Component({
  selector: 'app-quizzes-edit',
  imports: [ButtonComponent, GridComponent],
  templateUrl: './quizzes-edit.html',
  styleUrl: './quizzes-edit.scss'
})
export class QuizzesEdit {
  isEditMode: boolean = false;

  title: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private quizzesService: QuizzesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    this.title = 'tworzenie nowego';
    if (this.isEditMode) {
      // Load existing quiz data for editing
      this.title = 'edycja quizu';
    }
  }
}
