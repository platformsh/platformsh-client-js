import Ressource from "./Ressource";
import Result from "./Result";
import { getConfig } from "../config";
import _urlParser from "../urlParser";
import request from "../api";

const paramDefaults = {};
const _queryUrl =
  "/projects/:projectId/environments/:environmentId/source-operations";
const _url =
  "/projects/:projectId/environments/:environmentId/source-operation";

export default class SourceOperation extends Ressource {
  constructor(sourceOperation, url) {
    super(url, paramDefaults, {}, sourceOperation);
    this.operation = "";
    this.app = "";
    this.commmand = "";
  }

  // This is a custom method because we have to override the url
  // that gets passed into the prototype.constructor().
  static query(params) {
    const { api_url } = getConfig();
    const queryUrl = _urlParser(
      `${api_url}${_queryUrl}`,
      params,
      paramDefaults
    );

    const url = _urlParser(`${api_url}${_url}`, params, paramDefaults);

    return request(queryUrl, "GET").then(data => {
      let dataToMap = data;

      return dataToMap.map(d => new this.prototype.constructor(d, url));
    });
  }

  // We have a custom method here because .runLongOperation()
  // requires a HAL link. This link is not available on this endpoint.
  run(variables) {
    const body = { operation: this.operation };
    if (typeof variables !== "undefined") {
      body.variables = { ...variables };
    }
    return request(this._url, "POST", body).then(data => {
      const result = new Result(data, this._url);
      const activities = result.getActivities();

      if (activities.length !== 1) {
        throw new Error(`Expected one activity, found ${activities.length}`);
      }

      return activities[0];
    });
  }
}
