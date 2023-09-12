import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import Result from "./Result";

const paramDefaults = {};

const modifiableField = ["services", "webapps", "workers"];

export type DeploymentGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export type DeploymentUpdateParams = {
  services?: any;
  webapps?: any;
  workers?: any;
};

type RunRuntimeOpParams = {
  projectId: string;
  deploymentId: string;
  environmentId: string;
  service: string;
  operation: string;
};

export default class Deployment extends Ressource {
  id: string;
  webapps: object;
  services: object;
  workers: object;
  routes: object;
  project_info: object;
  environment_info: object;
  fingerprint: string;
  container_profiles: Record<
    string,
    Record<
      string,
      {
        cpu: number;
        memory: number;
      }
    >
  >;

  variables: {
    name: string;
    value: string;
    is_sensitive: boolean;
  }[];

  constructor(deployment: APIObject, url: string) {
    super(url, paramDefaults, {}, deployment, [], modifiableField);
    this.webapps = {};
    this.services = {};
    this.workers = {};
    this.routes = {};
    this.container_profiles = {};
    this.variables = [];
    this.project_info = {};
    this.environment_info = {};
    this.fingerprint = "";
    this.id = "";
  }

  static async get(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl ??
        `${api_url}/projects/:projectId/environments/:environmentId/deployments/current`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async getNext(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl ??
        `${api_url}/projects/:projectId/environments/:environmentId/deployments/next`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async run(params: RunRuntimeOpParams) {
    const { api_url } = getConfig();
    const { projectId, deploymentId, environmentId, service, operation } =
      params;
    const body: Record<string, any> = {
      operation,
      service
    };
    const url = `${api_url}/projects/${projectId}/environments/${environmentId}/deployments/${deploymentId}/operations`;

    return request(url, "POST", body).then(data => {
      const result = new Result(data, url);
      const activities = result.getActivities();

      if (activities.length !== 1) {
        throw new Error(`Expected one activity, found ${activities.length}`);
      }

      return activities[0];
    });
  }
}
