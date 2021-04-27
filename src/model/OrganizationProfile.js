import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/profile";
const paramDefaults = {};
const createableField = ["default_catalog", "marketing"];
const modifiableField = ["default_catalog", "marketing"];

export default class OrganizationProfile extends Ressource {
  constructor(profile, customUrl) {
    const { api_url } = getConfig();

    super(
      customUrl || `${api_url}${url}`,
      paramDefaults,
      { organizationId: profile.organizationId },
      profile,
      createableField,
      modifiableField
    );

    this.stripe = {};
    this.security_contact = "";
    this.vat_number = "";
    this.billing_contact = "";
    this.default_catalog = "";
  }

  static get(params) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(`${api_url}${url}`, { organizationId }, {}, queryParams);
  }
}
