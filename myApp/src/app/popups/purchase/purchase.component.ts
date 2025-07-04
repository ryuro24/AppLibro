import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/Auth/auth.service';
import { Router } from '@angular/router';
import { UpdateService } from '../../services/update/update.service';

@Component({
  standalone: false,
  selector: 'app-purchase-dialog',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  totalPrice = 0;
  currentUserId: number | null = null;

  private _amount = 1;

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    const max = this.data.book.availableCopiesSales;
    if (value < 1) {
      this._amount = 1;
    } else if (value > max) {
      this._amount = max;
      alert(`⚠ No hay tantas copias disponibles. Máximo permitido: ${max}`);
    } else {
      this._amount = value;
    }
    this.calculateTotal();
  }

  constructor(
    public dialogRef: MatDialogRef<PurchaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private router: Router,
    private updateService: UpdateService,
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();

    if (this.currentUserId === null) {
      console.warn('⚠ No user is currently logged in.');
    }

    this.calculateTotal();
  }

  closeDialog() {
    this.dialogRef.close();
  }

async confirmPurchase() {
  if (this.amount < 1 || this.amount > this.data.book.availableCopiesSales) {
    alert(`⚠ La cantidad debe ser entre 1 y ${this.data.book.availableCopiesSales}.`);
    return;
  }

  if (this.currentUserId === null) {
    alert("⚠ No se pudo confirmar la compra: ningún usuario ha iniciado sesión.");
    return;
  }

  try {
    const bookId = this.data.book.bookid ?? this.data.book.id;
    const officialPrice = await this.authService.getBookPrice(bookId);
    const totalPriceFromDb = officialPrice * this.amount;

    await this.authService.insertTransaction({
      bookId,
      userId: this.currentUserId,
      purchaseDate: new Date(),
      price: totalPriceFromDb,
      amount: this.amount,
      type: 'sale',
      bookTitle: this.data.book.title
    });
    this.reloadCurrentRoute();

    alert(`Compra confirmada para el usuario #${this.currentUserId}!\nCantidad: ${this.amount}.\nTotal: $${totalPriceFromDb.toFixed(2)}`);

    this.dialogRef.close({
      bookId,
      userId: this.currentUserId,
      purchaseDate: new Date(),
      price: totalPriceFromDb,
      amount: this.amount,
      type: 'sale',
      bookTitle: this.data.book.title
    });
  } catch (error: any) {
    alert(`⚠ Error al guardar la compra: ${error.message || 'Intenta de nuevo.'}`);
    console.error(error);
  }
}


  calculateTotal() {
    const salePrice = Number(this.data.book.purchasePrice) || 0;
    this.totalPrice = this.amount * salePrice;
  }

  onAmountChange(value: number) {
    this.amount = value;
  }

  increaseAmount() {
    this.amount = this.amount + 1;
  }

  decreaseAmount() {
    this.amount = this.amount - 1;
  }

      reloadCurrentRoute(): void {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
          this.updateService.notifyHomeUpdated();
        });
      }
}
