import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current";

export type DeploymentGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class Deployment extends Ressource {
  id: string;
  webapps: object;
  services: object;
  workers: object;
  routes: object;

  constructor(deployment: APIObject, url: string) {
    super(url, paramDefaults, {}, deployment);
    this.webapps = {};
    this.services = {};
    this.workers = {};
    this.routes = {};
    this.id = "";
  }

  static async get(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
