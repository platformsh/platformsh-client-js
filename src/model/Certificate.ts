import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/projects/:projectId/certificates";

export interface CertificateQueryParams {
  projectId?: string,
  [index: string]: any
};

export default class Certificate extends Ressource {
  key: string;
  id: string;
  certificate: string;
  chain: Array<string>;
  domains: Array<string>;
  expires_at: string;
  updated_at: string
  created_at: string
  is_provisioned: boolean;
  issuer: Array<string>;

  constructor(certificate: APIObject, url: string) {
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

  static query(params: CertificateQueryParams, customUrl?: string) {
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
