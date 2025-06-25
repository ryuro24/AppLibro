import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userEmail = 'Cargando...';
  username = 'Cargando...';

  selectedTransactionType = 'Todos';
  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  transactions: any[] = [];

  currentPage = 0;
  pageSize = 20;
  hasMoreTransactions = true;
  loading = false;

  availableYears: number[] = [];

  // Make userId public so template can access
  userId: number | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    await firstValueFrom(this.authService.dbReady$);

    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }

    this.userId = this.authService.getCurrentUserId();
    if (!this.userId) {
      this.router.navigate(['/home']);
      return;
    }

    this.generateAvailableYears();

    await this.loadUserData(this.userId);
    await this.resetAndLoadTransactions(this.userId);
  }

  generateAvailableYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;

    this.availableYears = [];
    for (let y = currentYear; y >= startYear; y--) {
      this.availableYears.push(y);
    }
  }

  async loadUserData(userId: number): Promise<void> {
    try {
      const sql = 'SELECT username, email FROM users WHERE userid = ?';
      const res = await this.authService.dbInstance.executeSql(sql, [userId]);
      if (res.rows.length > 0) {
        const user = res.rows.item(0);
        this.username = user.username;
        this.userEmail = user.email;
      } else {
        this.username = 'Usuario no encontrado';
        this.userEmail = 'Correo no disponible';
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.username = 'Error cargando usuario';
      this.userEmail = 'Error cargando correo';
    }
  }

  async resetAndLoadTransactions(userId: number) {
    this.transactions = [];
    this.currentPage = 0;
    this.hasMoreTransactions = true;
    await this.loadUserTransactions(userId);
  }

  async loadUserTransactions(userId: number) {
    if (this.loading || !this.hasMoreTransactions) return;
    this.loading = true;

    try {
      const offset = this.currentPage * this.pageSize;

      const filters = ['userid = ?'];
      const params: any[] = [userId];

      if (this.selectedTransactionType !== 'Todos') {
        filters.push('type = ?');
        params.push(this.selectedTransactionType);
      }

      if (this.selectedYear !== null) {
        filters.push(`(strftime('%Y', COALESCE(purchaseDate, startDate)) = ?)`);
        params.push(this.selectedYear.toString());
      }

      if (this.selectedMonth !== null) {
        filters.push(`(strftime('%m', COALESCE(purchaseDate, startDate)) = ?)`);
        params.push(this.selectedMonth.toString().padStart(2, '0'));
      }

      const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

      const sql = `
        SELECT * FROM transactions
        ${whereClause}
        ORDER BY id DESC
        LIMIT ${this.pageSize} OFFSET ${offset}
      `;

      const res = await this.authService.dbInstance.executeSql(sql, params);

      const newTransactions = [];

      for (let i = 0; i < res.rows.length; i++) {
        const t = res.rows.item(i);

        let displayDate = '';
        if (t.type === 'rent') {
          const start = t.startDate ? new Date(t.startDate).toLocaleDateString() : 'N/A';
          const end = t.endDate ? new Date(t.endDate).toLocaleDateString() : 'N/A';
          displayDate = `${start} - ${end}`;
        } else if (t.type === 'sale') {
          displayDate = t.purchaseDate ? new Date(t.purchaseDate).toLocaleDateString() : 'N/A';
        }

        const price = t.price != null ? t.price.toFixed(2) : '0.00';
        const returnedStatus = t.type === 'rent' ? (t.returned ? 'Devuelto' : 'Pendiente') : '-';

        newTransactions.push({
          id: t.id,
          bookTitle: t.bookTitle || 'Título no disponible',
          type: t.type,
          displayDate,
          price,
          returnedStatus,
          amount: t.amount ?? 1,
        });
      }

      this.transactions.push(...newTransactions);

      this.hasMoreTransactions = newTransactions.length === this.pageSize;
      this.currentPage++;
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      this.loading = false;
    }
  }

  selectTransactionType(type: string) {
    this.selectedTransactionType = type;
    if (this.userId !== null) this.resetAndLoadTransactions(this.userId);
  }

  selectMonth(month: number | null) {
    this.selectedMonth = month;
    if (this.userId !== null) this.resetAndLoadTransactions(this.userId);
  }

  selectYear(year: number | null) {
    this.selectedYear = year;
    if (this.userId !== null) this.resetAndLoadTransactions(this.userId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
