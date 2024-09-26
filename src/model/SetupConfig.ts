import { authenticatedRequest } from "../api";
import { getConfig } from "../config";
import { urlParser } from "../urlParser";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const _url = "/platform/setup/config";
const paramDefaults = {};

export class SetupConfig extends Ressource {
  app: string;
  service: string;

  constructor(
    setupConfig: APIObject,
    url = `${_url}?service=:service&format=:format`
  ) {
    super(url, paramDefaults, {}, setupConfig, []);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.app = setupConfig.app;
    this.service = setupConfig.service;
  }

  static async get({ service = "", format = "commented" }, customUrl?: string) {
    const { api_url } = getConfig();
    const url =
      customUrl ?? `${api_url}${_url}?service=:service&format=:format`;
    const parsedUrl = urlParser(url, { service, format });
    return authenticatedRequest(parsedUrl, "POST").then(data =>
      typeof data === "undefined" ? undefined : new SetupConfig(data, _url)
    );
  }
}
