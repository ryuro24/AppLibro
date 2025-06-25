import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/Auth/auth.service';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { UpdateService } from '../../services/update/update.service';


interface Book {
  id: number;
  title: string;
  author: string | null;
  genres: string;
  cover?: string;
  availableCopiesRent: number;
  availableCopiesSales: number;
  rentPrice: number;
  buyPrice: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  selectedFilter = 'Todos';
  selectedPriceFilter = 'Todos';
  searchTerm = '';
  filterTypes: string[] = ['Todos'];
  priceFilters = ['Todos', 'alquiler', 'venta'];

  books: Book[] = [];

  private db!: SQLiteObject;

  // Variables para paginación
  currentPage = 0;
  pageSize = 20;
  hasMoreBooks = true;
  loading = false;

  constructor(
    private authService: AuthService,
    private updateService: UpdateService) {}

  async ngOnInit() {
    this.authService.dbReady$.subscribe(async (ready) => {
      if (ready) {
        this.db = this.authService.dbInstance;
        await this.loadGenres();   // Carga géneros primero
        await this.resetAndLoadBooks();  // Carga la primera página de libros
      }
    });
    this.updateService.homeUpdated$.subscribe(() => {
    this.resetAndLoadBooks(); // Triggers full reload like your normal flow
  });
  }

  // Método para reiniciar la paginación y cargar libros desde la primera página
  async resetAndLoadBooks() {
    this.books = [];
    this.currentPage = 0;
    this.hasMoreBooks = true;
    await this.loadBooks();
  }

  async loadBooks() {
    if (this.loading || !this.hasMoreBooks) return;

    this.loading = true;
    try {
      const offset = this.currentPage * this.pageSize;

      // El query no tiene filtros para no hacer muy compleja la consulta SQLite.
      // Los filtros se aplican luego con filteredBooks en TS.

      const query = `
        SELECT 
          b.bookid AS id,
          b.name AS title,
          b.author,
          b.image AS cover,
          b.current_inventory_rent AS availableCopiesRent,
          b.current_inventory_sale AS availableCopiesSales,
          b.weekly_rent_price AS rentPrice,
          b.sale_price AS buyPrice,
          GROUP_CONCAT(g.name, ', ') AS genres
        FROM books b
        LEFT JOIN bookgenre bg ON b.bookid = bg.bookid
        LEFT JOIN genre g ON bg.genreid = g.genreid
        GROUP BY b.bookid
        LIMIT ${this.pageSize} OFFSET ${offset}
      `;

      const res = await this.db.executeSql(query, []);
      const newBooks: Book[] = [];

      for (let i = 0; i < res.rows.length; i++) {
        const row = res.rows.item(i);
        newBooks.push({
          id: row.id,
          title: row.title,
          author: row.author,
          cover: row.cover,
          availableCopiesRent: row.availableCopiesRent,
          availableCopiesSales: row.availableCopiesSales,
          rentPrice: row.rentPrice,
          buyPrice: row.buyPrice,
          genres: row.genres || '',
        });
      }

      this.books.push(...newBooks);
      this.hasMoreBooks = newBooks.length === this.pageSize;
      this.currentPage++;
    } catch (error) {
      console.error('Error loading books from DB:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadGenres() {
    try {
      const res = await this.db.executeSql(`SELECT name FROM genre`, []);
      const genres: string[] = [];

      for (let i = 0; i < res.rows.length; i++) {
        genres.push(res.rows.item(i).name);
      }

      this.filterTypes = ['Todos', ...genres];
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  }

  get filteredBooks() {
    return this.books.filter(book => {
      const matchesGenre =
        this.selectedFilter === 'Todos' || 
        book.genres.toLowerCase().includes(this.selectedFilter.toLowerCase());

      const matchesSearch =
        !this.searchTerm ||
        (book.title + ' ' + (book.author || '')).toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesPriceFilter =
        this.selectedPriceFilter === 'Todos' ||
        (this.selectedPriceFilter === 'alquiler' && book.rentPrice > 0 && book.availableCopiesRent > 0) ||
        (this.selectedPriceFilter === 'venta' && book.buyPrice > 0 && book.availableCopiesSales > 0);

      return matchesGenre && matchesSearch && matchesPriceFilter;
    });
  }

selectFilter(filter: string | undefined) {
  if (!filter) return;  // ignore undefined
  this.selectedFilter = filter;
  this.resetAndLoadBooks();
}

selectPriceFilter(filter: string | undefined) {
  if (!filter) return;  // ignore undefined
  this.selectedPriceFilter = filter;
  this.resetAndLoadBooks();
}




  async onSearchTermChange() {
    await this.resetAndLoadBooks(); // Reinicia paginación y recarga
  }

  getAvailabilityClass(copies: number): string {
    if (copies > 3) {
      return 'green-dot';
    } else if (copies > 0) {
      return 'yellow-dot';
    } else {
      return 'red-dot';
    }
  }
}
