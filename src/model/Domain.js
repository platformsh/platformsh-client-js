import Ressource from './Ressource';

const paramDefaults = {};

export default class Domain extends Ressource {
  constructor(domain, url) {
    super(url, paramDefaults, { }, domain, ['name', 'ssl']);
    this.id = '';
    this.name = '';
  }

  static get(params, url) {
    const { name, ...queryParams } = params;

    return super.get(`${url}/:name`, { name }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
