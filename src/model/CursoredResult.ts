import request from "../api";
import { getConfig } from "../config";
import { getRef, getRefs, hasLink, getLinkHref, Links } from "../refs";
import AuthUser from "./AuthUser";
import Ressource, { APIObject, RessourceChildClass } from "./Ressource";

export enum Directions {
  previous = "Previous",
  next = "next"
}

class CursoredLinksManager<T> {
  baseUrl: string;
  links: Links;
  DataType: RessourceChildClass<T>;

  constructor(baseUrl: string, links: Links, DataType: RessourceChildClass<T>) {
    this.baseUrl = baseUrl;
    this.links = links;
    this.DataType = DataType;
  }

  // Get the next or the previous page
  async getPage(direction: Directions) {
    const { api_url } = getConfig();

    const result = await request(
      getLinkHref(this.links, direction, true, api_url)
    );
    return new CursoredResult(
      this.baseUrl,
      result?.items,
      result?._links,
      this.DataType
    );
  }

  next() {
    return this.getPage(Directions.next);
  }

  previous() {
    return this.getPage(Directions.previous);
  }

  getUser() {
    return this.getRef("ref:users:0", AuthUser);
  }

  getUsers() {
    return this.getRefs("ref:users", AuthUser);
  }

  async getRef<T>(linkKey: string, constructor: RessourceChildClass<T>) {
    const { api_url } = getConfig();
    return getRef(this.links, linkKey, constructor, true, api_url);
  }

  async getRefs<T>(linkKey: string, constructor: RessourceChildClass<T>) {
    const { api_url } = getConfig();
    return getRefs<T>(this.links, linkKey, constructor, true, api_url);
  }

  hasMore() {
    return !!hasLink(this.links, "next");
  }
}

export default class CursoredResult<T> {
  baseUrl: string;
  items: T[];
  links: Links;
  DataType: RessourceChildClass<T>;
  linksManager: CursoredLinksManager<T>;

  constructor(
    baseUrl: string,
    items: APIObject[],
    links: Links,
    DataType: RessourceChildClass<T>
  ) {
    this.baseUrl = baseUrl;
    this.items = items?.map(d => new DataType(d, `${baseUrl}/${d.id}`));
    this.links = links;
    this.DataType = DataType;

    this.linksManager = new CursoredLinksManager(this.baseUrl, links, DataType);
  }

  getLinksManager() {
    return this.linksManager;
  }

  getItems() {
    return this.items;
  }
}
