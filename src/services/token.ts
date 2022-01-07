import { Settings } from "./settings";

/**
 * Token
 */
export class Token {

  /**
   * Data
   */
  public userId: any;
  public token: string;
  public expireAt: number;

  /**
   * Additional
   */
  private _settings: Settings;
  private _userId: any;

  /**
   * Constructor
   */
   constructor(userId: any, settings: Settings) {
    this._userId = userId;
    this._settings = settings;

    this.userId = this._userId;
    this.token = Token.generate(this.userId);
    this.expireAt = this._settings.getNextExpireTimestamp();
  }

  /**
   * Save on database
   */
  public async save() {
    await this._settings.createUserToken(this.userId, this.token, this.expireAt);
    return this;
  }

  /**
   * Delete on database
   */
  public async delete() {
    await this._settings.deleteUserToken(this._userId, this.token);
  }

  /**
   * Random string for token (no $ character)
   * @param len string length
   */
  static random(len: number = 128) {
    const upper = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']; 
    const lower = [...'abcdefghijklmnopqrstuvwxyz']; 
    const unique = [...'-._~+/'];
    const numbers = [...'0123456789'];
    const base = [...upper, ...numbers, ...lower, ...unique];

    return [...Array(len)].map(i => base[Math.random() * base.length | 0]).join('');
  }

  /**
   * Generate a token
   * @param userId must be a number or string
   * @param len token length
   * @returns a user token
   */
  static generate(userId: any, len: number = 128) {
    const rand = this.random(len);
    return `${userId}$${rand}`;
  }

  /**
   * Decompose a token
   * @param token token to decompose
   */
  static decompose(token: string) {
    if (typeof token !== 'string' || !token.length) {
      return { userId: null, token: null };
    }

    const lastIndex = token.lastIndexOf('$');
    const obj = { userId: token.slice(0, lastIndex), token: token.slice(lastIndex + 1) };

    return { userId: obj.userId.length ? obj.userId : null, token: obj.token.length ? obj.token : null };
  }

}
