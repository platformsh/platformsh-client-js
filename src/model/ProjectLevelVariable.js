import Ressource from './Ressource';

const paramDefaults = {};

export default class ProjectLevelVariable extends Ressource {
  constructor(projectLevelVariable, url) {
    super(url, paramDefaults, {}, projectLevelVariable);
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
