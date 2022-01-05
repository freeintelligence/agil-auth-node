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
  public user: User;
  private settings: Settings;

  /**
   * Additional
   */
  private _tokens: Tokens;

  /**
   * Constructor
   */
  constructor(settings?: Settings) {
    this.settings = settings instanceof Settings ? settings : new Settings();
    this._tokens = new Tokens(this.user.id, this.settings);
  }

  /**
   * Attempt user
   */
  public async attempt(data: { [key: string]: string | number } = {}, generateToken: boolean = true) {
    const userData = await this.settings.getUserData(data);

    this.user = userData ? userData : null;

    if (this.user && this.user.id && generateToken) {
      await this.tokens().create();
    }

    return this;
  }

  /**
   * Restore user from token
   */
  public async resync(token: string) {
    const tokenData = await this.settings.getUserToken(token);

    if (tokenData) {
      const userData = await this.settings.getUserData({ id: tokenData.userId });
      const token = new Token(tokenData.userId, this.settings);

      token.userId = tokenData.userId;
      token.token = tokenData.token;
      token.expireAt = tokenData.expireAt;

      this.tokens().push(token, true);
      this.user = userData ? userData : null;
    }

    return this;
  }

  /**
   * Tokens manager
   */
  public tokens() {
    return this._tokens;
  }

  /**
   * Logged in
   */
  public check() {
    return !!(this.user && this.user.id);
  }

}
