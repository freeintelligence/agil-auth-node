import { TokenInterface } from "../interfaces/token.interface";
import { db } from './database.service';

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
  public async storeUserToken(userId: number, token: TokenInterface): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          const stmt = db.prepare(`INSERT INTO "usertokens" VALUES (?, ?, ?)`, (_self: any, err: Error) => {
            if (err) {
              return reject(err);
            }

            stmt.run(userId, token.token, token.expireAt);
            stmt.finalize((err: Error) => {
              if (err) {
                return reject(err);
              }

              return resolve();
            });
          });
        });
      });
    });
  }

  /**
   * Set method "storeUserToken"
   */
   public setMethodStoreUserToken(fn: (userId: number, token: TokenInterface) => Promise<void>) {
    this.storeUserToken = fn;
    return this;
  }

  /**
   * Get token data
   */
  public async getTokenData(token: string): Promise<{ userId: number, token: string, expireAt: number } | null> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(this.sqlCreateTokenTable, (_result: any, err: Error) => {
          if (err) {
            return reject(err);
          }

          db.get(`SELECT userId, token, expireAt FROM "usertokens" WHERE token = ? LIMIT 1`, [ token ], (err: Error, row: any) => {
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
   * Set method "getTokenData"
   */
  public setMethodGetTokenData(fn: (token: string) => Promise<{ userId: number, token: string, expireAt: number } | null>) {
    this.getTokenData = fn;
    return this;
  }

}
