import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url = "/projects/:projectId/certificates";

export type CertificateQueryParams = {
  [index: string]: any;
  projectId?: string;
};

export default class Certificate extends Ressource {
  key: string;
  id: string;
  certificate: string;
  chain: string[];
  domains: string[];
  expires_at: string;
  updated_at: string;
  created_at: string;
  is_provisioned: boolean;
  issuer: string[];

  constructor(certificate: APIObject, url: string) {
    super(url, paramDefaults, {}, certificate, ["key", "certificate", "chain"]);
    this.key = certificate.key;
    this.id = certificate.id;
    this.certificate = certificate.certificate;
    this.chain = certificate.chain ?? [];
    this.domains = certificate.domains ?? [];
    this.expires_at = certificate.expires_at;
    this.updated_at = certificate.updated_at;
    this.created_at = certificate.created_at;
    this.is_provisioned = certificate.is_provisioned ?? true;
    this.issuer = certificate.issuer ?? [];
    this._required = ["key", "certificate"];
  }

  static async query(params: CertificateQueryParams, customUrl?: string) {
    const { projectId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Certificate>(
      customUrl ?? `${api_url}${_url}`,
      { projectId },
      paramDefaults,
      queryParams
    );
  }
}
