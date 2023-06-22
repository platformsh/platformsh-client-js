import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current";
const modifiableField = ["services", "webapps"];

export type DeploymentGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

type DeploymentUpdateParams = {
  projectId: string;
  environmentId: string;
  services?: any;
  webapps?: any;
};

export default class Deployment extends Ressource {
  id: string;
  webapps: object;
  services: object;
  workers: object;
  routes: object;

  constructor(deployment: APIObject, url: string) {
    super(url, paramDefaults, {}, deployment, [], modifiableField);
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

  async update(params: DeploymentUpdateParams, customUrl?: string) {
    const { projectId, environmentId, ...data } = params;
    const { api_url } = getConfig();

    const url =
      customUrl ??
      `${api_url}/projects/${projectId}/environments/${environmentId}/deployments/next`;

    return super.update(data, url);
  }
}
