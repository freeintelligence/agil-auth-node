import { Utils } from './../utils';
import { Database as SQLite3Database } from 'sqlite3';
import sqlite3 from 'sqlite3';

const verbose = sqlite3.verbose();

interface Database {
  path?: string;
  userTokensFolder?: string;
  usersFolder?: string;
  instance?: SQLite3Database;
}

interface TokenData {
  userId: any;
  token: string;
  expireAt: number;
}

/**
 * Settings
 */
export class Settings {

  /**
   * Data
   */
  private tokenLifeTime = 60*60*24*7; // 7 days
  private database: Database = this.mergeDatabase({ path: ':memory:', userTokensFolder: 'usertokens', usersFolder: 'users' }).mergeDatabase({ instance: new verbose.Database(this.getDatabase().path) }).getDatabase();
  private sqlCreateUserTokensTable = `CREATE TABLE IF NOT EXISTS "${this.getDatabase().userTokensFolder}" ("userId" INTEGER NOT NULL, "token" TEXT NOT NULL, "expireAt" INTEGER); CREATE INDEX IF NOT EXISTS index_${this.getDatabase().userTokensFolder}_userId ON ${this.getDatabase().userTokensFolder} (userId ASC);`;
  private sqlCreateUsersTable = `CREATE TABLE "${this.getDatabase().usersFolder}" ("id"	INTEGER NOT NULL, "username"	INTEGER NOT NULL UNIQUE, "password"	TEXT, "data"	TEXT, PRIMARY KEY("id" AUTOINCREMENT)); CREATE INDEX IF NOT EXISTS index_${this.getDatabase().usersFolder}_id ON ${this.getDatabase().usersFolder} (id ASC);`;

  /**
   * Get database settings
   */
  public getDatabase(): Database {
    return this.database;
  }

  /**
   * Merge database settings
   */
  public mergeDatabase(settings: Database = {}) {
    if (typeof settings === 'object' && settings !== null) {
      this.database = Utils.merge(typeof this.database === 'object' && this.database !== null ? this.database : {}, settings);
    }

    return this;
  }

  /**
   * Get token life time in seconds
   */
   public getTokenLifeTime() {
    return this.tokenLifeTime;
  }

  /**
   * Set token life time in seconds
   */
  public setTokenLifeTime(lifeTime: number) {
    this.tokenLifeTime = lifeTime;
    return this;
  }

  /**
   * Get current timestamp
   */
  public getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Get next expire timestamp
   */
  public getNextExpireTimestamp() {
    return this.getCurrentTimestamp() + this.getTokenLifeTime();
  }

  /**
   * Get user data
   */
  public async getUserData(data: { [key: string]: any } = {}): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUsersTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          const [ where, values ] = Utils.objectToWhereStatement(data);

          this.getDatabase().instance.get(`SELECT id, username, password, data FROM "${this.getDatabase().usersFolder}" WHERE ${where} LIMIT 1`, values, (err: Error, row: any) => {
            if (err) {
              return reject(err);
            }

            if (!row) {
              return resolve(null);
            }

            const userData = {
              id: row.id,
              username: row.username,
              password: row.password,
              data: typeof row.data === 'object' && row.data !== null ? JSON.parse(row.data) : {},
            }

            return resolve(userData);
          });
        });
      });
    });
  }

  /**
   * Set method "getUserData"
   */
  public setMethodGetUserData(fn: (data: { [key: string]: any; }) => Promise<{ [key: string]: any; }>) {
    this.getUserData = fn;
    return this;
  }

  /**
   * Create user data
   */
  public async createUserData(data: { [key: string]: any } = {}): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUsersTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          if (typeof data !== 'object' || data === null) {
            return reject(new Error('undefined "data" on "createUserData".'));
          }

          if (typeof data.username !== 'string' || !data.username.length) {
            return reject(new Error('undefined "data.username" on "createUserData".'));
          }

          if (typeof data.password !== 'string' || !data.password.length) {
            return reject(new Error('undefined "data.password" on "createUserData".'));
          }

          if (typeof data.data !== 'object' && typeof data.data !== 'undefined' && data.data !== null) {
            return reject(new Error('property "data.data" must be an object on "createUserData".'));
          }

          const jsonData = typeof data.data === 'object' && data.data !== null ? data.data : {};
          const textData = JSON.stringify(jsonData);

          this.getDatabase().instance.run(`INSERT INTO "${this.getDatabase().usersFolder}" (username, password, data) VALUES (?, ?, ?)`, [ data.username, data.password, textData ], function(err: Error) {
            if (err) {
              return reject(err);
            }

            return resolve({ id: this.lastID, username: data.username, password: data.password, data: jsonData });
          });
        });
      });
    });
  }

  /**
   * Set method "createUserData"
   */
  public setMethodCreateUserData(fn: (data: { [key: string]: any; }) => Promise<{ [key: string]: any; }>) {
    this.createUserData = fn;
    return this;
  }

  /**
   * Store user token
   */
  public async createUserToken(userId: any, token: string, expireAt: number): Promise<TokenData> {
    return new Promise((resolve, reject) => {
      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUserTokensTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          this.getDatabase().instance.run(`INSERT INTO "${this.getDatabase().userTokensFolder}" VALUES (?, ?, ?)`, [ userId, token, expireAt ], function(err: Error) {
            if (err) {
              return reject(err);
            }

            return resolve({ userId, token, expireAt });
          });
        });
      });
    });
  }

  /**
   * Set method "createUserToken"
   */
  public setMethodCreateUserToken(fn: (userId: any, token: string, expireAt: number) => Promise<TokenData>) {
    this.createUserToken = fn;
    return this;
  }

  /**
   * Get token data
   */
  public async getUserToken(userId: any, token: string): Promise<TokenData | null> {
    return new Promise((resolve, reject) => {
      if (typeof userId === 'undefined' || userId === null || typeof token === 'undefined' || token === null) {
        return resolve(null);
      }

      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUserTokensTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          this.getDatabase().instance.get(`SELECT userId, token, expireAt FROM "${this.getDatabase().userTokensFolder}" WHERE userId = ? AND token = ? LIMIT 1`, [ userId, token ], (err: Error, row: any) => {
            if (err) {
              return reject(err);
            }

            return resolve(row);
          });
        });
      });
    });
  }

  /**
   * Set method "getUserToken"
   */
  public setMethodGetUserToken(fn: (userId: any, token: string) => Promise<TokenData | null>) {
    this.getUserToken = fn;
    return this;
  }

  /**
   * Get all user tokens
   */
  public async getUserAllTokens(userId: any): Promise<TokenData[]> {
    return new Promise((resolve, reject) => {
      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUserTokensTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          this.getDatabase().instance.all(`SELECT userId, token, expireAt FROM "${this.getDatabase().userTokensFolder}" WHERE userId = ?`, [ userId ], (err: Error, rows: any[]) => {
            if (err) {
              return reject(err);
            }

            return resolve(rows);
          });
        });
      });
    });
  }

  /**
   * Set method "getUserAllTokens"
   */
  public setMethodGetUserAllTokens(fn: (userId: any) => Promise<TokenData[]>) {
    this.getUserAllTokens = fn;
    return this;
  }

  /**
   * Delete user token
   */
  public async deleteUserToken(userId: any, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDatabase().instance.serialize(() => {
        this.getDatabase().instance.run(this.sqlCreateUserTokensTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          this.getDatabase().instance.run(`DELETE FROM "${this.getDatabase().userTokensFolder}" WHERE userId = ? AND token = ?`, [ userId, token ], (err: Error) => {
            if (err) {
              return reject(err);
            }

            return resolve();
          });
        });
      });
    });
  }

  /**
   * Set method "deleteUserToken"
   */
  public setMethodDeleteUserToken(fn: (userId: any, token: string) => Promise<void>) {
    this.deleteUserToken = fn;
    return this;
  }

}
