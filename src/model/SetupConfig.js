import Ressource from "./Ressource";
import { getConfig } from "../config";
import _urlParser from "../urlParser";
import request from "../api";

const _url = "/platform/setup/config";
const paramDefaults = {};

export default class SetupConfig extends Ressource {
  constructor(
    setupConfig,
    url = `${_url}?service=:service&format=:format`,
    config
  ) {
    super(url, paramDefaults, {}, setupConfig, [], [], config);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.app = "";
    this.service = "";
  }

  static get({ service, format = "commented" }, customUrl, config) {
    const cnf = super.getConfig(config);
    const url =
      customUrl || `${cnf.api_url}${_url}?service=:service&format=:format`;
    const parsedUrl = _urlParser(url, { service, format });
    return request(parsedUrl, "POST", {}, cnf).then(data => {
      return typeof data === "undefined"
        ? undefined
        : new this.prototype.constructor(data, _url);
    });
  }
}
