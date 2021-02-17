import Ressource from "./Ressource";
import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

const url = "/users/:userId/totp";
const paramDefaults = {};

export default class TwoFactorAuthentication extends Ressource {
  constructor(tfa, customUrl, params, config) {
    const { id } = tfa;

    super(`:api_url${url}`, paramDefaults, { id }, tfa, [], [], config);
    this._queryUrl = Ressource.getQueryUrl(url);

    this.issuer = "";
    this.account_name = "";
    this.secret = "";
    this.qr_code = "";
  }

  static get(userId, config) {
    return super.get(`:api_url${url}`, { userId }, super.getConfig(config), {});
  }

  static enroll(userId, secret, passcode, config) {
    const cnf = super.getConfig(config);
    const endpoint = _urlParser(`${cnf.api_url}${url}`, { userId });
    return request(endpoint, "POST", { secret, passcode }, cnf);
  }

  static reset(userId, config) {
    const cnf = super.getConfig(config);
    const endpoint = _urlParser(`${cnf.api_url}/users/:userId/codes`, {
      userId
    });
    return request(endpoint, "POST", {}, cnf);
  }

  static delete(userId, config) {
    const cnf = super.getConfig(config);
    const endpoint = _urlParser(`${cnf.api_url}${url}`, { userId });
    return request(endpoint, "DELETE", {}, cnf);
  }
}
