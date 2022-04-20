import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";

import { RegionGetParams, RegionResponse, RegionType } from "./types";
import { autoImplementWithResources } from "../utils";

const url = "/platform/regions";
const paramDefaults = {};

export default class Region extends autoImplementWithResources()<RegionType>() {
  
  constructor(region: APIObject) {
    const { id } = region;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, region);
    this._queryUrl = Ressource.getQueryUrl(url);
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
