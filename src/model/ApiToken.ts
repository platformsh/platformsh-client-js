import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { ParamsType, APIObject } from "./Ressource";
import Ressource from "./Ressource";

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

export type APITokenGetParams = {
  [index: string]: any;
  id?: string;
};

export type APITokenQueryParams = {
  [index: string]: any;
  userId?: string;
};

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

  static async get(params: APITokenGetParams, customUrl: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<ApiToken>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: APITokenQueryParams) {
    const { api_url } = getConfig();

    return super._query<ApiToken>(
      Ressource.getQueryUrl(`${api_url}${url}`),
      params,
      paramDefaults
    );
  }

  // @ts-expect-error @deprecated use deleteWithParams instead
  async delete(params: APITokenQueryParams) {
    return super.delete(
      `${_urlParser(this._queryUrl, { ...params })}/${this.id}`
    );
  }

  async deleteWithParams(params: APITokenQueryParams) {
    return super.delete(
      `${_urlParser(this._queryUrl, { ...params })}/${this.id}`
    );
  }
}
