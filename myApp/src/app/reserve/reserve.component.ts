import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatDate } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-reservation-dialog',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss']
})
export class ReserveComponent implements OnInit {
  startDate!: Date;
  returnDate: Date | undefined; // ✅ Allows `undefined`, avoids null errors
  totalPrice = 0; // ✅ New variable for total price

  constructor(
    public dialogRef: MatDialogRef<ReserveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.calculateStartDate();
  }

  calculateStartDate() {
    this.startDate = this.data.book.availableCopies > 0 ? new Date() : new Date(new Date().setDate(new Date().getDate() + 10));
  }

  closeDialog() {
    this.dialogRef.close();
  }

confirmReservation() {
  if (!this.returnDate) {
    alert("⚠ Debes seleccionar una fecha de devolución antes de confirmar.");
    return; // ✅ Prevent confirmation without a valid return date
  }

  const formattedReturnDate = formatDate(this.returnDate, 'fullDate', 'en-US');
  alert(`Reserva confirmada! Devolución el ${formattedReturnDate}. Total: $${this.totalPrice}`);
  this.dialogRef.close();
}

  // ✅ Calculate total price based on rental duration
calculateTotal() {
  if (this.returnDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.returnDate);

    // ✅ Calculate difference in milliseconds
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // ✅ Convert to days

    // ✅ Get exact weeks as a decimal
    const exactWeeks = diffInDays / 7;

    // ✅ Ensure base price applies for rentals up to 7 days, then round up
    const weeks = Math.ceil(exactWeeks); // ✅ Always rounds up

    // ✅ Multiply by rent price
    this.totalPrice = weeks * this.data.book.rentPrice;
  }
}
validateReturnDate() {
  if (this.returnDate && this.returnDate < this.startDate) {
    alert("⚠ La fecha de devolución no puede ser menor a la fecha de inicio.");
    this.returnDate = undefined; // ✅ TypeScript-safe reset
    this.totalPrice = 0;
  } else {
    this.calculateTotal(); // ✅ Ensure total recalculates when valid
  }
}
}

