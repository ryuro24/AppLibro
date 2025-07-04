import { LoginPage } from './login.page';
import { Router } from '@angular/router';

describe('LoginPage (unit only)', () => {
  let component: LoginPage;
  let mockRouter: jasmine.SpyObj<Router>;

beforeEach(() => {
  mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  // Partial AuthService stub with only login, cast as any to bypass strict typing
  const dummyAuthService = {
    login: () => Promise.resolve('success'),
  } as any;

  component = new LoginPage(mockRouter, dummyAuthService);
});


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set submitted and reset error on submit', async () => {
    // override login to return success immediately
    component['authService'].login = () => Promise.resolve('success');
    await component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(component.loginError).toBe('');
  });

  it('should handle "not_found" error and trigger shakeIdentifier', async () => {
    component['authService'].login = () => Promise.resolve('not_found');
    await component.onSubmit();
    expect(component.loginError).toBe('not_found');
    expect(component.shakeIdentifier).toBeTrue();
  });

  it('should handle "wrong_password" error and trigger shakePassword', async () => {
    component['authService'].login = () => Promise.resolve('wrong_password');
    await component.onSubmit();
    expect(component.loginError).toBe('wrong_password');
    expect(component.shakePassword).toBeTrue();
  });

  it('should handle generic error and trigger shakes on both fields', async () => {
    component['authService'].login = () => Promise.resolve('error');
    await component.onSubmit();
    expect(component.loginError).toBe('error');
    expect(component.shakeIdentifier).toBeTrue();
    expect(component.shakePassword).toBeTrue();
  });

  it('triggerShake should set field true then false after timeout', (done) => {
    component.triggerShake('shakeIdentifier');
    expect(component.shakeIdentifier).toBeTrue();

    setTimeout(() => {
      expect(component.shakeIdentifier).toBeFalse();
      done();
    }, 600);
  });
});
