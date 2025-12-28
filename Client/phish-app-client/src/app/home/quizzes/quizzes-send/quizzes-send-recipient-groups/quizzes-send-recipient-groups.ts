import { Component, OnInit } from '@angular/core';
import { QuizzSendingInfo, RecipientGroup } from '../../quizzes.models';
import { SharedQuizzesService } from '../../shared-quizzes.service';
import { Router } from '@angular/router';
import { GridColumn, GridElement } from '../../../../core/components/grid-component/grid-component.models';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../core/components/button-component/button-component';
import { GridComponent } from '../../../../core/components/grid-component/grid-component';

@Component({
  selector: 'app-quizzes-send-recipient-groups',
  standalone: true,
  imports: [
    GridComponent,
    ButtonComponent,
    CommonModule
    
  ],
  templateUrl: './quizzes-send-recipient-groups.html',
  styleUrl: './quizzes-send-recipient-groups.scss'
})
export class QuizzesSendRecipientGroups implements OnInit {

  quizzSendingInfo: QuizzSendingInfo = new QuizzSendingInfo();
  selectedGroups: GridElement[] = [];

  constructor(
    private sharedQuizzesService: SharedQuizzesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sharedQuizzSendingInfo = this.sharedQuizzesService.getCurrentValue();
    if (!sharedQuizzSendingInfo) {
      return;
    }
    this.quizzSendingInfo = sharedQuizzSendingInfo;
  }

  columns: GridColumn[] = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Nazwa' }
  ];

  onGroupsSelected(selected: GridElement[]) {
    this.selectedGroups = selected;
  }

  async save(): Promise<void> {
    if (!this.quizzSendingInfo) {
      return;
    }

    if (!this.quizzSendingInfo.recipientGroups) {
      this.quizzSendingInfo.recipientGroups = [];
    }

    const existingIds = this.quizzSendingInfo.recipientGroups.map(g => g.id);

    const groupsToAdd = this.selectedGroups
      .filter(g => !existingIds.includes(g['id']))
      .map(g => {
        const newGroup = new RecipientGroup();
        newGroup.id = g['id'];
        newGroup.name = g['name'];
        return newGroup;
      });

    this.quizzSendingInfo.recipientGroups.push(...groupsToAdd);

    this.sharedQuizzesService.setCurrent(this.quizzSendingInfo);

    await this.router.navigate(['/home/quizzes/send']);
  }

  async cancel(): Promise<void> {
    this.selectedGroups = this.quizzSendingInfo
      ? [...this.quizzSendingInfo.recipientGroups]
      : [];

    await this.router.navigate(['/home/quizzes/send']);
  }
}
