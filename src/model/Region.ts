import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/platform/regions";
const paramDefaults = {};

export type RegionGetParams = Record<string, any>;

export type RegionResponse = {
  regions: Region[];
};

export class Region extends Ressource {
  id: string;
  available: boolean;
  endpoint: string;
  label: string;
  private: boolean;
  provider: Record<string, any>;
  zone: string;
  project_label: string;
  environmental_impact: {
    carbon_intensity: number;
    zone?: string;
    green?: boolean;
  };

  constructor(region: APIObject) {
    const { id } = region;
    const { account_url } = getConfig();

    super(`${account_url}${url}`, paramDefaults, { id }, region);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = region.id;
    this.available = region.available;
    this.endpoint = region.endpoint;
    this.label = region.label;
    this.private = region.private ?? true;
    this.provider = region.provider ?? {};
    this.zone = region.zone;
    this.project_label = region.project_label;
    this.environmental_impact = region.environmental_impact ?? {
      carbon_intensity: 0
    };
  }

  static async query(params: RegionGetParams) {
    const { account_url } = getConfig();

    return super._query<Region>(
      `${account_url}${url}`,
      {},
      paramDefaults,
      params,
      data => (data as RegionResponse).regions
    );
  }
}
