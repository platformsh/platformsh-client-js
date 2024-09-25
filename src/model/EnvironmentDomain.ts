import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

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

export class EnvironmentDomain extends Ressource {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  ssl: unknown[];
  updated_at: string;
  replacement_for: string;

  constructor(environmentDomain: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      environmentDomain,
      ["name", "ssl", "is_default", "replacement_for"],
      modifiableField
    );
    this.id = environmentDomain.id;
    this.name = environmentDomain.name;
    this.is_default = environmentDomain.is_default;
    this.created_at = environmentDomain.created_at;
    this.ssl = environmentDomain.ssl;
    this.updated_at = environmentDomain.updated_at;
    this.replacement_for = environmentDomain.replacement_for;
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
