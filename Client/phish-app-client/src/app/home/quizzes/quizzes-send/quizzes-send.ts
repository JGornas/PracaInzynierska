import { Component, OnInit } from '@angular/core';
import { SharedQuizzesService } from '../shared-quizzes.service';
import { QuizzSendingInfo } from '../quizzes.models';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { GridComponent } from '../../../core/components/grid-component/grid-component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quizzes-send',
  standalone: true,
  imports: [
    ButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    GridComponent,
    CommonModule
  ],
  templateUrl: './quizzes-send.html',
  styleUrl: './quizzes-send.scss'
})
export class QuizzesSend implements OnInit {

  quizzSendingInfo: QuizzSendingInfo = new QuizzSendingInfo();

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

  public selectSendingProfile(): void {

    this.sharedQuizzesService.setCurrent(this.quizzSendingInfo);

    if(!this.quizzSendingInfo) {
      return;
    }

    this.router.navigate(['/home/sending-profiles'], {
      queryParams: { selectMode: 'true', quizSendingId: this.quizzSendingInfo.id }
    });
  }

  public get sendingProfileName(): string {
    return this.quizzSendingInfo.sendingProfile?.name || 'Wybierz profil wysyłki';
  }

  recipientGroupColumns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Grupa' },
    { field: 'membersCount', label: 'Członków' }
  ];

  public addRecipientGroup(): void {      
    this.sharedQuizzesService.setCurrent(this.quizzSendingInfo);
    this.router.navigate([`home/quizzes/send/addReciepientGroup`]);
  }

  handleRecipientGroupClick(row: any): void {
    
  }

  public handleRecipientGroupRemoved(row: any): void {
    const groupId = row['id'];
    this.quizzSendingInfo.recipientGroups = this.quizzSendingInfo.recipientGroups.filter(g => g.id !== groupId);
  }

  public async cancel(): Promise<void> {
      const result = await Swal.fire({
        title: 'Czy na pewno chcesz anulować?',
        text: 'Zmiany zostaną utracone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Tak, anuluj',
        cancelButtonText: 'Nie, wróć'
      });
  
      if (result.isConfirmed) {
        await this.router.navigate(['/home/quizzes']);
      }
    }

    public async send(): Promise<void> {
        console.log('Wysyłanie quizu:', this.quizzSendingInfo);
    }
}
