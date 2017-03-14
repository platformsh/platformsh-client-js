import Ressource from './Ressource';
import { API_URL } from '../config';

const url = `${API_URL}/user/:id`;
const paramDefaults = {};

export default class Account extends Ressource {
  constructor(account) {
    const { id, ...queryParams } = account;

    super(url, paramDefaults, { id }, account);
    this.id = '';
    this.name = '';
  }

  static get(params) {
    const { id, ...queryParams } = params;

    return super.get(url, { id }, paramDefaults, queryParams);
  }

  static query(params) {
    const { id, ...queryParams } = params;

    return super.query(url, { id }, paramDefaults, queryParams);
  }
}
