import { authenticatedRequest } from "../api";
import { getConfig } from "../config";
import { urlParser } from "../urlParser";

import { CursoredRessource } from "./CursoredRessource";
import { Organization } from "./Organization";
import { Ressource } from "./Ressource";
import type { APIObject } from "./Ressource";
import { Subscription } from "./Subscription";

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

// @ts-expect-error solve the query function inheritance ts error
export class OrganizationSubscription extends Subscription {
  agency_site: boolean;
  big_dev: null;
  big_dev_service: null;
  continuous_profiling: null;
  created_at: string;
  enterprise_tag: string;
  environments: number;
  fastly_service_ids: null;
  green: boolean;
  hipaa: boolean;
  id: string;
  invoiced: boolean;
  is_trial_plan: boolean;
  locked: null;
  options_url: string;
  owner: string;
  owner_info: {
    type: string;
  };

  plan: string;
  project_id: string;
  project_notes: string;
  project_region_label: string;
  project_title: string;
  project_ui: string;
  services: unknown[];
  storage: number;
  support_tier: string;
  updated_at: string;
  user_licenses: number;
  vendor: string;

  constructor(subscription: APIObject, customUrl?: string) {
    const { organizationId } = subscription;
    const { api_url } = getConfig();

    const _url = urlParser(
      customUrl ?? `${api_url}${url}`,
      { organizationId },
      {}
    );
    super(subscription, _url);

    this._required = ["project_region", "organization_id"];
    this._creatableField.push("organizationId");

    this.agency_site = subscription.agency_site;
    this.big_dev = subscription.big_dev;
    this.big_dev_service = subscription.big_dev_service;
    this.continuous_profiling = subscription.continuous_profiling;
    this.created_at = subscription.created_at;
    this.enterprise_tag = subscription.enterprise_tag;
    this.environments = subscription.environments;
    this.fastly_service_ids = subscription.fastly_service_ids;
    this.green = subscription.green;
    this.hipaa = subscription.hipaa;
    this.id = subscription.id;
    this.invoiced = subscription.invoiced;
    this.is_trial_plan = subscription.is_trial_plan;
    this.locked = subscription.locked;
    this.options_url = subscription.options_url;
    this.owner = subscription.owner;
    this.owner_info = subscription.owner_info;
    this.plan = subscription.plan;
    this.project_id = subscription.project_id;
    this.project_notes = subscription.project_notes;
    this.project_region_label = subscription.project_region_label;
    this.project_title = subscription.project_title;
    this.project_ui = subscription.project_ui;
    this.services = subscription.services;
    this.storage = subscription.storage;
    this.support_tier = subscription.support_tier;
    this.updated_at = subscription.updated_at;
    this.user_licenses = subscription.user_licenses;
    this.vendor = subscription.vendor;
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
