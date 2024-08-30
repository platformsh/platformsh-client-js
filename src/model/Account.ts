import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/platform/users/:id";
const paramDefaults = {};

export type AccountGetParams = {
  [index: string]: any;
  id?: string | string[];
};

export default class Account extends Ressource {
  id: string;
  created_at: string;
  updated_at: string;
  has_key: boolean;
  display_name: string;
  email: string;
  picture: string;
  roles: string[];

  constructor(account: APIObject) {
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
    this.roles = [];
  }

  static async get(params: AccountGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { account_url } = getConfig();

    return super._get<Account>(
      customUrl ?? `${account_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: AccountGetParams) {
    const { account_url } = getConfig();

    return super._query<Account>(
      this.getQueryUrl(`${account_url}${url}`),
      {},
      paramDefaults,
      params
    );
  }
}
