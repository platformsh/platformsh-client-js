import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import Ressource from "./Ressource";
import type { APIObject } from "./Ressource";

const url = "/users/:userId/totp";
const paramDefaults = {};

export default class TwoFactorAuthentication extends Ressource {
  issuer: string;
  account_name: string;
  secret: string;
  qr_code: string;

  constructor(account: APIObject) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);

    this.issuer = "";
    this.account_name = "";
    this.secret = "";
    this.qr_code = "";
  }

  static async get(userId: string) {
    const { api_url } = getConfig();
    return super._get<TwoFactorAuthentication>(
      `${api_url}${url}`,
      { userId },
      paramDefaults,
      {}
    );
  }

  static async enroll(userId: string, secret: string, passcode: string) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}${url}`, { userId });
    return request(endpoint, "POST", { secret, passcode });
  }

  static async reset(userId: string) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}/users/:userId/codes`, { userId });
    return request(endpoint, "POST");
  }

  static async delete(userId: string) {
    const { api_url } = getConfig();
    const endpoint = _urlParser(`${api_url}${url}`, { userId });
    return request(endpoint, "DELETE");
  }
}
