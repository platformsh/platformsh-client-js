import Ressource from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";
import request from "../api";
import Result from "./Result";

const url = "/users/:userId/api-tokens/:id";
const paramDefaults = {};

const createableField = [
  "id",
  "name",
  "created_at",
  "updated_at",
  "updated_at",
  "token"
];
const modifiableField = [""];

export default class ApiToken extends Ressource {
  constructor(data, params, config) {
    super(`:api_url${url}`, params, {}, data, createableField, [], config);
    this._queryUrl = _urlParser(
      Ressource.getQueryUrl(`:api_url${url}`),
      params
    );
    this.id = "";
    this.name = "";
    this.created_at = "";
    this.update_at = "";
    this.token = "";
  }

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${url}`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, config) {
    const { userId } = params;

    return super.query(
      Ressource.getQueryUrl(`:api_url${url}`, userId),
      params,
      super.getConfig(config)
    );
  }

  delete(params) {
    const url = `${_urlParser(this._queryUrl, { ...params })}/${this.id}`;

    return request(url, "DELETE", params, this.getConfig()).then(
      result => new Result(result, this._url, this.constructor)
    );
  }
}
