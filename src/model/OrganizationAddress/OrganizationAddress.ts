import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import _urlParser from "../../urlParser";

import { autoImplementWithResources } from "../utils";
import { AddressType, OrganizationAddressGetParams, OrganizationAddressQueryParams } from "./types";

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


export default class OrganizationAddress extends autoImplementWithResources()<AddressType>() {

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
  }

  static getQueryUrl(_url: string, id: string) {
    return _urlParser(_url, { id });
  }

  static get(params: OrganizationAddressGetParams, customUrl?: string) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    let getURL = customUrl || `${api_url}${url}`;

    if (id) {
      getURL = this.getQueryUrl(customUrl || `${api_url}${url}`, id)
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
