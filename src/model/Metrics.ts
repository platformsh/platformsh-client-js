import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/metrics";

export type MetricsGetParams = {
  [key: string]: any;
  projectId?: string;
  environmentId?: string;
};

export default class Metrics extends Ressource {
  results = {};

  constructor(metrics: APIObject, url: string) {
    super(url, paramDefaults, {}, metrics);
  }

  static async get(params: MetricsGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Metrics>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
