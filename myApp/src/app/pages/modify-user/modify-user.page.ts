import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-modify-user',
  templateUrl: './modify-user.page.html',
  styleUrls: ['./modify-user.page.scss'],
  standalone: false,
})
export class ModifyUserPage implements OnInit {
  mode: 'username' | 'password' = 'username';
  userId: number | null = null;

  newUsername = '';
  newPassword = '';
  confirmPassword = '';

  usernameExists = false;  // <-- controla el mensaje de usuario duplicado

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const modeParam = this.route.snapshot.paramMap.get('mode');
    this.mode = (modeParam === 'password') ? 'password' : 'username';

    this.userId = this.authService.getCurrentUserId();
    if (!this.userId) {
      alert('⚠ No hay sesión activa.');
      this.router.navigate(['/login']);
    }
  }

  // Limpiar mensaje de error cuando cambia el input del usuario
  onUsernameInput() {
    this.usernameExists = false;
  }

  async submit() {
    if (!this.userId) return;

    if (this.mode === 'username') {
      if (this.newUsername.trim().length < 3) {
        alert('⚠ El nombre de usuario debe tener al menos 3 caracteres.');
        return;
      }

      const result = await this.authService.updateUsername(this.userId, this.newUsername.trim());

      switch (result) {
        case 'success':
          alert('✅ Nombre de usuario actualizado correctamente.');
          this.reloadCurrentRoute('/profile');
          break;
        case 'duplicate':
          // Mostrar mensaje visual en vez de alerta
          this.usernameExists = true;
          break;
        case 'error':
        default:
          alert('❌ Ocurrió un error al actualizar el nombre de usuario.');
          break;
      }
    } else {
      if (this.newPassword.length < 6) {
        alert('⚠ La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        alert('⚠ Las contraseñas no coinciden.');
        return;
      }

      try {
        await this.authService.updatePassword(this.userId, this.newPassword);
        alert('✅ Contraseña actualizada correctamente.');
        this.reloadCurrentRoute('/profile');
      } catch (error) {
        alert('❌ Error al actualizar la contraseña.');
        console.error(error);
      }
    }
  }

  reloadCurrentRoute(url: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([url]);
    });
  }
}
