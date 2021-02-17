import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/regions";
const paramDefaults = {};

export default class Region extends Ressource {
  constructor(region, config) {
    const { id } = region;
    const { account_url } = getConfig();

    super(`${config.account_url}${url}`, paramDefaults, { id }, region, config);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = "";
    this.available = false;
    this.endpoint = "";
    this.label = "";
    this.private = true;
    this.provider = "";
    this.zone = "";
  }

  static query(params, config) {
    return super.query(
      `:account_url${url}`,
      {},
      super.getConfig(config),
      params
    );
  }
}
