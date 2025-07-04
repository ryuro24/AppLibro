import { ModifyUserPage } from './modify-user.page';
import { Router } from '@angular/router';

describe('ModifyUserPage', () => {
  let component: ModifyUserPage;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: any;
  let mockAuthService: any;
  let alertSpy: jasmine.Spy;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    mockAuthService = {
      getCurrentUserId: jasmine.createSpy(),
      updateUsername: jasmine.createSpy(),
      updatePassword: jasmine.createSpy()
    };
    mockRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy()
        }
      }
    };

    component = new ModifyUserPage(mockRoute as any, mockRouter, mockAuthService);
    alertSpy = spyOn(window, 'alert');
  });

  describe('ngOnInit', () => {
    it('sets mode and userId correctly, no alert or navigation if userId exists', () => {
      mockRoute.snapshot.paramMap.get.and.returnValue('password');
      mockAuthService.getCurrentUserId.and.returnValue(1);

      component.ngOnInit();

      expect(component.mode).toBe('password');
      expect(component.userId).toBe(1);
      expect(alertSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('alerts and navigates if no userId', () => {
      mockRoute.snapshot.paramMap.get.and.returnValue('username');
      mockAuthService.getCurrentUserId.and.returnValue(null);

      component.ngOnInit();

      expect(alertSpy).toHaveBeenCalledWith('⚠ No hay sesión activa.');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  it('onUsernameInput resets usernameExists flag', () => {
    component.usernameExists = true;
    component.onUsernameInput();
    expect(component.usernameExists).toBeFalse();
  });

  describe('submit mode=username', () => {
    beforeEach(() => {
      component.mode = 'username';
      component.userId = 123;
    });

    it('alerts if username too short', async () => {
      component.newUsername = 'ab';
      await component.submit();
      expect(alertSpy).toHaveBeenCalledWith('⚠ El nombre de usuario debe tener al menos 3 caracteres.');
      expect(mockAuthService.updateUsername).not.toHaveBeenCalled();
    });

    it('handles success response', async () => {
      component.newUsername = 'validUser';
      mockAuthService.updateUsername.and.returnValue(Promise.resolve('success'));
      spyOn(component, 'reloadCurrentRoute');

      await component.submit();

      expect(alertSpy).toHaveBeenCalledWith('✅ Nombre de usuario actualizado correctamente.');
      expect(component.reloadCurrentRoute).toHaveBeenCalledWith('/profile');
      expect(component.usernameExists).toBeFalse();
    });

    it('sets usernameExists true on duplicate response', async () => {
      component.newUsername = 'validUser';
      mockAuthService.updateUsername.and.returnValue(Promise.resolve('duplicate'));

      await component.submit();

      expect(component.usernameExists).toBeTrue();
      expect(alertSpy).not.toHaveBeenCalledWith(jasmine.stringMatching(/correctamente/));
    });

    it('alerts on error response', async () => {
      component.newUsername = 'validUser';
      mockAuthService.updateUsername.and.returnValue(Promise.resolve('error'));

      await component.submit();

      expect(alertSpy).toHaveBeenCalledWith('❌ Ocurrió un error al actualizar el nombre de usuario.');
    });
  });

  describe('submit mode=password', () => {
    beforeEach(() => {
      component.mode = 'password';
      component.userId = 123;
    });

    it('alerts if password too short', async () => {
      component.newPassword = '12345';
      await component.submit();
      expect(alertSpy).toHaveBeenCalledWith('⚠ La contraseña debe tener al menos 6 caracteres.');
      expect(mockAuthService.updatePassword).not.toHaveBeenCalled();
    });

    it('alerts if passwords do not match', async () => {
      component.newPassword = '123456';
      component.confirmPassword = '654321';
      await component.submit();
      expect(alertSpy).toHaveBeenCalledWith('⚠ Las contraseñas no coinciden.');
      expect(mockAuthService.updatePassword).not.toHaveBeenCalled();
    });

    it('handles successful password update', async () => {
      component.newPassword = '123456';
      component.confirmPassword = '123456';
      mockAuthService.updatePassword.and.returnValue(Promise.resolve());
      spyOn(component, 'reloadCurrentRoute');

      await component.submit();

      expect(alertSpy).toHaveBeenCalledWith('✅ Contraseña actualizada correctamente.');
      expect(component.reloadCurrentRoute).toHaveBeenCalledWith('/profile');
    });

    it('alerts and logs on password update failure', async () => {
      component.newPassword = '123456';
      component.confirmPassword = '123456';
      const error = new Error('fail');
      mockAuthService.updatePassword.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await component.submit();

      expect(alertSpy).toHaveBeenCalledWith('❌ Error al actualizar la contraseña.');
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  it('reloadCurrentRoute triggers router navigation', () => {
    mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    component.reloadCurrentRoute('/profile');

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/', { skipLocationChange: true });
  });
});
