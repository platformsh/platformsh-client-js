import Ressource from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

const url = "/v1/profiles/:id/address";
const paramDefaults = {};

export default class Address extends Ressource {
  constructor(account, config) {
    const { id } = account;

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
      `:account_url${url}`,
      paramDefaults,
      { id },
      account,
      [],
      _modifiableField,
      config
    );
    this._queryUrl = Address.getQueryUrl(`${conf.account_url}${url}`, id);
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

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      this.getQueryUrl(customUrl || `:api_url${url}`, id),
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params) {
    const { id } = params;

    return super.query(
      this.getQueryUrl(`:api_url${url}`, id),
      {},
      super.getConfig(config),
      params
    );
  }

  update(address, id) {
    const { api_url } = this.getConfig();
    return super.update(address, Address.getQueryUrl(`${api_url}${url}`, id));
  }
}
