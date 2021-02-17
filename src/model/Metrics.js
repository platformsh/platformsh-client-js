import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/metrics";

export default class Metrics extends Ressource {
  constructor(metrics, url, config) {
    super(url, paramDefaults, {}, metrics, [], [], config);
    this.results = {};
  }

  static get(params = {}, customUrl, config) {
    const { projectId, environmentId, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${_url}`,
      { projectId, environmentId },
      super.getConfig(config),
      queryParams
    );
  }
}
