import Ressource from "./Ressource";
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

export default class AuthUser extends Ressource {
  constructor(user, customUrl, params, config) {
    const { id } = user;

    super(
      `:api_url${url}`,
      paramDefaults,
      {},
      user,
      createableField,
      modifiableField,
      config
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

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${url}`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static async update(id, data, config) {
    const conf = super.getConfig(config);
    const endpoint = `${conf.api_url}${_urlParser(url, { id })}`;

    const updatedProfile = await request(endpoint, "PATCH", data, conf);
    return new AuthUser(updatedProfile, conf);
  }

  static async updateEmailAddress(id, emailAddress, config) {
    const conf = super.getConfig(config);
    const endpoint = `${conf.api_url}${_urlParser(url, { id })}/emailaddress`;
    return await request(
      endpoint,
      "POST",
      {
        email_address: emailAddress
      },
      conf
    );
  }
  static async getUserByUsername(username, config) {
    const conf = super.getConfig(config);

    const user = await request(
      `${conf.api_url}/users/username=${username}`,
      "GET",
      {},
      conf
    );

    return new AuthUser(user);
  }
}
