import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReserveComponent } from '../../popups/reserve/reserve.component';
// Importa el componente para la compra (purchase)
import { PurchaseComponent } from '../../popups/purchase/purchase.component'; 
import { AuthService } from '../../services/Auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: false,
})
export class BookDetailPage implements OnInit {
  book: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const bookId = Number(this.route.snapshot.paramMap.get('id'));
    if (!bookId) {
      console.error('Invalid book ID');
      return;
    }

    try {
      await firstValueFrom(this.authService.dbReady$);
      const db = this.authService.dbInstance;

      const bookResult = await db.executeSql(
        `SELECT * FROM books WHERE bookid = ?`,
        [bookId]
      );

      if (bookResult.rows.length === 0) {
        console.warn('Book not found with id', bookId);
        this.book = null;
        return;
      }

      const row = bookResult.rows.item(0);

      const genreResult = await db.executeSql(
        `SELECT g.name FROM genre g 
         INNER JOIN bookgenre bg ON g.genreid = bg.genreid
         WHERE bg.bookid = ?`,
        [bookId]
      );

      const genres: string[] = [];
      for (let i = 0; i < genreResult.rows.length; i++) {
        genres.push(genreResult.rows.item(i).name);
      }

      this.book = {
        id: row.bookid,
        title: row.name,
        author: row.author,
        cover: row.image,
        summary: row.resume,
        availableCopiesRent: row.current_inventory_rent,
        availableCopiesSales: row.current_inventory_sale,
        rentPrice: row.weekly_rent_price,
        purchasePrice: row.sale_price, // cambia buyPrice a purchasePrice
        genres: genres
      };

    } catch (error) {
      console.error('Error loading book details:', error);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
  
openReservationDialog() {
  if (!this.book) return;

  if (!this.authService.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }

  this.dialog.open(ReserveComponent, {
    width: '350px',
    data: { book: this.book }
  });
}

openPurchaseDialog() {
  if (!this.book) return;

  if (!this.authService.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }

  this.dialog.open(PurchaseComponent, {
    width: '350px',
    data: { book: this.book }
  });
}


  getAvailabilityClass(copies: number): string {
    return copies > 3 ? 'green-dot' : copies > 0 ? 'yellow-dot' : 'red-dot';
  }
}
