import Ressource from "./Ressource";
import { getConfig } from "../config";

const _url = "/api/users";
const paramDefaults = {};

export default class User extends Ressource {
  constructor(
    account,
    url = `${_url}/:id`,
    params,
    config,
    modifiableField = []
  ) {
    const { id } = account;

    super(url, paramDefaults, { id }, account, [], modifiableField, config);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.has_key = false;
    this.display_name = "";
    this.email = "";
    this.username = "";
  }

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${_url}/:id`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl) {
    return super.query(
      this.getQueryUrl(customUrl || `:api_url${_url}`),
      {},
      super.getConfig(config),
      params
    );
  }
}
