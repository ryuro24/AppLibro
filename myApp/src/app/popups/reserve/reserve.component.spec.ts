import { TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { ReserveComponent } from './reserve.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/Auth/auth.service';
import { Router } from '@angular/router';
import { UpdateService } from '../../services/update/update.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Added imports to fix ngModel and matDatepicker errors:
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

describe('ReserveComponent (logic only)', () => {
  let component: ReserveComponent;
  let fixture: ComponentFixture<ReserveComponent>;

  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ReserveComponent>>;
  let mockAuthService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUpdateService: any;

  const mockBook = {
    bookid: 123,
    title: 'Test Reserve Book',
    availableCopiesRent: 3,
    rentPrice: 15
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAuthService = {
      getCurrentUserId: jasmine.createSpy().and.returnValue(1),
      getRentPrice: jasmine.createSpy().and.returnValue(Promise.resolve(15)),
      insertTransaction: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));
    mockUpdateService = {
      notifyHomeUpdated: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      declarations: [ReserveComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { book: mockBook } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: UpdateService, useValue: mockUpdateService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.data.book.availableCopiesRent = 3;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize startDate, currentUserId, and totalPrice on ngOnInit', () => {
    component.ngOnInit();
    expect(component.currentUserId).toBe(1);
    expect(component.startDate).toBeDefined();
    expect(component.totalPrice).toBe(0);
  });

  describe('amount setter validation', () => {
    beforeEach(() => spyOn(window, 'alert'));

    it('sets amount to 1 if value < 1', () => {
      component.amount = 0;
      expect(component.amount).toBe(1);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('sets amount to max and alerts if value > max', () => {
      component.amount = 10;
      expect(component.amount).toBe(3);
      expect(window.alert).toHaveBeenCalledWith('⚠ No hay tantas copias disponibles. Máximo permitido: 3');
    });

    it('sets amount to value if valid', () => {
      component.amount = 2;
      expect(component.amount).toBe(2);
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('calculateStartDate', () => {
    it('sets startDate to today if copies available', () => {
      component.data.book.availableCopiesRent = 5;
      component.calculateStartDate();
      const today = new Date();
      expect(component.startDate.toDateString()).toBe(today.toDateString());
    });

    it('sets startDate 10 days from now if no copies available', () => {
      component.data.book.availableCopiesRent = 0;
      component.calculateStartDate();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 10);
      expect(component.startDate.toDateString()).toBe(expectedDate.toDateString());
    });
  });

  // Additional tests should similarly focus on logic and interaction,
  // mocking async methods with resolved Promises and spying alerts.

});
