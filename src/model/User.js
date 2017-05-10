import Ressource from './Ressource';

const url = '/api/users/:id';
const paramDefaults = {};

export default class User extends Ressource {
  constructor(account, baseUrl) {
    const { id } = account;

    super(baseUrl, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(baseUrl);
    this.id = '';
    this.created_at = '';
    this.updated_at = '';
    this.has_key = false;
    this.display_name = '';
    this.email = '';
  }

  static get(params, baseUrl) {
    const { id, ...queryParams } = params;

    return super.get(`${baseUrl}${url}`, { id }, paramDefaults, queryParams);
  }

  static query(params, baseUrl) {
    return super.query(this.getQueryUrl(`${baseUrl}${url}`), {}, paramDefaults, params);
  }
}
