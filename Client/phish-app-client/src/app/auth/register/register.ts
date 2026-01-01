import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';
import { RegisterModel } from '../auth.models';
import { ButtonComponent } from '../../core/components/button-component/button-component';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [CommonModule, FormsModule, ButtonComponent]
})
export class Register {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  public model: RegisterModel = new RegisterModel();
  public generatedPassword: string | null = null;
  public loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  public handleSubmit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.register(this.model).subscribe({
        next: password => {
          this.generatedPassword = password;

          Swal.fire({
            icon: 'success',
            title: 'Konto utworzone',
            text: 'Skopiuj jednorazowe hasło i zaloguj się.',
            confirmButtonText: 'OK'
          });

          resolve();
        },
        error: error => {
          Swal.fire({
            icon: 'error',
            title: 'Błąd rejestracji',
            text: error.message || 'Nie udało się utworzyć konta.',
            confirmButtonText: 'OK'
          });
          reject(error);
        }
      });
    });
  }

  copyPassword() {
    if (!this.generatedPassword) return;
    navigator.clipboard.writeText(this.generatedPassword);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
