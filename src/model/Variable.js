import Ressource from './Ressource';
import Result from './Result';
import { getConfig } from '../config';

const paramDefaults = {};
const creatableField = ['name', 'value', 'is_json'];
const modifialbleField = ['value', 'is_json'];
const _url = '/projects/:projectId/environments/:environmentId/variables';

export default class Variable extends Ressource {
  constructor(variable, url) {
    super(url, paramDefaults, { }, variable, creatableField, modifialbleField);
    this.id = '';
    this.name = '';
    this.project = '';
    this.environment = '';
    this.value = '';
    this.is_enabled = false;
    this.is_json = false;
    this.created_at = '';
    this.updated_at = '';
    this.inherited = false;
  }

  static get(params, customUrl) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();
    const urlToCall = customUrl || `${api_url}${_url}`;

    return super.get(`${urlToCall}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, customUrl) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.query(customUrl || `${api_url}${_url}`, { projectId, environmentId }, paramDefaults, queryParams);
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
      return new Result({}, this._url, this.prototype.constructor);
    }
    return this.update({'is_enabled': false});
  }
}
