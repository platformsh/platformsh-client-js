import Ressource from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

const url = "/v1/profiles/:id/address";
const paramDefaults = {};

export default class Address extends Ressource {
  constructor(account) {
    const { id } = account;
    const { account_url } = getConfig();

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

    super(
      `${account_url}${url}`,
      paramDefaults,
      { id },
      account,
      [],
      _modifiableField
    );
    this._queryUrl = Address.getQueryUrl(`${account_url}${url}`, id);
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

  static getQueryUrl(_url, id) {
    return _urlParser(_url, { id });
  }

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      this.getQueryUrl(customUrl || `${api_url}${url}`, id),
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { api_url } = getConfig();
    const { id } = params;

    return super._query(
      this.getQueryUrl(`${api_url}${url}`, id),
      {},
      paramDefaults,
      params
    );
  }

  update(address, id) {
    const { api_url } = getConfig();
    return super.update(address, Address.getQueryUrl(`${api_url}${url}`, id));
  }
}
