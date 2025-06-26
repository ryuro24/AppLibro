import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  identifier = '';
  password = '';
  submitted = false;

  shakeIdentifier = false;
  shakePassword = false;

  loginError: '' | 'not_found' | 'wrong_password' | 'error' = '';

  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit() {
    this.submitted = true;
    this.loginError = '';

    const result = await this.authService.login(this.identifier, this.password);

    switch (result) {
      case 'success':
        localStorage.setItem('userIdentifier', this.identifier);
        this.router.navigate(['/home']);
        break;

      case 'not_found':
        this.loginError = 'not_found';
        this.shakeIdentifier = true;
        this.triggerShake('shakeIdentifier');
        break;

      case 'wrong_password':
        this.loginError = 'wrong_password';
        this.shakePassword = true;
        this.triggerShake('shakePassword');
        break;

      case 'error':
      default:
        this.loginError = 'error';
        this.triggerShake('shakeIdentifier');
        this.triggerShake('shakePassword');
        break;
    }
  }

  triggerShake(field: 'shakeIdentifier' | 'shakePassword') {
    this[field] = true;
    setTimeout(() => {
      this[field] = false;
    }, 500);
  }
}
