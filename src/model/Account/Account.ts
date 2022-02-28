import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { CurrentUserType } from "./types";

const url = "/platform/users/:id";
const paramDefaults = {};

export interface AccountGetParams {
  id?: string,
  [index: string]: any
};

class Account extends Ressource {

  constructor(account: APIObject) {
    const { id } = account;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);
  
  }

  static get(params: AccountGetParams, customUrl?: string): Promise<Account> {
    const { id, ...queryParams } = params;
    const { account_url } = getConfig();

    return super._get<Account>(
      customUrl || `${account_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: AccountGetParams): Promise<Account[]> {
    const { account_url } = getConfig();

    return super._query<Account>(
      this.getQueryUrl(`${account_url}${url}`),
      {},
      paramDefaults,
      params
    );
  }
}


interface AccountInterface  {
  new (account: APIObject): Account & CurrentUserType;
  query(params: AccountGetParams): Promise<Account[]>
  get(params: AccountGetParams, customUrl?: string | undefined): Promise<Account>
}

const _Account:AccountInterface = Account as any

export default _Account
