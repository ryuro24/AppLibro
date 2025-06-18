import { Injectable } from '@angular/core';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class SeedService {
  private dbInstance!: SQLiteObject;

  constructor() {}

  setDB(db: SQLiteObject) {
    this.dbInstance = db;
  }

  async populateInitialData(): Promise<void> {
    try {
      // Genres
      const genres = ['Romance', 'Ciencia ficción', 'Acción'];
      for (const name of genres) {
        await this.dbInstance.executeSql(`INSERT OR IGNORE INTO genre (name) VALUES (?)`, [name]);
      }

      // Fetch genreid for mapping
      const genreMap: Record<string, number> = {};
      const genreResult = await this.dbInstance.executeSql(`SELECT genreid, name FROM genre`, []);
      for (let i = 0; i < genreResult.rows.length; i++) {
        const row = genreResult.rows.item(i);
        genreMap[row.name] = row.genreid;
      }

      // Books
      const books = [
        {
          name: 'La Sombra del Viento',
          author: 'Carlos Ruiz Zafón',
          image: 'assets/img/Sombra.jpeg',
          resume: 'Una historia misteriosa en la Barcelona de posguerra...',
          current_inventory_rent: 0,
          total_inventory_rent: 5,
          current_inventory_sale: 5,
          weekly_rent_price: 0,
          sale_price: 15000,
          genres: ['Romance']
        },
        {
          name: 'Yo, Robot',
          author: 'Isaac Asimov',
          image: 'assets/img/Robot.webp',
          resume: 'Explora las leyes de la robótica y la evolución de la IA...',
          current_inventory_rent: 2,
          total_inventory_rent: 5,
          current_inventory_sale: 5,
          weekly_rent_price: 2500,
          sale_price: 18000,
          genres: ['Ciencia ficción']
        },
        {
          name: 'Los Juegos del Hambre',
          author: 'Suzanne Collins',
          image: 'assets/img/Hunger.jpg',
          resume: 'Un juego mortal donde solo un tributo puede sobrevivir...',
          current_inventory_rent: 3,
          total_inventory_rent: 3,
          current_inventory_sale: 0,
          weekly_rent_price: 3000,
          sale_price: 0,
          genres: ['Acción']
        }
      ];

      for (const book of books) {
        const result = await this.dbInstance.executeSql(`
          INSERT INTO books (
            name, author, image, resume,
            current_inventory_rent, total_inventory_rent,
            current_inventory_sale, weekly_rent_price, sale_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            book.name, book.author, book.image, book.resume,
            book.current_inventory_rent, book.total_inventory_rent,
            book.current_inventory_sale, book.weekly_rent_price, book.sale_price
          ]
        );

        const bookid = result.insertId;
        for (const genre of book.genres) {
          const genreid = genreMap[genre];
          if (genreid) {
            await this.dbInstance.executeSql(
              `INSERT INTO bookgenre (bookid, genreid) VALUES (?, ?)`,
              [bookid, genreid]
            );
          }
        }
      }

      console.log('✅ Seed data inserted');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }
}
