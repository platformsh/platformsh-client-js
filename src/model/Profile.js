import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/profiles/:id";
const paramDefaults = {};
const modifiableField = [
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

export default class Profile extends Ressource {
  constructor(id) {
    const { api_url } = getConfig();
    super(`${api_url}${url}`, {}, { id }, [], modifiableField);
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

    debugger;
    return super.get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }
}
