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
  id: string;
  name: string;
  project: string;
  environment: string;
  value: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  inherited: boolean;
  is_json: boolean;
  is_sensitive: boolean;
  is_inheritable: boolean;
  visible_build: boolean;
  visible_runtime: boolean;

  constructor(variable: APIObject, url?: string) {
    super(
      url ?? "",
      paramDefaults,
      {},
      variable,
      creatableField,
      modifialbleField
    );

    this.id = variable.id ?? "";
    this.name = variable.name ?? "";
    this.project = variable.project ?? "";
    this.environment = variable.environment ?? "";
    this.value = variable.value ?? "";
    this.is_enabled = variable.is_enabled ?? false;
    this.created_at = variable.created_at ?? "";
    this.updated_at = variable.updated_at ?? "";
    this.inherited = variable.inherited ?? false;
    this.is_json = variable.is_json ?? false;
    this.is_sensitive = variable.is_sensitive ?? false;
    this.is_inheritable = variable.is_inheritable ?? true;
    this.visible_build = variable.visible_build ?? false;
    this.visible_runtime = variable.visible_runtime ?? true;
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
