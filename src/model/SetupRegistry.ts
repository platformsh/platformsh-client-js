import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";
import request from "../api";

const _url = "/platform/setup/registry";
const paramDefaults = {};
// /api/platform/setup/registry\?service\=redis-persistent

export interface SetupRegistryGetParams {
  name: string;
  [key: string]: any;
};

export default class SetupRegistry extends Ressource {
  description: string;
  repo_name : string;
  disk: any;
  docs: Record<string, any>;
  endpoint: string;
  min_disk_size: any;
  name: string;
  runtime: any;
  type: string;
  versions: Record<string, any>;

  constructor(registry: APIObject, url = `${_url}?service=:name`, modifiableField = []) {
    super(url, paramDefaults, {}, registry, [], modifiableField);

    this.description = registry.description;
    this.repo_name = registry.repo_name;
    this.disk =  registry.disk;
    this.docs =  registry.docs;
    this.endpoint = registry.endpoint;
    this.min_disk_size =  registry.min_disk_size;
    this.name =  registry.name;
    this.runtime =  registry.runtime;
    this.type =  registry.type;
    this.versions =  registry.versions;
  
    this._queryUrl = Ressource.getQueryUrl(url);
  }

  static get(params: SetupRegistryGetParams, customUrl?: string) {
    const { name, ...queryParams } = params;
    const { api_url } = getConfig();
    const url = customUrl || `${api_url}${_url}?service=:name`;
    const parsedUrl = _urlParser(url, params);

    return request(parsedUrl, "POST", queryParams).then(data => {
      return typeof data === "undefined"
        ? undefined
        : new SetupRegistry(data, _url);
    });
  }
}
