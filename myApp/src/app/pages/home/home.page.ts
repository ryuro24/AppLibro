import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  selectedFilter = 'Todos';
  selectedPriceFilter = 'Todos'; // New filter for rent/buy options
  searchTerm = '';
  filterTypes = ['Todos', 'Acción', 'Romance', 'Ciencia ficción'];
  priceFilters = ['Todos', 'alquiler', 'venta']; // Rent/Sale filters

  books = [
    {
      id: 1,
      title: 'La Sombra del Viento',
      author: 'Carlos Ruiz Zafón',
      genre: 'Romance',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdwYQlLqSEy28f_Up0v-V1Dtgdgv9KUNwxTA&s',
      availableCopiesRent: 0, 
      availableCopiesSales: 5, 
      rentPrice: 0,
      buyPrice: 15000
    },
    {
      id: 2,
      title: 'Yo, Robot',
      author: 'Isaac Asimov',
      genre: 'Ciencia ficción',
      cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/79/2f/792f48e890d9c589ffc9c9a1a8259306.jpg',
      availableCopiesRent: 2,
      availableCopiesSales: 5,
      rentPrice: 2500,
      buyPrice: 18000
    },
    {
      id: 3,
      title: 'Los Juegos del Hambre',
      author: 'Suzanne Collins',
      genre: 'Acción',
      cover: 'https://m.media-amazon.com/images/I/61JfGcL2ljL._AC_UF1000,1000_QL80_.jpg',
      availableCopiesRent: 3,
      availableCopiesSales: 0,
      rentPrice: 3000,
      buyPrice: 0
    }
  ];

  get filteredBooks() {
    return this.books.filter(book => {
      const matchesGenre =
        !this.selectedFilter || this.selectedFilter === 'Todos' || book.genre === this.selectedFilter;

      const matchesSearch =
        !this.searchTerm ||
        (book.title + ' ' + book.author).toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesPriceFilter =
        this.selectedPriceFilter === 'Todos' ||
        (this.selectedPriceFilter === 'alquiler' && book.rentPrice > 0 && book.availableCopiesRent > 0) ||
        (this.selectedPriceFilter === 'venta' && book.buyPrice > 0 && book.availableCopiesSales > 0);

      return matchesGenre && matchesSearch && matchesPriceFilter;
    });
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  selectPriceFilter(filter: string) {
    this.selectedPriceFilter = filter;
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