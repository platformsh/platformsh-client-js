import Ressource from './Ressource';

const paramDefaults = {};

export default class Integration extends Ressource {
  constructor(integration, url) {
    const { id } = integration;

    super(url, paramDefaults, { id }, integration);
    this.id = '';
    this.name = '';
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
