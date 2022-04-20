import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";

import { MetricsGetParams } from "./types";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/metrics";

export default class Metrics extends Ressource {
  results: Record<string, any>;

  constructor(metrics: APIObject, url: string) {
    super(url, paramDefaults, {}, metrics);

    this.results = metrics.results;
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
