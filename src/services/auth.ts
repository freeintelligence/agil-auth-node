import { User } from "./../interfaces/user.interface";
import { Settings } from "./settings";
import { Token } from "./token";
import { Tokens } from "./tokens";

/**
 * Auth class
 */
export class Auth {

  /**
   * Data
   */
  private _user: User;
  public get user() { return this._user };
  public set user(value: User) { this._user = value; this.settings.getHiddenFields().forEach(field => Object.defineProperty(this._user, field, { enumerable: false, writable: true })); }
  private settings: Settings;
  private _tokens: Tokens;

  /**
   * Constructor
   */
  constructor(settings?: Settings) {
    this.settings = settings instanceof Settings ? settings : new Settings();
  }

  /**
   * Attempt user
   */
  public async attempt(toSearch: { [key: string]: any }, toCompare: { [key: string]: any }, generateToken: boolean = true) {
    const userData = await this.settings.getUserData(toSearch);

    if (this.settings.compareAttempt(toCompare, userData)) {
      this.user = userData ? userData : null;

      if (this.user && this.user.id && generateToken) {
        await this.tokens().create();
      }
    }

    return this;
  }

  /**
   * Restore user from token
   */
  public async resync(token: string) {
    const tokenDecompose = Token.decompose(token);
    const tokenData = await this.settings.getUserToken(tokenDecompose.userId, tokenDecompose.token);

    if (tokenData) {
      const userData = await this.settings.getUserData({ id: tokenData.userId });
      const token = new Token(tokenData.userId, this.settings);

      token.userId = tokenData.userId;
      token.token = tokenData.token;
      token.expireAt = tokenData.expireAt;

      this.tokens().push(token);
      this.user = userData ? userData : null;
    }

    return this;
  }

  /**
   * Tokens manager
   */
  public tokens() {
    if (!this._tokens) {
      this._tokens = new Tokens(this.user.id, this.settings)
    }

    return this._tokens;
  }

  /**
   * Logged in
   */
  public check() {
    return !!(this.user && this.user.id);
  }

}
