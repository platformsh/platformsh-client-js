import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current/topology";

export type TopologyGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class Topology extends Ressource {
  id: string;
  name: string;
  constraints: Record<string, string>;
  services: Record<string, object>;

  constructor(topology: APIObject, url: string) {
    super(url, paramDefaults, {}, topology);
    this.id = "";
    this.name = "";
    this.constraints = {};
    this.services = {};
  }

  static async get(params: TopologyGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Topology>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
