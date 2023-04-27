import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const _url = "/platform/setup/config";
const paramDefaults = {};

export default class SetupConfig extends Ressource {
  app = "";
  service = "";

  constructor(
    setupConfig: APIObject,
    url = `${_url}?service=:service&format=:format`
  ) {
    super(url, paramDefaults, {}, setupConfig, []);
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static async get({ service = "", format = "commented" }, customUrl?: string) {
    const { api_url } = getConfig();
    const url =
      customUrl ?? `${api_url}${_url}?service=:service&format=:format`;
    const parsedUrl = _urlParser(url, { service, format });
    return request(parsedUrl, "POST").then(data =>
      typeof data === "undefined" ? undefined : new SetupConfig(data, _url)
    );
  }
}
