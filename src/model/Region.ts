import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/regions";
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
  provider: {
    name: string;
    logo: string;
  };

  zone: string;
  project_label: string;
  environmental_impact: {
    carbon_intensity: number;
    zone?: string;
    green?: boolean;
  };

  selection_label?: string;
  timezone?: string;
  datacenter?: {
    name: string;
    label: string;
    location: string;
  };

  constructor(region: APIObject) {
    const { id } = region;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, region);
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
    this.selection_label = region.selection_label;
    this.timezone = region.timezone;
    this.datacenter = region.datacenter;
  }

  static async query(params: RegionGetParams) {
    const { api_url } = getConfig();

    return super._query<Region>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      params,
      data => (data as RegionResponse).regions
    );
  }
}
