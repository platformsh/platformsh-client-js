import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import _urlParser from "../../urlParser";
import { autoImplementWithResources } from "../utils";

import { AuthUserParams, UserType} from "./types";

const url = "/users/:id";
const paramDefaults = {};

const createableField = [
  "username",
  "first_name",
  "last_name",
  "email",
  "picture",
  "website",
  "country",
  "company"
];

const modifiableField = [
  "first_name",
  "last_name",
  "username",
  "picture",
  "company",
  "website"
];

export default class AuthUser extends autoImplementWithResources()<UserType>() {

  constructor(user: APIObject) {
    const { api_url } = getConfig();

    super(
      `${api_url}${url}`,
      paramDefaults,
      {},
      user,
      createableField,
      modifiableField
    );
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static get(params: AuthUserParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<AuthUser>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async update(id: string, data: AuthUser) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${_urlParser(url, { id })}`;

    const updatedProfile = await request(endpoint, "PATCH", data);
    return new AuthUser(updatedProfile);
  }

  static async updateEmailAddress(id: string, emailAddress: string) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${_urlParser(url, { id })}/emailaddress`;
    return await request(endpoint, "POST", {
      email_address: emailAddress
    });
  }
  static async getUserByUsername(username: string) {
    const { api_url } = getConfig();

    const user = await request(`${api_url}/users/username=${username}`);

    return new AuthUser(user);
  }
}
