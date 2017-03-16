import Ressource from './Ressource';
import { getConfig } from '../config';

const url = '/user/:id';
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = '';
    this.created_at = '';
    this.updated_at = '';
    this.has_key = false;
    this.display_name = '';
    this.email = '';
  }

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super.get(customUrl || `${api_url}${url}`, { id }, paramDefaults, queryParams);
  }

  static query(params) {
    const { api_url } = getConfig();

    return super.query(this.getQueryUrl(`${api_url}${url}`), {}, paramDefaults, params);
  }
}
