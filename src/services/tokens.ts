import { Settings } from "./settings";
import { Token } from './token';

/**
 * Tokens
 */
export class Tokens {

  /**
   * Additional
   */
  private _settings: Settings;
  private _userId: string;
  private _list: Token[] = [];
  private _currentIndex: number;

  /**
   * Constructor
   */
  constructor(userId: string, settings: Settings) {
    this._userId = userId;
    this._settings = settings;
  }

  /**
   * Create token
   */
  public async create() {
    const token = new Token(this._userId, this._settings);
    const save = await token.save();

    this.push(save);

    return save;
  }

  /**
   * Has a token
   */
  public hasToken(token: string) {
    return this._list.findIndex(e => e.token == token && e.userId == this._userId) !== -1;
  }

  /**
   * Get all local tokens
   */
  public all() {
    return this._list;
  }

  /**
   * Sync tokens database
   */
  public async sync() {
    this._list = (await this._settings.getUserAllTokens(this._userId)).map(e => {
      const token = new Token(this._userId, this._settings);
      token.userId = e.userId;
      token.token = e.token;
      token.expireAt = e.expireAt;
      return token;
    });

    return this;
  }

  /**
   * Push token
   */
  public push(token: Token) {
    this._list.push(token);
    return this;
  }

}
