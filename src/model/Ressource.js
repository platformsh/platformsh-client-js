import pick from "object.pick";
import parse_url from "parse_url";

import { getConfig } from "../config";
import _urlParser from "../urlParser";
import { makeAbsoluteUrl, getRef, getRefs, hasLink, getLink } from "../refs";
import request from "../api";
import Result from "./Result";

const handler = {
  get(target, key) {
    if (
      typeof key !== "symbol" &&
      !key.startsWith("_") &&
      key !== "data" &&
      target.hasOwnProperty(key)
    ) {
      return target.data && target.data[key];
    }

    return target[key];
  },
  set(target, key, value) {
    if (key !== "data" && target.hasOwnProperty(key)) {
      target.data[key] = value;
      return true;
    }

    target[key] = value;
    return true;
  }
};

export default class Ressource {
  constructor(
    _url,
    paramDefaults,
    params,
    data = {},
    _creatableField = [],
    _modifiableField = []
  ) {
    // This is an abstract class
    if (this.constructor === Ressource) {
      throw new Error("Can't instantiate abstract class");
    }

    this.copy(data);

    const url = _url || this.getLink("self");
    this._params = params;

    this._url = _urlParser(url, params, paramDefaults);
    const parsedUrl = parse_url(url);

    if (parsedUrl[1] === "http" || parsedUrl[1] === "https") {
      this._baseUrl = `${parsedUrl[1]}:${parsedUrl[2]}${parsedUrl[3]}${
        parsedUrl[4] ? `:${parsedUrl[4]}` : ""
      }`;
    }
    this._creatableField = _creatableField;
    this._modifiableField = _modifiableField;
    this._paramDefaults = paramDefaults;

    return new Proxy(this, handler);
  }

  static getQueryUrl(_url = "") {
    return _url.substring(0, _url.lastIndexOf("/"));
  }

  static get(_url, params, paramDefaults, queryParams, options) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, "GET", queryParams, {}, 0, options).then(data => {
      return typeof data === "undefined"
        ? undefined
        : new this.prototype.constructor(data, parsedUrl, params);
    });
  }

  static query(
    _url,
    params,
    paramDefaults,
    queryParams,
    transformResultBeforeMap
  ) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, "GET", queryParams).then(data => {
      let dataToMap = data;

      if (transformResultBeforeMap) {
        dataToMap = transformResultBeforeMap(data);
      }

      return dataToMap.map(
        d => new this.prototype.constructor(d, `${parsedUrl}/${d.id}`)
      );
    });
  }

  checkProperty() {
    return undefined;
  }

  /**
   * Validate values for update.
   *
   * @param array values
   *
   * @return string{} An object of validation errors.
   */
  checkUpdate(values = {}) {
    let errors;

    for (let key in Object.keys(values)) {
      errors = { ...errors, ...this.checkProperty(key, values[key]) };
    }
    return Object.keys(errors).length ? errors : undefined;
  }

  update(data, _url) {
    if (!this._modifiableField.length) {
      throw new Error("Can't call update on this ressource");
    }

    const errors = this.checkUpdate(this.data);

    if (errors) {
      return Promise.reject(errors);
    }
    let updateLink;

    try {
      updateLink = this.getLink("#edit");
    } catch (err) {
      if (!_url) {
        throw new Error("Not allowed to edit", err);
      }
    }

    const parsedUrl = _urlParser(
      _url || updateLink || this._url,
      this.data,
      this._paramDefaults
    );

    return request(parsedUrl, "PATCH", pick(data, this._modifiableField)).then(
      data => {
        return new Result(data, this._url, this.constructor);
      }
    );
  }

  updateLocal(data) {
    return new this.constructor({ ...this.data, ...data }, this._url);
  }

  /**
   * Get the required properties for creating a new resource.
   *
   * @return array
   */
  getRequired() {
    return this._required || [];
  }

  /**
   * Validate a new resource.
   *
   * @param array data
   *
   * @return string{} An object of validation errors.
   */
  checkNew(values = {}) {
    let errors = {};
    const dataKeys = Object.keys(values);

    const missing = this.getRequired().filter(function(i) {
      return dataKeys.indexOf(i) < 0;
    });

    if (missing.length) {
      errors._error = `Missing ${missing.join(", ")}`;
    }

    for (let i = 0; i < dataKeys.length; i++) {
      const key = dataKeys[i];

      errors = { ...errors, ...this.checkProperty(key, values[key]) };
    }

    return Object.keys(errors).length ? errors : undefined;
  }

  save() {
    if (!this._creatableField.length) {
      throw new Error("Can't call save on this ressource");
    }
    const errors = this.checkNew(this.data);

    if (errors) {
      return Promise.reject(errors);
    }
    const url = this._queryUrl || this._url;

    return request(url, "POST", pick(this.data, this._creatableField)).then(
      data => {
        return new Result(data, url, this.constructor);
      }
    );
  }

  delete() {
    const deleteLink = this.getLink("#delete");

    if (!deleteLink) {
      throw new Error("Not allowed to delete");
    }
    return request(deleteLink, "DELETE", {}).then(
      result => new Result(result, this._url, this.constructor)
    );
  }

  copy(data) {
    this.data = { ...this.data, ...data };
  }

  static wrap(objects) {
    return objects.map(
      object => new this.prototype.constructor(object, this._url)
    );
  }

  /**
   * Refresh the resource.
   *
   */
  refresh(params) {
    return request(this.getUri(), "GET", params).then(data => {
      this.copy(data);
      return this;
    });
  }

  /**
   * Check whether an operation is available on the resource.
   *
   * @param {string} operationName
   *
   * @return {boolean} true if the operation is available false otherwise
   */
  operationAvailable(operationName) {
    const links = this.data._links;
    const operation = links && links[`#${operationName}`];
    return operation?.href;
  }

  /**
   * Check whether the resource has a link.
   *
   * @param rel
   *
   * @return bool
   */
  hasLink(rel) {
    return hasLink(this.data._links, rel);
  }

  /**
   * Check whether the resource has an embedded.
   *
   * @param rel
   *
   * @return bool
   */
  hasEmbedded(rel) {
    return (
      this.data._embedded &&
      this.data._embedded[rel] &&
      !!this.data._embedded[rel].length
    );
  }

  /**
   * Get a embedded for a given resource relation.
   *
   * @param string rel
   *
   * @return array
   */
  getEmbedded(rel) {
    if (!this.hasEmbedded(rel)) {
      throw new Error(`Embedded not found: ${rel}`);
    }

    return this.data._embedded[rel];
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
    return getLink(this.data._links, rel, absolute, this._baseUrl);
  }

  /**
   * Get the resource's URI.
   *
   * @param bool absolute
   *
   * @return string
   */
  getUri(absolute = true) {
    return this.getLink("self", absolute);
  }

  /**
   * Make a URL absolute, based on the base URL.
   *
   * @param string relativeUrl
   * @param string _baseUrl
   *
   * @return string
   */
  makeAbsoluteUrl(relativeUrl, _baseUrl = this._baseUrl) {
    return makeAbsoluteUrl(`${_baseUrl}${relativeUrl}`, _baseUrl);
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
  runOperation(op, method = "POST", body) {
    if (!this.operationAvailable(op)) {
      throw new Error(`Operation not available: ${op}`);
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
  runLongOperation(op, method = "POST", body) {
    return this.runOperation(op, method, body).then(data => {
      const result = new Result(data, this.getUri());
      const activities = result.getActivities();

      if (activities.length !== 1) {
        throw new Error(`Expected one activity, found ${activities.length}`);
      }

      return activities[0];
    });
  }

  hasPermission(permission) {
    return this.data._links && !!this.data._links[permission];
  }

  // Load a single object from the ref API
  getRef(linkKey, constructor, absolute = true) {
    return getRef(
      this.data._links,
      linkKey,
      constructor,
      absolute,
      this._baseUrl
    );
  }

  // Load a list of objects from the ref API
  async getRefs(linkKey, constructor, absolute = true) {
    return getRefs(
      this.data._links,
      linkKey,
      constructor,
      absolute,
      this._baseUrl
    );
  }
}
