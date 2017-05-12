import Ressource from './Ressource';

const paramDefaults = {};

export default class Certificate extends Ressource {
  constructor(certificate, url) {
    super(url, paramDefaults, { }, certificate, ['key', 'certificate', 'chain']);
    this.key = '';
    this.certificate = '';
    this.chain = [];
    this._required = ['key', 'certificate'];
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
  }
}
