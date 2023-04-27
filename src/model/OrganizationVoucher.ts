import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/vouchers";
const paramDefaults = {};
const creatableField = ["code"];

export type OrganizationVoucherGetParams = {
  [key: string]: any;
  organizationId: string;
};
export type OrganizationVoucherQueryParams = {
  [key: string]: any;
  organizationId: string;
};

export type VoucherResponse = {
  vouchers: OrganizationVoucher[];
};

export default class OrganizationVoucher extends Ressource {
  currency: string;
  discounted_orders: any[];
  vouchers: any[];
  vouchers_applied: number;
  vouchers_remaining_balance: number;
  vouchers_total: number;

  constructor(voucher: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      {},
      voucher,
      creatableField
    );
    this.currency = "";
    this.discounted_orders = [];
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
  }

  static async get(params: OrganizationVoucherGetParams, customUrl?: string) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationVoucher>(
      customUrl ?? `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }

  static async query(params: OrganizationVoucherQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<OrganizationVoucher>(
      `${api_url}${url}`,
      { organizationId },
      {},
      queryParams,
      data => (data as VoucherResponse).vouchers
    );
  }
}
