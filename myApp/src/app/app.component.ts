import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from './services/auth.service';
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


  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Listen for clicks outside the menu
    this.renderer.listen('window', 'click', (event: Event) => {
      const menuElement = document.querySelector('ion-menu');
      if (menuElement && !menuElement.contains(event.target as Node)) {
        this.menuCtrl.close();
      }
    });
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}
