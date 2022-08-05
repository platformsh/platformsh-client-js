import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import Subscription from "./Subscription";
import urlParser from "../urlParser";
import CursoredRessource from "./CursoredRessource";
import Organization from "./Organization";

const url = "/organizations/:organizationId/subscriptions/:id";

export interface OrganizationSubscriptionGetParams {
  id: string;
  organizationId: string;
  [key: string]: any;
}
export interface OrganizationSubscriptionQueryParams {
  organizationId: string;
  [key: string]: any;
}

export interface CreateSubscriptionPayloadType {
  projectRegion: string;
  plan?: string;
  projectTitle?: string;
  optionsUrl?: string;
  defaultBranch?: string;
  environments?: number;
  storage?: number;
}

// @ts-ignore
// TODO: solve the get and query function inheritance ts error
export default class OrganizationSubscription extends Subscription {
  organization_id: string;

  constructor(subscription: APIObject, customUrl?: string) {
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

  static async get(
    params: OrganizationSubscriptionGetParams,
    customUrl?: string
  ) {
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

  static query(params: OrganizationSubscriptionQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.queryCursoredResult<OrganizationSubscription>(
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      OrganizationSubscription,
      {
        queryStringArrayPrefix: "[]",
      }
    );
  }

  getOrganizations() {
    return this.getRefs("ref:organizations", Organization);
  }
}
