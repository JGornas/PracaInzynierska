import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../core/components/button-component/button-component';
import Swal from 'sweetalert2';
import { LoginModel, SetPasswordFormModel } from '../auth.models';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-set-password',
  imports: [FormsModule, CommonModule, ButtonComponent],
  providers: [AuthService],
  templateUrl: './set-password.html',
  styleUrl: './set-password.scss'
})
export class SetPassword {
  @ViewChild('passwordInput', { static: true }) passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmPasswordInput', { static: true }) confirmPasswordInput!: ElementRef<HTMLInputElement>;

  loading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  
  public passwordForm: SetPasswordFormModel = new SetPasswordFormModel();

  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.passwordForm.email = params['email'] || '';
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    if (this.passwordInput) {
      this.passwordInput.nativeElement.type = this.passwordVisible ? 'text' : 'password';
    }
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    if (this.confirmPasswordInput) {
      this.confirmPasswordInput.nativeElement.type = this.confirmPasswordVisible ? 'text' : 'password';
    }
  }

  // Metoda w komponencie do sprawdzania czy hasła są identyczne
  passwordsMatch(): boolean {
    return this.passwordForm.password === this.passwordForm.confirmPassword;
  }

  // Metoda w komponencie do sprawdzania siły hasła
  isPasswordStrong(): boolean {
    const password = this.passwordForm.password;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }

  // Metoda do wyświetlania informacji o brakach w haśle (tylko przy błędzie)
  getPasswordMissingRequirements(): string {
    const password = this.passwordForm.password;
    const requirements = [
      { met: password.length >= 8, message: 'co najmniej 8 znaków' },
      { met: /[A-Z]/.test(password), message: 'wielka litera' },
      { met: /[a-z]/.test(password), message: 'mała litera' },
      { met: /\d/.test(password), message: 'cyfra' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'znak specjalny' }
    ];

    const missing = requirements.filter(req => !req.met).map(req => req.message);
    return missing.join(', ');
  }

  // Metoda submit dla ustawienia nowego hasła
  public handleSubmit(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Walidacja czy hasła są takie same
      if (!this.passwordsMatch()) {
        Swal.fire('Błąd', 'Hasła nie są identyczne', 'error');
        reject('Passwords do not match');
        return;
      }

      // Walidacja siły hasła
      if (!this.isPasswordStrong()) {
        const missingRequirements = this.getPasswordMissingRequirements();
        Swal.fire('Błąd', `Hasło jest zbyt słabe. Brakuje: ${missingRequirements}`, 'error');
        reject('Password is too weak');
        return;
      }

      // Mapowanie SetPasswordFormModel na LoginModel
      const loginModel: LoginModel = {
        email: this.passwordForm.email,
        password: this.passwordForm.password
      };

      // Wywołanie metody setPassword z AuthService
      this.authService.setPassword(loginModel).subscribe({
        next: (response) => {
          Swal.fire('Sukces', 'Hasło zostało ustawione', 'success');
          this.router.navigate(['/home']);
          resolve();
        },
        error: (error) => {
          // Obsługa błędu z API
          this.showError(error);
          reject(error);
        }
      });
    });
  }

  private showError(error: any): void {
    let errorMessage = 'Wystąpił błąd podczas ustawiania hasła';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    Swal.fire({
      icon: 'error',
      title: 'Błąd',
      text: errorMessage,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }
}