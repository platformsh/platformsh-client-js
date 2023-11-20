import { getConfig } from "../config";

import type CursoredResult from "./CursoredResult";
import OrganizationMember from "./OrganizationMember";
import type { CreateSubscriptionPayloadType } from "./OrganizationSubscription";
import OrganizationSubscription from "./OrganizationSubscription";
import OrganizationVoucher from "./OrganizationVoucher";
import Ressource from "./Ressource";
import type { APIObject } from "./Ressource";

const paramDefaults = {};
const _url = "/organizations";
const user_url = "/users/:userId/organizations";

const creatableField = ["name", "label", "country"];

const modifiableField = ["name", "label", "country"];

export type OrganizationGetParams = {
  [key: string]: any;
  id: string;
};

export type OrganizationQueryParams = {
  [key: string]: any;
  userId?: string;
};

export default class Organization extends Ressource {
  id: string;
  user_id: string;
  name: string;
  label: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  country: string;
  capabilities: string[];
  status?: "active" | "restricted" | "suspended" | "deleted";

  constructor(organization: APIObject, url?: string) {
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}/:id`,
      paramDefaults,
      {},
      organization,
      creatableField,
      modifiableField
    );
    this.id = "";
    this.user_id = "";
    this.name = "";
    this.label = "";
    this.country = "";
    this.owner_id = "";
    this.created_at = "";
    this.updated_at = "";
    this.capabilities = [];
    this.status = undefined;

    this._queryUrl = url ?? `${api_url}${_url}`;
  }

  static async get(params: OrganizationGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Organization>(
      customUrl ?? `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: OrganizationQueryParams = {}, customUrl?: string) {
    const { api_url } = getConfig();
    const { userId, ...queryParams } = params;

    let url = `${api_url}${_url}`;
    if (userId) {
      url = `${api_url}${user_url}`;
    }

    return super._query<Organization>(
      customUrl ?? url,
      { userId },
      paramDefaults,
      queryParams,
      data => {
        if (!Array.isArray(data)) {
          return (data as CursoredResult<Organization>)?.items;
        }

        return [];
      }
    );
  }

  async getMembers() {
    return OrganizationMember.query({ organizationId: this.id });
  }

  async addMember(member: OrganizationMember) {
    const organizationMember = new OrganizationMember({
      organizationId: this.id,
      ...member
    });

    return organizationMember.save();
  }

  async getVouchers() {
    return OrganizationVoucher.get({ organizationId: this.id });
  }

  async addVoucher(code: string) {
    const { api_url } = getConfig();
    return new OrganizationVoucher(
      {
        organizationId: this.id,
        code
      },
      `${api_url}/organizations/${this.id}/vouchers/apply`
    ).save();
  }

  getLink(rel: string, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }

    return "";
  }

  /**
   * Delete an organization,
   * we have to override super.delete()
   * since organization links are not prefixed with # as implemented in Resouce
   */
  async delete() {
    return super.delete(this.getLink("delete"));
  }

  async addSubscription(payload: CreateSubscriptionPayloadType) {
    const organizationSubscription = new OrganizationSubscription({
      ...payload,
      organizationId: this.id
    });
    return organizationSubscription.save();
  }
}
