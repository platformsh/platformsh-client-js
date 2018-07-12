import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/api/users/:id";
const paramDefaults = {};

export default class User extends Ressource {
  constructor(account, baseUrl, modifiableField = []) {
    const { id } = account;

    super(baseUrl, paramDefaults, { id }, account, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(baseUrl);
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.has_key = false;
    this.display_name = "";
    this.email = "";
  }

  static get(params, _url) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(
      _url || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params, baseUrl) {
    return super.query(
      this.getQueryUrl(`${baseUrl}${url}`),
      {},
      paramDefaults,
      params
    );
  }
}
