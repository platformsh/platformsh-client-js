import Ressource from "./Ressource";
import { getConfig } from "../config";

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
  constructor(profile) {
    const { api_url } = getConfig();
    const { id } = profile;

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

    return super.get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  update(data) {
    return super.update(data, this.getLink("self"));
  }
}
