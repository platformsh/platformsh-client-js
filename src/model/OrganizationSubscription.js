import isUrl from "is-url";
import _urlParser from "../urlParser";

import Ressource from "./Ressource";
import Account from "./Account";
import Project from "./Project";
import { getConfig } from "../config";
import { authenticatedRequest } from "../api";
import Subscription from "./Subscription";

const url = "/organizations/:organizationId/subscriptions/:id";

export default class OrganizationSubscription extends Subscription {
  constructor(subscription) {
    const { api_url } = getConfig();

    super(subscription, `${api_url}${url}`);

    this._required = ["project_region", "organizationId"];
    this._creatableField.push("organizationId");
    this.organizationId = "";
  }

  static get(params, customUrl) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource.get.call(
      this,
      customUrl || `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    );
  }

  static query(params) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return Ressource.query.call(
      this,
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      data => data.items
    );
  }
}
