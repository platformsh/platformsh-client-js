import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const modifiableField = ["is_default"];
const _url = "/projects/:projectId/environments/:environmentId/domains";

export type EnvironmentDomainGetParams = {
  [index: string]: any;
  name: string;
  projectId?: string;
  environmentId?: string;
};

export type EnvironmentDomainQueryParams = {
  [index: string]: any;
  projectId: string;
  environmentId: string;
};

export default class EnvironmentDomain extends Ressource {
  id = "";
  name = "";
  is_default = false;
  created_at = "";
  ssl = [];
  updated_at = "";
  replacement_for = "";

  constructor(environmentDomain: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      environmentDomain,
      ["name", "ssl", "is_default", "replacement_for"],
      modifiableField
    );
    this._required = ["name"];
  }

  static async get(
    params: EnvironmentDomainGetParams,
    customUrl?: string
  ): Promise<EnvironmentDomain> {
    const { name, projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<EnvironmentDomain>(
      customUrl ? `${customUrl}/:name` : `${api_url}${_url}`,
      { name, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async query(
    params: EnvironmentDomainQueryParams,
    customUrl?: string
  ): Promise<EnvironmentDomain[]> {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
