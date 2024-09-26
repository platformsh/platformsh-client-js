import { authenticatedRequest } from "../api";
import { getConfig } from "../config";
import { urlParser } from "../urlParser";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

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

export type AuthUserParams = {
  [index: string]: any;
  id?: string;
};

export class AuthUser extends Ressource {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  phone_number_verified: boolean;
  picture: string;
  website: string;
  country: string;
  company: string;
  mfa_enabled: boolean;
  sso_enabled: boolean;
  deactivated: boolean;
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
    this.id = user.id;
    this.username = user.username;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.email_verified = user.email_verified;
    this.phone_number_verified = user.phone_number_verified;
    this.picture = user.picture;
    this.website = user.website;
    this.country = user.country;
    this.company = user.company;
    this.mfa_enabled = user.mfa_enabled;
    this.sso_enabled = user.sso_enabled;
    this.deactivated = user.deactivated;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }

  static async get(params: AuthUserParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<AuthUser>(
      customUrl ?? `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async update(id: string, data: Partial<AuthUser>) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${urlParser(url, { id })}`;

    const updatedProfile = await authenticatedRequest(endpoint, "PATCH", data);
    return new AuthUser(updatedProfile);
  }

  static async updateEmailAddress(id: string, emailAddress: string) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${urlParser(url, { id })}/emailaddress`;
    return authenticatedRequest(endpoint, "POST", {
      email_address: emailAddress
    });
  }

  static async getUserByUsername(username: string) {
    const { api_url } = getConfig();

    const user = await authenticatedRequest(
      `${api_url}/users/username=${username}`
    );

    return new AuthUser(user);
  }
}
