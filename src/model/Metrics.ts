import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/metrics";

export interface MetricsGetParams {
  projectId?: string;
  environmentId?: string;
  [key: string]: any;
}

export default class Metrics extends Ressource {
  results = {};

  constructor(metrics: APIObject, url: string) {
    super(url, paramDefaults, {}, metrics);
  }

  static get(params: MetricsGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Metrics>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
