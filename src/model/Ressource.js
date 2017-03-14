import pick from 'object.pick';
import parse_url from 'parse_url';

import _urlParser from '../urlParser';
import request from '../api';
import Result from './Result';

const handler = {
  get(target, key) {
    if((typeof key !== 'symbol' && !key.startsWith('_')) && key !== 'data' && target.hasOwnProperty(key)) {
      return target.data && target.data[key];
    }

    return target[key];
  },
  set(target, key, value) {
    if(key !== 'data' && target.hasOwnProperty(key)) {
      target.data[key] = value;
      return true;
    }

    target[key] = value;
    return true;
  }
};

export default class Ressource {
  constructor(_url, paramDefaults, params, data = {}, _creatableField = [], _modifiableField = []) {
    // This is an abstract class
    if (this.constructor === Ressource) {
      throw new Error("Can't instantiate abstract class");
    }

    this.copy(data);
    this._url = _urlParser(_url, params, paramDefaults);
    this._queryUrl = Ressource.getQueryUrl(this._url);
    const parsedUrl = parse_url(_url);

    if(parsedUrl[1] === 'http' || parsedUrl[1] === 'https') {
      this._baseUrl = `${parsedUrl[1]}:${parsedUrl[2]}${parsedUrl[3]}`;
    }
    this._creatableField = _creatableField;
    this._modifiableField = _modifiableField;

    return new Proxy(this, handler);
  }

  static getQueryUrl(_url) {
    return _url.substring(0, _url.lastIndexOf('/'));
  }

  static get(_url, params, paramDefaults, queryParams) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, 'GET', queryParams).then(data => {
      return new this.prototype.constructor(data, _url);
    });
  }

  static query(_url, params, paramDefaults, queryParams) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, 'GET', queryParams).then(data => {
      return data.map(d => new this.prototype.constructor(d, _url));
    });
  }

  update(data) {
    this.data = { data, ...this.data };
    if(!this._modifiableField.length) {
      throw new Error("Can't call update on this ressource");
    }
    return request(this._url, 'PATCH', pick(this, this._modifiableField)).then(data => {
      return new this.constructor(data, this._url);
    });
  }

  save() {
    if(!this._creatableField.length) {
      throw new Error("Can't call save on this ressource");
    }
    return request(this._queryUrl, 'POST', pick(this, this._creatableField)).then(data => {
      return new this.constructor(data, this._url);
    });
  }

  delete() {
    return request(this._url, 'DELETE', {}, this._baseUrl);
  }

  copy(data) {
    this.data = { ...data };
  }

  static wrap(objects) {
    return objects.map(object => new this.prototype.constructor(object, this._url));
  }

  /**
  * Refresh the resource.
  *
  */
  refresh() {
    return this.get(this._url).then(data => {
      this.copy(data);
      return data;
    });
  }

  /**
  * Check whether an operation is available on the resource.
  *
  * @param string op
  *
  * @return bool
  */
  operationAvailable(op) {
    return this.data._links[`#${op}`].href;
  }

  /**
  * Check whether the resource has a link.
  *
  * @param rel
  *
  * @return bool
  */
  hasLink(rel) {
    return this.data['_links'][rel]['href'];
  }

  /**
  * Get a link for a given resource relation.
  *
  * @param string rel
  * @param bool absolute
  *
  * @return string
  */
  getLink(rel, absolute = true) {
    if (!this.hasLink(rel)) {
      throw new Error(`Link not found: ${rel}`);
    }

    let _url = this.data._links[rel].href;

    if (absolute && _url.indexOf('//') === -1) {
      _url = this.makeAbsoluteUrl(_url);
    }

    return _url;
  }

  /**
  * Get the resource's URI.
  *
  * @param bool absolute
  *
  * @return string
  */
  getUri(absolute = true) {
    return this.getLink('self', absolute);
  }

  /**
  * Make a URL absolute, based on the base URL.
  *
  * @param string $relativeUrl
  * @param string $_baseUrl
  *
  * @return string
  */
  makeAbsoluteUrl(relativeUrl, _baseUrl = this._baseUrl) {
    return `${_baseUrl}${relativeUrl}`;
  }

  /**
  * Execute an operation on the resource.
  *
  * @param string op
  * @param string method
  * @param array  body
  *
  * @return array
  */
  runOperation(op, method = 'POST', body = {}) {
    if (!this.operationAvailable(op)) {
      throw new Error(`Oper tion not available: ${op}`);
    }
    return request(this.getLink(`#${op}`), method, body);
  }
  /**
  * Run a long-running operation.
  *
  * @param string op
  * @param string method
  * @param array  body
  *
  * @return Activity
  */
  runLongOperation(op, method = 'POST', body = {}, ResultClass) {
    return this.runOperation(op, method, body).then(data => {
      const result = new Result(data);
      const activities = result.getActivities(this.getUri(), ResultClass);

      if (activities.length !== 1) {
        throw new Error(`Expected one activity, found ${activities.length }`);
      }

      return activities[0];
    });
  }

}
