import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const modifiableField = ["is_default"];
const _url = "/projects/:projectId/domains";

export type DomainGetParams = {
  [index: string]: any;
  name: string;
  projectId?: string;
};

export type DomainQueryParams = {
  [index: string]: any;
  projectId: string;
};

export default class Domain extends Ressource {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  ssl: unknown[];
  updated_at: string;

  constructor(domain: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      domain,
      ["name", "ssl", "is_default"],
      modifiableField
    );
    this.id = domain.id;
    this.name = domain.name;
    this.is_default = domain.is_default;
    this.created_at = domain.created_at;
    this.ssl = domain.ssl;
    this.updated_at = domain.updated_at;
    this._required = ["name"];
  }

  static async get(
    params: DomainGetParams,
    customUrl?: string
  ): Promise<Domain> {
    const { name, projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Domain>(
      customUrl ? `${customUrl}/:name` : `${api_url}${_url}`,
      { name, projectId },
      paramDefaults,
      queryParams
    );
  }

  static async query(
    params: DomainQueryParams,
    customUrl?: string
  ): Promise<Domain[]> {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl ?? `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
