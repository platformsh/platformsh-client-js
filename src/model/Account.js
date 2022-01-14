import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/users/:id";
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account) {
    const { id } = account;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.has_key = false;
    this.display_name = "";
    this.email = "";
    this.picture = "";
    this.roles = "";
  }

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { account_url } = getConfig();

    return super._get(
      customUrl || `${account_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { account_url } = getConfig();

    return super._query(
      this.getQueryUrl(`${account_url}${url}`),
      {},
      paramDefaults,
      params
    );
  }
}
