import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/profile";
const paramDefaults = {};
const createableField = [
  "default_catalog",
  "marketing",
  "company_name",
  "security_contact",
  "website_url"
];
const modifiableField = [
  "default_catalog",
  "marketing",
  "company_name",
  "security_contact",
  "website_url",
  "vat_number",
  "billing_contact"
];

export type OrganizationProfilGetParams = {
  [key: string]: any;
  organizationId: string;
};

export default class OrganizationProfile extends Ressource {
  stripe: object;
  security_contact: string;
  vat_number: string;
  billing_contact: string;
  default_catalog: string;
  company_name: string;
  current_trial: Record<string, any>;
  resources_limit: Record<string, any>;
  website_url: string;
  account_tier: string;
  currency: string;
  invoiced?: boolean;

  constructor(profile: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
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
    this.company_name = "";
    this.website_url = "";
    this.current_trial = {};
    this.resources_limit = {};
    this.account_tier = "";
    this.currency = "";
  }

  static async get(params: OrganizationProfilGetParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationProfile>(
      `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }
}
