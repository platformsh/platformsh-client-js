import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { DeploymentType, DeploymentGetParams } from "./types";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current";

export default class Deployment extends autoImplementWithResources()<DeploymentType>() {

  constructor(deployment: APIObject, url: string) {
    super(url, paramDefaults, {}, deployment);
  }

  static get(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
