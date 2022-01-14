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
  constructor(user) {
    const { api_url } = getConfig();
    const { id } = user;

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

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async update(id, data) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${_urlParser(url, { id })}`;

    const updatedProfile = await request(endpoint, "PATCH", data);
    return new AuthUser(updatedProfile);
  }

  static async updateEmailAddress(id, emailAddress) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${_urlParser(url, { id })}/emailaddress`;
    return await request(endpoint, "POST", {
      email_address: emailAddress
    });
  }
  static async getUserByUsername(username) {
    const { api_url } = getConfig();

    const user = await request(`${api_url}/users/username=${username}`);

    return new AuthUser(user);
  }
}
