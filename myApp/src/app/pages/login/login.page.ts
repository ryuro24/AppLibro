import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';  // Adjust path if needed

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  identifier = '';  // Can be either email or username
  password = '';
  submitted = false;

  shakeIdentifier = false;
  shakePassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  identifierValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.identifier.length >= 3 && (emailRegex.test(this.identifier) || this.identifier.length >= 3);
  }

  passwordValid(): boolean {
    return !!this.password && this.password.length >= 6;
  }

  async onSubmit() {
    this.submitted = true;
    this.shakeIdentifier = !this.identifierValid();
    this.shakePassword = !this.passwordValid();

    if (this.identifierValid() && this.passwordValid()) {
      const success = await this.authService.login(this.identifier, this.password);

      if (success) {
        localStorage.setItem('userIdentifier', this.identifier);
        this.router.navigate(['/home']);
      } else {
        console.warn('Invalid credentials');
        this.triggerShake('shakeIdentifier');
        this.triggerShake('shakePassword');
      }
    } else {
      if (this.shakeIdentifier) this.triggerShake('shakeIdentifier');
      if (this.shakePassword) this.triggerShake('shakePassword');
    }
  }

  triggerShake(field: 'shakeIdentifier' | 'shakePassword') {
    this[field] = true;
    setTimeout(() => {
      this[field] = false;
    }, 500);
  }
}