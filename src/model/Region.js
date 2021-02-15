import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/regions";
const paramDefaults = {};

export default class Region extends Ressource {
  constructor(region) {
    const { id } = region;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, region);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.available = false;
    this.endpoint = "";
    this.label = "";
    this.private = true;
    this.provider = "";
    this.zone = "";
  }

  static query(params) {
    const { account_url } = getConfig();

    return super.query(`${account_url}${url}`, {}, paramDefaults, params);
  }
}
