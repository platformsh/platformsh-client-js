import parse_url from "parse_url";

import request from "../api";
import type { Link } from "../refs";
import {
  makeAbsoluteUrl,
  getRef,
  getRefs,
  hasLink,
  getLinkHref
} from "../refs";
import _urlParser from "../urlParser";

import type Activity from "./Activity";
import type CursoredResult from "./CursoredResult";
import type { CommerceOrderResponse } from "./Order";
import type { VoucherResponse } from "./OrganizationVoucher";
import type { RegionResponse } from "./Region";
import Result from "./Result";

export type APIObject = {
  [key: string]: any;
  _links?: Record<string, Link>;
  _embedded?: Record<string, object[]>;
};

export type ParamsType = Record<string, any>;

export type RessourceChildClass<T> = new (obj: any, url?: string) => T;

const handler = {
  get(target: any, key: string) {
    if (
      typeof key !== "symbol" &&
      key !== "data" &&
      ((!key.startsWith("_") && target.hasOwnProperty(key)) ||
        ["_embedded", "_links"].includes(key))
    ) {
      return target.data?.[key];
    }

    return target[key];
  },
  set(target: any, key: string, value: any) {
    if (key !== "data" && target.hasOwnProperty(key)) {
      target.data[key] = value;
      return true;
    }

    target[key] = value;
    return true;
  }
};

const pick = (data: APIObject, fields: string[]) =>
  Object.keys(data)
    .filter(k => fields.includes(k))
    .reduce<APIObject>((acc: APIObject, k: string) => {
      acc[k] = data[k];

      return acc;
    }, {});

const secondaryActivityTypes = ["integration.webhook", "integration.script"];

const getInstance = <T>(context: typeof Ressource, ...args: any[]) => {
  const instance = Object.create(context?.prototype || null);
  return new instance.constructor(...args) as T;
};

export default abstract class Ressource {
  public _links?: Record<string, Link>;
  public _embedded?: Record<string, object[]>;

  protected _url: string;
  protected _params: ParamsType;
  protected _baseUrl?: string;
  protected _creatableField: string[];
  protected _modifiableField: string[];
  protected _paramDefaults: ParamsType;
  protected _required?: string[];
  protected _queryUrl?: string;

  private data?: APIObject;

  constructor(
    _url: string,
    paramDefaults: ParamsType,
    params: ParamsType,
    data: APIObject,
    _creatableField: string[] = [],
    _modifiableField: string[] = []
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

    if (parsedUrl?.[1] === "http" || parsedUrl?.[1] === "https") {
      this._baseUrl = `${parsedUrl?.[1]}:${parsedUrl?.[2]}${parsedUrl?.[3]}${
        parsedUrl?.[4] ? `:${parsedUrl?.[4]}` : ""
      }`;
    }
    this._creatableField = _creatableField;
    this._modifiableField = _modifiableField;
    this._paramDefaults = paramDefaults;

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, handler);
  }

  static getQueryUrl(url: string, _id?: string) {
    return url.substring(0, url.lastIndexOf("/"));
  }

  static async _get<T>(
    _url: string,
    params?: ParamsType,
    paramDefaults?: ParamsType,
    queryParams?: ParamsType,
    options?: object
  ): Promise<T> {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, "GET", queryParams, {}, 0, options).then(
      (data: APIObject) => getInstance<T>(this, data, parsedUrl, params)
    );
  }

  static async _query<T>(
    _url: string,
    params?: ParamsType,
    paramDefaults?: ParamsType,
    queryParams?: ParamsType,
    transformResultBeforeMap?: (
      data:
        | APIObject[]
        | CursoredResult<T>
        | CommerceOrderResponse
        | VoucherResponse
        | RegionResponse
    ) => APIObject[],
    options?: object
  ): Promise<T[]> {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    return request(parsedUrl, "GET", queryParams, {}, 0, options).then(
      (data: APIObject[]) => {
        let dataToMap = data;
        if (transformResultBeforeMap) {
          dataToMap = transformResultBeforeMap(data);
        }

        return dataToMap.map((d: APIObject) =>
          getInstance<T>(this, d, `${parsedUrl}/${d.id}`)
        );
      }
    );
  }

  static wrap<T extends APIObject>(objs: T[]): T[] {
    return objs.map(obj => getInstance(this, obj));
  }

  checkProperty(_property: string, _value: unknown): object {
    return {};
  }

  /**
   * Validate values for update.
   *
   * @param array values
   *
   * @return string{} An object of validation errors.
   */
  checkUpdate(values: APIObject | undefined) {
    if (!values) {
      return;
    }

    let errors: object = {};

    // checkProperty can be overrided by children
    Object.keys(values).forEach(key => {
      errors = this.checkProperty(key, values[key]);
    });
    return Object.keys(errors).length ? errors : undefined;
  }

  async update(data: APIObject, _url?: string) {
    if (!this._modifiableField.length) {
      throw new Error("Can't call update on this ressource");
    }

    const errors = this.checkUpdate(this.data);

    if (errors) {
      return Promise.reject(errors);
    }
    let updateLink;

    try {
      updateLink = this.getLink("#edit", true);
    } catch (err) {
      if (!_url) {
        throw new Error("Not allowed to edit");
      }
    }

    if (!updateLink) {
      updateLink = _urlParser(
        _url ?? this._url,
        this.data,
        this._paramDefaults
      );
    }

    return request(updateLink, "PATCH", pick(data, this._modifiableField)).then(
      (apiObject: APIObject) =>
        new Result(
          apiObject,
          this._url,
          this.constructor as RessourceChildClass<any>
        )
    );
  }

  updateLocal(data: APIObject) {
    return new (this.constructor as any)({ ...this.data, ...data }, this._url);
  }

  /**
   * Get the required properties for creating a new resource.
   *
   * @return array
   */
  getRequired() {
    return this._required ?? [];
  }

  /**
   * Validate a new resource.
   *
   * @param array data
   *
   * @return string{} An object of validation errors.
   */
  checkNew(values: APIObject | undefined) {
    if (!values) {
      return;
    }
    let errors: Record<string, string> = {};
    const dataKeys = Object.keys(values);

    const missing = this.getRequired().filter(i => !dataKeys.includes(i));

    if (missing.length) {
      errors._error = `Missing ${missing.join(", ")}`;
    }

    for (const key of dataKeys) {
      errors = { ...errors, ...this.checkProperty(key, values[key]) };
    }

    return Object.keys(errors).length ? errors : undefined;
  }

  async save(): Promise<Result> {
    if (!this._creatableField.length) {
      throw new Error("Can't call save on this ressource");
    }

    const errors = this.checkNew(this.data);
    if (errors) {
      return Promise.reject(errors);
    }
    const url = this._queryUrl ?? this._url;

    return request(
      url,
      "POST",
      this.data && pick(this.data, this._creatableField)
    ).then(
      (data: APIObject) =>
        new Result(data, url, this.constructor as RessourceChildClass<any>)
    );
  }

  async delete(url?: string): Promise<Result> {
    const deleteLink = url ?? this.getLink("#delete");

    if (!deleteLink) {
      throw new Error("Not allowed to delete");
    }
    return request(deleteLink, "DELETE", {}).then(
      (result: APIObject) =>
        new Result(
          result,
          this._url,
          this.constructor as RessourceChildClass<any>
        )
    );
  }

  copy(data: APIObject) {
    this.data = { ...this.data, ...data };
  }

  /**
   * Refresh the resource.
   *
   */
  async refresh(params?: ParamsType) {
    return request(this.getUri(), "GET", params).then((data: APIObject) => {
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
  operationAvailable(operationName: string): boolean {
    const links = this.data?._links;
    const operation = links?.[`#${operationName}`];
    return !!operation?.href;
  }

  /**
   * Check whether the resource has a link.
   *
   * @param rel
   *
   * @return bool
   */
  hasLink(rel: string): boolean {
    return hasLink(this.data?._links, rel);
  }

  /**
   * Check whether the resource has an embedded.
   *
   * @param rel
   *
   * @return bool
   */
  hasEmbedded(rel: string): boolean {
    return !!(
      this.data?._embedded &&
      this.data._embedded[rel] &&
      this.data._embedded[rel].length
    );
  }

  /**
   * Get a embedded for a given resource relation.
   *
   * @param string rel
   *
   * @return array
   */
  getEmbedded(rel: string) {
    if (!this.hasEmbedded(rel)) {
      throw new Error(`Embedded not found: ${rel}`);
    }

    return this.data?._embedded && this.data._embedded[rel];
  }

  /**
   * Get a link href for a given resource relation.
   * @param string rel
   * @param bool absolute
   *
   * @return string
   */
  getLink(rel: string, absolute = true): string {
    const href = getLinkHref(this.data?._links, rel, absolute, this._baseUrl);

    if (typeof href === "string") {
      return href;
    }

    return "";
  }

  /**
   * Get links for a given resource relation.
   *
   * @return Links
   */
  getLinks() {
    return this.data?._links;
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
  makeAbsoluteUrl(
    relativeUrl: string,
    _baseUrl: string | undefined = this._baseUrl
  ) {
    return makeAbsoluteUrl(`${_baseUrl}${relativeUrl}`, _baseUrl);
  }

  /**
   * Execute an operation on the resource.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  runOperation(op: string, method = "POST", body?: object) {
    if (!this.operationAvailable(op)) {
      throw new Error(`Operation not available: ${op}`);
    }
    return request(this.getLink(`#${op}`), method, body);
  }

  /**
   * Run a long-running operation.
   */
  async runLongOperation(
    op: string,
    method = "POST",
    body?: ParamsType
  ): Promise<Activity> {
    return this.runOperation(op, method, body).then((data: APIObject) => {
      const result = new Result(data, this.getUri());
      const activities = result.getActivities();
      const mainActivities = activities.filter(
        activity => !secondaryActivityTypes.includes(activity.type)
      );

      if (mainActivities.length !== 1) {
        throw new Error(
          `Expected one activity, found ${mainActivities.length}`
        );
      }

      return mainActivities[0];
    });
  }

  hasPermission(permission: string) {
    return this.data?._links && !!this.data._links[permission];
  }

  // Load a single object from the ref API
  async getRef<T>(
    linkKey: string,
    constructor: RessourceChildClass<T>,
    absolute = true
  ) {
    return getRef<T>(
      this.data?._links,
      linkKey,
      constructor,
      absolute,
      this._baseUrl
    );
  }

  // Load a list of objects from the ref API
  async getRefs<T>(
    linkKey: string,
    constructor: RessourceChildClass<T>,
    absolute = true
  ) {
    return getRefs<T>(
      this.data?._links,
      linkKey,
      constructor,
      absolute,
      this._baseUrl
    );
  }
}
