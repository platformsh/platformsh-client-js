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
    this.currency = voucher.currency;
    this.discounted_orders = voucher.discounted_orders ?? [];
    this.vouchers = voucher.vouchers ?? [];
    this.vouchers_applied = voucher.vouchers_applied;
    this.vouchers_remaining_balance = voucher.vouchers_remaining_balance;
    this.vouchers_total = voucher.vouchers_total;
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
