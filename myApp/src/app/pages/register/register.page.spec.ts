import { RegisterPage } from './register.page';
import { Router } from '@angular/router';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: any;
  let alertSpy: jasmine.Spy;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = {
      register: jasmine.createSpy()
    };
    component = new RegisterPage(mockRouter, mockAuthService);
    alertSpy = spyOn(window, 'alert');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Validation', () => {
    it('usernameValid returns true if username has 3+ characters', () => {
      component.username = 'abc';
      expect(component.usernameValid()).toBeTrue();
      component.username = 'ab';
      expect(component.usernameValid()).toBeFalse();
    });

    it('emailValid returns true for valid email', () => {
      component.email = 'user@example.com';
      expect(component.emailValid()).toBeTrue();
      component.email = 'invalid-email';
      expect(component.emailValid()).toBeFalse();
    });

    it('passwordValid returns true for length >= 6', () => {
      component.password = '123456';
      expect(component.passwordValid()).toBeTrue();
      component.password = '123';
      expect(component.passwordValid()).toBeFalse();
    });

    it('passwordsMatch returns true when password equals confirmPassword', () => {
      component.password = 'abc123';
      component.confirmPassword = 'abc123';
      expect(component.passwordsMatch()).toBeTrue();
      component.confirmPassword = 'xyz456';
      expect(component.passwordsMatch()).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.username = 'validUser';
      component.email = 'user@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
    });

    it('should call register and navigate on success', async () => {
      mockAuthService.register.and.returnValue(Promise.resolve());

      await component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalledWith('validUser', 'user@example.com', '123456');
      expect(alertSpy).toHaveBeenCalledWith('Cuenta creada exitosamente para validUser!');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set registrationError if register fails', async () => {
      mockAuthService.register.and.returnValue(Promise.reject({ message: 'Server error' }));

      await component.onSubmit();

      expect(component.registrationError).toBe('Server error');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should trigger shake if validation fails', async () => {
      component.username = 'ab'; // too short
      component.email = 'bademail'; // invalid
      component.password = '123'; // too short
      component.confirmPassword = '456'; // mismatch

      await component.onSubmit();

      expect(component.shakeUsername).toBeTrue();
      expect(component.shakeEmail).toBeTrue();
      expect(component.shakePassword).toBeTrue();
      expect(component.shakeConfirmPassword).toBeTrue();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  it('triggerShake sets flag and resets after timeout', (done) => {
    component.triggerShake('shakeUsername');
    expect(component.shakeUsername).toBeTrue();

    setTimeout(() => {
      expect(component.shakeUsername).toBeFalse();
      done();
    }, 550);
  });
});
