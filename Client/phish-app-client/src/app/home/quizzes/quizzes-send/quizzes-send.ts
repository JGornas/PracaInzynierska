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
import { QuizzesService } from '../quizzes.service';
import { firstValueFrom } from 'rxjs';

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
    private quizzesService: QuizzesService,
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

  public selectTemplate(): void {

    this.sharedQuizzesService.setCurrent(this.quizzSendingInfo);

    if(!this.quizzSendingInfo) {
      return;
    }

    this.router.navigate(['/home/templates'], {
      queryParams: { selectMode: 'true', quizSendingId: this.quizzSendingInfo.id }
    });
  }

  public get sendingProfileName(): string {
    return this.quizzSendingInfo.sendingProfile?.name || 'Wybierz profil wysyłki';
  }

  public get templateName(): string {
    return this.quizzSendingInfo.template?.name || 'Wybierz szablon';
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

    if (!this.quizzSendingInfo.template) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak szablonu',
        text: 'Wybierz szablon quizu przed wysłaniem.'
      });
      return;
    }

    if (!this.quizzSendingInfo.sendingProfile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak profilu wysyłki',
        text: 'Wybierz profil wysyłki przed wysłaniem.'
      });
      return;
    }

    if (!this.quizzSendingInfo.recipientGroups || this.quizzSendingInfo.recipientGroups.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Brak odbiorców',
        text: 'Wybierz co najmniej jedną grupę odbiorców.'
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Wysłać quiz?',
      text: 'Czy na pewno chcesz wysłać e-mail z quizem do wybranych odbiorców?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tak, wyślij',
      cancelButtonText: 'Anuluj'
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    Swal.fire({
      title: 'Wysyłanie...',
      text: 'Trwa wysyłanie quizu',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const result = await firstValueFrom(
        this.quizzesService.sendQuiz(this.quizzSendingInfo)
      );

      Swal.close();

      if (result) {
        await Swal.fire({
          icon: 'success',
          title: 'Sukces',
          text: 'Quiz został wysłany do odbiorców.'
        });
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Niepowodzenie',
          text: 'Quiz nie został wysłany.'
        });
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Wystąpił błąd podczas wysyłania quizu.'
      });
    }
  }
}
