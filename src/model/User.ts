import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const _url = "/api/users";
const paramDefaults = {};

export type UserGetParams = {
  [key: string]: any;
  id: string;
};

export type UserQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class User extends Ressource {
  id: string;
  created_at: string;
  updated_at: string;
  has_key: boolean;
  display_name: string;
  email: string;
  username: string;

  constructor(
    user: APIObject,
    url = `${_url}/:id`,
    modifiableField: string[] = []
  ) {
    const { id } = user;

    super(url, paramDefaults, { id }, user, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = id;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.has_key = user.has_key;
    this.display_name = user.display_name;
    this.email = user.email;
    this.username = user.username;
  }

  static async get(
    params: UserGetParams,
    customUrl?: string,
    options?: object
  ) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<User>(
      customUrl ?? `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams,
      options
    );
  }

  static async query(params: UserQueryParams, customUrl?: string) {
    const { api_url } = getConfig();

    return super._query<User>(
      this.getQueryUrl(customUrl ?? `${api_url}${_url}`),
      {},
      paramDefaults,
      params
    );
  }
}
