import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url =
  "/projects/:projectId/environments/:environmentId/deployments/current/topology";

export interface TopologyGetParams {
  projectId: string;
  environmentId: string;
  [key: string]: any;
};

export default class Topology extends Ressource {
  id: string;
  name: string;
  constraints: Record<string, string>;
  services: Record<string, object>;
  
  constructor(topology: APIObject, url: string) {
    super(url, paramDefaults, {}, topology);
    this.id = topology.id;
    this.name = topology.name;
    this.constraints = topology.constraints;
    this.services = topology.services;
  }

  static get(params: TopologyGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Topology>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
