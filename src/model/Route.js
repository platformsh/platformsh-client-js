import Ressource from './Ressource';

const paramDefaults = {};
const creatableAndModifiableField = ['route', 'to', 'type', 'upstream', 'cache'];

export default class Route extends Ressource {
  constructor(route, url) {
    super(url, paramDefaults, { }, route, creatableAndModifiableField, creatableAndModifiableField);
    this._queryUrl = Ressource.getQueryUrl(url);
    this.id = '';
    this.project = '';
    this.environment = '';
    this.route = {};
    this.cache = {};
    this.ssi = [];
    this.upstream = '';
    this.to = '';
    this.type = '';
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
