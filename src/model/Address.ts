import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/profiles/:id/address";
const paramDefaults = {};

export type AddressParams = {
  [index: string]: any;
  id: string;
};

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

export default class Address extends Ressource {
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

  constructor(address: APIObject) {
    const { id } = address;
    const { account_url } = getConfig();

    super(
      `${account_url}${url}`,
      paramDefaults,
      { id },
      address,
      [],
      _modifiableField
    );
    this._queryUrl = Address.getQueryUrl(`${account_url}${url}`, id);
    this.id = address.id;
    this.country = address.country;
    this.name_line = address.name_line;
    this.premise = address.premise;
    this.sub_premise = address.sub_premise;
    this.thoroughfare = address.thoroughfare;
    this.administrative_area = address.administrative_area;
    this.sub_administrative_area = address.sub_administrative_area;
    this.locality = address.locality;
    this.dependent_locality = address.dependent_locality;
    this.postal_code = address.postal_code;
  }

  static getQueryUrl(_url: string, id?: string) {
    if (id) {
      return _urlParser(_url, { id });
    }
    return "";
  }

  static async get(params: AddressParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Address>(
      this.getQueryUrl(customUrl ?? `${api_url}${url}`, id),
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: AddressParams) {
    const { api_url } = getConfig();
    const { id } = params;

    return super._query<Address>(
      this.getQueryUrl(`${api_url}${url}`, id),
      {},
      paramDefaults,
      params
    );
  }

  async update(address: APIObject, id?: string) {
    const { api_url } = getConfig();

    let updateURL = `${api_url}${url}`;

    if (id) {
      updateURL = Address.getQueryUrl(updateURL, id);
    }

    return super.update(address, updateURL);
  }
}
