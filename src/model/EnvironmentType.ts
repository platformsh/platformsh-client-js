import request from "../api";
import { getConfig } from "../config";

import ProjectAccess from "./ProjectAccess";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/projects/:projectId/environment-types/:id";
const paramDefaults = {};

export type EnvironmentTypeGetParams = {
  [key: string]: any;
  id: string;
};

export type EnvironmentTypeQueryParams = {
  [key: string]: any;
  projectId: string;
};

export type AccessRole = "admin" | "contributor" | "viewer";

export type CreateAccessParams = {
  projectId: string;
  environmentTypeId: string;
  email?: string;
  role: AccessRole;
  user?: string;
};

export type UpdateAccessParams = {
  projectId: string;
  environmentTypeId: string;
  accessId: string;
  role: AccessRole;
};

export type DeleteAccessParams = {
  projectId: string;
  environmentTypeId: string;
  accessId: string;
};

export default class EnvironmentType extends Ressource {
  id: string;
  accesses: any[];

  constructor(environmentType: APIObject) {
    const { id } = environmentType;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, environmentType);
    this.id = "";
    this.accesses = [];
  }

  static async get(params: EnvironmentTypeGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<EnvironmentType>(
      customUrl ?? `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: EnvironmentTypeQueryParams) {
    const { api_url } = getConfig();
    const { projectId, ...queryString } = params;

    return super._query<EnvironmentType>(
      this.getQueryUrl(`${api_url}${url}`),
      { projectId },
      paramDefaults,
      queryString
    );
  }

  static async createAccess(params: CreateAccessParams) {
    const { projectId, environmentTypeId, email, role, user } = params;
    const { api_url } = getConfig();
    const accessUrl = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access`;
    const response = await request(accessUrl, "POST", {
      email,
      role,
      user
    });
    return new ProjectAccess(response._embedded.entity, accessUrl);
  }

  static async updateAccess(params: UpdateAccessParams) {
    const { projectId, environmentTypeId, accessId, role } = params;
    const { api_url } = getConfig();
    const accessUrl = `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access/${accessId}`;
    const response = await request(accessUrl, "PATCH", {
      role
    });
    return new ProjectAccess(response._embedded.entity, accessUrl);
  }

  static async deleteAccess(
    params: DeleteAccessParams
  ): Promise<{ status: string; code: number }> {
    const { projectId, environmentTypeId, accessId } = params;
    const { api_url } = getConfig();
    return request(
      `${api_url}/projects/${projectId}/environment-types/${environmentTypeId}/access/${accessId}`,
      "DELETE"
    );
  }

  async getAccesses() {
    const accessLink = this.getLink("#access");
    const accesses = await request(accessLink);
    this.accesses = [];

    for (const access of accesses) {
      this.accesses.push(
        new ProjectAccess(access, `${accessLink}/${access.id}`)
      );
    }

    return this.accesses;
  }
}
