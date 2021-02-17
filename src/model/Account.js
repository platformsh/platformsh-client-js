import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/users/:id";
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account, curstomUrl, params, config) {
    const { id } = account;

    super(`:account_url${url}`, paramDefaults, { id }, account, [], [], config);
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

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:account_url${url}`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, config) {
    return super.query(
      this.getQueryUrl(`:account_url${url}`),
      {},
      super.getConfig(config),
      params
    );
  }
}
