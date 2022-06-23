import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";
import { DomainGetParams, DomainQueryParams, DomainType } from "./types";

const paramDefaults = {};
const _url = "/projects/:projectId/domains";

export default class Domain extends autoImplementWithResources()
  // Avoid collission with types in Resources or weekly type any of Resource or DomaineType
  <Omit<DomainType, 'created_at' |
    'updated_at'>>() {

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
