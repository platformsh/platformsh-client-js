import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/address";
const paramDefaults = {};

const _modifiableField = [
  "country",
  "name_line",
  "premise",
  "sub_premise",
  "thoroughfare",
  "administrative_area",
  "sub_administrative_area",
  "locality",
  "dependent_locality",
  "postal_code"
];

export type OrganizationAddressGetParams = {
  [key: string]: any;
  id?: string;
  organizationId: string;
};

export type OrganizationAddressQueryParams = {
  [key: string]: any;
  organizationId: string;
};

export default class OrganizationAddress extends Ressource {
  id: string;
  country: string;
  name_line: string;
  premise: string;
  sub_premise: string;
  thoroughfare: string;
  administrative_area: string;
  sub_administrative_area: string;
  locality: string;
  dependent_locality: string;
  postal_code: string;

  constructor(account: APIObject, customUrl?: string) {
    const { id } = account;
    const { account_url } = getConfig();

    super(
      customUrl ?? `${account_url}${url}`,
      paramDefaults,
      { id },
      account,
      [],
      _modifiableField
    );
    this._queryUrl = Ressource.getQueryUrl(`${account_url}${url}`);
    this.id = account.id ?? "";
    this.country = account.country ?? "";
    this.name_line = account.name_line ?? "";
    this.premise = account.premise ?? "";
    this.sub_premise = account.sub_premise ?? "";
    this.thoroughfare = account.thoroughfare ?? "";
    this.administrative_area = account.administrative_area ?? "";
    this.sub_administrative_area = account.sub_administrative_area ?? "";
    this.locality = account.locality ?? "";
    this.dependent_locality = account.dependent_locality ?? "";
    this.postal_code = account.postal_code ?? "";
  }

  static getQueryUrl(_url: string, id: string) {
    return _urlParser(_url, { id });
  }

  static async get(params: OrganizationAddressGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    let getURL = customUrl ?? `${api_url}${url}`;

    if (id) {
      getURL = this.getQueryUrl(customUrl ?? `${api_url}${url}`, id);
    }

    return super._get<OrganizationAddress>(
      getURL,
      { organizationId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: OrganizationAddressQueryParams) {
    const { api_url } = getConfig();
    const { organizationId } = params;

    return super._get<OrganizationAddress>(
      `${api_url}${url}`,
      { organizationId },
      paramDefaults,
      params
    );
  }

  async update(address: APIObject, organizationId: string) {
    const { api_url } = getConfig();
    return super.update(
      address,
      _urlParser(`${api_url}${url}`, { organizationId }, {})
    );
  }
}
