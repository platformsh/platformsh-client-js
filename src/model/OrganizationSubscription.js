import Ressource from "./Ressource";
import { getConfig } from "../config";
import Subscription from "./Subscription";
import urlParser from "../urlParser";

const url = "/organizations/:organizationId/subscriptions/:id";

export default class OrganizationSubscription extends Subscription {
  constructor(subscription, customUrl) {
    const { organizationId } = subscription;
    const { api_url } = getConfig();

    const _url = urlParser(
      customUrl || `${api_url}${url}`,
      { organizationId },
      {}
    );

    super(subscription, _url);

    this._required = ["project_region", "organizationId"];
    this._creatableField.push("organizationId");

    this.organization_id = organizationId;
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
