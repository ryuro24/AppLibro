import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { SeedService } from '../seed/seed.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public dbInstance!: SQLiteObject;
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  public dbReady$ = new BehaviorSubject<boolean>(false);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private seedService: SeedService,
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.initializeDatabase();
      } else {
        console.warn('SQLite is not available in browser. Skipping DB init.');
        this.dbReady$.next(true);
      }
    });
  }

  async initializeDatabase() {
  try {
    this.dbInstance = await this.sqlite.create({
      name: 'mydatabase.db',
      location: 'default'
    });

    await this.createTables();

    this.seedService.setDB(this.dbInstance);

    const shouldSeed = await this.shouldSeedDatabase();
    if (shouldSeed) {
      console.log('[Seed] Se detectó base de datos vacía. Población inicial...');
      await this.seedService.populateInitialData();
    } else {
      console.log('[Seed] Datos ya existentes. Se omite población inicial.');
    }

    this.loadSessionState();
    this.dbReady$.next(true);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

  async createTables() {
    try {
      await this.dbInstance.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            userid INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            usertype TEXT DEFAULT 'client',
            photo TEXT
          )`, []);


      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS genre (
          genreid INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )`, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS books (
          bookid INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          author TEXT,
          image TEXT,
          resume TEXT,
          current_inventory_rent INTEGER,
          total_inventory_rent INTEGER,
          current_inventory_sale INTEGER,
          weekly_rent_price REAL,
          sale_price REAL
        )`, []);

  await this.dbInstance.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookid INTEGER NOT NULL,
      userid INTEGER NOT NULL,
      bookTitle TEXT,
      type TEXT CHECK(type IN ('rent', 'sale')),
      startDate TEXT,
      endDate TEXT,
      purchaseDate TEXT,
      price REAL,
      amount INTEGER DEFAULT 1,
      returned INTEGER DEFAULT 0,
      FOREIGN KEY (bookid) REFERENCES books(bookid),
      FOREIGN KEY (userid) REFERENCES users(userid)
    )
  `, []);


      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS bookgenre (
          bookid INTEGER NOT NULL,
          genreid INTEGER NOT NULL,
          PRIMARY KEY (bookid, genreid),
          FOREIGN KEY (bookid) REFERENCES books(bookid),
          FOREIGN KEY (genreid) REFERENCES genre(genreid)
        )`, []);

      // Create trigger that updates inventory after transaction insert
      await this.dbInstance.executeSql(`
        CREATE TRIGGER update_inventory_after_transaction
        AFTER INSERT ON transactions
        FOR EACH ROW
        BEGIN
          UPDATE books
          SET current_inventory_rent = CASE
              WHEN NEW.type = 'rent' THEN current_inventory_rent - NEW.amount
              ELSE current_inventory_rent
            END,
            current_inventory_sale = CASE
              WHEN NEW.type = 'sale' THEN current_inventory_sale - NEW.amount
              ELSE current_inventory_sale
            END
          WHERE bookid = NEW.bookid;
        END;
      `, []);

    } catch (error) {
      console.error('Error creating tables or trigger:', error);
    }
  }

private async shouldSeedDatabase(): Promise<boolean> {
  try {
    const result = await this.dbInstance.executeSql('SELECT COUNT(*) as count FROM books', []);
    const count = result.rows.item(0).count;
    return count === 0;
  } catch (error) {
    console.warn('Error checking for existing books, assuming empty database.', error);
    return true; // Por si acaso falla la verificación
  }
}

async register(username: string, email: string, password: string): Promise<void> {
  if (!username || !email || !password) {
    throw new Error('Missing required registration fields.');
  }
  // Optionally add more validation here (e.g., regex for email format)

  try {
    await this.dbInstance.executeSql(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
  } catch (error: any) {
    // Normalize error message for duplicate key
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username or email already in use.');
    }
    console.error('Error registering user:', error);
    throw new Error('Registration failed due to server error.');
  }
}


async login(identifier: string, password: string): Promise<'success' | 'not_found' | 'wrong_password' | 'error'> {
  try {
    const result = await this.dbInstance.executeSql(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );

    if (result.rows.length === 0) {
      return 'not_found';
    }

    const user = result.rows.item(0);
    if (user.password !== password) {
      return 'wrong_password';
    }

    localStorage.setItem('userid', user.userid.toString());
    this.loggedIn.next(true);
    return 'success';

  } catch (error) {
    console.error('Error logging in:', error);
    return 'error';
  }
}


  async logout() {
    this.loggedIn.next(false);
    localStorage.removeItem('userid');
  }

  getCurrentUserId(): number | null {
    const value = localStorage.getItem('userid');
    return value ? parseInt(value, 10) : null;
  }

  get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  loadSessionState() {
    const hasUser = localStorage.getItem('userid');
    this.loggedIn.next(!!hasUser);
  }

async insertTransaction(transaction: {
  bookId: number;
  userId: number;
  type: 'rent' | 'sale';
  startDate?: Date;
  endDate?: Date;
  purchaseDate?: Date;
  price: number;
  amount?: number;
  bookTitle?: string;
  returned?: boolean;
}): Promise<void> {
  try {
    // Step 1: Check inventory based on transaction type
    const column = transaction.type === 'rent' ? 'current_inventory_rent' : 'current_inventory_sale';

    const result = await this.dbInstance.executeSql(
      `SELECT ${column} FROM books WHERE bookid = ?`, 
      [transaction.bookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Book not found');
    }

    const inventory = result.rows.item(0)[column];

    if (inventory < (transaction.amount || 1)) {
      throw new Error(`Not enough inventory to complete the ${transaction.type} transaction.`);
    }

    // Step 2: Proceed with insert if inventory is enough
    const sql = `
      INSERT INTO transactions
        (bookid, userid, type, startDate, endDate, purchaseDate, price, amount, returned, bookTitle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.dbInstance.executeSql(sql, [
      transaction.bookId,
      transaction.userId,
      transaction.type,
      transaction.startDate ? transaction.startDate.toISOString() : null,
      transaction.endDate ? transaction.endDate.toISOString() : null,
      transaction.purchaseDate ? transaction.purchaseDate.toISOString() : null,
      transaction.price,
      transaction.amount || 1,
      transaction.returned ? 1 : 0,
      transaction.bookTitle || ''
    ]);
  } catch (error) {
    console.error('Error inserting transaction:', error);
    throw error; // Bubble up to caller to handle (show message etc)
  }
}



async getBookPrice(bookId: number): Promise<number> {
  const db = this.dbInstance;
  try {
    const result = await db.executeSql('SELECT sale_price FROM books WHERE bookid = ?', [bookId]);
    if (result.rows.length > 0) {
      return Number(result.rows.item(0).sale_price) || 0;
    } else {
      throw new Error('Libro no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener precio del libro:', error);
    throw error;
  }
}
async getRentPrice(bookId: number): Promise<number> {
  const db = this.dbInstance;
  try {
    const result = await db.executeSql('SELECT weekly_rent_price FROM books WHERE bookid = ?', [bookId]);
    if (result.rows.length > 0) {
      return Number(result.rows.item(0).weekly_rent_price) || 0;
    } else {
      throw new Error('Libro no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener precio de renta del libro:', error);
    throw error;
  }
}

async updateUsername(userId: number, newUsername: string): Promise<'success' | 'duplicate' | 'error'> {
  try {
    await this.dbInstance.executeSql(
      `UPDATE users SET username = ? WHERE userid = ?`,
      [newUsername, userId]
    );
    return 'success';
  } catch (error: any) {
    if (error.message?.includes('UNIQUE') || error.code === 2067) {
      // Error 2067 = constraint failed (UNIQUE violation)
      console.warn('Nombre de usuario ya existe.');
      return 'duplicate';
    }

    console.error('Error updating username:', error);
    return 'error';
  }
}


async updatePassword(userId: number, newPassword: string): Promise<void> {
  try {
    await this.dbInstance.executeSql(`UPDATE users SET password = ? WHERE userid = ?`, [newPassword, userId]);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

async updateUserPhoto(userId: number, imageBase64: string): Promise<void> {
  try {
    await this.dbInstance.executeSql(
      `UPDATE users SET photo = ? WHERE userid = ?`,
      [imageBase64, userId]
    );
  } catch (error) {
    console.error('Error updating user photo:', error);
    throw error;
  }
}

}
