import Ressource, { APIObject } from "../Ressource";
import Result from "../Result";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { VariableGetParams, VariableQueryParams, EnvironmentVariableType } from "./types";

const paramDefaults = {};
const creatableField = [
  "name",
  "value",
  "is_json",
  "is_sensitive",
  "is_inheritable",
  "is_enabled",
  "visible_build",
  "visible_runtime"
];
const modifialbleField = [
  "value",
  "is_json",
  "is_sensitive",
  "is_inheritable",
  "is_enabled",
  "visible_build",
  "visible_runtime"
];
const _url = "/projects/:projectId/environments/:environmentId/variables";

export default class Variable extends autoImplementWithResources()<EnvironmentVariableType>() {
  id: string
  constructor(variable: APIObject, url?: string) {
    super(url || "", paramDefaults, {}, variable, creatableField, modifialbleField);
    this.id = variable.id;
  }

  static get(params: VariableGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl || `${api_url}${_url}`;

    return super._get<Variable>(`${urlToCall}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params: VariableQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Variable>(
      customUrl || `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  /**
   * Disable the variable.
   *
   * This is only useful if the variable is both inherited and enabled.
   * Non-inherited variables can be deleted.
   *
   * @return Result
   */
  disable() {
    if (!this.is_enabled) {
      return new Result({}, this._url, Variable);
    }
    return this.update({ is_enabled: false });
  }
}
