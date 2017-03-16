import Ressource from './Ressource';

const paramDefaults = {};

export default class Route extends Ressource {
  constructor(route, url) {
    super(url, paramDefaults, { }, route);
    this.id = '';
    this.project = '';
    this.environment = '';
    this.route = '';
    this.cache = [];
    this.ssi = [];
    this.upstream = '';
    this.to = '';
    this.type = '';
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { name }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
