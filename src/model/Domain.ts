import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/domains";

export interface DomainGetParams {
  name: string,
  projectId?: string,
  [index: string]: any
};

export interface DomainQueryParams {
  projectId: string,
  [index: string]: any
};

export default class Domain extends Ressource {
  id = "";
  name = "";
  ssl = [];

  constructor(domain: APIObject, url: string) {
    super(url, paramDefaults, {}, domain, ["name", "ssl"]);
    this._required = ["name"];
  }

  static get(params: DomainGetParams, customUrl?: string): Promise<Domain> {
    const { name, projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Domain>(
      customUrl ? `${customUrl}/:name` : `${api_url}${_url}`,
      { name, projectId },
      paramDefaults,
      queryParams
    );
  }

  static query(params: DomainQueryParams, customUrl?: string): Promise<Domain[]> {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
