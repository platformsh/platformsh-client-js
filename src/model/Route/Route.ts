import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources, UnionToIntersection } from "../utils";

import { RouteGetParams, RouteQueryParams, RouteType} from "./types";

const paramDefaults = {};
const creatableAndModifiableField = [
  "route",
  "to",
  "type",
  "upstream",
  "cache"
];
const _url = "/projects/:projectId/environments/:environmentId/routes";


export default class Route extends autoImplementWithResources()<UnionToIntersection<RouteType>>() {
  
  constructor(route: APIObject, url: string) {
    super(
      url,
      paramDefaults,
      {},
      route,
      creatableAndModifiableField,
      creatableAndModifiableField
    );
  }

  static get(params: RouteGetParams, customUrl?: string) {
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

  static query(params: RouteQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Route>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
