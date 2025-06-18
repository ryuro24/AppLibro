import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from './services/Auth/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController,
    private renderer: Renderer2,
  ) {}

  async ngOnInit() {
    try {
      // ✅ Cargar estado de sesión desde localStorage
      this.authService.loadSessionState();
      this.isLoggedIn = this.authService.isLoggedIn;

      // ✅ Suscribirse a cambios del estado de sesión
      this.authService.isLoggedIn$.subscribe(status => {
        this.isLoggedIn = status;
      });

      // ✅ Cerrar el menú si se hace clic fuera de él
      this.renderer.listen('window', 'click', (event: Event) => {
        const menuElement = document.querySelector('ion-menu');
        if (menuElement && !menuElement.contains(event.target as Node)) {
          this.menuCtrl.close();
        }
      });
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}
