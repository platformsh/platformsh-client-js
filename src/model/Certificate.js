import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/certificates";

export default class Certificate extends Ressource {
  constructor(certificate, url) {
    super(url, paramDefaults, {}, certificate, ["key", "certificate", "chain"]);
    this.key = "";
    this.id = "";
    this.certificate = "";
    this.chain = [];
    this.domains = [];
    this.expires_at = "";
    this.updated_at = "";
    this.created_at = "";
    this.is_provisioned = true;
    this.issuer = [];
    this._required = ["key", "certificate"];
  }

  static query(params, customUrl) {
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
