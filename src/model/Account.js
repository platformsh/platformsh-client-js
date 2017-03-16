import Ressource from './Ressource';
import { getConfig } from '../config';

const { api_url } = getConfig();
const url = `${api_url}/user/:id`;
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account) {
    const { id } = account;

    super(url, paramDefaults, { id }, account);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = '';
    this.created_at = '';
    this.updated_at = '';
    this.has_key = false;
    this.display_name = '';
    this.email = '';
  }

  static get(params, customUrl = url) {
    const { id, ...queryParams } = params;

    return super.get(customUrl, { id }, paramDefaults, queryParams);
  }

  static query(params) {
    return super.query(this.getQueryUrl(url), {}, paramDefaults, params);
  }
}
