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
  constructor(profile) {
    const { api_url } = getConfig();
    const { id } = profile;

    super(
      `${api_url}${url}`,
      paramDefaults,
      {},
      profile,
      createableField,
      modifiableField
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
    return new AccountsProfile(updatedProfile);
  }

  static async getUserByUsername(username) {
    const { api_url } = getConfig();

    const user = await request(
      `${api_url}/v1/profiles?filter[username]=${username}`
    );

    return new AccountsProfile(user.profiles[0]);
  }

  static updateProfilePicture(userId, picture) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "POST", picture);
  }

  static async deleteProfilePicture(userId) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "DELETE");
  }
}
