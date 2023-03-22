import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import request from "../api";
import _urlParser from "../urlParser";

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

export interface AuthUserParams {
  id?: string;
  [index: string]: any;
}

export default class AuthUser extends Ressource {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: string;
  picture: string;
  website: string;
  country: string;
  company: string;
  mfa_enabled: string;
  deactivated: string;
  created_at: string;
  updated_at: string;

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
    this.id = "";
    this.username = "";
    this.first_name = "";
    this.last_name = "";
    this.email = "";
    this.email_verified = "";
    this.picture = "";
    this.website = "";
    this.country = "";
    this.company = "";
    this.mfa_enabled = "";
    this.deactivated = "";
    this.created_at = "";
    this.updated_at = "";
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
