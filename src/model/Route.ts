import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const creatableAndModifiableField = [
  "route",
  "to",
  "type",
  "upstream",
  "cache"
];
const _url = "/projects/:projectId/environments/:environmentId/routes";

export type RouteGetParams = {
  [key: string]: any;
  id: string;
  projectId: string;
  environmentId: string;
};

export type RouteQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class Route extends Ressource {
  id: string;
  project: string;
  environment: string;
  route: Record<string, unknown>;
  cache: Record<string, unknown>;
  ssi: unknown[];
  upstream: string;
  to: string;
  type: string;

  constructor(route: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      route,
      creatableAndModifiableField,
      creatableAndModifiableField
    );

    this.id = route.id;
    this.project = route.project;
    this.environment = route.environment;
    this.route = route.route ?? {};
    this.cache = route.cache ?? {};
    this.ssi = route.ssi ?? [];
    this.upstream = route.upstream;
    this.to = route.to;
    this.type = route.type;
  }

  static async get(params: RouteGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get<Route>(
      urlToCall,
      { id, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: RouteQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Route>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
