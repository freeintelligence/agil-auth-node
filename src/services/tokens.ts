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
  private _userId: any;
  private _list: Token[] = [];

  /**
   * Constructor
   */
  constructor(userId: any, settings: Settings) {
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
  public has(token: string) {
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
    token.onDelete = this.onDelete.bind(this);
    this._list.push(token);

    return this;
  }

  /**
   * Delete all expired tokens
   */
  public async deleteExpireds(sync: boolean = true) {
    if (sync) {
      await this.sync();
    }

    for (const token of this.all()) {
      await token.delete();
    }

    this._list = [];

    return this;
  }

  /**
   * Internal function to remove tokens from container
   */
  private onDelete(token: Token) {
    const index = this.all().findIndex(e => e.userId == token.userId && e.token == token.token && e.expireAt == token.expireAt);

    if (index === -1) {
      return false;
    }

    this._list.splice(index, 1);

    return true;
  }

}
