import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/domains";

export default class Domain extends Ressource {
  constructor(domain, url, config) {
    super(url, paramDefaults, {}, domain, ["name", "ssl"], [], config);
    this.id = "";
    this.name = "";
    this._required = ["name"];
  }

  static get(params, customUrl, config) {
    const { name, ...queryParams } = params;

    return super.get(
      customUrl ? `${customUrl}/:name` : `:api_url${_url}`,
      { name },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    const { projectId, ...queryParams } = params;

    return super.query(
      customUrl || `:api_url${_url}`,
      { projectId },
      super.getConfig(config),
      queryParams
    );
  }
}
