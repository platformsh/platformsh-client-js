import Ressource from './Ressource';
import Result from './Result';

const paramDefaults = {};

export default class Variable extends Ressource {
  constructor(variable, url) {
    super(url, paramDefaults, { }, variable);
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

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
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
