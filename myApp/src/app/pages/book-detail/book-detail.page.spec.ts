import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookDetailPage } from './book-detail.page';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/Auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

describe('BookDetailPage (unit only)', () => {
  let component: BookDetailPage;
  let fixture: ComponentFixture<BookDetailPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockAuthService = { isLoggedIn: true };

    await TestBed.configureTestingModule({
      declarations: [BookDetailPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null // or '1' if needed for test setup
              }
            }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailPage);
    component = fixture.componentInstance;
    component.book = { title: 'Dummy Book' } as any; // Set book so dialogs can open
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to /home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should redirect to login if not logged in (reservation)', () => {
    mockAuthService.isLoggedIn = false;
    component.openReservationDialog();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login if not logged in (purchase)', () => {
    mockAuthService.isLoggedIn = false;
    component.openPurchaseDialog();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return correct availability class', () => {
    expect(component.getAvailabilityClass(5)).toBe('green-dot');
    expect(component.getAvailabilityClass(2)).toBe('yellow-dot');
    expect(component.getAvailabilityClass(0)).toBe('red-dot');
  });
});
