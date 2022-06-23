import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { UserType, UserGetParams, UserQueryParams  } from "./types";

const _url = "/api/users";
const paramDefaults = {};

export default class User extends autoImplementWithResources()<UserType>() {

  constructor(user: APIObject, url = `${_url}/:id`, modifiableField: Array<string> = []) {
    const { id } = user;

    super(url, paramDefaults, { id }, user, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static get(params: UserGetParams, customUrl?: string, options?: object) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

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
