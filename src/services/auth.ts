import { TokenInterface } from "../interfaces/token.interface";
import { Utils } from "../utils";
import { Settings } from "./settings";

/**
 * Auth class
 */
export class Auth {

  /**
   * Data
   */
  public user: { [key: string]: any } = {};
  private settings: Settings;
  private token: TokenInterface;

  /**
   * Constructor
   */
  constructor(settings?: Settings) {
    this.setSettings(settings);
  }

  /**
   * Set settings
   */
  public setSettings(settings?: Settings) {
    this.settings = settings instanceof Settings ? settings : new Settings();
    return this;
  }

  /**
   * Attempt user
   */
  public async attempt(data: { [key: string]: string | number } = {}, generateToken: boolean = true) {
    const userData = await this.settings.getUserData(data);

    this.user = userData ? userData : null;

    if (this.user && this.user.id && generateToken) {
      await this.createToken();
    }

    return this;
  }

  /**
   * Restore user from token
   */
  public async resync(token: string) {
    const tokenData = await this.settings.getTokenData(token);

    if (tokenData) {
      const userData = await this.settings.getUserData({ id: tokenData.userId });
      this.user = userData ? userData : null;
      this.token = { token: tokenData.token, expireAt: tokenData.expireAt };
    }

    return this;
  }

  /**
   * Generate token user
   */
  public async createToken() {
    if (!this.check()) {
      return null;
    }

    this.token = { token: Utils.randomString(128), expireAt: this.settings.getNextExpireTimestamp() };
    await this.settings.storeUserToken(this.user.id, this.token);

    return this;
  }

  /**
   * Get current token
   */
  public getCurrentToken() {
    return this.token;
  }

  /**
   * Logged in
   */
  public check() {
    return !!(this.user && this.user.id);
  }

}
