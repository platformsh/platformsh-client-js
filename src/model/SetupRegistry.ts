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
  description: string;
  repo_name: string;
  disk: null;
  docs: Record<string, unknown>;
  endpoint: string;
  min_disk_size: null;
  name: string;
  runtime: null;
  type: string;
  versions: Record<string, unknown>;

  constructor(
    registry: APIObject,
    url = `${_url}?service=:name`,
    modifiableField = []
  ) {
    super(url, paramDefaults, {}, registry, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.description = registry.description;
    this.repo_name = registry.repo_name;
    this.disk = registry.disk ?? null;
    this.docs = registry.docs ?? {};
    this.endpoint = registry.endpoint;
    this.min_disk_size = registry.min_disk_size ?? null;
    this.name = registry.name;
    this.runtime = registry.runtime ?? null;
    this.type = registry.type;
    this.versions = registry.versions ?? {};
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
