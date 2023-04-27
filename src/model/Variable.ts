import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import Result from "./Result";

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

export type VariableGetParams = {
  [key: string]: any;
  id: string;
  projectId: string;
  environmentId: string;
};

export type VariableQueryParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

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
      url ?? "",
      paramDefaults,
      {},
      variable,
      creatableField,
      modifialbleField
    );
  }

  static async get(params: VariableGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl ?? `${api_url}${_url}`;

    return super._get<Variable>(
      `${urlToCall}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: VariableQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Variable>(
      customUrl ?? `${api_url}${_url}`,
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
   */
  async disable() {
    if (!this.is_enabled) {
      return new Result({}, this._url, Variable);
    }
    return this.update({ is_enabled: false });
  }
}
