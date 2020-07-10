import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/domains";

export default class Domain extends Ressource {
  constructor(domain, url) {
    super(url, paramDefaults, {}, domain, ["name", "ssl"]);
    this.id = "";
    this.name = "";
    this._required = ["name"];
  }

  static get(params, customUrl) {
    const { name, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(
      customUrl ? `${customUrl}/:name` : `${api_url}${_url}`,
      { name },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.query(
      customUrl || `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
