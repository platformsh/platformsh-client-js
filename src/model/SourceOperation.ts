import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import Result from "./Result";

const paramDefaults = {};
const _queryUrl =
  "/projects/:projectId/environments/:environmentId/source-operations";
const _url =
  "/projects/:projectId/environments/:environmentId/source-operation";

export type SourceOperationQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export default class SourceOperation extends Ressource {
  operation = "";
  app = "";
  command = "";

  constructor(sourceOperation: APIObject, url: string) {
    super(url, paramDefaults, {}, sourceOperation);
  }

  // This is a custom method because we have to override the url
  // that gets passed into the prototype.constructor().
  static async query(params: SourceOperationQueryParams) {
    const { api_url } = getConfig();
    const queryUrl = _urlParser(
      `${api_url}${_queryUrl}`,
      params,
      paramDefaults
    );

    const url = _urlParser(`${api_url}${_url}`, params, paramDefaults);

    return request(queryUrl, "GET").then(data =>
      data.map((d: APIObject) => new SourceOperation(d, url))
    );
  }

  // We have a custom method here because .runLongOperation()
  // requires a HAL link. This link is not available on this endpoint.
  async run(variables: Record<string, any>) {
    const body: Record<string, any> = { operation: this.operation };
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
