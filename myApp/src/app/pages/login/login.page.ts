import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Adjust path if needed

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  email = '';
  password = '';
  submitted = false;

  shakeEmail = false;
  shakePassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  emailValid(): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(this.email);
  }

  passwordValid(): boolean {
    return !!this.password && this.password.length >= 6;
  }

onSubmit() {
  this.submitted = true;
  this.shakeEmail = !this.emailValid();
  this.shakePassword = !this.passwordValid();

  if (this.emailValid() && this.passwordValid()) {
    // Mark user as logged in
    this.authService.login();

    // ✅ Store email in localStorage so it can be retrieved later
    localStorage.setItem('userEmail', this.email);

    // Navigate to home page
    this.router.navigate(['/home']);
  } else {
    if (this.shakeEmail) this.triggerShake('shakeEmail');
    if (this.shakePassword) this.triggerShake('shakePassword');
  }
}

  triggerShake(field: 'shakeEmail' | 'shakePassword') {
    this[field] = true;
    setTimeout(() => {
      this[field] = false;
    }, 500);
  }
}