import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/metrics";

export default class Metrics extends Ressource {
  constructor(metrics, url) {
    super(url, paramDefaults, {}, metrics);
    this.results = {};
  }

  static get(params = {}, customUrl) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
