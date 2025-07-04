import { ProfilePage } from './profile.page';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { of } from 'rxjs';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: any;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = {
      isLoggedIn: true,
      getCurrentUserId: jasmine.createSpy().and.returnValue(1),
      dbReady$: of(true),
      logout: jasmine.createSpy()
    };

    component = new ProfilePage(mockRouter, mockAuthService);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    it('should call logout and navigate to /home', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
