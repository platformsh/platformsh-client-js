import Ressource from "./Ressource";
import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

const url = "/users/:userId/totp";
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);

    this.issuer = "";
    this.account_name = "";
    this.secret = "";
    this.qr_code = "";
  }

  static get(userId) {
    const { api_url } = getConfig();
    return super._get(`${api_url}${url}`, { userId }, paramDefaults, {});
  }

  static enroll(userId, secret, passcode) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}${url}`, { userId });
    return request(endpoint, "POST", { secret, passcode });
  }

  static reset(userId) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}/users/:userId/codes`, { userId });
    return request(endpoint, "POST");
  }

  static delete(userId) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}${url}`, { userId });
    return request(endpoint, "DELETE");
  }
}
