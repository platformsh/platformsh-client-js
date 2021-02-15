import Ressource from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";
import request from "../api";

const _url = "/setup/registry";
const paramDefaults = {};
// /setup/registry\?service\=redis-persistent

export default class SetupRegistry extends Ressource {
  constructor(registry, url = `${_url}?service=:name`, modifiableField = []) {
    super(url, paramDefaults, {}, registry, [], modifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.description = "";
    this.repo_name = "";
    this.disk = null;
    this.docs = {};
    this.endpoint = "";
    this.min_disk_size = null;
    this.name = "";
    this.runtime = null;
    this.type = "";
    this.versions = {};
  }

  static get(params, customUrl) {
    const { name, ...queryParams } = params;
    const { api_url } = getConfig();
    const url = customUrl || `${api_url}${_url}?service=:name`;
    const parsedUrl = _urlParser(url, params);

    return request(parsedUrl, "POST", queryParams).then(data => {
      return typeof data === "undefined"
        ? undefined
        : new this.prototype.constructor(data, _url);
    });
  }
}
