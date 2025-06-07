import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { ReserveComponent } from '../../reserve/reserve.component'; // Import your existing reservation component

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: false,
})
export class BookDetailPage implements OnInit {
  book: any;
  
  books = [
    { id: 1, title: 'La Sombra del Viento', author: 'Carlos Ruiz Zafón', genre: 'Romance',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdwYQlLqSEy28f_Up0v-V1Dtgdgv9KUNwxTA&s',
      availableCopiesRent: 0, availableCopiesSales: 5, summary: 'Una historia misteriosa en la Barcelona de posguerra...',
      rentPrice: 0, buyPrice: 15000 },
    { id: 2, title: 'Yo, Robot', author: 'Isaac Asimov', genre: 'Ciencia ficción',
      cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/79/2f/792f48e890d9c589ffc9c9a1a8259306.jpg',
      availableCopiesRent: 2, availableCopiesSales: 5, summary: 'Explora las leyes de la robótica y la evolución de la IA...',
      rentPrice: 2500, buyPrice: 18000 },
    { id: 3, title: 'Los Juegos del Hambre', author: 'Suzanne Collins', genre: 'Acción',
      cover: 'https://m.media-amazon.com/images/I/61JfGcL2ljL._AC_UF1000,1000_QL80_.jpg',
      availableCopiesRent: 3, availableCopiesSales: 0, summary: 'Un juego mortal donde solo un tributo puede sobrevivir...',
      rentPrice: 3000, buyPrice: 0 }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    const bookId = Number(this.route.snapshot.paramMap.get('id'));
    this.book = this.books.find(b => b.id === bookId);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openReservationDialog() {
    this.dialog.open(ReserveComponent, {
      width: '350px',
      data: { book: this.book }
    });
  }

  getAvailabilityClass(copies: number): string {
    return copies > 3 ? 'green-dot' : copies > 0 ? 'yellow-dot' : 'red-dot';
  }
}