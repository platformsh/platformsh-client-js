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
  constructor(route, url, config) {
    super(
      url,
      paramDefaults,
      {},
      route,
      creatableAndModifiableField,
      creatableAndModifiableField,
      config
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

  static get(params, customUrl, config) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const urlToCall = customUrl ? `${customUrl}/:id` : `:api_url${_url}/:id`;

    return super.get(
      urlToCall,
      { id, projectId, environmentId },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    const { projectId, environmentId, ...queryParams } = params;

    return super.query(
      customUrl || `:api_url${_url}`,
      { projectId, environmentId },
      super.getConfig(config),
      queryParams
    );
  }
}
