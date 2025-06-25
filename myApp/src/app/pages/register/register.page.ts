import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  submitted = false;
  shakeUsername = false;
  shakeEmail = false;
  shakePassword = false;
  shakeConfirmPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  usernameValid(): boolean {
    return this.username.length >= 3;
  }

  emailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  passwordValid(): boolean {
    return !!this.password && this.password.length >= 6;
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  triggerShake(field: 'shakeUsername' | 'shakeEmail' | 'shakePassword' | 'shakeConfirmPassword') {
    this[field] = true;
    setTimeout(() => {
      this[field] = false;
    }, 500);
  }

registrationError: string | null = null;

async onSubmit() {
  this.submitted = true;
  this.registrationError = null; // Clear previous server error message

  this.shakeUsername = !this.usernameValid();
  this.shakeEmail = !this.emailValid();
  this.shakePassword = !this.passwordValid();
  this.shakeConfirmPassword = !this.passwordsMatch();

  if (this.usernameValid() && this.emailValid() && this.passwordValid() && this.passwordsMatch()) {
    try {
      await this.authService.register(this.username, this.email, this.password);
      alert(`Cuenta creada exitosamente para ${this.username}!`);
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.registrationError = error.message || 'Error al registrar. Intente nuevamente más tarde.';
      console.error(error); // Optional: keep for debugging
    }
  } else {
    if (this.shakeUsername) this.triggerShake('shakeUsername');
    if (this.shakeEmail) this.triggerShake('shakeEmail');
    if (this.shakePassword) this.triggerShake('shakePassword');
    if (this.shakeConfirmPassword) this.triggerShake('shakeConfirmPassword');
  }
}


}
