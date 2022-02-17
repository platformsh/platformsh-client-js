import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const url = "/platform/regions";
const paramDefaults = {};

export interface RegionGetParams {
  [key: string]: any;
};

export interface RegionResponse {
  regions: Array<Region>
};

export default class Region extends Ressource {
  id: string;
  available: boolean;
  endpoint: string;
  label: string;
  private: boolean;
  provider: string;
  zone: string;
  project_label: string;
  
  constructor(region: APIObject) {
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
    this.project_label = "";
  }

  static query(params: RegionGetParams) {
    const { account_url } = getConfig();

    return super._query(
      `${account_url}${url}`,
      {},
      paramDefaults,
      params,
      data => (data as RegionResponse).regions
    );
  }
}
