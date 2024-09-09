import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

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

export type AccountsProfileGetParams = {
  [index: string]: any;
  id: string;
};

export default class AccountsProfile extends Ressource {
  id: string;
  display_name: string;
  email: string;
  username: string;
  picture: string;
  company_type: string;
  company_role: string;
  company_name: string;
  website_url: string;
  new_ui: boolean;
  ui_colorscheme: string;
  ui_contrast: string;
  default_catalog: string;
  marketing: boolean;
  billing_contact: string;
  vat_number: string;

  constructor(profile: APIObject) {
    const { api_url } = getConfig();

    super(
      `${api_url}${url}`,
      paramDefaults,
      {},
      profile,
      createableField,
      modifiableField
    );
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = profile.id;
    this.display_name = profile.display_name;
    this.email = profile.email;
    this.username = profile.username;
    this.picture = profile.picture;
    this.company_type = profile.company_type;
    this.company_role = profile.company_role;
    this.company_name = profile.company_name;
    this.website_url = profile.website_url;
    this.new_ui = profile.new_ui ?? true;
    this.ui_colorscheme = profile.ui_colorscheme;
    this.ui_contrast = profile.ui_contrast;
    this.default_catalog = profile.default_catalog;
    this.marketing = profile.marketing;
    this.billing_contact = profile.billing_contact;
    this.vat_number = profile.vat_number;
  }

  static async get(params: AccountsProfileGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<AccountsProfile>(
      customUrl ?? `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async update(id: string, data: APIObject) {
    const { api_url } = getConfig();
    const endpoint = `${api_url}${_urlParser(url, { id })}`;

    const updatedProfile = await request(endpoint, "PATCH", data);
    return new AccountsProfile(updatedProfile);
  }

  static async getUserByUsername(username: string) {
    const { api_url } = getConfig();

    const user = await request(
      `${api_url}/v1/profiles?filter[username]=${username}`
    );

    return new AccountsProfile(user.profiles[0]);
  }

  static async updateProfilePicture(userId: string, picture: FormData) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "POST", picture);
  }

  static async deleteProfilePicture(userId: string) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "DELETE");
  }
}
