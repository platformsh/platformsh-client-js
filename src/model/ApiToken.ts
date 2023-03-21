import Ressource, { ParamsType, APIObject } from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

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

export interface APITokenGetParams {
  id?: string;
  [index: string]: any;
}

export interface APITokenQueryParams {
  userId?: string;
  [index: string]: any;
}

export default class ApiToken extends Ressource {
  id: string;
  name: string;
  created_at: string;
  update_at: string;
  token: string;

  constructor(apiToken: APIObject, params: ParamsType) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, params, {}, apiToken, createableField);
    this._queryUrl = _urlParser(
      Ressource.getQueryUrl(`${api_url}${url}`),
      params
    );
    this.id = "";
    this.name = "";
    this.created_at = "";
    this.update_at = "";
    this.token = "";
  }

  static get(params: APITokenGetParams, customUrl: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<ApiToken>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: APITokenQueryParams) {
    const { api_url } = getConfig();
    const { userId } = params;

    return super._query<ApiToken>(
      Ressource.getQueryUrl(`${api_url}${url}`, userId),
      params,
      paramDefaults
    );
  }

  // @ts-ignore
  // @deprecated use deleteWithParams instead
  delete(params: APITokenQueryParams) {
    const url = `${_urlParser(this._queryUrl, { ...params })}/${this.id}`;

    return super.delete(url);
  }

  deleteWithParams(params: APITokenQueryParams) {
    const url = `${_urlParser(this._queryUrl, { ...params })}/${this.id}`;

    return super.delete(url);
  }
}
