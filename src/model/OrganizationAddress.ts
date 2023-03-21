import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

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

export interface OrganizationAddressGetParams {
  id?: string;
  organizationId: string;
  [key: string]: any;
}

export interface OrganizationAddressQueryParams {
  organizationId: string;
  [key: string]: any;
}

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
      customUrl || `${account_url}${url}`,
      paramDefaults,
      { id },
      account,
      [],
      _modifiableField
    );
    this._queryUrl = Ressource.getQueryUrl(`${account_url}${url}`, id);
    this.id = "";
    this.country = "";
    this.name_line = "";
    this.premise = "";
    this.sub_premise = "";
    this.thoroughfare = "";
    this.administrative_area = "";
    this.sub_administrative_area = "";
    this.locality = "";
    this.dependent_locality = "";
    this.postal_code = "";
  }

  static getQueryUrl(_url: string, id: string) {
    return _urlParser(_url, { id });
  }

  static get(params: OrganizationAddressGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    let getURL = customUrl || `${api_url}${url}`;

    if (id) {
      getURL = this.getQueryUrl(customUrl || `${api_url}${url}`, id);
    }

    return super._get<OrganizationAddress>(
      getURL,
      { organizationId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: OrganizationAddressQueryParams) {
    const { api_url } = getConfig();
    const { organizationId } = params;

    return super._get<OrganizationAddress>(
      `${api_url}${url}`,
      { organizationId },
      paramDefaults,
      params
    );
  }

  update(address: APIObject, organizationId: string) {
    const { api_url } = getConfig();
    return super.update(
      address,
      _urlParser(`${api_url}${url}`, { organizationId }, {})
    );
  }
}
