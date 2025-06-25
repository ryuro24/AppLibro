import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModifyUserPage } from './modify-user.page';

describe('ModifyUserPage', () => {
  let component: ModifyUserPage;
  let fixture: ComponentFixture<ModifyUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
