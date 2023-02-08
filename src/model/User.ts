import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const _url = "/api/users";
const paramDefaults = {};

export interface UserGetParams {
  id: string;
  [key: string]: any;
}

export interface UserQueryParams {
  projectId: string;
  environmentId: string;
  [key: string]: any;
}

export default class User extends Ressource {
  id: string;
  created_at: string;
  updated_at: string;
  has_key: boolean;
  display_name: string;
  email: string;
  username: string;  
  picture: string;

  constructor(
    user: APIObject,
    url = `${_url}/:id`,
    modifiableField: Array<string> = []
  ) {
    const { id } = user;

    super(url, paramDefaults, { id }, user, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.created_at = "";
    this.updated_at = "";
    this.has_key = false;
    this.display_name = "";
    this.email = "";
    this.username = "";
    this.picture = "";
  }

  static get(params: UserGetParams, customUrl?: string, options?: object) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();
    console.log({ params });
    return super._get<User>(
      customUrl || `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams,
      options
    );
  }

  static query(params: UserQueryParams, customUrl?: string) {
    const { api_url } = getConfig();

    return super._query<User>(
      this.getQueryUrl(customUrl || `${api_url}${_url}`),
      {},
      paramDefaults,
      params
    );
  }
}
