import authenticatedRequest from "../api";
import { getConfig } from "../config";

import type {
  MaybeComplexFormattedCost,
  MaybeComplexFormattedCostMeasure,
  MaybeComplexFormattedCostWithQuantity
} from "./Cost";
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

type _OrganizationEstimate<IsComplex> = {
  total: MaybeComplexFormattedCost<IsComplex>;
  sub_total: MaybeComplexFormattedCost<IsComplex>;
  vouchers: MaybeComplexFormattedCost<IsComplex>;
  options: {
    support_level: MaybeComplexFormattedCost<IsComplex>;
    user_management: MaybeComplexFormattedCost<IsComplex>;
    viewer_user: MaybeComplexFormattedCost<IsComplex>;
    admin_user: MaybeComplexFormattedCost<IsComplex>;
    standard_management_user: MaybeComplexFormattedCost<IsComplex>;
    advanced_management_user: MaybeComplexFormattedCost<IsComplex>;
  };

  user_licenses: {
    base: {
      total: MaybeComplexFormattedCost<IsComplex>;
      count: number;
      list: {
        viewer_user: {
          count: number;
          total: MaybeComplexFormattedCostMeasure<IsComplex>;
        };
        admin_user: {
          count: number;
          total: MaybeComplexFormattedCostMeasure<IsComplex>;
        };
      };
    };
    total: MaybeComplexFormattedCost<IsComplex>;
    user_management: {
      total: MaybeComplexFormattedCost<IsComplex>;
      count: number;
      list: {
        standard_management_user: {
          count: number;
          total: MaybeComplexFormattedCostMeasure<IsComplex>;
        };
        advanced_management_user: {
          count: number;
          total: MaybeComplexFormattedCostMeasure<IsComplex>;
        };
      };
    };
  };

  subscriptions: {
    total: MaybeComplexFormattedCost<IsComplex>;
    list: {
      license_id: string;
      project_title: string;
      total: MaybeComplexFormattedCost<IsComplex>;
      usage: {
        cpu: number;
        memory: number;
        storage: number;
        environments: number;
        backup_storage: number;
        build_cpu: number;
        build_memory: number;
        egress_bandwidth: number | null;
        ingress_requests: number | null;
        logs_fwd_content_size: number;
        fastly_bandwidth?: number;
        fastly_requests?: number;
      };
    }[];
  };

  support_level: MaybeComplexFormattedCostWithQuantity<IsComplex>;
  user_management: MaybeComplexFormattedCostWithQuantity<IsComplex>;
};

export type OrganizationEstimate = _OrganizationEstimate<false>;
export type OrganizationEstimateComplex = _OrganizationEstimate<true>;

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
  vendor: string;

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
    this.vendor = "";

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

  async getEstimate<Format extends string | undefined>(params?: {
    format?: Format;
    current_month?: boolean;
  }): Promise<
    Format extends "complex"
      ? OrganizationEstimateComplex
      : OrganizationEstimate
  > {
    const { api_url } = getConfig();
    const url = `${api_url}/organizations/${this.id}/estimate`;

    return authenticatedRequest(url, "GET", params);
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
