import { PurchaseComponent } from './purchase.component';

describe('PurchaseComponent (logic only, no DI)', () => {
  let component: PurchaseComponent;

  const sampleBook = {
    bookid: 1,
    title: 'Sample Book',
    availableCopiesSales: 5,
    purchasePrice: 10
  };

  beforeEach(() => {
    // Minimal fake dialogRef with just close() method
    const fakeDialogRef = { close: jasmine.createSpy('close') };

    // Create component manually without Angular TestBed
    component = new PurchaseComponent(
      fakeDialogRef as any, // dialogRef
      { book: sampleBook } as any, // data
      null as any, // authService not needed, skip
      null as any, // router not needed
      null as any  // updateService not needed
    );

    // Manually assign currentUserId (simulate logged in user)
    component.currentUserId = 1;

    spyOn(window, 'alert');
    spyOn(console, 'warn');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('amount setter validation', () => {
    it('sets amount to 1 if value < 1', () => {
      component.amount = 0;
      expect(component.amount).toBe(1);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('sets amount to max and alerts if value > max', () => {
      component.amount = 10;
      expect(component.amount).toBe(sampleBook.availableCopiesSales);
      expect(window.alert).toHaveBeenCalledWith(
        `⚠ No hay tantas copias disponibles. Máximo permitido: ${sampleBook.availableCopiesSales}`
      );
    });

    it('sets amount to value if valid', () => {
      component.amount = 3;
      expect(component.amount).toBe(3);
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('calculateTotal', () => {
    it('calculates totalPrice correctly', () => {
      component.amount = 2;
      component.data.book.purchasePrice = 20;
      component.calculateTotal();
      expect(component.totalPrice).toBe(40);
    });

    it('handles missing purchasePrice gracefully', () => {
      component.amount = 2;
      component.data.book.purchasePrice = undefined;
      component.calculateTotal();
      expect(component.totalPrice).toBe(0);
    });
  });

  describe('increaseAmount and decreaseAmount', () => {
    it('increaseAmount increases amount', () => {
      component.amount = 2;
      component.increaseAmount();
      expect(component.amount).toBe(3);
    });

    it('decreaseAmount decreases amount but not below 1', () => {
      component.amount = 2;
      component.decreaseAmount();
      expect(component.amount).toBe(1);

      component.decreaseAmount();
      expect(component.amount).toBe(1); // should not go below 1
    });
  });

  it('closeDialog calls dialogRef.close', () => {
    component.closeDialog();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  // Skipping ngOnInit test since it requires authService/DB access
});
