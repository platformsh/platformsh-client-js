import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const creatableAndModifiableField = [
  "route",
  "to",
  "type",
  "upstream",
  "cache"
];
const _url = "/projects/:projectId/environments/:environmentId/routes";

export default class Route extends Ressource {
  constructor(route, url) {
    super(
      url,
      paramDefaults,
      {},
      route,
      creatableAndModifiableField,
      creatableAndModifiableField
    );
    this.id = "";
    this.project = "";
    this.environment = "";
    this.route = {};
    this.cache = {};
    this.ssi = [];
    this.upstream = "";
    this.to = "";
    this.type = "";
  }

  static get(params, customUrl) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`;

    return super._get(
      urlToCall,
      { id, projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }
}
