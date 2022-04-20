import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { CertificateQueryParams, CertificateType  } from "./types";

const paramDefaults = {};
const _url = "/projects/:projectId/certificates";

export default class Certificate extends autoImplementWithResources()<CertificateType>() {
  key: string;

  constructor(certificate: APIObject, url: string) {
    super(url, paramDefaults, {}, certificate, ["key", "certificate", "chain"]);
    this.key = certificate.key;
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
