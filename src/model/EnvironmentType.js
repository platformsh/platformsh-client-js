import Ressource from "./Ressource";
import { getConfig } from "../config";
import ProjectAccess from "./ProjectAccess";

import request from "../api";

const url = "/projects/:projectId/environment-types/:id";
const paramDefaults = {};

export default class EnvironmentType extends Ressource {
  constructor(account) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this.id = "";
    this.accesses = [];
  }

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { api_url } = getConfig();
    const { projectId, ...queryString } = params;

    return super._query(
      this.getQueryUrl(`${api_url}${url}`),
      { projectId },
      paramDefaults,
      queryString
    );
  }

  static createAccess(projectId, environmentTypeId, access) {
    const { api_url } = getConfig();
    const url = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access`;
    return request(url, "POST", {
      email: access.email,
      role: access.role
    }).then(response => new ProjectAccess(response._embedded.entity, url));
  }

  static updateAccess(projectId, environmentTypeId, access) {
    const { api_url } = getConfig();
    const url = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access/${
      access.id
    }`;
    return request(url, "PATCH", {
      role: access.role
    }).then(response => new ProjectAccess(response._embedded.entity, url));
  }

  static deleteAccess(projectId, environmentTypeId, access) {
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
