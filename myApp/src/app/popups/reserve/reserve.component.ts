import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { AuthService } from '../../services/Auth/auth.service';
import { UpdateService } from '../../services/update/update.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-reservation-dialog',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss']
})
export class ReserveComponent implements OnInit {
  startDate!: Date;
  returnDate: Date | undefined;
  totalPrice = 0;
  currentUserId: number | null = null;

  private _amount = 1;

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    const max = this.data.book.availableCopiesRent;
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
    public dialogRef: MatDialogRef<ReserveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private router: Router,
    private updateService: UpdateService,
  ) {}

  ngOnInit() {
    this.calculateStartDate();
    this.currentUserId = this.authService.getCurrentUserId();

    if (this.currentUserId === null) {
      console.warn('⚠ No user is currently logged in.');
    }
    this.calculateTotal();
  }

  calculateStartDate() {
    this.startDate = this.data.book.availableCopiesRent > 0
      ? new Date()
      : new Date(new Date().setDate(new Date().getDate() + 10));
  }

  closeDialog() {
    this.dialogRef.close();
  }

async confirmReservation() {
  if (!this.returnDate) {
    alert("⚠ Debes seleccionar una fecha de devolución antes de confirmar.");
    return;
  }

  if (this.currentUserId === null) {
    alert("⚠ No se pudo confirmar la reserva: ningún usuario ha iniciado sesión.");
    return;
  }

  if (this.amount < 1 || this.amount > this.data.book.availableCopiesRent) {
    alert(`⚠ La cantidad debe ser entre 1 y ${this.data.book.availableCopiesRent}.`);
    return;
  }

  try {
    const bookId = this.data.book.bookid ?? this.data.book.id;
    const officialRentPrice = await this.authService.getRentPrice(bookId);
    const weeks = Math.ceil(((this.returnDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)) / 7);
    const totalPriceFromDb = officialRentPrice * this.amount * weeks;

    await this.authService.insertTransaction({
      bookId,
      userId: this.currentUserId,
      startDate: this.startDate,
      endDate: this.returnDate,
      price: totalPriceFromDb,
      amount: this.amount,
      type: 'rent',
      bookTitle: this.data.book.title
    });

    const formattedReturnDate = formatDate(this.returnDate, 'fullDate', 'en-US');
    alert(`Reserva confirmada para el usuario #${this.currentUserId}!\nDevolución: ${formattedReturnDate}.\nCantidad: ${this.amount}\nTotal: $${totalPriceFromDb.toFixed(2)}`);

    this.dialogRef.close({
      bookId,
      userId: this.currentUserId,
      startDate: this.startDate,
      endDate: this.returnDate,
      price: totalPriceFromDb,
      amount: this.amount,
      type: 'rent',
      bookTitle: this.data.book.title
    });
    this.reloadCurrentRoute();
  } catch (error: any) {
    alert(`⚠ Error al guardar la reserva: ${error.message || 'Intenta de nuevo.'}`);
    console.error(error);
  }
}


  calculateTotal() {
    if (this.returnDate) {
      const diffInDays = (this.returnDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24);
      const weeks = Math.ceil(diffInDays / 7);
      const weeklyPrice = Number(this.data.book.rentPrice) || 0;
      this.totalPrice = weeks * weeklyPrice * this.amount;
    } else {
      this.totalPrice = 0;
    }
  }

  validateReturnDate() {
    if (this.returnDate && this.returnDate < this.startDate) {
      alert("⚠ La fecha de devolución no puede ser menor a la fecha de inicio.");
      this.returnDate = undefined;
      this.totalPrice = 0;
    } else {
      this.calculateTotal();
    }
  }

  // Estas funciones usan el setter inteligente
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
