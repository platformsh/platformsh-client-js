import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current";

export default class Deployment extends Ressource {
  constructor(deployment, url, config) {
    super(url, paramDefaults, {}, deployment, [], [], config);
    this.webapps = {};
    this.services = {};
    this.workers = {};
    this.routes = {};
    this.id = "";
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
