import { APIObject } from "../Ressource";
import { getConfig } from "../../config";

import { ProfileType, OrganizationProfilGetParams } from "./types";
import { autoImplementWithResources } from "../utils";

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
  "website_url"
];

export default class OrganizationProfile extends autoImplementWithResources()<ProfileType>() {
  constructor(profile: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl || `${api_url}${url}`,
      paramDefaults,
      { organizationId: profile.organizationId },
      profile,
      createableField,
      modifiableField
    );
  }

  static get(params: OrganizationProfilGetParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationProfile>(`${api_url}${url}`, { organizationId }, {}, queryParams);
  }
}
