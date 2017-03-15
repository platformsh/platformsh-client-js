import Ressource from './Ressource';

const paramDefaults = {
  id: 'name'
};
const creatableField = [
  'value',
  'is_json',
  'visible_build',
  'visible_runtime'
];
const modifiableField = [
  'value',
  'is_json',
  'visible_build',
  'visible_runtime'
];

export default class ProjectLevelVariable extends Ressource {
  constructor(projectLevelVariable, url) {
    super(url, paramDefaults, {}, projectLevelVariable, creatableField, modifiableField);
    this.id = '';
    this.name = '';
    this.value = '';
    this.is_json = '';
    this.visible_build = '';
    this.visible_runtime = '';
    this.created_at = '';
    this.updated_at = '';
  }

  static get(params, url) {
    const { name, ...queryParams } = params;

    return super.get(`${url}/:id`, { name }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
