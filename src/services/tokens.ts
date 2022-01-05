import { Utils } from "./../utils";
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

  /**
   * Constructor
   */
  constructor(settings: Settings) {
    this._settings = settings;
  }

  /**
   * Create token
   */
  public async create() {
    const token: Token = new Token();
    token.token = Utils.randomString(128);
    token.expireAt = this._settings.getNextExpireTimestamp();

    //await this._settings.createUserToken(this.user.id, this.token);

    return token;
  }

}
