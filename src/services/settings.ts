import { db } from './database';

interface TokenData {
  userId: string;
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
  private sqlCreateTokenTable = `CREATE TABLE IF NOT EXISTS "usertokens" ("userId" INTEGER NOT NULL, "token" TEXT NOT NULL, "expireAt" INTEGER); CREATE INDEX IF NOT EXISTS index_usertokens_userId ON usertokens (userId ASC);`;

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
    throw new Error('Method "getUserData" not implemented.');
  }

  /**
   * Set method "getUserData"
   */
  public setMethodGetUserData(fn: (data: { [key: string]: any; }) => Promise<{ [key: string]: any; }>) {
    this.getUserData = fn;
    return this;
  }

  /**
   * Store user token
   */
  public async createUserToken(userId: string, token: string, expireAt: number): Promise<TokenData> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          const stmt = db.prepare(`INSERT INTO "usertokens" VALUES (?, ?, ?)`, (_self: any, err: Error) => {
            if (err) {
              return reject(err);
            }

            stmt.run(userId, token, expireAt);
            stmt.finalize((err: Error) => {
              if (err) {
                return reject(err);
              }

              return resolve({ userId, token, expireAt });
            });
          });
        });
      });
    });
  }

  /**
   * Set method "createUserToken"
   */
  public setMethodCreateUserToken(fn: (userId: string, token: string, expireAt: number) => Promise<TokenData>) {
    this.createUserToken = fn;
    return this;
  }

  /**
   * Get token data
   */
  public async getUserToken(userId: string, token: string): Promise<TokenData | null> {
    return new Promise((resolve, reject) => {
      if (typeof userId === 'undefined' || userId === null || typeof token === 'undefined' || token === null) {
        return resolve(null);
      }

      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          db.get(`SELECT userId, token, expireAt FROM "usertokens" WHERE userId = ? AND token = ? LIMIT 1`, [ userId, token ], (err: Error, row: any) => {
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
  public setMethodGetUserToken(fn: (userId: string, token: string) => Promise<TokenData | null>) {
    this.getUserToken = fn;
    return this;
  }

  /**
   * Get all user tokens
   */
  public async getUserAllTokens(userId: string): Promise<TokenData[]> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          db.all(`SELECT userId, token, expireAt FROM "usertokens" WHERE userId = ?`, [ userId ], (err: Error, rows: any[]) => {
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
  public setMethodGetUserAllTokens(fn: (userId: string) => Promise<TokenData[]>) {
    this.getUserAllTokens = fn;
    return this;
  }

  /**
   * Delete user token
   */
  public async deleteUserToken(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          db.run(`DELETE FROM "usertokens" WHERE userId = ? AND token = ?`, [ userId, token ], (err: Error) => {
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
  public setMethodDeleteUserToken(fn: (userId: string, token: string) => Promise<void>) {
    this.deleteUserToken = fn;
    return this;
  }

}
