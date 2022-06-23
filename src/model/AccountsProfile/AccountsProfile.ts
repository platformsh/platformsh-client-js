import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import _urlParser from "../../urlParser";
import { AccountsProfileGetParams, ProfileType } from "./types";
import { autoImplementWithResources } from "../utils";

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

class AccountsProfile extends autoImplementWithResources()<ProfileType>() {
 
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
  }

  static get(params: AccountsProfileGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<AccountsProfile>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async update(id: string, data: Partial<ProfileType>) {
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

  static updateProfilePicture(userId: string, picture: FormData) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "POST", picture);
  }

  static async deleteProfilePicture(userId: string) {
    const { api_url } = getConfig();
    return request(`${api_url}/v1/profile/${userId}/picture`, "DELETE");
  }
}

export default AccountsProfile

