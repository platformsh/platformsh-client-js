import { getConfig } from "../config";
import { urlParser } from "../urlParser";

import type { ParamsType, APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/users/:userId/api-tokens/:id";
const paramDefaults = {};

const createableField = [
  "id",
  "name",
  "created_at",
  "updated_at",
  "last_used_at",
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

export class ApiToken extends Ressource {
  id: string;
  name: string;
  created_at: string;
  update_at: string;
  last_used_at: string | null;
  token: string;

  constructor(apiToken: APIObject, params: ParamsType) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, params, {}, apiToken, createableField);
    this._queryUrl = urlParser(
      Ressource.getQueryUrl(`${api_url}${url}`),
      params
    );
    this.id = apiToken.id;
    this.name = apiToken.name;
    this.created_at = apiToken.created_at;
    this.update_at = apiToken.update_at;
    this.last_used_at = apiToken.last_used_at;
    this.token = apiToken.token;
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

  /**
   * @deprecated use deleteWithParams instead
   */
  // @ts-expect-error deprecated
  async delete(params: APITokenQueryParams) {
    return super.delete(
      `${urlParser(this._queryUrl, { ...params })}/${this.id}`
    );
  }

  async deleteWithParams(params: APITokenQueryParams) {
    return super.delete(
      `${urlParser(this._queryUrl, { ...params })}/${this.id}`
    );
  }
}
