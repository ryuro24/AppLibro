import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Adjust path if needed

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userEmail!: string;
  selectedTransactionType = 'Todos'; // ✅ Filter variable

  // ✅ Simulated transaction history (now includes "returned" for rentals & rent price)
  transactions = [
    { bookTitle: 'La Sombra del Viento', type: 'rent', startDate: '2025-04-01', endDate: '2025-05-10', rentPrice: 2500, returned: false },
    { bookTitle: 'Yo, Robot', type: 'rent', startDate: '2025-04-01', endDate: '2025-06-02', rentPrice: 3000, returned: true },
    { bookTitle: 'Los Juegos del Hambre', type: 'rent', startDate: '2025-04-01', endDate: '2025-06-15', rentPrice: 2800, returned: false },
    { bookTitle: 'El Código Da Vinci', type: 'sale', purchaseDate: '2025-05-20', price: 18000, paymentMethod: 'Tarjeta' },
    { bookTitle: '1984', type: 'sale', purchaseDate: '2025-06-01', price: 15000, paymentMethod: 'Efectivo' }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Retrieve email from localStorage
    this.userEmail = localStorage.getItem('userEmail') || 'No email provided';
  }

  logout() {
    this.authService.logout(); // ✅ Use the correctly injected service
    localStorage.removeItem('userEmail'); // ✅ Clear stored email
    this.router.navigate(['/home']); // ✅ Redirect to login
  }

  // ✅ Filtered transactions based on selected type
  get filteredTransactions() {
    return this.transactions.filter(transaction => 
      this.selectedTransactionType === 'Todos' || transaction.type === this.selectedTransactionType
    );
  }

  // ✅ Update filter selection
  selectTransactionType(type: string) {
    this.selectedTransactionType = type;
  }
}