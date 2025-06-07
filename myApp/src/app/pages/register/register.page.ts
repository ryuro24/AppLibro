import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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

  triggerShake(field: 'shakeUsername' | 'shakeEmail' | 'shakePassword') {
    this[field] = true;
    setTimeout(() => {
      this[field] = false;
    }, 500);
  }

  onSubmit() {
    this.submitted = true;

    this.shakeUsername = !this.usernameValid();
    this.shakeEmail = !this.emailValid();
    this.shakePassword = !this.passwordValid() || this.password !== this.confirmPassword;

    if (this.usernameValid() && this.emailValid() && this.passwordValid() && this.password === this.confirmPassword) {
      alert(`Cuenta creada exitosamente para ${this.username}!`);
      this.router.navigate(['/login']);
    } else {
      if (this.shakeUsername) this.triggerShake('shakeUsername');
      if (this.shakeEmail) this.triggerShake('shakeEmail');
      if (this.shakePassword) this.triggerShake('shakePassword');
    }
  }
}