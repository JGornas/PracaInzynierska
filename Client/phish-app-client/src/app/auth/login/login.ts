import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { LoginModel } from '../auth.models';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [FormsModule, ButtonComponent]
})
export class Login {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;


  loading = false;
  passwordVisible = false;
  public LoginModel: LoginModel = new LoginModel();

  constructor(private authService: AuthService, private router: Router) {}


  public contactButtonDisabled = false;
  loadingChange(value: boolean) {
    this.contactButtonDisabled = value;
  }

  public test: boolean | null = null;

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleEnter();
    }
  }


  public handleSubmit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.login(this.LoginModel).subscribe({
        next: (IsPasswordSet) => {
          if (!IsPasswordSet) {
            this.test = IsPasswordSet;
            this.router.navigate(['/auth/set-password'], { 
              queryParams: { email: this.LoginModel.email } 
            });
          } else {
            this.router.navigate(['/home']);
          }
          resolve();
        },
        error: (error) => {
          // Pełna obsługa błędu z login()
          Swal.fire({
          icon: 'error',
          title: 'Błąd logowania',
          text: error.message || 'Wystąpił błąd podczas logowania. Spróbuj ponownie.',
          confirmButtonText: 'OK',
          background: '#fff',
          allowOutsideClick: false
        });
          reject(error);
        }
      });
    });
  }

  public handleEnter() {
    if (!this.LoginModel.email) {
      this.emailInput.nativeElement.focus();
      return;
    }

    if (!this.LoginModel.password) {
      this.passwordInput.nativeElement.focus();
      return;
    }

    // jeśli oba pola są wypełnione – wykonaj logowanie
    this.handleSubmit();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    if (this.passwordInput) {
      this.passwordInput.nativeElement.type = this.passwordVisible ? 'text' : 'password';
    }
  }
}
