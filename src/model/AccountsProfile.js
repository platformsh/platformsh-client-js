import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";
import _urlParser from "../urlParser";

const url = "/platform/profiles/:id";
const paramDefaults = {};
const createableField = [
  "id",
  "display_name",
  "email",
  "username",
  "picture",
  "company_type",
  "company_role",
  "company_name",
  "website_url",
  "new_ui",
  "ui_colorscheme",
  "ui_contrast",
  "default_catalog",
  "marketing"
];
const modifiableField = [
  "display_name",
  "username",
  "picture",
  "company_type",
  "company_role",
  "company_name",
  "website_url",
  "new_ui",
  "ui_colorscheme",
  "ui_contrast",
  "default_catalog",
  "marketing"
];

export default class AccountsProfile extends Ressource {
  constructor(profile, customUrl, params, config) {
    const { id } = profile;

    super(
      `:api_url${url}`,
      paramDefaults,
      {},
      profile,
      createableField,
      modifiableField,
      config
    );
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.display_name = "";
    this.email = "";
    this.username = "";
    this.picture = "";
    this.company_type = "";
    this.company_role = "";
    this.company_name = "";
    this.website_url = "";
    this.new_ui = "";
    this.ui_colorscheme = "";
    this.ui_contrast = "";
    this.default_catalog = "";
    this.marketing = "";
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
    return new AccountsProfile(updatedProfile, conf);
  }

  static async getUserByUsername(username, config) {
    const conf = super.getConfig(config);

    const user = await request(
      `${conf.api_url}/v1/profiles?filter[username]=${username}`,
      "GET",
      {},
      conf
    );

    return new AccountsProfile(user.profiles[0], conf);
  }

  static updateProfilePicture(userId, picture, config) {
    const conf = super.getConfig(config);
    return request(
      `${conf.api_url}/v1/profile/${userId}/picture`,
      "POST",
      picture,
      conf
    );
  }

  static async deleteProfilePicture(userId, config) {
    const conf = super.getConfig(config);
    return request(
      `${conf.api_url}/v1/profile/${userId}/picture`,
      "DELETE",
      conf
    );
  }
}
