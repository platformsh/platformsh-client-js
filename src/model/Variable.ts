import Ressource, { APIObject } from "./Ressource";
import Result from "./Result";
import { getConfig } from "../config";

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

export interface VariableGetParams {
  id: string;
  projectId: string;
  environmentId: string;
  [key: string]: any;
}

export interface VariableQueryParams {
  projectId: string;
  environmentId: string;
  [key: string]: any;
}

export default class Variable extends Ressource {
  id = "";
  name = "";
  project = "";
  environment = "";
  value = "";
  is_enabled = false;
  created_at = "";
  updated_at = "";
  inherited = false;
  is_json = false;
  is_sensitive = false;
  is_inheritable = true;
  visible_build = false;
  visible_runtime = true;

  constructor(variable: APIObject, url?: string) {
    super(
      url || "",
      paramDefaults,
      {},
      variable,
      creatableField,
      modifialbleField
    );
  }

  static get(params: VariableGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl || `${api_url}${_url}`;

    return super._get<Variable>(
      `${urlToCall}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
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
