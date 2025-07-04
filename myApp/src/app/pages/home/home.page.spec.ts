import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { AuthService } from '../../services/Auth/auth.service';
import { UpdateService } from '../../services/update/update.service';
import { of, Subject } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HomePage (unit only)', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockAuthService: any;
  let mockUpdateService: any;

  beforeEach(async () => {
    mockAuthService = {
      dbReady$: of(true),
      // No dbInstance or executeSql here
    };

    mockUpdateService = {
      homeUpdated$: new Subject<void>()
    };

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot()],
      declarations: [HomePage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UpdateService, useValue: mockUpdateService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    // Setup dummy books for filtering and UI tests
    component.books = [
      {
        id: 1,
        title: 'Alpha',
        author: 'Author A',
        genres: 'Fiction',
        availableCopiesRent: 2,
        availableCopiesSales: 0,
        rentPrice: 5,
        buyPrice: 0,
        cover: ''
      },
      {
        id: 2,
        title: 'Beta',
        author: 'Author B',
        genres: 'Adventure',
        availableCopiesRent: 0,
        availableCopiesSales: 1,
        rentPrice: 0,
        buyPrice: 20,
        cover: ''
      }
    ];

    // Setup default filterTypes as this would normally come from DB
    component.filterTypes = ['Todos', 'Fiction', 'Adventure'];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filteredBooks should filter books correctly', () => {
    component.selectedFilter = 'Fiction';
    component.selectedPriceFilter = 'alquiler';
    component.searchTerm = '';
    let filtered = component.filteredBooks;
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Alpha');

    component.selectedPriceFilter = 'venta';
    filtered = component.filteredBooks;
    expect(filtered.length).toBe(0);

    component.selectedFilter = 'Todos';
    component.searchTerm = 'beta';
    component.selectedPriceFilter = 'Todos';
    filtered = component.filteredBooks;
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Beta');
  });

  it('should select filters and call resetAndLoadBooks', async () => {
    spyOn(component, 'resetAndLoadBooks').and.returnValue(Promise.resolve());

    component.selectFilter('Fiction');
    expect(component.selectedFilter).toBe('Fiction');
    expect(component.resetAndLoadBooks).toHaveBeenCalled();

    component.selectPriceFilter('venta');
    expect(component.selectedPriceFilter).toBe('venta');
    expect(component.resetAndLoadBooks).toHaveBeenCalledTimes(2);
  });

  it('should return correct availability class', () => {
    expect(component.getAvailabilityClass(4)).toBe('green-dot');
    expect(component.getAvailabilityClass(2)).toBe('yellow-dot');
    expect(component.getAvailabilityClass(0)).toBe('red-dot');
  });
});
