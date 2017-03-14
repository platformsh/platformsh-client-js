import Ressource from './Ressource';
import { API_URL } from '../config';

const url = `${API_URL}/user/:id`;
const paramDefaults = {};

export default class User extends Ressource {
  constructor(user) {
    const { id } = user;

    super(url, paramDefaults, { id }, user);
    this.id = '';
    this.name = '';
  }

  static get(params) {
    const { id, ...queryParams } = params;

    return super.get(url, { id }, paramDefaults, queryParams);
  }

  static query(params) {
    const { id, ...queryParams } = params;

    return super.query(this.getQueryUrl(url), { id }, paramDefaults, queryParams);
  }
}
