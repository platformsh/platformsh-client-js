import Ressource from "./Ressource";
import { getConfig } from "../config";

const _url = "/api/users";
const paramDefaults = {};

export default class User extends Ressource {
  constructor(account, url = `${_url}/:id`, modifiableField = []) {
    const { id } = account;

    super(url, paramDefaults, { id }, account, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.has_key = false;
    this.display_name = "";
    this.email = "";
    this.username = "";
  }

  static get(params, customUrl, options) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams,
      options
    );
  }

  static query(params, customUrl) {
    const { api_url } = getConfig();

    return super._query(
      this.getQueryUrl(customUrl || `${api_url}${_url}`),
      {},
      paramDefaults,
      params
    );
  }
}
