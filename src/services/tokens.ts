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
  public async create(setCurrent: boolean = true) {
    const token = new Token(this._userId, this._settings);
    const save = await token.save();

    this.push(save, setCurrent);

    return save;
  }

  /**
   * Get current token
   */
  public current() {
    if (typeof this._currentIndex === 'number') {
      return this._list[this._currentIndex];
    }

    return null;
  }

  /**
   * Get all tokens
   */
  public all() {
    return this._list;
  }

  /**
   * Sync tokens database
   */
  public sync() {
    
  }

  /**
   * Push token
   */
  public push(token: Token, setCurrent: boolean = false) {
    this._list.push(token);

    if (setCurrent) {
      this._currentIndex = this._list.findIndex(e => e.userId == token.userId && e.token == token.token && e.expireAt == token.expireAt);
    }

    return this;
  }

}
