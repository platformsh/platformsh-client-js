import Ressource from './Ressource';

const paramDefaults = {};

export default class Metrics extends Ressource {
  constructor(metric, url) {
    super(url, paramDefaults, {}, metric);
    this.results = {};
  }

  static get(params, url) {
    return super.get(url, {}, paramDefaults, params);
  }
}
