import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current";

export default class Deployment extends Ressource {
  constructor(deployment, url) {
    super(url, paramDefaults, {}, deployment);
    this.webapps = {};
    this.services = {};
    this.workers = {};
    this.routes = {};
    this.id = "";
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
