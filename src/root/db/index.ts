import mongoose from 'mongoose';
import config from '../configs';

class Database {
  private static instance: Database;
  private uri: string;
  public db: mongoose.Connection;

  private constructor() {
    const { password, name } = config.db;
    this.uri = `mongodb+srv://monday:${password}@cluster0.a4wkrfx.mongodb.net/${name}?retryWrites=true&w=majority`;

    if (config.env === 'dev') {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }

    this.db = mongoose.createConnection(this.uri, {
      maxPoolSize: 10,
    });

    this.db.on('open', () => console.log('Connected to mongoDB server successfully'));
    this.db.on('error', (error) => console.error('Connection failed', error));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instanceDB = Database.getInstance();
export default instanceDB.db;
