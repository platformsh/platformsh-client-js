import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const _url = "/platform/setup/registry";
const paramDefaults = {};
// /api/platform/setup/registry\?service\=redis-persistent

export type SetupRegistryGetParams = {
  [key: string]: any;
  name: string;
};

export default class SetupRegistry extends Ressource {
  description = "";
  repo_name = "";
  disk = null;
  docs = {};
  endpoint = "";
  min_disk_size = null;
  name = "";
  runtime = null;
  type = "";
  versions = {};

  constructor(
    registry: APIObject,
    url = `${_url}?service=:name`,
    modifiableField = []
  ) {
    super(url, paramDefaults, {}, registry, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static async get(params: SetupRegistryGetParams, customUrl?: string) {
    const { name, ...queryParams } = params;
    const { api_url } = getConfig();
    const url = customUrl ?? `${api_url}${_url}?service=:name`;
    const parsedUrl = _urlParser(url, params);

    return request(parsedUrl, "POST", queryParams).then(data =>
      typeof data === "undefined" ? undefined : new SetupRegistry(data, _url)
    );
  }
}
