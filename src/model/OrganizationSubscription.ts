import { authenticatedRequest } from "../authentication";
import { getConfig } from "../config";
import urlParser from "../urlParser";

import CursoredRessource from "./CursoredRessource";
import Organization from "./Organization";
import Ressource from "./Ressource";
import type { APIObject } from "./Ressource";
import Subscription from "./Subscription";

const url = "/organizations/:organizationId/subscriptions/:id";

export type OrganizationSubscriptionGetParams = {
  [key: string]: any;
  id: string;
  organizationId: string;
};
export type OrganizationSubscriptionQueryParams = {
  [key: string]: any;
  organizationId: string;
};

export type CreateSubscriptionPayloadType = {
  projectRegion: string;
  plan?: string;
  projectTitle?: string;
  optionsUrl?: string;
  defaultBranch?: string;
  environments?: number;
  storage?: number;
};

// @ts-expect-error solve the query function inheritance ts error
export default class OrganizationSubscription extends Subscription {
  organization_id: string;

  constructor(subscription: APIObject, customUrl?: string) {
    const { organizationId } = subscription;
    const { api_url } = getConfig();

    const _url = urlParser(
      customUrl ?? `${api_url}${url}`,
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

    return Ressource._get.call(
      this,
      customUrl ?? `${api_url}${url}`,
      { organizationId, id },
      {},
      queryParams
    ) as Promise<OrganizationSubscription>;
  }

  static async query(params: OrganizationSubscriptionQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.queryCursoredResult<OrganizationSubscription>(
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

  static async getCanCreate(params: OrganizationSubscriptionQueryParams) {
    const { api_url } = getConfig();

    return authenticatedRequest(
      `${api_url}/organizations/${params.organizationId}/subscriptions/can-create`,
      "GET"
    );
  }

  async getOrganizations() {
    return this.getRefs("ref:organizations", Organization);
  }
}
