import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import ProjectAccess from "./ProjectAccess";

import request from "../api";

const url = "/projects/:projectId/environment-types/:id";
const paramDefaults = {};

export interface EnvironmentTypeGetParams {
  id: string;
  [key: string]: any;
};

export interface EnvironmentTypeQueryParams {
  projectId: string;
  [key: string]: any;
};

export default class EnvironmentType extends Ressource {
  id: string;
  accesses: Array<any>;

  constructor(environmentType: APIObject) {
    const { id } = environmentType;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, environmentType);
    this.id = "";
    this.accesses = [];
  }

  static get(params: EnvironmentTypeGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<EnvironmentType>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: EnvironmentTypeQueryParams) {
    const { api_url } = getConfig();
    const { projectId, ...queryString } = params;

    return super._query<EnvironmentType>(
      this.getQueryUrl(`${api_url}${url}`),
      { projectId },
      paramDefaults,
      queryString
    );
  }

  static createAccess(projectId: string, environmentTypeId: string, access: any) {
    const { api_url } = getConfig();
    const url = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access`;
    return request(url, "POST", {
      email: access.email,
      role: access.role
    }).then(response => new ProjectAccess(response._embedded.entity, url));
  }

  static updateAccess(projectId: string, environmentTypeId: string, access: any) {
    const { api_url } = getConfig();
    const url = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access/${
      access.id
    }`;
    return request(url, "PATCH", {
      role: access.role
    }).then(response => new ProjectAccess(response._embedded.entity, url));
  }

  static deleteAccess(projectId: string, environmentTypeId: string, access: any) {
    const { api_url } = getConfig();
    const url = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access/${
      access.id
    }`;
    return request(url, "DELETE");
  }

  async getAccesses() {
    const accessLink = this.getLink("#access");
    const accesses = await request(accessLink);
    this.accesses = [];
    for (let i = 0; i < accesses.length; i++) {
      this.accesses.push(
        new ProjectAccess(accesses[i], `${accessLink}/${accesses[i].id}`)
      );
    }
    return this.accesses;
  }
}
