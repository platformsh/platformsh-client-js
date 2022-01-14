import Ressource from "./Ressource";
import { getConfig } from "../config";
import Subscription from "./Subscription";
import CursoredResult from "./CursoredResult";
import urlParser from "../urlParser";
import CursoredRessource from "./CursoredRessource";

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

  static async get(params, customUrl) {
    const { organizationId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return await Ressource._get.call(
      this,
      customUrl || `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    );
  }

  static query(params) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.query(
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      OrganizationSubscription,
      {
        queryStringArrayPrefix: "[]"
      }
    );
  }

  getOrganizations() {
    return this.getRefs("ref:organizations", Organization);
  }
}
