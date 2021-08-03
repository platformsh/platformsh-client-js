import request from "../api";
import { getConfig } from "../config";
import { getRef, getRefs, hasLink, getLink } from "../refs";
import AuthUser from "./AuthUser";

class CursoredLinksManager {
  constructor(baseUrl, links, DataType) {
    this.baseUrl = baseUrl;
    this.links = links;
    this.DataType = DataType;
  }

  // Get the next or the previous page
  async getPage(direction) {
    const { api_url } = getConfig();

    const result = await request(getLink(this.links, direction, true, api_url));
    return new CursoredResult(
      this.baseUrl,
      result?.items,
      result?._links,
      this.DataType
    );
  }

  next() {
    return this.getPage("next");
  }

  previous() {
    return this.getPage("previous");
  }

  getUsers() {
    return this.getRef("ref:users:0", AuthUser);
  }

  async getRef(linkKey, constructor) {
    const { api_url } = getConfig();
    return getRef(this.links, linkKey, constructor, true, api_url);
  }

  hasMore() {
    return !!hasLink(this.links, "next");
  }
}

export default class CursoredResult {
  constructor(baseUrl, items, links, DataType) {
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
